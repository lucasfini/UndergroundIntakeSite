'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Search } from 'lucide-react'

export default function TrackLandingPage() {
  const [ticketId, setTicketId] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticketId.trim()) {
      router.push(`/track/${ticketId.trim()}`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
      <Header currentPage="track" />

      <div className="flex-1 w-full flex flex-col">
        {/* Track Your Project Title */}
        <div className="w-full py-8 text-center" style={{ backgroundColor: '#1C3450', color: '#A6E7DE' }}>
          <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: 'Gotham Bold, Helvetica, Arial, sans-serif' }}>
            Track Your Project
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full py-12 flex items-center justify-center" style={{ backgroundColor: '#A6E7DE' }}>
          <div className="max-w-2xl w-full px-6">
            <div className="rounded-lg p-8" style={{ backgroundColor: '#1C3450' }}>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <Search className="w-16 h-16" style={{ color: '#A6E7DE' }} strokeWidth={1.5} />
              </div>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-center mb-8" style={{ color: '#A6E7DE' }}>
                Enter your tracking ID to view your project status and queue position
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="ticketId"
                    className="block text-lg font-medium mb-2"
                    style={{ color: '#A6E7DE' }}
                  >
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    id="ticketId"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter your ticket or submission ID"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:outline-none transition text-lg"
                    style={{
                      borderColor: '#A6E7DE',
                      backgroundColor: 'white',
                      color: '#1C3450'
                    }}
                    required
                  />
                  <p className="mt-2 text-base" style={{ color: '#A6E7DE' }}>
                    Your tracking ID was sent to your email after submission
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg font-bold text-xl hover:opacity-80 transition"
                  style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}
                >
                  Track Project
                </button>
              </form>

              {/* Help Text */}
              <div className="mt-8 pt-6 border-t-2" style={{ borderColor: '#A6E7DE' }}>
                <p className="text-lg text-center mb-2" style={{ color: '#A6E7DE' }}>
                  Can&apos;t find your tracking ID?
                </p>
                <Link
                  href="/contact"
                  className="block text-center font-semibold text-lg hover:opacity-70 transition"
                  style={{ color: '#A6E7DE' }}
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
