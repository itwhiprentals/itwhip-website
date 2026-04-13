// app/fleet/analytics/components/BookingFunnel/ChoeAnalysis.tsx
// Choé's AI-powered funnel analysis — renders Claude's recommendations

'use client'

import { useState } from 'react'

interface Analysis {
  summary: string
  recommendations: {
    priority: 'critical' | 'high' | 'medium'
    title: string
    detail: string
    expectedImpact: string
  }[]
  keyInsight: string
}

interface ChoeAnalysisProps {
  onAnalyze: () => Promise<Analysis | null>
}

const PRIORITY_CONFIG = {
  critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 text-red-700', icon: '🔴' },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-100 text-orange-700', icon: '🟠' },
  medium: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700', icon: '🔵' },
}

export default function ChoeAnalysis({ onAnalyze }: ChoeAnalysisProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await onAnalyze()
      if (result) setAnalysis(result)
      else setError('No analysis returned')
    } catch (err: any) {
      setError(err.message || 'Analysis failed')
    }
    setLoading(false)
  }

  if (!analysis && !loading) {
    return (
      <div className="mt-6">
        <button
          onClick={handleAnalyze}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <span className="text-lg">✨</span>
          Analyze with Choé
          <span className="text-xs opacity-75 ml-1">(~$0.01)</span>
        </button>
        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Choé is analyzing your funnel...</p>
            <p className="text-xs text-purple-500 mt-0.5">Reading your data, finding patterns, building recommendations</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Choé&apos;s Analysis</h3>
        </div>
        <button
          onClick={handleAnalyze}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          Re-analyze
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis?.summary}</p>
      </div>

      {/* Recommendations */}
      {analysis?.recommendations.map((rec, i) => {
        const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium
        return (
          <div key={i} className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
            <div className="flex items-start gap-3">
              <span className="text-sm mt-0.5">{config.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${config.badge}`}>{rec.priority}</span>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{rec.detail}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>📈</span> {rec.expectedImpact}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      {/* Key Insight */}
      {analysis?.keyInsight && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <div className="flex items-start gap-2">
            <span className="text-sm">💡</span>
            <div>
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase mb-1">Key Insight</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.keyInsight}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
