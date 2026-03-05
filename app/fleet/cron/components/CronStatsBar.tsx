'use client'

interface Stats {
  totalRuns24h: number
  successRuns24h: number
  failedRuns24h: number
  totalProcessed24h: number
  avgDuration24h: number
  runningCount: number
}

export default function CronStatsBar({ stats }: { stats: Stats }) {
  const successRate = stats.totalRuns24h > 0
    ? Math.round((stats.successRuns24h / stats.totalRuns24h) * 100)
    : 100

  const cards = [
    {
      label: 'Runs (24h)',
      value: stats.totalRuns24h.toString(),
      sub: `${stats.successRuns24h} success`,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      sub: `${stats.failedRuns24h} failed`,
      color: successRate >= 95 ? 'text-green-600 dark:text-green-400' : successRate >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Items Processed',
      value: stats.totalProcessed24h.toString(),
      sub: 'last 24h',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Avg Duration',
      value: stats.avgDuration24h > 1000 ? `${(stats.avgDuration24h / 1000).toFixed(1)}s` : `${stats.avgDuration24h}ms`,
      sub: stats.runningCount > 0 ? `${stats.runningCount} running now` : 'all idle',
      color: 'text-gray-600 dark:text-gray-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={card.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
