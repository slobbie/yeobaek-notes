import assert from "node:assert/strict";
import test from "node:test";
import { createAdminAnalyticsDataApi } from "./admin-analytics-data-api.js";
import { buildAnalyticsDashboard, createAnalyticsDateRange, normalizeAnalyticsPeriod } from "./admin-analytics-model.js";

const rows = [
  { metricDate: "2026-09-13", eventName: "page_viewed", pagePath: "/posts/example", postSlug: "example", dimensionValue: "", eventCount: 4, primaryValueSum: 0, secondaryValueSum: 0, positiveResultCount: 0 },
  { metricDate: "2026-09-13", eventName: "post_opened", pagePath: "/", postSlug: "example", dimensionValue: "기술", eventCount: 3, primaryValueSum: 0, secondaryValueSum: 0, positiveResultCount: 0 },
  { metricDate: "2026-09-14", eventName: "search_used", pagePath: "/", postSlug: "", dimensionValue: "", eventCount: 2, primaryValueSum: 8, secondaryValueSum: 1, positiveResultCount: 1 },
  { metricDate: "2026-09-14", eventName: "source_opened", pagePath: "/posts/example", postSlug: "example", dimensionValue: "example.com", eventCount: 1, primaryValueSum: 0, secondaryValueSum: 0, positiveResultCount: 0 },
];

test("기간은 7·30·90일만 허용하고 서울 날짜로 계산한다", () => {
  assert.equal(normalizeAnalyticsPeriod("7"), 7);
  assert.equal(normalizeAnalyticsPeriod("365"), 30);
  assert.deepEqual(createAnalyticsDateRange(7, new Date("2026-09-14T15:30:00Z")), {
    start: "2026-09-09",
    end: "2026-09-15",
  });
});

test("지표는 사용자 수 대신 이벤트 횟수로 집계한다", () => {
  const dashboard = buildAnalyticsDashboard(rows);
  assert.equal(dashboard.totalEvents, 10);
  assert.equal(dashboard.pageViews, 4);
  assert.equal(dashboard.searchSuccessRate, 50);
  assert.deepEqual(dashboard.posts[0], { slug: "example", views: 4, opens: 3, sourceOpens: 1 });
  assert.deepEqual(dashboard.sources[0], { host: "example.com", count: 1 });
  assert.equal("users" in dashboard, false);
});

test("관리자 저장소는 service role로 기간 집계만 조회한다", async () => {
  const calls = [];
  const api = createAdminAnalyticsDataApi({
    baseUrl: "http://127.0.0.1:54321",
    serviceRoleKey: "server-secret",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify(rows.map((row) => ({
        metric_date: row.metricDate,
        event_name: row.eventName,
        page_path: row.pagePath,
        post_slug: row.postSlug,
        dimension_value: row.dimensionValue,
        event_count: row.eventCount,
        primary_value_sum: row.primaryValueSum,
        secondary_value_sum: row.secondaryValueSum,
        positive_result_count: row.positiveResultCount,
      }))), { status: 200 });
    },
  });

  const dashboard = await api.getDashboard({ start: "2026-09-01", end: "2026-09-30" });
  assert.equal(dashboard.totalEvents, 10);
  assert.match(calls[0].url.search, /metric_date=gte\.2026-09-01/);
  assert.equal(calls[0].options.headers.authorization, "Bearer server-secret");
});
