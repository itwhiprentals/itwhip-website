// app/fleet/components/SecurityMetricsCard.tsx
// Security metrics card for fleet dashboard
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  IoLockClosedOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoShieldOutline,
  IoRefreshOutline,
  IoSkullOutline,
  IoPersonOutline,
  IoBanOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface SecurityStats {
  timeRange: string
  totalFailedLogins: number
  successfulLogins: number
  uniqueIps: number
  uniqueEmails: number
  bruteForceAttempts: number
  accountsTargeted: number
  blockedAttempts: number
  bySource: Record<string, number>
  byReason: Record<string, number>
}

interface SecurityEvent {
  id: string
  type: string
  severity: string
  sourceIp: string
  targetEmail: string
  reason: string | null
  source: string | null
  message: string
  blocked: boolean
  timestamp: string
  // Enhanced location data
  country: string | null
  city: string | null
  zipCode: string | null
  isp: string | null
  asn: number | null
  organization: string | null
  // Phone login data
  phone: string | null
  method: string
  fingerprint: string | null
  newDevice: boolean
  // Threat intelligence
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isDatacenter: boolean
  isHosting: boolean
  riskScore: number
  // Bot detection
  isBot: boolean
  botName: string | null
  botConfidence: number
  botReasons: string[]
  // Total threat score
  threatScore: number
  userId: string | null
}

interface SecurityData {
  stats: SecurityStats
  recentEvents: SecurityEvent[]
  threatLevel: 'high' | 'medium' | 'low' | 'none'
}

const threatLevelColors = {
  high: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400', icon: IoSkullOutline },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-600 dark:text-yellow-400', icon: IoWarningOutline },
  low: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', icon: IoAlertCircleOutline },
  none: { bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400', icon: IoCheckmarkCircleOutline }
}

const reasonLabels: Record<string, string> = {
  'INVALID_CREDENTIALS': 'Wrong Password',
  'ACCOUNT_NOT_FOUND': 'Unknown Email',
  'RATE_LIMITED': 'Rate Limited',
  'BLOCKED_IP': 'Blocked IP',
  'ACCOUNT_SUSPENDED': 'Suspended',
  'ACCOUNT_PENDING': 'Pending',
  'ACCOUNT_INACTIVE': 'Inactive',
  'PASSWORD_NOT_SET': 'No Password',
  'INVALID_ACCOUNT_TYPE': 'Wrong Portal',
  // Phone-specific reasons
  'FIREBASE_VERIFICATION_FAILED': 'Phone Verification Failed',
  'INVALID_PHONE': 'Invalid Phone',
  'SMS_QUOTA_EXCEEDED': 'SMS Quota Exceeded',
  'PHONE_NOT_VERIFIED': 'Phone Not Verified',
  'BOT_DETECTED': 'Bot Detected',
  'SMS_FAILED': 'SMS Failed'
}

export default function SecurityMetricsCard() {
  const [data, setData] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEvents, setShowEvents] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fleet/security/stats?hours=24')
      if (response.status === 401 || response.status === 403) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch security stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 120000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const threatConfig = data ? threatLevelColors[data.threatLevel] : threatLevelColors.none
  const ThreatIcon = threatConfig.icon

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${threatConfig.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${threatConfig.bg} px-4 py-3 border-b ${threatConfig.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoLockClosedOutline className={`w-5 h-5 ${threatConfig.text}`} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Login Security</h3>
            {data && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${threatConfig.bg} ${threatConfig.text} border ${threatConfig.border}`}>
                {data.threatLevel === 'none' ? 'All Clear' :
                 data.threatLevel === 'low' ? 'Low Activity' :
                 data.threatLevel === 'medium' ? 'Moderate' : 'Elevated'}
              </span>
            )}
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
              href="/fleet/settings?tab=alerts"
              className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Settings →
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading && !data ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <IoShieldOutline className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Unable to load security data</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {/* Failed Logins */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <IoWarningOutline className="w-3.5 h-3.5" />
                  <span>Failed (24h)</span>
                </div>
                <div className={`text-2xl font-bold ${data.stats.totalFailedLogins > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {data.stats.totalFailedLogins}
                </div>
              </div>

              {/* Blocked Attempts */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <IoBanOutline className="w-3.5 h-3.5" />
                  <span>Blocked</span>
                </div>
                <div className={`text-2xl font-bold ${data.stats.blockedAttempts > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {data.stats.blockedAttempts}
                </div>
              </div>

              {/* Unique IPs */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <IoShieldOutline className="w-3.5 h-3.5" />
                  <span>Unique IPs</span>
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {data.stats.uniqueIps}
                </div>
              </div>

              {/* Successful Logins */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
                  <span>Successful</span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.stats.successfulLogins}
                </div>
              </div>
            </div>

            {/* Threat Indicators */}
            {(data.stats.bruteForceAttempts > 0 || data.stats.accountsTargeted > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.stats.bruteForceAttempts > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                    <IoSkullOutline className="w-3.5 h-3.5" />
                    {data.stats.bruteForceAttempts} Brute Force Attack{data.stats.bruteForceAttempts > 1 ? 's' : ''}
                  </div>
                )}
                {data.stats.accountsTargeted > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                    <IoPersonOutline className="w-3.5 h-3.5" />
                    {data.stats.accountsTargeted} Account{data.stats.accountsTargeted > 1 ? 's' : ''} Targeted
                  </div>
                )}
              </div>
            )}

            {/* Failure Reasons */}
            {Object.keys(data.stats.byReason).length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Failure Reasons</h4>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(data.stats.byReason)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([reason, count]) => (
                      <span
                        key={reason}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                      >
                        {reasonLabels[reason] || reason}: {count}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Recent Events Toggle */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <button
                onClick={() => setShowEvents(!showEvents)}
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-full justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <IoTimeOutline className="w-3.5 h-3.5" />
                  Recent Security Events ({data.recentEvents.length})
                </span>
                <span>{showEvents ? '▲' : '▼'}</span>
              </button>

              {showEvents && data.recentEvents.length > 0 && (
                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                  {data.recentEvents.slice(0, 15).map(event => {
                    // Determine threat level color based on threatScore
                    const threatColor = event.threatScore > 80 ? 'red' :
                                       event.threatScore > 50 ? 'orange' :
                                       event.threatScore > 30 ? 'yellow' : 'gray'

                    return (
                      <div
                        key={event.id}
                        className={`text-xs p-3 rounded-lg ${
                          event.type === 'BRUTE_FORCE_DETECTED' ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800' :
                          event.type === 'ACCOUNT_TARGETED' ? 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' :
                          event.type === 'LOGIN_SUCCESS' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' :
                          event.blocked ? 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800' :
                          'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            {/* Top row: Email/Phone + Method badge */}
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              {event.type === 'BRUTE_FORCE_DETECTED' && <IoSkullOutline className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                              {event.type === 'ACCOUNT_TARGETED' && <IoPersonOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                              {event.type === 'LOGIN_FAILED' && <IoWarningOutline className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />}
                              {event.type === 'LOGIN_SUCCESS' && <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                              <span className="font-medium text-gray-900 dark:text-white truncate">
                                {event.phone || event.targetEmail}
                              </span>
                              {event.method === 'phone' && (
                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
                                  📱 PHONE
                                </span>
                              )}
                              {event.newDevice && (
                                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium">
                                  🆕 NEW DEVICE
                                </span>
                              )}
                            </div>

                            {/* Second row: IP + Location */}
                            <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap mb-1">
                              <span>IP: {event.sourceIp}</span>
                              {event.city && event.country && (
                                <span className="text-gray-400">• 📍 {event.city}, {event.country}</span>
                              )}
                              {event.zipCode && (
                                <span className="text-gray-400">• ZIP {event.zipCode}</span>
                              )}
                              {event.source && <span className="text-gray-400">• {event.source}</span>}
                            </div>

                            {/* Third row: ISP/ASN + Threat badges */}
                            {(event.isp || event.isVpn || event.isProxy || event.isTor || event.isBot) && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                {event.isp && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[10px]">
                                    🏢 {event.isp.substring(0, 30)}{event.isp.length > 30 ? '...' : ''}
                                  </span>
                                )}
                                {event.isVpn && (
                                  <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded text-[10px] font-medium">
                                    🔒 VPN
                                  </span>
                                )}
                                {event.isProxy && (
                                  <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded text-[10px] font-medium">
                                    🎭 PROXY
                                  </span>
                                )}
                                {event.isTor && (
                                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-[10px] font-medium">
                                    🧅 TOR
                                  </span>
                                )}
                                {event.isBot && (
                                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-[10px] font-medium">
                                    🤖 BOT ({event.botConfidence}%)
                                  </span>
                                )}
                                {event.isDatacenter && (
                                  <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded text-[10px] font-medium">
                                    🏗️ DATACENTER
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Fourth row: Risk/Threat score */}
                            {event.threatScore > 0 && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                                  Risk: {event.riskScore} • Bot: {event.botConfidence} •
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  threatColor === 'red' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                                  threatColor === 'orange' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                                  threatColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>
                                  ⚠️ THREAT: {event.threatScore}
                                </span>
                              </div>
                            )}

                            {/* Blocked indicator */}
                            {event.blocked && (
                              <div className="mt-1.5">
                                <span className="text-red-500 font-bold text-[10px]">🚫 BLOCKED</span>
                              </div>
                            )}
                          </div>

                          {/* Timestamp on the right */}
                          <span className="text-gray-400 whitespace-nowrap text-[10px]">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>

                        {/* Reason (if failed) */}
                        {event.reason && event.type === 'LOGIN_FAILED' && (
                          <div className="text-gray-600 dark:text-gray-300 text-[10px] mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                            Reason: {reasonLabels[event.reason] || event.reason}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {showEvents && data.recentEvents.length === 0 && (
                <div className="mt-3 text-center py-4 text-gray-400 dark:text-gray-500 text-xs">
                  No security events in the last 24 hours
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
