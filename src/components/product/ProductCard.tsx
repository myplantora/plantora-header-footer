import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useCartStore } from "@/stores/cartStore";
import type { PlantoraProductCard, PlantoraVariant } from "@/services/shopify/types";
import { ProductRating } from "./ProductRating";
import { ProductBadges } from "./ProductBadges";

type ProductCardProps = {
  product: PlantoraProductCard;
  priority?: boolean;
  tone?: "default" | "berry";
  className?: string;
};

export function ProductCard({
  product,
  priority = false,
  className,
}: ProductCardProps) {
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);
  const navigate = useNavigate();
  
  const [pending, setPending] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const firstAvailable = product.variants.find(v => v.available) || product.variants[0];
    if (firstAvailable) {
      return Object.fromEntries(firstAvailable.selectedOptions.map(o => [o.name, o.value]));
    }
    return {};
  });

  const currentVariant = useMemo(() => {
    return product.variants.find(v => 
      v.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value)
    ) || product.variants[0];
  }, [product.variants, selectedOptions])!;

  const soldOut = !currentVariant?.available;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentVariant || soldOut || pending) return;
    
    setPending(true);
    try {
      await addLine(currentVariant.id, 1);
      openCart();
    } catch {
      toast.error("Could not add to basket");
    } finally {
      setPending(false);
    }
  };

  const handleNavigate = (e: React.MouseEvent) => {
    // Only navigate if we didn't click a variant button or Add to Basket
    if ((e.target as HTMLElement).closest('button')) return;
    
    const params: Record<string, string> = { variant: currentVariant.id };
    Object.entries(selectedOptions).forEach(([name, value]) => {
      params[name.toLowerCase()] = value;
    });

    navigate({
      to: "/product/$handle",
      params: { handle: product.handle },
      search: params
    });
  };

  // Identify Color option
  const colorOption = product.options.find(o => /color|colour/i.test(o.name));

  const getColorHex = (name: string) => {
    const map: Record<string, string> = {
      green: "#1D4D44",
      blue: "#2B4C7E",
      cream: "#F5E6D3",
      black: "#1A1A1A",
      yellow: "#F7E052",
      white: "#FFFFFF",
      red: "#A52A2A"
    };
    return map[name.toLowerCase()] || "#cccccc";
  };

  return (
    <article
      onClick={handleNavigate}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-[20px] transition-all duration-300",
        product.promoLabel === "has-deal"
          ? "bg-[#B3393F]"
          : "bg-[#F5F5F5] border border-[#E5E5E5]",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px]">
        <img
          src={currentVariant?.image?.url || product.featuredImage?.url}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Product Tag GIF (Top Left) */}
        {product.tagMedia?.url && (
          <div className="absolute -left-1 -top-1 z-10 md:-left-[10px] md:-top-[10px]">
            <img 
              src={product.tagMedia.url} 
              alt="Product tag" 
              className="h-auto w-[40px] md:w-[70px]"
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        )}

        {/* Discount Badge (Top Right) */}
        {product.discountPercent && product.discountPercent > 0 && (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-[#1D4D44] px-2.5 py-1 text-[11px] font-normal text-white">
            {product.discountPercent}% OFF
          </div>
        )}

        {/* DOTD Badge (Replacement for promo labels) */}
        {product.promoLabel === "DOTD" && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[#C3754C] px-2.5 py-1 text-[11px] font-normal text-white">
            ⚡ DOTD
          </div>
        )}
      </div>

      <div className={cn(
        "flex flex-1 flex-col px-[7px] pt-4 pb-0",
        product.promoLabel === "has-deal" && "px-1"
      )}>
        {/* Product Title */}
        <h3 className="line-clamp-2 mt-2 min-h-[40px] text-[16px] font-normal leading-[1.25] text-[#1D4D44]">
          {product.title}
        </h3>

        {/* Rating Row */}
        <div className="mt-1">
          {product.reviews && <ProductRating reviews={product.reviews} />}
        </div>

        {/* Price Row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[16px] font-normal text-[#1D4D44]">
            {formatMoney(currentVariant.price.amount, currentVariant.price.currency)}
          </span>
          {currentVariant.compareAtPrice && (
            <span className="text-[14px] text-[#C3754C] line-through font-normal">
              {formatMoney(currentVariant.compareAtPrice.amount, currentVariant.compareAtPrice.currency)}
            </span>
          )}
        </div>

        {/* Feature Chips (Metafields/Tags) */}
        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          {product.badges.map((badge, idx) => (
            <span 
              key={badge.key}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-normal text-[#1d4d43]",
                idx === 0 ? "bg-[#C3E8E8]" : "bg-[#F2E8C2]"
              )}
            >
              {badge.iconUrl && (
                <img
                  src={badge.iconUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="size-[14px] shrink-0 object-contain"
                />
              )}
              {badge.label}
            </span>
          ))}

        </div>

        {/* Variant Selectors */}
        <div className="mt-4 space-y-4">
          {/* Color Section (Pot Type/Color) */}
          {colorOption && (
            <div className="space-y-2">
              <span className="text-[13px] font-medium text-[#1D4D44]">Select Pot</span>
              <div className="flex flex-wrap gap-3">
                {colorOption.values.map(val => (
                  <button
                    key={val}
                    type="button"
                    title={val}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOptions(prev => ({ ...prev, [colorOption.name]: val }));
                    }}
                    className={cn(
                      "size-8 rounded-full border-2 transition-all",
                      selectedOptions[colorOption.name] === val
                        ? "border-[#1D4D44]"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: getColorHex(val) }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add to Basket */}
        <div className="mt-5 pb-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || pending}
            className={cn(
              "flex h-[40px] w-full items-center justify-center rounded-full font-button text-[13px] font-medium transition-all",
              soldOut
                ? "bg-gray-200 text-gray-500"
                : "bg-[#1D4D44] text-white active:scale-[0.98]",
              product.promoLabel === "has-deal" && "px-0"
            )}
          >
            {pending ? "Adding..." : soldOut ? "Sold Out" : "Add to Basket"}
          </button>
        </div>
      </div>
    </article>
  );
}
