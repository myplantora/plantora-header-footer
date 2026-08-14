import React from "react";

export const SelfWateringSection = () => {
  return (
    <div className="w-full bg-[#1D4D44] py-8 lg:py-16 my-6 lg:my-10">
      <div className="container mx-auto px-5 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16">
          
          {/* Main Content Side */}
          <div className="w-full lg:w-[45%] text-white text-center lg:text-left order-2 lg:order-1">
            <h2 className="text-[28px] lg:text-[40px] font-serif mb-2 lg:mb-3 leading-tight">
              About Self-Watering Planters
            </h2>
            <p className="text-[14px] lg:text-[16px] opacity-90 mb-6 lg:mb-8 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Self-watering planters provide consistent moisture, prevent overwatering, and simplify care for healthy plant growth.
            </p>

            <div className="mt-8 lg:mt-12">
              <h3 className="text-[22px] lg:text-[32px] font-serif mb-8 lg:mb-12">
                How it works
              </h3>
              
              <div className="flex flex-row justify-center lg:justify-start gap-3 lg:gap-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center w-1/3 max-w-[160px]">
                  <div className="relative mb-3 lg:mb-4 w-full aspect-square">
                    <div className="w-full h-full rounded-[15px] lg:rounded-[22px] overflow-hidden border-2 border-white/10">
                      <img 
                        src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT2.webp?v=1786000666" 
                        alt="Step 1" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] lg:text-[15px] font-sans leading-snug px-1">
                    Fill the Water Reservoir
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center w-1/3 max-w-[160px]">
                  <div className="relative mb-3 lg:mb-4 w-full aspect-square">
                    <div className="w-full h-full rounded-[15px] lg:rounded-[22px] overflow-hidden border-2 border-white/10">
                      <img 
                        src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT3.webp?v=1786000666" 
                        alt="Step 2" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] lg:text-[15px] font-sans leading-snug px-1">
                    Water reaches the soil as needed
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center w-1/3 max-w-[160px]">
                  <div className="relative mb-3 lg:mb-4 w-full aspect-square">
                    <div className="w-full h-full rounded-[15px] lg:rounded-[22px] overflow-hidden border-2 border-white/10">
                      <img 
                        src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT4.webp?v=1786000666" 
                        alt="Step 3" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] lg:text-[15px] font-sans leading-snug px-1">
                    Healthy and Happy Plant
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Large Demonstration Image */}
          <div className="w-full lg:w-[45%] order-1 lg:order-2 mb-10 lg:mb-0">
            <div className="rounded-[22px] lg:rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT1.webp?v=1786000666" 

                alt="Self-watering planter demonstration" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
