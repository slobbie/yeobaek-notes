import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../components/site-footer.jsx";
import { SiteHeader } from "../../components/site-header.jsx";
import { findPublishedPostBySlug, formatPostDate, formatReadingTime, getPublishedPosts } from "../../lib/content/post.js";
import { postFixtures } from "../../lib/content/posts.js";

const posts = getPublishedPosts(postFixtures);

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
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

function Sources({ sources }) {
  return <section className="article-sources" aria-labelledby="sources-title">
    <h2 id="sources-title">참고한 자료</h2>
    {sources.length > 0
      ? <ol>{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span className="sr-only">(새 창)</span></a><span>{source.publisher} · {formatPostDate(source.accessedAt)} 확인</span></li>)}</ol>
      : <p>외부 자료를 인용하지 않은 개인적인 관찰과 사용 기록입니다.</p>}
  </section>;
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = findPublishedPostBySlug(posts, slug);
  if (!post) notFound();

  return <>
    <a className="skip-link" href="#article">본문으로 건너뛰기</a>
    <main className="site-shell">
      <SiteHeader />
      <article className="article-detail" id="article">
        <Link className="back-link" href="/#archive">← 글 모아보기</Link>
        <header className="article-header">
          <div className="post-meta"><time dateTime={post.publishedAt}>발행 {formatPostDate(post.publishedAt)}</time><span>수정 {formatPostDate(post.updatedAt)}</span><span>{post.category}</span><span>{post.format}</span></div>
          <h1>{post.title}</h1>
          <p className="article-lead">{post.excerpt}</p>
          <dl className="article-context"><div><dt>읽는 시간</dt><dd>{formatReadingTime(post.readingTimeMinutes)}</dd></div><div><dt>작성 기준</dt><dd>{post.basis}</dd></div></dl>
          <p className="article-tags">{post.tags.map((tag) => `#${tag}`).join("  ")}</p>
        </header>
        <PostBody blocks={post.body} />
        <Sources sources={post.sources} />
      </article>
      <SiteFooter />
    </main>
  </>;
}
