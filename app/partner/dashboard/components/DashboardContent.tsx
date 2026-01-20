// app/partner/dashboard/components/DashboardContent.tsx
// Dynamic content container that renders based on selected navigation section

'use client'

import { DashboardSection } from './DashboardNavigation'
import TrackingSecurityCard from './TrackingSecurityCard'
import FleetOverview from './FleetOverview'
import RecentBookings from './RecentBookings'
import TierProgressCard from './TierProgressCard'
import InvitationsList from './InvitationsList'
import RevenueChart from './RevenueChart'
import QuickActions from './QuickActions'
import ESGScoreCard from './ESGScoreCard'
import OpenRequestsCard from './OpenRequestsCard'
import PendingRequestCard from './PendingRequestCard'
import Link from 'next/link'
import {
  IoCalendarNumberOutline,
  IoCarOutline,
  IoArrowForwardOutline,
  IoSpeedometerOutline,
  IoCashOutline,
  IoListOutline
} from 'react-icons/io5'

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

interface DashboardContentProps {
  activeSection: DashboardSection
  stats: DashboardStats | null
  invitationsTab: 'sent' | 'received'
  onInvitationsTabChange: (tab: 'sent' | 'received') => void
  vehicleStatus?: VehicleStatus[]
  recentBookings?: RecentBooking[]
  loading?: boolean
  isExternalRecruit?: boolean
}

// Map navigation sections to TrackingSecurityCard tabs
const TRACKING_CARD_TABS: DashboardSection[] = ['tracking', 'session', 'security', 'api', 'audit']

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function DashboardContent({
  activeSection,
  stats,
  invitationsTab,
  onInvitationsTabChange,
  vehicleStatus = [],
  recentBookings = [],
  loading = false,
  isExternalRecruit = false
}: DashboardContentProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>
          {/* Content skeleton */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-48" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // For tracking-related sections, use TrackingSecurityCard
  if (TRACKING_CARD_TABS.includes(activeSection)) {
    return (
      <TrackingSecurityCard
        externalTab={activeSection as 'tracking' | 'session' | 'security' | 'api' | 'audit'}
        hideHeader
        hideTabNavigation
      />
    )
  }

  // Requests section - Open reservation requests
  // External recruits see PendingRequestCard with their specific booking
  // Regular hosts see OpenRequestsCard with all open requests
  if (activeSection === 'requests') {
    if (isExternalRecruit) {
      return <PendingRequestCard />
    }
    return <OpenRequestsCard />
  }

  // Booking section
  if (activeSection === 'booking') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoCalendarNumberOutline className="w-5 h-5 text-orange-600" />
            Bookings Overview
          </h2>
          <Link
            href="/partner/bookings"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
          >
            Manage Bookings
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalBookings || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Bookings</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.activeBookings || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Now</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.completedThisMonth || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.utilizationRate?.toFixed(0) || 0}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Utilization</p>
          </div>
        </div>
        <QuickActions />
      </div>
    )
  }

  // Fleet section
  if (activeSection === 'fleet') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoCarOutline className="w-5 h-5 text-blue-600" />
            Fleet Management
          </h2>
          <Link
            href="/partner/fleet"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
          >
            Manage Fleet
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.fleetSize || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Vehicles</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.activeVehicles || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{(stats?.fleetSize || 0) - (stats?.activeVehicles || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
          </div>
        </div>
        <FleetOverview vehicles={vehicleStatus} />
      </div>
    )
  }

  // Invitation section
  if (activeSection === 'invitation') {
    return (
      <InvitationsList
        initialTab={invitationsTab}
        limit={10}
        showViewAll={true}
      />
    )
  }

  // Revenue section
  if (activeSection === 'revenue') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoCashOutline className="w-5 h-5 text-green-600" />
            Revenue Overview
          </h2>
          <Link
            href="/partner/revenue"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
          >
            View Details
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.grossRevenue || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gross Revenue</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats?.netRevenue || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Net Revenue</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats?.thisMonthRevenue || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats?.lastMonthRevenue || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Month</p>
          </div>
        </div>
        <RevenueChart />
      </div>
    )
  }

  // Fleet Status section
  if (activeSection === 'fleet-status') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoSpeedometerOutline className="w-5 h-5 text-indigo-600" />
            Fleet Status
          </h2>
        </div>
        <FleetOverview vehicles={vehicleStatus} />
      </div>
    )
  }

  // Recent Bookings section
  if (activeSection === 'recent-bookings') {
    // Transform recentBookings to match RecentBookings component interface
    const transformedBookings = recentBookings.map(b => ({
      id: b.id,
      guestName: b.guestName || 'Unknown Guest',
      vehicleName: b.vehicle
        ? `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model}`
        : 'Unknown Vehicle',
      startDate: b.startDate,
      endDate: b.endDate,
      status: (b.status?.toLowerCase() || 'pending') as 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled',
      totalAmount: b.totalAmount || 0
    }))
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoListOutline className="w-5 h-5 text-amber-600" />
            Recent Bookings
          </h2>
          <Link
            href="/partner/bookings"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
          >
            View All
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
        <RecentBookings bookings={transformedBookings} />
      </div>
    )
  }

  // Commission section
  if (activeSection === 'commission') {
    if (!stats) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Loading commission data...
          </p>
        </div>
      )
    }
    return (
      <TierProgressCard
        currentRate={stats.currentCommissionRate}
        fleetSize={stats.fleetSize}
        tier={stats.tier}
      />
    )
  }

  // ESG Score section
  if (activeSection === 'esg') {
    return <ESGScoreCard />
  }

  // Fallback
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        Select a section from the navigation above
      </p>
    </div>
  )
}
