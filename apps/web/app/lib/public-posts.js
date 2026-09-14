import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { mapPublishedPostRow } from "@yeobaek/content";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";

const POST_SELECT = `
  slug,
  status,
  title,
  excerpt,
  category,
  tags,
  body_markdown,
  seo_title,
  seo_description,
  published_at,
  updated_at,
  sources:post_sources (
    position,
    title,
    publisher,
    url,
    accessed_at
  )
`;

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`공개 콘텐츠 저장소 환경 변수 ${name}이 설정되지 않았습니다.`);
  return value;
}

function createPublicClient() {
  return createClient(
    requireEnvironment("SUPABASE_URL"),
    requireEnvironment("SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}

function failQuery(operation, error) {
  console.error(`[public-posts] ${operation}`, error);
  throw new Error("공개 글을 불러오지 못했습니다.", { cause: error });
}

const loadPublishedPosts = unstable_cache(
  async () => {
    const { data, error } = await createPublicClient()
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) failQuery("목록 조회 실패", error);
    return Object.freeze(data.map(mapPublishedPostRow));
  },
  ["public-posts"],
  { revalidate: 300, tags: ["public-posts"] },
);

const loadPublishedPostBySlug = unstable_cache(
  async (slug) => {
    const { data, error } = await createPublicClient()
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error) failQuery("상세 조회 실패", error);
    return data ? mapPublishedPostRow(data) : null;
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
