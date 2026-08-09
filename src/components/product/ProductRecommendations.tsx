import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { RecommendationCard } from "./RecommendationCard";
import { getCollectionById } from "@/services/shopify/collection.service";

const RECOMMENDATION_COLLECTION_ID = "collections/659339542821";

const recommendationsQuery = (limit = 8) =>
  queryOptions({
    queryKey: ["recommendations", RECOMMENDATION_COLLECTION_ID, limit],
    queryFn: () => getCollectionById({ id: RECOMMENDATION_COLLECTION_ID, limit }),
  });

type Props = {
  currentProductHandle?: string;
  heading?: string;
  limit?: number;
};

export function ProductRecommendations({
  currentProductHandle,
  heading = "You may also like",
  limit = 8,
}: Props) {
  const { data: collection } = useSuspenseQuery(recommendationsQuery(limit));

  const products =
    collection?.products.filter((p) => p.handle !== currentProductHandle).slice(0, limit) ?? [];

  if (products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1400px] bg-[#F8F8F8] px-2.5 pt-12 pb-8 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-serif text-2xl text-primary sm:text-3xl lg:text-4xl">
          {heading}
        </h2>
        {collection?.handle ? (
          <Link
            to="/collections/$handle"
            params={{ handle: collection.handle }}
            className="hidden text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:inline"
          >
            View all
          </Link>
        ) : null}
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-[15px] sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        {products.map((product, i) => (
          <li key={product.id}>
            <RecommendationCard product={product} priority={i < 2} />
          </li>
        ))}
      </ul>

      {collection?.handle ? (
        <Link
          to="/collections/$handle"
          params={{ handle: collection.handle }}
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-5 font-button text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:hidden"
        >
          View all products
        </Link>
      ) : null}
    </section>
  );
}
