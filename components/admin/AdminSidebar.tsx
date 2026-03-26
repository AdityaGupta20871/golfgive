'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Trophy, Users, Shuffle, Heart, Award, BarChart3, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Analytics', icon: BarChart3, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draws', label: 'Draw Management', icon: Shuffle },
  { href: '/admin/winners', label: 'Winners', icon: Award },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-64 min-h-screen bg-[#0a140a] border-r border-[#162216] flex flex-col fixed left-0 top-0 bottom-0">
      <div className="p-6 border-b border-[#162216]">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8883a] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[#1a2e1a]" />
          </div>
          <span className="text-lg font-bold text-[#f5f0e8]">Golf<span className="text-[#c9a84c]">Gives</span></span>
        </Link>
        <div className="text-xs text-[#a0b0a0] mt-1 ml-10">Admin Panel</div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/admin' ? true : pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20'
                  : 'text-[#a0b0a0] hover:bg-[#162216] hover:text-[#f5f0e8]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#162216]">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] font-bold text-xs">A</div>
          <div>
            <div className="text-sm font-medium text-[#f5f0e8]">Admin</div>
            <div className="text-xs text-[#a0b0a0]">Super Admin</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-[#a0b0a0] hover:text-red-400 transition-colors px-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
