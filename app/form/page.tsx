'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { FileUpload } from '@/components/ui/FileUpload'
import { Tooltip } from '@/components/ui/Tooltip'
import { useUserAuth } from '@/lib/contexts/UserAuthContext'

interface FormErrors {
  [key: string]: string
}

const serviceOptions = [
  { value: 'avtek', label: 'Avtek' },
  { value: 'campus-events', label: 'Campus Events' },
  { value: 'cfmu', label: 'CFMU' },
  { value: 'diversity-equity-network', label: 'Diversity + Equity Network' },
  { value: 'efrt', label: 'EFRT' },
  { value: 'first-year-council', label: 'First Year Council' },
  { value: 'food-collective-centre', label: 'Food Collective Centre' },
  { value: 'hotspot', label: 'HotSpot' },
  { value: 'macademics', label: 'Macademics' },
  { value: 'maccess', label: 'Maccess' },
  { value: 'maroons', label: 'Maroons' },
  { value: 'ombuds', label: 'Ombuds' },
  { value: 'pride', label: 'Pride' },
  { value: 'shec', label: 'SHEC' },
  { value: 'spark', label: 'Spark' },
  { value: 'swhat', label: 'SWHAT' },
  { value: 'wgen', label: 'WGEN' },
]

// Helper function to convert service name to value format
const getServiceValue = (serviceName: string): string => {
  const option = serviceOptions.find(opt => opt.label === serviceName)
  return option ? option.value : serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export default function FormPage() {
  const router = useRouter()
  const { isAuthenticated, userData, isLoading: authLoading, logout } = useUserAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState({
    service: '',
    name: '',
    position: '',
    email: '',
    eventName: '',
    time: '',
    eventDate: '',
    location: '',
    link: '',
    hasCanvaLink: false,
    canvaLink: '',
    callToAction: '',
    content: '',
    additionalInfo: '',
  })

  const [logoFiles, setLogoFiles] = useState<File[]>([])
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

  // Check authentication - redirect to select-service if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/select-service')
    }
  }, [authLoading, isAuthenticated, router])

  // Pre-fill Contact Info fields with authenticated user data
  useEffect(() => {
    if (userData && isAuthenticated) {
      setFormData((prev) => ({
        ...prev,
        service: userData.service, // Use service name directly from auth
        name: userData.name,
        position: userData.position,
        email: userData.email,
      }))
    }
  }, [userData, isAuthenticated])

  // Load saved form data from sessionStorage on mount (when coming back from add-ons)
  useEffect(() => {
    const sessionData = sessionStorage.getItem('formData')
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData)
        // Extract only the form fields, not submissionId or uploadedFiles
        const { submissionId, uploadedFiles, ...formFields } = parsedData
        // Don't override authenticated contact info fields
        const { service, name, position, email, ...otherFields } = formFields
        setFormData((prev) => ({
          ...prev,
          ...otherFields,
        }))
      } catch (error) {
        console.error('Error loading session form data:', error)
      }
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === 'hasCanvaLink' && !checked ? { canvaLink: '' } : {})
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (name === 'hasCanvaLink' && errors.canvaLink) {
      setErrors((prev) => ({ ...prev, canvaLink: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields validation
    if (!formData.service) newErrors.service = 'Service is required'
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.eventName) newErrors.eventName = 'Event name is required'
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required'
    if (!formData.content) newErrors.content = 'Content description is required'
    if (formData.hasCanvaLink && !formData.canvaLink) newErrors.canvaLink = 'Please provide your Canva link'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsLoading(true)

    try {
      // Create FormData for file uploads
      const submitData = new FormData()

      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, typeof value === 'boolean' ? String(value) : value)
      })

      // Append files
      logoFiles.forEach((file) => {
        submitData.append('logos', file)
      })
      attachmentFiles.forEach((file) => {
        submitData.append('attachments', file)
      })

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const result = await response.json()

      // Store uploaded file information
      const uploadedFiles = {
        logos: logoFiles.map(f => f.name),
        attachments: attachmentFiles.map(f => f.name),
      }

      // Save form data to sessionStorage for add-ons page
      sessionStorage.setItem('formData', JSON.stringify({
        ...formData,
        submissionId: result.id,
        uploadedFiles
      }))

      router.push('/add-ons')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error submitting your form. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
        <Header currentPage="order" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" style={{ color: '#A6E7DE' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl font-medium" style={{ color: '#A6E7DE' }}>Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
      {/* Header */}
      <Header currentPage="order" />

      <div className="flex-1 w-full flex flex-col">
        {/* Project Request Title */}
        <div className="w-full py-8 text-center relative" style={{ backgroundColor: '#1C3450', color: '#A6E7DE' }}>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Gotham Bold, Helvetica, Arial, sans-serif' }}>
            Project Request Form
          </h1>
          {/* Logout Button */}
          {isAuthenticated && userData && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <span className="text-white/80">
                Signed in as <span className="font-semibold">{userData.name}</span> ({userData.service})
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to sign out? You will need to re-authenticate to access the form again.')) {
                    logout()
                    router.push('/select-service')
                  }
                }}
                className="ml-2 px-3 py-1 text-xs font-semibold rounded hover:opacity-80 transition-opacity"
                style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="w-full py-8 sm:py-12" style={{ backgroundColor: '#A6E7DE' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
              {/* Contact Info Section */}
              <section className="p-4 sm:p-6 border-b-2" style={{ borderColor: '#A6E7DE' }}>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b" style={{ color: '#1C3450', borderColor: '#E5E7EB' }}>
                  Contact Info
                </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                {isAuthenticated ? (
                  <Input
                    label="Service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    error={errors.service}
                    tooltip="Service is automatically filled from your MSU credentials"
                    required
                    disabled={true}
                  />
                ) : (
                  <Select
                    label="Service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    options={serviceOptions}
                    error={errors.service}
                    tooltip="Please select your service"
                    required
                  />
                )}
              </div>
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                tooltip="Name is automatically filled from your MSU credentials"
                required
                disabled={isAuthenticated}
              />
              <Input
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                tooltip="Position is automatically filled from your MSU credentials"
                disabled={isAuthenticated}
              />
              <div className="md:col-span-2">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  tooltip="Email is automatically filled from your MSU credentials"
                  required
                  disabled={isAuthenticated}
                />
              </div>
            </div>
          </section>

          {/* Event Details Section */}
          <section className="p-4 sm:p-6 border-b-2" style={{ borderColor: '#A6E7DE' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b" style={{ color: '#1C3450', borderColor: '#E5E7EB' }}>
              Event Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Event Name"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                error={errors.eventName}
                tooltip="The name of your event, campaign, or project"
                required
              />
              <Input
                label="Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleInputChange}
                tooltip="What time does your event start? (optional)"
              />
              <Input
                label="Event Date"
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={handleInputChange}
                error={errors.eventDate}
                tooltip="When is your event happening? This helps us prioritize your request"
                required
              />
              <div>
                <FileUpload
                  label="Logos"
                  accept="image/*"
                  multiple
                  onChange={setLogoFiles}
                  tooltip="Upload any logos you'd like included in the design (e.g., service logo, sponsor logos)"
                  description="Upload company logos, event logos, or sponsor logos. Accepted formats: PNG, JPG, SVG"
                />
              </div>
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                tooltip="Where is the event taking place? (e.g., MUSC Room 201, Virtual, TBD)"
              />
              <Input
                label="Link"
                name="link"
                type="url"
                placeholder="https://"
                value={formData.link}
                onChange={handleInputChange}
                tooltip="A relevant URL for your event (e.g., registration link, event page, Instagram link)"
              />
            </div>
          </section>

          {/* Canva Link Section */}
          <section className="p-4 sm:p-6 border-b-2" style={{ borderColor: '#A6E7DE' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ color: '#1C3450', borderColor: '#E5E7EB' }}>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                Do you already have a Canva design?
                <Tooltip content="If you started a design in Canva, share the view/edit link so we can build from it. Make sure link sharing is enabled." />
              </h2>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="hasCanvaLink"
                  checked={formData.hasCanvaLink}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5"
                />
                <span>Yes, I have a Canva link</span>
              </label>
            </div>

            {formData.hasCanvaLink && (
              <div className="mt-4">
                <Input
                  label="Canva Link"
                  name="canvaLink"
                  type="url"
                  placeholder="https://www.canva.com/..."
                  value={formData.canvaLink}
                  onChange={handleInputChange}
                  error={errors.canvaLink}
                  tooltip="Paste your Canva share link with edit access so we can make updates."
                />
              </div>
            )}
          </section>

          {/* Call To Action Section */}
          <section className="p-4 sm:p-6 border-b-2" style={{ borderColor: '#A6E7DE' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b flex items-center gap-2" style={{ color: '#1C3450', borderColor: '#E5E7EB' }}>
              Call To Action
              <Tooltip content="A short phrase that tells people what action to take (e.g., 'Register Now', 'Join Us', 'Learn More', 'RSVP Today'). This is the main message you want viewers to see." />
            </h2>
            <Input
              name="callToAction"
              placeholder="e.g., Register Now, Join Us, Learn More"
              value={formData.callToAction}
              onChange={handleInputChange}
            />
          </section>

          {/* Content Section */}
          <section className="p-4 sm:p-6 border-b-2" style={{ borderColor: '#A6E7DE' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b flex items-center gap-2" style={{ color: '#1C3450', borderColor: '#E5E7EB' }}>
              Content
              <Tooltip content="Describe all the text, information, and key details you want on your design. Include event descriptions, important dates, pricing, or any other information viewers should know." />
            </h2>
            <TextArea
              name="content"
              rows={6}
              placeholder="Describe the content you'd like to include in your design..."
              value={formData.content}
              onChange={handleInputChange}
              error={errors.content}
              required
            />
          </section>

          {/* Additional Info Section */}
          <section className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 border-b flex items-center gap-2" style={{ color: '#1C3450', borderColor: '#E5E7EB' }}>
              Additional links, references, QR codes or linktree
              <Tooltip content="Any extra details, inspiration links, QR codes you need created, Linktree URLs, reference materials, or files that will help us create your design" />
            </h2>
            <TextArea
              name="additionalInfo"
              rows={4}
              placeholder="Include any additional information, links, or references..."
              value={formData.additionalInfo}
              onChange={handleInputChange}
            />
            <div className="mt-4">
              <FileUpload
                label="Additional Attachments"
                accept="*"
                multiple
                onChange={setAttachmentFiles}
                description="Upload reference materials, inspiration images, previous designs, or any documents that will help us understand your vision"
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="px-4 sm:px-6 py-6 border-t-2" style={{ borderColor: '#A6E7DE', backgroundColor: '#F9FAFB' }}>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Clear sessionStorage when user cancels
                  sessionStorage.removeItem('formData')
                  sessionStorage.removeItem('selectedPackage')
                  sessionStorage.removeItem('selectedAddOns')
                  sessionStorage.removeItem('totalPrice')
                  // Clear authentication - user must re-authenticate next time
                  logout()
                  // Redirect to home
                  router.push('/')
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Continue to Add-Ons
              </Button>
            </div>
          </div>
        </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
