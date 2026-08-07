import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { initMetaPixel, trackMetaPageView } from '../lib/analytics/meta.events';
import { isMetaEnabled } from '../lib/analytics/meta.helpers';

/**
 * Global provider for Meta Pixel tracking
 * Handles initialization and PageView tracking on route changes
 */
export function MetaPixelProvider() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  useEffect(() => {
    if (!isMetaEnabled()) return;

    // Initialize on mount
    initMetaPixel();
    
    // Initial PageView (Meta snippet usually handles first one, but SPA needs care)
    // We delay slightly to ensure DOM is ready for title/url capture
    const timer = setTimeout(() => {
      trackMetaPageView();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Track PageView on route changes
  useEffect(() => {
    if (!isMetaEnabled()) return;
    
    // Skip the very first PageView which is handled by the initial mount effect
    // to prevent duplicate fires on load.
    if (window._fbq && window.fbq.loaded) {
      trackMetaPageView();
    }
  }, [pathname]);

  return null;
}
