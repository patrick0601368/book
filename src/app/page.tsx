import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
    </main>
  )
}
