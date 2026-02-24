'use client'

import { useState, useEffect } from 'react'

interface PreviewItem {
  bookingCode: string
  guestName: string
  car: string
  action: string
  totalAmount?: number
  netRelease?: number
  holdReason?: string
  holdDeadline?: string
  startDate?: string
  endDate?: string
  tripEndedAt?: string
  reviewStatus?: string
  depositAmount?: number
  host?: string
}

interface CronJob {
  id: string
  name: string
  description: string
  endpoint: string
  supportsPreview: boolean
  lastResult?: { status: string; processed?: number; error?: string }
  running: boolean
  previewing: boolean
  previewData?: PreviewItem[]
}

const CRON_JOBS: Omit<CronJob, 'lastResult' | 'running' | 'previewing' | 'previewData'>[] = [
  {
    id: 'expire-holds',
    name: 'Expire ON_HOLD Bookings',
    description: 'Marks ON_HOLD bookings as NO_SHOW when hold deadline + trip end date have passed. No refund issued.',
    endpoint: '/api/cron/expire-holds',
    supportsPreview: true,
  },
  {
    id: 'release-deposits',
    name: 'Release Security Deposits',
    description: 'Releases deposits for completed trips after host review period (24h) or auto-approval.',
    endpoint: '/api/cron/release-deposits',
    supportsPreview: true,
  },
  {
    id: 'auto-complete',
    name: 'Auto-Complete Overdue Bookings',
    description: 'Completes any PENDING, CONFIRMED, ON_HOLD, or ACTIVE bookings past their end date. No booking can remain live past endDate.',
    endpoint: '/api/cron/auto-complete',
    supportsPreview: true,
  },
  {
    id: 'pickup-reminder',
    name: 'Pickup Reminders',
    description: 'Sends SMS + email + bell reminder to guests with CONFIRMED bookings starting in ~24h.',
    endpoint: '/api/cron/pickup-reminder',
    supportsPreview: true,
  },
  {
    id: 'return-reminder',
    name: 'Return Reminders',
    description: 'Sends SMS + email + bell reminder to guests with ACTIVE bookings ending in ~24h or ~3h.',
    endpoint: '/api/cron/return-reminder',
    supportsPreview: true,
  },
  {
    id: 'full-cron',
    name: 'Run Full Cron Suite',
    description: 'Runs all cron jobs: monitoring, security, cleanup, reminders, expire claims, release deposits, expire holds, auto-complete, pickup/return reminders.',
    endpoint: '/api/admin/system/cron',
    supportsPreview: false,
  },
]

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>(
    CRON_JOBS.map(j => ({ ...j, running: false, previewing: false }))
  )
  const [cronSecret, setCronSecret] = useState<string | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    CRON_JOBS.forEach(j => { initial[j.id] = j.id !== 'full-cron' })
    return initial
  })
  const [runningSelected, setRunningSelected] = useState(false)
  const [selectedResults, setSelectedResults] = useState<Array<{ id: string; name: string; status: string; processed?: number; error?: string }>>([])
  // Per-item selection within previews: jobId → bookingCode → selected
  const [previewSelected, setPreviewSelected] = useState<Record<string, Record<string, boolean>>>({})

  useEffect(() => {
    fetch('/api/fleet/cron-secret')
      .then(r => r.json())
      .then(d => setCronSecret(d.secret))
      .catch(() => setCronSecret(null))
  }, [])

  const updateJob = (jobId: string, updates: Partial<CronJob>) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j))
  }

  const previewJob = async (jobId: string) => {
    if (!cronSecret) return
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    updateJob(jobId, { previewing: true, previewData: undefined, lastResult: undefined })

    try {
      const response = await fetch(`${job.endpoint}?preview=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
      })
      const result = await response.json()
      const items: PreviewItem[] = result.items || []
      updateJob(jobId, { previewing: false, previewData: items })
      // Auto-select all preview items
      const sel: Record<string, boolean> = {}
      items.forEach(item => { sel[item.bookingCode] = true })
      setPreviewSelected(prev => ({ ...prev, [jobId]: sel }))
    } catch (error) {
      updateJob(jobId, {
        previewing: false,
        lastResult: { status: 'error', error: error instanceof Error ? error.message : 'Preview failed' },
      })
    }
  }

  const confirmRun = async (jobId: string) => {
    if (!cronSecret) return
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    updateJob(jobId, { running: true })

    try {
      const method = job.endpoint.includes('/admin/system/cron') ? 'GET' : 'POST'
      // Build body with selected booking codes (if preview had items selected)
      const itemSel = previewSelected[jobId]
      const selectedCodes = itemSel
        ? Object.entries(itemSel).filter(([, v]) => v).map(([code]) => code)
        : undefined
      const body = selectedCodes?.length ? JSON.stringify({ bookingCodes: selectedCodes }) : undefined
      const response = await fetch(job.endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
        ...(method === 'POST' && body ? { body } : {}),
      })
      const result = await response.json()
      updateJob(jobId, {
        running: false,
        previewData: undefined,
        lastResult: {
          status: result.success ? 'success' : 'failed',
          processed: result.processed ?? result.summary?.released ?? result.results?.length,
          error: result.error,
        },
      })
      setPreviewSelected(prev => { const next = { ...prev }; delete next[jobId]; return next })
    } catch (error) {
      updateJob(jobId, {
        running: false,
        lastResult: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      })
    }
  }

  const cancelPreview = (jobId: string) => {
    updateJob(jobId, { previewData: undefined })
    setPreviewSelected(prev => { const next = { ...prev }; delete next[jobId]; return next })
  }

  // Preview item selection helpers
  const togglePreviewItem = (jobId: string, bookingCode: string) => {
    setPreviewSelected(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], [bookingCode]: !prev[jobId]?.[bookingCode] }
    }))
  }

  const selectAllPreviewItems = (jobId: string, items: PreviewItem[]) => {
    const sel: Record<string, boolean> = {}
    items.forEach(item => { sel[item.bookingCode] = true })
    setPreviewSelected(prev => ({ ...prev, [jobId]: sel }))
  }

  const selectNonePreviewItems = (jobId: string) => {
    setPreviewSelected(prev => ({ ...prev, [jobId]: {} }))
  }

  const getPreviewSelectedCount = (jobId: string) => {
    const sel = previewSelected[jobId]
    return sel ? Object.values(sel).filter(Boolean).length : 0
  }

  const toggleSelect = (jobId: string) => {
    setSelected(prev => ({ ...prev, [jobId]: !prev[jobId] }))
  }

  const selectAll = () => {
    setSelected(prev => {
      const next = { ...prev }
      CRON_JOBS.forEach(j => { if (j.id !== 'full-cron') next[j.id] = true })
      return next
    })
  }

  const selectNone = () => {
    setSelected(prev => {
      const next = { ...prev }
      CRON_JOBS.forEach(j => { next[j.id] = false })
      return next
    })
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  const runSelected = async () => {
    if (!cronSecret || runningSelected) return
    const toRun = jobs.filter(j => selected[j.id] && j.id !== 'full-cron')
    if (toRun.length === 0) return

    setRunningSelected(true)
    setSelectedResults([])
    const results: typeof selectedResults = []

    for (const job of toRun) {
      updateJob(job.id, { running: true })
      try {
        const response = await fetch(job.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cronSecret}`,
          },
        })
        const result = await response.json()
        const processed = result.processed ?? result.summary?.released ?? result.results?.length ?? 0
        updateJob(job.id, {
          running: false,
          previewData: undefined,
          lastResult: { status: result.success ? 'success' : 'failed', processed, error: result.error },
        })
        results.push({ id: job.id, name: job.name, status: result.success ? 'success' : 'failed', processed })
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        updateJob(job.id, { running: false, lastResult: { status: 'error', error: errMsg } })
        results.push({ id: job.id, name: job.name, status: 'error', error: errMsg })
      }
    }

    setSelectedResults(results)
    setRunningSelected(false)
  }

  const fmt = (iso: string | undefined | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cron Jobs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manually trigger scheduled tasks. Select which jobs to run, or preview individually.
        </p>
      </div>

      {/* Run Selected Bar */}
      <div className="mb-4 flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCount} job{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button onClick={selectAll} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">All</button>
          <button onClick={selectNone} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">None</button>
        </div>
        <button
          onClick={runSelected}
          disabled={runningSelected || selectedCount === 0 || !cronSecret}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            runningSelected || selectedCount === 0
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {runningSelected ? (
            <span className="flex items-center gap-2"><Spinner /> Running {selectedCount} jobs...</span>
          ) : (
            `Run Selected (${selectedCount})`
          )}
        </button>
      </div>

      {/* Selected Run Summary */}
      {selectedResults.length > 0 && (
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Batch Run Results</h3>
            <button onClick={() => setSelectedResults([])} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
          </div>
          <div className="space-y-1">
            {selectedResults.map(r => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <span className={r.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {r.status === 'success' ? '✓' : '✗'}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{r.name}</span>
                {r.processed != null && (
                  <span className="text-gray-400 text-xs">({r.processed} processed)</span>
                )}
                {r.error && (
                  <span className="text-red-500 text-xs">{r.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {job.id !== 'full-cron' && (
                  <input
                    type="checkbox"
                    checked={!!selected[job.id]}
                    onChange={() => toggleSelect(job.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{job.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.description}</p>
                  <code className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">{job.endpoint}</code>
                </div>
              </div>

              {/* Action buttons */}
              {!job.previewData && (
                <button
                  onClick={() => job.supportsPreview ? previewJob(job.id) : confirmRun(job.id)}
                  disabled={job.running || job.previewing || !cronSecret}
                  className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                    job.running || job.previewing
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {job.running ? (
                    <span className="flex items-center gap-2"><Spinner /> Running...</span>
                  ) : job.previewing ? (
                    <span className="flex items-center gap-2"><Spinner /> Loading...</span>
                  ) : job.supportsPreview ? (
                    'Preview'
                  ) : (
                    'Run Now'
                  )}
                </button>
              )}
            </div>

            {/* Preview Panel */}
            {job.previewData && (
              <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2.5 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {job.previewData.length === 0
                      ? 'No items found — nothing to process'
                      : `${getPreviewSelectedCount(job.id)} of ${job.previewData.length} selected`}
                  </p>
                  {job.previewData.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllPreviewItems(job.id, job.previewData!)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        All
                      </button>
                      <button
                        onClick={() => selectNonePreviewItems(job.id)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                      >
                        None
                      </button>
                    </div>
                  )}
                </div>

                {job.previewData.length > 0 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                    {job.previewData.map((item, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                          previewSelected[job.id]?.[item.bookingCode]
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-gray-50/50 dark:bg-gray-800/50 opacity-60'
                        }`}
                        onClick={() => togglePreviewItem(job.id, item.bookingCode)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={!!previewSelected[job.id]?.[item.bookingCode]}
                              onChange={() => togglePreviewItem(job.id, item.bookingCode)}
                              onClick={e => e.stopPropagation()}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-xs font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                                {item.bookingCode}
                              </code>
                              <span className="text-gray-500 dark:text-gray-400">{item.guestName}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{item.car}</p>
                            {item.holdReason && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Hold: {item.holdReason} — deadline {fmt(item.holdDeadline)}
                              </p>
                            )}
                            {item.startDate && item.endDate && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Trip: {fmt(item.startDate)} – {fmt(item.endDate)}
                              </p>
                            )}
                            {item.tripEndedAt && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Trip ended: {fmt(item.tripEndedAt)} — Review: {item.reviewStatus || 'n/a'}
                              </p>
                            )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {item.totalAmount != null && (
                              <p className="text-sm font-medium text-gray-900 dark:text-white">${item.totalAmount.toFixed(2)}</p>
                            )}
                            {item.netRelease != null && (
                              <p className="text-sm font-medium text-green-700 dark:text-green-400">${item.netRelease.toFixed(2)}</p>
                            )}
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{item.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirm / Cancel buttons */}
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-end gap-3">
                  <button
                    onClick={() => cancelPreview(job.id)}
                    disabled={job.running}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  {job.previewData.length > 0 && (
                    <button
                      onClick={() => confirmRun(job.id)}
                      disabled={job.running || getPreviewSelectedCount(job.id) === 0}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        job.running || getPreviewSelectedCount(job.id) === 0
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {job.running ? (
                        <span className="flex items-center gap-2"><Spinner /> Running...</span>
                      ) : (
                        `Confirm & Run (${getPreviewSelectedCount(job.id)})`
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {job.lastResult && (
              <div className={`mt-3 p-3 rounded-md text-sm ${
                job.lastResult.status === 'success'
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                {job.lastResult.status === 'success' ? (
                  <span>
                    ✓ Completed — {job.lastResult.processed ?? 0} item{job.lastResult.processed !== 1 ? 's' : ''} processed
                  </span>
                ) : (
                  <span>✗ Failed — {job.lastResult.error || 'Unknown error'}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!cronSecret && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
          Unable to load cron secret. Check fleet API authentication.
        </div>
      )}
    </div>
  )
}
