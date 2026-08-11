import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storefrontApiRequest } from "@/services/shopify/client";
import { triggerHaptic } from "@/utils/haptics";

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
  addLine: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  setDiscountCodes: (codes: string[]) => Promise<boolean>;
  hydrate: () => Promise<void>;

};

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    discountCodes { code applicable }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              image { url altText }
              price { amount currencyCode }
              product { title handle }
            }
          }
        }
      }
    }
  }
`;


const CART_CREATE = `${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFields }
      userErrors { message }
    }
  }`;

const CART_LINES_ADD = `${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { message }
    }
  }`;

const CART_LINES_UPDATE = `${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { message }
    }
  }`;

const CART_LINES_REMOVE = `${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { message }
    }
  }`;

const CART_DISCOUNT_CODES_UPDATE = `${CART_FRAGMENT}
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { ...CartFields }
      userErrors { message }
    }
  }`;

const CART_QUERY = `${CART_FRAGMENT}
  query Cart($id: ID!) {
    cart(id: $id) { ...CartFields }
  }`;

function mapCart(cart: any) {
  return {
    cartId: cart?.id ?? null,
    checkoutUrl: cart?.checkoutUrl ?? null,
    totalQuantity: cart?.totalQuantity ?? 0,
    subtotal: cart?.cost?.subtotalAmount
      ? {
          amount: Number(cart.cost.subtotalAmount.amount),
          currency: cart.cost.subtotalAmount.currencyCode,
        }
      : null,
    discountCodes: (cart?.discountCodes ?? []).map((d: any) => ({
      code: String(d.code),
      applicable: Boolean(d.applicable),
    })) as CartDiscountCode[],
    lines: (cart?.lines?.edges ?? []).map((edge: any) => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      merchandiseId: edge.node.merchandise?.id,
      title: edge.node.merchandise?.product?.title ?? "",
      handle: edge.node.merchandise?.product?.handle ?? "",
      variantTitle: edge.node.merchandise?.title ?? "",
      imageUrl: edge.node.merchandise?.image?.url ?? null,
      amount: Number(edge.node.merchandise?.price?.amount ?? 0),
      currency: edge.node.merchandise?.price?.currencyCode ?? "USD",
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

      hydrate: async () => {
        const cartId = get().cartId;
        if (!cartId || get().isLoading) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<any>(CART_QUERY, { id: cartId });
          const cart = data?.data?.cart;
          if (cart) set(mapCart(cart));
          else set({ cartId: null, checkoutUrl: null, lines: [], totalQuantity: 0, subtotal: null });
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
          const cart = data?.data?.cartDiscountCodesUpdate?.cart;
          if (!cart) return false;
          set(mapCart(cart));
          if (codes.length === 0) return true;
          return (cart.discountCodes ?? []).some(
            (d: any) => d.applicable && codes.includes(String(d.code)),
          );
        } finally {
          set({ isDiscountLoading: false });
        }
      },


      addLine: async (merchandiseId, quantity = 1) => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          const lines = [{ merchandiseId, quantity }];
          const data = cartId
            ? await storefrontApiRequest<any>(CART_LINES_ADD, { cartId, lines })
            : await storefrontApiRequest<any>(CART_CREATE, { lines });
          const cart = data?.data?.cartLinesAdd?.cart ?? data?.data?.cartCreate?.cart;
          if (cart) {
            set({ ...mapCart(cart), isOpen: true });
            triggerHaptic('medium');
          }
        } finally {
          set({ isLoading: false });
        }
      },

      updateLine: async (lineId, quantity) => {
        const cartId = get().cartId;
        if (!cartId) return;

        if (quantity <= 0) {
          return get().removeLine(lineId);
        }

        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<any>(CART_LINES_UPDATE, {
            cartId,
            lines: [{ id: lineId, quantity }],
          });
          const cart = data?.data?.cartLinesUpdate?.cart;
          if (cart) {
            set(mapCart(cart));
            triggerHaptic('light');
          }
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
            lineIds: [lineId],
          });
          const cart = data?.data?.cartLinesRemove?.cart;
          if (cart) {
            set(mapCart(cart));
            triggerHaptic('heavy');
          }
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
