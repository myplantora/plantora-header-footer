import { useMemo } from "react";
import { formatMoney } from "@/lib/money";
import { resolveRewardState } from "@/lib/rewards";
import { useCartStore } from "@/stores/cartStore";

// NOTE: GIF mapping is intentionally inverted vs. the file names — the artwork
// in Lock.gif shows the open state and vice versa.
const LOCKED_GIF =
  "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Unlock.gif?v=1786051900";
const UNLOCKED_GIF =
  "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Lock.gif?v=1786051899";

/** Appends the best earned coupon to the Shopify checkout URL. */
export function buildCheckoutUrl(checkoutUrl: string | null, code: string | null) {
  if (!checkoutUrl) return "#";
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    if (code) url.searchParams.set("discount", code);
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

export function CartRewards() {
  const subtotal = useCartStore((s) => s.subtotal);
  const checkoutUrl = useCartStore((s) => s.checkoutUrl);

  const amount = subtotal?.amount ?? 0;
  const state = useMemo(() => resolveRewardState(amount), [amount]);

  const activeIndex = state.tiers.reduce(
    (acc, tier, i) => (tier.unlocked ? i : acc),
    -1,
  );
  const highlightIndex = activeIndex >= 0 ? activeIndex : 0;

  const message = state.nextTier ? (
    <>
      You are <span className="font-semibold text-[--reward-gold]">{formatMoney(state.remaining)}</span>{" "}
      away from <span className="font-semibold">{state.nextTier.label}</span> on orders above{" "}
      {formatMoney(state.nextTier.threshold)}
    </>
  ) : (
    <>
      You&apos;ve unlocked <span className="font-semibold">{state.currentTier?.label}</span> — the best
      reward available.
    </>
  );

  const activeCode = state.bestCode;

  return (
    <section aria-label="Cart rewards" className="space-y-4">
      <p aria-live="polite" className="text-center text-sm text-primary">
        {message}
      </p>

      <div>
        <div className="relative flex items-center justify-between">
          {/* track */}
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-secondary" />
          <div
            className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[--reward-success] transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
            style={{
              width:
                activeIndex < 0
                  ? "0%"
                  : `${((highlightIndex + 0.5) / state.tiers.length) * 100}%`,
            }}
          />

          {state.tiers.map((tier, i) => (
            <div key={tier.id} className="relative z-10 flex flex-1 flex-col items-center gap-1">
              <span
                className={`flex size-9 items-center justify-center rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                  i === highlightIndex && tier.unlocked
                    ? "bg-[--reward-success] ring-4 ring-background"
                    : "bg-secondary ring-4 ring-background"
                }`}
              >
                <img
                  src={tier.unlocked ? UNLOCKED_GIF : LOCKED_GIF}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  width={18}
                  height={18}
                  className="size-[18px] object-contain"
                />
              </span>
              <span
                className={`text-center text-xs font-medium ${
                  tier.unlocked ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tier.label}
              </span>
              <span className="sr-only">{tier.unlocked ? "Unlocked" : "Locked"}</span>
            </div>
          ))}
        </div>

        {activeCode ? (
          <div className="mt-2 flex justify-start">
            <span className="rounded-full border border-[--reward-gold] px-3 py-1 font-button text-xs font-semibold tracking-wide text-[--reward-gold]">
              {activeCode}
            </span>
          </div>
        ) : null}
      </div>

      <a
        href={buildCheckoutUrl(checkoutUrl, activeCode)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[--reward-gold] px-4 font-button text-base font-medium text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        Apply discounts at the checkout
      </a>
    </section>
  );
}
