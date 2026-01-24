// app/fleet/monitoring/components/SystemHealthCard.tsx
// Displays comprehensive system health metrics - clickable for details

'use client'

import { useState } from 'react'
import {
  IoSpeedometerOutline,
  IoFlashOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoServerOutline,
  IoEyeOutline,
  IoTimeOutline,
  IoCloudOutline,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import SystemHealthDetailModal, { MetricType } from './SystemHealthDetailModal'

interface SystemHealth {
  avgLoadTime: number | null
  totalPageViews: number
  criticalErrors: number
  alertsActive: number
  p95ResponseTime?: number | null
  errorRate?: number
  dbStatus?: 'healthy' | 'degraded' | 'down'
  dbLatency?: number
  uptimePercent?: number
  lastChecked?: string
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

function getUptimeStatus(percent: number | undefined): { color: string; label: string } {
  if (percent === undefined) return { color: 'text-gray-400', label: 'Unknown' }
  if (percent >= 99.9) return { color: 'text-green-500', label: 'Excellent' }
  if (percent >= 99) return { color: 'text-green-500', label: 'Good' }
  if (percent >= 95) return { color: 'text-yellow-500', label: 'Fair' }
  return { color: 'text-red-500', label: 'Poor' }
}

function getDbStatus(status: string | undefined): { color: string; bgColor: string } {
  switch (status) {
    case 'healthy':
      return { color: 'text-green-500', bgColor: 'bg-green-500' }
    case 'degraded':
      return { color: 'text-yellow-500', bgColor: 'bg-yellow-500' }
    case 'down':
      return { color: 'text-red-500', bgColor: 'bg-red-500' }
    default:
      return { color: 'text-gray-400', bgColor: 'bg-gray-400' }
  }
}

function getErrorRateStatus(rate: number | undefined): { color: string; label: string } {
  if (rate === undefined) return { color: 'text-gray-400', label: 'Unknown' }
  if (rate === 0) return { color: 'text-green-500', label: 'None' }
  if (rate < 1) return { color: 'text-green-500', label: 'Low' }
  if (rate < 5) return { color: 'text-yellow-500', label: 'Moderate' }
  if (rate < 10) return { color: 'text-orange-500', label: 'High' }
  return { color: 'text-red-500', label: 'Critical' }
}

export default function SystemHealthCard({ health, loading }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const loadTimeStatus = getLoadTimeStatus(health.avgLoadTime)
  const uptimeStatus = getUptimeStatus(health.uptimePercent)
  const dbStatusInfo = getDbStatus(health.dbStatus)
  const errorRateStatus = getErrorRateStatus(health.errorRate)
  const p95Status = getLoadTimeStatus(health.p95ResponseTime ?? null)

  // Overall health: check multiple factors
  const hasIssues =
    health.criticalErrors > 0 ||
    health.alertsActive > 0 ||
    health.dbStatus === 'down' ||
    health.dbStatus === 'degraded' ||
    (health.errorRate ?? 0) > 5 ||
    (health.uptimePercent ?? 100) < 99

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IoServerOutline className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              System Health
            </h3>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${hasIssues ? 'text-orange-500' : 'text-green-500'}`}>
            {hasIssues ? (
              <>
                <IoWarningOutline className="w-4 h-4" />
                Needs Attention
              </>
            ) : (
              <>
                <IoCheckmarkCircleOutline className="w-4 h-4" />
                All Systems Healthy
              </>
            )}
          </div>
        </div>

        {/* Metrics Grid - 2x3 on mobile, 3x2 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Uptime */}
          <button
            onClick={() => setSelectedMetric('uptime')}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoTrendingUpOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Uptime</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className={`text-2xl font-bold ${uptimeStatus.color}`}>
              {health.uptimePercent !== undefined ? `${health.uptimePercent}%` : '—'}
            </p>
            <p className={`text-xs ${uptimeStatus.color}`}>
              {uptimeStatus.label}
            </p>
          </button>

          {/* Database Status */}
          <button
            onClick={() => setSelectedMetric('database')}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoCloudOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Database</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${dbStatusInfo.bgColor} ${health.dbStatus === 'healthy' ? 'animate-pulse' : ''}`} />
              <p className={`text-lg font-bold capitalize ${dbStatusInfo.color}`}>
                {health.dbStatus || '—'}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {health.dbLatency ? `${health.dbLatency}ms latency` : 'No data'}
            </p>
          </button>

          {/* P95 Response Time */}
          <button
            onClick={() => setSelectedMetric('p95')}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">P95 Response</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className={`text-2xl font-bold ${p95Status.color}`}>
              {health.p95ResponseTime !== null && health.p95ResponseTime !== undefined
                ? `${health.p95ResponseTime}ms`
                : '—'}
            </p>
            <p className={`text-xs ${p95Status.color}`}>
              {p95Status.label}
            </p>
          </button>

          {/* Avg Load Time */}
          <button
            onClick={() => setSelectedMetric('avgLoadTime')}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoSpeedometerOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg Load Time</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className={`text-2xl font-bold ${loadTimeStatus.color}`}>
              {health.avgLoadTime !== null ? `${health.avgLoadTime}ms` : '—'}
            </p>
            <p className={`text-xs ${loadTimeStatus.color}`}>
              {loadTimeStatus.label}
            </p>
          </button>

          {/* Error Rate */}
          <button
            onClick={() => setSelectedMetric('errorRate')}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Error Rate</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className={`text-2xl font-bold ${errorRateStatus.color}`}>
              {health.errorRate !== undefined ? `${health.errorRate}%` : '—'}
            </p>
            <p className={`text-xs ${errorRateStatus.color}`}>
              {errorRateStatus.label}
            </p>
          </button>

          {/* Page Views (24h) */}
          <button
            onClick={() => setSelectedMetric('pageViews')}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoEyeOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Page Views</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {health.totalPageViews.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total requests
            </p>
          </button>
        </div>

        {/* Critical Issues Row */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Critical Errors */}
          <button
            onClick={() => setSelectedMetric('criticalErrors')}
            className={`rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group ${health.criticalErrors > 0 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <IoWarningOutline className={`w-4 h-4 ${health.criticalErrors > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">Critical Events</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className={`text-2xl font-bold ${health.criticalErrors > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {health.criticalErrors}
            </p>
            <p className={`text-xs ${health.criticalErrors > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {health.criticalErrors > 0 ? 'Needs review' : 'None detected'}
            </p>
          </button>

          {/* Active Alerts */}
          <button
            onClick={() => setSelectedMetric('activeAlerts')}
            className={`rounded-lg p-3 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group ${health.alertsActive > 0 ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <IoFlashOutline className={`w-4 h-4 ${health.alertsActive > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">Active Alerts</span>
              </div>
              <IoChevronForwardOutline className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className={`text-2xl font-bold ${health.alertsActive > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {health.alertsActive}
            </p>
            <p className={`text-xs ${health.alertsActive > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {health.alertsActive > 0 ? 'Require action' : 'All clear'}
            </p>
          </button>
        </div>

        {/* Last Checked Footer */}
        <div className="mt-4 pt-3 border-t dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Click any metric for details</span>
          </div>
          {health.lastChecked && (
            <span className="text-xs text-gray-400">
              Updated {new Date(health.lastChecked).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <SystemHealthDetailModal
        metric={selectedMetric}
        health={health}
        onClose={() => setSelectedMetric(null)}
      />
    </>
  )
}
