// app/(guest)/dashboard/layout.tsx
// 🎨 DASHBOARD LAYOUT - Car Rental Platform ONLY
// ✅ No orchestrator, no hotel context - just car rentals
// ✅ ALL DARK MODE ISSUES FIXED

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'

// Types
interface DashboardLayoutProps {
  children: React.ReactNode
}

interface UserData {
  id: string
  email: string
  name: string
  role: string
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  
  // State management
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Authentication check
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        router.push('/auth/login?from=/dashboard')
        return
      }

      const userData = await response.json()
      setUser(userData.user)
      
    } catch (error) {
      console.error('Auth check failed:', error)
      setError('Authentication failed')
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-green-600 text-white rounded-lg py-2 px-4 hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  // Main layout - CLEAN, NO HOTEL CONTEXT PROVIDER
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="mt-14 md:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}