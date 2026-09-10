import { postFixtures } from "@yeobaek/content";
import { createRssFeed } from "../seo.js";

export const dynamic = "force-static";

export function GET() {
  return new Response(createRssFeed(postFixtures), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
