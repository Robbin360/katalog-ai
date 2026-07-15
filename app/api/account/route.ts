import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { logSecurityEvent, SecurityEvents } from '@/lib/security/logger';

export async function DELETE(request: NextRequest) {
  const originError = assertAllowedOrigin(request);
  if (originError) return originError;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { password?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  if (!body.password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  if (!user.email) {
    return NextResponse.json(
      { error: 'Account has no email — contact support' },
      { status: 400 }
    );
  }

  const { error: pwdError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: body.password,
  });
  if (pwdError) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 403 });
  }

  logSecurityEvent(SecurityEvents.ACCOUNT_DELETED, {
    user_id: user.id,
    email: user.email,
  });

  const serviceClient = createSupabaseServiceClient();
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('[api/account] Failed to delete user:', deleteError);
    logSecurityEvent(SecurityEvents.ACCOUNT_DELETE_FAILED, {
      user_id: user.id,
      error: deleteError.message,
    });
    return NextResponse.json(
      { error: 'No pudimos borrar tu cuenta. Contacta a soporte.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
