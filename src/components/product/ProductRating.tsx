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
      className="flex items-center gap-1"
      aria-label={`Rated ${rounded} out of 5 from ${reviews.total} reviews`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className="size-3.5 fill-[#E9AD20] text-[#E9AD20]"
          />
        ))}
      </span>
      <span className="text-[13px] font-medium text-primary">
        {rounded.toFixed(1)} <span className="text-muted-foreground mx-0.5">|</span> {reviews.total}
      </span>
    </div>
  );
}
