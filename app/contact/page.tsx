'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. We will get back to you soon.',
        })
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to send message. Please try again.',
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
      <Header currentPage="contact" />

      <div className="flex-1 w-full flex flex-col">
        {/* Contact Us Title */}
        <div className="w-full py-8 text-center" style={{ backgroundColor: '#1C3450', color: '#A6E7DE' }}>
          <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: 'Gotham Bold, Helvetica, Arial, sans-serif' }}>
            Contact Us
          </h1>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 w-full py-12" style={{ backgroundColor: '#A6E7DE' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side - Information */}
              <div className="flex items-center">
                <div className="space-y-6" style={{ color: '#1C3450' }}>
                  <p className="text-xl md:text-2xl leading-relaxed font-semibold">
                    Due to the high volume of requests, all orders will be processed
                    within 1-2 business days on a first come first serve basis.
                  </p>

                  <p className="text-xl md:text-2xl leading-relaxed">
                    We recommend getting in touch via email and
                    we will get back to you as soon as possible.
                  </p>

                  <p className="text-xl md:text-2xl leading-relaxed">
                    Please note that our standard business hours are Monday-Friday, 10am-4pm.
                  </p>

                  <p className="text-xl md:text-2xl leading-relaxed font-semibold">
                    Orders will not be processed on weekends.
                  </p>

                  <div className="pt-8 border-t-2" style={{ borderColor: '#1C3450' }}>
                    <div className="space-y-4 text-xl md:text-2xl">
                      <p className="font-bold">1280 Main Street West, MUSC B117, L8S 4L8, Hamilton, ON</p>
                      <p>
                        <a href="mailto:ugprint@msu.mcmaster.ca" className="hover:opacity-70 transition font-semibold">
                          ugprint@msu.mcmaster.ca
                        </a>
                      </p>
                      <p className="font-semibold">905.525.9140 x22027</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Form */}
              <div className="flex items-center">
                <div className="w-full rounded-lg p-8" style={{ backgroundColor: '#1C3450' }}>
                  <p className="text-sm mb-6" style={{ color: '#A6E7DE' }}>
                    Fields marked with an * are required
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-lg font-medium mb-2" style={{ color: '#A6E7DE' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:outline-none transition"
                        style={{
                          borderColor: '#A6E7DE',
                          backgroundColor: 'white',
                          color: '#1C3450',
                        }}
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-lg font-medium mb-2" style={{ color: '#A6E7DE' }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:outline-none transition"
                        style={{
                          borderColor: '#A6E7DE',
                          backgroundColor: 'white',
                          color: '#1C3450',
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-lg font-medium mb-2" style={{ color: '#A6E7DE' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:outline-none transition"
                        style={{
                          borderColor: '#A6E7DE',
                          backgroundColor: 'white',
                          color: '#1C3450',
                        }}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-lg font-medium mb-2" style={{ color: '#A6E7DE' }}>
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:outline-none transition resize-none"
                        style={{
                          borderColor: '#A6E7DE',
                          backgroundColor: 'white',
                          color: '#1C3450',
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-lg font-bold text-xl hover:opacity-80 transition disabled:opacity-50"
                      style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}
                    >
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </button>

                    {/* Status Message */}
                    {submitStatus.type && (
                      <div
                        className={`p-4 rounded-lg text-center ${
                          submitStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                        style={{
                          color: submitStatus.type === 'success' ? '#065f46' : '#991b1b',
                        }}
                      >
                        {submitStatus.message}
                      </div>
                    )}
                  </form>
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
