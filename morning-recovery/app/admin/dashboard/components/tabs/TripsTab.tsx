// app/admin/dashboard/components/tabs/TripsTab.tsx
'use client'

import Link from 'next/link'
import {
  IoStatsChartOutline,
  IoNavigateOutline,
  IoCashOutline,
  IoCameraOutline,
  IoAnalyticsOutline,
  IoFlagOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

interface RentalStats {
  activeTrips?: number
  overdueReturns?: number
  pendingCharges?: number
  openDisputes?: number
}

interface TripsTabProps {
  stats: RentalStats
}

export default function TripsTab({ stats }: TripsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link 
        href="/admin/rentals/trips"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <IoStatsChartOutline className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold">{stats.activeTrips || 0}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Overview</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Dashboard and statistics</p>
      </Link>

      <Link 
        href="/admin/rentals/trips/active"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <IoNavigateOutline className="w-8 h-8 text-green-500" />
          <span className="text-2xl font-bold text-green-600">{stats.activeTrips || 0}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Trips</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Monitor live trips</p>
        {stats.overdueReturns && stats.overdueReturns > 0 && (
          <p className="text-xs text-red-600 mt-1">{stats.overdueReturns} overdue</p>
        )}
      </Link>

      <Link 
        href="/admin/rentals/trips/charges"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <IoCashOutline className="w-8 h-8 text-orange-500" />
          <span className="text-2xl font-bold text-orange-600">{stats.pendingCharges || 0}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Charges</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Process additional charges</p>
      </Link>

      <Link 
        href="/admin/rentals/trips/inspections"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <IoCameraOutline className="w-8 h-8 text-purple-500" />
          <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inspections</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Review trip photos</p>
      </Link>

      <Link 
        href="/admin/analytics/trips"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <IoAnalyticsOutline className="w-8 h-8 text-indigo-500" />
          <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Analytics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Performance metrics</p>
      </Link>

      <Link 
        href="/admin/disputes"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <IoFlagOutline className="w-8 h-8 text-red-500" />
          <span className="text-2xl font-bold text-red-600">{stats.openDisputes || 0}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Disputes</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Handle damage claims</p>
      </Link>
    </div>
  )
}