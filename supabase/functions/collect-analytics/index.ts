import { createAnalyticsEvent } from "../../../packages/content/src/analytics.js";

const DEFAULT_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function allowedOrigins() {
  const configured = Deno.env.get("ANALYTICS_ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
  return new Set([...DEFAULT_ORIGINS, ...configured]);
}

function responseHeaders(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "content-type": "application/json; charset=utf-8",
    "vary": "origin",
  };
}

function json(origin: string, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";
  if (!allowedOrigins().has(origin)) {
    return new Response(null, { status: 403 });
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }
  if (request.method !== "POST") {
    return json(origin, 405, { error: "method_not_allowed" });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4096) {
    return json(origin, 413, { error: "payload_too_large" });
  }

  let event;
  try {
    const payload = await request.json();
    event = createAnalyticsEvent(payload?.name, payload?.properties, {
      occurred_at: payload?.occurred_at,
      page_path: payload?.page_path,
    });
  } catch {
    return json(origin, 400, { error: "invalid_event" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return json(origin, 503, { error: "collector_unavailable" });
  }

  const stored = await fetch(new URL("/rest/v1/rpc/record_analytics_event", supabaseUrl), {
    method: "POST",
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      event_name: event.name,
      event_occurred_at: event.occurred_at,
      event_page_path: event.page_path,
      event_properties: event.properties,
    }),
  });

  if (!stored.ok) {
    return json(origin, stored.status >= 500 ? 503 : 400, { error: "event_rejected" });
  }
  return json(origin, 202, { accepted: true });
});
