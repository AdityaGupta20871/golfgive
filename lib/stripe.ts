import Stripe from 'stripe'

// ── Lazy-initialised Stripe instance ──────────────────────
// Don't throw at module load — defer to runtime so pages that
// don't use Stripe still work during development.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example for details.'
      )
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

export function getPriceId(plan: 'monthly' | 'yearly') {
  const priceId = PRICE_IDS[plan]

  if (!priceId || priceId.includes('placeholder') || !priceId.startsWith('price_')) {
    throw new Error(
      `STRIPE_PRICE_${plan.toUpperCase()}_ID is not configured with a real Stripe price id.`
    )
  }

  return priceId
}

// Re-export for backward compat (used as `stripe.xxx`)
// This is a getter, so it only throws when actually accessed.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// ── Product / Price configuration ──────────────────────────
export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY_ID || 'price_monthly_placeholder',
  yearly: process.env.STRIPE_PRICE_YEARLY_ID || 'price_yearly_placeholder',
} as const

export type PlanKey = keyof typeof PRICE_IDS
