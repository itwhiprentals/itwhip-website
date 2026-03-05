'use client'

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

const JOB_LABELS: Record<string, string> = {
  'expire-holds': 'Expire Holds',
  'release-deposits': 'Release Deposits',
  'auto-complete': 'Auto-Complete',
  'pickup-reminder': 'Pickup Reminders',
  'return-reminder': 'Return Reminders',
  'expire-overdue-pickups': 'Expire Pickups',
  'noshow-detection': 'No-Show Detection',
  'payment-deadline': 'Payment Deadline',
  'host-acceptance-reminders': 'Host Acceptance',
  'master-cron': 'Master Cron',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function CronActivityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-400">No cron activity yet. Runs will appear here once cron jobs execute.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity Feed</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            {/* Status dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.status === 'success' ? 'bg-green-500'
                : item.status === 'running' ? 'bg-blue-500 animate-pulse'
                : 'bg-red-500'
            }`} />

            {/* Job name */}
            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-0 truncate" style={{ minWidth: '120px' }}>
              {JOB_LABELS[item.jobName] || item.jobName}
            </span>

            {/* Details */}
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-1 min-w-0">
              {item.status === 'running' ? (
                <span className="text-blue-500 font-medium">Running...</span>
              ) : (
                <>
                  <span>{item.processed} processed</span>
                  {item.failed > 0 && <span className="text-red-500">{item.failed} failed</span>}
                  {item.durationMs != null && (
                    <span className="text-gray-400">
                      {item.durationMs > 1000 ? `${(item.durationMs / 1000).toFixed(1)}s` : `${item.durationMs}ms`}
                    </span>
                  )}
                </>
              )}
              {item.triggeredBy !== 'cron' && (
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-[10px] uppercase">
                  {item.triggeredBy}
                </span>
              )}
            </div>

            {/* Error */}
            {item.error && (
              <span className="text-xs text-red-500 truncate max-w-[200px]" title={item.error}>
                {item.error}
              </span>
            )}

            {/* Time */}
            <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(item.startedAt)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
