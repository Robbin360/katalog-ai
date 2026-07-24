import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_PATROL_LIMITS: Record<string, number> = {
  free: 3,
  starter: 3,
  pro: 5,
  business: 10,
  enterprise: 3,
};

function getPatrolLimitForPlan(planTier: string): number {
  return PLAN_PATROL_LIMITS[planTier] ?? 3;
}

async function atomicallyUpdatePlanAndLimit(
  supabase: any,
  userId: string,
  newPlanTier: string,
  reason: string,
  metadata?: Record<string, any>
): Promise<{ oldPlan: string; oldLimit: number; newLimit: number } | null> {
  const newLimit = getPatrolLimitForPlan(newPlanTier);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      plan_tier: newPlanTier,
      auto_pilot_patrol_limit: newLimit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('plan_tier, auto_pilot_patrol_limit')
    .single();

  if (error) {
    console.error('Error in atomic plan update:', error);
    throw error;
  }

  try {
    await supabase
      .from('auto_pilot_limit_audit')
      .insert({
        user_id: userId,
        changed_by: null,
        old_limit: data?.auto_pilot_patrol_limit ?? 3,
        new_limit: newLimit,
        reason: reason,
        metadata: metadata || null,
      });
  } catch (auditError) {
    console.error('Audit log insert failed (non-fatal):', auditError);
  }

  return {
    oldPlan: data?.plan_tier ?? 'unknown',
    oldLimit: data?.auto_pilot_patrol_limit ?? 3,
    newLimit,
  };
}

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { allowed } = rateLimit(`stripe-webhook:${ip}`);
    if (!allowed) {
        return new NextResponse('Too many requests', { status: 429 });
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('❌ STRIPE_WEBHOOK_SECRET env var not set');
        return new NextResponse('Webhook configuration error', { status: 500 });
    }

    if (!signature) {
        return new NextResponse('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ Webhook signature verification failed:', errorMsg);
        return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // EVENT: Checkout completed
    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;

        console.log(JSON.stringify({
            event: 'stripe_webhook',
            type: event.type,
            user_id: userId,
            subscription_id: subscriptionId,
            timestamp: new Date().toISOString(),
        }));

        if (!userId) {
            console.error('Checkout completed without user_id in metadata.');
            return new NextResponse('Missing user_id in metadata', { status: 400 });
        }

        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0].price.id;
            const interval = subscription.items.data[0].plan.interval;

            let creditsToAssign = 100;
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
                creditsToAssign = 800;
                planName = 'business';
            }

            const patrolLimit = getPatrolLimitForPlan(planName);

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
                    stripe_subscription_id: subscriptionId,
                    plan_tier: planName,
                    auto_pilot_patrol_limit: patrolLimit,
                    billing_interval: interval,
                    subscription_status: 'active',
                    next_credit_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    auto_pilot_enabled: true,
                    credits_total: creditsToAssign,
                    credits_used: 0,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) throw error;

            try {
                await supabaseAdmin
                    .from('auto_pilot_limit_audit')
                    .insert({
                        user_id: userId,
                        changed_by: null,
                        old_limit: 3,
                        new_limit: patrolLimit,
                        reason: 'checkout_completed',
                        metadata: { plan: planName, subscription_id: subscriptionId },
                    });
            } catch (auditError) {
                console.error('Audit log insert failed (non-fatal):', auditError);
            }

            console.log(`Checkout completed: user ${userId} upgraded to ${planName} with ${creditsToAssign} credits.`);

        } catch (dbError: any) {
            const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
            console.error('Error processing webhook:', errorMsg);
            return new NextResponse('Webhook processing failed', { status: 500 });
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

    // EVENT: Subscription deleted
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;

        console.log(JSON.stringify({
            event: 'stripe_webhook',
            type: event.type,
            subscription_id: subscriptionId,
            customer_id: customerId,
            timestamp: new Date().toISOString(),
        }));

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, plan_tier')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

        if (profileError || !profile) {
            console.error('Profile not found for subscription:', subscriptionId);
            return new NextResponse('Success', { status: 200 });
        }

        await atomicallyUpdatePlanAndLimit(
            supabaseAdmin,
            profile.id,
            'free',
            'subscription_cancelled',
            { subscription_id: subscriptionId }
        );

        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_status: 'inactive',
                next_credit_reset_at: null,
                auto_pilot_enabled: false,
                credits_total: 0,
                stripe_subscription_id: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

        console.log(`Subscription ${subscriptionId} cancelled. User ${profile.id} downgraded to Free.`);
    }

    // EVENT: Subscription updated (past_due, reactivation, cancellation)
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const customerId = subscription.customer as string;

        console.log(JSON.stringify({
            event: 'stripe_webhook',
            type: event.type,
            subscription_id: subscriptionId,
            customer_id: customerId,
            status: status,
            timestamp: new Date().toISOString(),
        }));

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
                console.log(`Subscription ${subscriptionId} PAST_DUE. Auto-Pilot disabled.`);
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
                console.log(`Subscription ${subscriptionId} reactivated. Auto-Pilot restored.`);
            } else if (status === 'canceled' || status === 'unpaid') {
                const { data: profile, error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .select('id, plan_tier')
                    .eq('stripe_subscription_id', subscriptionId)
                    .single();

                if (profileError || !profile) {
                    console.error('Profile not found for subscription:', subscriptionId);
                    return new NextResponse('Success', { status: 200 });
                }

                await atomicallyUpdatePlanAndLimit(
                    supabaseAdmin,
                    profile.id,
                    'free',
                    status === 'canceled' ? 'subscription_cancelled' : 'subscription_unpaid',
                    { subscription_id: subscriptionId, stripe_status: status }
                );

                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: 'inactive',
                        credits_total: 0,
                        auto_pilot_enabled: false,
                        stripe_subscription_id: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', profile.id);

                if (error) throw error;
                console.log(`Subscription ${subscriptionId} ${status}. User ${profile.id} downgraded to Free.`);
            } else {
                console.log(`customer.subscription.updated skipped: status ${status} no action required.`);
            }
        } catch (dbError: any) {
            console.error(`Error processing customer.subscription.updated: ${dbError.message}`);
            return new NextResponse('Database error', { status: 500 });
        }
    }

    // EVENT: Invoice payment failed
    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        const customerId = invoice.customer as string;

        console.log(JSON.stringify({
            event: 'stripe_webhook',
            type: event.type,
            subscription_id: subscriptionId,
            customer_id: customerId,
            timestamp: new Date().toISOString(),
        }));

        if (!subscriptionId) {
            console.error('invoice.payment_failed without subscriptionId.');
            return new NextResponse('Success', { status: 200 });
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, plan_tier, auto_pilot_patrol_limit')
            .eq('stripe_customer_id', customerId)
            .single();

        if (profileError || !profile) {
            console.error('Profile not found for customer:', customerId);
            return new NextResponse('Success', { status: 200 });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
            console.log(`Downgrading user ${profile.id} to free (subscription ${subscription.status})`);
            await atomicallyUpdatePlanAndLimit(
                supabaseAdmin,
                profile.id,
                'free',
                'payment_failed_downgrade',
                { subscription_id: subscriptionId, stripe_status: subscription.status }
            );
        }

        return new NextResponse('Success', { status: 200 });
    }

    return new NextResponse('Success', { status: 200 });
}
