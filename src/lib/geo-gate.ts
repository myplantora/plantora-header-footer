/**
 * Edge geographic access control.
 *
 * Runs inside the Cloudflare Worker fetch handler (src/server.ts), before the
 * TanStack Start app or any route handler executes. This is the WAF-equivalent
 * layer for this deployment: there is no Vercel Firewall here.
 *
 * Allow list:
 *   - Country == US (all states)
 *   - Country == IN AND region == TN (Tamil Nadu only)
 *
 * Geo signals come exclusively from the edge (Cloudflare `request.cf` and the
 * `cf-*` headers the edge injects). Client-supplied values are never trusted.
 */

const ALLOWED_COUNTRIES = new Set(["US"]);
const ALLOWED_REGIONS_BY_COUNTRY: Record<string, Set<string>> = {
  IN: new Set(["TN"]),
};

// Hostnames that must never be gated: local dev and Lovable preview/editor.
function isExemptHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    hostname.includes("id-preview--") ||
    hostname.endsWith("-dev.lovable.app") ||
    hostname.endsWith(".lovableproject.com")
  );
}

// Machine-to-machine + crawler surfaces stay reachable so Shopify callbacks,
// sitemaps and SEO crawling keep working.
function isExemptPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/sitemap") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_serverFn/") ||
    pathname.startsWith("/_build/") ||
    pathname.startsWith("/assets/")
  );
}

type EdgeGeo = { country?: string | undefined; region?: string | undefined };

function readEdgeGeo(request: Request): EdgeGeo {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf;
  const country =
    (typeof cf?.["country"] === "string" ? (cf["country"] as string) : undefined) ??
    request.headers.get("cf-ipcountry") ??
    undefined;
  const region =
    (typeof cf?.["regionCode"] === "string" ? (cf["regionCode"] as string) : undefined) ??
    request.headers.get("cf-region-code") ??
    undefined;

  return {
    country: country?.toUpperCase(),
    region: region?.toUpperCase(),
  };
}

export function isGeoAllowed(geo: EdgeGeo): boolean {
  const country = geo.country;

  // Unknown / reserved country codes (Tor "T1", "XX", missing header when the
  // edge cannot resolve the IP) fail open — blocking them would silently break
  // legitimate traffic and platform health checks.
  if (!country || country === "XX" || country === "T1") return true;

  if (ALLOWED_COUNTRIES.has(country)) return true;

  const allowedRegions = ALLOWED_REGIONS_BY_COUNTRY[country];
  if (allowedRegions) {
    // Region unresolved for an allowed country: fail open rather than block a
    // real Tamil Nadu visitor whose region lookup is missing.
    if (!geo.region) return true;
    return allowedRegions.has(geo.region);
  }

  return false;
}

function blockedPage(): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Not available in your region</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#F9F9F9;color:#1D4D44;font-family:ui-sans-serif,system-ui,sans-serif;padding:24px}
  .card{max-width:30rem;text-align:center}
  h1{font-size:1.5rem;font-weight:400;margin:0 0 .75rem}
  p{margin:0;color:#4b5563;font-size:.95rem;line-height:1.6}
  a{color:#1D4D44}
</style></head>
<body><div class="card">
  <h1>Plantora isn&rsquo;t available in your region</h1>
  <p>We currently ship only within the United States and Tamil Nadu, India.
  If you believe this is a mistake, email
  <a href="mailto:care@myplantora.com">care@myplantora.com</a>.</p>
</div></body></html>`;
}

/**
 * Returns a 403 Response when the request must be blocked, or `undefined` to
 * let it through.
 */
export function enforceGeoAccess(request: Request): Response | undefined {
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return undefined;
  }

  if (isExemptHost(url.hostname) || isExemptPath(url.pathname)) return undefined;

  const geo = readEdgeGeo(request);
  if (isGeoAllowed(geo)) return undefined;

  return new Response(blockedPage(), {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-geo-block": `${geo.country ?? "??"}-${geo.region ?? "??"}`,
    },
  });
}
