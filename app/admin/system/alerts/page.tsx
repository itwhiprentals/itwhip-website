// app/admin/system/alerts/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  category: 'system' | 'database' | 'storage' | 'payment' | 'trip' | 'security'
  title: string
  message: string
  details?: any
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolved: boolean
  resolvedAt?: string
  actionRequired: boolean
  actionUrl?: string
}

interface AlertConfig {
  emailNotifications: boolean
  emailRecipients: string[]
  slackEnabled: boolean
  slackWebhook?: string
  thresholds: {
    cpuUsage: number
    memoryUsage: number
    errorRate: number
    responseTime: number
    diskSpace: number
  }
}

export default function SystemAlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [config, setConfig] = useState<AlertConfig>({
    emailNotifications: false,
    emailRecipients: [],
    slackEnabled: false,
    thresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      errorRate: 1,
      responseTime: 500,
      diskSpace: 90
    }
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('unresolved')
  const [editingConfig, setEditingConfig] = useState(false)

  useEffect(() => {
    loadAlerts()
    loadConfig()
  }, [filter])

  const loadAlerts = async () => {
    try {
      const response = await fetch(`/api/admin/system/alerts?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/system/alerts/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/system/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      })
      if (response.ok) {
        loadAlerts()
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/system/alerts/${alertId}/resolve`, {
        method: 'POST'
      })
      if (response.ok) {
        loadAlerts()
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const clearResolved = async () => {
    if (!confirm('Clear all resolved alerts?')) return
    
    try {
      const response = await fetch('/api/admin/system/alerts/clear-resolved', {
        method: 'DELETE'
      })
      if (response.ok) {
        loadAlerts()
      }
    } catch (error) {
      console.error('Failed to clear alerts:', error)
    }
  }

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/admin/system/alerts/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (response.ok) {
        setEditingConfig(false)
        alert('Configuration saved')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'info':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600">Monitor and manage system alerts</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setEditingConfig(!editingConfig)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Configure
          </button>
          <button
            onClick={clearResolved}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear Resolved
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-900">
                {alerts.filter(a => a.type === 'critical' && !a.resolved).length}
              </p>
            </div>
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600">Warnings</p>
              <p className="text-2xl font-bold text-amber-900">
                {alerts.filter(a => a.type === 'warning' && !a.resolved).length}
              </p>
            </div>
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Info</p>
              <p className="text-2xl font-bold text-blue-900">
                {alerts.filter(a => a.type === 'info' && !a.resolved).length}
              </p>
            </div>
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {editingConfig && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Alert Configuration</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Notifications</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.emailNotifications}
                    onChange={(e) => setConfig({...config, emailNotifications: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Email Notifications</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.slackEnabled}
                    onChange={(e) => setConfig({...config, slackEnabled: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Slack Notifications</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Alert Thresholds</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <input
                    type="number"
                    value={config.thresholds.cpuUsage}
                    onChange={(e) => setConfig({
                      ...config, 
                      thresholds: {...config.thresholds, cpuUsage: Number(e.target.value)}
                    })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <input
                    type="number"
                    value={config.thresholds.memoryUsage}
                    onChange={(e) => setConfig({
                      ...config, 
                      thresholds: {...config.thresholds, memoryUsage: Number(e.target.value)}
                    })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate (%)</span>
                  <input
                    type="number"
                    value={config.thresholds.errorRate}
                    onChange={(e) => setConfig({
                      ...config, 
                      thresholds: {...config.thresholds, errorRate: Number(e.target.value)}
                    })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditingConfig(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={saveConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'unresolved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Unresolved ({alerts.filter(a => !a.resolved).length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'critical'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Critical ({alerts.filter(a => a.type === 'critical').length})
          </button>
        </nav>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-lg shadow p-4 ${
              alert.type === 'critical' && !alert.resolved ? 'border-l-4 border-red-500' :
              alert.type === 'warning' && !alert.resolved ? 'border-l-4 border-amber-500' :
              'border-l-4 border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.category === 'security' ? 'bg-purple-100 text-purple-800' :
                      alert.category === 'payment' ? 'bg-green-100 text-green-800' :
                      alert.category === 'trip' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.category}
                    </span>
                    {alert.resolved && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        RESOLVED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{getTimeAgo(alert.createdAt)}</span>
                    {alert.acknowledgedAt && (
                      <span>Acknowledged by {alert.acknowledgedBy}</span>
                    )}
                    {alert.resolvedAt && (
                      <span>Resolved {getTimeAgo(alert.resolvedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!alert.acknowledgedAt && !alert.resolved && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Acknowledge
                  </button>
                )}
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                )}
                {alert.actionRequired && alert.actionUrl && (
                  <Link
                    href={alert.actionUrl}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 inline-block"
                  >
                    Take Action
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No alerts found</p>
          </div>
        )}
      </div>
    </div>
  )
}