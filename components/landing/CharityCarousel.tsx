'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { ChevronLeft, ChevronRight, Heart, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const charities = [
  {
    name: 'Cancer Research UK',
    category: 'Health',
    description: 'The world\'s largest independent cancer research organisation, dedicated to saving lives through research, diagnosis, and treatment.',
    event: 'Charity Golf Day — Apr 2026',
    raised: '£24,800',
    color: '#c9a84c',
  },
  {
    name: "Children's Golf Foundation",
    category: 'Youth',
    description: 'Getting underprivileged kids onto the fairway and into education. Through golf, we unlock potential and transform futures.',
    event: 'Junior Open Day — May 2026',
    raised: '£18,200',
    color: '#dfc06a',
  },
  {
    name: 'Veterans on the Green',
    category: 'Veterans',
    description: 'Supporting military veterans with therapy, community, and competitive golf programmes that rebuild confidence and camaraderie.',
    event: 'Veterans Cup — Jun 2026',
    raised: '£31,400',
    color: '#c9a84c',
  },
  {
    name: 'Mental Health Fairways',
    category: 'Wellbeing',
    description: 'Using golf as a mental health intervention — open days, peer support groups, and structured programmes for lasting recovery.',
    event: 'Mind & Golf Retreat — Mar 2026',
    raised: '£15,600',
    color: '#dfc06a',
  },
]

export default function CharityCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  const next = () => setActiveIndex((prev) => (prev + 1) % charities.length)
  const prev = () => setActiveIndex((prev) => (prev - 1 + charities.length) % charities.length)

  const charity = charities[activeIndex]

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(26,46,26,0.6),transparent)]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">Featured Charities</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#f5f0e8] mt-3">
            Your game,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#dfc06a]">
              their hope
            </span>
          </h2>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Card */}
          <AnimatedSection>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#162216] border border-[#243824] rounded-3xl p-8"
                >
                  {/* Category badge */}
                  <span className="inline-block bg-[#c9a84c]/15 text-[#c9a84c] text-xs font-semibold px-3 py-1 rounded-full mb-6">
                    {charity.category}
                  </span>

                  {/* Charity icon placeholder */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-[#c9a84c]" />
                  </div>

                  <h3 className="text-2xl font-black text-[#f5f0e8] mb-4">{charity.name}</h3>
                  <p className="text-[#a0b0a0] leading-relaxed mb-6">{charity.description}</p>

                  <div className="flex items-center gap-2 text-sm text-[#a0b0a0] mb-6">
                    <Calendar className="w-4 h-4 text-[#c9a84c]" />
                    <span>{charity.event}</span>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[#243824]">
                    <div>
                      <div className="text-xs text-[#a0b0a0] mb-1">Total Raised via GolfGives</div>
                      <div className="text-2xl font-black text-[#c9a84c]">{charity.raised}</div>
                    </div>
                    <Link
                      href="/charities"
                      className="inline-flex items-center gap-2 text-[#c9a84c] text-sm font-semibold hover:gap-3 transition-all"
                    >
                      View Profile <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </AnimatedSection>

          {/* Controls + dots */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col gap-8">
              {/* Dot list */}
              <div className="flex flex-col gap-3">
                {charities.map((c, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                      i === activeIndex
                        ? 'bg-[#162216] border border-[#c9a84c]/30'
                        : 'border border-transparent hover:bg-[#162216]/50'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === activeIndex ? 'bg-[#c9a84c]' : 'bg-[#2d4a2d]'
                      }`}
                    />
                    <span className={`font-semibold text-sm ${i === activeIndex ? 'text-[#f5f0e8]' : 'text-[#a0b0a0]'}`}>
                      {c.name}
                    </span>
                    {i === activeIndex && (
                      <span className="ml-auto text-xs text-[#c9a84c] font-medium">{c.raised}</span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-3">
                <button
                  onClick={prev}
                  className="w-12 h-12 rounded-full border border-[#243824] flex items-center justify-center text-[#a0b0a0] hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="w-12 h-12 rounded-full border border-[#243824] flex items-center justify-center text-[#a0b0a0] hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <Link
                href="/charities"
                className="inline-flex items-center gap-2 text-[#c9a84c] font-semibold hover:gap-4 transition-all"
              >
                Browse All Charities <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
