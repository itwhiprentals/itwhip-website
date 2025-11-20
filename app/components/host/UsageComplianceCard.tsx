// app/components/host/UsageComplianceCard.tsx

'use client'

import { useState } from 'react'
import { 
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoChevronForwardOutline,
  IoDocumentTextOutline,
  IoCarOutline,
  IoBusinessOutline,
  IoHomeOutline
} from 'react-icons/io5'

// ✅ FIXED IMPORTS
import { 
  getDeclarationConfig,
  DECLARATION_CONFIGS
} from '@/app/lib/constants/declarations'
import { 
  calculateMileageIntegrity,
  getGapSeverity
} from '@/app/lib/compliance/declaration-helpers'
import type { DeclarationType } from '@/app/types/compliance'

interface UsageComplianceCardProps {
  primaryUse: string
  complianceScore: number
  averageGap: number
  maxGap: number
  totalTrips: number
  insuranceType: string  // ✅ Changed from insuranceTier
  revenueSplit: number   // ✅ Added revenueSplit
  recommendations: string[]
  carId: string
}

export default function UsageComplianceCard({
  primaryUse,
  complianceScore,
  averageGap,
  maxGap,
  totalTrips,
  insuranceType,  // ✅ Now receiving insurance type
  revenueSplit,   // ✅ Now receiving revenue split
  recommendations,
  carId
}: UsageComplianceCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  // ✅ Calculate the correct tier based on insurance type
  const getTierFromInsurance = () => {
    const normalizedType = insuranceType.toLowerCase()
    if (normalizedType === 'commercial') return 90
    if (normalizedType === 'p2p') return 75
    return 40
  }
  
  const insuranceTier = getTierFromInsurance()

  // ✅ Use declaration system
  const declaration = primaryUse as DeclarationType
  const config = getDeclarationConfig(declaration)
  const mileageIntegrityScore = calculateMileageIntegrity(averageGap, declaration)
  const severity = getGapSeverity(averageGap, declaration)
  const isCompliant = averageGap <= config.maxGap

  // Get usage icon
  const getUsageIcon = () => {
    switch (primaryUse) {
      case 'Business':
        return <IoBusinessOutline className="w-5 h-5" />
      case 'Personal':
        return <IoHomeOutline className="w-5 h-5" />
      default:
        return <IoCarOutline className="w-5 h-5" />
    }
  }

  // Determine status styling based on severity
  let statusColor = 'green'
  let statusBg = 'bg-green-50 dark:bg-green-900/20'
  let statusBorder = 'border-green-200 dark:border-green-800'
  let statusText = 'text-green-700 dark:text-green-400'
  let statusIcon = IoCheckmarkCircleOutline
  let statusLabel = 'Compliant'

  if (severity === 'VIOLATION') {
    statusColor = 'red'
    statusBg = 'bg-red-50 dark:bg-red-900/20'
    statusBorder = 'border-red-200 dark:border-red-800'
    statusText = 'text-red-700 dark:text-red-400'
    statusIcon = IoAlertCircleOutline
    statusLabel = 'Non-Compliant'
  } else if (severity === 'CRITICAL') {
    statusColor = 'orange'
    statusBg = 'bg-orange-50 dark:bg-orange-900/20'
    statusBorder = 'border-orange-200 dark:border-orange-800'
    statusText = 'text-orange-700 dark:text-orange-400'
    statusIcon = IoWarningOutline
    statusLabel = 'At Risk'
  } else if (severity === 'WARNING') {
    statusColor = 'yellow'
    statusBg = 'bg-yellow-50 dark:bg-yellow-900/20'
    statusBorder = 'border-yellow-200 dark:border-yellow-800'
    statusText = 'text-yellow-700 dark:text-yellow-400'
    statusIcon = IoWarningOutline
    statusLabel = 'Warning'
  }

  const StatusIcon = statusIcon

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoShieldCheckmarkOutline className="w-5 h-5" />
          Usage Compliance
        </h3>
        
        {/* Compliance Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBg} ${statusText} flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />
          {statusLabel}
        </span>
      </div>

      {/* Two-Section Layout */}
      <div className="space-y-4">
        
        {/* SECTION 1: Earnings Tier (Locked) */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoLockClosedOutline className="w-4 h-4 text-gray-500" />
              Earnings Tier (Fixed)
            </h4>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {insuranceTier}%
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Based on your insurance level. Does not change with declaration.
          </p>
        </div>

        {/* SECTION 2: Declaration (Can Edit) */}
        <div className={`rounded-lg p-4 border-2 ${statusBorder} ${statusBg}`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getUsageIcon()}
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Usage Declaration
                </h4>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {config.label}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {config.description}
              </p>
            </div>
            
            {/* Mileage Integrity Score */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                mileageIntegrityScore >= 90 ? 'text-green-600 dark:text-green-400' :
                mileageIntegrityScore >= 75 ? 'text-blue-600 dark:text-blue-400' :
                mileageIntegrityScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {mileageIntegrityScore}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Integrity
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {config.maxGap}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Allowed</p>
            </div>
            
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
              <div className={`text-sm font-bold ${statusText}`}>
                {Math.round(averageGap)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Actual Avg</p>
            </div>
            
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.round(maxGap)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Max Gap</p>
            </div>
          </div>

          {/* Status Message */}
          {!isCompliant && totalTrips > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-xs ${statusText} flex items-start gap-1.5`}>
                <StatusIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Average gap exceeds limit by <span className="font-semibold">{Math.round(averageGap - config.maxGap)} miles</span>.
                  Claims may require additional review.
                </span>
              </p>
            </div>
          )}

          {isCompliant && totalTrips > 0 && (
            <div className="pt-3 border-t border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                <IoCheckmarkCircleOutline className="w-4 h-4" />
                <span className="font-medium">Excellent compliance with declared usage</span>
              </p>
            </div>
          )}

          {totalTrips === 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                <IoInformationCircleOutline className="w-4 h-4" />
                <span>No trips yet. Compliance will be calculated after your first rental.</span>
              </p>
            </div>
          )}
        </div>

        {/* Alternative Declarations (Show if non-compliant) */}
        {!isCompliant && totalTrips > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Consider Switching To:
            </h4>
            <div className="space-y-2">
              {(Object.keys(DECLARATION_CONFIGS) as DeclarationType[])
                .filter(key => key !== declaration)
                .map((key) => {
                  const altConfig = DECLARATION_CONFIGS[key]
                  const wouldComply = averageGap <= altConfig.maxGap
                  
                  return (
                    <div 
                      key={key}
                      className={`p-3 rounded-lg border ${
                        wouldComply 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {altConfig.label}
                            </span>
                            {wouldComply && (
                              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Max gap: {altConfig.maxGap} mi • {altConfig.insuranceBenefit}
                          </p>
                        </div>
                        {wouldComply && (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Compatible
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Tax & Insurance Details (Expandable) */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1">
                <IoInformationCircleOutline className="w-3.5 h-3.5" />
                Tax Implications
              </h5>
              <p className="text-xs text-blue-800 dark:text-blue-400">
                {config.taxImplication}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <h5 className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1">
                <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
                Insurance Coverage
              </h5>
              <p className="text-xs text-purple-800 dark:text-purple-400">
                {config.insuranceNote}
              </p>
            </div>

            {recommendations.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  Recommendations
                </h5>
                <ul className="space-y-1">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-xs text-yellow-800 dark:text-yellow-400 flex items-start gap-1.5">
                      <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors font-medium flex items-center justify-center gap-1"
        >
          {showDetails ? 'Hide Details' : 'Show Tax & Insurance Info'}
          <IoChevronForwardOutline className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </button>
      </div>
    </div>
  )
}