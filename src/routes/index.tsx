import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider, useCart } from "@/components/layout/CartContext";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SelfWateringSection } from "@/components/home/SelfWateringSection";
import { CollectionScroller, collectionByIdQuery } from "@/components/home/CollectionScroller";

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
      <div className="mx-auto max-w-[1400px] px-5 py-24 text-center sm:px-6 lg:px-10 lg:py-36">
        <p className="animate-fade-in text-[12px] font-medium uppercase tracking-[0.2em] text-accent">
          Premium plants, delivered
        </p>
        <h1 className="animate-fade-in mx-auto mt-6 max-w-3xl font-serif text-4xl leading-[1.1] text-primary sm:text-6xl">
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
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <CollectionScroller collectionId="659339542821" />
        <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-6 lg:px-10 lg:pt-28">
          <h2 className="font-serif text-3xl text-primary sm:text-4xl">Offers for you today</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Offer3.png?v=1785958543", alt: "Plantora offer: seasonal indoor plant deal" },
              { src: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Offer2.png?v=1785958543", alt: "Plantora offer: outdoor plant bundle savings" },
              { src: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Offer1.png?v=1785958543", alt: "Plantora offer: planters and accessories discount" },
            ].map((offer) => (
              <a
                key={offer.src}
                href="#"
                className="group block overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <img
                  src={offer.src}
                  alt={offer.alt}
                  width={512}
                  height={330}
                  loading="lazy"
                  className="aspect-[512/330] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </a>
            ))}
          </div>
        </section>
        <SelfWateringSection />
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-6 lg:px-10 lg:py-28">



          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "Healthy Plant Guarantee", body: "Every plant arrives thriving, or we replace it." },
              { title: "Expert Guidance", body: "Care guides and support from real plant people." },
              { title: "Nationwide Delivery", body: "Fast, protective packaging to all 50 states." },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <h2 className="font-serif text-2xl text-primary">{card.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </CartProvider>
  );
}
