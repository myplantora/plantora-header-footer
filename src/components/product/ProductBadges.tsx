import type { PlantoraBadge } from "@/services/shopify/types";

export function ProductBadges({ badges }: { badges: PlantoraBadge[] }) {
  if (badges.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {badges.slice(0, 2).map((badge) => (
        <li
          key={badge.key}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-primary"
        >
          {badge.iconUrl ? (
            <img src={badge.iconUrl} alt="" aria-hidden="true" loading="lazy" className="size-3.5" />
          ) : null}
          {badge.label}
        </li>
      ))}
    </ul>
  );
}
