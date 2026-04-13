// app/fleet/analytics/components/BookingFunnel/DropOffAnalysis.tsx
// Highlights biggest drop-off points + summary stats

'use client'

interface FunnelSummary {
  topOfFunnel: number
  bottomOfFunnel: number
  overallConversion: number
  errorCount: number
  abandonedCount: number
  biggestDropOff: { step: string; dropOff: number } | null
}

interface DropOffAnalysisProps {
  summary: FunnelSummary
}

export default function DropOffAnalysis({ summary }: DropOffAnalysisProps) {
  return (
    <div className="space-y-4">
      {/* Conversion rate */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Top of Funnel" value={String(summary.topOfFunnel)} subtitle="Car views" />
        <StatCard label="Bookings" value={String(summary.bottomOfFunnel)} subtitle="Confirmed" color="green" />
        <StatCard label="Conversion" value={`${summary.overallConversion}%`} subtitle="Overall" color={summary.overallConversion >= 5 ? 'green' : summary.overallConversion >= 2 ? 'yellow' : 'red'} />
      </div>

      {/* Biggest drop-off */}
      {summary.biggestDropOff && (
        <div className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase mb-0.5">Biggest Drop-Off</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            <strong>{summary.biggestDropOff.dropOff}%</strong> of users drop off at <strong>{summary.biggestDropOff.step}</strong>
          </p>
        </div>
      )}

      {/* Errors & abandonment */}
      <div className="flex gap-3">
        {summary.errorCount > 0 && (
          <div className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center gap-2">
            <span className="text-orange-500 text-sm font-semibold">{summary.errorCount}</span>
            <span className="text-xs text-orange-600">errors during checkout</span>
          </div>
        )}
        {summary.abandonedCount > 0 && (
          <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2">
            <span className="text-yellow-600 text-sm font-semibold">{summary.abandonedCount}</span>
            <span className="text-xs text-yellow-600">abandoned sessions</span>
          </div>
        )}
        {summary.errorCount === 0 && summary.abandonedCount === 0 && summary.topOfFunnel === 0 && (
          <p className="text-sm text-gray-400">No funnel data yet — events will populate as users book</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, subtitle, color = 'gray' }: { label: string; value: string; subtitle: string; color?: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-900 dark:text-white',
  }

  return (
    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <p className={`text-xl font-bold ${colors[color] || colors.gray}`}>{value}</p>
      <p className="text-[10px] text-gray-400 uppercase">{label}</p>
      <p className="text-[10px] text-gray-400">{subtitle}</p>
    </div>
  )
}
