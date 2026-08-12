import { create } from "zustand";
import { storefrontFetch } from "@/lib/shopify";
import * as queries from "@/lib/cartQueries";
import * as analytics from "@/lib/analytics";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = 'plantora_cart_id';

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  handle: string;
  variantTitle: string;
  imageUrl: string | null;
  amount: number;
  compareAtAmount: number | null;
  currency: string;
  productType: string;
};

interface CartState {
  cart: any | null;
  isOpen: boolean;
  isLoading: boolean;
  
  // Getters for components
  cartId: string | null;
  lines: CartLine[];
  totalQuantity: number;
  subtotal: { amount: number; currency: string } | null;
  checkoutUrl: string | null;

  initCart: () => Promise<void>;
  hydrate: () => Promise<void>;
  addToCart: (merchandiseId: string, quantity: number) => Promise<boolean>;
  addLineAndOpen: (merchandiseId: string, quantity: number) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const STALE_ERRORS = [
  'cart not found', 
  'invalid cart', 
  'variable $cartid', 
  'does not exist', 
  'expired', 
  'fakeid',
  'throttled'
];

function mapCartLines(cart: any): CartLine[] {
  return (cart?.lines?.edges ?? []).map((edge: any) => ({
    id: edge.node.id,
    quantity: edge.node.quantity,
    merchandiseId: edge.node.merchandise.id,
    title: edge.node.merchandise.product.title,
    handle: edge.node.merchandise.product.handle,
    variantTitle: edge.node.merchandise.title,
    imageUrl: edge.node.merchandise.product.featuredImage?.url ?? null,
    amount: Number(edge.node.merchandise.price.amount),
    compareAtAmount: edge.node.merchandise.compareAtPrice?.amount
      ? Number(edge.node.merchandise.compareAtPrice.amount)
      : null,
    currency: edge.node.merchandise.price.currencyCode,
    productType: edge.node.merchandise.product.productType,
  }));
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  // Computed values
  get cartId() { return get().cart?.id || null; },
  get lines() { return mapCartLines(get().cart); },
  get totalQuantity() { return get().cart?.totalQuantity || 0; },
  get subtotal() { 
    const amount = get().cart?.cost?.subtotalAmount;
    return amount ? { amount: Number(amount.amount), currency: amount.currencyCode } : null;
  },
  get checkoutUrl() { return get().cart?.checkoutUrl || null; },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  clearCart: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({ cart: null });
  },

  hydrate: async () => get().initCart(),

  initCart: async () => {
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId || cartId.includes('FAKE')) {
      get().clearCart();
      return;
    }

    try {
      const data = await storefrontFetch<any>(queries.GET_CART, { cartId });
      if (data.cart) {
        set({ cart: data.cart });
      } else {
        get().clearCart();
      }
    } catch (e: any) {
      const errorMsg = e.message?.toLowerCase() || '';
      if (STALE_ERRORS.some(err => errorMsg.includes(err))) {
        get().clearCart();
      }
    }
  },

  addLineAndOpen: async (merchandiseId: string, quantity: number) => {
    const ok = await get().addToCart(merchandiseId, quantity);
    if (ok) set({ isOpen: true });
    return ok;
  },

  addToCart: async (merchandiseId: string, quantity: number) => {
    set({ isLoading: true });

    try {
      // STEP 1: Strict availability check
      const availabilityData = await storefrontFetch<any>(queries.CHECK_VARIANT_AVAILABILITY, { id: merchandiseId });
      const variant = availabilityData.node;
      
      if (!variant || !variant.availableForSale) {
        toast.error("Out of Stock", {
          description: "This item is currently unavailable."
        });
        return false;
      }

      const executeAdd = async (retryCount = 0): Promise<boolean> => {
        let currentCartId = localStorage.getItem(LOCAL_STORAGE_KEY);

        // STEP 2: Ensure a valid cart exists (Empty first flow - Shopify Recommended)
        if (!currentCartId || currentCartId.includes('FAKE')) {
          console.log("[CartStore] Creating fresh empty cart...");
          const createData = await storefrontFetch<any>(queries.CART_CREATE);
          if (createData.cartCreate?.userErrors?.length) {
             throw new Error(createData.cartCreate.userErrors[0].message);
          }
          currentCartId = createData.cartCreate.cart.id;
          localStorage.setItem(LOCAL_STORAGE_KEY, currentCartId!);
          
          // Shopify documentation recommends this two-step flow.
          // We add a short delay to ensure the new cart is indexed before adding lines.
          await new Promise(r => setTimeout(r, 600));
        }

        // STEP 3: Add lines separately
        const addData = await storefrontFetch<any>(queries.CART_LINES_ADD, {
          cartId: currentCartId,
          lines: [{ merchandiseId, quantity }]
        });

        const { cart, userErrors, warnings } = addData.cartLinesAdd || {};

        // STEP 4: Handle user errors (stale ID recovery)
        if (userErrors?.length) {
          const errorMsg = userErrors[0].message.toLowerCase();
          const isStale = STALE_ERRORS.some(e => errorMsg.includes(e));

          if (isStale && retryCount < 1) {
            get().clearCart();
            return executeAdd(retryCount + 1);
          }
          throw new Error(userErrors[0].message);
        }

        // STEP 5: Handle warnings and cache lag
        const lineInCart = cart?.lines?.edges?.find((e: any) => 
          e.node.merchandise.id === merchandiseId && e.node.quantity > 0
        );

        // OOS Warning or 0 quantity success (cache lag)
        if ((!lineInCart || warnings?.some((w: any) => w.code === 'MERCHANDISE_OUT_OF_STOCK')) && retryCount < 2) {
          console.log(`[CartStore] Cart consistency check failed (retry ${retryCount + 1}). Retrying immediately.`);
          return executeAdd(retryCount + 1);
        }

        if (cart) {
          // Sync state and fire analytics
          set({ cart });
          analytics.trackCartUpdated(cart, 'add_to_cart', { merchandiseId, quantity });
          
          // Force a final re-fetch of the cart to ensure state is absolutely current with Shopify's edge
          // This fixes the "0 items" issue in the drawer immediately after addition
          const finalSync = await storefrontFetch<any>(queries.GET_CART, { cartId: currentCartId });
          if (finalSync.cart) {
            set({ cart: finalSync.cart });
          }

          return true;
        }

        return false;
      };

      return await executeAdd();
    } catch (e: any) {
      console.error("[CartStore] Add to cart failure:", e);
      const errorMsg = e.message?.toLowerCase() || '';
      if (STALE_ERRORS.some(err => errorMsg.includes(err))) {
        get().clearCart();
      }
      toast.error("Shopping cart error", {
        description: "Please try adding the item again."
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateLine: async (lineId: string, quantity: number) => {
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId) return;

    set({ isLoading: true });
    try {
      const data = await storefrontFetch<any>(queries.CART_LINES_UPDATE, {
        cartId,
        lines: [{ id: lineId, quantity }]
      });
      const { cart, userErrors } = data.cartLinesUpdate || {};
      if (userErrors?.length) throw new Error(userErrors[0].message);
      if (cart) {
        set({ cart });
        analytics.trackCartUpdated(cart, 'update_cart');
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update quantity");
    } finally {
      set({ isLoading: false });
    }
  },

  removeLine: async (lineId: string) => {
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId) return;

    set({ isLoading: true });
    try {
      const data = await storefrontFetch<any>(queries.CART_LINES_REMOVE, {
        cartId,
        lineIds: [lineId]
      });
      const { cart, userErrors } = data.cartLinesRemove || {};
      if (userErrors?.length) throw new Error(userErrors[0].message);
      if (cart) {
        set({ cart });
        analytics.trackCartUpdated(cart, 'remove_from_cart');
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to remove item");
    } finally {
      set({ isLoading: false });
    }
  }
}));
