import type { PlantoraImage } from "../types";

export type NormalizedMetaobject = {
  id: string;
  type: string;
  handle: string;
  fields: Record<string, { value: string; image: PlantoraImage | null }>;
};

export type NormalizedMetaobjects = Record<string, NormalizedMetaobject>;

export function normalizeMetaobjects(nodes: any[]): NormalizedMetaobjects {
  const result: NormalizedMetaobjects = {};
  for (const node of nodes ?? []) {
    if (!node?.id) continue;
    const fields: NormalizedMetaobject["fields"] = {};
    for (const field of node.fields ?? []) {
      const raw = field?.reference?.image;
      fields[field.key] = {
        value: field.value,
        image: raw
          ? { url: raw.url, altText: raw.altText ?? "", width: raw.width, height: raw.height }
          : null,
      };
    }
    result[node.handle ?? node.id] = {
      id: node.id,
      type: node.type ?? "",
      handle: node.handle ?? "",
      fields,
    };
  }
  return result;
}
