# Plantora — Premium Header & Footer

Build a production-ready, mobile-first header and footer system for Plantora, plus a demo home page so both are visible in context.

## Design foundation

- Colors added as semantic tokens: brand green `#1D4D44` (primary/footer bg), off-white `#F9F9F9` (header bg/footer text), accent leaf green `#74A84A`, secondary surface `#F4F4F1`, border `#E7E7E7`.
- Typography: Instrument Serif for headings, Inter for body, Satoshi for buttons (loaded via link tags in the root route).
- Radius scale set to 20–24px, soft shadows only, no gradients/glass/neumorphism, generous whitespace.

## Announcement bar

- 38px tall, brand-green background, off-white text.
- Four auto-rotating messages (free shipping, healthy plant guarantee, fast USA delivery, five-star social proof), fading every few seconds, pausing on hover, respecting reduced-motion.

## Header

- Sticky under the announcement bar; transparent at the very top, transitioning to solid `#F9F9F9` with light backdrop blur and a thin bottom border once scrolled.
- Desktop: logo left; centered nav (Home, Indoor Plants, Outdoor Plants, Planters, Plant Care, Best Sellers, About, Contact); right cluster of search, wishlist, account, cart with a live count badge that bounces on change.
- Mega menu panels for Indoor Plants, Outdoor Plants, and Planters with the specified sub-links, opening on hover and keyboard focus with a rotating chevron.
- Underline-grow hover animation and color transition on nav links.
- Mobile: hamburger left, logo center, search/cart/account right; left slide-in drawer with accordion sections, 44px+ touch targets, focus trap and Escape to close.

## Footer

- Brand-green background, four-column desktop grid, stacked on mobile.
- Column 1: logo, "Bring Nature Home." heading, the full brand story copy, and social icons (Facebook, Instagram, Pinterest, TikTok, YouTube) with hover scale.
- Column 2 Shop links; Column 3 Help links — all with underline hover animation.
- Column 4: "Join the Plantora Community" newsletter with animated email input, Subscribe button, and privacy note; submitting shows a confirmation toast (no backend).
- Bottom bar with thin top border: copyright left, "Made with ❤️ for plant lovers across the USA." center, payment marks (Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal) right as inline SVG badges.

## Demo page

- `/` renders the header, a simple hero section that supports the transparent-at-top behaviour, a short content band, and the footer, with proper page metadata.

## Technical notes

- React + Tailwind v4 tokens in `src/styles.css`; components under `src/components/layout/` (AnnouncementBar, Header, MegaMenu, MobileNav, Footer, NewsletterForm, PaymentIcons) with nav/footer link data in a shared config file so it is easy to swap for Shopify data.
- Lucide icons throughout; cart count kept in a small React context so a Shopify cart hook can replace it later.
- Accessibility: semantic `header`/`nav`/`footer`, ARIA labels on icon buttons, `aria-expanded` on menus, visible focus rings, WCAG AA contrast, reduced-motion support.
