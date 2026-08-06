import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/navigation";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { useCart } from "./CartContext";

function CartButton() {
  const { count } = useCart();
  const [bounce, setBounce] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setBounce(true);
    const id = window.setTimeout(() => setBounce(false), 450);
    return () => window.clearTimeout(id);
  }, [count]);

  return (
    <button
      type="button"
      aria-label={`Shopping cart, ${count} item${count === 1 ? "" : "s"}`}
      className={cn(
        "relative grid h-11 w-11 place-items-center rounded-full text-primary transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        bounce && "animate-cart-bounce",
      )}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
      >
        {count}
      </span>
    </button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background"
          : "bg-background",
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenMenu(null);
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-black transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-1 justify-center lg:flex-none lg:justify-start">
          <Logo />
        </div>

        <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isOpen = openMenu === item.label;
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => (item.mega ? open(item.label) : setOpenMenu(null))}
                  onMouseLeave={() => item.mega && scheduleClose()}
                >
                  <Link
                    to={item.href}
                    onFocus={() => (item.mega ? open(item.label) : setOpenMenu(null))}
                    aria-haspopup={item.mega ? "true" : undefined}
                    aria-expanded={item.mega ? isOpen : undefined}
                    className="nav-link inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[15px] font-medium text-black transition-colors duration-300 hover:text-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.label}
                    {item.mega ? (
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-300",
                          isOpen && "rotate-180",
                        )}
                      />
                    ) : null}
                  </Link>

                  {item.mega && isOpen ? (
                    <div
                      onMouseEnter={() => open(item.label)}
                      onMouseLeave={scheduleClose}
                      className="animate-fade-in absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-4"
                    >
                      <div className="rounded-3xl border border-border bg-background p-5 shadow-soft">
                        {item.mega.map((col) => (
                          <div key={col.title}>
                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {col.title}
                            </p>
                            <ul className="space-y-1">
                              {col.links.map((link) => (
                                <li key={link.label}>
                                  <Link
                                    to={link.href}
                                    onBlur={scheduleClose}
                                    className="block rounded-xl px-3 py-2 text-[15px] text-black transition-colors duration-200 hover:bg-secondary hover:text-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            aria-label="Search"
            className="grid h-11 w-11 place-items-center rounded-full text-black transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="grid h-11 w-11 place-items-center rounded-full text-black transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </button>
          <CartButton />
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
