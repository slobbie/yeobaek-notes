import { POST_CATEGORIES, postFixtures } from "@yeobaek/content";
import { PostEditor } from "./post-editor.jsx";

function getTodayInSeoul() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export default function AdminHome() {
  const examplePost = postFixtures[3];
  const initialDraft = {
    title: examplePost.title,
    slug: examplePost.slug,
    excerpt: examplePost.excerpt,
    bodyMarkdown: examplePost.bodyMarkdown,
    category: examplePost.category,
    tags: examplePost.tags.join(", "),
    seoTitle: examplePost.seo.title,
    seoDescription: examplePost.seo.description,
    sources: examplePost.sources.map((source) => ({
      ...source,
      accessedAt: source.accessedAt.slice(0, 10),
    })),
  };

  return <PostEditor
    categories={POST_CATEGORIES}
    existingSlugs={postFixtures.map(({ slug }) => slug)}
    initialDraft={initialDraft}
    originalSlug={examplePost.slug}
    today={getTodayInSeoul()}
  />;
}
