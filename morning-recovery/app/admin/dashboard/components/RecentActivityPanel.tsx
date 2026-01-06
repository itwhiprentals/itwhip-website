// app/admin/dashboard/components/RecentActivityPanel.tsx
'use client'

import Link from 'next/link'
import {
  IoNavigateOutline,
  IoCashOutline,
  IoAnalyticsOutline,
  IoSettingsOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface Activity {
  id: string
  type: 'trip' | 'booking' | 'verification' | 'dispute' | 'system'
  message: string
  time: string
}

interface RecentActivityPanelProps {
  recentActivity: Activity[]
  className?: string
}

export default function RecentActivityPanel({
  recentActivity,
  className = ''
}: RecentActivityPanelProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trip':
        return <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
      case 'booking':
        return <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
      case 'verification':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
      case 'dispute':
        return <div className="w-2 h-2 bg-red-400 rounded-full mt-2" />
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
    }
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {recentActivity.length > 0 ? (
            recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <IoTimeOutline className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <Link 
            href="/admin/rentals/trips/active" 
            className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <IoNavigateOutline className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Active Trips</span>
          </Link>
          
          <Link 
            href="/admin/rentals/trips/charges" 
            className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <IoCashOutline className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Process Charges</span>
          </Link>
          
          <Link 
            href="/admin/analytics/trips" 
            className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <IoAnalyticsOutline className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Analytics</span>
          </Link>
          
          <Link 
            href="/admin/system/health" 
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <IoSettingsOutline className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">System Health</span>
          </Link>
        </div>
      </div>
    </div>
  )
}