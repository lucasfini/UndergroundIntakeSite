'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import ProgressBar from '@/components/ProgressBar'

interface Project {
  id: string
  submissionId: string
  zendeskTicketId: string | null
  customerName: string
  customerEmail: string
  service: string
  eventName: string
  eventDate: string
  status: 'SUBMITTED' | 'QUEUED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETE'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  queuePosition: number | null
  assignedTo: string | null
  createdAt: string
  estimatedCompletionDate: string | null
  selectedPackageName: string | null
  totalPrice: number
  statusHistory: Array<{
    id: string
    newStatus: string
    createdAt: string
  }>
}

export default function AdminQueuePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [reorderingProjectId, setReorderingProjectId] = useState<string | null>(null)

  // Update form state
  const [newStatus, setNewStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [estimatedDate, setEstimatedDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    // Check authentication
    const auth = sessionStorage.getItem('admin_auth')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    loadProjects()
  }, [router])

  useEffect(() => {
    // Filter projects based on status
    if (statusFilter === 'ALL') {
      setFilteredProjects(projects)
    } else {
      setFilteredProjects(projects.filter(p => p.status === statusFilter))
    }
  }, [statusFilter, projects])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/queue')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setNewStatus(project.status)
    setAssignedTo(project.assignedTo || '')
    setEstimatedDate(
      project.estimatedCompletionDate
        ? new Date(project.estimatedCompletionDate).toISOString().split('T')[0]
        : ''
    )
    setNotes('')
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/projects/${selectedProject.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedTo: assignedTo || null,
          estimatedCompletionDate: estimatedDate || null,
          notes: notes || null
        })
      })

      if (response.ok) {
        alert('Project status updated successfully!')
        setSelectedProject(null)
        loadProjects()
      } else {
        alert('Failed to update project status')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Error updating project')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReorderQueue = async (projectId: string, newPosition: number) => {
    setReorderingProjectId(projectId)
    try {
      // Get all QUEUED projects sorted by current queue position
      const queuedProjects = projects
        .filter(p => p.status === 'QUEUED' && p.queuePosition !== null)
        .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0))

      // Find the project being moved
      const projectIndex = queuedProjects.findIndex(p => p.id === projectId)
      if (projectIndex === -1) return

      // Remove the project from its current position
      const [movedProject] = queuedProjects.splice(projectIndex, 1)

      // Insert it at the new position (newPosition is 1-based, convert to 0-based)
      queuedProjects.splice(newPosition - 1, 0, movedProject)

      // Create array of project IDs in new order
      const reorderedIds = queuedProjects.map(p => p.id)

      // Send to API
      const response = await fetch('/api/admin/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: reorderedIds })
      })

      if (response.ok) {
        // Reload projects to show updated queue
        await loadProjects()
      } else {
        alert('Failed to reorder queue')
      }
    } catch (error) {
      console.error('Error reordering queue:', error)
      alert('Error reordering queue')
    } finally {
      setReorderingProjectId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800'
      case 'LOW':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-purple-100 text-purple-800'
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800'
      case 'REVIEW':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  }

  return (
    <div className="flex min-h-screen bg-[#A6E7DE]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Page Header */}
        <div className="bg-white/50 border-b border-[#1C3450]/10 px-8 py-6">
          <h1 className="text-3xl font-bold text-[#1C3450]">Queue Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage project status</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 rounded-lg shadow p-6 border border-[#1C3450]/10">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">Projects</h2>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">All Status</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="QUEUED">Queued</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETE">Complete</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={loadProjects}
                    isLoading={isLoading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Projects Table */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No projects found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Track #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Event
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Assigned To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProjects.map((project) => (
                        <tr
                          key={project.id}
                          className={`hover:bg-gray-50 ${
                            selectedProject?.id === project.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm font-mono text-gray-600">
                              {project.zendeskTicketId || project.submissionId}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {project.service}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {project.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.customerEmail}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {project.eventName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(project.eventDate)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="text-sm text-gray-600">
                              {project.assignedTo || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="outline"
                              onClick={() => handleSelectProject(project)}
                              className="!px-3 !py-1 text-sm"
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Project Details & Update Form */}
          <div className="lg:col-span-1">
            {selectedProject ? (
              <div className="bg-white/95 rounded-lg shadow p-6 border border-[#1C3450]/10 sticky top-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">Update Status</h3>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Project Info */}
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-medium mb-3">{selectedProject.customerName}</p>

                  <p className="text-sm text-gray-500 mb-1">Event</p>
                  <p className="font-medium mb-3">{selectedProject.eventName}</p>

                  <p className="text-sm text-gray-500 mb-1">Ticket ID</p>
                  <p className="font-mono text-sm">
                    {selectedProject.zendeskTicketId || selectedProject.submissionId}
                  </p>
                </div>

                {/* Update Form */}
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="QUEUED">Queued</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPLETE">Complete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To (optional)
                    </label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Staff member name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Completion (optional)
                    </label>
                    <input
                      type="date"
                      value={estimatedDate}
                      onChange={(e) => setEstimatedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add notes about this status change..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={isUpdating}
                    className="w-full"
                  >
                    Update Status
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-white/90 rounded-lg shadow p-6 border border-[#1C3450]/10">
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-2">📋</div>
                  <p>Select a project to manage</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {['QUEUED', 'IN_PROGRESS', 'REVIEW', 'COMPLETE'].map((status) => {
            const count = projects.filter((p) => p.status === status).length
            return (
              <div key={status} className="bg-white/90 rounded-lg shadow p-4 border border-[#1C3450]/10">
                <p className="text-sm text-gray-500 mb-1">{status.replace('_', ' ')}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            )
          })}
        </div>
      </div>
      </main>
    </div>
  )
}
