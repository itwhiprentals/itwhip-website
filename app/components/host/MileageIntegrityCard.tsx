// app/components/host/MileageIntegrityCard.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  IoSpeedometerOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoFlagOutline,
  IoChevronForwardOutline,
  IoCarOutline,
  IoConstructOutline,
  IoShieldOutline
} from 'react-icons/io5'

interface VehicleIssue {
  id: string
  carName: string
  licensePlate: string
  lastTripEndMileage: number
  currentMileage: number
  gap: number
  primaryUse: string
  status: 'normal' | 'warning' | 'critical'
  severity: string
  hasServiceIssues: boolean
  hasActiveClaim: boolean
}

interface FleetSummary {
  totalVehicles: number
  normalCount: number
  warningCount: number
  criticalCount: number
}

interface Alert {
  type: 'warning' | 'critical'
  message: string
  action: string
}

interface MileageIntegrityData {
  vehicles: VehicleIssue[]
  summary: FleetSummary
  alerts: Alert[]
  analysis: {
    complianceRate: number
    averageGap: number
    vehiclesAtRisk: number
  }
}

export default function MileageIntegrityCard({ hostId }: { hostId: string }) {
  const [data, setData] = useState<MileageIntegrityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMileageData()
  }, [hostId])

  const fetchMileageData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/mileage-integrity?hostId=${hostId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch mileage data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching mileage data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-6">
          <IoWarningOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error || 'Unable to load mileage data'}
          </p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-green-600 dark:text-green-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'bg-green-50 dark:bg-green-900/20'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoSpeedometerOutline className="w-5 h-5" />
          Fleet Intelligence & Compliance
        </h3>
        {data.analysis.complianceRate < 80 && (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-lg">
            Action Required
          </span>
        )}
      </div>

      {/* Compliance Overview */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fleet Compliance Score
          </span>
          <span className={`text-2xl font-bold ${
            data.analysis.complianceRate >= 90 ? 'text-green-600 dark:text-green-400' :
            data.analysis.complianceRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {data.analysis.complianceRate}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              data.analysis.complianceRate >= 90 ? 'bg-green-500' :
              data.analysis.complianceRate >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${data.analysis.complianceRate}%` }}
          />
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className={`p-2 rounded-lg ${data.summary.normalCount > 0 ? getStatusBg('normal') : 'bg-gray-50 dark:bg-gray-900/50'}`}>
            <IoCheckmarkCircleOutline className={`w-4 h-4 mx-auto mb-1 ${data.summary.normalCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
            <div className={`text-lg font-bold ${data.summary.normalCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {data.summary.normalCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Compliant</div>
          </div>
          
          <div className={`p-2 rounded-lg ${data.summary.warningCount > 0 ? getStatusBg('warning') : 'bg-gray-50 dark:bg-gray-900/50'}`}>
            <IoWarningOutline className={`w-4 h-4 mx-auto mb-1 ${data.summary.warningCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`} />
            <div className={`text-lg font-bold ${data.summary.warningCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
              {data.summary.warningCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Review</div>
          </div>
          
          <div className={`p-2 rounded-lg ${data.summary.criticalCount > 0 ? getStatusBg('critical') : 'bg-gray-50 dark:bg-gray-900/50'}`}>
            <IoCloseCircleOutline className={`w-4 h-4 mx-auto mb-1 ${data.summary.criticalCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
            <div className={`text-lg font-bold ${data.summary.criticalCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
              {data.summary.criticalCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {data.alerts.slice(0, 2).map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              alert.type === 'critical' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-start gap-2">
                {alert.type === 'critical' ? (
                  <IoCloseCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <IoWarningOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    alert.type === 'critical'
                      ? 'text-red-800 dark:text-red-300'
                      : 'text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {alert.message}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    alert.type === 'critical'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {alert.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Issues */}
      {data.vehicles.length > 0 && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vehicles Needing Attention:
            </p>
            <div className="space-y-2">
              {data.vehicles.slice(0, 3).map(vehicle => (
                <Link
                  key={vehicle.id}
                  href={`/host/cars/${vehicle.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          vehicle.status === 'critical' ? 'bg-red-500' :
                          vehicle.status === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {vehicle.carName}
                        </span>
                        {vehicle.hasActiveClaim && (
                          <IoShieldOutline className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span>{vehicle.currentMileage.toLocaleString()} mi</span>
                        <span className={`font-medium ${getStatusColor(vehicle.status)}`}>
                          +{vehicle.gap} mi gap
                        </span>
                        <span className="text-gray-500">({vehicle.primaryUse})</span>
                      </div>
                    </div>
                    <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <Link
          href="/host/cars"
          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1"
        >
          View Fleet Intelligence
          <IoChevronForwardOutline className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}