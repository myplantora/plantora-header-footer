import type { PlantoraCollection, PlantoraImage } from "../types";
import { normalizeProductCard } from "./product";

export function normalizeCollection(node: any): PlantoraCollection {
  const img: PlantoraImage | null = node?.image?.url
    ? {
        url: node.image.url,
        altText: node.image.altText ?? node?.title ?? "",
        width: node.image.width,
        height: node.image.height,
      }
    : null;

  return {
    id: node?.id ?? "",
    title: node?.title ?? "",
    handle: node?.handle ?? "",
    descriptionHtml: node?.descriptionHtml ?? "",
    image: img,
    seo: {
      title: node?.seo?.title || node?.title || "",
      description: node?.seo?.description || "",
    },
    products: (node?.products?.edges ?? []).map((edge: any) => normalizeProductCard(edge.node)),
    pageInfo: {
      hasNextPage: Boolean(node?.products?.pageInfo?.hasNextPage),
      endCursor: node?.products?.pageInfo?.endCursor ?? null,
    },
  };
}
