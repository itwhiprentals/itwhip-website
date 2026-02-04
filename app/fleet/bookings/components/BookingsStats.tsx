// app/fleet/bookings/components/BookingsStats.tsx
'use client'

import {
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoTodayOutline
} from 'react-icons/io5'

interface BookingsStatsProps {
  stats: {
    pendingVerification: number
    activeBookings: number
    needsAttention: number
    todayBookings: number
  }
}

export function BookingsStats({ stats }: BookingsStatsProps) {
  const items = [
    {
      label: 'Pending Verification',
      value: stats.pendingVerification,
      icon: IoDocumentTextOutline,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      label: 'Active Trips',
      value: stats.activeBookings,
      icon: IoCheckmarkCircleOutline,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Needs Attention',
      value: stats.needsAttention,
      icon: IoAlertCircleOutline,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      label: "Today's Activity",
      value: stats.todayBookings,
      icon: IoTodayOutline,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {item.label}
            </span>
            <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${item.color}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
