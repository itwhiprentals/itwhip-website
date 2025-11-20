// app/components/host/VehicleIntelligenceHeader.tsx

'use client'

import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoShieldCheckmarkOutline,
  IoPencilOutline,
  IoSpeedometerOutline,
  IoConstructOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

interface VehicleIntelligenceHeaderProps {
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    color: string
    licensePlate?: string | null
    primaryUse: string
    currentMileage: number | null
    isActive: boolean
    hasActiveClaim: boolean
  }
  summary: {
    headline: string
    status: 'EXCELLENT' | 'GOOD' | 'ATTENTION' | 'CRITICAL'
    color: string
    icon: string
  }
  complianceScore: number
  insuranceTier: number
}

export default function VehicleIntelligenceHeader({
  vehicle,
  summary,
  complianceScore,
  insuranceTier
}: VehicleIntelligenceHeaderProps) {
  
  const getStatusIcon = () => {
    switch (summary.icon) {
      case 'IoCheckmarkCircleOutline':
        return <IoCheckmarkCircleOutline className="w-6 h-6" />
      case 'IoWarningOutline':
        return <IoWarningOutline className="w-6 h-6" />
      case 'IoCloseCircleOutline':
        return <IoCloseCircleOutline className="w-6 h-6" />
      default:
        return <IoShieldCheckmarkOutline className="w-6 h-6" />
    }
  }

  const getStatusColor = () => {
    switch (summary.color) {
      case 'green':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'orange':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'red':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 50) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/host/cars"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Fleet</span>
          </Link>
          
          <Link
            href={`/host/cars/${vehicle.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <IoPencilOutline className="w-4 h-4" />
            Edit Vehicle
          </Link>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <IoCarOutline className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span>{vehicle.color}</span>
                {vehicle.licensePlate && (
                  <>
                    <span>•</span>
                    <span>{vehicle.licensePlate}</span>
                  </>
                )}
                {vehicle.currentMileage && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <IoSpeedometerOutline className="w-4 h-4" />
                      {vehicle.currentMileage.toLocaleString()} mi
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-col gap-2 items-end">
            {vehicle.hasActiveClaim && (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-1">
                <IoWarningOutline className="w-4 h-4" />
                Active Claim
              </span>
            )}
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
              vehicle.isActive 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
            }`}>
              {vehicle.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Intelligence Summary */}
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-start gap-3">
            <div className={`${summary.color === 'green' ? 'text-green-600 dark:text-green-400' : 
              summary.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
              summary.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              'text-red-600 dark:text-red-400'}`}>
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {summary.headline}
              </h3>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Compliance Score</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(complianceScore)}`}>
                    {complianceScore}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Usage Mode</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vehicle.primaryUse}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Revenue Tier</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {insuranceTier}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <Link
            href={`/host/cars/${vehicle.id}/edit?tab=insurance`}
            className="p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-center transition-colors"
          >
            <IoDocumentTextOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Insurance</span>
          </Link>
          
          <Link
            href={`/host/cars/${vehicle.id}/edit?tab=service`}
            className="p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-center transition-colors"
          >
            <IoConstructOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Service</span>
          </Link>
          
          <Link
            href={`/host/cars/${vehicle.id}/edit?tab=details`}
            className="p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-center transition-colors"
          >
            <IoCarOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Details</span>
          </Link>
          
          <Link
            href={`/host/cars/${vehicle.id}/edit?tab=pricing`}
            className="p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-center transition-colors"
          >
            <IoSpeedometerOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Pricing</span>
          </Link>
        </div>
      </div>
    </div>
  )
}