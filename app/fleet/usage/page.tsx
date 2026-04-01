'use client'

import { useState, useEffect } from 'react'
import { IoBarChartOutline } from 'react-icons/io5'

interface UsageData {
  total: number
  breakdown: { action: string; cost: number; count: number }[]
  bookingCount: number
  costPerBooking: number
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/fleet/api/usage?period=${period}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const ACTION_LABELS: Record<string, { label: string; desc: string }> = {
    CHOE_CONVERSATION: { label: 'Choé AI', desc: 'conversations handled' },
    SMS_SENT: { label: 'SMS Messages', desc: 'texts sent' },
    PUSH_SENT: { label: 'Push Notifications', desc: 'notifications delivered' },
    EMAIL_SENT: { label: 'Emails', desc: 'emails sent' },
    S3_UPLOAD: { label: 'Photo Storage', desc: 'photos uploaded' },
    STRIPE_IDENTITY: { label: 'Identity Verification', desc: 'verifications' },
    FIREBASE_PHONE: { label: 'Phone Auth', desc: 'OTP verifications' },
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IoBarChartOutline className="text-3xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Usage</h1>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['week', 'month', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${period === p ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}
            >{p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading usage data...</div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(data.total)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500">Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.bookingCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500">Cost Per Booking</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(data.costPerBooking)}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Service Breakdown</h3>
            </div>
            {data.breakdown.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No usage data yet</div>
            ) : (
              data.breakdown.sort((a, b) => b.count - a.count).map(item => {
                const meta = ACTION_LABELS[item.action] || { label: item.action, desc: 'calls' }
                return (
                  <div key={item.action} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{meta.label}</span>
                      <span className="text-xs text-gray-500 ml-2">{item.count} {meta.desc}</span>
                    </div>
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{fmt(item.cost)}</span>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Failed to load usage data</div>
      )}
    </div>
  )
}
