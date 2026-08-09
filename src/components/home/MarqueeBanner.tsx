import React from "react";

export const MarqueeBanner = () => {
  const items = [
    "Guaranteed Replacement",
    "Cash on Delivery Available",
    "Free shipping on orders above ₹399",
  ];

  // Repeat items to ensure smooth infinite loop
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full bg-white border-y border-[#E8E8E8] overflow-hidden py-4 lg:py-6 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {repeatedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center px-8 lg:px-12"
          >
            <span className="text-[#333333] text-sm lg:text-base font-medium tracking-wide">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
