'use client'

import { useState, useEffect, useRef } from 'react'
import { IoPulseOutline, IoCheckmarkCircle, IoCloseCircle, IoRefresh, IoTimeOutline } from 'react-icons/io5'

interface ServiceStatus {
  service: string
  status: 'ok' | 'down'
  latencyMs: number
  error?: string
}

const SERVICE_INFO: Record<string, { label: string; desc: string; icon: string }> = {
  database: { label: 'PostgreSQL Database', desc: 'Primary data store — users, bookings, fleet', icon: '🗄️' },
  stripe: { label: 'Stripe Payments', desc: 'Payment processing, payouts, identity verification', icon: '💳' },
  s3: { label: 'S3 / CloudFront CDN', desc: 'Photo storage and delivery (photos.itwhip.com)', icon: '📸' },
  'expo-push': { label: 'Expo Push Notifications', desc: 'Mobile push notifications to iOS and Android', icon: '🔔' },
  resend: { label: 'Resend Email', desc: 'Transactional email — verification, confirmations, receipts', icon: '📧' },
  twilio: { label: 'Twilio SMS', desc: 'Transactional SMS — booking alerts, trip reminders', icon: '📱' },
  firebase: { label: 'Firebase Auth', desc: 'Phone OTP verification for login and signup', icon: '🔐' },
  anthropic: { label: 'Anthropic / Claude API', desc: 'AI engine powering Choé — search, booking, conversation', icon: '🤖' },
  website: { label: 'ItWhip Website', desc: 'Production website (itwhip.com) self-check', icon: '🌐' },
}

function latencyColor(ms: number): string {
  if (ms < 500) return 'text-green-600 dark:text-green-400'
  if (ms < 1500) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function latencyLabel(ms: number): string {
  if (ms < 500) return 'Fast'
  if (ms < 1500) return 'Normal'
  return 'Slow'
}

export default function SystemStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [overall, setOverall] = useState<'healthy' | 'degraded' | 'unknown'>('unknown')
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(fetchStatus, 30000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoRefresh])

  const refresh = () => { setRefreshing(true); fetchStatus() }

  const okCount = services.filter(s => s.status === 'ok').length
  const downCount = services.filter(s => s.status === 'down').length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <IoPulseOutline className="text-3xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Status</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded" />
            Auto-refresh
          </label>
          <button onClick={refresh} disabled={refreshing} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
            <IoRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
            Check Now
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Real-time health of all external services. Checked every 5 minutes by cron, auto-refreshes every 30 seconds on this page. Failed services auto-trigger killswitches.
      </p>

      {/* Overall status banner */}
      <div className={`rounded-lg p-4 mb-6 border ${overall === 'healthy' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : overall === 'degraded' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {overall === 'healthy' ? <IoCheckmarkCircle className="text-2xl text-green-500" /> : overall === 'degraded' ? <IoCloseCircle className="text-2xl text-red-500" /> : <IoTimeOutline className="text-2xl text-gray-400 animate-pulse" />}
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {overall === 'healthy' ? 'All Systems Operational' : overall === 'degraded' ? `${downCount} Service${downCount > 1 ? 's' : ''} Down` : 'Checking...'}
              </span>
              {lastCheck && <p className="text-xs text-gray-500">Last check: {new Date(lastCheck).toLocaleString()}</p>}
            </div>
          </div>
          {!loading && (
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{okCount}/{services.length}</span>
              <p className="text-xs text-gray-500">services healthy</p>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Checking services...</div>
      ) : (
        <div className="space-y-3">
          {services.map(svc => {
            const meta = SERVICE_INFO[svc.service]
            return (
              <div key={svc.service} className={`rounded-lg border overflow-hidden ${svc.status === 'ok' ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'}`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${svc.status === 'ok' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meta?.icon}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{meta?.label || svc.service}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${svc.status === 'ok' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {svc.status === 'ok' ? 'OK' : 'DOWN'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{meta?.desc}</p>
                      {svc.error && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{svc.error}</p>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-sm font-mono font-bold ${latencyColor(svc.latencyMs)}`}>{svc.latencyMs}ms</span>
                    <p className={`text-xs ${latencyColor(svc.latencyMs)}`}>{latencyLabel(svc.latencyMs)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
