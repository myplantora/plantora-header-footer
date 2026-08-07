import { useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { CartRewards, buildCheckoutUrl } from "@/components/cart/CartRewards";
import { resolveRewardState } from "@/lib/rewards";
import { useCartStore } from "@/stores/cartStore";

export function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, checkoutUrl, updateLine, removeLine, isLoading, hydrate } =
    useCartStore();

  useEffect(() => {
    // Only fetch when the drawer opens with no locally known lines; otherwise
    // render instantly from the store and let mutations keep it in sync.
    if (isOpen && lines.length === 0) void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping basket">
      <button
        type="button"
        aria-label="Close basket"
        onClick={closeCart}
        className="absolute inset-0 bg-primary/40"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-soft sm:rounded-l-md">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4">
          <h2 className="truncate font-serif text-2xl text-primary">Your basket</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
            className="shrink-0 rounded-md p-2 text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-5" />
          </button>
        </header>

        {lines.length > 0 ? (
          <div className="border-b border-border px-5 py-4">
            <CartRewards />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading your basket…" : "Your basket is empty."}
            </p>
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

        {lines.length > 0 ? (
          <footer className="border-t border-border px-5 py-4">
            <div className="flex items-center justify-between text-sm text-primary">
              <span>Subtotal</span>
              <span className="font-medium">
                {subtotal ? formatMoney(subtotal.amount, subtotal.currency) : "—"}
              </span>
            </div>
            <a
              href={buildCheckoutUrl(
                checkoutUrl,
                resolveRewardState(subtotal?.amount ?? 0).bestCode,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 font-button text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Checkout
            </a>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
