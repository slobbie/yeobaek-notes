import { postFixtures } from "./lib/content/posts.js";
import { createSitemapEntries } from "./seo.js";

export default function sitemap() {
  return createSitemapEntries(postFixtures);
}
