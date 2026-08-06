import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storefrontApiRequest } from "@/services/shopify/client";

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  variantTitle: string;
  imageUrl: string | null;
  amount: number;
  currency: string;
};

type CartState = {
  cartId: string | null;
  checkoutUrl: string | null;
  lines: CartLine[];
  totalQuantity: number;
  subtotal: { amount: number; currency: string } | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
};

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
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
              product { title }
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
    lines: (cart?.lines?.edges ?? []).map((edge: any) => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      merchandiseId: edge.node.merchandise?.id,
      title: edge.node.merchandise?.product?.title ?? "",
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
      isOpen: false,
      isLoading: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addLine: async (merchandiseId, quantity = 1) => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          const lines = [{ merchandiseId, quantity }];
          const data = cartId
            ? await storefrontApiRequest<any>(CART_LINES_ADD, { cartId, lines })
            : await storefrontApiRequest<any>(CART_CREATE, { lines });
          const cart = data?.data?.cartLinesAdd?.cart ?? data?.data?.cartCreate?.cart;
          if (cart) set({ ...mapCart(cart), isOpen: true });
        } finally {
          set({ isLoading: false });
        }
      },

      updateLine: async (lineId, quantity) => {
        const cartId = get().cartId;
        if (!cartId) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<any>(CART_LINES_UPDATE, {
            cartId,
            lines: [{ id: lineId, quantity }],
          });
          const cart = data?.data?.cartLinesUpdate?.cart;
          if (cart) set(mapCart(cart));
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
          if (cart) set(mapCart(cart));
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
