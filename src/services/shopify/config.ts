import globalconf from "../../../config/globalconf.json";

export const shopifyConfig = globalconf.shopify;
export const analyticsConfig = globalconf.analytics;
export const paginationConfig = globalconf.pagination;
export const featureFlags = globalconf.features;
export const metafieldConfig = globalconf.metafields;
export const metaobjectConfig = globalconf.metaobjects;

export const SHOPIFY_STOREFRONT_URL = `https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`;

/** Every metafield identifier we ask Shopify for, derived from globalconf. */
export function allMetafieldIdentifiers(): { namespace: string; key: string }[] {
  const media = metafieldConfig.media as Record<string, { namespace: string; key: string }>;
  const reviews = metafieldConfig.reviews as Record<string, { namespace: string; key: string }>;
  return [
    ...metafieldConfig.badges.map((b) => ({ namespace: b.namespace, key: b.key })),
    ...Object.values(reviews),
    ...Object.values(media),
  ];
}

export function metafieldIdentifiersLiteral(): string {
  return `[${allMetafieldIdentifiers()
    .map((i) => `{namespace:"${i.namespace}",key:"${i.key}"}`)
    .join(",")}]`;
}
