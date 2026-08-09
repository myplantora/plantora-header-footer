import React from "react";

export const BrandMission = () => {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-20 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left Side: Rotating Text & Image */}
        <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex items-center justify-center shrink-0">
          {/* Rotating Text Wrapper */}
          <div className="absolute inset-0 animate-spin-slow">
            <svg viewBox="0 0 200 200" className="w-full h-full text-[#1D4D44]">
              <defs>
                <path
                  id="textCircle"
                  d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                />
              </defs>
              <text className="font-quicksand text-[14px] uppercase tracking-[0.1em] fill-current">
                <textPath xlinkHref="#textCircle">
                  Where Greenery Thrives • Where Greenery Thrives •
                </textPath>
              </text>
            </svg>
          </div>
          {/* Inner Image (GIF) */}
          <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-full overflow-hidden flex items-center justify-center bg-[#F8F8F8]">
            <img 
              src="https://kyari.co/cdn/shop/files/Greenery.webp?v=1762848088" 
              alt="Greenery Thrives"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right Side: Text Content */}
        <div className="max-w-xl text-center md:text-left">
          <p className="font-fraunces text-2xl lg:text-3xl text-[#333333] leading-snug">
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
