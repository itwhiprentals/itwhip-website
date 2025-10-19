// app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarSportOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoNavigateOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoBanOutline,
  IoWarningOutline,
  IoWalletOutline,
  IoChatbubbleOutline,
  IoAnalyticsOutline,
  IoSettingsOutline,
  IoStatsChartOutline,
  IoRefreshOutline,
  IoAddCircleOutline
} from 'react-icons/io5'
import Link from 'next/link'

// Import all dashboard components
import AlertBanners from './components/AlertBanners'
import NavigationTabs from './components/NavigationTabs'
import StatsOverview from './components/StatsOverview'
import SiemMonitoring from './components/SiemMonitoring'
import HostApplicationsWidget from './components/HostApplicationsWidget'
import ActiveTripsWidget from './components/ActiveTripsWidget'
import VerificationsWidget from './components/VerificationsWidget'
import RecentActivityPanel from './components/RecentActivityPanel'

// Import tab components
import BookingsTab from './components/tabs/BookingsTab'
import TripsTab from './components/tabs/TripsTab'
import ChargesTab from './components/tabs/ChargesTab'
import VerificationsTab from './components/tabs/VerificationsTab'
import CancellationsTab from './components/tabs/CancellationsTab'
import DisputesTab from './components/tabs/DisputesTab'
import MessagesTab from './components/tabs/MessagesTab'
import SystemTab from './components/tabs/SystemTab'
import PayoutsTab from './components/tabs/PayoutsTab'
import AnalyticsTab from './components/tabs/AnalyticsTab'

interface RentalStats {
  totalBookings: number
  activeRentals: number
  pendingVerifications: number
  totalRevenue: number
  todayRevenue: number
  totalCars: number
  activeCars: number
  totalHosts: number
  activeHosts: number
  avgRating: number
  openDisputes: number
  totalCancellations: number
  pendingPayouts: number
  completedToday: number
  cancelledToday: number
  upcomingCheckIns: number
  unreadMessages?: number
  activeTrips?: number
  overdueReturns?: number
  pendingCharges?: number
  tripsCompletedToday?: number
  missingPhotos?: number
  failedCharges?: number
  averageChargeAmount?: number
}

interface TripData {
  id: string
  bookingCode: string
  guestName: string
  car: {
    make: string
    model: string
    year: number
  }
  tripStartedAt: string
  endDate: string
  isOverdue: boolean
  hoursOverdue: number
  currentDuration: string
}

interface ChargeData {
  id: string
  bookingCode: string
  guestName: string
  totalCharges: number
  mileageCharge: number
  fuelCharge: number
  lateReturnCharge: number
  chargeStatus: string
}

interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'critical'
  database: {
    status: string
    responseTime: number
  }
  trips: {
    stuckTrips: number
    overdueReturns: number
    missingPhotos: number
  }
}

interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  createdAt: string
  resolved: boolean
}

interface Booking {
  id: string
  bookingCode: string
  guestName: string
  guestEmail: string
  guestPhone: string
  car: {
    id: string
    make: string
    model: string
    year: number
    dailyRate: number
    photos: Array<{ url: string; caption?: string }>
    host: {
      name: string
      email: string
      phone?: string
    }
  }
  status: string
  verificationStatus: string
  startDate: string
  endDate: string
  totalAmount: number
  createdAt: string
  documentsSubmittedAt?: string
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  selfiePhotoUrl?: string
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
  hasDispute?: boolean
  disputes?: Array<{
    id: string
    type: string
    status: string
    description: string
    createdAt: string
  }>
  tripStatus?: string
  tripStartedAt?: string
  tripEndedAt?: string
}

interface Dispute {
  id: string
  bookingId: string
  bookingCode: string
  type: string
  status: string
  description: string
  createdAt: string
  booking?: {
    guestName: string
    guestEmail: string
    totalAmount: number
  }
}

interface SiemMetrics {
  securityScore: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  activeThreats: number
  securityEvents24h: number
  failedLogins: number
  suspiciousBookings: number
  blockedRequests: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  lastScan: string
  criticalAlerts: number
  unreadAlerts: number
}

export default function RentalsManagementPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Data states
  const [activeTrips, setActiveTrips] = useState<TripData[]>([])
  const [pendingCharges, setPendingCharges] = useState<ChargeData[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null)
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [stats, setStats] = useState<RentalStats>({
    totalBookings: 0,
    activeRentals: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalCars: 0,
    activeCars: 0,
    totalHosts: 0,
    activeHosts: 0,
    avgRating: 0,
    openDisputes: 0,
    totalCancellations: 0,
    pendingPayouts: 0,
    completedToday: 0,
    cancelledToday: 0,
    upcomingCheckIns: 0,
    unreadMessages: 0,
    activeTrips: 0,
    overdueReturns: 0,
    pendingCharges: 0,
    tripsCompletedToday: 0,
    missingPhotos: 0,
    failedCharges: 0,
    averageChargeAmount: 0
  })
  const [siemMetrics, setSiemMetrics] = useState<SiemMetrics>({
    securityScore: 100,
    threatLevel: 'low',
    activeThreats: 0,
    securityEvents24h: 0,
    failedLogins: 0,
    suspiciousBookings: 0,
    blockedRequests: 0,
    systemHealth: 'healthy',
    lastScan: new Date().toISOString(),
    criticalAlerts: 0,
    unreadAlerts: 0
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<Booking[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: IoStatsChartOutline },
    { id: 'bookings', label: 'All Bookings', icon: IoDocumentTextOutline, badge: stats.totalBookings },
    { id: 'trips', label: 'Trips', icon: IoNavigateOutline, badge: stats.activeTrips },
    { id: 'verifications', label: 'P2P Verify', icon: IoShieldCheckmarkOutline, badge: stats.pendingVerifications },
    { id: 'charges', label: 'Charges', icon: IoCashOutline, badge: stats.pendingCharges },
    { id: 'cancellations', label: 'Cancellations', icon: IoBanOutline, badge: stats.totalCancellations },
    { id: 'disputes', label: 'Disputes', icon: IoWarningOutline, badge: stats.openDisputes },
    { id: 'cars', label: 'Cars', icon: IoCarSportOutline, badge: stats.totalCars, isLink: true, href: '/admin/rentals/cars' },
    { id: 'hosts', label: 'Hosts', icon: IoPeopleOutline, badge: stats.totalHosts, isLink: true, href: '/admin/rentals/hosts' },
    { id: 'payouts', label: 'Payouts', icon: IoWalletOutline, badge: stats.pendingPayouts },
    { id: 'messages', label: 'Messages', icon: IoChatbubbleOutline, badge: stats.unreadMessages },
    { id: 'analytics', label: 'Analytics', icon: IoAnalyticsOutline },
    { id: 'system', label: 'System', icon: IoSettingsOutline }
  ]

  // Check for hash in URL
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && navigationItems.some(item => item.id === hash)) {
      setActiveTab(hash)
    }
  }, [])

  // Handle navigation to separate pages
  useEffect(() => {
    if (activeTab === 'cars') {
      router.push('/admin/rentals/cars')
    } else if (activeTab === 'hosts') {
      router.push('/admin/rentals/hosts')
    }
  }, [activeTab, router])

  // Main data fetching
  useEffect(() => {
    fetchData()
    fetchSiemData()
    const interval = setInterval(() => {
      fetchData()
      fetchSiemData()
    }, 120000)
    return () => clearInterval(interval)
  }, [filterStatus])

  // More frequent updates for active trips
  useEffect(() => {
    if (activeTab === 'trips' || activeTab === 'overview') {
      const tripInterval = setInterval(() => {
        fetchTripData()
      }, 30000)
      return () => clearInterval(tripInterval)
    }
  }, [activeTab])

  const fetchTripData = async () => {
    try {
      const tripOverviewRes = await fetch('/api/admin/trips/overview')
      if (tripOverviewRes.ok) {
        const data = await tripOverviewRes.json()
        setStats(prev => ({
          ...prev,
          activeTrips: data.stats.activeTrips || 0,
          overdueReturns: data.stats.overdueReturns || 0,
          tripsCompletedToday: data.stats.completedToday || 0
        }))
        
        if (data.activeTrips) {
          setActiveTrips(data.activeTrips.slice(0, 5))
        }
      }
    } catch (error) {
      console.error('Failed to fetch trip data:', error)
    }
  }

  const fetchSiemData = async () => {
    try {
      const siemRes = await fetch('/api/admin/system/alerts/dashboard')
      if (siemRes.ok) {
        const data = await siemRes.json()
        
        const score = data.dashboard?.overview?.securityScore || 100
        let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
        if (score < 40) threatLevel = 'critical'
        else if (score < 60) threatLevel = 'high'
        else if (score < 80) threatLevel = 'medium'
        
        const activeThreats = data.dashboard?.security?.threats?.reduce(
          (total: number, threat: any) => total + (threat.count || 0), 
          0
        ) || 0
        
        setSiemMetrics({
          securityScore: score,
          threatLevel,
          activeThreats,
          securityEvents24h: data.dashboard?.security?.events24h || 0,
          failedLogins: data.dashboard?.security?.failedLogins || 0,
          suspiciousBookings: data.dashboard?.security?.suspiciousBookings || 0,
          blockedRequests: data.dashboard?.performance?.requestMetrics?.errors || 0,
          systemHealth: data.dashboard?.overview?.healthStatus || 'unknown',
          lastScan: data.timestamp || new Date().toISOString(),
          criticalAlerts: data.dashboard?.alerts?.critical || 0,
          unreadAlerts: data.dashboard?.alerts?.unread || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch SIEM data:', error)
    }
  }

  const fetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      // Fetch bookings
      const bookingsRes = await fetch(`/api/admin/rentals/bookings?status=${filterStatus}`)
      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        setBookings(data.bookings || [])
      }

      // Fetch pending verifications
      try {
        const verificationsRes = await fetch('/api/admin/rentals/verifications?status=pending&limit=5')
        if (verificationsRes.ok) {
          const data = await verificationsRes.json()
          setPendingVerifications(data.bookings || [])
        }
      } catch (e) {
        console.log('Verifications endpoint not available')
      }

      // Fetch trip data
      await fetchTripData()

      // Fetch pending charges
      try {
        const chargesRes = await fetch('/api/admin/trips/charges?filter=pending')
        if (chargesRes.ok) {
          const data = await chargesRes.json()
          setPendingCharges(data.charges || [])
          const totalPending = data.charges?.reduce((sum: number, c: ChargeData) => sum + c.totalCharges, 0) || 0
          const avgCharge = data.charges?.length > 0 ? totalPending / data.charges.length : 0
          
          setStats(prev => ({
            ...prev,
            pendingCharges: data.charges?.length || 0,
            averageChargeAmount: avgCharge
          }))
        }
      } catch (e) {
        console.log('Charges endpoint not available')
      }

      // Fetch system health
      try {
        const healthRes = await fetch('/api/admin/system/health')
        if (healthRes.ok) {
          const data = await healthRes.json()
          setSystemHealth(data)
          if (data.trips) {
            setStats(prev => ({
              ...prev,
              missingPhotos: data.trips.missingPhotos || 0
            }))
          }
        }
      } catch (e) {
        console.log('System health not available')
      }

      // Fetch system alerts
      try {
        const alertsRes = await fetch('/api/admin/system/alerts?filter=unresolved')
        if (alertsRes.ok) {
          const data = await alertsRes.json()
          setSystemAlerts(data.alerts || [])
        }
      } catch (e) {
        console.log('System alerts not available')
      }

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(prev => ({
          ...prev,
          totalBookings: data.totalRentalBookings || 0,
          activeRentals: data.activeRentals || 0,
          pendingVerifications: data.pendingVerifications || 0,
          totalRevenue: data.services?.rentals?.revenue || 0,
          todayRevenue: data.todayRevenue || 0,
          totalCars: data.totalCars || 0,
          activeCars: data.totalCars || 0,
          totalHosts: data.totalHosts || 0,
          activeHosts: data.totalHosts || 0,
          avgRating: data.avgRating || 4.5,
          openDisputes: data.openDisputes || 0,
          totalCancellations: data.totalCancellations || 0,
          pendingPayouts: data.pendingPayouts || 0,
          completedToday: data.completedToday || 0,
          cancelledToday: data.cancelledToday || 0,
          upcomingCheckIns: data.upcomingCheckIns || 0
        }))
      }

      // Fetch disputes
      const disputesRes = await fetch('/api/admin/rentals/disputes')
      if (disputesRes.ok) {
        const data = await disputesRes.json()
        setDisputes(data.disputes || [])
      }

      // Fetch message counts
      try {
        const messagesRes = await fetch('/api/admin/messages?status=unread&limit=1')
        if (messagesRes.ok) {
          const data = await messagesRes.json()
          const totalUnread = (data.counts?.unreadRental || 0) + 
                             (data.counts?.unreadContact || 0) + 
                             (data.counts?.newInquiries || 0)
          setStats(prev => ({ ...prev, unreadMessages: totalUnread }))
        }
      } catch (e) {
        console.log('Messages endpoint not available')
      }

      // Generate activity
      const activities = []
      const now = new Date()
      
      activeTrips.forEach(trip => {
        activities.push({
          id: `trip-${trip.id}`,
          type: 'trip',
          message: `Trip started: ${trip.bookingCode}`,
          time: getTimeAgo(new Date(trip.tripStartedAt))
        })
      })
      
      const todayBookings = bookings.filter(b => {
        const created = new Date(b.createdAt)
        return created.toDateString() === now.toDateString()
      })
      
      todayBookings.forEach(booking => {
        const time = new Date(booking.createdAt)
        const timeAgo = getTimeAgo(time)
        activities.push({
          id: booking.id,
          type: 'booking',
          message: `New booking ${booking.bookingCode}`,
          time: timeAgo
        })
      })
      
      setRecentActivity(activities.slice(0, 10))

    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load dashboard data. Please refresh to try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    return `${Math.floor(hours / 24)} days ago`
  }

  const formatTimeSince = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown'
    const date = new Date(dateStr)
    const now = new Date()
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (hours < 1) {
      const mins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${mins} mins ago`
    } else if (hours < 24) {
      return `${hours} hours ago`
    } else {
      const days = Math.floor(hours / 24)
      return `${days} days ago`
    }
  }

  const handleQuickApprove = async (bookingId: string) => {
    try {
      const response = await fetch('/api/admin/rentals/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          verificationStatus: 'approved',
          notes: 'Quick approval from dashboard',
          action: 'quick_approve'
        })
      })

      if (response.ok) {
        fetchData()
        alert('Booking approved successfully')
      }
    } catch (error) {
      console.error('Failed to approve booking:', error)
      alert('Failed to approve booking')
    }
  }

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/rentals/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        fetchData()
        alert('Booking cancelled successfully')
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading rental management...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Page Title Bar */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 mr-2">
                ←
              </Link>
              <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Rental Management
              </h1>
              {refreshing && (
                <IoRefreshOutline className="w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh"
              >
                <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/sys-2847/fleet/add"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <IoAddCircleOutline className="w-4 h-4 inline mr-1" />
                Add Car
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        navigationItems={navigationItems}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="pt-[102px] md:pt-[104px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <AlertBanners
                systemHealth={systemHealth}
                pendingVerifications={stats.pendingVerifications}
                overdueReturns={stats.overdueReturns || 0}
                openDisputes={stats.openDisputes}
                error={error}
                onNavigateToVerifications={() => setActiveTab('verifications')}
                onNavigateToTrips={() => router.push('/admin/rentals/trips/active')}
                onNavigateToDisputes={() => setActiveTab('disputes')}
              />

              <StatsOverview
                stats={stats}
                onNavigateToBookings={() => setActiveTab('bookings')}
                onNavigateToTrips={() => router.push('/admin/rentals/trips/active')}
                onNavigateToVerifications={() => setActiveTab('verifications')}
                onNavigateToCars={() => router.push('/admin/rentals/cars')}
                onNavigateToHosts={() => router.push('/admin/rentals/hosts')}
                onNavigateToCharges={() => router.push('/admin/rentals/trips/charges')}
                onNavigateToDisputes={() => setActiveTab('disputes')}
              />

              <SiemMonitoring siemMetrics={siemMetrics} />

              <HostApplicationsWidget className="mt-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link 
                  href="/admin/rentals/cars"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <IoCarSportOutline className="w-10 h-10 text-blue-500" />
                    <span className="text-gray-400">→</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {stats.totalCars} vehicles • {stats.activeCars} available
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                    Manage Fleet
                  </div>
                </Link>

                <Link 
                  href="/admin/rentals/hosts"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <IoPeopleOutline className="w-10 h-10 text-purple-500" />
                    <span className="text-gray-400">→</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Host Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {stats.totalHosts} hosts • {stats.activeHosts} active
                  </p>
                  <div className="mt-4 flex items-center text-sm text-purple-600 font-medium">
                    Manage Hosts
                  </div>
                </Link>
              </div>

              <ActiveTripsWidget
                activeTrips={activeTrips}
                totalActiveTrips={stats.activeTrips || 0}
              />

              <VerificationsWidget
                pendingVerifications={pendingVerifications}
                totalPending={stats.pendingVerifications}
                onQuickApprove={handleQuickApprove}
                formatTimeSince={formatTimeSince}
              />

              <RecentActivityPanel recentActivity={recentActivity} />
            </div>
          )}

          {/* Other Tabs */}
          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              onSearchChange={setSearchTerm}
              onFilterChange={setFilterStatus}
              onCancelBooking={handleCancelBooking}
              getStatusColor={getStatusColor}
            />
          )}

          {activeTab === 'trips' && <TripsTab stats={stats} />}

          {activeTab === 'charges' && (
            <ChargesTab
              pendingCharges={pendingCharges}
              stats={stats}
            />
          )}

          {activeTab === 'verifications' && (
            <VerificationsTab
              pendingVerifications={pendingVerifications}
              onQuickApprove={handleQuickApprove}
              formatTimeSince={formatTimeSince}
            />
          )}

          {activeTab === 'cancellations' && <CancellationsTab bookings={bookings} />}

          {activeTab === 'disputes' && <DisputesTab disputes={disputes} />}

          {activeTab === 'messages' && <MessagesTab />}

          {activeTab === 'system' && (
            <SystemTab
              systemHealth={systemHealth}
              systemAlerts={systemAlerts}
            />
          )}

          {activeTab === 'payouts' && <PayoutsTab />}

          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </main>

      <Footer />
    </div>
  )
}