'use client'

import { useState, useEffect } from 'react'
import { IoPulseOutline, IoCheckmarkCircle, IoCloseCircle, IoRefresh } from 'react-icons/io5'

interface ServiceStatus {
  service: string
  status: 'ok' | 'down'
  latencyMs: number
  error?: string
}

export default function SystemStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [overall, setOverall] = useState<'healthy' | 'degraded' | 'unknown'>('unknown')
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/fleet/api/system-status')
      const data = await res.json()
      setServices(data.services || [])
      setOverall(data.status || 'unknown')
      setLastCheck(data.timestamp || new Date().toISOString())
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchStatus() }, [])

  const refresh = () => { setRefreshing(true); fetchStatus() }

  const SERVICE_LABELS: Record<string, string> = {
    database: 'PostgreSQL Database',
    stripe: 'Stripe Payments',
    s3: 'S3 / CloudFront CDN',
    'expo-push': 'Expo Push Notifications',
    resend: 'Resend Email',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IoPulseOutline className="text-3xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Status</h1>
        </div>
        <button onClick={refresh} disabled={refreshing} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          <IoRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall status */}
      <div className={`rounded-lg p-4 mb-4 border ${overall === 'healthy' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : overall === 'degraded' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center gap-2">
          {overall === 'healthy' ? <IoCheckmarkCircle className="text-2xl text-green-500" /> : <IoCloseCircle className="text-2xl text-red-500" />}
          <span className="text-lg font-bold text-gray-900 dark:text-white">{overall === 'healthy' ? 'All Systems Operational' : overall === 'degraded' ? 'Some Services Degraded' : 'Checking...'}</span>
        </div>
        {lastCheck && <p className="text-xs text-gray-500 mt-1">Last check: {new Date(lastCheck).toLocaleString()}</p>}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Checking services...</div>
      ) : (
        <div className="grid gap-3">
          {services.map(svc => (
            <div key={svc.service} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${svc.status === 'ok' ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${svc.status === 'ok' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{SERVICE_LABELS[svc.service] || svc.service}</span>
                  {svc.error && <p className="text-xs text-red-600 dark:text-red-400">{svc.error}</p>}
                </div>
              </div>
              <span className="text-xs font-mono text-gray-500">{svc.latencyMs}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
