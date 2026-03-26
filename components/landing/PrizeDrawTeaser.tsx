'use client'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy, Clock, TrendingUp, ArrowRight } from 'lucide-react'

const prizes = [
  { match: '5-Match', label: 'Jackpot', amount: '£24,100', split: '40%', icon: Trophy, highlight: true },
  { match: '4-Match', label: 'Gold Prize', amount: '£21,088', split: '35%', icon: TrendingUp, highlight: false },
  { match: '3-Match', label: 'Bronze Prize', amount: '£15,062', split: '25%', icon: Clock, highlight: false },
]

export default function PrizeDrawTeaser() {
  return (
    <section className="py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a2e1a]/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">March 2026 Draw</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#f5f0e8] mt-3 mb-6">
              This month&apos;s prize pool
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#dfc06a]">
                is live
              </span>
            </h2>
            <p className="text-[#a0b0a0] text-lg leading-relaxed mb-8">
              Every subscription contributes to the monthly prize pool. The more members, the bigger the win.
              Subscribe now to enter this month&apos;s draw — closes March 31st.
            </p>

            {/* Countdown look */}
            <div className="flex gap-4 mb-8">
              {[['07', 'Days'], ['14', 'Hours'], ['32', 'Mins']].map(([val, unit]) => (
                <div key={unit} className="bg-[#162216] border border-[#243824] rounded-xl px-5 py-4 text-center">
                  <div className="text-2xl font-black text-[#c9a84c]">{val}</div>
                  <div className="text-xs text-[#a0b0a0] mt-1">{unit}</div>
                </div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] font-bold px-8 py-4 rounded-full text-lg hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all"
              >
                Enter This Month&apos;s Draw
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="space-y-4">
              {/* Total pool */}
              <div className="bg-gradient-to-br from-[#c9a84c]/15 to-[#c9a84c]/5 border border-[#c9a84c]/30 rounded-2xl p-6 mb-6">
                <div className="text-sm text-[#c9a84c] font-medium mb-2">Total Prize Pool</div>
                <div className="text-5xl font-black text-[#f5f0e8]">£60,250</div>
                <div className="text-[#a0b0a0] text-sm mt-2">From 2,847 active subscribers</div>
              </div>

              {prizes.map((prize, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                    prize.highlight
                      ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30'
                      : 'bg-[#162216] border-[#243824]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      prize.highlight ? 'bg-[#c9a84c]/20' : 'bg-[#243824]'
                    }`}
                  >
                    <prize.icon className={`w-6 h-6 ${prize.highlight ? 'text-[#c9a84c]' : 'text-[#a0b0a0]'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#a0b0a0]">{prize.match}</div>
                    <div className="text-[#f5f0e8] font-semibold">{prize.label}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black ${prize.highlight ? 'text-[#c9a84c]' : 'text-[#f5f0e8]'}`}>
                      {prize.amount}
                    </div>
                    <div className="text-xs text-[#a0b0a0]">{prize.split} of pool</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
