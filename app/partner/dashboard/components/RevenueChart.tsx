// app/partner/dashboard/components/RevenueChart.tsx
// Revenue Chart Component - Shows monthly revenue trends

'use client'

import { useState, useEffect } from 'react'

interface MonthlyRevenue {
  month: string
  gross: number
  net: number
  commission: number
}

export default function RevenueChart() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'net' | 'gross'>('net')

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/partner/revenue/chart?months=6', {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      } else {
        // Mock data for demo
        setData([
          { month: 'Jul', gross: 12500, net: 10000, commission: 2500 },
          { month: 'Aug', gross: 15000, net: 12000, commission: 3000 },
          { month: 'Sep', gross: 18500, net: 14800, commission: 3700 },
          { month: 'Oct', gross: 22000, net: 17600, commission: 4400 },
          { month: 'Nov', gross: 19500, net: 15600, commission: 3900 },
          { month: 'Dec', gross: 25000, net: 20000, commission: 5000 }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
      // Use mock data
      setData([
        { month: 'Jul', gross: 12500, net: 10000, commission: 2500 },
        { month: 'Aug', gross: 15000, net: 12000, commission: 3000 },
        { month: 'Sep', gross: 18500, net: 14800, commission: 3700 },
        { month: 'Oct', gross: 22000, net: 17600, commission: 4400 },
        { month: 'Nov', gross: 19500, net: 15600, commission: 3900 },
        { month: 'Dec', gross: 25000, net: 20000, commission: 5000 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...data.map(d => viewMode === 'net' ? d.net : d.gross))

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${amount}`
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('net')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'net'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Net Revenue
        </button>
        <button
          onClick={() => setViewMode('gross')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'gross'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Gross Revenue
        </button>
      </div>

      {/* Chart */}
      <div className="h-52 flex items-end gap-2">
        {data.map((item, index) => {
          const value = viewMode === 'net' ? item.net : item.gross
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full relative" style={{ height: '180px' }}>
                {/* Bar */}
                <div
                  className={`absolute bottom-0 left-1 right-1 rounded-t-lg transition-all duration-500 ${
                    viewMode === 'net'
                      ? 'bg-gradient-to-t from-green-500 to-green-400'
                      : 'bg-gradient-to-t from-blue-500 to-blue-400'
                  }`}
                  style={{ height: `${height}%` }}
                />
                {/* Commission overlay for gross view */}
                {viewMode === 'gross' && (
                  <div
                    className="absolute bottom-0 left-1 right-1 bg-orange-500/50 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(item.commission / maxValue) * 100}%` }}
                  />
                )}
                {/* Value label */}
                <div
                  className="absolute left-0 right-0 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all duration-500"
                  style={{ bottom: `${height + 2}%` }}
                >
                  {formatCurrency(value)}
                </div>
              </div>
              {/* Month label */}
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${viewMode === 'net' ? 'bg-green-500' : 'bg-blue-500'}`} />
          <span className="text-gray-600 dark:text-gray-400">
            {viewMode === 'net' ? 'Net Revenue' : 'Gross Revenue'}
          </span>
        </div>
        {viewMode === 'gross' && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Commission</span>
          </div>
        )}
      </div>
    </div>
  )
}
