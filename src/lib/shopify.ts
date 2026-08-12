import { toast } from "sonner";
import globalConfig from "../../config/globalconf.json";

const { storeDomain: shopDomain, storefrontToken: storefrontAccessToken, apiVersion, defaultCountry, defaultLanguage } = globalConfig.shopify;

export const STOREFRONT_CONTEXT = `@inContext(country: ${defaultCountry || 'US'}, language: ${defaultLanguage || 'EN'})`;

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoint = `https://${shopDomain}/api/${apiVersion}/graphql.json`;

  const requestBody = JSON.stringify({ query, variables });
  
  // LOG: Full API Request Details
  console.log("[Shopify API Request]", {
    endpoint,
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken.substring(0, 4) + "****",
      "Content-Type": "application/json"
    },
    body: JSON.parse(requestBody)
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Shopify API Network Error]", {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Shopify API network error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  // LOG: Full API Response
  console.log("[Shopify API Response]", result);

  if (result.errors) {
    throw new Error(
      `Shopify API error: ${result.errors.map((e: any) => e.message).join(", ")}`
    );
  }

  return result.data as T;
}
