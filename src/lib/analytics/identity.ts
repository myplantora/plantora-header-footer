/**
 * Browser-only visitor identity for Shopify Monorail events.
 *
 * Monorail's trekkie_storefront_page_view/1.4 schema validates UUID fields
 * strictly: they must be lowercase, spec-compliant v4 UUIDs. Any uppercase hex
 * (as produced by some legacy/hand-rolled generators) is rejected with HTTP 400.
 *
 * Identity is read from storage first and only generated when missing, so it
 * stays stable across navigations within the page session.
 */

export const CLIENT_ID_KEY = "plantora_client_id";
export const SESSION_TOKEN_KEY = "plantora_session_token";
export const MICRO_SESSION_ID_KEY = "plantora_micro_session_id";
export const MICRO_SESSION_COUNT_KEY = "plantora_micro_session_count";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

/** Spec-compliant v4 UUID, always lowercase. */
export function newUuid(): string {
  try {
    return window.crypto.randomUUID().toLowerCase();
  } catch {
    // RFC 4122 v4 fallback built on getRandomValues.
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = ((bytes[6] as number) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] as number) & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}

type Store = "local" | "session";

function storage(kind: Store): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Reads a persisted UUID, normalising legacy uppercase values in place.
 * Generates and persists a new one when missing or malformed.
 */
function readOrCreateUuid(kind: Store, key: string): string {
  if (!isBrowser()) return "";
  const store = storage(kind);
  if (!store) return "";
  try {
    const existing = store.getItem(key);
    if (existing) {
      const normalized = existing.toLowerCase();
      if (UUID_RE.test(normalized)) {
        if (normalized !== existing) store.setItem(key, normalized);
        return normalized;
      }
    }
    const created = newUuid();
    store.setItem(key, created);
    return created;
  } catch {
    return "";
  }
}

/** Stable per-visitor id (localStorage) → Monorail `uniqToken`. */
export function getClientId(): string {
  return readOrCreateUuid("local", CLIENT_ID_KEY);
}

/** Per-session token (sessionStorage) → Monorail `visitToken`. */
export function getSessionToken(): string {
  return readOrCreateUuid("session", SESSION_TOKEN_KEY);
}

/** Per-session micro session id (sessionStorage) → Monorail `microSessionId`. */
export function getMicroSessionId(): string {
  return readOrCreateUuid("session", MICRO_SESSION_ID_KEY);
}

/**
 * Returns the current micro session count (1 on the first event of a session)
 * and increments the stored value for the next call.
 */
export function getMicroSessionCount(): number {
  if (!isBrowser()) return 1;
  const store = storage("session");
  if (!store) return 1;
  try {
    const raw = store.getItem(MICRO_SESSION_COUNT_KEY);
    const parsed = raw === null ? NaN : parseInt(raw, 10);
    const current = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
    store.setItem(MICRO_SESSION_COUNT_KEY, String(current + 1));
    return current;
  } catch {
    return 1;
  }
}
