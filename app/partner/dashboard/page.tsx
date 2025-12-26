// app/partner/dashboard/page.tsx
// Partner Dashboard - Enterprise-grade analytics with commission tier progress
// Cloned from /app/admin/dashboard/ structure, customized for B2B partners

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoCarOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoStarOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoAddCircleOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoChevronUpOutline,
  IoGlobeOutline,
  IoPricetagOutline,
  IoRefreshOutline
} from 'react-icons/io5'

// Import dashboard components
import TierProgressCard from './components/TierProgressCard'
import RevenueChart from './components/RevenueChart'
import RecentBookings from './components/RecentBookings'
import FleetOverview from './components/FleetOverview'
import QuickActions from './components/QuickActions'

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

interface RecentBooking {
  id: string
  bookingCode: string
  guestName: string
  vehicle: {
    make: string
    model: string
    year: number
  }
  startDate: string
  endDate: string
  status: string
  totalAmount: number
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

export default function PartnerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch('/api/partner/dashboard', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setRecentBookings(data.recentBookings || [])
        setVehicleStatus(data.vehicleStatus || [])
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load dashboard data')
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

  const getRevenueChange = () => {
    if (!stats) return 0
    if (stats.lastMonthRevenue === 0) return 100
    return ((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <IoAlertCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const revenueChange = getRevenueChange()

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's your fleet overview.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet Size */}
        <Link
          href="/partner/fleet"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fleet Size</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.fleetSize || 0}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {stats?.activeVehicles || 0} active
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <IoCarOutline className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Link>

        {/* Total Bookings */}
        <Link
          href="/partner/bookings"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.totalBookings || 0}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                {stats?.activeBookings || 0} active now
              </p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <IoCalendarOutline className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Link>

        {/* Revenue */}
        <Link
          href="/partner/revenue"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Net Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats?.netRevenue || 0)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {revenueChange >= 0 ? (
                  <>
                    <IoTrendingUpOutline className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+{revenueChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <IoTrendingDownOutline className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">{revenueChange.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <IoWalletOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Link>

        {/* Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.avgRating?.toFixed(1) || '—'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats?.totalReviews || 0} reviews
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <IoStarOutline className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Utilization Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats?.utilizationRate?.toFixed(0) || 0}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(stats?.thisMonthRevenue || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed This Month</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats?.completedThisMonth || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Commission Rate</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {((stats?.currentCommissionRate || 0.25) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Commission Tier Progress - B2B Feature */}
      {stats && (
        <TierProgressCard
          currentRate={stats.currentCommissionRate}
          fleetSize={stats.fleetSize}
          tier={stats.tier}
        />
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
            <Link
              href="/partner/revenue"
              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
            >
              View Details
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          </div>
          <RevenueChart />
        </div>

        {/* Fleet Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Status</h2>
            <Link
              href="/partner/fleet"
              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
            >
              Manage Fleet
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          </div>
          <FleetOverview vehicles={vehicleStatus} />
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          <Link
            href="/partner/bookings"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
          >
            View All
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
        <RecentBookings bookings={recentBookings} />
      </div>
    </div>
  )
}
