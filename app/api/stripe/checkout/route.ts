import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

// Inicializamos Stripe con la clave secreta del servidor
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(req: Request) {
    try {
        // 1. Parseamos el body para obtener el priceId
        const body = await req.json()
        const { priceId } = body

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID es requerido' },
                { status: 400 }
            )
        }

        // 2. Creamos cliente Supabase con cookies del request para verificar sesión
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Ignorar errores de cookies en Server Components
                        }
                    },
                },
            }
        )

        // 3. Verificamos que el usuario esté autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado. Inicia sesión para continuar.' },
                { status: 401 }
            )
        }

        // 4. URL Dinámica: Funciona tanto en localhost como en producción (Vercel)
        //    Prioridad: origin header > NEXT_PUBLIC_SITE_URL env > fallback localhost
        const headersList = await headers()
        const origin = headersList.get('origin')
            || process.env.NEXT_PUBLIC_SITE_URL
            || 'http://localhost:3000'

        // 5. Creamos la sesión de Checkout en Stripe
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard?success=true`,
            cancel_url: `${origin}/dashboard?canceled=true`,
            // CRÍTICO: El webhook usa metadata.user_id para asignar créditos
            metadata: {
                user_id: user.id,
            },
            // Autocompleta el email para que el usuario no lo escriba de nuevo
            customer_email: user.email,
        })

        // 6. Devolvemos la URL de Stripe para que el frontend redirija
        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('❌ Error en Stripe Checkout:', error.message)

        // Diferenciamos errores de Stripe vs errores genéricos
        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                { error: `Error de Stripe: ${error.message}` },
                { status: error.statusCode || 500 }
            )
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
