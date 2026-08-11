import { useEffect, useRef } from "react";
import { sendCartViewed } from "@/lib/analytics/cartEvents";

export type CartViewedInput = {
  id: string | null;
  totalQuantity: number;
};

/**
 * Fires `cart_viewed` on a false -> true transition of the drawer open state
 * (or once when the /cart page mounts with `isOpen` passed as `true`).
 *
 * - Never fires for an empty cart (`totalQuantity === 0`).
 * - Guarded with a ref so re-renders while the drawer stays open cannot emit
 *   duplicate events; the guard resets when the drawer closes.
 */
export function useCartViewed(isOpen: boolean, cart: CartViewedInput) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isOpen) {
      hasFired.current = false;
      return;
    }
    if (hasFired.current) return;
    if (cart.totalQuantity === 0) return; // empty-cart guard, retry when items load

    hasFired.current = true;
    sendCartViewed({ cartId: cart.id, lineItemsCount: cart.totalQuantity });
  }, [isOpen, cart.id, cart.totalQuantity]);
}
