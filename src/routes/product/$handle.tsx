import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartProvider } from "@/components/layout/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductBadges } from "@/components/product/ProductBadges";
import { ProductRating } from "@/components/product/ProductRating";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { getProduct } from "@/services/shopify/product.service";
import { useCartStore } from "@/stores/cartStore";

const productQuery = (handle: string) =>
  queryOptions({ queryKey: ["product", handle], queryFn: () => getProduct(handle) });

export const Route = createFileRoute("/product/$handle")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(productQuery(params.handle));
  },
  head: ({ params }) => {
    const name = params.handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — Buy Online | Plantora` },
        {
          name: "description",
          content: `Buy ${name} from Plantora. Premium, healthy plants delivered across the USA with expert care guidance.`,
        },
        { property: "og:title", content: `${name} | Plantora` },
        {
          property: "og:description",
          content: `${name} from Plantora — healthy plant guarantee and nationwide delivery.`,
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(handle));
  if (!data) throw notFound();

  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <ProductView product={data.product} />
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}

function ProductView({ product }: { product: NonNullable<Awaited<ReturnType<typeof getProduct>>>["product"] }) {
  const addLine = useCartStore((s) => s.addLine);
  const isLoading = useCartStore((s) => s.isLoading);
  const [variantId, setVariantId] = useState(product.defaultVariantId);
  const [activeImage, setActiveImage] = useState(product.featuredImage?.url ?? product.gallery[0]?.url ?? null);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0] ?? null;
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const soldOut = variant ? !variant.available : product.availability === "out_of_stock";

  async function handleAdd() {
    if (!variantId || soldOut) return;
    try {
      await addLine(variantId, 1);
      toast.success(`${product.title} added to basket`);
    } catch {
      toast.error("Could not add to basket. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-md bg-secondary">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                width={900}
                height={900}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {product.gallery.length > 1 ? (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {product.gallery.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  className={cn(
                    "size-20 shrink-0 overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    activeImage === img.url ? "border-primary" : "border-border",
                  )}
                >
                  <img src={img.url} alt={img.altText} loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          {product.reviews ? <ProductRating reviews={product.reviews} /> : null}
          <h1 className="mt-2 font-serif text-4xl leading-tight text-primary sm:text-5xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl text-primary">{formatMoney(price.amount, price.currency)}</span>
            {compareAt ? (
              <span className="text-base text-muted-foreground line-through">
                {formatMoney(compareAt.amount, compareAt.currency)}
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <ProductBadges badges={product.badges} />
          </div>

          {product.variants.length > 1 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.available}
                  aria-pressed={variantId === v.id}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    variantId === v.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-primary hover:border-primary",
                  )}
                >
                  {v.title}
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || isLoading}
            className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 font-button text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto sm:min-w-64"
          >
            {soldOut ? "Sold out" : "Add to basket"}
          </button>

          {product.descriptionHtml ? (
            <div
              className="mt-8 text-base leading-relaxed text-muted-foreground [&_a]:underline [&_li]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
