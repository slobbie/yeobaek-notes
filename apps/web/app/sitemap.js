import { postFixtures } from "@yeobaek/content";
import { createSitemapEntries } from "./seo.js";

export default function sitemap() {
  return createSitemapEntries(postFixtures);
}
