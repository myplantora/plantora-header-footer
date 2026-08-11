import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const logoUrl = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Logo.png?v=1786424416";
  
  return (
    <Link
      to="/"
      aria-label="Plantora — home"
      className={cn(
        "group inline-flex items-center gap-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        className,
      )}
    >
      <img 
        src={logoUrl} 
        alt="Plantora Logo" 
        className={cn(
          "h-12 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 translate-x-0.5",
          tone === "light" && "brightness-0 invert"
        )}
        aria-hidden="true"
      />
      <span className={cn(
        "text-[15px] font-medium leading-none transition-colors duration-300",
        tone === "light" ? "text-white" : "text-[#254838]"
      )}>
        Plantora
      </span>
    </Link>
  );
}




