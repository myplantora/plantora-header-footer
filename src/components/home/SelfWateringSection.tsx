import React from 'react';

export const SelfWateringSection = () => {
  return (
    <section className="bg-[#2A564D] py-8 px-2.5 md:py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Main Image Banner */}
        <div className="mb-10 px-2.5 md:px-0">
          <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[40px]">
            <img 
              src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT1.webp?v=1786000666" 
              alt="About Self-Watering Planters"
              className="w-full h-auto block"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center mb-10 px-4">
          <h2 className="font-fraunces text-[28px] md:text-5xl text-white mb-3">
            About Self-Watering Planters
          </h2>
          <p className="font-quicksand text-white/90 text-[15px] md:text-lg max-w-2xl mx-auto leading-relaxed">
            Self-watering planters provide consistent moisture, prevent overwatering, and simplify care for healthy plant growth.
          </p>
        </div>

        <div className="text-center mb-10">
          <h3 className="font-fraunces text-2xl text-white">How it works</h3>
        </div>

        {/* Steps Grid */}
        <div className="flex flex-row justify-between gap-2.5 md:gap-8 mb-4 px-2.5">
          {[
            {
              step: "1",
              title: "Fill the Water Reservoir",
              image: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT2.webp?v=1786000666"
            },
            {
              step: "2",
              title: "Water reaches the soil as needed",
              image: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT3.webp?v=1786000666"
            },
            {
              step: "3",
              title: "Healthy and Happy Plant",
              image: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT4.webp?v=1786000666"
            }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 min-w-0 relative">
              <div className="relative w-full aspect-square mb-3">
                <div className="w-full h-full overflow-hidden rounded-[10px] md:rounded-[20px] bg-white/5">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="font-quicksand text-center text-white text-[10px] md:text-lg font-medium leading-tight">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
