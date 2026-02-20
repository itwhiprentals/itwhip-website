// app/partner/revenue/page.tsx
// Partner Revenue Page - Revenue tracking with commission breakdown

'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoCalendarOutline,
  IoDownloadOutline,
  IoRefreshOutline,
  IoCarOutline,
  IoReceiptOutline,
  IoCardOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoLayersOutline
} from 'react-icons/io5'

interface BankingStatus {
  stripeConnectStatus: 'not_connected' | 'pending' | 'connected' | 'restricted'
  stripeAccountId: string | null
  payoutsEnabled: boolean
}

interface RevenueData {
  grossRevenue: number
  commission: number
  netRevenue: number
  commissionRate: number
  totalBookings: number
  avgBookingValue: number
  // Upcoming revenue (confirmed/active bookings)
  upcomingGrossRevenue: number
  upcomingNetRevenue: number
  upcomingCommission: number
  upcomingBookingsCount: number
  // Pending revenue (awaiting confirmation)
  pendingGrossRevenue: number
  pendingBookingsCount: number
  // Cash vs Stripe breakdown
  stripeRevenue: number
  cashRevenue: number
  stripeBookingsCount: number
  cashBookingsCount: number
  monthlyData: MonthlyRevenue[]
  topVehicles: VehicleRevenue[]
  recentPayouts: Payout[]
}

interface MonthlyRevenue {
  month: string
  gross: number
  net: number
  commission: number
  bookings: number
}

interface VehicleRevenue {
  id: string
  name: string
  revenue: number
  bookings: number
}

interface Payout {
  id: string
  period: string
  periodLabel?: string
  amount: number
  grossRevenue?: number
  commission?: number
  bookingCount?: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paidAt?: string
}

interface PayoutHistoryData {
  payouts: Payout[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
  stats: {
    totalPaid: number
    pendingAmount: number
    totalPayouts: number
    completedPayouts: number
  }
}

export default function PartnerRevenuePage() {
  const t = useTranslations('PartnerRevenue')

  const locale = useLocale()
  const [data, setData] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('month')
  const [showGross, setShowGross] = useState(false)
  const [bankingStatus, setBankingStatus] = useState<BankingStatus | null>(null)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [showPayoutHistory, setShowPayoutHistory] = useState(false)
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryData | null>(null)
  const [payoutHistoryPage, setPayoutHistoryPage] = useState(1)
  const [payoutHistoryLoading, setPayoutHistoryLoading] = useState(false)
  // Revenue tier state
  const [revenuePath, setRevenuePath] = useState<'insurance' | 'tiers' | null>(null)
  const [revenueTier, setRevenueTier] = useState<'p2p' | 'commercial' | 'self_manage' | null>(null)
  const [savedRevenuePath, setSavedRevenuePath] = useState<'insurance' | 'tiers' | null>(null)
  const [savedRevenueTier, setSavedRevenueTier] = useState<'p2p' | 'commercial' | 'self_manage' | null>(null)
  const [isSavingTier, setIsSavingTier] = useState(false)
  const [tierPayoutPercentage, setTierPayoutPercentage] = useState<number | null>(null)
  const [fleetSize, setFleetSize] = useState(0)

  useEffect(() => {
    fetchRevenue()
    fetchBankingStatus()
    fetchTierInfo()
  }, [period])

  useEffect(() => {
    if (showPayoutHistory) {
      fetchPayoutHistory(payoutHistoryPage)
    }
  }, [showPayoutHistory, payoutHistoryPage])

  const fetchRevenue = async () => {
    try {
      const res = await fetch(`/api/partner/revenue?period=${period}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch revenue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBankingStatus = async () => {
    try {
      const res = await fetch('/api/partner/banking/connect')
      const result = await res.json()
      if (result.success) {
        setBankingStatus({
          stripeConnectStatus: result.hasAccount
            ? (result.payoutsEnabled ? 'connected' : (result.detailsSubmitted ? 'restricted' : 'pending'))
            : 'not_connected',
          stripeAccountId: result.accountId || null,
          payoutsEnabled: result.payoutsEnabled || false
        })
      }
    } catch (error) {
      console.error('Failed to fetch banking status:', error)
    }
  }

  const fetchPayoutHistory = async (page: number) => {
    setPayoutHistoryLoading(true)
    try {
      const res = await fetch(`/api/partner/payouts?page=${page}&limit=10`)
      const result = await res.json()
      if (result.success) {
        setPayoutHistory({
          payouts: result.payouts.map((p: any) => ({
            ...p,
            amount: p.netAmount
          })),
          pagination: result.pagination,
          stats: result.stats
        })
      }
    } catch (error) {
      console.error('Failed to fetch payout history:', error)
    } finally {
      setPayoutHistoryLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    setConnectingStripe(true)
    try {
      const res = await fetch('/api/partner/banking/connect', { method: 'POST' })
      const result = await res.json()
      if (result.success && result.onboardingUrl) {
        window.location.href = result.onboardingUrl
      }
    } catch (error) {
      console.error('Failed to connect Stripe:', error)
    } finally {
      setConnectingStripe(false)
    }
  }

  const handleViewAllPayouts = async () => {
    if (!bankingStatus || bankingStatus.stripeConnectStatus === 'not_connected' || !bankingStatus.stripeAccountId) {
      alert('Connect your bank account first')
      return
    }
    try {
      const res = await fetch('/api/partner/banking/connect?action=login-link')
      const result = await res.json()
      if (result.success && result.url) {
        window.open(result.url, '_blank')
      } else {
        alert(result.error || 'Failed to open Stripe dashboard')
      }
    } catch (error) {
      console.error('Failed to open Stripe dashboard:', error)
      alert('Failed to open Stripe dashboard')
    }
  }

  const fetchTierInfo = async () => {
    try {
      const res = await fetch('/api/partner/revenue/tier')
      const result = await res.json()
      if (result.success) {
        setRevenuePath(result.revenuePath || null)
        setRevenueTier(result.revenueTier || null)
        setSavedRevenuePath(result.revenuePath || null)
        setSavedRevenueTier(result.revenueTier || null)
        setTierPayoutPercentage(result.payoutPercentage)
        setFleetSize(result.fleetSize ?? 0)
      }
    } catch (error) {
      console.error('Failed to fetch tier info:', error)
    }
  }

  const handleSaveTier = async () => {
    if (!revenuePath) return
    if (revenuePath === 'tiers' && !revenueTier) return

    setIsSavingTier(true)
    try {
      const res = await fetch('/api/partner/revenue/tier', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenuePath,
          revenueTier: revenuePath === 'insurance' ? null : revenueTier,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setSavedRevenuePath(result.revenuePath)
        setSavedRevenueTier(result.revenueTier)
        setTierPayoutPercentage(result.payoutPercentage)
        // Refresh revenue data to reflect new commission rate
        fetchRevenue()
      } else {
        console.error('Failed to save tier:', result.error)
      }
    } catch (error) {
      console.error('Failed to save tier:', error)
    } finally {
      setIsSavingTier(false)
    }
  }

  const tierHasChanges = revenuePath !== savedRevenuePath || revenueTier !== savedRevenueTier

  const getPayoutLabel = (path: 'insurance' | 'tiers' | null, tier: 'p2p' | 'commercial' | 'self_manage' | null): string => {
    if (path === 'insurance') return '40%'
    if (path === 'tiers') {
      switch (tier) {
        case 'p2p': return '75%'
        case 'commercial': return '90%'
        case 'self_manage': return '75%'
        default: return '--'
      }
    }
    return '--'
  }

  const getTierDisplayName = (path: 'insurance' | 'tiers' | null, tier: 'p2p' | 'commercial' | 'self_manage' | null): string => {
    if (path === 'insurance') return 'Insurance Path'
    if (path === 'tiers') {
      switch (tier) {
        case 'p2p': return 'Tiers / P2P Insurance'
        case 'commercial': return 'Tiers / Commercial Insurance'
        case 'self_manage': return 'Tiers / Self-Manage'
        default: return 'Tiers'
      }
    }
    return 'Not selected'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'processing':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Use real data or show zeros - never show mock data
  const revenueData: RevenueData = data || {
    grossRevenue: 0,
    commission: 0,
    netRevenue: 0,
    commissionRate: 0.25,
    totalBookings: 0,
    avgBookingValue: 0,
    upcomingGrossRevenue: 0,
    upcomingNetRevenue: 0,
    upcomingCommission: 0,
    upcomingBookingsCount: 0,
    pendingGrossRevenue: 0,
    pendingBookingsCount: 0,
    stripeRevenue: 0,
    cashRevenue: 0,
    stripeBookingsCount: 0,
    cashBookingsCount: 0,
    monthlyData: [],
    topVehicles: [],
    recentPayouts: []
  }

  const hasRevenue = revenueData.totalBookings > 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="month">{t('thisMonth')}</option>
            <option value="quarter">{t('thisQuarter')}</option>
            <option value="year">{t('thisYear')}</option>
            <option value="all">{t('allTime')}</option>
          </select>
          <a
            href="/api/partner/export?type=revenue"
            download
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <IoDownloadOutline className="w-5 h-5" />
            {t('exportCsv')}
          </a>
        </div>
      </div>

      {/* Banking Status Alert */}
      {bankingStatus && bankingStatus.stripeConnectStatus !== 'connected' && (
        <div className={`rounded-lg border p-4 ${
          bankingStatus.stripeConnectStatus === 'not_connected'
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            : bankingStatus.stripeConnectStatus === 'restricted'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                bankingStatus.stripeConnectStatus === 'not_connected'
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : bankingStatus.stripeConnectStatus === 'restricted'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <IoCardOutline className={`w-5 h-5 ${
                  bankingStatus.stripeConnectStatus === 'not_connected'
                    ? 'text-amber-600 dark:text-amber-400'
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  bankingStatus.stripeConnectStatus === 'not_connected'
                    ? 'text-amber-800 dark:text-amber-300'
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  {bankingStatus.stripeConnectStatus === 'not_connected'
                    ? t('setUpPayouts')
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? t('actionRequired')
                    : t('verificationPending')}
                </h3>
                <p className={`text-sm mt-0.5 ${
                  bankingStatus.stripeConnectStatus === 'not_connected'
                    ? 'text-amber-700 dark:text-amber-400'
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-blue-700 dark:text-blue-400'
                }`}>
                  {bankingStatus.stripeConnectStatus === 'not_connected'
                    ? t('connectBankDescription')
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? t('completeVerificationDescription')
                    : t('verificationPendingDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={handleConnectStripe}
              disabled={connectingStripe || bankingStatus.stripeConnectStatus === 'pending'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap disabled:opacity-50 ${
                bankingStatus.stripeConnectStatus === 'not_connected'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : bankingStatus.stripeConnectStatus === 'restricted'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 cursor-not-allowed'
              }`}
            >
              {connectingStripe ? t('connecting') : (
                bankingStatus.stripeConnectStatus === 'not_connected'
                  ? t('connectBankAccount')
                  : bankingStatus.stripeConnectStatus === 'restricted'
                  ? t('completeVerification')
                  : t('pending')
              )}
            </button>
          </div>
        </div>
      )}

      {/* Connected Banking Badge */}
      {bankingStatus && bankingStatus.stripeConnectStatus === 'connected' && (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <IoCardOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">{t('payoutsEnabled')}</p>
              <p className="text-sm text-green-700 dark:text-green-400">{t('payoutsEnabledDescription')}</p>
            </div>
          </div>
          <a
            href="/partner/settings?tab=banking"
            className="text-sm text-green-700 dark:text-green-400 hover:underline font-medium"
          >
            {t('manage')} →
          </a>
        </div>
      )}

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <IoWalletOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <IoTrendingUpOutline className="w-4 h-4" />
              +12%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('netRevenue')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.netRevenue)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t('afterCommission', { rate: Math.round(revenueData.commissionRate * 100) })}
          </p>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IoReceiptOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('grossRevenue')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.grossRevenue)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t('totalBookingValue')}
          </p>
        </div>

        {/* Commission */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <IoCardOutline className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('platformCommission')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.commission)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t('ofGross', { rate: Math.round(revenueData.commissionRate * 100) })}
          </p>
        </div>

        {/* Avg Booking */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <IoCalendarOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('avgBookingValue')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.avgBookingValue)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t('fromBookings', { count: revenueData.totalBookings })}
          </p>
        </div>
      </div>

      {/* Instant Payout Button (placeholder) */}
      <div className="flex justify-end">
        <button
          onClick={() => alert('Complete more rides to unlock instant payouts')}
          className="inline-flex items-center gap-2 opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <IoFlashOutline className="w-4 h-4" />
          Instant Payout
        </button>
      </div>

      {/* Pipeline Overview - Upcoming & Pending + Payment Methods */}
      {(revenueData.upcomingBookingsCount > 0 || revenueData.pendingBookingsCount > 0 || revenueData.stripeBookingsCount > 0 || revenueData.cashBookingsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Confirmed/Active Trips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <IoCarOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                {t('activeBadge')}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('inProgress')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(revenueData.upcomingNetRevenue || 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('activeTrips', { count: revenueData.upcomingBookingsCount })}
            </p>
          </div>

          {/* Pending Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <IoReceiptOutline className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">
                {t('pendingBadge')}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('awaitingApproval')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(revenueData.pendingGrossRevenue || 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('requestsPending', { count: revenueData.pendingBookingsCount })}
            </p>
          </div>

          {/* Stripe Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <IoCardOutline className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
                {t('onlineBadge')}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('stripePayments')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(revenueData.stripeRevenue || 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('bookingsCount', { count: revenueData.stripeBookingsCount || 0 })}
            </p>
          </div>

          {/* Cash Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <IoWalletOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
                {t('cashBadge')}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('manualPayments')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(revenueData.cashRevenue || 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('bookingsCount', { count: revenueData.cashBookingsCount || 0 })}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('monthlyRevenue')}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGross(false)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  !showGross
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('net')}
              </button>
              <button
                onClick={() => setShowGross(true)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  showGross
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('gross')}
              </button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {revenueData.monthlyData.length === 0 ? (
              <div className="text-center py-8">
                <IoTrendingUpOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('noRevenueData')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('completeBookingsMonthly')}
                </p>
              </div>
            ) : (
              revenueData.monthlyData.map((month) => {
                const value = showGross ? month.gross : month.net
                const maxValue = Math.max(...revenueData.monthlyData.map(m => showGross ? m.gross : m.net))
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

                return (
                  <div key={month.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{month.month}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(value)}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${showGross ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {showGross && month.gross > 0 && (
                      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${(month.commission / month.gross) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {showGross && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('grossRevenueLabel')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('commissionLabel')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top Performing Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('topVehicles')}</h2>

          {revenueData.topVehicles.length === 0 ? (
            <div className="text-center py-8">
              <IoCarOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{t('noVehicleData')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {t('completeBookingsVehicles')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {revenueData.topVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {vehicle.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('vehicleBookings', { count: vehicle.bookings })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(vehicle.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentPayouts')}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleViewAllPayouts}
              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
            >
              {t('viewAllPayouts')} →
            </button>
          </div>
        </div>

        {revenueData.recentPayouts.length === 0 ? (
          <div className="text-center py-8">
            <IoWalletOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('noPayoutsYet')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {t('payoutsProcessedWeekly')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('periodHeader')}
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('amountHeader')}
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('statusHeader')}
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('dateHeader')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {revenueData.recentPayouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {payout.period}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(payout.amount)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPayoutStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {payout.paidAt
                          ? new Date(payout.paidAt).toLocaleDateString(locale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : '—'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout History Modal */}
      {showPayoutHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPayoutHistory(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('payoutHistory')}</h2>
                  {payoutHistory && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('completedTotalPaid', { completed: payoutHistory.stats.completedPayouts, totalPaid: formatCurrency(payoutHistory.stats.totalPaid) })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowPayoutHistory(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <IoCloseOutline className="w-6 h-6" />
                </button>
              </div>

              {/* Summary Stats */}
              {payoutHistory && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(payoutHistory.stats.totalPaid)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalPaid')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(payoutHistory.stats.pendingAmount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('pendingAmount')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {payoutHistory.stats.totalPayouts}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalPayouts')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {payoutHistory.stats.completedPayouts}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('completed')}</p>
                  </div>
                </div>
              )}

              {/* Payout List */}
              <div className="overflow-y-auto max-h-[50vh]">
                {payoutHistoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
                  </div>
                ) : !payoutHistory || payoutHistory.payouts.length === 0 ? (
                  <div className="text-center py-12">
                    <IoWalletOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">{t('noPayoutsYet')}</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t('periodHeader')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t('bookingsHeader')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t('grossHeader')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t('commissionHeader')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t('netPayoutHeader')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t('statusHeader')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t('dateHeader')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {payoutHistory.payouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {payout.periodLabel || payout.period}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {payout.bookingCount || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {payout.grossRevenue ? formatCurrency(payout.grossRevenue) : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              {payout.commission ? `-${formatCurrency(payout.commission)}` : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(payout.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPayoutStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {payout.paidAt
                                ? new Date(payout.paidAt).toLocaleDateString(locale, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : '-'
                              }
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {payoutHistory && payoutHistory.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('pageOf', { page: payoutHistory.pagination.page, totalPages: payoutHistory.pagination.totalPages })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPayoutHistoryPage(p => Math.max(1, p - 1))}
                      disabled={payoutHistoryPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoChevronBackOutline className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPayoutHistoryPage(p => Math.min(payoutHistory.pagination.totalPages, p + 1))}
                      disabled={payoutHistoryPage >= payoutHistory.pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoChevronForwardOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== BOTTOM SECTION: Revenue Path + Commission Tier ====== */}

      {/* Your Revenue Path */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-1">
          <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Revenue Path</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          As a mobility company we offer two revenue paths. Select your insurance coverage to determine your payout rate.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Insurance Path Card */}
          <button
            type="button"
            onClick={() => { setRevenuePath('insurance'); setRevenueTier(null) }}
            className={`text-left p-4 rounded-lg border-2 transition-colors ${
              revenuePath === 'insurance'
                ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                revenuePath === 'insurance' ? 'bg-gray-900 dark:bg-white' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <IoShieldCheckmarkOutline className={`w-5 h-5 ${
                  revenuePath === 'insurance' ? 'text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Insurance Path</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Use our coverage</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">We handle claims and coverage. You earn 40% of each booking.</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white">You earn 40%</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                revenuePath === 'insurance' ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-500'
              }`}>
                {revenuePath === 'insurance' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white" />}
              </div>
            </div>
          </button>

          {/* Tiers Path Card */}
          <button
            type="button"
            onClick={() => { setRevenuePath('tiers'); if (!revenueTier) setRevenueTier('p2p') }}
            className={`text-left p-4 rounded-lg border-2 transition-colors ${
              revenuePath === 'tiers'
                ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                revenuePath === 'tiers' ? 'bg-gray-900 dark:bg-white' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <IoLayersOutline className={`w-5 h-5 ${
                  revenuePath === 'tiers' ? 'text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Bring Your Insurance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Higher payouts</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Bring your own coverage for higher payout rates based on insurance type.</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Up to 90%</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                revenuePath === 'tiers' ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-500'
              }`}>
                {revenuePath === 'tiers' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white" />}
              </div>
            </div>
          </button>
        </div>

        {/* Insurance type dropdown (shown when Bring Your Insurance is selected) */}
        {revenuePath === 'tiers' && (
          <div className="space-y-2 mb-4 pl-1">
            {[
              { value: 'p2p' as const, label: 'P2P Insurance', payout: '75% payout' },
              { value: 'commercial' as const, label: 'Commercial Insurance', payout: '90% payout' },
              { value: 'self_manage' as const, label: 'Self-Manage', payout: '75% payout' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRevenueTier(option.value)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                  revenueTier === option.value
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    revenueTier === option.value ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {revenueTier === option.value && <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{option.payout}</span>
              </button>
            ))}
          </div>
        )}

        {/* Save + Current Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            {savedRevenuePath ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current: <span className="font-medium text-gray-900 dark:text-white">{getTierDisplayName(savedRevenuePath, savedRevenueTier)}</span>
                {' '}&mdash;{' '}
                <span className="font-medium text-gray-900 dark:text-white">{getPayoutLabel(savedRevenuePath, savedRevenueTier)} payout</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No revenue path selected yet</p>
            )}
          </div>
          <button
            onClick={handleSaveTier}
            disabled={isSavingTier || !revenuePath || !tierHasChanges || (revenuePath === 'tiers' && !revenueTier)}
            className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingTier ? 'Saving...' : 'Save Selection'}
          </button>
        </div>
      </div>

      {/* Commission Tier */}
      {(() => {
        const TIERS = [
          { name: 'Standard', minCars: 0, commission: 25 },
          { name: 'Gold', minCars: 10, commission: 20 },
          { name: 'Platinum', minCars: 50, commission: 15 },
          { name: 'Diamond', minCars: 100, commission: 10 },
        ]
        const currentTierIdx = TIERS.reduce((idx, tier, i) => fleetSize >= tier.minCars ? i : idx, 0)
        const currentTier = TIERS[currentTierIdx]
        const nextTier = TIERS[currentTierIdx + 1]
        const progressToNext = nextTier
          ? Math.min(100, Math.round(((fleetSize - currentTier.minCars) / (nextTier.minCars - currentTier.minCars)) * 100))
          : 100
        const carsNeeded = nextTier ? nextTier.minCars - fleetSize : 0

        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-1">
              <IoLayersOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commission Tier</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Grow your fleet to unlock higher earnings
            </p>

            {/* Current Tier Display */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{currentTier.name} Partner</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{currentTier.commission}%</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">commission</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You keep {100 - currentTier.commission}%</p>
              </div>
              <div className="sm:border-l sm:border-gray-200 dark:sm:border-gray-700 sm:pl-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fleet Size</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{fleetSize}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">vehicles</span>
                </div>
              </div>
            </div>

            {/* Progress to Next Tier */}
            {nextTier && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Progress to {nextTier.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{carsNeeded} more vehicles needed</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gray-900 dark:bg-white h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <span>{currentTier.minCars} vehicles</span>
                  <span>{nextTier.minCars} vehicles</span>
                </div>
              </div>
            )}

            {/* All Tiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIERS.map((tier, i) => (
                <div
                  key={tier.name}
                  className={`p-3 rounded-lg border text-center ${
                    i === currentTierIdx
                      ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${
                    i === currentTierIdx ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {i === currentTierIdx ? 'Current' : i === currentTierIdx + 1 ? 'Next' : ''}
                  </p>
                  <p className={`font-semibold text-sm ${
                    i === currentTierIdx ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}>{tier.name}</p>
                  <p className={`text-lg font-bold ${
                    i === currentTierIdx ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>{tier.commission}%</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{tier.minCars}+ cars</p>
                </div>
              ))}
            </div>

            {/* Diamond unlock message */}
            {currentTierIdx < TIERS.length - 1 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Unlock Diamond Benefits</span>{' '}
                  &mdash; Reach 100+ vehicles to unlock the lowest commission rate (10%) and priority support.
                </p>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
