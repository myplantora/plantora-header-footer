# Plantora Product Card + Shopify Data Layer

Build one reusable, fully data-driven Product Card, backed by a Shopify normalization layer that every future surface (collections, search, related, wishlist, recently viewed, cart drawer) reuses.

## Step 0 — Connect your existing Shopify store

Before any data work, I'll open the Shopify connection flow for your existing store so the storefront domain, token and API version come from real credentials instead of placeholders.

## Configuration (single source of truth)

`config/globalconf.json` holds everything Shopify-specific that can change without code:

- store domain, storefront token reference, API version
- metafield identifiers grouped by purpose: `badges`, `reviews`, `tagMedia`, `iconMedia`
- metaobject GIDs
- feature flags (hover image, review section, badge rendering)
- pagination limits (collection page size)

Adding a new badge or metafield later = edit this file only. No component changes.

## Service + normalization layer

```text
src/services/shopify/
  client.ts              -> single POST fetcher, headers, error handling
  queries/
    collection.query.ts  -> CollectionPage query (identifiers injected from config)
    product.query.ts     -> ProductPage query + metaobject nodes(ids)
  collection.service.ts  -> getCollection({handle, after}) -> normalized collection
  product.service.ts     -> getProduct({id}) -> normalized product
  normalize/
    metafields.ts        -> raw metafield array -> keyed, typed map (parses booleans, JSON, refs)
    metaobjects.ts       -> metaobject nodes -> { handle -> { fields, media } }
    product.ts           -> normalizeProductCard(), normalizeProduct()
    collection.ts        -> normalizeCollection()
  types.ts               -> PlantoraProductCard, PlantoraProduct, PlantoraCollection
```

Rules enforced: React never imports a query, a namespace, or a raw Shopify node. Only `PlantoraProductCard` / `PlantoraProduct` cross the boundary. Collection queries fetch no variants; PDP query owns variants and gallery.

`PlantoraProductCard` shape:

```text
id, title, handle, url
featuredImage { url, altText, width, height }
hoverImage?    (images[1], only when the flag is on)
price { amount, currency }, compareAtPrice?, discountPercent?
availability: 'in_stock' | 'out_of_stock' | 'limited'
badges: [{ key, label, iconUrl? }]     // only truthy metafields, labels from Shopify
tagMedia?: { url, altText }            // animated Best Seller / New sticker
reviews?: { average, total, percent }  // omitted entirely when absent
options?: [{ name, values }]           // rendered only when the source supplies them
```

Prices format from the returned `currencyCode` via `Intl.NumberFormat` — no hardcoded symbol.

## The Product Card component

`src/components/product/ProductCard.tsx` plus small subcomponents (`ProductCardImage`, `ProductBadges`, `ProductRating`, `ProductPrice`, `ProductOptions`, `AvailabilityLabel`). It takes exactly one prop: `product: PlantoraProductCard` (+ optional `onAddToCart`, `priority`).

Layout, matching your reference:

- 1:1 image frame with fixed aspect ratio so the grid never shifts; `object-cover` centered, letterboxed background for off-ratio images; hover image cross-fades when present
- dynamic tag media pinned to the image corner; promo strip below the image when Shopify supplies one
- rating row (stars + average + count) rendered only when review data exists
- title, price with struck compare-at and computed discount
- badge chips iterated from the badges array, each with its Shopify-resolved icon (leaf icon included — resolved from metaobject media, never bundled)
- option selectors rendered by looping `options` — no hardcoded "Size" or "Pot Type"; skipped entirely when absent
- full-width "Add to Basket" button, disabled with the availability label when out of stock

Responsive: 5px radius and the existing Plantora type scale, 2-up on mobile, 3-up tablet, 4-up desktop. Images lazy-loaded with `srcset` via Shopify CDN width params; card memoized with `React.memo`.

## Collection page

`src/routes/collections/$handle.tsx` — loader calls the collection service through TanStack Query, then renders banner, title, description HTML, and a grid that maps normalized products straight to `<ProductCard />`. Includes skeleton grid, empty state, and cursor pagination using `hasNextPage` / `endCursor` ("Load more").

No card markup lives in the page.

## Documentation

`docs/shopify-api.md` — both GraphQL contracts verbatim, normalizer output shapes, metafield/metaobject mapping tables, pagination example, folder structure, and a "how to add a new badge" recipe.

## Technical notes

- Storefront calls run through a server function so the token is never in the browser bundle; the token comes from the connector env var, with `globalconf.json` used for non-secret config during development.
- Metafield parsing is type-aware (`boolean`, `single_line_text_field`, `json`, `file_reference`), so badge truthiness and media URLs resolve generically.
- Pricing renders the currency code Shopify returns.
- Variant selectors appear only where option data is present — collection cards stay variant-free as specified.
