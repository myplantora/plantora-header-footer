# Clean Shopify Storefront Integration Rebuild

This plan replaces the current cart and documentation structure with a production-ready system based on the 2025-07 Storefront API, as requested. It enforces a strict "Check Availability → Create Empty → Add Lines" flow to ensure cross-browser reliability (specifically targeting Brave and Safari) and provides a dedicated documentation route for developers.

## User Review Required

> [!IMPORTANT]
> This will overwrite the existing `src/stores/cartStore.ts` and `src/lib/cartQueries.ts` to strictly follow the Shopify 2025-07 patterns.

- **Check Availability**: Verifies `availableForSale` before any mutation.
- **Empty Creation**: Calls `cartCreate` with an empty input first.
- **Async Addition**: Adds lines via `cartLinesAdd` with built-in settle delays.
- **Documentation**: Adds a developer-only route with the requested documentation text.

## Technical Details

### 1. Unified Cart Flow
- **cartStore.ts**: 
    - Implements `STALE_CART_ERRORS` detection for `FAKEID123` and expired sessions.
    - Uses `localStorage` key `plantora_cart_id`.
    - 1500ms settle-delay between creation and line addition.
    - Max 2 retries for "OOS" warnings to account for cache lag.
- **cartQueries.ts**: Updated to use `CartInput` and `CartLineInput` types correctly.

### 2. Documentation Route
- Created `src/routes/api/docs.tsx` (accessible at `/api/docs`) containing the full text provided by the user for quick reference during development.

### 3. Analytics & Validation
- **analytics.ts**: Fires `plantora:cart:updated` for GTM/GA4 consumption.
- **monorail.ts**: Browser-direct transport for visitor IP accuracy.

## Implementation Steps

1. **Update Cart Logic**: Rewrite `src/stores/cartStore.ts` and `src/lib/cartQueries.ts`.
2. **Add Documentation**: Create the reference documentation file.
3. **Validation**: Run the cross-browser Playwright test suite to confirm "Add to Basket" reliability.
