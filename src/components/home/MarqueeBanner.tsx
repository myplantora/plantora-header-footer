import React from "react";

export const MarqueeBanner = () => {
  const items = [
    "Guaranteed Replacement",
    "Expert Plant Care Support",
    "Free shipping on orders above $50",
  ];

  // Repeat items to ensure smooth infinite loop
  const repeatedItems = [...items, ...items, ...items, ...items, ...items, ...items];

  return (
    <div className="w-full bg-[#FFFF00] border-y border-[#E8E8E8] overflow-hidden py-3 lg:py-4 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {repeatedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center px-10 lg:px-14"
          >
            <span className="text-[#333333] text-sm lg:text-base font-normal tracking-wide uppercase">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

