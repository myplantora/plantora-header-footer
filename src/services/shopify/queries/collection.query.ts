import { metafieldIdentifiersLiteral } from "../config";

const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCardFields on Product {
    id
    title
    handle
    availableForSale
    productType
    vendor
    tags
    featuredImage { url altText width height }
    images(first: 2) { edges { node { url altText width height } } }
    options { name values }
    variants(first: 1) {
      edges {
        node {
          id
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
        }
      }
    }
    priceRange { minVariantPrice { amount currencyCode } }
    metafields(identifiers: ${metafieldIdentifiersLiteral()}) {
      namespace
      key
      type
      value
      reference { ... on MediaImage { image { url altText width height } } }
    }
  }
`;

export const COLLECTION_PAGE_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionPage($handle: String!, $productLimit: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      updatedAt
      image { url altText width height }
      seo { title description }
      products(first: $productLimit, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node { ...ProductCardFields } }
      }
    }
  }
`;

export const COLLECTION_BY_ID_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionById($id: ID!, $productLimit: Int!, $after: String) {
    collection(id: $id) {
      id
      title
      handle
      descriptionHtml
      image { url altText width height }
      seo { title description }
      products(first: $productLimit, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node { ...ProductCardFields } }
      }
    }
  }
`;

export const PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query Products($first: Int!, $query: String, $after: String) {
    products(first: $first, query: $query, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges { node { ...ProductCardFields } }
    }
  }
`;
