import crypto from 'crypto';
import type { ShopifyScope, ShopifyCallbackParams, PkcePair, SupabaseServiceClient } from './types';

const ALLOWED_APP_URLS = [
  'https://katalog-ai-navy.vercel.app',
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean) as string[];

export function isAppUrlAllowed(url: string | undefined): boolean {
  if (!url) return false;
  return ALLOWED_APP_URLS.includes(url);
}

export function isValidShopDomain(shop: string): boolean {
  if (!shop || typeof shop !== 'string') return false;
  const clean = shop.trim().toLowerCase();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return false;
  if (clean.endsWith('/')) return false;
  const pattern = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
  return pattern.test(clean);
}

export function generateStateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function signState(state: string, apiSecret: string): string {
  const sig = crypto.createHmac('sha256', apiSecret).update(state).digest('hex');
  return `${state}.${sig}`;
}

export function verifyAndExtractState(signed: string, apiSecret: string): string | null {
  if (!signed) return null;
  const [state, sig] = signed.split('.');
  if (!state || !sig) return null;
  const expected = crypto.createHmac('sha256', apiSecret).update(state).digest('hex');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  return state;
}

export function generatePkcePair(): PkcePair {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

interface BuildAuthorizeUrlParams {
  shop: string;
  apiKey: string;
  scopes: ShopifyScope[];
  redirectUri: string;
  state: string;
  codeChallenge: string;
}

export function buildAuthorizeUrl({
  shop, apiKey, scopes, redirectUri, state, codeChallenge,
}: BuildAuthorizeUrlParams): string {
  const scopeString = scopes.join(',');
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopeString,
    redirect_uri: redirectUri,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export function verifyHmac(rawQueryString: string, apiSecret: string): boolean {
  if (!rawQueryString) return false;
  const hmacMatch = rawQueryString.match(/(?:^|&)hmac=([^&]+)/);
  if (!hmacMatch) return false;
  const hmac = decodeURIComponent(hmacMatch[1]);
  const pairs = rawQueryString
    .split('&')
    .filter(p => !p.startsWith('hmac=') && p.length > 0);
  pairs.sort();
  const message = pairs.join('&');
  const digest = crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
  const digestBuf = Buffer.from(digest, 'utf8');
  const hmacBuf = Buffer.from(hmac, 'utf8');
  if (digestBuf.length !== hmacBuf.length) return false;
  return crypto.timingSafeEqual(digestBuf, hmacBuf);
}

export function extractCallbackParams(
  searchParams: URLSearchParams
): ShopifyCallbackParams | null {
  const code = searchParams.get('code');
  const hmac = searchParams.get('hmac');
  const state = searchParams.get('state');
  const shop = searchParams.get('shop');
  const timestamp = searchParams.get('timestamp');
  if (!code || !hmac || !state || !shop || !timestamp) return null;
  return {
    code, hmac, state, shop, timestamp,
    host: searchParams.get('host') ?? undefined,
    id_token: searchParams.get('id_token') ?? undefined,
  };
}

export function isCallbackFresh(timestamp: string): boolean {
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;
  const ageSeconds = Math.floor(Date.now() / 1000) - ts;
  return ageSeconds <= 300 && ageSeconds >= -10;
}

export function verifyWebhookHmac(
  rawBody: string,
  hmacHeader: string,
  apiSecret: string
): boolean {
  if (!rawBody || !hmacHeader) return false;
  const digest = crypto.createHmac('sha256', apiSecret).update(rawBody).digest('base64');
  const digestBuf = Buffer.from(digest);
  const hmacBuf = Buffer.from(hmacHeader);
  if (digestBuf.length !== hmacBuf.length) return false;
  return crypto.timingSafeEqual(digestBuf, hmacBuf);
}

export function validateGrantedScopes(
  grantedScopes: string,
  requiredScopes: ShopifyScope[]
): { valid: boolean; missing: ShopifyScope[] } {
  const safe = typeof grantedScopes === 'string' ? grantedScopes : '';
  const granted = new Set(safe.split(',').map(s => s.trim()).filter(Boolean));
  const missing = requiredScopes.filter(s => !granted.has(s));
  return { valid: missing.length === 0, missing };
}

export async function claimWebhookDelivery(
  supabase: SupabaseServiceClient,
  webhookId: string | null,
  topic: string,
  shopUrl: string
): Promise<'new' | 'processed' | 'failed'> {
  if (!webhookId) return 'new';

  const { error: insertError } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_id: webhookId,
      topic,
      shop_url: shopUrl,
      status: 'claimed',
    });

  if (!insertError) return 'new';

  if (insertError.code === '23505') {
    const { data: existing, error: selectError } = await supabase
      .from('webhook_deliveries')
      .select('status')
      .eq('webhook_id', webhookId)
      .single();

    if (selectError || !existing) return 'new';
    if (existing.status === 'processed') return 'processed';
    if (existing.status === 'failed') return 'failed';
    return 'processed';
  }

  console.warn(`[webhook] idempotency insert failed for ${webhookId}:`, insertError);
  return 'new';
}

export async function completeWebhookDelivery(
  supabase: SupabaseServiceClient,
  webhookId: string | null,
  success: boolean
): Promise<void> {
  if (!webhookId) return;
  const { error } = await supabase
    .from('webhook_deliveries')
    .update({
      status: success ? 'processed' : 'failed',
      completed_at: new Date().toISOString(),
    })
    .eq('webhook_id', webhookId);
  if (error) {
    console.warn(`[webhook] completeWebhookDelivery failed for ${webhookId}:`, error);
  }
}
