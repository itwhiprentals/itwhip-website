// app/fleet/analytics/components/BookingFunnel/FunnelInsights.tsx
// Auto-generated insight cards — color-coded by priority

'use client'

interface Insight {
  type: 'critical' | 'warning' | 'opportunity' | 'positive'
  title: string
  message: string
  metric: string
  recommendation: string
}

interface FunnelInsightsProps {
  insights: Insight[]
}

const INSIGHT_CONFIG = {
  critical: { icon: '🔴', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', title: 'text-red-700 dark:text-red-400' },
  warning: { icon: '🟡', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', title: 'text-yellow-700 dark:text-yellow-400' },
  opportunity: { icon: '🟢', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', title: 'text-blue-700 dark:text-blue-400' },
  positive: { icon: '✅', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', title: 'text-green-700 dark:text-green-400' },
}

export default function FunnelInsights({ insights }: FunnelInsightsProps) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Smart Insights</h3>
      {insights.map((insight, i) => {
        const config = INSIGHT_CONFIG[insight.type]
        return (
          <div key={i} className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-semibold ${config.title}`}>{insight.title}</h4>
                  <span className={`text-xs font-bold ${config.title} flex-shrink-0 ml-2`}>{insight.metric}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{insight.message}</p>
                <div className="flex items-start gap-1.5">
                  <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">💡</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
