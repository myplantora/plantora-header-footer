import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";

import { Footer } from "@/components/layout/Footer";

import { ProductCard } from "@/components/product/ProductCard";
import { getCollection } from "@/services/shopify/collection.service";

const collectionQuery = (handle: string) =>
  queryOptions({
    queryKey: ["collection", handle],
    queryFn: () => getCollection({ handle }),
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
      <main className="mx-auto max-w-[1400px] px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <header className="max-w-2xl">
          <h1 className="font-serif text-4xl text-primary sm:text-5xl">{collection.title}</h1>
          {collection.descriptionHtml ? (
            <div
              className="mt-4 text-base leading-relaxed text-muted-foreground [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }}
            />
          ) : null}
        </header>

        {collection.products.length === 0 ? (
          <p className="mt-12 text-base text-muted-foreground">
            No products in this collection yet. Please check back soon.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-[15px] md:grid-cols-4 md:gap-8">
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
