# MyPlantora Cart/Checkout E2E Findings

Date: 2026-08-12
URL tested: https://myplantora.com/
Tooling: Chrome DevTools MCP

## Observed failures

1. Add-to-cart action left cart empty in UI.
- Evidence: Cart drawer showed "Your cart is currently empty" and subtotal `0` after clicking an `ADD TO BASKET` button.
- Console evidence: `[Cart] Suppressed out-of-stock warning`.

2. Checkout action was interruptible.
- Existing code path used `window.open(..., "_blank")`, which can be blocked by popup blockers depending on browser settings.

## Fixes applied in code

1. Strict out-of-stock handling during add-to-cart.
- File: src/stores/cartStore.ts
- Behavior: If Shopify returns `warnings` containing `MERCHANDISE_OUT_OF_STOCK`, show toast, return failure, and skip cart state update.
- Also added preflight inventory guard input (`availableForSale`, `quantityAvailable`) to short-circuit API call.

2. Improved cart id resilience.
- File: src/stores/cartStore.ts
- Behavior: Uses in-memory `cartId` or persisted localStorage cart id, and recreates stale carts automatically.

3. Uninterrupted checkout navigation.
- File: src/components/cart/CartDrawer.tsx
- Behavior: Replaced new-tab popup flow with same-tab navigation via `handleCheckout(url)`.

4. Monorail cart_updated guardrails.
- File: src/lib/analytics/cartEvents.ts
- Behavior: Added `fireCartUpdated` guard checks so event only fires when `cart_token` exists and `line_items_count > 0`, with runtime timestamp from `Date.now()`.

## Log artifacts

- Network log: tests/manual-logs/myplantora-network-log.txt
- Console log: tests/manual-logs/myplantora-console-log.txt
