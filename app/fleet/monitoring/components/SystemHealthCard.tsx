// app/fleet/monitoring/components/SystemHealthCard.tsx
// Displays system health metrics

'use client'

import {
  IoSpeedometerOutline,
  IoFlashOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoServerOutline,
  IoEyeOutline
} from 'react-icons/io5'

interface SystemHealth {
  avgLoadTime: number | null
  totalPageViews: number
  criticalErrors: number
  alertsActive: number
}

interface Props {
  health: SystemHealth
  loading?: boolean
}

function getLoadTimeStatus(ms: number | null): { color: string; label: string } {
  if (ms === null) return { color: 'text-gray-400', label: 'No data' }
  if (ms < 200) return { color: 'text-green-500', label: 'Excellent' }
  if (ms < 500) return { color: 'text-green-500', label: 'Good' }
  if (ms < 1000) return { color: 'text-yellow-500', label: 'Fair' }
  if (ms < 2000) return { color: 'text-orange-500', label: 'Slow' }
  return { color: 'text-red-500', label: 'Critical' }
}

export default function SystemHealthCard({ health, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const loadTimeStatus = getLoadTimeStatus(health.avgLoadTime)
  const overallHealth = health.criticalErrors === 0 && health.alertsActive === 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoServerOutline className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            System Health
          </h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${overallHealth ? 'text-green-500' : 'text-orange-500'}`}>
          {overallHealth ? (
            <>
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              Healthy
            </>
          ) : (
            <>
              <IoWarningOutline className="w-4 h-4" />
              Needs Attention
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* API Latency */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoSpeedometerOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Avg Load Time</span>
          </div>
          <p className={`text-2xl font-bold ${loadTimeStatus.color}`}>
            {health.avgLoadTime !== null ? `${health.avgLoadTime}ms` : '—'}
          </p>
          <p className={`text-xs ${loadTimeStatus.color}`}>
            {loadTimeStatus.label}
          </p>
        </div>

        {/* Page Views */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoEyeOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Page Views (24h)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {health.totalPageViews.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total requests
          </p>
        </div>

        {/* Critical Errors */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoWarningOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Critical Events</span>
          </div>
          <p className={`text-2xl font-bold ${health.criticalErrors > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {health.criticalErrors}
          </p>
          <p className={`text-xs ${health.criticalErrors > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {health.criticalErrors > 0 ? 'Needs review' : 'None detected'}
          </p>
        </div>

        {/* Active Alerts */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoFlashOutline className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Active Alerts</span>
          </div>
          <p className={`text-2xl font-bold ${health.alertsActive > 0 ? 'text-orange-500' : 'text-green-500'}`}>
            {health.alertsActive}
          </p>
          <p className={`text-xs ${health.alertsActive > 0 ? 'text-orange-500' : 'text-green-500'}`}>
            {health.alertsActive > 0 ? 'Require action' : 'All clear'}
          </p>
        </div>
      </div>

      {/* UptimeRobot Status (External) */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <a
          href="https://dashboard.uptimerobot.com/monitors"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-700 dark:text-gray-300">UptimeRobot</span>
          </div>
          <span className="text-xs text-blue-500">View Dashboard →</span>
        </a>
      </div>
    </div>
  )
}
