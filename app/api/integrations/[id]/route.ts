import { NextRequest, NextResponse, after } from 'next/server';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
  decryptShopifyToken,
} from '@/lib/supabase/server';
import { revokeToken } from '@/lib/shopify/admin';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { logSecurityEvent, SecurityEvents } from '@/lib/security/logger';

export const maxDuration = 60;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // CSRF protection
  const originError = assertAllowedOrigin(request);
  if (originError) return originError;

  // 1. Validar sesión
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Buscar integración
  const { data: integration, error: findError } = await supabase
    .from('integrations_safe')
    .select('id, shop_url, uninstalled_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (findError || !integration) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
  }
  if (integration.uninstalled_at) {
    return NextResponse.json({ ok: true });
  }

  // 3. Revocar token en Shopify (after = después del redirect)
  after(async () => {
    try {
      const serviceClient = createSupabaseServiceClient();
      const { data: fullIntegration, error: tokenReadError } = await serviceClient
        .from('integrations')
        .select('access_token, shop_url')
        .eq('id', id)
        .single();

      if (tokenReadError || !fullIntegration?.access_token) {
        console.warn('[integrations/delete] Could not read token for revocation');
        logSecurityEvent(SecurityEvents.INTEGRATION_REVOKE_FAILED, {
          user_id: user.id, shop: integration.shop_url, reason: 'no_token',
        });
      } else {
        const plaintextToken = await decryptShopifyToken(
          serviceClient,
          fullIntegration.access_token as string
        );

        const revoked = await revokeToken({
          shop: integration.shop_url,
          accessToken: plaintextToken,
        });

        if (revoked) {
          logSecurityEvent(SecurityEvents.INTEGRATION_REVOKED, {
            user_id: user.id, shop: integration.shop_url,
          });
        } else {
          logSecurityEvent(SecurityEvents.INTEGRATION_REVOKE_FAILED, {
            user_id: user.id, shop: integration.shop_url,
          });
        }
      }
    } catch (err) {
      console.error('[after] token revocation failed', err);
    }
  });

  // 4. Soft delete + NULL access_token
  const { error: updateError } = await supabase
    .from('integrations')
    .update({
      uninstalled_at: new Date().toISOString(),
      access_token: null,
    })
    .eq('id', id)
    .is('uninstalled_at', null);

  if (updateError) {
    console.error('[integrations/delete] DB update failed', updateError);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}