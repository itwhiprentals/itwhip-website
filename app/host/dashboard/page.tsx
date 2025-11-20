// app/host/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  IoShieldCheckmarkOutline
} from 'react-icons/io5'
import VerificationProgress from '../components/VerificationProgress'
import PendingBanner from '../components/PendingBanner'
import ClaimBanner from './components/ClaimBanner'
import ESGDashboardCard from '@/app/components/host/ESGDashboardCard'
import ServiceMetricsDashboardCard from '@/app/components/host/ServiceMetricsDashboardCard'

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
  }
  cars?: Array<{
    id: string
    make: string
    model: string
    year: number
    isActive: boolean
  }>
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

export default function HostDashboardPage() {
  const router = useRouter()
  const [hostData, setHostData] = useState<HostData | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
              
              {isApproved && (
                <Link 
                  href="/host/cars/add"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <IoAddCircleOutline className="w-5 h-5" />
                  Add New Car
                </Link>
              )}
            </div>

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
                  onActionClick={(stepId) => {
                    if (stepId === 'documents' || stepId === 'bank_account') {
                      router.push('/host/profile')
                    }
                  }}
                />
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
              <Link href="/host/earnings" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Earnings</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      ${hostData?.stats.totalEarnings?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <IoWalletOutline className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-60 flex-shrink-0 ml-2" />
                </div>
              </Link>
              
              <Link href="/host/bookings" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total Trips</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.totalTrips || 0}
                    </p>
                  </div>
                  <IoStatsChartOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-60 flex-shrink-0 ml-2" />
                </div>
              </Link>
              
              <Link href="/host/reviews" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Rating</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.rating?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                  <IoStarOutline className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-60 flex-shrink-0 ml-2" />
                </div>
              </Link>
              
              <Link href="/host/cars" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Active Cars</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.activeCars || 0}
                    </p>
                  </div>
                  <IoCarOutline className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 opacity-60 flex-shrink-0 ml-2" />
                </div>
              </Link>

              <Link href="/host/claims" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer relative">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Claims</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.pendingClaims || 0}
                    </p>
                  </div>
                  <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 opacity-60 flex-shrink-0 ml-2" />
                </div>
                {(hostData?.stats.pendingClaims || 0) > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link href="/host/messages" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer relative">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Messages</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {hostData?.stats.unreadMessages || 0}
                    </p>
                  </div>
                  <IoChatbubbleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-60 flex-shrink-0 ml-2" />
                </div>
                {(hostData?.stats.unreadMessages || 0) > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Link>
            </div>

            {/* ESG DASHBOARD CARD */}
            {isApproved && hostData && (
              <div className="mb-8">
                <ESGDashboardCard hostId={hostData.id} />
              </div>
            )}

            {/* SERVICE METRICS DASHBOARD CARD - NEW */}
            {isApproved && hostData && (
              <div className="mb-8">
                <ServiceMetricsDashboardCard hostId={hostData.id} />
              </div>
            )}

            {/* My Cars Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">My Cars</h2>
              
              {hostData?.cars && hostData.cars.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hostData.cars.map(car => (
                    <div key={car.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Status: <span className={car.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                          {car.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      {isApproved && (
                        <Link href={`/host/cars/${car.id}/edit`} className="mt-3 text-purple-600 dark:text-purple-400 text-sm hover:underline inline-block">
                          Manage →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
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
              )}
            </div>

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
          </div>
        </main>
      </div>
    </div>
  )
}