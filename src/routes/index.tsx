import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/layout/Footer";
import { CartProvider, useCart } from "@/components/layout/CartContext";


import { BannerSection } from "@/components/home/BannerSection";
import { CollectionScroller, collectionByIdQuery } from "@/components/home/CollectionScroller";
import { WhyChooseKyari } from "@/components/home/WhyChooseKyari";

import { BrandMission } from "@/components/home/BrandMission";
import { MarqueeBanner } from "@/components/home/MarqueeBanner";



const HOME_COLLECTION_ID = "659339542821";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collectionByIdQuery(HOME_COLLECTION_ID));
    context.queryClient.ensureQueryData(collectionByIdQuery("659519504677"));
  },
  head: () => ({
    meta: [
      { title: "Plantora — Premium Indoor & Outdoor Plants Delivered in the USA" },
      {
        name: "description",
        content:
          "Plantora delivers premium indoor and outdoor plants across the United States, with expert care guidance and a healthy plant guarantee.",
      },
      { property: "og:title", content: "Plantora — Bring Nature Home" },
      {
        property: "og:description",
        content:
          "Carefully selected indoor and outdoor plants, delivered healthy across the USA with expert guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  return (
    <>
      <main>
        <BannerSection />
        <CollectionScroller collectionId="659519504677" />
        <CollectionScroller collectionId="659339542821" />
        <WhyChooseKyari />
        
        <BrandMission />
        <MarqueeBanner />



            <pre className="text-[13px] text-muted-foreground/80 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
{`'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

Here's the full implementation for your headless add-to-cart flow with @inContext(country: US) hardcoded, and console output as a text string:

1. Variant Check Query
async function checkVariantAvailability(variantId) {
  const query = \`
    query CheckVariant($id: ID!) @inContext(country: US, language: EN) {
      node(id: $id) {
        ... on ProductVariant {
          id
          availableForSale
          quantityAvailable
        }
      }
    }
  \`;

  const response = await fetch('https://myplantora.myshopify.com/api/2025-07/graphql.json', {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': '9e36****',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables: { id: variantId } })
  });

  const data = await response.json();
  const variant = data?.data?.node;

  console.log(
    '[Variant Check] ID: ' + variantId +
    ' | Available: ' + variant?.availableForSale +
    ' | Qty: ' + (variant?.quantityAvailable ?? 'untracked')
  );

  return variant;
}
2. Cart Create Mutation (with @inContext + US buyer identity)
async function createCart(variantId, quantity = 1) {
  const mutation = \`
    mutation CartCreate($input: CartInput!) @inContext(country: US, language: EN) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  \`;

  const variables = {
    input: {
      lines: [
        {
          merchandiseId: variantId,
          quantity: quantity
        }
      ],
      buyerIdentity: {
        countryCode: "US"
      }
    }
  };

  const response = await fetch('https://myplantora.myshopify.com/api/2025-07/graphql.json', {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': '9e36****',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: mutation, variables })
  });

  const data = await response.json();
  const cart = data?.data?.cartCreate?.cart;
  const errors = data?.data?.cartCreate?.userErrors;

  if (errors?.length > 0) {
    console.log('[Cart Error] ' + errors.map(e => e.field + ': ' + e.message).join(' | '));
    return null;
  }

  console.log(
    '[Cart Created]' +
    ' Cart ID: ' + cart.id +
    ' | Checkout URL: ' + cart.checkoutUrl +
    ' | Total: ' + cart.cost.totalAmount.amount + ' ' + cart.cost.totalAmount.currencyCode
  );

  return cart;
}
3. Full Add-to-Cart Flow (check → create → redirect)
async function addToCart(variantId, quantity = 1) {
  console.log('[Add to Cart] Starting flow for variant: ' + variantId);

  // Step 1: Check availability
  const variant = await checkVariantAvailability(variantId);

  if (!variant?.availableForSale) {
    console.log('[Add to Cart] Blocked — variant not available for sale: ' + variantId);
    return null;
  }

  if (variant?.quantityAvailable !== null && variant?.quantityAvailable < quantity) {
    console.log('[Add to Cart] Blocked — insufficient stock. Requested: ' + quantity + ' | Available: ' + variant.quantityAvailable);
    return null;
  }

  // Step 2: Create cart
  const cart = await createCart(variantId, quantity);

  if (!cart) {
    console.log('[Add to Cart] Failed — cart creation returned null');
    return null;
  }

  // Step 3: Log checkout URL as plain string
  console.log('[Checkout URL] ' + cart.checkoutUrl);

  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl
  };
}
4. Usage
// Trigger add to cart
addToCart('gid://shopify/ProductVariant/53574044975397', 1)
  .then(result => {
    if (result) {
      console.log('[Redirect] Sending user to: ' + result.checkoutUrl);
      // window.location.href = result.checkoutUrl; // uncomment to redirect
    }
  });
Console Output (text strings, not JSON objects)
[Add to Cart] Starting flow for variant: gid://shopify/ProductVariant/53574044975397
[Variant Check] ID: gid://shopify/ProductVariant/53574044975397 | Available: true | Qty: 12
[Cart Created] Cart ID: gid://shopify/Cart/abc123 | Checkout URL: https://checkout.myplantora.com/cart/c/abc123 | Total: 29.99 USD
[Checkout URL] https://checkout.myplantora.com/cart/c/abc123
[Redirect] Sending user to: https://checkout.myplantora.com/cart/c/abc123
Key points:

@inContext(country: US) is on both the query and mutation — ensures US pricing throughout
buyerIdentity.countryCode: "US" on the cart input locks the checkout to US market
checkoutUrl returned from cartCreate is your direct checkout link — no additional construction needed
All console.log outputs are concatenated strings, not console.log(object)`}
            </pre>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

