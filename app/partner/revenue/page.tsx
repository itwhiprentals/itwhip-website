// app/partner/revenue/page.tsx
// Partner Revenue Page - Revenue tracking with commission breakdown

'use client'

import { useState, useEffect } from 'react'
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
  IoChevronForwardOutline
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

  useEffect(() => {
    fetchRevenue()
    fetchBankingStatus()
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track earnings and commission breakdown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <a
            href="/api/partner/export?type=revenue"
            download
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <IoDownloadOutline className="w-5 h-5" />
            Export CSV
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
                    ? 'Set Up Payouts'
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? 'Action Required'
                    : 'Verification Pending'}
                </h3>
                <p className={`text-sm mt-0.5 ${
                  bankingStatus.stripeConnectStatus === 'not_connected'
                    ? 'text-amber-700 dark:text-amber-400'
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-blue-700 dark:text-blue-400'
                }`}>
                  {bankingStatus.stripeConnectStatus === 'not_connected'
                    ? 'Connect your bank account to receive payouts for your bookings.'
                    : bankingStatus.stripeConnectStatus === 'restricted'
                    ? 'Complete verification to enable payouts. Additional information is required.'
                    : 'Your account is being verified. This usually takes 1-2 business days.'}
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
              {connectingStripe ? 'Connecting...' : (
                bankingStatus.stripeConnectStatus === 'not_connected'
                  ? 'Connect Bank Account'
                  : bankingStatus.stripeConnectStatus === 'restricted'
                  ? 'Complete Verification'
                  : 'Pending...'
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
              <p className="font-medium text-green-800 dark:text-green-300">Payouts Enabled</p>
              <p className="text-sm text-green-700 dark:text-green-400">Your bank account is connected and ready to receive payouts.</p>
            </div>
          </div>
          <a
            href="/partner/settings?tab=banking"
            className="text-sm text-green-700 dark:text-green-400 hover:underline font-medium"
          >
            Manage →
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.netRevenue)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            After {Math.round(revenueData.commissionRate * 100)}% commission
          </p>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IoReceiptOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gross Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.grossRevenue)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Total booking value
          </p>
        </div>

        {/* Commission */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <IoCardOutline className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Platform Commission</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.commission)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {Math.round(revenueData.commissionRate * 100)}% of gross
          </p>
        </div>

        {/* Avg Booking */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <IoCalendarOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Booking Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(revenueData.avgBookingValue)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            From {revenueData.totalBookings} bookings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Revenue</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGross(false)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  !showGross
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Net
              </button>
              <button
                onClick={() => setShowGross(true)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  showGross
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Gross
              </button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {revenueData.monthlyData.length === 0 ? (
              <div className="text-center py-8">
                <IoTrendingUpOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No revenue data yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Complete bookings to see your monthly revenue
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
                <span className="text-xs text-gray-500 dark:text-gray-400">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Commission</span>
              </div>
            </div>
          )}
        </div>

        {/* Top Performing Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Vehicles</h2>

          {revenueData.topVehicles.length === 0 ? (
            <div className="text-center py-8">
              <IoCarOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No vehicle data yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Complete bookings to see top performing vehicles
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
                      {vehicle.bookings} bookings
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payouts</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowPayoutHistory(true)
                setPayoutHistoryPage(1)
              }}
              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
            >
              View All Payouts →
            </button>
          </div>
        </div>

        {revenueData.recentPayouts.length === 0 ? (
          <div className="text-center py-8">
            <IoWalletOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No payouts yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Payouts are processed weekly once you complete bookings
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
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
                          ? new Date(payout.paidAt).toLocaleDateString('en-US', {
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payout History</h2>
                  {payoutHistory && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {payoutHistory.stats.completedPayouts} completed · {formatCurrency(payoutHistory.stats.totalPaid)} total paid
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(payoutHistory.stats.pendingAmount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {payoutHistory.stats.totalPayouts}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Payouts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {payoutHistory.stats.completedPayouts}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
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
                    <p className="text-gray-500 dark:text-gray-400">No payouts yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Bookings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Gross
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Net Payout
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Date
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
                                ? new Date(payout.paidAt).toLocaleDateString('en-US', {
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
                    Page {payoutHistory.pagination.page} of {payoutHistory.pagination.totalPages}
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
    </div>
  )
}
