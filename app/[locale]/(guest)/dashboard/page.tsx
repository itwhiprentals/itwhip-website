// app/(guest)/dashboard/page.tsx
// 🚗 GUEST DASHBOARD - Car Rental Platform with Priority Banner System
// ✅ Only ONE banner shows at a time: Approved > Denied > Warning > Documents
// 🚀 OPTIMIZED: Using unified API endpoint for 10x faster loading
// ✅ UPDATED: Now uses 2-document verification system (Driver's License + Selfie)

'use client'

import { useReducer, useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { IoLockClosedOutline } from 'react-icons/io5'
import { useTranslations, useLocale } from 'next-intl'

// ========== COMPONENT IMPORTS ==========
import SuspensionBanner from '@/app/components/SuspensionBanner'
import WarningBanner from './components/WarningBanner'
import AppealModal from './components/AppealModal'
import GoodStandingBanner from './components/GoodStandingBanner'
import AppealStatusBanner from './components/AppealStatusBanner'
import VerificationAlert from './components/VerificationAlert'
import { SuspensionInfo } from './types'
import { useDashboard } from '@/app/hooks/useDashboard'
import { SecureAccountBanner } from '@/app/[locale]/(guest)/rentals/dashboard/bookings/[id]/components/SecureAccountBanner'

// ========== SVG ICONS ==========
const Car = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M5 13l1-1h3l2-2h6l2 2h3l1 1v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-5l2-1zm0 0l-2-5.5A1 1 0 014 6h3.5l2 4H5zm14 0l2-5.5A1 1 0 0020 6h-3.5l-2 4H19zm-10 4h6" />
  </svg>
)

const RefreshCw = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const CreditCard = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MessageSquare = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const Shield = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Calendar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const Search = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const FileText = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const DollarSign = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Award = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const Edit = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FileTextDocument = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

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

// ✅ UPDATED: Document verification state with Stripe Identity
interface DocumentVerificationState {
  emailVerified: boolean
  phoneVerified: boolean
  phoneNumber?: string | null
  documentsVerified: boolean
  driversLicenseUrl: string | null
  selfieUrl: string | null
  // Stripe Identity fields
  stripeIdentityStatus?: string | null
  stripeIdentityVerifiedAt?: string | null
}

// Claims state for dashboard
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

// Payment info for card display
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
  depositWalletBalance: number  // Changed from totalSaved
  activeRentals: number
  completedTrips: number
  creditsAndBonus: number  // Changed from loyaltyPoints
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

interface ServiceConfig {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  iconColorClass: string
  bgColorClass: string
  path: string
  description: string
  clickable: boolean
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
// Core services config will use translations from component context
const createCoreServicesConfig = (t: any): ServiceConfig[] => [
  {
    id: 'search',
    name: t('findACar'),
    icon: Search,
    iconColorClass: 'text-green-600 dark:text-green-400',
    bgColorClass: 'bg-green-500',
    path: '/rentals/search',
    description: t('browseAvailableVehicles'),
    clickable: true
  },
  {
    id: 'bookings',
    name: t('myBookings'),
    icon: Calendar,
    iconColorClass: 'text-blue-600 dark:text-blue-400',
    bgColorClass: 'bg-blue-500',
    path: '/rentals/dashboard/bookings',
    description: t('viewAndManageReservations'),
    clickable: true
  },
  {
    id: 'claim',
    name: t('fileAClaim'),
    icon: FileText,
    iconColorClass: 'text-orange-600 dark:text-orange-400',
    bgColorClass: 'bg-orange-500',
    path: '/claims/new',
    description: t('reportDamagesOrIssues'),
    clickable: true
  },
  {
    id: 'payments',
    name: t('updatePayment'),
    icon: CreditCard,
    iconColorClass: 'text-purple-600 dark:text-purple-400',
    bgColorClass: 'bg-purple-500',
    path: '/payments/methods',
    description: t('managePaymentMethods'),
    clickable: true
  }
]

// Reordered: Credits & Deposit first for visibility
// Stats config will use translations from component context
const createStatsConfig = (t: any) => [
  {
    label: t('creditsAndBonus'),
    key: 'creditsAndBonus' as keyof DashboardStats,
    icon: Award,
    iconColor: 'text-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    format: (val: number) => `$${val.toFixed(2)}`,
    path: '/payments/credits',
    clickable: true,
    tooltip: t('creditsAndBonusTooltip'),
    lockWhenUnverified: true,
    lockTooltip: t('verifyIdentityToUnlock')
  },
  {
    label: t('deposit'),
    key: 'depositWalletBalance' as keyof DashboardStats,
    icon: Shield,
    iconColor: 'text-green-500',
    textColor: 'text-green-600 dark:text-green-400',
    format: (val: number) => `$${val.toFixed(2)}`,
    path: '/payments/deposit',
    clickable: true,
    tooltip: t('depositTooltip')
  },
  {
    label: t('activeRentals'),
    key: 'activeRentals' as keyof DashboardStats,
    icon: Car,
    iconColor: 'text-blue-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/rentals/dashboard/bookings?filter=active',
    clickable: true
  },
  {
    label: t('totalTrips'),
    key: 'completedTrips' as keyof DashboardStats,
    icon: Calendar,
    iconColor: 'text-gray-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/rentals/dashboard/bookings?filter=completed',
    clickable: true
  },
  {
    label: t('messages'),
    key: 'unreadMessages' as keyof DashboardStats,
    icon: MessageSquare,
    iconColor: 'text-orange-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/messages',
    clickable: true
  },
  {
    label: t('claims'),
    key: 'activeClaims' as keyof DashboardStats,
    icon: AlertCircle,
    iconColor: 'text-red-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/claims',
    clickable: true
  }
]

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
  
  // ========== USE NEW UNIFIED HOOK ==========
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
      console.log('📊 Dashboard data loaded from unified endpoint!')
      console.log('⚡ Performance boost: 1 API call instead of 6!')
      
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
      
      // ✅ UPDATED: Set document verification state with Stripe Identity
      dispatch({
        type: 'SET_DOCUMENT_VERIFICATION',
        payload: {
          emailVerified: dashboardData.profile.emailVerified || false,
          phoneVerified: dashboardData.profile.phoneVerified || false,
          phoneNumber: dashboardData.profile.phoneNumber || null,
          documentsVerified: dashboardData.profile.documentsVerified || false,
          driversLicenseUrl: dashboardData.profile.driversLicenseUrl || null,
          selfieUrl: dashboardData.profile.selfieUrl || null,
          // Stripe Identity fields
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

      // Set payment info (for showing card last4 in dashboard)
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
      
      // Check if session expired
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

  const handleDismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/guest/appeal-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notificationId,
          action: 'dismiss'
        })
      })

      if (response.ok) {
        dispatch({ type: 'REMOVE_APPEAL_NOTIFICATION', payload: notificationId })
        // Reload data to update suspension status
        refetchDashboard()
      }
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const getAvailableServices = (suspensionLevel: string | null): ServiceConfig[] => {
    const disableBooking = suspensionLevel === 'BANNED' || suspensionLevel === 'HARD' || suspensionLevel === 'SOFT'
    
    return CORE_SERVICES.map(service => ({
      ...service,
      clickable: service.id === 'search' ? !disableBooking : service.clickable
    }))
  }

  const handleServiceClick = (path: string, isDisabled: boolean) => {
    if (isDisabled) {
      showToast('error', t('serviceTemporarilyUnavailable'))
      return
    }
    router.push(path)
  }

  const handleStatClick = (path?: string) => {
    if (path) {
      router.push(path)
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

  const handleOpenAppeal = () => {
    dispatch({ type: 'SET_SHOW_APPEAL_MODAL', payload: true })
  }

  const handleCloseAppeal = () => {
    dispatch({ type: 'SET_SHOW_APPEAL_MODAL', payload: false })
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
  }, [state.userProfile?.createdAt, t])

  const getMemberTierColor = useCallback((tier: string) => {
    switch(tier?.toLowerCase()) {
      case 'gold': return 'text-yellow-600 dark:text-yellow-400'
      case 'platinum': return 'text-purple-600 dark:text-purple-400'
      case 'silver': return 'text-gray-600 dark:text-gray-400'
      case 'bronze': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-green-600 dark:text-green-400'
    }
  }, [])

  const userName = state.authenticatedUser?.name || state.userProfile?.name || 'Guest'
  const userAvatar = state.userProfile?.avatar || 
                      state.userProfile?.reviewerProfile?.profilePhotoUrl || 
                      state.userProfile?.profilePhotoUrl ||
                      state.authenticatedUser?.avatar || 
                      '/default-avatar.svg'

  const STATS_CONFIG = createStatsConfig(t)
  const CORE_SERVICES = createCoreServicesConfig(t)
  const availableServices = getAvailableServices(state.suspensionInfo?.suspensionLevel || null)

  // Loading state with animations
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-4">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 pb-8">
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

            <div className="space-y-4 sm:space-y-6">
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
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    )
  }

  // Error state
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
        <div
          className={`-mx-2 sm:mx-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-all duration-500 ${
            state.profileLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <img
                src={userAvatar}
                alt={`${userName}'s profile picture`}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full ring-2 ring-green-500 flex-shrink-0 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.svg'
                }}
              />
              <div className="flex-1 min-w-0">
                {/* Name Row */}
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                    {userName}
                  </h2>
                  {state.userProfile?.verified && (
                    <span className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {t('verified')}
                    </span>
                  )}
                </div>
                {/* Location Row */}
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('phoenixAZ')}</p>
                {/* Member Since Row */}
                <p className="text-xs text-gray-500 dark:text-gray-400">{getMemberSince()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRefresh}
                disabled={state.isRefreshing}
                className={`hidden sm:flex p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-all ${
                  state.isRefreshing ? 'animate-spin' : ''
                }`}
                aria-label={t('refreshDashboard')}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm flex items-center gap-1.5"
                aria-label={t('editProfile')}
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">{t('editButton')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Secure Account Banner - for temp accounts without password */}
        {hasPassword === false && (
          <div className="mt-4">
            <SecureAccountBanner hasPassword={hasPassword} />
          </div>
        )}

        {/* Dual-Role Suspension Banner - Highest Priority */}
        <SuspensionBanner />

        {/* ========================================================================
            ✅ UPDATED PRIORITY BANNER SYSTEM - 5 LEVELS
            Priority 0: Account Hold (blocks booking due to claim)
            Priority 1: Approved Appeal
            Priority 2: Denied Appeal
            Priority 3: Warning/Suspension
            Priority 4: Document Verification (2 documents only)
            ======================================================================== */}
        {(() => {
          const firstApproved = state.appealNotifications.approved[0]
          const firstDenied = state.appealNotifications.denied[0]

          // Priority 0: Show account hold banner (claim-related)
          if (state.claims?.accountHold?.hasHold && state.claims.accountHold.claimId) {
            return (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
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

          // Priority 0.5: Show pending claim response warning
          if (state.claims && state.claims.pendingResponse > 0 && !state.claims.accountHold?.hasHold) {
            return (
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 rounded-lg p-4">
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

          // Priority 1: Show approved appeal banner
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

          // Priority 2: Show denied appeal banner
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

          // Priority 3: Show warning/suspension banner
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

          // Priority 4: Show document verification alert (2 documents only)
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

        {/* Featured Cards - Find a Car + Upcoming Trip */}
        <div className={`-mx-2 sm:mx-0 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 transition-all duration-700 ${
          state.statsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Find a Car - Primary CTA */}
          <button
            onClick={() => handleServiceClick('/rentals/search', state.suspensionInfo?.suspensionLevel === 'BANNED')}
            disabled={state.suspensionInfo?.suspensionLevel === 'BANNED'}
            className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-5 sm:p-6 rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{t('findACar')}</h3>
                <p className="text-green-100 text-sm">{t('browseAvailableVehicles')}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </button>

          {/* Upcoming Trip or Browse Cars CTA */}
          {state.rentalBookings.length > 0 && state.rentalBookings.find(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE') ? (
            <div
              onClick={() => {
                const upcomingBooking = state.rentalBookings.find(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE')
                if (upcomingBooking) router.push(`/rentals/dashboard/bookings/${upcomingBooking.id}`)
              }}
              className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer group"
            >
              {(() => {
                const upcomingBooking = state.rentalBookings.find(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE')
                if (!upcomingBooking) return null
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          upcomingBooking.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {upcomingBooking.status === 'ACTIVE' ? t('activeNow') : t('upcoming')}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                        {upcomingBooking.car.year} {upcomingBooking.car.make} {upcomingBooking.car.model}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(upcomingBooking.startDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - {new Date(upcomingBooking.endDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <button
              onClick={() => router.push('/rentals/search')}
              className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg active:scale-[0.98] transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('noUpcomingTrips')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookFirstCarRentalToday')}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Stats Grid - 3x2 on Mobile, 6x1 on Desktop */}
        <div
          className={`-mx-2 sm:mx-0 mt-4 transition-all duration-700 ${
            state.statsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {STATS_CONFIG.map((stat, index) => {
              const value = state.stats[stat.key]
              const displayValue = stat.format ? stat.format(value as number) : value
              const StatIcon = stat.icon
              const isVerified = state.userProfile?.verified || state.documentVerification?.stripeIdentityStatus === 'verified'
              const showLock = (stat as any).lockWhenUnverified && !isVerified && (value as number) > 0

              return (
                <div
                  key={stat.label}
                  onClick={() => stat.clickable && handleStatClick(stat.path)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: state.statsLoaded ? 'fadeInUp 0.4s ease-out forwards' : 'none'
                  }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700 ${
                    stat.clickable ? 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.98] transition-all' : ''
                  } ${showLock ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <StatIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor} mb-1`} aria-hidden="true" />
                    <p className={`text-base sm:text-lg font-bold ${showLock ? 'text-gray-400 dark:text-gray-500' : stat.textColor}`}>
                      {displayValue}
                      {showLock && <IoLockClosedOutline className="inline w-3 h-3 text-yellow-500 ml-1" />}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate w-full">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions - Compact Row */}
        <div className="-mx-2 sm:mx-0 flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {availableServices.filter(s => s.id !== 'search').map((service) => {
            const isDisabled = false

            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service.path, isDisabled)}
                disabled={isDisabled}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 transition-all ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 active:scale-95'
                }`}
              >
                <service.icon className={`w-4 h-4 ${service.iconColorClass}`} aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {service.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 pb-8">
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

          <div className="space-y-4">
            {/* Recent Trips Card */}
            <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('recentTrips')}
                </h3>
                {state.rentalBookings.length > 0 && (
                  <button
                    onClick={() => router.push('/rentals/dashboard/bookings')}
                    className="text-xs text-green-600 dark:text-green-400 hover:underline"
                  >
                    {t('viewAll')}
                  </button>
                )}
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {state.rentalBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 py-3 transition-colors"
                    onClick={() => router.push(`/rentals/dashboard/bookings/${booking.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {booking.car.year} {booking.car.make}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {booking.car.model}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(booking.startDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                      booking.status === 'ACTIVE'
                        ? 'bg-emerald-500 text-white'
                        : booking.status === 'COMPLETED'
                        ? 'bg-slate-500 text-white'
                        : booking.status === 'CANCELLED' || booking.status === 'CANCELED'
                        ? 'bg-rose-500 text-white'
                        : booking.status === 'PENDING'
                        ? 'bg-amber-500 text-white'
                        : 'bg-sky-500 text-white'
                    }`}>
                      {booking.status === 'COMPLETED' ? t('complete') :
                       booking.status === 'CANCELLED' || booking.status === 'CANCELED' ? t('canceled') :
                       booking.status === 'ACTIVE' ? t('active') :
                       booking.status === 'PENDING' ? t('pending') :
                       booking.status === 'CONFIRMED' ? t('confirmed') :
                       booking.status}
                    </span>
                  </div>
                ))}

                {state.rentalBookings.length === 0 && (
                  <div className="text-center py-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('noTripsYet')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Support Card */}
            <button
              onClick={() => router.push('/support')}
              className="block -mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('needHelp')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('supportAvailable')}</p>
                </div>
              </div>
            </button>

            {/* Important Information Disclaimer */}
            <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {t('importantInformation')}
              </p>
              <p className="text-[9px] leading-relaxed text-gray-500 dark:text-gray-500">
                {t('disclaimerText')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appeal Modal */}
      {state.suspensionInfo && state.userProfile && (
        <AppealModal
          isOpen={state.showAppealModal}
          onClose={handleCloseAppeal}
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
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
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