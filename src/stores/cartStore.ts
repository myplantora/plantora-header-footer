import { create } from "zustand";
import { storefrontFetch } from "@/lib/shopify";
import * as queries from "@/lib/cartQueries";
import * as analytics from "@/lib/analytics";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = 'plantora_cart_id';

interface CartState {
  cart: any | null;
  isOpen: boolean;
  isLoading: boolean;
  initCart: () => Promise<void>;
  addToCart: (merchandiseId: string, quantity: number) => Promise<boolean>;
  updateCartLine: (lineId: string, quantity: number) => Promise<void>;
  removeCartLine: (lineId: string) => Promise<void>;
  getCart: () => any | null;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const STALE_ERRORS = ['cart not found', 'invalid cart', 'variable $cartid', 'does not exist', 'expired'];

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getCart: () => get().cart,

  clearCart: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({ cart: null });
  },

  initCart: async () => {
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId) return;

    try {
      const data = await storefrontFetch<any>(queries.GET_CART, { cartId });
      if (data.cart) {
        set({ cart: data.cart });
      } else {
        get().clearCart();
      }
    } catch (e) {
      get().clearCart();
    }
  },

  addToCart: async (merchandiseId: string, quantity: number) => {
    set({ isLoading: true });

    try {
      // STEP 1: Check availability
      const availabilityData = await storefrontFetch<any>(queries.CHECK_VARIANT_AVAILABILITY, { id: merchandiseId });
      const variant = availabilityData.node;
      if (!variant || !variant.availableForSale || variant.quantityAvailable === 0) {
        toast.error("Out of Stock");
        return false;
      }

      const executeAdd = async (retry = false): Promise<boolean> => {
        let cartId = localStorage.getItem(LOCAL_STORAGE_KEY);

        // STEP 2: Get or create cart
        if (!cartId) {
          const createData = await storefrontFetch<any>(queries.CART_CREATE);
          if (createData.cartCreate?.userErrors?.length) {
             throw new Error(createData.cartCreate.userErrors[0].message);
          }
          cartId = createData.cartCreate.cart.id;
          localStorage.setItem(LOCAL_STORAGE_KEY, cartId!);
          await new Promise(r => setTimeout(r, 500));
        }

        // STEP 3: Add lines
        const addData = await storefrontFetch<any>(queries.CART_LINES_ADD, {
          cartId,
          lines: [{ merchandiseId, quantity }]
        });

        const { cart, userErrors, warnings } = addData.cartLinesAdd || {};

        // STEP 4: Handle response
        if (userErrors?.length) {
          const errorMsg = userErrors[0].message.toLowerCase();
          const isStale = STALE_ERRORS.some(e => errorMsg.includes(e));

          if (isStale && !retry) {
            get().clearCart();
            return executeAdd(true);
          }
          throw new Error(userErrors[0].message);
        }

        if (warnings?.some((w: any) => w.code === 'MERCHANDISE_OUT_OF_STOCK')) {
          if (!retry) {
            get().clearCart();
            await new Promise(r => setTimeout(r, 1500));
            return executeAdd(true);
          }
        }

        if (cart) {
          set({ cart, isOpen: true });
          analytics.trackCartUpdated(cart, 'add_to_cart', { merchandiseId, quantity });
          return true;
        }

        return false;
      };

      return await executeAdd();
    } catch (e: any) {
      console.error("[CartStore] Error adding to cart:", e);
      toast.error("Something went wrong, please try again");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartLine: async (lineId: string, quantity: number) => {
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

  removeCartLine: async (lineId: string) => {
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
