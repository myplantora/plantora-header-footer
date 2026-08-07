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
    <ul className="flex flex-wrap gap-1.5">
      {badges.slice(0, 2).map((badge, index) => (
        <li
          key={badge.key}
          style={{
            backgroundColor: TAG_BACKGROUNDS[index % TAG_BACKGROUNDS.length],
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[11px] font-medium text-primary",
          )}
        >
          {badge.iconUrl ? (
            <img
              src={badge.iconUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="size-4 shrink-0 object-contain"
            />
          ) : null}
          {badge.label}
        </li>
      ))}
    </ul>
  );
}
