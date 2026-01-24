// app/fleet/analytics/components/ViewsChart.tsx
// Enhanced area chart with comparison period (green/red trends)

'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface ViewsByDay {
  date: string
  views: number
}

interface ViewsChartProps {
  data: ViewsByDay[]
  loading?: boolean
  previousPeriodData?: ViewsByDay[]
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null

  const date = new Date(label || '')
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  const current = payload.find(p => p.dataKey === 'views')
  const previous = payload.find(p => p.dataKey === 'previousViews')

  // Calculate change percentage
  let changePercent: number | null = null
  let isPositive = true
  if (current && previous && previous.value > 0) {
    changePercent = ((current.value - previous.value) / previous.value) * 100
    isPositive = changePercent >= 0
  }

  return (
    <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg min-w-[140px]">
      <p className="font-medium mb-1">{formattedDate}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-blue-300">Current:</span>
          <span className="font-medium">{current?.value.toLocaleString() || 0}</span>
        </div>
        {previous && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-400">Previous:</span>
            <span className="text-gray-300">{previous.value.toLocaleString()}</span>
          </div>
        )}
        {changePercent !== null && (
          <div className={`flex items-center justify-between gap-3 pt-1 border-t border-gray-700 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span>Change:</span>
            <span className="font-medium">
              {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ViewsChart({ data, loading = false, previousPeriodData }: ViewsChartProps) {
  // Format and merge data for recharts
  const chartData = useMemo(() => {
    return data.map((d, index) => {
      const prevData = previousPeriodData?.[index]
      return {
        ...d,
        dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        previousViews: prevData?.views || null
      }
    })
  }, [data, previousPeriodData])

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (!data.length) return { total: 0, avg: 0, max: 0, min: 0, trend: 0, peakDay: '' }

    const total = data.reduce((sum, d) => sum + d.views, 0)
    const max = Math.max(...data.map(d => d.views))
    const min = Math.min(...data.map(d => d.views))
    const avg = Math.round(total / data.length)

    // Find peak day
    const peakDay = data.find(d => d.views === max)
    const peakDayFormatted = peakDay
      ? new Date(peakDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : ''

    // Calculate trend (compare first half to second half)
    const midpoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midpoint)
    const secondHalf = data.slice(midpoint)
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.views, 0) / (firstHalf.length || 1)
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.views, 0) / (secondHalf.length || 1)
    const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

    // Compare to previous period
    let periodChange = 0
    if (previousPeriodData?.length) {
      const prevTotal = previousPeriodData.reduce((sum, d) => sum + d.views, 0)
      if (prevTotal > 0) {
        periodChange = ((total - prevTotal) / prevTotal) * 100
      }
    }

    return { total, avg, max, min, trend, peakDay: peakDayFormatted, periodChange }
  }, [data, previousPeriodData])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Views Over Time
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    )
  }

  const trendIsPositive = stats.trend >= 0
  const periodChangeIsPositive = stats.periodChange >= 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Views Over Time
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {data.length} day period • Peak: {stats.peakDay}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Total */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">Total: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {stats.total.toLocaleString()}
            </span>
          </div>

          {/* Daily Avg */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">Avg: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {stats.avg.toLocaleString()}/day
            </span>
          </div>

          {/* Trend indicator */}
          <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
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
              {trendIsPositive ? '+' : ''}{stats.trend.toFixed(1)}%
            </span>
          </div>

          {/* Period comparison (if available) */}
          {previousPeriodData && previousPeriodData.length > 0 && (
            <div className={`px-2.5 py-1.5 rounded-lg text-xs ${
              periodChangeIsPositive
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              <span className="text-gray-500 dark:text-gray-400">vs prev: </span>
              <span className="font-medium">
                {periodChangeIsPositive ? '+' : ''}{stats.periodChange.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
          >
            <defs>
              {/* Current period gradient - blue */}
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              {/* Previous period gradient - gray */}
              <linearGradient id="prevViewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              strokeOpacity={0.15}
              vertical={false}
            />

            {/* Average reference line */}
            <ReferenceLine
              y={stats.avg}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{
                value: 'Avg',
                position: 'right',
                fill: '#9CA3AF',
                fontSize: 10
              }}
            />

            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />

            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              width={35}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Previous period area (behind) */}
            {previousPeriodData && previousPeriodData.length > 0 && (
              <Area
                type="monotone"
                dataKey="previousViews"
                stroke="#9CA3AF"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="url(#prevViewsGradient)"
                dot={false}
                name="Previous Period"
              />
            )}

            {/* Current period area (front) */}
            <Area
              type="monotone"
              dataKey="views"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#viewsGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#3B82F6',
                stroke: '#fff',
                strokeWidth: 2
              }}
              name="Current Period"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-4 h-0.5 bg-blue-500 rounded" />
          <span>Current Period</span>
        </div>
        {previousPeriodData && previousPeriodData.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-4 h-0.5 bg-gray-400 rounded border-dashed" style={{ borderTop: '2px dashed #9CA3AF', height: 0 }} />
            <span>Previous Period</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-4 h-0 border-t-2 border-dashed border-gray-400" />
          <span>Average ({stats.avg}/day)</span>
        </div>
      </div>
    </div>
  )
}
