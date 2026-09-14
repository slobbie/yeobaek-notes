import { AnalyticsDashboard } from "./analytics-dashboard.jsx";
import { getAdminAnalyticsDashboard } from "../lib/admin-analytics-repository.js";
import { buildAnalyticsDashboard, createAnalyticsDateRange, normalizeAnalyticsPeriod } from "../lib/admin-analytics-model.js";

export const metadata = {
  title: "블로그 지표 | 여백의 노트 관리자",
};

function singleValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const days = normalizeAnalyticsPeriod(singleValue(params?.days));
  const range = createAnalyticsDateRange(days);
  let dashboard = buildAnalyticsDashboard([]);
  let error = "";

  try {
    dashboard = await getAdminAnalyticsDashboard(range);
  } catch (caught) {
    console.error("[admin-analytics] 지표 조회 실패", { name: caught?.name });
    error = "지표를 불러오지 못했습니다. Supabase 연결과 마이그레이션 상태를 확인해 주세요.";
  }

  return <AnalyticsDashboard dashboard={dashboard} days={days} error={error} range={range} />;
}
