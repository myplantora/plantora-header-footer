import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";
import { posthogService } from "@/lib/analytics/posthog";


import { getCollection } from "@/services/shopify/collection.service";
import { CollectionSort } from "@/components/collection/CollectionSort";
import { PaginationGrid } from "@/components/collection/PaginationGrid";
import { SelfWateringSection } from "@/components/home/SelfWateringSection";
import { DynamicInternalLinks } from "@/components/seo/DynamicInternalLinks";
import { StructuredData, getCollectionSchema, getBreadcrumbSchema } from "@/components/seo/SEOProvider";



const collectionQuery = (handle: string) =>
  queryOptions({
    queryKey: ["collection", handle],
    queryFn: () => getCollection({ handle, limit: 250 }),
  });

export const Route = createFileRoute("/collections/$handle")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(collectionQuery(params.handle));
  },
  head: ({ params }) => {
    const name = params.handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} Plants — Shop the Collection | Plantora` },
        {
          name: "description",
          content: `Shop the ${name} collection at Plantora — premium indoor and outdoor plants delivered healthy across the USA.`,
        },
        { property: "og:title", content: `${name} Collection | Plantora` },
        {
          property: "og:description",
          content: `Browse ${name} plants, planters and accessories from Plantora.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { handle } = Route.useParams();
  const { data: collection } = useSuspenseQuery(collectionQuery(handle));
  const { track } = useMetaTracking();
  const [sortedProducts, setSortedProducts] = useState(collection?.products || []);

  useEffect(() => {
    if (collection?.products) {
      setSortedProducts(collection.products);
    }
  }, [collection?.products]);

  useEffect(() => {
    if (collection) {
      posthogService.trackCollectionViewed({
        collection_id: collection.id,
        collection_handle: collection.handle,
        collection_title: collection.title,
        product_count: collection.products?.length,
      });
      // Also track general shopify page view for monorail/posthog
      import("@/lib/analytics").then(({ trackShopifyPageView }) => {
        trackShopifyPageView("collection", collection.id);
      });
    }
  }, [collection]);

  if (!collection) throw notFound();

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <StructuredData data={getCollectionSchema(collection, collection.products || []) as any} />
      <StructuredData 
        data={getBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: collection.title, item: `/collections/${handle}` }
        ]) as any} 
      />
      <main className="mx-auto max-w-[1400px] px-2.5 pb-10 lg:pb-16">
        <header className="mb-6 flex flex-col items-center gap-6 pt-[3px]">
          <h1 className="w-full text-center font-serif text-[28px] font-bold text-primary sm:text-4xl">{collection.title}</h1>
          <CollectionSort products={collection.products} onSortChange={setSortedProducts} />
        </header>

        {sortedProducts.length === 0 ? (
          <p className="mt-12 text-center text-base text-muted-foreground">
            No products in this collection yet. Please check back soon.
          </p>
        ) : (
          <PaginationGrid products={sortedProducts} pageSize={20} />
        )}

        <DynamicInternalLinks 
          currentHandle={handle} 
          type="collection" 
          className="mt-12"
        />
      </main>

      
      <SelfWateringSection />
    </div>
  );
}
