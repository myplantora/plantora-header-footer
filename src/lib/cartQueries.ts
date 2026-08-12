import { STOREFRONT_CONTEXT } from "./shopify";

export const CART_LINE_FRAGMENT = `
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
          handle
          productType
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

export const CART_FRAGMENT = `
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

export const CART_CREATE = `
  ${CART_FRAGMENT}
  mutation CartCreate ${STOREFRONT_CONTEXT} {
    cartCreate(input: {
      buyerIdentity: { countryCode: US }
    }) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) ${STOREFRONT_CONTEXT} {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
      warnings { code message target }
    }
  }
`;

export const CART_LINES_UPDATE = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) ${STOREFRONT_CONTEXT} {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
      warnings { code message target }
    }
  }
`;

export const CART_LINES_REMOVE = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) ${STOREFRONT_CONTEXT} {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

export const GET_CART = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) ${STOREFRONT_CONTEXT} {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
`;

export const CHECK_VARIANT_AVAILABILITY = `
  query CheckVariant($id: ID!) ${STOREFRONT_CONTEXT} {
    node(id: $id) {
      ... on ProductVariant {
        id
        availableForSale
        quantityAvailable
      }
    }
  }
`;
