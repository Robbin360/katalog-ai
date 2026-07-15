import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  isValidShopDomain,
  generateStateNonce,
  signState,
  generatePkcePair,
  buildAuthorizeUrl,
  isAppUrlAllowed,
} from '@/lib/shopify/oauth';
import type { ShopifyScope } from '@/lib/shopify/types';

const SCOPES: ShopifyScope[] = (process.env.SHOPIFY_SCOPES ?? 'read_products,write_products,read_inventory,read_orders')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean) as ShopifyScope[];

const isProd = process.env.NODE_ENV === 'production';
const STATE_COOKIE = isProd ? '__Host-shopify_oauth_state' : 'shopify_oauth_state';
const PKCE_COOKIE = isProd ? '__Host-shopify_oauth_pkce_verifier' : 'shopify_oauth_pkce_verifier';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 300,
};

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json(
      { error: 'Invalid shop URL. Must be xxx.myshopify.com' },
      { status: 400 }
    );
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const appUrl = process.env.SHOPIFY_APP_URL;
  if (!apiKey || !apiSecret || !appUrl) {
    console.error('[shopify/auth] Missing env vars');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (!isAppUrlAllowed(appUrl)) {
    console.error(`[shopify/auth] SHOPIFY_APP_URL not in allow-list: ${appUrl}`);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const state = generateStateNonce();
  const signedState = signState(state, apiSecret);
  const pkcePair = generatePkcePair();

  const redirectUri = `${appUrl}/api/shopify/callback`;
  const authorizeUrl = buildAuthorizeUrl({
    shop, apiKey, scopes: SCOPES, redirectUri,
    state,
    codeChallenge: pkcePair.challenge,
  });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, signedState, COOKIE_OPTIONS);
  response.cookies.set(PKCE_COOKIE, pkcePair.verifier, COOKIE_OPTIONS);
  return response;
}
