// app/(guest)/dashboard/layout.tsx
// 🎨 DASHBOARD LAYOUT - Uses existing Header and Footer components
// Handles auth checks, loading states, and provides context to all dashboard pages

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { HotelContext } from './components/HotelContext'
import orchestrator from './orchestrator'

// Types
interface DashboardLayoutProps {
  children: React.ReactNode
}

interface UserData {
  id: string
  email: string
  name: string
  role: string
  creditBalance?: number
  hotelReservation?: {
    id: string
    hotelId: string
    hotelName: string
    checkIn: string
    checkOut: string
    roomNumber?: string
  }
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  
  // State management
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAtHotel, setIsAtHotel] = useState(false)
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Header state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check authentication and load user data
  useEffect(() => {
    checkAuth()
    checkHotelContext()
  }, [])

  // Authentication check
  const checkAuth = async () => {
    try {
      // Check if we have a valid token (JWT from cookies)
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        // Not authenticated, redirect to login
        router.push('/auth/login?from=/dashboard')
        return
      }

      const userData = await response.json()
      setUser(userData.user)
      
      // Check for hotel reservation
      if (userData.user.hotelReservation) {
        setHotelId(userData.user.hotelReservation.hotelId)
      }
      
    } catch (error) {
      console.error('Auth check failed:', error)
      setError('Authentication failed')
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user is at their hotel
  const checkHotelContext = async () => {
    try {
      // For now, return mock data since the dynamic imports are failing
      const mockHotelContext = {
        isAtHotel: false,
        hotelId: undefined,
        hotelName: undefined,
      }
      
      setIsAtHotel(mockHotelContext.isAtHotel || false)
      
      if (mockHotelContext.hotelId) {
        setHotelId(mockHotelContext.hotelId)
      }
    } catch (error) {
      console.warn('Hotel context check failed, continuing without hotel context')
      setIsAtHotel(false)
    }
  }

  // Handle location permission request
  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        
        if (permission.state === 'prompt') {
          // Request permission
          navigator.geolocation.getCurrentPosition(
            () => {
              // Permission granted, check hotel context again
              checkHotelContext()
            },
            (error) => {
              console.log('Location permission denied:', error)
            }
          )
        } else if (permission.state === 'granted') {
          checkHotelContext()
        }
      } catch (error) {
        console.log('Location permission check failed:', error)
      }
    }
  }

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://apps.apple.com/app/itwhip', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/search')
  }

  // Loading state - full screen loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state - full screen error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
    return null // Will redirect in useEffect
  }

  // Main layout render with Header and Footer
  return (
    <HotelContext.Provider 
      value={{
        isAtHotel,
        hotelId,
        hotelName: user.hotelReservation?.hotelName || null,
        reservation: user.hotelReservation || null,
        checkHotelContext,
        user, // Pass user data through context
        requestLocationPermission, // Pass function through context
      }}
    >
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Use the existing Header component */}
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />



        {/* Main Content Area - flex-grow to push footer down */}
        <main className="flex-grow mt-14 md:mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
            {children}
          </div>
        </main>

        {/* Use the existing Footer component */}
        <Footer />
      </div>
    </HotelContext.Provider>
  )
}