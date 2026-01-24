// app/fleet/monitoring/components/ActiveAlertsCard.tsx
// Displays active alerts with acknowledge/resolve actions and computed system alerts

'use client'

import { useState, useMemo } from 'react'
import {
  IoAlertCircleOutline,
  IoCheckmarkOutline,
  IoTimeOutline,
  IoRefreshOutline,
  IoWarningOutline,
  IoSpeedometerOutline,
  IoCloudOutline,
  IoShieldOutline,
  IoFlashOutline
} from 'react-icons/io5'

interface Alert {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  title: string
  message: string
  source: string | null
  acknowledgedAt: string | null
  createdAt: string
}

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
}

interface ComputedAlert {
  id: string
  type: 'system'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  source: string
  icon: typeof IoWarningOutline
}

interface Props {
  alerts: Alert[]
  health?: SystemHealth
  loading?: boolean
  onAcknowledge?: (id: string) => Promise<void>
  onResolve?: (id: string) => Promise<void>
  onRefresh?: () => void
}

const severityColors = {
  CRITICAL: 'border-red-500 bg-red-500/5',
  HIGH: 'border-orange-500 bg-orange-500/5',
  MEDIUM: 'border-yellow-500 bg-yellow-500/5',
  LOW: 'border-blue-500 bg-blue-500/5'
}

const severityTextColors = {
  CRITICAL: 'text-red-500',
  HIGH: 'text-orange-500',
  MEDIUM: 'text-yellow-500',
  LOW: 'text-blue-500'
}

const typeLabels: Record<string, string> = {
  'security': 'Security',
  'performance': 'Performance',
  'error_rate': 'Error Rate',
  'availability': 'Availability',
  'business': 'Business',
  'fraud': 'Fraud',
  'system': 'System'
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

// Generate computed alerts from health data (non-green conditions)
function generateComputedAlerts(health?: SystemHealth): ComputedAlert[] {
  if (!health) return []

  const alerts: ComputedAlert[] = []

  // Database status alerts
  if (health.dbStatus === 'down') {
    alerts.push({
      id: 'sys-db-down',
      type: 'system',
      severity: 'CRITICAL',
      title: 'Database Unavailable',
      message: 'Database connection is down. Immediate attention required.',
      source: 'System Monitor',
      icon: IoCloudOutline
    })
  } else if (health.dbStatus === 'degraded') {
    alerts.push({
      id: 'sys-db-degraded',
      type: 'system',
      severity: 'HIGH',
      title: 'Database Performance Degraded',
      message: `Database latency is high (${health.dbLatency}ms). Performance may be impacted.`,
      source: 'System Monitor',
      icon: IoCloudOutline
    })
  }

  // P95 response time alerts
  if (health.p95ResponseTime && health.p95ResponseTime > 2000) {
    alerts.push({
      id: 'sys-p95-critical',
      type: 'system',
      severity: 'HIGH',
      title: 'Slow Response Times',
      message: `P95 response time is ${health.p95ResponseTime}ms (threshold: 2000ms).`,
      source: 'Performance Monitor',
      icon: IoSpeedometerOutline
    })
  } else if (health.p95ResponseTime && health.p95ResponseTime > 1000) {
    alerts.push({
      id: 'sys-p95-warning',
      type: 'system',
      severity: 'MEDIUM',
      title: 'Elevated Response Times',
      message: `P95 response time is ${health.p95ResponseTime}ms. Monitor closely.`,
      source: 'Performance Monitor',
      icon: IoSpeedometerOutline
    })
  }

  // Error rate alerts
  if (health.errorRate && health.errorRate >= 10) {
    alerts.push({
      id: 'sys-error-critical',
      type: 'system',
      severity: 'CRITICAL',
      title: 'Critical Error Rate',
      message: `Error rate is ${health.errorRate}% (threshold: 10%). Many requests are failing.`,
      source: 'Error Monitor',
      icon: IoShieldOutline
    })
  } else if (health.errorRate && health.errorRate >= 5) {
    alerts.push({
      id: 'sys-error-high',
      type: 'system',
      severity: 'HIGH',
      title: 'High Error Rate',
      message: `Error rate is ${health.errorRate}%. Investigate potential issues.`,
      source: 'Error Monitor',
      icon: IoShieldOutline
    })
  } else if (health.errorRate && health.errorRate >= 1) {
    alerts.push({
      id: 'sys-error-medium',
      type: 'system',
      severity: 'MEDIUM',
      title: 'Elevated Error Rate',
      message: `Error rate is ${health.errorRate}%. Some requests are failing.`,
      source: 'Error Monitor',
      icon: IoShieldOutline
    })
  }

  // Uptime alerts
  if (health.uptimePercent !== undefined && health.uptimePercent < 99) {
    alerts.push({
      id: 'sys-uptime',
      type: 'system',
      severity: health.uptimePercent < 95 ? 'CRITICAL' : 'HIGH',
      title: 'Uptime Below Target',
      message: `Current uptime is ${health.uptimePercent}%. Target: 99%+`,
      source: 'Availability Monitor',
      icon: IoFlashOutline
    })
  }

  // Critical errors alert
  if (health.criticalErrors > 0) {
    alerts.push({
      id: 'sys-critical-errors',
      type: 'system',
      severity: health.criticalErrors >= 5 ? 'CRITICAL' : 'HIGH',
      title: `${health.criticalErrors} Critical Event${health.criticalErrors > 1 ? 's' : ''}`,
      message: 'Critical security or system events detected. Review immediately.',
      source: 'Security Monitor',
      icon: IoWarningOutline
    })
  }

  return alerts
}

export default function ActiveAlertsCard({
  alerts,
  health,
  loading,
  onAcknowledge,
  onResolve,
  onRefresh
}: Props) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'system'>('all')

  // Generate computed system alerts from health data
  const computedAlerts = useMemo(() => generateComputedAlerts(health), [health])

  const handleAcknowledge = async (id: string) => {
    if (!onAcknowledge) return
    setActionLoading(id)
    try {
      await onAcknowledge(id)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolve = async (id: string) => {
    if (!onResolve) return
    setActionLoading(id)
    try {
      await onResolve(id)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const activeAlerts = alerts.filter(a => a.status === 'active')
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged')

  // Apply filter
  const filteredDbAlerts = filter === 'all'
    ? alerts
    : filter === 'active'
      ? activeAlerts
      : filter === 'acknowledged'
        ? acknowledgedAlerts
        : []

  const showComputedAlerts = filter === 'all' || filter === 'system'
  const totalAlertCount = alerts.length + computedAlerts.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoAlertCircleOutline className={`w-5 h-5 ${totalAlertCount > 0 ? 'text-orange-500' : 'text-green-500'}`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Active Alerts
          </h3>
          {totalAlertCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full font-medium">
              {totalAlertCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Severity counts */}
          {(() => {
            const allAlerts = [...alerts, ...computedAlerts.map(a => ({ ...a, status: 'active' }))]
            const criticalCount = allAlerts.filter(a => a.severity === 'CRITICAL').length
            const highCount = allAlerts.filter(a => a.severity === 'HIGH').length
            const mediumCount = allAlerts.filter(a => a.severity === 'MEDIUM').length
            return (
              <>
                {criticalCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-full font-medium">
                    {criticalCount} Crit
                  </span>
                )}
                {highCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded-full font-medium">
                    {highCount} High
                  </span>
                )}
                {mediumCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full font-medium">
                    {mediumCount} Med
                  </span>
                )}
              </>
            )
          })()}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh alerts"
            >
              <IoRefreshOutline className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active', count: activeAlerts.length },
          { id: 'acknowledged', label: 'Ack', count: acknowledgedAlerts.length },
          { id: 'system', label: 'System', count: computedAlerts.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === tab.id
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* No Alerts State */}
      {totalAlertCount === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
            <IoCheckmarkOutline className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">All Clear</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            No active alerts at this time
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {/* Computed System Alerts */}
          {showComputedAlerts && computedAlerts.map(alert => {
            const Icon = alert.icon
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${severityColors[alert.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${alert.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30' : alert.severity === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                    <Icon className={`w-4 h-4 ${severityTextColors[alert.severity]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${severityTextColors[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-400">
                        System Alert
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {alert.source}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Active (New) Alerts */}
          {filteredDbAlerts.filter(a => a.status === 'active').map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${severityColors[alert.severity]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${severityTextColors[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                      {typeLabels[alert.type] || alert.type}
                    </span>
                    <span className="text-xs text-red-500 font-medium animate-pulse">
                      NEW
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <IoTimeOutline className="w-3 h-3" />
                    {formatTimeAgo(alert.createdAt)}
                    {alert.source && (
                      <span className="text-gray-400">• {alert.source}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={actionLoading === alert.id}
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === alert.id ? 'Processing...' : 'Acknowledge'}
                </button>
                <button
                  onClick={() => handleResolve(alert.id)}
                  disabled={actionLoading === alert.id}
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}

          {/* Acknowledged Alerts */}
          {filteredDbAlerts.filter(a => a.status === 'acknowledged').map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${severityColors[alert.severity]} opacity-70`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${severityTextColors[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                      Acknowledged
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {alert.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleResolve(alert.id)}
                  disabled={actionLoading === alert.id}
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === alert.id ? 'Processing...' : 'Mark Resolved'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
