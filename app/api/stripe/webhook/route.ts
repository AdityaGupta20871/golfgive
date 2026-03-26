import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

// ── Idempotency: track processed event IDs ─────────────────
// In production, use a DB table or Redis. This in-memory set is
// acceptable for single-instance deployments / serverless with
// short lifetime.
const processedEvents = new Set<string>()

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signature verification failed'
    console.error('Webhook signature error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // ── Idempotency check ────────────────────────────────────
  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true, skipped: true })
  }
  processedEvents.add(event.id)

  // Prune old events to prevent memory leak (keep last 1000)
  if (processedEvents.size > 1000) {
    const iter = processedEvents.values()
    for (let i = 0; i < 500; i++) {
      processedEvents.delete(iter.next().value!)
    }
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      // ── Checkout completed ──────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan || 'monthly'

        if (userId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_plan: plan,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId)
        }
        break
      }

      // ── Subscription cancelled ──────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)

        if (users && users.length > 0) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'cancelled',
            })
            .eq('id', users[0].id)
        }
        break
      }

      // ── Payment failed ──────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

        if (customerId) {
          const { data: users } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)

          if (users && users.length > 0) {
            await supabase
              .from('users')
              .update({
                subscription_status: 'past_due',
              })
              .eq('id', users[0].id)
          }
        }
        break
      }

      default:
        // Unhandled event type — log and ignore
        console.log(`Unhandled Stripe event: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
