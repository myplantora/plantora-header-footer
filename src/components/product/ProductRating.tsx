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
      className="flex items-center gap-1.5 leading-none w-max"
      aria-label={`Rated ${rounded} out of 5 from ${reviews.total} reviews`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => {
          const isFull = i + 1 <= Math.floor(reviews.average);
          const isHalf = !isFull && i < reviews.average;
          return (
            <span key={i} className="relative text-[14px] leading-none inline-flex items-center justify-center">
              <span className="text-[#eee]">★</span>
              {isFull ? (
                <span className="text-[#E9AD20] absolute inset-0 flex items-center justify-center">★</span>
              ) : isHalf ? (
                <span className="text-[#E9AD20] absolute inset-0 flex items-center justify-center overflow-hidden" style={{ width: '50%' }}>★</span>
              ) : null}
            </span>
          );
        })}
      </span>
      <span className="text-[12px] font-bold text-[#707070] pt-[1px]">
        {rounded.toFixed(1)} | {reviews.total}
      </span>
    </div>
  );
}
