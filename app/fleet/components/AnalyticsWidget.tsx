// app/fleet/components/AnalyticsWidget.tsx
// Compact analytics widget for the fleet dashboard

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoAnalyticsOutline,
  IoEyeOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoGlobeOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

interface AnalyticsData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    avgLoadTime: number | null
    bounceRate: number
  }
  topPages: Array<{ path: string; views: number }>
  viewsByCountry: Array<{ country: string; views: number }>
  range: string
}

// Country code to flag emoji mapping
const getCountryFlag = (country: string): string => {
  const countryFlags: Record<string, string> = {
    'US': '🇺🇸', 'United States': '🇺🇸',
    'CA': '🇨🇦', 'Canada': '🇨🇦',
    'MX': '🇲🇽', 'Mexico': '🇲🇽',
    'GB': '🇬🇧', 'United Kingdom': '🇬🇧',
    'DE': '🇩🇪', 'Germany': '🇩🇪',
    'FR': '🇫🇷', 'France': '🇫🇷',
    'Unknown': '🌍'
  }
  return countryFlags[country] || '🌍'
}

export default function AnalyticsWidget() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/fleet/analytics/stats?range=24h')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    // Refresh every 2 minutes
    const interval = setInterval(fetchAnalytics, 120000)
    return () => clearInterval(interval)
  }, [])

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoAnalyticsOutline className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Site Analytics
          </h2>
          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            24h
          </span>
        </div>
        <Link
          href="/fleet/analytics"
          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          View All
          <IoChevronForwardOutline className="w-3 h-3" />
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Total Views */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <IoEyeOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Views</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {data?.overview.totalViews?.toLocaleString() || 0}
          </p>
        </div>

        {/* Unique Visitors */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <IoPeopleOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Visitors</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {data?.overview.uniqueVisitors?.toLocaleString() || 0}
          </p>
        </div>

        {/* Bounce Rate */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <IoTrendingUpOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Bounce</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {data?.overview.bounceRate || 0}%
          </p>
        </div>

        {/* Top Country */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <IoGlobeOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Top Region</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
            {data?.viewsByCountry?.[0] ? (
              <>
                <span>{getCountryFlag(data.viewsByCountry[0].country)}</span>
                <span className="text-sm truncate">{data.viewsByCountry[0].country}</span>
              </>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </p>
        </div>
      </div>

      {/* Top Pages Mini List */}
      {data?.topPages && data.topPages.length > 0 && (
        <div className="border-t dark:border-gray-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Top Pages</p>
          <div className="space-y-1">
            {data.topPages.slice(0, 3).map((page, i) => (
              <div key={page.path} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300 truncate flex-1 mr-2">
                  <span className="text-gray-400 mr-2">{i + 1}.</span>
                  {page.path === '/' ? 'Homepage' : page.path}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                  {page.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!data?.overview.totalViews || data.overview.totalViews === 0) && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <IoAnalyticsOutline className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data yet</p>
          <p className="text-xs">Analytics will appear as visitors browse the site</p>
        </div>
      )}
    </div>
  )
}
