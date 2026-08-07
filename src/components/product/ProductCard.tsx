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

  // Identify Color and Size options
  const colorOption = product.options.find(o => /color|colour/i.test(o.name));
  const sizeOption = product.options.find(o => /size|pot/i.test(o.name));

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
        "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-[18px] transition-all duration-300",
        product.promoLabel === "has-deal" ? "bg-[#CAC2E0]" : "bg-white",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[18px]">
        <img
          src={currentVariant?.image?.url || product.featuredImage?.url}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Custom Shape Badge (Top Left) */}
        {product.tagMedia?.url && (
          <div className="absolute -left-2 -top-2 z-10 rounded-br-[18px] rounded-tl-[18px] bg-white p-2 md:-left-[15px] md:-top-[15px] md:rounded-br-[19px] md:rounded-tl-[19px] md:p-[11px]">
            <img 
              src={product.tagMedia.url} 
              alt="Badge" 
              className="max-w-[20px] md:max-w-[41px]" 
            />
          </div>
        )}

        {/* Discount Badge (Top Right) */}
        {product.discountPercent && product.discountPercent > 0 && (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-[#1D4D44] px-2.5 py-1 text-[11px] font-bold text-white">
            {product.discountPercent}% OFF
          </div>
        )}

        {/* DOTD Badge (Replacement for promo labels) */}
        {product.promoLabel === "DOTD" && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[#A8622A] px-2.5 py-1 text-[11px] font-bold text-white">
            ⚡ DOTD
          </div>
        )}
      </div>

      <div className={cn(
        "flex flex-1 flex-col p-4 pb-0",
        product.promoLabel === "has-deal" && "px-2.5"
      )}>
        {/* Rating Row */}
        <div className="mb-2">
          {product.reviews && <ProductRating reviews={product.reviews} />}
        </div>

        {/* Product Title */}
        <h3 className="line-clamp-2 min-h-[40px] text-[16px] font-semibold leading-[1.25] text-[#1D4D44]">
          {product.title}
        </h3>

        {/* Price Row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[16px] font-bold text-[#1D4D44]">
            {formatMoney(currentVariant.price.amount, currentVariant.price.currency)}
          </span>
          {currentVariant.compareAtPrice && (
            <span className="text-[14px] text-[#A8622A] line-through">
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
                "flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold text-[#1d4d43]",
                idx === 0 ? "bg-[#C3E8E8]" : "bg-[#F2E8C2]"
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Variant Selectors */}
        <div className="mt-4 space-y-4">
          {/* Pot Section (Formerly Size) */}
          {sizeOption && (
            <div className="space-y-2">
              <span className="text-[13px] font-semibold text-[#1D4D44]">Select Pot Size</span>
              <div className="flex flex-wrap gap-2">
                {sizeOption.values.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOptions(prev => ({ ...prev, [sizeOption.name]: val }));
                    }}
                    className={cn(
                      "min-w-[40px] rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all",
                      selectedOptions[sizeOption.name] === val
                        ? "border-[#A8622A] bg-[#A8622A] text-white"
                        : "border-gray-200 bg-white text-[#1D4D44]"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Section (Pot Type/Color) */}
          {colorOption && (
            <div className="space-y-2">
              <span className="text-[13px] font-semibold text-[#1D4D44]">Select Pot</span>
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
        <div className="mt-6 pb-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || pending}
            className={cn(
              "flex h-[56px] w-full items-center justify-center rounded-full font-button text-[16px] font-bold transition-all",
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
