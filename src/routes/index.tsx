import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/layout/Footer";
import { CartProvider, useCart } from "@/components/layout/CartContext";


import { BannerSection } from "@/components/home/BannerSection";
import { CollectionScroller, collectionByIdQuery } from "@/components/home/CollectionScroller";
import { SelfWateringSection } from "@/components/home/SelfWateringSection";

const HOME_COLLECTION_ID = "659339542821";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collectionByIdQuery(HOME_COLLECTION_ID));
  },
  head: () => ({
    meta: [
      { title: "Plantora — Premium Indoor & Outdoor Plants Delivered in the USA" },
      {
        name: "description",
        content:
          "Plantora delivers premium indoor and outdoor plants across the United States, with expert care guidance and a healthy plant guarantee.",
      },
      { property: "og:title", content: "Plantora — Bring Nature Home" },
      {
        property: "og:description",
        content:
          "Carefully selected indoor and outdoor plants, delivered healthy across the USA with expert guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Hero() {
  const { addItem } = useCart();
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-[1400px] px-5 py-12 text-center sm:px-6 lg:px-10 lg:py-36">
        <p className="animate-fade-in text-[12px] font-medium uppercase tracking-[0.2em] text-accent">
          Premium plants, delivered
        </p>
        <h1 className="animate-fade-in mx-auto mt-6 max-w-3xl font-serif text-4xl font-bold leading-[1.1] text-primary sm:text-6xl">
          Bring nature home, one healthy plant at a time.
        </h1>
        <p className="animate-fade-in mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
          Carefully selected indoor and outdoor plants, packed with care and backed by expert
          guidance across the United States.
        </p>
        <button
          type="button"
          onClick={() => addItem()}
          className="mt-9 inline-flex items-center rounded-[20px] bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Add a plant to cart
        </button>
      </div>
    </section>
  );
}

function Index() {
  return (
    <>
      <main>
        <BannerSection />
        <Hero />
        <CollectionScroller collectionId="659339542821" />
        <SelfWateringSection />
        
      </main>
      <Footer />
    </>
  );
}
