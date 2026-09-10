"use client";

import { useMemo, useState } from "react";
import { MarkdownBody } from "@yeobaek/ui";
import { splitEditorTags } from "./post-editor-model.js";

const EMPTY_SOURCE = { title: "", publisher: "", url: "", accessedAt: "" };

export function PostEditor({ categories, initialDraft }) {
  const [draft, setDraft] = useState(initialDraft);
  const tags = useMemo(() => splitEditorTags(draft.tags), [draft.tags]);
  const visibleSources = draft.sources.filter((source) => source.title || source.publisher || source.url);

  const updateDraft = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateSource = (index, field) => (event) => {
    setDraft((current) => ({
      ...current,
      sources: current.sources.map((source, sourceIndex) => (
        sourceIndex === index ? { ...source, [field]: event.target.value } : source
      )),
    }));
  };

  const addSource = () => setDraft((current) => ({ ...current, sources: [...current.sources, { ...EMPTY_SOURCE }] }));
  const removeSource = (index) => setDraft((current) => ({
    ...current,
    sources: current.sources.filter((_, sourceIndex) => sourceIndex !== index),
  }));

  return <main className="admin-app" data-app-boundary="YEOBAEK_LOCAL_ADMIN_ONLY">
    <header className="admin-header">
      <div className="admin-brand"><strong>여백의 노트</strong><span>관리자</span></div>
      <p className="local-state">로컬 초안</p>
    </header>

    <div className="editor-layout">
      <section className="editor-panel" aria-labelledby="editor-title">
        <div className="panel-heading">
          <p>글 편집</p>
          <h1 id="editor-title">{draft.title || "제목 없는 글"}</h1>
        </div>

        <form className="post-form" onSubmit={(event) => event.preventDefault()}>
          <fieldset>
            <legend>기본 정보</legend>
            <div className="field field-wide"><label htmlFor="post-title">제목</label><input id="post-title" value={draft.title} onChange={updateDraft("title")} /></div>
            <div className="field field-wide">
              <label htmlFor="post-slug">글 주소</label>
              <div className="slug-input"><span aria-hidden="true">/posts/</span><input id="post-slug" value={draft.slug} onChange={updateDraft("slug")} spellCheck="false" /></div>
            </div>
            <div className="field field-wide"><label htmlFor="post-excerpt">요약</label><textarea id="post-excerpt" rows="3" value={draft.excerpt} onChange={updateDraft("excerpt")} /></div>
          </fieldset>

          <fieldset>
            <legend>본문</legend>
            <div className="field field-wide">
              <label htmlFor="post-body">Markdown</label>
              <textarea className="body-input" id="post-body" rows="15" value={draft.bodyMarkdown} onChange={updateDraft("bodyMarkdown")} />
              <p className="field-help"><code>##</code> 소제목 · <code>**</code> 강조 · <code>&gt;</code> 인용 · <code>-</code> 목록 · <code>[이름](주소)</code> 링크</p>
            </div>
          </fieldset>

          <fieldset>
            <legend>분류</legend>
            <div className="field"><label htmlFor="post-category">분야</label><select id="post-category" value={draft.category} onChange={updateDraft("category")}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
            <div className="field"><label htmlFor="post-tags">태그</label><input id="post-tags" value={draft.tags} onChange={updateDraft("tags")} placeholder="쉼표로 구분" /></div>
          </fieldset>

          <fieldset>
            <legend>출처</legend>
            <div className="section-action"><button className="text-button" type="button" onClick={addSource}>출처 추가</button></div>
            {draft.sources.length === 0 && <p className="section-empty">출처가 없는 글입니다.</p>}
            {draft.sources.map((source, index) => <div className="source-fields" key={index}>
              <div className="source-heading"><strong>출처 {index + 1}</strong><button type="button" onClick={() => removeSource(index)}>삭제</button></div>
              <div className="field"><label htmlFor={`source-title-${index}`}>자료 제목</label><input id={`source-title-${index}`} value={source.title} onChange={updateSource(index, "title")} /></div>
              <div className="field"><label htmlFor={`source-publisher-${index}`}>발행처</label><input id={`source-publisher-${index}`} value={source.publisher} onChange={updateSource(index, "publisher")} /></div>
              <div className="field field-wide"><label htmlFor={`source-url-${index}`}>웹 주소</label><input id={`source-url-${index}`} type="url" value={source.url} onChange={updateSource(index, "url")} /></div>
              <div className="field"><label htmlFor={`source-date-${index}`}>확인 날짜</label><input id={`source-date-${index}`} type="date" value={source.accessedAt} onChange={updateSource(index, "accessedAt")} /></div>
            </div>)}
          </fieldset>

          <fieldset>
            <legend>검색 정보</legend>
            <div className="field field-wide">
              <div className="label-row"><label htmlFor="seo-title">검색 제목</label><span>{draft.seoTitle.length}자</span></div>
              <input id="seo-title" value={draft.seoTitle} onChange={updateDraft("seoTitle")} />
            </div>
            <div className="field field-wide">
              <div className="label-row"><label htmlFor="seo-description">검색 설명</label><span>{draft.seoDescription.length}자</span></div>
              <textarea id="seo-description" rows="3" value={draft.seoDescription} onChange={updateDraft("seoDescription")} />
            </div>
          </fieldset>
        </form>
      </section>

      <aside className="preview-panel" aria-labelledby="preview-title">
        <div className="preview-sticky">
          <div className="preview-bar"><h2 id="preview-title">미리보기</h2><span>공개 글</span></div>
          <article className="post-preview">
            <header className="preview-header">
              <div className="preview-meta"><span>미발행</span><span>{draft.category}</span></div>
              <h1>{draft.title || "제목 없는 글"}</h1>
              <p className="preview-excerpt">{draft.excerpt || "글의 요약이 여기에 표시됩니다."}</p>
              {tags.length > 0 && <p className="preview-tags">{tags.map((tag) => `#${tag}`).join(" · ")}</p>}
            </header>
            {draft.bodyMarkdown.trim()
              ? <MarkdownBody className="preview-body markdown-body">{draft.bodyMarkdown}</MarkdownBody>
              : <p className="preview-empty">본문을 입력하면 여기에 표시됩니다.</p>}
            <section className="preview-sources" aria-labelledby="preview-sources-title">
              <h2 id="preview-sources-title">참고한 자료</h2>
              {visibleSources.length > 0
                ? <ol>{visibleSources.map((source, index) => <li key={`${source.url}-${index}`}><span>{source.title || "제목 없음"}</span><small>{source.publisher || "발행처 없음"}{source.accessedAt ? ` · ${source.accessedAt.replaceAll("-", ". ")} 확인` : ""}</small></li>)}</ol>
                : <p>외부 자료를 인용하지 않은 글입니다.</p>}
            </section>
          </article>
        </div>
      </aside>
    </div>
  </main>;
}
