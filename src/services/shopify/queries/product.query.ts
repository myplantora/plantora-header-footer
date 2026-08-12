import { metafieldIdentifiersLiteral } from "../config";

export const PRODUCT_PAGE_QUERY = `
  query ProductPage($handle: String!, $metaobjectIds: [ID!]!) {
    product(handle: $handle) {
      id
      title
      handle
      availableForSale
      descriptionHtml
      productType
      vendor
      tags
      seo { title description }
      featuredImage { url altText width height }
      images(first: 20) { edges { node { url altText width height } } }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      options { name values }
      variants(first: 50) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
            quantityAvailable
            image { url altText width height }

          }
        }
      }
      metafields(identifiers: ${metafieldIdentifiersLiteral()}) {
        namespace
        key
        type
        value
        reference { ... on MediaImage { image { url altText width height } } }
      }
    }
    metaobjectData: nodes(ids: $metaobjectIds) {
      ... on Metaobject {
        id
        type
        handle
        fields {
          key
          value
          type
          reference { ... on MediaImage { image { url altText width height } } }
        }
      }
    }
  }
`;
