'use client'

import { useState } from 'react'
import MiniRunChart from './MiniRunChart'

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function CronCard({
  job,
  onTrigger,
}: {
  job: JobData
  onTrigger: (name: string) => Promise<void>
}) {
  const [triggering, setTriggering] = useState(false)

  const handleTrigger = async () => {
    setTriggering(true)
    try {
      await onTrigger(job.name)
    } finally {
      setTriggering(false)
    }
  }

  const statusColor = job.isRunning
    ? 'text-blue-500'
    : job.lastRun?.status === 'success'
      ? 'text-green-500'
      : job.lastRun?.status === 'error' || job.lastRun?.status === 'failed'
        ? 'text-red-500'
        : 'text-gray-400'

  const statusDot = job.isRunning
    ? 'bg-blue-500 animate-pulse'
    : job.lastRun?.status === 'success'
      ? 'bg-green-500'
      : job.lastRun?.status === 'error' || job.lastRun?.status === 'failed'
        ? 'bg-red-500'
        : 'bg-gray-300'

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: job.color }}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {job.label}
          </h3>
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${statusDot}`} />
      </div>

      {/* Schedule */}
      <p className="text-xs text-gray-400 mb-3">{job.schedule}</p>

      {/* Mini chart */}
      <div className="mb-3">
        <MiniRunChart runs={job.miniChart} />
      </div>

      {/* Last run info */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
        {job.lastRun ? (
          <>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${statusColor}`}>
                {job.isRunning ? 'Running...' : job.lastRun.status.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(job.lastRun.startedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{job.lastRun.processed} processed</span>
              {job.lastRun.durationMs != null && (
                <span>
                  {job.lastRun.durationMs > 1000
                    ? `${(job.lastRun.durationMs / 1000).toFixed(1)}s`
                    : `${job.lastRun.durationMs}ms`}
                </span>
              )}
            </div>
            {job.lastRun.error && (
              <p className="text-xs text-red-500 truncate" title={job.lastRun.error}>
                {job.lastRun.error}
              </p>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400">Never run</span>
        )}
      </div>

      {/* Trigger button */}
      <button
        onClick={handleTrigger}
        disabled={triggering || job.isRunning}
        className={`mt-3 w-full py-1.5 rounded text-xs font-medium transition-colors ${
          triggering || job.isRunning
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
        }`}
      >
        {triggering ? 'Triggering...' : job.isRunning ? 'Running...' : 'Run Now'}
      </button>
    </div>
  )
}
