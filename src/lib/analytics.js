/** Vendor-neutral event contract for the eventual analytics pipeline. */
export function track(name, properties = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("blog:analytics", { detail: {
    name, properties, occurred_at: new Date().toISOString(), page_path: window.location.pathname,
  } }));
}
