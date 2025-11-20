// app/components/host/ServiceMetricsDashboardCard.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  IoConstructOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
  IoCarOutline,
  IoShieldOutline,
  IoBarChartOutline
} from 'react-icons/io5'

interface VehicleStatus {
  carId: string
  carName: string
  licensePlate: string
  status: 'critical' | 'overdue' | 'due_soon' | 'current'
  alerts: string[]
  inspectionExpiring: boolean
  oilChangeOverdue: boolean
  isActive: boolean
  hasActiveClaim: boolean
}

interface FleetAlert {
  severity: 'critical' | 'warning' | 'info'
  message: string
  action: string
  affectedVehicles: string[]
}

interface ServiceMetrics {
  totalVehicles: number
  overallStatus: 'critical' | 'overdue' | 'due_soon' | 'current' | 'no_vehicles'
  criticalCount: number
  overdueCount: number
  dueSoonCount: number
  currentCount: number
  alerts: FleetAlert[]
  vehicleStatuses: VehicleStatus[]
  esgImpact: {
    maintenanceScore: string
    insuranceRisk: boolean
    potentialDeactivations: number
  }
}

interface ServiceMetricsDashboardCardProps {
  hostId: string
}

export default function ServiceMetricsDashboardCard({ hostId }: ServiceMetricsDashboardCardProps) {
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServiceMetrics()
  }, [hostId])

  const fetchServiceMetrics = async () => {
    try {
      const response = await fetch(`/api/host/dashboard/service-metrics?hostId=${hostId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch service metrics')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      console.error('Error fetching service metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load service data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
        <div className="text-center py-6">
          <IoWarningOutline className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {error || 'Service data not available'}
          </p>
        </div>
      </div>
    )
  }

  if (metrics.totalVehicles === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
        <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <IoConstructOutline className="w-4 h-4 md:w-5 md:h-5" />
          Fleet Maintenance Status
        </h2>
        <div className="text-center py-6">
          <IoCarOutline className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            No vehicles to monitor
          </p>
        </div>
      </div>
    )
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-400',
          icon: 'text-red-600 dark:text-red-400',
          label: 'Critical - Immediate Action Required'
        }
      case 'overdue':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-700 dark:text-yellow-400',
          icon: 'text-yellow-600 dark:text-yellow-400',
          label: 'Service Overdue'
        }
      case 'due_soon':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-400',
          icon: 'text-blue-600 dark:text-blue-400',
          label: 'Service Due Soon'
        }
      default:
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-400',
          icon: 'text-green-600 dark:text-green-400',
          label: 'All Services Current'
        }
    }
  }

  const overallStyles = getStatusStyles(metrics.overallStatus)

  // ✅ NEW: Determine if we need to show rich details
  const hasDeactivatedVehicles = metrics.vehicleStatuses.some(v => !v.isActive)
  const hasClaimImpact = metrics.vehicleStatuses.some(v => v.hasActiveClaim)
  const hasServiceIssues = metrics.vehicleStatuses.some(v => v.status !== 'current')
  const showRichDetails = hasDeactivatedVehicles || hasClaimImpact || hasServiceIssues || metrics.alerts.length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <IoConstructOutline className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Fleet Maintenance Status</span>
          <span className="sm:hidden">Maintenance</span>
        </h2>
        <span className={`text-xs font-medium px-2 py-1 rounded border ${overallStyles.text} ${overallStyles.bg} ${overallStyles.border} hidden md:inline`}>
          {overallStyles.label}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded border ${overallStyles.text} ${overallStyles.bg} ${overallStyles.border} md:hidden`}>
          {metrics.overallStatus === 'critical' ? 'Critical' : 
           metrics.overallStatus === 'overdue' ? 'Overdue' : 
           metrics.overallStatus === 'due_soon' ? 'Due Soon' : 'Current'}
        </span>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-3 md:mb-4">
        <div className={`text-center p-1.5 md:p-2 rounded-lg ${
          metrics.criticalCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/50'
        }`}>
          <div className={`text-base md:text-xl font-bold ${
            metrics.criticalCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
          }`}>
            {metrics.criticalCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
        </div>
        
        <div className={`text-center p-1.5 md:p-2 rounded-lg ${
          metrics.overdueCount > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-900/50'
        }`}>
          <div className={`text-base md:text-xl font-bold ${
            metrics.overdueCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'
          }`}>
            {metrics.overdueCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Overdue</div>
        </div>
        
        <div className={`text-center p-1.5 md:p-2 rounded-lg ${
          metrics.dueSoonCount > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900/50'
        }`}>
          <div className={`text-base md:text-xl font-bold ${
            metrics.dueSoonCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}>
            {metrics.dueSoonCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Due Soon</div>
        </div>
        
        <div className={`text-center p-1.5 md:p-2 rounded-lg ${
          metrics.currentCount > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/50'
        }`}>
          <div className={`text-base md:text-xl font-bold ${
            metrics.currentCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          }`}>
            {metrics.currentCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Current</div>
        </div>
      </div>

      {/* ✅ NEW: Deactivated Vehicles Notice (Always show if any deactivated) */}
      {hasDeactivatedVehicles && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <IoCheckmarkCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                {metrics.vehicleStatuses.filter(v => !v.isActive).length} vehicle currently deactivated
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                Deactivated vehicles still require maintenance tracking
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Priority Alerts */}
      {metrics.alerts.length > 0 && (
        <div className="space-y-2 mb-3">
          {metrics.alerts.slice(0, 2).map((alert, index) => (
            <div key={index} className="flex items-start gap-2">
              {alert.severity === 'critical' ? (
                <IoAlertCircleOutline className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 flex-shrink-0 mt-0.5" />
              ) : alert.severity === 'warning' ? (
                <IoWarningOutline className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              ) : (
                <IoCheckmarkCircleOutline className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {alert.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ NEW: ESG/Insurance Impact Warning (Always show if impacted) */}
      {(metrics.esgImpact.insuranceRisk || metrics.esgImpact.potentialDeactivations > 0 || metrics.esgImpact.maintenanceScore !== 'no_impact') && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
          <div className="flex items-start gap-2 text-xs">
            <IoWarningOutline className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1 min-w-0">
              {metrics.esgImpact.insuranceRisk && (
                <p className="text-xs text-orange-700 dark:text-orange-400 flex items-start gap-1.5">
                  <IoShieldOutline className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Insurance coverage at risk due to expired inspections</span>
                </p>
              )}
              {metrics.esgImpact.potentialDeactivations > 0 && (
                <p className="text-xs text-orange-700 dark:text-orange-400 flex items-start gap-1.5">
                  <IoAlertCircleOutline className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{metrics.esgImpact.potentialDeactivations} vehicle{metrics.esgImpact.potentialDeactivations > 1 ? 's' : ''} may be deactivated</span>
                </p>
              )}
              {metrics.esgImpact.maintenanceScore !== 'no_impact' && (
                <p className="text-xs text-orange-700 dark:text-orange-400 flex items-start gap-1.5">
                  <IoBarChartOutline className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>ESG maintenance score impacted</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Vehicles Needing Attention (Show if any issues OR deactivated vehicles) */}
      {showRichDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Vehicles Needing Attention:
          </p>
          {metrics.vehicleStatuses
            .filter(v => v.status !== 'current' || !v.isActive || v.hasActiveClaim)
            .slice(0, 3)
            .map(vehicle => {
              const statusStyles = getStatusStyles(vehicle.status)
              return (
                <Link
                  key={vehicle.carId}
                  href={`/host/cars/${vehicle.carId}/edit?tab=service`}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      vehicle.status === 'critical' || !vehicle.isActive || vehicle.hasActiveClaim ? 'bg-red-500' :
                      vehicle.status === 'overdue' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {vehicle.carName}
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                  <IoChevronForwardOutline className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                </Link>
              )
            })}
        </div>
      )}

      {/* View All Link */}
      <div className="mt-3 text-center">
        <Link
          href="/host/cars?filter=service_needed"
          className="text-xs md:text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          Manage Fleet Service →
        </Link>
      </div>
    </div>
  )
}