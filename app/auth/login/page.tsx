'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserAuth } from '@/lib/contexts/UserAuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function ServiceLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, error: authError, isLoading } = useUserAuth()
  const [localError, setLocalError] = useState<string | null>(null)

  // If already authenticated, redirect to form
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/form')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async () => {
    setLocalError(null)

    try {
      await login()
      // After successful login, navigate to form
      router.push('/form')
    } catch (err: any) {
      console.error('Login error:', err)
      setLocalError(err.message || 'Authentication failed. Please try again.')
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
      <Header />

      <div className="flex-1 w-full flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="px-8 py-10 text-center" style={{ backgroundColor: '#A6E7DE' }}>
              <div className="mb-6">
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#1C3450' }}
                >
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="#A6E7DE"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <h1
                className="text-3xl font-bold mb-3"
                style={{ color: '#1C3450', fontFamily: 'Gotham Bold, Helvetica, Arial, sans-serif' }}
              >
                Service Login
              </h1>
              <p className="text-base" style={{ color: '#1C3450' }}>
                If you are an MSU service, please sign in using your service credentials.
              </p>
            </div>

            {/* Body Section */}
            <div className="px-8 py-10">
              {/* Error Display */}
              {(localError || authError) && (
                <div className="mb-6 bg-red-50 border-2 border-red-400 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{localError || authError}</p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: '#F0F9F8' }}>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: '#1C3450' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#1C3450' }}>
                      Authentication Required
                    </p>
                    <p className="text-sm text-gray-700">
                      You&apos;ll be redirected to Microsoft to sign in with your{' '}
                      <span className="font-semibold">@msu.mcmaster.ca</span> account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                style={{ backgroundColor: '#1C3450', color: '#A6E7DE' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
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
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sign in with Microsoft
                  </span>
                )}
              </button>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help?{' '}
                  <a
                    href="/contact"
                    className="font-semibold hover:underline"
                    style={{ color: '#1C3450' }}
                  >
                    Contact Underground Design
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Back to Services */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/select-service')}
              className="text-sm font-medium hover:underline transition"
              style={{ color: '#A6E7DE' }}
            >
              ← Back to Service Selection
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
