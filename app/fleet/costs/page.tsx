'use client'

import { useState, useEffect } from 'react'
import { IoCashOutline } from 'react-icons/io5'

interface CostBreakdown {
  action: string
  cost: number
  count: number
}

export default function CostsPage() {
  const [data, setData] = useState<{ total: number; breakdown: CostBreakdown[] } | null>(null)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/fleet/api/costs?period=${period}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  const formatCost = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const ACTION_LABELS: Record<string, string> = {
    CHOE_CONVERSATION: 'Choé AI',
    SMS_SENT: 'Twilio SMS',
    PUSH_SENT: 'Push Notifications',
    EMAIL_SENT: 'Email (Resend)',
    S3_UPLOAD: 'S3 Storage',
    STRIPE_IDENTITY: 'Stripe Identity',
    FIREBASE_PHONE: 'Firebase Phone',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IoCashOutline className="text-3xl text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Costs</h1>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['day', 'week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${period === p ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}
            >{p.charAt(0).toUpperCase() + p.slice(1)}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading costs...</div>
      ) : data ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total ({period})</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCost(data.total)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {data.breakdown.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No cost data for this period</div>
            ) : (
              data.breakdown.sort((a, b) => b.cost - a.cost).map(item => (
                <div key={item.action} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{ACTION_LABELS[item.action] || item.action}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{item.count} calls</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{formatCost(item.cost)}</span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Failed to load costs</div>
      )}
    </div>
  )
}
