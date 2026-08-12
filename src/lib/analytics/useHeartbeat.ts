import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  getLastPageViewExtras,
  sendShopifyPageView,
} from "@/services/shopify/analytics";

const HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * Keeps the visitor's session alive in Shopify Live View by re-emitting the
 * current page's `page_viewed` event every 15s while the tab is visible.
 *
 * - Never fires on mount (the route-change page view already did that).
 * - Pauses while `document.visibilityState === "hidden"`, and resets the
 *   15s clock the moment the tab becomes visible again.
 * - Restarts cleanly on every SPA route change — no duplicate intervals.
 * - Fire-and-forget: never awaited, never throws, never blocks rendering.
 */
export function useHeartbeat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    let timer: ReturnType<typeof setInterval> | undefined;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const tick = () => {
      if (attempts >= MAX_ATTEMPTS) {
        stop();
        console.warn("[Analytics] Heartbeat max attempts reached (likely blocked), stopping.");
        return;
      }
      
      try {
        attempts++;
        void sendShopifyPageView({
          ...getLastPageViewExtras(),
          url: window.location.href,
        });
      } catch {
        /* heartbeat must never throw */
      }
    };

    const stop = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const start = () => {
      stop();
      attempts = 0; // Reset attempts when starting/resuming
      timer = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [pathname, search]);
}
