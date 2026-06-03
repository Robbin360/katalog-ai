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
            const interval = subscription.items.data[0].plan.interval; // 'month' o 'year'

            // Calculamos el saldo a entregar (Matriz de Márgenes v2)
            let creditsToAssign = 100; // Starter por defecto
            let planName = 'starter';

            if (
                priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ||
                priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL
            ) {
                creditsToAssign = 250;
                planName = 'pro';
            } else if (
                priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS ||
                priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL
            ) {
                creditsToAssign = 700;
                planName = 'business';
            }

            // Inyección Atómica en Base de Datos
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
                    stripe_subscription_id: subscriptionId,
                    plan_tier: planName,
                    billing_interval: interval,
                    subscription_status: 'active',
                    next_credit_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

    // EVENTO: Factura pagada — recarga mensual gestionada por Stripe
    if (event.type === 'invoice.paid') {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        // Solo procesamos facturas recurrentes, no el primer pago (que ya maneja checkout.session.completed)
        if (invoice.billing_reason !== 'subscription_cycle') {
            console.log(`⏭️ invoice.paid ignorada: billing_reason=${invoice.billing_reason}.`);
            return new NextResponse('Success', { status: 200 });
        }

        if (!subscriptionId) {
            console.error('❌ Error: invoice.paid sin subscriptionId.');
            return new NextResponse('Missing subscriptionId in invoice', { status: 400 });
        }

        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const billingInterval = subscription.items.data[0].plan.interval;
            const subscriptionStatus = subscription.status;

            if (billingInterval !== 'month') {
                console.log(`⏭️ invoice.paid ignorada: suscripción ${subscriptionId} es ${billingInterval}. Supabase gestiona los resets anuales.`);
                return new NextResponse('Success', { status: 200 });
            }

            if (subscriptionStatus !== 'active') {
                console.log(`⏭️ invoice.paid ignorada: suscripción ${subscriptionId} está en estado ${subscriptionStatus}.`);
                return new NextResponse('Success', { status: 200 });
            }

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    credits_used: 0,
                    updated_at: new Date().toISOString(),
                })
                .eq('stripe_subscription_id', subscriptionId);

            if (error) throw error;

            console.log(`🔄 Recarga mensual procesada: suscripción ${subscriptionId} — créditos usados reseteados.`);
        } catch (dbError: any) {
            console.error(`❌ Error al procesar invoice.paid: ${dbError.message}`);
            return new NextResponse('Database error', { status: 500 });
        }
    }

    // EVENTO: Suscripción cancelada
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        await supabaseAdmin
            .from('profiles')
            .update({
                plan_tier: 'free',
                subscription_status: 'inactive',
                next_credit_reset_at: null,
                auto_pilot_enabled: false,
                credits_total: 0,
                stripe_subscription_id: null,
            })
            .eq('stripe_subscription_id', subscriptionId);
        console.log(`⚠️ Suscripción ${subscriptionId} cancelada. Usuario degradado a Free.`);
    }

    // EVENTO: Estado de suscripción actualizado (past_due, reactivación, cancelación)
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const status = subscription.status;

        try {
            if (status === 'past_due') {
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: 'past_due',
                        auto_pilot_enabled: false,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                if (error) throw error;
                console.log(`⚠️ Suscripción ${subscriptionId} PAST_DUE. Auto-Pilot desactivado. Créditos intactos.`);
            } else if (status === 'active') {
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        auto_pilot_enabled: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                if (error) throw error;
                console.log(`✅ Suscripción ${subscriptionId} reactivada. Auto-Pilot restaurado.`);
            } else if (status === 'canceled' || status === 'unpaid') {
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: 'inactive',
                        plan_tier: 'free',
                        credits_total: 0,
                        auto_pilot_enabled: false,
                        stripe_subscription_id: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                if (error) throw error;
                console.log(`🔴 Suscripción ${subscriptionId} ${status}. Degradado a Free.`);
            } else {
                console.log(`⏭️ customer.subscription.updated ignorada: estado ${status} no requiere acción.`);
            }
        } catch (dbError: any) {
            console.error(`❌ Error processing customer.subscription.updated: ${dbError.message}`);
            return new NextResponse('Database error', { status: 500 });
        }
    }

    return new NextResponse('Success', { status: 200 });
}
