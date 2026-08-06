# Shopify Analytics for Plantora Headless Storefront

## Goal
Wire up Shopify analytics using `@shopify/hydrogen-react`'s `sendShopifyAnalytics` so the headless storefront sends `PAGE_VIEW` events for home, product, collection, and list-collections pages to Shopify's analytics endpoint.

## Decisions from clarification
- **Approach**: Install and use `@shopify/hydrogen-react` (`sendShopifyAnalytics`, `getClientBrowserParameters`, `AnalyticsEventName`, `AnalyticsPageType`, `useShopifyCookies`).
- **Events**: Page views only for now (`PAGE_VIEW`). Add-to-cart can be added later.
- **shopDomain**: `checkout.myplantora.com`.
- **storefrontId**: hardcoded as `9e366b4208cebbaad6a5996c768455e3` in `config/globalconf.json`.
- **Consent**: hardcoded `true` for `hasUserConsent`, `analyticsAllowed`, `marketingAllowed`, `saleOfDataAllowed`.
- **Shop ID**: `gid://shopify/Shop/101462671653` (provided by user).

## Implementation steps

1. **Add analytics config to `config/globalconf.json`**
   - Add `shopId` with value `gid://shopify/Shop/101462671653`.
   - Add `storefrontId` with value `9e366b4208cebbaad6a5996c768455e3`.
   - Add `shopDomain` with value `checkout.myplantora.com`.

2. **Install dependency**
   - `bun add @shopify/hydrogen-react`.

3. **Create `src/services/shopify/analytics.ts`**
   - Build a `sendShopifyPageView(payloadExtras)` helper.
   - Merge `getClientBrowserParameters()` with static shop data and consent flags.
   - Call `sendShopifyAnalytics({ eventName: AnalyticsEventName.PAGE_VIEW, payload }, shopDomain)`.
   - Guard all browser-only APIs behind `typeof window !== 'undefined'` so SSR does not crash.

4. **Create `src/hooks/useShopifyPageView.ts`**
   - Use TanStack Router's `useRouter` / `useMatches` to detect the current route.
   - Map routes to Shopify `pageType`:
     - `/` → `home`
     - `/product/$handle` → `product`
     - `/collections/$handle` → `collection`
     - `/collections/` → `listCollections`
   - For product routes: include `resourceId` (product GID) and a `products` array with the viewed product.
   - For collection routes: include `collectionHandle`, `collectionId`, and `resourceId`.
   - For list-collections: use `pageType: 'listCollections'`.
   - Fire on initial render and on every route change.

5. **Integrate globally in `src/routes/__root.tsx`**
   - Render `<ShopifyAnalyticsProvider />` (or call `useShopifyPageView` directly) inside `RootComponent` so it wraps every route.
   - Optionally call `useShopifyCookies()` from `@shopify/hydrogen-react` to set Shopify's `_shopify_y` / `_shopify_s` cookies for consistent session attribution.

6. **Handle missing search route**
   - The app currently has no search route. Search `PAGE_VIEW` support will be added when a search page is built, or we can prepare the helper to accept `searchString` and leave it unused for now.

## Files to change / create
- `config/globalconf.json` — add analytics fields.
- `package.json` — add `@shopify/hydrogen-react`.
- `src/services/shopify/analytics.ts` — new analytics helper.
- `src/hooks/useShopifyPageView.ts` — new route-aware hook.
- `src/routes/__root.tsx` — mount the analytics hook.

## Validation
- Build passes (`bun run build`).
- Navigating between home, product, and collection pages triggers a network request to Shopify's analytics endpoint (visible in DevTools).
- Payload contains correct `shopId`, `storefrontId`, `shopifySalesChannel: 'headless'`, `pageType`, and route-specific IDs.
- No SSR errors from browser-only APIs.

## Notes
- `sendShopifyAnalytics` is browser-only; all calls are gated to the client.
- Consent is hardcoded to `true`. If a cookie banner is added later, consent flags should be wired to that state.
- Add-to-cart events are out of scope for this plan but can reuse the same analytics helper.
