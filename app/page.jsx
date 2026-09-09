"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { track } from "./lib/analytics.js";

const posts = [
  { slug: "understanding-money-and-myself", date: "2026. 09. 28", category: "경제", format: "긴 글", title: "돈을 이해한다는 것과, 나를 이해하는 것", excerpt: "돈을 공부할수록 결국 사람을 이해하게 된다. 숫자와 시장의 흐름 너머에는 언제나 선택을 하는 사람들이 있고, 그 선택은 각자의 세계관에서 비롯된다.", minutes: "14분 읽기", tags: ["자산", "행동경제학", "자기이해"] },
  { slug: "walking-and-ideas", date: "2026. 09. 26", category: "관찰", format: "짧은 기록", title: "오늘의 관찰: 좋은 아이디어는 산책 중에 찾아온다", excerpt: "책상 앞에서 해결되지 않던 문제가, 걷는 동안에 갑자기 풀리는 순간이 있다. 몸이 움직일 때 생각도 함께 움직이기 때문일 것이다.", minutes: "3분 읽기", tags: ["산책", "아이디어", "일상"] },
  { slug: "muji-aluminum-pen", date: "2026. 09. 24", category: "리뷰", format: "사용기", title: "오래 쓰는 기분이 좋은, 무인양품 알루미늄 볼펜", excerpt: "화려하진 않지만 매일 손이 가는 물건이 있다. 단순함 속에서 오래 쓰는 물건이 주는 만족을 기록한다.", minutes: "6분 읽기", tags: ["무인양품", "문구", "오래쓰는물건"] },
  { slug: "questions-that-matter-with-ai", date: "2026. 09. 20", category: "기술", format: "링크 노트", title: "AI를 도구로 쓸 때 더 중요해지는 질문", excerpt: "도구가 바뀌어도 문제를 정의하는 사람의 역할은 남는다.", minutes: "4분 읽기", tags: ["AI", "도구", "일"] },
];
const categories = ["전체", "경제", "기술", "생활", "관찰", "리뷰"];
const formats = ["긴 글", "짧은 기록", "사용기", "링크 노트"];

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
          {visiblePosts.length ? visiblePosts.map((post) => <article className="post" key={post.slug}><span className="timeline-dot" aria-hidden="true" /><div className="post-meta"><time>{post.date}</time><span>{post.category}</span><span>{post.format}</span></div><h1><a href={`#${post.slug}`} onClick={() => track("post_opened", { post_slug: post.slug, category: post.category })}>{post.title}</a></h1><p>{post.excerpt}</p><footer><span>{post.minutes}</span><span>{post.tags.map((tag) => `#${tag}`).join("  ")}</span></footer></article>) : <div className="empty"><p>이 조건에 맞는 기록은 아직 없어요.</p><button onClick={reset}>필터 초기화</button></div>}
          <p className="archive-end">더 많은 기록이 시간의 순서대로 이어집니다.</p>
        </section>
      </div>
      <footer className="page-footer" id="about"><span>© 2026 여백의 노트.</span><span>읽는 사람 · 쓰는 사람 · 생각하는 사람</span></footer>
    </main>
  </>;
}
