// app/fleet/analytics/components/VisitorProfile/SecurityEvents.tsx
// Login attempts + security events for this IP

'use client'

import { SecurityEventEntry } from '../shared/types'
import TimeAgo from '../shared/TimeAgo'

interface SecurityEventsProps {
  events: SecurityEventEntry[]
  loginAttempts: {
    id: string
    identifier: string
    success: boolean
    reason: string | null
    timestamp: string
  }[]
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function SecurityEvents({ events, loginAttempts }: SecurityEventsProps) {
  const hasData = events.length > 0 || loginAttempts.length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Security Events</h3>
        <span className="text-xs text-gray-400">
          {events.length} events &middot; {loginAttempts.length} logins
        </span>
      </div>

      {!hasData ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No security events from this IP
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[350px] overflow-y-auto">
          {/* Login attempts */}
          {loginAttempts.map(l => (
            <div key={l.id} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${l.success ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {l.success ? 'Login success' : 'Login failed'}
                </span>
                <span className="text-xs text-gray-400 font-mono">{l.identifier}</span>
                {l.reason && <span className="text-[10px] text-red-500">{l.reason}</span>}
              </div>
              <TimeAgo timestamp={l.timestamp} />
            </div>
          ))}

          {/* Security events */}
          {events.map(e => (
            <div key={e.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${SEVERITY_COLORS[e.severity] || SEVERITY_COLORS.LOW}`}>
                    {e.severity}
                  </span>
                  <span className="text-xs font-mono text-gray-500">{e.type}</span>
                  {e.blocked && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded font-semibold">BLOCKED</span>
                  )}
                </div>
                <TimeAgo timestamp={e.timestamp} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{e.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
