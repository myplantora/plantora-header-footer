/**
 * Cart reward ladder configuration.
 * Tiers can be added / repriced / renamed here without touching components.
 */

export type RewardTier = {
  id: string;
  threshold: number;
  /** Short badge label, e.g. "FREE SHIPPING" or "10% OFF". */
  label: string;
  type: "shipping" | "percentage";
  /** Coupon code applied to the Shopify cart. Null for free shipping. */
  code: string | null;
};

export const REWARD_TIERS: RewardTier[] = [
  { id: "free-shipping", threshold: 99, label: "FREE SHIPPING", type: "shipping", code: null },
  { id: "plant10", threshold: 149, label: "10% OFF", type: "percentage", code: "PLANT10" },
  { id: "plant12", threshold: 199, label: "12% OFF", type: "percentage", code: "PLANT12" },
  { id: "plant20", threshold: 299, label: "20% OFF", type: "percentage", code: "PLANT20" },
];

export const REWARD_CODES = REWARD_TIERS.map((t) => t.code).filter(
  (c): c is string => Boolean(c),
);

export type RewardState = {
  tiers: (RewardTier & { unlocked: boolean; /** 0-100 position on the track */ position: number })[];
  /** Highest unlocked tier, or null. */
  currentTier: RewardTier | null;
  /** Next locked tier, or null when everything is unlocked. */
  nextTier: RewardTier | null;
  /** Dollars still needed for `nextTier`. */
  remaining: number;
  /** 0-100 fill of the progress bar, scaled proportionally to the thresholds. */
  fillPercent: number;
  /** Highest unlocked coupon code, or null. */
  bestCode: string | null;
};

const MAX_THRESHOLD = REWARD_TIERS[REWARD_TIERS.length - 1]!.threshold;

/** Pure calculation of the whole rewards UI state from a subtotal. */
export function resolveRewardState(subtotal: number): RewardState {
  const amount = Math.max(0, subtotal);

  const tiers = REWARD_TIERS.map((tier) => ({
    ...tier,
    unlocked: amount >= tier.threshold,
    // Proportional to real dollars, so gaps reflect actual spend.
    position: (tier.threshold / MAX_THRESHOLD) * 100,
  }));

  const unlocked = tiers.filter((t) => t.unlocked);
  const currentTier = unlocked.length ? (unlocked[unlocked.length - 1] as RewardTier) : null;
  const nextTier = tiers.find((t) => !t.unlocked) ?? null;

  const bestUnlockedCode = [...unlocked].reverse().find((t) => t.code)?.code ?? null;

  return {
    tiers,
    currentTier,
    nextTier,
    remaining: nextTier ? Math.max(0, nextTier.threshold - amount) : 0,
    fillPercent: Math.min(100, (amount / MAX_THRESHOLD) * 100),
    bestCode: bestUnlockedCode,
  };
}
