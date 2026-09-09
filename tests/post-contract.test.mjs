import assert from "node:assert/strict";
import test from "node:test";
import { definePost, findPublishedPostBySlug, formatPostDate, getPublishedPosts } from "../app/lib/content/post.js";

const validPost = {
  slug: "example-post",
  status: "published",
  publishedAt: "2026-09-01T09:00:00+09:00",
  updatedAt: "2026-09-02T09:00:00+09:00",
  category: "생활",
  format: "짧은 기록",
  title: "예시 글",
  excerpt: "공개 글 계약을 검증하기 위한 예시입니다.",
  basis: "2026년 9월 테스트 기준",
  readingTimeMinutes: 2,
  tags: ["기록"],
  sources: [],
  body: [{ type: "paragraph", text: "검증할 본문입니다." }],
  seo: { title: "예시 글", description: "공개 글 계약 검증 예시입니다." },
};

test("공개 글의 필수 정보와 날짜 순서를 검증한다", () => {
  const post = definePost(validPost);
  assert.equal(post.slug, "example-post");
  assert.throws(() => definePost({ ...validPost, slug: "잘못된 주소" }), /slug/);
  assert.throws(() => definePost({ ...validPost, updatedAt: "2026-08-31T09:00:00+09:00" }), /updatedAt/);
});

test("발행 글만 최신순으로 반환한다", () => {
  const older = definePost({ ...validPost, slug: "older", publishedAt: "2026-08-01T09:00:00+09:00", updatedAt: "2026-08-01T09:00:00+09:00" });
  const draft = definePost({ ...validPost, slug: "draft", status: "draft" });
  const posts = getPublishedPosts([older, draft, definePost(validPost)]);
  assert.deepEqual(posts.map((post) => post.slug), ["example-post", "older"]);
});

test("출처는 제목, 발행처, 확인 날짜와 웹 주소를 요구한다", () => {
  assert.throws(() => definePost({ ...validPost, sources: [{ title: "자료", publisher: "발행처", url: "file:///private", accessedAt: "2026-09-01" }] }), /HTTP/);
});

test("발행일은 실행 환경과 관계없이 한국 시간으로 표시한다", () => {
  assert.equal(formatPostDate("2026-09-08T00:30:00+09:00"), "2026. 09. 08");
});

test("본문은 지원하는 블록과 비어 있지 않은 내용을 요구한다", () => {
  assert.throws(() => definePost({ ...validPost, body: [] }), /body/);
  assert.throws(() => definePost({ ...validPost, body: [{ type: "image", text: "지원하지 않음" }] }), /body.type/);
  assert.throws(() => definePost({ ...validPost, body: [{ type: "list", items: [] }] }), /목록 본문/);
});

test("공개된 주소만 상세 글로 찾는다", () => {
  const published = definePost(validPost);
  const draft = definePost({ ...validPost, slug: "draft-post", status: "draft" });
  assert.equal(findPublishedPostBySlug([published, draft], "example-post"), published);
  assert.equal(findPublishedPostBySlug([published, draft], "draft-post"), null);
  assert.equal(findPublishedPostBySlug([published], "missing-post"), null);
});
