import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { initGoogleAnalytics, trackGooglePageView } from "@/lib/analytics/google";

/**
 * Component to initialize and track page views for Google Analytics
 * This should be rendered once in the root route.
 */
export function GoogleAnalyticsProvider() {
  const routerState = useRouterState();

  useEffect(() => {
    // Initialize script on mount
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackGooglePageView(routerState.location.pathname);
  }, [routerState.location.pathname]);

  return null;
}
