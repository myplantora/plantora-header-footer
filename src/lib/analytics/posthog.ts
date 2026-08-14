// @ts-ignore
import globalConfig from "../../../config/globalconf.json";
import type { PostHog } from "posthog-js";

// Types for our abstraction
export interface AnalyticsProduct {
  product_id: string;
  product_handle: string;
  product_title: string;
  variant_id: string;
  variant_title?: string;
  price: number;
  currency: string;
  quantity: number;
  product_type?: string;
  vendor?: string;
  collection?: string;
}

class PostHogService {
  private posthog: any = null;
  private initialized = false;
  private queue: Array<() => void> = [];
  private readonly MAX_QUEUE_SIZE = 50;

  constructor() {
    if (typeof window !== "undefined") {
      this.initAsynchronously();
    }
  }

  private initAsynchronously() {
    // @ts-ignore
    const config = globalConfig.analytics?.posthog;
    if (!config?.enabled || !config.apiKey) return;

    const initialize = async () => {
      try {
        const phModule = await import("posthog-js");
        const ph = phModule.default;

        ph.init(config.apiKey, {
          api_host: config.apiHost || "https://us.i.posthog.com",
          autocapture: true,
          capture_pageview: false,
          persistence: "localStorage",
          session_recording: {
            maskAllInputs: false,
            maskTextSelector: ".mask-text",
          },
          loaded: (phInstance: any) => {
            this.posthog = phInstance;
            this.initialized = true;
            this.flushQueue();
          },
        });
      } catch (error) {
        console.warn("[PostHog] Initialization failed silently", error);
      }
    };

    if (document.readyState === 'complete') {
      initialize();
    } else {
      window.addEventListener('load', initialize);
    }
  }

  private flushQueue() {
    while (this.queue.length > 0 && this.initialized) {
      const task = this.queue.shift();
      task?.();
    }
  }

  private runSafely(task: (ph: any) => void) {
    if (this.initialized && this.posthog) {
      try {
        task(this.posthog);
      } catch (e) {
        // Capture exceptions for monitoring as requested
        this.captureException(e, { context: "PostHog event capture" });
        if (import.meta.env.DEV) console.error("[PostHog] Event capture failed", e);
      }
    } else if (this.queue.length < this.MAX_QUEUE_SIZE) {
      this.queue.push(() => task(this.posthog));
    }
  }

  /**
   * Captures exceptions to PostHog for monitoring.
   * This aligns with the request to "capture the exceptions in all layer".
   */
  captureException(error: any, properties?: Record<string, any>) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.capture("exception_captured", {
      error_message: errorMsg,
      error_stack: errorStack,
      ...properties,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: new Date().toISOString()
    });
    
    // Also use PostHog's built-in error capture if available in future versions/plugins
    if (this.posthog?.captureException) {
      try {
        this.posthog.captureException(error, { properties });
      } catch (e) {}
    }
  }

  identify(id: string, properties?: Record<string, any>) {
    this.runSafely((ph) => ph.identify(id, properties));
  }

  reset() {
    this.runSafely((ph) => ph.reset());
  }

  capture(event: string, properties?: Record<string, any>) {
    this.runSafely((ph) => ph.capture(event, properties));
  }

  trackPageView(properties?: Record<string, any>) {
    this.runSafely((ph) => ph.capture("$pageview", properties));
  }

  trackProductViewed(product: AnalyticsProduct) {
    this.capture("product_viewed", product);
  }

  trackCollectionViewed(collection: {
    collection_id: string;
    collection_handle: string;
    collection_title: string;
    product_count?: number;
  }) {
    this.capture("collection_viewed", collection);
  }

  trackAddToCart(product: AnalyticsProduct, cartValue: number) {
    const payload = {
      ...product,
      cart_value: cartValue,
    };
    this.capture("add_to_cart", payload);
    // Standard event for funnel analysis
    this.capture("product_added_to_cart", payload);
  }

  trackRemoveFromCart(product: Pick<AnalyticsProduct, "product_id" | "variant_id" | "quantity">, cartValue: number) {
    this.capture("remove_from_cart", {
      ...product,
      cart_value: cartValue,
    });
  }

  trackCartViewed(cart: {
    cart_id?: string;
    item_count: number;
    cart_value: number;
    currency: string;
  }) {
    this.capture("cart_viewed", cart);
  }

  trackCheckoutStarted(checkout: {
    cart_value: number;
    currency: string;
    item_count: number;
  }) {
    this.capture("checkout_started", checkout);
  }

  trackPurchase(order: {
    order_id: string;
    value: number;
    currency: string;
    item_count: number;
    products: AnalyticsProduct[];
  }) {
    this.capture("purchase", order);
    // Standard conversion event
    this.capture("order_completed", order);
  }
}

export const posthogService = new PostHogService();
