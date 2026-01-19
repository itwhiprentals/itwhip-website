// app/fleet/analytics/components/ViewsChart.tsx
// Line chart showing views over time

'use client'

import { useMemo } from 'react'

interface ViewsByDay {
  date: string
  views: number
}

interface ViewsChartProps {
  data: ViewsByDay[]
  loading?: boolean
}

export default function ViewsChart({ data, loading = false }: ViewsChartProps) {
  // Calculate chart dimensions
  const maxViews = useMemo(() => {
    if (!data.length) return 100
    return Math.max(...data.map(d => d.views), 10)
  }, [data])

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
        <div className="h-48 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Views Over Time
        </h3>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Views Over Time
      </h3>

      {/* Simple bar chart - no external dependencies */}
      <div className="h-48 flex items-end gap-1">
        {data.map((day, i) => {
          const height = (day.views / maxViews) * 100
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center group"
            >
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 mb-1 whitespace-nowrap">
                {day.views} views
              </div>

              {/* Bar */}
              <div
                className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${formatDate(day.date)}: ${day.views} views`}
              />

              {/* Date label (show every few) */}
              {(i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0) && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">
                  {formatDate(day.date)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span>0</span>
        <span>{Math.round(maxViews / 2)}</span>
        <span>{maxViews}</span>
      </div>
    </div>
  )
}
