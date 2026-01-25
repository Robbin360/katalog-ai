import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { shopUrl, accessToken } = body

        if (!shopUrl || !accessToken) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
        }

        // Limpieza de URL (por si el usuario pone https://)
        const cleanShopUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

        // Llamada de prueba a Shopify (Obtener info de la tienda)
        const response = await fetch(`https://${cleanShopUrl}/admin/api/2024-01/shop.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            }
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Invalid credentials or shop URL" }, { status: 401 })
        }

        const data = await response.json()
        return NextResponse.json({ success: true, shop: data.shop.name })

    } catch (error: any) {
        console.error("Shopify Verify Error:", error)
        return NextResponse.json({ error: "Connection failed" }, { status: 500 })
    }
}
