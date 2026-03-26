'use client'
import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Trophy, Check, ArrowRight, Loader2, AlertCircle, Star, Zap } from 'lucide-react'

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '£9.99',
    period: '/month',
    features: [
      'Enter monthly prize draws',
      'Support your chosen charity',
      'Track your Stableford scores',
      'Full dashboard access',
      'Cancel anytime',
    ],
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '£99',
    period: '/year',
    features: [
      'Everything in Monthly',
      'Save 17% vs monthly',
      'Priority draw entry',
      'Exclusive yearly tournaments',
      'Annual charity impact report',
    ],
    popular: true,
  },
]

// ── Inner component that reads search params (must be inside <Suspense>) ──
function PricingContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create checkout')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-[#0d1a0d] flex flex-col items-center justify-center px-6 py-16 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(201,168,76,0.08),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8883a] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#1a2e1a]" />
            </div>
            <span className="text-2xl font-bold text-[#f5f0e8]">
              Golf<span className="text-[#c9a84c]">Gives</span>
            </span>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-black text-[#f5f0e8] mb-3">
            Choose Your Plan
          </h1>
          <p className="text-[#a0b0a0] max-w-md mx-auto">
            Play golf, win prizes, and support charities that matter to you.
          </p>
        </div>

        {/* Subscription required alert */}
        {reason === 'subscription_required' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-8 max-w-lg mx-auto flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-400 text-sm">
              An active subscription is required to access your dashboard. Please choose a plan below.
            </p>
          </motion.div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.popular
                  ? 'bg-gradient-to-br from-[#1a2e1a] to-[#162216] border-[#c9a84c]/40 shadow-[0_0_40px_rgba(201,168,76,0.1)]'
                  : 'bg-[#162216] border-[#243824]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-[#c9a84c]" />
                  <h3 className="text-lg font-bold text-[#f5f0e8]">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#c9a84c]">{plan.price}</span>
                  <span className="text-[#a0b0a0] text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-[#f5f0e8]">
                    <Check className="w-4 h-4 text-[#c9a84c] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                    : 'bg-[#243824] text-[#f5f0e8] hover:bg-[#2d4a2d] border border-[#2d4a2d]'
                }`}
              >
                {loading === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Subscribe <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[#a0b0a0] text-sm mt-8">
          All plans include a 30% charity contribution from your subscription.{' '}
          <Link href="/" className="text-[#c9a84c] hover:text-[#dfc06a] transition-colors">
            Learn more
          </Link>
        </p>
      </div>
    </div>
  )
}

// ── Page export — wraps the inner component in Suspense ──────────────────────
export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1a0d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
