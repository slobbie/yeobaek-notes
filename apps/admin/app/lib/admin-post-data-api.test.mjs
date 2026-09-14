import assert from "node:assert/strict";
import test from "node:test";
import {
  AdminPostRepositoryError,
  createAdminPostDataApi,
} from "./admin-post-data-api.js";

const row = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "saved-post",
  status: "draft",
  title: "저장한 글",
  excerpt: "저장한 글의 요약",
  category: "기술",
  tags: ["Node.js", "DB"],
  body_markdown: "## 본문",
  seo_title: "저장한 글",
  seo_description: "저장한 글의 검색 설명",
  published_at: null,
  created_at: "2026-09-14T01:00:00Z",
  updated_at: "2026-09-14T01:00:00Z",
  sources: [
    { position: 1, title: "공식 문서", publisher: "Example", url: "https://example.com", accessed_at: "2026-09-14" },
  ],
};

test("관리자 조회는 service role 헤더로 초안과 발행 글을 모두 읽는다", async () => {
  const calls = [];
  const repository = createAdminPostDataApi({
    baseUrl: "http://127.0.0.1:54321",
    serviceRoleKey: "server-secret",
    fetchImpl: async (url, options) => {
      calls.push({ url: url.toString(), options });
      return new Response(JSON.stringify([row]), { status: 200 });
    },
  });

  const posts = await repository.listPosts();

  assert.equal(posts[0].status, "draft");
  assert.match(calls[0].url, /order=updated_at\.desc/);
  assert.equal(calls[0].options.headers.apikey, "server-secret");
  assert.equal(calls[0].options.headers.authorization, "Bearer server-secret");
});

test("저장은 RPC에 날짜 없이 정규화한 글과 출처를 전달한다", async () => {
  const calls = [];
  const repository = createAdminPostDataApi({
    baseUrl: "http://127.0.0.1:54321",
    serviceRoleKey: "server-secret",
    fetchImpl: async (url, options) => {
      calls.push({ url: url.toString(), options });
      if (url.pathname.endsWith("/rpc/save_admin_post")) {
        return new Response(JSON.stringify(row.id), { status: 200 });
      }
      return new Response(JSON.stringify([row]), { status: 200 });
    },
  });

  const saved = await repository.savePost({
    draft: {
      title: " 저장한 글 ",
      slug: "saved-post",
      excerpt: "저장한 글의 요약",
      category: "기술",
      tags: "Node.js, DB, Node.js",
      bodyMarkdown: "## 본문",
      seoTitle: "저장한 글",
      seoDescription: "저장한 글의 검색 설명",
      sources: [{ title: "공식 문서", publisher: "Example", url: "https://example.com", accessedAt: "2026-09-14" }],
    },
    status: "draft",
  });

  const payload = JSON.parse(calls[0].options.body);
  assert.equal(saved.id, row.id);
  assert.deepEqual(payload.post_data.tags, ["Node.js", "DB"]);
  assert.equal("published_at" in payload.post_data, false);
  assert.equal("updated_at" in payload.post_data, false);
});

test("중복 주소 오류를 한국어 저장 오류로 변환한다", async () => {
  const repository = createAdminPostDataApi({
    baseUrl: "http://127.0.0.1:54321",
    serviceRoleKey: "server-secret",
    fetchImpl: async () => new Response(JSON.stringify({ code: "23505" }), { status: 409 }),
  });

  await assert.rejects(
    repository.savePost({
      draft: {
        title: "저장한 글",
        slug: "saved-post",
        excerpt: "저장한 글의 요약",
        category: "기술",
        tags: "",
        bodyMarkdown: "본문",
        seoTitle: "저장한 글",
        seoDescription: "저장한 글의 검색 설명",
        sources: [],
      },
      status: "draft",
    }),
    (error) => error instanceof AdminPostRepositoryError
      && error.code === "DUPLICATE_SLUG"
      && /글 주소/.test(error.message),
  );
});

test("환경 변수와 연결 실패를 구분해 설명한다", async () => {
  assert.throws(
    () => createAdminPostDataApi({ baseUrl: "", serviceRoleKey: "" }),
    (error) => error instanceof AdminPostRepositoryError && error.code === "MISSING_ENVIRONMENT",
  );

  const repository = createAdminPostDataApi({
    baseUrl: "http://127.0.0.1:54321",
    serviceRoleKey: "server-secret",
    fetchImpl: async () => { throw new Error("offline"); },
  });
  await assert.rejects(repository.listPosts(), /연결하지 못했습니다/);
});
