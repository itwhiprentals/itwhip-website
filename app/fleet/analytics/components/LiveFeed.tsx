// app/fleet/analytics/components/LiveFeed.tsx
// Real-time feed of recent page views

'use client'

import { IoTimeOutline, IoLocationOutline } from 'react-icons/io5'

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

export default function LiveFeed({ views, loading = false }: LiveFeedProps) {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {views.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No recent activity
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {views.map((view) => (
            <div
              key={view.id}
              className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              {/* Activity dot */}
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />

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
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {view.device}
                    </span>
                  )}
                  {view.browser && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {view.browser}
                    </span>
                  )}
                </div>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatRelativeTime(view.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
