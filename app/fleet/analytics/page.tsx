// app/fleet/analytics/page.tsx
// Fleet Analytics Dashboard
// Displays site-wide analytics with various metrics and charts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { IoRefreshOutline, IoAnalyticsOutline } from 'react-icons/io5'
import {
  StatsCards,
  ViewsChart,
  TopPagesTable,
  GeoBreakdown,
  DeviceBreakdown,
  LiveFeed,
  TimeRangeSelector
} from './components'

interface AnalyticsData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    avgLoadTime: number | null
    bounceRate: number
  }
  topPages: Array<{ path: string; views: number }>
  viewsByDay: Array<{ date: string; views: number }>
  previousPeriodViewsByDay?: Array<{ date: string; views: number }>
  viewsByCountry: Array<{ country: string; views: number }>
  viewsByLocation?: Array<{
    country: string
    region: string | null
    city: string | null
    location: string
    views: number
  }>
  viewsByDevice: Array<{ device: string; views: number }>
  viewsByBrowser: Array<{ browser: string; views: number }>
  recentViews: Array<{
    id: string
    path: string
    location: string
    device: string | null
    browser: string | null
    timestamp: string
    loadTime?: number | null
  }>
  drillDown?: {
    loadTime: {
      byPage: Array<{
        path: string
        avgLoadTime: number
        minLoadTime: number
        maxLoadTime: number
        p95LoadTime: number
        sampleCount: number
      }>
      byLocation: Array<{
        location: string
        country: string
        region: string | null
        city: string | null
        avgLoadTime: number
        p95LoadTime: number
        sampleCount: number
      }>
    }
    bounce: {
      byPage: Array<{
        path: string
        totalVisitors: number
        bouncedVisitors: number
        bounceRate: number
      }>
      byLocation: Array<{
        location: string
        country: string
        region: string | null
        city: string | null
        totalVisitors: number
        bouncedVisitors: number
        bounceRate: number
      }>
    }
  }
  range: string
  generatedAt: string
}

export default function FleetAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/fleet/analytics/stats?range=${timeRange}`)

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  // Initial load and on range change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Handle range change
  const handleRangeChange = (range: string) => {
    setTimeRange(range)
  }

  // Manual refresh
  const handleRefresh = () => {
    fetchData()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <IoAnalyticsOutline className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Site Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track visitors, page views, and site performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TimeRangeSelector value={timeRange} onChange={handleRangeChange} />

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <IoRefreshOutline className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-xs text-gray-400 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Cards - Row of 4 */}
      <section className="mb-6">
        <StatsCards
          totalViews={data?.overview.totalViews || 0}
          uniqueVisitors={data?.overview.uniqueVisitors || 0}
          avgLoadTime={data?.overview.avgLoadTime || null}
          bounceRate={data?.overview.bounceRate || 0}
          topPages={data?.topPages}
          viewsByCountry={data?.viewsByCountry}
          viewsByDevice={data?.viewsByDevice}
          drillDown={data?.drillDown}
          loading={loading && !data}
        />
      </section>

      {/* Views Chart - Full width */}
      <section className="mb-6">
        <ViewsChart
          data={data?.viewsByDay || []}
          previousPeriodData={data?.previousPeriodViewsByDay}
          loading={loading && !data}
        />
      </section>

      {/* Bottom Section: 4-column grid on desktop */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Live Feed */}
        <div className="sm:col-span-1">
          <LiveFeed
            views={data?.recentViews || []}
            loading={loading && !data}
          />
        </div>

        {/* Top Pages */}
        <div className="sm:col-span-1">
          <TopPagesTable
            pages={data?.topPages || []}
            loading={loading && !data}
          />
        </div>

        {/* Geographic Breakdown */}
        <div className="sm:col-span-1">
          <GeoBreakdown
            data={data?.viewsByCountry || []}
            locationData={data?.viewsByLocation}
            loading={loading && !data}
          />
        </div>

        {/* Device & Browser Breakdown */}
        <div className="sm:col-span-1">
          <DeviceBreakdown
            devices={data?.viewsByDevice || []}
            browsers={data?.viewsByBrowser || []}
            loading={loading && !data}
          />
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Analytics data is collected anonymously and refreshes automatically every minute.
          <br />
          Inspired by <a href="https://stripe.com" target="_blank" rel="noopener" className="underline hover:no-underline">Stripe</a>'s immutable ledger architecture.
        </p>
      </div>
    </div>
  )
}
