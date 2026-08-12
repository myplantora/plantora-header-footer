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
  
  // Flattened state to avoid unstable getters
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
  if (!cart) return [];
  const edges = cart.lines?.edges || [];
  return edges.map((edge: any) => {
    const node = edge.node;
    if (!node) return null;
    const merchandise = node.merchandise;
    const product = merchandise?.product;
    
    return {
      id: node.id,
      quantity: node.quantity,
      merchandiseId: merchandise?.id || '',
      title: product?.title || merchandise?.title || 'Unknown Product',
      handle: product?.handle || '',
      variantTitle: merchandise?.title || 'Default Title',
      imageUrl: product?.featuredImage?.url || merchandise?.image?.url || null,
      amount: Number(merchandise?.price?.amount || 0),
      compareAtAmount: merchandise?.compareAtPrice?.amount
        ? Number(merchandise.compareAtPrice.amount)
        : null,
      currency: merchandise?.price?.currencyCode || 'USD',
      productType: product?.productType || '',
    };
  }).filter(Boolean) as CartLine[];
}

function deriveCartState(cart: any) {
  const subtotalAmount = cart?.cost?.subtotalAmount;
  return {
    cart,
    cartId: cart?.id || null,
    lines: mapCartLines(cart),
    totalQuantity: cart?.totalQuantity || 0,
    subtotal: subtotalAmount ? { amount: Number(subtotalAmount.amount), currency: subtotalAmount.currencyCode } : null,
    checkoutUrl: cart?.checkoutUrl || null
  };
}

let pendingOperations = 0;

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  cartId: null,
  lines: [],
  totalQuantity: 0,
  subtotal: null,
  checkoutUrl: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  clearCart: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({ 
      cart: null,
      cartId: null,
      lines: [],
      totalQuantity: 0,
      subtotal: null,
      checkoutUrl: null
    });
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
        set(deriveCartState(data.cart));
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
    return await get().addToCart(merchandiseId, quantity);
  },

  addToCart: async (merchandiseId: string, quantity: number) => {
    pendingOperations++;
    if (!get().isOpen) set({ isLoading: true });

    try {
      // Step 1: Pre-fetch availability check
      const availabilityData = await storefrontFetch<any>(queries.CHECK_VARIANT_AVAILABILITY, { id: merchandiseId });
      const variant = availabilityData.node;
      
      if (!variant || !variant.availableForSale) {
        toast.error("Out of Stock", {
          description: "This item is currently unavailable."
        });
        return false;
      }

      // Recursive execution function for retries/recovery
      const executeAdd = async (retryCount = 0): Promise<boolean> => {
        let currentCartId = localStorage.getItem(LOCAL_STORAGE_KEY);

        // Ensure cart exists
        if (!currentCartId || currentCartId.includes('FAKE')) {
          const createData = await storefrontFetch<any>(queries.CART_CREATE);
          if (createData.cartCreate?.userErrors?.length) {
             throw new Error(createData.cartCreate.userErrors[0].message);
          }
          currentCartId = createData.cartCreate.cart.id;
          localStorage.setItem(LOCAL_STORAGE_KEY, currentCartId!);
        }

        // Add to cart
        const addData = await storefrontFetch<any>(queries.CART_LINES_ADD, {
          cartId: currentCartId,
          lines: [{ merchandiseId, quantity }]
        });

        const { cart, userErrors } = addData.cartLinesAdd || {};

        if (userErrors?.length) {
          const errorMsg = userErrors[0].message.toLowerCase();
          const isStale = STALE_ERRORS.some(e => errorMsg.includes(e));
          if (isStale && retryCount < 1) {
            get().clearCart();
            return executeAdd(retryCount + 1);
          }
          throw new Error(userErrors[0].message);
        }

        if (cart) {
          analytics.trackCartUpdated(cart, 'add_to_cart', { merchandiseId, quantity });
          // Force shallow clone for immediate reactivity
          set({ 
            ...deriveCartState(cart),
            isLoading: pendingOperations > 1, 
            isOpen: true 
          });
          return true;
        }

        return false;
      };

      return await executeAdd();
    } catch (e: any) {
      console.error("[CartStore] Add to cart failure:", e);
      toast.error("Shopping cart error", { description: "Please try again." });
      return false;
    } finally {
      pendingOperations--;
      if (pendingOperations <= 0) {
        set({ isLoading: false });
      }
    }
  },

  updateLine: async (lineId: string, quantity: number) => {
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId) return;
    pendingOperations++;
    set({ isLoading: true });
    try {
      const data = await storefrontFetch<any>(queries.CART_LINES_UPDATE, {
        cartId,
        lines: [{ id: lineId, quantity }]
      });
      const { cart, userErrors } = data.cartLinesUpdate || {};
      if (userErrors?.length) throw new Error(userErrors[0].message);
      if (cart) {
        set({ ...deriveCartState(cart) });
        analytics.trackCartUpdated(cart, 'update_cart');
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update quantity");
    } finally {
      pendingOperations--;
      if (pendingOperations <= 0) set({ isLoading: false });
    }
  },

  removeLine: async (lineId: string) => {
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId) return;
    pendingOperations++;
    set({ isLoading: true });
    try {
      const data = await storefrontFetch<any>(queries.CART_LINES_REMOVE, {
        cartId,
        lineIds: [lineId]
      });
      const { cart, userErrors } = data.cartLinesRemove || {};
      if (userErrors?.length) throw new Error(userErrors[0].message);
      if (cart) {
        set({ ...deriveCartState(cart) });
        analytics.trackCartUpdated(cart, 'remove_from_cart');
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to remove item");
    } finally {
      pendingOperations--;
      if (pendingOperations <= 0) set({ isLoading: false });
    }
  }
}));
