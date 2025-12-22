// app/(guest)/dashboard/page.tsx
// 🚗 GUEST DASHBOARD - Car Rental Platform with Priority Banner System
// ✅ Only ONE banner shows at a time: Approved > Denied > Warning > Documents
// 🚀 OPTIMIZED: Using unified API endpoint for 10x faster loading
// ✅ UPDATED: Now uses 2-document verification system (Driver's License + Selfie)

'use client'

import { useReducer, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// ========== COMPONENT IMPORTS ==========
import WarningBanner from './components/WarningBanner'
import AppealModal from './components/AppealModal'
import GoodStandingBanner from './components/GoodStandingBanner'
import AppealStatusBanner from './components/AppealStatusBanner'
import VerificationAlert from './components/VerificationAlert'
import { SuspensionInfo } from './types'
import { useDashboard } from '@/app/hooks/useDashboard'

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

// ✅ UPDATED: Document verification state for 2 documents only
interface DocumentVerificationState {
  emailVerified: boolean
  phoneVerified: boolean
  documentsVerified: boolean
  driversLicenseUrl: string | null
  selfieUrl: string | null
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
              Unable to load bookings section
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Something went wrong. Please try refreshing the page.
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
  totalSaved: number
  activeRentals: number
  completedTrips: number
  loyaltyPoints: number
  unreadMessages: number
  pendingDocuments: number
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

// ========== CONSTANTS ==========
const CORE_SERVICES: ServiceConfig[] = [
  { 
    id: 'search', 
    name: 'Find a Car', 
    icon: Search,
    iconColorClass: 'text-green-600 dark:text-green-400',
    bgColorClass: 'bg-green-500',
    path: '/rentals/search',
    description: 'Browse available vehicles',
    clickable: true
  },
  { 
    id: 'bookings', 
    name: 'My Bookings', 
    icon: Calendar,
    iconColorClass: 'text-blue-600 dark:text-blue-400',
    bgColorClass: 'bg-blue-500',
    path: '/rentals/dashboard/bookings',
    description: 'View and manage reservations',
    clickable: true
  },
  { 
    id: 'claim', 
    name: 'File a Claim', 
    icon: FileText,
    iconColorClass: 'text-orange-600 dark:text-orange-400',
    bgColorClass: 'bg-orange-500',
    path: '/claims/new',
    description: 'Report damages or issues',
    clickable: true
  },
  { 
    id: 'payments', 
    name: 'Update Payment', 
    icon: CreditCard,
    iconColorClass: 'text-purple-600 dark:text-purple-400',
    bgColorClass: 'bg-purple-500',
    path: '/payments/methods',
    description: 'Manage payment methods',
    clickable: true
  }
]

const STATS_CONFIG = [
  {
    label: 'Active Rentals',
    key: 'activeRentals' as keyof DashboardStats,
    icon: Car,
    iconColor: 'text-green-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/rentals/dashboard/bookings?filter=active',
    clickable: true
  },
  {
    label: 'Total Trips',
    key: 'completedTrips' as keyof DashboardStats,
    icon: Calendar,
    iconColor: 'text-blue-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/rentals/dashboard/bookings?filter=completed',
    clickable: true
  },
  {
    label: 'Total Saved',
    key: 'totalSaved' as keyof DashboardStats,
    icon: DollarSign,
    iconColor: 'text-green-500',
    textColor: 'text-green-600 dark:text-green-400',
    format: (val: number) => `$${val.toFixed(0)}`,
    clickable: false
  },
  {
    label: 'Loyalty Points',
    key: 'loyaltyPoints' as keyof DashboardStats,
    icon: Award,
    iconColor: 'text-purple-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/profile/loyalty',
    clickable: true
  },
  {
    label: 'Messages',
    key: 'unreadMessages' as keyof DashboardStats,
    icon: MessageSquare,
    iconColor: 'text-orange-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/messages',
    clickable: true
  },
  {
    label: 'Documents',
    key: 'pendingDocuments' as keyof DashboardStats,
    icon: FileTextDocument,
    iconColor: 'text-indigo-500',
    textColor: 'text-gray-900 dark:text-white',
    path: '/profile?tab=documents',
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
    totalSaved: 0,
    activeRentals: 0,
    completedTrips: 0,
    loyaltyPoints: 0,
    unreadMessages: 0,
    pendingDocuments: 0,
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
  documentVerification: null
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
    default:
      return state
  }
}

// ========== MAIN COMPONENT ==========
export default function GuestDashboard() {
  const router = useRouter()
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  
  // ========== USE NEW UNIFIED HOOK ==========
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useDashboard()
  
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
      
      // ✅ UPDATED: Set document verification state with only 2 documents
      dispatch({
        type: 'SET_DOCUMENT_VERIFICATION',
        payload: {
          emailVerified: dashboardData.profile.emailVerified || false,
          phoneVerified: dashboardData.profile.phoneVerified || false,
          phoneNumber: dashboardData.profile.phoneNumber || null,  // ✅ FIXED: Include phone number for verification check
          documentsVerified: dashboardData.profile.documentsVerified || false,
          driversLicenseUrl: dashboardData.profile.driversLicenseUrl || null,
          selfieUrl: dashboardData.profile.selfieUrl || null
        }
      })
      
      // Set suspension info
      if (dashboardData.profile) {
        const suspensionInfo: SuspensionInfo = {
          suspensionLevel: dashboardData.profile.suspensionLevel,
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
          totalSaved: 0,
          activeRentals: dashboardData.stats.activeRentals,
          completedTrips: dashboardData.stats.completedTrips,
          loyaltyPoints: dashboardData.stats.loyaltyPoints,
          unreadMessages: dashboardData.stats.unreadMessages,
          pendingDocuments: dashboardData.flags.needsVerification ? 1 : 0,
          memberTier: dashboardData.stats.memberTier,
          pointsToNextTier: 500,
          averageRating: 0
        }
      })
      
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
        showToast('error', 'Your session has expired. Redirecting to login...')
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
      showToast('error', 'This service is temporarily unavailable due to account restrictions')
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
    showToast('info', 'Refreshing your dashboard...')
    
    try {
      await refetchDashboard()
      showToast('success', 'Dashboard updated successfully!')
    } catch (error) {
      showToast('error', 'Failed to refresh. Please try again.')
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
    showToast('success', 'Appeal submitted successfully!')
  }

  const getMemberSince = useCallback(() => {
    if (state.userProfile?.createdAt) {
      return new Date(state.userProfile.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })
    }
    return 'New Member'
  }, [state.userProfile?.createdAt])

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{state.apiError}</p>
          <button
            onClick={() => refetchDashboard()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            aria-label="Retry loading dashboard"
          >
            Try Again
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
      <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4">
        
        {/* Profile Card */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600 p-3 sm:p-4 -mt-8 transition-all duration-700 ${
            state.profileLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          
          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <img
                  src={userAvatar}
                  alt={`${userName}'s profile picture`}
                  className="h-12 w-12 rounded-full ring-2 ring-green-500 flex-shrink-0 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.svg'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {userName}
                  </h1>
                  <div className="flex items-center space-x-2">
                    {state.userProfile?.verified && (
                      <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {getMemberSince()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={() => {
                    router.push('/profile')
                  }}
                  className="px-3 py-3 min-h-[44px] bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm rounded-lg font-medium flex items-center space-x-1 transition-all"
                  aria-label="Edit profile"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={userAvatar}
                alt={`${userName}'s profile picture`}
                className="h-14 w-14 md:h-16 md:w-16 rounded-full ring-2 ring-green-500 ring-offset-2 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.svg'
                }}
              />
              
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {userName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Member since {getMemberSince()}
                  </span>
                  {state.userProfile?.verified && (
                    <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-3">
              <button
                onClick={handleRefresh}
                disabled={state.isRefreshing}
                className={`hidden lg:block p-2 min-w-[44px] min-h-[44px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-all ${
                  state.isRefreshing ? 'animate-spin' : ''
                }`}
                aria-label="Refresh dashboard"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => {
                  router.push('/profile')
                }}
                className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm md:text-base flex items-center space-x-2"
                aria-label="Edit profile"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================
            ✅ UPDATED PRIORITY BANNER SYSTEM - 4 LEVELS
            Priority 1: Approved Appeal
            Priority 2: Denied Appeal
            Priority 3: Warning/Suspension
            Priority 4: Document Verification (2 documents only)
            ======================================================================== */}
        {(() => {
          const firstApproved = state.appealNotifications.approved[0]
          const firstDenied = state.appealNotifications.denied[0]
          
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
              (state.suspensionInfo.activeWarningCount > 0 || state.suspensionInfo.suspensionLevel)) {
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
              />
            )
          }
          
          return null
        })()}

        {/* Stats Grid */}
        <div 
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-4 transition-all duration-700 ${
            state.statsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {STATS_CONFIG.map((stat, index) => {
            const value = state.stats[stat.key]
            const displayValue = stat.format ? stat.format(value as number) : value
            const StatIcon = stat.icon
            
            return (
              <div
                key={stat.label}
                onClick={() => stat.clickable && handleStatClick(stat.path)}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: state.statsLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-600 min-h-[88px] ${
                  stat.clickable ? 'cursor-pointer hover:shadow-lg active:scale-95 transition-all' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{stat.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold mt-1 ${stat.textColor}`}>
                      {displayValue}
                    </p>
                  </div>
                  <StatIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.iconColor} opacity-60 flex-shrink-0 ml-2`} aria-hidden="true" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
          {availableServices.map((service, index) => {
            const isDisabled = service.id === 'search' && !service.clickable
            
            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service.path, isDisabled)}
                disabled={isDisabled}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: state.statsLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                }}
                className={`bg-white dark:bg-gray-800 p-4 sm:p-6 min-h-[44px] rounded-lg shadow-md transition-all group border-2 border-gray-300 dark:border-gray-600 ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg active:scale-95'
                }`}
                aria-label={`${service.name}: ${service.description}${isDisabled ? ' (Disabled due to account suspension)' : ''}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-2 sm:p-3 rounded-full ${service.bgColorClass} bg-opacity-10 ${!isDisabled && 'group-hover:bg-opacity-20'} transition-colors mb-2 sm:mb-3`}>
                    <service.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${service.iconColorClass}`} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                    {service.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                    {isDisabled ? 'Temporarily unavailable' : service.description}
                  </p>
                </div>
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
                  <p className="text-gray-600 dark:text-gray-400">Loading your bookings...</p>
                </div>
              </div>
            ) : state.rentalsError ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">Unable to load bookings</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{state.rentalsError}</p>
                  <button
                    onClick={() => refetchDashboard()}
                    className="px-4 py-2 min-h-[44px] bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    aria-label="Retry loading bookings"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <ErrorBoundary>
                <RentalBookingsSection />
              </ErrorBoundary>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border-2 border-gray-300 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                Account Overview
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Member Tier</span>
                  <span className={`text-xs sm:text-sm font-semibold ${getMemberTierColor(state.stats.memberTier || 'Bronze')}`}>
                    {state.stats.memberTier || 'Bronze'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Next Reward</span>
                  <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                    {state.stats.pointsToNextTier || 500} points away
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {state.stats.averageRating > 0 ? `${state.stats.averageRating.toFixed(1)} ⭐` : 'No ratings yet'}
                  </span>
                </div>
                
                <div className="pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      router.push('/profile')
                    }}
                    className="w-full py-2 min-h-[44px] text-center text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    aria-label="View full profile"
                  >
                    View Full Profile →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border-2 border-gray-300 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                Recent Activity
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                {state.rentalBookings.slice(0, 3).map((booking) => (
                  <div 
                    key={booking.id}
                    className="flex items-start space-x-2 sm:space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors min-h-[60px]"
                    onClick={() => {
                      router.push(`/rentals/dashboard/bookings/${booking.id}`)
                    }}
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {booking.car.year} {booking.car.make} {booking.car.model}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      booking.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : booking.status === 'COMPLETED'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
                
                {state.rentalBookings.length === 0 && (
                  <div className="text-center py-4">
                    <Car className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      No recent bookings
                    </p>
                    <button
                      onClick={() => {
                        router.push('/rentals/search')
                      }}
                      className="mt-3 text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      Find your first car →
                    </button>
                  </div>
                )}
                
                {state.rentalBookings.length > 0 && (
                  <div className="pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        router.push('/rentals/dashboard/bookings')
                      }}
                      className="w-full py-2 min-h-[44px] text-center text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      View All Bookings →
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 sm:p-6 border-2 border-gray-300 dark:border-gray-600 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                Need Help?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Our support team is available 24/7 to assist you
              </p>
              <button
                onClick={() => {
                  router.push('/support')
                }}
                className="w-full bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-700"
                aria-label="Contact support team"
              >
                Contact Support
              </button>
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
      `}</style>
    </div>
  )
}