// app/fleet/monitoring/components/ReturnUsersCard.tsx
// Displays returning users analytics with detailed breakdown

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IoPersonOutline,
  IoPeopleOutline,
  IoRepeatOutline,
  IoTrendingUpOutline,
  IoTimeOutline,
  IoChevronDownOutline,
  IoRefreshOutline,
  IoGlobeOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline,
  IoTabletPortraitOutline,
  IoChevronForwardOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface VisitorData {
  visitorId: string
  userId: string | null
  sessionCount: number
  pageViews: number
  uniquePages: number
  topPages: string[]
  firstVisit: string
  lastVisit: string
  countries: string[]
  devices: string[]
  browsers: string[]
  avgLoadTime: number | null
  isReturning: boolean
}

interface ReturningUsersData {
  summary: {
    totalVisitors: number
    returningVisitors: number
    newVisitors: number
    returnRate: number
    avgSessionsPerReturning: number
    avgPagesPerVisitor: number
  }
  frequencyDistribution: {
    '1 visit': number
    '2-3 visits': number
    '4-10 visits': number
    '11+ visits': number
  }
  topReturning: VisitorData[]
  visitors: VisitorData[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

interface ReturnUsersCardProps {
  className?: string
}

export default function ReturnUsersCard({ className = '' }: ReturnUsersCardProps) {
  const [data, setData] = useState<ReturningUsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [allVisitors, setAllVisitors] = useState<VisitorData[]>([])
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors'>('overview')

  const fetchData = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const response = await fetch(
        `/api/fleet/analytics/returning-users?range=${timeRange}&page=${pageNum}&limit=20`
      )

      if (!response.ok) throw new Error('Failed to fetch')

      const result = await response.json()
      setData(result.data)

      if (append) {
        setAllVisitors(prev => [...prev, ...result.data.visitors])
      } else {
        setAllVisitors(result.data.visitors)
      }

      setPage(pageNum)
      setError(null)
    } catch (err) {
      setError('Failed to load returning users data')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchData(1, false)
  }, [fetchData])

  const handleLoadMore = () => {
    if (data?.pagination.hasMore) {
      fetchData(page + 1, true)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <IoPhonePortraitOutline className="w-3 h-3" />
      case 'tablet':
        return <IoTabletPortraitOutline className="w-3 h-3" />
      default:
        return <IoDesktopOutline className="w-3 h-3" />
    }
  }

  const formatVisitorId = (id: string) => {
    return id.length > 12 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id
  }

  if (loading && !data) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-900 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <IoRepeatOutline className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Return Users</h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs bg-gray-100 dark:bg-gray-700 border-none rounded px-2 py-1 text-gray-700 dark:text-gray-300"
          >
            <option value="24h">24h</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>

          <button
            onClick={() => fetchData(1, false)}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
          >
            <IoRefreshOutline className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-purple-500 border-b-2 border-purple-500'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('visitors')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === 'visitors'
              ? 'text-purple-500 border-b-2 border-purple-500'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          All Visitors
        </button>
      </div>

      {error ? (
        <div className="p-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => fetchData(1, false)}
            className="mt-2 text-xs text-purple-500 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : activeTab === 'overview' ? (
        <div className="p-4 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoPeopleOutline className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Visitors</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {data?.summary.totalVisitors.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoRepeatOutline className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Returning</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {data?.summary.returningVisitors.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoTrendingUpOutline className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Return Rate</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {data?.summary.returnRate || 0}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoTimeOutline className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg Sessions</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {data?.summary.avgSessionsPerReturning || 0}
              </p>
            </div>
          </div>

          {/* Frequency Distribution */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visit Frequency
            </h4>
            <div className="space-y-2">
              {data?.frequencyDistribution && Object.entries(data.frequencyDistribution).map(([label, count]) => {
                const total = data.summary.totalVisitors || 1
                const percent = Math.round((count / total) * 100)
                return (
                  <div key={label} className="relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-purple-500/10 rounded"
                      style={{ width: `${percent}%` }}
                    />
                    <div className="relative flex items-center justify-between py-1.5 px-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {count} ({percent}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Returning Users */}
          {data?.topReturning && data.topReturning.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Most Frequent Visitors
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {data.topReturning.slice(0, 5).map((visitor, idx) => (
                  <button
                    key={visitor.visitorId}
                    onClick={() => setSelectedVisitor(visitor)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">{idx + 1}</span>
                      <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <IoPersonOutline className="w-3 h-3 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {visitor.userId ? `User ${visitor.userId.slice(0, 8)}...` : formatVisitorId(visitor.visitorId)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {visitor.uniquePages} pages • {visitor.countries[0] || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-500">
                        {visitor.sessionCount} visits
                      </span>
                      <IoChevronForwardOutline className="w-3 h-3 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {/* All Visitors List */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {allVisitors.map((visitor, idx) => (
              <button
                key={`${visitor.visitorId}-${idx}`}
                onClick={() => setSelectedVisitor(visitor)}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    visitor.isReturning ? 'bg-green-500/10' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <IoPersonOutline className={`w-3 h-3 ${
                      visitor.isReturning ? 'text-green-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {formatVisitorId(visitor.visitorId)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Last: {formatDate(visitor.lastVisit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {visitor.sessionCount} {visitor.sessionCount === 1 ? 'visit' : 'visits'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {visitor.pageViews} pages
                    </p>
                  </div>
                  <IoChevronForwardOutline className="w-3 h-3 text-gray-400" />
                </div>
              </button>
            ))}
          </div>

          {/* Load More */}
          {data?.pagination.hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full mt-3 py-2 text-xs text-purple-500 hover:text-purple-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <IoRefreshOutline className="w-3 h-3 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <IoChevronDownOutline className="w-3 h-3" />
                  Load More
                </>
              )}
            </button>
          )}

          {allVisitors.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <IoPersonOutline className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No visitor data available</p>
            </div>
          )}
        </div>
      )}

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedVisitor(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedVisitor.isReturning ? 'bg-green-500/10' : 'bg-purple-500/10'
                }`}>
                  <IoPersonOutline className={`w-4 h-4 ${
                    selectedVisitor.isReturning ? 'text-green-500' : 'text-purple-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Visitor Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedVisitor.isReturning ? 'Returning Visitor' : 'New Visitor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* ID Info */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400">Visitor ID</label>
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {selectedVisitor.visitorId}
                </p>
                {selectedVisitor.userId && (
                  <>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">User ID</label>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedVisitor.userId}
                    </p>
                  </>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-purple-500">{selectedVisitor.sessionCount}</p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-500">{selectedVisitor.pageViews}</p>
                  <p className="text-xs text-gray-500">Page Views</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-500">{selectedVisitor.uniquePages}</p>
                  <p className="text-xs text-gray-500">Unique Pages</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">First Visit</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedVisitor.firstVisit)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Last Visit</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedVisitor.lastVisit)}
                  </p>
                </div>
              </div>

              {/* Location */}
              {selectedVisitor.countries.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Locations</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVisitor.countries.map(country => (
                      <span
                        key={country}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs"
                      >
                        <IoGlobeOutline className="w-3 h-3" />
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Devices */}
              {selectedVisitor.devices.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Devices</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVisitor.devices.map(device => (
                      <span
                        key={device}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {getDeviceIcon(device)}
                        {device}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Browsers */}
              {selectedVisitor.browsers.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Browsers</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVisitor.browsers.map(browser => (
                      <span
                        key={browser}
                        className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {browser}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Pages */}
              {selectedVisitor.topPages.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Pages Visited</label>
                  <div className="mt-1 space-y-1">
                    {selectedVisitor.topPages.map((page, idx) => (
                      <div
                        key={`${page}-${idx}`}
                        className="flex items-center gap-2 py-1 px-2 bg-gray-50 dark:bg-gray-900 rounded text-xs"
                      >
                        <span className="text-gray-400">{idx + 1}.</span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">
                          {page === '/' ? 'Home' : page}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avg Load Time */}
              {selectedVisitor.avgLoadTime && (
                <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IoTimeOutline className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Avg Load Time</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {selectedVisitor.avgLoadTime}ms
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
