import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/layout/Footer";
import { CartProvider, useCart } from "@/components/layout/CartContext";


import { BannerSection } from "@/components/home/BannerSection";
import { CollectionScroller, collectionByIdQuery } from "@/components/home/CollectionScroller";
import { WhyChooseKyari } from "@/components/home/WhyChooseKyari";
import { SelfWateringSection } from "@/components/home/SelfWateringSection";
import { BrandMission } from "@/components/home/BrandMission";
import { MarqueeBanner } from "@/components/home/MarqueeBanner";



const HOME_COLLECTION_ID = "659339542821";
const XL_PLANTS_COLLECTION_ID = "659679805733";
const BIG_SAVINGS_COMBO_ID = "659519504677";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collectionByIdQuery(HOME_COLLECTION_ID));
    context.queryClient.ensureQueryData(collectionByIdQuery(BIG_SAVINGS_COMBO_ID));
    context.queryClient.ensureQueryData(collectionByIdQuery(XL_PLANTS_COLLECTION_ID));
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


function Index() {
  return (
    <>
      <main>
        <BannerSection />
        <CollectionScroller collectionId={XL_PLANTS_COLLECTION_ID} />
        <CollectionScroller collectionId={BIG_SAVINGS_COMBO_ID} />
        <CollectionScroller collectionId={HOME_COLLECTION_ID} />
        <WhyChooseKyari />
        <SelfWateringSection />
        <BrandMission />
        <MarqueeBanner />
      </main>
      <Footer />
    </>
  );
}

