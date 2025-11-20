// app/components/claims/ClaimESGSummary.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  IoShieldCheckmarkOutline,
  IoTrophyOutline,
  IoLeafOutline,
  IoConstructOutline,
  IoSpeedometerOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5'

interface ESGProfile {
  compositeScore: number
  safetyScore: number
  emissionsScore: number
  complianceScore: number
  drivingImpactScore: number
  maintenanceScore: number
  
  totalTrips: number
  incidentFreeTrips: number
  currentIncidentStreak: number
  totalClaimsFiled: number
  
  evTripPercentage: number
  totalCO2Impact: number
  avgCO2PerMile: number
  estimatedCO2Saved: number
  
  claimResponseRate: number
  avgResponseTimeHours: number
  maintenanceOnTime: boolean
  unauthorizedMileage: number
  
  totalMilesDriven: number
  tripCompletionRate: number
  
  lastCalculatedAt: string
}

export default function ClaimESGSummary() {
  const [profile, setProfile] = useState<ESGProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchESGProfile()
  }, [])

  const fetchESGProfile = async () => {
    try {
      const response = await fetch('/api/host/esg/profile', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.profile) {
          setProfile(result.data.profile)
        }
      }
    } catch (error) {
      console.error('Error fetching ESG profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-800 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <IoTrophyOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        Host Safety & ESG Profile
      </h3>

      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Overall ESG Score</span>
          <span className={`text-xs font-medium ${getScoreColor(profile.compositeScore)}`}>
            {getScoreLabel(profile.compositeScore)}
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className={`text-3xl font-bold ${getScoreColor(profile.compositeScore)}`}>
            {profile.compositeScore}
          </span>
          <span className="text-lg text-gray-500 dark:text-gray-400 mb-1">/100</span>
        </div>
      </div>

      {/* Safety Metrics */}
      <div className="space-y-2 mb-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">Safety: {profile.safetyScore}/100</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Incident-Free Trips:</span>
              <span className="font-medium text-gray-900 dark:text-white">{profile.incidentFreeTrips || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
              <span className="font-medium text-gray-900 dark:text-white">{profile.currentIncidentStreak || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Claims:</span>
              <span className="font-medium text-gray-900 dark:text-white">{profile.totalClaimsFiled || 0}</span>
            </div>
          </div>
        </div>

        {/* Environmental */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoLeafOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">Environmental: {profile.emissionsScore}/100</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">EV Usage:</span>
              <span className="font-medium text-gray-900 dark:text-white">{((profile.evTripPercentage || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">CO2 Impact:</span>
              <span className="font-medium text-gray-900 dark:text-white">{(profile.totalCO2Impact || 0).toFixed(0)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg CO2/Mile:</span>
              <span className="font-medium text-gray-900 dark:text-white">{(profile.avgCO2PerMile || 0).toFixed(2)} kg</span>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">Compliance: {profile.complianceScore}/100</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Response Rate:</span>
              <span className="font-medium text-gray-900 dark:text-white">{((profile.claimResponseRate || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">{(profile.avgResponseTimeHours || 0).toFixed(1)}h avg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Maintenance:</span>
              <span className={`font-medium ${profile.maintenanceOnTime ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {profile.maintenanceOnTime ? 'On-Schedule' : 'Overdue'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Unauthorized Miles:</span>
              <span className={`font-medium ${(profile.unauthorizedMileage || 0) === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(profile.unauthorizedMileage || 0) === 0 ? 'None' : `${profile.unauthorizedMileage} mi`}
              </span>
            </div>
          </div>
        </div>

        {/* Driving Impact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <IoSpeedometerOutline className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">Driving: {profile.drivingImpactScore}/100</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Miles:</span>
              <span className="font-medium text-gray-900 dark:text-white">{(profile.totalMilesDriven || 0).toLocaleString()} mi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trip Completion:</span>
              <span className="font-medium text-gray-900 dark:text-white">{(profile.tripCompletionRate || 0).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Footer */}
      <div className="pt-3 border-t border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <IoTimeOutline className="w-3 h-3" />
          <span>
            Last Updated: {new Date(profile.lastCalculatedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          ✓ Verified by ItWhip Data Intelligence
        </div>
      </div>
    </div>
  )
}