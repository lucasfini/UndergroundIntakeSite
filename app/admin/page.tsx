'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, loginRequest } from '@/lib/msalConfig'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import type { PricingData, PackageOption, AddOnOption } from '@/lib/types'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [activeTab, setActiveTab] = useState<'packages' | 'addons'>('packages')
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null)
  const [userName, setUserName] = useState<string>('')

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
      loadPricingData()
    }
  }, [router])

  const loadPricingData = async () => {
    try {
      const response = await fetch('/api/admin/pricing')
      const data = await response.json()
      setPricingData(data)
    } catch (error) {
      console.error('Failed to load pricing data:', error)
    }
  }

  const handleLogin = async () => {
    if (!msalInstance) {
      alert('Authentication system not ready. Please refresh the page.')
      return
    }

    setIsLoading(true)

    try {
      // Sign in with Microsoft popup
      const loginResponse = await msalInstance.loginPopup(loginRequest)
      const accessToken = loginResponse.accessToken

      // Verify token and check admin access with backend
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        sessionStorage.setItem('admin_auth', 'true')
        sessionStorage.setItem('admin_user_name', data.user.name || data.user.email)
        setUserName(data.user.name || data.user.email)
        setIsAuthenticated(true)
        // Redirect to overview page
        router.push('/admin/overview')
      } else {
        alert(data.error || 'Authentication failed')
        await msalInstance.logout()
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.errorCode === 'user_cancelled') {
        alert('Sign in was cancelled')
      } else {
        alert('Authentication failed: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePricing = async () => {
    if (!pricingData) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingData),
      })

      if (response.ok) {
        alert('Pricing updated successfully!')
      } else {
        alert('Failed to update pricing')
      }
    } catch (error) {
      alert('Error updating pricing')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePackage = (id: string, updates: Partial<PackageOption>) => {
    if (!pricingData) return

    setPricingData({
      ...pricingData,
      packages: pricingData.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...updates } : pkg
      ),
    })
  }

  const updateAddOn = (id: string, updates: Partial<AddOnOption>) => {
    if (!pricingData) return

    setPricingData({
      ...pricingData,
      addOns: pricingData.addOns.map((addOn) =>
        addOn.id === id ? { ...addOn, ...updates } : addOn
      ),
    })
  }

  const addNewPackage = () => {
    if (!pricingData) return

    const newPackage: PackageOption = {
      id: `package-${Date.now()}`,
      name: 'New Package',
      price: 0,
      color: '#3b82f6',
      image: '',
      includes: [],
      turnaround: '',
    }

    setPricingData({
      ...pricingData,
      packages: [...pricingData.packages, newPackage],
    })
  }

  const removePackage = (id: string) => {
    if (!pricingData) return

    if (!confirm('Are you sure you want to delete this package?')) return

    setPricingData({
      ...pricingData,
      packages: pricingData.packages.filter((pkg) => pkg.id !== id),
    })
  }

  const addNewAddOn = () => {
    if (!pricingData) return

    const newAddOn: AddOnOption = {
      id: `addon-${Date.now()}`,
      name: 'New Add-On',
      price: 0,
      category: 'digital',
      description: '',
    }

    setPricingData({
      ...pricingData,
      addOns: [...pricingData.addOns, newAddOn],
    })
  }

  const removeAddOn = (id: string) => {
    if (!pricingData) return

    if (!confirm('Are you sure you want to delete this add-on?')) return

    setPricingData({
      ...pricingData,
      addOns: pricingData.addOns.filter((addOn) => addOn.id !== id),
    })
  }

  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f243a] via-[#0f243a] to-[#0b1f33] flex items-center justify-center px-6 py-12 text-white">
        <div className="absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#A6E7DE]/25 blur-3xl" />
          <div className="absolute right-10 top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-12 right-12 h-32 rounded-t-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative max-w-xl w-full space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A6E7DE]">
              Underground Media + Design
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold">Admin Portal Access</h1>
            <p className="text-sm text-white/70">
              Securely manage pricing, add-ons, and the queue from one place.
            </p>
          </div>

          <div className="relative bg-white/5 border border-white/15 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#A6E7DE] via-white/70 to-transparent" />
            <div className="px-8 py-10 space-y-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <Image
                  src="/images/UG_logo_White.png"
                  alt="Underground Design Logo"
                  width={120}
                  height={120}
                  className="w-32 h-32"
                  priority
                />
                <div>
                  <p className="text-lg font-semibold">Welcome back</p>
                  <p className="text-sm text-white/70">Use your MSU account to continue.</p>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                isLoading={isLoading}
                disabled={!msalInstance}
                className="w-full flex items-center justify-center gap-3 bg-[#A6E7DE] text-[#0f243a] hover:bg-[#8edacb] font-semibold shadow-lg shadow-black/10"
              >
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                Sign in with Microsoft
              </Button>

              <p className="text-xs text-white/60 text-center">
                Only authorized Underground administrators can access this portal
              </p>
            </div>
          </div>
        </div>
      </main>
    )
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
            <h1 className="text-3xl font-bold text-[#0f243a]">Pricing Management</h1>
            <p className="text-sm text-[#1C3450]">
              Keep packages, add-ons, and pricing details aligned with the latest offerings.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
          {/* Tabs */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60">
            <div className="flex flex-wrap gap-3 px-6 py-4">
              <button
                onClick={() => setActiveTab('packages')}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'packages'
                    ? 'bg-[#0f243a] text-white shadow-md shadow-[#0f243a]/30'
                    : 'bg-white text-[#0f243a] border border-[#0f243a]/10 hover:border-[#0f243a]/30'
                }`}
              >
                Packages ({pricingData?.packages.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('addons')}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'addons'
                    ? 'bg-[#0f243a] text-white shadow-md shadow-[#0f243a]/30'
                    : 'bg-white text-[#0f243a] border border-[#0f243a]/10 hover:border-[#0f243a]/30'
                }`}
              >
                Add-Ons ({pricingData?.addOns.length || 0})
              </button>
            </div>
          </div>

        {/* Tab Content */}
          <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-white/70">
            {activeTab === 'packages' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Packages</h2>
                  <Button onClick={addNewPackage} variant="primary">
                    + Add Package
                  </Button>
                </div>

                <div className="grid gap-6">
                  {pricingData?.packages.map((pkg) => (
                  <div key={pkg.id} className="border border-[#1C3450]/15 rounded-lg p-6 relative bg-white/95">
                    <button
                      onClick={() => removePackage(pkg.id)}
                      className="absolute top-4 right-4 text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Remove
                    </button>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Package Name"
                        value={pkg.name}
                        onChange={(e) =>
                          updatePackage(pkg.id, { name: e.target.value })
                        }
                      />
                      <Input
                        label="Price ($)"
                        type="number"
                        value={pkg.price}
                        onChange={(e) =>
                          updatePackage(pkg.id, {
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color (Hex)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={pkg.color || '#3b82f6'}
                            onChange={(e) =>
                              updatePackage(pkg.id, { color: e.target.value })
                            }
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <Input
                            value={pkg.color || '#3b82f6'}
                            onChange={(e) =>
                              updatePackage(pkg.id, { color: e.target.value })
                            }
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <Input
                        label="Turnaround Time"
                        value={pkg.turnaround || ''}
                        onChange={(e) =>
                          updatePackage(pkg.id, { turnaround: e.target.value })
                        }
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Image Path"
                          value={pkg.image || ''}
                          onChange={(e) =>
                            updatePackage(pkg.id, { image: e.target.value })
                          }
                          placeholder="/images/your-image.png"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Package Includes
                        </label>
                        <div className="space-y-3 border border-gray-300 rounded-lg p-4 bg-gray-50">
                          {pkg.includes && pkg.includes.length > 0 ? (
                            pkg.includes.map((item, idx) => {
                              // Handle both string format (legacy) and object format
                              if (typeof item === 'string') {
                                return (
                                  <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                      value={item}
                                      onChange={(e) => {
                                        const newIncludes = [...pkg.includes]
                                        newIncludes[idx] = e.target.value
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      placeholder="Item description"
                                      className="flex-1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newIncludes = pkg.includes.filter((_, i) => i !== idx)
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      className="text-red-600 hover:text-red-800 px-2"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )
                              }

                              // Handle structured object format
                              if (item.type === 'header') {
                                return (
                                  <div key={idx} className="flex gap-2 items-center bg-blue-50 p-2 rounded">
                                    <span className="text-xs font-semibold text-gray-600 w-20">HEADER:</span>
                                    <Input
                                      value={item.content || ''}
                                      onChange={(e) => {
                                        const newIncludes = [...pkg.includes]
                                        newIncludes[idx] = { ...item, content: e.target.value }
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      placeholder="Header text"
                                      className="flex-1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newIncludes = pkg.includes.filter((_, i) => i !== idx)
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      className="text-red-600 hover:text-red-800 px-2"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )
                              }

                              return (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                                  <div className="col-span-2">
                                    <Input
                                      value={item.size || ''}
                                      onChange={(e) => {
                                        const newIncludes = [...pkg.includes]
                                        newIncludes[idx] = { ...item, size: e.target.value }
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      placeholder="Size"
                                    />
                                  </div>
                                  <div className="col-span-5">
                                    <Input
                                      value={item.item || ''}
                                      onChange={(e) => {
                                        const newIncludes = [...pkg.includes]
                                        newIncludes[idx] = { ...item, item: e.target.value }
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      placeholder="Item"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      value={item.quantity || ''}
                                      onChange={(e) => {
                                        const newIncludes = [...pkg.includes]
                                        newIncludes[idx] = { ...item, quantity: e.target.value }
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      placeholder="Qty"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      value={item.note || ''}
                                      onChange={(e) => {
                                        const newIncludes = [...pkg.includes]
                                        newIncludes[idx] = { ...item, note: e.target.value }
                                        updatePackage(pkg.id, { includes: newIncludes })
                                      }}
                                      placeholder="Note"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newIncludes = pkg.includes.filter((_, i) => i !== idx)
                                      updatePackage(pkg.id, { includes: newIncludes })
                                    }}
                                    className="col-span-1 text-red-600 hover:text-red-800 text-center"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-sm text-gray-500 italic">No items added yet</p>
                          )}

                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-300">
                            <button
                              type="button"
                              onClick={() => {
                                const newIncludes = [...(pkg.includes || []), { size: '', item: '', quantity: '', note: '' }]
                                updatePackage(pkg.id, { includes: newIncludes })
                              }}
                              className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              + Add Item
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newIncludes = [...(pkg.includes || []), { type: 'header' as const, content: '' }]
                                updatePackage(pkg.id, { includes: newIncludes })
                              }}
                              className="text-sm px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                            >
                              + Add Header
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Note (optional)"
                          value={pkg.note || ''}
                          onChange={(e) =>
                            updatePackage(pkg.id, { note: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add-Ons</h2>
                <Button onClick={addNewAddOn} variant="primary">
                  + Add Add-On
                </Button>
              </div>

              <div className="grid gap-4">
                {pricingData?.addOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    className="border border-[#1C3450]/15 rounded-lg p-6 relative bg-white/95"
                  >
                    <button
                      onClick={() => removeAddOn(addOn.id)}
                      className="absolute top-4 right-4 text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Remove
                    </button>

                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        label="Add-On Name"
                        value={addOn.name}
                        onChange={(e) =>
                          updateAddOn(addOn.id, { name: e.target.value })
                        }
                      />
                      <Input
                        label="Price ($)"
                        type="number"
                        value={typeof addOn.price === 'number' ? addOn.price : ''}
                        onChange={(e) =>
                          updateAddOn(addOn.id, {
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <Select
                        label="Category"
                        value={addOn.category}
                        onChange={(e) =>
                          updateAddOn(addOn.id, {
                            category: e.target.value as 'digital' | 'printed' | 'special',
                          })
                        }
                        options={[
                          { value: 'digital', label: 'Digital' },
                          { value: 'printed', label: 'Printed' },
                          { value: 'special', label: 'Special' },
                        ]}
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Description"
                          value={addOn.description || ''}
                          onChange={(e) =>
                            updateAddOn(addOn.id, { description: e.target.value })
                          }
                        />
                      </div>
                      <Input
                        label="Note (optional)"
                        value={addOn.note || ''}
                        onChange={(e) =>
                          updateAddOn(addOn.id, { note: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSavePricing}
            isLoading={isLoading}
            className="px-8"
          >
            Save All Changes
          </Button>
        </div>
      </div>
      </main>
    </div>
  )
}
