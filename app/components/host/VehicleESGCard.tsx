// app/components/host/VehicleESGCard.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoLeafOutline, 
  IoShieldCheckmarkOutline, 
  IoConstructOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFlashOutline,
  IoBatteryChargingOutline,
  IoWaterOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import ESGDetailModal from './ESGDetailModal'

interface VehicleESGCardProps {
  carId: string
  className?: string
}

interface VehicleESGData {
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    fuelType: string
    isActive: boolean
  }
  esg: {
    compositeScore: number
    safetyScore: number
    environmentalScore: number
    maintenanceScore: number
    lastCalculated: string
  }
  breakdown: {
    safety: {
      score: number
      totalTrips: number
      claimCount: number
      currentStreak: number
      status: string
    }
    environmental: {
      score: number
      category: 'EV' | 'HYBRID' | 'GAS'
      status: string
      estimatedCO2Impact: number
      totalCO2Impact?: number        // ✅ ADDED
      avgCO2PerMile?: number         // ✅ ADDED
    }
    maintenance: {
      score: number
      status: string
      isOverdue: boolean
      daysUntilService: number
    }
  }
  mileageAnalysis: {
    fraudRiskLevel: string
    mileageVariance: number
    suspiciousPatterns: number
  }
  recommendations: string[]
}

export default function VehicleESGCard({ carId, className = '' }: VehicleESGCardProps) {
  const [data, setData] = useState<VehicleESGData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchESGData()
  }, [carId])

  const fetchESGData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/host/cars/${carId}/esg`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (response.ok) {
        const esgData = await response.json()
        setData(esgData)
      } else {
        setError('Failed to load ESG data')
      }
    } catch (err) {
      console.error('Error fetching vehicle ESG:', err)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      
      const response = await fetch(`/api/host/cars/${carId}/esg`, {
        method: 'POST',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (response.ok) {
        await fetchESGData()
      }
    } catch (err) {
      console.error('Error refreshing ESG:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 50) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number): string => {
    if (score >= 85) return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
    if (score >= 70) return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
    if (score >= 50) return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
    return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 95) return 'Outstanding'
    if (score >= 90) return 'Excellent'
    if (score >= 85) return 'Very Good'
    if (score >= 75) return 'Good'
    if (score >= 70) return 'Above Average'
    if (score >= 60) return 'Average'
    if (score >= 50) return 'Fair'
    return 'Needs Improvement'
  }

  const getCategoryIcon = (category: string) => {
    if (category === 'EV') return <IoFlashOutline className="w-3 h-3" />
    if (category === 'HYBRID') return <IoBatteryChargingOutline className="w-3 h-3" />
    return <IoWaterOutline className="w-3 h-3" />
  }

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ')
  }

  const getStatusExplanation = (status: string, score: number): string => {
    const formattedStatus = formatStatus(status)
    
    if (score >= 85) {
      return `${formattedStatus}: Your vehicle maintains excellent standards. Keep up the great work!`
    } else if (score >= 70) {
      return `${formattedStatus}: Good performance overall. Minor improvements recommended.`
    } else if (score >= 50) {
      return `${formattedStatus}: Fair performance. Addressing issues will improve your score.`
    } else {
      return `${formattedStatus}: Immediate attention required. Resolving issues is critical for safety and compliance.`
    }
  }

  const getTripQualityLabel = (totalTrips: number, incidentFreeRate: number) => {
    if (totalTrips === 0) {
      return { label: 'No trips yet', sublabel: 'Ready to start', color: 'text-gray-500 dark:text-gray-500' }
    }
    
    if (totalTrips === 1) {
      return { label: '1 trip', sublabel: 'Building record', color: 'text-blue-600 dark:text-blue-400' }
    }
    
    if (totalTrips < 5) {
      if (incidentFreeRate >= 0.75) {
        return { label: `${totalTrips} trips`, sublabel: 'Excellent start', color: 'text-green-600 dark:text-green-400' }
      } else {
        return { label: `${totalTrips} trips`, sublabel: 'Building record', color: 'text-blue-600 dark:text-blue-400' }
      }
    }
    
    if (totalTrips < 10) {
      if (incidentFreeRate >= 0.9) {
        return { label: `${totalTrips} trips`, sublabel: 'Outstanding', color: 'text-green-600 dark:text-green-400' }
      } else if (incidentFreeRate >= 0.75) {
        return { label: `${totalTrips} trips`, sublabel: 'Excellent history', color: 'text-green-600 dark:text-green-400' }
      } else {
        return { label: `${totalTrips} trips`, sublabel: 'Experienced host', color: 'text-gray-700 dark:text-gray-300' }
      }
    }
    
    if (incidentFreeRate >= 0.9) {
      return { label: `${totalTrips} trips`, sublabel: 'Proven excellence', color: 'text-green-600 dark:text-green-400' }
    } else if (incidentFreeRate >= 0.75) {
      return { label: `${totalTrips} trips`, sublabel: 'Veteran host', color: 'text-green-600 dark:text-green-400' }
    } else {
      return { label: `${totalTrips} trips`, sublabel: 'Experienced', color: 'text-gray-700 dark:text-gray-300' }
    }
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <IoWarningOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              Unable to load ESG data
            </p>
            <button
              onClick={fetchESGData}
              className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const incidentFreeRate = data.breakdown.safety.totalTrips > 0
    ? (data.breakdown.safety.totalTrips - data.breakdown.safety.claimCount) / data.breakdown.safety.totalTrips
    : 0

  const tripQuality = getTripQualityLabel(data.breakdown.safety.totalTrips, incidentFreeRate)

  // ✅ FIXED: Convert vehicle ESG data to profile format for modal with proper CO2 fields
  const profileData = {
    compositeScore: data.esg.compositeScore,
    safetyScore: data.esg.safetyScore,
    drivingImpactScore: 0, // Not available in vehicle ESG
    emissionsScore: data.esg.environmentalScore,
    maintenanceScore: data.esg.maintenanceScore,
    complianceScore: 100, // Default
    totalTrips: data.breakdown.safety.totalTrips,
    incidentFreeTrips: data.breakdown.safety.totalTrips - data.breakdown.safety.claimCount,
    currentIncidentStreak: data.breakdown.safety.currentStreak,
    totalClaimsFiled: data.breakdown.safety.claimCount,
    evTripPercentage: 0,
    totalCO2Impact: data.breakdown.environmental.totalCO2Impact || data.breakdown.environmental.estimatedCO2Impact || 0, // ✅ FIXED
    avgCO2PerMile: data.breakdown.environmental.avgCO2PerMile || 0, // ✅ ADDED
    estimatedCO2Saved: 0, // Vehicle ESG doesn't track CO2 saved (only host-level does)
    claimResponseRate: 1,
    avgResponseTimeHours: 12.5,
    maintenanceOnTime: !data.breakdown.maintenance.isOverdue,
    unauthorizedMileage: 0,
    totalMilesDriven: 0, // ✅ ADDED (not available at vehicle level)
    tripCompletionRate: 100, // ✅ ADDED (default for vehicle level)
    lastCalculatedAt: data.esg.lastCalculated,
    dataConfidence: 'High'
  }

  return (
    <>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${className}`}
        onClick={() => setShowModal(true)}
      >
        {/* Header with Branding */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <IoCarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  ESG Fleet Governance Score
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Insurance-grade compliance tracking
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRefresh()
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh scores"
            >
              <IoRefreshOutline 
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>

          {/* Overall Score Display */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall ESG Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {data.esg.compositeScore}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                </div>
                <p className={`text-xs font-medium mt-1 ${getScoreColor(data.esg.compositeScore)}`}>
                  {getScoreLabel(data.esg.compositeScore)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  data.vehicle.fuelType.toLowerCase() === 'electric' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                    : data.vehicle.fuelType.toLowerCase().includes('hybrid')
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                }`}>
                  {getCategoryIcon(data.breakdown.environmental.category)}
                  <span className="ml-1">{data.breakdown.environmental.category}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <IoCalendarOutline className="w-3 h-3" />
                  <span>{new Date(data.esg.lastCalculated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="p-4 sm:p-5 grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-900/50">
          {/* Safety Score */}
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 mb-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data.esg.safetyScore}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Safety</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {data.breakdown.safety.currentStreak} streak
            </p>
          </div>

          {/* Environmental Score */}
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-2">
              <IoLeafOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data.esg.environmentalScore}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Environmental</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {data.breakdown.environmental.estimatedCO2Impact}kg
            </p>
          </div>

          {/* Maintenance Score */}
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 mb-2">
              <IoConstructOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data.esg.maintenanceScore}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Governance</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {data.breakdown.maintenance.isOverdue ? 'Overdue' : 'Current'}
            </p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="px-4 sm:px-5 py-3 border-y border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Completed Trips</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {data.breakdown.safety.totalTrips}
              </p>
              <p className={`text-xs mt-0.5 ${tripQuality.color}`}>
                {tripQuality.sublabel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Claims</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {data.breakdown.safety.claimCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Incident-Free</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {Math.round(incidentFreeRate * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className={`text-sm font-semibold ${
                data.breakdown.maintenance.isOverdue 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {data.breakdown.maintenance.isOverdue ? 'Overdue' : `${data.breakdown.maintenance.daysUntilService}d`}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="px-4 sm:px-5 py-3 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/20">
            <div className="flex items-start gap-2">
              <IoTrendingUpOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                    Compliance Recommendations
                  </p>
                  <div className="relative group">
                    <IoInformationCircleOutline className="w-3 h-3 text-blue-600 dark:text-blue-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg">
                      <p>Based on your vehicle's compliance metrics. Addressing these items improves insurance underwriting status.</p>
                      <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {data.recommendations.slice(0, 2).map((rec, idx) => (
                    <li key={idx} className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-1">
                      <IoCheckmarkCircleOutline className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Details */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="w-full px-4 sm:px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {expanded ? 'Hide' : 'Show'} Detailed Breakdown
            </span>
            {expanded ? (
              <IoChevronUpOutline className="w-4 h-4 text-gray-400" />
            ) : (
              <IoChevronDownOutline className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expanded && (
            <div className="px-4 sm:px-5 pb-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {/* Safety Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Safety Compliance</h4>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">Status:</span>
                    <div className="text-right flex-1 min-w-0">
                      <p className={`text-xs font-medium ${getScoreColor(data.breakdown.safety.score)}`}>
                        {formatStatus(data.breakdown.safety.status)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 break-words">
                        {getStatusExplanation(data.breakdown.safety.status, data.breakdown.safety.score)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Claim-free streak:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {data.breakdown.safety.currentStreak} trips
                    </span>
                  </div>
                </div>
              </div>

              {/* Environmental Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <IoLeafOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Environmental Impact</h4>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Fuel Type:</span>
                    <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                      {getCategoryIcon(data.breakdown.environmental.category)}
                      <span>{data.breakdown.environmental.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Annual CO₂:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {data.breakdown.environmental.estimatedCO2Impact} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <IoConstructOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Governance & Maintenance</h4>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <div className="flex items-center gap-1">
                      {data.breakdown.maintenance.isOverdue ? (
                        <IoWarningOutline className="w-3 h-3 text-red-500" />
                      ) : (
                        <IoCheckmarkCircleOutline className="w-3 h-3 text-green-500" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatStatus(data.breakdown.maintenance.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {data.breakdown.maintenance.isOverdue ? 'Overdue:' : 'Next Service:'}
                    </span>
                    <span className={`font-medium ${data.breakdown.maintenance.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {Math.abs(data.breakdown.maintenance.daysUntilService)} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Click to view details */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click to view full governance details
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ESGDetailModal
          profile={profileData}
          hostId={localStorage.getItem('hostId') || ''}
          carId={carId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}