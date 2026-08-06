import { featureFlags, metafieldConfig } from "../config";
import type {
  PlantoraAvailability,
  PlantoraBadge,
  PlantoraImage,
  PlantoraMoney,
  PlantoraProduct,
  PlantoraProductCard,
  PlantoraReviews,
  PlantoraVariant,
} from "../types";
import { buildMetafieldMap, readBoolean, readImage, readNumber, readText } from "./metafields";

type RawMoney = { amount: string; currencyCode: string } | null | undefined;
type RawImage = { url: string; altText: string | null; width?: number; height?: number } | null | undefined;

function money(raw: RawMoney): PlantoraMoney | null {
  if (!raw) return null;
  const amount = Number(raw.amount);
  if (!Number.isFinite(amount)) return null;
  return { amount, currency: raw.currencyCode };
}

function image(raw: RawImage, fallbackAlt: string): PlantoraImage | null {
  if (!raw?.url) return null;
  return {
    url: raw.url,
    altText: raw.altText ?? fallbackAlt,
    width: raw.width,
    height: raw.height,
  };
}

function availabilityOf(availableForSale: boolean, quantity: number | null): PlantoraAvailability {
  if (!availableForSale) return "out_of_stock";
  if (typeof quantity === "number" && quantity > 0 && quantity <= 5) return "limited";
  return "in_stock";
}

function discountPercent(price: PlantoraMoney, compareAt: PlantoraMoney | null): number | null {
  if (!compareAt || compareAt.amount <= price.amount) return null;
  return Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100);
}

/** Raw Shopify product node -> PlantoraProductCard. */
export function normalizeProductCard(node: any): PlantoraProductCard {
  const map = buildMetafieldMap(node?.metafields);
  const media = metafieldConfig.media as Record<string, { namespace: string; key: string }>;
  const reviewConf = metafieldConfig.reviews as Record<string, { namespace: string; key: string }>;

  const galleryEdges: any[] = node?.images?.edges ?? [];
  const featuredImage =
    image(node?.featuredImage, node?.title ?? "") ??
    image(galleryEdges[0]?.node, node?.title ?? "");
  const hoverImage = featureFlags.hoverImage ? image(galleryEdges[1]?.node, node?.title ?? "") : null;

  const firstVariant = node?.variants?.edges?.[0]?.node;
  const price =
    money(firstVariant?.price) ?? money(node?.priceRange?.minVariantPrice) ?? { amount: 0, currency: "USD" };
  const compareAtPrice = money(firstVariant?.compareAtPrice);

  const badgeIcon = readImage(map, media["badgeIcon"]!.namespace, media["badgeIcon"]!.key);
  const badges: PlantoraBadge[] = featureFlags.badges
    ? metafieldConfig.badges
        .filter((badge) => readBoolean(map, badge.namespace, badge.key))
        .map((badge) => {
          const iconUrl = badgeIcon?.url;
          return iconUrl ? { key: badge.key, label: badge.label, iconUrl } : { key: badge.key, label: badge.label };
        })
    : [];

  let reviews: PlantoraReviews | null = null;
  if (featureFlags.reviews) {
    const average = readNumber(map, reviewConf["average"]!.namespace, reviewConf["average"]!.key);
    const total = readNumber(map, reviewConf["total"]!.namespace, reviewConf["total"]!.key);
    const percent = readNumber(map, reviewConf["percent"]!.namespace, reviewConf["percent"]!.key);
    if (average !== null || total !== null) {
      reviews = {
        average: average ?? 0,
        total: total ?? 0,
        percent: percent ?? (average !== null ? Math.round((average / 5) * 100) : 0),
      };
    }
  }

  const rawOptions: { name: string; values: string[] }[] = node?.options ?? [];
  const options = rawOptions.filter(
    (o) => o.name.toLowerCase() !== "title" && !(o.values.length === 1 && o.values[0] === "Default Title"),
  );

  return {
    id: node?.id ?? "",
    title: node?.title ?? "",
    handle: node?.handle ?? "",
    url: `/product/${node?.handle ?? ""}`,
    featuredImage,
    hoverImage,
    price,
    compareAtPrice,
    discountPercent: discountPercent(price, compareAtPrice),
    availability: availabilityOf(
      Boolean(node?.availableForSale),
      typeof firstVariant?.quantityAvailable === "number" ? firstVariant.quantityAvailable : null,
    ),
    badges,
    tagMedia: featureFlags.tagMedia
      ? readImage(map, media["tagMedia"]!.namespace, media["tagMedia"]!.key)
      : null,
    promoLabel: readText(map, media["promoLabel"]!.namespace, media["promoLabel"]!.key),
    reviews,
    options: featureFlags.variantSelectors ? options : [],
    defaultVariantId: firstVariant?.id ?? null,
  };
}

/** Raw Shopify product node (PDP query) -> PlantoraProduct. */
export function normalizeProduct(node: any): PlantoraProduct {
  const card = normalizeProductCard(node);
  const variants: PlantoraVariant[] = (node?.variants?.edges ?? []).map((edge: any) => {
    const v = edge.node;
    return {
      id: v.id,
      title: v.title,
      sku: v.sku ?? null,
      available: Boolean(v.availableForSale),
      quantityAvailable: typeof v.quantityAvailable === "number" ? v.quantityAvailable : null,
      price: money(v.price) ?? card.price,
      compareAtPrice: money(v.compareAtPrice),
      selectedOptions: v.selectedOptions ?? [],
      image: image(v.image, node?.title ?? ""),
    };
  });

  const firstAvailable = variants.find((v) => v.available) ?? variants[0] ?? null;

  return {
    ...card,
    price: firstAvailable?.price ?? card.price,
    compareAtPrice: firstAvailable?.compareAtPrice ?? card.compareAtPrice,
    discountPercent: discountPercent(
      firstAvailable?.price ?? card.price,
      firstAvailable?.compareAtPrice ?? card.compareAtPrice,
    ),
    defaultVariantId: firstAvailable?.id ?? card.defaultVariantId,
    descriptionHtml: node?.descriptionHtml ?? "",
    seo: {
      title: node?.seo?.title || node?.title || "",
      description: node?.seo?.description || "",
    },
    gallery: (node?.images?.edges ?? [])
      .map((e: any) => image(e.node, node?.title ?? ""))
      .filter(Boolean) as PlantoraImage[],
    variants,
  };
}
