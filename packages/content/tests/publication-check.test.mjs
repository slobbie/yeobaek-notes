import assert from "node:assert/strict";
import test from "node:test";

import { checkPostForPublication } from "../src/publication-check.js";

function createDraft(overrides = {}) {
  return {
    title: "질문을 더 잘 남기는 방법",
    slug: "asking-better-questions",
    excerpt: "생각을 정리하기 위한 질문 기록법입니다.",
    bodyMarkdown: "## 기록 기준\n\n2026년 9월 기준으로 직접 사용한 경험을 정리했습니다.",
    category: "기술",
    seoTitle: "질문을 더 잘 남기는 방법 | 여백의 노트",
    seoDescription: "생각을 정리하고 다시 확인하기 위한 질문 기록법을 소개합니다.",
    sources: [
      {
        title: "공식 안내",
        publisher: "Example",
        url: "https://example.com/guide",
        accessedAt: "2026-09-09",
      },
    ],
    ...overrides,
  };
}

test("발행에 필요한 항목을 모두 갖춘 글은 준비 완료로 판단한다", () => {
  const result = checkPostForPublication(createDraft(), {
    existingSlugs: ["asking-better-questions"],
    originalSlug: "asking-better-questions",
    today: "2026-09-10",
  });

  assert.equal(result.ready, true);
  assert.equal(result.errorCount, 0);
});

test("다른 글이 사용 중인 주소는 발행을 막는다", () => {
  const result = checkPostForPublication(createDraft(), {
    existingSlugs: ["asking-better-questions"],
    today: "2026-09-10",
  });

  assert.equal(result.ready, false);
  assert.equal(result.checks.find(({ id }) => id === "slug-duplicate")?.status, "error");
});

test("출처가 불완전하거나 확인일이 미래이면 발행을 막는다", () => {
  const incomplete = checkPostForPublication(
    createDraft({ sources: [{ title: "자료", publisher: "", url: "", accessedAt: "" }] }),
    { today: "2026-09-10" },
  );
  const future = checkPostForPublication(
    createDraft({ sources: [{ title: "자료", publisher: "발행처", url: "https://example.com", accessedAt: "2026-09-11" }] }),
    { today: "2026-09-10" },
  );

  assert.equal(incomplete.checks.find(({ id }) => id === "sources")?.status, "error");
  assert.equal(future.checks.find(({ id }) => id === "sources")?.status, "error");
});

test("빈 이미지 설명과 HTML 태그를 발견한다", () => {
  const result = checkPostForPublication(
    createDraft({ bodyMarkdown: "<strong>강조</strong>\n\n![](https://example.com/image.jpg)" }),
    { today: "2026-09-10" },
  );

  assert.equal(result.checks.find(({ id }) => id === "body")?.status, "error");
  assert.equal(result.checks.find(({ id }) => id === "image-alt")?.status, "error");
});

test("경제·기술·리뷰 글에 근거가 없으면 확인을 권장하되 발행을 막지 않는다", () => {
  const result = checkPostForPublication(
    createDraft({ bodyMarkdown: "개인적인 생각을 정리했습니다.", sources: [] }),
    { today: "2026-09-10" },
  );

  assert.equal(result.ready, true);
  assert.equal(result.checks.find(({ id }) => id === "evidence")?.status, "warning");
});
