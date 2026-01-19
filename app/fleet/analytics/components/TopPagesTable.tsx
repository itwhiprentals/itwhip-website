// app/fleet/analytics/components/TopPagesTable.tsx
// Table showing most visited pages

'use client'

import { IoDocumentOutline } from 'react-icons/io5'

interface TopPage {
  path: string
  views: number
}

interface TopPagesTableProps {
  pages: TopPage[]
  loading?: boolean
}

export default function TopPagesTable({ pages, loading = false }: TopPagesTableProps) {
  // Calculate max for bar width
  const maxViews = pages.length ? Math.max(...pages.map(p => p.views)) : 1

  // Format path for display
  const formatPath = (path: string) => {
    if (path === '/') return 'Home'
    // Remove leading slash and truncate
    const clean = path.replace(/^\//, '')
    return clean.length > 40 ? clean.slice(0, 40) + '...' : clean
  }

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
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Top Pages
      </h3>

      {pages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No page views recorded yet
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page, index) => {
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
                    <span className="text-xs text-gray-400 w-4">{index + 1}</span>
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
      )}
    </div>
  )
}
