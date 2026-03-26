import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_IDS, PlanKey, getPriceId } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { plan } = body as { plan?: PlanKey }

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "monthly" or "yearly".' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up or create Stripe customer
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single()

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email || user.email || '',
        name: userData?.name || '',
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create checkout session
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: getPriceId(plan),
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
