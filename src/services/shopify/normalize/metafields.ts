import type { PlantoraImage } from "../types";

export type RawMetafield = {
  namespace: string;
  key: string;
  type: string;
  value: string;
  reference?: { image?: { url: string; altText: string | null; width?: number; height?: number } } | null;
} | null;

export type MetafieldMap = Record<
  string,
  { type: string; value: string; image: PlantoraImage | null }
>;

const truthy = new Set(["true", "1", "yes"]);

export function buildMetafieldMap(raw: RawMetafield[] | null | undefined): MetafieldMap {
  const map: MetafieldMap = {};
  for (const field of raw ?? []) {
    if (!field) continue;
    const image = field.reference?.image
      ? {
          url: field.reference.image.url,
          altText: field.reference.image.altText ?? "",
          width: field.reference.image.width,
          height: field.reference.image.height,
        }
      : null;
    map[`${field.namespace}.${field.key}`] = { type: field.type, value: field.value, image };
  }
  return map;
}

export function readBoolean(map: MetafieldMap, namespace: string, key: string): boolean {
  const field = map[`${namespace}.${key}`];
  if (!field) return false;
  return truthy.has(String(field.value).toLowerCase());
}

export function readNumber(map: MetafieldMap, namespace: string, key: string): number | null {
  const field = map[`${namespace}.${key}`];
  if (!field) return null;
  // Shopify rating metafields are JSON: { "value": "4.8", "scale_min": ..., "scale_max": ... }
  try {
    const parsed = JSON.parse(field.value);
    if (parsed && typeof parsed === "object" && "value" in parsed) {
      const n = Number((parsed as { value: unknown }).value);
      return Number.isFinite(n) ? n : null;
    }
    const n = Number(parsed);
    return Number.isFinite(n) ? n : null;
  } catch {
    const n = Number(field.value);
    return Number.isFinite(n) ? n : null;
  }
}

export function readText(map: MetafieldMap, namespace: string, key: string): string | null {
  const field = map[`${namespace}.${key}`];
  if (!field || !field.value) return null;
  return field.value;
}

export function readImage(
  map: MetafieldMap,
  namespace: string,
  key: string,
): PlantoraImage | null {
  const field = map[`${namespace}.${key}`];
  if (!field) return null;
  if (field.image) return field.image;
  if (/^https?:\/\//.test(field.value)) return { url: field.value, altText: "" };
  return null;
}
