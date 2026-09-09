import assert from "node:assert/strict";
import test from "node:test";
import { definePost } from "../app/lib/content/post.js";
import { postFixtures } from "../app/lib/content/posts.js";
import {
  absoluteUrl,
  createBlogPostingJsonLd,
  createPageMetadata,
  createRobotsConfig,
  createRssFeed,
  createSitemapEntries,
  createWebsiteJsonLd,
  normalizeSiteUrl,
  serializeJsonLd,
  siteConfig,
} from "../app/seo.js";

const publishedPost = postFixtures[0];
const draftPost = definePost({ ...publishedPost, slug: "private-draft", status: "draft" });

test("공개 주소를 정규화하고 안전한 프로토콜만 허용한다", () => {
  assert.equal(normalizeSiteUrl("https://example.com/"), "https://example.com");
  assert.throws(() => normalizeSiteUrl("file:///private/site"), /HTTP/);
  assert.throws(() => normalizeSiteUrl("https://example.com/?preview=1"), /검색어나 해시/);
});

test("페이지 메타데이터의 canonical과 공유 정보가 일치한다", () => {
  const metadata = createPageMetadata({
    title: publishedPost.seo.title,
    description: publishedPost.seo.description,
    path: `/posts/${publishedPost.slug}`,
    type: "article",
    publishedAt: publishedPost.publishedAt,
    updatedAt: publishedPost.updatedAt,
    category: publishedPost.category,
    tags: publishedPost.tags,
  });

  assert.equal(metadata.alternates.canonical, `/posts/${publishedPost.slug}`);
  assert.equal(metadata.openGraph.url, `/posts/${publishedPost.slug}`);
  assert.equal(metadata.openGraph.title, publishedPost.seo.title);
  assert.equal(metadata.openGraph.description, publishedPost.seo.description);
  assert.equal(metadata.openGraph.publishedTime, publishedPost.publishedAt);
  assert.equal(metadata.twitter.card, "summary");
  assert.equal(metadata.openGraph.images, undefined);
});

test("홈과 글 구조화 데이터는 공개 콘텐츠와 같은 정보를 사용한다", () => {
  const website = createWebsiteJsonLd();
  const article = createBlogPostingJsonLd(publishedPost);

  assert.equal(website.name, siteConfig.name);
  assert.equal(website.url, absoluteUrl("/"));
  assert.equal(article.headline, publishedPost.title);
  assert.equal(article.description, publishedPost.excerpt);
  assert.equal(article.datePublished, publishedPost.publishedAt);
  assert.equal(article.dateModified, publishedPost.updatedAt);
  assert.equal(article.url, absoluteUrl(`/posts/${publishedPost.slug}`));
  assert.equal(article.image, undefined);
});

test("JSON-LD 직렬화 시 HTML 시작 문자를 이스케이프한다", () => {
  assert.equal(serializeJsonLd({ text: "</script>" }), "{\"text\":\"\\u003c/script>\"}");
});

test("sitemap과 RSS에는 공개 글만 포함한다", () => {
  const sitemap = createSitemapEntries([publishedPost, draftPost]);
  const rss = createRssFeed([publishedPost, draftPost]);

  assert.ok(sitemap.some(({ url }) => url === absoluteUrl(`/posts/${publishedPost.slug}`)));
  assert.ok(!sitemap.some(({ url }) => url.includes("private-draft")));
  assert.match(rss, new RegExp(absoluteUrl(`/posts/${publishedPost.slug}`)));
  assert.doesNotMatch(rss, /private-draft/);
});

test("robots는 전체 공개 경로와 sitemap 위치를 안내한다", () => {
  const robots = createRobotsConfig();
  assert.deepEqual(robots.rules, { userAgent: "*", allow: "/" });
  assert.equal(robots.sitemap, absoluteUrl("/sitemap.xml"));
  assert.equal(robots.host, siteConfig.url);
});
