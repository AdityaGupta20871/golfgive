'use client'
import { useState } from 'react'
import { Heart, Save, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const CHARITIES = [
  { id: 'cancer-research', name: 'Cancer Research UK' },
  { id: 'childrens-golf', name: "Children's Golf Foundation" },
  { id: 'veterans', name: 'Veterans on the Green' },
  { id: 'mental-health', name: 'Mental Health Fairways' },
  { id: 'golf-for-all', name: 'Golf for All Foundation' },
  { id: 'green-heart', name: 'Green Heart Initiative' },
]

interface Props {
  userId: string
  currentCharityId: string | null
  currentPercentage: number
}

export default function CharitySettings({ userId, currentCharityId, currentPercentage }: Props) {
  const [charityId, setCharityId] = useState(currentCharityId || '')
  const [percentage, setPercentage] = useState(currentPercentage || 10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ charity_id: charityId, charity_percentage: percentage }).eq('id', userId)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const currentCharity = CHARITIES.find(c => c.id === charityId)

  return (
    <div className="bg-[#162216] border border-[#243824] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-[#c9a84c]" />
        </div>
        <div>
          <div className="text-[#f5f0e8] font-bold">My Charity</div>
          <div className="text-xs text-[#a0b0a0]">Where your contribution goes</div>
        </div>
      </div>

      {currentCharity && (
        <div className="bg-[#c9a84c]/8 border border-[#c9a84c]/20 rounded-xl p-4 mb-5">
          <div className="text-xs text-[#c9a84c] mb-1">Currently Supporting</div>
          <div className="text-[#f5f0e8] font-bold">{currentCharity.name}</div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs text-[#a0b0a0] mb-2">Change Charity</label>
        <select
          value={charityId}
          onChange={(e) => setCharityId(e.target.value)}
          className="w-full bg-[#0d1a0d] border border-[#243824] rounded-xl px-4 py-3 text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]/50 text-sm"
        >
          <option value="">Select a charity…</option>
          {CHARITIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-[#a0b0a0]">Contribution Percentage</label>
          <span className="text-[#c9a84c] font-bold text-sm">{percentage}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={percentage}
          onChange={(e) => setPercentage(parseInt(e.target.value))}
          className="w-full accent-[#c9a84c]"
        />
        <div className="flex justify-between text-xs text-[#a0b0a0] mt-1">
          <span>10% (min)</span><span>100%</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#c9a84c] text-[#1a2e1a] hover:bg-[#dfc06a]'
        }`}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? '✓ Saved!' : <><Save className="w-4 h-4" /> Save Preferences</>}
      </motion.button>
    </div>
  )
}
