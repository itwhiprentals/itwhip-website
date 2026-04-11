// app/fleet/analytics/components/VisitorProfile/BehavioralSignals.tsx
// Pages/session, timing analysis, sensitive path detection

'use client'

interface BehavioralSignalsProps {
  behavioral: {
    totalPages: number
    avgTimeBetweenPages: number | null
    authPagesVisited: string[]
    sensitivePagesVisited: string[]
    sessionDurationMs: number | null
  }
}

export default function BehavioralSignals({ behavioral }: BehavioralSignalsProps) {
  const { totalPages, avgTimeBetweenPages, authPagesVisited, sensitivePagesVisited, sessionDurationMs } = behavioral

  const isBotLike = avgTimeBetweenPages !== null && avgTimeBetweenPages < 1000
  const accessedSensitive = sensitivePagesVisited.length > 0
  const accessedAuth = authPagesVisited.length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Behavioral Analysis</h3>

      <div className="space-y-3">
        {/* Session stats */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Pages" value={String(totalPages)} />
          <MiniStat
            label="Avg Gap"
            value={avgTimeBetweenPages !== null ? formatMs(avgTimeBetweenPages) : '-'}
            alert={isBotLike}
          />
          <MiniStat
            label="Duration"
            value={sessionDurationMs !== null ? formatMs(sessionDurationMs) : '-'}
          />
        </div>

        {/* Bot detection */}
        {isBotLike && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-red-500 text-sm font-semibold">⚡ Bot-like behavior</span>
            <span className="text-xs text-red-400">Avg {formatMs(avgTimeBetweenPages!)} between pages</span>
          </div>
        )}

        {/* Sensitive paths */}
        {accessedSensitive && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs font-semibold text-red-600 mb-1">Sensitive Paths Accessed</p>
            <div className="flex flex-wrap gap-1">
              {sensitivePagesVisited.map(p => (
                <span key={p} className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-mono">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Auth paths */}
        {accessedAuth && (
          <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs font-semibold text-yellow-600 mb-1">Auth Pages Visited</p>
            <div className="flex flex-wrap gap-1">
              {authPagesVisited.map(p => (
                <span key={p} className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded font-mono">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Clean visitor */}
        {!isBotLike && !accessedSensitive && !accessedAuth && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-green-600">Normal browsing pattern — no suspicious behavior</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-semibold ${alert ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      <p className="text-[10px] text-gray-400 uppercase">{label}</p>
    </div>
  )
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}
