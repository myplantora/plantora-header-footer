import globalConfig from "../../../../config/globalconf.json";
const { metafieldConfig } = globalConfig.shopify;

const metafieldIdentifiersLiteral = () => {
  const media = metafieldConfig.media as Record<string, { namespace: string; key: string }>;
  const badges = (metafieldConfig.badges as { namespace: string; key: string }[]) || [];
  const reviews = metafieldConfig.reviews as Record<string, { namespace: string; key: string }>;

  const identifiers = [
    ...Object.values(media),
    ...badges,
    ...Object.values(reviews),
  ].map((i) => `{ namespace: "${i.namespace}", key: "${i.key}" }`);

  return `[${identifiers.join(", ")}]`;
};

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
