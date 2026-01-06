// app/host/dashboard/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoCarOutline,
  IoStatsChartOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoAddCircleOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoHomeOutline,
  IoStarOutline,
  IoChatbubbleOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoImageOutline,
  IoCarSportOutline,
  IoPricetagOutline,
  IoDocumentOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoBusinessOutline,
  IoLockClosedOutline
} from 'react-icons/io5'
import VerificationProgress from '../components/VerificationProgress'
import PendingBanner from '../components/PendingBanner'
import ClaimBanner from './components/ClaimBanner'
import SuspensionBanner from '@/app/components/SuspensionBanner'
import ESGDashboardCard from '@/app/components/host/ESGDashboardCard'
import ServiceMetricsDashboardCard from '@/app/components/host/ServiceMetricsDashboardCard'

interface CarData {
  id: string
  make: string
  model: string
  year: number
  color?: string
  trim?: string
  isActive: boolean
  // Pricing & metrics
  dailyRate: number
  totalTrips?: number
  rating?: number
  // Photos
  photo?: string
  heroPhoto?: string
  photos?: Array<{ id: string; url: string }> | string[]
  photoCount?: number
  // Location
  location?: string
  city?: string
  state?: string
  // Fields for completion status
  vin?: string | null
  licensePlate?: string | null
  description?: string | null
}

interface HostData {
  id: string
  name: string
  email: string
  profilePhoto?: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'NEEDS_ATTENTION'
  dashboardAccess: boolean
  isVerified: boolean
  documentStatuses?: any
  backgroundCheckStatus?: string
  pendingActions?: string[]
  restrictionReasons?: string[]
  // Host Role Fields (from signup selection)
  isHostManager?: boolean
  managesOwnCars?: boolean
  managesOthersCars?: boolean
  hostType?: string
  permissions: {
    canViewBookings: boolean
    canEditCalendar: boolean
    canSetPricing: boolean
    canMessageGuests: boolean
    canWithdrawFunds: boolean
  }
  stats: {
    totalCars: number
    activeCars: number
    totalTrips: number
    rating: number
    totalEarnings: number
    unreadMessages?: number
    pendingClaims?: number
    approvedClaims?: number
    totalClaims?: number
    managedVehicles?: number
  }
  cars?: CarData[]
  documents?: {
    governmentIdUrl?: string
    driversLicenseUrl?: string
    insuranceDocUrl?: string
  }
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isRead: boolean
  actionRequired: boolean
  actionUrl?: string
  createdAt: Date
  metadata?: any
}

interface ClaimNotification extends Notification {
  type: 'CLAIM_FILED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'GUEST_RESPONSE' | 'GUEST_NO_RESPONSE'
  claimId?: string
  bookingCode?: string
  guestName?: string
  metadata?: {
    reviewNotes?: string
    rejectionReason?: string
    responseDeadline?: string
    guestResponse?: string
    estimatedCost?: number
  }
}

// Helper function to check if car listing is complete
function getCarCompletionStatus(car: CarData): {
  isComplete: boolean
  completedSteps: number
  totalSteps: number
  missingItems: string[]
  completionPercent: number
} {
  const missingItems: string[] = []
  let completedSteps = 0
  const totalSteps = 5

  // 1. Photos (minimum 6)
  const photoCount = car.photoCount || (Array.isArray(car.photos) ? car.photos.length : 0)
  if (photoCount >= 6) {
    completedSteps++
  } else {
    missingItems.push(`${6 - photoCount} more photo${6 - photoCount > 1 ? 's' : ''} needed`)
  }

  // 2. VIN
  if (car.vin && car.vin.length >= 17) {
    completedSteps++
  } else {
    missingItems.push('VIN number')
  }

  // 3. License Plate
  if (car.licensePlate && car.licensePlate.length >= 2) {
    completedSteps++
  } else {
    missingItems.push('License plate')
  }

  // 4. Daily Rate (must be > 0)
  if (car.dailyRate && car.dailyRate > 0) {
    completedSteps++
  } else {
    missingItems.push('Daily rate')
  }

  // 5. Description (minimum 50 characters)
  if (car.description && car.description.length >= 50) {
    completedSteps++
  } else {
    missingItems.push('Description (50+ characters)')
  }

  const isComplete = completedSteps === totalSteps
  const completionPercent = Math.round((completedSteps / totalSteps) * 100)

  return { isComplete, completedSteps, totalSteps, missingItems, completionPercent }
}

// Incomplete Car Card Component
function IncompleteCarCard({ car, onComplete }: { car: CarData; onComplete: () => void }) {
  const status = getCarCompletionStatus(car)
  const [showAllItems, setShowAllItems] = useState(false)

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 sm:p-5">
      {/* Header - Year/Make on top, Model/Trim below */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg flex items-center justify-center">
            <IoCarSportOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            {/* Year and Make - Top Line */}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {car.year} {car.make}
            </h3>
            {/* Model and Trim - Second Line */}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {car.model}{car.trim ? ` ${car.trim}` : ''}
            </p>
            {car.color && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{car.color}</p>
            )}
          </div>
        </div>
        <span className="px-2.5 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded-full">
          INCOMPLETE
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-600 dark:text-gray-400">Listing Progress</span>
          <span className="font-semibold text-gray-900 dark:text-white">{status.completionPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${status.completionPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {status.completedSteps} of {status.totalSteps} steps complete
        </p>
      </div>

      {/* Missing Items */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Still needed:</p>
        <ul className="space-y-1.5">
          {/* Show first 3 items always */}
          {status.missingItems.slice(0, 3).map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <IoWarningOutline className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              {item}
            </li>
          ))}
          {/* Show remaining items when expanded */}
          {showAllItems && status.missingItems.slice(3).map((item, idx) => (
            <li key={`more-${idx}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <IoWarningOutline className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              {item}
            </li>
          ))}
          {/* Expandable "+X more items" button */}
          {status.missingItems.length > 3 && (
            <li>
              <button
                type="button"
                onClick={() => setShowAllItems(!showAllItems)}
                className="flex items-center gap-1 text-sm text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 ml-6 font-medium transition-colors"
              >
                {showAllItems ? (
                  <>
                    <IoChevronUpOutline className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <IoChevronDownOutline className="w-4 h-4" />
                    +{status.missingItems.length - 3} more item{status.missingItems.length - 3 > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Action Button */}
      <Link
        href={`/host/cars/${car.id}/edit`}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
      >
        Complete Your Listing
        <IoChevronForwardOutline className="w-4 h-4" />
      </Link>
    </div>
  )
}

// Active Car Card Component - Enhanced with Photo & Metrics
function ActiveCarCard({ car, isApproved }: { car: CarData; isApproved: boolean }) {
  const carPhoto = car.photo || car.heroPhoto
  const carLocation = car.location || (car.city && car.state ? `${car.city}, ${car.state}` : null)

  return (
    <Link
      href={`/host/cars/${car.id}/edit`}
      className="block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all bg-white dark:bg-gray-800 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
    >
      {/* Car Photo */}
      <div className="relative h-36 sm:h-40 bg-gray-100 dark:bg-gray-700">
        {carPhoto ? (
          <Image
            src={carPhoto}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <IoCarOutline className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
          car.isActive 
            ? 'bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {car.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      {/* Car Details */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
          {car.year} {car.make} {car.model}
        </h3>
        {car.color && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {car.color}
          </p>
        )}
        
        {/* Metrics Row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {/* Daily Rate */}
          {car.dailyRate !== undefined && car.dailyRate > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-white">
                ${car.dailyRate}
              </span>
              <span>/day</span>
            </div>
          )}
          
          {/* Trips */}
          {car.totalTrips !== undefined && (
            <div className="flex items-center gap-1">
              <IoStatsChartOutline className="w-3.5 h-3.5" />
              <span>{car.totalTrips} {car.totalTrips === 1 ? 'trip' : 'trips'}</span>
            </div>
          )}
          
          {/* Rating */}
          {car.rating !== undefined && car.rating > 0 && (
            <div className="flex items-center gap-1">
              <IoStarOutline className="w-3.5 h-3.5 text-yellow-500" />
              <span>{car.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Location */}
        {carLocation && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <IoLocationOutline className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{carLocation}</span>
          </div>
        )}

        {/* Manage Link */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-purple-600 dark:text-purple-400 text-sm font-medium inline-flex items-center gap-1 group-hover:underline">
            Manage <IoChevronForwardOutline className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function HostDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hostData, setHostData] = useState<HostData | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

  // Check for welcome param (new signup)
  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
      // Remove query param from URL without refresh
      window.history.replaceState({}, '', '/host/dashboard')
    }
  }, [searchParams])

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/host/login', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        router.push('/host/login')
        return
      }

      const data = await response.json()
      if (data.authenticated) {
        fetchHostData(data.host.id)
        fetchNotifications(data.host.id)
      } else {
        router.push('/host/login')
      }
    } catch (err) {
      console.error('Session check error:', err)
      router.push('/host/login')
    }
  }

  const fetchHostData = async (hostId: string) => {
    try {
      const response = await fetch(`/api/host/dashboard?hostId=${hostId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setHostData(data.host)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      setError('An error occurred while loading your dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async (hostId: string) => {
    try {
      const response = await fetch(`/api/host/notifications?hostId=${hostId}&limit=10&status=unread`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          const notifications = result.data.notifications || []
          
          const mappedNotifications = notifications.map((n: any) => {
            const claimId = n.actionUrl ? n.actionUrl.split('/').pop() : null
            const bookingCodeMatch = n.message.match(/booking ([A-Z0-9-]+)/)
            const costMatch = n.message.match(/\$([0-9,]+\.?\d*)/)
            
            return {
              id: n.id,
              type: n.type,
              title: n.subject,
              message: n.message,
              priority: n.priority,
              isRead: !!n.readAt,
              actionRequired: n.actionRequired || false,
              actionUrl: n.actionUrl,
              createdAt: n.createdAt,
              claimId: claimId,
              bookingCode: bookingCodeMatch ? bookingCodeMatch[1] : undefined,
              metadata: {
                estimatedCost: costMatch ? parseFloat(costMatch[1].replace(',', '')) : 0
              }
            }
          })
          
          setNotifications(mappedNotifications)
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/host/notifications`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: [notificationId],
          action: 'read'
        })
      })

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/host/login', {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      router.push('/host/login')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  const isApproved = hostData?.approvalStatus === 'APPROVED'
  const isPending = hostData?.approvalStatus === 'PENDING'
  const needsAttention = hostData?.approvalStatus === 'NEEDS_ATTENTION'

  // Separate incomplete and complete cars
  const incompleteCars = hostData?.cars?.filter(car => {
    const status = getCarCompletionStatus(car)
    return !status.isComplete
  }) || []

  const completeCars = hostData?.cars?.filter(car => {
    const status = getCarCompletionStatus(car)
    return status.isComplete
  }) || []

  // Check if host has any incomplete cars (for verification progress)
  const hasIncompleteCar = incompleteCars.length > 0

  const navigationItems = [
    { name: 'Dashboard', href: '/host/dashboard', icon: IoHomeOutline, current: true },
    { name: 'My Cars', href: '/host/cars', icon: IoCarOutline, current: false },
    { name: 'Bookings', href: '/host/bookings', icon: IoCalendarOutline, current: false },
    { name: 'Claims', href: '/host/claims', icon: IoShieldCheckmarkOutline, current: false },
    { name: 'Messages', href: '/host/messages', icon: IoChatbubbleOutline, current: false },
    { name: 'Earnings', href: '/host/earnings', icon: IoWalletOutline, current: false },
    { name: 'Profile', href: '/host/profile', icon: IoPersonOutline, current: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:border-r lg:border-gray-200 dark:lg:border-gray-700">
          <div className="flex flex-col w-full">
            <div className="flex flex-col flex-1 bg-white dark:bg-gray-800">
              <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Host Portal</h2>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                    {item.name === 'Messages' && (hostData?.stats.unreadMessages || 0) > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {hostData?.stats.unreadMessages}
                      </span>
                    )}
                    {item.name === 'Claims' && (hostData?.stats.pendingClaims || 0) > 0 && (
                      <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {hostData?.stats.pendingClaims}
                      </span>
                    )}
                    {item.name === 'My Cars' && incompleteCars.length > 0 && (
                      <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        !
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <IoLogOutOutline className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, {hostData?.name || 'Host'}!
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {!isApproved ? 'Your host dashboard (limited access)' : 'Manage your car rental business'}
              </p>
              
              {/* Add New Car button - Only for hosts who own their cars */}
              {isApproved && incompleteCars.length === 0 && hostData?.managesOwnCars !== false && (
                <Link
                  href="/host/cars/add"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <IoAddCircleOutline className="w-5 h-5" />
                  Add New Car
                </Link>
              )}
            </div>

            {/* Suspension Banner - Highest Priority */}
            <SuspensionBanner />

            {/* Welcome Banner for New Signups */}
            {showWelcome && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center flex-shrink-0">
                    <IoCheckmarkCircleOutline className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Welcome to ItWhip! 🎉
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mt-1">
                      {hostData?.managesOwnCars === false
                        ? "Thank you for signing up as a Fleet Manager. Your application is being reviewed and you'll be notified within 24-48 hours once approved."
                        : "Thank you for signing up as a host. Your application is being reviewed and you'll be notified within 24-48 hours once approved."
                      }
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      {hostData?.managesOwnCars === false
                        ? "While you wait, explore the Partner Dashboard to start inviting car owners to list their vehicles with you."
                        : "While you wait, you can complete your vehicle listing by adding photos, VIN, and pricing."
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Priority Banner System */}
            {(() => {
              const claimNotifications = notifications.filter(n =>
                ['CLAIM_FILED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'GUEST_RESPONSE', 'GUEST_NO_RESPONSE'].includes(n.type)
              ) as ClaimNotification[]

              const priority =
                claimNotifications.find(n => n.type === 'CLAIM_APPROVED') ||
                claimNotifications.find(n => n.type === 'GUEST_RESPONSE') ||
                claimNotifications.find(n => n.type === 'CLAIM_REJECTED') ||
                claimNotifications.find(n => n.type === 'GUEST_NO_RESPONSE') ||
                claimNotifications.find(n => n.type === 'CLAIM_FILED')

              if (priority) {
                return <ClaimBanner notification={priority} onDismiss={markNotificationAsRead} />
              }

              if (!isApproved) {
                return (
                  <PendingBanner
                    approvalStatus={hostData?.approvalStatus || 'PENDING'}
                    page="dashboard"
                    pendingActions={hostData?.pendingActions}
                    restrictionReasons={hostData?.restrictionReasons}
                    onActionClick={() => router.push('/host/profile')}
                  />
                )
              }

              return null
            })()}

            {/* Verification Progress */}
            {(isPending || needsAttention) && hostData && !notifications.some(n => n.type.includes('CLAIM')) && (
              <div className="mb-8">
                <VerificationProgress
                  hostId={hostData.id}
                  approvalStatus={hostData.approvalStatus}
                  documentStatuses={hostData.documentStatuses}
                  backgroundCheckStatus={hostData.backgroundCheckStatus}
                  pendingActions={hostData.pendingActions}
                  hasIncompleteCar={hasIncompleteCar}
                  incompleteCarId={incompleteCars[0]?.id || hostData.cars?.[0]?.id}
                  managesOwnCars={hostData.managesOwnCars}
                />
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
              <Link href="/host/earnings" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                      {hostData?.managesOwnCars === false ? 'Commission' : 'Earnings'}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      ${hostData?.stats.totalEarnings?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <IoWalletOutline className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 ml-2" />
                </div>
              </Link>
              
              {hostData?.managesOwnCars === false ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 truncate">My Trips</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-400">—</p>
                    </div>
                    <IoLockClosedOutline className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 flex-shrink-0 ml-2" />
                  </div>
                </div>
              ) : (
                <Link href="/host/bookings" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Total Trips</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        {hostData?.stats.totalTrips || 0}
                      </p>
                    </div>
                    <IoStatsChartOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0 ml-2" />
                  </div>
                </Link>
              )}

              <Link href="/host/reviews" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Rating</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.rating?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                  <IoStarOutline className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0 ml-2" />
                </div>
              </Link>

              <Link href="/host/cars" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Active Cars</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.activeCars || 0}
                    </p>
                  </div>
                  <IoCarOutline className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0 ml-2" />
                </div>
              </Link>

              <Link href="/host/claims" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer relative">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Claims</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.pendingClaims || 0}
                    </p>
                  </div>
                  <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0 ml-2" />
                </div>
                {(hostData?.stats.pendingClaims || 0) > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link href="/host/messages" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-300 dark:border-gray-600 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer relative">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Messages</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.unreadMessages || 0}
                    </p>
                  </div>
                  <IoChatbubbleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0 ml-2" />
                </div>
                {(hostData?.stats.unreadMessages || 0) > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Link>
            </div>

            {/* Incomplete Cars Section - PRIORITY */}
            {incompleteCars.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <IoWarningOutline className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Complete Your Listing{incompleteCars.length > 1 ? 's' : ''}
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {incompleteCars.map(car => (
                    <IncompleteCarCard 
                      key={car.id} 
                      car={car} 
                      onComplete={() => router.push(`/host/cars/${car.id}/edit`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ESG DASHBOARD CARD - Only for hosts who own their cars (not Fleet Managers) */}
            {isApproved && hostData && hostData.managesOwnCars !== false && (
              <div className="mb-8">
                <ESGDashboardCard hostId={hostData.id} />
              </div>
            )}

            {/* My Cars Section - Complete Cars with Photos & Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
              {hostData?.managesOwnCars === false ? (
                // LOCKED STATE for manage-only Fleet Managers
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <IoLockClosedOutline className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-400">My Vehicles</h2>
                  </div>
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                    <IoCarOutline className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                      You&apos;re currently a Fleet Manager
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Invite car owners to list their vehicles with you
                    </p>
                    <Link
                      href="/host/fleet/invite-owner"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <IoAddCircleOutline className="w-5 h-5" />
                      Invite Car Owners
                    </Link>
                  </div>
                </div>
              ) : (
                // NORMAL STATE for hosts who own cars
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">My Cars</h2>
                    {isApproved && completeCars.length > 0 && incompleteCars.length === 0 && (
                      <Link
                        href="/host/cars/add"
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <IoAddCircleOutline className="w-4 h-4" />
                        Add Another
                      </Link>
                    )}
                  </div>

                  {completeCars.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {completeCars.map(car => (
                        <ActiveCarCard key={car.id} car={car} isApproved={isApproved} />
                      ))}
                    </div>
                  ) : incompleteCars.length === 0 ? (
                    <div className="text-center py-12">
                      <IoCarOutline className="mx-auto w-12 h-12 text-gray-400" />
                      <p className="mt-3 text-gray-600 dark:text-gray-400">
                        {!isApproved ? 'Your cars will appear here after approval' : 'No cars listed yet'}
                      </p>
                      {isApproved && (
                        <Link href="/host/cars/add" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                          <IoAddCircleOutline className="w-5 h-5" />
                          Add Your First Car
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">Complete your listing{incompleteCars.length > 1 ? 's' : ''} above to start earning</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Fleet Manager / Partner Section - Only shows for hosts who manage others' cars */}
            {isApproved && hostData?.isHostManager && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700 p-4 sm:p-6 mb-8">
                <div className="flex flex-col items-center justify-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Fleet Management</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage vehicles for other owners</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <IoPeopleOutline className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Managed Vehicles</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {hostData?.stats.managedVehicles || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <IoWalletOutline className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Fleet Earnings</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      $0
                    </p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                  <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <IoStarOutline className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Fleet Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      N/A
                    </p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/host/fleet/invite-owner"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <IoPeopleOutline className="w-5 h-5" />
                    Invite Vehicle Owners
                  </Link>
                  <Link
                    href="/partner/dashboard"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <IoBusinessOutline className="w-5 h-5" />
                    View Full Dashboard
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                </div>

                {/* Info Note */}
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  As a Fleet Manager, you can manage vehicles for other owners and earn commission on their bookings.
                </p>
              </div>
            )}

            {/* SERVICE METRICS / FLEET MAINTENANCE STATUS - Shows for all approved hosts */}
            {/* Useful for Fleet Managers to see maintenance issues on cars they manage */}
            {isApproved && hostData && (
              <div className="mb-8">
                <ServiceMetricsDashboardCard hostId={hostData.id} />
              </div>
            )}

            {/* Quick Actions */}
            {isApproved && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Link href="/host/calendar" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 sm:p-3 rounded-full bg-purple-500 bg-opacity-10 mb-2 sm:mb-3">
                      <IoCalendarOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">Manage Calendar</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Set availability and pricing</p>
                  </div>
                </Link>
                
                <Link href="/host/earnings" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 sm:p-3 rounded-full bg-green-500 bg-opacity-10 mb-2 sm:mb-3">
                      <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">View Earnings</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Track income and payouts</p>
                  </div>
                </Link>

                <Link href="/host/messages" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 sm:p-3 rounded-full bg-blue-500 bg-opacity-10 mb-2 sm:mb-3">
                      <IoChatbubbleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">Messages</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Communicate with guests</p>
                    {(hostData?.stats.unreadMessages || 0) > 0 && (
                      <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {hostData?.stats.unreadMessages}
                      </span>
                    )}
                  </div>
                </Link>
                
                <Link href="/host/profile" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 sm:p-3 rounded-full bg-orange-500 bg-opacity-10 mb-2 sm:mb-3">
                      <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">Documents</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Update insurance and licenses</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Important Information - Different content for Fleet Managers vs Regular Hosts */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Important Information
              </h4>
              {hostData?.managesOwnCars === false ? (
                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                  As a Fleet Manager, you earn commission by managing vehicles for car owners. Commission rates are negotiated individually with each vehicle owner and shown per vehicle in your dashboard. Vehicle owners are responsible for insurance coverage on their vehicles. Your role includes handling bookings, guest communication, and vehicle coordination.{' '}
                  <Link href="/how-it-works" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                    Read fleet manager guide →
                  </Link>
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                  Protection provided through licensed third-party insurance carriers. Coverage amounts and availability subject to vehicle eligibility, location, and underwriter approval. ItWhip facilitates coverage but is not an insurance company. Protection applies only during active rental periods booked through our platform. Physical damage reimbursement is contractual allocation of risk, not insurance. Deductibles and coverage limits are subject to change.{' '}
                  <Link href="/insurance-guide" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                    Read full insurance guide →
                  </Link>
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
export default function HostDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <HostDashboardContent />
    </Suspense>
  )
}
