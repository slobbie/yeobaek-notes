export const ANALYTICS_EVENT_NAME = "blog:analytics";

const EVENT_SCHEMAS = Object.freeze({
  page_viewed: Object.freeze({}),
  post_opened: Object.freeze({ post_slug: "slug", category: "label" }),
  search_used: Object.freeze({ query_length: "count", results_count: "count" }),
  filter_applied: Object.freeze({ value: "label" }),
  source_opened: Object.freeze({ post_slug: "slug", source_host: "hostname" }),
});

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label}은 객체여야 합니다.`);
  }
}

function assertProperty(name, value, rule) {
  if (rule === "count" && (!Number.isInteger(value) || value < 0)) {
    throw new TypeError(`${name}은 0 이상의 정수여야 합니다.`);
  }
  if (rule === "slug" && (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))) {
    throw new TypeError(`${name}은 소문자 영문 slug여야 합니다.`);
  }
  if (rule === "hostname" && (typeof value !== "string" || value.length > 253 || !value.includes("."))) {
    throw new TypeError(`${name}은 공개 출처의 hostname이어야 합니다.`);
  }
  if (rule === "label" && (typeof value !== "string" || value.trim() !== value || value.length < 1 || value.length > 40)) {
    throw new TypeError(`${name}은 1~40자의 정해진 분류값이어야 합니다.`);
  }
  if (Array.isArray(rule) && !rule.includes(value)) {
    throw new TypeError(`${name}에 허용되지 않은 값입니다.`);
  }
}

export function normalizeAnalyticsPath(path) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new TypeError("page_path는 /로 시작해야 합니다.");
  }
  return path.split(/[?#]/, 1)[0] || "/";
}

export function getSourceHost(url) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new TypeError("출처는 HTTP 또는 HTTPS 주소여야 합니다.");
  }
  return parsed.hostname;
}

export function createAnalyticsEvent(name, properties, context) {
  const schema = EVENT_SCHEMAS[name];
  if (!schema) throw new TypeError(`정의되지 않은 분석 이벤트입니다: ${name}`);
  assertPlainObject(properties, "properties");
  assertPlainObject(context, "context");

  const expectedKeys = Object.keys(schema);
  const receivedKeys = Object.keys(properties);
  const unexpectedKey = receivedKeys.find((key) => !expectedKeys.includes(key));
  const missingKey = expectedKeys.find((key) => !receivedKeys.includes(key));
  if (unexpectedKey) throw new TypeError(`허용되지 않은 분석 속성입니다: ${unexpectedKey}`);
  if (missingKey) throw new TypeError(`필수 분석 속성이 없습니다: ${missingKey}`);

  expectedKeys.forEach((key) => assertProperty(key, properties[key], schema[key]));

  const occurredAt = new Date(context.occurred_at);
  if (Number.isNaN(occurredAt.getTime())) throw new TypeError("occurred_at은 유효한 날짜여야 합니다.");

  return Object.freeze({
    name,
    occurred_at: occurredAt.toISOString(),
    page_path: normalizeAnalyticsPath(context.page_path),
    properties: Object.freeze({ ...properties }),
  });
}

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
