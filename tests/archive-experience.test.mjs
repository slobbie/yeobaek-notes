import assert from "node:assert/strict";
import test from "node:test";
import { filterPosts, getArchivePeriod } from "../app/archive.js";
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
