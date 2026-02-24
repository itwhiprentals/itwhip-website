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
    id: 'full-cron',
    name: 'Run Full Cron Suite',
    description: 'Runs all cron jobs: monitoring, security, cleanup, reminders, expire claims, release deposits, expire holds.',
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
      updateJob(jobId, { previewing: false, previewData: result.items || [] })
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
      const response = await fetch(job.endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
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
    } catch (error) {
      updateJob(jobId, {
        running: false,
        lastResult: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      })
    }
  }

  const cancelPreview = (jobId: string) => {
    updateJob(jobId, { previewData: undefined })
  }

  const fmt = (iso: string | undefined | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cron Jobs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manually trigger scheduled tasks. These run automatically at midnight UTC daily.
        </p>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{job.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.description}</p>
                <code className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">{job.endpoint}</code>
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
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2.5 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {job.previewData.length === 0
                      ? 'No items found — nothing to process'
                      : `${job.previewData.length} booking${job.previewData.length !== 1 ? 's' : ''} will be affected`}
                  </p>
                </div>

                {job.previewData.length > 0 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                    {job.previewData.map((item, idx) => (
                      <div key={idx} className="px-4 py-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
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
                      disabled={job.running}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        job.running
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-wait'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {job.running ? (
                        <span className="flex items-center gap-2"><Spinner /> Running...</span>
                      ) : (
                        'Confirm & Run'
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
