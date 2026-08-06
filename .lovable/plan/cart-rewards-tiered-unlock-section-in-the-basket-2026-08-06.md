# Cart Rewards — tiered unlock section in the basket

A premium rewards module at the top of the cart drawer that shows how close the shopper is to the next reward, and lets them apply the best coupon they've earned.

## Reward ladder

| Threshold | Reward | Coupon |
|---|---|---|
| $99 | Free shipping | none |
| $149 | 10% off | PLANT10 |
| $199 | 12% off | PLANT12 |
| $299 | 20% off | PLANT20 |

## What the shopper sees

- **Progress bar** — a single track above the cards with a left-to-right gradient fill (#DDF7E8 → #9DDDB8 → #248057), animating over 300ms whenever the subtotal changes. Tick marks sit at each of the four thresholds.
- **Dynamic message** — "Spend $34 more to unlock FREE SHIPPING". Once a tier is earned it congratulates and points at the next one: "You've unlocked FREE SHIPPING. You're only $12 away from 10% OFF." At the top tier it just celebrates.
- **Four reward cards** — white, 24px corners, soft shadow, generous padding. Left: the reward badge (FREE SHIPPING / 10% OFF …). Right: minimum order amount, coupon code (when there is one), and a lock state.
- **Lock state** — locked cards show the Lock GIF, read "Locked", and sit at slightly reduced opacity. Unlocked cards swap to the Unlock GIF with a short fade/scale transition and read "Unlocked". Both GIFs are lazy-loaded from the Shopify CDN URLs supplied.
- **Apply Discount** — pill button, #E9AD20 with white text, on unlocked percentage cards only. After applying it reads "Applied ✓" and is disabled. The free-shipping card never gets a button; when eligible it reads "FREE SHIPPING UNLOCKED".
- **One coupon at a time** — applying a coupon replaces any previously applied one. If a higher tier unlocks while a lower coupon is active, the module automatically upgrades to the highest eligible coupon.
- **Downgrade handling** — if the subtotal drops below the tier that earned the active coupon, that coupon is removed from the cart and the card returns to its locked state, with the message and bar following it back down.
- **Existing and manual coupons** — a coupon the shopper typed in themselves (or one carried over from a previous session) is detected on load. If it isn't one of our reward codes, it's left alone and the reward buttons stay available but never overwrite it silently; the card shows the code as already applied when it matches a tier.
- **Shopify is the source of truth** — "Applied ✓" and the active-coupon state always reflect what Shopify says is applicable on the cart, not an optimistic local guess. If Shopify rejects a code, the button resets and the shopper is told.
- **Persistent state** — the applied reward survives page reloads and returning to the site, because it lives on the Shopify cart itself rather than in component state.
- **Loading state** — while the cart or a discount request is in flight, the bar and cards render a subtle skeleton/disabled state rather than flashing wrong values.
- **Success feedback** — applying a discount fires a compact success toast (matching the existing green add-to-cart toast) confirming the code and the saving.

Everything reacts live to the cart subtotal — add or remove an item and the bar, message, icons, and buttons update with no refresh.

## Progress bar scaling and configuration

The bar is scaled proportionally to the dollar thresholds, so the gap between $99 and $149 is visibly smaller than the gap between $199 and $299 — the marker positions reflect real spend, not four evenly spaced steps.

The whole ladder (thresholds, labels, coupon codes, discount type) comes from a single config object, so tiers can be added, removed, repriced, or renamed without touching component code.

## Motion and reduced motion

Animations respect `prefers-reduced-motion`: when the shopper has it enabled, the progress fill, unlock transition, and card elevation snap to their end state instead of animating.


## Placement

Replaces the existing "away from free shipping" strip at the top of the cart drawer, keeping the same position above the line items. It's built as a standalone component so it can also be dropped on a cart page later.

## Technical notes

- New `src/components/cart/CartRewards.tsx` plus a small pure `src/lib/rewards.ts` holding the tier config and the `resolveRewardState(subtotal)` calculation (current tier, next tier, remaining amount, fill percent, best eligible coupon). Memoized with `useMemo`; cards are `React.memo`.
- Coupon application uses the Storefront API `cartDiscountCodesUpdate` mutation added to `src/stores/cartStore.ts` as `applyDiscountCode(code)`, with `discountCodes` (code + `applicable`) read back into store state from the existing `CartFields` fragment so "Applied ✓" reflects Shopify's real answer, not local state. Auto-upgrade runs in an effect that fires only when the best eligible coupon changes.
- Subtotal comes from the existing `useCartStore` `subtotal` field; amounts formatted with `formatMoney`.
- Colors are added as tokens in `src/styles.css` (`--reward-success`, gradient stops) rather than hardcoded in the component; the 24px radius is applied explicitly since the global radius is 5px by your earlier instruction.
- Accessibility: `role="progressbar"` with aria value/label, list semantics for the cards, `aria-live="polite"` on the message, real `<button>` elements with visible focus rings, and status text alongside the GIFs so state isn't conveyed by image alone.
- Responsive: single-column stacked cards on mobile, two-column grid from `sm:` up inside the drawer width.
