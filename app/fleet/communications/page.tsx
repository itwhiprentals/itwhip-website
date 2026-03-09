'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ComposeModal,
  SmsTable, SmsLog,
  CallTable, CallLog,
  StatsGrid,
  SMS_TYPES, SMS_STATUSES, CALL_STATUSES,
} from './components'

// ─── Types ─────────────────────────────────────────────────────────

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
  const [stats, setStats] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Compose modal state
  const [composeOpen, setComposeOpen] = useState(false)
  const [composePhone, setComposePhone] = useState('')

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
    } catch {
      setError('Failed to fetch communications data')
    } finally {
      setLoading(false)
    }
  }, [tab, typeFilter, statusFilter, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCompose = (phone = '') => {
    setComposePhone(phone)
    setComposeOpen(true)
  }

  const quickSend = async (phone: string, message: string) => {
    try {
      const res = await fetch('/fleet/api/communications?key=phoenix-fleet-2847', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, body: message }),
      })
      const data = await res.json()
      return data.success
    } catch {
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">SMS logs, call logs, and voicemails</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => openCompose()}
            className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium"
          >
            New SMS
          </button>
          <button
            onClick={() => fetchData(pagination.page)}
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
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
      <StatsGrid tab={tab} stats={stats} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
        <input
          type="text"
          placeholder="Search phone, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-64"
        />
        {tab === 'sms' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1 sm:flex-none"
          >
            {SMS_TYPES.map(t => (
              <option key={t} value={t}>{t ? t.replace(/_/g, ' ') : 'All Types'}</option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1 sm:flex-none"
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
          <SmsTable
            logs={smsLogs}
            expandedRow={expandedRow}
            onToggleRow={(id) => setExpandedRow(expandedRow === id ? null : id)}
            onReply={(phone) => openCompose(phone)}
          />
        ) : (
          <CallTable
            logs={callLogs}
            expandedRow={expandedRow}
            onToggleRow={(id) => setExpandedRow(expandedRow === id ? null : id)}
            onText={(phone) => openCompose(phone)}
            onQuickSend={quickSend}
          />
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

      {/* Compose Modal */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        initialPhone={composePhone}
        onSent={() => { if (tab === 'sms') fetchData(1) }}
      />
    </div>
  )
}
