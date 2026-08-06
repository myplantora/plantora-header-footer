import { cn } from "@/lib/utils";
import type { PlantoraBadge } from "@/services/shopify/types";

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
      {badges.slice(0, 2).map((badge) => (
        <li
          key={badge.key}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            tone === "berry"
              ? "bg-berry-foreground/15 text-berry-foreground"
              : "bg-secondary text-primary",
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
