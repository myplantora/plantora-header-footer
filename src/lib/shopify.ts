import { toast } from "sonner";
import globalConfig from "../../config/globalconf.json";

const { shopDomain, storefrontToken: storefrontAccessToken, apiVersion } = globalConfig.shopify;

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoint = `https://${shopDomain}/api/${apiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API network error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(
      `Shopify API error: ${result.errors.map((e: any) => e.message).join(", ")}`
    );
  }

  return result.data as T;
}
