'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, CheckCircle, XCircle, CreditCard, Loader2, Check,
  AlertCircle, RefreshCw
} from 'lucide-react'

interface Winner {
  id: string
  draw_id: string
  match_type: '3' | '4' | '5'
  prize_amount: number
  payment_status: 'pending' | 'paid' | 'rejected'
  winner: { id: string; name: string; email: string } | null
  draw: { id: string; month: number; year: number; status: string } | null
}

const matchLabel: Record<string, { label: string; color: string; bg: string }> = {
  '5': { label: 'Jackpot (5-match)', color: '#c9a84c', bg: 'bg-[#c9a84c]/10 border-[#c9a84c]/30' },
  '4': { label: 'Gold (4-match)', color: '#dfc06a', bg: 'bg-[#dfc06a]/10 border-[#dfc06a]/30' },
  '3': { label: 'Bronze (3-match)', color: '#a8883a', bg: 'bg-[#a8883a]/10 border-[#a8883a]/30' },
}

const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchWinners = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/winners')
      const json = await res.json()
      if (json.data) {
        setWinners(json.data)
      } else {
        setError(json.error || 'Failed to load winners')
      }
    } catch {
      setError('Failed to fetch winners')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchWinners() }, [fetchWinners])

  const handleAction = async (resultId: string, action: 'approve' | 'reject') => {
    setProcessing(resultId)
    try {
      const res = await fetch('/api/admin/winners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, action }),
      })
      const json = await res.json()
      if (json.success) {
        setWinners(prev =>
          prev.map(w =>
            w.id === resultId
              ? { ...w, payment_status: json.payment_status }
              : w
          )
        )
      }
    } catch {
      // silently fail
    }
    setProcessing(null)
  }

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
          <h1 className="text-2xl font-black text-[#f5f0e8]">Winners</h1>
          <p className="text-[#a0b0a0] text-sm mt-1">Verify and manage prize payouts</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchWinners() }}
          className="flex items-center gap-2 bg-[#162216] border border-[#243824] text-[#a0b0a0] px-4 py-2 rounded-xl text-sm hover:text-[#f5f0e8] transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Pending verification alert */}
      {winners.some(w => w.payment_status === 'pending') && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="text-yellow-400 text-sm">
            <strong>{winners.filter(w => w.payment_status === 'pending').length} winner(s)</strong> awaiting verification.
          </div>
        </div>
      )}

      {winners.length === 0 && !error ? (
        <div className="text-center py-16 text-[#a0b0a0]">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No winners yet. Run a draw to generate results.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map((winner, i) => {
            const match = matchLabel[winner.match_type] || matchLabel['3']
            const monthYear = winner.draw
              ? `${monthNames[winner.draw.month]} ${winner.draw.year}`
              : 'Unknown'

            return (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-[#162216] border border-[#243824] rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  {/* Winner info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] font-black text-lg flex-shrink-0">
                      {winner.winner?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="text-[#f5f0e8] font-bold">{winner.winner?.name || 'Unknown'}</div>
                      <div className="text-[#a0b0a0] text-sm">{winner.winner?.email || ''}</div>
                      <div className="text-xs text-[#a0b0a0] mt-0.5">{monthYear}</div>
                    </div>
                  </div>

                  {/* Match type */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${match.bg}`} style={{ color: match.color }}>
                    <Trophy className="w-3.5 h-3.5" />
                    {match.label}
                  </div>

                  {/* Prize */}
                  <div className="text-right">
                    <div className="text-xs text-[#a0b0a0]">Prize Amount</div>
                    <div className="text-xl font-black text-[#c9a84c]">£{Number(winner.prize_amount).toFixed(2)}</div>
                  </div>

                  {/* Payment status */}
                  <div>
                    {winner.payment_status === 'paid' ? (
                      <span className="flex items-center gap-1.5 bg-green-500/15 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Check className="w-3 h-3" /> Paid
                      </span>
                    ) : winner.payment_status === 'rejected' ? (
                      <span className="flex items-center gap-1.5 bg-red-500/15 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-yellow-500/15 text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {winner.payment_status === 'pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAction(winner.id, 'approve')}
                          disabled={processing === winner.id}
                          className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-400 px-3 py-2 rounded-xl text-xs font-medium"
                        >
                          {processing === winner.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAction(winner.id, 'reject')}
                          disabled={processing === winner.id}
                          className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-medium"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
