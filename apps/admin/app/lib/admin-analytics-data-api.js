import { buildAnalyticsDashboard } from "./admin-analytics-model.js";

const METRIC_SELECT = [
  "metric_date",
  "event_name",
  "page_path",
  "post_slug",
  "dimension_value",
  "event_count",
  "primary_value_sum",
  "secondary_value_sum",
  "positive_result_count",
].join(",");

function mapMetricRow(row) {
  return Object.freeze({
    metricDate: row.metric_date,
    eventName: row.event_name,
    pagePath: row.page_path,
    postSlug: row.post_slug,
    dimensionValue: row.dimension_value,
    eventCount: Number(row.event_count),
    primaryValueSum: Number(row.primary_value_sum),
    secondaryValueSum: Number(row.secondary_value_sum),
    positiveResultCount: Number(row.positive_result_count),
  });
}

export function createAdminAnalyticsDataApi({ baseUrl, serviceRoleKey, fetchImpl = fetch }) {
  if (!baseUrl || !serviceRoleKey) throw new Error("관리자 분석 환경 변수가 설정되지 않았습니다.");

  return Object.freeze({
    async getDashboard({ start, end }) {
      const url = new URL("/rest/v1/analytics_daily_metrics", baseUrl);
      url.searchParams.set("select", METRIC_SELECT);
      url.searchParams.set("metric_date", `gte.${start}`);
      url.searchParams.append("metric_date", `lte.${end}`);
      url.searchParams.set("order", "metric_date.asc");
      const response = await fetchImpl(url, {
        headers: {
          apikey: serviceRoleKey,
          authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      });
      if (!response.ok) throw new Error("분석 지표를 불러오지 못했습니다.");
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new TypeError("분석 지표 조회 결과는 배열이어야 합니다.");
      return buildAnalyticsDashboard(rows.map(mapMetricRow));
    },
  });
}
