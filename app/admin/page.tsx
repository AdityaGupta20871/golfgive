'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Trophy, Heart, TrendingUp, DollarSign, Activity,
  ArrowUpRight, Loader2, BarChart3, RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  activeSubscribers: number
  currentPrizePool: number
  charityTotals: Record<string, number>
  drawHistory: Array<{
    id: string
    month: number
    year: number
    status: string
    draw_type: string
    jackpot_rollover: number
    totalWinners: number
    totalPrizesPaid: number
    fiveMatchCount: number
    fourMatchCount: number
    threeMatchCount: number
  }>
}

const monthNames = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      if (!json.error) {
        setData(json)
      }
    } catch {
      // fallback to mock data
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  // While loading or if no data, show mock/fallback
  const stats = [
    {
      label: 'Total Users',
      value: data ? data.totalUsers.toLocaleString() : '—',
      icon: Users,
      color: '#c9a84c',
    },
    {
      label: 'Active Subscribers',
      value: data ? data.activeSubscribers.toLocaleString() : '—',
      icon: Activity,
      color: '#dfc06a',
    },
    {
      label: 'Current Prize Pool',
      value: data ? `£${data.currentPrizePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—',
      icon: Trophy,
      color: '#c9a84c',
    },
    {
      label: 'Total Charities',
      value: data ? Object.keys(data.charityTotals).length.toString() : '—',
      icon: Heart,
      color: '#a8883a',
    },
    {
      label: 'Draws Completed',
      value: data ? data.drawHistory.filter(d => d.status === 'published').length.toString() : '—',
      icon: TrendingUp,
      color: '#c9a84c',
    },
    {
      label: 'Total Prizes Paid',
      value: data
        ? `£${data.drawHistory.reduce((s, d) => s + d.totalPrizesPaid, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : '—',
      icon: DollarSign,
      color: '#dfc06a',
    },
  ]

  const charityBreakdown = data
    ? Object.entries(data.charityTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([name, amount]) => ({
          name,
          amount: `£${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          pct: data.charityTotals
            ? Math.round((amount / Math.max(Object.values(data.charityTotals).reduce((s, v) => s + v, 0), 1)) * 100)
            : 0,
        }))
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#f5f0e8]">Analytics Overview</h1>
          <p className="text-[#a0b0a0] text-sm mt-1">Live platform performance metrics</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAnalytics() }}
          className="flex items-center gap-2 bg-[#162216] border border-[#243824] text-[#a0b0a0] px-4 py-2 rounded-xl text-sm hover:text-[#f5f0e8] transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#162216] border border-[#243824] rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#a0b0a0] uppercase tracking-wide">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#f5f0e8] mb-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Charity breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#162216] border border-[#243824] rounded-2xl p-6"
        >
          <div className="text-[#f5f0e8] font-bold mb-5">Charity Contributions</div>
          {charityBreakdown.length === 0 ? (
            <p className="text-[#a0b0a0] text-sm">No charity contributions recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {charityBreakdown.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-[#f5f0e8]">{c.name}</span>
                    <span className="text-sm font-bold text-[#c9a84c]">{c.amount}</span>
                  </div>
                  <div className="h-1.5 bg-[#243824] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Draw History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#162216] border border-[#243824] rounded-2xl p-6"
        >
          <div className="text-[#f5f0e8] font-bold mb-5">Draw History</div>
          {!data?.drawHistory || data.drawHistory.length === 0 ? (
            <p className="text-[#a0b0a0] text-sm">No draws completed yet.</p>
          ) : (
            <div className="space-y-3">
              {data.drawHistory.map((draw, i) => (
                <div key={draw.id} className="flex items-center gap-4 p-3 bg-[#0d1a0d] rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#f5f0e8]">
                      {monthNames[draw.month]} {draw.year}
                    </div>
                    <div className="text-xs text-[#a0b0a0]">
                      {draw.totalWinners} winner{draw.totalWinners !== 1 ? 's' : ''} • {draw.draw_type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#c9a84c]">
                      £{draw.totalPrizesPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      draw.status === 'published'
                        ? 'bg-green-500/15 text-green-400'
                        : draw.status === 'simulated'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {draw.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Prize pool breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#162216] border border-[#243824] rounded-2xl p-6 lg:col-span-2"
        >
          <div className="text-[#f5f0e8] font-bold mb-5">Prize Pool Breakdown</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: '5-Match Jackpot',
                pct: '40%',
                amount: data ? `£${(data.currentPrizePool * 0.4).toFixed(2)}` : '—',
                note: 'Rolls over if no winner',
              },
              {
                label: '4-Match Gold',
                pct: '35%',
                amount: data ? `£${(data.currentPrizePool * 0.35).toFixed(2)}` : '—',
                note: 'Split among 4-match winners',
              },
              {
                label: '3-Match Bronze',
                pct: '25%',
                amount: data ? `£${(data.currentPrizePool * 0.25).toFixed(2)}` : '—',
                note: 'Split among 3-match winners',
              },
            ].map((p, i) => (
              <div key={i} className="bg-[#0d1a0d] rounded-xl p-4 text-center">
                <div className="text-[#a0b0a0] text-xs mb-2">{p.label}</div>
                <div className="text-[#c9a84c] font-black text-xl mb-1">{p.amount}</div>
                <div className="text-[#f5f0e8] text-sm font-semibold mb-1">{p.pct}</div>
                <div className="text-[#a0b0a0] text-xs">{p.note}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
