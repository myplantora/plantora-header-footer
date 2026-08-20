# SEO Enhancement: Dynamic Collection Structured Data

Add dynamic JSON-LD structured data for collection/category pages to improve merchandising visibility for AI and search engines.

## Changes

### `src/components/seo/SEOProvider.tsx`
- Add `getCollectionSchema` helper to generate `CollectionPage` schema with an `ItemList` containing all products in the collection.
- Add `getBreadcrumbSchema` helper to generate `BreadcrumbList` schema for better site hierarchy discovery.

### `src/routes/collections/$handle.tsx`
- Inject the `CollectionPage` schema at the top of the collection page.
- Inject the `BreadcrumbList` schema to provide navigation context.

### `src/routes/product/$handle.tsx`
- Inject the `BreadcrumbList` schema on product pages.

## Technical Details
- **Schema Type**: `CollectionPage` and `ItemList` for collections.
- **Dynamic Content**: Products are mapped to `ListItem` elements with positions, relative URLs (normalized to absolute), names, and images.
- **SSR Compatible**: Structured data is injected at the route level, ensuring it is present in the initial HTML for search engine crawlers.
