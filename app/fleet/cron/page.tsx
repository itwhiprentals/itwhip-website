'use client'

import { useState, useEffect } from 'react'

interface CronJob {
  id: string
  name: string
  description: string
  endpoint: string
  lastResult?: { status: string; processed?: number; error?: string }
  running: boolean
}

const CRON_JOBS: Omit<CronJob, 'lastResult' | 'running'>[] = [
  {
    id: 'expire-holds',
    name: 'Expire ON_HOLD Bookings',
    description: 'Marks ON_HOLD bookings as NO_SHOW when hold deadline + trip end date have passed. No refund issued.',
    endpoint: '/api/cron/expire-holds',
  },
  {
    id: 'release-deposits',
    name: 'Release Security Deposits',
    description: 'Releases deposits for completed trips after host review period (24h) or auto-approval.',
    endpoint: '/api/cron/release-deposits',
  },
  {
    id: 'full-cron',
    name: 'Run Full Cron Suite',
    description: 'Runs all cron jobs: monitoring, security, cleanup, reminders, expire claims, release deposits, expire holds.',
    endpoint: '/api/admin/system/cron',
  },
]

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>(
    CRON_JOBS.map(j => ({ ...j, running: false }))
  )
  const [cronSecret, setCronSecret] = useState<string | null>(null)

  // Fetch cron secret from server
  useEffect(() => {
    fetch('/api/fleet/cron-secret')
      .then(r => r.json())
      .then(d => setCronSecret(d.secret))
      .catch(() => setCronSecret(null))
  }, [])

  const runJob = async (jobId: string) => {
    if (!cronSecret) return

    setJobs(prev => prev.map(j =>
      j.id === jobId ? { ...j, running: true, lastResult: undefined } : j
    ))

    const job = jobs.find(j => j.id === jobId)
    if (!job) return

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

      setJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              running: false,
              lastResult: {
                status: result.success ? 'success' : 'failed',
                processed: result.processed ?? result.results?.length,
                error: result.error,
              },
            }
          : j
      ))
    } catch (error) {
      setJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              running: false,
              lastResult: {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            }
          : j
      ))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cron Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manually trigger scheduled tasks. These run automatically at midnight UTC daily.
        </p>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">{job.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                <code className="text-xs text-gray-400 mt-2 block">{job.endpoint}</code>
              </div>

              <button
                onClick={() => runJob(job.id)}
                disabled={job.running || !cronSecret}
                className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                  job.running
                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {job.running ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Running...
                  </span>
                ) : (
                  'Run Now'
                )}
              </button>
            </div>

            {/* Result */}
            {job.lastResult && (
              <div className={`mt-3 p-3 rounded-md text-sm ${
                job.lastResult.status === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
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
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Unable to load cron secret. Check fleet API authentication.
        </div>
      )}
    </div>
  )
}
