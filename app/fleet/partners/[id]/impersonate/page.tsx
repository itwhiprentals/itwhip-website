// app/fleet/partners/[id]/impersonate/page.tsx
// Fleet Partner Impersonate - View partner dashboard as fleet admin

'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoStarOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoEyeOutline,
  IoArrowForwardOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface PartnerData {
  id: string
  name: string
  companyName: string
  email: string
  phone: string
  approvalStatus: string
  hostType: string
  partnerSlug: string
  partnerLogo: string | null
  commissionRate: number
}

interface DashboardStats {
  fleetSize: number
  activeVehicles: number
  totalBookings: number
  activeBookings: number
  completedThisMonth: number
  grossRevenue: number
  netRevenue: number
  thisMonthRevenue: number
  lastMonthRevenue: number
  avgRating: number
  totalReviews: number
  utilizationRate: number
  currentCommissionRate: number
  tier: {
    current: string
    vehiclesNeeded: number
    nextTier: string | null
    nextTierRate: number | null
  }
}

interface VehicleStatus {
  id: string
  make: string
  model: string
  year: number
  status: 'available' | 'booked' | 'maintenance'
  photo?: string
  dailyRate: number
  totalTrips: number
}

interface RecentBooking {
  id: string
  guestName: string
  vehicleName: string
  startDate: string
  endDate: string
  status: string
  totalAmount: number
}

export default function PartnerImpersonatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [partner, setPartner] = useState<PartnerData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([])
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [resolvedParams.id])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch(`/api/fleet/partners/${resolvedParams.id}/impersonate?key=${apiKey}`)
      const data = await response.json()

      if (data.success) {
        setPartner(data.partner)
        setStats(data.stats)
        setVehicles(data.vehicleStatus || [])
        setRecentBookings(data.recentBookings || [])
      } else {
        setError(data.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load partner dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getRevenueChange = () => {
    if (!stats) return 0
    if (stats.lastMonthRevenue === 0) return stats.thisMonthRevenue > 0 ? 100 : 0
    return ((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'booked':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'active':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'confirmed':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading partner dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <IoAlertCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Dashboard
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <div className="flex justify-center gap-3">
              <Link
                href={`/fleet/partners/${resolvedParams.id}?key=${apiKey}`}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Partner
              </Link>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const revenueChange = getRevenueChange()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Fleet Admin Banner */}
      <div className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <IoEyeOutline className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-medium">Impersonation Mode</span>
                <span className="hidden sm:inline text-purple-200 ml-2">
                  Viewing as {partner?.companyName || partner?.name}
                </span>
              </div>
            </div>
            <Link
              href={`/fleet/partners/${resolvedParams.id}?key=${apiKey}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              <IoCloseOutline className="w-4 h-4" />
              Exit Impersonation
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/fleet/partners/${resolvedParams.id}?key=${apiKey}`}
              className="p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Partner Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {partner?.companyName || partner?.name || 'Partner'}
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoRefreshOutline className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fleet Size */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Fleet Size</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.fleetSize || 0}
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                  {stats?.activeVehicles || 0} active
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <IoCarOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.totalBookings || 0}
                </p>
                <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1">
                  {stats?.activeBookings || 0} active
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <IoCalendarOutline className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Net Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats?.netRevenue || 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {revenueChange >= 0 ? (
                    <>
                      <IoTrendingUpOutline className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-green-600">+{revenueChange.toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <IoTrendingDownOutline className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                      <span className="text-xs sm:text-sm text-red-600">{revenueChange.toFixed(0)}%</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <IoWalletOutline className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.avgRating?.toFixed(1) || '—'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stats?.totalReviews || 0} reviews
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <IoStarOutline className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Utilization Rate</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.utilizationRate?.toFixed(0) || 0}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatCurrency(stats?.thisMonthRevenue || 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed This Month</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.completedThisMonth || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Commission Rate</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {((stats?.currentCommissionRate || 0.25) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Tier Progress */}
        {stats?.tier && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Commission Tier: {stats.tier.current}</h3>
                <p className="text-orange-100 mt-1">
                  Current rate: {((stats.currentCommissionRate || 0.25) * 100).toFixed(0)}%
                </p>
              </div>
              {stats.tier.nextTier && (
                <div className="text-right">
                  <p className="text-sm text-orange-100">Next tier: {stats.tier.nextTier}</p>
                  <p className="text-sm text-orange-100">
                    {stats.tier.vehiclesNeeded} more vehicles needed
                  </p>
                  <p className="text-sm font-medium">
                    Unlock {((stats.tier.nextTierRate || 0) * 100).toFixed(0)}% commission
                  </p>
                </div>
              )}
            </div>
            {stats.tier.nextTier && stats.fleetSize > 0 && (
              <div className="mt-4">
                <div className="bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{
                      width: `${Math.min(100, (stats.fleetSize / (stats.fleetSize + stats.tier.vehiclesNeeded)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fleet Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Fleet Status
            </h2>
            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No vehicles in fleet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.slice(0, 5).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                      {vehicle.photo ? (
                        <img
                          src={vehicle.photo}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoCarOutline className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(vehicle.dailyRate)}/day • {vehicle.totalTrips} trips
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                ))}
                {vehicles.length > 5 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    +{vehicles.length - 5} more vehicles
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Bookings
            </h2>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <IoCalendarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {booking.vehicleName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getBookingStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
                {recentBookings.length > 5 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    +{recentBookings.length - 5} more bookings
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Partner Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Partner Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Company Name</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {partner?.companyName || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Contact Name</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {partner?.name || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1 truncate">
                {partner?.email || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {partner?.phone || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Approval Status</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {partner?.approvalStatus || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Host Type</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {partner?.hostType || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Partner Slug</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {partner?.partnerSlug || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Commission Rate</p>
              <p className="font-medium text-orange-600 dark:text-orange-400 mt-1">
                {((partner?.commissionRate || 0.25) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
