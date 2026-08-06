import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlantoraReviews } from "@/services/shopify/types";

export function ProductRating({
  reviews,
  tone = "default",
}: {
  reviews: PlantoraReviews;
  tone?: "default" | "berry";
}) {
  const rounded = Math.round(reviews.average * 10) / 10;
  return (
    <div
      className="flex items-center gap-1.5 pt-0.5"
      aria-label={`Rated ${rounded} out of 5 from ${reviews.total} reviews`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < Math.round(reviews.average)
                ? ""
                : tone === "berry"
                  ? "text-berry-foreground/40"
                  : "text-border",
            )}
            style={
              i < Math.round(reviews.average)
                ? { color: "#E9AD20", fill: "#E9AD20" }
                : undefined
            }
          />
        ))}
      </span>
      <span
        className={cn(
          "text-xs font-bold",
          tone === "berry" ? "text-berry-foreground/80" : "text-muted-foreground",
        )}
      >
        {rounded.toFixed(1)}
        {reviews.total > 0 ? ` (${reviews.total})` : ""}
      </span>
    </div>
  );
}
