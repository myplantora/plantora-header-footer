import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Minus, Plus, Info } from "lucide-react";

import { Footer } from "@/components/layout/Footer";

import { CartProvider } from "@/components/layout/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductBadges } from "@/components/product/ProductBadges";
import { ProductRating } from "@/components/product/ProductRating";
import { DeliveryEstimator } from "@/components/product/DeliveryEstimator";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
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
    <div className="min-h-screen bg-[#F8F8F8]">
      <ProductView product={data.product} />
      <ProductRecommendations currentProductHandle={handle} />
      <Footer />
    </div>
  );
}

function boughtCountFromSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return 50 + (Math.abs(hash) % 101);
}

function ProductView({ product }: { product: NonNullable<Awaited<ReturnType<typeof getProduct>>>["product"] }) {
  const addLine = useCartStore((s) => s.addLine);
  const isLoading = useCartStore((s) => s.isLoading);
  const [variantId, setVariantId] = useState(product.defaultVariantId);
  const [activeImage, setActiveImage] = useState(product.featuredImage?.url ?? product.gallery[0]?.url ?? null);
  const [chartOpen, setChartOpen] = useState(false);
  const [guaranteeOpen, setGuaranteeOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const boughtCount = boughtCountFromSeed(product.id || product.handle);

  useEffect(() => {
    if (chartOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [chartOpen]);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0] ?? null;
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const soldOut = variant ? !variant.available : product.availability === "out_of_stock";

  async function handleAdd() {
    if (!variantId || soldOut) return;
    try {
      await addLine(variantId, quantity);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(80);
      }
      toast.success(`${product.title} added to basket`, {
        icon: <Check className="size-4" />,
      });
    } catch {
      toast.error("Could not add to basket. Please try again.");
    }
  }

  function decreaseQty() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increaseQty() {
    setQuantity((q) => q + 1);
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] overflow-x-hidden bg-[#F8F8F8] p-2.5 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="aspect-square w-full max-w-full overflow-hidden rounded-md bg-secondary p-[6px]">

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

        <div className="min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <ProductBadges badges={product.badges} />
            {product.reviews ? <ProductRating reviews={product.reviews} /> : null}
          </div>

          <h1 className="font-serif text-4xl leading-tight text-primary sm:text-5xl">
            {product.title}
          </h1>


          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-serif text-2xl font-bold text-[#1D4D44]">{formatMoney(price.amount, price.currency)}</span>
              {compareAt ? (
                <span className="text-2xl text-[#C3754C] line-through">
                  {formatMoney(compareAt.amount, compareAt.currency)}
                </span>
              ) : null}
              {compareAt && compareAt.amount > price.amount ? (
                <span className="inline-flex items-center self-center rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100)}% OFF
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setChartOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Size Chart
              <img
                src="https://cdn.shopify.com/s/files/1/0646/8327/8550/files/Mask_group_12.gif?v=1736833818"
                alt=""
                aria-hidden="true"
                className="h-5 w-5 object-contain"
              />
            </button>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-md bg-[#8CD4DC] px-3 py-2 text-sm font-medium text-primary">
            <img
              src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Bag.svg?v=1786034307"
              alt=""
              aria-hidden="true"
              className="h-5 w-5 object-contain"
            />
            {boughtCount}+ bought in last week
          </div>

          {product.options.length > 0 && product.variants.length > 1 ? (
            <div className="flex flex-col gap-4">
              {product.options.map((option) => {
                const currentValue = variant?.selectedOptions.find((o) => o.name === option.name)?.value;
                return (
                  <div key={option.name} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary">
                      {option.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const active = currentValue === value;
                        const matchingVariant = product.variants.find((v) =>
                          v.selectedOptions.every((so) => {
                            if (so.name === option.name) return so.value === value;
                            return so.value === variant?.selectedOptions.find((o) => o.name === so.name)?.value;
                          }),
                        );
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={!matchingVariant?.available}
                            aria-pressed={active}
                             onPointerDown={(e) => {
                               e.stopPropagation();
                               matchingVariant && setVariantId(matchingVariant.id);
                             }}
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                             }}
                            className={cn(
                              "rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-primary hover:border-primary",
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center overflow-hidden rounded-md border border-border bg-background">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={decreaseQty}
                disabled={quantity <= 1 || soldOut}
                className="grid h-10 w-10 place-items-center text-primary transition-colors hover:bg-secondary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="grid h-10 w-10 place-items-center text-sm font-semibold text-primary">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={increaseQty}
                disabled={soldOut}
                className="grid h-10 w-10 place-items-center text-primary transition-colors hover:bg-secondary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut || isLoading}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-5 font-button text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto sm:min-w-56"
            >
              {soldOut ? "Sold out" : "Add to basket"}
            </button>
          </div>

          <DeliveryEstimator />

          <div className="flex items-center gap-3 rounded-[5px] bg-[#EBE8D8] p-3 sm:p-4">
            <img
              src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Replacement.png?v=1786037056"
              alt="10-Day Damage Replacement Guarantee"
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
            />
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-button text-sm font-bold text-[#1D4D44] sm:text-base">
                10-Day Damage Replacement Guarantee
              </span>
              <span className="text-xs text-[#1D4D44]/80 sm:text-sm">
                Damaged or Lifeless? We’ll replace it for free!
              </span>
            </div>
            <button
              type="button"
              aria-label="Learn more about replacement guarantee"
              onClick={() => setGuaranteeOpen(true)}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-[#B87B4E] text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Info className="size-4" />
            </button>
          </div>

          {product.descriptionHtml ? (
            <div
              className="text-base leading-relaxed text-muted-foreground [&_a]:underline [&_li]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : null}
        </div>
      </div>

      {chartOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size chart"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setChartOpen(false)}
        >
          <div className="relative w-[90vw] max-w-[1080px]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Close size chart"
              onClick={() => setChartOpen(false)}
              className="absolute -top-3 -right-3 z-10 grid size-9 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <X className="size-5" />
            </button>
            <img
              src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Chart.svg?v=1786030200"
              alt="Size chart"
              className="max-h-[95vh] w-full rounded-md bg-background object-contain"
            />
          </div>
        </div>
      ) : null}

      {guaranteeOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Replacement guarantee details"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setGuaranteeOpen(false)}
        >
          <div
            className="relative w-[90vw] max-w-md rounded-[5px] bg-background p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close replacement guarantee details"
              onClick={() => setGuaranteeOpen(false)}
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <X className="size-4" />
            </button>
            <div className="flex flex-col gap-3 pr-8">
              <span className="font-button text-lg font-bold text-primary">
                10-Day Damage Replacement Guarantee
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Oops! Did your plants or planters arrive damaged? No worries at all—we&apos;ve got your back! Here&apos;s how we can help:
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Simply share a few photos with us, and we&apos;ll send you a replacement, free of charge, right away.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Quick &amp; Easy! Your replacement will be on its way within just 2 days of raising a ticket. 🌟
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We&apos;re Here to Help! Plus, get free care tips with your order.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>

  );
}
