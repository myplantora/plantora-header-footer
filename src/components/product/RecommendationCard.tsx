import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useCartStore } from "@/stores/cartStore";
import type { PlantoraProductCard } from "@/services/shopify/types";
import { ProductBadges } from "./ProductBadges";

type Props = {
  product: PlantoraProductCard;
  priority?: boolean;
};

export function RecommendationCard({ product, priority = false }: Props) {
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);
  const [pending, setPending] = useState(false);

  const sizeOption = product.options[0];
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0] ?? ""])),
  );

  const selectedVariant = useMemo(() => {
    if (product.variants.length === 0) return null;
    const entries = Object.entries(selected);
    return (
      product.variants.find((v) =>
        entries.every(([name, value]) =>
          v.selectedOptions.some((so) => so.name === name && so.value === value),
        ),
      ) ?? product.variants[0]
    );
  }, [product.variants, selected]);

  const soldOut = product.availability === "out_of_stock" || !selectedVariant?.available;

  async function handleAdd() {
    const variantId = selectedVariant?.id ?? product.defaultVariantId;
    if (!variantId || soldOut || pending) return;
    setPending(true);
    openCart();
    try {
      await addLine(variantId, 1);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(80);
      }
      toast.success(`${product.title} added to basket`, {
        icon: <span className="text-sm">✓</span>,
        style: { background: "#1D4D44", color: "#fff", border: "none" },
      });
    } catch {
      toast.error("Could not add to basket. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const roundedAverage = product.reviews ? Math.round(product.reviews.average * 10) / 10 : 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-berry bg-berry text-berry-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5">
      <Link
        to="/product/$handle"
        params={{ handle: product.handle }}
        className="relative block overflow-hidden rounded-t-md bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              className="size-full object-cover transition-opacity duration-500"
            />
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* DOTD badge */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#B87B4E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          <Zap className="size-3 fill-current" />
          DOTD
        </span>

        {/* Discount badge */}
        {product.discountPercent ? (
          <span className="absolute top-3 right-3 whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">
            {product.discountPercent}% OFF
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {/* Rating */}
        {product.reviews ? (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < Math.round(product.reviews!.average) ? "" : "text-berry-foreground/40",
                  )}
                  style={
                    i < Math.round(product.reviews!.average)
                      ? { color: "#E9AD20", fill: "#E9AD20" }
                      : undefined
                  }
                />
              ))}
            </span>
            <span className="text-xs font-bold text-berry-foreground/90">
              {roundedAverage.toFixed(1)} | {product.reviews.total}
            </span>
          </div>
        ) : null}

        {/* Title */}
        <h3 className="min-w-0 font-serif text-[14px] leading-[22.4px] text-berry-foreground">
          <Link
            to="/product/$handle"
            params={{ handle: product.handle }}
            className="line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {product.title}
          </Link>
        </h3>

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-2 text-[13.125px]">
          <span className="font-bold text-berry-foreground">
            {formatMoney(product.price.amount, product.price.currency)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-berry-foreground/70 line-through">
              {formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currency)}
            </span>
          ) : null}
        </div>

        {/* Feature tags */}
        {product.badges.length > 0 ? (
          <div>
            <ProductBadges badges={product.badges} tone="berry" />
          </div>
        ) : null}

        {/* Variant selector */}
        {sizeOption ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-berry-foreground/80">
              Still clicking on the cart slider is not working please help me {sizeOption.name}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {sizeOption.values.map((value) => {
                const active = selected[sizeOption.name] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelected((prev) => ({ ...prev, [sizeOption.name]: value }));
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{ touchAction: "manipulation" }}
                    className={cn(
                      "inline-flex cursor-pointer select-none items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      active
                        ? "border border-gold bg-gold text-gold-foreground"
                        : "border border-berry-foreground/40 bg-transparent text-berry-foreground hover:border-berry-foreground",
                    )}
                  >
                    {value.replace(/\s*pot\s*/i, "")}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Add to Basket */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || pending || !selectedVariant?.id}
          className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 font-button text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {soldOut ? "Sold out" : "Add to Basket"}
        </button>
      </div>
    </article>
  );
}
