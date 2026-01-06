// app/admin/dashboard/components/StatsOverview.tsx
'use client'

import {
  IoDocumentTextOutline,
  IoNavigateOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCarSportOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface RentalStats {
  totalBookings: number
  activeTrips?: number
  overdueReturns?: number
  pendingVerifications: number
  totalRevenue: number
  todayRevenue: number
  totalCars: number
  totalHosts: number
  pendingCharges?: number
  averageChargeAmount?: number
  openDisputes: number
}

interface StatsOverviewProps {
  stats: RentalStats
  onNavigateToBookings: () => void
  onNavigateToTrips: () => void
  onNavigateToVerifications: () => void
  onNavigateToCars: () => void
  onNavigateToHosts: () => void
  onNavigateToCharges: () => void
  onNavigateToDisputes: () => void
}

export default function StatsOverview({
  stats,
  onNavigateToBookings,
  onNavigateToTrips,
  onNavigateToVerifications,
  onNavigateToCars,
  onNavigateToHosts,
  onNavigateToCharges,
  onNavigateToDisputes
}: StatsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={onNavigateToBookings}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
              <p className="text-xs text-green-600 mt-1">All time</p>
            </div>
            <IoDocumentTextOutline className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={onNavigateToTrips}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Trips</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTrips || 0}</p>
              <p className="text-xs text-red-600 mt-1">{stats.overdueReturns || 0} overdue</p>
            </div>
            <IoNavigateOutline className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={onNavigateToVerifications}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verify</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerifications}</p>
              <p className="text-xs text-red-600 mt-1">Action required</p>
            </div>
            <IoShieldCheckmarkOutline className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">${stats.todayRevenue} today</p>
            </div>
            <IoWalletOutline className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={onNavigateToCars}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Cars</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalCars}</p>
              <p className="text-xs text-gray-500">In fleet</p>
            </div>
            <IoCarSportOutline className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <div
          onClick={onNavigateToHosts}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Hosts</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalHosts}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <IoPeopleOutline className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
          onClick={onNavigateToCharges}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending Charges</p>
              <p className="text-xl font-bold text-orange-600">{stats.pendingCharges || 0}</p>
              <p className="text-xs text-gray-500">Avg: ${stats.averageChargeAmount?.toFixed(0) || 0}</p>
            </div>
            <IoCashOutline className="w-6 h-6 text-orange-400" />
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
          onClick={onNavigateToDisputes}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Open Disputes</p>
              <p className="text-xl font-bold text-red-600">{stats.openDisputes}</p>
              <p className="text-xs text-gray-500">Needs review</p>
            </div>
            <IoAlertCircleOutline className="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  )
}