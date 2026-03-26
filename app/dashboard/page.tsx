'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy, Clock, DollarSign, LogOut, LayoutDashboard,
  Heart, Users, ChevronRight, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'
import ScoreWidget from '@/components/dashboard/ScoreWidget'
import CharitySettings from '@/components/dashboard/CharitySettings'
import { format, addMonths, endOfMonth } from 'date-fns'

interface UserData {
  id: string
  name: string
  email: string
  subscription_status: string
  subscription_plan: string | null
  charity_id: string | null
  charity_percentage: number
}

interface Score {
  id: string
  score: number
  date: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }

    const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
    if (!userData) {
      // Self-heal missing profile rows (common when legacy users exist only in auth.users)
      const fallbackUser = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Golfer',
        email: authUser.email || `${authUser.id}@placeholder.local`,
        subscription_status: 'inactive',
        subscription_plan: null,
        charity_id: null,
        charity_percentage: 10,
      }

      await supabase.from('users').upsert(fallbackUser, { onConflict: 'id' })
      setUser(fallbackUser)
    } else {
      setUser(userData)
    }

    const { data: scoreData } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setScores(scoreData || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1a0d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
      </div>
    )
  }

  const renewalDate = format(endOfMonth(new Date()), 'MMMM d, yyyy')
  const drawCountdown = format(endOfMonth(new Date()), 'MMMM d, yyyy')

  return (
    <div className="min-h-screen bg-[#0d1a0d]">
      {/* Sidebar + content layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 min-h-screen bg-[#0a140a] border-r border-[#162216] flex-col fixed left-0 top-0 bottom-0">
          <div className="p-6 border-b border-[#162216]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8883a] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#1a2e1a]" />
              </div>
              <span className="text-lg font-bold text-[#f5f0e8]">Golf<span className="text-[#c9a84c]">Gives</span></span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
              { icon: Heart, label: 'Charities', href: '/charities', active: false },
              { icon: Trophy, label: 'Prize Draws', href: '/dashboard', active: false },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20'
                    : 'text-[#a0b0a0] hover:bg-[#162216] hover:text-[#f5f0e8]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-[#162216]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#f5f0e8] truncate">{user?.name}</div>
                <div className="text-xs text-[#a0b0a0] truncate">{user?.email}</div>
              </div>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-xs text-[#a0b0a0] hover:text-red-400 transition-colors w-full">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a140a]/95 backdrop-blur border-b border-[#162216] px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8883a] flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-[#1a2e1a]" />
            </div>
            <span className="font-bold text-[#f5f0e8]">Golf<span className="text-[#c9a84c]">Gives</span></span>
          </Link>
          <button onClick={handleSignOut} className="text-[#a0b0a0] hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Main content */}
        <main className="lg:ml-64 flex-1 p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl lg:text-3xl font-black text-[#f5f0e8] mb-1">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-[#a0b0a0]">Here&apos;s your GolfGives overview for {format(new Date(), 'MMMM yyyy')}</p>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Draws Entered', value: '3', icon: Trophy, color: '#c9a84c' },
              { label: 'Total Winnings', value: '£0', icon: DollarSign, color: '#dfc06a' },
              { label: 'Scores Logged', value: `${scores.length}/5`, icon: Users, color: '#c9a84c' },
              { label: 'Draw Closes', value: '7 days', icon: Clock, color: '#a8883a' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#162216] border border-[#243824] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-[#a0b0a0] uppercase tracking-wide">{stat.label}</div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#f5f0e8]">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left col: subscription + participation */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SubscriptionCard
                  status={user?.subscription_status || 'inactive'}
                  plan={user?.subscription_plan || null}
                  renewalDate={renewalDate}
                />
              </motion.div>

              {/* Participation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[#162216] border border-[#243824] rounded-2xl p-6"
              >
                <div className="text-[#f5f0e8] font-bold mb-4">Participation</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#a0b0a0] text-sm">Draws entered</span>
                    <span className="text-[#f5f0e8] font-bold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#a0b0a0] text-sm">Current draw closes</span>
                    <span className="text-[#c9a84c] font-bold text-sm">{drawCountdown}</span>
                  </div>
                  <div className="pt-3 border-t border-[#243824]">
                    <div className="text-xs text-[#a0b0a0] mb-2">Draw Entry Status</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">Entered for March 2026</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Winnings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#162216] border border-[#243824] rounded-2xl p-6"
              >
                <div className="text-[#f5f0e8] font-bold mb-4">Winnings</div>
                <div className="text-3xl font-black text-[#c9a84c] mb-1">£0.00</div>
                <div className="text-xs text-[#a0b0a0] mb-4">Total lifetime winnings</div>
                <div className="bg-[#0d1a0d] rounded-xl p-3 text-center">
                  <p className="text-[#a0b0a0] text-xs">No winnings yet — keep playing!</p>
                </div>
              </motion.div>
            </div>

            {/* Center: score widget */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ScoreWidget
                scores={scores}
                onScoreAdded={fetchData}
              />
            </motion.div>

            {/* Right: charity settings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <CharitySettings
                userId={user?.id || ''}
                currentCharityId={user?.charity_id || null}
                currentPercentage={user?.charity_percentage || 10}
              />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
