// app/fleet/analytics/components/BookingFunnel/FunnelChart.tsx
// Visual funnel — horizontal bars showing drop-off per step

'use client'

interface FunnelStep {
  step: string
  label: string
  count: number
  dropOff: number
  conversionFromPrev: number
}

interface FunnelChartProps {
  steps: FunnelStep[]
}

export default function FunnelChart({ steps }: FunnelChartProps) {
  const maxCount = steps.length > 0 ? Math.max(...steps.map(s => s.count)) : 1

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const width = maxCount > 0 ? (step.count / maxCount) * 100 : 0
        const isDropOff = step.dropOff > 30
        const barColor = step.step === 'funnel_booking_confirmed'
          ? 'bg-green-500'
          : isDropOff
            ? 'bg-red-400'
            : 'bg-blue-500'

        return (
          <div key={step.step}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{step.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {i > 0 && step.dropOff > 0 && (
                  <span className={`text-[10px] font-medium ${isDropOff ? 'text-red-500' : 'text-gray-400'}`}>
                    -{step.dropOff}%
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-white w-10 text-right">
                  {step.count}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.max(width, 1)}%` }}
              />
            </div>
          </div>
        )
      })}

      {steps.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          No funnel data yet — booking events will appear as users go through checkout
        </p>
      )}
    </div>
  )
}
