import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// NO inicializamos Stripe aquí arriba para evitar errores de Build.
// Lo haremos dentro de la función.

export async function POST(req: Request) {
  try {
    // 1. BLINDAJE: Verificar que la llave existe antes de usarla
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Falta la variable STRIPE_SECRET_KEY en Vercel")
    }

    // 2. Inicializar Stripe AHORA (Lazy Load)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any, // Ajuste de versión
    })

    // 3. Verificar sesión de usuario
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

    // 4. Leer body
    const body = await req.json()
    const { priceId } = body

    // 5. Crear sesión de pago
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
      customer_email: user.email, 
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error("Stripe Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}