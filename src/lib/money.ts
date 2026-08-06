/**
 * The storefront sells to the USA, so all prices are displayed in USD.
 * The Shopify store's base currency code is ignored on purpose — the amounts
 * returned by the Storefront API are the real USD figures.
 */
export const DISPLAY_CURRENCY = "USD";

export function formatMoney(amount: number, _currency?: string, locale = "en-US") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: DISPLAY_CURRENCY,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${DISPLAY_CURRENCY} ${amount.toFixed(2)}`;
  }
}
