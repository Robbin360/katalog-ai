import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// 1. Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-16' as any,
})

// 2. Inicializar Supabase en MODO DIOS (Service Role)
// Solo esta instancia puede modificar los créditos de los usuarios.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Esta clave secreta te la da Stripe cuando configuras el Webhook.
// Por ahora, en local, la dejaremos pendiente o usaremos la de prueba.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    // 3. Verificar que la firma sea válida (Que venga de Stripe y no de un hacker)
    // Si no has configurado el secreto en .env, esto fallará en producción.
    if (!webhookSecret) {
       console.warn("⚠️ Saltando verificación de firma (Solo Dev)")
       event = JSON.parse(body) // En producción esto es inseguro, pero sirve para probar rápido
    } else {
       event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }
  } catch (error: any) {
    console.error(`❌ Error de Webhook: ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // 4. PROCESAR EL PAGO EXITOSO
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    
    // Recuperar el ID del usuario que guardamos en metadata
    const userId = session.metadata?.userId
    
    // Determinar cuántos créditos dar según lo que pagó
    // (Esto es una lógica simple, puedes mejorarla leyendo el priceId)
    const amountPaid = session.amount_total // en centavos
    let creditsToAdd = 0
    let planName = 'starter'

    if (amountPaid === 2900) { // $29.00
      creditsToAdd = 50
      planName = 'pro'
    } else if (amountPaid === 9900) { // $99.00
      creditsToAdd = 500
      planName = 'business'
    }

    if (userId) {
      console.log(`💰 Pago recibido de ${userId}. Recargando ${creditsToAdd} créditos...`)

      // 5. INYECCIÓN SQL (Actualizar Perfil)
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan_tier: planName,
          credits_total: creditsToAdd, // Ojo: Esto reemplaza. Si quieres sumar, usa una función RPC.
          credits_used: 0, // Reseteamos el uso del mes
          subscription_status: 'active',
          stripe_customer_id: session.customer as string
        })
        .eq('id', userId)

      if (error) {
        console.error('❌ Error actualizando Supabase:', error)
        return new NextResponse('Error DB', { status: 500 })
      }
      
      console.log('✅ Créditos actualizados con éxito.')
    }
  }

  return new NextResponse(null, { status: 200 })
}