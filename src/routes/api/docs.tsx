import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/docs')({
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="container mx-auto max-w-4xl p-8 font-sans leading-relaxed text-[#254838]">
      <h1 className="mb-8 text-3xl font-bold font-fraunces">Plantora — Shopify Storefront API Implementation Guide</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-xl font-bold">🛒 Cart API — Storefront API (2025-07)</h2>
          <p className="mb-4">Core cart operations for the Plantora headless storefront:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><a href="https://shopify.dev/docs/api/storefront/2025-07/objects/Cart" target="_blank" className="text-accent underline">Cart object reference</a></li>
            <li><a href="https://shopify.dev/docs/api/storefront/2025-07/mutations/cartCreate" target="_blank" className="text-accent underline">cartCreate mutation</a></li>
            <li><a href="https://shopify.dev/docs/api/storefront/2025-07/mutations/cartLinesAdd" target="_blank" className="text-accent underline">cartLinesAdd mutation</a></li>
            <li><a href="https://shopify.dev/docs/api/storefront/2025-07/mutations/cartLinesUpdate" target="_blank" className="text-accent underline">cartLinesUpdate mutation</a></li>
            <li><a href="https://shopify.dev/docs/api/storefront/2025-07/mutations/cartLinesRemove" target="_blank" className="text-accent underline">cartLinesRemove mutation</a></li>
            <li><a href="https://shopify.dev/docs/api/storefront/2025-07/queries/cart" target="_blank" className="text-accent underline">cart query</a></li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">💳 Checkout</h2>
          <p className="mb-4">Shopify deprecated the old Checkout API in favour of the Cart + checkoutUrl pattern. The checkoutUrl returned from your cart mutation IS the checkout — you redirect to it directly.</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><a href="https://shopify.dev/docs/api/storefront/2025-07/objects/Cart#field-cart-checkouturl" target="_blank" className="text-accent underline">Cart.checkoutUrl explanation</a></li>
            <li><a href="https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage" target="_blank" className="text-accent underline">Headless checkout guide</a></li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">📊 Analytics — Monorail</h2>
          <p className="mb-4">Headless tracking is implemented via direct Monorail produce calls to ensure accurate visitor IP and attribution.</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><a href="https://shopify.dev/docs/storefronts/headless/analytics" target="_blank" className="text-accent underline">Headless analytics overview</a></li>
            <li><a href="https://shopify.dev/docs/api/web-pixels-api" target="_blank" className="text-accent underline">Web Pixels API</a></li>
          </ul>
        </section>

        <section className="rounded-xl bg-[#F8F8F8] p-6 border border-border">
          <h2 className="mb-4 text-xl font-bold">🧪 Testing in GraphiQL</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. Initialize a Cart</p>
              <p className="text-sm mb-2">Required to establish a session context before adding items.</p>
              <div className="relative group">
                <pre className="overflow-x-auto rounded-lg bg-[#254838] p-4 text-xs text-white">
{`mutation CartCreate {
  cartCreate(input: {}) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      message
    }
  }
}`}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(`mutation CartCreate {\n  cartCreate(input: {}) {\n    cart {\n      id\n      checkoutUrl\n    }\n    userErrors {\n      message\n    }\n  }\n}`)}
                  className="absolute right-2 top-2 rounded bg-white/10 px-2 py-1 text-[10px] text-white hover:bg-white/20 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">2. Add Line Items</p>
              <p className="text-sm mb-2">Add a product variant using the ID returned from step 1.</p>
              <div className="relative group">
                <pre className="overflow-x-auto rounded-lg bg-[#254838] p-4 text-xs text-white">
{`mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      totalQuantity
      lines(first: 5) {
        edges {
          node {
            merchandise {
              ... on ProductVariant {
                title
              }
            }
          }
        }
      }
    }
    userErrors {
      message
    }
  }
}`}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(`mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {\n  cartLinesAdd(cartId: $cartId, lines: $lines) {\n    cart {\n      id\n      totalQuantity\n      lines(first: 5) {\n        edges {\n          node {\n            merchandise {\n              ... on ProductVariant {\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n    userErrors {\n      message\n    }\n  }\n}`)}
                  className="absolute right-2 top-2 rounded bg-white/10 px-2 py-1 text-[10px] text-white hover:bg-white/20 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground italic">Variables: {"{ \"cartId\": \"...\", \"lines\": [ { \"merchandiseId\": \"...\", \"quantity\": 1 } ] }"}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm">Test these live using the <a href="https://shopify.dev/docs/storefronts/tools/graphiql-storefront-api" target="_blank" className="text-accent underline font-bold">GraphiQL explorer</a>.</p>
              <p className="mt-1 text-xs italic">Endpoint: myplantora.myshopify.com/api/2025-07/graphql.json</p>
            </div>
          </div>
        </section>
      </div>
      
      <footer className="mt-16 border-t pt-8 text-xs text-muted-foreground">
        Version: 2025-07 | Environment: Production Ready
      </footer>
    </div>
  );
}
