import React from 'react';

export const SelfWateringSection = () => {
  return (
    <section className="bg-[#1D4D44] py-12 px-4 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-fraunces text-3xl md:text-5xl text-white mb-4">
            About Self-Watering Planters
          </h2>
          <p className="font-quicksand text-white/80 max-w-2xl mx-auto">
            Experience the future of plant care with our innovative self-watering technology. 
            Perfect for busy plant parents who want their greenery to thrive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              step: "1",
              title: "Water Reservoir",
              description: "The bottom chamber holds water, keeping it separate from the soil to prevent root rot.",
              image: "https://kyari.co/cdn/shop/files/PT1.webp?v=1762848088"
            },
            {
              step: "2",
              title: "Capillary Action",
              description: "Special wicks or soil bridges pull moisture upward only as the plant needs it.",
              image: "https://kyari.co/cdn/shop/files/PT1.webp?v=1762848088"
            },
            {
              step: "3",
              title: "Thriving Plants",
              description: "Your plants enjoy consistent hydration for up to 2-4 weeks without manual watering.",
              image: "https://kyari.co/cdn/shop/files/PT1.webp?v=1762848088"
            }
          ].map((item, index) => (
            <div key={index} className="relative bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-[#C3754C] rounded-full flex items-center justify-center text-white font-bold">
                {item.step}
              </div>
              <div className="aspect-square mb-6 overflow-hidden rounded-xl">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </div>
              <h3 className="font-fraunces text-xl text-white mb-2">{item.title}</h3>
              <p className="font-quicksand text-sm text-white/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
