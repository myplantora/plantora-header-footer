import React from "react";

export const SelfWateringSection = () => {
  return (
    <div className="w-full bg-[#1D4D44] relative overflow-hidden py-12 lg:py-20 my-12 lg:my-20">
      {/* Background with overlay to match the look of the provided code */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none bg-center bg-cover"
        style={{ 
          backgroundImage: `url('https://cdn.shopify.com/s/files/1/0646/8327/8550/files/Group_1000009880.jpg?v=1761196127')` 
        }}
      />
      
      <div className="relative container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex flex-col-reverse lg:flex-row-reverse items-center justify-between gap-12 lg:gap-20">
          
          {/* Main Image Side */}
          <div className="w-full lg:w-[45%]">
            <div className="rounded-[22px] overflow-hidden shadow-2xl">
              <img 
                src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT4.webp?v=1786000666" 
                alt="Self-watering planter demonstration" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Text & Steps Side */}
          <div className="w-full lg:w-[50%] text-white">
            <h2 className="text-3xl lg:text-5xl font-serif mb-6 leading-tight">
              About Self-Watering Planters
            </h2>
            <p className="text-base lg:text-lg opacity-90 mb-10 font-sans leading-relaxed max-w-xl">
              Self-watering planters provide consistent moisture, prevent overwatering, and simplify care for healthy plant growth.
            </p>

            <div className="mt-12">
              <h3 className="text-xl lg:text-2xl font-serif mb-8 flex items-center gap-3">
                How it works
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="relative mb-4 w-full aspect-square max-w-[160px] mx-auto">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#C3754C] rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-lg">
                      1
                    </div>
                    <div className="w-full h-full rounded-[15px] overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-colors">
                      <img 
                        src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT1.webp?v=1786000666" 
                        alt="Fill reservoir" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-sm lg:text-base font-sans leading-snug px-2">
                    Fill the Water Reservoir
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="relative mb-4 w-full aspect-square max-w-[160px] mx-auto">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#C3754C] rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-lg">
                      2
                    </div>
                    <div className="w-full h-full rounded-[15px] overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-colors">
                      <img 
                        src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT2.webp?v=1786000666" 
                        alt="Water reaches soil" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-sm lg:text-base font-sans leading-snug px-2">
                    Water reaches the soil as needed
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="relative mb-4 w-full aspect-square max-w-[160px] mx-auto">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#C3754C] rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-lg">
                      3
                    </div>
                    <div className="w-full h-full rounded-[15px] overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-colors">
                      <img 
                        src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT3.webp?v=1786000666" 
                        alt="Healthy plant" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-sm lg:text-base font-sans leading-snug px-2">
                    Healthy and Happy Plant
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
