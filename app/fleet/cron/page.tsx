'use client'

import { useState, useEffect, useCallback } from 'react'
import CronStatusBanner from './components/CronStatusBanner'
import CronStatsBar from './components/CronStatsBar'
import CronCard from './components/CronCard'
import CronActivityFeed from './components/CronActivityFeed'

interface JobData {
  name: string
  label: string
  schedule: string
  color: string
  isRunning: boolean
  lastRun: {
    id: string
    status: string
    startedAt: string
    completedAt: string | null
    durationMs: number | null
    processed: number
    failed: number
    error: string | null
    triggeredBy: string
  } | null
  miniChart: Array<{
    status: string
    durationMs: number
    processed: number
    startedAt: string
  }>
}

interface Stats {
  totalRuns24h: number
  successRuns24h: number
  failedRuns24h: number
  totalProcessed24h: number
  avgDuration24h: number
  runningCount: number
}

interface FeedItem {
  id: string
  jobName: string
  status: string
  startedAt: string
  completedAt: string | null
  durationMs: number | null
  processed: number
  failed: number
  error: string | null
  triggeredBy: string
}

interface DashboardData {
  stats: Stats
  jobs: JobData[]
  activityFeed: FeedItem[]
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

export default function CronDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [triggerResult, setTriggerResult] = useState<{ name: string; success: boolean; message: string } | null>(null)

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const res = await fetch('/api/fleet/cron')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => fetchData(false), 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  const handleTrigger = async (jobName: string) => {
    try {
      const res = await fetch(`/api/fleet/cron/${jobName}/trigger`, { method: 'POST' })
      const json = await res.json()
      setTriggerResult({
        name: jobName,
        success: json.success,
        message: json.success
          ? `${jobName} triggered — ${json.result?.processed ?? json.result?.result?.processed ?? 0} processed`
          : json.error || 'Failed',
      })
      // Refresh data after trigger
      setTimeout(() => fetchData(false), 1000)
      // Auto-dismiss after 5s
      setTimeout(() => setTriggerResult(null), 5000)
    } catch (err) {
      setTriggerResult({
        name: jobName,
        success: false,
        message: err instanceof Error ? err.message : 'Trigger failed',
      })
    }
  }

  if (loading && !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-500">
          <Spinner />
          <span>Loading cron dashboard...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
          Failed to load cron data: {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cron Monitoring</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time operations center — all scheduled tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => fetchData(false)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Trigger result toast */}
      {triggerResult && (
        <div className={`rounded-lg px-4 py-3 text-sm flex items-center justify-between ${
          triggerResult.success
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          <span>{triggerResult.message}</span>
          <button onClick={() => setTriggerResult(null)} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Status Banner */}
      <CronStatusBanner
        runningCount={data.stats.runningCount}
        failedCount24h={data.stats.failedRuns24h}
        lastRefresh={lastRefresh}
      />

      {/* Stats Bar */}
      <CronStatsBar stats={data.stats} />

      {/* Cron Cards Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Cron Jobs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.jobs.map(job => (
            <CronCard key={job.name} job={job} onTrigger={handleTrigger} />
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <CronActivityFeed items={data.activityFeed} />
    </div>
  )
}
