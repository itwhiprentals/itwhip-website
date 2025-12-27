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
  IoCardOutline
} from 'react-icons/io5'

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
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paidAt?: string
}

export default function PartnerRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('month')
  const [showGross, setShowGross] = useState(false)

  useEffect(() => {
    fetchRevenue()
  }, [period])

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

  // Use mock data if API returns nothing
  const revenueData = data || {
    grossRevenue: 45000,
    commission: 9000,
    netRevenue: 36000,
    commissionRate: 0.20,
    totalBookings: 45,
    avgBookingValue: 1000,
    monthlyData: [
      { month: 'Jul', gross: 6000, net: 4800, commission: 1200, bookings: 6 },
      { month: 'Aug', gross: 7500, net: 6000, commission: 1500, bookings: 8 },
      { month: 'Sep', gross: 8200, net: 6560, commission: 1640, bookings: 9 },
      { month: 'Oct', gross: 7800, net: 6240, commission: 1560, bookings: 7 },
      { month: 'Nov', gross: 8500, net: 6800, commission: 1700, bookings: 8 },
      { month: 'Dec', gross: 7000, net: 5600, commission: 1400, bookings: 7 }
    ],
    topVehicles: [
      { id: '1', name: '2023 Tesla Model 3', revenue: 12000, bookings: 15 },
      { id: '2', name: '2022 Toyota Camry', revenue: 9500, bookings: 12 },
      { id: '3', name: '2023 Honda Accord', revenue: 8000, bookings: 10 }
    ],
    recentPayouts: [
      { id: '1', period: 'December 2024', amount: 5600, status: 'completed' as const, paidAt: '2024-12-15' },
      { id: '2', period: 'November 2024', amount: 6800, status: 'completed' as const, paidAt: '2024-11-15' },
      { id: '3', period: 'October 2024', amount: 6240, status: 'completed' as const, paidAt: '2024-10-15' }
    ]
  }

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
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <IoDownloadOutline className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

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
            {revenueData.monthlyData.map((month) => {
              const value = showGross ? month.gross : month.net
              const maxValue = Math.max(...revenueData.monthlyData.map(m => showGross ? m.gross : m.net))
              const percentage = (value / maxValue) * 100

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
                  {showGross && (
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(month.commission / month.gross) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
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
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payouts</h2>
          <a
            href="/partner/settings#banking"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
          >
            Manage Banking →
          </a>
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
    </div>
  )
}
