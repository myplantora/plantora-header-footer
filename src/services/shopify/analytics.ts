import {
  getClientBrowserParameters,
  type ShopifyAnalyticsProduct,
  type ShopifyPageViewPayload,
} from "@shopify/hydrogen-react";
import { analyticsConfig } from "./config";
import {
  getClientId,
  getSessionToken,
  sendMonorailEvents,
  type MonorailEvent,
} from "@/lib/analytics/monorail";

/**
 * Consent is hard-coded for now. Wire these to a cookie-consent banner
 * before going to production.
 */
const hasUserConsent = true;

const consentFlags = {
  hasUserConsent,
  analyticsAllowed: hasUserConsent,
  marketingAllowed: hasUserConsent,
  saleOfDataAllowed: hasUserConsent,
};

const HEADLESS_APP_ID = "12875497473";
const TREKKIE_SCHEMA = "trekkie_storefront_page_view/1.4";
const CUSTOM_SCHEMA = "custom_storefront_customer_tracking/1.2";

const shopData = {
  shopId: analyticsConfig.shopId,
  storefrontId: analyticsConfig.storefrontId,
  hydrogenSubchannelId: analyticsConfig.storefrontId,
  shopifySalesChannel: analyticsConfig.salesChannel as "headless",
  currency: analyticsConfig.currency as ShopifyPageViewPayload["currency"],
  acceptedLanguage: analyticsConfig.acceptedLanguage as ShopifyPageViewPayload["acceptedLanguage"],
};

export type PageViewExtras = Partial<ShopifyPageViewPayload> & {
  pageType: string;
};

export type { ShopifyAnalyticsProduct };

/**
 * Last page view extras, so the heartbeat can re-emit the same schema/payload
 * shape for the page the visitor is currently on.
 */
let lastPageViewExtras: PageViewExtras = { pageType: "page" };

export function getLastPageViewExtras(): PageViewExtras {
  return lastPageViewExtras;
}

function gidParts(gid?: string): { id: string; resource: string | null } {
  if (typeof gid !== "string") return { id: "", resource: null };
  const parts = gid.split("/");
  const id = parts[parts.length - 1] ?? "";
  const resource = parts[parts.length - 2] ?? null;
  return { id, resource };
}

function numericId(gid?: string): number {
  const parsed = parseInt(gidParts(gid).id, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function withoutEmpty<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  });
  return out;
}

function formatProducts(products?: ShopifyAnalyticsProduct[]): string[] {
  return (products ?? []).map((p) =>
    JSON.stringify(
      withoutEmpty({
        product_gid: p.productGid,
        variant_gid: p.variantGid,
        name: p.name,
        variant: p.variantName || "",
        brand: p.brand,
        category: p.category,
        sku: p.sku,
        price: parseFloat(p.price),
        quantity: Number(p.quantity || 0),
        product_id: numericId(p.productGid),
        variant_id: numericId(p.variantGid),
      }),
    ),
  );
}

type BrowserParams = ReturnType<typeof getClientBrowserParameters>;

function buildEvents(payload: ShopifyPageViewPayload & BrowserParams): MonorailEvent[] {
  const clientId = getClientId();
  const sessionToken = getSessionToken();
  const { id: resourceNumericId, resource } = gidParts(payload.resourceId);

  const trekkie: MonorailEvent = {
    schema_id: TREKKIE_SCHEMA,
    payload: withoutEmpty({
      pageType: payload.pageType,
      customerId: numericId(payload.customerId),
      resourceType: resource ? resource.toLowerCase() : undefined,
      resourceId: resourceNumericId ? parseInt(resourceNumericId, 10) : undefined,
      appClientId: HEADLESS_APP_ID,
      isMerchantRequest: false,
      hydrogenSubchannelId: payload.storefrontId || "0",
      isPersistentCookie: payload.hasUserConsent,
      // Identity: browser-persisted tokens, never generated on a server.
      uniqToken: payload.uniqueToken || clientId,
      visitToken: payload.visitToken || sessionToken,
      microSessionId: sessionToken,
      microSessionCount: 1,
      url: payload.url,
      path: payload.path,
      search: payload.search,
      referrer: payload.referrer,
      title: payload.title,
      shopId: numericId(payload.shopId),
      currency: payload.currency,
      contentLanguage: payload.acceptedLanguage || "en",
    }),
  };

  const base = withoutEmpty({
    source: payload.shopifySalesChannel || "headless",
    hydrogenSubchannelId: payload.storefrontId || "0",
    is_persistent_cookie: payload.hasUserConsent,
    deprecated_visit_token: payload.visitToken || sessionToken,
    unique_token: payload.uniqueToken || clientId,
    event_time: Date.now(),
    event_id: `${Date.now()}-${sessionToken}`,
    event_source_url: payload.url,
    canonical_url: payload.canonicalUrl || payload.url,
    referrer: payload.referrer,
    user_agent: payload.userAgent,
    navigation_type: payload.navigationType,
    navigation_api: payload.navigationApi,
    shop_id: numericId(payload.shopId),
    currency: payload.currency,
    customer_id: numericId(payload.customerId),
    ccpa_enforced: false,
    gdpr_enforced: false,
    gdpr_enforced_as_string: "false",
    analytics_allowed: payload.analyticsAllowed || false,
    marketing_allowed: payload.marketingAllowed || false,
    sale_of_data_allowed: payload.saleOfDataAllowed || false,
  });

  const events: MonorailEvent[] = [
    trekkie,
    { schema_id: CUSTOM_SCHEMA, payload: { ...base, event_name: "page_rendered" } },
  ];

  if (payload.pageType === "product") {
    events.push({
      schema_id: CUSTOM_SCHEMA,
      payload: {
        ...base,
        event_name: "product_page_rendered",
        products: formatProducts(payload.products),
        ...(payload.totalValue ? { total_value: payload.totalValue } : {}),
      },
    });
  } else if (payload.pageType === "collection") {
    events.push({
      schema_id: CUSTOM_SCHEMA,
      payload: withoutEmpty({
        ...base,
        event_name: "collection_page_rendered",
        collection_name: payload.collectionHandle,
        collection_id: numericId(payload.collectionId),
      }),
    });
  } else if (payload.pageType === "search") {
    events.push({
      schema_id: CUSTOM_SCHEMA,
      payload: withoutEmpty({
        ...base,
        event_name: "search_submitted",
        search_string: payload.searchString,
      }),
    });
  }

  return events;
}

/**
 * Sends a Shopify PAGE_VIEW event straight from the visitor's browser.
 * No-ops during SSR — never call this from a loader or server function, or
 * Shopify will geo-resolve the server's IP instead of the visitor's.
 */
export async function sendShopifyPageView(extras: PageViewExtras): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      ...getClientBrowserParameters(),
      ...shopData,
      ...consentFlags,
      ...extras,
    } as ShopifyPageViewPayload & BrowserParams;

    sendMonorailEvents(buildEvents(payload));
  } catch (error) {
    console.error("[Analytics] Shopify page view failed", error);
  }
}
