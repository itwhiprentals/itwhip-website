// app/admin/dashboard/components/tabs/SystemTab.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IoSpeedometerOutline,
  IoAnalyticsOutline,
  IoNotificationsOutline,
  IoTrendingUpOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'critical'
}

interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  createdAt: string
  resolved: boolean
}

interface SystemTabProps {
  systemHealth: SystemHealthData | null
  systemAlerts: SystemAlert[]
}

export default function SystemTab({ systemHealth, systemAlerts }: SystemTabProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link 
        href="/admin/system/health"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <IoSpeedometerOutline className="w-8 h-8 text-blue-500" />
          <span className={`px-2 py-1 text-xs rounded-full ${
            systemHealth?.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            systemHealth?.status === 'degraded' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {systemHealth?.status || 'checking'}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Monitor system performance</p>
      </Link>

      <Link 
        href="/admin/system/health/details"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <IoAnalyticsOutline className="w-8 h-8 text-purple-500" />
          <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Metrics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Deep system diagnostics</p>
      </Link>

      <Link 
        href="/admin/system/alerts"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <IoNotificationsOutline className="w-8 h-8 text-red-500" />
          <span className="text-2xl font-bold text-red-600">
            {systemAlerts.filter(a => !a.resolved).length}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Alerts</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Active warnings & errors</p>
      </Link>

      <Link 
        href="/admin/analytics/revenue"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <IoTrendingUpOutline className="w-8 h-8 text-green-500" />
          <IoArrowForwardOutline className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Analytics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Financial performance</p>
      </Link>

      {systemAlerts.length > 0 && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {systemAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.type === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {alert.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}