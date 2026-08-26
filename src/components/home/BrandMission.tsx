import React from "react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export const BrandMission = () => {
  return (
    <SectionContainer className="bg-white py-12 lg:py-16">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16">



        {/* Right Side: Text Content */}
        <div className="max-w-xl text-center md:text-left">
          <p className="font-[500] text-2xl lg:text-3xl text-[#333333] leading-snug">
            At Plantora, we're on a mission to make greenery{" "}
            <span className="text-[#C3754C]">accessible</span> and{" "}
            <span className="text-[#C3754C]">stylish</span>. Discover our story and
            explore how we're transforming spaces with nature.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
};
