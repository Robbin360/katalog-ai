import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { assertAllowedOrigin } from '@/lib/security/origin';

/**
 * GET /api/billing/auto-scale
 * Retorna la configuración actual de Auto-Scale del usuario
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('plan_tier, credits_total, credits_used, credits_topup, auto_scale_enabled, auto_scale_cap, auto_scale_spent, auto_scale_count')
    .eq('id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const SCALE_PACK_SIZE = 40;
  const additionalCharges = (profile.auto_scale_spent || 0) / 100;

  return NextResponse.json({
    isActive: profile.auto_scale_enabled,
    creditsIncluded: profile.credits_total || 0,
    creditsUsed: profile.credits_used || 0,
    autoScalesCount: profile.auto_scale_count || 0,
    scalePackSize: SCALE_PACK_SIZE,
    additionalCharges: additionalCharges,
    monthlyCap: (profile.auto_scale_cap || 1000) / 100,
  });
}

/**
 * POST /api/billing/auto-scale
 * Guarda el cap SIN activar Auto-Scale automáticamente
 * Body: { capAmount: number } (en dólares, ej: 200)
 */
export async function POST(request: NextRequest) {
  const originError = assertAllowedOrigin(request);
  if (originError) return originError;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { capAmount } = body;

    if (!capAmount || typeof capAmount !== 'number' || capAmount < 10) {
      return NextResponse.json({ error: 'Minimum cap is $10' }, { status: 400 });
    }

    const capCents = Math.round(capAmount * 100);

    // FIX: Solo actualizar el cap, NO tocar auto_scale_enabled
    const { error } = await supabase
      .from('profiles')
      .update({
        auto_scale_cap: capCents,
      })
      .eq('id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, cap: capCents });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

/**
 * PATCH /api/billing/auto-scale
 * Activa o desactiva Auto-Scale (independiente del cap)
 * Body: { isActive: boolean }
 */
export async function PATCH(request: NextRequest) {
  const originError = assertAllowedOrigin(request);
  if (originError) return originError;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be boolean' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        auto_scale_enabled: isActive,
      })
      .eq('id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, isActive });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
