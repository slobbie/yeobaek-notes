import { POST_CATEGORIES, postFixtures } from "@yeobaek/content";
import { PostEditor } from "./post-editor.jsx";

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

  return <PostEditor categories={POST_CATEGORIES} initialDraft={initialDraft} />;
}
