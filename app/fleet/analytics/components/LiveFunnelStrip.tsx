// app/fleet/analytics/components/LiveFunnelStrip.tsx
// Real-time funnel stage counts — shows how many visitors are at each stage RIGHT NOW

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IoSearchOutline,
  IoCarSportOutline,
  IoCalendarOutline,
  IoCartOutline,
  IoIdCardOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5'
import AnimatedCounter from './shared/AnimatedCounter'

interface FunnelBreakdown {
  browsing: number
  car_detail: number
  selecting_dates: number
  checkout: number
  id_verify: number
  payment: number
  confirmed: number
  other: number
}

const STAGES = [
  { key: 'browsing', label: 'Browsing', Icon: IoSearchOutline, iconColor: 'text-gray-500', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  { key: 'car_detail', label: 'Viewing Car', Icon: IoCarSportOutline, iconColor: 'text-blue-500', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { key: 'selecting_dates', label: 'Selecting Dates', Icon: IoCalendarOutline, iconColor: 'text-indigo-500', color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  { key: 'checkout', label: 'At Checkout', Icon: IoCartOutline, iconColor: 'text-amber-500', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { key: 'id_verify', label: 'Verifying ID', Icon: IoIdCardOutline, iconColor: 'text-orange-500', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { key: 'payment', label: 'Paying', Icon: IoCardOutline, iconColor: 'text-purple-500', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { key: 'confirmed', label: 'Booked!', Icon: IoCheckmarkCircleOutline, iconColor: 'text-green-500', color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
] as const

export default function LiveFunnelStrip() {
  const [breakdown, setBreakdown] = useState<FunnelBreakdown | null>(null)
  const [totalOnline, setTotalOnline] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/fleet/api/active-users?key=phoenix-fleet-2847')
      const data = await res.json()
      if (data.success && data.funnelBreakdown) {
        setBreakdown(data.funnelBreakdown)
        setTotalOnline(data.onlineNow || 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15_000) // 15s for near-real-time
    return () => clearInterval(interval)
  }, [fetchData])

  if (!breakdown) return null

  const hasActivity = totalOnline > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${hasActivity ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Live Funnel
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <AnimatedCounter value={totalOnline} /> online now
          </span>
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Real-time</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STAGES.map(({ key, label, Icon, iconColor, color }) => {
          const count = breakdown[key as keyof FunnelBreakdown] || 0
          return (
            <div
              key={key}
              className={`rounded-lg px-3 py-2 text-center transition-all ${color} ${count > 0 ? 'ring-1 ring-current/20 shadow-sm' : 'opacity-60'}`}
            >
              <div className="flex justify-center mb-0.5"><Icon className={`w-5 h-5 ${iconColor}`} /></div>
              <div className="text-lg font-bold">
                <AnimatedCounter value={count} />
              </div>
              <div className="text-[10px] font-medium leading-tight">{label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
