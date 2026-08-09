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
        "group relative flex w-full cursor-pointer flex-col overflow-hidden transition-all duration-300",
        className
      )}
    >
      {/* Image Section - Pixel Perfect 1:1 Aspect Ratio */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[#F5F5F5]">
        <img
          src={currentVariant?.image?.url || product.featuredImage?.url}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Product Tag GIF (Top Left) - Precisely positioned */}
        {product.tagMedia?.url && !tagMediaError && (
          <div className="absolute -left-1 -top-1 z-10 md:-left-2 md:-top-2 pointer-events-none">
            <img 
              src={product.tagMedia.url} 
              alt="" 
              aria-hidden="true"
              className="h-auto w-[45px] md:w-[75px]"
              loading="lazy"
              onError={handleTagMediaError}
              {...({ playsInline: true } as any)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3 pb-2">
        {/* Reviews Row - Exact Judge.me style from reference */}
        <div className="flex items-center gap-1.5 mb-1">
          {product.reviews ? (
            <ProductRating reviews={product.reviews} />
          ) : (
            <div className="flex items-center gap-1 opacity-60">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="size-3 text-[#ccc]">★</span>
                ))}
              </div>
              <span className="text-[11px] text-[#707070]">0 reviews</span>
            </div>
          )}
        </div>

        {/* Feature Tags - Exact spacing and styling from reference */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {product.badges.slice(0, 2).map((badge, idx) => (
            <span 
              key={badge.key}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-normal text-[#1d4d43]",
                idx === 0 ? "bg-[#EDE9D2]" : "bg-[#C3E8E8]"
              )}
            >
              {badge.iconUrl && (
                <img src={badge.iconUrl} alt="" className="size-3.5 object-contain" />
              )}
              {badge.label}
            </span>
          ))}
        </div>

        {/* Product Title - Fraunces 500, line-height matching reference */}
        <h3 className="line-clamp-2 text-[15px] md:text-[16px] font-medium leading-[1.3] text-[#1D4D44] font-serif mb-1">
          {product.title}
        </h3>

        {/* Price Row - Exact layout and colours from Reference HTML */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-[18px] font-bold text-[#1D4D44]">
            {formatMoney(currentVariant.price.amount, currentVariant.price.currency)}
          </span>
          {currentVariant.compareAtPrice && (
            <span className="text-[13px] text-[#707070] line-through font-normal">
              {formatMoney(currentVariant.compareAtPrice.amount, currentVariant.compareAtPrice.currency)}
            </span>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-[#F5C439] text-[#1d4d43] text-[11px] px-2 py-0.5 rounded-full font-medium">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Add to Basket Button - Matching Kyari's exact mobile padding and style */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || pending}
            className={cn(
              "flex h-[42px] w-full items-center justify-center rounded-full font-sans text-[13px] font-medium transition-all",
              soldOut
                ? "bg-[#f2f2f2] text-[#999]"
                : "bg-[#1D4D44] text-white active:scale-[0.98]"
            )}
          >
            {pending ? "ADDING..." : soldOut ? "SOLD OUT" : "ADD TO BASKET"}
          </button>
        </div>
      </div>
    </article>
  );
}

function BadgeItem({ badge, idx }: { badge: any, idx: number }) {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    console.error(`[Plantora] Failed to load Card Badge GIF: "${badge.label}"`, {
      key: badge.key,
      url: badge.iconUrl,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <span 
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-normal text-[#1d4d43]",
        idx === 0 ? "bg-[#C3E8E8]" : "bg-[#F2E8C2]"
      )}
    >
      {badge.iconUrl && !error && (
        <div className="relative size-[14px] shrink-0">
          <div className="absolute inset-0 animate-pulse rounded-full bg-black/5" />
          <img
            src={badge.iconUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="relative size-full object-contain"
            onLoad={(e) => {
              (e.currentTarget as HTMLImageElement).previousElementSibling?.remove();
            }}
            onError={handleError}
            {...({ playsInline: true } as any)}
          />
        </div>
      )}
      {badge.label}
    </span>
  );
}
