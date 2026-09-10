import { getPublishedPosts } from "@yeobaek/content";

const LOCAL_SITE_URL = "http://localhost:3000";

export function normalizeSiteUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new TypeError("공개 사이트 주소는 HTTP 또는 HTTPS 주소여야 합니다.");
  }
  if (url.search || url.hash) {
    throw new TypeError("공개 사이트 주소에는 검색어나 해시를 포함할 수 없습니다.");
  }
  return url.toString().replace(/\/$/, "");
}

export const siteConfig = Object.freeze({
  name: "여백의 노트",
  description: "경제, 기술, 생활과 그 사이에서 발견한 것을 기록합니다.",
  locale: "ko_KR",
  language: "ko-KR",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || LOCAL_SITE_URL),
  updatedAt: "2026-09-09T00:00:00+09:00",
});

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}

export function createPageMetadata({ title, description, path, type = "website", publishedAt, updatedAt, category, tags = [] }) {
  const openGraph = {
    type,
    locale: siteConfig.locale,
    url: path,
    siteName: siteConfig.name,
    title,
    description,
  };

  if (type === "article") {
    openGraph.publishedTime = publishedAt;
    openGraph.modifiedTime = updatedAt;
    openGraph.section = category;
    openGraph.tags = tags;
  }

  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": "/rss.xml" },
    },
    openGraph,
    twitter: {
      card: "summary",
      title,
      description,
    },
    ...(category ? { category } : {}),
  };
}

function organization() {
  return {
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: organization(),
  };
}

export function createBlogPostingJsonLd(post) {
  const url = absoluteUrl(`/posts/${post.slug}`);
  const citations = post.sources.map((source) => ({
    "@type": "CreativeWork",
    name: source.title,
    url: source.url,
    publisher: { "@type": "Organization", name: source.publisher },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@type": "WebSite", "@id": `${absoluteUrl("/")}#website` },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    articleSection: post.category,
    keywords: post.tags,
    inLanguage: siteConfig.language,
    author: organization(),
    publisher: organization(),
    ...(citations.length > 0 ? { citation: citations } : {}),
  };
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createSitemapEntries(posts) {
  const publishedPosts = getPublishedPosts(posts);
  const latestPostUpdate = publishedPosts.reduce(
    (latest, post) => new Date(post.updatedAt) > new Date(latest) ? post.updatedAt : latest,
    siteConfig.updatedAt,
  );

  return [
    { url: absoluteUrl("/"), lastModified: latestPostUpdate },
    { url: absoluteUrl("/about"), lastModified: siteConfig.updatedAt },
    ...publishedPosts.map((post) => ({
      url: absoluteUrl(`/posts/${post.slug}`),
      lastModified: post.updatedAt,
    })),
  ];
}

export function createRobotsConfig() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function createRssFeed(posts) {
  const publishedPosts = getPublishedPosts(posts);
  const lastBuildDate = new Date(publishedPosts[0]?.updatedAt || siteConfig.updatedAt).toUTCString();
  const items = publishedPosts.map((post) => {
    const url = absoluteUrl(`/posts/${post.slug}`);
    return `<item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.excerpt)}</description>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`;
  }).join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
    <language>${siteConfig.language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}
