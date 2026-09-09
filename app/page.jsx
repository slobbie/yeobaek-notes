"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { track } from "./lib/analytics.js";
import { formatPostDate, formatReadingTime, getPublishedPosts, POST_CATEGORIES, POST_FORMATS } from "./lib/content/post.js";
import { postFixtures } from "./lib/content/posts.js";

const posts = getPublishedPosts(postFixtures);
const categories = ["전체", ...POST_CATEGORIES];
const formats = POST_FORMATS;

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [format, setFormat] = useState("전체");
  const [query, setQuery] = useState("");
  const visiblePosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return posts.filter((post) => (category === "전체" || post.category === category) && (format === "전체" || post.format === format) && (!keyword || `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase().includes(keyword)));
  }, [category, format, query]);
  const reset = () => { setCategory("전체"); setFormat("전체"); setQuery(""); };
  const selectCategory = (value) => { setCategory(value); track("filter_applied", { filter_type: "category", value }); };
  const selectFormat = (value) => { const next = format === value ? "전체" : value; setFormat(next); track("filter_applied", { filter_type: "format", value: next }); };

  return <>
    <a className="skip-link" href="#archive">본문으로 건너뛰기</a>
    <main className="site-shell">
      <header className="masthead">
        <a className="brand" href="#top" onClick={reset}><strong>여백의 노트</strong><span>읽고, 쓰고, 생각한 것을 남깁니다.</span></a>
        <nav aria-label="주요 메뉴"><a className="active" aria-current="page" href="#archive">글 모아보기</a><a href="#about">소개</a></nav>
      </header>
      <section className="intro" id="top"><p>경제, 기술, 생활과 그 사이에서 발견한 것을 기록합니다.</p><p>여백에 남긴 생각들</p></section>
      <section className="controls" aria-label="글 필터">
        <div className="filter-group"><span>분야</span>{categories.map((item) => <button aria-pressed={category === item} className={category === item ? "selected" : ""} key={item} onClick={() => selectCategory(item)}>{item}</button>)}</div>
        <div className="filter-group"><span>형식</span>{formats.map((item) => <button aria-pressed={format === item} className={format === item ? "selected" : ""} key={item} onClick={() => selectFormat(item)}>{item}</button>)}</div>
        <label className="search"><MagnifyingGlass aria-hidden="true" size={18} weight="bold" /><span>검색</span><input value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => query && track("search_used", { query, results_count: visiblePosts.length })} placeholder="제목, 태그로 찾아보세요" /></label>
      </section>
      <div className="content-grid" id="archive">
        <aside className="month-mark"><strong>SEP<br />2026</strong><p>좋은 생각은<br />시간 속에서<br />더 깊어진다.</p></aside>
        <section className="archive" aria-label="글 목록" aria-live="polite">
          {visiblePosts.length ? visiblePosts.map((post) => <article className="post" key={post.slug}><span className="timeline-dot" aria-hidden="true" /><div className="post-meta"><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time><span>{post.category}</span><span>{post.format}</span></div><h1><a href={`#${post.slug}`} onClick={() => track("post_opened", { post_slug: post.slug, category: post.category })}>{post.title}</a></h1><p>{post.excerpt}</p><footer><span>{formatReadingTime(post.readingTimeMinutes)}</span><span>{post.tags.map((tag) => `#${tag}`).join("  ")}</span></footer></article>) : <div className="empty"><p>이 조건에 맞는 기록은 아직 없어요.</p><button onClick={reset}>필터 초기화</button></div>}
          <p className="archive-end">더 많은 기록이 시간의 순서대로 이어집니다.</p>
        </section>
      </div>
      <footer className="page-footer" id="about"><span>© 2026 여백의 노트.</span><span>읽는 사람 · 쓰는 사람 · 생각하는 사람</span></footer>
    </main>
  </>;
}
