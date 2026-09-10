import Link from "next/link";
import { notFound } from "next/navigation";
import { findPublishedPostBySlug, formatPostDate, getPublishedPosts, postFixtures } from "@yeobaek/content";
import { SiteFooter, SiteHeader } from "@yeobaek/ui";
import { TrackedSourceLink } from "../../components/tracked-source-link.jsx";
import { createBlogPostingJsonLd, createPageMetadata, serializeJsonLd } from "../../seo.js";

const posts = getPublishedPosts(postFixtures);

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = findPublishedPostBySlug(posts, slug);
  if (!post) return { title: "글을 찾을 수 없습니다", robots: { index: false, follow: false } };

  return createPageMetadata({
    title: post.seo.title,
    description: post.seo.description,
    path: `/posts/${post.slug}`,
    type: "article",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    category: post.category,
    tags: post.tags,
  });
}

function PostBody({ blocks }) {
  return <div className="article-body">
    {blocks.map((block, index) => {
      if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
      if (block.type === "quote") return <blockquote key={index}>{block.text}</blockquote>;
      if (block.type === "list") return <ul key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
      return <p key={index}>{block.text}</p>;
    })}
  </div>;
}

function Sources({ sources, postSlug }) {
  return <section className="article-sources" aria-labelledby="sources-title">
    <h2 id="sources-title">참고한 자료</h2>
    {sources.length > 0
      ? <ol>{sources.map((source) => <li key={source.url}><TrackedSourceLink href={source.url} postSlug={postSlug}>{source.title}</TrackedSourceLink><span>{source.publisher} · {formatPostDate(source.accessedAt)} 확인</span></li>)}</ol>
      : <p>외부 자료를 인용하지 않은 개인적인 관찰과 사용 기록입니다.</p>}
  </section>;
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = findPublishedPostBySlug(posts, slug);
  if (!post) notFound();
  const jsonLd = createBlogPostingJsonLd(post);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    <a className="skip-link" href="#article">본문으로 건너뛰기</a>
    <main className="site-shell">
      <SiteHeader />
      <article className="article-detail" id="article">
        <Link className="back-link" href="/#archive">← 글 모아보기</Link>
        <header className="article-header">
          <div className="post-meta"><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>{post.updatedAt !== post.publishedAt && <span>{formatPostDate(post.updatedAt)} 수정</span>}<span>{post.category}</span></div>
          <h1>{post.title}</h1>
          <p className="article-lead">{post.excerpt}</p>
          <p className="article-tags">{post.tags.map((tag) => `#${tag}`).join(" · ")}</p>
        </header>
        <PostBody blocks={post.body} />
        <Sources sources={post.sources} postSlug={post.slug} />
      </article>
      <SiteFooter />
    </main>
  </>;
}
