import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlantoraProductCard } from "@/services/shopify/types";

export type SortKey = "manual" | "best-sellers" | "newest" | "alpha-asc" | "alpha-desc" | "price-asc" | "price-desc";

interface CollectionSortProps {
  products: PlantoraProductCard[];
  onSortChange: (sorted: PlantoraProductCard[]) => void;
}

export function CollectionSort({ products, onSortChange }: CollectionSortProps) {
  const [sortBy, setSortBy] = useState<SortKey>("manual");

  const sortedProducts = useMemo(() => {
    const items = [...products];
    switch (sortBy) {
      case "alpha-asc":
        return items.sort((a, b) => a.title.localeCompare(b.title));
      case "alpha-desc":
        return items.sort((a, b) => b.title.localeCompare(a.title));
      case "price-asc":
        return items.sort((a, b) => a.price.amount - b.price.amount);
      case "price-desc":
        return items.sort((a, b) => b.price.amount - a.price.amount);
      default:
        return items;
    }
  }, [products, sortBy]);

  // We notify parent on change, but also provide the value
  const handleValueChange = (val: string) => {
    const key = val as SortKey;
    setSortBy(key);
    // The useMemo handles the actual sort logic
  };

  // Re-run the callback whenever sortedProducts changes
  useMemo(() => {
    onSortChange(sortedProducts);
  }, [sortedProducts, onSortChange]);

  return (
    <div className="hidden justify-end">
      <Select value={sortBy} onValueChange={handleValueChange}>
        <SelectTrigger className="w-auto border-none bg-transparent p-0  text-[#254838] shadow-none focus:ring-0">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual" className={cn(sortBy === "manual" && "")}>Featured</SelectItem>
          <SelectItem value="best-sellers" className={cn(sortBy === "best-sellers" && "")}>Best Sellers</SelectItem>
          <SelectItem value="newest" className={cn(sortBy === "newest" && "")}>Newest</SelectItem>
          <SelectItem value="alpha-asc" className={cn(sortBy === "alpha-asc" && "")}>Alphabetically, A-Z</SelectItem>
          <SelectItem value="alpha-desc" className={cn(sortBy === "alpha-desc" && "")}>Alphabetically, Z-A</SelectItem>
          <SelectItem value="price-asc" className={cn(sortBy === "price-asc" && "")}>Price, low to high</SelectItem>
          <SelectItem value="price-desc" className={cn(sortBy === "price-desc" && "")}>Price, high to low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
