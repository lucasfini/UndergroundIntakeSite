'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserAuth } from '@/lib/contexts/UserAuthContext'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { isAuthenticated, error } = useUserAuth()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Wait for authentication to complete
    if (isAuthenticated && !redirecting) {
      setRedirecting(true)
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push('/form')
      }, 500)
    } else if (error) {
      // If there's an error, redirect back to login after delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 5000) // 5 seconds to read the error message
    }
  }, [isAuthenticated, error, redirecting, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1C3450' }}>
      <div className="text-center">
        {error ? (
          <>
            <svg
              className="w-12 h-12 mx-auto mb-4 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xl font-medium text-red-400 mb-2">Access Denied</p>
            <p className="text-sm text-red-300 mb-4 max-w-md mx-auto px-4">
              {error}
            </p>
            <p className="text-xs" style={{ color: '#A6E7DE' }}>
              Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <svg
              className="animate-spin h-12 w-12 mx-auto mb-4"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: '#A6E7DE' }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-xl font-medium" style={{ color: '#A6E7DE' }}>
              Completing authentication...
            </p>
          </>
        )}
      </div>
    </div>
  )
}
