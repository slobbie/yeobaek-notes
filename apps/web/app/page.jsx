import { HomeArchive } from "./components/home-archive.jsx";
import { listPublishedPosts } from "./lib/public-posts.js";
import { createWebsiteJsonLd, serializeJsonLd } from "./seo.js";

export default async function Home() {
  const posts = await listPublishedPosts();

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(createWebsiteJsonLd()) }} />
    <HomeArchive posts={posts} />
  </>;
}
