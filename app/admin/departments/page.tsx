'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Department {
  id: string
  name: string
  displayName: string | null
  isActive: boolean
  createdAt: string
  createdBy: string | null
}

export default function DepartmentsAdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptDisplayName, setNewDeptDisplayName] = useState('')
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth')
    const storedUserName = sessionStorage.getItem('admin_user_name')
    if (auth === 'true') {
      setIsAuthenticated(true)
      if (storedUserName) setUserName(storedUserName)
      loadDepartments()
    } else {
      router.push('/admin')
    }
  }, [router])

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments')
      const data = await response.json()
      setDepartments(data.departments)
    } catch (error) {
      console.error('Failed to load departments:', error)
      alert('Failed to load departments')
    }
  }

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      alert('Department name is required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeptName.trim(),
          displayName: newDeptDisplayName.trim() || null,
          createdBy: userName
        })
      })

      if (response.ok) {
        setNewDeptName('')
        setNewDeptDisplayName('')
        loadDepartments()
        alert('Department added successfully')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to add department')
      }
    } catch (error) {
      alert('Error adding department')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (dept: Department) => {
    if (!confirm(`Are you sure you want to ${dept.isActive ? 'deactivate' : 'reactivate'} "${dept.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/departments/${dept.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !dept.isActive })
      })

      if (response.ok) {
        loadDepartments()
        alert(`Department ${dept.isActive ? 'deactivated' : 'reactivated'}`)
      } else {
        alert('Failed to update department')
      }
    } catch (error) {
      alert('Error updating department')
    }
  }

  const handleDeletePermanently = async (dept: Department) => {
    if (!confirm(`PERMANENTLY delete "${dept.name}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/departments/${dept.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadDepartments()
        alert('Department deleted')
      } else {
        alert('Failed to delete department')
      }
    } catch (error) {
      alert('Error deleting department')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f243a]">
        <p className="text-white">Redirecting to admin login...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#A6E7DE]">
      {/* Sidebar */}
      <AdminSidebar userName={userName} />

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Page Header */}
        <div className="bg-white/50 border-b border-[#1C3450]/10 px-8 py-6">
          <h1 className="text-3xl font-bold text-[#1C3450]">Department Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage allowed departments</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add New Department Card */}
        <div className="bg-white/95 rounded-lg shadow mb-6 p-6 border border-[#1C3450]/10">
          <h2 className="text-2xl font-bold mb-4 text-[#1C3450]">Add New Department</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name (Required)
              </label>
              <Input
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., CFMU, Pride, SHEC"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name (Optional)
              </label>
              <Input
                value={newDeptDisplayName}
                onChange={(e) => setNewDeptDisplayName(e.target.value)}
                placeholder="Optional friendly name"
                className="w-full"
              />
            </div>
          </div>
          <Button onClick={handleAddDepartment} isLoading={isLoading}>
            Add Department
          </Button>
        </div>

        {/* Departments List */}
        <div className="bg-white/95 rounded-lg shadow p-6 border border-[#1C3450]/10">
          <h2 className="text-2xl font-bold mb-6 text-[#1C3450]">
            Allowed Departments ({departments.length})
          </h2>

          {/* Active Departments */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-green-700">
              Active Departments ({departments.filter(d => d.isActive).length})
            </h3>
            <div className="grid gap-3">
              {departments.filter(d => d.isActive).map(dept => (
                <div key={dept.id} className="border rounded-lg p-4 flex justify-between items-center bg-green-50">
                  <div>
                    <div className="font-semibold text-lg text-[#1C3450]">{dept.name}</div>
                    {dept.displayName && dept.displayName !== dept.name && (
                      <div className="text-sm text-gray-600">Display: {dept.displayName}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Added: {new Date(dept.createdAt).toLocaleDateString()}
                      {dept.createdBy && ` by ${dept.createdBy}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleToggleActive(dept)}
                      className="!text-orange-600 !border-orange-600 hover:!bg-orange-50"
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))}
              {departments.filter(d => d.isActive).length === 0 && (
                <p className="text-gray-500 text-center py-4">No active departments</p>
              )}
            </div>
          </div>

          {/* Inactive Departments */}
          {departments.some(d => !d.isActive) && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-600">
                Inactive Departments ({departments.filter(d => !d.isActive).length})
              </h3>
              <div className="grid gap-3">
                {departments.filter(d => !d.isActive).map(dept => (
                  <div key={dept.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50 opacity-60">
                    <div>
                      <div className="font-semibold text-lg text-gray-700">{dept.name}</div>
                      {dept.displayName && dept.displayName !== dept.name && (
                        <div className="text-sm text-gray-600">Display: {dept.displayName}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleToggleActive(dept)}
                        className="!text-green-600 !border-green-600 hover:!bg-green-50"
                      >
                        Reactivate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeletePermanently(dept)}
                        className="!text-red-600 !border-red-600 hover:!bg-red-50"
                      >
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  )
}
