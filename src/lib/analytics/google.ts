import config from "../../../config/globalconf.json";

/**
 * Types for Google Analytics 4 (GA4)
 */
export interface GtagEventData {
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    affiliation?: string;
    coupon?: string;
    discount?: number;
    index?: number;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    item_variant?: string;
    location_id?: string;
    price?: number;
    quantity?: number;
  }>;
  [key: string]: any;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const getGaMeasurementId = () => {
  return (config.analytics as any)?.googleMeasurementId;
};

/**
 * Initialize Google Analytics 4
 */
export const initGoogleAnalytics = () => {
  const measurementId = getGaMeasurementId();
  if (!measurementId || typeof window === "undefined") return;

  if (typeof window.gtag === "function") return;

  // Standard gtag.js snippet
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false, // We'll handle this manually on route changes
    linker: {
      domains: [config.shopify.storeDomain, config.analytics.shopDomain].filter(Boolean)
    }
  });
};

/**
 * Track page views
 */
export const trackGooglePageView = (path: string, title?: string) => {
  const measurementId = getGaMeasurementId();
  if (!measurementId || typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
    send_to: measurementId,
  });
};

/**
 * Track custom events
 */
export const trackGoogleEvent = (eventName: string, data?: GtagEventData) => {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, data);
};
