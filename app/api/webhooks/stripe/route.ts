import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Usamos el Service Role para tener permisos de administrador en Supabase y poder modificar saldo
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('❌ Webhook error: Faltan credenciales o firma.');
        return new NextResponse('Webhook secret missing', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // Validamos que el aviso venga realmente de Stripe
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`❌ Error de firma de Webhook: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // EVENTO: El cliente pagó exitosamente
    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;

        if (!userId) {
            console.error('❌ Error: Pago completado sin user_id en metadata.');
            return new NextResponse('Missing user_id in metadata', { status: 400 });
        }

        try {
            // Le preguntamos a Stripe qué plan compró exactamente
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0].price.id;

            // Calculamos el saldo a entregar
            let creditsToAssign = 100; // Starter por defecto
            let planName = 'starter';

            if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) {
                creditsToAssign = 300;
                planName = 'pro';
            } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS) {
                creditsToAssign = 1000;
                planName = 'business';
            }

            // Inyección Atómica en Base de Datos
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    stripe_subscription_id: subscriptionId,
                    plan_tier: planName,
                    auto_pilot_enabled: true, // Activamos el AutoPilot como regalo por compra
                    credits_total: creditsToAssign,
                    credits_used: 0, // Reseteamos el uso mensual
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) throw error;

            console.log(`✅ ¡PAGO EXITOSO! Usuario ${userId} subió a plan ${planName} con ${creditsToAssign} créditos.`);

        } catch (dbError: any) {
            console.error(`❌ Error al actualizar Supabase: ${dbError.message}`);
            return new NextResponse('Database error', { status: 500 });
        }
    }

    // EVENTO: Suscripción cancelada
    if (event.type === 'customer.subscription.deleted') {
        const subscriptionId = session.id;
        await supabaseAdmin
            .from('profiles')
            .update({
                plan_tier: 'free',
                auto_pilot_enabled: false,
                credits_total: 0,
                stripe_subscription_id: null,
            })
            .eq('stripe_subscription_id', subscriptionId);
        console.log(`⚠️ Suscripción ${subscriptionId} cancelada. Usuario degradado a Free.`);
    }

    return new NextResponse('Success', { status: 200 });
}