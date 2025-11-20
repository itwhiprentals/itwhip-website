// app/components/host/ESGDashboardCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { 
  IoTrophyOutline, 
  IoLeafOutline, 
  IoShieldCheckmarkOutline,
  IoGlobeOutline,
  IoWarningOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline
} from 'react-icons/io5'
import ESGDetailModal from './ESGDetailModal'
import { 
  INDUSTRY_BENCHMARKS, 
  compareToIndustry, 
  estimatePercentile,
  getPercentileLabel,
  formatCO2WithContext
} from '@/app/lib/esg/esg-helpers'

interface ESGProfile {
  compositeScore: number
  safetyScore: number
  drivingImpactScore: number
  emissionsScore: number
  maintenanceScore: number
  complianceScore: number
  totalTrips: number
  incidentFreeTrips: number
  currentIncidentStreak: number
  totalClaimsFiled: number
  evTripPercentage: number
  estimatedCO2Saved: number
  claimResponseRate: number
  avgResponseTimeHours: number
  maintenanceOnTime: boolean
  unauthorizedMileage: number
  lastCalculatedAt: string
  dataConfidence: string
}

export default function ESGDashboardCard() {
  const [profile, setProfile] = useState<ESGProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchESGProfile()
  }, [])

  const fetchESGProfile = async () => {
    try {
      const response = await fetch('/api/host/esg/profile', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ESG profile: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data?.profile) {
        setProfile(result.data.profile)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching ESG profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load ESG data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
        <div className="text-center py-6">
          <IoWarningOutline className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {error || 'ESG data not available'}
          </p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 50) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Outstanding'
    if (score >= 85) return 'Excellent'
    if (score >= 75) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Above Average'
    if (score >= 50) return 'Average'
    return 'Needs Improvement'
  }

  // ✅ NEW: Calculate benchmark comparisons
  const safetyComparison = compareToIndustry(
    profile.safetyScore,
    INDUSTRY_BENCHMARKS.safety.industryAvg
  )

  const percentile = estimatePercentile(profile.compositeScore)
  const percentileLabel = getPercentileLabel(percentile)

  const co2Context = formatCO2WithContext(profile.estimatedCO2Saved)

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4 cursor-pointer hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IoGlobeOutline className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
            <span className="hidden sm:inline">ESG Trust Score</span>
            <span className="sm:hidden">ESG Score</span>
          </h2>
          <div className="text-right">
            <div className={`text-xl md:text-2xl font-bold ${getScoreColor(profile.compositeScore)}`}>
              {profile.compositeScore}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">
              {getScoreLabel(profile.compositeScore)}
            </div>
          </div>
        </div>

        {/* ✅ NEW: Percentile Badge */}
        {percentile >= 75 && (
          <div className="mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-full">
              <IoTrophyOutline className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                {percentileLabel}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3 md:mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getProgressColor(profile.compositeScore)} transition-all duration-500`}
              style={{ width: `${profile.compositeScore}%` }}
            ></div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
          {/* Safety Score with Benchmark */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 md:gap-1.5 mb-1">
              <IoShieldCheckmarkOutline className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">Safety</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`text-lg md:text-xl font-bold ${getScoreColor(profile.safetyScore)}`}>
                {profile.safetyScore}
              </div>
              {/* ✅ NEW: Industry comparison indicator */}
              {safetyComparison.isAboveAverage ? (
                <IoTrendingUpOutline className="w-3 h-3 text-green-500" title={safetyComparison.label} />
              ) : (
                <IoTrendingDownOutline className="w-3 h-3 text-orange-500" title={safetyComparison.label} />
              )}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {profile.currentIncidentStreak} trips
            </div>
          </div>

          {/* Environment Score */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 md:gap-1.5 mb-1">
              <IoLeafOutline className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">Environment</span>
            </div>
            <div className={`text-lg md:text-xl font-bold ${getScoreColor(profile.emissionsScore)}`}>
              {profile.emissionsScore}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {Math.round(profile.evTripPercentage * 100)}% EV
            </div>
          </div>

          {/* Compliance Score */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 md:gap-1.5 mb-1">
              <IoTrophyOutline className="w-3 h-3 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">Compliance</span>
            </div>
            <div className={`text-lg md:text-xl font-bold ${getScoreColor(profile.complianceScore)}`}>
              {profile.complianceScore}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {Math.round(profile.claimResponseRate * 100)}%
            </div>
          </div>
        </div>

        {/* ✅ NEW: CO2 Impact Highlight (if significant) */}
        {profile.estimatedCO2Saved > 50 && (
          <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IoLeafOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs font-semibold text-green-900 dark:text-green-200">
                    {co2Context.primary} saved
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ≈ {co2Context.trees}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 grid grid-cols-2 gap-2 md:gap-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Incident-Free</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {profile.incidentFreeTrips}/{profile.totalTrips}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Claims Filed</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {profile.totalClaimsFiled}
            </p>
          </div>
        </div>

        {/* ✅ NEW: Industry Comparison Summary */}
        {safetyComparison.isAboveAverage && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <IoTrendingUpOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-900 dark:text-blue-200">
                <span className="font-semibold">{safetyComparison.percentDifference}% above</span> industry average safety
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-3 text-center">
          <span className="text-xs md:text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
            View Full Breakdown →
          </span>
        </div>
      </div>

      {showModal && (
        <ESGDetailModal
          profile={profile}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}