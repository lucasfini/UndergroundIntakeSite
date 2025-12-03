'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'

// User data interface
export interface UserData {
  email: string
  name: string
  position: string
  service: string
  department?: string
}

// Auth context interface
interface UserAuthContextType {
  isAuthenticated: boolean
  userData: UserData | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
  error: string | null
}

// Create context
const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

// MSAL configuration for user authentication (separate from admin)
const userMsalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  },
  cache: {
    cacheLocation: 'sessionStorage' as const,
    storeAuthStateInCookie: false,
  },
}

const loginRequest = {
  scopes: ['User.Read'],
}

// Session storage keys
const USER_AUTH_KEY = 'underground_user_auth'
const USER_AUTH_TIMESTAMP_KEY = 'underground_user_auth_timestamp'

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

// Provider component
export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null)

  // Helper function to process authentication response
  const processAuthResponse = async (accessToken: string) => {
    try {
      // Call backend API to validate token and get user data
      const response = await fetch('/api/user/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const data = await response.json()

      // Store user data
      const newUserData: UserData = {
        email: data.email,
        name: data.name,
        position: data.position,
        service: data.service,
        department: data.department,
      }

      setUserData(newUserData)
      setIsAuthenticated(true)

      // Persist to sessionStorage with timestamp
      sessionStorage.setItem(USER_AUTH_KEY, JSON.stringify(newUserData))
      sessionStorage.setItem(USER_AUTH_TIMESTAMP_KEY, Date.now().toString())
    } catch (err: any) {
      console.error('Auth processing failed:', err)

      // Handle specific error messages
      if (err.message?.includes('department') || err.message?.includes('service') || err.message?.includes('email')) {
        setError(err.message)
      } else {
        setError('Authentication failed. Please ensure you are using your MSU credentials.')
      }

      // Clear any partial data
      setUserData(null)
      setIsAuthenticated(false)
      sessionStorage.removeItem(USER_AUTH_KEY)

      throw err
    }
  }

  // Initialize MSAL instance and handle redirect response
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const instance = new PublicClientApplication(userMsalConfig)
        await instance.initialize()

        // Handle redirect response if coming back from Microsoft login
        const response = await instance.handleRedirectPromise()

        if (response && response.accessToken) {
          // Process the authentication response
          await processAuthResponse(response.accessToken)
        }

        setMsalInstance(instance)
      } catch (err: any) {
        console.error('Failed to initialize MSAL:', err)
        // Preserve specific error messages from authentication validation
        // The error message from processAuthResponse has already been set via setError()
        // so we just need to make sure MSAL instance is set for cleanup
      }
      // Always set MSAL instance even if auth failed, so cleanup works properly
      finally {
        setIsLoading(false)
      }
    }

    initializeMsal()
  }, [])

  // Restore auth from sessionStorage on mount
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const storedAuth = sessionStorage.getItem(USER_AUTH_KEY)
        const storedTimestamp = sessionStorage.getItem(USER_AUTH_TIMESTAMP_KEY)

        if (storedAuth && storedTimestamp) {
          const timestamp = parseInt(storedTimestamp, 10)
          const now = Date.now()

          // Check if session has expired (30 minutes of inactivity)
          if (now - timestamp > SESSION_TIMEOUT_MS) {
            // Session expired - clear auth
            sessionStorage.removeItem(USER_AUTH_KEY)
            sessionStorage.removeItem(USER_AUTH_TIMESTAMP_KEY)
            setError('Your session has expired. Please sign in again.')
          } else {
            // Session valid - restore auth and update timestamp
            const parsedAuth = JSON.parse(storedAuth)
            setUserData(parsedAuth)
            setIsAuthenticated(true)
            // Update timestamp for activity
            sessionStorage.setItem(USER_AUTH_TIMESTAMP_KEY, Date.now().toString())
          }
        }
      } catch (err) {
        console.error('Failed to restore auth:', err)
        sessionStorage.removeItem(USER_AUTH_KEY)
        sessionStorage.removeItem(USER_AUTH_TIMESTAMP_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    restoreAuth()
  }, [])

  // Activity tracker - update timestamp on user activity
  useEffect(() => {
    if (!isAuthenticated) return

    const updateActivity = () => {
      sessionStorage.setItem(USER_AUTH_TIMESTAMP_KEY, Date.now().toString())
    }

    // Track mouse movement, clicks, and keyboard activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [isAuthenticated])

  // Login function - triggers redirect to Microsoft
  const login = async () => {
    if (!msalInstance) {
      setError('Authentication not initialized')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Trigger Microsoft login redirect (user will be redirected to Microsoft login page)
      await msalInstance.loginRedirect(loginRequest)
      // Note: Code after this won't execute as the browser redirects
    } catch (err: any) {
      console.error('Login redirect failed:', err)
      setError('Failed to initiate login. Please try again.')
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUserData(null)
    setIsAuthenticated(false)
    setError(null)
    sessionStorage.removeItem(USER_AUTH_KEY)
    sessionStorage.removeItem(USER_AUTH_TIMESTAMP_KEY)

    // Optional: Clear MSAL cache
    if (msalInstance) {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        msalInstance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin,
        }).catch(err => {
          console.error('Logout failed:', err)
        })
      }
    }
  }

  const value: UserAuthContextType = {
    isAuthenticated,
    userData,
    isLoading,
    login,
    logout,
    error,
  }

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
}

// Custom hook to use auth context
export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}
