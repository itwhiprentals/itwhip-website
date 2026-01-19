// app/fleet/analytics/components/StatsCards.tsx
// Overview stats cards for analytics dashboard

'use client'

import { IoEyeOutline, IoPeopleOutline, IoTimeOutline, IoExitOutline } from 'react-icons/io5'

interface StatsCardsProps {
  totalViews: number
  uniqueVisitors: number
  avgLoadTime: number | null
  bounceRate: number
  loading?: boolean
}

export default function StatsCards({
  totalViews,
  uniqueVisitors,
  avgLoadTime,
  bounceRate,
  loading = false
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: IoEyeOutline,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Unique Visitors',
      value: uniqueVisitors.toLocaleString(),
      icon: IoPeopleOutline,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Avg Load Time',
      value: avgLoadTime ? `${avgLoadTime}ms` : 'N/A',
      icon: IoTimeOutline,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Bounce Rate',
      value: `${bounceRate}%`,
      icon: IoExitOutline,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
