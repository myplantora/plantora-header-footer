import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storefrontApiRequest } from "@/services/shopify/client";
import { toast } from "sonner";

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

export type CartDiscountCode = { code: string; applicable: boolean };

type CartState = {
  cartId: string | null;
  checkoutUrl: string | null;
  lines: CartLine[];
  totalQuantity: number;
  subtotal: { amount: number; currency: string } | null;
  discountCodes: CartDiscountCode[];
  isOpen: boolean;
  isLoading: boolean;
  isDiscountLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  handleAddToCart: (
    variantGid: string,
    options?: { quantity?: number; availableForSale?: boolean; quantityAvailable?: number | null },
  ) => Promise<boolean>;
  addLine: (
    merchandiseId: string,
    quantity?: number,
    variant?: { availableForSale?: boolean; quantityAvailable?: number | null },
  ) => Promise<boolean>;
  addLineAndOpen: (
    merchandiseId: string,
    quantity?: number,
    variant?: { availableForSale?: boolean; quantityAvailable?: number | null },
  ) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  setDiscountCodes: (codes: string[]) => Promise<boolean>;
  hydrate: () => Promise<void>;
};

const CART_LINE_FRAGMENT = `
  fragment CartLineFragment on CartLine {
    id
    quantity
    merchandise {
      ... on ProductVariant {
        id
        title
        availableForSale
        quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        product {
          id
          title
          productType
          handle
          featuredImage { url altText }
        }
      }
    }
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
  }
`;

const CART_FRAGMENT = `
  ${CART_LINE_FRAGMENT}
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 50) {
      edges { node { ...CartLineFragment } }
    }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    discountCodes { code applicable }
  }
`;

const CART_CREATE = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...CartFragment }
      userErrors { field message }
      warnings { code message target }
    }
  }
`;

const CART_LINES_ADD = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
      warnings { code message target }
    }
  }
`;

const CART_LINES_UPDATE = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
      warnings { code message target }
    }
  }
`;

const CART_LINES_REMOVE = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

const CART_DISCOUNT_CODES_UPDATE = `
  ${CART_FRAGMENT}
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFragment }
  }
`;

// Errors that mean our persisted cart/line reference is stale (common in
// Safari/Brave/mobile where storage survives longer than the Shopify cart).
function isStaleReferenceError(errors: any[] | undefined) {
  return Boolean(
    errors?.some((e) => {
      const msg = String(e?.message || "").toLowerCase();
      return (
        msg.includes("does not exist") ||
        msg.includes("not found") ||
        msg.includes("invalid id") ||
        msg.includes("merchandise line")
      );
    }),
  );
}

function handleUserErrors(errors: any[] | undefined) {
  if (errors?.length) {
    if (isStaleReferenceError(errors)) return true; // handled by recovery, don't toast
    errors.forEach(err => {
      toast.error(err.message || "Something went wrong with the cart");
    });
    return true;
  }
  return false;
}

function hasOutOfStockWarning(warnings: any[] | undefined): boolean {
  return Boolean(warnings?.some((warning) => warning?.code === "MERCHANDISE_OUT_OF_STOCK"));
}

function readPersistedCartId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("plantora-cart");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { state?: { cartId?: string | null } };
    const cartId = parsed?.state?.cartId;
    return typeof cartId === "string" && cartId.length > 0 ? cartId : null;
  } catch {
    return null;
  }
}


function notifyWarnings(warnings: any[] | undefined, lines: any[], _added = true) {
  if (!warnings?.length) return;

  const realWarnings = warnings.filter((w) => {
    if (w?.code !== "MERCHANDISE_OUT_OF_STOCK") return true;

    const targetId = w.target;
    const line = lines.find(
      (l) => l.node.id === targetId || l.node.merchandise.id === targetId,
    );
    const merchandise = line?.node?.merchandise;

    // Suppress only when Shopify inventory confirms the item is truly sold out.
    if (merchandise?.availableForSale === false && merchandise?.quantityAvailable === 0) {
      console.warn("[Cart] Suppressed out-of-stock warning", w);
      return false;
    }

    return true;
  });

  if (realWarnings.length) {
    toast.error("Item is low or out of stock", {
      description: realWarnings.map((w) => w.message).join(" "),
      position: "top-center",
    });
  }
}


function mapCart(cart: any) {
  if (!cart) return null;
  
  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.cost?.subtotalAmount
      ? {
          amount: Number(cart.cost.subtotalAmount.amount),
          currency: cart.cost.subtotalAmount.currencyCode,
        }
      : null,
    discountCodes: (cart.discountCodes ?? []).map((d: any) => ({
      code: String(d.code),
      applicable: Boolean(d.applicable),
    })) as CartDiscountCode[],
    lines: (cart.lines?.edges ?? [])
      .filter((edge: any) => Number(edge?.node?.quantity) > 0)
      .map((edge: any) => ({
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
      })) as CartLine[],
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      checkoutUrl: null,
      lines: [],
      totalQuantity: 0,
      subtotal: null,
      discountCodes: [],
      isOpen: false,
      isLoading: false,
      isDiscountLoading: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      handleAddToCart: async (variantGid, options) => {
        const quantity = options?.quantity ?? 1;

        if (!variantGid || quantity <= 0) return false;
        if (options?.availableForSale === false || options?.quantityAvailable === 0) {
          toast.error("Out of stock");
          return false;
        }

        set({ isLoading: true });
        try {
          const createCart = async () => {
            const data = await storefrontApiRequest<any>(CART_CREATE, {
              input: { lines: [{ merchandiseId: variantGid, quantity }] },
            });
            return data?.data?.cartCreate;
          };

          const activeCartId = get().cartId ?? readPersistedCartId();
          let result;

          if (activeCartId) {
            const data = await storefrontApiRequest<any>(CART_LINES_ADD, {
              cartId: activeCartId,
              lines: [{ merchandiseId: variantGid, quantity }],
            });
            result = data?.data?.cartLinesAdd;

            if (!result?.cart || isStaleReferenceError(result?.userErrors)) {
              console.warn("[Cart] Stale cart detected, recreating", result?.userErrors);
              set({ cartId: null, checkoutUrl: null, lines: [], totalQuantity: 0, subtotal: null, discountCodes: [] });
              result = await createCart();
            }
          } else {
            result = await createCart();
          }

          const lineAdded = (r: any) =>
            (mapCart(r?.cart)?.lines ?? []).some(
              (line) => line.merchandiseId === variantGid && line.quantity > 0,
            );

          if (activeCartId && !lineAdded(result)) {
            console.warn("[Cart] Line rejected on existing cart, retrying with a fresh cart");
            set({ cartId: null, checkoutUrl: null, lines: [], totalQuantity: 0, subtotal: null, discountCodes: [] });
            const retry = await createCart();
            if (retry?.cart) result = retry;
          }

          if (hasOutOfStockWarning(result?.warnings)) {
            toast.error("Out of stock", {
              description: result?.warnings
                ?.filter((w: any) => w?.code === "MERCHANDISE_OUT_OF_STOCK")
                .map((w: any) => w?.message)
                .filter(Boolean)
                .join(" "),
            });
            return false;
          }

          if (handleUserErrors(result?.userErrors)) return false;
          notifyWarnings(result?.warnings, result?.cart?.lines?.edges ?? [], lineAdded(result));

          const mapped = mapCart(result?.cart);
          if (mapped) set(mapped);
          if (mapped && lineAdded(result)) return true;
          return false;
        } catch (e) {
          toast.error("Something went wrong, please try again");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      hydrate: async () => {
        const cartId = get().cartId;
        if (!cartId) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<any>(CART_QUERY, { cartId });
          const cart = data?.data?.cart;
          if (cart) {
            set(mapCart(cart)!);
          } else {
            // Cart expired
            set({ cartId: null, checkoutUrl: null, lines: [], totalQuantity: 0, subtotal: null, discountCodes: [] });
          }
        } catch (e) {
          console.error("Hydration error", e);
        } finally {
          set({ isLoading: false });
        }
      },

      setDiscountCodes: async (codes) => {
        const cartId = get().cartId;
        if (!cartId) return false;
        set({ isDiscountLoading: true });
        try {
          const data = await storefrontApiRequest<any>(CART_DISCOUNT_CODES_UPDATE, {
            cartId,
            discountCodes: codes,
          });
          const result = data?.data?.cartDiscountCodesUpdate;
          handleUserErrors(result?.userErrors);
          
          const cart = result?.cart;
          if (!cart) return false;
          
          const mapped = mapCart(cart)!;
          set(mapped);
          
          if (codes.length === 0) return true;
          
          const isValid = mapped.discountCodes.some(
            d => d.applicable && codes.includes(d.code)
          );
          
          if (!isValid && codes.length > 0) {
            toast.error("Invalid or expired discount code.");
          }
          
          return isValid;
        } catch (e) {
          toast.error("Something went wrong, please try again");
          return false;
        } finally {
          set({ isDiscountLoading: false });
        }
      },

      addLine: async (merchandiseId, quantity = 1, variant) => {
        return get().handleAddToCart(merchandiseId, {
          quantity,
          availableForSale: variant?.availableForSale,
          quantityAvailable: variant?.quantityAvailable,
        });
      },

      addLineAndOpen: async (merchandiseId, quantity = 1, variant) => {
        const success = await get().addLine(merchandiseId, quantity, variant);
        if (success) {
          set({ isOpen: true });
        }
        return success;
      },

      updateLine: async (lineId, quantity) => {
        const cartId = get().cartId;
        if (!cartId) return;
        if (quantity <= 0) return get().removeLine(lineId);

        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<any>(CART_LINES_UPDATE, {
            cartId,
            lines: [{ id: lineId, quantity }]
          });
          const result = data?.data?.cartLinesUpdate;
          if (!result?.cart || isStaleReferenceError(result?.userErrors)) {
            console.warn("[Cart] Stale line on update, resyncing", result?.userErrors);
            set({ isLoading: false });
            await get().hydrate();
            return;
          }
          handleUserErrors(result?.userErrors);
          notifyWarnings(result?.warnings, result?.cart?.lines?.edges ?? []);
          
          const mapped = mapCart(result?.cart);
          if (mapped) set(mapped);
        } catch (e) {
          toast.error("Something went wrong, please try again");
        } finally {
          set({ isLoading: false });
        }
      },

      removeLine: async (lineId) => {
        const cartId = get().cartId;
        if (!cartId) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<any>(CART_LINES_REMOVE, {
            cartId,
            lineIds: [lineId]
          });
          const result = data?.data?.cartLinesRemove;
          if (!result?.cart || isStaleReferenceError(result?.userErrors)) {
            console.warn("[Cart] Stale line on remove, resyncing", result?.userErrors);
            set({ isLoading: false });
            await get().hydrate();
            return;
          }
          handleUserErrors(result?.userErrors);
          
          const mapped = mapCart(result?.cart);
          if (mapped) set(mapped);
        } catch (e) {
          toast.error("Something went wrong, please try again");
        } finally {
          set({ isLoading: false });
        }
      },

    }),
    {
      name: "plantora-cart",
      partialize: (state) => ({ cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    },
  ),
);

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__CART_STORE__ = useCartStore;
}
