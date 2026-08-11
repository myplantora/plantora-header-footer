import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";

import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { getCollectionById } from "@/services/shopify/collection.service";

const BIG_SAVINGS_ID = "659519504677";

const collectionQuery = queryOptions({
  queryKey: ["collection-by-id", BIG_SAVINGS_ID, 48],
  queryFn: () => getCollectionById({ id: BIG_SAVINGS_ID, limit: 48 }),
});

export const Route = createFileRoute("/collections/big-savings-combos")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collectionQuery);
  },
  head: () => {
    return {
      meta: [
        { title: `Big Savings Combos — Premium Plant Bundles | Plantora` },
        {
          name: "description",
          content: `Shop Big Savings Combos at Plantora — premium indoor and outdoor plant bundles delivered healthy across the USA.`,
        },
        { property: "og:title", content: `Big Savings Combos | Plantora` },
        {
          property: "og:description",
          content: `Browse Big Savings Combos plant bundles from Plantora.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BigSavingsPage,
});

function BigSavingsPage() {
  const { data: collection } = useSuspenseQuery(collectionQuery);
  const { track } = useMetaTracking();

  useEffect(() => {
    if (collection) {
      track('ViewCategory', {
        content_name: collection.title,
        content_category: collection.title
      });
    }
  }, [collection, track]);

  if (!collection) throw notFound();

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <main className="mx-auto max-w-[1400px] px-2.5 py-10 lg:py-16">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="font-serif text-[28px] font-bold text-primary sm:text-4xl">{collection.title}</h1>
          {collection.descriptionHtml ? (
            <div
              className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }}
            />
          ) : null}
        </header>

        {collection.products.length === 0 ? (
          <p className="mt-12 text-center text-base text-muted-foreground">
            No products in this collection yet. Please check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-[15px] md:grid-cols-4 md:gap-8">
            {collection.products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
