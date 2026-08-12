import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/layout/Footer";
import { CartProvider, useCart } from "@/components/layout/CartContext";


import { BannerSection } from "@/components/home/BannerSection";
import { CollectionScroller, collectionByIdQuery } from "@/components/home/CollectionScroller";
import { WhyChooseKyari } from "@/components/home/WhyChooseKyari";

import { BrandMission } from "@/components/home/BrandMission";
import { MarqueeBanner } from "@/components/home/MarqueeBanner";



const HOME_COLLECTION_ID = "659339542821";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collectionByIdQuery(HOME_COLLECTION_ID));
    context.queryClient.ensureQueryData(collectionByIdQuery("659519504677"));
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
        <CollectionScroller collectionId="659519504677" />
        <CollectionScroller collectionId="659339542821" />
        <WhyChooseKyari />
        
        <BrandMission />
        <MarqueeBanner />

        <div className="mx-auto max-w-[1400px] px-4 py-8 text-center text-[13px] text-muted-foreground/60 whitespace-pre-line">
          '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
          {"\n\n"}
          Can you help me why there is any issue when i click on Add to basket button, its not getting updated in card slider as product or item ? can you find the rootcause for the issue, was it an issue in api reponse or our end
        </div>

      </main>
      <Footer />
    </>
  );
}
