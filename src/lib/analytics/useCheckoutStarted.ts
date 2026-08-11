import { useCallback, useRef } from "react";
import { sendCheckoutStarted } from "@/lib/analytics/cartEvents";
import { useCartStore } from "@/stores/cartStore";

/**
 * Section 1 — Schema confirmation
 * -------------------------------
 * There is no dedicated `checkout_started` schema on the Monorail
 * `v1/produce` edge for headless storefronts. Shopify's own storefront
 * trekkie bundle emits checkout intent on the SAME schema it uses for all
 * non-page-view storefront customer activity:
 *
 *   custom_storefront_customer_tracking/1.2
 *
 * distinguished by `event_name: "checkout_started"`. (The `shopify_pay_*`
 * and `checkout_one_*` schemas belong to Shopify-hosted checkout and are
 * rejected / ignored when emitted from a headless origin.)
 */

type NavigateFn = (url: string) => void;

const defaultNavigate: NavigateFn = (url) => window.location.assign(url);

/**
 * Returns `handleCheckout(checkoutUrl, navigate?)`.
 *
 * - Empty-cart guard: no event, no navigation.
 * - Duplicate guard: a `useRef` flag blocks double-clicks / re-render fires,
 *   released after 1s.
 * - Fire-and-forget: the Monorail fetch is never awaited (`keepalive: true`
 *   inside the transport keeps it alive across unload).
 * - Navigates immediately after dispatching the event.
 */
export function useCheckoutStarted() {
  const inFlight = useRef(false);

  return useCallback((checkoutUrl: string | null | undefined, navigate: NavigateFn = defaultNavigate) => {
    if (typeof window === "undefined") return;
    if (!checkoutUrl || checkoutUrl === "#") return;

    const { cartId, totalQuantity, subtotal } = useCartStore.getState();

    // Empty-cart guard.
    if (!totalQuantity || totalQuantity <= 0) return;

    // Duplicate-fire guard (double clicks, re-renders).
    if (inFlight.current) return;
    inFlight.current = true;
    window.setTimeout(() => {
      inFlight.current = false;
    }, 1000);

    sendCheckoutStarted({
      cartId,
      lineItemsCount: totalQuantity,
      totalPrice: Number(subtotal?.amount ?? 0).toFixed(2),
      currency: subtotal?.currency,
    });

    navigate(checkoutUrl);
  }, []);
}
