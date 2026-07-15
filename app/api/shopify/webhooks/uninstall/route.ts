import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookHmac, claimWebhookDelivery, completeWebhookDelivery } from '@/lib/shopify/oauth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { logSecurityEvent, SecurityEvents } from '@/lib/security/logger';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) {
    console.error('[shopify/webhooks/uninstall] Missing SHOPIFY_API_SECRET');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  if (!hmacHeader) {
    return NextResponse.json({ error: 'Missing HMAC' }, { status: 401 });
  }

  if (!verifyWebhookHmac(body, hmacHeader, apiSecret)) {
    logSecurityEvent(SecurityEvents.WEBHOOK_HMAC_FAILED, { topic: 'app/uninstalled' });
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const topic = request.headers.get('X-Shopify-Topic');
  if (topic !== 'app/uninstalled') {
    logSecurityEvent(SecurityEvents.WEBHOOK_UNEXPECTED_TOPIC, { topic });
    return NextResponse.json({ error: 'Unexpected topic' }, { status: 400 });
  }

  let payload: any;
  try { payload = JSON.parse(body); }
  catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const shopDomain = payload.shop_domain;
  if (!shopDomain) {
    return NextResponse.json({ error: 'Missing shop_domain' }, { status: 400 });
  }

  const webhookId = request.headers.get('X-Shopify-Webhook-Id');
  const supabase = createSupabaseServiceClient();
  const claimResult = await claimWebhookDelivery(supabase, webhookId, 'app/uninstalled', shopDomain);

  if (claimResult === 'processed') {
    console.log(`[shopify/webhooks/uninstall] Duplicate webhook ${webhookId}, already processed`);
    return NextResponse.json({ ok: true });
  }

  const { error, data } = await supabase
    .from('integrations')
    .update({ uninstalled_at: new Date().toISOString() })
    .eq('shop_url', shopDomain)
    .is('uninstalled_at', null)
    .select();

  if (error) {
    logSecurityEvent(SecurityEvents.WEBHOOK_DB_FAILED, {
      shop: shopDomain, error: error.message,
    });
    await completeWebhookDelivery(supabase, webhookId, false);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.log(`[shopify/webhooks/uninstall] No active integration for ${shopDomain} (already uninstalled?)`);
  } else {
    console.log(`[shopify/webhooks/uninstall] Marked ${shopDomain} as uninstalled`);
  }

  await completeWebhookDelivery(supabase, webhookId, true);
  logSecurityEvent(SecurityEvents.WEBHOOK_PROCESSED, {
    topic: 'app/uninstalled', shop: shopDomain,
  });
  return NextResponse.json({ ok: true });
}
