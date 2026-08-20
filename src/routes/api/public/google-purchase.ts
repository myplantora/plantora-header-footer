import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { trackGoogleEvent } from '../../../lib/analytics/google';

/**
 * Public API endpoint for server-side purchase tracking
 * This is intended for future use when Shopify webhooks can notify the headless app
 * or for server-to-server conversion reporting.
 */
export const Route = createFileRoute('/api/public/google-purchase')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          
          // Basic validation
          const schema = z.object({
            orderId: z.string(),
            value: z.number(),
            currency: z.string().default('USD'),
            items: z.array(z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
              quantity: z.number(),
              brand: z.string().optional(),
              category: z.string().optional()
            }))
          });

          const result = schema.safeParse(body);
          if (!result.success) {
            return new Response(JSON.stringify({ error: 'Invalid payload' }), { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Note: In a Cloudflare Worker environment, we can't call trackGoogleEvent directly
          // if it relies on browser globals like window/document. 
          // For server-side tracking, one would use the GA4 Measurement Protocol API (MP).
          
          console.log('[Server Analytics] Purchase event received:', result.data.orderId);
          
          return new Response(JSON.stringify({ status: 'received' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('[Server Analytics] Purchase error:', error);
          return new Response(JSON.stringify({ error: 'Internal error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      },
    },
  },
});