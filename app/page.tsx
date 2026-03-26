import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import CharityCarousel from '@/components/landing/CharityCarousel'
import PrizeDrawTeaser from '@/components/landing/PrizeDrawTeaser'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1a0d]">
      <Navbar />
      <Hero />
      <HowItWorks />
      <CharityCarousel />
      <PrizeDrawTeaser />
      <Footer />
    </div>
  )
}
