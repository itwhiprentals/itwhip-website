// app/admin/dashboard/components/AlertBanners.tsx
'use client'

import Link from 'next/link'
import {
  IoWarningOutline,
  IoAlertCircleOutline,
  IoCloudOfflineOutline
} from 'react-icons/io5'

interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'critical'
  database: {
    status: string
    responseTime: number
  }
  trips: {
    stuckTrips: number
    overdueReturns: number
    missingPhotos: number
  }
}

interface AlertBannersProps {
  systemHealth: SystemHealthData | null
  pendingVerifications: number
  overdueReturns: number
  openDisputes: number
  error?: string | null
  onNavigateToVerifications: () => void
  onNavigateToTrips: () => void
  onNavigateToDisputes: () => void
}

export default function AlertBanners({
  systemHealth,
  pendingVerifications,
  overdueReturns,
  openDisputes,
  error,
  onNavigateToVerifications,
  onNavigateToTrips,
  onNavigateToDisputes
}: AlertBannersProps) {
  return (
    <div className="space-y-4">
      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <IoCloudOfflineOutline className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <div className={`${
          systemHealth.status === 'critical' 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-400' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400'
        } border-l-4 p-4 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoWarningOutline className={`w-5 h-5 ${
                systemHealth.status === 'critical' ? 'text-red-400' : 'text-yellow-400'
              } mr-3`} />
              <p className="text-sm">
                <span className="font-semibold">System Status: {systemHealth.status}</span>
                {systemHealth.trips.overdueReturns > 0 && ` - ${systemHealth.trips.overdueReturns} overdue returns`}
              </p>
            </div>
            <Link
              href="/admin/system/health"
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Pending Verifications Alert */}
      {pendingVerifications > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoWarningOutline className="w-5 h-5 text-yellow-400 mr-3" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-semibold">{pendingVerifications} bookings</span> require verification review
              </p>
            </div>
            <button
              onClick={onNavigateToVerifications}
              className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded text-sm font-semibold hover:bg-yellow-500"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Overdue Returns Alert */}
      {overdueReturns > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoAlertCircleOutline className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">{overdueReturns} vehicles</span> are overdue for return
              </p>
            </div>
            <button
              onClick={onNavigateToTrips}
              className="px-3 py-1 bg-red-400 text-white rounded text-sm font-semibold hover:bg-red-500"
            >
              View Trips
            </button>
          </div>
        </div>
      )}

      {/* Open Disputes Alert */}
      {openDisputes > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoAlertCircleOutline className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">{openDisputes} open disputes</span> need attention
              </p>
            </div>
            <button
              onClick={onNavigateToDisputes}
              className="px-3 py-1 bg-red-400 text-white rounded text-sm font-semibold hover:bg-red-500"
            >
              View Disputes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}