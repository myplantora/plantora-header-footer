import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const closeBtn = panelRef.current?.querySelector("button");
      closeBtn?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={cn(
          "absolute inset-y-0 left-0 w-full max-w-[320px] bg-background shadow-2xl transition-transform duration-500 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="font-serif text-xl text-primary">Plantora</span>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full text-black transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="h-[calc(100vh-64px)] overflow-y-auto px-5 pb-10">
          <div className="mb-6 border-b border-border py-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Add automated tests to verify card slider taps always trigger selection on pointer-down across different loading scenarios.
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              // Only render valid TanStack Start routes to avoid build errors
              const isValidRoute = ["/", "/collections", "/collections/$handle", "/product/$handle"].some(
                (route) => item.href === route || item.href.startsWith("/collections/") || item.href.startsWith("/product/")
              );

              return (
                <li key={item.label}>
                  {isValidRoute ? (
                    <Link
                      to={item.href as any}
                      onClick={onClose}
                      className="flex items-center justify-between py-4 text-lg font-medium text-black transition-colors hover:text-black/70"
                    >
                      {item.label}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ) : (
                    <span className="flex items-center justify-between py-4 text-lg font-medium text-black/50">
                      {item.label}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-10 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Support
              </p>
              <ul className="mt-4 space-y-4">
                <li className="text-[15px] text-black/50">Contact Us</li>
                <li className="text-[15px] text-black/50">Shipping Policy</li>
                <li className="text-[15px] text-black/50">Returns & Refunds</li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
