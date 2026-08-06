import { Star } from "lucide-react";
import type { PlantoraReviews } from "@/services/shopify/types";

export function ProductRating({ reviews }: { reviews: PlantoraReviews }) {
  const rounded = Math.round(reviews.average * 10) / 10;
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Rated ${rounded} out of 5 from ${reviews.total} reviews`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={
              i < Math.round(reviews.average)
                ? "size-3.5 fill-accent text-accent"
                : "size-3.5 text-border"
            }
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        {rounded.toFixed(1)}
        {reviews.total > 0 ? ` (${reviews.total})` : ""}
      </span>
    </div>
  );
}
