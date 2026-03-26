'use client'
import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const infoMessage = searchParams.get('message') === 'check-email'
    ? 'Please check your email to confirm your account before signing in.'
    : ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const redirectToParam = searchParams.get('redirectTo')

      if (redirectToParam) {
        router.push(redirectToParam)
        router.refresh()
        return
      }

      try {
        const redirectRes = await fetch('/api/auth/redirect', { cache: 'no-store' })
        const redirectData = await redirectRes.json() as { redirectTo?: string }
        router.push(redirectData.redirectTo || '/dashboard')
      } catch {
        router.push('/dashboard')
      }

      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1a0d] flex items-center justify-center px-6">
      {/* Background */}
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
        className="relative w-full max-w-md"
      >
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
          <h1 className="text-3xl font-black text-[#f5f0e8] mb-2">Welcome back</h1>
          <p className="text-[#a0b0a0]">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-[#162216] border border-[#243824] rounded-2xl p-8">
          {infoMessage && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-6 text-blue-300 text-sm">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl pl-11 pr-12 py-3.5 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0b0a0] hover:text-[#f5f0e8]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-[#c9a84c] hover:text-[#dfc06a] transition-colors">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-[#a0b0a0] text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#c9a84c] font-semibold hover:text-[#dfc06a] transition-colors">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1a0d]" />}>
      <LoginContent />
    </Suspense>
  )
}
