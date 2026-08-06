import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useCartStore } from "@/stores/cartStore";
import type { PlantoraProductCard } from "@/services/shopify/types";
import { ProductBadges } from "./ProductBadges";
import { ProductRating } from "./ProductRating";

function stableRandomInRange(input: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return Math.floor(min + normalized * (max - min + 1));
}

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
  const isLoading = useCartStore((s) => s.isLoading);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0] ?? ""])),
  );

  const berry = tone === "berry";
  const soldOut = product.availability === "out_of_stock";
  const boughtCount = useMemo(
    () => stableRandomInRange(product.id, 50, 150),
    [product.id],
  );

  async function handleAdd() {
    if (!product.defaultVariantId || soldOut) return;
    try {
      await addLine(product.defaultVariantId, 1);
      toast.success(`${product.title} added to basket`);
    } catch {
      toast.error("Could not add to basket. Please try again.");
    }
  }

  const sizeOption = product.options[0];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft",
        berry ? "border-berry bg-berry text-berry-foreground" : "border-border bg-card",
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

        {product.tagMedia ? (
          <img
            src={product.tagMedia.url}
            alt={product.tagMedia.altText}
            loading="lazy"
            className="absolute right-3 top-3 h-9 w-auto"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-3">
        {product.reviews ? <ProductRating reviews={product.reviews} tone={tone} /> : null}

        <h3
          className={cn(
            "min-w-0 font-serif text-[14px] leading-[22.4px]",
            berry ? "text-berry-foreground" : "text-[#1C6644]",
          )}
        >
          <Link
            to="/product/$handle"
            params={{ handle: product.handle }}
            className="line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {product.title}
          </Link>
        </h3>

        <div className="flex flex-wrap items-baseline gap-2 text-[13.125px]">
          <span
            className={cn(
              "font-medium",
              berry ? "text-berry-foreground" : "text-black",
            )}
          >
            {formatMoney(product.price.amount, product.price.currency)}
          </span>
          {product.compareAtPrice ? (
            <span
              className={cn(
                "line-through",
                berry ? "text-berry-foreground/70" : "text-muted-foreground",
              )}
            >
              {formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currency)}
            </span>
          ) : null}
          {product.availability === "limited" ? (
            <span
              className={cn(
                "font-medium",
                berry ? "text-berry-foreground" : "text-accent",
              )}
            >
              Only a few left
            </span>
          ) : null}
        </div>

        {product.badges.length > 0 ? (
          <div>
            <ProductBadges badges={product.badges} tone={tone} />
          </div>
        ) : null}

        {sizeOption ? (
          <div className="flex flex-col gap-2">
            <span
              className={cn(
                "text-xs font-medium",
                berry ? "text-berry-foreground/80" : "text-muted-foreground",
              )}
            >
              Select {sizeOption.name}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {sizeOption.values.map((value) => {
                const active = selected[sizeOption.name] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [sizeOption.name]: value }))
                    }
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full border px-1 text-[11px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      berry
                        ? active
                          ? "border-berry-foreground bg-berry-foreground/25 text-berry-foreground"
                          : "border-berry-foreground/40 text-berry-foreground/90 hover:border-berry-foreground"
                        : active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-primary hover:border-primary",
                    )}
                  >
                    {value.replace(/\s*pot\s*/i, "")}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {product.promoLabel ? (
          <p
            className={cn(
              "rounded-full px-2.5 py-1.5 text-xs font-medium",
              berry ? "bg-berry-foreground/15 text-berry-foreground" : "bg-secondary text-primary",
            )}
          >
            {product.promoLabel}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || isLoading || !product.defaultVariantId}
          className={cn(
            "inline-flex h-10 w-full items-center justify-center rounded-full px-4 font-button text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            berry
              ? "bg-berry-muted text-berry-foreground"
              : "bg-primary text-primary-foreground",
          )}
        >
          {soldOut ? "Sold out" : "Add to Basket"}
        </button>
      </div>
    </article>
  );
}
