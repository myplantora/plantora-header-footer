import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getProductCards } from "@/services/shopify/collection.service";
import { CollectionSort } from "@/components/collection/CollectionSort";
import { PaginationGrid } from "@/components/collection/PaginationGrid";

const allProductsQuery = queryOptions({
  queryKey: ["all-products", 48],
  queryFn: () => getProductCards({ first: 48 }),
});

export const Route = createFileRoute("/collections/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(allProductsQuery);
  },
  head: () => ({
    meta: [
      { title: "All Plants & Planters | Shop the Plantora Collection" },
      {
        name: "description",
        content:
          "Browse every Plantora plant and planter — indoor greenery, outdoor favourites and self-watering planters, delivered healthy across the USA.",
      },
      { property: "og:title", content: "Shop All Plants | Plantora" },
      {
        property: "og:description",
        content: "Every Plantora plant and planter in one place, delivered healthy across the USA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-5 py-24 text-center text-primary">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center text-primary">No products found.</div>
  ),
  component: AllProducts,
});

function AllProducts() {
  const { data } = useSuspenseQuery(allProductsQuery);
  const [sortedProducts, setSortedProducts] = useState(data.products);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <main className="mx-auto max-w-[1400px] px-2.5 pb-16 pt-4 sm:px-6 lg:px-10">
        <header className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-[28px] font-bold text-primary sm:text-4xl">All Products</h1>
          </div>
          <CollectionSort products={data.products} onSortChange={setSortedProducts} />
        </header>

        {sortedProducts.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">No products found.</p>
        ) : (
          <PaginationGrid products={sortedProducts} pageSize={20} />
        )}
      </main>
    </div>
  );
}
