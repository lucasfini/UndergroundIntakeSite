'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/Button'

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
  updatedAt: string
  estimatedCompletionDate: string | null
  selectedPackageName: string | null
  totalPrice: number
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentProjectsOpen, setCurrentProjectsOpen] = useState(true)
  const [completedProjectsOpen, setCompletedProjectsOpen] = useState(false)
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set())
  const [selectedMonth, setSelectedMonth] = useState<string>('')

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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

  // Separate current and completed projects
  const currentProjects = projects.filter(p => p.status !== 'COMPLETE')
  const completedProjects = projects.filter(p => p.status === 'COMPLETE')

  // Checkbox selection handlers
  const handleSelectAll = (isCurrentProjects: boolean) => {
    const projectsToSelect = isCurrentProjects ? currentProjects : completedProjects
    const newSelected = new Set(selectedProjectIds)

    const allSelected = projectsToSelect.every(p => selectedProjectIds.has(p.id))

    if (allSelected) {
      // Deselect all
      projectsToSelect.forEach(p => newSelected.delete(p.id))
    } else {
      // Select all
      projectsToSelect.forEach(p => newSelected.add(p.id))
    }

    setSelectedProjectIds(newSelected)
  }

  const handleSelectProject = (projectId: string) => {
    const newSelected = new Set(selectedProjectIds)
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId)
    } else {
      newSelected.add(projectId)
    }
    setSelectedProjectIds(newSelected)
  }

  const isAllSelected = (isCurrentProjects: boolean) => {
    const projectsToCheck = isCurrentProjects ? currentProjects : completedProjects
    if (projectsToCheck.length === 0) return false
    return projectsToCheck.every(p => selectedProjectIds.has(p.id))
  }

  const isSomeSelected = (isCurrentProjects: boolean) => {
    const projectsToCheck = isCurrentProjects ? currentProjects : completedProjects
    return projectsToCheck.some(p => selectedProjectIds.has(p.id)) && !isAllSelected(isCurrentProjects)
  }

  // Export to CSV function
  const exportToCSV = (projectsToExport: Project[], filename: string) => {
    // CSV Headers
    const headers = ['Date of Submission', 'Track #', 'Total Amount']

    // CSV Rows
    const rows = projectsToExport.map(project => [
      new Date(project.createdAt).toLocaleDateString('en-US'),
      project.zendeskTicketId || project.submissionId,
      project.totalPrice.toFixed(2)
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export selected projects
  const handleExportSelected = () => {
    if (selectedProjectIds.size === 0) {
      alert('Please select at least one project to export')
      return
    }

    const projectsToExport = projects.filter(p => selectedProjectIds.has(p.id))
    const timestamp = new Date().toISOString().split('T')[0]
    exportToCSV(projectsToExport, `selected-projects-${timestamp}.csv`)
  }

  // Export monthly for accounting
  const handleExportMonthly = () => {
    if (!selectedMonth) {
      alert('Please select a month to export')
      return
    }

    const [year, month] = selectedMonth.split('-')
    const projectsInMonth = projects.filter(p => {
      const projectDate = new Date(p.createdAt)
      return projectDate.getFullYear() === parseInt(year) &&
             projectDate.getMonth() + 1 === parseInt(month)
    })

    if (projectsInMonth.length === 0) {
      alert('No projects found for the selected month')
      return
    }

    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
    exportToCSV(projectsInMonth, `UndergroundMonthlyProjects-${year}-${month}.csv`)
  }

  // Clear selections
  const handleClearSelections = () => {
    setSelectedProjectIds(new Set())
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#A6E7DE]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Page Header */}
        <div className="bg-white/50 border-b border-[#1C3450]/10 px-8 py-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1C3450]">Recent Projects</h1>
              <p className="text-sm text-gray-600 mt-1">View and track all projects</p>
            </div>
            <Button
              variant="outline"
              onClick={loadProjects}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Export Controls */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-white/95 rounded-lg shadow p-6 border border-[#1C3450]/10">
            <h3 className="text-lg font-bold text-[#1C3450] mb-4">Export Options</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Export Selected */}
              <div className="border-r border-gray-200 pr-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Export Selected Projects</h4>
                <p className="text-xs text-gray-600 mb-3">
                  Select projects using checkboxes below, then click export
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleExportSelected}
                    disabled={selectedProjectIds.size === 0}
                    className="bg-[#1C3450] text-white hover:bg-[#0f243a]"
                  >
                    📥 Export Selected ({selectedProjectIds.size})
                  </Button>
                  {selectedProjectIds.size > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearSelections}
                      className="text-gray-600"
                    >
                      Clear Selections
                    </Button>
                  )}
                </div>
              </div>

              {/* Export Monthly */}
              <div className="pl-0 md:pl-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Export (Accounting)</h4>
                <p className="text-xs text-gray-600 mb-3">
                  Export all projects from a specific month
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handleExportMonthly}
                    disabled={!selectedMonth}
                    className="bg-green-700 text-white hover:bg-green-800"
                  >
                    📊 Export Month
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>CSV Export Format:</strong> Date of Submission, Track #, Total Amount
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Current Projects Section */}
          <div className="bg-white/95 rounded-lg shadow border border-[#1C3450]/10 overflow-hidden">
            <button
              onClick={() => setCurrentProjectsOpen(!currentProjectsOpen)}
              className="w-full px-6 py-4 flex justify-between items-center bg-gradient-to-r from-[#1C3450] to-[#0f243a] text-white hover:from-[#0f243a] hover:to-[#1C3450] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {currentProjectsOpen ? '▼' : '▶'}
                </span>
                <h2 className="text-2xl font-bold">Current Projects</h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {currentProjects.length}
                </span>
              </div>
            </button>

            {currentProjectsOpen && (
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C3450] mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading projects...</p>
                  </div>
                ) : currentProjects.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-lg">No current projects</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-[#A6E7DE]">
                        <tr>
                          <th className="px-4 py-3 w-12">
                            <input
                              type="checkbox"
                              checked={isAllSelected(true)}
                              ref={input => {
                                if (input) {
                                  input.indeterminate = isSomeSelected(true)
                                }
                              }}
                              onChange={() => handleSelectAll(true)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              title="Select all current projects"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Tracking #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Package
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Assigned To
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentProjects.map((project) => (
                          <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedProjectIds.has(project.id)}
                                onChange={() => handleSelectProject(project.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-mono font-semibold text-[#1C3450]">
                                {project.zendeskTicketId || project.submissionId}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.service}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.customerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {project.customerEmail}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.eventName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(project.eventDate)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {project.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                                  project.priority
                                )}`}
                              >
                                {project.priority}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-700">
                                {project.selectedPackageName || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(project.totalPrice)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-700">
                                {project.assignedTo || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs text-gray-600">
                                {formatDate(project.createdAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Completed Projects Section */}
          <div className="bg-white/95 rounded-lg shadow border border-[#1C3450]/10 overflow-hidden">
            <button
              onClick={() => setCompletedProjectsOpen(!completedProjectsOpen)}
              className="w-full px-6 py-4 flex justify-between items-center bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {completedProjectsOpen ? '▼' : '▶'}
                </span>
                <h2 className="text-2xl font-bold">Completed Projects</h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {completedProjects.length}
                </span>
              </div>
            </button>

            {completedProjectsOpen && (
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading projects...</p>
                  </div>
                ) : completedProjects.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-lg">No completed projects yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-green-200">
                        <tr>
                          <th className="px-4 py-3 w-12">
                            <input
                              type="checkbox"
                              checked={isAllSelected(false)}
                              ref={input => {
                                if (input) {
                                  input.indeterminate = isSomeSelected(false)
                                }
                              }}
                              onChange={() => handleSelectAll(false)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                              title="Select all completed projects"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Tracking #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Package
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Completed By
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Completed Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {completedProjects.map((project) => (
                          <tr key={project.id} className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedProjectIds.has(project.id)}
                                onChange={() => handleSelectProject(project.id)}
                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-mono font-semibold text-[#1C3450]">
                                {project.zendeskTicketId || project.submissionId}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.service}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.customerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {project.customerEmail}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.eventName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(project.eventDate)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-700">
                                {project.selectedPackageName || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(project.totalPrice)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-700">
                                {project.assignedTo || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs text-gray-600">
                                {formatDate(project.updatedAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/95 rounded-lg shadow p-6 border border-[#1C3450]/10">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Projects</div>
              <div className="text-3xl font-bold text-[#1C3450]">{projects.length}</div>
            </div>
            <div className="bg-white/95 rounded-lg shadow p-6 border border-[#1C3450]/10">
              <div className="text-sm font-medium text-gray-500 mb-1">Current Projects</div>
              <div className="text-3xl font-bold text-blue-600">{currentProjects.length}</div>
            </div>
            <div className="bg-white/95 rounded-lg shadow p-6 border border-[#1C3450]/10">
              <div className="text-sm font-medium text-gray-500 mb-1">Completed Projects</div>
              <div className="text-3xl font-bold text-green-600">{completedProjects.length}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
