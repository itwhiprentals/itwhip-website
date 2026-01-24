// app/fleet/analytics/components/StatsCards.tsx
// Overview stats cards for analytics dashboard - clickable for details

'use client'

import { useState } from 'react'
import { IoEyeOutline, IoPeopleOutline, IoTimeOutline, IoExitOutline, IoChevronForwardOutline } from 'react-icons/io5'
import StatsDetailModal, { StatType } from './StatsDetailModal'

interface DrillDownData {
  loadTime: {
    byPage: Array<{
      path: string
      avgLoadTime: number
      minLoadTime: number
      maxLoadTime: number
      p95LoadTime: number
      sampleCount: number
    }>
    byLocation: Array<{
      location: string
      country: string
      region: string | null
      city: string | null
      avgLoadTime: number
      p95LoadTime: number
      sampleCount: number
    }>
  }
  bounce: {
    byPage: Array<{
      path: string
      totalVisitors: number
      bouncedVisitors: number
      bounceRate: number
    }>
    byLocation: Array<{
      location: string
      country: string
      region: string | null
      city: string | null
      totalVisitors: number
      bouncedVisitors: number
      bounceRate: number
    }>
  }
}

interface StatsCardsProps {
  totalViews: number
  uniqueVisitors: number
  avgLoadTime: number | null
  bounceRate: number
  topPages?: { path: string; views: number }[]
  viewsByCountry?: { country: string; views: number }[]
  viewsByDevice?: { device: string; views: number }[]
  drillDown?: DrillDownData
  loading?: boolean
}

export default function StatsCards({
  totalViews,
  uniqueVisitors,
  avgLoadTime,
  bounceRate,
  topPages,
  viewsByCountry,
  viewsByDevice,
  drillDown,
  loading = false
}: StatsCardsProps) {
  const [selectedStat, setSelectedStat] = useState<StatType | null>(null)

  const stats: Array<{
    key: StatType
    label: string
    value: string
    icon: typeof IoEyeOutline
    color: string
    bgColor: string
  }> = [
    {
      key: 'totalViews',
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: IoEyeOutline,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      key: 'uniqueVisitors',
      label: 'Unique Visitors',
      value: uniqueVisitors.toLocaleString(),
      icon: IoPeopleOutline,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      key: 'avgLoadTime',
      label: 'Avg Load Time',
      value: avgLoadTime ? `${avgLoadTime}ms` : 'N/A',
      icon: IoTimeOutline,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      key: 'bounceRate',
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
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.key}
            onClick={() => setSelectedStat(stat.key)}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-left hover:ring-2 hover:ring-blue-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      <StatsDetailModal
        stat={selectedStat}
        data={{
          totalViews,
          uniqueVisitors,
          avgLoadTime,
          bounceRate,
          topPages,
          viewsByCountry,
          viewsByDevice,
          drillDown
        }}
        onClose={() => setSelectedStat(null)}
      />
    </>
  )
}
