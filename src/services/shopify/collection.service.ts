import { storefrontApiRequest } from "./client";
import { paginationConfig } from "./config";
import { normalizeCollection } from "./normalize/collection";
import { normalizeProductCard } from "./normalize/product";
import {
  COLLECTION_BY_ID_QUERY,
  COLLECTION_PAGE_QUERY,
  PRODUCTS_QUERY,
} from "./queries/collection.query";
import type { PlantoraCollection, PlantoraProductCard } from "./types";

export async function getCollection(params: {
  handle: string;
  after?: string | null;
  limit?: number;
}): Promise<PlantoraCollection | null> {
  const data = await storefrontApiRequest<{ data?: { collection?: unknown } }>(COLLECTION_PAGE_QUERY, {
    handle: params.handle,
    productLimit: params.limit ?? paginationConfig.collectionPageSize,
    after: params.after ?? null,
  });
  const node = data?.data?.collection;
  if (!node) return null;
  return normalizeCollection(node);
}

/** Shared product listing used by search, related, recommendations, recently viewed. */
export async function getProductCards(params: {
  query?: string;
  first?: number;
  after?: string | null;
} = {}): Promise<{
  products: PlantoraProductCard[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  const data = await storefrontApiRequest<any>(PRODUCTS_QUERY, {
    first: params.first ?? paginationConfig.collectionPageSize,
    query: params.query ?? null,
    after: params.after ?? null,
  });
  const conn = data?.data?.products;
  return {
    products: (conn?.edges ?? []).map((e: any) => normalizeProductCard(e.node)),
    pageInfo: {
      hasNextPage: Boolean(conn?.pageInfo?.hasNextPage),
      endCursor: conn?.pageInfo?.endCursor ?? null,
    },
  };
}

/** Fetch a collection by numeric or full Shopify GID. */
export async function getCollectionById(params: {
  id: string;
  limit?: number;
  after?: string | null;
}): Promise<PlantoraCollection | null> {
  const gid = params.id.startsWith("gid://")
    ? params.id
    : `gid://shopify/Collection/${params.id.split("/").pop()}`;
  const data = await storefrontApiRequest<{ data?: { collection?: unknown } }>(
    COLLECTION_BY_ID_QUERY,
    {
      id: gid,
      productLimit: params.limit ?? paginationConfig.collectionPageSize,
      after: params.after ?? null,
    },
  );
  const node = data?.data?.collection;
  if (!node) return null;
  return normalizeCollection(node);
}
