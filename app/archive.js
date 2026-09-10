function normalizeSearch(value) {
  return value.trim().toLocaleLowerCase("ko-KR");
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
