'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/landing/Footer'
import { Search, Heart, Calendar, ArrowRight, Filter } from 'lucide-react'

const CHARITIES = [
  { id: '1', name: 'Cancer Research UK', category: 'Health', description: 'The world\'s largest independent cancer research organisation. Every subscription drives vital research that saves lives across the UK and beyond.', event: 'Charity Golf Day — Apr 2026', raised: '£24,800', members: 842, featured: true },
  { id: '2', name: "Children's Golf Foundation", category: 'Youth', description: 'Getting underprivileged kids onto the fairway and into education. Through golf we unlock potential and transform futures one swing at a time.', event: 'Junior Open Day — May 2026', raised: '£18,200', members: 614, featured: true },
  { id: '3', name: 'Veterans on the Green', category: 'Veterans', description: 'Supporting military veterans with therapy, community and competitive golf programmes that rebuild confidence and camaraderie post-service.', event: 'Veterans Cup — Jun 2026', raised: '£31,400', members: 991, featured: true },
  { id: '4', name: 'Mental Health Fairways', category: 'Wellbeing', description: 'Using golf as a mental health intervention — open days, peer support groups, and structured programmes delivering lasting recovery.', event: 'Mind & Golf Retreat — Mar 2026', raised: '£15,600', members: 487, featured: false },
  { id: '5', name: 'Golf for All Foundation', category: 'Accessibility', description: 'Breaking barriers in golf — disability access, adaptive equipment, and inclusive tournaments open to everyone regardless of ability.', event: 'Adaptive Golf Day — Jul 2026', raised: '£9,200', members: 301, featured: false },
  { id: '6', name: 'Green Heart Initiative', category: 'Environment', description: 'Planting trees on golf courses and funding environmental restoration projects across the UK\'s most important green spaces.', event: 'Eco-Golf Week — Aug 2026', raised: '£7,400', members: 218, featured: false },
]

const CATEGORIES = ['All', 'Health', 'Youth', 'Veterans', 'Wellbeing', 'Accessibility', 'Environment']

export default function CharitiesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = CHARITIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = category === 'All' || c.category === category
    return matchesSearch && matchesCat
  })

  return (
    <div className="min-h-screen bg-[#0d1a0d]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,168,76,0.08),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-full px-4 py-2 mb-6"
          >
            <Heart className="w-4 h-4 text-[#c9a84c]" />
            <span className="text-[#c9a84c] text-sm font-medium">6 Charities — Growing</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-[#f5f0e8] mb-5"
          >
            Charity{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#dfc06a]">
              Directory
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#a0b0a0] text-lg max-w-xl mx-auto"
          >
            Choose the cause your subscription supports. Every swing counts.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[#0d1a0d]/90 backdrop-blur border-b border-[#162216]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0b0a0]" />
            <input
              type="text"
              placeholder="Search charities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#162216] border border-[#243824] rounded-xl pl-11 pr-4 py-2.5 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 text-sm"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[#a0b0a0]" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-[#c9a84c] text-[#1a2e1a]'
                    : 'bg-[#162216] border border-[#243824] text-[#a0b0a0] hover:border-[#c9a84c]/30 hover:text-[#f5f0e8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#a0b0a0]">No charities match your search.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((charity, i) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group"
              >
                <Link href={`/charities/${charity.id}`}>
                  <div className="bg-[#162216] border border-[#243824] rounded-2xl p-6 h-full flex flex-col hover:border-[#c9a84c]/30 hover:-translate-y-1 transition-all duration-300">
                    {charity.featured && (
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="bg-[#c9a84c]/15 text-[#c9a84c] text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
                      </div>
                    )}

                    {/* Charity icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center mb-4">
                      <Heart className="w-7 h-7 text-[#c9a84c]" />
                    </div>

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-[#a0b0a0] bg-[#243824] px-2.5 py-1 rounded-full">{charity.category}</span>
                      <span className="text-xs text-[#a0b0a0]">{charity.members} members</span>
                    </div>

                    <h3 className="text-lg font-black text-[#f5f0e8] mb-2 group-hover:text-[#c9a84c] transition-colors">
                      {charity.name}
                    </h3>
                    <p className="text-[#a0b0a0] text-sm leading-relaxed flex-1 mb-4">
                      {charity.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-[#a0b0a0] mb-4">
                      <Calendar className="w-3.5 h-3.5 text-[#c9a84c]" />
                      {charity.event}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#243824]">
                      <div>
                        <div className="text-xs text-[#a0b0a0]">Raised via GolfGives</div>
                        <div className="text-[#c9a84c] font-black">{charity.raised}</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#a0b0a0] group-hover:text-[#c9a84c] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
