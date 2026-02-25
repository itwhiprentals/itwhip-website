// app/(guest)/dashboard/page.tsx
// Guest Dashboard - Car Rental Platform with Priority Banner System
// Optimized: Using unified API endpoint for fast loading
// Refactored: UI sections extracted into focused components

'use client'

import { useReducer, useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useTranslations, useLocale } from 'next-intl'

// ========== COMPONENT IMPORTS ==========
import SuspensionBanner from '@/app/components/SuspensionBanner'
import WarningBanner from './components/WarningBanner'
import AppealModal from './components/AppealModal'
import GoodStandingBanner from './components/GoodStandingBanner'
import AppealStatusBanner from './components/AppealStatusBanner'
import VerificationAlert from './components/VerificationAlert'
import ProfileCard from './components/ProfileCard'
import FeaturedCards from './components/FeaturedCards'
import StatsGrid from './components/StatsGrid'
import QuickActions from './components/QuickActions'
import RecentTrips from './components/RecentTrips'
import SupportCard from './components/SupportCard'
import DisclaimerCard from './components/DisclaimerCard'
import { XCircle, CheckCircle, AlertCircle } from './components/DashboardIcons'
import { SuspensionInfo } from './types'
import { useDashboard } from '@/app/hooks/useDashboard'
import { SecureAccountBanner } from '@/app/[locale]/(guest)/rentals/dashboard/bookings/[id]/components/SecureAccountBanner'

// ========== TYPES ==========
interface AppealNotification {
  id: string
  type: 'APPROVED' | 'DENIED'
  message?: string
  appeal: {
    id: string
    reviewNotes?: string
    reviewedBy?: string
    reviewedAt?: string
    moderationAction?: {
      type: string
      reason: string
    }
  }
}

interface DocumentVerificationState {
  emailVerified: boolean
  phoneVerified: boolean
  phoneNumber?: string | null
  documentsVerified: boolean
  driversLicenseUrl: string | null
  selfieUrl: string | null
  stripeIdentityStatus?: string | null
  stripeIdentityVerifiedAt?: string | null
}

interface ClaimsState {
  total: number
  active: number
  pendingResponse: number
  againstMe: number
  filedByMe: number
  accountHold: {
    hasHold: boolean
    holdReason: string | null
    claimId: string | null
    message: string | null
    canBook: boolean
  }
}

interface PaymentInfoState {
  hasCard: boolean
  last4: string | null
  brand: string | null
  expiry: string | null
}

// ========== ERROR BOUNDARY ==========
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-900 dark:text-white font-semibold mb-2">
              Something went wrong
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ========== DYNAMIC IMPORTS ==========
const RentalBookingsSection = dynamic(() => import('./components/RentalBookingsSection'), {
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    </div>
  )
})

// ========== TYPESCRIPT TYPES ==========
interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

interface UserProfile {
  id: string
  name: string
  avatar?: string
  verified?: boolean
  createdAt?: string
  profilePhotoUrl?: string
  reviewerProfile?: {
    profilePhotoUrl?: string
  }
}

interface DashboardStats {
  depositWalletBalance: number
  activeRentals: number
  completedTrips: number
  creditsAndBonus: number
  unreadMessages: number
  pendingDocuments: number
  activeClaims: number
  memberTier?: string
  pointsToNextTier?: number
  averageRating?: number
}

interface RentalBooking {
  id: string
  bookingCode: string
  car: {
    make: string
    model: string
    year: number
    photos?: any[]
  }
  startDate: string
  endDate: string
  status: string
  verificationStatus?: string
  totalAmount: number
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

// ========== STATE TYPES ==========
interface DashboardState {
  isLoading: boolean
  isRefreshing: boolean
  loadingRentals: boolean
  profileLoaded: boolean
  statsLoaded: boolean
  bookingsLoaded: boolean
  authenticatedUser: User | null
  userProfile: UserProfile | null
  suspensionInfo: SuspensionInfo | null
  moderationHistory: any[]
  stats: DashboardStats
  rentalBookings: RentalBooking[]
  toasts: Toast[]
  apiError: string | null
  rentalsError: string | null
  showAppealModal: boolean
  appealNotifications: {
    approved: AppealNotification[]
    denied: AppealNotification[]
  }
  notificationsLoaded: boolean
  documentVerification: DocumentVerificationState | null
  claims: ClaimsState | null
  paymentInfo: PaymentInfoState | null
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LOADING_RENTALS'; payload: boolean }
  | { type: 'SET_PROFILE_LOADED'; payload: boolean }
  | { type: 'SET_STATS_LOADED'; payload: boolean }
  | { type: 'SET_BOOKINGS_LOADED'; payload: boolean }
  | { type: 'SET_AUTHENTICATED_USER'; payload: User }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'SET_SUSPENSION_INFO'; payload: SuspensionInfo | null }
  | { type: 'SET_MODERATION_HISTORY'; payload: any[] }
  | { type: 'SET_STATS'; payload: DashboardStats }
  | { type: 'SET_RENTAL_BOOKINGS'; payload: RentalBooking[] }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_API_ERROR'; payload: string | null }
  | { type: 'SET_RENTALS_ERROR'; payload: string | null }
  | { type: 'SET_SHOW_APPEAL_MODAL'; payload: boolean }
  | { type: 'SET_APPEAL_NOTIFICATIONS'; payload: { approved: AppealNotification[]; denied: AppealNotification[] } }
  | { type: 'SET_NOTIFICATIONS_LOADED'; payload: boolean }
  | { type: 'REMOVE_APPEAL_NOTIFICATION'; payload: string }
  | { type: 'SET_DOCUMENT_VERIFICATION'; payload: DocumentVerificationState | null }
  | { type: 'SET_CLAIMS'; payload: ClaimsState | null }
  | { type: 'SET_PAYMENT_INFO'; payload: PaymentInfoState | null }

// ========== CONSTANTS ==========
const TOAST_DURATION = 5000
const DEBOUNCE_DELAY = 2000

// ========== REDUCER ==========
const initialState: DashboardState = {
  isLoading: true,
  isRefreshing: false,
  loadingRentals: false,
  profileLoaded: false,
  statsLoaded: false,
  bookingsLoaded: false,
  authenticatedUser: null,
  userProfile: null,
  suspensionInfo: null,
  moderationHistory: [],
  stats: {
    depositWalletBalance: 0,
    activeRentals: 0,
    completedTrips: 0,
    creditsAndBonus: 0,
    unreadMessages: 0,
    pendingDocuments: 0,
    activeClaims: 0,
    memberTier: 'Bronze',
    pointsToNextTier: 500,
    averageRating: 0
  },
  rentalBookings: [],
  toasts: [],
  apiError: null,
  rentalsError: null,
  showAppealModal: false,
  appealNotifications: {
    approved: [],
    denied: []
  },
  notificationsLoaded: false,
  documentVerification: null,
  claims: null,
  paymentInfo: null
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload }
    case 'SET_LOADING_RENTALS':
      return { ...state, loadingRentals: action.payload }
    case 'SET_PROFILE_LOADED':
      return { ...state, profileLoaded: action.payload }
    case 'SET_STATS_LOADED':
      return { ...state, statsLoaded: action.payload }
    case 'SET_BOOKINGS_LOADED':
      return { ...state, bookingsLoaded: action.payload }
    case 'SET_AUTHENTICATED_USER':
      return { ...state, authenticatedUser: action.payload }
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload }
    case 'SET_SUSPENSION_INFO':
      return { ...state, suspensionInfo: action.payload }
    case 'SET_MODERATION_HISTORY':
      return { ...state, moderationHistory: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'SET_RENTAL_BOOKINGS':
      return { ...state, rentalBookings: action.payload }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
    case 'SET_API_ERROR':
      return { ...state, apiError: action.payload }
    case 'SET_RENTALS_ERROR':
      return { ...state, rentalsError: action.payload }
    case 'SET_SHOW_APPEAL_MODAL':
      return { ...state, showAppealModal: action.payload }
    case 'SET_APPEAL_NOTIFICATIONS':
      return { ...state, appealNotifications: action.payload }
    case 'SET_NOTIFICATIONS_LOADED':
      return { ...state, notificationsLoaded: action.payload }
    case 'REMOVE_APPEAL_NOTIFICATION':
      return {
        ...state,
        appealNotifications: {
          approved: state.appealNotifications.approved.filter(n => n.id !== action.payload),
          denied: state.appealNotifications.denied.filter(n => n.id !== action.payload)
        }
      }
    case 'SET_DOCUMENT_VERIFICATION':
      return { ...state, documentVerification: action.payload }
    case 'SET_CLAIMS':
      return { ...state, claims: action.payload }
    case 'SET_PAYMENT_INFO':
      return { ...state, paymentInfo: action.payload }
    default:
      return state
  }
}

// ========== MAIN COMPONENT ==========
export default function GuestDashboard() {
  const t = useTranslations('GuestDashboard')
  const locale = useLocale()
  const router = useRouter()
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  // Unified data hook
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useDashboard()

  // Secure account banner state
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)

  // Refs for cleanup
  const toastTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const refreshDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toastTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      toastTimeoutsRef.current.clear()
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current)
      }
    }
  }, [])

  // Fetch hasPassword for secure account banner
  useEffect(() => {
    fetch('/api/guest/profile', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.profile?.hasPassword !== undefined) {
          setHasPassword(data.profile.hasPassword)
        }
      })
      .catch(() => {})
  }, [])

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, type, message }
    dispatch({ type: 'ADD_TOAST', payload: newToast })
    const timeout = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id })
      toastTimeoutsRef.current.delete(id)
    }, TOAST_DURATION)
    toastTimeoutsRef.current.set(id, timeout)
  }, [])

  const removeToast = useCallback((id: string) => {
    const timeout = toastTimeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      toastTimeoutsRef.current.delete(id)
    }
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }, [])

  // ========== SYNC UNIFIED HOOK DATA TO LOCAL STATE ==========
  useEffect(() => {
    if (dashboardData) {
      // Set user
      dispatch({
        type: 'SET_AUTHENTICATED_USER',
        payload: {
          id: dashboardData.user.id,
          email: dashboardData.user.email,
          name: dashboardData.user.name || '',
          role: dashboardData.user.role,
          avatar: dashboardData.user.avatar || undefined
        }
      })

      // Set profile
      dispatch({
        type: 'SET_USER_PROFILE',
        payload: {
          id: dashboardData.profile.id || '',
          name: dashboardData.profile.name || '',
          avatar: dashboardData.profile.profilePhoto || undefined,
          verified: dashboardData.profile.isFullyVerified,
          createdAt: dashboardData.user.memberSince,
          profilePhotoUrl: dashboardData.profile.profilePhoto || undefined
        }
      })

      // Set document verification state
      dispatch({
        type: 'SET_DOCUMENT_VERIFICATION',
        payload: {
          emailVerified: dashboardData.profile.emailVerified || false,
          phoneVerified: dashboardData.profile.phoneVerified || false,
          phoneNumber: dashboardData.profile.phoneNumber || null,
          documentsVerified: dashboardData.profile.documentsVerified || false,
          driversLicenseUrl: dashboardData.profile.driversLicenseUrl || null,
          selfieUrl: dashboardData.profile.selfieUrl || null,
          stripeIdentityStatus: dashboardData.profile.stripeIdentityStatus || null,
          stripeIdentityVerifiedAt: dashboardData.profile.stripeIdentityVerifiedAt || null
        }
      })

      // Set suspension info
      if (dashboardData.profile) {
        const suspensionInfo: SuspensionInfo = {
          suspensionLevel: dashboardData.profile.suspensionLevel as SuspensionInfo['suspensionLevel'],
          suspendedAt: dashboardData.profile.suspendedUntil,
          suspendedReason: null,
          suspendedBy: null,
          suspensionExpiresAt: dashboardData.profile.suspendedUntil,
          autoReactivate: false,
          bannedAt: null,
          banReason: null,
          bannedBy: null,
          warningCount: dashboardData.flags.hasActiveWarning ? 1 : 0,
          lastWarningAt: null,
          activeWarningCount: dashboardData.flags.hasActiveWarning ? 1 : 0,
          canBookLuxury: dashboardData.profile.canBookLuxury,
          canBookPremium: dashboardData.profile.canBookPremium,
          requiresManualApproval: false,
          guestId: dashboardData.profile.id || ''
        }
        dispatch({ type: 'SET_SUSPENSION_INFO', payload: suspensionInfo })
      }

      // Set stats
      dispatch({
        type: 'SET_STATS',
        payload: {
          depositWalletBalance: dashboardData.profile?.depositWalletBalance || 0,
          activeRentals: dashboardData.stats.activeRentals,
          completedTrips: dashboardData.stats.completedTrips,
          creditsAndBonus: (dashboardData.profile?.creditBalance || 0) + (dashboardData.profile?.bonusBalance || 0),
          unreadMessages: dashboardData.stats.unreadMessages,
          pendingDocuments: dashboardData.flags.needsVerification ? 1 : 0,
          activeClaims: dashboardData.claims?.active || 0,
          memberTier: dashboardData.stats.memberTier,
          pointsToNextTier: 500,
          averageRating: 0
        }
      })

      // Set claims data
      if (dashboardData.claims) {
        dispatch({
          type: 'SET_CLAIMS',
          payload: {
            total: dashboardData.claims.total,
            active: dashboardData.claims.active,
            pendingResponse: dashboardData.claims.pendingResponse,
            againstMe: dashboardData.claims.againstMe,
            filedByMe: dashboardData.claims.filedByMe,
            accountHold: dashboardData.claims.accountHold
          }
        })
      }

      // Set payment info
      if (dashboardData.paymentInfo) {
        dispatch({
          type: 'SET_PAYMENT_INFO',
          payload: {
            hasCard: dashboardData.paymentInfo.hasCard,
            last4: dashboardData.paymentInfo.last4,
            brand: dashboardData.paymentInfo.brand,
            expiry: dashboardData.paymentInfo.expiry
          }
        })
      }

      // Set bookings
      dispatch({
        type: 'SET_RENTAL_BOOKINGS',
        payload: dashboardData.bookings.map(b => ({
          id: b.id,
          bookingCode: b.bookingCode,
          car: {
            make: b.car.make,
            model: b.car.model,
            year: b.car.year,
            photos: []
          },
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
          verificationStatus: b.verificationStatus,
          totalAmount: b.totalAmount
        }))
      })

      // Set appeal notifications
      dispatch({
        type: 'SET_APPEAL_NOTIFICATIONS',
        payload: {
          approved: dashboardData.notifications.appeals.filter((a: any) => a.type === 'APPROVED'),
          denied: dashboardData.notifications.appeals.filter((a: any) => a.type === 'DENIED')
        }
      })

      // Mark all as loaded
      dispatch({ type: 'SET_PROFILE_LOADED', payload: true })
      dispatch({ type: 'SET_STATS_LOADED', payload: true })
      dispatch({ type: 'SET_BOOKINGS_LOADED', payload: true })
      dispatch({ type: 'SET_NOTIFICATIONS_LOADED', payload: true })
    }
  }, [dashboardData])

  // Sync loading state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: dashboardLoading })
  }, [dashboardLoading])

  // Sync error state
  useEffect(() => {
    if (dashboardError) {
      dispatch({ type: 'SET_API_ERROR', payload: dashboardError })
      if (dashboardError.includes('Session expired')) {
        showToast('error', t('yourSessionHasExpired'))
        setTimeout(() => {
          router.push('/auth/login?from=/dashboard')
        }, 2000)
      } else {
        showToast('error', dashboardError)
      }
    }
  }, [dashboardError, router, showToast])

  // ========== EVENT HANDLERS ==========
  const handleDismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/guest/appeal-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId, action: 'dismiss' })
      })
      if (response.ok) {
        dispatch({ type: 'REMOVE_APPEAL_NOTIFICATION', payload: notificationId })
        refetchDashboard()
      }
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const handleRefresh = async () => {
    if (state.isRefreshing) return
    if (refreshDebounceRef.current) {
      clearTimeout(refreshDebounceRef.current)
    }
    dispatch({ type: 'SET_REFRESHING', payload: true })
    showToast('info', t('refreshingDashboard'))
    try {
      await refetchDashboard()
      showToast('success', t('dashboardUpdatedSuccessfully'))
    } catch (error) {
      showToast('error', t('failedToRefresh'))
    } finally {
      refreshDebounceRef.current = setTimeout(() => {
        dispatch({ type: 'SET_REFRESHING', payload: false })
      }, DEBOUNCE_DELAY)
    }
  }

  const handleAppealSuccess = () => {
    refetchDashboard()
    showToast('success', t('appealSubmittedSuccessfully'))
  }

  const getMemberSince = useCallback(() => {
    if (state.userProfile?.createdAt) {
      return new Date(state.userProfile.createdAt).toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric'
      })
    }
    return t('newMember')
  }, [state.userProfile?.createdAt, locale, t])

  // ========== COMPUTED VALUES ==========
  const userName = state.authenticatedUser?.name || state.userProfile?.name || 'Guest'
  const userAvatar = state.userProfile?.avatar ||
                      state.userProfile?.reviewerProfile?.profilePhotoUrl ||
                      state.userProfile?.profilePhotoUrl ||
                      state.authenticatedUser?.avatar ||
                      '/default-avatar.svg'
  const isVerified = !!(state.userProfile?.verified || state.documentVerification?.stripeIdentityStatus === 'verified')
  const isBanned = state.suspensionInfo?.suspensionLevel === 'BANNED'

  // ========== LOADING STATE ==========
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4">
          {/* Profile Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 animate-pulse -mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <div className="h-6 sm:h-7 md:h-8 w-32 sm:w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="h-10 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mt-3">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-20 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    )
  }

  // ========== ERROR STATE ==========
  if (state.apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('unableToLoadDashboard')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{state.apiError}</p>
          <button
            onClick={() => refetchDashboard()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            aria-label={t('retryLoadingBookings')}
          >
            {t('tryAgainButton')}
          </button>
        </div>
      </div>
    )
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2" role="region" aria-label="Notifications">
        {state.toasts.map(toast => (
          <div
            key={toast.id}
            role="alert"
            aria-live="polite"
            style={{ animation: 'slideInRight 0.3s ease-out' }}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 -mt-10 sm:-mt-12">

        {/* Greeting */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {(() => {
            const hour = new Date().getHours()
            if (hour < 12) return `${t('goodMorning')}, ${userName.split(' ')[0]}!`
            if (hour < 17) return `${t('goodAfternoon')}, ${userName.split(' ')[0]}!`
            return `${t('goodEvening')}, ${userName.split(' ')[0]}!`
          })()}
        </h1>

        {/* Profile Card */}
        <ProfileCard
          userName={userName}
          userAvatar={userAvatar}
          verified={!!state.userProfile?.verified}
          memberSince={getMemberSince()}
          isRefreshing={state.isRefreshing}
          profileLoaded={state.profileLoaded}
          onRefresh={handleRefresh}
          onEditProfile={() => router.push('/profile')}
        />

        {/* Secure Account Banner */}
        {hasPassword === false && (
          <div className="mt-3">
            <SecureAccountBanner hasPassword={hasPassword} />
          </div>
        )}

        {/* Dual-Role Suspension Banner */}
        <SuspensionBanner />

        {/* Priority Banner System */}
        {(() => {
          const firstApproved = state.appealNotifications.approved[0]
          const firstDenied = state.appealNotifications.denied[0]

          // Priority 0: Account hold
          if (state.claims?.accountHold?.hasHold && state.claims.accountHold.claimId) {
            return (
              <div className="mt-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                      {t('accountOnHold')}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {state.claims.accountHold.message || t('accountOnHoldMessage')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => router.push(`/claims/${state.claims?.accountHold?.claimId}`)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        {t('respondToClaim')}
                      </button>
                      <button
                        onClick={() => router.push('/claims')}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                      >
                        {t('viewAllClaims')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Priority 0.5: Pending claim response
          if (state.claims && state.claims.pendingResponse > 0 && !state.claims.accountHold?.hasHold) {
            return (
              <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                      {state.claims.pendingResponse === 1 ? t('claimRequiresResponse') : t('claimsRequireResponse')}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      {state.claims.pendingResponse === 1 ? t('claimAwaitingResponse') : t('claimsAwaitingResponse')}
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => router.push('/claims?filter=pending_response')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        {t('viewPendingClaims')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Priority 1: Approved appeal
          if (firstApproved) {
            return (
              <GoodStandingBanner
                key={firstApproved.id}
                notificationId={firstApproved.id}
                appealId={firstApproved.appeal.id}
                reviewNotes={firstApproved.appeal.reviewNotes}
                onDismiss={() => handleDismissNotification(firstApproved.id)}
              />
            )
          }

          // Priority 2: Denied appeal
          if (firstDenied) {
            return (
              <AppealStatusBanner
                key={firstDenied.id}
                notificationId={firstDenied.id}
                appealId={firstDenied.appeal.id}
                reviewNotes={firstDenied.appeal.reviewNotes}
                reviewedBy={firstDenied.appeal.reviewedBy}
                reviewedAt={firstDenied.appeal.reviewedAt}
                originalAction={firstDenied.appeal.moderationAction?.type}
                originalReason={firstDenied.appeal.moderationAction?.reason}
                onDismiss={() => handleDismissNotification(firstDenied.id)}
              />
            )
          }

          // Priority 3: Warning/suspension
          if (state.suspensionInfo &&
              ((state.suspensionInfo.activeWarningCount ?? 0) > 0 || state.suspensionInfo.suspensionLevel)) {
            return (
              <WarningBanner
                suspensionInfo={state.suspensionInfo}
                moderationHistory={state.moderationHistory}
                guestId={state.userProfile?.id || ''}
                onAppealSuccess={handleAppealSuccess}
              />
            )
          }

          // Priority 4: Document verification
          if (state.documentVerification) {
            return (
              <VerificationAlert
                verificationState={state.documentVerification}
                onNavigate={(path) => router.push(path)}
                hasConfirmedBooking={state.rentalBookings.some(b => b.status === 'CONFIRMED')}
              />
            )
          }

          return null
        })()}

        {/* Featured Cards */}
        <FeaturedCards
          statsLoaded={state.statsLoaded}
          isBanned={!!isBanned}
          bookings={state.rentalBookings}
          onFindCar={() => router.push('/rentals/search')}
          onBookingClick={(id) => router.push(`/rentals/dashboard/bookings/${id}`)}
          onBrowseCars={() => router.push('/rentals/search')}
        />

        {/* Stats Grid */}
        <StatsGrid
          statsLoaded={state.statsLoaded}
          stats={state.stats}
          isVerified={isVerified}
          onStatClick={(path) => router.push(path)}
        />

        {/* Quick Actions */}
        <QuickActions onServiceClick={(path) => router.push(path)} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mt-3">
          <div
            className={`lg:col-span-2 transition-all duration-700 ${
              state.bookingsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {state.loadingRentals ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
                  <p className="text-gray-600 dark:text-gray-400">{t('loadingYourBookings')}</p>
                </div>
              </div>
            ) : state.rentalsError ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">{t('unableToLoadBookings')}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{state.rentalsError}</p>
                  <button
                    onClick={() => refetchDashboard()}
                    className="px-4 py-2 min-h-[44px] bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    aria-label={t('retryLoadingBookings')}
                  >
                    {t('tryAgainButton')}
                  </button>
                </div>
              </div>
            ) : (
              <ErrorBoundary fallback={
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-gray-900 dark:text-white font-semibold mb-2">{t('errorBoundaryTitle')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('errorBoundaryMessage')}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">{t('errorBoundaryRefreshButton')}</button>
                  </div>
                </div>
              }>
                <RentalBookingsSection />
              </ErrorBoundary>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            <RecentTrips
              bookings={state.rentalBookings}
              onViewAll={() => router.push('/rentals/dashboard/bookings')}
              onBookingClick={(id) => router.push(`/rentals/dashboard/bookings/${id}`)}
            />
            <SupportCard onNavigate={() => router.push('/support')} />
            <DisclaimerCard />
          </div>
        </div>
      </div>

      {/* Appeal Modal */}
      {state.suspensionInfo && state.userProfile && (
        <AppealModal
          isOpen={state.showAppealModal}
          onClose={() => dispatch({ type: 'SET_SHOW_APPEAL_MODAL', payload: false })}
          guestId={state.userProfile.id}
          onSuccess={handleAppealSuccess}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
