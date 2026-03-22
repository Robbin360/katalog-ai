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

    // Validación de seguridad (SSRF Mitigation)
    const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/;
    if (!shopUrlPattern.test(integration.shop_url)) {
      return NextResponse.json({ error: "Invalid Shopify URL format detected." }, { status: 400 });
    }

    // 3. Llamar a Shopify (Traemos productos con datos de inventario)
    const shopifyUrl = `https://${integration.shop_url}/admin/api/2024-01/products.json?limit=50`

    const res = await fetch(shopifyUrl, {
      headers: {
        "X-Shopify-Access-Token": integration.access_token,
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) throw new Error("Shopify API Error")
    const { products } = await res.json()

    // 4. Mapear datos con LÓGICA FINANCIERA (NUEVO)
    const productsToSync = products.map((p: any) => {

      // Calcular Stock Total (sumando todas las variantes/tallas/colores)
      const totalStock = p.variants?.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0) || 0;

      // Obtener Precios (Tomamos el de la variante principal)
      const currentPrice = p.variants[0]?.price ? parseFloat(p.variants[0].price) : 0;
      const comparePrice = p.variants[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null;

      return {
        user_id: user.id,
        shopify_id: p.id.toString(),
        title: p.title,
        current_title: p.title,
        current_body_html: p.body_html,
        current_tags: p.tags,
        vendor: p.vendor,
        image_url: p.images[0]?.src || null, // Guardamos solo la URL

        // --- LOS DATOS NUEVOS PARA LA IA ---
        price: currentPrice,
        compare_at_price: comparePrice,
        inventory_quantity: totalStock,
        audit_status: 'PENDING_AUDIT',

        updated_at: new Date().toISOString()
      }
    })

    // 5. Inyectar en Supabase (UPSERT)
    // Actualiza los datos si el producto ya existía, o lo crea si es nuevo
    const { error: dbError } = await supabase
      .from('shopify_products')
      .upsert(productsToSync, { onConflict: 'user_id, shopify_id' })

    if (dbError) throw dbError

    return NextResponse.json({
      success: true,
      count: productsToSync.length,
      message: `Successfully synced ${productsToSync.length} products with financial data.`
    })

  } catch (error: any) {
    console.error("Sync Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}