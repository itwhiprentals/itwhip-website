// app/fleet/monitoring/components/SecurityEventsCard.tsx
// Displays recent security events with severity indicators

'use client'

import { useState } from 'react'
import {
  IoShieldOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoLocationOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface SecurityEvent {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ip: string
  location: string
  message: string
  action: string
  blocked: boolean
  timestamp: string
}

interface SecuritySummary {
  totalEvents: number
  byType: Record<string, number>
  criticalCount: number
  highCount: number
  blockedCount: number
}

interface Props {
  events: SecurityEvent[]
  summary: SecuritySummary
  loading?: boolean
}

const severityConfig = {
  CRITICAL: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: IoCloseCircleOutline
  },
  HIGH: {
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    icon: IoWarningOutline
  },
  MEDIUM: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: IoWarningOutline
  },
  LOW: {
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: IoCheckmarkCircleOutline
  }
}

const eventTypeLabels: Record<string, string> = {
  'login_failure': 'Failed Login',
  'rate_limit': 'Rate Limited',
  'suspicious_activity': 'Suspicious Activity',
  'account_lockout': 'Account Locked',
  'password_reset': 'Password Reset',
  'brute_force': 'Brute Force',
  'sql_injection': 'SQL Injection',
  'xss_attempt': 'XSS Attempt'
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function SecurityEventsCard({ events, summary, loading }: Props) {
  const [expanded, setExpanded] = useState(false)
  const displayEvents = expanded ? events : events.slice(0, 5)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IoShieldOutline className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Security Events
          </h3>
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            24h
          </span>
        </div>
        <div className="flex items-center gap-2">
          {summary.criticalCount > 0 && (
            <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded-full font-medium">
              {summary.criticalCount} Critical
            </span>
          )}
          {summary.highCount > 0 && (
            <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full font-medium">
              {summary.highCount} High
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {summary.totalEvents}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Events</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-red-500">
            {summary.blockedCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Blocked</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-500">
            {summary.totalEvents - summary.blockedCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Allowed</p>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <IoShieldOutline className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No security events in the last 24 hours</p>
          <p className="text-xs mt-1">Your system is running smoothly</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayEvents.map(event => {
            const config = severityConfig[event.severity]
            const Icon = config.icon

            return (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {eventTypeLabels[event.type] || event.type}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                          {event.severity}
                        </span>
                        {event.blocked && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {event.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <IoLocationOutline className="w-3 h-3" />
                          {event.ip} • {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IoTimeOutline className="w-3 h-3" />
                          {formatTimeAgo(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Show More/Less Toggle */}
      {events.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2 text-sm text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>Show Less <IoChevronUpOutline className="w-4 h-4" /></>
          ) : (
            <>Show {events.length - 5} More <IoChevronDownOutline className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  )
}
