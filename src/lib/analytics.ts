import globalConfig from "../../config/globalconf.json";
import {
  AnalyticsEventName,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from "@shopify/hydrogen-react";
import type {
  ShopifyAddToCartPayload,
  ShopifyPageViewPayload,
} from "@shopify/hydrogen-react";
import { trackMetaEvent } from "@/lib/analytics/meta.events";
import {
  getClientId as getVisitorId,
  getSessionToken as getVisitToken,
  getMicroSessionId,
  getMicroSessionCount,
} from "@/lib/analytics/identity";
import { posthogService } from "@/lib/analytics/posthog";

const MONORAIL_ENDPOINT = "https://monorail-edge.shopifysvc.com/v1/produce";

// Generate or retrieve stable client ID
const getClientId = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('plantora_client_id');
  if (!id) {
    id = crypto.randomUUID().toLowerCase();
    localStorage.setItem('plantora_client_id', id);
  }
  return id;
};

// Generate or retrieve session token (per session)
const getSessionToken = () => {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('plantora_session_token');
  if (!token) {
    token = crypto.randomUUID().toLowerCase();
    sessionStorage.setItem('plantora_session_token', token);
  }
  return token;
};

async function sendMonorailEvent(eventName: string, cart: any, retryCount = 0) {
  if (typeof window === 'undefined') return;
  
  const cartId = cart?.id || '';
  const cartToken = cartId.split('/').pop()?.split('?')[0] ?? '';
  
  if (!cartToken || (cart.totalQuantity ?? 0) <= 0) return;

  const clientId = getClientId();
  const sessionToken = getSessionToken();
  const { shopId, currency } = globalConfig.analytics;
  const hydrogenSubchannelId = globalConfig.analytics.storefrontId; // Assuming storefrontId is the subchannel ID

  const payload = {
    event_name: eventName,
    source: "headless",
    hydrogenSubchannelId: hydrogenSubchannelId,
    shop_id: typeof shopId === 'string' && shopId.includes('/') ? parseInt(shopId.split('/').pop() || '0') : parseInt(String(shopId)),
    currency: currency,
    client_id: clientId,
    session_token: sessionToken,
    unique_token: clientId,
    deprecated_visit_token: sessionToken,
    is_persistent_cookie: true,
    cart_token: cartToken,
    line_items_count: cart.totalQuantity,
    total_price: cart.cost?.totalAmount?.amount || "0.0",
    event_created_at_ms: Date.now(),
    event_time: Date.now(),
    event_id: `${Date.now()}-${clientId}`,
    event_source_url: window.location.href,
    ccpa_enforced: false,
    gdpr_enforced: false,
    gdpr_enforced_as_string: "false",
    analytics_allowed: true,
    marketing_allowed: true,
    sale_of_data_allowed: true
  };

  const body = JSON.stringify({
    schema_id: "custom_storefront_customer_tracking/1.2",
    payload,
    metadata: {
      event_created_at_ms: Date.now(),
      event_sent_at_ms: Date.now()
    }
  });

  try {
    const response = await fetch(MONORAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    });

    if (!response.ok && retryCount < 3) {
      setTimeout(() => sendMonorailEvent(eventName, cart, retryCount + 1), 2000);
    }
  } catch (e) {
    if (retryCount < 3) {
      setTimeout(() => sendMonorailEvent(eventName, cart, retryCount + 1), 2000);
    }
  }
}

function getCartLines(cart: any): any[] {
  if (Array.isArray(cart?.lines)) return cart.lines;
  if (Array.isArray(cart?.lines?.nodes)) return cart.lines.nodes;
  if (Array.isArray(cart?.lines?.edges)) {
    return cart.lines.edges.map((edge: any) => edge?.node).filter(Boolean);
  }
  return [];
}

function getAnalyticsProducts(cart: any) {
  return getCartLines(cart).map((line: any) => {
    const merchandise = line?.merchandise ?? {};
    const product = merchandise?.product ?? {};
    return {
      productGid: product.id ?? merchandise.productId ?? merchandise.id,
      variantGid: merchandise.id ?? line?.merchandiseId,
      name: product.title ?? line?.title ?? "Product",
      variantName: merchandise.title ?? line?.variantTitle,
      brand: product.vendor ?? "Plantora",
      category: product.productType,
      price: String(
        line?.cost?.amountPerQuantity?.amount ??
          merchandise?.price?.amount ??
          line?.amount ??
          0,
      ),
      sku: merchandise.sku ?? undefined,
      quantity: Number(line?.quantity ?? 1),
    };
  }).filter((product: any) => product.productGid && product.variantGid);
}

function getShopifyPayload(cart?: any) {
  const products = getAnalyticsProducts(cart);
  return {
    ...getClientBrowserParameters(),
    hasUserConsent: true,
    shopId: globalConfig.analytics.shopId,
    storefrontId: globalConfig.analytics.storefrontId,
    hydrogenSubchannelId: globalConfig.analytics.storefrontId,
    shopifySalesChannel: globalConfig.analytics.salesChannel,
    currency: cart?.cost?.subtotalAmount?.currencyCode ?? globalConfig.analytics.currency,
    acceptedLanguage: globalConfig.analytics.acceptedLanguage,
    analyticsAllowed: true,
    marketingAllowed: true,
    saleOfDataAllowed: true,
    products,
    totalValue: Number(cart?.cost?.subtotalAmount?.amount ?? 0),
  };
}

function numericShopId(): number {
  const raw = String(globalConfig.analytics.shopId ?? "");
  return parseInt(raw.includes("/") ? (raw.split("/").pop() as string) : raw, 10) || 0;
}

/**
 * Direct Monorail page-view producer.
 * hydrogen-react's sendShopifyAnalytics can silently no-op, so we always emit
 * the trekkie page-view schema ourselves to guarantee the /produce call fires.
 */
async function sendMonorailPageView(
  pageType: string,
  resourceId?: string,
  retryCount = 0,
): Promise<void> {
  if (typeof window === "undefined") return;

  const payload = {
    schema_id: "trekkie_storefront_page_view/1.4",
    payload: {
      appClientId: globalConfig.analytics.storefrontId,
      isPersistentCookie: true,
      uniqToken: getVisitorId(),
      visitToken: getVisitToken(),
      microSessionId: getMicroSessionId(),
      microSessionCount: getMicroSessionCount(),
      url: window.location.href,
      path: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer || "",
      title: document.title,
      shopId: numericShopId(),
      currency: globalConfig.analytics.currency,
      contentLanguage: globalConfig.analytics.acceptedLanguage,
      hydrogenSubchannelId: globalConfig.analytics.storefrontId,
      isMerchantRequest: false,
      navigationType: "navigate",
      navigationApi: "PerformanceNavigationTiming",
      pageType,
      ...(resourceId ? { resourceId } : {}),
      canonicalUrl: window.location.href,
      ccpaEnforced: false,
      gdprEnforced: false,
      analyticsAllowed: true,
      marketingAllowed: true,
      saleOfDataAllowed: true,
    },
    metadata: {
      event_created_at_ms: Date.now(),
      event_sent_at_ms: Date.now(),
    },
  };

  try {
    const response = await fetch(MONORAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!response.ok && retryCount < 2) {
      setTimeout(() => sendMonorailPageView(pageType, resourceId, retryCount + 1), 2000);
    }
  } catch {
    if (retryCount < 2) {
      setTimeout(() => sendMonorailPageView(pageType, resourceId, retryCount + 1), 2000);
    }
  }
}

export function trackShopifyPageView(pageType = "index", resourceId?: string) {
  if (typeof window === "undefined") return;
  void sendMonorailPageView(pageType, resourceId);
  posthogService.trackPageView({ page_type: pageType, resource_id: resourceId });
  const payload = {
    ...getShopifyPayload(),
    pageType,
    canonicalUrl: window.location.href,
    ...(resourceId ? { resourceId } : {}),
  } as ShopifyPageViewPayload;
  void sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.PAGE_VIEW,
      payload,
    },
    globalConfig.analytics.shopDomain,
  ).catch((error) => console.warn("[Shopify Analytics] Page view failed", error));
}


function trackShopifyAddToCart(cart: any) {
  if (typeof window === "undefined" || !cart?.id) return;
  const payload = {
    ...getShopifyPayload(cart),
    cartId: cart.id,
  } as ShopifyAddToCartPayload;
  void sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.ADD_TO_CART,
      payload,
    },
    globalConfig.analytics.shopDomain,
  ).catch((error) => console.warn("[Shopify Analytics] Add to cart failed", error));
}

export const trackCartViewed = (cart: any) => {
  sendMonorailEvent("cart_viewed", cart);
  posthogService.trackCartViewed({
    item_count: cart?.totalQuantity ?? 0,
    cart_value: Number(cart?.cost?.subtotalAmount?.amount ?? 0),
    currency: cart?.cost?.subtotalAmount?.currencyCode ?? globalConfig.analytics.currency,
  });
};

export const trackCartUpdated = (cart: any, eventType: 'add_to_cart' | 'remove_from_cart' | 'update_cart', item?: { merchandiseId: string; quantity: number }) => {
  sendMonorailEvent("cart_updated", cart);

  if (eventType === "add_to_cart") {
    trackShopifyAddToCart(cart);
    const products = getAnalyticsProducts(cart);
    const addedProduct = products.find((product: any) => product.variantGid === item?.merchandiseId);
    if (addedProduct) {
      posthogService.trackAddToCart({
        product_id: addedProduct.productGid,
        product_handle: addedProduct.productGid, // If handle isn't in addedProduct, use ID as fallback
        product_title: addedProduct.name,
        variant_id: addedProduct.variantGid,
        price: Number(addedProduct.price),
        currency: cart?.cost?.subtotalAmount?.currencyCode ?? globalConfig.analytics.currency,
        quantity: item?.quantity ?? addedProduct.quantity ?? 1,
        product_type: addedProduct.category,
        vendor: addedProduct.brand,
      }, Number(cart?.cost?.subtotalAmount?.amount ?? 0));
      
      trackMetaEvent("AddToCart", {
        content_ids: [addedProduct.productGid],
        content_name: addedProduct.name,
        content_type: "product",
        contents: [{
          id: addedProduct.variantGid,
          quantity: item?.quantity ?? addedProduct.quantity ?? 1,
          price: Number(addedProduct.price),
          title: addedProduct.name,
        }],
        value: Number(addedProduct.price) * (item?.quantity ?? addedProduct.quantity ?? 1),
        currency: cart?.cost?.subtotalAmount?.currencyCode ?? globalConfig.analytics.currency,
        num_items: item?.quantity ?? addedProduct.quantity ?? 1,
      });
    }
  }
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('plantora:cart:updated', {
      detail: {
        cart,
        event: eventType,
        item
      }
    }));
  }
};

export const trackCheckoutStarted = (cart: any) => {
  sendMonorailEvent("checkout_started", cart);
  posthogService.trackCheckoutStarted({
    cart_value: Number(cart?.cost?.totalAmount?.amount ?? 0),
    currency: cart?.cost?.totalAmount?.currencyCode ?? globalConfig.analytics.currency,
    item_count: cart?.totalQuantity ?? 0,
  });
};

export const trackPurchase = (cart: any, orderId: string) => {
  const products = getAnalyticsProducts(cart).map((p: any) => ({
    product_id: p.productGid,
    product_handle: p.productGid,
    product_title: p.name,
    variant_id: p.variantGid,
    price: Number(p.price),
    currency: cart?.cost?.totalAmount?.currencyCode ?? globalConfig.analytics.currency,
    quantity: p.quantity,
    product_type: p.category,
    vendor: p.brand,
  }));

  posthogService.trackPurchase({
    order_id: orderId,
    value: Number(cart?.cost?.totalAmount?.amount ?? 0),
    currency: cart?.cost?.totalAmount?.currencyCode ?? globalConfig.analytics.currency,
    item_count: cart?.totalQuantity ?? 0,
    products,
  });
};
