'use client'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { CreditCard, Flag, Sparkles } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: CreditCard,
    title: 'Subscribe',
    description: 'Choose your monthly or yearly plan. From day one, your subscription supports your chosen charity.',
    color: '#c9a84c',
  },
  {
    number: '02',
    icon: Flag,
    title: 'Enter Scores',
    description: 'Submit your Stableford scores after every round. Your best 5 scores enter the monthly draw.',
    color: '#dfc06a',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Win & Give',
    description: 'Monthly draws reward top scorers. You win prizes, charities receive donations — everyone benefits.',
    color: '#c9a84c',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#162216]/40 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#f5f0e8] mt-3 mb-4">
            Three steps to make<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#dfc06a]">a real difference</span>
          </h2>
          <p className="text-[#a0b0a0] text-lg max-w-xl mx-auto">
            GolfGives turns your passion for the game into meaningful charitable impact.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />

          {steps.map((step, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div className="relative group">
                <div className="bg-[#162216] border border-[#243824] rounded-2xl p-8 hover:border-[#c9a84c]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
                  {/* Step number */}
                  <div className="text-[#c9a84c]/20 text-7xl font-black absolute top-4 right-6 leading-none select-none">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                  >
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>

                  <h3 className="text-xl font-bold text-[#f5f0e8] mb-3">{step.title}</h3>
                  <p className="text-[#a0b0a0] leading-relaxed">{step.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
