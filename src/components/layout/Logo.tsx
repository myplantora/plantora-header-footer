import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link
      to="/"
      aria-label="Plantora — home"
      className={cn(
        "group inline-flex items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        tone === "light" ? "text-primary-foreground" : "text-primary",
        className,
      )}
    >
      <Leaf
        className="h-5 w-5 shrink-0 text-accent transition-transform duration-300 group-hover:-rotate-12"
        aria-hidden="true"
      />
      <span className="font-serif text-2xl leading-none tracking-tight">Plantora</span>
    </Link>
  );
}
