import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product/ProductCard";
import { getCollectionById } from "@/services/shopify/collection.service";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ChevronRight } from "lucide-react";

export const collectionByIdQuery = (id: string, limit = 12) =>
  queryOptions({
    queryKey: ["collection-by-id", id, limit],
    queryFn: () => getCollectionById({ id, limit }),
  });

type Props = {
  collectionId: string;
  limit?: number;
  heading?: string;
};

export function CollectionScroller({ collectionId, limit = 12, heading }: Props) {
  const { data: collection } = useSuspenseQuery(collectionByIdQuery(collectionId, limit));

  if (!collection || collection.products.length === 0) return null;

  // Use the ID as handle if it's the Big Savings collection
  const isBigSavings = collectionId === "659519504677";

  return (
    <SectionContainer className="bg-[#FFFFFF] pt-6 pb-10 lg:pt-10 lg:pb-16">
      <div className="flex items-center justify-center relative mb-6 lg:mb-8">
        <h2 className="text-[20px] sm:text-2xl font-medium text-[#254838] text-center px-12">
          {heading ?? collection.title}
        </h2>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {isBigSavings ? (
            <Link
              to="/collections/big-savings-combos"
              className="flex items-center gap-0.5 text-[14px] font-medium text-[#254838] hover:opacity-70 transition-opacity"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/collections/$handle"
              params={{ handle: collection.handle || "all" }}
              className="flex items-center gap-0.5 text-[14px] font-medium text-[#254838] hover:opacity-70 transition-opacity"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <ul className="grid w-full grid-cols-2 gap-[15px] md:grid-cols-4 md:gap-8">
          {(collection.products || []).map((product, i) => (
            <li 
              key={product.id}
              className={cn(
                i >= 4 ? "hidden md:block" : "block",
                i >= 8 ? "md:hidden" : ""
              )}
            >
              <ProductCard product={product} priority={i < 4} />
            </li>
          ))}
        </ul>

        <div className="mt-10">
          {isBigSavings ? (
            <Link
              to="/collections/big-savings-combos"
              className="flex items-center gap-2 rounded-full bg-[#C3754C] px-8 py-3 text-[14px] font-bold text-white transition-all hover:opacity-90"
            >
              View more product
            </Link>
          ) : (
            <Link
              to="/collections/$handle"
              params={{ handle: collection.handle || "all" }}
              className="flex items-center gap-2 rounded-full bg-[#C3754C] px-8 py-3 text-[14px] font-bold text-white transition-all hover:opacity-90"
            >
              View more product
            </Link>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
