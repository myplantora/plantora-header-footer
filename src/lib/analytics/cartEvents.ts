import { analyticsConfig } from "@/services/shopify/config";
import {
  getClientId,
  getSessionToken,
  sendMonorailEvent,
} from "@/lib/analytics/monorail";

/**
 * Schema confirmation
 * -------------------
 * `shopify_pay_cart_updated/1.0` and `shopify_pay_cart_viewed/1.0` are Shop Pay
 * (checkout) schemas — the Monorail edge does not accept storefront cart
 * activity on them, and Live View ignores them.
 *
 * The schema a headless storefront must use for cart activity is the same one
 * the Liquid storefront's trekkie bundle uses for non-page-view events:
 *
 *   custom_storefront_customer_tracking/1.2
 *
 * with the event distinguished by the `event_name` field:
 *   - event_name: "cart_updated"
 *   - event_name: "cart_viewed"
 */
export const CART_SCHEMA_ID = "custom_storefront_customer_tracking/1.2";

/** `gid://shopify/Cart/abc123` -> `abc123` (also strips any `?key=` suffix). */
export function extractCartToken(cartId: string): string {
  if (typeof cartId !== "string" || cartId.length === 0) return "";
  const gid = cartId.split("?")[0] ?? "";
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? "";
}

function numericShopId(): number {
  const shopId = String(analyticsConfig.shopId ?? "");
  const match = shopId.match(/\d+/);
  const parsed = match ? parseInt(match[0], 10) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
}

type CartEventInput = {
  cartId: string | null;
  lineItemsCount: number;
  /** Store-currency total as a string, e.g. "29.99". Omitted for cart_viewed. */
  totalPrice?: string;
};

function baseCartPayload(input: CartEventInput, eventName: string): Record<string, unknown> {
  const clientId = getClientId();
  const sessionToken = getSessionToken();
  const eventCreatedAtMs = Date.now();

  return {
    event_name: eventName,
    source: analyticsConfig.salesChannel ?? "headless",
    hydrogenSubchannelId: analyticsConfig.storefrontId ?? "0",
    shop_id: numericShopId(),
    currency: analyticsConfig.currency,
    // Identity — browser storage only, never server-generated.
    client_id: clientId,
    session_token: sessionToken,
    unique_token: clientId,
    deprecated_visit_token: sessionToken,
    is_persistent_cookie: true,
    cart_token: extractCartToken(input.cartId ?? ""),
    line_items_count: input.lineItemsCount,
    event_created_at_ms: eventCreatedAtMs,
    event_time: eventCreatedAtMs,
    event_id: `${eventCreatedAtMs}-${sessionToken}`,
    event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
    ccpa_enforced: false,
    gdpr_enforced: false,
    gdpr_enforced_as_string: "false",
    analytics_allowed: true,
    marketing_allowed: true,
    sale_of_data_allowed: true,
  };
}

/** Fires after a successful Storefront API cart mutation. */
export function sendCartUpdated(input: CartEventInput): void {
  if (typeof window === "undefined") return;
  sendMonorailEvent({
    schema_id: CART_SCHEMA_ID,
    payload: {
      ...baseCartPayload(input, "cart_updated"),
      total_price: input.totalPrice ?? "0.00",
    },
  });
}

/** Fires when the cart drawer opens (or the /cart page mounts) with items. */
export function sendCartViewed(input: CartEventInput): void {
  if (typeof window === "undefined") return;
  if (input.lineItemsCount === 0) return;
  sendMonorailEvent({
    schema_id: CART_SCHEMA_ID,
    payload: baseCartPayload(input, "cart_viewed"),
  });
}

/**
 * Fires the moment the visitor initiates checkout, before navigation.
 * Same schema as the other storefront customer events, distinguished by
 * `event_name: "checkout_started"`.
 */
export function sendCheckoutStarted(
  input: CartEventInput & { currency?: string | undefined },
): void {
  if (typeof window === "undefined") return;
  if (input.lineItemsCount === 0) return;
  sendMonorailEvent({
    schema_id: CART_SCHEMA_ID,
    payload: {
      ...baseCartPayload(input, "checkout_started"),
      currency: input.currency ?? analyticsConfig.currency,
      total_price: input.totalPrice ?? "0.00",
    },
  });
}
