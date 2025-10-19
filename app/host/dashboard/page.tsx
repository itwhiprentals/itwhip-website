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
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoAddCircleOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoHomeOutline,
  IoStarOutline,
  IoNotificationsOutline
} from 'react-icons/io5'
import VerificationProgress from '../components/VerificationProgress'
import PendingBanner from '../components/PendingBanner'

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
}

export default function HostDashboardPage() {
  const router = useRouter()
  const [hostData, setHostData] = useState<HostData | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
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
      const response = await fetch(`/api/host/notifications?hostId=${hostId}&limit=5`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.summary?.unreadCount || 0)
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
          action: 'mark_read'
        })
      })

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
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
  const isSuspended = hostData?.approvalStatus === 'SUSPENDED'
  const isRejected = hostData?.approvalStatus === 'REJECTED'

  const navigationItems = [
    { name: 'Dashboard', href: '/host/dashboard', icon: IoHomeOutline, current: true },
    { name: 'My Cars', href: '/host/cars', icon: IoCarOutline, current: false },
    { name: 'Bookings', href: '/host/bookings', icon: IoCalendarOutline, current: false },
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

            {/* Pending/Needs Attention/Suspended/Rejected Banner */}
            {!isApproved && (
              <PendingBanner
                approvalStatus={hostData?.approvalStatus || 'PENDING'}
                page="dashboard"
                pendingActions={hostData?.pendingActions}
                restrictionReasons={hostData?.restrictionReasons}
                onActionClick={() => router.push('/host/profile')}
              />
            )}

            {/* Verification Progress for Pending/Needs Attention */}
            {(isPending || needsAttention) && hostData && (
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

            {/* Notification Center */}
            {unreadCount > 0 && (
              <div className="mb-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <IoNotificationsOutline className="w-5 h-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <Link 
                    href="/host/notifications"
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.isRead) {
                          markNotificationAsRead(notification.id)
                        }
                        if (notification.actionUrl) {
                          router.push(notification.actionUrl)
                        }
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        notification.isRead
                          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          {notification.actionRequired && (
                            <span className="inline-block mt-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
                              Action Required
                            </span>
                          )}
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid - Updated with clickable cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Earnings Card - Clickable */}
              <Link
                href="/host/earnings"
                className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Earnings</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      ${hostData?.stats.totalEarnings?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <IoWalletOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Link>
              
              {/* Total Trips Card - Clickable */}
              <Link
                href="/host/trips"
                className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Trips</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      {hostData?.stats.totalTrips || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <IoStatsChartOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Link>
              
              {/* Rating Card - Clickable */}
              <Link
                href="/host/reviews"
                className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Rating</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      {hostData?.stats.rating?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <IoStarOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </Link>
              
              {/* Active Cars Card - Clickable */}
              <Link
                href="/host/cars"
                className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Active Cars</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      {hostData?.stats.activeCars || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <IoCarOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Link>
            </div>

            {/* My Cars Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">My Cars</h2>
              
              {hostData?.cars && hostData.cars.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hostData.cars.map(car => (
                    <div 
                      key={car.id} 
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Status: <span className={car.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                          {car.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      {isApproved && (
                        <Link 
                          href={`/host/cars/${car.id}/edit`}
                          className="mt-3 text-purple-600 dark:text-purple-400 text-sm hover:underline inline-block"
                        >
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
                    <Link 
                      href="/host/cars/add"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <IoAddCircleOutline className="w-5 h-5" />
                      Add Your First Car
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions - Only show for approved hosts */}
            {isApproved && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link 
                  href="/host/calendar"
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <IoCalendarOutline className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Manage Calendar</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Set availability and pricing
                  </p>
                </Link>
                
                <Link
                  href="/host/earnings"
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <IoWalletOutline className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">View Earnings</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Track income and payouts
                  </p>
                </Link>
                
                <Link 
                  href="/host/profile"
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1"
                >
                  <IoDocumentTextOutline className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Documents</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update insurance and licenses
                  </p>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}