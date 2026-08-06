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
  className?: string;
};

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const addLine = useCartStore((s) => s.addLine);
  const isLoading = useCartStore((s) => s.isLoading);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0] ?? ""])),
  );

  const soldOut = product.availability === "out_of_stock";

  async function handleAdd() {
    if (!product.defaultVariantId || soldOut) return;
    try {
      await addLine(product.defaultVariantId, 1);
      toast.success(`${product.title} added to basket`);
    } catch {
      toast.error("Could not add to basket. Please try again.");
    }
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft",
        className,
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
                "size-full object-cover transition-opacity duration-500",
                product.hoverImage && "group-hover:opacity-0",
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
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}
        </div>

        {product.discountPercent ? (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">
            {product.discountPercent}% off
          </span>
        ) : null}
        {product.tagMedia ? (
          <img
            src={product.tagMedia.url}
            alt={product.tagMedia.altText}
            loading="lazy"
            className="absolute right-3 top-3 h-9 w-auto"
          />
        ) : null}
        {soldOut ? (
          <span className="absolute bottom-3 left-3 rounded-md bg-background/95 px-2 py-1 text-[11px] font-medium text-primary">
            Sold out
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {product.reviews ? <ProductRating reviews={product.reviews} /> : null}

        <h3 className="min-w-0 font-serif text-lg leading-snug text-primary">
          <Link
            to="/product/$handle"
            params={{ handle: product.handle }}
            className="line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {product.title}
          </Link>
        </h3>

        <ProductBadges badges={product.badges} />

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-medium text-primary">
            {formatMoney(product.price.amount, product.price.currency)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currency)}
            </span>
          ) : null}
          {product.availability === "limited" ? (
            <span className="text-xs font-medium text-accent">Only a few left</span>
          ) : null}
        </div>

        {product.options.length > 0 ? (
          <div className="flex flex-col gap-2">
            {product.options.map((option) => (
              <div key={option.name} className="flex flex-wrap items-center gap-1.5">
                <span className="sr-only">{option.name}</span>
                {option.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected[option.name] === value}
                    onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      selected[option.name] === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-primary hover:border-primary",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {product.promoLabel ? (
          <p className="rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-primary">
            {product.promoLabel}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || isLoading || !product.defaultVariantId}
          className="mt-auto inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 font-button text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {soldOut ? "Sold out" : "Add to basket"}
        </button>
      </div>
    </article>
  );
}
