import { useEffect } from "react";

/**
 * Technical SEO checklist:
 * 1. Crawlable HTML (TanStack Start SSR handles this)
 * 2. Sitemap + robots.txt (Provided by platform)
 * 3. Metadata + Canonical URLs (Implemented in head() of routes)
 * 4. Open Graph + Twitter Cards (Implemented in head() of routes)
 * 5. Structured Data (JSON-LD)
 * 6. Semantic HTML (H1, alt text)
 * 7. Mobile usability
 * 8. Performance (Core Web Vitals)
 */

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function getProductSchema(product: any) {
  if (!product) return null;
  
  const variant = product.variants?.[0];
  const price = variant?.price?.amount;
  const currency = variant?.price?.currency || 'USD';
  
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.featuredImage?.url || product.gallery?.[0]?.url,
    "description": product.description || `Buy ${product.title} from Plantora.`,
    "brand": {
      "@type": "Brand",
      "name": "Plantora"
    },
    "offers": {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "priceCurrency": currency,
      "price": price,
      "availability": variant?.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Plantora",
    "url": "https://myplantora.com",
    "logo": "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Favic.png?v=1786423312",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "",
      "contactType": "customer service",
      "email": "care@myplantora.com",
      "availableLanguage": "en"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61593023340334",
      "https://www.instagram.com/myplantora/"
    ]
  };
}
