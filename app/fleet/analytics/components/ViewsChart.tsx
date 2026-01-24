// app/fleet/analytics/components/ViewsChart.tsx
// Enhanced area chart with comparison period and comprehensive metrics

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
import ChartHeader from './ChartHeader'
import ChartLegend from './ChartLegend'

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
        {previous && previous.value > 0 && (
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

  const stats = useMemo(() => {
    if (!data.length) return { total: 0, avg: 0, max: 0, min: 0, trend: 0, peakDay: '', periodChange: 0 }

    const total = data.reduce((sum, d) => sum + d.views, 0)
    const max = Math.max(...data.map(d => d.views))
    const avg = Math.round(total / data.length)

    const peakDay = data.find(d => d.views === max)
    const peakDayFormatted = peakDay
      ? new Date(peakDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : ''

    const midpoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midpoint)
    const secondHalf = data.slice(midpoint)
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.views, 0) / (firstHalf.length || 1)
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.views, 0) / (secondHalf.length || 1)
    const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

    let periodChange = 0
    if (previousPeriodData?.length) {
      const prevTotal = previousPeriodData.reduce((sum, d) => sum + d.views, 0)
      if (prevTotal > 0) {
        periodChange = ((total - prevTotal) / prevTotal) * 100
      }
    }

    return { total, avg, max, trend, peakDay: peakDayFormatted, periodChange }
  }, [data, previousPeriodData])

  const hasPreviousPeriod = Boolean(previousPeriodData && previousPeriodData.length > 0)

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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Views Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {/* Chart header */}
      <ChartHeader
        dayCount={data.length}
        peakDay={stats.peakDay}
        total={stats.total}
        avg={stats.avg}
        trend={stats.trend}
        periodChange={stats.periodChange}
        hasPreviousPeriod={hasPreviousPeriod}
      />

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="prevViewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.15} vertical={false} />

            <ReferenceLine
              y={stats.avg}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{ value: 'Avg', position: 'right', fill: '#9CA3AF', fontSize: 10 }}
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

            {hasPreviousPeriod && (
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

            <Area
              type="monotone"
              dataKey="views"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#viewsGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
              name="Current Period"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <ChartLegend avg={stats.avg} hasPreviousPeriod={hasPreviousPeriod} />
    </div>
  )
}
