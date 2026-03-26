'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trophy, Mail, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-[#0a140a] border-t border-[#162216]">
      {/* Email capture banner */}
      <div className="border-b border-[#162216] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-6 h-6 text-[#c9a84c]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#f5f0e8] mb-3">
              Stay in the loop
            </h3>
            <p className="text-[#a0b0a0] mb-8">
              Monthly draw results, charity spotlights and exclusive member offers — straight to your inbox.
            </p>
            {submitted ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#c9a84c] font-semibold"
              >
                ✓ You&apos;re on the list!
              </motion.p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-[#162216] border border-[#243824] rounded-full px-5 py-3 text-[#f5f0e8] placeholder-[#a0b0a0] focus:outline-none focus:border-[#c9a84c]/50 text-sm"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="bg-[#c9a84c] text-[#1a2e1a] px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  Subscribe <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8883a] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#1a2e1a]" />
              </div>
              <span className="text-xl font-bold text-[#f5f0e8]">
                Golf<span className="text-[#c9a84c]">Gives</span>
              </span>
            </Link>
            <p className="text-[#a0b0a0] text-sm leading-relaxed mb-6">
              Turning every round of golf into a force for good.
            </p>
            <div className="flex gap-3">
              {['𝕏', 'ig', 'in'].map((icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full border border-[#243824] flex items-center justify-center text-[#a0b0a0] hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-all text-xs font-bold"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="text-[#f5f0e8] font-semibold mb-4">Platform</div>
            <ul className="space-y-3">
              {['How It Works', 'Pricing', 'Prize Draws', 'Leaderboard'].map(item => (
                <li key={item}>
                  <Link href="/signup" className="text-[#a0b0a0] text-sm hover:text-[#f5f0e8] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Charities */}
          <div>
            <div className="text-[#f5f0e8] font-semibold mb-4">Charities</div>
            <ul className="space-y-3">
              {['Browse Charities', 'Charity Partners', 'Golf Days', 'Impact Reports'].map(item => (
                <li key={item}>
                  <Link href="/charities" className="text-[#a0b0a0] text-sm hover:text-[#f5f0e8] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-[#f5f0e8] font-semibold mb-4">Legal</div>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Responsible Gaming'].map(item => (
                <li key={item}>
                  <a href="#" className="text-[#a0b0a0] text-sm hover:text-[#f5f0e8] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#162216] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#a0b0a0] text-sm">© 2026 GolfGives Ltd. All rights reserved.</p>
          <p className="text-[#a0b0a0] text-sm">
            Registered charity platform. 18+ | Play responsibly.
          </p>
        </div>
      </div>
    </footer>
  )
}
