'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trophy, Mail, Lock, User, Heart, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CHARITIES = [
  { id: 'cancer-research', name: 'Cancer Research UK' },
  { id: 'childrens-golf', name: "Children's Golf Foundation" },
  { id: 'veterans', name: 'Veterans on the Green' },
  { id: 'mental-health', name: 'Mental Health Fairways' },
  { id: 'golf-for-all', name: 'Golf for All Foundation' },
  { id: 'green-heart', name: 'Green Heart Initiative' },
]

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '£9.99', period: '/month', badge: '' },
  { id: 'yearly', label: 'Yearly', price: '£89.99', period: '/year', badge: 'Save 25%' },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [charityId, setCharityId] = useState('')
  const [plan, setPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!charityId) { setError('Please select a charity'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        email,
        subscription_status: 'inactive',
        subscription_plan: plan,
        charity_id: null,
        charity_percentage: 10,
      })

      if (profileError) {
        setError(`Account created, but profile setup failed: ${profileError.message}`)
        setLoading(false)
        return
      }
    }

    if (!data.session) {
      router.push('/login?message=check-email')
      router.refresh()
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0d1a0d] flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(201,168,76,0.08),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8883a] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#1a2e1a]" />
            </div>
            <span className="text-2xl font-bold text-[#f5f0e8]">
              Golf<span className="text-[#c9a84c]">Gives</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-[#f5f0e8] mb-2">Create your account</h1>
          <p className="text-[#a0b0a0]">Join thousands of golfers making a difference</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-[#c9a84c] text-[#1a2e1a]'
                    : step > s
                    ? 'bg-[#c9a84c]/30 text-[#c9a84c]'
                    : 'bg-[#243824] text-[#a0b0a0]'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-px ${step > s ? 'bg-[#c9a84c]/50' : 'bg-[#243824]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#162216] border border-[#243824] rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={(e) => { e.preventDefault(); setStep(2) }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-[#f5f0e8] mb-1">Your details</h2>
              <p className="text-[#a0b0a0] text-sm mb-4">Tell us about yourself</p>

              <div>
                <label className="block text-sm font-medium text-[#f5f0e8] mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0b0a0]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    required
                    className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl pl-11 pr-4 py-3.5 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f5f0e8] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0b0a0]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl pl-11 pr-4 py-3.5 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f5f0e8] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0b0a0]" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl pl-11 pr-12 py-3.5 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0b0a0]">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSignup}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold text-[#f5f0e8] mb-1">Choose your cause</h2>
              <p className="text-[#a0b0a0] text-sm mb-4">Select a charity to support with your subscription</p>

              <div className="grid grid-cols-2 gap-3">
                {CHARITIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCharityId(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all text-sm ${
                      charityId === c.id
                        ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50 text-[#f5f0e8]'
                        : 'bg-[#0d1a0d] border-[#243824] text-[#a0b0a0] hover:border-[#c9a84c]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className={`w-3.5 h-3.5 ${charityId === c.id ? 'text-[#c9a84c]' : 'text-[#a0b0a0]'}`} />
                      {charityId === c.id && <Check className="w-3.5 h-3.5 text-[#c9a84c] ml-auto" />}
                    </div>
                    <div className="font-medium leading-tight">{c.name}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f5f0e8] mb-3">Subscription Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlan(p.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative ${
                        plan === p.id
                          ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50'
                          : 'bg-[#0d1a0d] border-[#243824] hover:border-[#c9a84c]/30'
                      }`}
                    >
                      {p.badge && (
                        <span className="absolute -top-2 right-3 bg-[#c9a84c] text-[#1a2e1a] text-xs font-bold px-2 py-0.5 rounded-full">
                          {p.badge}
                        </span>
                      )}
                      <div className={`font-bold text-sm ${plan === p.id ? 'text-[#f5f0e8]' : 'text-[#a0b0a0]'}`}>{p.label}</div>
                      <div className={`text-xl font-black mt-1 ${plan === p.id ? 'text-[#c9a84c]' : 'text-[#f5f0e8]'}`}>
                        {p.price}<span className="text-sm font-normal text-[#a0b0a0]">{p.period}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#243824] text-[#a0b0a0] py-3.5 rounded-xl font-semibold hover:border-[#c9a84c]/30 transition-all"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !charityId}
                  className="flex-1 bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              </div>
            </motion.form>
          )}
        </div>

        <p className="text-center text-[#a0b0a0] text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#c9a84c] font-semibold hover:text-[#dfc06a] transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
