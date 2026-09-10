import assert from "node:assert/strict";
import test from "node:test";
import { createArchiveHref, filterPosts, getArchivePeriod, paginatePosts, parseArchiveState } from "../app/archive.js";
import { getPublishedPosts } from "../app/lib/content/post.js";
import { postFixtures } from "../app/lib/content/posts.js";

const posts = getPublishedPosts(postFixtures);

test("선택한 주제의 글만 반환한다", () => {
  const result = filterPosts(posts, { category: "리뷰" });
  assert.deepEqual(result.map((post) => post.slug), ["muji-aluminum-pen"]);
});

test("검색어의 앞뒤 공백과 영문 대소문자를 무시한다", () => {
  assert.deepEqual(filterPosts(posts, { query: "  ai  " }).map((post) => post.slug), ["questions-that-matter-with-ai"]);
});

test("조건이 맞지 않으면 빈 결과를 반환한다", () => {
  assert.deepEqual(filterPosts(posts, { category: "경제", query: "무인양품" }), []);
});

test("목록 순서와 관계없이 가장 최근 글의 월을 표시한다", () => {
  assert.deepEqual(getArchivePeriod([...posts].reverse()), { month: "SEP", year: "2026", label: "2026년 9월" });
  assert.equal(getArchivePeriod([]), null);
});

test("주소에서 주제, 검색어, 표시 범위를 복원한다", () => {
  assert.deepEqual(parseArchiveState("?topic=기술&q=%20AI%20&page=2", ["전체", "경제", "기술"]), {
    category: "기술",
    query: "AI",
    page: 2,
  });
  assert.deepEqual(parseArchiveState("?topic=없는주제&page=-1", ["전체", "경제", "기술"]), {
    category: "전체",
    query: "",
    page: 1,
  });
  assert.equal(parseArchiveState("?page=999999999999999999999", ["전체"]).page, 1);
});

test("기본값은 주소에서 생략하고 선택한 탐색 상태만 남긴다", () => {
  assert.equal(createArchiveHref(), "/");
  assert.equal(createArchiveHref({ category: "기술", query: " AI ", page: 2 }), "/?topic=%EA%B8%B0%EC%88%A0&q=AI&page=2");
});

test("최신 글을 정해진 수만큼 이어서 보여준다", () => {
  const firstPage = paginatePosts(posts, 1, 3);
  const secondPage = paginatePosts(posts, 2, 3);

  assert.deepEqual(firstPage.items.map((post) => post.slug), posts.slice(0, 3).map((post) => post.slug));
  assert.equal(firstPage.hasMore, true);
  assert.deepEqual(secondPage.items.map((post) => post.slug), posts.map((post) => post.slug));
  assert.equal(secondPage.hasMore, false);
});
