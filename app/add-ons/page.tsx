'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  const [postersEnabled, setPostersEnabled] = useState(true)
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({ posters: 1 })

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

  // Load saved selections when coming back from review
  useEffect(() => {
    const sessionPackage = sessionStorage.getItem('selectedPackage')
    const sessionAddOns = sessionStorage.getItem('selectedAddOns')
    const sessionPosters = sessionStorage.getItem('postersEnabled')
    const sessionQuantities = sessionStorage.getItem('addOnQuantities')

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

    if (sessionPosters !== null) {
      try {
        setPostersEnabled(JSON.parse(sessionPosters))
      } catch (error) {
        console.error('Error loading session posters data:', error)
      }
    }

    if (sessionQuantities) {
      try {
        setAddOnQuantities(JSON.parse(sessionQuantities))
      } catch (error) {
        console.error('Error loading session quantities data:', error)
      }
    }
  }, [])

  const printedAddOns = useMemo(
    () =>
      pricingData?.addOns.filter((a) => a.category === 'printed') || [],
    [pricingData]
  )

  const toggleAddOn = (addOnId: string) => {
    const newSelection = new Set(selectedAddOns)
    if (newSelection.has(addOnId)) {
      newSelection.delete(addOnId)
    } else {
      newSelection.add(addOnId)
      // Initialize rave-cards quantity to 100 when first selected
      if (addOnId === 'rave-cards') {
        setAddOnQuantities({
          ...addOnQuantities,
          [addOnId]: 100
        })
      }
    }
    setSelectedAddOns(newSelection)
  }

  // Calculate price for rave cards based on quantity
  const calculateRaveCardsPrice = (quantity: number): number => {
    // Base price $20 for 100 cards, then $10 for each additional 50 cards
    if (quantity <= 100) return 20
    const additionalCards = quantity - 100
    const increments = Math.ceil(additionalCards / 50)
    return 20 + (increments * 10)
  }

  const calculateTotal = (): number => {
    let total = selectedPackage?.price || 0

    if (pricingData) {
      selectedAddOns.forEach((addOnId) => {
        const addOn = pricingData.addOns.find((a) => a.id === addOnId)
        if (addOn && typeof addOn.price === 'number') {
          const quantity = addOnQuantities[addOnId] || (addOnId === 'rave-cards' ? 100 : 1)
          if (addOnId === 'rave-cards') {
            total += calculateRaveCardsPrice(quantity)
          } else {
            total += addOn.price * quantity
          }
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

    sessionStorage.setItem('selectedPackage', JSON.stringify(selectedPackage))
    sessionStorage.setItem('selectedAddOns', JSON.stringify(Array.from(selectedAddOns)))
    sessionStorage.setItem('postersEnabled', JSON.stringify(postersEnabled))
    sessionStorage.setItem('addOnQuantities', JSON.stringify(addOnQuantities))
    sessionStorage.setItem('totalPrice', calculateTotal().toString())

    router.push('/review')
  }

  const packageColors: Record<string, string> = {
    'one-time-event': '#FDBF57', // gold/yellow
    'multi-day-event': '#7A003C', // maroon
  }

  if (isLoading || !pricingData) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header currentPage="order" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-underground-teal mx-auto mb-4"></div>
            <p className="text-gray-600">Loading options...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#A6E7DE]">
      <Header currentPage="order" />

      {/* Top Header Section */}
      <div className="bg-gradient-to-br from-[#0f243a] via-[#122d49] to-[#0f243a]">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center space-y-3">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#A6E7DE]">Step 2</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Choose a package and add-ons</h1>
          <p className="text-lg text-[#d6e7e3]">
            Keep your package colors—just pick what you need and we&apos;ll roll it into your estimate.
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="px-6 py-6">
            {/* Packages Grid - 2 Columns */}
            <div className="grid md:grid-cols-2 gap-6 mb-6 items-stretch">
              {pricingData.packages.map((pkg) => {
                  const color = packageColors[pkg.id] || '#495965'
                  const isSelected = selectedPackage?.id === pkg.id
                  return (
                    <div key={pkg.id} className="flex flex-col gap-4 h-full">
                      <div
                        className={`rounded-xl cursor-pointer transition-all flex flex-col overflow-hidden ${
                          isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                        }`}
                        style={{
                          minHeight: '500px',
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(240,248,255,0.75) 20%, rgba(230,242,255,0.65) 100%)',
                          boxShadow: isSelected
                            ? `0 20px 60px rgba(0,0,0,0.25), 0 0 0 3px ${color}, inset 0 4px 12px rgba(255,255,255,0.95), inset 0 -8px 20px rgba(0,0,0,0.08)`
                            : '0 10px 40px rgba(0,0,0,0.18), inset 0 4px 12px rgba(255,255,255,0.95), inset 0 -8px 20px rgba(0,0,0,0.08)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.6)',
                          position: 'relative',
                        }}
                        onClick={() =>
                          setSelectedPackage({
                            id: pkg.id,
                            name: pkg.name,
                            price: pkg.price,
                          })
                        }
                      >
                        {/* Header with Package Name */}
                        <div
                          className="px-5 py-4 text-white relative"
                          style={{
                            background: `linear-gradient(to bottom, ${color}f0 0%, ${color} 70%, ${color}dd 100%)`,
                            boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.4), inset 0 -2px 8px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.2)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() =>
                                setSelectedPackage({
                                  id: pkg.id,
                                  name: pkg.name,
                                  price: pkg.price,
                                })
                              }
                              className="w-5 h-5 cursor-pointer"
                            />
                            <h3 className="font-bold uppercase tracking-wide text-xl">
                              {pkg.name}
                            </h3>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0" style={{
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(245,252,255,0.45) 50%, rgba(235,245,255,0.35) 100%)',
                        }}>
                          {/* Includes Section - Centered */}
                          <div className="flex-1 flex items-center">
                            {pkg.includes.length > 0 && (
                              <div className="w-full px-6 py-6">
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse table-fixed">
                                  <colgroup>
                                    <col className="w-[20%]" />
                                    <col className="w-[55%]" />
                                    <col className="w-[25%]" />
                                  </colgroup>
                                  <thead>
                                    <tr className="border-b-2 border-gray-200">
                                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-500">
                                        Size
                                      </th>
                                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-500">
                                        What&apos;s Included
                                      </th>
                                      <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-500">
                                        Quantity
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pkg.includes.map((item, idx) => {
                                      // Backward compatibility: handle old string format
                                      if (typeof item === 'string') {
                                        return (
                                          <tr key={idx}>
                                            <td colSpan={3} className="py-3 px-6 text-sm text-gray-700">
                                              {item}
                                            </td>
                                          </tr>
                                        )
                                      }

                                      // Handle header rows
                                      if (item.type === 'header') {
                                        return (
                                          <tr key={idx}>
                                            <td colSpan={3} className="py-4 px-6 font-bold text-base text-gray-700">
                                              {item.content}
                                            </td>
                                          </tr>
                                        )
                                      }

                                      // Regular data rows
                                      const isPostersRow = pkg.id === 'one-time-event' && item.item === 'Posters'

                                      return (
                                        <React.Fragment key={idx}>
                                          <tr className="border-b border-gray-300 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-700 font-medium">
                                              {item.size}
                                            </td>
                                            <td className="py-4 px-6">
                                              {isPostersRow ? (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPostersEnabled(!postersEnabled)
                                                  }}
                                                  className="relative inline-flex h-9 w-36 items-center rounded-lg overflow-hidden"
                                                  style={{
                                                    background: postersEnabled
                                                      ? 'linear-gradient(135deg, #A6E7DE 0%, #8dd4ca 100%)'
                                                      : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                                                    boxShadow: postersEnabled
                                                      ? '0 2px 6px rgba(166, 231, 222, 0.4), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.1)'
                                                      : '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.1)',
                                                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                                                  }}
                                                >
                                                  {/* Posters text - visible when enabled */}
                                                  <span
                                                    className="absolute left-2.5 text-sm font-medium text-gray-700 transition-opacity duration-300 whitespace-nowrap"
                                                    style={{
                                                      opacity: postersEnabled ? 1 : 0,
                                                      pointerEvents: 'none',
                                                    }}
                                                  >
                                                    Posters
                                                  </span>

                                                  {/* No Posters text - visible when disabled */}
                                                  <span
                                                    className="absolute right-2.5 text-sm font-medium text-gray-700 transition-opacity duration-300 whitespace-nowrap"
                                                    style={{
                                                      opacity: postersEnabled ? 0 : 1,
                                                      pointerEvents: 'none',
                                                    }}
                                                  >
                                                    No Posters
                                                  </span>

                                                  {/* Switch handle */}
                                                  <span
                                                    className="inline-block h-7 w-7 rounded-md bg-white shadow-md absolute top-1 transition-all duration-300"
                                                    style={{
                                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                      left: postersEnabled ? 'calc(100% - 32px)' : '4px',
                                                    }}
                                                  />
                                                </button>
                                              ) : (
                                                <span className="text-base text-gray-700">{item.item}</span>
                                              )}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700 font-medium text-center">
                                              {isPostersRow && !postersEnabled ? '0' : item.quantity}
                                            </td>
                                          </tr>
                                          {isPostersRow && item.note && (
                                            <tr>
                                              <td colSpan={3} className="px-6 pb-4 text-xs text-gray-500 italic">
                                                {item.note}
                                              </td>
                                            </tr>
                                          )}
                                        </React.Fragment>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              </div>
                            )}
                          </div>

                          {/* Image above footer */}
                          {pkg.image && (
                            <div className="relative w-full">
                              <Image
                                src={pkg.image}
                                alt={`Sample design for ${pkg.name}`}
                                width={1200}
                                height={600}
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          )}

                          {/* Footer Notes */}
                          {(pkg.turnaround || pkg.note) && (
                            <div className="px-6 pb-6 pt-4 border-t border-gray-200/60 mt-auto min-h-[50px]" style={{
                              background: 'linear-gradient(to bottom, rgba(235,245,255,0.5) 0%, rgba(220,235,250,0.65) 100%)',
                              boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.7)',
                            }}>
                              <div className="space-y-2.5">
                                {pkg.turnaround && (
                                  <div className="flex items-start gap-2">
                                    <svg
                                      className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <p className="text-sm text-gray-600 italic leading-relaxed">
                                      {pkg.turnaround}
                                    </p>
                                  </div>
                                )}
                                {pkg.note && (
                                  <div className="flex items-start gap-2">
                                    <svg
                                      className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {pkg.note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Printed Media ADD-ONS - 4 Columns */}
            <div className="mt-6 rounded-xl overflow-hidden" style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(240,248,255,0.75) 20%, rgba(230,242,255,0.65) 100%)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.18), inset 0 4px 12px rgba(255,255,255,0.95), inset 0 -8px 20px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.6)',
            }}>
              <div className="text-white px-4 py-3 flex items-center gap-2" style={{
                background: 'linear-gradient(to bottom, #1C3450f0 0%, #1C3450 70%, #152938 100%)',
                boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.4), inset 0 -2px 8px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <div className="w-4 h-4 bg-white rounded-sm" />
                <h2 className="text-lg font-bold">Printed Media ADD-ONS</h2>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(245,252,255,0.45) 50%, rgba(235,245,255,0.35) 100%)',
              }}>
                {printedAddOns.map((addOn) => {
                  const isPosterAddOn = addOn.id === 'posters'
                  const isRaveCardsAddOn = addOn.id === 'rave-cards'
                  const quantity = addOnQuantities[addOn.id] || (isRaveCardsAddOn ? 100 : 1)
                  const displayPrice = isRaveCardsAddOn 
                    ? calculateRaveCardsPrice(quantity)
                    : typeof addOn.price === 'number' ? addOn.price * quantity : 0

                  return (
                    <div
                      key={addOn.id}
                      className="flex flex-col gap-2 rounded-md p-3 transition hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(245,252,255,0.55) 50%, rgba(230,242,255,0.45) 100%)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.06)',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAddOns.has(addOn.id)}
                          onChange={() => toggleAddOn(addOn.id)}
                          className="mt-1 w-5 h-5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm text-gray-900">{addOn.name}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              ${displayPrice.toFixed(2)}
                            </span>
                          </div>
                          {addOn.description && (
                            <p className="text-xs text-gray-600 mt-1">{addOn.description}</p>
                          )}
                          {isPosterAddOn && selectedAddOns.has(addOn.id) && (
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <select
                                value={quantity}
                                onChange={(e) => {
                                  setAddOnQuantities({
                                    ...addOnQuantities,
                                    [addOn.id]: parseInt(e.target.value, 10)
                                  })
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#A6E7DE] focus:ring-1 focus:ring-[#A6E7DE]"
                              >
                                {[1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {isRaveCardsAddOn && selectedAddOns.has(addOn.id) && (
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <select
                                value={quantity}
                                onChange={(e) => {
                                  setAddOnQuantities({
                                    ...addOnQuantities,
                                    [addOn.id]: parseInt(e.target.value, 10)
                                  })
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#A6E7DE] focus:ring-1 focus:ring-[#A6E7DE]"
                              >
                                {[100, 150, 200, 250, 300].map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 bg-[#1b9a95] text-white px-4 py-3 rounded-md shadow-sm">
              <p className="text-sm text-center italic">
                *Turnaround times begin once your request is received and may be adjusted based on
                project volume and complexity.
              </p>
            </div>

            <div className="mt-6 bg-white border border-[#d0dbe0] rounded-lg p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-800">
                  {selectedPackage ? (
                    <>
                      <p className="font-semibold text-base">
                        {selectedPackage.name}
                        {selectedAddOns.size > 0 && (
                          <span className="text-gray-600">
                            {' '}+ ${pricingData?.addOns
                              .filter((a) => selectedAddOns.has(a.id))
                              .reduce((sum, a) => {
                                const quantity = addOnQuantities[a.id] || (a.id === 'rave-cards' ? 100 : 1)
                                if (a.id === 'rave-cards') {
                                  return sum + calculateRaveCardsPrice(quantity)
                                }
                                return sum + (typeof a.price === 'number' ? a.price * quantity : 0)
                              }, 0).toFixed(2) || '0.00'}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {selectedAddOns.size} add-on{selectedAddOns.size !== 1 ? 's' : ''} selected
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold text-red-600">Select a package to continue</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/form')}
                    className="border-2 border-[#1b9a95] text-[#1b9a95] hover:bg-[#1b9a95] hover:text-white"
                  >
                    Back to Form
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!selectedPackage}
                    className="bg-[#1b9a95] text-white hover:bg-[#167e77] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Continue to Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
