import React from "react";

export const BrandMission = () => {
  return (
    <section className="bg-white py-12 lg:py-16 px-2.5 sm:px-0">
      <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left Side: Rotating Text & Image */}
        <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex items-center justify-center shrink-0">
          {/* Inner Image (GIF) - Full Render without cropping */}
          <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-full overflow-hidden flex items-center justify-center bg-[#F8F8F8]">
            <img 
              src="https://kyari.co/cdn/shop/files/Greenery.webp?v=1762848088" 
              alt="Greenery Thrives"
              className="w-full h-full object-contain scale-110"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right Side: Text Content */}
        <div className="max-w-xl text-center md:text-left">
          <p className="font-serif font-[500] text-2xl lg:text-3xl text-[#333333] leading-snug">
            At Plantora, we're on a mission to make greenery{" "}
            <span className="text-[#C3754C]">accessible</span> and{" "}
            <span className="text-[#C3754C]">stylish</span>. Discover our story and
            explore how we're transforming spaces with nature.
          </p>
        </div>
      </div>
    </section>
  );
};
