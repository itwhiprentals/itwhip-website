// app/partner/dashboard/components/SessionSecurityCard.tsx
// Session, Security, and API info card for partner dashboard

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoPersonOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoKeyOutline,
  IoDesktopOutline,
  IoPhonePortraitOutline,
  IoGlobeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoLockClosedOutline,
  IoServerOutline,
  IoEllipsisHorizontalOutline,
  IoListOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

interface SessionInfo {
  user: {
    id: string
    name: string
    email: string
    companyName: string | null
    hostType: string | null
    profilePhoto: string | null
    memberSince: string | null
    lastLogin: string | null
    isActive: boolean
  }
  currentSession: {
    ip: string
    userAgent: string
    browser: string
    os: string
    deviceType: string
    startedAt: string
  }
  security: {
    score: number
    emailVerified: boolean
    phoneVerified: boolean
    identityVerified: boolean
    stripeConnected: boolean
    activeSessions: number
    recentLogins: Array<{
      id: string
      action: string
      timestamp: string
      ip: string
      device: string
    }>
  }
  api: {
    hasApiAccess: boolean
    activeKeys: number
    keys: Array<{
      id: string
      name: string
      lastUsed: string | null
      createdAt: string
      expiresAt: string | null
    }>
  }
  auditLog: Array<{
    id: string
    action: string
    entityType: string | null
    category: string | null
    timestamp: string
    ip: string
    oldValue: string | null
    newValue: string | null
  }>
}

export default function SessionSecurityCard() {
  const [data, setData] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'session' | 'security' | 'api' | 'audit'>('session')

  useEffect(() => {
    fetchSessionInfo()
  }, [])

  const fetchSessionInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/partner/session-info', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch session info')
      }

      const result = await response.json()
      if (result.success) {
        setData(result)
      } else {
        throw new Error(result.error || 'Failed to load')
      }
    } catch (err) {
      console.error('Session info fetch error:', err)
      setError('Unable to load session info')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const getSecurityColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSecurityBgColor = (score: number) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-4">
          <IoShieldCheckmarkOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'Unable to load'}</p>
          <button
            onClick={fetchSessionInfo}
            className="mt-2 text-sm text-orange-600 hover:text-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.user.profilePhoto ? (
              <Image
                src={data.user.profilePhoto}
                alt={data.user.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <IoPersonOutline className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {data.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={fetchSessionInfo}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IoRefreshOutline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('session')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'session'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <IoDesktopOutline className="w-4 h-4 inline-block mr-1.5" />
          Session
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'security'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <IoShieldCheckmarkOutline className="w-4 h-4 inline-block mr-1.5" />
          Security
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'api'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <IoKeyOutline className="w-4 h-4 inline-block mr-1.5" />
          API
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'audit'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <IoListOutline className="w-4 h-4 inline-block mr-1.5" />
          Audit
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Session Tab */}
        {activeTab === 'session' && (
          <div className="space-y-4">
            {/* Current Session */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Current Session
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    {data.currentSession.deviceType === 'Mobile' ? (
                      <IoPhonePortraitOutline className="w-4 h-4" />
                    ) : (
                      <IoDesktopOutline className="w-4 h-4" />
                    )}
                    <span>Device</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.currentSession.deviceType} ({data.currentSession.os})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <IoGlobeOutline className="w-4 h-4" />
                    <span>Browser</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.currentSession.browser}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <IoServerOutline className="w-4 h-4" />
                    <span>IP Address</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {data.currentSession.ip}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Login */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Activity
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <IoTimeOutline className="w-4 h-4" />
                    <span>Last Login</span>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatRelativeTime(data.user.lastLogin)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <IoLockClosedOutline className="w-4 h-4" />
                    <span>Active Sessions</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.security.activeSessions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Security Score */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Security Score</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Complete your profile to improve</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getSecurityColor(data.security.score)}`}>
                  {data.security.score}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getSecurityBgColor(data.security.score)} transition-all duration-500`}
                style={{ width: `${data.security.score}%` }}
              ></div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-2">
              {/* Email Verified */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Email Verified</span>
                <div className="flex items-center gap-2">
                  {data.security.emailVerified ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                  ) : (
                    <>
                      <Link
                        href="/partner/settings?tab=profile&verify=email"
                        className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        Verify
                      </Link>
                      <IoCloseCircleOutline className="w-5 h-5 text-red-400" />
                    </>
                  )}
                </div>
              </div>

              {/* Phone Verified */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Phone Verified</span>
                <div className="flex items-center gap-2">
                  {data.security.phoneVerified ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                  ) : (
                    <>
                      <Link
                        href="/partner/settings?tab=profile&verify=phone"
                        className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        Verify
                      </Link>
                      <IoCloseCircleOutline className="w-5 h-5 text-red-400" />
                    </>
                  )}
                </div>
              </div>

              {/* Identity Verified */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Identity Verified</span>
                <div className="flex items-center gap-2">
                  {data.security.identityVerified ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                  ) : (
                    <>
                      <Link
                        href="/partner/settings?tab=documents&verify=identity"
                        className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        Verify
                      </Link>
                      <IoCloseCircleOutline className="w-5 h-5 text-red-400" />
                    </>
                  )}
                </div>
              </div>

              {/* Stripe Connected */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Stripe Connected</span>
                <div className="flex items-center gap-2">
                  {data.security.stripeConnected ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                  ) : (
                    <>
                      <Link
                        href="/partner/settings?tab=banking"
                        className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        Connect
                      </Link>
                      <IoCloseCircleOutline className="w-5 h-5 text-red-400" />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Logins */}
            {data.security.recentLogins.length > 0 && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Recent Activity
                </p>
                <div className="space-y-2">
                  {data.security.recentLogins.slice(0, 3).map(login => (
                    <div key={login.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        {login.device === 'Mobile' ? (
                          <IoPhonePortraitOutline className="w-4 h-4 text-gray-400" />
                        ) : (
                          <IoDesktopOutline className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-gray-600 dark:text-gray-300">{login.action}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(login.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            {data.api.hasApiAccess ? (
              <>
                {/* API Status */}
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      API Access Enabled
                    </span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {data.api.activeKeys} active key{data.api.activeKeys !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* API Keys */}
                {data.api.keys.length > 0 && (
                  <div className="space-y-2">
                    {data.api.keys.map(key => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last used: {key.lastUsed ? formatRelativeTime(key.lastUsed) : 'Never'}
                          </p>
                        </div>
                        <IoEllipsisHorizontalOutline className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/partner/settings/api"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <IoKeyOutline className="w-4 h-4" />
                  Manage API Keys
                </Link>
              </>
            ) : (
              <div className="text-center py-6">
                <IoKeyOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  No API access configured
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  Contact support to enable API access for your account
                </p>
                <Link
                  href="/contact"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  Request API Access
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Activity Log
              </p>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Last 20 events
              </span>
            </div>

            {data.auditLog && data.auditLog.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.auditLog.map(log => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <IoDocumentTextOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {log.entityType && (
                        <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
                          {log.entityType}
                        </span>
                      )}
                      {log.category && (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                          {log.category}
                        </span>
                      )}
                      <span className="font-mono">{log.ip}</span>
                    </div>
                    {(log.oldValue || log.newValue) && (
                      <div className="mt-1.5 text-xs">
                        {log.oldValue && (
                          <span className="text-red-600 dark:text-red-400 mr-2">
                            - {log.oldValue.substring(0, 30)}{log.oldValue.length > 30 ? '...' : ''}
                          </span>
                        )}
                        {log.newValue && (
                          <span className="text-green-600 dark:text-green-400">
                            + {log.newValue.substring(0, 30)}{log.newValue.length > 30 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <IoListOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No activity recorded yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Actions like settings changes, logins, and more will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <Link
          href="/partner/settings"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Account Settings
          <IoChevronForwardOutline className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
