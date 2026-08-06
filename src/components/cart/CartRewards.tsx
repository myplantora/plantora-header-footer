import { memo, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/money";
import { REWARD_CODES, resolveRewardState, type RewardTier } from "@/lib/rewards";
import { useCartStore } from "@/stores/cartStore";

const LOCK_GIF =
  "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Lock.gif?v=1786051899";
const UNLOCK_GIF =
  "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Unlock.gif?v=1786051900";

type CardProps = {
  tier: RewardTier & { unlocked: boolean };
  applied: boolean;
  busy: boolean;
  onApply: (tier: RewardTier) => void;
};

const RewardCard = memo(function RewardCard({ tier, applied, busy, onApply }: CardProps) {
  const showApply = tier.type === "percentage" && tier.unlocked;

  return (
    <li
      className={`flex flex-col gap-3 rounded-[24px] bg-card p-4 shadow-soft transition-all duration-300 ease-in-out motion-reduce:transition-none ${
        tier.unlocked ? "opacity-100 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0" : "opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-button text-sm font-semibold tracking-wide text-primary">
            {tier.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Min. order {formatMoney(tier.threshold)}
            {tier.code ? ` · Code ${tier.code}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <img
            src={tier.unlocked ? UNLOCK_GIF : LOCK_GIF}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={28}
            height={28}
            className="size-7 animate-scale-in object-contain motion-reduce:animate-none"
            key={tier.unlocked ? "unlocked" : "locked"}
          />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {tier.unlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
      </div>

      {tier.type === "shipping" && tier.unlocked ? (
        <p className="rounded-full bg-secondary px-3 py-2 text-center font-button text-xs font-semibold text-[--reward-success]">
          FREE SHIPPING UNLOCKED
        </p>
      ) : null}

      {showApply ? (
        <button
          type="button"
          disabled={applied || busy}
          onClick={() => onApply(tier)}
          aria-label={applied ? `${tier.code} applied` : `Apply discount ${tier.code}`}
          className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[--reward-gold] px-4 font-button text-xs font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {applied ? "Applied ✓" : busy ? "Applying…" : "Apply Discount"}
        </button>
      ) : null}
    </li>
  );
});

export function CartRewards() {
  const subtotal = useCartStore((s) => s.subtotal);
  const discountCodes = useCartStore((s) => s.discountCodes);
  const setDiscountCodes = useCartStore((s) => s.setDiscountCodes);
  const isDiscountLoading = useCartStore((s) => s.isDiscountLoading);
  const isLoading = useCartStore((s) => s.isLoading);

  const [pending, setPending] = useState<string | null>(null);
  const autoSyncedFor = useRef<string | null>(null);

  const amount = subtotal?.amount ?? 0;
  const state = useMemo(() => resolveRewardState(amount), [amount]);

  // Codes the shopper added themselves are preserved on every update.
  const manualCodes = useMemo(
    () => discountCodes.filter((d) => !REWARD_CODES.includes(d.code)).map((d) => d.code),
    [discountCodes],
  );
  const activeRewardCode = useMemo(
    () => discountCodes.find((d) => REWARD_CODES.includes(d.code))?.code ?? null,
    [discountCodes],
  );

  // Upgrade to the best eligible reward, and drop it again if the subtotal falls.
  useEffect(() => {
    if (!activeRewardCode) return;
    if (activeRewardCode === state.bestCode) return;
    const key = `${activeRewardCode}->${state.bestCode ?? "none"}`;
    if (autoSyncedFor.current === key) return;
    autoSyncedFor.current = key;

    const next = state.bestCode ? [...manualCodes, state.bestCode] : manualCodes;
    void setDiscountCodes(next).then((ok) => {
      if (!ok && state.bestCode) return;
      toast.success(
        state.bestCode ? `Upgraded to ${state.bestCode}` : "Reward removed — subtotal dropped",
      );
    });
  }, [activeRewardCode, state.bestCode, manualCodes, setDiscountCodes]);

  const handleApply = async (tier: RewardTier) => {
    if (!tier.code) return;
    setPending(tier.code);
    try {
      const ok = await setDiscountCodes([...manualCodes, tier.code]);
      if (ok) toast.success(`${tier.code} applied — ${tier.label}`);
      else toast.error(`${tier.code} couldn't be applied to this cart`);
    } finally {
      setPending(null);
    }
  };

  const message = state.nextTier
    ? state.currentTier
      ? `You've unlocked ${state.currentTier.label}. You're only ${formatMoney(state.remaining)} away from ${state.nextTier.label}.`
      : `Spend ${formatMoney(state.remaining)} more to unlock ${state.nextTier.label}`
    : "Congratulations! You've unlocked every reward.";

  const busy = isDiscountLoading || isLoading;

  return (
    <section aria-label="Cart rewards" className="space-y-4">
      <p
        aria-live="polite"
        className={`text-center text-sm text-primary transition-opacity duration-300 motion-reduce:transition-none ${
          busy ? "opacity-60" : "opacity-100"
        }`}
      >
        {message}
      </p>

      <div className="relative pt-1">
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(state.fillPercent)}
          aria-label="Progress toward cart rewards"
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--reward-grad-start),var(--reward-grad-mid),var(--reward-grad-end))] transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
            style={{ width: `${state.fillPercent}%` }}
          />
        </div>

        <div aria-hidden="true" className="relative mt-1 h-4">
          {state.tiers.map((tier) => (
            <span
              key={tier.id}
              style={{ left: `${tier.position}%` }}
              className={`absolute -translate-x-1/2 text-[10px] font-medium transition-colors duration-300 motion-reduce:transition-none ${
                tier.unlocked ? "text-[--reward-success]" : "text-muted-foreground"
              }`}
            >
              {formatMoney(tier.threshold)}
            </span>
          ))}
        </div>
      </div>

      {isLoading && !subtotal ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.tiers.map((tier) => (
            <li
              key={tier.id}
              className="h-24 animate-pulse rounded-[24px] bg-secondary motion-reduce:animate-none"
            />
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.tiers.map((tier) => (
            <RewardCard
              key={tier.id}
              tier={tier}
              applied={activeRewardCode === tier.code}
              busy={busy || pending === tier.code}
              onApply={handleApply}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
