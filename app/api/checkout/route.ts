import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

// Inicializamos Stripe (Sin hardcodear la versión para evitar errores)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { priceId } = body

        if (!priceId) {
            return new NextResponse("Price ID is required", { status: 400 })
        }

        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch { }
                    },
                },
            }
        )

        // 1. Verificamos quién es el usuario
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new NextResponse("No autorizado", { status: 401 })

        // 2. Definimos a dónde vuelve después de pagar
        const origin = (await headers()).get('origin') || 'http://localhost:3000'

        // 3. Creamos la sesión de Checkout en Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/account?success=true`,
            cancel_url: `${origin}/account?canceled=true`,
            customer_email: user.email, // Autocompleta el email del cliente
            metadata: {
                userId: user.id // MUY IMPORTANTE: Le dice al Webhook a quién darle los créditos
            }
        })

        // 4. Devolvemos la URL para que el frontend haga la redirección
        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error("❌ Error en Checkout Stripe:", error)
        return new NextResponse("Error Interno", { status: 500 })
    }
}