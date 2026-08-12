import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { CartRewards } from "@/components/cart/CartRewards";
import { useCartStore } from "@/stores/cartStore";
import { triggerHaptic } from "@/utils/haptics";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";
import { trackCartViewed } from "@/lib/analytics";

const BIN_CDN = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/bin.png?v=1786470456";

export function CartDrawer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, closeCart, lines, subtotal, checkoutUrl, updateLine, removeLine, isLoading, hydrate } =
    useCartStore();
  const { trackInitiateCheckout } = useMetaTracking();

  useEffect(() => {
    if (isOpen) {
      trackCartViewed(useCartStore.getState().cart);
    }
  }, [isOpen]);

  // Separate hydration logic to avoid infinite loops or stale renders
  useEffect(() => {
    if (isOpen && lines.length === 0) {
      const timer = setTimeout(() => {
        if (useCartStore.getState().lines.length === 0) {
          void hydrate();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, lines.length, hydrate]);

  const handleCheckout = () => {
    if (checkoutUrl) {
      trackInitiateCheckout(useCartStore.getState().cart);
      window.location.href = checkoutUrl;
    }
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
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <CartRewards />
          
          {lines.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-6 grid size-20 place-items-center rounded-full bg-[#F1F8EE]">
                <ShoppingBag className="size-10 text-[#74A84A]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#254838]">Your cart is empty</h3>
              <p className="mt-2 text-muted-foreground">Add some greenery to your space!</p>
              <button
                onClick={closeCart}
                className="mt-8 w-full rounded-full bg-primary py-4 font-bold text-white uppercase tracking-widest transition-transform active:scale-95"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="group flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-border/50"
                >
                  <Link
                    to="/product/$handle"
                    params={{ handle: line.handle }}
                    onClick={closeCart}
                    className="size-24 shrink-0 overflow-hidden rounded-xl bg-secondary"
                  >
                    {line.imageUrl && (
                      <img src={line.imageUrl} alt={line.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <Link
                        to="/product/$handle"
                        params={{ handle: line.handle }}
                        onClick={closeCart}
                        className="line-clamp-1 font-bold text-primary hover:text-brand"
                      >
                        {line.title}
                      </Link>
                      {line.variantTitle !== "Default Title" && (
                        <p className="text-xs text-muted-foreground">{line.variantTitle}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-full border border-border bg-secondary/30 p-1">
                        <button
                          onClick={() => { triggerHaptic('light'); updateLine(line.id, line.quantity - 1); }}
                          disabled={isLoading}
                          className="p-1 hover:text-brand disabled:opacity-50"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                        <button
                          onClick={() => { triggerHaptic('light'); updateLine(line.id, line.quantity + 1); }}
                          disabled={isLoading}
                          className="p-1 hover:text-brand disabled:opacity-50"
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
                          className="p-1 opacity-60 hover:opacity-100"
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
          <footer className="border-t border-border bg-white px-6 py-6 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span className="text-[#1D4D44]">
                {subtotal ? formatMoney(subtotal.amount, subtotal.currency) : '$0.00'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 rounded-xl bg-[#F8F8F8] p-3 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 text-brand" />
              <span>30-day healthy plant replacement guarantee</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading || !checkoutUrl}
              className="w-full rounded-full bg-brand py-4 text-sm font-bold text-white uppercase tracking-widest shadow-lg transition-all hover:bg-brand/90 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "PROCESSING..." : "SECURE CHECKOUT"}
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
