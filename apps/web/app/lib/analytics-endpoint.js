import "server-only";

export function getAnalyticsEndpoint() {
  const baseUrl = process.env.SUPABASE_URL?.trim();
  if (!baseUrl) return "";
  return new URL("/functions/v1/collect-analytics", baseUrl).toString();
}
