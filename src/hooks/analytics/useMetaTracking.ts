import { trackMetaEvent } from '@/lib/analytics/meta.events';
import { posthogService } from '@/lib/analytics/posthog';
import { MetaEventData, MetaUserData } from '@/lib/analytics/meta.types';

/**
 * Hook for easy access to Meta tracking
 */
import { useCallback } from 'react';

export function useMetaTracking() {
  const track = useCallback((eventName: string, data?: MetaEventData, userData?: MetaUserData) => {
    trackMetaEvent(eventName, data, userData);
  }, []);

  const trackAddToCart = useCallback((product: any, quantity: number = 1) => {
    const value = (product.price?.amount || 0) * quantity;
    const currency = product.price?.currencyCode || 'USD';

    track('AddToCart', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      contents: [{
        id: product.id,
        quantity,
        price: product.price?.amount,
        title: product.title
      }],
      value,
      currency,
      num_items: quantity
    });
  }, [track]);

  const trackViewContent = useCallback((product: any) => {
    track('ViewContent', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: (product.price?.amount || 0),
      currency: product.price?.currencyCode || 'USD'
    });

    posthogService.trackProductViewed({
      product_id: product.id,
      product_handle: product.handle,
      product_title: product.title,
      variant_id: product.defaultVariantId || product.id,
      price: Number(product.price?.amount || 0),
      currency: product.price?.currencyCode || 'USD',
      quantity: 1,
      product_type: product.productType,
      vendor: product.vendor,
    });
  }, [track]);

  const buildCartPayload = useCallback((cart: any) => {
    const rawLines: any[] = Array.isArray(cart?.lines)
      ? cart.lines
      : Array.isArray(cart?.lines?.edges)
        ? cart.lines.edges.map((e: any) => e?.node).filter(Boolean)
        : Array.isArray(cart?.lines?.nodes)
          ? cart.lines.nodes
          : [];

    const contents = rawLines.map((l: any) => ({
      id: l?.merchandise?.id || l?.variantId || l?.id,
      quantity: l?.quantity ?? 1,
      price: Number(
        l?.cost?.amountPerQuantity?.amount ??
          l?.merchandise?.price?.amount ??
          l?.amount ??
          0
      )
    }));

    const value = Number(
      cart?.cost?.subtotalAmount?.amount ?? cart?.subtotal?.amount ?? 0
    );
    const currency =
      cart?.cost?.subtotalAmount?.currencyCode ||
      cart?.subtotal?.currency ||
      'USD';

    return {
      content_ids: contents.map((c) => c.id).filter(Boolean),
      contents,
      value,
      currency,
      num_items:
        cart?.totalQuantity ??
        contents.reduce((sum, c) => sum + (c.quantity || 0), 0)
    };
  }, []);

  const trackInitiateCheckout = useCallback((cart: any) => {
    track('InitiateCheckout', buildCartPayload(cart));
  }, [track, buildCartPayload]);

  const trackPurchase = useCallback((cart: any) => {
    track('Purchase', { ...buildCartPayload(cart), content_type: 'product' });
  }, [track, buildCartPayload]);

  return {
    track,
    trackAddToCart,
    trackViewContent,
    trackInitiateCheckout,
    trackPurchase
  };
}
