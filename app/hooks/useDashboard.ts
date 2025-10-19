// app/hooks/useDashboard.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

// ========== TYPE DEFINITIONS ==========
interface DashboardUser {
  id: string
  name: string | null
  email: string
  avatar: string | null
  phone: string | null
  role: string
  twoFactorEnabled: boolean
  lastActive: string
  memberSince: string
}

interface DashboardProfile {
  id: string | null
  name: string | null
  city: string | null
  state: string | null
  bio: string | null
  profilePhoto: string | null
  memberTier: string
  loyaltyPoints: number
  totalTrips: number
  averageRating: number
  isFullyVerified: boolean
  hasActiveWarning: boolean
  suspensionLevel: string | null
  suspendedUntil: string | null
  canBookLuxury: boolean
  canBookPremium: boolean
}

interface DashboardBooking {
  id: string
  bookingCode: string
  status: string
  verificationStatus: string
  tripStatus: string | null
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  numberOfDays: number
  dailyRate: number
  subtotal: number
  totalAmount: number
  paymentStatus: string
  car: {
    id: string
    make: string
    model: string
    year: number
    type: string
    photo: string | null
    location: string
  }
  host: {
    id: string
    name: string
    rating: number
    photo: string | null
  }
  unreadMessages: number
  createdAt: string
}

interface DashboardStats {
  totalBookings: number
  activeRentals: number
  upcomingTrips: number
  completedTrips: number
  cancelledTrips: number
  totalSpent: number
  loyaltyPoints: number
  memberTier: string
  unreadMessages: number
}

interface DashboardNotifications {
  appeals: any[]
  dismissed: any[]
  hasUnreadAppeals: boolean
}

interface DashboardFlags {
  needsVerification: boolean
  hasUnreadMessages: boolean
  hasUpcomingTrips: boolean
  hasActiveWarning: boolean
  needsPaymentMethod: boolean
}

export interface DashboardData {
  user: DashboardUser
  profile: DashboardProfile
  bookings: DashboardBooking[]
  stats: DashboardStats
  notifications: DashboardNotifications
  paymentMethods: any[]
  flags: DashboardFlags
}

interface UseDashboardReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// ========== CUSTOM HOOK ==========
export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[useDashboard] Fetching dashboard data...')
      const startTime = performance.now()

      const response = await fetch('/api/dashboard/initial-data', {
        credentials: 'include', // Important: include cookies
        cache: 'no-store' // Always get fresh data
      })

      const endTime = performance.now()
      console.log(`[useDashboard] API call took ${(endTime - startTime).toFixed(0)}ms`)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        throw new Error(`Failed to load dashboard: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load dashboard')
      }

      console.log('[useDashboard] ✅ Dashboard data loaded successfully')
      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useDashboard] ❌ Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard
  }
}

// ========== CONVENIENCE EXPORTS ==========
export type {
  DashboardUser,
  DashboardProfile,
  DashboardBooking,
  DashboardStats,
  DashboardNotifications,
  DashboardFlags
}