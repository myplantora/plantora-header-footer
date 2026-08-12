import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ChevronRight, ShoppingBag, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { CartRewards, buildCheckoutUrl } from "@/components/cart/CartRewards";
import { resolveRewardState } from "@/lib/rewards";
import { useCartStore } from "@/stores/cartStore";
import { triggerHaptic } from "@/utils/haptics";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";
import { useCartAnalytics } from "@/lib/analytics/useCartAnalytics";
import { useCartViewed } from "@/lib/analytics/useCartViewed";
import { useCheckoutStarted } from "@/lib/analytics/useCheckoutStarted";

const PAYPAL_CDN = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Paypal.webp?v=1786466040";
const GPAY_CDN = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Gpay.webp?v=1786466039";
const MASTER_CDN = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Master.jpg?v=1786466040";
const BIN_CDN = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/bin.png?v=1786470456";

export function CartDrawer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, closeCart, lines, subtotal, checkoutUrl, updateLine, removeLine, isLoading, hydrate, totalQuantity } =
    useCartStore();
  const { trackInitiateCheckout } = useMetaTracking();
  const handleCheckout = useCheckoutStarted();
  const cartId = useCartStore((s) => s.cartId);

  // Monorail cart activity (browser-only, debounced, mount-skipped).
  useCartAnalytics({ id: cartId, totalQuantity, totalPrice: subtotal?.amount ?? null });
  useCartViewed(isOpen, { id: cartId, totalQuantity });

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
          <h2 className="text-center text-lg font-bold text-primary">Your basket</h2>
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
                    <h3 className="text-2xl text-[#254838]">Your cart is currently empty</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
                  </div>

                  <div className="flex items-center justify-center gap-2 rounded-[5px] bg-primary py-3 text-[12px] text-primary-foreground">
                    <CheckCircle2 className="size-4 text-primary-foreground" />
                    30 DAY PLANT REPLACEMENT GUARANTEE
                  </div>

                  <button
                    onClick={closeCart}
                    className="w-full rounded-full bg-primary py-4 text-sm text-primary-foreground transition-all hover:shadow-md uppercase tracking-wider"
                  >
                    Return to Shop
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-[20px] bg-white p-3 shadow-sm"
                >
                  <Link
                    to="/product/$handle"
                    params={{ handle: line.handle }}
                    onClick={closeCart}
                    className="size-[88px] shrink-0 overflow-hidden rounded-[15px] bg-secondary transition-opacity hover:opacity-80"
                  >
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="flex min-w-0 flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/product/$handle"
                        params={{ handle: line.handle }}
                        onClick={closeCart}
                        className="line-clamp-1 text-sm font-medium text-primary hover:text-accent transition-colors"
                      >
                        {line.title}
                      </Link>
                    </div>

                    {line.variantTitle && line.variantTitle !== "Default Title" ? (
                      <p className="truncate text-xs text-muted-foreground">{line.variantTitle}</p>
                    ) : null}

                    {line.quantity === 0 && !line.isCombo ? (
                      <p className="text-xs font-medium text-[#C3754C]">
                        Sold out &mdash; unavailable for checkout
                      </p>
                    ) : null}

                    {line.quantity === 0 && line.isCombo ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] leading-tight text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                          Note: This combo is available, but individual stock varies. You can still checkout.
                        </p>
                      </div>
                    ) : null}

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-full border border-border px-1 py-1">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={isLoading}
                            onClick={() => { 
                              if (line.quantity <= 1 && line.isCombo) {
                                // For combos at 1, don't let it go to 0 via minus
                                return;
                              }
                              triggerHaptic('light'); 
                              updateLine(line.id, line.quantity - 1); 
                            }}
                            className={cn(
                              "grid size-6 place-items-center rounded-full text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                              line.quantity <= 1 && line.isCombo && "opacity-20 cursor-not-allowed"
                            )}
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm text-primary">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={isLoading}
                            onClick={() => { triggerHaptic('light'); updateLine(line.id, line.quantity + 1); }}
                            className="grid size-6 place-items-center rounded-full text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => { triggerHaptic('heavy'); removeLine(line.id); }}
                          aria-label="Remove item"
                          className="grid size-8 place-items-center rounded-full text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <img
                            src={BIN_CDN}
                            alt=""
                            className="size-5 object-contain"
                            loading="lazy"
                          />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-medium text-[#1D4D44]">
                          {formatMoney(line.amount * Math.max(line.quantity, 1), line.currency)}
                        </p>
                        {line.compareAtAmount && line.compareAtAmount > line.amount ? (
                          <p className="text-xs text-[#C3754C] line-through">
                            {formatMoney(
                              line.compareAtAmount * Math.max(line.quantity, 1),
                              line.currency,
                            )}
                          </p>
                        ) : null}
                      </div>
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
            <span className="text-lg  text-primary">
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
                  // Fires checkout_started (once, keepalive) then navigates.
                  handleCheckout(url, (target) =>
                    window.open(target, "_blank", "noopener,noreferrer")
                  );
                }
              }}
              className="relative flex h-[44px] w-full items-center justify-center rounded-full bg-[#C3754C] px-8 text-sm font-normal text-primary-foreground transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-[10px]">
                <span className="tracking-widest">CHECKOUT</span>
                
                <div className="flex items-center -space-x-2">
                  <div className="size-[24px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                    <img
                      src={PAYPAL_CDN}
                      alt="PayPal"
                      className="size-full scale-125 object-contain"
                    />
                  </div>
                  <div className="size-[24px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                    <img
                      src={GPAY_CDN}
                      alt="Google Pay"
                      className="size-full scale-125 object-contain"
                    />
                  </div>
                  <div className="size-[24px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                    <img
                      src={MASTER_CDN}
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
