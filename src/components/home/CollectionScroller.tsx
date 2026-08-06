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

export function CollectionScroller({ collectionId, limit = 12, heading }: Props) {
  const { data: collection } = useSuspenseQuery(collectionByIdQuery(collectionId, limit));

  if (!collection || collection.products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-6 lg:px-10 lg:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-serif text-3xl text-primary sm:text-4xl">
          {heading ?? collection.title}
        </h2>
        {collection.handle ? (
          <Link
            to="/collections/$handle"
            params={{ handle: collection.handle }}
            className="text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View all
          </Link>
        ) : null}
      </div>

      <div className="-mx-5 mt-8 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex snap-x snap-mandatory gap-4 sm:gap-5">
          {collection.products.map((product, i) => (
            <li
              key={product.id}
              className="w-[64vw] max-w-[280px] shrink-0 snap-start sm:w-[300px]"
            >
              <ProductCard product={product} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
