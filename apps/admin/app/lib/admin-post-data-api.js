import { mapAdminPostRow, normalizeAdminPostDraft } from "./admin-post-model.js";

const POST_SELECT = [
  "id",
  "slug",
  "status",
  "title",
  "excerpt",
  "category",
  "tags",
  "body_markdown",
  "seo_title",
  "seo_description",
  "published_at",
  "created_at",
  "updated_at",
  "sources:post_sources(position,title,publisher,url,accessed_at)",
].join(",");

export class AdminPostRepositoryError extends Error {
  constructor(message, code = "UNKNOWN", options) {
    super(message, options);
    this.name = "AdminPostRepositoryError";
    this.code = code;
  }
}

function createUrl(baseUrl, path) {
  return new URL(path, baseUrl);
}

async function readError(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function mapRequestError(error) {
  if (error instanceof AdminPostRepositoryError) return error;
  return new AdminPostRepositoryError(
    "Supabase에 연결하지 못했습니다. 관리자 환경 변수와 로컬 실행 상태를 확인해 주세요.",
    "CONNECTION_FAILED",
    { cause: error },
  );
}

export function createAdminPostDataApi({ baseUrl, serviceRoleKey, fetchImpl = fetch }) {
  if (!baseUrl || !serviceRoleKey) {
    throw new AdminPostRepositoryError(
      "관리자 Supabase 환경 변수가 설정되지 않았습니다.",
      "MISSING_ENVIRONMENT",
    );
  }

  const headers = {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
  };

  async function request(url, options = {}) {
    let response;
    try {
      response = await fetchImpl(url, { ...options, headers: { ...headers, ...options.headers } });
    } catch (error) {
      throw mapRequestError(error);
    }

    if (!response.ok) {
      const details = await readError(response);
      if (details.code === "23505") {
        throw new AdminPostRepositoryError(
          "이미 사용 중인 글 주소입니다. 다른 주소를 입력해 주세요.",
          "DUPLICATE_SLUG",
        );
      }
      if (details.code === "P0002") {
        throw new AdminPostRepositoryError("수정할 글을 찾지 못했습니다.", "POST_NOT_FOUND");
      }
      throw new AdminPostRepositoryError(
        "글을 저장하지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요.",
        "REQUEST_FAILED",
      );
    }

    return response;
  }

  async function listPosts() {
    const url = createUrl(baseUrl, "/rest/v1/posts");
    url.searchParams.set("select", POST_SELECT);
    url.searchParams.set("order", "updated_at.desc");
    const response = await request(url, { method: "GET", cache: "no-store" });
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new TypeError("관리자 글 목록은 배열이어야 합니다.");
    return rows.map(mapAdminPostRow);
  }

  async function getPost(postId) {
    const url = createUrl(baseUrl, "/rest/v1/posts");
    url.searchParams.set("select", POST_SELECT);
    url.searchParams.set("id", `eq.${postId}`);
    url.searchParams.set("limit", "1");
    const response = await request(url, { method: "GET", cache: "no-store" });
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new TypeError("관리자 글 조회 결과는 배열이어야 합니다.");
    return rows[0] ? mapAdminPostRow(rows[0]) : null;
  }

  async function savePost({ postId = null, draft, status }) {
    const normalized = normalizeAdminPostDraft({ ...draft, status });
    const url = createUrl(baseUrl, "/rest/v1/rpc/save_admin_post");
    const response = await request(url, {
      method: "POST",
      body: JSON.stringify({
        post_id: postId,
        post_data: {
          status: normalized.status,
          slug: normalized.slug,
          title: normalized.title,
          excerpt: normalized.excerpt,
          category: normalized.category,
          tags: normalized.tags,
          body_markdown: normalized.bodyMarkdown,
          seo_title: normalized.seoTitle,
          seo_description: normalized.seoDescription,
        },
        sources_data: normalized.sources.map((source) => ({
          title: source.title,
          publisher: source.publisher,
          url: source.url,
          accessed_at: source.accessedAt,
        })),
      }),
    });
    const savedId = await response.json();
    const savedPost = await getPost(savedId);
    if (!savedPost) throw new AdminPostRepositoryError("저장한 글을 다시 불러오지 못했습니다.");
    return savedPost;
  }

  return Object.freeze({ listPosts, getPost, savePost });
}
