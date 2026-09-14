"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { observeAnalytics, sendAnalyticsEvent, track } from "../lib/analytics.js";

export function AnalyticsReporter({ endpoint }) {
  const pathname = usePathname();
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    const stopObserving = observeAnalytics((event) => {
      if (process.env.NODE_ENV === "development") console.info("[여백의 노트 분석]", event);
      void sendAnalyticsEvent(endpoint, event).catch(() => {});
    });

    if (lastTrackedPath.current !== pathname) {
      lastTrackedPath.current = pathname;
      try {
        track("page_viewed");
      } catch {
        // 공개 계약 밖의 404 경로는 저장하지 않는다.
      }
    }
    return stopObserving;
  }, [endpoint, pathname]);

  return null;
}
