// app/fleet/monitoring/components/ActiveAlertsCard.tsx
// Displays active alerts with acknowledge/resolve actions

'use client'

import { useState } from 'react'
import {
  IoAlertCircleOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoRefreshOutline
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

interface Props {
  alerts: Alert[]
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
  'fraud': 'Fraud'
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

export default function ActiveAlertsCard({
  alerts,
  loading,
  onAcknowledge,
  onResolve,
  onRefresh
}: Props) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoAlertCircleOutline className={`w-5 h-5 ${alerts.length > 0 ? 'text-orange-500' : 'text-green-500'}`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Active Alerts
          </h3>
          {alerts.length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full font-medium">
              {alerts.length}
            </span>
          )}
        </div>
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

      {/* No Alerts State */}
      {alerts.length === 0 ? (
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
        <div className="space-y-3">
          {/* Active (New) Alerts */}
          {activeAlerts.map(alert => (
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
          {acknowledgedAlerts.map(alert => (
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
