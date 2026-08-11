import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useCartStore } from "@/stores/cartStore";
import type { PlantoraProductCard, PlantoraVariant } from "@/services/shopify/types";
import { ProductRating } from "./ProductRating";


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
  const [tagMediaError, setTagMediaError] = useState(false);

  const handleTagMediaError = () => {
    setTagMediaError(true);
    console.error(`[Plantora] Failed to load Product Card Tag GIF for product: "${product.title}"`, {
      handle: product.handle,
      url: product.tagMedia?.url,
      timestamp: new Date().toISOString()
    });
  };
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

    triggerHaptic("medium"); // must fire inside the gesture, before any await
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
        "group relative flex w-full cursor-pointer flex-col overflow-hidden transition-all duration-300 rounded-[20px]",
        className
      )}
    >
      {/* Image Section - Pixel Perfect 1:1 Aspect Ratio */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F5F5]">
        <img
          src={currentVariant?.image?.url || product.featuredImage?.url}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Product Tag GIF (Top Left) - Precisely positioned */}
        {product.tagMedia?.url && !tagMediaError && (
          <div className="absolute left-0 top-0 z-10 pointer-events-none">
            <img 
              src={product.tagMedia.url} 
              alt="" 
              aria-hidden="true"
              className="h-auto w-[40px] md:w-[65px]"
              loading="lazy"
              onError={handleTagMediaError}
              {...({ playsInline: true } as any)}
            />
          </div>
        )}

      </div>

      {/* Combo Offer Banner - Rendered below image, not overlapping */}
      {product.tags?.includes("Combo") && (
        <div className="flex h-[32px] md:h-[38px] items-center justify-start gap-1.5 bg-[#8CD4DC] px-2.5 -mx-px rounded-b-[20px]">
          <img 
            src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Offer.svg?v=1786442588" 
            alt="" 
            className="size-3.5 object-contain md:size-4 shrink-0 opacity-80"
          />
          <span className="text-[11px] font-normal text-[#1D4D44] md:text-[13px] whitespace-nowrap">
            Grab it for just {formatMoney(currentVariant.price.amount, currentVariant.price.currency)}
          </span>
        </div>
      )}


      <div className="flex flex-1 flex-col pt-3 pb-2">
        {/* Reviews Row - Exact Judge.me style from reference */}
        <div className="flex items-center h-5 mb-1.5">
          {product.reviews ? (
            <ProductRating reviews={product.reviews} />
          ) : (
            <div className="flex items-center gap-1.5 leading-none opacity-60">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[14px] text-[#ccc] leading-none">★</span>
                ))}
              </div>
              <span className="text-[12px]  text-[#707070] leading-none pt-[1px]">0 | 0</span>
            </div>
          )}
        </div>

        {/* Feature Tags - Random background colors from specified list */}
        <div className="flex flex-wrap gap-x-1 gap-y-1.5 mb-2 min-h-[22px] items-start">
          {product.badges.slice(0, 2).map((badge, index) => {
            const tagColors = ['#B8D334', '#F0D2D2', '#C2E8E8', '#EEE9D1'];
            // Create a pseudo-random index based on product ID to vary the starting color, 
            // then cycle through colors in the exact order provided.
            const baseIndex = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const bgColor = tagColors[(baseIndex + index) % tagColors.length];
            
            return (
              <span 
                key={badge.key}
                style={{ backgroundColor: bgColor }}
                className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[9px] md:text-[11px] font-normal text-[#254838] leading-none whitespace-nowrap"
              >
                {badge.iconUrl && (
                  <img src={badge.iconUrl} alt="" className="size-3 object-contain shrink-0" />
                )}
                {badge.label}
              </span>
            );
          })}
        </div>

        {/* Product Title - Fraunces 500, line-height matching reference */}
        <h3 className="line-clamp-2 text-[14px] md:text-[16px] font-normal leading-[1.3] text-[#254838] mb-2 min-h-[2.6em] flex items-start">
          {product.title}
        </h3>

        {/* Price Row - Updated colours and font to match reference */}
        <div className="flex flex-nowrap items-center gap-x-1.5 gap-y-1 mt-auto min-h-6 overflow-hidden">
          <span className="text-[15px] md:text-[18px]  text-[#1D4D44] whitespace-nowrap">
            {formatMoney(currentVariant.price.amount, currentVariant.price.currency)}
          </span>
          {currentVariant.compareAtPrice && currentVariant.compareAtPrice.amount > currentVariant.price.amount && (
            <>
              <span className="text-[13px] text-[#707070] line-through font-normal whitespace-nowrap">
                {formatMoney(currentVariant.compareAtPrice.amount, currentVariant.compareAtPrice.currency)}
              </span>
              <span className="bg-[#F4C439] text-[#254838] text-[9px] md:text-[10px] px-1.5 py-1 rounded-[10px]  leading-tight inline-flex items-center justify-center whitespace-nowrap ml-auto shrink-0">
                SAVE {formatMoney(Math.round(currentVariant.compareAtPrice.amount - currentVariant.price.amount), currentVariant.price.currency)}
              </span>
            </>
          )}
        </div>


        {/* Add to Basket Button - Matching Kyari's exact mobile padding and style */}
        <div className="mt-3 md:mt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || pending}
            className={cn(
              "flex h-[38px] md:h-[42px] w-full items-center justify-center rounded-full text-[12px] md:text-[13px] font-medium transition-all",
              soldOut
                ? "bg-[#f2f2f2] text-[#999]"
                : "bg-brand text-white active:scale-[0.98]"
            )}
          >
            {pending ? "ADDING..." : soldOut ? "SOLD OUT" : "ADD TO BASKET"}
          </button>
        </div>
      </div>
    </article>
  );
}

