import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";
import { resolveRewardState } from "@/lib/rewards";
import { useCartStore } from "@/stores/cartStore";

const LOCKED_GIF =
  "https://cdn.shopify.com/s/files/1/0646/8327/8550/files/Locked.gif?v=1721738691";
const UNLOCKED_GIF =
  "https://cdn.shopify.com/s/files/1/0646/8327/8550/files/Unlocked.gif?v=1721738691";

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

function CouponPill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <span className="relative mt-1 inline-block">
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy coupon code ${code}`}
        className="inline-flex items-center gap-1 rounded-[5px] border border-dashed border-[#A8622A] px-1.5 py-0.5 font-button text-[10px] font-semibold tracking-wide text-[#A8622A] transition-colors duration-300 hover:bg-[#A8622A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
      >
        <svg fill="none" height="7" width="12" viewBox="0 0 12 7" aria-hidden="true">
          <g fill="#A8622A">
            <path d="m1.2334.554688 5.65685 5.656852-.7071.70711-5.656858-5.65686z" />
            <path d="m11.8247 1.26221-5.65685 5.65685-.7071-.70711 5.65685-5.65685z" />
          </g>
        </svg>
        {code}
      </button>
      {copied ? (
        <span
          role="status"
          className="absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-[5px] bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground"
        >
          Copied to clipboard!
        </span>
      ) : null}
    </span>
  );
}

export function CartRewards() {
  const subtotal = useCartStore((s) => s.subtotal);

  const amount = subtotal?.amount ?? 0;
  const state = useMemo(() => resolveRewardState(amount), [amount]);

  const fill = useMemo(() => {
    if (state.tiers.length === 0) return 0;
    
    const unlockedCount = state.tiers.filter(t => t.unlocked).length;
    const currentTierIndex = unlockedCount - 1;
    const segmentWidth = 100 / state.tiers.length;
    
    let baseFill = unlockedCount === 0 ? 0 : (currentTierIndex + 0.5) * segmentWidth;
    
    const nextTier = state.nextTier;
    if (nextTier) {
      const currentThreshold = currentTierIndex >= 0 && state.tiers[currentTierIndex] ? state.tiers[currentTierIndex].threshold : 0;
      const nextThreshold = nextTier.threshold;
      const range = nextThreshold - currentThreshold;
      const progressInRange = (amount - currentThreshold) / range;
      
      if (unlockedCount === 0) {
        return Math.min(Math.max(progressInRange, 0), 1) * (0.5 * segmentWidth);
      }
      
      return baseFill + Math.min(Math.max(progressInRange, 0), 1) * segmentWidth;
    }
    
    return baseFill;
  }, [state, amount]);

  const activeCode = state.bestCode;

  return (
    <section aria-label="Cart rewards" className="space-y-4">
      <p aria-live="polite" className="text-center text-sm text-primary">
        {state.nextTier ? (
          <>
            You are{" "}
            <span className="font-semibold text-[#A8622A]">{formatMoney(state.remaining)}</span> away
            from <span className="font-semibold">{state.nextTier?.label}</span> above{" "}
            {formatMoney(state.nextTier?.threshold ?? 0)}
          </>
        ) : (
          <>
            You&apos;ve unlocked <span className="font-semibold">{state.currentTier?.label}</span> —
            the best reward available.
          </>
        )}
      </p>

      <div 
        className="relative flex items-start justify-between px-2"
        role="list"
        aria-label="Reward milestones"
      >
        <div className="absolute inset-x-0 top-5 h-1.5 -translate-y-1/2 rounded-full bg-secondary ml-[calc(100%/8)] mr-[calc(100%/8)]" />
        <div
          className="absolute left-0 top-5 h-1.5 -translate-y-1/2 rounded-full transition-[width,background-color] duration-500 ease-in-out motion-reduce:transition-none ml-[calc(100%/8)]"
          style={{ 
            width: `calc((${Math.min(fill, 100)}% - ${100/4}%) * 1)`,
            backgroundColor: `oklch(from var(--reward-success) calc(l - ${Math.min(fill / 400, 0.15)}) c h)`
          }}
        />

        {state.tiers.map((tier, index) => {
          const isCurrent = state.currentTier?.id === tier.id;
          const isNext = state.nextTier?.id === tier.id;
          
          return (
            <div 
              key={tier.id} 
              className="relative z-10 flex flex-1 flex-col items-center"
              role="listitem"
            >
              <div className="flex flex-col items-center min-w-[64px]">
                <span
                  className={`relative flex size-9 sm:size-10 items-center justify-center overflow-hidden rounded-full ring-4 ring-background transition-colors duration-300 motion-reduce:transition-none ${
                    tier.unlocked ? "bg-[var(--reward-success)]" : "bg-secondary"
                  }`}
                  aria-hidden="true"
                >
                  <img
                    src={tier.unlocked ? UNLOCKED_GIF : LOCKED_GIF}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={48}
                    height={48}
                    className="size-8 sm:size-10 -translate-y-[2px] scale-[0.8] object-contain"
                  />
                </span>
                <p
                  className={`mt-1.5 text-center text-[10px] sm:text-[11px] font-medium leading-tight px-1 ${
                    tier.unlocked ? "text-primary" : "text-muted-foreground"
                  } ${isCurrent || isNext ? "font-bold" : ""}`}
                  aria-label={`${tier.label}: ${tier.unlocked ? 'Unlocked' : 'Locked'}${isCurrent ? ' (Current Reward)' : ''}${isNext ? ' (Next Goal)' : ''}`}
                >
                  {tier.label}
                </p>
                {tier.code && tier.code === activeCode ? <CouponPill code={tier.code} /> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E9AD20] px-4 font-button text-base font-medium text-white">
        <img
          src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Discount.webp?v=1786051899"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={24}
          height={24}
          className="size-6 object-contain"
        />
        Apply discounts at the checkout
      </div>
    </section>
  );
}