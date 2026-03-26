'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, Plus, Loader2, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface Score {
  id: string
  score: number
  date: string
  created_at: string
}

interface Props {
  scores: Score[]
  onScoreAdded: () => void
}

export default function ScoreWidget({ scores, onScoreAdded }: Props) {
  const [scoreVal, setScoreVal] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(scoreVal)
    if (val < 1 || val > 45) { setError('Score must be between 1 and 45'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !authUser) {
      setError('Please sign in again before submitting a score.')
      setLoading(false)
      return
    }

    const fallbackName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Golfer'
    const { error: profileError } = await supabase.from('users').upsert(
      {
        id: authUser.id,
        name: fallbackName,
        email: authUser.email || `${authUser.id}@placeholder.local`,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    if (profileError) {
      setError(`Profile setup failed: ${profileError.message}`)
      setLoading(false)
      return
    }

    const { error: err } = await supabase.from('scores').insert({
      user_id: authUser.id,
      score: val,
      date,
    })
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setScoreVal('')
      onScoreAdded()
      setTimeout(() => setSuccess(false), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#162216] border border-[#243824] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
          <Flag className="w-5 h-5 text-[#c9a84c]" />
        </div>
        <div>
          <div className="text-[#f5f0e8] font-bold">Submit Score</div>
          <div className="text-xs text-[#a0b0a0]">Stableford points (1–45)</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#a0b0a0] mb-1.5">Stableford Score</label>
            <input
              type="number"
              min={1}
              max={45}
              value={scoreVal}
              onChange={(e) => setScoreVal(e.target.value)}
              placeholder="e.g. 36"
              required
              className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#a0b0a0] mb-1.5">Date Played</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl px-4 py-3 text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            success
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-[#c9a84c] text-[#1a2e1a] hover:bg-[#dfc06a]'
          }`}
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.span key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Score Submitted!
              </motion.span>
            ) : loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <motion.span key="default" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Submit Score
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      {/* Score history */}
      <div className="mt-6 pt-5 border-t border-[#243824]">
        <div className="text-xs text-[#a0b0a0] uppercase tracking-widest mb-3">
          Recent Scores <span className="text-[#c9a84c]">{scores.length}/5</span>
        </div>
        {scores.length === 0 ? (
          <p className="text-[#a0b0a0] text-sm">No scores submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {scores.slice().reverse().map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#1a2e1a] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    i === 0 ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'bg-[#243824] text-[#a0b0a0]'
                  }`}>
                    {s.score}
                  </div>
                  <span className="text-xs text-[#a0b0a0]">
                    {format(new Date(s.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${i === 0 ? 'text-[#c9a84c]' : 'text-[#a0b0a0]'}`}>
                  {i === 0 ? 'Latest' : `#${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
