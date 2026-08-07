import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useCartStore } from "@/stores/cartStore";
import type { PlantoraProductCard } from "@/services/shopify/types";
import { ProductBadges } from "./ProductBadges";
import { ProductRating } from "./ProductRating";

type ProductCardProps = {
  product: PlantoraProductCard;
  priority?: boolean;
  /** "berry" renders the highlighted #B3393F card, "default" the white card. */
  tone?: "default" | "berry";
  className?: string;
};

export function ProductCard({
  product,
  priority = false,
  tone = "default",
  className,
}: ProductCardProps) {
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0] ?? ""]))
  );

  const berry = tone === "berry";
  const soldOut = product.availability === "out_of_stock";

  async function handleAdd() {
    if (!product.defaultVariantId || soldOut || pending) return;
    setPending(true);
    openCart();
    try {
      await addLine(product.defaultVariantId, 1);
      toast.success(`${product.title} added to basket`);
    } catch {
      toast.error("Could not add to basket. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const sizeOption = product.options[0];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[19px] border transition-all duration-300 hover:shadow-soft",
        berry ? "border-berry bg-[#CAC2E0]" : "border-border bg-card",
        className
      )}
    >
      <Link
        to="/product/$handle"
        params={{ handle: product.handle }}
        className="relative block overflow-hidden bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="aspect-square w-full">
          {product.featuredImage ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              width={600}
              height={600}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "size-full object-cover transition-transform duration-700 group-hover:scale-110",
                product.hoverImage && "group-hover:opacity-0"
              )}
            />
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted-foreground">
              No image
            </div>
          )}
          {product.hoverImage ? (
            <img
              src={product.hoverImage.url}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
            />
          ) : null}
        </div>

        {/* Custom Tag Shape (metafield/tag media) */}
        {product.tagMedia ? (
          <div className="custom_shape absolute left-[-15px] top-[-15px] z-20 rounded-br-[19px] rounded-tl-[19px] bg-white p-[11px] shadow-sm max-md:left-[-9px] max-md:top-[-9px] max-md:rounded-br-[18px] max-md:rounded-tl-[18px]">
            <img
              src={product.tagMedia.url}
              alt={product.tagMedia.altText || ""}
              loading="lazy"
              className="h-auto w-[41px] max-md:w-[20px]"
            />
          </div>
        ) : null}
      </Link>

      <div className={cn("flex flex-1 flex-col gap-2 p-3", berry && "px-[10px] pb-3")}>
        {/* Rating and Reviews */}
        {product.reviews ? (
          <div className="flex items-center gap-1">
            <ProductRating reviews={product.reviews} tone={tone} />
          </div>
        ) : null}

        {/* Title */}
        <h3
          className={cn(
            "min-w-0 font-sans text-[14px] font-semibold leading-tight",
            berry ? "text-[#1d4d43]" : "text-[#1C6644]"
          )}
        >
          <Link
            to="/product/$handle"
            params={{ handle: product.handle }}
            className="line-clamp-2 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {product.title}
          </Link>
        </h3>

        {/* Price and Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-[15px] font-bold",
                berry ? "text-[#1d4d43]" : "text-black"
              )}
            >
              {formatMoney(product.price.amount, product.price.currency)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-[13px] text-muted-foreground line-through">
                {formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currency)}
              </span>
            ) : null}
          </div>

          {product.badges.length > 0 && (
            <div className="tag-container flex flex-row-reverse items-center justify-end gap-1">
              {product.badges.slice(0, 2).map((badge, idx) => (
                <span
                  key={badge.key}
                  className={cn(
                    "flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    idx === 0 ? "bg-[#C3E8E8] text-[#1d4d43]" : "bg-[#F2E8C2] text-[#1d4d43]"
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sizes (Simplified for Revamp) */}
        {sizeOption ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {sizeOption.values.map((value) => {
              const active = selected[sizeOption.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelected((prev) => ({ ...prev, [sizeOption.name]: value }));
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-primary hover:border-primary"
                  )}
                >
                  {value.replace(/\s*pot\s*/i, "")}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || pending || !product.defaultVariantId}
            className={cn(
              "inline-flex h-[42px] w-full items-center justify-center rounded-full px-4 font-button text-sm font-bold transition-all duration-300 hover:shadow-soft disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              berry
                ? "bg-[#1d4d43] text-white hover:bg-[#1d4d43]/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {soldOut ? "Sold out" : "Add to Basket"}
          </button>
        </div>
      </div>
    </article>
  );
}
  );
}
