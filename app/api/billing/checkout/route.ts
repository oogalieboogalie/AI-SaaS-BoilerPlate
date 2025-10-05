import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database/supabase'
import {
  createCheckoutSession,
  createStripeCustomer,
} from '@/lib/stripe/stripe'
import { PLAN_CONFIGS, SubscriptionPlan } from '@/types'
import { z } from 'zod'

const checkoutSchema = z.object({
  teamId: z.string().uuid(),
  plan: z.nativeEnum(SubscriptionPlan),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { teamId, plan } = checkoutSchema.parse(body)

    // Verify user has access to the team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single()

    if (
      !teamMember ||
      (teamMember.role !== 'owner' && teamMember.role !== 'admin')
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      )
    }

    // Get team details
    const { data: team } = await supabase
      .from('teams')
      .select('name, owner_id')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get user details
    const { data: userDetails } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    if (!userDetails) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if team already has a subscription
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('team_id', teamId)
      .single()

    let customerId = subscription?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createStripeCustomer(
        userDetails.email,
        `${userDetails.name} (${team.name})`,
      )
      customerId = customer.id

      // Save customer ID
      await supabase.from('subscriptions').upsert({
        team_id: teamId,
        stripe_customer_id: customerId,
      })
    }

    const planConfig = PLAN_CONFIGS[plan]
    if (!planConfig.stripe_price_id) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 },
      )
    }

    // Create checkout session
    const session = await createCheckoutSession(
      customerId,
      planConfig.stripe_price_id,
      teamId,
      `${request.nextUrl.origin}/dashboard/billing?success=true`,
      `${request.nextUrl.origin}/dashboard/billing?canceled=true`,
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      )
    }

    console.error('Error in POST /api/billing/checkout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
