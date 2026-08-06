import {
  AnalyticsEventName,
  getClientBrowserParameters,
  sendShopifyAnalytics,
  type ShopifyAnalyticsProduct,
  type ShopifyPageViewPayload,
} from "@shopify/hydrogen-react";
import { analyticsConfig } from "./config";

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

/** Sends a Shopify PAGE_VIEW event. No-ops during SSR. */
export async function sendShopifyPageView(extras: PageViewExtras): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      ...getClientBrowserParameters(),
      ...shopData,
      ...consentFlags,
      ...extras,
    } as ShopifyPageViewPayload;

    await sendShopifyAnalytics(
      { eventName: AnalyticsEventName.PAGE_VIEW, payload },
      analyticsConfig.shopDomain,
    );
  } catch (error) {
    console.error("[Analytics] Shopify page view failed", error);
  }
}
