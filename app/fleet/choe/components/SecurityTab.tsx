// app/fleet/choe/components/SecurityTab.tsx

'use client'

import { useState } from 'react'
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'
import type { ChoeSecurityResponse, SecurityEventSummary } from '../types'
import StatCard from './StatCard'
import SeverityBadge from './SeverityBadge'

interface SecurityTabProps {
  events: SecurityEventSummary[]
  stats: ChoeSecurityResponse['stats'] | null
}

export default function SecurityTab({ events, stats }: SecurityTabProps) {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventSummary | null>(null)

  return (
    <div className="space-y-6">
      {/* Threat Metrics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Rate Limits (Today)"
            value={stats.today.rateLimitHits}
            subtext={`${stats.week.rateLimitHits} this week`}
          />
          <StatCard
            label="Bots Blocked"
            value={stats.today.botsBlocked}
            subtext={`${stats.week.botsBlocked} this week`}
          />
          <StatCard
            label="Prompt Injections"
            value={stats.today.promptInjections}
            subtext={`${stats.week.promptInjections} this week`}
          />
          <StatCard
            label="Unique IPs"
            value={stats.today.uniqueIPs}
            subtext="flagged today"
          />
        </div>
      )}

      {/* Security Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Security Events</h3>
          <p className="text-xs text-gray-500 mt-1">Click on an event to see full details</p>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blocked</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map(event => (
              <tr
                key={event.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {event.eventType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={event.severity} />
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                  {event.ipAddress}
                </td>
                <td className="px-4 py-3">
                  {event.blocked ? (
                    <IoCloseCircle className="text-red-500 text-lg" />
                  ) : (
                    <IoCheckmarkCircle className="text-green-500 text-lg" />
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(event.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {selectedEvent.eventType.replace('_', ' ')} Event
                </h3>
                <SeverityBadge severity={selectedEvent.severity} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedEvent.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Information</h4>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">IP Address</dt>
                    <dd className="font-mono font-medium text-gray-900 dark:text-white">{selectedEvent.ipAddress}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Blocked</dt>
                    <dd className="flex items-center gap-2">
                      {selectedEvent.blocked ? (
                        <>
                          <IoCloseCircle className="text-red-500" />
                          <span className="text-red-600 dark:text-red-400 font-medium">Yes - Request blocked</span>
                        </>
                      ) : (
                        <>
                          <IoCheckmarkCircle className="text-green-500" />
                          <span className="text-green-600 dark:text-green-400 font-medium">No - Allowed through</span>
                        </>
                      )}
                    </dd>
                  </div>
                  {selectedEvent.visitorId && (
                    <div>
                      <dt className="text-gray-500">Visitor ID (Fingerprint)</dt>
                      <dd className="font-mono text-xs text-gray-900 dark:text-white">{selectedEvent.visitorId}</dd>
                    </div>
                  )}
                  {selectedEvent.sessionId && (
                    <div>
                      <dt className="text-gray-500">Session ID</dt>
                      <dd className="font-mono text-xs text-gray-900 dark:text-white">{selectedEvent.sessionId}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Details JSON */}
              {selectedEvent.details && Object.keys(selectedEvent.details).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Detection Details</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedEvent.details).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <dt className="text-xs font-medium text-gray-500 uppercase mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {typeof value === 'object' ? (
                            <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : typeof value === 'boolean' ? (
                            <span className={value ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                              {value ? 'Yes' : 'No'}
                            </span>
                          ) : (
                            <span className="break-all">{String(value)}</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON (collapsible) */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  View Raw JSON
                </summary>
                <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </details>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
