import React from "react";

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
    <section className="bg-[#F8F8F8] py-12 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
        <div className="mb-10 text-center lg:mb-16">
          <h2 className="font-fraunces text-3xl font-medium tracking-tight text-[#1D4D44] md:text-4xl">
            Why Choose Plantora?
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {PLANTORA_FEATURES.map((feature, index) => (
            <div 
              key={index} 
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[5px] bg-[#F9F9F9] transition-transform duration-500 group-hover:scale-[1.02]">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-[60%] w-[60%] object-contain"
                  loading="lazy"
                />
              </div>
              
              <div className="space-y-1.5 px-1">
                <h3 className="font-sans text-[15px] font-bold leading-tight text-[#1D4D44] lg:text-lg">
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#74A84A] after:transition-all after:duration-300 group-hover:after:w-full">
                    {feature.title}
                  </span>
                </h3>
                <p className="font-sans text-[12px] leading-relaxed text-[#1D4D44]/70 lg:text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
