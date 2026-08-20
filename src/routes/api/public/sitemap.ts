import { createFileRoute } from '@tanstack/react-router';
import { getAllProductHandles, getAllCollectionHandles } from '../../../services/shopify/sitemap.server';

export const Route = createFileRoute('/api/public/sitemap')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        
        const [products, collections] = await Promise.all([
          getAllProductHandles(),
          getAllCollectionHandles()
        ]);

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${collections.map(handle => `
  <url>
    <loc>${baseUrl}/collections/${handle}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${products.map(handle => `
  <url>
    <loc>${baseUrl}/product/${handle}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
          },
        });
      },
    },
  },
});
