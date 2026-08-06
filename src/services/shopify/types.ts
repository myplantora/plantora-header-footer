/**
 * Normalized Plantora data models.
 * React components consume ONLY these types — never raw Shopify JSON.
 */

export type PlantoraImage = {
  url: string;
  altText: string;
  width?: number;
  height?: number;
};

export type PlantoraMoney = {
  amount: number;
  currency: string;
};

export type PlantoraBadge = {
  key: string;
  label: string;
  iconUrl?: string;
};

export type PlantoraReviews = {
  average: number;
  total: number;
  percent: number;
};

export type PlantoraOption = {
  name: string;
  values: string[];
};

export type PlantoraAvailability = "in_stock" | "out_of_stock" | "limited";

export type PlantoraProductCard = {
  id: string;
  title: string;
  handle: string;
  url: string;
  featuredImage: PlantoraImage | null;
  hoverImage: PlantoraImage | null;
  price: PlantoraMoney;
  compareAtPrice: PlantoraMoney | null;
  discountPercent: number | null;
  availability: PlantoraAvailability;
  badges: PlantoraBadge[];
  tagMedia: PlantoraImage | null;
  promoLabel: string | null;
  reviews: PlantoraReviews | null;
  options: PlantoraOption[];
  defaultVariantId: string | null;
};

export type PlantoraVariant = {
  id: string;
  title: string;
  sku: string | null;
  available: boolean;
  quantityAvailable: number | null;
  price: PlantoraMoney;
  compareAtPrice: PlantoraMoney | null;
  selectedOptions: { name: string; value: string }[];
  image: PlantoraImage | null;
};

export type PlantoraProduct = PlantoraProductCard & {
  descriptionHtml: string;
  seo: { title: string; description: string };
  gallery: PlantoraImage[];
  variants: PlantoraVariant[];
};

export type PlantoraCollection = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  image: PlantoraImage | null;
  seo: { title: string; description: string };
  products: PlantoraProductCard[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};
