'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Menu, X, Trophy, LogOut, LayoutDashboard, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<null | { email: string }>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email || '' })
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/charities', label: 'Charities' },
  ]

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0d1a0d]/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-[#1a2e1a]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8883a] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[#1a2e1a]" />
          </div>
          <span className="text-xl font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors">
            Golf<span className="text-[#c9a84c]">Gives</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-[#c9a84c]'
                  : 'text-[#a0b0a0] hover:text-[#f5f0e8]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-[#a0b0a0] hover:text-[#f5f0e8] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-[#a0b0a0] hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[#a0b0a0] hover:text-[#f5f0e8] transition-colors"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signup"
                  className="bg-[#c9a84c] text-[#1a2e1a] px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#dfc06a] transition-colors"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#f5f0e8]"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0d1a0d]/98 border-t border-[#1a2e1a] px-6 py-4 flex flex-col gap-4"
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-[#a0b0a0] hover:text-[#f5f0e8] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-[#a0b0a0] hover:text-[#f5f0e8]">Dashboard</Link>
              <button onClick={handleSignOut} className="text-left text-red-400">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-[#a0b0a0] hover:text-[#f5f0e8]">Sign In</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="bg-[#c9a84c] text-[#1a2e1a] px-5 py-2 rounded-full font-semibold text-center">Get Started</Link>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  )
}
