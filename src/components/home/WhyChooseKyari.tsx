import React from "react";
import { SectionContainer } from "@/components/layout/SectionContainer";

const PLANTORA_FEATURES = [
  {
    title: "Self Watering Planters",
    description: "Designed for ease and elegance.",
    image: "//kyari.co/cdn/shop/files/Group_1000009773_1.svg?v=1761197523&width=480",
  },
  {
    title: "Aesthetic Designs",
    description: "Stylish planters to match modern interiors.",
    image: "//kyari.co/cdn/shop/files/Group_1000009772_1.svg?v=1761197525&width=480",
  },
  {
    title: "Innovative Plant Care",
    description: "Let your customers know about local pickup",
    image: "//kyari.co/cdn/shop/files/Group_1000009771_1.svg?v=1761197526&width=480",
  },
  {
    title: "Healthy Plants",
    description: "Handpicked and nurtured for 3 months.",
    image: "//kyari.co/cdn/shop/files/Group_1000010020_1.svg?v=1761197528&width=480",
  },
];

export function WhyChooseKyari() {
  return (
    <SectionContainer className="bg-[#F8F8F8] py-8 md:py-12">
      <div className="mb-4 text-center md:mb-8">
        <h2 className="font-fraunces text-[22px] font-medium tracking-tight text-[#1D4D44] md:text-3xl">
          Why Choose Plantora?
        </h2>
      </div>
      
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-4 md:gap-x-6 md:gap-y-8">
        {PLANTORA_FEATURES.map((feature, index) => (
          <div 
            key={index} 
            className="group flex flex-col items-center text-center"
          >
            <div className="relative mb-1.5 flex aspect-square w-full max-h-[80px] md:max-h-[100px] items-center justify-center overflow-hidden rounded-[5px] bg-transparent transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                src={feature.image}
                alt={feature.title}
                className="h-[80%] w-[80%] object-contain"
                loading="lazy"
              />
            </div>
            
            <div className="space-y-0.5 px-1">
              <h3 className="font-sans text-[13px] font-bold leading-tight text-[#1D4D44] md:text-[15px]">
                <span className="relative inline-block">
                  {feature.title}
                </span>
              </h3>
              <p className="font-sans text-[11px] leading-relaxed text-[#1D4D44]/70 md:text-[12px]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
