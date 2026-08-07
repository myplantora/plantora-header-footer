import { trackMetaEvent } from '@/lib/analytics/meta.events';
import { MetaEventData, MetaUserData } from '@/lib/analytics/meta.types';

/**
 * Hook for easy access to Meta tracking
 */
export function useMetaTracking() {
  const track = (eventName: string, data?: MetaEventData, userData?: MetaUserData) => {
    trackMetaEvent(eventName, data, userData);
  };

  const trackAddToCart = (product: any, quantity: number = 1) => {
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
  };

  const trackViewContent = (product: any) => {
    track('ViewContent', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: product.price?.amount || 0,
      currency: product.price?.currencyCode || 'USD'
    });
  };

  const trackInitiateCheckout = (cart: any) => {
    track('InitiateCheckout', {
      content_ids: cart.lines.map((l: any) => l.id),
      contents: cart.lines.map((l: any) => ({
        id: l.id,
        quantity: l.quantity,
        price: l.amount
      })),
      value: cart.subtotal?.amount || 0,
      currency: cart.subtotal?.currency || 'USD',
      num_items: cart.totalQuantity
    });
  };

  return {
    track,
    trackAddToCart,
    trackViewContent,
    trackInitiateCheckout
  };
}
