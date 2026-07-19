import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface AuditProduct {
  shopify_id: string;
  current_title: string | null;
  vendor: string | null;
  tags: string | null;
  price: number | null;
  compare_at_price: number | null;
  inventory_quantity: number;
  audit_score: number;
  audit_status: string;
  seo_score_initial: number;
  seo_score_after: number;
  last_audit_at: string | null;
  sales_last_7_days: number;
  sales_last_30_days: number;
  sales_last_90_days: number;
  billing_state: string;
  consecutive_failures: number;
  updated_at: string;
  created_at: string;
}

const CSV_HEADERS = [
  'Shopify ID',
  'Title',
  'Vendor',
  'Tags',
  'Price',
  'Compare At Price',
  'Inventory Quantity',
  'Audit Score (0-100)',
  'Audit Status',
  'SEO Score Initial',
  'SEO Score After',
  'Last Audit At',
  'Sales Last 7 Days',
  'Sales Last 30 Days',
  'Sales Last 90 Days',
  'Billing State',
  'Consecutive Failures',
  'Updated At',
  'Created At',
];

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function convertToCSV(products: AuditProduct[]): string {
  const headerRow = CSV_HEADERS.map(escapeCSV).join(',');
  const dataRows = products.map((p) =>
    [
      p.shopify_id,
      p.current_title,
      p.vendor,
      p.tags,
      p.price,
      p.compare_at_price,
      p.inventory_quantity,
      p.audit_score,
      p.audit_status,
      p.seo_score_initial,
      p.seo_score_after,
      p.last_audit_at,
      p.sales_last_7_days,
      p.sales_last_30_days,
      p.sales_last_90_days,
      p.billing_state,
      p.consecutive_failures,
      p.updated_at,
      p.created_at,
    ]
      .map(escapeCSV)
      .join(','),
  );
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {}
          },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!['pro', 'business'].includes(profile.plan_tier)) {
      return NextResponse.json(
        { error: 'CSV export is available on Pro and Business plans only' },
        { status: 403 },
      );
    }

    const { data: products, error: productsError } = await supabase
      .from('shopify_products')
      .select(
        `
        shopify_id,
        current_title,
        vendor,
        tags,
        price,
        compare_at_price,
        inventory_quantity,
        audit_score,
        audit_status,
        seo_score_initial,
        seo_score_after,
        last_audit_at,
        sales_last_7_days,
        sales_last_30_days,
        sales_last_90_days,
        billing_state,
        consecutive_failures,
        updated_at,
        created_at
      `,
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (productsError) {
      console.error('CSV export DB error:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products to export' }, { status: 404 });
    }

    const csv = convertToCSV(products as AuditProduct[]);
    const filename = `katalog-audit-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
