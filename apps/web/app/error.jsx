"use client";

import { SiteFooter, SiteHeader } from "@yeobaek/ui";

export default function Error({ reset }) {
  return <>
    <a className="skip-link" href="#content-error">본문으로 건너뛰기</a>
    <main className="site-shell">
      <SiteHeader />
      <section className="article-detail" id="content-error" aria-labelledby="content-error-title">
        <header className="article-header">
          <p className="post-meta">콘텐츠 연결 오류</p>
          <h1 id="content-error-title">글을 불러오지 못했습니다.</h1>
          <p className="article-lead">잠시 후 다시 시도해 주세요.</p>
          <button type="button" onClick={reset}>다시 시도</button>
        </header>
      </section>
      <SiteFooter />
    </main>
  </>;
}
