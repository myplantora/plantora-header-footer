import React from "react";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  merchandiseId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  merchandiseId,
  quantity = 1,
  disabled = false,
  className,
  children
}: AddToCartButtonProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const isLoading = useCartStore((s) => s.isLoading);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isLoading) return;
    await addToCart(merchandiseId, quantity);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        children || "ADD TO BASKET"
      )}
    </button>
  );
}
