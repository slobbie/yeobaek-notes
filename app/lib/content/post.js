export const POST_CATEGORIES = Object.freeze(["경제", "기술", "생활", "관찰", "리뷰"]);
export const POST_STATUSES = Object.freeze(["draft", "published"]);
export const POST_BLOCK_TYPES = Object.freeze(["heading", "paragraph", "quote", "list"]);

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field}은 비어 있지 않은 문자열이어야 합니다.`);
  }
  return value.trim();
}

function requireEnum(value, values, field) {
  if (!values.includes(value)) {
    throw new TypeError(`${field} 값이 허용된 범위에 없습니다.`);
  }
  return value;
}

function requireIsoDate(value, field) {
  const date = new Date(requireText(value, field));
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${field}은 유효한 ISO 날짜여야 합니다.`);
  }
  return date.toISOString();
}

function defineSource(source) {
  const url = new URL(requireText(source?.url, "source.url"));
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new TypeError("source.url은 HTTP 또는 HTTPS 주소여야 합니다.");
  }

  return Object.freeze({
    title: requireText(source.title, "source.title"),
    publisher: requireText(source.publisher, "source.publisher"),
    url: url.toString(),
    accessedAt: requireIsoDate(source.accessedAt, "source.accessedAt"),
  });
}

function defineBlock(block) {
  const type = requireEnum(block?.type, POST_BLOCK_TYPES, "body.type");
  if (type === "list") {
    if (!Array.isArray(block.items) || block.items.length === 0) {
      throw new TypeError("목록 본문에는 하나 이상의 항목이 필요합니다.");
    }
    return Object.freeze({ type, items: Object.freeze(block.items.map((item) => requireText(item, "body.items"))) });
  }
  return Object.freeze({ type, text: requireText(block.text, "body.text") });
}

export function definePost(input) {
  const slug = requireText(input?.slug, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new TypeError("slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.");
  }

  const publishedAt = requireIsoDate(input.publishedAt, "publishedAt");
  const updatedAt = requireIsoDate(input.updatedAt, "updatedAt");
  if (new Date(updatedAt) < new Date(publishedAt)) {
    throw new TypeError("updatedAt은 publishedAt보다 빠를 수 없습니다.");
  }

  const tags = Array.isArray(input.tags) ? [...new Set(input.tags.map((tag) => requireText(tag, "tag")))] : null;
  if (!tags) throw new TypeError("tags는 문자열 배열이어야 합니다.");
  const sources = Array.isArray(input.sources) ? input.sources.map(defineSource) : null;
  if (!sources) throw new TypeError("sources는 출처 배열이어야 합니다.");
  const body = Array.isArray(input.body) && input.body.length > 0 ? input.body.map(defineBlock) : null;
  if (!body) throw new TypeError("body에는 하나 이상의 본문 블록이 필요합니다.");

  return Object.freeze({
    slug,
    status: requireEnum(input.status, POST_STATUSES, "status"),
    title: requireText(input.title, "title"),
    excerpt: requireText(input.excerpt, "excerpt"),
    category: requireEnum(input.category, POST_CATEGORIES, "category"),
    publishedAt,
    updatedAt,
    tags: Object.freeze(tags),
    sources: Object.freeze(sources),
    body: Object.freeze(body),
    seo: Object.freeze({
      title: requireText(input.seo?.title, "seo.title"),
      description: requireText(input.seo?.description, "seo.description"),
    }),
  });
}

export function getPublishedPosts(posts) {
  return posts
    .filter((post) => post.status === "published")
    .toSorted((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
}

export function findPublishedPostBySlug(posts, slug) {
  return posts.find((post) => post.status === "published" && post.slug === slug) ?? null;
}

export function formatPostDate(value) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  const { year, month, day } = values;
  return `${year}. ${month}. ${day}`;
}
