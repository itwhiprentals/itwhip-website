'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoLeafOutline,
  IoShieldCheckmarkOutline,
  IoBuildOutline,
  IoDocumentTextOutline,
  IoTrendingUpOutline,
  IoRibbonOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoCarSportOutline,
  IoFlashOutline
} from 'react-icons/io5'

interface ESGData {
  profile: {
    compositeScore: number
    grade: string
    scores: {
      safety: { score: number; grade: string }
      emissions: { score: number; grade: string }
      maintenance: { score: number; grade: string }
      compliance: { score: number; grade: string }
      drivingImpact: { score: number; grade: string }
    }
    environmental: {
      totalCO2Kg: number
      co2SavedKg: number
      evTrips: number
      evTripPercentage: number
    }
    carbonOffset: {
      totalCO2Tons: number
      estimatedCost: number
      isOffsetEnabled: boolean
    }
    fleet: {
      totalVehicles: number
      evVehicleCount: number
    }
    operations: {
      totalTrips: number
      incidentFreeRate: number
      currentIncidentStreak: number
    }
  }
  badges: Array<{
    badgeCode: string
    badgeName: string
    badgeIcon: string
    rarity: string
  }>
}

export default function ESGScoreCard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ESGData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchESGData()
  }, [])

  const fetchESGData = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/partner/esg')
      if (res.ok) {
        const result = await res.json()
        if (result.success) {
          setData(result)
        }
      }
    } catch (err) {
      console.error('Error fetching ESG data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30'
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <IoLeafOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ESG Score</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <IoLeafOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ESG Score</h3>
        </div>
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <IoLeafOutline className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p>ESG data not available yet.</p>
          <p className="text-sm mt-1">Complete trips to build your ESG profile.</p>
        </div>
      </div>
    )
  }

  const { profile, badges } = data

  const categoryIcons = {
    safety: IoShieldCheckmarkOutline,
    emissions: IoLeafOutline,
    maintenance: IoBuildOutline,
    compliance: IoDocumentTextOutline,
    drivingImpact: IoTrendingUpOutline
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <IoLeafOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">ESG Score</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Environmental, Social, Governance</p>
            </div>
          </div>
          <button
            onClick={fetchESGData}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IoRefreshOutline className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Main Score Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`relative w-16 h-16 rounded-full ${getScoreBg(profile.compositeScore)} flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-xl font-bold ${getScoreColor(profile.compositeScore)}`}>
                  {profile.compositeScore}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">/ 100</div>
              </div>
            </div>
            <div>
              <div className={`inline-flex px-2.5 py-1 rounded-full text-sm font-bold ${getGradeColor(profile.grade)}`}>
                {profile.grade}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profile.compositeScore >= 80 ? 'Excellent' :
                 profile.compositeScore >= 60 ? 'Good' :
                 profile.compositeScore >= 40 ? 'Fair' : 'Needs Improvement'}
              </p>
            </div>
          </div>
          <Link
            href="/partner/analytics?tab=esg"
            className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            Details
            <IoChevronForwardOutline className="w-3 h-3" />
          </Link>
        </div>

        {/* Score Categories */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[
            { key: 'safety', label: 'Safety', data: profile.scores.safety },
            { key: 'emissions', label: 'Emissions', data: profile.scores.emissions },
            { key: 'maintenance', label: 'Maint.', data: profile.scores.maintenance },
            { key: 'compliance', label: 'Comply', data: profile.scores.compliance },
            { key: 'drivingImpact', label: 'Impact', data: profile.scores.drivingImpact }
          ].map(({ key, label, data: scoreData }) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons]
            return (
              <div key={key} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${getScoreColor(scoreData.score)}`} />
                <div className={`text-xs font-bold ${getScoreColor(scoreData.score)}`}>
                  {scoreData.grade}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{label}</div>
              </div>
            )
          })}
        </div>

        {/* Environmental Impact */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <IoLeafOutline className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-[10px] text-green-700 dark:text-green-400">CO2 Saved</span>
            </div>
            <div className="text-sm font-bold text-green-700 dark:text-green-400">
              {(profile.environmental.co2SavedKg / 1000).toFixed(1)} tons
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <IoFlashOutline className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] text-blue-700 dark:text-blue-400">EV Trips</span>
            </div>
            <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
              {profile.environmental.evTripPercentage.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Carbon Offset CTA */}
        {profile.carbonOffset.totalCO2Tons > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 mb-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-800 dark:text-green-400">Carbon Offset</p>
                <p className="text-[10px] text-green-600 dark:text-green-500">
                  {profile.carbonOffset.totalCO2Tons.toFixed(1)} tons ~${profile.carbonOffset.estimatedCost.toFixed(0)}
                </p>
              </div>
              <button
                disabled
                className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg opacity-60 cursor-not-allowed"
              >
                Soon
              </button>
            </div>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Badges</h4>
              <IoRibbonOutline className="w-3.5 h-3.5 text-yellow-500" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {badges.slice(0, 3).map((badge) => (
                <span
                  key={badge.badgeCode}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    badge.rarity === 'LEGENDARY' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    badge.rarity === 'EPIC' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    badge.rarity === 'RARE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {badge.badgeName}
                </span>
              ))}
              {badges.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  +{badges.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Fleet Stats */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <IoCarSportOutline className="w-3.5 h-3.5" />
              <span>{profile.fleet.totalVehicles} vehicles</span>
            </div>
            <div className="flex items-center gap-1">
              <IoFlashOutline className="w-3.5 h-3.5 text-green-500" />
              <span>{profile.fleet.evVehicleCount} EV</span>
            </div>
          </div>
          <div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              {profile.operations.incidentFreeRate.toFixed(0)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400"> safe</span>
          </div>
        </div>
      </div>
    </div>
  )
}
