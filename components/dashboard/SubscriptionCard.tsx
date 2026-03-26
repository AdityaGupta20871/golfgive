'use client'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Calendar, CreditCard, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
  status: string
  plan: string | null
  renewalDate?: string
}

export default function SubscriptionCard({ status, plan, renewalDate }: Props) {
  const isActive = status === 'active'

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 ${
      isActive
        ? 'bg-gradient-to-br from-[#1a2e1a] to-[#162216] border-[#c9a84c]/30'
        : 'bg-[#162216] border-[#243824]'
    }`}>
      {isActive && (
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#c9a84c]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-[#a0b0a0] uppercase tracking-widest mb-1">Subscription</div>
          <div className="text-xl font-black text-[#f5f0e8]">
            {plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` : 'No Active Plan'}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
        }`}>
          {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {isActive ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {isActive && renewalDate && (
        <div className="flex items-center gap-2 text-sm text-[#a0b0a0] mb-5">
          <Calendar className="w-4 h-4 text-[#c9a84c]" />
          <span>Renews {renewalDate}</span>
        </div>
      )}

      {!isActive && (
        <div className="mb-5">
          <p className="text-[#a0b0a0] text-sm mb-3">Activate your subscription to enter draws and support charities.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#1a2e1a] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#dfc06a] transition-colors"
          >
            <CreditCard className="w-4 h-4" /> Subscribe Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {isActive && (
        <div className="flex items-center justify-between pt-4 border-t border-[#243824]">
          <span className="text-xs text-[#a0b0a0]">Price</span>
          <span className="text-[#c9a84c] font-bold text-sm">
            {plan === 'monthly' ? '£9.99/mo' : '£89.99/yr'}
          </span>
        </div>
      )}
    </div>
  )
}
