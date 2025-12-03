import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FileText, Search } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header currentPage="home" />

      {/* Hero Section with Background */}
      <section className="relative flex-1 flex items-center min-h-[calc(100vh-8rem)]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/Landing-Page-graphics-01.webp"
            alt="Underground Design Background"
            fill
            className="object-cover object-center opacity-40"
            priority
            unoptimized
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f243a] via-[#0f243a]/85 to-white/20" />
        </div>

        {/* Content */}
        <div className="relative z-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center space-y-6">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#A6E7DE]">
            Underground Media + Design
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
            Submit a new project or track your progress in one place.
          </h1>
          <p className="text-lg sm:text-xl text-[#d6e7e3] max-w-3xl mx-auto">
            Share your details, choose add-ons, review, and get a tracking ID instantly. Check status anytime while our team brings your ideas to life.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5 pt-4">
            <Link
              href="/select-service"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-lg font-semibold bg-[#A6E7DE] text-[#1C3450] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
            >
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              New Project Request
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-lg font-semibold bg-white/15 text-white border border-white/30 backdrop-blur hover:bg-white/25 hover:border-white/50 hover:-translate-y-0.5 transition"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              Track Progress
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
