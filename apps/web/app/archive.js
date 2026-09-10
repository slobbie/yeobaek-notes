function normalizeSearch(value) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

export const ARCHIVE_PAGE_SIZE = 3;

function normalizePage(value) {
  const page = /^\d+$/.test(value ?? "") ? Number(value) : 1;
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function parseArchiveState(search, categories) {
  const params = new URLSearchParams(search);
  const requestedCategory = params.get("topic");

  return Object.freeze({
    category: categories.includes(requestedCategory) ? requestedCategory : "전체",
    query: (params.get("q") ?? "").trim().slice(0, 100),
    page: normalizePage(params.get("page")),
  });
}

export function createArchiveHref({ category = "전체", query = "", page = 1 } = {}) {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();

  if (category !== "전체") params.set("topic", category);
  if (normalizedQuery) params.set("q", normalizedQuery);
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export function paginatePosts(posts, page, pageSize = ARCHIVE_PAGE_SIZE) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : ARCHIVE_PAGE_SIZE;
  const end = safePage * safePageSize;

  return Object.freeze({
    items: Object.freeze(posts.slice(0, end)),
    hasMore: end < posts.length,
  });
}

export function filterPosts(posts, { category = "전체", query = "" } = {}) {
  const keyword = normalizeSearch(query);

  return posts.filter((post) => {
    const matchesCategory = category === "전체" || post.category === category;
    const searchableText = normalizeSearch(`${post.title} ${post.excerpt} ${post.tags.join(" ")}`);
    return matchesCategory && (!keyword || searchableText.includes(keyword));
  });
}

export function getArchivePeriod(posts) {
  if (posts.length === 0) return null;

  const latest = posts.reduce((current, post) => (
    new Date(post.publishedAt) > new Date(current.publishedAt) ? post : current
  ));
  const date = new Date(latest.publishedAt);
  const timeZone = "Asia/Seoul";

  return Object.freeze({
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone }).format(date).toUpperCase(),
    year: new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone }).format(date),
    label: new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", timeZone }).format(date),
  });
}
