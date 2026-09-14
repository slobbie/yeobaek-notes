import { listPublishedPosts } from "../lib/public-posts.js";
import { createRssFeed } from "../seo.js";

export async function GET() {
  return new Response(createRssFeed(await listPublishedPosts()), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
