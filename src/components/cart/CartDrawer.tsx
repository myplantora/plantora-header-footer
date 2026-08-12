import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { CartRewards, buildCheckoutUrl } from "@/components/cart/CartRewards";
import { useCartStore } from "@/stores/cartStore";
import { triggerHaptic } from "@/utils/haptics";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";
import { trackCartViewed } from "@/lib/analytics";

const BIN_CDN = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/bin.png?v=1786470456";

export function CartDrawer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, closeCart, cart, subtotal, lines, checkoutUrl, updateLine, removeLine, isLoading, hydrate } =
    useCartStore();
  
  const { trackInitiateCheckout, trackPurchase } = useMetaTracking();

  useEffect(() => {
    if (isOpen) {
      trackCartViewed(useCartStore.getState().cart);
    }
  }, [isOpen]);

  // Force a sync when opening to ensure we have the latest state
  useEffect(() => {
    if (isOpen) {
      void hydrate();
    }
  }, [isOpen, hydrate]);



  const handleCheckout = async () => {
    if (!checkoutUrl) return;

    const currentCart = useCartStore.getState().cart;
    const subtotalAmount = currentCart?.cost?.subtotalAmount?.amount ?? 0;

    const { resolveRewardState } = await import("@/lib/rewards");
    const rewardState = resolveRewardState(Number(subtotalAmount));
    const finalUrl = buildCheckoutUrl(checkoutUrl, rewardState.bestCode);

    trackInitiateCheckout(currentCart);
    trackPurchase(currentCart);

    // Perform a direct top-level navigation
    window.location.href = finalUrl;
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[100] transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog" 
      aria-modal="true" 
      aria-label="Shopping basket"
    >
      <button
        type="button"
        aria-label="Close basket"
        onClick={closeCart}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <aside className={cn(
        "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-500 ease-out sm:rounded-l-3xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="w-8" />
          <h2 className="text-xl font-bold text-primary">Your basket</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
            className="rounded-full p-2 text-primary transition-colors hover:bg-secondary"
          >
            <X className="size-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <CartRewards />
          
          {isLoading && lines.length === 0 ? (
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm border border-border/50 animate-pulse">
                  <div className="size-28 shrink-0 rounded-xl bg-secondary" />
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-secondary" />
                      <div className="h-3 w-1/2 rounded bg-secondary" />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="h-8 w-24 rounded-full bg-secondary" />
                      <div className="h-4 w-16 rounded bg-secondary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-6 grid size-20 place-items-center rounded-full bg-[#F1F8EE]">
                <ShoppingBag className="size-10 text-[#74A84A]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#254838]">Your basket is empty</h3>
              <p className="mt-2 text-muted-foreground px-8">It looks like you haven't added any plants yet. Let's find some greenery for your space!</p>
              <button
                onClick={closeCart}
                className="mt-8 w-full rounded-full bg-primary py-4 font-bold text-white uppercase tracking-widest transition-transform active:scale-95 shadow-md hover:shadow-lg"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="group flex gap-3 sm:gap-4 rounded-2xl bg-white p-2.5 sm:p-3 shadow-sm border border-border/50 relative"
                >
                  {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/5 pointer-events-none">
                      <div className="size-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    </div>
                  )}
                  <Link
                    to="/product/$handle"
                    params={{ handle: line.handle }}
                    onClick={closeCart}
                    className="size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl bg-secondary aspect-square"
                  >
                    {line.imageUrl && (
                      <img src={line.imageUrl} alt={line.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between py-1 min-h-[96px] sm:min-h-[112px]">
                    <div className="min-h-[2.5rem]">
                      <Link
                        to="/product/$handle"
                        params={{ handle: line.handle }}
                        onClick={closeCart}
                        className="line-clamp-1 font-bold text-primary hover:text-brand"
                      >
                        {line.title}
                      </Link>
                      {line.variantTitle && line.variantTitle !== "Default Title" ? (
                        <p className="text-xs text-muted-foreground line-clamp-1">{line.variantTitle}</p>
                      ) : (
                        <div className="h-4" /> 
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-full border border-border bg-secondary/30 p-1">
                        <button
                          onClick={() => { triggerHaptic('light'); updateLine(line.id, line.quantity - 1); }}
                          disabled={isLoading}
                          className="p-1 hover:text-brand disabled:opacity-50 transition-colors"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{line.quantity}</span>
                        <button
                          onClick={() => { triggerHaptic('light'); updateLine(line.id, line.quantity + 1); }}
                          disabled={isLoading}
                          className="p-1 hover:text-brand disabled:opacity-50 transition-colors"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-[#1D4D44]">
                          {formatMoney(line.amount * line.quantity, line.currency)}
                        </p>
                        <button
                          onClick={() => { triggerHaptic('heavy'); removeLine(line.id); }}
                          disabled={isLoading}
                          className="p-1 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                        >
                          <img src={BIN_CDN} alt="Remove" className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

        </div>

        {lines.length > 0 && (
          <footer className="border-t border-border bg-white px-3 py-4 space-y-3 mt-auto">
            <div className="flex items-center justify-between text-base font-bold px-1">
              <span className="text-primary/80">Net Total (Exclusive of shipping)</span>
              <span className={cn("text-[#1D4D44] transition-opacity", isLoading && "opacity-50")}>
                {subtotal ? formatMoney(subtotal.amount, subtotal.currency) : '$0.00'}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading || !checkoutUrl}
              className={cn(
                "w-full rounded-full bg-[#C3754C] py-3.5 text-xs font-bold text-white uppercase tracking-widest shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
                isLoading && "relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer"
              )}
            >
              {isLoading ? "UPDATING..." : "SECURE CHECKOUT"}
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
