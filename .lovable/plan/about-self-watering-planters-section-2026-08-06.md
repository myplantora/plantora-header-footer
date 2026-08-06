# "About Self-Watering Planters" Section

A new full-width section added directly above the three feature cards ("Healthy Plant Guarantee" etc.) on the homepage, matching the attached desktop and mobile designs.

## Content

- Heading: "About Self-Watering Planters"
- Intro: "Self-watering planters provide consistent moisture, prevent overwatering, and simplify care for healthy plant growth."
- Sub-heading: "How it works"
- Three numbered steps, left to right:
  1. Fill the Water Reservoir — PT2
  2. Water reaches the soil as needed — PT3
  3. Healthy and Happy Plant — PT4
- Hero image: PT1

Image order follows the URLs given: PT1 hero, then PT2/PT3/PT4 as steps 1-3.

## Layout

Desktop (lg and up): two columns. Left = large hero image with ~24px rounded corners. Right = heading, paragraph, "How it works", then a 3-up row of step cards.

Mobile: single column, stacked — hero image first (rounded), then centered heading, centered paragraph, centered "How it works", then the three step cards in one row (compact, as in the mobile screenshot), each with caption below.

Step card: rounded image thumbnail with a circular terracotta number badge overlapping the top-center edge, caption text centered underneath.

```text
Desktop                              Mobile
+-----------+  About Self-Watering   +-------------+
|           |  <paragraph>           |  hero image |
|   hero    |  How it works          +-------------+
|           |  [1] [2] [3]             About ...
+-----------+  cap  cap  cap           <paragraph>
                                       How it works
                                       [1] [2] [3]
```

## Visual treatment

- Deep teal gradient background (radial glow from top-center fading into a darker teal at the edges), as in both screenshots. Text and captions in a light on-teal foreground color.
- Circular step badges in a warm terracotta tone.
- Rounded corners consistent with the site (20-24px), generous whitespace, subtle fade-in on scroll consistent with existing sections.

## Technical notes

- New component `src/components/home/SelfWateringSection.tsx`, rendered in `src/routes/index.tsx` immediately above the feature-cards section.
- New semantic tokens in `src/styles.css`: teal section background/foreground, terracotta badge, and a `--gradient-teal` token used via a small utility — no hardcoded color classes in the component.
- Images referenced directly by the supplied Shopify CDN URLs, with `loading="lazy"`, explicit width/height to avoid layout shift, and descriptive alt text.
- Heading level `h2` (page keeps its single `h1`), semantic `<ol>` for the numbered steps for accessibility.
