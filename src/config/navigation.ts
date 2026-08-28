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

const INDOOR = "/collections/659339542821";
const OUTDOOR = "/collections/659679805733";
const COMBOS = "/collections/big-savings-combos";

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Indoor Plants",
    href: INDOOR,
    mega: [
      {
        title: "Shop Indoor",
        links: [
          { label: "All Indoor Plants", href: INDOOR },
          { label: "Big Savings Combos", href: COMBOS },
          { label: "Shop All Products", href: "/collections" },
        ],
      },
    ],
  },
  {
    label: "Outdoor Plants",
    href: OUTDOOR,
    mega: [
      {
        title: "Shop Outdoor",
        links: [
          { label: "XL Plants", href: OUTDOOR },
          { label: "Big Savings Combos", href: COMBOS },
          { label: "Shop All Products", href: "/collections" },
        ],
      },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const shopLinks = [
  { label: "Indoor Plants", href: INDOOR },
  { label: "Outdoor Plants", href: OUTDOOR },
  { label: "Big Savings Combos", href: COMBOS },
  { label: "All Products", href: "/collections" },
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
