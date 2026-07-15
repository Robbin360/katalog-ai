import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.SHOPIFY_APP_URL,
].filter(Boolean) as string[];

export function assertAllowedOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  return null;
}
