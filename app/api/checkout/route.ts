import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Inicializamos Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover' as any, // "as any" apaga la queja de TypeScript si la versión cambia
})

export async function POST(req: Request) {
    try {
        // 1. Verificar seguridad (Usuario logueado)
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) { /* ... */ }
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // 2. Obtener el ID del precio que envió el botón
        const body = await req.json()
        const { priceId } = body

        // 3. Crear la sesión de pago en Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?canceled=true`,
            customer_email: user.email, // Pre-llenamos el email para que no lo escriba de nuevo
            metadata: {
                userId: user.id, // CRÍTICO: Para saber a quién darle los créditos después
            },
        })

        // 4. Devolver la URL de pago
        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error("Stripe Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}