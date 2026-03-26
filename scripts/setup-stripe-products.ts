/**
 * Stripe Product/Price Setup Script
 *
 * Run once to create GolfGives products in Stripe.
 * Usage: npx tsx scripts/setup-stripe-products.ts
 *
 * Requires STRIPE_SECRET_KEY in .env.local
 */

import Stripe from 'stripe'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local')
  let stripeKey = process.env.STRIPE_SECRET_KEY

  // Try to read from .env.local if not in environment
  if (!stripeKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const match = envContent.match(/STRIPE_SECRET_KEY=(.+)/)
    if (match) stripeKey = match[1].trim()
  }

  if (!stripeKey || stripeKey.startsWith('sk_test_your')) {
    console.error('❌ Set STRIPE_SECRET_KEY in .env.local first')
    process.exit(1)
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' })

  console.log('🏌️ Setting up GolfGives Stripe products...\n')

  // Create Monthly product
  const monthlyProduct = await stripe.products.create({
    name: 'GolfGives Monthly',
    description: 'Monthly subscription — enter prize draws and support charities every month.',
    metadata: { plan: 'monthly' },
  })

  const monthlyPrice = await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 999, // £9.99 in pence
    currency: 'gbp',
    recurring: { interval: 'month' },
    metadata: { plan: 'monthly' },
  })

  console.log('✅ Monthly Product:', monthlyProduct.id)
  console.log('   Monthly Price ID:', monthlyPrice.id)
  console.log('   Amount: £9.99/month\n')

  // Create Yearly product
  const yearlyProduct = await stripe.products.create({
    name: 'GolfGives Yearly',
    description: 'Annual subscription — save 17% and get exclusive yearly tournaments.',
    metadata: { plan: 'yearly' },
  })

  const yearlyPrice = await stripe.prices.create({
    product: yearlyProduct.id,
    unit_amount: 9900, // £99 in pence
    currency: 'gbp',
    recurring: { interval: 'year' },
    metadata: { plan: 'yearly' },
  })

  console.log('✅ Yearly Product:', yearlyProduct.id)
  console.log('   Yearly Price ID:', yearlyPrice.id)
  console.log('   Amount: £99/year\n')

  console.log('─────────────────────────────────────────')
  console.log('Add these to your .env.local:')
  console.log(`STRIPE_PRICE_MONTHLY_ID=${monthlyPrice.id}`)
  console.log(`STRIPE_PRICE_YEARLY_ID=${yearlyPrice.id}`)
  console.log('─────────────────────────────────────────')
}

main().catch(console.error)
