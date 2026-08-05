import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { navItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={cn("lg:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-primary/30 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-background shadow-soft transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-full text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <Accordion type="single" collapsible className="w-full">
            {navItems.map((item) =>
              item.mega ? (
                <AccordionItem key={item.label} value={item.label} className="border-border">
                  <AccordionTrigger className="min-h-[52px] px-2 text-[16px] font-medium text-primary hover:no-underline">
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="space-y-1 pl-2">
                      {item.mega.flatMap((col) => col.links).map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.href}
                            onClick={onClose}
                            className="flex min-h-[48px] items-center rounded-xl px-3 text-[15px] text-muted-foreground transition-colors hover:bg-secondary hover:text-accent"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div key={item.label} className="border-b border-border">
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="flex min-h-[52px] items-center px-2 text-[16px] font-medium text-primary transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </div>
              ),
            )}
          </Accordion>
        </nav>
      </div>
    </div>
  );
}
