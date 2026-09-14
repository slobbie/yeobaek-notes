export const ANALYTICS_PERIODS = Object.freeze([7, 30, 90]);

export const ANALYTICS_EVENT_LABELS = Object.freeze({
  page_viewed: "페이지 조회",
  post_opened: "글 열기",
  search_used: "검색 사용",
  filter_applied: "주제 선택",
  archive_expanded: "목록 확장",
  source_opened: "출처 확인",
});

function addCount(map, key, value) {
  map.set(key, (map.get(key) ?? 0) + value);
}

function sortedEntries(map, keyName) {
  return [...map.entries()]
    .map(([key, count]) => ({ [keyName]: key, count }))
    .sort((left, right) => right.count - left.count || left[keyName].localeCompare(right[keyName], "ko"));
}

export function normalizeAnalyticsPeriod(value) {
  const days = Number(value);
  return ANALYTICS_PERIODS.includes(days) ? days : 30;
}

export function createAnalyticsDateRange(days, now = new Date()) {
  const end = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const startDate = new Date(`${end}T00:00:00+09:00`);
  startDate.setUTCDate(startDate.getUTCDate() - days + 1);
  const start = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(startDate);
  return Object.freeze({ start, end });
}

export function buildAnalyticsDashboard(rows) {
  const events = new Map(Object.keys(ANALYTICS_EVENT_LABELS).map((name) => [name, 0]));
  const daily = new Map();
  const posts = new Map();
  const filters = new Map();
  const sources = new Map();
  let positiveSearches = 0;

  for (const row of rows) {
    addCount(events, row.eventName, row.eventCount);
    addCount(daily, row.metricDate, row.eventCount);
    positiveSearches += row.positiveResultCount;

    if (row.postSlug) {
      const post = posts.get(row.postSlug) ?? { slug: row.postSlug, views: 0, opens: 0, sourceOpens: 0 };
      if (row.eventName === "page_viewed") post.views += row.eventCount;
      if (row.eventName === "post_opened") post.opens += row.eventCount;
      if (row.eventName === "source_opened") post.sourceOpens += row.eventCount;
      posts.set(row.postSlug, post);
    }
    if (row.eventName === "filter_applied" && row.dimensionValue) {
      addCount(filters, row.dimensionValue, row.eventCount);
    }
    if (row.eventName === "source_opened" && row.dimensionValue) {
      addCount(sources, row.dimensionValue, row.eventCount);
    }
  }

  const eventCounts = Object.entries(ANALYTICS_EVENT_LABELS).map(([name, label]) => ({
    name,
    label,
    count: events.get(name) ?? 0,
  }));
  const searchCount = events.get("search_used") ?? 0;

  return Object.freeze({
    totalEvents: eventCounts.reduce((total, event) => total + event.count, 0),
    pageViews: events.get("page_viewed") ?? 0,
    sourceOpens: events.get("source_opened") ?? 0,
    searchSuccessRate: searchCount ? Math.round((positiveSearches / searchCount) * 100) : null,
    events: Object.freeze(eventCounts),
    daily: Object.freeze(sortedEntries(daily, "date").sort((left, right) => left.date.localeCompare(right.date))),
    posts: Object.freeze([...posts.values()].sort((left, right) => right.views - left.views || right.opens - left.opens)),
    filters: Object.freeze(sortedEntries(filters, "value")),
    sources: Object.freeze(sortedEntries(sources, "host")),
  });
}
