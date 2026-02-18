'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ─────────────────────────────────────────────────────────

interface SmsLog {
  id: string
  to: string
  from: string
  body: string
  status: string
  type: string
  twilioSid: string | null
  errorCode: string | null
  errorMessage: string | null
  locale: string
  segments: number
  bookingCode: string | null
  createdAt: string
  deliveredAt: string | null
}

interface CallLog {
  id: string
  direction: string
  from: string
  to: string
  callSid: string
  status: string
  duration: number | null
  recordingUrl: string | null
  transcription: string | null
  callerType: string | null
  callerId: string | null
  menuPath: string | null
  language: string
  bookingCode: string | null
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ─── Component ─────────────────────────────────────────────────────

export default function CommunicationsPage() {
  const [tab, setTab] = useState<'sms' | 'calls'>('sms')
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([])
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        key: 'phoenix-fleet-2847',
        tab,
        page: String(page),
        limit: '50',
      })
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/fleet/api/communications?${params}`)
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to fetch')
        return
      }

      if (tab === 'sms') {
        setSmsLogs(data.logs)
      } else {
        setCallLogs(data.logs)
      }
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (err) {
      setError('Failed to fetch communications data')
    } finally {
      setLoading(false)
    }
  }, [tab, typeFilter, statusFilter, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  const formatPhone = (p: string) => {
    if (p.length === 12 && p.startsWith('+1')) {
      return `(${p.slice(2, 5)}) ${p.slice(5, 8)}-${p.slice(8)}`
    }
    return p
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      received: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      ringing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      voicemail: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'no-answer': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
        {status}
      </span>
    )
  }

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      BOOKING_CONFIRMED: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      TRIP_STARTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      TRIP_ENDED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      BOOKING_CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      GUEST_APPROACHING: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      CLAIM_FILED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      MISSED_MESSAGE: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      EMERGENCY: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200',
      INBOUND: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
        {type.replace(/_/g, ' ')}
      </span>
    )
  }

  const SMS_TYPES = ['', 'BOOKING_CONFIRMED', 'TRIP_STARTED', 'TRIP_ENDED', 'BOOKING_CANCELLED', 'GUEST_APPROACHING', 'CLAIM_FILED', 'MISSED_MESSAGE', 'EMERGENCY', 'INBOUND']
  const SMS_STATUSES = ['', 'queued', 'sent', 'delivered', 'failed', 'received']
  const CALL_STATUSES = ['', 'ringing', 'in-progress', 'completed', 'voicemail', 'no-answer', 'failed']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">SMS logs, call logs, and voicemails</p>
        </div>
        <button
          onClick={() => fetchData(pagination.page)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setTab('sms'); setTypeFilter(''); setStatusFilter('') }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'sms'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          SMS Logs {stats.totalSms != null && `(${stats.totalSms})`}
        </button>
        <button
          onClick={() => { setTab('calls'); setTypeFilter(''); setStatusFilter('') }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'calls'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          Call Logs {stats.totalCalls != null && `(${stats.totalCalls})`}
        </button>
      </div>

      {/* Stats */}
      {tab === 'sms' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total SMS" value={stats.totalSms || 0} />
          <StatCard label="Delivered" value={stats.delivered || 0} color="green" />
          <StatCard label="Failed" value={stats.failed || 0} color="red" />
          <StatCard label="Inbound" value={stats.inbound || 0} color="purple" />
        </div>
      )}
      {tab === 'calls' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <StatCard label="Total Calls" value={stats.totalCalls || 0} />
          <StatCard label="Voicemails" value={stats.withVoicemail || 0} color="purple" />
          <StatCard label="Avg Duration" value={`${stats.avgDuration || 0}s`} color="blue" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search phone, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
        />
        {tab === 'sms' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {SMS_TYPES.map(t => (
              <option key={t} value={t}>{t || 'All Types'}</option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {(tab === 'sms' ? SMS_STATUSES : CALL_STATUSES).map(s => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : tab === 'sms' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">To</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Booking</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {smsLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No SMS logs found</td>
                  </tr>
                ) : smsLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{formatPhone(log.type === 'INBOUND' ? log.from : log.to)}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className={expandedRow === log.id ? '' : 'truncate'}>{log.body}</div>
                      {log.errorMessage && expandedRow === log.id && (
                        <div className="text-xs text-red-500 mt-1">Error: {log.errorMessage}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{typeBadge(log.type)}</td>
                    <td className="px-4 py-3">{statusBadge(log.status)}</td>
                    <td className="px-4 py-3">
                      {log.bookingCode && (
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{log.bookingCode}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">From</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Caller</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Voicemail</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Booking</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {callLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No call logs found</td>
                  </tr>
                ) : callLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{formatPhone(log.from)}</td>
                    <td className="px-4 py-3 text-xs">{log.duration ? `${log.duration}s` : '-'}</td>
                    <td className="px-4 py-3">{statusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-xs">
                      {log.callerType && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.callerType === 'guest' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          log.callerType === 'host' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {log.callerType}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.recordingUrl ? (
                        <div>
                          <audio
                            controls
                            src={log.recordingUrl}
                            className="h-8 w-40"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {expandedRow === log.id && log.transcription && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">&quot;{log.transcription}&quot;</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.bookingCode && (
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{log.bookingCode}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchData(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    blue: 'text-blue-600 dark:text-blue-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ? colorClasses[color] : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  )
}
