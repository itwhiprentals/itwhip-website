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
  IoRefreshOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoKeyOutline,
  IoCashOutline,
  IoSettingsOutline,
  IoBriefcaseOutline
} from 'react-icons/io5'
import Image from 'next/image'

// Import dashboard components
import TierProgressCard from './components/TierProgressCard'
import RevenueChart from './components/RevenueChart'
import RecentBookings from './components/RecentBookings'
import FleetOverview from './components/FleetOverview'
import QuickActions from './components/QuickActions'
import InvitationsStatsCard from './components/InvitationsStatsCard'
import InvitationsList from './components/InvitationsList'
import ManagedCarsSection from './components/ManagedCarsSection'
import TrackingSecurityCard from './components/TrackingSecurityCard'
import IdentityVerificationCard from './components/IdentityVerificationCard'
import ESGScoreCard from './components/ESGScoreCard'

// New dashboard restructure components
import UserInfoCard from './components/UserInfoCard'
import ActiveBookingCard from './components/ActiveBookingCard'
import DashboardNavigation, { DashboardSection } from './components/DashboardNavigation'
import DashboardContent from './components/DashboardContent'

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

// Vehicle Owner lite view interfaces
interface ManagedVehicleOwnerView {
  id: string
  make: string
  model: string
  year: number
  photo?: string
  status: 'available' | 'booked' | 'maintenance'
  manager: {
    id: string
    name: string
    email: string
    profilePhoto?: string
    fleetName?: string
  }
  managementStatus: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'TERMINATED'
  ownerCommissionPercent: number
  managerCommissionPercent: number
  thisMonthEarnings: number
  totalEarnings: number
  recentBookings: number
}

interface VehicleOwnerStats {
  totalVehicles: number
  activeVehicles: number
  totalEarnings: number
  thisMonthEarnings: number
  pendingEarnings: number
  averageCommission: number
  recentBookings: RecentBooking[]
}

export default function PartnerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vehicle Owner lite view state
  const [isVehicleOwner, setIsVehicleOwner] = useState(false)
  const [isFleetPartner, setIsFleetPartner] = useState(true) // Default to fleet partner view
  const [isHostManager, setIsHostManager] = useState(false) // Fleet Manager from signup
  const [hostName, setHostName] = useState<string>('')
  const [vehicleOwnerStats, setVehicleOwnerStats] = useState<VehicleOwnerStats | null>(null)
  const [managedVehicles, setManagedVehicles] = useState<ManagedVehicleOwnerView[]>([])
  const [invitationsTab, setInvitationsTab] = useState<'sent' | 'received'>('sent')

  // Dashboard restructure state
  const [activeSection, setActiveSection] = useState<DashboardSection>('tracking')
  const [userInfo, setUserInfo] = useState<{
    name: string
    email: string
    companyName: string | null
    profilePhoto: string | null
    hostType: string | null
    memberSince: string | null
    lastLogin: string | null
    isActive?: boolean
    isExternalRecruit?: boolean
    recruitedVia?: string | null
    hasCars?: boolean
  } | null>(null)
  const [userInfoLoading, setUserInfoLoading] = useState(true)
  const [isExternalRecruit, setIsExternalRecruit] = useState(false)

  useEffect(() => {
    checkAccountType()
    fetchUserInfo()
  }, [])

  useEffect(() => {
    // Fleet Managers get their own view
    if (isHostManager && !isFleetPartner) {
      fetchDashboardData() // Still fetch dashboard data for stats
    } else if (isVehicleOwner && !isFleetPartner) {
      fetchVehicleOwnerData()
    } else {
      fetchDashboardData()
    }
  }, [isVehicleOwner, isFleetPartner, isHostManager])

  const checkAccountType = async () => {
    try {
      const response = await fetch('/api/host/account-type', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        // User is a Vehicle Owner if they have managed vehicles (as owner) but not a fleet partner
        setIsVehicleOwner(data.isVehicleOwner || data.ownedManagedVehicleCount > 0)
        // User is a Fleet Partner if they are a partner or have their own fleet
        setIsFleetPartner(data.isPartner)
        // User is a Host Manager (Fleet Manager from signup flow)
        setIsHostManager(data.isHostManager || false)
      }

      // Also fetch host profile for the name
      const profileResponse = await fetch('/api/host/profile', {
        credentials: 'include'
      })
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.profile) {
          setHostName(profileData.profile.displayName || profileData.profile.firstName || 'Fleet Manager')
        }
      }
    } catch (error) {
      console.error('Failed to check account type:', error)
    }
  }

  const fetchUserInfo = async () => {
    try {
      setUserInfoLoading(true)
      const response = await fetch('/api/partner/session-info', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUserInfo({
            name: data.user.name,
            email: data.user.email,
            companyName: data.user.companyName,
            profilePhoto: data.user.profilePhoto,
            hostType: data.user.hostType,
            memberSince: data.user.memberSince,
            lastLogin: data.user.lastLogin,
            isActive: data.user.isActive,
            isExternalRecruit: data.user.isExternalRecruit,
            recruitedVia: data.user.recruitedVia,
            hasCars: data.user.hasCars
          })

          // Set external recruit flag and default section for external hosts
          if (data.user.isExternalRecruit) {
            setIsExternalRecruit(true)
            // External hosts see Requests first by default
            setActiveSection('requests')
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    } finally {
      setUserInfoLoading(false)
    }
  }

  const fetchVehicleOwnerData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch('/api/partner/vehicle-owner-dashboard', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle owner data')
      }

      const data = await response.json()

      if (data.success) {
        setVehicleOwnerStats(data.stats)
        setManagedVehicles(data.vehicles || [])
        setRecentBookings(data.recentBookings || [])
      }
    } catch (err) {
      console.error('Vehicle owner data fetch error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

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
        setVehicleStatus(data.vehicles || [])
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

  // Fleet Manager View - For hosts who signed up to manage others' vehicles
  if (isHostManager && !isFleetPartner) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back{hostName ? `, ${hostName}` : ''}!
              </h1>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium rounded-full flex items-center gap-1">
                <IoBriefcaseOutline className="w-3 h-3" />
                Fleet Manager
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage vehicles and grow your fleet
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/host/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <IoSettingsOutline className="w-4 h-4" />
              <span className="hidden sm:inline">My Account</span>
            </Link>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Managed Vehicles</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.fleetSize || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Bookings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.activeBookings || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatCurrency(stats?.thisMonthRevenue || 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.avgRating?.toFixed(1) || '—'}
            </p>
          </div>
        </div>

        {/* Invitations Stats Card */}
        <InvitationsStatsCard
          onViewInvitations={(type) => setInvitationsTab(type)}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invitations List */}
          <InvitationsList
            initialTab={invitationsTab}
            limit={5}
            showViewAll={true}
          />

          {/* Quick Actions for Fleet Managers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/host/fleet/invite-owner"
                className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <IoAddCircleOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-100">Invite Car Owner</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Grow your managed fleet</p>
                </div>
              </Link>
              <Link
                href="/host/cars/add"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <IoCarOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Add Own Vehicle</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">List your own car</p>
                </div>
              </Link>
              <Link
                href="/host/dashboard"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <IoSettingsOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Account Settings</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Profile, bank, documents</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Managed Cars Section */}
        <ManagedCarsSection limit={6} showViewAll={true} />

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCalendarOutline className="w-5 h-5 text-orange-600" />
                Recent Bookings
              </h2>
              <Link
                href="/partner/bookings"
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1"
              >
                View All
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <RecentBookings bookings={recentBookings.slice(0, 5)} />
          </div>
        )}
      </div>
    )
  }

  // Vehicle Owner Lite View - Simplified dashboard for passive vehicle owners
  if (isVehicleOwner && !isFleetPartner) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Investments</h1>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium rounded-full flex items-center gap-1">
                <IoKeyOutline className="w-3 h-3" />
                Vehicle Owner
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your passive income from managed vehicles
            </p>
          </div>
          <button
            onClick={fetchVehicleOwnerData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Owner Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Vehicles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">My Vehicles</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {vehicleOwnerStats?.totalVehicles || managedVehicles.length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {vehicleOwnerStats?.activeVehicles || managedVehicles.filter(v => v.managementStatus === 'ACTIVE').length} actively managed
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <IoCarOutline className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(vehicleOwnerStats?.totalEarnings || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your owner's share
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <IoWalletOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(vehicleOwnerStats?.thisMonthEarnings || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Earned so far
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <IoCashOutline className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {formatCurrency(vehicleOwnerStats?.pendingEarnings || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  In progress bookings
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <IoTimeOutline className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Average Commission Info */}
        {vehicleOwnerStats && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                <IoPeopleOutline className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Your average owner share is <span className="font-bold">{(vehicleOwnerStats.averageCommission * 0.9).toFixed(0)}%</span> of revenue
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Platform takes 10%, remaining {vehicleOwnerStats.averageCommission}% is your share after manager's cut
                </p>
              </div>
            </div>
          </div>
        )}

        {/* My Managed Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoCarOutline className="w-5 h-5 text-indigo-600" />
              My Vehicles
            </h2>
          </div>

          {managedVehicles.length === 0 ? (
            <div className="text-center py-12">
              <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No managed vehicles yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                When you invite a fleet manager to manage your vehicles, they'll appear here.
              </p>
              <Link
                href="/host/cars"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                Add a Vehicle
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {managedVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Vehicle Image */}
                  <div className="relative h-32 bg-gray-200 dark:bg-gray-700">
                    {vehicle.photo ? (
                      <Image
                        src={vehicle.photo}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vehicle.managementStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : vehicle.managementStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {vehicle.managementStatus}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    {/* Manager Info */}
                    <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {vehicle.manager.profilePhoto ? (
                        <Image
                          src={vehicle.manager.profilePhoto}
                          alt={vehicle.manager.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                          <IoPersonOutline className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Managed by</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {vehicle.manager.fleetName || vehicle.manager.name}
                        </p>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(vehicle.thisMonthEarnings)}
                        </p>
                      </div>
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Your Share</p>
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">
                          {(vehicle.ownerCommissionPercent * 0.9).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings (Read-Only) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoCalendarOutline className="w-5 h-5 text-orange-600" />
              Recent Bookings
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              View Only
            </span>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <IoCalendarOutline className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent bookings for your vehicles</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <IoCarOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.bookingCode} • {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      booking.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                        : booking.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Need help managing your investments?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            As a vehicle owner, your manager handles day-to-day operations. If you have questions about your earnings or want to change your management agreement, contact your manager or our support team.
          </p>
          <div className="flex gap-3">
            <Link
              href="/host/earnings"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Full Earnings
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Dashboard Header - Title and Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back{userInfo?.name ? `, ${userInfo.name.split(' ')[0]}` : ''}! Here&apos;s your fleet overview.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* NEW: Dashboard Top Section - User Info, Navigation, Dynamic Content */}
      <div className="space-y-3">
        {/* Card 1 - User/Company Information */}
        <UserInfoCard user={userInfo} loading={userInfoLoading} />

        {/* Section 2 - Navigation Badges */}
        <DashboardNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isExternalRecruit={isExternalRecruit}
        />

        {/* Card 3 - Dynamic Content (based on selected navigation) */}
        <DashboardContent
          activeSection={activeSection}
          stats={stats}
          invitationsTab={invitationsTab}
          onInvitationsTabChange={setInvitationsTab}
          vehicleStatus={vehicleStatus}
          recentBookings={recentBookings}
          loading={loading}
          isExternalRecruit={isExternalRecruit}
        />

        {/* Card 4 - Active Bookings */}
        <ActiveBookingCard />
      </div>

      {/* === EXISTING DASHBOARD CONTENT BELOW === */}

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

      {/* Quick Actions & Identity Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <IdentityVerificationCard />
      </div>

      {/* Invitations Stats Card */}
      <InvitationsStatsCard
        onViewInvitations={(type) => setInvitationsTab(type)}
      />

      {/* Invitations List */}
      <InvitationsList
        initialTab={invitationsTab}
        limit={5}
        showViewAll={true}
      />

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

      {/* Commission Tier Progress - B2B Feature */}
      {stats && (
        <TierProgressCard
          currentRate={stats.currentCommissionRate}
          fleetSize={stats.fleetSize}
          tier={stats.tier}
        />
      )}
    </div>
  )
}
