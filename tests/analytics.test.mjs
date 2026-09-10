import assert from "node:assert/strict";
import test from "node:test";
import { createAnalyticsEvent, getSourceHost, normalizeAnalyticsPath, observeAnalytics, track } from "../app/lib/analytics.js";

const context = {
  occurred_at: "2026-09-09T10:00:00+09:00",
  page_path: "/posts/questions-that-matter-with-ai?from=search#sources",
};

test("분석 이벤트는 이름, 시각, 쿼리가 제거된 공개 경로를 기록한다", () => {
  const event = createAnalyticsEvent("page_viewed", {}, context);
  assert.deepEqual(event, {
    name: "page_viewed",
    occurred_at: "2026-09-09T01:00:00.000Z",
    page_path: "/posts/questions-that-matter-with-ai",
    properties: {},
  });
});

test("검색 이벤트는 검색어 대신 길이와 결과 수만 허용한다", () => {
  const event = createAnalyticsEvent("search_used", { query_length: 2, results_count: 1 }, context);
  assert.deepEqual(event.properties, { query_length: 2, results_count: 1 });
  assert.throws(
    () => createAnalyticsEvent("search_used", { query: "AI", query_length: 2, results_count: 1 }, context),
    /허용되지 않은 분석 속성/,
  );
});

test("글 더 보기는 표시한 글 수와 전체 글 수만 기록한다", () => {
  const event = createAnalyticsEvent("archive_expanded", { visible_count: 4, total_count: 4 }, context);
  assert.deepEqual(event.properties, { visible_count: 4, total_count: 4 });
  assert.throws(
    () => createAnalyticsEvent("archive_expanded", { visible_count: 5, total_count: 4 }, context),
    /total_count보다 클 수 없습니다/,
  );
});

test("정의되지 않은 이벤트와 속성값은 거부한다", () => {
  assert.throws(() => createAnalyticsEvent("user_identified", {}, context), /정의되지 않은 분석 이벤트/);
  assert.throws(
    () => createAnalyticsEvent("filter_applied", { filter_type: "category", value: "경제" }, context),
    /허용되지 않은 분석 속성/,
  );
});

test("출처 이벤트에는 전체 주소 대신 hostname만 기록한다", () => {
  assert.equal(getSourceHost("https://www.example.com/report?q=private"), "www.example.com");
});

test("경로에는 검색 조건과 화면 위치를 남기지 않는다", () => {
  assert.equal(normalizeAnalyticsPath("/?query=경제#archive"), "/");
});

test("서버 렌더링에서는 브라우저 이벤트를 만들지 않는다", () => {
  assert.equal(track("page_viewed"), null);
});

test("브라우저에서는 계약을 통과한 이벤트를 관찰자에게 전달한다", () => {
  class AnalyticsCustomEvent extends Event {
    constructor(type, init) {
      super(type);
      this.detail = init.detail;
    }
  }

  const browserWindow = new EventTarget();
  browserWindow.location = { pathname: "/" };
  globalThis.window = browserWindow;
  globalThis.CustomEvent = AnalyticsCustomEvent;

  try {
    let observedEvent;
    const stopObserving = observeAnalytics((event) => { observedEvent = event; });
    const trackedEvent = track("filter_applied", { value: "경제" });

    assert.deepEqual(observedEvent, trackedEvent);
    stopObserving();
  } finally {
    delete globalThis.window;
    delete globalThis.CustomEvent;
  }
});
