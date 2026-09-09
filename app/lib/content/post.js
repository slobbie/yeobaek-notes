export const POST_CATEGORIES = Object.freeze(["경제", "기술", "생활", "관찰", "리뷰"]);
export const POST_FORMATS = Object.freeze(["긴 글", "짧은 기록", "사용기", "링크 노트"]);
export const POST_STATUSES = Object.freeze(["draft", "published"]);

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

  if (!Number.isInteger(input.readingTimeMinutes) || input.readingTimeMinutes < 1) {
    throw new TypeError("readingTimeMinutes는 1 이상의 정수여야 합니다.");
  }

  const tags = Array.isArray(input.tags) ? [...new Set(input.tags.map((tag) => requireText(tag, "tag")))] : null;
  if (!tags) throw new TypeError("tags는 문자열 배열이어야 합니다.");
  const sources = Array.isArray(input.sources) ? input.sources.map(defineSource) : null;
  if (!sources) throw new TypeError("sources는 출처 배열이어야 합니다.");

  return Object.freeze({
    slug,
    status: requireEnum(input.status, POST_STATUSES, "status"),
    title: requireText(input.title, "title"),
    excerpt: requireText(input.excerpt, "excerpt"),
    category: requireEnum(input.category, POST_CATEGORIES, "category"),
    format: requireEnum(input.format, POST_FORMATS, "format"),
    publishedAt,
    updatedAt,
    readingTimeMinutes: input.readingTimeMinutes,
    tags: Object.freeze(tags),
    sources: Object.freeze(sources),
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

export function formatReadingTime(minutes) {
  return `${minutes}분 읽기`;
}
