import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";

import { Footer } from "@/components/layout/Footer";

import { ProductCard } from "@/components/product/ProductCard";
import { getCollection } from "@/services/shopify/collection.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [sortBy, setSortBy] = useState("manual");

  useEffect(() => {
    if (collection) {
      track('ViewCategory', {
        content_name: collection.title,
        content_category: collection.title
      });
    }
  }, [collection, track]);

  const sortedProducts = useMemo(() => {
    if (!collection?.products) return [];
    const products = [...collection.products];
    
    switch (sortBy) {
      case "alpha-asc":
        return products.sort((a, b) => a.title.localeCompare(b.title));
      case "alpha-desc":
        return products.sort((a, b) => b.title.localeCompare(a.title));
      case "price-asc":
        return products.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return products.sort((a, b) => Number(b.price) - Number(a.price));
      case "newest":
        // Fallback to Shopify's default order
        return products;
      case "best-sellers":
        // Fallback to Shopify's default order
        return products;
      default:
        return products;
    }
  }, [collection?.products, sortBy]);

  if (!collection) throw notFound();

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <main className="mx-auto max-w-[1400px] px-2.5 pb-10 lg:pb-16">
        <header className="mb-6 flex flex-col gap-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-[28px] font-bold text-primary sm:text-4xl">{collection.title}</h1>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Featured</SelectItem>
                <SelectItem value="best-sellers">Best Sellers</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="alpha-asc">Alphabetically, A-Z</SelectItem>
                <SelectItem value="alpha-desc">Alphabetically, Z-A</SelectItem>
                <SelectItem value="price-asc">Price, low to high</SelectItem>
                <SelectItem value="price-desc">Price, high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {sortedProducts.length === 0 ? (
          <p className="mt-12 text-center text-base text-muted-foreground">
            No products in this collection yet. Please check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-[15px] md:grid-cols-4 md:gap-8">
            {sortedProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
