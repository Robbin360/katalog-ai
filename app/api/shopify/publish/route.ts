import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { productId } = await req.json()
        const cookieStore = await cookies()

        // 1. Secure connection
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
        )

        // 2. Verify authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })

        // 3. Extract product and AI proposal
        const { data: product } = await supabase
            .from('shopify_products')
            .select('shopify_id, ai_proposal')
            .eq('id', productId)
            .single()

        if (!product || !product.ai_proposal) {
            return NextResponse.json({ error: "Product or AI proposal not found" }, { status: 400 })
        }

        // 4. Find the client's Shopify key in our Vault
        const { data: integration } = await supabase
            .from('integrations')
            .select('shop_url, access_token')
            .eq('user_id', user.id)
            .eq('provider', 'shopify')
            .single()

        if (!integration) {
            return NextResponse.json({ error: "Shopify store not connected. Please connect it in Settings." }, { status: 400 })
        }

        // 5. SHOPIFY ATTACK (GraphQL 2026)
        const shopifyUrl = `https://${integration.shop_url}/admin/api/2026-04/graphql.json`

        const mutation = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id }
          userErrors { message }
        }
      }
    `
        const variables = {
            input: {
                id: product.shopify_id,
                title: product.ai_proposal.new_title,
                bodyHtml: product.ai_proposal.new_body_html
            }
        }

        const shopifyRes = await fetch(shopifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': integration.access_token
            },
            body: JSON.stringify({ query: mutation, variables })
        })

        const shopifyData = await shopifyRes.json()

        // Shopify Error Handling
        if (shopifyData.data?.productUpdate?.userErrors?.length > 0) {
            throw new Error(shopifyData.data.productUpdate.userErrors[0].message)
        }

        // 6. SUCCESS! Mark product as OPTIMIZED
        await supabase.from('shopify_products').update({ audit_status: 'OPTIMIZED' }).eq('id', productId)

        return NextResponse.json({ success: true, message: "Published to Shopify successfully" })

    } catch (error: any) {
        console.error("❌ Error Publishing to Shopify:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}