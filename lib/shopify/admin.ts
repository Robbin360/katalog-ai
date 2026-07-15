import type { ShopifyTokenResponse, ShopifyShopInfo } from './types';

export const SHOPIFY_API_VERSION = '2026-07';

interface ExchangeCodeParams {
  shop: string;
  code: string;
  apiKey: string;
  apiSecret: string;
  codeVerifier: string;
}

export async function exchangeCodeForToken({
  shop, code, apiKey, apiSecret, codeVerifier,
}: ExchangeCodeParams): Promise<ShopifyTokenResponse> {
  const url = `https://${shop}/admin/oauth/access_token`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
      code_verifier: codeVerifier,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Shopify token exchange failed: ${response.status} ${errorBody}`);
  }
  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Shopify response missing access_token');
  }
  return {
    access_token: data.access_token,
    scope: typeof data.scope === 'string' ? data.scope : '',
  };
}

interface FetchShopInfoParams {
  shop: string;
  accessToken: string;
}

export async function fetchShopInfo({
  shop, accessToken,
}: FetchShopInfoParams): Promise<ShopifyShopInfo | null> {
  try {
    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`;
    const response = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': accessToken },
    });
    if (!response.ok) {
      console.warn(`[shopify] fetchShopInfo failed: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (!data.shop) return null;
    return { ...data.shop, id: String(data.shop.id) } as ShopifyShopInfo;
  } catch (err) {
    console.warn('[shopify] fetchShopInfo error:', err);
    return null;
  }
}

interface RegisterWebhookParams {
  shop: string;
  accessToken: string;
  webhookUrl: string;
  topic: string;
}

export async function registerWebhook({
  shop, accessToken, webhookUrl, topic,
}: RegisterWebhookParams): Promise<boolean> {
  try {
    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: { topic, address: webhookUrl, format: 'json' },
      }),
    });

    if (response.status === 422) {
      let errBody: any = null;
      try { errBody = await response.json(); } catch {}
      const msg = JSON.stringify(errBody);
      if (msg.includes('has already been registered') || msg.includes('already been taken')) {
        console.log(`[shopify] webhook ${topic} already registered`);
        return true;
      }
      console.warn(`[shopify] registerWebhook ${topic} 422:`, msg);
      return false;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[shopify] registerWebhook ${topic} failed: ${response.status}`, errorBody);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[shopify] registerWebhook ${topic} error:`, err);
    return false;
  }
}

interface RevokeTokenParams {
  shop: string;
  accessToken: string;
}

export async function revokeToken({
  shop, accessToken,
}: RevokeTokenParams): Promise<boolean> {
  const raw = process.env.SHOPIFY_APP_GID;
  if (!raw) {
    console.error('[shopify] revokeToken: SHOPIFY_APP_GID env var missing');
    return false;
  }

  const appId = raw.startsWith('gid://') ? raw : `gid://shopify/App/${raw}`;

  try {
    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
    const mutation = `
      mutation appRevoke($input: AppRevokeInput!) {
        appRevoke(input: $input) {
          appRevoke { revoked }
          userErrors { field message }
        }
      }
    `;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: { appId } },
      }),
    });
    if (!response.ok) {
      console.warn(`[shopify] revokeToken failed: ${response.status}`);
      return false;
    }
    const data = await response.json();
    const appRevoke = data?.data?.appRevoke;
    if (appRevoke?.userErrors?.length > 0) {
      console.warn(`[shopify] revokeToken userErrors:`, appRevoke.userErrors);
      return false;
    }
    const revoked = appRevoke?.appRevoke?.revoked === true;
    if (revoked) {
      console.log(`[shopify] Token revoked for ${shop}`);
    } else {
      console.warn(`[shopify] Token NOT revoked for ${shop} (revoked=false)`);
    }
    return revoked;
  } catch (err) {
    console.warn('[shopify] revokeToken error:', err);
    return false;
  }
}
