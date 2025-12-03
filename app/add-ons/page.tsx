'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import type { PricingData } from '@/lib/types'

interface SelectedPackage {
  id: string
  name: string
  price: number
}

export default function AddOnsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())

  // Fetch pricing data from API
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/pricing')
        if (response.ok) {
          const data = await response.json()
          setPricingData(data)
        } else {
          console.error('Failed to load pricing data')
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPricingData()
  }, [])

  // Load saved selections from sessionStorage on mount (when coming back from review)
  useEffect(() => {
    const sessionPackage = sessionStorage.getItem('selectedPackage')
    const sessionAddOns = sessionStorage.getItem('selectedAddOns')

    if (sessionPackage) {
      try {
        setSelectedPackage(JSON.parse(sessionPackage))
      } catch (error) {
        console.error('Error loading session package data:', error)
      }
    }

    if (sessionAddOns) {
      try {
        const addOnsArray = JSON.parse(sessionAddOns)
        setSelectedAddOns(new Set(addOnsArray))
      } catch (error) {
        console.error('Error loading session add-ons data:', error)
      }
    }
  }, [])

  const toggleAddOn = (addOnId: string) => {
    const newSelection = new Set(selectedAddOns)
    if (newSelection.has(addOnId)) {
      newSelection.delete(addOnId)
    } else {
      newSelection.add(addOnId)
    }
    setSelectedAddOns(newSelection)
  }

  const calculateTotal = (): number => {
    let total = selectedPackage?.price || 0

    if (pricingData) {
      selectedAddOns.forEach((addOnId) => {
        const addOn = pricingData.addOns.find((a) => a.id === addOnId)
        if (addOn && typeof addOn.price === 'number') {
          total += addOn.price
        }
      })
    }

    return total
  }

  const handleContinue = () => {
    const formData = sessionStorage.getItem('formData')
    if (!formData) {
      alert('Form data not found. Please fill out the form first.')
      router.push('/form')
      return
    }

    // Store selected package and add-ons in sessionStorage
    sessionStorage.setItem('selectedPackage', JSON.stringify(selectedPackage))
    sessionStorage.setItem('selectedAddOns', JSON.stringify(Array.from(selectedAddOns)))
    sessionStorage.setItem('totalPrice', calculateTotal().toString())

    // Navigate to review page
    router.push('/review')
  }

  // Helper function to lighten a hex color for background
  const lightenColor = (hex?: string, percent: number = 90): string => {
    if (!hex || !hex.startsWith('#')) return '#f9fafb' // gray-50 default

    const num = parseInt(hex.slice(1), 16)
    const r = (num >> 16) & 255
    const g = (num >> 8) & 255
    const b = num & 255

    // Lighten by blending with white
    const lightenedR = Math.round(r + (255 - r) * percent / 100)
    const lightenedG = Math.round(g + (255 - g) * percent / 100)
    const lightenedB = Math.round(b + (255 - b) * percent / 100)

    return `#${((1 << 24) + (lightenedR << 16) + (lightenedG << 8) + lightenedB).toString(16).slice(1)}`
  }

  const digitalAddOns = pricingData?.addOns.filter((a) => a.category === 'digital' && a.id !== 'digital-graphics') || []
  const printedAddOns = pricingData?.addOns.filter((a) => a.category === 'printed' && a.id !== 'tri-fold-brochures') || []

  // Show loading state
  if (isLoading || !pricingData) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header currentPage="order" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-underground-teal mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pricing options...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#A6E7DE]">
      {/* Header */}
      <Header currentPage="order" />

      <div className="flex-1">
        <div className="bg-gradient-to-br from-[#0f243a] via-[#122d49] to-[#0f243a]">
          <div className="max-w-5xl mx-auto px-6 py-12 text-center space-y-3">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#A6E7DE]">Step 2</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Choose a package and add-ons</h1>
            <p className="text-lg text-[#d6e7e3]">
              Keep your package colors—just pick what you need and we’ll roll it into your estimate.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Packages */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Select a Package</h2>

              {pricingData.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() =>
                    setSelectedPackage({
                      id: pkg.id,
                      name: pkg.name,
                      price: pkg.price,
                    })
                  }
                  className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'ring-4 ring-[#A6E7DE] ring-opacity-60 scale-[1.01]'
                      : ''
                  }`}
                  style={{
                    borderColor: pkg.color || '#d1d5db',
                    backgroundColor: lightenColor(pkg.color)
                  }}
                >
                  <div
                    className="text-white px-4 py-3 flex justify-between items-center"
                    style={{ backgroundColor: pkg.color || '#4b5563' }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedPackage?.id === pkg.id}
                        onChange={() =>
                          setSelectedPackage({
                            id: pkg.id,
                            name: pkg.name,
                            price: pkg.price,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <h3 className="text-xl font-bold">{pkg.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 text-[#0f243a]">
                    {pkg.includes.length > 0 && (
                      <>
                        <p className="font-semibold mb-2">Includes:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {pkg.includes.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {pkg.turnaround && (
                      <p className="text-sm italic mt-2">*{pkg.turnaround}</p>
                    )}
                    {pkg.note && (
                      <div className="flex items-start gap-3 text-sm text-gray-700 mt-2">
                        <span className="text-yellow-600 text-xl flex-shrink-0">⚠️</span>
                        <p>{pkg.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Add-Ons */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Add-Ons</h2>

              {/* Digital Graphics */}
              <div className="rounded-xl overflow-hidden bg-white/90 border border-[#A6E7DE] shadow-lg">
                <div className="bg-[#1C3450] text-[#A6E7DE] px-4 py-3 text-lg font-bold">
                  Digital Graphics
                </div>
                <div className="p-4 space-y-3">
                  {digitalAddOns.map((addOn) => (
                    <label
                      key={addOn.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-[#f2fbf8] p-2 rounded transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddOns.has(addOn.id)}
                        onChange={() => toggleAddOn(addOn.id)}
                        className="mt-1 w-5 h-5"
                        disabled={addOn.note === 'Included in packages'}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-[#0f243a]">{addOn.name}</span>
                        </div>
                        {addOn.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {addOn.description}
                          </p>
                        )}
                        {addOn.note && typeof addOn.price === 'number' && addOn.price > 0 && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            {addOn.note}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Printed Media */}
              <div className="rounded-xl overflow-hidden bg-white/90 border border-[#A6E7DE] shadow-lg">
                <div className="bg-[#1C3450] text-[#A6E7DE] px-4 py-3 text-lg font-bold">
                  Printed Media
                </div>
                <div className="p-4 space-y-3">
                  {printedAddOns.map((addOn) => (
                    <label
                      key={addOn.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-[#f2fbf8] p-2 rounded transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddOns.has(addOn.id)}
                        onChange={() => toggleAddOn(addOn.id)}
                        className="mt-1 w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-[#0f243a]">{addOn.name}</span>
                        </div>
                        {addOn.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {addOn.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Turnaround Notice */}
              <div className="bg-[#1C3450] text-[#A6E7DE] p-4 rounded-lg border border-white/10 shadow">
                <p className="text-sm">
                  *Turnaround times begin once your request is received and may be adjusted
                  based on project volume and complexity.
                </p>
              </div>
            </div>
          </div>

          {/* Total and Continue */}
          <div className="mt-12 bg-white/90 border border-[#A6E7DE] rounded-lg p-6 shadow-lg">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#0f243a] mb-4">Order Summary</h3>
              {selectedPackage && (
                <p className="text-gray-700">
                  Package: {selectedPackage.name}
                </p>
              )}
              {selectedAddOns.size > 0 && (
                <p className="text-gray-700">
                  Add-ons selected: {selectedAddOns.size}
                </p>
              )}
            </div>

            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/form')}
                className="border-[#1C3450] text-[#1C3450]"
              >
                Back to Form
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedPackage}
                className="bg-[#1C3450] text-[#A6E7DE] hover:bg-[#10283d]"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
