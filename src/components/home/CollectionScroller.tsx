import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product/ProductCard";
import { getCollectionById } from "@/services/shopify/collection.service";
import { cn } from "@/lib/utils";

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

/** Deterministic highlight: every 4th card gets the berry treatment. */
function toneFor(index: number) {
  return index % 4 === 0 ? ("berry" as const) : ("default" as const);
}

export function CollectionScroller({ collectionId, limit = 12, heading }: Props) {
  const { data: collection } = useSuspenseQuery(collectionByIdQuery(collectionId, limit));

  if (!collection || collection.products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1400px] bg-[#F5F5F5] px-2.5 py-10 lg:py-16">
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <h2 className="font-serif text-[28px] font-bold text-primary sm:text-4xl w-full">
          {heading ?? "Explore Our Plants"}
        </h2>
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
          <Link
            to="/collections/$handle"
            params={{ handle: collection.handle || "all" }}
            className="flex items-center gap-2 rounded-full bg-[#C3754C] px-8 py-3 text-[14px] font-bold text-white transition-all hover:opacity-90"
          >
            View more product
          </Link>
        </div>
      </div>
    </section>
  );
}
