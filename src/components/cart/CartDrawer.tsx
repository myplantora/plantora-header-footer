import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ChevronRight, ShoppingBag, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { CartRewards, buildCheckoutUrl } from "@/components/cart/CartRewards";
import { resolveRewardState } from "@/lib/rewards";
import { useCartStore } from "@/stores/cartStore";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";

import paypalAsset from "@/assets/paypal.png.asset.json";
import gpayAsset from "@/assets/gpay.png.asset.json";
import mastercardAsset from "@/assets/mastercard.png.asset.json";

export function CartDrawer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, closeCart, lines, subtotal, checkoutUrl, updateLine, removeLine, isLoading, hydrate, totalQuantity } =
    useCartStore();
  const { trackInitiateCheckout } = useMetaTracking();

  useEffect(() => {
    // Only fetch when the drawer opens with no locally known lines; otherwise
    // render instantly from the store and let mutations keep it in sync.
    if (isOpen && lines.length === 0) void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
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
        className="absolute inset-0 bg-primary/40"
      />
      <aside className={cn(
        "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-soft transition-transform duration-300 sm:rounded-l-md",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-1.5">
          <div className="w-9" /> {/* Spacer to help center the title */}
          <h2 className="text-center font-serif text-lg text-primary">Your basket</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
            className="shrink-0 rounded-md p-2 text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-1">
          <div className="mb-2 border-b border-border pb-2">
            <CartRewards />
          </div>
          {lines.length === 0 ? (
            <div className="flex flex-col items-center py-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading your basket…</p>
              ) : (
                <div className="w-full space-y-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 grid size-16 place-items-center rounded-full bg-[#F1F8EE]">
                      <ShoppingBag className="size-8 text-[#74A84A]" />
                    </div>
                    <h3 className="text-2xl font-serif text-[#254838]">Your cart is currently empty</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
                  </div>

                  <div className="flex items-center justify-center gap-2 rounded-[5px] bg-[#F1F8EE] py-3 text-[12px] font-bold text-[#254838]">
                    <CheckCircle2 className="size-4 text-[#74A84A]" />
                    30 DAY PLANT REPLACEMENT GUARANTEE
                  </div>

                  <button
                    onClick={closeCart}
                    className="w-full rounded-full bg-[#74A84A] py-4 text-sm font-bold text-white transition-all hover:shadow-md uppercase tracking-wider"
                  >
                    Return to Shop
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li key={line.id} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                  <Link 
                    to="/product/$handle" 
                    params={{ handle: line.handle }}
                    onClick={closeCart}
                    className="size-16 shrink-0 overflow-hidden rounded-md bg-secondary transition-opacity hover:opacity-80"
                  >
                    {line.imageUrl ? (
                      <img src={line.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
                    ) : null}
                  </Link>
                  <div className="min-w-0">
                    <Link 
                      to="/product/$handle" 
                      params={{ handle: line.handle }}
                      onClick={closeCart}
                      className="truncate text-sm font-medium text-primary hover:text-accent transition-colors block"
                    >
                      {line.title}
                    </Link>
                    {line.variantTitle && line.variantTitle !== "Default Title" ? (
                      <p className="truncate text-xs text-muted-foreground">{line.variantTitle}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-primary">
                      {formatMoney(line.amount * line.quantity, line.currency)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={isLoading}
                        onClick={() =>
                          updateLine(line.id, line.quantity - 1)
                        }
                        className="rounded-md border border-border p-1 text-primary hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="text-sm text-primary">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={isLoading}
                        onClick={() => updateLine(line.id, line.quantity + 1)}
                        className="rounded-md border border-border p-1 text-primary hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="ml-auto text-xs text-muted-foreground underline hover:text-primary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className={cn("border-t border-border p-4", lines.length === 0 && "hidden")}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">SUBTOTAL</span>
            <span className="text-lg font-bold text-primary">
              {subtotal ? formatMoney(subtotal.amount, subtotal.currency) : formatMoney(0)}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => {
                if (lines.length === 0) return;
                trackInitiateCheckout({ lines, subtotal, totalQuantity });
                const url = buildCheckoutUrl(
                  checkoutUrl,
                  resolveRewardState(subtotal?.amount ?? 0).bestCode
                );
                if (url && url !== "#") {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
              className="relative flex h-[44px] w-full items-center justify-center rounded-full bg-[#C3754C] px-8 font-button text-sm font-normal text-white transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-[10px]">
                <span className="tracking-widest">CHECKOUT</span>
                
                <div className="flex items-center -space-x-2">
                  <div className="size-[24px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                    <img
                      src={paypalAsset.url}
                      alt="PayPal"
                      className="size-full scale-125 object-contain"
                    />
                  </div>
                  <div className="size-[24px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                    <img
                      src={gpayAsset.url}
                      alt="Google Pay"
                      className="size-full scale-125 object-contain"
                    />
                  </div>
                  <div className="size-[24px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                    <img
                      src={mastercardAsset.url}
                      alt="Mastercard"
                      className="size-full scale-125 object-contain"
                    />
                  </div>
                </div>

                <ChevronRight className="size-5 shrink-0" />
              </div>
            </button>

          </div>
        </footer>
      </aside>
    </div>
  );
}
