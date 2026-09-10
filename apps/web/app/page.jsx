"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { formatPostDate, getPublishedPosts, POST_CATEGORIES, postFixtures } from "@yeobaek/content";
import { SiteFooter, SiteHeader } from "@yeobaek/ui";
import Link from "next/link";
import { ARCHIVE_PAGE_SIZE, createArchiveHref, filterPosts, getArchivePeriod, paginatePosts, parseArchiveState } from "./archive.js";
import { track } from "./lib/analytics.js";
import { createWebsiteJsonLd, serializeJsonLd } from "./seo.js";
import styles from "./home.module.css";

const posts = getPublishedPosts(postFixtures);
const categories = ["전체", ...POST_CATEGORIES];

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const lastTrackedQuery = useRef(null);
  const filteredPosts = useMemo(() => filterPosts(posts, { category, query }), [category, query]);
  const archivePage = useMemo(() => paginatePosts(filteredPosts, page), [filteredPosts, page]);
  const visiblePosts = archivePage.items;
  const archivePeriod = getArchivePeriod(filteredPosts.length > 0 ? filteredPosts : posts);

  useEffect(() => {
    const syncFromUrl = () => {
      const parsed = parseArchiveState(window.location.search, categories);
      const resultCount = filterPosts(posts, parsed).length;
      const lastPage = Math.max(1, Math.ceil(resultCount / ARCHIVE_PAGE_SIZE));
      const next = { ...parsed, page: Math.min(parsed.page, lastPage) };

      setCategory(next.category);
      setQuery(next.query);
      setPage(next.page);

      const normalizedHref = createArchiveHref(next);
      const currentHref = `${window.location.pathname}${window.location.search}`;
      if (normalizedHref !== currentHref) window.history.replaceState(window.history.state, "", normalizedHref);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const updateUrl = (next, mode = "push") => {
    window.history[`${mode}State`](window.history.state, "", createArchiveHref(next));
  };
  const reset = () => {
    const next = { category: "전체", query: "", page: 1 };
    setCategory(next.category);
    setQuery(next.query);
    setPage(next.page);
    lastTrackedQuery.current = null;
    updateUrl(next, "replace");
  };
  const selectCategory = (value) => {
    if (value === category) return;
    const next = { category: value, query, page: 1 };
    setCategory(next.category);
    setPage(next.page);
    updateUrl(next);
    track("filter_applied", { value });
  };
  const changeQuery = (value) => {
    const next = { category, query: value, page: 1 };
    setQuery(next.query);
    setPage(next.page);
    updateUrl(next, "replace");
  };
  const showMore = () => {
    const nextPage = page + 1;
    const visibleCount = Math.min(nextPage * ARCHIVE_PAGE_SIZE, filteredPosts.length);
    setPage(nextPage);
    updateUrl({ category, query, page: nextPage });
    track("archive_expanded", { visible_count: visibleCount, total_count: filteredPosts.length });
  };
  const trackSearch = () => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || normalizedQuery === lastTrackedQuery.current) return;
    lastTrackedQuery.current = normalizedQuery;
    track("search_used", { query_length: normalizedQuery.length, results_count: filteredPosts.length });
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(createWebsiteJsonLd()) }} />
    <a className="skip-link" href="#archive">본문으로 건너뛰기</a>
    <main className="site-shell">
      <SiteHeader home onBrandClick={reset} />
      <section className="intro" id="top"><p>경제, 기술, 생활과 그 사이에서 발견한 것을 기록합니다.</p><p>여백에 남긴 생각들</p></section>
      <section className={styles.controls} aria-label="글 필터">
        <div className={styles.filterGroup} role="group" aria-label="주제별 글 보기">{categories.map((item) => <button type="button" aria-pressed={category === item} className={category === item ? styles.selected : ""} key={item} onClick={() => selectCategory(item)}>{item}</button>)}</div>
        <label className={styles.search}><span className="sr-only">글 검색</span><MagnifyingGlass aria-hidden="true" size={18} weight="bold" /><input type="search" autoComplete="off" maxLength={100} value={query} onChange={(event) => changeQuery(event.target.value)} onBlur={trackSearch} placeholder="제목이나 태그를 검색해보세요" /></label>
      </section>
      <div className="content-grid" id="archive">
        <aside className="month-mark" aria-label={`${archivePeriod.label} 기록`}><strong>{archivePeriod.month}<br />{archivePeriod.year}</strong><p>좋은 생각은<br />시간 속에서<br />더 깊어진다.</p></aside>
        <section className="archive" aria-labelledby="archive-title">
          <h2 className="sr-only" id="archive-title">최신 글</h2>
          <p className="sr-only" role="status">검색 결과 {filteredPosts.length}개 중 {visiblePosts.length}개 표시</p>
          {visiblePosts.length ? visiblePosts.map((post) => <article className="post" key={post.slug}><span className="timeline-dot" aria-hidden="true" /><div className="post-meta"><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time><span>{post.category}</span></div><h3><Link href={`/posts/${post.slug}`} onClick={() => track("post_opened", { post_slug: post.slug, category: post.category })}>{post.title}</Link></h3><p>{post.excerpt}</p><footer><span>{post.tags.map((tag) => `#${tag}`).join(" · ")}</span></footer></article>) : <div className="empty"><p>이 조건에 맞는 기록은 아직 없어요.</p><button type="button" onClick={reset}>필터 초기화</button></div>}
          {archivePage.hasMore && <div className={styles.loadMore}><button type="button" onClick={showMore}>글 더 보기</button></div>}
        </section>
      </div>
      <SiteFooter />
    </main>
  </>;
}
