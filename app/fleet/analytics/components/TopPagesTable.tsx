// app/fleet/analytics/components/TopPagesTable.tsx
// Table showing most visited pages with load more

'use client'

import { useState, useEffect, useCallback } from 'react'
import { IoDocumentOutline, IoChevronDownOutline, IoRefreshOutline } from 'react-icons/io5'

interface TopPage {
  path: string
  views: number
}

interface TopPagesTableProps {
  pages: TopPage[]
  loading?: boolean
  timeRange?: string
}

export default function TopPagesTable({ pages: initialPages, loading = false, timeRange = '7d' }: TopPagesTableProps) {
  const [allPages, setAllPages] = useState<TopPage[]>(initialPages)
  const [displayCount, setDisplayCount] = useState(10)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalPages, setTotalPages] = useState(0)

  // Update when initial pages change
  useEffect(() => {
    setAllPages(initialPages)
    setDisplayCount(10)
  }, [initialPages])

  // Calculate max for bar width
  const maxViews = allPages.length ? Math.max(...allPages.map(p => p.views)) : 1

  // Format path for display
  const formatPath = (path: string) => {
    if (path === '/') return 'Home'
    // Remove leading slash and truncate
    const clean = path.replace(/^\//, '')
    return clean.length > 40 ? clean.slice(0, 40) + '...' : clean
  }

  // Fetch more pages
  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true)
    try {
      // For now, we'll fetch from the stats API with a larger limit
      // In a production app, you'd have a dedicated endpoint
      const response = await fetch(`/api/fleet/analytics/stats?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        if (data.topPages) {
          // We'll extend the displayed count since we already have all data
          // The API returns all pages, we're just showing more
          setDisplayCount(prev => prev + 10)
        }
      }
    } catch (error) {
      console.error('Failed to load more pages:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [timeRange])

  // Display pages (limited by displayCount)
  const displayPages = allPages.slice(0, displayCount)
  const hasMore = displayCount < allPages.length

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Top Pages
          {allPages.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({allPages.length} total)
            </span>
          )}
        </h3>
      </div>

      {allPages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No page views recorded yet
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {displayPages.map((page, index) => {
              const widthPercent = (page.views / maxViews) * 100
              return (
                <div key={page.path} className="relative">
                  {/* Background bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/10 rounded"
                    style={{ width: `${widthPercent}%` }}
                  />

                  {/* Content */}
                  <div className="relative flex items-center justify-between py-2 px-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-400 w-5">{index + 1}</span>
                      <IoDocumentOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span
                        className="text-sm text-gray-700 dark:text-gray-300 truncate"
                        title={page.path}
                      >
                        {formatPath(page.path)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-3 pt-3 border-t dark:border-gray-700">
              <button
                onClick={() => setDisplayCount(prev => prev + 10)}
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
                    Show {Math.min(10, allPages.length - displayCount)} More
                  </>
                )}
              </button>
            </div>
          )}

          {/* Show all button if many pages */}
          {allPages.length > 20 && displayCount < allPages.length && (
            <button
              onClick={() => setDisplayCount(allPages.length)}
              className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Show All ({allPages.length})
            </button>
          )}
        </>
      )}
    </div>
  )
}
