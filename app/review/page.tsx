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
  time: string
  eventDate: string
  location: string
  link: string
  hasCanvaLink: boolean
  canvaLink: string
  callToAction: string
  content: string
  additionalInfo: string
  submissionId?: string
  uploadedFiles?: {
    logos: string[]
    attachments: string[]
  }
}

interface SelectedPackage {
  id: string
  name: string
  price: number
}

export default function ReviewPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
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
    const storedTotal = sessionStorage.getItem('totalPrice')

    if (!storedFormData) {
      alert('No form data found. Please start from the beginning.')
      router.push('/form')
      return
    }

    setFormData(JSON.parse(storedFormData))
    setSelectedPackage(storedPackage ? JSON.parse(storedPackage) : null)
    setSelectedAddOns(storedAddOns ? JSON.parse(storedAddOns) : [])
    setTotalPrice(storedTotal ? parseFloat(storedTotal) : 0)
  }, [router])

  const getAddOnById = (id: string) => {
    return pricingData?.addOns.find((a) => a.id === id)
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
      sessionStorage.removeItem('totalPrice')

      // Redirect to success page with tracking info
      const params = new URLSearchParams()
      if (result.ticketId) params.set('ticketId', result.ticketId)
      if (result.queuePosition) params.set('queuePosition', result.queuePosition.toString())

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
      {/* Header */}
      <Header currentPage="order" />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Review Your Order</h1>

        {/* Contact Information */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
            Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service</p>
              <p className="font-medium">{getServiceLabel(formData.service)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{formData.name}</p>
            </div>
            {formData.position && (
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-medium">{formData.position}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{formData.email}</p>
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
            Event Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Event Name</p>
              <p className="font-medium">{formData.eventName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Event Date</p>
              <p className="font-medium">{formData.eventDate}</p>
            </div>
            {formData.time && (
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{formData.time}</p>
              </div>
            )}
            {formData.location && (
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{formData.location}</p>
              </div>
            )}
            {formData.link && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Link</p>
                <p className="font-medium break-all">
                  <a
                    href={formData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-underground-teal hover:underline"
                  >
                    {formData.link}
                  </a>
                </p>
              </div>
            )}
            {formData.hasCanvaLink && formData.canvaLink && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Canva Link</p>
                <p className="font-medium break-all">
                  <a
                    href={formData.canvaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-underground-teal hover:underline"
                  >
                    {formData.canvaLink}
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        {formData.callToAction && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
              Call To Action
            </h2>
            <p className="font-medium">{formData.callToAction}</p>
          </section>
        )}

        {/* Content */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
            Content
          </h2>
          <p className="whitespace-pre-wrap">{formData.content}</p>
        </section>

        {/* Additional Info */}
        {formData.additionalInfo && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
              Additional Information
            </h2>
            <p className="whitespace-pre-wrap">{formData.additionalInfo}</p>
          </section>
        )}

        {/* Uploaded Files */}
        {formData.uploadedFiles && (formData.uploadedFiles.logos.length > 0 || formData.uploadedFiles.attachments.length > 0) && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
              Uploaded Files
            </h2>
            {formData.uploadedFiles.logos.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Logos:</p>
                <ul className="list-disc list-inside space-y-1">
                  {formData.uploadedFiles.logos.map((file, idx) => (
                    <li key={idx} className="text-gray-700">{file}</li>
                  ))}
                </ul>
              </div>
            )}
            {formData.uploadedFiles.attachments.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Attachments:</p>
                <ul className="list-disc list-inside space-y-1">
                  {formData.uploadedFiles.attachments.map((file, idx) => (
                    <li key={idx} className="text-gray-700">{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Selected Package */}
        {selectedPackage && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
              Selected Package
            </h2>
            <p className="font-medium text-lg">{selectedPackage.name}</p>
          </section>
        )}

        {/* Selected Add-Ons */}
        {selectedAddOns.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-underground-teal">
              Selected Add-Ons
            </h2>
            <ul className="space-y-2">
              {selectedAddOns.map((addOnId) => {
                const addOn = getAddOnById(addOnId)
                if (!addOn) return null
                return (
                  <li key={addOnId}>
                    <span className="font-medium">{addOn.name}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
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

      {/* Footer */}
      <Footer />
    </main>
  )
}
