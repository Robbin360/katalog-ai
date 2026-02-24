import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )

    // 1. Verificar sesión del usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 2. Obtener credenciales de Shopify de la tabla 'integrations'
    const { data: integration, error: intError } = await supabase
      .from('integrations')
      .select('shop_url, access_token')
      .eq('user_id', user.id)
      .eq('provider', 'shopify')
      .single()

    if (intError || !integration) {
      return NextResponse.json({ error: "Please connect Shopify in Settings first." }, { status: 400 })
    }

    // 3. Llamar a Shopify (Traemos los últimos 50 productos)
    const shopifyUrl = `https://${integration.shop_url}/admin/api/2024-01/products.json?limit=50`

    const res = await fetch(shopifyUrl, {
      headers: {
        "X-Shopify-Access-Token": integration.access_token,
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) throw new Error("Shopify API Error")
    const { products } = await res.json()

    // 4. Mapear datos para nuestra tabla shopify_products
    const productsToSync = products.map((p: any) => ({
      user_id: user.id,
      shopify_id: p.id.toString(),
      title: p.title,
      current_title: p.title,
      current_body_html: p.body_html,
      current_tags: p.tags,
      vendor: p.vendor,
      price: p.variants[0]?.price || 0,
      image_url: p.images[0]?.src || null,
      audit_status: 'PENDING_AUDIT',
      updated_at: new Date().toISOString()
    }))

    // 5. Inyectar en Supabase (UPSERT: si ya existe por shopify_id, lo actualiza)
    const { error: dbError } = await supabase
      .from('shopify_products')
      .upsert(productsToSync, { onConflict: 'user_id, shopify_id' })

    if (dbError) throw dbError

    return NextResponse.json({
      success: true,
      count: productsToSync.length,
      message: `Successfully synced ${productsToSync.length} products.`
    })

  } catch (error: any) {
    console.error("Sync Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}