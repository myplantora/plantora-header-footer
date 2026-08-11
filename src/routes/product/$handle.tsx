import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Minus, Plus, Info, X } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { MarqueeBanner } from "@/components/home/MarqueeBanner";
import { SectionContainer } from "@/components/layout/SectionContainer";


import { CartProvider } from "@/components/layout/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

import { ProductRating } from "@/components/product/ProductRating";
import { DeliveryEstimator } from "@/components/product/DeliveryEstimator";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { getProduct } from "@/services/shopify/product.service";
import { useCartStore } from "@/stores/cartStore";
import { useMetaTracking } from "@/hooks/analytics/useMetaTracking";

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

  // Get background color from promoLabel
  const bgColors: Record<string, string> = {
    "deal": "#B3393F",
    "organic": "#F2E8C2",
    "premium": "#1D4D44",
    "fresh": "#C3E8E8"
  };
  const bgColor = bgColors[data.product.promoLabel || ""] || "#F8F8F8";

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: bgColor }}>
      <ProductView product={data.product} />
      <ProductRecommendations currentProductHandle={handle} />
      <MarqueeBanner />
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
  const [tagMediaError, setTagMediaError] = useState(false);
  
  const handleTagMediaError = () => {
    setTagMediaError(true);
    console.error(`[Plantora] Failed to load Product Tag GIF for product: "${product.title}"`, {
      handle: product.handle,
      url: product.tagMedia?.url,
      timestamp: new Date().toISOString()
    });
  };
  const addLine = useCartStore((s) => s.addLine);
  const isLoading = useCartStore((s) => s.isLoading);
  const search = Route.useSearch() as any;
  const [variantId, setVariantId] = useState(() => {
    if (search.variant) return search.variant;
    return product.defaultVariantId;
  });

  const [quantity, setQuantity] = useState(1);
  const [chartOpen, setChartOpen] = useState(false);
  const [guaranteeOpen, setGuaranteeOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(() => {
    const v = product.variants.find(v => v.id === (search.variant || product.defaultVariantId));
    return v?.image?.url ?? product.featuredImage?.url ?? product.gallery[0]?.url ?? null;
  });

  useEffect(() => {
    const v = product.variants.find(v => v.id === variantId);
    if (v?.image?.url) setActiveImage(v.image.url);
  }, [variantId, product.variants]);

  useEffect(() => {
    if (chartOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [chartOpen]);
  const { trackViewContent, trackAddToCart } = useMetaTracking();
  const boughtCount = boughtCountFromSeed(product.id || product.handle);

  useEffect(() => {
    trackViewContent(product);
  }, [product, trackViewContent]);

  useEffect(() => {
    if (chartOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [chartOpen]);

  const variant = (product.variants.find((v) => v.id === variantId) ?? product.variants[0])!;
  const price = variant.price;
  const compareAt = variant.compareAtPrice;
  const soldOut = !variant.available;

  async function handleAdd() {
    if (!variantId || soldOut) return;
    try {
      await addLine(variantId, quantity);
      trackAddToCart(product, quantity);
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
    <SectionContainer as="main" noPadding className="sm:py-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="min-w-0">
          <div className="relative aspect-square w-full max-w-full overflow-hidden bg-secondary rounded-none">
            {/* Product Tag GIF (Top Left) */}
            {product.tagMedia?.url && !tagMediaError && (
              <div className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4 pointer-events-none">
                <div className="relative">
                  {/* Subtle placeholder while loading */}
                  <div className="absolute inset-0 animate-pulse rounded-full bg-black/5" />
                  <img 
                    src={product.tagMedia.url} 
                    alt="" 
                    aria-hidden="true"
                    className="relative h-auto w-[60px] sm:w-[100px] transition-opacity duration-300"
                    loading="lazy"
                    onLoad={(e) => {
                      (e.currentTarget as HTMLImageElement).parentElement?.firstElementChild?.remove();
                    }}
                    onError={handleTagMediaError}
                    {...({ playsInline: true } as any)}
                  />
                </div>
              </div>
            )}
            {tagMediaError && product.featuredImage?.url && (
              <div className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4 pointer-events-none opacity-50">
                 <img 
                  src={product.featuredImage.url} 
                  alt="" 
                  aria-hidden="true"
                  className="h-auto w-[40px] sm:w-[60px] rounded-full object-cover aspect-square border-2 border-white/50"
                  loading="lazy"
                />
              </div>
            )}

            {/* Removed absolute banner */}



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
          
          {/* Combo Offer Banner - PDP Version - Rendered below image */}

          {product.gallery.length > 1 ? (
            <div className="mt-3 flex gap-3 overflow-x-auto px-2.5">
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

        <div className="min-w-0 flex flex-col gap-3 px-2.5">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
            {product.badges.map((badge, index) => {
              const tagColors = ['#B8D334', '#F0D2D2', '#C2E8E8', '#EEE9D1'];
              const baseIndex = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const bgColor = tagColors[(baseIndex + index) % tagColors.length];
              
              return (
                <span 
                  key={badge.key}
                  style={{ backgroundColor: bgColor }}
                  className="flex items-center gap-1 rounded-full px-1.5 py-1 text-[9px] md:text-[11px] font-normal text-[#254838] leading-none whitespace-nowrap"
                >
                  {badge.iconUrl && (
                    <img src={badge.iconUrl} alt="" className="size-3 object-contain shrink-0" />
                  )}
                  {badge.label}
                </span>
              );
            })}
          </div>

          <h1 className="text-2xl leading-tight text-primary sm:text-3xl ">
            {product.title}
          </h1>

          {product.reviews ? (
            <div className="flex items-center gap-2">
              <ProductRating reviews={product.reviews} />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
              <span className="text-2xl  text-[#1D4D44] whitespace-nowrap">{formatMoney(price.amount, price.currency)}</span>
              {compareAt ? (
                <span className="text-xl text-[#707070] line-through font-normal whitespace-nowrap">
                  {formatMoney(compareAt.amount, compareAt.currency)}
                </span>
              ) : null}
              {compareAt && compareAt.amount > price.amount ? (
                <span className="inline-flex items-center rounded-[10px] bg-[#F4C439] px-2 py-1 text-[11px]  text-[#254838] whitespace-nowrap shrink-0">
                  SAVE {formatMoney(Math.round(compareAt.amount - price.amount), price.currency)}
                </span>
              ) : null}

            </div>
            <button
              type="button"
              onClick={() => setChartOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Size Chart
              <img
                src="https://cdn.shopify.com/s/files/1/0646/8327/8550/files/Mask_group_12.gif?v=1736833818"
                alt=""
                aria-hidden="true"
                className="h-5 w-5 object-contain"
                {...({ playsInline: true } as any)}
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
            <div className="flex flex-col gap-2.5">
              {product.options.map((option) => {
                const currentValue = variant?.selectedOptions.find((o) => o.name === option.name)?.value;
                return (
                  <div key={option.name} className="flex flex-col gap-1.5">
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

          <div className="hidden sm:flex flex-wrap items-center gap-2 mt-1">
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut || isLoading}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:min-w-56"
            >
              {soldOut ? "Sold out" : "Add to basket"}
            </button>
          </div>

          {/* Floating Mobile Add to Basket */}
          <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
            <div className="flex flex-col gap-2 rounded-t-[30px] bg-[#F1EEE0] px-4 pb-8 pt-4 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
              <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut || isLoading}
                className="flex h-14 w-full items-center justify-center rounded-full bg-[#1D4D44] text-[15px] font-bold tracking-widest text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                {soldOut ? "SOLD OUT" : "ADD TO BASKET"}
              </button>
            </div>
          </div>

          <DeliveryEstimator />

          <div className="flex items-center gap-3 rounded-[5px] bg-[#EBE8D8] p-3">
            <img
              src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Replacement.png?v=1786037056"
              alt="10-Day Damage Replacement Guarantee"
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
            />
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm  text-[#1D4D44] sm:text-base">
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
              className="absolute -top-3 -right-3 z-10 grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
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
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <X className="size-4" />
            </button>
            <div className="flex flex-col gap-3 pr-8">
              <span className="font-button text-lg  text-primary">
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
    </SectionContainer>
  );
}

function BadgeItem({ badge }: { badge: any }) {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    setError(true);
    console.error(`[Plantora] Failed to load Badge GIF: "${badge.label}"`, {
      key: badge.key,
      url: badge.iconUrl,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <span 
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium text-[#1D4D44]",
        badge.label === "Indoor Plant" ? "bg-[#C3E8E8]" : "bg-[#F2E8C2]"
      )}
    >
      {badge.iconUrl && !error && (
        <div className="relative size-[18px] shrink-0">
          <div className="absolute inset-0 animate-pulse rounded-full bg-black/5" />
          <img
            src={badge.iconUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="relative size-full object-contain"
            onLoad={(e) => {
              (e.currentTarget as HTMLImageElement).previousElementSibling?.remove();
            }}
            onError={handleError}
            {...({ playsInline: true } as any)}
          />
        </div>
      )}
      {badge.label}
    </span>
  );
}
