import { cn } from "@/lib/utils";
import type { PlantoraBadge } from "@/services/shopify/types";

const TAG_BACKGROUNDS = ["#F0D2D2", "#EEE9D1", "#C2E8E8", "#E2E2F3"];

export function ProductBadges({
  badges,
  tone = "default",
}: {
  badges: PlantoraBadge[];
  tone?: "default" | "berry";
}) {
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.slice(0, 2).map((badge) => (
        <span
          key={badge.key}
          className="inline-flex items-center gap-1 rounded-full bg-[#D1E8E2] px-2.5 py-1 text-[11px]  text-[#1D4D44]"
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
