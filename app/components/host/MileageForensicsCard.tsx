// app/components/host/MileageForensicsCard.tsx

'use client'

import { useState } from 'react'
import { 
  IoSpeedometerOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoCarOutline,
  IoFlagOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import { formatMileageGap } from '@/app/lib/mileage/rules'

interface MileageGap {
  bookingId: string
  bookingCode: string
  tripEndDate: Date
  tripEndMileage: number
  nextTripStartDate: Date
  nextTripStartMileage: number
  gapMiles: number
  gapDays: number
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'VIOLATION'
  flagged: boolean
  explanation?: string
}

interface MileageAnomaly {
  type: 'REVERSE' | 'EXCESSIVE_GAP' | 'IMPOSSIBLE_SPEED' | 'PATTERN_CHANGE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  detectedAt: Date
  mileageReported: number
  mileageExpected: number
  bookingId?: string
  requiresInvestigation: boolean
}

interface ForensicAnalysis {
  gaps: MileageGap[]
  anomalies: MileageAnomaly[]
  totalMileage: number
  rentalMileage: number
  unaccountedMileage: number
  averageGapSize: number
  maxGap: number
  complianceRate: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  insuranceImpact: string
  recommendations: string[]
}

interface MileageForensicsCardProps {
  analysis: ForensicAnalysis
  primaryUse: string
  carId: string
}

export default function MileageForensicsCard({
  analysis,
  primaryUse,
  carId
}: MileageForensicsCardProps) {
  const [showAllGaps, setShowAllGaps] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'VIOLATION':
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400'
      case 'WARNING':
      case 'HIGH':
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-green-600 dark:text-green-400'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'VIOLATION':
      case 'CRITICAL':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'WARNING':
      case 'HIGH':
      case 'MEDIUM':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    }
  }

  const getRiskLevelDisplay = () => {
    switch (analysis.riskLevel) {
      case 'CRITICAL':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'Critical Risk'
        }
      case 'HIGH':
        return {
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-100 dark:bg-orange-900/20',
          text: 'High Risk'
        }
      case 'MEDIUM':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'Medium Risk'
        }
      default:
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'Low Risk'
        }
    }
  }

  const riskLevel = getRiskLevelDisplay()
  const displayGaps = showAllGaps ? analysis.gaps : analysis.gaps.slice(0, 3)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoSpeedometerOutline className="w-5 h-5" />
          Mileage Forensics
        </h3>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${riskLevel.bg} ${riskLevel.color}`}>
          {riskLevel.text}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Mileage</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {analysis.totalMileage.toLocaleString()} mi
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Rental Miles</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {analysis.rentalMileage.toLocaleString()} mi
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Unaccounted</p>
          <p className={`text-lg font-semibold ${analysis.unaccountedMileage > 500 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {analysis.unaccountedMileage.toLocaleString()} mi
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg Gap</p>
          <p className={`text-lg font-semibold ${analysis.averageGapSize > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
            {analysis.averageGapSize} mi
          </p>
        </div>
      </div>

      {/* Compliance Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Compliance Rate
          </span>
          <span className={`text-sm font-bold ${
            analysis.complianceRate >= 90 ? 'text-green-600 dark:text-green-400' :
            analysis.complianceRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {analysis.complianceRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              analysis.complianceRate >= 90 ? 'bg-green-500' :
              analysis.complianceRate >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${analysis.complianceRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Based on {primaryUse} mode thresholds
        </p>
      </div>

      {/* Anomalies Alert */}
      {analysis.anomalies.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                {analysis.anomalies.length} Anomal{analysis.anomalies.length === 1 ? 'y' : 'ies'} Detected
              </h4>
              <div className="space-y-1">
                {analysis.anomalies.map((anomaly, index) => (
                  <div key={index} className="text-xs text-red-700 dark:text-red-400">
                    <span className={`font-medium ${getSeverityColor(anomaly.severity)}`}>
                      [{anomaly.severity}]
                    </span> {anomaly.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Impact */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Insurance Impact
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {analysis.insuranceImpact}
            </p>
          </div>
        </div>
      </div>

      {/* Mileage Gaps */}
      {analysis.gaps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Mileage Gaps Between Trips
          </h4>
          <div className="space-y-2">
            {displayGaps.map((gap) => (
              <div 
                key={gap.bookingId} 
                className={`p-3 rounded-lg border ${gap.flagged ? getSeverityBg(gap.severity) : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {gap.flagged ? (
                        gap.severity === 'VIOLATION' || gap.severity === 'CRITICAL' ? (
                          <IoCloseCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <IoWarningOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        )
                      ) : (
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatMileageGap(gap.gapMiles)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                        gap.flagged 
                          ? gap.severity === 'VIOLATION' || gap.severity === 'CRITICAL'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                          : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      }`}>
                        {gap.severity}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      After {gap.bookingCode} • {gap.gapDays} days between trips
                    </div>
                    {gap.explanation && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 italic">
                        {gap.explanation}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-500">
                    {gap.tripEndMileage.toLocaleString()} → {gap.nextTripStartMileage.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {analysis.gaps.length > 3 && (
            <button
              onClick={() => setShowAllGaps(!showAllGaps)}
              className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              {showAllGaps ? 'Show Less' : `Show ${analysis.gaps.length - 3} More Gaps`}
            </button>
          )}
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                <IoFlagOutline className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}