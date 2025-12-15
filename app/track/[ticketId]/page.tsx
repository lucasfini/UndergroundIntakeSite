'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import ProgressBar, { ProjectStatus } from '@/components/ProgressBar'
import { AlertCircle } from 'lucide-react'

interface Project {
  id: string
  submissionId: string
  zendeskTicketId: string | null
  customerName: string
  customerEmail: string
  service: string
  eventName: string
  eventDate: string
  status: ProjectStatus
  priority: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  estimatedCompletionDate: string | null
  completedAt: string | null
  selectedPackageName: string | null
  totalPrice: number
}

interface QueueInfo {
  position: number | null
  totalInQueue: number
}

interface StatusHistory {
  id: string
  oldStatus: ProjectStatus | null
  newStatus: ProjectStatus
  notes: string | null
  createdAt: string
}

export default function TrackPage() {
  const params = useParams()
  const ticketId = params?.ticketId as string

  const [project, setProject] = useState<Project | null>(null)
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/track/${ticketId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Project not found. Please check your tracking ID.')
          } else {
            setError('Failed to load project information.')
          }
          return
        }

        const data = await response.json()
        setProject(data.project)
        setQueueInfo(data.queueInfo)
        setStatusHistory(data.statusHistory)
      } catch (err) {
        setError('An error occurred while loading project information.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) {
      fetchProject()
    }
  }, [ticketId])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#0f243a]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6E7DE] mx-auto mb-4"></div>
            <p className="text-[#A6E7DE]">Loading project information...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="min-h-screen flex flex-col bg-[#0f243a]">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-[#1C3450] mb-2">Project Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-[#1C3450] text-[#A6E7DE] px-6 py-3 rounded-lg hover:bg-[#10283d] transition font-semibold"
            >
              Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusDescription = (status: ProjectStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return 'Your project has been submitted and is awaiting review.'
      case 'QUEUED':
        return 'Your project is in our queue and will be started soon.'
      case 'IN_PROGRESS':
        return 'We are actively working on your project.'
      case 'REVIEW':
        return 'Your project is being reviewed for quality assurance.'
      case 'COMPLETE':
        return 'Your project is complete! We will contact you shortly.'
      default:
        return ''
    }
  }

  const getEstimatedCompletion = () => {
    if (!project.selectedPackageName || !project.createdAt) return null

    // Parse turnaround time based on package name
    let daysToComplete = 0

    switch (project.selectedPackageName) {
      case 'Digital Package':
        daysToComplete = 4 // Max of 3-4 days
        break
      case 'Multi-Event Package':
        daysToComplete = 14 // Max of 1-2 weeks (14 days)
        break
      case 'Custom Instagram Package':
        return 'Based on project complexity'
      default:
        return null
    }

    // Calculate estimated completion date
    const submittedDate = new Date(project.createdAt)
    const estimatedDate = new Date(submittedDate)
    estimatedDate.setDate(estimatedDate.getDate() + daysToComplete)

    // Calculate days/weeks remaining
    const now = new Date()
    const daysRemaining = Math.ceil((estimatedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (project.status === 'COMPLETE') {
      return 'Completed'
    }

    if (daysRemaining <= 0) {
      return 'Completing soon'
    }

    if (daysRemaining === 1) {
      return '1 day remaining'
    } else if (daysRemaining < 7) {
      return `${daysRemaining} days remaining`
    } else if (daysRemaining === 7) {
      return '1 week remaining'
    } else if (daysRemaining < 14) {
      const weeks = Math.floor(daysRemaining / 7)
      const days = daysRemaining % 7
      if (days === 0) {
        return `${weeks} week${weeks > 1 ? 's' : ''} remaining`
      }
      return `${weeks} week${weeks > 1 ? 's' : ''} and ${days} day${days > 1 ? 's' : ''} remaining`
    } else {
      const weeks = Math.ceil(daysRemaining / 7)
      return `${weeks} weeks remaining`
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0f243a]">
      <Header />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#A6E7DE] mb-2">
            Project Tracking
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Track Your Project</h1>
          <p className="text-[#d6e7e3]">
            Track ID: <span className="font-mono font-semibold text-[#A6E7DE]">{project.zendeskTicketId || project.submissionId}</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-semibold text-[#1C3450] mb-6">Project Status</h2>
            <ProgressBar currentStatus={project.status} className="mb-6" />

            {getEstimatedCompletion() && (
              <div className="bg-blue-50 border-l-4 border-[#1C3450] p-4 rounded">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Estimated Time Until Completion</p>
                  <p className="text-[#1C3450] font-bold text-lg">
                    {getEstimatedCompletion()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Queue Status */}
          {project.status === 'QUEUED' && (
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
              <div className="bg-blue-50 border-l-4 border-[#1C3450] p-4 rounded">
                <p className="text-[#1C3450] font-medium">
                  Your project is currently in our queue and will be started soon.
                </p>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-semibold text-[#1C3450] mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium text-[#1C3450]">{project.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium text-[#1C3450]">{project.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Name</p>
                <p className="font-medium text-[#1C3450]">{project.eventName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Package</p>
                <p className="font-medium text-[#1C3450]">{project.selectedPackageName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted On</p>
                <p className="font-medium text-[#1C3450]">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="font-medium text-[#1C3450]">{formatDate(project.eventDate)}</p>
              </div>
              {project.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium text-[#1C3450]">{project.assignedTo}</p>
                </div>
              )}
              {project.estimatedCompletionDate && (
                <div>
                  <p className="text-sm text-gray-500">Estimated Completion</p>
                  <p className="font-medium text-[#1C3450]">{formatDate(project.estimatedCompletionDate)}</p>
                </div>
              )}
              {project.completedAt && (
                <div>
                  <p className="text-sm text-gray-500">Completed On</p>
                  <p className="font-medium text-[#1C3450]">{formatDate(project.completedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 text-center">
            <p className="text-[#d6e7e3]">Questions about your project?</p>
            <a href="/contact" className="text-[#A6E7DE] hover:text-white font-semibold transition">
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
