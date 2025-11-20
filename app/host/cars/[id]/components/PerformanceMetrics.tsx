// app/host/cars/[id]/components/PerformanceMetrics.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCashOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoCalendarOutline,
  IoSpeedometerOutline,
  IoStarOutline,
  IoCarSportOutline,
  IoLeafOutline,
  IoShieldCheckmarkOutline,
  IoConstructOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoBarChartOutline,
  IoStatsChartOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

interface PerformanceMetricsProps {
  carId: string
}

export default function PerformanceMetrics({ carId }: PerformanceMetricsProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [carId])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/cars/${carId}/performance`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics')
      }
      
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Performance Metrics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Something went wrong'}
          </p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { vehicle, revenue, utilization, satisfaction, fleetComparison, mileage, esg } = data

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <IoStatsChartOutline className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Performance & Analytics
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>

          <button
            onClick={fetchMetrics}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
          >
            <IoRefreshOutline className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <IoCashOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            {fleetComparison.percentDifference !== 0 && (
              <span className={`flex items-center gap-1 text-xs font-medium ${
                fleetComparison.percentDifference > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {fleetComparison.percentDifference > 0 ? (
                  <IoTrendingUpOutline className="w-4 h-4" />
                ) : (
                  <IoTrendingDownOutline className="w-4 h-4" />
                )}
                {formatPercent(fleetComparison.percentDifference)}
              </span>
            )}
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(revenue.total)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {revenue.completedBookings} completed trips
          </p>
        </div>

        {/* Utilization Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <IoCalendarOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {utilization.rate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Utilization Rate</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {utilization.totalBookedDays} of {utilization.totalAvailableDays} days
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <IoStarOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {satisfaction.avgRating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Guest Rating</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {satisfaction.totalReviews} reviews
          </p>
        </div>

        {/* Average Trip Length */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <IoSpeedometerOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {utilization.avgTripLength.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg Trip (days)</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {mileage.avgMilesPerTrip.toFixed(0)} miles per trip
          </p>
        </div>
      </div>

      {/* Fleet Comparison */}
      {fleetComparison.fleetAvgRevenue > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl shadow-sm p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <IoCarSportOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Fleet Comparison
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                How this vehicle performs vs your fleet average
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue.total)}
                </p>
                <span className={`text-sm font-medium ${
                  fleetComparison.percentDifference > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercent(fleetComparison.percentDifference)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fleet avg: {formatCurrency(fleetComparison.fleetAvgRevenue)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rating</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {satisfaction.avgRating.toFixed(1)}
                </p>
                <span className={`text-sm font-medium ${
                  fleetComparison.thisCarRating >= fleetComparison.fleetAvgRating
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {fleetComparison.thisCarRating >= fleetComparison.fleetAvgRating ? '✓' : '↓'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fleet avg: {fleetComparison.fleetAvgRating.toFixed(1)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Trips</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {vehicle.totalTrips}
                </p>
                <span className={`text-sm font-medium ${
                  vehicle.totalTrips >= fleetComparison.fleetAvgTrips
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {vehicle.totalTrips >= fleetComparison.fleetAvgTrips ? '✓' : '↓'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fleet avg: {fleetComparison.fleetAvgTrips.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guest Satisfaction Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Guest Satisfaction
        </h3>
        <div className="space-y-3">
          {Object.entries(satisfaction.breakdown).map(([category, score]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {category}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {(score as number).toFixed(1)} / 5.0
                </p>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all"
                  style={{ width: `${((score as number) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESG Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          ESG Performance Score
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Composite Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(esg.currentScore / 100) * 251.2} 251.2`}
                  className={`${
                    esg.currentScore >= 80 ? 'text-green-500' :
                    esg.currentScore >= 60 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {esg.currentScore}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Overall</p>
          </div>

          {/* Environmental */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IoLeafOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Environmental</p>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {esg.environmentalScore}
            </p>
          </div>

          {/* Safety */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Safety</p>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {esg.safetyScore}
            </p>
          </div>

          {/* Maintenance */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IoConstructOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Maintenance</p>
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {esg.maintenanceScore}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Trend (Last 12 Months)
        </h3>
        <div className="space-y-2">
          {revenue.monthlyRevenue.map((month: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 w-20">
                {month.month}
              </p>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(month.revenue / Math.max(...revenue.monthlyRevenue.map((m: any) => m.revenue))) * 100}%` }}
                >
                  {month.revenue > 0 && (
                    <span className="text-xs font-medium text-white">
                      {formatCurrency(month.revenue)}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                {month.bookings} trips
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}