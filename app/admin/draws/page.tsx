'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shuffle, Play, Send, ToggleLeft, ToggleRight, Loader2, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import type { DrawPreview } from '@/lib/draw-engine'

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
]

export default function AdminDrawsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [simulating, setSimulating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [preview, setPreview] = useState<DrawPreview | null>(null)
  const [error, setError] = useState('')
  const [published, setPublished] = useState(false)

  const runDraw = async (mode: 'simulate' | 'publish') => {
    const isPublish = mode === 'publish'
    isPublish ? setPublishing(true) : setSimulating(true)
    setError('')

    try {
      const res = await fetch('/api/admin/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, drawType, mode }),
      })
      const json = await res.json()
      if (json.success) {
        setPreview(json.data)
        if (isPublish) setPublished(true)
      } else {
        setError(json.error || 'Draw failed')
      }
    } catch {
      setError('Network error — please try again')
    }

    isPublish ? setPublishing(false) : setSimulating(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#f5f0e8]">Draw Management</h1>
        <p className="text-[#a0b0a0] text-sm mt-1">Configure, simulate, and publish monthly prize draws</p>
      </div>

      {/* Info card */}
      <div className="bg-[#c9a84c]/8 border border-[#c9a84c]/20 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#c9a84c] mt-0.5" />
          <div>
            <div className="text-[#f5f0e8] font-semibold text-sm mb-1">Prize Distribution Logic</div>
            <div className="text-[#a0b0a0] text-sm leading-relaxed">
              <strong className="text-[#f5f0e8]">Random draw:</strong> 5 random numbers (1-45) matched against users&apos; scores.&nbsp;
              <strong className="text-[#f5f0e8]">Algorithmic draw:</strong> Numbers weighted by least-frequent scores.
              5-match jackpot rolls over to next month if no qualifying winner is found.
            </div>
          </div>
        </div>
      </div>

      {/* Draw controls */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#162216] border border-[#243824] rounded-2xl p-6 mb-6"
      >
        <h3 className="text-[#f5f0e8] font-bold text-lg mb-4">Run a Draw</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Month */}
          <div>
            <label className="block text-xs text-[#a0b0a0] mb-1.5">Month</label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl px-4 py-3 text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]/50 text-sm"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs text-[#a0b0a0] mb-1.5">Year</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl px-4 py-3 text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]/50 text-sm"
            />
          </div>

          {/* Draw Type */}
          <div>
            <label className="block text-xs text-[#a0b0a0] mb-1.5">Draw Type</label>
            <button
              onClick={() => setDrawType(drawType === 'random' ? 'algorithmic' : 'random')}
              className="w-full flex items-center justify-center gap-2 bg-[#0d1a0d] border border-[#243824] rounded-xl px-4 py-3 text-[#f5f0e8] hover:border-[#c9a84c]/30 text-sm font-medium transition-all"
            >
              {drawType === 'random' ? (
                <><ToggleLeft className="w-5 h-5 text-[#c9a84c]" /> Random</>
              ) : (
                <><ToggleRight className="w-5 h-5 text-[#c9a84c]" /> Algorithmic</>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => runDraw('simulate')}
            disabled={simulating || publishing}
            className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500/25 transition-all disabled:opacity-60"
          >
            {simulating ? <><Loader2 className="w-4 h-4 animate-spin" /> Simulating…</> : <><Eye className="w-4 h-4" /> Simulate</>}
          </motion.button>

          {preview && !published && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => runDraw('publish')}
              disabled={publishing}
              className="flex items-center gap-2 bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
            >
              {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Send className="w-4 h-4" /> Publish Results</>}
            </motion.button>
          )}

          {published && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              <CheckCircle className="w-5 h-5" /> Results Published Successfully!
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview results */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Draw numbers */}
          <div className="bg-[#162216] border border-[#243824] rounded-2xl p-6">
            <div className="text-[#f5f0e8] font-bold mb-4">Draw Numbers</div>
            <div className="flex items-center gap-3 mb-6">
              {preview.drawNumbers.map((num, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.15, type: 'spring' }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#dfc06a] flex items-center justify-center text-[#1a2e1a] font-black text-xl shadow-lg"
                >
                  {num}
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-[#0d1a0d] rounded-xl p-3">
                <div className="text-[#a0b0a0] text-xs mb-1">Prize Pool</div>
                <div className="text-[#c9a84c] font-bold">£{preview.prizePool.toFixed(2)}</div>
              </div>
              <div className="bg-[#0d1a0d] rounded-xl p-3">
                <div className="text-[#a0b0a0] text-xs mb-1">Charity Share</div>
                <div className="text-green-400 font-bold">£{preview.charityContribution.toFixed(2)}</div>
              </div>
              <div className="bg-[#0d1a0d] rounded-xl p-3">
                <div className="text-[#a0b0a0] text-xs mb-1">Prizes Paid</div>
                <div className="text-[#f5f0e8] font-bold">£{preview.totalPrizesPaid.toFixed(2)}</div>
              </div>
              <div className="bg-[#0d1a0d] rounded-xl p-3">
                <div className="text-[#a0b0a0] text-xs mb-1">Jackpot Rollover</div>
                <div className="text-yellow-400 font-bold">£{preview.jackpotRollover.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Winners */}
          {[
            { key: 'fiveMatch' as const, label: '5-Match Jackpot Winners', color: '#c9a84c' },
            { key: 'fourMatch' as const, label: '4-Match Gold Winners', color: '#dfc06a' },
            { key: 'threeMatch' as const, label: '3-Match Bronze Winners', color: '#a8883a' },
          ].map(tier => (
            <div key={tier.key} className="bg-[#162216] border border-[#243824] rounded-2xl p-6">
              <div className="text-sm font-bold mb-3" style={{ color: tier.color }}>{tier.label}</div>
              {preview.winners[tier.key].length === 0 ? (
                <p className="text-[#a0b0a0] text-sm">No winners in this tier.</p>
              ) : (
                <div className="space-y-2">
                  {preview.winners[tier.key].map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#0d1a0d] rounded-xl">
                      <div>
                        <div className="text-[#f5f0e8] text-sm font-medium">{w.userName}</div>
                        <div className="text-xs text-[#a0b0a0]">{w.userEmail}</div>
                        <div className="text-xs text-[#a0b0a0] mt-1">
                          Matched: {w.matchedNumbers.join(', ')}
                        </div>
                      </div>
                      <div className="text-lg font-black" style={{ color: tier.color }}>
                        £{w.prizeAmount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {preview.noFiveMatchWinner && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 text-sm">
                No 5-match winner this draw. £{preview.jackpotRollover.toFixed(2)} rolls over to next month&apos;s jackpot.
              </span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
