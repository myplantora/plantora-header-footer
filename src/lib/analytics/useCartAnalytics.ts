import { useEffect, useRef } from "react";
import { sendCartUpdated } from "@/lib/analytics/cartEvents";

const DEBOUNCE_MS = 300;

export type CartAnalyticsInput = {
  id: string | null;
  /** Total quantity across all line items. */
  totalQuantity: number;
  /** Cart cost in store currency. */
  totalPrice: number | null;
};

/**
 * Fires `cart_updated` whenever the cart contents actually change.
 *
 * - Skips the initial mount (initial cart fetch/hydration is not a mutation).
 * - Coalesces rapid changes (quantity stepper spam) into one event via a 300ms
 *   debounce.
 * - Uses a ref signature of the previous cart so re-renders with identical
 *   cart state never emit duplicates.
 */
export function useCartAnalytics(cart: CartAnalyticsInput) {
  const signature = `${cart.id ?? ""}|${cart.totalQuantity}|${cart.totalPrice ?? 0}`;
  const prevSignature = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // First run = mount / initial fetch. Record and bail.
    if (prevSignature.current === null) {
      prevSignature.current = signature;
      return;
    }
    if (prevSignature.current === signature) return;
    prevSignature.current = signature;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      sendCartUpdated({
        cartId: cart.id,
        lineItemsCount: cart.totalQuantity,
        totalPrice: (cart.totalPrice ?? 0).toFixed(2),
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
}
