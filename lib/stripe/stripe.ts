import { supabaseAdmin } from '@/lib/database/supabase';
import { SubscriptionPlan, PLAN_CONFIGS } from '@/types';
import Stripe from 'stripe'
import {
  addMonthlyCredits,
  getPlanFromPriceId,
  updateTeamSubscription,
} from './actions'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_dummy',
  {
    apiVersion: '2023-10-16',
    typescript: true,
  },
)

export async function createStripeCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  })

  return customer
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  teamId: string,
  successUrl: string,
  cancelUrl: string,
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      team_id: teamId,
    },
  })

  return session
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function handleSubscriptionWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      )
      break

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const teamId = session.metadata?.team_id;
  if (!teamId) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );

  await updateTeamSubscription(teamId, subscription);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string,
    );
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('team_id, plan')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (existingSubscription) {
      const plan = existingSubscription.plan as SubscriptionPlan;
      await addMonthlyCredits(existingSubscription.team_id, plan);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { data: subscriptionData } = await supabaseAdmin
    .from('subscriptions')
    .select('team_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (subscriptionData) {
    await updateTeamSubscription(subscriptionData.team_id, subscription);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    return;
  }

  // Downgrade to free plan
  const { data: subscriptionData } = await supabaseAdmin
    .from('subscriptions')
    .select('team_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (subscriptionData) {
    await supabaseAdmin
      .from('teams')
      .update({
        plan: SubscriptionPlan.FREE,
        max_credits: PLAN_CONFIGS[SubscriptionPlan.FREE].credits,
        credits: Math.min(PLAN_CONFIGS[SubscriptionPlan.FREE].credits, 0), // Don't exceed free plan limits
      })
      .eq('id', subscriptionData.team_id);
  }
}

export async function getUsageForBilling(
  teamId: string,
  startDate: Date,
  endDate: Date,
) {
  const { data: usage } = await supabaseAdmin
    .from('api_usage')
    .select('credits_used, created_at')
    .eq('team_id', teamId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const totalCredits =
    usage?.reduce((sum, record) => sum + record.credits_used, 0) || 0
  const dailyUsage =
    usage?.reduce(
      (acc, record) => {
        const date = new Date(record.created_at).toDateString()
        acc[date] = (acc[date] || 0) + record.credits_used
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  return {
    totalCredits,
    dailyUsage,
    records: usage || [],
  }
}
