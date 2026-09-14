import "server-only";

import { createAdminAnalyticsDataApi } from "./admin-analytics-data-api.js";

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`관리자 분석 환경 변수 ${name}이 설정되지 않았습니다.`);
  return value;
}

export function getAdminAnalyticsDashboard(range) {
  return createAdminAnalyticsDataApi({
    baseUrl: requireEnvironment("SUPABASE_URL"),
    serviceRoleKey: requireEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
  }).getDashboard(range);
}
