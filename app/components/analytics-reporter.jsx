"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { observeAnalytics, track } from "../lib/analytics.js";

export function AnalyticsReporter() {
  const pathname = usePathname();
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    const stopObserving = process.env.NODE_ENV === "development"
      ? observeAnalytics((event) => console.info("[여백의 노트 분석]", event))
      : () => {};

    if (lastTrackedPath.current !== pathname) {
      lastTrackedPath.current = pathname;
      track("page_viewed");
    }
    return stopObserving;
  }, [pathname]);

  return null;
}
