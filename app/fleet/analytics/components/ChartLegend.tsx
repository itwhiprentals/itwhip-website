// app/fleet/analytics/components/ChartLegend.tsx
// Legend component for Views Over Time chart

'use client'

interface ChartLegendProps {
  avg: number
  hasPreviousPeriod: boolean
}

export default function ChartLegend({ avg, hasPreviousPeriod }: ChartLegendProps) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      {/* Current Period */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-4 h-0.5 bg-blue-500 rounded" />
        <span>Current Period</span>
      </div>

      {/* Previous Period */}
      {hasPreviousPeriod && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-4 h-0" style={{ borderTop: '2px dashed #9CA3AF' }} />
          <span>Previous Period</span>
        </div>
      )}

      {/* Average Line */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-4 h-0 border-t-2 border-dashed border-gray-400" />
        <span>Avg ({avg}/day)</span>
      </div>
    </div>
  )
}
