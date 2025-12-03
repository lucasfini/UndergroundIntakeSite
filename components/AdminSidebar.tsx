'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { PublicClientApplication } from '@azure/msal-browser'

interface AdminSidebarProps {
  msalInstance?: PublicClientApplication | null
  userName?: string
  onLogout?: () => void
}

export function AdminSidebar({ msalInstance, userName, onLogout }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    sessionStorage.removeItem('admin_auth')
    sessionStorage.removeItem('admin_user_name')
    if (msalInstance) {
      await msalInstance.logoutPopup()
    }
    if (onLogout) {
      onLogout()
    }
    router.push('/admin')
  }

  const navItems = [
    { path: '/admin', label: 'Pricing', icon: '💰' },
    { path: '/admin/departments', label: 'Departments', icon: '🏢' },
    { path: '/admin/queue', label: 'Queue', icon: '📋' },
    { path: '/admin/projects', label: 'Recent Projects', icon: '📁' },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(path)
  }

  return (
    <aside className="w-64 bg-[#0f243a] text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Navigation Links */}
      <nav className="flex-1 py-6">
        <div className="space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-[#A6E7DE] text-[#0f243a] font-semibold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 px-3">
          <hr className="border-white/20 mb-3" />
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <span className="text-xl">🏠</span>
            <span className="text-sm">View Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>

        {userName && (
          <div className="mt-4 px-7 text-xs text-white/60">
            Logged in as<br />
            <span className="text-white/80">{userName}</span>
          </div>
        )}
      </nav>

      {/* Logo at Bottom */}
      <div className="p-6 flex justify-center border-t border-white/20">
        <Image
          src="/images/UG_logo_White.png"
          alt="Underground Design Logo"
          width={180}
          height={90}
          className="w-40"
        />
      </div>
    </aside>
  )
}
