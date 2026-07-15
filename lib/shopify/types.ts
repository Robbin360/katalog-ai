export type ShopifyScope =
  | 'read_products'
  | 'write_products'
  | 'read_inventory'
  | 'read_orders';

export const REQUIRED_SCOPES: ShopifyScope[] = ['read_products', 'write_products'];

export interface ShopifyShopInfo {
  id: string;
  name: string;
  email: string;
  domain: string | null;
  myshopify_domain: string;
  country: string;
  country_name: string;
  currency: string;
  plan_name: string;
}

export interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
}

export interface Integration {
  id: string;
  user_id: string;
  provider: 'shopify';
  shop_url: string;
  access_token: string | null;
  scopes: string | null;
  installed_at: string | null;
  uninstalled_at: string | null;
  shopify_shop_id: string | null;
  shop_name: string | null;
  shop_email: string | null;
  country: string | null;
  currency: string | null;
  plan_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafeIntegration
  extends Omit<Integration, 'access_token'> {}

export interface ShopifyCallbackParams {
  code: string;
  hmac: string;
  state: string;
  shop: string;
  timestamp: string;
  host?: string;
  id_token?: string;
}

export interface PkcePair {
  verifier: string;
  challenge: string;
}

export type SupabaseServiceClient = import('@supabase/supabase-js').SupabaseClient;
