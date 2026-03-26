'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Edit3, CheckCircle, XCircle, MoreVertical, Filter } from 'lucide-react'

const MOCK_USERS = [
  { id: '1', name: 'James Hartley', email: 'james.h@email.com', status: 'active', plan: 'yearly', charity: 'Cancer Research UK', joined: '12 Jan 2026', scores: 5 },
  { id: '2', name: 'Sarah Mitchell', email: 'sarah.m@email.com', status: 'active', plan: 'monthly', charity: 'Veterans on the Green', joined: '3 Feb 2026', scores: 3 },
  { id: '3', name: 'Tom Richardson', email: 'tom.r@email.com', status: 'active', plan: 'monthly', charity: "Children's Golf Foundation", joined: '18 Feb 2026', scores: 4 },
  { id: '4', name: 'Emma Clarke', email: 'emma.c@email.com', status: 'inactive', plan: null, charity: 'Mental Health Fairways', joined: '22 Jan 2026', scores: 0 },
  { id: '5', name: 'Oliver Bennett', email: 'oliver.b@email.com', status: 'active', plan: 'yearly', charity: 'Cancer Research UK', joined: '9 Mar 2026', scores: 2 },
  { id: '6', name: 'Charlotte Evans', email: 'charlotte.e@email.com', status: 'past_due', plan: 'monthly', charity: 'Golf for All Foundation', joined: '1 Feb 2026', scores: 1 },
  { id: '7', name: 'Liam Foster', email: 'liam.f@email.com', status: 'active', plan: 'monthly', charity: 'Green Heart Initiative', joined: '14 Mar 2026', scores: 5 },
  { id: '8', name: 'Isabella Wood', email: 'isabella.w@email.com', status: 'active', plan: 'yearly', charity: 'Veterans on the Green', joined: '28 Jan 2026', scores: 5 },
]

const statusColor: Record<string, string> = {
  active: 'bg-green-500/15 text-green-400',
  inactive: 'bg-[#243824] text-[#a0b0a0]',
  past_due: 'bg-red-500/15 text-red-400',
  cancelled: 'bg-orange-500/15 text-orange-400',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#f5f0e8]">Users</h1>
          <p className="text-[#a0b0a0] text-sm mt-1">{MOCK_USERS.length} total members</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0b0a0]" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#162216] border border-[#243824] rounded-xl pl-11 pr-4 py-2.5 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#a0b0a0]" />
          {['all', 'active', 'inactive', 'past_due'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                filter === s
                  ? 'bg-[#c9a84c] text-[#1a2e1a]'
                  : 'bg-[#162216] border border-[#243824] text-[#a0b0a0] hover:text-[#f5f0e8]'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#162216] border border-[#243824] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#243824]">
                {['Name', 'Email', 'Status', 'Plan', 'Charity', 'Scores', 'Joined', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#a0b0a0] uppercase tracking-wide px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2e1a]">
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-[#1a2e1a]/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] font-bold text-xs flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-[#f5f0e8] text-sm font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#a0b0a0] text-sm">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[user.status]}`}>
                      {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#a0b0a0] text-sm capitalize">{user.plan || '—'}</td>
                  <td className="px-5 py-4 text-[#a0b0a0] text-sm max-w-[140px] truncate">{user.charity}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, s) => (
                        <div key={s} className={`w-2.5 h-2.5 rounded-full ${s < user.scores ? 'bg-[#c9a84c]' : 'bg-[#243824]'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#a0b0a0] text-xs">{user.joined}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                      className="text-[#a0b0a0] hover:text-[#c9a84c] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#a0b0a0]">No users match your search.</div>
        )}
      </div>
    </div>
  )
}
