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
/** Stable hash so fallback reviews stay identical between card and PDP renders. */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/** Deterministic fallback reviews: 12–67 count, 4.3–4.9 average. */
function fallbackReviews(seed: string): PlantoraReviews {
  const hash = hashString(seed || "plantora");
  const total = 12 + (hash % 56);
  const average = Math.round((4.3 + ((hash >> 8) % 7) / 10) * 10) / 10;
  return { average, total, percent: Math.round((average / 5) * 100) };
}

/** GIF icon lookup from globalconf badge config. */
const badgeGif = (key: string): string | undefined =>
  (metafieldConfig.badges as { key: string; gifUrl?: string }[]).find((b) => b.key === key)?.gifUrl;

const chip = (key: string, label: string, gifKey: string, backgroundColor: string): PlantoraBadge => {
  const iconUrl = badgeGif(gifKey);
  return iconUrl ? { key, label, iconUrl, backgroundColor } : { key, label, backgroundColor };
};

/** Deterministic feature chips based on product info. */
function generateFeatureChips(seed: string, productType?: string, tags: string[] = []): PlantoraBadge[] {
  const chips: PlantoraBadge[] = [];
  const hash = hashString(seed);

  // Background colors as defined in reference: idx 0: #EDE9D2, idx 1: #C3E8E8, idx 2: #F2E8C2
  if (tags.includes('Air Purifying') || productType?.toLowerCase().includes('plant')) {
    chips.push(chip('air-purifying', 'Air Purifying', 'fast_growing', '#EDE9D2'));
  }

  const pool: PlantoraBadge[] = [
    chip('vastu', 'Indoor Plant', 'indoor_plant', '#C3E8E8'),
    chip('gift', 'Perfect Gift', 'perfect_gift', '#F2E8C2'),
    chip('pet', 'Pet Friendly', 'pet_safe', '#EDE9D2'),
    chip('low-maint', 'Low Maintenance', 'low_maintenance', '#C3E8E8'),
    chip('beginner', 'Fast Growing', 'fast_growing', '#F2E8C2'),
  ];

  // Ensure we have at least 2 chips by picking from the pool if needed
  let poolIndex = hash % pool.length;
  while (chips.length < 2) {
    const candidate = pool[poolIndex];
    if (candidate && !chips.some(c => c.key === candidate.key)) {
      chips.push(candidate);
    }
    poolIndex = (poolIndex + 1) % pool.length;
  }

  return chips.slice(0, 2);
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
        .map((badge, idx): PlantoraBadge => {
          const iconUrl = (badge as { gifUrl?: string }).gifUrl ?? (badge.key === 'tagMedia' ? badgeIcon?.url : null);
          const bgColors = ['#EDE9D2', '#C3E8E8', '#F2E8C2'];
          const backgroundColor = bgColors[idx % bgColors.length] || '#EDE9D2';
          return iconUrl ? { key: badge.key, label: badge.label, iconUrl, backgroundColor } : { key: badge.key, label: badge.label, backgroundColor };
        })
    : [];

  let reviews: PlantoraReviews | null = null;
  if (featureFlags.reviews) {
    const average = readNumber(map, reviewConf["average"]!.namespace, reviewConf["average"]!.key);
    const total = readNumber(map, reviewConf["total"]!.namespace, reviewConf["total"]!.key);
    const percent = readNumber(map, reviewConf["percent"]!.namespace, reviewConf["percent"]!.key);
    const fallback = fallbackReviews(node?.id ?? node?.handle ?? node?.title ?? "");
    reviews = {
      average: average ?? fallback.average,
      total: total ?? fallback.total,
      percent: percent ?? Math.round(((average ?? fallback.average) / 5) * 100),
    };

  }

  const rawOptions: { name: string; values: string[] }[] = node?.options ?? [];
  const options = rawOptions.filter(
    (o) => o.name.toLowerCase() !== "title" && !(o.values.length === 1 && o.values[0] === "Default Title"),
  );

  const variants: PlantoraVariant[] = (node?.variants?.edges ?? []).map((edge: any) => {
    const v = edge.node;
    return {
      id: v.id,
      title: v.title,
      sku: v.sku ?? null,
      available: Boolean(v.availableForSale),
      quantityAvailable: typeof v.quantityAvailable === "number" ? v.quantityAvailable : (v.availableForSale ? 99 : 0),

      price: money(v.price) ?? price,
      compareAtPrice: money(v.compareAtPrice),
      selectedOptions: v.selectedOptions ?? [],
      image: image(v.image, node?.title ?? ""),
    };
  });

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
      typeof firstVariant?.quantityAvailable === "number" ? firstVariant.quantityAvailable : (node?.availableForSale ? 99 : 0),
    ),

    badges: generateFeatureChips(node?.id ?? "", node?.productType, node?.tags ?? []),
    tagMedia: featureFlags.tagMedia
      ? readImage(map, media["tagMedia"]!.namespace, media["tagMedia"]!.key)
      : null,
    promoLabel: node?.tags?.includes('has-deal') ? 'has-deal' : readText(map, media["promoLabel"]!.namespace, media["promoLabel"]!.key),
    reviews,
    options: featureFlags.variantSelectors ? options : [],
    variants,
    defaultVariantId: firstVariant?.id ?? null,
    tags: node?.tags ?? [],
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
      quantityAvailable: typeof v.quantityAvailable === "number" ? v.quantityAvailable : (v.availableForSale ? 99 : 0),

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
