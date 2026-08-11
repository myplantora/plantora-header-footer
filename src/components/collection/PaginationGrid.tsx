import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlantoraProductCard } from "@/services/shopify/types";
import { ProductCard } from "@/components/product/ProductCard";

interface PaginationGridProps {
  products: PlantoraProductCard[];
  pageSize?: number;
}

export function PaginationGrid({ products, pageSize = 20 }: PaginationGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + pageSize);
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="grid grid-cols-2 gap-[15px] md:grid-cols-4 md:gap-8 w-full">
        {visibleProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>

      {hasMore && (
        <Button
          onClick={handleLoadMore}
          className="rounded-full bg-[#C3754C] px-10 py-6 text-[15px]  text-white hover:opacity-90 h-auto"
        >
          <span className="">Load More Products</span>
        </Button>
      )}
    </div>
  );
}
