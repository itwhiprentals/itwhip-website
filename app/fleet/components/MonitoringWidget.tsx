// app/fleet/components/MonitoringWidget.tsx
// Compact monitoring widget for fleet dashboard
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoFlashOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface MonitoringData {
  security: {
    summary: {
      totalEvents: number
      criticalCount: number
      highCount: number
      blockedCount: number
    }
  }
  alerts: {
    totalActive: number
    active: Array<{
      id: string
      severity: string
      title: string
    }>
  }
  health: {
    avgLoadTime: number | null
    criticalErrors: number
    alertsActive: number
  }
}

export default function MonitoringWidget() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/fleet/monitoring?range=24h')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const healthStatus = data?.health?.criticalErrors === 0 && data?.alerts?.totalActive === 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">System Monitoring</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Refresh"
          >
            <IoRefreshOutline className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/fleet/monitoring"
            className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            View Details →
          </Link>
        </div>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !data ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <IoShieldCheckmarkOutline className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Unable to load monitoring data</p>
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {/* System Health */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                {healthStatus ? (
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                ) : (
                  <IoWarningOutline className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">Health</span>
              </div>
              <p className={`text-lg font-bold ${healthStatus ? 'text-green-500' : 'text-orange-500'}`}>
                {healthStatus ? 'Healthy' : 'Warning'}
              </p>
            </div>

            {/* Active Alerts */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoFlashOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Alerts</span>
              </div>
              <p className={`text-lg font-bold ${(data?.alerts?.totalActive || 0) > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {data?.alerts?.totalActive || 0}
              </p>
            </div>

            {/* Security Events */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Events</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {data?.security?.summary?.totalEvents || 0}
              </p>
            </div>

            {/* Critical Issues */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoAlertCircleOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Critical</span>
              </div>
              <p className={`text-lg font-bold ${(data?.security?.summary?.criticalCount || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {data?.security?.summary?.criticalCount || 0}
              </p>
            </div>
          </div>

          {/* Active Alerts Preview */}
          {data?.alerts?.active && data.alerts.active.length > 0 && (
            <div className="border-t dark:border-gray-700 pt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recent Alerts</p>
              <div className="space-y-2">
                {data.alerts.active.slice(0, 3).map(alert => (
                  <div
                    key={alert.id}
                    className={`flex items-center gap-2 p-2 rounded text-xs ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : alert.severity === 'HIGH'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    <IoAlertCircleOutline className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{alert.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          {data?.health?.avgLoadTime != null && data.health.avgLoadTime > 0 && (
            <div className="border-t dark:border-gray-700 pt-3 mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Avg Response Time</span>
                <span className={`font-medium ${
                  data.health.avgLoadTime < 500
                    ? 'text-green-500'
                    : data.health.avgLoadTime < 1000
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}>
                  {data.health.avgLoadTime}ms
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
