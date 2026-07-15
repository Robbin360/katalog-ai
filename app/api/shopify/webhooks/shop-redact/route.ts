import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookHmac, claimWebhookDelivery, completeWebhookDelivery } from '@/lib/shopify/oauth';
import { createSupabaseServiceClient, decryptShopifyToken } from '@/lib/supabase/server';
import { revokeToken } from '@/lib/shopify/admin';
import { logSecurityEvent, SecurityEvents } from '@/lib/security/logger';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  if (!hmacHeader) return NextResponse.json({ error: 'Missing HMAC' }, { status: 401 });

  if (!verifyWebhookHmac(body, hmacHeader, apiSecret)) {
    logSecurityEvent(SecurityEvents.WEBHOOK_HMAC_FAILED, { topic: 'shop/redact' });
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const topic = request.headers.get('X-Shopify-Topic');
  if (topic !== 'shop/redact') {
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
  const claimResult = await claimWebhookDelivery(supabase, webhookId, 'shop/redact', shopDomain);

  if (claimResult === 'processed') {
    return NextResponse.json({ ok: true });
  }

  const { data: inserted, error: logError } = await supabase
    .from('gdpr_data_requests')
    .insert({
      shop_url: shopDomain,
      shop_id: shopId,
      request_type: 'shop/redact',
      status: 'processing',
    })
    .select()
    .single();

  if (logError || !inserted) {
    logSecurityEvent(SecurityEvents.WEBHOOK_DB_FAILED, {
      shop: shopDomain, topic: 'shop/redact', error: logError?.message,
    });
    await completeWebhookDelivery(supabase, webhookId, false);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  try {
    const { data: integration, error: integFindError } = await supabase
      .from('integrations')
      .select('id, user_id, access_token')
      .eq('shop_url', shopDomain)
      .is('uninstalled_at', null)
      .maybeSingle();

    if (integFindError) {
      throw new Error(`integration lookup failed: ${integFindError.message}`);
    }

    if (integration?.access_token) {
      try {
        const plaintextToken = await decryptShopifyToken(supabase, integration.access_token);
        await revokeToken({ shop: shopDomain, accessToken: plaintextToken });
      } catch (revokeErr) {
        console.warn('[shopify/webhooks/shop-redact] Token revocation failed:', revokeErr);
      }
    }

    const { error: integUpdateError } = await supabase
      .from('integrations')
      .update({
        uninstalled_at: new Date().toISOString(),
        access_token: null,
      })
      .eq('shop_url', shopDomain)
      .is('uninstalled_at', null);

    if (integUpdateError) {
      throw new Error(`integration update failed: ${integUpdateError.message}`);
    }

    if (integration?.user_id) {
      const { error: productsError } = await supabase
        .from('shopify_products')
        .delete()
        .eq('user_id', integration.user_id);

      if (productsError) {
        throw new Error(`shopify_products delete failed: ${productsError.message}`);
      }

      const { error: syncJobsError } = await supabase
        .from('sync_jobs')
        .delete()
        .eq('user_id', integration.user_id);

      if (syncJobsError) {
        throw new Error(`sync_jobs delete failed: ${syncJobsError.message}`);
      }
    }

    const { error: markError } = await supabase
      .from('gdpr_data_requests')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', inserted.id);

    if (markError) {
      throw new Error(`mark processed failed: ${markError.message}`);
    }

    logSecurityEvent(SecurityEvents.GDPR_REDACT, {
      shop: shopDomain, scope: 'shop',
    });

    await completeWebhookDelivery(supabase, webhookId, true);
    return NextResponse.json({ ok: true });

  } catch (cleanupErr) {
    console.error('[shopify/webhooks/shop-redact] cleanup failed:', cleanupErr);

    await supabase
      .from('gdpr_data_requests')
      .update({ status: 'failed' })
      .eq('id', inserted.id);

    logSecurityEvent(SecurityEvents.GDPR_REDACT_FAILED, {
      shop: shopDomain,
      error: cleanupErr instanceof Error ? cleanupErr.message : 'unknown',
    });

    await completeWebhookDelivery(supabase, webhookId, false);

    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
