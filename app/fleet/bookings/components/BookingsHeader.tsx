// app/fleet/bookings/components/BookingsHeader.tsx
'use client'

import { IoRefreshOutline, IoDownloadOutline } from 'react-icons/io5'

interface BookingsHeaderProps {
  refreshing: boolean
  onRefresh: () => void
}

export function BookingsHeader({ refreshing, onRefresh }: BookingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Booking Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage all platform bookings, verifications, and trip status
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <IoRefreshOutline className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <IoDownloadOutline className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  )
}
