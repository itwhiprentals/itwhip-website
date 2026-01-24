// app/fleet/monitoring/page.tsx
// Comprehensive Monitoring Dashboard
// Security events, alerts, system health - your partner watching over the business

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IoShieldCheckmarkOutline,
  IoRefreshOutline,
  IoTimeOutline
} from 'react-icons/io5'
import {
  SecurityEventsCard,
  ActiveAlertsCard,
  SystemHealthCard,
  QuickActionsCard,
  ReturnUsersCard
} from './components'

interface MonitoringData {
  security: {
    summary: {
      totalEvents: number
      byType: Record<string, number>
      criticalCount: number
      highCount: number
      blockedCount: number
    }
    events: Array<{
      id: string
      type: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      ip: string
      location: string
      message: string
      action: string
      blocked: boolean
      timestamp: string
    }>
  }
  alerts: {
    active: Array<{
      id: string
      type: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      status: string
      title: string
      message: string
      source: string | null
      acknowledgedAt: string | null
      createdAt: string
    }>
    recent: any[]
    totalActive: number
  }
  health: {
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
  range: string
  generatedAt: string
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch monitoring data
  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/fleet/monitoring?range=${timeRange}`)

      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data')
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Handle alert acknowledge
  const handleAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch('/api/fleet/monitoring/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, action: 'acknowledge' })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }

  // Handle alert resolve
  const handleResolve = async (alertId: string) => {
    try {
      const response = await fetch('/api/fleet/monitoring/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, action: 'resolve' })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  }

  // Create test alert
  const handleTestAlert = async () => {
    try {
      const response = await fetch('/api/fleet/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'security',
          severity: 'MEDIUM',
          title: 'Test Alert',
          message: 'This is a test alert created from the monitoring dashboard. You can safely resolve this.',
          source: 'monitoring-dashboard'
        })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to create test alert:', err)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              System Monitoring
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Security events, alerts, and system health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['1h', '24h', '7d', '30d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <IoRefreshOutline className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <IoTimeOutline className="w-3 h-3" />
          Last updated: {lastUpdated.toLocaleTimeString()}
          <span className="text-gray-300 dark:text-gray-600">•</span>
          Auto-refreshes every 30s
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Security Events */}
        <div className="space-y-6">
          <SecurityEventsCard
            events={data?.security.events || []}
            summary={data?.security.summary || {
              totalEvents: 0,
              byType: {},
              criticalCount: 0,
              highCount: 0,
              blockedCount: 0
            }}
            loading={loading && !data}
          />

          {/* Return Users - Under Security Events */}
          <ReturnUsersCard />
        </div>

        {/* Right Column - Alerts, Health, Actions */}
        <div className="space-y-6">
          <ActiveAlertsCard
            alerts={data?.alerts.active || []}
            health={data?.health}
            loading={loading && !data}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onRefresh={fetchData}
          />

          <SystemHealthCard
            health={data?.health || {
              avgLoadTime: null,
              totalPageViews: 0,
              criticalErrors: 0,
              alertsActive: 0
            }}
            loading={loading && !data}
          />

          <QuickActionsCard
            onTestAlert={handleTestAlert}
            onRefresh={fetchData}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Monitoring powered by your existing infrastructure.
          <br />
          Security events are logged automatically. Configure email alerts in your environment variables.
        </p>
      </div>
    </div>
  )
}
