'use client'

interface Props {
  runningCount: number
  failedCount24h: number
  lastRefresh: Date | null
}

export default function CronStatusBanner({ runningCount, failedCount24h, lastRefresh }: Props) {
  const isHealthy = failedCount24h === 0
  const hasRunning = runningCount > 0

  return (
    <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${
      hasRunning
        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
        : isHealthy
          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${
          hasRunning
            ? 'bg-blue-500 animate-pulse'
            : isHealthy
              ? 'bg-green-500'
              : 'bg-red-500 animate-pulse'
        }`} />
        <span className={`text-sm font-medium ${
          hasRunning
            ? 'text-blue-800 dark:text-blue-200'
            : isHealthy
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
        }`}>
          {hasRunning
            ? `${runningCount} job${runningCount > 1 ? 's' : ''} running`
            : isHealthy
              ? 'All systems operational'
              : `${failedCount24h} failure${failedCount24h > 1 ? 's' : ''} in last 24h`
          }
        </span>
      </div>
      {lastRefresh && (
        <span className="text-xs text-gray-400">
          Updated {lastRefresh.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
