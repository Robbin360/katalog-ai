import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookHmac, claimWebhookDelivery, completeWebhookDelivery } from '@/lib/shopify/oauth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { logSecurityEvent, SecurityEvents } from '@/lib/security/logger';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  if (!hmacHeader) return NextResponse.json({ error: 'Missing HMAC' }, { status: 401 });

  if (!verifyWebhookHmac(body, hmacHeader, apiSecret)) {
    logSecurityEvent(SecurityEvents.WEBHOOK_HMAC_FAILED, { topic: 'customers/data_request' });
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const topic = request.headers.get('X-Shopify-Topic');
  if (topic !== 'customers/data_request') {
    logSecurityEvent(SecurityEvents.WEBHOOK_UNEXPECTED_TOPIC, { topic });
    return NextResponse.json({ error: 'Unexpected topic' }, { status: 400 });
  }

  let payload: any;
  try { payload = JSON.parse(body); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const shopDomain = payload.shop_domain;
  const shopId = payload.shop_id;
  if (!shopDomain || !shopId) {
    return NextResponse.json({ error: 'Missing shop' }, { status: 400 });
  }

  const webhookId = request.headers.get('X-Shopify-Webhook-Id');
  const supabase = createSupabaseServiceClient();
  const claimResult = await claimWebhookDelivery(supabase, webhookId, 'customers/data_request', shopDomain);

  if (claimResult === 'processed') {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from('gdpr_data_requests').insert({
    shop_url: shopDomain,
    shop_id: shopId,
    customer_email: payload.customer?.email,
    request_type: 'customers/data_request',
    status: 'pending',
  });

  if (error) {
    logSecurityEvent(SecurityEvents.WEBHOOK_DB_FAILED, {
      shop: shopDomain, topic: 'customers/data_request', error: error.message,
    });
    await completeWebhookDelivery(supabase, webhookId, false);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  logSecurityEvent(SecurityEvents.GDPR_DATA_REQUEST, {
    shop: shopDomain,
  });

  await completeWebhookDelivery(supabase, webhookId, true);
  return NextResponse.json({ ok: true });
}
