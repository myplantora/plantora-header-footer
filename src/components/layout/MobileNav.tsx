import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, ChevronRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, helpLinks } from "@/config/navigation";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { triggerHaptic } from "@/utils/haptics";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const hapticsOn = usePreferencesStore((s) => s.hapticsEnabled);
  const toggleHaptics = usePreferencesStore((s) => s.toggleHaptics);

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

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

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
          <span className="font-serif text-xl text-primary" aria-hidden="true">Plantora</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-full text-black transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="h-[calc(100vh-64px)] overflow-y-auto px-5 pb-10">
          <ul className="flex flex-col">
            {navItems.map((item) => {
              const hasSubmenu = item.mega && item.mega.length > 0;
              const isExpanded = expandedItems[item.label];
              
              return (
                <li key={item.label} className="border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.href as any}
                      onClick={onClose}
                      className="flex-1 py-4 text-[17px] font-medium text-black transition-colors hover:text-accent"
                    >
                      {item.label}
                    </Link>
                    {hasSubmenu && (
                      <button 
                        onClick={() => toggleExpand(item.label)}
                        className="p-4 text-muted-foreground hover:text-primary transition-colors"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? <Minus className="size-4" /> : <Plus className="size-4" />}
                      </button>
                    )}
                  </div>
                  
                  {hasSubmenu && isExpanded && (
                    <ul className="bg-secondary/30 pb-4 rounded-xl mb-2">
                      {item.mega!.map((column) => (
                        <div key={column.title} className="px-4 pt-3">
                          {column.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                to={link.href as any}
                                onClick={onClose}
                                className="block py-2.5 text-[15px] text-muted-foreground hover:text-accent"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </div>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Extra links or settings removed as per request */}

        </nav>
      </div>
    </div>
  );
}

