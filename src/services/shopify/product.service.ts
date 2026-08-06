import { storefrontApiRequest } from "./client";
import { metaobjectConfig } from "./config";
import { normalizeMetaobjects, type NormalizedMetaobjects } from "./normalize/metaobjects";
import { normalizeProduct } from "./normalize/product";
import { PRODUCT_PAGE_QUERY } from "./queries/product.query";
import type { PlantoraProduct } from "./types";

export async function getProduct(handle: string): Promise<{
  product: PlantoraProduct;
  metaobjects: NormalizedMetaobjects;
} | null> {
  const data = await storefrontApiRequest<any>(PRODUCT_PAGE_QUERY, {
    handle,
    metaobjectIds: metaobjectConfig.ids ?? [],
  });
  const node = data?.data?.product;
  if (!node) return null;
  return {
    product: normalizeProduct(node),
    metaobjects: normalizeMetaobjects(data?.data?.metaobjectData ?? []),
  };
}
