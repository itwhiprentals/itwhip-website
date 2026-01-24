// app/fleet/analytics/components/ChartHeader.tsx
// Header component for Views Over Time chart with stats badges

'use client'

interface ChartHeaderProps {
  dayCount: number
  peakDay: string
  total: number
  avg: number
  trend: number
  periodChange?: number
  hasPreviousPeriod?: boolean
}

export default function ChartHeader({
  dayCount,
  peakDay,
  total,
  avg,
  trend,
  periodChange = 0,
  hasPreviousPeriod = false
}: ChartHeaderProps) {
  const trendIsPositive = trend >= 0
  const periodChangeIsPositive = periodChange >= 0

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Views Over Time
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {dayCount} day period {peakDay && `• Peak: ${peakDay}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Total */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">Total: </span>
          <span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()}</span>
        </div>

        {/* Daily Avg */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">Avg: </span>
          <span className="font-semibold text-gray-900 dark:text-white">{avg.toLocaleString()}/day</span>
        </div>

        {/* Trend indicator */}
        <div className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
          trendIsPositive
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {trendIsPositive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            )}
          </svg>
          <span className="font-medium">
            {trendIsPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>

        {/* Period comparison */}
        {hasPreviousPeriod && (
          <div className={`px-2 py-1 rounded-lg ${
            periodChangeIsPositive
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            <span className="text-gray-500 dark:text-gray-400">vs prev: </span>
            <span className="font-medium">
              {periodChangeIsPositive ? '+' : ''}{periodChange.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
