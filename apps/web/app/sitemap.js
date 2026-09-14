import { listPublishedPosts } from "./lib/public-posts.js";
import { createSitemapEntries } from "./seo.js";

export default async function sitemap() {
  return createSitemapEntries(await listPublishedPosts());
}
