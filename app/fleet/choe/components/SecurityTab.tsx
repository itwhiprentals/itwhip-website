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
  apiKey: string
}

export default function SecurityTab({ events, stats, apiKey }: SecurityTabProps) {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventSummary | null>(null)
  const [terminating, setTerminating] = useState(false)
  const [terminateResult, setTerminateResult] = useState<string | null>(null)
  const [terminatingAll, setTerminatingAll] = useState(false)
  const [terminateAllResult, setTerminateAllResult] = useState<string | null>(null)
  const [disablingChoe, setDisablingChoe] = useState(false)

  const terminateAllSessions = async () => {
    if (!confirm('DEFCON: Terminate ALL active Choé sessions? This will immediately block every ongoing conversation.')) return
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return
    setTerminatingAll(true)
    setTerminateAllResult(null)
    try {
      const res = await fetch(`/fleet/api/choe/conversations/terminate-all?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'DEFCON emergency termination' }),
      })
      if (res.ok) {
        const data = await res.json()
        setTerminateAllResult(`${data.terminated} sessions terminated`)
      } else {
        setTerminateAllResult('Failed to terminate sessions')
      }
    } catch {
      setTerminateAllResult('Network error')
    } finally {
      setTerminatingAll(false)
    }
  }

  const disableChoe = async () => {
    if (!confirm('DEFCON: Disable Choé completely? No new conversations will be allowed until re-enabled in Settings.')) return
    setDisablingChoe(true)
    try {
      await fetch(`/fleet/api/choe?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false, updatedBy: 'fleet-admin-defcon' }),
      })
      // Also terminate all active
      await fetch(`/fleet/api/choe/conversations/terminate-all?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'DEFCON: Choé disabled + all sessions terminated' }),
      })
      setTerminateAllResult('Choé disabled and all sessions terminated')
    } catch {
      setTerminateAllResult('Failed to disable Choé')
    } finally {
      setDisablingChoe(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    if (!confirm('Terminate this session? The user will be blocked from continuing.')) return
    setTerminating(true)
    setTerminateResult(null)
    try {
      // First find the conversation by sessionId
      const listRes = await fetch(`/fleet/api/choe/conversations?key=${apiKey}&search=${sessionId}&limit=1`)
      if (!listRes.ok) { setTerminateResult('Failed to find conversation'); return }
      const listData = await listRes.json()
      const conv = listData.data?.[0]
      if (!conv) { setTerminateResult('Conversation not found'); return }
      if (conv.outcome === 'BLOCKED') { setTerminateResult('Already terminated'); return }

      const res = await fetch(`/fleet/api/choe/conversations/${conv.id}/terminate?key=${apiKey}`, { method: 'POST' })
      if (res.ok) {
        setTerminateResult('Session terminated')
      } else {
        const err = await res.json()
        setTerminateResult(err.error || 'Failed to terminate')
      }
    } catch {
      setTerminateResult('Network error')
    } finally {
      setTerminating(false)
    }
  }

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

      {/* DEFCON Controls */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-400">Emergency Controls</h3>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
              Use these in case of a coordinated attack or abuse
            </p>
          </div>
          <div className="flex items-center gap-3">
            {terminateAllResult && (
              <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                {terminateAllResult}
              </span>
            )}
            <button
              onClick={terminateAllSessions}
              disabled={terminatingAll || disablingChoe}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              {terminatingAll ? 'Terminating...' : 'Terminate All Sessions'}
            </button>
            <button
              onClick={disableChoe}
              disabled={disablingChoe || terminatingAll}
              className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950 disabled:opacity-50 text-sm font-medium"
            >
              {disablingChoe ? 'Disabling...' : 'Disable Choé + Kill All'}
            </button>
          </div>
        </div>
      </div>

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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div className="flex items-center gap-3">
                {selectedEvent.sessionId && (
                  <button
                    onClick={() => terminateSession(selectedEvent.sessionId!)}
                    disabled={terminating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    {terminating ? 'Terminating...' : 'Terminate Session'}
                  </button>
                )}
                {terminateResult && (
                  <span className={`text-sm ${terminateResult.includes('terminated') ? 'text-green-600' : 'text-red-500'}`}>
                    {terminateResult}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setSelectedEvent(null); setTerminateResult(null) }}
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
