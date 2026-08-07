import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product/ProductCard";
import { getCollectionById } from "@/services/shopify/collection.service";

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

  const mobileProducts = collection.products.slice(0, 4);

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-6 lg:px-10 lg:py-16">
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl w-full">
          {heading ?? "Explore Our Plants"}
        </h2>
        {collection.handle ? (
          <Link
            to="/collections/$handle"
            params={{ handle: collection.handle }}
            className="hidden text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:inline"
          >
            View all
          </Link>
        ) : null}
      </div>

      {/* Mobile: 2-column grid, 4 products only */}
      <div className="mt-8 sm:hidden">
        <ul className="grid grid-cols-2 gap-[15px]">
          {mobileProducts.map((product, i) => (
            <li key={product.id}>
              <ProductCard product={product} priority={i < 2} tone={toneFor(i)} />
            </li>
          ))}
        </ul>
        <Link
          to="/collections"
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-5 font-button text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          View all products
        </Link>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="mt-8 hidden sm:block">
        <ul className="grid grid-cols-2 gap-[15px] md:grid-cols-4 md:gap-8">
          {collection.products.map((product, i) => (
            <li key={product.id}>
              <ProductCard product={product} priority={i < 4} tone={toneFor(i)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
