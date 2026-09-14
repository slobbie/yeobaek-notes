import { POST_CATEGORIES, POST_STATUSES } from "@yeobaek/content";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function splitTags(value) {
  return [...new Set(value.split(",").map(clean).filter(Boolean))];
}

function requireText(value, label) {
  const cleaned = clean(value);
  if (!cleaned) throw new TypeError(`${label}을 입력해 주세요.`);
  return cleaned;
}

function normalizeSources(sources) {
  if (!Array.isArray(sources)) throw new TypeError("출처 형식이 올바르지 않습니다.");

  return sources
    .filter((source) => [source?.title, source?.publisher, source?.url, source?.accessedAt].some(clean))
    .map((source) => ({
      title: requireText(source?.title, "자료 제목"),
      publisher: requireText(source?.publisher, "발행처"),
      url: requireText(source?.url, "출처 웹 주소"),
      accessedAt: requireText(source?.accessedAt, "출처 확인 날짜"),
    }));
}

export function normalizeAdminPostDraft(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("저장할 글 형식이 올바르지 않습니다.");
  }

  const slug = requireText(input.slug, "글 주소");
  if (!SLUG_PATTERN.test(slug)) {
    throw new TypeError("글 주소는 영문 소문자와 숫자를 하이픈으로 연결해 주세요.");
  }

  const category = requireText(input.category, "분야");
  if (!POST_CATEGORIES.includes(category)) throw new TypeError("분야 값이 올바르지 않습니다.");

  const status = input.status ?? "draft";
  if (!POST_STATUSES.includes(status)) throw new TypeError("발행 상태가 올바르지 않습니다.");

  const tags = Array.isArray(input.tags)
    ? [...new Set(input.tags.map(clean).filter(Boolean))]
    : splitTags(clean(input.tags));

  return {
    status,
    slug,
    title: requireText(input.title, "제목"),
    excerpt: requireText(input.excerpt, "요약"),
    category,
    tags,
    bodyMarkdown: requireText(input.bodyMarkdown, "본문"),
    seoTitle: requireText(input.seoTitle, "검색 제목"),
    seoDescription: requireText(input.seoDescription, "검색 설명"),
    sources: normalizeSources(input.sources ?? []),
  };
}

export function mapAdminPostRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new TypeError("관리자 글 데이터는 객체여야 합니다.");
  }

  return Object.freeze({
    id: requireText(row.id, "글 ID"),
    ...normalizeAdminPostDraft({
      status: row.status,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      category: row.category,
      tags: row.tags,
      bodyMarkdown: row.body_markdown,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      sources: Array.isArray(row.sources)
        ? row.sources
          .toSorted((left, right) => left.position - right.position)
          .map((source) => ({
            title: source.title,
            publisher: source.publisher,
            url: source.url,
            accessedAt: source.accessed_at,
          }))
        : [],
    }),
    publishedAt: row.published_at ?? null,
    createdAt: requireText(row.created_at, "생성일"),
    updatedAt: requireText(row.updated_at, "수정일"),
  });
}

export function toEditorDraft(post) {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    bodyMarkdown: post?.bodyMarkdown ?? "",
    category: post?.category ?? POST_CATEGORIES[0],
    tags: Array.isArray(post?.tags) ? post.tags.join(", ") : "",
    seoTitle: post?.seoTitle ?? "",
    seoDescription: post?.seoDescription ?? "",
    sources: Array.isArray(post?.sources) ? post.sources.map((source) => ({ ...source })) : [],
  };
}
