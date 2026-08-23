export type MegaColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type NavItem = {
  label: string;
  href: string;
  mega?: MegaColumn[];
};

export const announcements = [
  "🌿 Free Shipping on Orders Over $99",
  "🪴 Healthy Plant Guarantee",
  "🚚 Fast Delivery Across the USA",
  "★★★★★ Thousands of Happy Plant Parents",
];

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Indoor Plants",
    href: "/collections/659339542821",
    mega: [
      {
        title: "Shop Indoor",
        links: [
          { label: "Low Light", href: "/collections/low-light" },
          { label: "Pet Friendly", href: "/collections/pet-friendly" },
          { label: "Air Purifying", href: "/collections/air-purifying" },
          { label: "Easy Care", href: "/collections/easy-care" },
          { label: "Large Plants", href: "/collections/large-plants" },
        ],
      },
    ],
  },
  {
    label: "Outdoor Plants",
    href: "/collections/659679805733",
    mega: [
      {
        title: "Shop Outdoor",
        links: [
          { label: "XL Plants", href: "/collections/659679805733" },
          { label: "Flowering", href: "/collections/flowering" },
          { label: "Shrubs", href: "/collections/shrubs" },
          { label: "Balcony", href: "/collections/balcony" },
          { label: "Garden", href: "/collections/garden" },
        ],
      },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const shopLinks = [
  { label: "Indoor Plants", href: "/collections/659339542821" },
  { label: "Outdoor Plants", href: "/collections/659679805733" },
  { label: "Planters", href: "/collections/planters" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Gift Cards", href: "/products/gift-card" },
  { label: "Sale", href: "/collections/sale" },
];

export const helpLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping Information", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Track Order", href: "/track-order" },
  { label: "Plant Care Guide", href: "/plant-care" },
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];
