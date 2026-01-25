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

        // 1. Obtener Usuario
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // 2. Obtener Credenciales de Shopify
        const { data: profile } = await supabase
            .from('profiles')
            .select('shopify_domain, shopify_access_token')
            .eq('id', user.id)
            .single()

        if (!profile?.shopify_domain || !profile?.shopify_access_token) {
            return NextResponse.json({ error: "Shopify not connected" }, { status: 400 })
        }

        // 3. Obtener Datos del Producto a Publicar
        const body = await req.json()
        const { productData, imageUrl } = body

        // 4. Preparar Payload para Shopify (DRAFT por seguridad)
        const shopifyPayload = {
            product: {
                title: productData.product_title,
                body_html: productData.description_html,
                vendor: "Katalog AI",
                product_type: "Generated",
                status: 'draft', // DRAFT para que el usuario revise antes de publicar
                tags: productData.seo_tags,
                images: [
                    { src: imageUrl }
                ]
            }
        }

        // 5. ENVIAR A SHOPIFY (El Disparo)
        const response = await fetch(`https://${profile.shopify_domain}/admin/api/2024-01/products.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': profile.shopify_access_token
            },
            body: JSON.stringify(shopifyPayload)
        })

        const result = await response.json()

        if (!response.ok) {
            console.error("Shopify API Error:", result)
            throw new Error(result.errors ? JSON.stringify(result.errors) : "Shopify Error")
        }

        return NextResponse.json({ success: true, shopifyId: result.product.id })

    } catch (error: any) {
        console.error("Shopify Push Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
