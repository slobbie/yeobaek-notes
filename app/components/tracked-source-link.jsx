"use client";

import { getSourceHost, track } from "../lib/analytics.js";

export function TrackedSourceLink({ href, postSlug, children }) {
  return <a
    href={href}
    target="_blank"
    rel="noreferrer"
    onClick={() => track("source_opened", {
      post_slug: postSlug,
      source_host: getSourceHost(href),
    })}
  >{children}<span className="sr-only">(새 창)</span></a>;
}
