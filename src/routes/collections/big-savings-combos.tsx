import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";
import { posthogService } from "@/lib/analytics/posthog";

import { Footer } from "@/components/layout/Footer";
import { getCollectionById } from "@/services/shopify/collection.service";
import { CollectionSort } from "@/components/collection/CollectionSort";
import { PaginationGrid } from "@/components/collection/PaginationGrid";
import { MarqueeBanner } from "@/components/home/MarqueeBanner";
import { SelfWateringSection } from "@/components/home/SelfWateringSection";


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
  const [sortedProducts, setSortedProducts] = useState(collection?.products || []);

  useEffect(() => {
    if (collection?.products) {
      setSortedProducts(collection.products);
    }
  }, [collection?.products]);

  useEffect(() => {
    if (collection) {
      track('ViewCategory', {
        content_name: collection.title,
        content_category: collection.title
      });
      posthogService.trackCollectionViewed({
        collection_id: collection.id,
        collection_handle: collection.handle,
        collection_title: collection.title,
        product_count: collection.products?.length,
      });
    }
  }, [collection, track]);

  if (!collection) throw notFound();

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <main className="mx-auto max-w-[1400px] px-2.5 pb-10 lg:pb-16">
        <header className="mb-6 flex flex-col items-center justify-center gap-6 pt-[3px] text-center">
          <h1 className="font-serif text-[28px] font-bold text-primary sm:text-4xl">{collection.title}</h1>
          <CollectionSort products={collection.products} onSortChange={setSortedProducts} />
        </header>

        {sortedProducts.length === 0 ? (
          <p className="mt-12 text-center text-base text-muted-foreground">
            No products in this collection yet. Please check back soon.
          </p>
        ) : (
          <PaginationGrid products={sortedProducts} pageSize={20} />
        )}
      </main>
      
      <SelfWateringSection />
      <MarqueeBanner />
      <Footer />
    </div>
  );
}