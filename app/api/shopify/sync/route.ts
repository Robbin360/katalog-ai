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

        // 1. Verificar Usuario
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // 2. Obtener Credenciales guardadas en la pestaña 'Integrations'
        const { data: integration } = await supabase
            .from('integrations')
            .select('shop_url, access_token')
            .eq('user_id', user.id)
            .eq('provider', 'shopify')
            .single()

        if (!integration?.shop_url || !integration?.access_token) {
            return NextResponse.json({ error: "No Shopify connection found. Go to Settings > Integrations." }, { status: 400 })
        }

        // 3. LLAMAR A SHOPIFY (Traer últimos 10 productos para probar)
        const shopifyRes = await fetch(`https://${integration.shop_url}/admin/api/2024-01/products.json?limit=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': integration.access_token
            }
        })

        if (!shopifyRes.ok) throw new Error("Failed to fetch from Shopify")
        const { products } = await shopifyRes.json()

        // 4. GUARDAR EN TU INVENTARIO (Batch Insert)
        let count = 0
        for (const p of products) {
            // Solo importamos si tiene imagen
            if (p.images && p.images.length > 0) {
                const { error } = await supabase.from('products_queue').insert({
                    user_id: user.id,
                    original_image_url: p.images[0].src, // Usamos la primera imagen
                    status: 'QUEUED', // ¡Esto dispara a n8n automáticamente!
                    raw_data: {
                        title: p.title,
                        brand: p.vendor,
                        user_context: p.body_html?.replace(/<[^>]*>?/gm, '') || "Imported from Shopify" // Limpiamos HTML viejo
                    },
                    // Guardamos el ID de Shopify para saber cual es cual
                    // (Nota: Asegúrate de tener una columna shopify_id en tu tabla o guárdalo en raw_data)
                })
                if (!error) count++
            }
        }

        return NextResponse.json({ success: true, count, message: `Imported ${count} products` })

    } catch (error: any) {
        console.error("Sync Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}