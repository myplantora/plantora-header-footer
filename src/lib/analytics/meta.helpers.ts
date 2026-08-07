import config from '../../../config/globalconf.json';

// @ts-ignore
const metaConfig = (config.analytics as any)?.meta;

/**
 * Validates the payload for common Meta ecommerce requirements
 */
export const validateMetaPayload = (eventName: string, data?: any) => {
  if (import.meta.env.PROD) return;

  const ecommerceEvents = [
    'ViewContent',
    'AddToCart',
    'InitiateCheckout',
    'Purchase',
  ];

  if (ecommerceEvents.includes(eventName)) {
    if (!data?.currency) console.warn(`Meta Pixel: [${eventName}] Missing "currency"`);
    if (data?.value === undefined) console.warn(`Meta Pixel: [${eventName}] Missing "value"`);
    if (!data?.content_ids && !data?.contents) {
      console.warn(`Meta Pixel: [${eventName}] Missing "content_ids" or "contents"`);
    }
  }
};

/**
 * Formats a string for Meta Advanced Matching (lowercase, trimmed)
 */
export const formatAdvancedMatching = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.trim().toLowerCase();
};

/**
 * Generates a unique event ID for CAPI deduplication
 */
export const generateEventId = (): string => {
  return `evt_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
};

/**
 * Checks if tracking is enabled and initialized
 */
export const isMetaEnabled = (): boolean => {
  return !!(metaConfig?.enabled && metaConfig?.pixelId && typeof window !== 'undefined');
};
