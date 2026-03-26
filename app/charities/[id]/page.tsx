'use client'
import { use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/landing/Footer'
import { Heart, Calendar, Users, ArrowLeft, ArrowRight, Trophy, Globe } from 'lucide-react'

const CHARITIES: Record<string, {
  name: string; category: string; description: string; fullDescription: string;
  event: string; raised: string; members: number; website: string;
  impact: string[]; featured: boolean;
}> = {
  '1': { name: 'Cancer Research UK', category: 'Health', description: 'The world\'s largest independent cancer research organisation.', fullDescription: 'Cancer Research UK is the world\'s largest independent cancer research organisation. We fund scientists, doctors and nurses to help beat cancer sooner. We are a charity that relies on every pound donated to power our life-saving research. Our work into the prevention, diagnosis and treatment of cancer has helped survival rates double in the last 40 years. And we won\'t stop there.', event: 'Charity Golf Day — Apr 2026', raised: '£24,800', members: 842, featured: true, website: 'cancerresearchuk.org', impact: ['Funded 4,000+ research projects', '50% of people now survive cancer for 10+ years', '£500M invested in research annually'] },
  '2': { name: "Children's Golf Foundation", category: 'Youth', description: 'Getting underprivileged kids onto the fairway and into education.', fullDescription: "The Children's Golf Foundation believes every child deserves access to the fairways. We work with schools and communities to deliver golf programmes that build confidence, discipline, and teamwork. Our scholarship programme has helped hundreds of young golfers access higher education through sport.", event: 'Junior Open Day — May 2026', raised: '£18,200', members: 614, featured: true, website: 'childrensgolf.org.uk', impact: ['3,200 children enrolled annually', '94% scholarship completion rate', '48 partner schools across the UK'] },
  '3': { name: 'Veterans on the Green', category: 'Veterans', description: 'Supporting military veterans through golf programmes.', fullDescription: 'Veterans on the Green uses the power of golf to support those who have served our country. Our structured programmes provide therapy through sport, build peer communities, and offer competitive opportunities at every level. Golf has proven mental health benefits — and for veterans facing transition, it can be transformative.', event: 'Veterans Cup — Jun 2026', raised: '£31,400', members: 991, featured: true, website: 'veteransonthegreen.co.uk', impact: ['1,800+ veterans supported', '87% report improved wellbeing', '22 golf clubs as programme partners'] },
  '4': { name: 'Mental Health Fairways', category: 'Wellbeing', description: 'Using golf as a mental health tool.', fullDescription: "Mental Health Fairways runs open golf days specifically designed for people experiencing mental health challenges. Golf's natural environment, social structure, and gentle exercise make it a powerful therapeutic tool. Our peer support groups meet at golf clubs across the country.", event: 'Mind & Golf Retreat — Mar 2026', raised: '£15,600', members: 487, featured: false, website: 'mentalhealthfairways.co.uk', impact: ['2,100 programme participants', '91% report feeling less isolated', 'Available across 30+ UK counties'] },
  '5': { name: 'Golf for All Foundation', category: 'Accessibility', description: 'Breaking barriers in golf for disabled players.', fullDescription: 'Golf for All Foundation removes every barrier that stops people with disabilities from enjoying golf. From adaptive equipment grants to fully accessible tournament structures, we believe golf is for everyone. Our partnerships with golf clubs ensure that facilities meet the needs of all players.', event: 'Adaptive Golf Day — Jul 2026', raised: '£9,200', members: 301, featured: false, website: 'golfforall.org.uk', impact: ['450 adaptive equipment grants issued', '60 accessible golf venues partnered', 'Annual national adaptive championship'] },
  '6': { name: 'Green Heart Initiative', category: 'Environment', description: 'Restoring nature through golf courses.', fullDescription: "The Green Heart Initiative partners with golf clubs across the UK to transform their courses into ecological havens. Through tree planting, wildflower rewilding, and wetland restoration, we're turning golf\'s green spaces into genuine environmental assets. Every GolfGives subscription plants trees.", event: 'Eco-Golf Week — Aug 2026', raised: '£7,400', members: 218, featured: false, website: 'greenheartinitiative.co.uk', impact: ['84,000 trees planted to date', '200 hectares of rewilded land', '45 golf clubs actively participating'] },
}

export default function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const charity = CHARITIES[id]

  if (!charity) {
    return (
      <div className="min-h-screen bg-[#0d1a0d] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#f5f0e8] text-xl mb-4">Charity not found</div>
          <Link href="/charities" className="text-[#c9a84c]">← Back to Directory</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1a0d]">
      <Navbar />

      <section className="pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,168,76,0.06),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6">
          <Link href="/charities" className="inline-flex items-center gap-2 text-[#a0b0a0] hover:text-[#f5f0e8] transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {charity.featured && (
                  <span className="inline-block bg-[#c9a84c]/15 text-[#c9a84c] text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Featured Partner
                  </span>
                )}

                {/* Logo area */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center mb-6">
                  <Heart className="w-10 h-10 text-[#c9a84c]" />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs bg-[#243824] text-[#a0b0a0] px-2.5 py-1 rounded-full">{charity.category}</span>
                </div>
                <h1 className="text-4xl font-black text-[#f5f0e8] mb-6">{charity.name}</h1>
                <p className="text-[#a0b0a0] leading-relaxed text-lg mb-8">{charity.fullDescription}</p>

                {/* Impact metrics */}
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-[#f5f0e8] mb-4">Our Impact</h2>
                  <div className="space-y-3">
                    {charity.impact.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-[#162216] border border-[#243824] rounded-xl px-4 py-3">
                        <Trophy className="w-4 h-4 text-[#c9a84c] flex-shrink-0" />
                        <span className="text-[#f5f0e8] text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming event */}
                <div className="bg-gradient-to-r from-[#c9a84c]/10 to-transparent border border-[#c9a84c]/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#c9a84c]" />
                    <span className="text-[#c9a84c] text-sm font-semibold">Upcoming Golf Day</span>
                  </div>
                  <div className="text-[#f5f0e8] font-bold text-lg">{charity.event}</div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-5"
            >
              {/* Stats */}
              <div className="bg-[#162216] border border-[#243824] rounded-2xl p-6">
                <div className="text-sm font-bold text-[#f5f0e8] mb-4">GolfGives Stats</div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-[#a0b0a0] mb-1">Total Raised</div>
                    <div className="text-2xl font-black text-[#c9a84c]">{charity.raised}</div>
                  </div>
                  <div className="pt-3 border-t border-[#243824]">
                    <div className="text-xs text-[#a0b0a0] mb-1">Supporting Members</div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#c9a84c]" />
                      <span className="text-xl font-black text-[#f5f0e8]">{charity.members.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#243824]">
                    <a
                      href={`https://${charity.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#a0b0a0] hover:text-[#c9a84c] transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      {charity.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-[#1a2e1a] to-[#162216] border border-[#c9a84c]/20 rounded-2xl p-6">
                <div className="text-[#f5f0e8] font-bold mb-2">Support this charity</div>
                <p className="text-[#a0b0a0] text-sm mb-4">Subscribe to GolfGives and choose this charity as your cause.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/signup"
                    className="w-full bg-gradient-to-r from-[#c9a84c] to-[#dfc06a] text-[#1a2e1a] font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>

              {/* Back link */}
              <Link
                href="/charities"
                className="flex items-center justify-center gap-2 text-sm text-[#a0b0a0] hover:text-[#f5f0e8] transition-colors py-2"
              >
                <ArrowLeft className="w-4 h-4" /> View All Charities
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
