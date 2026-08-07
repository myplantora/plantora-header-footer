export type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'ViewCategory'
  | 'AddToWishlist'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'AddShippingInfo'
  | 'Purchase'
  | 'Subscribe'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact';

export interface MetaEventData {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    price?: number;
    title?: string;
    brand?: string;
    category?: string;
  }>;
  currency?: string;
  value?: number;
  search_string?: string;
  content_category?: string;
  order_id?: string;
  num_items?: number;
  status?: string;
  [key: string]: any;
}

export interface MetaUserData {
  em?: string; // Email
  ph?: string; // Phone
  fn?: string; // First Name
  ln?: string; // Last Name
  ct?: string; // City
  st?: string; // State
  zp?: string; // Zip
  country?: string;
  external_id?: string;
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}
