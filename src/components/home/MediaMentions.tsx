import React from "react";
import mediaMentionsAsset from "@/assets/media-mentions.png.asset.json";

export const MediaMentions = () => {
  return (
    <section className="bg-white py-12 lg:py-16 px-2.5 sm:px-0">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="text-center font-fraunces text-xl lg:text-2xl text-[#1D4D44] mb-8 lg:mb-12">
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
      </div>
    </section>
  );
};
