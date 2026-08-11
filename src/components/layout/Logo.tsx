import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo.png.asset.json";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link
      to="/"
      aria-label="Plantora — home"
      className={cn(
        "group inline-flex items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        tone === "light" ? "text-primary-foreground" : "text-black",
        className,
      )}
    >
      <img 
        src={logoAsset.url} 
        alt="Plantora Logo" 
        className="h-8 w-8 shrink-0 object-contain transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
      />
      <span className="font-serif text-2xl leading-none tracking-tight">Plantora</span>
    </Link>
  );
}

