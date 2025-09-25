import Stripe from 'stripe';
import { SubscriptionPlan, PLAN_CONFIGS } from '@/types';
import { supabaseAdmin } from '@/lib/database/supabase';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function createStripeCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  });
  
  return customer;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  teamId: string,
  successUrl: string,
  cancelUrl: string
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
  });
  
  return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session;
}

export async function handleSubscriptionWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const teamId = session.metadata?.team_id;
  if (!teamId) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
  
  if (!plan) return;

  // Update team subscription
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      team_id: teamId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan,
      status: subscription.status as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

  if (error) {
    console.error('Error updating subscription:', error);
    return;
  }

  // Update team plan and credits
  await supabaseAdmin
    .from('teams')
    .update({
      plan,
      max_credits: PLAN_CONFIGS[plan].credits,
      credits: PLAN_CONFIGS[plan].credits, // Reset credits on plan change
    })
    .eq('id', teamId);

  // Record credit transaction
  await supabaseAdmin
    .from('credit_transactions')
    .insert({
      team_id: teamId,
      user_id: teamId, // Use team owner, should be improved
      amount: PLAN_CONFIGS[plan].credits,
      type: 'purchase',
      description: `Monthly ${PLAN_CONFIGS[plan].name} plan credits`,
    });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('team_id, plan')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (existingSubscription) {
      const plan = existingSubscription.plan as SubscriptionPlan;
      
      // Add monthly credits
      await supabaseAdmin
        .from('teams')
        .update({
          credits: PLAN_CONFIGS[plan].credits, // Reset to max credits
        })
        .eq('id', existingSubscription.team_id);

      // Record credit transaction
      await supabaseAdmin
        .from('credit_transactions')
        .insert({
          team_id: existingSubscription.team_id,
          user_id: existingSubscription.team_id, // Should be team owner
          amount: PLAN_CONFIGS[plan].credits,
          type: 'purchase',
          description: `Monthly ${PLAN_CONFIGS[plan].name} plan credits`,
        });
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
  if (!plan) return;

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      plan,
      status: subscription.status as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    return;
  }

  // Update team plan and credits
  const { data: subscriptionData } = await supabaseAdmin
    .from('subscriptions')
    .select('team_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (subscriptionData) {
    await supabaseAdmin
      .from('teams')
      .update({
        plan,
        max_credits: PLAN_CONFIGS[plan].credits,
      })
      .eq('id', subscriptionData.team_id);
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

function getPlanFromPriceId(priceId: string): SubscriptionPlan | null {
  for (const [plan, config] of Object.entries(PLAN_CONFIGS)) {
    if (config.stripe_price_id === priceId) {
      return plan as SubscriptionPlan;
    }
  }
  return null;
}

export async function getUsageForBilling(teamId: string, startDate: Date, endDate: Date) {
  const { data: usage } = await supabaseAdmin
    .from('api_usage')
    .select('credits_used, created_at')
    .eq('team_id', teamId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const totalCredits = usage?.reduce((sum, record) => sum + record.credits_used, 0) || 0;
  const dailyUsage = usage?.reduce((acc, record) => {
    const date = new Date(record.created_at).toDateString();
    acc[date] = (acc[date] || 0) + record.credits_used;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalCredits,
    dailyUsage,
    records: usage || [],
  };
}