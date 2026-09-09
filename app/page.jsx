"use client";

import { useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";
import { filterPosts, getArchivePeriod } from "./archive.js";
import { SiteFooter } from "./components/site-footer.jsx";
import { SiteHeader } from "./components/site-header.jsx";
import { track } from "./lib/analytics.js";
import { formatPostDate, formatReadingTime, getPublishedPosts, POST_CATEGORIES, POST_FORMATS } from "./lib/content/post.js";
import { postFixtures } from "./lib/content/posts.js";
import { createWebsiteJsonLd, serializeJsonLd } from "./seo.js";

const posts = getPublishedPosts(postFixtures);
const categories = ["전체", ...POST_CATEGORIES];
const formats = ["전체", ...POST_FORMATS];

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [format, setFormat] = useState("전체");
  const [query, setQuery] = useState("");
  const lastTrackedQuery = useRef(null);
  const visiblePosts = useMemo(() => filterPosts(posts, { category, format, query }), [category, format, query]);
  const archivePeriod = getArchivePeriod(visiblePosts.length > 0 ? visiblePosts : posts);
  const reset = () => { setCategory("전체"); setFormat("전체"); setQuery(""); lastTrackedQuery.current = null; };
  const selectCategory = (value) => { setCategory(value); track("filter_applied", { filter_type: "category", value }); };
  const selectFormat = (value) => { setFormat(value); track("filter_applied", { filter_type: "format", value }); };
  const trackSearch = () => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || normalizedQuery === lastTrackedQuery.current) return;
    lastTrackedQuery.current = normalizedQuery;
    track("search_used", { query_length: normalizedQuery.length, results_count: visiblePosts.length });
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(createWebsiteJsonLd()) }} />
    <a className="skip-link" href="#archive">본문으로 건너뛰기</a>
    <main className="site-shell">
      <SiteHeader home onBrandClick={reset} />
      <section className="intro" id="top"><p>경제, 기술, 생활과 그 사이에서 발견한 것을 기록합니다.</p><p>여백에 남긴 생각들</p></section>
      <section className="controls" aria-label="글 필터">
        <fieldset className="filter-group"><legend>분야</legend>{categories.map((item) => <button type="button" aria-pressed={category === item} className={category === item ? "selected" : ""} key={item} onClick={() => selectCategory(item)}>{item}</button>)}</fieldset>
        <fieldset className="filter-group"><legend>형식</legend>{formats.map((item) => <button type="button" aria-pressed={format === item} className={format === item ? "selected" : ""} key={item} onClick={() => selectFormat(item)}>{item}</button>)}</fieldset>
        <label className="search"><MagnifyingGlass aria-hidden="true" size={18} weight="bold" /><span>검색</span><input type="search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} onBlur={trackSearch} placeholder="제목, 태그로 찾아보세요" /></label>
      </section>
      <div className="content-grid" id="archive">
        <aside className="month-mark" aria-label={`${archivePeriod.label} 기록`}><strong>{archivePeriod.month}<br />{archivePeriod.year}</strong><p>좋은 생각은<br />시간 속에서<br />더 깊어진다.</p></aside>
        <section className="archive" aria-labelledby="archive-title">
          <h2 className="sr-only" id="archive-title">최신 글</h2>
          <p className="sr-only" role="status">검색 결과 {visiblePosts.length}개</p>
          {visiblePosts.length ? visiblePosts.map((post) => <article className="post" key={post.slug}><span className="timeline-dot" aria-hidden="true" /><div className="post-meta"><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time><span>{post.category}</span><span>{post.format}</span></div><h3><Link href={`/posts/${post.slug}`} onClick={() => track("post_opened", { post_slug: post.slug, category: post.category })}>{post.title}</Link></h3><p>{post.excerpt}</p><footer><span>{formatReadingTime(post.readingTimeMinutes)}</span><span>{post.tags.map((tag) => `#${tag}`).join("  ")}</span></footer></article>) : <div className="empty"><p>이 조건에 맞는 기록은 아직 없어요.</p><button type="button" onClick={reset}>필터 초기화</button></div>}
          {visiblePosts.length > 0 && <p className="archive-end">더 많은 기록이 시간의 순서대로 이어집니다.</p>}
        </section>
      </div>
      <SiteFooter />
    </main>
  </>;
}
