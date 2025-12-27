// app/partner/analytics/page.tsx
// Partner Analytics - Comprehensive fleet performance metrics

'use client'

import { useState, useEffect } from 'react'
import {
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoStarOutline,
  IoTimeOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
  IoAnalyticsOutline
} from 'react-icons/io5'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalBookings: number
    avgBookingValue: number
    avgTripDuration: number
    utilizationRate: number
    avgRating: number
    totalReviews: number
    repeatCustomerRate: number
  }
  revenueByMonth: {
    month: string
    gross: number
    net: number
    commission: number
  }[]
  bookingsByStatus: {
    status: string
    count: number
  }[]
  topVehicles: {
    id: string
    name: string
    bookings: number
    revenue: number
    rating: number
  }[]
  revenueGrowth: number
  bookingGrowth: number
}

export default function PartnerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch(`/api/partner/analytics?range=${timeRange}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to load analytics')
      }
    } catch (err: any) {
      console.error('Analytics fetch error:', err)
      setError(err.message)
      // Set mock data for now while API is being built
      setData({
        overview: {
          totalRevenue: 0,
          totalBookings: 0,
          avgBookingValue: 0,
          avgTripDuration: 0,
          utilizationRate: 0,
          avgRating: 0,
          totalReviews: 0,
          repeatCustomerRate: 0
        },
        revenueByMonth: [],
        bookingsByStatus: [],
        topVehicles: [],
        revenueGrowth: 0,
        bookingGrowth: 0
      })
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

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your fleet performance and revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>
            <IoChevronDownOutline className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalytics()}
            disabled={refreshing}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <IoRefreshOutline className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Analytics data is currently being set up. Check back soon for detailed insights!
          </p>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data?.overview.totalRevenue || 0)}
          change={data?.revenueGrowth || 0}
          icon={IoWalletOutline}
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Total Bookings"
          value={String(data?.overview.totalBookings || 0)}
          change={data?.bookingGrowth || 0}
          icon={IoCalendarOutline}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Avg. Booking Value"
          value={formatCurrency(data?.overview.avgBookingValue || 0)}
          icon={IoTrendingUpOutline}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Utilization Rate"
          value={`${data?.overview.utilizationRate || 0}%`}
          icon={IoCarOutline}
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg. Trip Duration"
          value={`${data?.overview.avgTripDuration || 0} days`}
          icon={IoTimeOutline}
          iconBg="bg-cyan-100 dark:bg-cyan-900/30"
          iconColor="text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          title="Average Rating"
          value={`${(data?.overview.avgRating || 0).toFixed(1)} / 5.0`}
          icon={IoStarOutline}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          title="Total Reviews"
          value={String(data?.overview.totalReviews || 0)}
          icon={IoStarOutline}
          iconBg="bg-pink-100 dark:bg-pink-900/30"
          iconColor="text-pink-600 dark:text-pink-400"
        />
        <StatCard
          title="Repeat Customers"
          value={`${data?.overview.repeatCustomerRate || 0}%`}
          icon={IoAnalyticsOutline}
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Over Time
          </h3>
          {data?.revenueByMonth && data.revenueByMonth.length > 0 ? (
            <div className="space-y-3">
              {data.revenueByMonth.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{month.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                        style={{
                          width: `${Math.max(5, (month.gross / Math.max(...data.revenueByMonth.map(m => m.gross), 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                    {formatCurrency(month.gross)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <IoAnalyticsOutline className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No revenue data yet</p>
                <p className="text-sm">Complete bookings to see revenue trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Booking Status Distribution
          </h3>
          {data?.bookingsByStatus && data.bookingsByStatus.length > 0 ? (
            <div className="space-y-3">
              {data.bookingsByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status.status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getStatusColor(status.status)}`}
                        style={{
                          width: `${Math.max(5, (status.count / Math.max(...data.bookingsByStatus.map(s => s.count), 1)) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                      {status.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <IoCalendarOutline className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No bookings yet</p>
                <p className="text-sm">Bookings will appear here once created</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Vehicles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Vehicles
        </h3>
        {data?.topVehicles && data.topVehicles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Bookings</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.topVehicles.map((vehicle, index) => (
                  <tr key={vehicle.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{vehicle.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{vehicle.bookings}</td>
                    <td className="py-3 px-4 text-center font-medium text-gray-900 dark:text-white">{formatCurrency(vehicle.revenue)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <IoStarOutline className="w-4 h-4" />
                        {vehicle.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <IoCarOutline className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No vehicle data yet</p>
              <p className="text-sm">Add vehicles to your fleet to see performance</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor
}: {
  title: string
  value: string
  change?: number
  icon: any
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? (
              <IoTrendingUpOutline className="w-3 h-3" />
            ) : (
              <IoTrendingDownOutline className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-500'
    case 'active':
      return 'bg-blue-500'
    case 'confirmed':
      return 'bg-cyan-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}
