import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AnalyticsPageType } from "@shopify/hydrogen-react";
import {
  sendShopifyPageView,
  type PageViewExtras,
  type ShopifyAnalyticsProduct,
} from "@/services/shopify/analytics";
import type { PlantoraProduct, PlantoraCollection } from "@/services/shopify/types";

function toProductGid(id: string): string {
  return id.startsWith("gid://") ? id : `gid://shopify/Product/${id}`;
}

function toCollectionGid(id: string): string {
  return id.startsWith("gid://") ? id : `gid://shopify/Collection/${id}`;
}

function analyticsProduct(product: PlantoraProduct): ShopifyAnalyticsProduct {
  const variant = product.variants.find((v) => v.id === product.defaultVariantId)
    ?? product.variants[0];
  return {
    productGid: toProductGid(product.id),
    name: product.title,
    brand: "Plantora",
    price: String(variant?.price.amount ?? product.price.amount),
    ...(variant?.id ? { variantGid: variant.id } : {}),
    ...(variant?.title ? { variantName: variant.title } : {}),
    ...(variant?.sku ? { sku: variant.sku } : {}),
    quantity: 1,
  };
}

/**
 * Fires a Shopify PAGE_VIEW on first render and on every route change.
 * Mount once at the app root.
 */
export function useShopifyPageView() {
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const routeId = useRouterState({
    select: (s) => s.matches[s.matches.length - 1]?.routeId ?? "",
  });
  const params = useRouterState({
    select: (s) => (s.matches[s.matches.length - 1]?.params ?? {}) as Record<string, string>,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let extras: PageViewExtras;

    if (routeId === "/product/$handle") {
      const cached = queryClient.getQueryData<{ product: PlantoraProduct } | undefined>([
        "product",
        params.handle,
      ]);
      const product = cached?.product;
      extras = {
        pageType: AnalyticsPageType.product,
        ...(product
          ? {
              resourceId: toProductGid(product.id),
              products: [analyticsProduct(product)],
              totalValue: product.price.amount,
            }
          : {}),
      };
    } else if (routeId === "/collections/$handle") {
      const collection = queryClient.getQueryData<PlantoraCollection | undefined>([
        "collection",
        params.handle,
      ]);
      extras = {
        pageType: AnalyticsPageType.collection,
        collectionHandle: params.handle ?? "",
        ...(collection
          ? {
              collectionId: toCollectionGid(collection.id),
              resourceId: toCollectionGid(collection.id),
            }
          : {}),
      };
    } else if (routeId === "/collections/") {
      extras = { pageType: AnalyticsPageType.listCollections };
    } else if (routeId === "/") {
      extras = { pageType: AnalyticsPageType.home };
    } else {
      extras = { pageType: AnalyticsPageType.page };
    }

    void sendShopifyPageView(extras);
    // Re-fire on every navigation.
  }, [pathname, search, routeId, params.handle, queryClient]);
}
