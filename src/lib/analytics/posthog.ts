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

    // Use requestIdleCallback if available, fallback to setTimeout
    const scheduleInit = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1000));

    scheduleInit(async () => {
      try {
        const phModule = await import("posthog-js");
        const ph = phModule.default;

        ph.init(config.apiKey, {
          api_host: config.apiHost || "https://us.i.posthog.com",
          autocapture: true, // Standard PostHog setup
          capture_pageview: false, // We handle this via SPA router to ensure context is correct
          persistence: "localStorage",
          session_recording: {
            maskAllInputs: false, // Standard recording setup
            maskTextSelector: ".mask-text",
          },
          loaded: (phInstance) => {
            this.posthog = phInstance;
            this.initialized = true;
            this.flushQueue();
          },
        });
      } catch (error) {
        console.warn("[PostHog] Initialization failed silently", error);
      }
    });
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
        // Fail silently in production
        if (import.meta.env.DEV) console.error("[PostHog] Event capture failed", e);
      }
    } else if (this.queue.length < this.MAX_QUEUE_SIZE) {
      this.queue.push(() => task(this.posthog));
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
    this.capture("add_to_cart", {
      ...product,
      cart_value: cartValue,
    });
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
  }
}

export const posthogService = new PostHogService();
