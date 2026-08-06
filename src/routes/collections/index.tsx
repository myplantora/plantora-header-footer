import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartProvider } from "@/components/layout/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductCards } from "@/services/shopify/collection.service";

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

  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <h1 className="font-serif text-3xl text-primary sm:text-5xl">All products</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {data.products.length} plants and planters ready to ship.
        </p>

        {data.products.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">No products found.</p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {data.products.map((product, i) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  priority={i < 4}
                  tone={i % 4 === 0 ? "berry" : "default"}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </CartProvider>
  );
}
