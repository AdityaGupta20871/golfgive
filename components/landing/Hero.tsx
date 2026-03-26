'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Heart, Trophy, Users } from 'lucide-react'

const stats = [
  { icon: Users, label: 'Active Members', value: '2,847' },
  { icon: Trophy, label: 'Prize Pool', value: '£48,200' },
  { icon: Heart, label: 'Donated to Charity', value: '£124,500' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1a0d] via-[#162216] to-[#0d1a0d]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(201,168,76,0.12),transparent)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c9a84c]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#1a2e1a]/80 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
            <span className="text-[#c9a84c] text-sm font-medium">Monthly Prize Draw — March 2026 Open</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
          >
            <span className="text-[#f5f0e8]">Play Golf.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#dfc06a]">
              Change Lives.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg md:text-xl text-[#a0b0a0] max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Subscribe, submit your Stableford scores, and enter monthly prize draws — while
            every subscription directly funds the charities that matter most to you.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] font-bold px-8 py-4 rounded-full text-lg hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/charities"
                className="inline-flex items-center gap-3 border border-[#c9a84c]/30 text-[#f5f0e8] font-medium px-8 py-4 rounded-full text-lg hover:bg-[#c9a84c]/10 transition-all duration-300"
              >
                Explore Charities
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-[#f5f0e8]">{stat.value}</div>
                <div className="text-xs text-[#a0b0a0] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[#a0b0a0] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border border-[#c9a84c]/40 rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 bg-[#c9a84c] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
