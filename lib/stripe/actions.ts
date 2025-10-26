import { supabaseAdmin } from '@/lib/database/supabase';
import { PLAN_CONFIGS, SubscriptionPlan } from '@/types';
import Stripe from 'stripe';

export async function updateTeamSubscription(
  teamId: string,
  subscription: Stripe.Subscription,
) {
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
  if (!plan) throw new Error('Invalid plan selected');

  const { error } = await supabaseAdmin.from('subscriptions').upsert({
    team_id: teamId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan,
    status: subscription.status,
    current_period_start: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  if (error) throw error;

  await supabaseAdmin
    .from('teams')
    .update({
      plan,
      max_credits: PLAN_CONFIGS[plan].credits,
    })
    .eq('id', teamId);
}

export async function addMonthlyCredits(teamId: string, plan: SubscriptionPlan) {
  const { data: team } = await supabaseAdmin
    .from('teams')
    .select('owner_id')
    .eq('id', teamId)
    .single();

  if (!team) throw new Error('Team not found');

  await supabaseAdmin
    .from('teams')
    .update({
      credits: PLAN_CONFIGS[plan].credits,
    })
    .eq('id', teamId);

  await supabaseAdmin.from('credit_transactions').insert({
    team_id: teamId,
    user_id: team.owner_id,
    amount: PLAN_CONFIGS[plan].credits,
    type: 'purchase',
    description: `Monthly ${PLAN_CONFIGS[plan].name} plan credits`,
  });
}

export function getPlanFromPriceId(priceId: string): SubscriptionPlan | null {
  for (const [plan, config] of Object.entries(PLAN_CONFIGS)) {
    if (config.stripe_price_id === priceId) {
      return plan as SubscriptionPlan;
    }
  }
  return null;
}
