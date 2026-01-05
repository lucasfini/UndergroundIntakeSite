'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LocationMap } from '@/components/LocationMap'

export default function SelectServicePage() {
  const router = useRouter()
  const [showMap, setShowMap] = useState(false)

  const handlePromoClick = () => {
    router.push('/auth/login')
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0f243a]">
      <Header />

      <div className="flex-1 w-full">
        {/* Hero */}
        <div className="relative overflow-hidden min-h-[360px]">
          <div className="absolute inset-0">
            <Image
              src="/images/MSU.png"
              alt="McMaster campus"
              fill
              className="object-cover object-center opacity-35"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f243a] via-[#0f243a]/85 to-[#122d49]" />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 py-16 lg:py-24 text-center space-y-4">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#A6E7DE]">
              Start a Project
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
              Kick off your request in one smooth flow.
            </h1>
            <p className="text-lg md:text-xl text-[#d6e7e3]">
              Pick your service, share the details, choose add-ons, review, and submit. We generate your tracking ID the moment you finish.
            </p>
          </div>
        </div>

        {/* Service tiles */}
        <div className="bg-[#A6E7DE]">
          <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-[#1C3450]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e8f8f4] via-white to-[#f3fbf9]" />
              <div className="relative p-8 space-y-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-[#1C3450]">MSU Services Only</div>
                <h2 className="text-3xl font-bold text-[#1C3450]">Promo Kit</h2>
                <p className="text-lg text-[#264766]">
                  End-to-end promo design for events, campaigns, and announcements—posters, banners, digital assets, and print-ready files to get the word out fast.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handlePromoClick}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-[#A6E7DE] bg-[#1C3450] hover:bg-[#10283d] transition"
                  >
                    Get Started →
                  </button>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-dashed border-[#1C3450]/30 bg-white/60 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-[#e6f3ef]" />
              <div className="relative p-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C3450] text-[#A6E7DE] text-xs font-semibold uppercase tracking-wide">
                  Coming Soon
                </div>
                <h2 className="text-3xl font-bold text-[#1C3450] opacity-60">Canva Design</h2>
                <p className="text-lg text-[#264766] opacity-70">
                  Bring your fully thought-out design using our MSU brand templates. We provide Canva templates to choose from and review your design to ensure it&apos;s ready for posting.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center px-4 py-3 rounded-lg font-semibold text-[#1C3450] bg-[#A6E7DE]/50 border border-[#1C3450]/20 opacity-70 cursor-not-allowed">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-dashed border-[#1C3450]/30 bg-white/60 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-[#e6f3ef]" />
              <div className="relative p-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C3450] text-[#A6E7DE] text-xs font-semibold uppercase tracking-wide">
                  Coming Soon
                </div>
                <h2 className="text-3xl font-bold text-[#1C3450] opacity-60">Design + Signage</h2>
                <p className="text-lg text-[#264766] opacity-70">
                  High-impact signage and large-format pieces to make your presence stand out. Launching soon—stay tuned.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center px-4 py-3 rounded-lg font-semibold text-[#1C3450] bg-[#A6E7DE]/50 border border-[#1C3450]/20 opacity-70 cursor-not-allowed">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-[#1C3450]/10 md:col-span-3">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f3fbf9] via-white to-[#e8f8f4]" />
              <div className="relative p-8 space-y-4">
                <h2 className="text-3xl font-bold text-[#1C3450]">Standard Prints</h2>
                <p className="text-lg text-[#264766]">
                  Looking for standard sized prints? Come into our store and use our self-serve printing service!
                </p>
                <p className="text-sm text-[#1C3450] font-semibold">
                  Hours: 10am – 4pm, Monday – Friday
                </p>
                <p className="text-sm text-[#1C3450] font-semibold">
                  Located In: McMaster University Student Centre, Lower Level of MUSC, Room B117
                </p>
                <button
                  onClick={() => setShowMap((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-[#A6E7DE] bg-[#1C3450] hover:bg-[#10283d] transition"
                >
                  {showMap ? 'Hide Location' : 'Show Location'}
                </button>
                {showMap && <LocationMap />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
