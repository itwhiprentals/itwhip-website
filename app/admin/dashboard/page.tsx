// app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import MessageCenter from '@/app/admin/messages/MessageCenter'
import {
  IoCarSportOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoWalletOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoStatsChartOutline,
  IoAddCircleOutline,
  IoSettingsOutline,
  IoMailOutline,
  IoNotificationsOutline,
  IoChatbubbleOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoRefreshOutline,
  IoEyeOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoKeyOutline,
  IoConstructOutline,
  IoReceiptOutline,
  IoArrowForwardOutline,
  IoChevronDownOutline,
  IoDownloadOutline,
  IoAnalyticsOutline,
  IoBanOutline,
  IoPersonOutline,
  IoCarOutline,
  IoSpeedometerOutline,
  IoNavigateOutline,
  IoCameraOutline,
  IoFlagOutline,
  IoCloudOfflineOutline
} from 'react-icons/io5'

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
  // Trip stats
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
  
  // Verification documents
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  selfiePhotoUrl?: string
  
  // Cancellation info
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
  
  // Dispute info
  hasDispute?: boolean
  disputes?: Array<{
    id: string
    type: string
    status: string
    description: string
    createdAt: string
  }>
  
  // Trip info
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
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)

  // Trip data states
  const [activeTrips, setActiveTrips] = useState<TripData[]>([])
  const [pendingCharges, setPendingCharges] = useState<ChargeData[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null)
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])

  // Stats
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

  // SIEM Metrics State
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

  // Data
  const [bookings, setBookings] = useState<Booking[]>([])
  const [verifications, setVerifications] = useState<Booking[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<Booking[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Navigation items array - used for rendering tabs
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

  // Check for hash in URL to set active tab
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && navigationItems.some(item => item.id === hash)) {
      setActiveTab(hash)
    }
  }, [])

  // Handle navigation to separate pages for Cars and Hosts
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
    }, 120000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [filterStatus, dateRange])

  // More frequent updates for active trips
  useEffect(() => {
    if (activeTab === 'trips' || activeTab === 'overview') {
      const tripInterval = setInterval(() => {
        fetchTripData()
      }, 30000) // Every 30 seconds for active trips
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
        
        // Calculate threat level based on security score
        const score = data.dashboard?.overview?.securityScore || 100
        let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
        if (score < 40) threatLevel = 'critical'
        else if (score < 60) threatLevel = 'high'
        else if (score < 80) threatLevel = 'medium'
        
        // Count active threats from threat indicators
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
        
        // Filter for pending verifications
        const pendingVerificationsData = data.bookings.filter(
          (b: Booking) => b.verificationStatus === 'submitted'
        )
        setVerifications(pendingVerificationsData)
      }

      // Fetch pending verifications for Overview tab
      try {
        const verificationsRes = await fetch('/api/admin/rentals/verifications?status=pending&limit=5')
        if (verificationsRes.ok) {
          const data = await verificationsRes.json()
          setPendingVerifications(data.bookings || [])
        }
      } catch (e) {
        console.log('Verifications endpoint not available')
      }

      // Fetch trip overview data
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

      // Fetch SIEM data
      await fetchSiemData()

      // Generate activity from real data including trips
      const activities = []
      const now = new Date()
      
      // Add trip activities
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

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
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
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        booking.bookingCode.toLowerCase().includes(search) ||
        booking.guestName.toLowerCase().includes(search) ||
        booking.guestEmail.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
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
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

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
      <div className="fixed top-[114px] md:top-[116px] left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {navigationItems.map(item => {
              // For Cars and Hosts, use Link components
              if (item.isLink && item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap relative ${
                      activeTab === item.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              }
              
              // For other tabs, use button
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap relative ${
                    activeTab === item.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-[102px] md:pt-[104px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <IoCloudOfflineOutline className="w-5 h-5 text-red-400 mr-3" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* System Health Alert */}
              {systemHealth && systemHealth.status !== 'healthy' && (
                <div className={`${systemHealth.status === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoWarningOutline className={`w-5 h-5 ${systemHealth.status === 'critical' ? 'text-red-400' : 'text-yellow-400'} mr-3`} />
                      <p className="text-sm">
                        <span className="font-semibold">System Status: {systemHealth.status}</span>
                        {systemHealth.trips.overdueReturns > 0 && ` - ${systemHealth.trips.overdueReturns} overdue returns`}
                      </p>
                    </div>
                    <Link
                      href="/admin/system/health"
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {stats.pendingVerifications > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoWarningOutline className="w-5 h-5 text-yellow-400 mr-3" />
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">{stats.pendingVerifications} bookings</span> require verification review
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('verifications')}
                      className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded text-sm font-semibold hover:bg-yellow-500"
                    >
                      Review Now
                    </button>
                  </div>
                </div>
              )}

              {/* Active Trips Alert */}
              {stats.overdueReturns > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoAlertCircleOutline className="w-5 h-5 text-red-400 mr-3" />
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">{stats.overdueReturns} vehicles</span> are overdue for return
                      </p>
                    </div>
                    <Link
                      href="/admin/rentals/trips/active"
                      className="px-3 py-1 bg-red-400 text-white rounded text-sm font-semibold hover:bg-red-500"
                    >
                      View Trips
                    </Link>
                  </div>
                </div>
              )}
              
              {stats.openDisputes > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoAlertCircleOutline className="w-5 h-5 text-red-400 mr-3" />
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">{stats.openDisputes} open disputes</span> need attention
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('disputes')}
                      className="px-3 py-1 bg-red-400 text-white rounded text-sm font-semibold hover:bg-red-500"
                    >
                      View Disputes
                    </button>
                  </div>
                </div>
              )}

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setActiveTab('bookings')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                      <p className="text-xs text-green-600 mt-1">All time</p>
                    </div>
                    <IoDocumentTextOutline className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push('/admin/rentals/trips/active')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Trips</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTrips || 0}</p>
                      <p className="text-xs text-red-600 mt-1">{stats.overdueReturns || 0} overdue</p>
                    </div>
                    <IoNavigateOutline className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setActiveTab('verifications')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verify</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerifications}</p>
                      <p className="text-xs text-red-600 mt-1">Action required</p>
                    </div>
                    <IoShieldCheckmarkOutline className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">${stats.todayRevenue} today</p>
                    </div>
                    <IoWalletOutline className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link
                  href="/admin/rentals/cars"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Cars</p>
                      <p className="text-xl font-bold text-blue-600">{stats.totalCars}</p>
                      <p className="text-xs text-gray-500">In fleet</p>
                    </div>
                    <IoCarSportOutline className="w-6 h-6 text-blue-400" />
                  </div>
                </Link>
                
                <Link
                  href="/admin/rentals/hosts"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Hosts</p>
                      <p className="text-xl font-bold text-purple-600">{stats.totalHosts}</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                    <IoPeopleOutline className="w-6 h-6 text-purple-400" />
                  </div>
                </Link>
                
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
                  onClick={() => router.push('/admin/rentals/trips/charges')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pending Charges</p>
                      <p className="text-xl font-bold text-orange-600">{stats.pendingCharges || 0}</p>
                      <p className="text-xs text-gray-500">Avg: ${stats.averageChargeAmount?.toFixed(0) || 0}</p>
                    </div>
                    <IoCashOutline className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
                  onClick={() => setActiveTab('disputes')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Open Disputes</p>
                      <p className="text-xl font-bold text-red-600">{stats.openDisputes}</p>
                      <p className="text-xs text-gray-500">Needs review</p>
                    </div>
                    <IoAlertCircleOutline className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>

              {/* SIEM Security Monitoring Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoShieldCheckmarkOutline className="w-5 h-5 mr-2 text-blue-600" />
                  Security Monitoring (SIEM)
                </h3>
                
                {/* Primary SIEM Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Security Score Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
                        <p className={`text-2xl font-bold ${
                          siemMetrics.securityScore >= 90 ? 'text-green-600' : 
                          siemMetrics.securityScore >= 70 ? 'text-yellow-600' : 
                          siemMetrics.securityScore >= 50 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {siemMetrics.securityScore}/100
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {siemMetrics.securityScore === 100 ? 'Perfect security' : 
                           siemMetrics.securityScore >= 80 ? 'Well protected' :
                           siemMetrics.securityScore >= 60 ? 'Needs attention' : 'Critical issues'}
                        </p>
                      </div>
                      <div className="relative">
                        <IoShieldCheckmarkOutline className={`w-8 h-8 ${
                          siemMetrics.securityScore >= 90 ? 'text-green-500' : 
                          siemMetrics.securityScore >= 70 ? 'text-yellow-500' : 
                          siemMetrics.securityScore >= 50 ? 'text-orange-500' : 'text-red-500'
                        }`} />
                        {siemMetrics.securityScore === 100 && (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Active Threats Card */}
                  <div 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push('/admin/system/alerts')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Threats</p>
                        <p className={`text-2xl font-bold ${
                          siemMetrics.activeThreats === 0 ? 'text-green-600' : 
                          siemMetrics.activeThreats <= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {siemMetrics.activeThreats}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {siemMetrics.activeThreats === 0 ? 'No threats detected' : 
                           siemMetrics.criticalAlerts > 0 ? `${siemMetrics.criticalAlerts} critical` : 'Requires review'}
                        </p>
                      </div>
                      <IoWarningOutline className={`w-8 h-8 ${
                        siemMetrics.activeThreats === 0 ? 'text-gray-400' : 
                        siemMetrics.criticalAlerts > 0 ? 'text-red-500 animate-pulse' : 'text-yellow-500'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Security Events Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Security Events</p>
                        <p className="text-2xl font-bold text-blue-600">{siemMetrics.securityEvents24h}</p>
                        <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                      </div>
                      <IoAnalyticsOutline className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  {/* System Health Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
                        <p className={`text-lg font-bold capitalize ${
                          siemMetrics.systemHealth === 'healthy' ? 'text-green-600' :
                          siemMetrics.systemHealth === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {siemMetrics.systemHealth}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last scan: {new Date(siemMetrics.lastScan).toLocaleTimeString()}
                        </p>
                      </div>
                      <IoSpeedometerOutline className={`w-8 h-8 ${
                        siemMetrics.systemHealth === 'healthy' ? 'text-green-500' :
                        siemMetrics.systemHealth === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                  </div>
                </div>
                
                {/* Secondary SIEM Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Failed Logins */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Failed Logins</p>
                        <p className={`text-xl font-bold ${
                          siemMetrics.failedLogins === 0 ? 'text-gray-600' : 
                          siemMetrics.failedLogins <= 10 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {siemMetrics.failedLogins}
                        </p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                      <IoPersonOutline className={`w-6 h-6 ${
                        siemMetrics.failedLogins === 0 ? 'text-gray-400' : 
                        siemMetrics.failedLogins <= 10 ? 'text-orange-400' : 'text-red-400'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Suspicious Bookings */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Suspicious Books</p>
                        <p className={`text-xl font-bold ${
                          siemMetrics.suspiciousBookings === 0 ? 'text-gray-600' : 'text-red-600'
                        }`}>
                          {siemMetrics.suspiciousBookings}
                        </p>
                        <p className="text-xs text-gray-500">Flagged</p>
                      </div>
                      <IoFlagOutline className={`w-6 h-6 ${
                        siemMetrics.suspiciousBookings === 0 ? 'text-gray-400' : 'text-red-400'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Blocked Requests */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Blocked Reqs</p>
                        <p className={`text-xl font-bold ${
                          siemMetrics.blockedRequests === 0 ? 'text-gray-600' : 'text-purple-600'
                        }`}>
                          {siemMetrics.blockedRequests}
                        </p>
                        <p className="text-xs text-gray-500">24h</p>
                      </div>
                      <IoBanOutline className={`w-6 h-6 ${
                        siemMetrics.blockedRequests === 0 ? 'text-gray-400' : 'text-purple-400'
                      }`} />
                    </div>
                  </div>
                  
                  {/* SIEM Console Link */}
                  <div 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
                    onClick={() => router.push('/admin/system/alerts/dashboard')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">SIEM Console</p>
                        <p className="text-sm font-bold text-blue-600">View All</p>
                        <p className="text-xs text-gray-500">Details →</p>
                      </div>
                      <IoSettingsOutline className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>
                
                {/* Alert Banner if Critical */}
                {siemMetrics.threatLevel === 'critical' && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IoAlertCircleOutline className="w-5 h-5 text-red-400 mr-3" />
                        <p className="text-sm text-red-800">
                          <span className="font-semibold">Critical Security Alert:</span> {siemMetrics.activeThreats} active threats detected. 
                          Security score: {siemMetrics.securityScore}/100
                        </p>
                      </div>
                      <Link
                        href="/admin/system/alerts"
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
                      >
                        Investigate
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Access Cards for Cars and Hosts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link 
                  href="/admin/rentals/cars"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <IoCarSportOutline className="w-10 h-10 text-blue-500" />
                    <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {stats.totalCars} vehicles • {stats.activeCars} available
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                    Manage Fleet <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                <Link 
                  href="/admin/rentals/hosts"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <IoPeopleOutline className="w-10 h-10 text-purple-500" />
                    <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Host Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {stats.totalHosts} hosts • {stats.activeHosts} active
                  </p>
                  <div className="mt-4 flex items-center text-sm text-purple-600 font-medium">
                    Manage Hosts <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              </div>

              {/* Active Trips Section */}
              {activeTrips.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <IoNavigateOutline className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-500" />
                        Active Trips
                      </h2>
                      <Link 
                        href="/admin/rentals/trips/active"
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View All ({stats.activeTrips})
                      </Link>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activeTrips.slice(0, 3).map(trip => (
                      <Link
                        key={trip.id}
                        href={`/admin/rentals/trips/inspections/${trip.id}`}
                        className="block p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {trip.bookingCode}
                              </h3>
                              {trip.isOverdue && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Overdue {trip.hoursOverdue}h
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {trip.car.year} {trip.car.make} {trip.car.model}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Guest: {trip.guestName} • Duration: {trip.currentDuration}
                            </p>
                          </div>
                          <IoEyeOutline className="w-5 h-5 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <IoNavigateOutline className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No active trips at the moment</p>
                </div>
              )}

              {/* Pending P2P Verifications Section */}
              {pendingVerifications.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <IoShieldCheckmarkOutline className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-yellow-500" />
                        <span className="hidden sm:inline">Pending P2P Verifications</span>
                        <span className="sm:hidden">P2P Verifications</span>
                      </h2>
                      <Link 
                        href="/admin/rentals/verifications"
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View All ({stats.pendingVerifications})
                      </Link>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingVerifications.slice(0, 3).map(verification => (
                      <Link
                        key={verification.id}
                        href={`/admin/rentals/verifications/${verification.id}`}
                        className="block p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                            {verification.car.photos?.[0] && (
                              <img 
                                src={verification.car.photos[0].url}
                                alt={`${verification.car.make} ${verification.car.model}`}
                                className="w-16 sm:w-20 h-12 sm:h-16 object-cover rounded flex-shrink-0"
                              />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {verification.bookingCode}
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending Review
                                </span>
                              </div>
                              
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {verification.car.year} {verification.car.make} {verification.car.model}
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                                <div className="flex items-center truncate">
                                  <IoPersonOutline className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{verification.guestName || verification.guestEmail}</span>
                                </div>
                                <div className="flex items-center">
                                  <IoTimeOutline className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">Submitted {formatTimeSince(verification.documentsSubmittedAt || verification.createdAt)}</span>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
                                <span className={`text-xs font-medium ${verification.licensePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                                  {verification.licensePhotoUrl ? '✓' : '✗'} License
                                </span>
                                <span className={`text-xs font-medium ${verification.insurancePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                                  {verification.insurancePhotoUrl ? '✓' : '✗'} Insurance
                                </span>
                                <span className={`text-xs font-medium ${verification.selfiePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                                  {verification.selfiePhotoUrl ? '✓' : '✗'} Selfie
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                            <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                              ${verification.totalAmount?.toFixed(2) || '0.00'}
                            </p>
                            <span className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              <IoEyeOutline className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                              Review
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                  </div>
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {recentActivity.length > 0 ? (
                      recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 ${activity.type === 'trip' ? 'bg-green-400' : 'bg-blue-400'} rounded-full mt-2`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent activity</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <Link href="/admin/rentals/trips/active" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100">
                      <IoNavigateOutline className="w-8 h-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium">Active Trips</span>
                    </Link>
                    <Link href="/admin/rentals/trips/charges" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100">
                      <IoCashOutline className="w-8 h-8 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">Process Charges</span>
                    </Link>
                    <Link href="/admin/analytics/trips" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100">
                      <IoAnalyticsOutline className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium">Analytics</span>
                    </Link>
                    <Link href="/admin/system/health" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <IoSettingsOutline className="w-8 h-8 text-gray-600 mb-2" />
                      <span className="text-sm font-medium">System Health</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                    <IoDownloadOutline className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Booking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Trip
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.bookingCode}</p>
                              <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                              {booking.hasDispute && (
                                <span className="text-xs text-red-600">Has dispute</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.guestName}</p>
                              <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                              <p className="text-xs text-gray-500">{booking.guestPhone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {booking.car.photos[0] && (
                                <img 
                                  src={booking.car.photos[0].url}
                                  alt={`${booking.car.make} ${booking.car.model}`}
                                  className="w-10 h-10 rounded object-cover mr-3"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {booking.car.year} {booking.car.make} {booking.car.model}
                                </p>
                                <p className="text-xs text-gray-500">Host: {booking.car.host.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {new Date(booking.startDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                to {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            {booking.verificationStatus === 'pending' && (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Verify Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {booking.tripStatus === 'ACTIVE' ? (
                              <Link href={`/admin/rentals/trips/inspections/${booking.id}`} className="text-green-600 hover:text-green-800 font-medium text-sm">
                                Trip Active →
                              </Link>
                            ) : booking.tripStatus === 'COMPLETED' ? (
                              <span className="text-gray-600 text-sm">Completed</span>
                            ) : (
                              <span className="text-gray-400 text-sm">Not Started</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              ${booking.totalAmount?.toFixed(2) || '0.00'}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/rentals/bookings/${booking.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <IoEyeOutline className="w-5 h-5" />
                              </Link>
                              <button className="text-gray-600 hover:text-gray-900">
                                <IoCreateOutline className="w-5 h-5" />
                              </button>
                              {booking.status !== 'cancelled' && (
                                <button 
                                  onClick={() => handleCancelBooking(booking.id, 'Admin cancellation')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <IoBanOutline className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredBookings.length === 0 && (
                    <div className="p-12 text-center">
                      <IoDocumentTextOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No bookings found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link 
                href="/admin/rentals/trips"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoStatsChartOutline className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold">{stats.activeTrips || 0}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Overview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Dashboard and statistics</p>
              </Link>

              <Link 
                href="/admin/rentals/trips/active"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoNavigateOutline className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">{stats.activeTrips || 0}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Trips</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Monitor live trips</p>
                {stats.overdueReturns > 0 && (
                  <p className="text-xs text-red-600 mt-1">{stats.overdueReturns} overdue</p>
                )}
              </Link>

              <Link 
                href="/admin/rentals/trips/charges"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoCashOutline className="w-8 h-8 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">{stats.pendingCharges || 0}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Charges</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Process additional charges</p>
              </Link>

              <Link 
                href="/admin/rentals/trips/inspections"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoCameraOutline className="w-8 h-8 text-purple-500" />
                  <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inspections</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Review trip photos</p>
              </Link>

              <Link 
                href="/admin/analytics/trips"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoAnalyticsOutline className="w-8 h-8 text-indigo-500" />
                  <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Performance metrics</p>
              </Link>

              <Link 
                href="/admin/disputes"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoFlagOutline className="w-8 h-8 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">{stats.openDisputes || 0}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Disputes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Handle damage claims</p>
              </Link>
            </div>
          )}

          {/* Charges Tab */}
          {activeTab === 'charges' && (
            <div className="space-y-6">
              {/* Charges Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Pending Charges</p>
                  <p className="text-2xl font-bold text-orange-600">${pendingCharges.reduce((sum, c) => sum + c.totalCharges, 0).toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">To Process</p>
                  <p className="text-2xl font-bold">{pendingCharges.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Average Charge</p>
                  <p className="text-2xl font-bold">${stats.averageChargeAmount?.toFixed(0) || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedCharges || 0}</p>
                </div>
              </div>

              {/* Charges Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Pending Additional Charges</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingCharges.map(charge => (
                        <tr key={charge.id}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">{charge.bookingCode}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{charge.guestName}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">${charge.mileageCharge.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">${charge.fuelCharge.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">${charge.lateReturnCharge.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold">${charge.totalCharges.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                                Charge
                              </button>
                              <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                                Waive
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pendingCharges.length === 0 && (
                    <div className="p-12 text-center">
                      <IoCashOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No pending charges</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Verifications Tab */}
          {activeTab === 'verifications' && (
            <div className="space-y-6">
              {pendingVerifications.length > 0 ? (
                <div className="grid gap-4">
                  {pendingVerifications.map(verification => (
                    <div key={verification.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start">
                            {verification.car.photos[0] && (
                              <img
                                src={verification.car.photos[0].url}
                                alt={`${verification.car.make} ${verification.car.model}`}
                                className="w-24 h-20 rounded object-cover mr-4"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {verification.bookingCode}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {verification.car.year} {verification.car.make} {verification.car.model}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Guest: {verification.guestName} ({verification.guestEmail})
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Host: {verification.car.host.name}
                              </p>
                              
                              <div className="mt-3 flex items-center space-x-4">
                                <span className={`text-xs ${verification.licensePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                                  {verification.licensePhotoUrl ? '✓ License' : '✗ License'}
                                </span>
                                <span className={`text-xs ${verification.insurancePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                                  {verification.insurancePhotoUrl ? '✓ Insurance' : '✗ Insurance'}
                                </span>
                                <span className={`text-xs ${verification.selfiePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                                  {verification.selfiePhotoUrl ? '✓ Selfie' : '✗ Selfie'}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-2">
                                Documents submitted {new Date(verification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-2">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${verification.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleQuickApprove(verification.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                            >
                              <IoCheckmarkCircle className="w-4 h-4 mr-1" />
                              Quick Approve
                            </button>
                            <Link
                              href={`/admin/rentals/verifications/${verification.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                            >
                              <IoEyeOutline className="w-4 h-4 mr-1" />
                              Review Docs
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <IoCheckmarkCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
                  <p className="text-gray-600 dark:text-gray-400">No pending verifications at the moment</p>
                </div>
              )}
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link 
                href="/admin/system/health"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoSpeedometerOutline className="w-8 h-8 text-blue-500" />
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    systemHealth?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    systemHealth?.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth?.status || 'checking'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">System Health</h3>
                <p className="text-sm text-gray-600 mt-2">Monitor system performance</p>
              </Link>

              <Link 
                href="/admin/system/health/details"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoAnalyticsOutline className="w-8 h-8 text-purple-500" />
                  <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold">Detailed Metrics</h3>
                <p className="text-sm text-gray-600 mt-2">Deep system diagnostics</p>
              </Link>

              <Link 
                href="/admin/system/alerts"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoNotificationsOutline className="w-8 h-8 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">
                    {systemAlerts.filter(a => !a.resolved).length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">System Alerts</h3>
                <p className="text-sm text-gray-600 mt-2">Active warnings & errors</p>
              </Link>

              <Link 
                href="/admin/analytics/revenue"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <IoTrendingUpOutline className="w-8 h-8 text-green-500" />
                  <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                <p className="text-sm text-gray-600 mt-2">Financial performance</p>
              </Link>

              {systemAlerts.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Recent Alerts</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {systemAlerts.slice(0, 3).map(alert => (
                      <div key={alert.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancellations Tab */}
          {activeTab === 'cancellations' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cancelled Bookings</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    All cancelled bookings with reasons
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Booking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Cancelled By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Refund
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {bookings
                        .filter(b => b.status === 'cancelled')
                        .map(booking => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium">{booking.bookingCode}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm">{booking.guestName}</p>
                              <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm">{booking.cancelledBy || 'System'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm">{booking.cancellationReason || 'No reason provided'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm">
                                {booking.cancelledAt 
                                  ? new Date(booking.cancelledAt).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-green-600">
                                ${booking.totalAmount?.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {bookings.filter(b => b.status === 'cancelled').length === 0 && (
                    <div className="p-12 text-center">
                      <IoBanOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No cancelled bookings</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Disputes Tab */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Guest Disputes</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Refund requests and payment disputes from guests
                  </p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {disputes.length > 0 ? (
                    disputes.map(dispute => (
                      <div key={dispute.id} className="p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-semibold">{dispute.bookingCode}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: <span className="font-medium">{dispute.type}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: <span className={`font-medium ${
                                dispute.status === 'OPEN' ? 'text-red-600' : 'text-gray-600'
                              }`}>{dispute.status}</span>
                            </p>
                            <p className="text-sm text-gray-600 mt-2">{dispute.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Opened {new Date(dispute.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              ${dispute.booking?.totalAmount?.toFixed(2) || '0.00'}
                            </p>
                            <Link
                              href={`/admin/rentals/disputes/${dispute.id}`}
                              className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Review
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <IoCheckmarkCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No open disputes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <MessageCenter embedded={true} />
          )}

          {/* Other tabs placeholder - Now only for payouts and analytics */}
          {['payouts', 'analytics'].includes(activeTab) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <IoConstructOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {navigationItems.find(item => item.id === activeTab)?.label} Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">This section is under construction</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}