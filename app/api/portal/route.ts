import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

// Inicializamos Stripe sin versión hardcodeada para evitar errores
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST() {
    try {
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

        // 2. Buscamos su ID de cliente de Stripe en tu base de datos
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: "No hay suscripción activa" }, { status: 400 })
        }

        // 3. Generamos el ticket dorado (Portal Session) de Stripe
        const origin = (await headers()).get('origin') || 'http://localhost:3000'
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${origin}/account`, // A dónde vuelve cuando cierre Stripe
        })

        // 4. Le devolvemos la URL mágica al botón de tu Frontend
        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error("❌ Error en Portal Stripe:", error)
        return new NextResponse("Error Interno", { status: 500 })
    }
}