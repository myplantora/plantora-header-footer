/**
 * Direct-from-browser Shopify Monorail transport.
 *
 * Why this file exists:
 * Shopify Live View geo-resolves a visitor from the IP of the HTTP request that
 * delivers the Monorail event. Any server relay, edge function, or CDN/proxy in
 * front of the analytics endpoint makes Shopify see the *server* IP (e.g. a
 * Vercel edge PoP in Sweden) instead of the visitor's real IP (India).
 *
 * Rules enforced here:
 *  1. Events are ONLY ever sent from the browser (hard SSR guard, no relay).
 *  2. Events go straight to `monorail-edge.shopifysvc.com` — never through the
 *     custom/checkout domain, which may sit behind a third-party CDN.
 *  3. `keepalive: true` so in-flight events survive SPA navigation / unload.
 *  4. `content-type: text/plain` keeps the request CORS-simple (no preflight);
 *     `X-Monorail-Edge-Event-Created-At-Ms` is accepted by the Monorail edge.
 *  5. Fire-and-forget: never awaited on a render path, never blocks paint.
 */

const MONORAIL_ENDPOINT = "https://monorail-edge.shopifysvc.com/v1/produce";

// Identity lives in one place; UUIDs are always lowercase and read from storage
// so they stay stable across navigations (Monorail 400s on uppercase UUIDs).
export {
  CLIENT_ID_KEY,
  SESSION_TOKEN_KEY,
  MICRO_SESSION_ID_KEY,
  MICRO_SESSION_COUNT_KEY,
  getClientId,
  getSessionToken,
  getMicroSessionId,
  getMicroSessionCount,
} from "@/lib/analytics/identity";

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";


export type MonorailEvent = {
  schema_id: string;
  payload: Record<string, unknown>;
};

/**
 * Sends a single Monorail event directly from the visitor's browser.
 * Returns immediately; failures are swallowed (analytics must never break UX).
 */
export function sendMonorailEvent({ schema_id, payload }: MonorailEvent): void {
  if (!isBrowser()) return;

  const createdAtMs = Date.now();
  const body = JSON.stringify({
    schema_id,
    payload,
    metadata: {
      event_created_at_ms: createdAtMs,
      event_sent_at_ms: createdAtMs,
    },
  });

  try {
    void fetch(MONORAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        "X-Monorail-Edge-Event-Created-At-Ms": String(createdAtMs),
      },
      body,
      keepalive: true,
      credentials: "omit",
      mode: "cors",
    }).catch(() => {
      // Best-effort; likely blocked by ad-blocker
    });
  } catch (e) {
    // Silently fail if fetch throws (e.g. extension block)
  }
}

/** Sends several events without blocking; each one is an independent request. */
export function sendMonorailEvents(events: MonorailEvent[]): void {
  events.forEach(sendMonorailEvent);
}
