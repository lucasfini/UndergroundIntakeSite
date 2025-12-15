'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import type { PricingData } from '@/lib/types'

interface FormData {
  service: string
  name: string
  position: string
  email: string
  eventName: string
  startTime: string
  endTime: string
  eventDate: string
  location: string
  link: string
  collaborationDetails: string
  hasVisualReferences: boolean
  visualReferenceLink: string
  hasCanvaLink: boolean
  canvaLink: string
  callToAction: string
  content: string
  additionalInfo: string
  submissionId?: string
  uploadedFiles?: {
    attachments: string[]
    visualReferences: string[]
  }
}

interface SelectedPackage {
  id: string
  name: string
  price: number
}

const EmptyFieldDisplay = ({ value }: { value: string | undefined | null }) => {
  if (!value || value.trim() === '') {
    return <span className="text-gray-400 italic">Not provided</span>
  }
  return <span className="font-medium">{value}</span>
}

export default function ReviewPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({})
  const [totalPrice, setTotalPrice] = useState(0)

  // Fetch pricing data from API
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await fetch('/api/pricing')
        if (response.ok) {
          const data = await response.json()
          setPricingData(data)
        } else {
          console.error('Failed to load pricing data')
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error)
      }
    }

    fetchPricingData()
  }, [])

  useEffect(() => {
    // Load data from session storage
    const storedFormData = sessionStorage.getItem('formData')
    const storedPackage = sessionStorage.getItem('selectedPackage')
    const storedAddOns = sessionStorage.getItem('selectedAddOns')
    const storedQuantities = sessionStorage.getItem('addOnQuantities')
    const storedTotal = sessionStorage.getItem('totalPrice')

    if (!storedFormData) {
      alert('No form data found. Please start from the beginning.')
      router.push('/form')
      return
    }

    setFormData(JSON.parse(storedFormData))
    setSelectedPackage(storedPackage ? JSON.parse(storedPackage) : null)
    setSelectedAddOns(storedAddOns ? JSON.parse(storedAddOns) : [])
    setAddOnQuantities(storedQuantities ? JSON.parse(storedQuantities) : {})
    setTotalPrice(storedTotal ? parseFloat(storedTotal) : 0)
  }, [router])

  const getAddOnById = (id: string) => {
    return pricingData?.addOns.find((a) => a.id === id)
  }

  // Calculate price for rave cards based on quantity
  const calculateRaveCardsPrice = (quantity: number): number => {
    // Base price $20 for 100 cards, then $10 for each additional 50 cards
    if (quantity <= 100) return 20
    const additionalCards = quantity - 100
    const increments = Math.ceil(additionalCards / 50)
    return 20 + (increments * 10)
  }

  const getServiceLabel = (value: string) => {
    const serviceMap: { [key: string]: string } = {
      'avtek': 'Avtek',
      'campus-events': 'Campus Events',
      'cfmu': 'CFMU',
      'child-care-centre': 'Child Care Centre',
      'diversity-equity-network': 'Diversity + Equity Network',
      'efrt': 'EFRT',
      'food-collective-centre': 'Food Collective Centre',
      'the-grind': 'The Grind',
      'hotspot': 'HotSpot',
      'macademics': 'Macademics',
      'maccess': 'Maccess',
      'maroons': 'Maroons',
      'ombuds': 'Ombuds',
      'pride-community-centre': 'Pride Community Centre',
      'shec': 'SHEC',
      'spark': 'Spark',
      'swat': 'SWAT',
      'the-silhouette': 'The Silhouette',
      'twelve-eighty': 'Twelve Eighty',
      'union-market': 'Union Market',
      'wgen': 'WGEN',
    }
    return serviceMap[value] || value
  }

  const handleSubmit = async () => {
    if (!formData) return

    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        selectedPackage,
        selectedAddOns,
        addOnQuantities,
        totalPrice,
      }

      const response = await fetch('/api/submit-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      const result = await response.json()

      // Clear sessionStorage after successful submission
      sessionStorage.removeItem('formData')
      sessionStorage.removeItem('selectedPackage')
      sessionStorage.removeItem('selectedAddOns')
      sessionStorage.removeItem('addOnQuantities')
      sessionStorage.removeItem('totalPrice')

      // Redirect to success page with tracking info
      const params = new URLSearchParams()
      if (result.ticketId) params.set('ticketId', result.ticketId)

      router.push(`/success?${params.toString()}`)
    } catch (error) {
      console.error('Error submitting:', error)
      alert('There was an error submitting your request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!formData || !pricingData) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header currentPage="order" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-underground-teal mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header currentPage="order" />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Review Your Order</h1>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Contact Information */}
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-4 border-underground-teal">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{getServiceLabel(formData.service)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <EmptyFieldDisplay value={formData.position} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
              </div>
            </section>

            {/* Event Details - Main Fields */}
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-4 border-underground-teal">
                Event Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Event Name</p>
                  <p className="font-medium">{formData.eventName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Date</p>
                  <p className="font-medium">{formData.eventDate}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <EmptyFieldDisplay value={formData.startTime} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <EmptyFieldDisplay value={formData.endTime} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <EmptyFieldDisplay value={formData.location} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collaboration Details</p>
                  {formData.collaborationDetails ? (
                    <p className="whitespace-pre-wrap font-medium">{formData.collaborationDetails}</p>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Visual References */}
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-gray-900">Visual References</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Design Link</p>
                  {formData.visualReferenceLink ? (
                    <a
                      href={formData.visualReferenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-underground-teal hover:underline text-sm break-all"
                    >
                      {formData.visualReferenceLink}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Not provided</span>
                  )}
                </div>
                {formData.uploadedFiles?.visualReferences && formData.uploadedFiles.visualReferences.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Uploaded Files:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {formData.uploadedFiles.visualReferences.map((file, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* Call To Action & Link */}
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">Call To Action</h3>
                  {formData.callToAction ? (
                    <p className="text-sm font-medium">{formData.callToAction}</p>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Not provided</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">Link</h3>
                  {formData.link ? (
                    <a
                      href={formData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-underground-teal hover:underline text-sm break-all"
                    >
                      {formData.link}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Not provided</span>
                  )}
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-gray-900">Additional Information</h3>
              {formData.additionalInfo ? (
                <p className="whitespace-pre-wrap text-sm">{formData.additionalInfo}</p>
              ) : (
                <span className="text-gray-400 italic text-sm">Not provided</span>
              )}
            </section>

            {/* Content */}
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-gray-900">Content</h3>
              <p className="whitespace-pre-wrap text-sm">{formData.content}</p>
            </section>

            {/* Additional Attachments */}
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-4 border-underground-teal">
                Additional Attachments
              </h2>
              {formData.uploadedFiles?.attachments && formData.uploadedFiles.attachments.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {formData.uploadedFiles.attachments.map((file, idx) => (
                    <li key={idx} className="text-sm text-gray-700">{file}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic text-sm">No files uploaded</p>
              )}
            </section>
          </div>
        </div>

        {/* Package & Add-Ons - Full Width */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b-4 border-underground-teal">
            Package & Add-Ons
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Selected Package</p>
              {selectedPackage ? (
                <p className="font-medium text-lg">{selectedPackage.name}</p>
              ) : (
                <p className="text-gray-400 italic">No package selected</p>
              )}
            </div>

            {selectedAddOns.length > 0 ? (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Selected Add-Ons</p>
                <ul className="space-y-2">
                  {selectedAddOns.map((addOnId) => {
                    const addOn = getAddOnById(addOnId)
                    if (!addOn) return null
                    const quantity = addOnQuantities[addOnId] || (addOnId === 'rave-cards' ? 100 : 1)
                    const price = addOnId === 'rave-cards'
                      ? calculateRaveCardsPrice(quantity)
                      : typeof addOn.price === 'number' ? addOn.price * quantity : 0

                    return (
                      <li key={addOnId} className="flex justify-between items-center text-sm">
                        <span className="font-medium">
                          {addOn.name} {quantity > 1 && `(×${quantity})`}
                        </span>
                        <span className="font-semibold">
                          ${price.toFixed(2)}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <div className="pt-3 border-t-2 border-gray-300 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">Add-Ons Total:</span>
                    <span className="font-bold text-2xl text-underground-teal">
                      ${selectedAddOns.reduce((total, addOnId) => {
                        const addOn = getAddOnById(addOnId)
                        if (!addOn) return total
                        const quantity = addOnQuantities[addOnId] || (addOnId === 'rave-cards' ? 100 : 1)
                        if (addOnId === 'rave-cards') {
                          return total + calculateRaveCardsPrice(quantity)
                        }
                        return total + (typeof addOn.price === 'number' ? addOn.price * quantity : 0)
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-400 italic text-sm">No add-ons selected</p>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 max-w-7xl mx-auto border-t-4 border-underground-teal pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/add-ons')}
          >
            Back to Add-Ons
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Submit Request
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
