import { toast } from "sonner";
import { SHOPIFY_STOREFRONT_URL, shopifyConfig } from "./config";

const ADMIN_ONLY_STOREFRONT_FIELDS = /\binventoryPolicy\b/g;

function sanitizeStorefrontQuery(query: string): string {
  if (!ADMIN_ONLY_STOREFRONT_FIELDS.test(query)) return query;

  console.warn(
    "[Shopify] Removed Admin API-only inventoryPolicy from a Storefront query",
  );
  return query.replace(ADMIN_ONLY_STOREFRONT_FIELDS, "");
}

export async function storefrontApiRequest<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | undefined> {
  const storefrontQuery = sanitizeStorefrontQuery(query);
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": shopifyConfig.storefrontToken,
    },
    body: JSON.stringify({ query: storefrontQuery, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description:
        "Shopify API access requires an active Shopify billing plan. Visit https://admin.shopify.com to upgrade.",
    });
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(
      `Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  return data as T;
}
