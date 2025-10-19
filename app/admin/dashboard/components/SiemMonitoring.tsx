// app/admin/dashboard/components/SiemMonitoring.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoAnalyticsOutline,
  IoSpeedometerOutline,
  IoPersonOutline,
  IoFlagOutline,
  IoBanOutline,
  IoSettingsOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface SiemMetrics {
  securityScore: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  activeThreats: number
  securityEvents24h: number
  failedLogins: number
  suspiciousBookings: number
  blockedRequests: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  lastScan: string
  criticalAlerts: number
  unreadAlerts: number
}

interface SiemMonitoringProps {
  siemMetrics: SiemMetrics
}

export default function SiemMonitoring({ siemMetrics }: SiemMonitoringProps) {
  const router = useRouter()

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <IoShieldCheckmarkOutline className="w-5 h-5 mr-2 text-blue-600" />
        Security Monitoring (SIEM)
      </h3>
      
      {/* Primary SIEM Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Security Score Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
              <p className={`text-2xl font-bold ${
                siemMetrics.securityScore >= 90 ? 'text-green-600' : 
                siemMetrics.securityScore >= 70 ? 'text-yellow-600' : 
                siemMetrics.securityScore >= 50 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {siemMetrics.securityScore}/100
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {siemMetrics.securityScore === 100 ? 'Perfect security' : 
                 siemMetrics.securityScore >= 80 ? 'Well protected' :
                 siemMetrics.securityScore >= 60 ? 'Needs attention' : 'Critical issues'}
              </p>
            </div>
            <div className="relative">
              <IoShieldCheckmarkOutline className={`w-8 h-8 ${
                siemMetrics.securityScore >= 90 ? 'text-green-500' : 
                siemMetrics.securityScore >= 70 ? 'text-yellow-500' : 
                siemMetrics.securityScore >= 50 ? 'text-orange-500' : 'text-red-500'
              }`} />
              {siemMetrics.securityScore === 100 && (
                <IoCheckmarkCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
              )}
            </div>
          </div>
        </div>
        
        {/* Active Threats Card */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/admin/system/alerts')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Threats</p>
              <p className={`text-2xl font-bold ${
                siemMetrics.activeThreats === 0 ? 'text-green-600' : 
                siemMetrics.activeThreats <= 5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {siemMetrics.activeThreats}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {siemMetrics.activeThreats === 0 ? 'No threats detected' : 
                 siemMetrics.criticalAlerts > 0 ? `${siemMetrics.criticalAlerts} critical` : 'Requires review'}
              </p>
            </div>
            <IoWarningOutline className={`w-8 h-8 ${
              siemMetrics.activeThreats === 0 ? 'text-gray-400' : 
              siemMetrics.criticalAlerts > 0 ? 'text-red-500 animate-pulse' : 'text-yellow-500'
            }`} />
          </div>
        </div>
        
        {/* Security Events Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Security Events</p>
              <p className="text-2xl font-bold text-blue-600">{siemMetrics.securityEvents24h}</p>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </div>
            <IoAnalyticsOutline className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        {/* System Health Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
              <p className={`text-lg font-bold capitalize ${
                siemMetrics.systemHealth === 'healthy' ? 'text-green-600' :
                siemMetrics.systemHealth === 'degraded' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {siemMetrics.systemHealth}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last scan: {new Date(siemMetrics.lastScan).toLocaleTimeString()}
              </p>
            </div>
            <IoSpeedometerOutline className={`w-8 h-8 ${
              siemMetrics.systemHealth === 'healthy' ? 'text-green-500' :
              siemMetrics.systemHealth === 'degraded' ? 'text-yellow-500' : 'text-red-500'
            }`} />
          </div>
        </div>
      </div>
      
      {/* Secondary SIEM Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Failed Logins */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Failed Logins</p>
              <p className={`text-xl font-bold ${
                siemMetrics.failedLogins === 0 ? 'text-gray-600' : 
                siemMetrics.failedLogins <= 10 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {siemMetrics.failedLogins}
              </p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
            <IoPersonOutline className={`w-6 h-6 ${
              siemMetrics.failedLogins === 0 ? 'text-gray-400' : 
              siemMetrics.failedLogins <= 10 ? 'text-orange-400' : 'text-red-400'
            }`} />
          </div>
        </div>
        
        {/* Suspicious Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Suspicious Books</p>
              <p className={`text-xl font-bold ${
                siemMetrics.suspiciousBookings === 0 ? 'text-gray-600' : 'text-red-600'
              }`}>
                {siemMetrics.suspiciousBookings}
              </p>
              <p className="text-xs text-gray-500">Flagged</p>
            </div>
            <IoFlagOutline className={`w-6 h-6 ${
              siemMetrics.suspiciousBookings === 0 ? 'text-gray-400' : 'text-red-400'
            }`} />
          </div>
        </div>
        
        {/* Blocked Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Blocked Reqs</p>
              <p className={`text-xl font-bold ${
                siemMetrics.blockedRequests === 0 ? 'text-gray-600' : 'text-purple-600'
              }`}>
                {siemMetrics.blockedRequests}
              </p>
              <p className="text-xs text-gray-500">24h</p>
            </div>
            <IoBanOutline className={`w-6 h-6 ${
              siemMetrics.blockedRequests === 0 ? 'text-gray-400' : 'text-purple-400'
            }`} />
          </div>
        </div>
        
        {/* SIEM Console Link */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
          onClick={() => router.push('/admin/system/alerts/dashboard')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">SIEM Console</p>
              <p className="text-sm font-bold text-blue-600">View All</p>
              <p className="text-xs text-gray-500">Details →</p>
            </div>
            <IoSettingsOutline className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>
      
      {/* Alert Banner if Critical */}
      {siemMetrics.threatLevel === 'critical' && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoAlertCircleOutline className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">Critical Security Alert:</span> {siemMetrics.activeThreats} active threats detected. 
                Security score: {siemMetrics.securityScore}/100
              </p>
            </div>
            <Link
              href="/admin/system/alerts"
              className="px-3 py-1 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
            >
              Investigate
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}