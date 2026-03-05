'use client'

interface RunData {
  status: string
  durationMs: number
  processed: number
  startedAt: string
}

export default function MiniRunChart({ runs }: { runs: RunData[] }) {
  if (runs.length === 0) {
    return (
      <div className="flex items-end gap-0.5 h-8">
        <span className="text-xs text-gray-400">No runs yet</span>
      </div>
    )
  }

  const maxDuration = Math.max(...runs.map(r => r.durationMs || 1), 1)

  return (
    <div className="flex items-end gap-0.5 h-8" title="Last 10 runs (oldest → newest)">
      {runs.map((run, i) => {
        const height = Math.max(4, (run.durationMs / maxDuration) * 32)
        const color = run.status === 'success'
          ? 'bg-green-500'
          : run.status === 'running'
            ? 'bg-blue-400 animate-pulse'
            : 'bg-red-500'

        return (
          <div
            key={i}
            className={`w-2 rounded-t ${color} transition-all`}
            style={{ height: `${height}px` }}
            title={`${run.status} — ${run.durationMs}ms — ${run.processed} processed — ${new Date(run.startedAt).toLocaleString()}`}
          />
        )
      })}
    </div>
  )
}
