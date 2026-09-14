import { createAnalyticsEvent } from "@yeobaek/content";

export { createAnalyticsEvent, getSourceHost, normalizeAnalyticsPath } from "@yeobaek/content";

export const ANALYTICS_EVENT_NAME = "blog:analytics";

export function track(name, properties = {}) {
  if (typeof window === "undefined") return null;

  const event = createAnalyticsEvent(name, properties, {
    occurred_at: new Date().toISOString(),
    page_path: window.location.pathname,
  });
  window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT_NAME, { detail: event }));
  return event;
}

export function observeAnalytics(listener) {
  if (typeof window === "undefined") return () => {};
  const handleEvent = (event) => listener(event.detail);
  window.addEventListener(ANALYTICS_EVENT_NAME, handleEvent);
  return () => window.removeEventListener(ANALYTICS_EVENT_NAME, handleEvent);
}

export async function sendAnalyticsEvent(endpoint, event, fetchImpl = fetch) {
  if (!endpoint) return false;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  });
  return response.ok;
}
