import { useEffect, useRef } from "react";
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
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-2">
          <div className="w-9" /> {/* Spacer to help center the title */}
          <h2 className="text-center font-serif text-xl text-primary">Your basket</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
            className="shrink-0 rounded-md p-2 text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="border-b border-border px-5 py-2">
          <CartRewards />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center py-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading your basket…</p>
              ) : (
                <div className="w-full space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 grid size-12 place-items-center rounded-full bg-accent/10">
                      <ShoppingBag className="size-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-primary">Your cart is currently empty</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Explore our wide collections</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      {
                        title: "Price Drop!",
                        subtitle: "starting @ ₹199.",
                        image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=200",
                        color: "text-[#74A84A]"
                      },
                      {
                        title: "XL Plants",
                        subtitle: "XL Plants",
                        image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=200",
                        color: "text-[#74A84A]"
                      },
                      {
                        title: "Plant care",
                        subtitle: "upto 50% off",
                        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=200",
                        color: "text-[#74A84A]"
                      },
                      {
                        title: "Fertilizers",
                        subtitle: "upto 55% off",
                        image: "https://images.unsplash.com/photo-1592150621344-82d47b642a44?auto=format&fit=crop&q=80&w=200",
                        color: "text-[#74A84A]"
                      },
                      {
                        title: "Pots & Planters",
                        subtitle: "upto 60% off",
                        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d446?auto=format&fit=crop&q=80&w=200",
                        color: "text-[#74A84A]"
                      },
                      {
                        title: "Plant Stands",
                        subtitle: "upto 40% off",
                        image: "https://images.unsplash.com/photo-1599388143224-b384a8618d36?auto=format&fit=crop&q=80&w=200",
                        color: "text-[#74A84A]"
                      }
                    ].map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={closeCart}
                        className="group flex flex-col items-center rounded-[10px] border border-border/50 bg-background/50 p-2 transition-all hover:border-accent hover:shadow-sm"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-[8px] bg-secondary">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="mt-2 w-full text-center">
                          <p className="text-[12px] font-bold text-primary">{item.title}</p>
                          <p className={cn("text-[10px] font-medium", item.color)}>{item.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="relative overflow-hidden rounded-[10px] bg-secondary/50 p-4">
                    <div className="relative z-10 flex flex-col items-start gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-white">
                        Ask Doctor Green!
                      </div>
                      <p className="text-sm font-bold text-primary">Unsure about plant care? Our experts can help</p>
                      <button className="rounded-full bg-accent px-4 py-1 text-[10px] font-bold text-white transition-opacity hover:opacity-90">
                        Book a Consultation
                      </button>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&q=80&w=300"
                      alt=""
                      className="absolute inset-y-0 right-0 h-full w-1/3 object-cover opacity-20 grayscale"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 rounded-[5px] bg-[#F1F8EE] py-2 text-[11px] font-bold text-primary">
                    <CheckCircle2 className="size-3 text-accent" />
                    30 DAY PLANT REPLACEMENT GUARANTEE
                  </div>

                  <button
                    onClick={closeCart}
                    className="w-full rounded-full bg-accent py-3 font-button text-sm font-bold text-white transition-all hover:shadow-md"
                  >
                    RETURN TO SHOP
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li key={line.id} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                  <div className="size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    {line.imageUrl ? (
                      <img src={line.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{line.title}</p>
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
                          line.quantity > 1
                            ? updateLine(line.id, line.quantity - 1)
                            : removeLine(line.id)
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

        <footer className={cn("border-t border-border p-5", lines.length === 0 && "hidden")}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">SUBTOTAL</span>
            <span className="text-lg font-bold text-primary">
              {subtotal ? formatMoney(subtotal.amount, subtotal.currency) : formatMoney(0)}
            </span>
          </div>
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
            className="relative mt-4 flex h-[52px] w-full items-center justify-center rounded-full bg-[#C3754C] px-8 font-button text-base font-normal text-white transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-[10px]">
              <span className="tracking-widest">CHECKOUT</span>
              
              <div className="flex items-center -space-x-2">
                <div className="size-[32px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                  <img
                    src={paypalAsset.url}
                    alt="PayPal"
                    className="size-full scale-125 object-contain"
                  />
                </div>
                <div className="size-[32px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
                  <img
                    src={gpayAsset.url}
                    alt="Google Pay"
                    className="size-full scale-125 object-contain"
                  />
                </div>
                <div className="size-[32px] overflow-hidden rounded-full border-2 border-white/20 bg-white">
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

        </footer>
      </aside>
    </div>
  );
}
