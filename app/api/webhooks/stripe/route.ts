import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe, handleSubscriptionWebhook } from '@/lib/stripe/stripe'
import Stripe from 'stripe'
import { errorHandler } from '@/lib/errors/errorHandler'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 },
    )
  }

  try {
    await handleSubscriptionWebhook(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return errorHandler(error)
  }
}
