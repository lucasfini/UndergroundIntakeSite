'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from '@/lib/msalConfig'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BarChart3, Users, Clock, CheckCircle } from 'lucide-react'

interface ProjectStats {
  total: number
  submitted: number
  queued: number
  inProgress: number
  review: number
  completed: number
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [bannerMessage, setBannerMessage] = useState('')
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    submitted: 0,
    queued: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
  })

  useEffect(() => {
    // Initialize MSAL
    const initializeMsal = async () => {
      const instance = new PublicClientApplication(msalConfig)
      await instance.initialize()
      setMsalInstance(instance)
    }

    initializeMsal()

    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth')
    const storedUserName = sessionStorage.getItem('admin_user_name')
    if (auth === 'true') {
      setIsAuthenticated(true)
      if (storedUserName) setUserName(storedUserName)
      loadData()
    } else {
      router.push('/admin')
    }
  }, [router])

  const loadData = async () => {
    try {
      // Load banner message
      const configResponse = await fetch('/api/site-config')
      if (configResponse.ok) {
        const config = await configResponse.json()
        setBannerMessage(config.bannerMessage || '')
      }

      // Load project stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setProjectStats(stats)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleSaveBanner = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerMessage }),
      })

      if (response.ok) {
        alert('Banner message updated successfully!')
      } else {
        alert('Failed to update banner message')
      }
    } catch (error) {
      alert('Error updating banner message')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-[#0f243a] via-[#0f243a] to-[#0b1f33]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#A6E7DE]/20 blur-3xl" />
        <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Sidebar */}
      <AdminSidebar
        msalInstance={msalInstance}
        userName={userName}
        onLogout={() => {
          setIsAuthenticated(false)
          setUserName('')
        }}
      />

      {/* Main Content */}
      <main className="relative flex-1 ml-64 text-[#0f243a] z-10">
        {/* Page Header */}
        <div className="relative overflow-hidden px-8 py-7 shadow-lg border-b border-white/10" style={{ background: 'linear-gradient(120deg, #A6E7DE 0%, #bfeee6 45%, #ffffff 100%)' }}>
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute right-6 bottom-4 h-16 w-16 rounded-full bg-[#0f243a]/10 blur-xl" />
          <div className="relative space-y-2">
            <span className="inline-flex items-center rounded-full bg-[#0f243a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
              Admin Console
            </span>
            <h1 className="text-3xl font-bold text-[#0f243a]">Overview</h1>
            <p className="text-sm text-[#1C3450]">
              Manage your projects and site settings from one central dashboard.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-white/70">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{projectStats.total}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Projects</h3>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-white/70">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{projectStats.queued}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">In Queue</h3>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-white/70">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{projectStats.inProgress}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">In Progress</h3>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-white/70">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{projectStats.completed}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
            </div>
          </div>

          {/* Banner Message Editor */}
          <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0f243a] mb-4">Site Banner Message</h2>
            <p className="text-sm text-gray-600 mb-4">
              Edit the message that appears below the navigation bar on the frontend site. Leave empty to show the default hours message.
            </p>
            <div className="space-y-4">
              <Input
                label="Banner Message"
                value={bannerMessage}
                onChange={(e) => setBannerMessage(e.target.value)}
                placeholder="We are open Monday - Friday | 10am - 4pm"
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveBanner} isLoading={isLoading}>
                  Save Banner Message
                </Button>
              </div>
            </div>
          </div>

          {/* Project Status Breakdown */}
          <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0f243a] mb-4">Project Status Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Submitted</span>
                <span className="text-sm font-bold text-gray-900">{projectStats.submitted}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Queued</span>
                <span className="text-sm font-bold text-gray-900">{projectStats.queued}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">In Progress</span>
                <span className="text-sm font-bold text-gray-900">{projectStats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Under Review</span>
                <span className="text-sm font-bold text-gray-900">{projectStats.review}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Completed</span>
                <span className="text-sm font-bold text-gray-900">{projectStats.completed}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
