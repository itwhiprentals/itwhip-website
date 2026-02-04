// app/fleet/analytics/components/LiveFeed.tsx
// Real-time feed of recent page views with pagination, filters, and search

'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  IoLocationOutline,
  IoChevronForwardOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline,
  IoTabletPortraitOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoRefreshOutline
} from 'react-icons/io5'
import ViewDetailModal, { ViewDetail } from './ViewDetailModal'

interface RecentView {
  id: string
  path: string
  location: string
  device: string | null
  browser: string | null
  timestamp: string
}

interface LiveFeedProps {
  views: RecentView[]
  loading?: boolean
  timeRange?: string
}

interface FilterOption {
  value: string | null
  count: number
}

// Format relative time
function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format path for display
function formatPath(path: string): string {
  if (path === '/') return 'Home'
  const clean = path.replace(/^\//, '')
  return clean.length > 30 ? clean.slice(0, 30) + '...' : clean
}

// Get device icon
function getDeviceIcon(device: string | null) {
  switch (device?.toLowerCase()) {
    case 'mobile':
      return <IoPhonePortraitOutline className="w-3.5 h-3.5" />
    case 'tablet':
      return <IoTabletPortraitOutline className="w-3.5 h-3.5" />
    default:
      return <IoDesktopOutline className="w-3.5 h-3.5" />
  }
}

export default function LiveFeed({ views: initialViews, loading = false, timeRange = '7d' }: LiveFeedProps) {
  const [selectedView, setSelectedView] = useState<ViewDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null)

  // Pagination and filtering state
  const [allViews, setAllViews] = useState<RecentView[]>(initialViews)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [deviceFilter, setDeviceFilter] = useState<string | null>(null)
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const [availableDevices, setAvailableDevices] = useState<FilterOption[]>([])
  const [availableCountries, setAvailableCountries] = useState<FilterOption[]>([])

  // Update views when initialViews changes (from parent)
  useEffect(() => {
    if (!deviceFilter && !countryFilter && !search) {
      setAllViews(initialViews)
      setPage(1)
      setHasMore(initialViews.length >= 20)
    }
  }, [initialViews, deviceFilter, countryFilter, search])

  // Fetch paginated views
  const fetchViews = useCallback(async (pageNum: number, append = false) => {
    if (loadingMore) return

    setLoadingMore(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        range: timeRange
      })

      if (deviceFilter) params.append('device', deviceFilter)
      if (countryFilter) params.append('country', countryFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/fleet/analytics/recent?${params}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (append) {
            // Deduplicate views by ID to prevent React key errors
            setAllViews(prev => {
              const existingIds = new Set(prev.map(v => v.id))
              const newViews = result.data.views.filter((v: RecentView) => !existingIds.has(v.id))
              return [...prev, ...newViews]
            })
          } else {
            setAllViews(result.data.views)
          }
          setHasMore(result.data.pagination.hasMore)
          setTotalCount(result.data.pagination.totalCount)
          setPage(pageNum)

          // Update filter options
          if (result.data.filters) {
            setAvailableDevices(result.data.filters.devices || [])
            setAvailableCountries(result.data.filters.countries || [])
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch views:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [timeRange, deviceFilter, countryFilter, search, loadingMore])

  // Load more views
  const handleLoadMore = useCallback(() => {
    fetchViews(page + 1, true)
  }, [fetchViews, page])

  // Apply filters
  const applyFilters = useCallback(() => {
    setPage(1)
    fetchViews(1, false)
  }, [fetchViews])

  // Clear filters
  const clearFilters = useCallback(() => {
    setDeviceFilter(null)
    setCountryFilter(null)
    setSearch('')
    setPage(1)
    setAllViews(initialViews)
    setHasMore(initialViews.length >= 20)
  }, [initialViews])

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }, [applyFilters])

  // Fetch full view details when clicked
  const handleViewClick = useCallback(async (viewId: string) => {
    setLoadingDetail(viewId)
    try {
      const response = await fetch(`/api/fleet/analytics/view/${viewId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSelectedView(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch view details:', error)
    } finally {
      setLoadingDetail(null)
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedView(null)
  }, [])

  const hasActiveFilters = !!deviceFilter || !!countryFilter || !!search

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Activity
            {totalCount > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-500">
                ({totalCount.toLocaleString()} total)
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Filters"
            >
              <IoFilterOutline className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by path..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Filter Dropdowns */}
            <div className="flex gap-2">
              <select
                value={deviceFilter || ''}
                onChange={(e) => {
                  setDeviceFilter(e.target.value || null)
                  setTimeout(applyFilters, 100)
                }}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <option value="">All Devices</option>
                {availableDevices.map(d => (
                  <option key={d.value} value={d.value || ''}>
                    {d.value} ({d.count})
                  </option>
                ))}
              </select>

              <select
                value={countryFilter || ''}
                onChange={(e) => {
                  setCountryFilter(e.target.value || null)
                  setTimeout(applyFilters, 100)
                }}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <option value="">All Countries</option>
                {availableCountries.map(c => (
                  <option key={c.value} value={c.value || ''}>
                    {c.value} ({c.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Active Filters & Clear */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {deviceFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      Device: {deviceFilter}
                      <button onClick={() => { setDeviceFilter(null); setTimeout(applyFilters, 100) }}>
                        <IoCloseOutline className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {countryFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      Country: {countryFilter}
                      <button onClick={() => { setCountryFilter(null); setTimeout(applyFilters, 100) }}>
                        <IoCloseOutline className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      Search: {search}
                      <button onClick={() => { setSearch(''); setTimeout(applyFilters, 100) }}>
                        <IoCloseOutline className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Views List */}
        {allViews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {hasActiveFilters ? 'No results match your filters' : 'No recent activity'}
          </div>
        ) : (
          <>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {allViews.map((view, index) => (
                <button
                  key={`${view.id}-${index}`}
                  onClick={() => handleViewClick(view.id)}
                  disabled={loadingDetail === view.id}
                  className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors ${
                    loadingDetail === view.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {/* Activity dot or loading indicator */}
                  <div className="mt-1.5 flex-shrink-0">
                    {loadingDetail === view.id ? (
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate" title={view.path}>
                      {formatPath(view.path)}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {view.location && view.location !== 'Unknown' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <IoLocationOutline className="w-3 h-3" />
                          {view.location}
                        </span>
                      )}
                      {view.device && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {getDeviceIcon(view.device)}
                          <span className="capitalize">{view.device}</span>
                        </span>
                      )}
                      {view.browser && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {view.browser}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time & Arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(view.timestamp)}
                    </span>
                    <IoChevronForwardOutline className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                </button>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-3 pt-3 border-t dark:border-gray-700">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <IoRefreshOutline className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <IoChevronDownOutline className="w-4 h-4" />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Footer hint */}
            <div className="mt-3 pt-3 border-t dark:border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                Click any entry to view full details
              </p>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <ViewDetailModal
        view={selectedView}
        onClose={handleCloseModal}
      />
    </>
  )
}
