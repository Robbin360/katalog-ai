import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient, encryptShopifyToken } from '@/lib/supabase/server';
import {
  verifyHmac, extractCallbackParams, isValidShopDomain, isCallbackFresh,
  verifyAndExtractState, validateGrantedScopes,
} from '@/lib/shopify/oauth';
import { exchangeCodeForToken, fetchShopInfo, registerWebhook } from '@/lib/shopify/admin';
import { logSecurityEvent, SecurityEvents } from '@/lib/security/logger';
import { REQUIRED_SCOPES } from '@/lib/shopify/types';

const isProd = process.env.NODE_ENV === 'production';
const STATE_COOKIE = isProd ? '__Host-shopify_oauth_state' : 'shopify_oauth_state';
const PKCE_COOKIE = isProd ? '__Host-shopify_oauth_pkce_verifier' : 'shopify_oauth_pkce_verifier';

function clearCookiesAndRedirect(url: string, request: NextRequest) {
  const response = NextResponse.redirect(new URL(url, request.url));
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(PKCE_COOKIE);
  return response;
}

function redirectToError(error: string, request: NextRequest) {
  return clearCookiesAndRedirect(`/account?tab=integrations&error=${error}`, request);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawQueryString = request.nextUrl.search.replace(/^\?/, '');

  const params = extractCallbackParams(searchParams);
  if (!params) return redirectToError('missing_params', request);
  const { code, state, shop, timestamp } = params;

  if (!isValidShopDomain(shop)) return redirectToError('invalid_shop', request);

  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const apiKey = process.env.SHOPIFY_API_KEY;
  const appUrl = process.env.SHOPIFY_APP_URL;
  if (!apiSecret || !apiKey || !appUrl) return redirectToError('server_config', request);

  if (!verifyHmac(rawQueryString, apiSecret)) {
    logSecurityEvent(SecurityEvents.OAUTH_HMAC_FAILED, { shop });
    return redirectToError('hmac_failed', request);
  }

  const cookieStateSigned = request.cookies.get(STATE_COOKIE)?.value;
  const cookieState = cookieStateSigned
    ? verifyAndExtractState(cookieStateSigned, apiSecret)
    : null;
  if (!cookieState || cookieState !== state) {
    logSecurityEvent(SecurityEvents.OAUTH_STATE_MISMATCH, { shop });
    return redirectToError('state_mismatch', request);
  }

  if (!isCallbackFresh(timestamp)) {
    logSecurityEvent(SecurityEvents.OAUTH_STALE_CALLBACK, { shop, timestamp });
    return redirectToError('stale_callback', request);
  }

  const codeVerifier = request.cookies.get(PKCE_COOKIE)?.value;
  if (!codeVerifier) {
    logSecurityEvent(SecurityEvents.OAUTH_STATE_MISMATCH, { shop, reason: 'missing_pkce' });
    return redirectToError('state_mismatch', request);
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return clearCookiesAndRedirect('/login?return_to=/account&reason=session_expired', request);
  }

  const { data: existing } = await supabase
    .from('integrations_safe')
    .select('id')
    .eq('user_id', user.id)
    .eq('shop_url', shop)
    .is('uninstalled_at', null)
    .maybeSingle();
  if (existing) {
    return clearCookiesAndRedirect('/account?tab=integrations&connected=1', request);
  }

  try {
    const tokenResponse = await exchangeCodeForToken({
      shop, code, apiKey, apiSecret, codeVerifier,
    });

    // 11. Validar scopes
    const { valid: scopesValid, missing: missingScopes } = validateGrantedScopes(
      tokenResponse.scope, REQUIRED_SCOPES
    );
    if (!scopesValid) {
      logSecurityEvent(SecurityEvents.OAUTH_MISSING_SCOPES, {
        shop, missing: missingScopes.join(','),
      });
      return redirectToError(`missing_scopes:${missingScopes.join(',')}`, request);
    }

    const shopInfo = await fetchShopInfo({
      shop, accessToken: tokenResponse.access_token,
    });

    const webhookBase = `${appUrl}/api/shopify/webhooks`;
    const webhookResults = await Promise.all([
      registerWebhook({ shop, accessToken: tokenResponse.access_token, webhookUrl: `${webhookBase}/uninstall`, topic: 'app/uninstalled' }),
      registerWebhook({ shop, accessToken: tokenResponse.access_token, webhookUrl: `${webhookBase}/customers-data-request`, topic: 'customers/data_request' }),
      registerWebhook({ shop, accessToken: tokenResponse.access_token, webhookUrl: `${webhookBase}/customers-redact`, topic: 'customers/redact' }),
      registerWebhook({ shop, accessToken: tokenResponse.access_token, webhookUrl: `${webhookBase}/shop-redact`, topic: 'shop/redact' }),
    ]);
    const failedWebhooks = ['app/uninstalled', 'customers/data_request', 'customers/redact', 'shop/redact']
      .filter((_, i) => !webhookResults[i]);
    if (failedWebhooks.length > 0) {
      console.error('[shopify/callback] Webhook registration failed for:', failedWebhooks);
    }

    const serviceClient = createSupabaseServiceClient();
    const encryptedToken = await encryptShopifyToken(serviceClient, tokenResponse.access_token);

    const { error } = await serviceClient.from('integrations').insert({
      user_id: user.id,
      provider: 'shopify',
      shop_url: shop,
      access_token: encryptedToken,
      scopes: tokenResponse.scope,
      installed_at: new Date().toISOString(),
      uninstalled_at: null,
      shopify_shop_id: shopInfo?.id ?? null,
      shop_name: shopInfo?.name ?? null,
      shop_email: shopInfo?.email ?? null,
      country: shopInfo?.country ?? null,
      currency: shopInfo?.currency ?? null,
      plan_name: shopInfo?.plan_name ?? null,
    });

    if (error) {
      if (error.code === '23505') {
        logSecurityEvent(SecurityEvents.OAUTH_SHOP_ALREADY_CONNECTED, { shop });
        return redirectToError('shop_already_connected', request);
      }
      console.error('[shopify/callback] DB insert failed', error);
      return redirectToError('db_error', request);
    }

    return clearCookiesAndRedirect('/account?tab=integrations&connected=1', request);

  } catch (err) {
    logSecurityEvent(SecurityEvents.OAUTH_TOKEN_EXCHANGE_FAILED, {
      shop, error: err instanceof Error ? err.message : 'unknown',
    });
    return redirectToError('token_exchange_failed', request);
  }
}
