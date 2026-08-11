import React from "react";
import mediaMentionsAsset from "@/assets/media-mentions.png.asset.json";
import { SectionContainer } from "@/components/layout/SectionContainer";

export const MediaMentions = () => {
  return (
    <SectionContainer className="bg-white py-12 lg:py-16">
      <h2 className="text-center font-fraunces text-xl lg:text-2xl text-[#254838] mb-8 lg:mb-12">
        Our Media Mentions
      </h2>
      <div className="flex justify-center">
        <img 
          src={mediaMentionsAsset.url} 
          alt="Our Media Mentions" 
          className="w-full max-w-[1200px] h-auto object-contain"
          loading="lazy"
        />
      </div>
    </SectionContainer>
  );
};
