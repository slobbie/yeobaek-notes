import "server-only";

import { cache } from "react";
import { mapPublishedPostRow } from "@yeobaek/content";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";

const POST_SELECT = [
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
  "updated_at",
  "sources:post_sources(position,title,publisher,url,accessed_at)",
].join(",");

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`공개 콘텐츠 저장소 환경 변수 ${name}이 설정되지 않았습니다.`);
  return value;
}

function createPostsUrl(slug) {
  const url = new URL("/rest/v1/posts", requireEnvironment("SUPABASE_URL"));
  url.searchParams.set("select", POST_SELECT);
  url.searchParams.set("status", "eq.published");
  url.searchParams.set("order", "published_at.desc");
  if (slug) {
    url.searchParams.set("slug", `eq.${slug}`);
    url.searchParams.set("limit", "1");
  }
  return url;
}

async function requestPublishedPosts(slug) {
  const response = await fetch(createPostsUrl(slug), {
    headers: { apikey: requireEnvironment("SUPABASE_PUBLISHABLE_KEY") },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("[public-posts] 조회 실패", { status: response.status });
    throw new Error("공개 글을 불러오지 못했습니다.");
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) throw new TypeError("공개 글 조회 결과는 배열이어야 합니다.");
  return rows.map(mapPublishedPostRow);
}

const loadPublishedPosts = unstable_cache(
  async () => {
    return Object.freeze(await requestPublishedPosts());
  },
  ["public-posts"],
  { revalidate: 300, tags: ["public-posts"] },
);

const loadPublishedPostBySlug = unstable_cache(
  async (slug) => {
    const posts = await requestPublishedPosts(slug);
    return posts[0] ?? null;
  },
  ["public-post-by-slug"],
  { revalidate: 300, tags: ["public-posts"] },
);

export const listPublishedPosts = cache(async () => {
  await connection();
  return loadPublishedPosts();
});

export const getPublishedPostBySlug = cache(async (slug) => {
  await connection();
  return loadPublishedPostBySlug(slug);
});
