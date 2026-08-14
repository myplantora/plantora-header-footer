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
    // Do not set global loading if cart is already open to allow background updates
    if (!get().isOpen) set({ isLoading: true });

    try {
      console.log(`[Add to Cart] Starting flow for variant: ${merchandiseId}`);
      // Step 1: Pre-fetch availability check
      const availabilityData = await storefrontFetch<any>(queries.CHECK_VARIANT_AVAILABILITY, { id: merchandiseId });
      const variant = availabilityData.node;
      
      console.log(
        `[Variant Check] ID: ${merchandiseId} | Available: ${variant?.availableForSale} | Qty: ${variant?.quantityAvailable ?? 'untracked'}`
      );

      if (!variant || !variant.availableForSale) {
        console.log(`[Add to Cart] Blocked — variant not available for sale: ${merchandiseId}`);
        toast.error("Out of Stock", {
          description: "This item is currently unavailable."
        });
        return false;
      }

      // NOTE: quantityAvailable is only exposed when the Storefront token has
      // `unauthenticated_read_product_inventory`. Without it Shopify returns 0
      // (not null), which previously blocked every add-to-cart. Only trust it
      // when it is a positive number; otherwise rely on availableForSale.
      const qty = typeof variant?.quantityAvailable === "number" ? variant.quantityAvailable : null;
      if (qty !== null && qty > 0 && qty < quantity) {
        console.log(`[Add to Cart] Blocked — insufficient stock. Requested: ${quantity} | Available: ${qty}`);
        toast.error("Insufficient Stock", {
          description: `Only ${qty} items available.`
        });
        return false;
      }


      // Recursive execution function for retries/recovery
      const executeAdd = async (retryCount = 0): Promise<boolean> => {
        let currentCartId = localStorage.getItem(LOCAL_STORAGE_KEY);

        // Ensure cart exists
        if (!currentCartId || currentCartId.includes('FAKE')) {
          const createData = await storefrontFetch<any>(queries.CART_CREATE, {
            input: {
              lines: [{ merchandiseId, quantity }],
              buyerIdentity: { countryCode: "US" }
            }
          });
          if (createData.cartCreate?.userErrors?.length) {
             throw new Error(createData.cartCreate.userErrors[0].message);
          }
          const cart = createData.cartCreate.cart;
          currentCartId = cart.id;
          localStorage.setItem(LOCAL_STORAGE_KEY, currentCartId!);
          
          console.log(
            `[Cart Created] Cart ID: ${cart.id} | Checkout URL: ${cart.checkoutUrl} | Total: ${cart.cost.totalAmount.amount} ${cart.cost.totalAmount.currencyCode}`
          );
          console.log(`[Checkout URL] ${cart.checkoutUrl}`);

          analytics.trackCartUpdated(cart, 'add_to_cart', { merchandiseId, quantity });
          set({ 
            ...deriveCartState(cart),
            isLoading: pendingOperations > 1, 
            isOpen: true 
          });
          return true;
        }

        // Add to cart
        const addData = await storefrontFetch<any>(queries.CART_LINES_ADD, {
          cartId: currentCartId,
          lines: [{ merchandiseId, quantity }]
        });

        const { cart, userErrors } = addData.cartLinesAdd || {};

        if (userErrors?.length) {
          const errorMsg = userErrors[0].message.toLowerCase();
          console.log(`[Cart Error] ${userErrors.map((e: any) => e.field + ': ' + e.message).join(' | ')}`);
          const isStale = STALE_ERRORS.some(e => errorMsg.includes(e));
          if (isStale && retryCount < 1) {
            get().clearCart();
            return executeAdd(retryCount + 1);
          }
          throw new Error(userErrors[0].message);
        }

        if (cart) {
          console.log(`[Cart Updated] Cart ID: ${cart.id} | Total lines: ${cart.lines?.edges?.length}`);
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
      // Capture exception for monitoring
      analytics.posthogService.captureException(e, { 
        context: "addToCart",
        merchandiseId,
        quantity
      });
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
    const { cart } = get();
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId || !cart) return;

    if (quantity < 1) {
      return get().removeLine(lineId);
    }

    // Save previous state for rollback
    const previousState = deriveCartState(cart);

    // Optimistic Update
    const optimisticLines = cart.lines.edges.map((edge: any) => {
      if (edge.node.id === lineId) {
        return {
          ...edge,
          node: { ...edge.node, quantity }
        };
      }
      return edge;
    });

    // Simple optimistic calculation for subtotal and total quantity
    const newTotalQuantity = optimisticLines.reduce((acc: number, edge: any) => acc + edge.node.quantity, 0);
    const optimisticCart = {
      ...cart,
      lines: { ...cart.lines, edges: optimisticLines },
      totalQuantity: newTotalQuantity
    };

    set(deriveCartState(optimisticCart));

    try {
      const data = await storefrontFetch<any>(queries.CART_LINES_UPDATE, {
        cartId,
        lines: [{ id: lineId, quantity }]
      });
      const { cart: updatedCart, userErrors } = data.cartLinesUpdate || {};

      if (userErrors?.length) {
        const errorMsg = userErrors[0].message.toLowerCase();
        if (errorMsg.includes("does not exist") || errorMsg.includes("conflict")) {
          console.log("[CartStore] Line update conflict or missing, refreshing cart state");
          await get().initCart();
          return;
        }
        throw new Error(userErrors[0].message);
      }

      if (updatedCart) {
        set(deriveCartState(updatedCart));
        analytics.trackCartUpdated(updatedCart, 'update_cart');
      }
    } catch (e: any) {
      console.error("[CartStore] Update failure:", e);
      analytics.posthogService.captureException(e, { 
        context: "updateLine",
        lineId,
        quantity,
        cartId
      });
      set(previousState);
      toast.error(e.message || "Failed to update quantity");
    }
  },

  removeLine: async (lineId: string) => {
    const { cart } = get();
    const cartId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cartId || !cart) return;

    // Verify line existence in current state to prevent stale deletions
    const lineExists = cart.lines?.edges?.some((edge: any) => edge.node.id === lineId);
    if (!lineExists) {
      console.warn("[CartStore] Attempted to remove non-existent line:", lineId);
      return;
    }

    // Save previous state for rollback
    const previousState = deriveCartState(cart);

    // Optimistic Update
    const optimisticLines = cart.lines.edges.filter((edge: any) => edge.node.id !== lineId);
    const newTotalQuantity = optimisticLines.reduce((acc: number, edge: any) => acc + edge.node.quantity, 0);
    
    const optimisticCart = {
      ...cart,
      lines: { ...cart.lines, edges: optimisticLines },
      totalQuantity: newTotalQuantity
    };

    set(deriveCartState(optimisticCart));

    try {
      const data = await storefrontFetch<any>(queries.CART_LINES_REMOVE, {
        cartId,
        lineIds: [lineId]
      });
      const { cart: updatedCart, userErrors } = data.cartLinesRemove || {};

      if (userErrors?.length) {
        const errorMsg = userErrors[0].message.toLowerCase();
        // If the line is already gone, consider it a success and just refresh
        if (errorMsg.includes("does not exist") || errorMsg.includes("conflict")) {
          console.log("[CartStore] Line already removed or conflict, refreshing cart state");
          await get().initCart();
          return;
        }
        throw new Error(userErrors[0].message);
      }

      if (updatedCart) {
        set(deriveCartState(updatedCart));
        analytics.trackCartUpdated(updatedCart, 'remove_from_cart');
      }
    } catch (e: any) {
      console.error("[CartStore] Remove failure:", e);
      // Capture exception for monitoring
      analytics.posthogService.captureException(e, { 
        context: "removeLine",
        lineId,
        cartId
      });
      set(previousState);
      toast.error(e.message || "Failed to remove item");
    }
  }
}));
