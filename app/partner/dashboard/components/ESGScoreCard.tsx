'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Leaf,
  Shield,
  Wrench,
  FileCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Loader2,
  RefreshCcw,
  Car,
  Zap
} from 'lucide-react'

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
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100'
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100'
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">ESG Score</h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">ESG Score</h3>
        </div>
        <div className="text-center py-6 text-gray-500">
          <p>ESG data not available yet.</p>
          <p className="text-sm mt-1">Complete trips to build your ESG profile.</p>
        </div>
      </div>
    )
  }

  const { profile, badges } = data

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">ESG Score</h3>
            <p className="text-sm text-gray-500">Environmental, Social, Governance</p>
          </div>
        </div>
        <button
          onClick={fetchESGData}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Score Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`relative w-20 h-20 rounded-full ${getScoreBg(profile.compositeScore)} flex items-center justify-center`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(profile.compositeScore)}`}>
                {profile.compositeScore}
              </div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
          </div>
          <div>
            <div className={`inline-flex px-3 py-1 rounded-full text-lg font-bold ${getGradeColor(profile.grade)}`}>
              {profile.grade}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {profile.compositeScore >= 80 ? 'Excellent' :
               profile.compositeScore >= 60 ? 'Good' :
               profile.compositeScore >= 40 ? 'Fair' : 'Needs Improvement'}
            </p>
          </div>
        </div>
        <Link
          href="/partner/analytics?tab=esg"
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
        >
          Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Score Categories */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {[
          { key: 'safety', label: 'Safety', icon: Shield, data: profile.scores.safety },
          { key: 'emissions', label: 'Emissions', icon: Leaf, data: profile.scores.emissions },
          { key: 'maintenance', label: 'Maintenance', icon: Wrench, data: profile.scores.maintenance },
          { key: 'compliance', label: 'Compliance', icon: FileCheck, data: profile.scores.compliance },
          { key: 'drivingImpact', label: 'Impact', icon: TrendingUp, data: profile.scores.drivingImpact }
        ].map(({ key, label, icon: Icon, data: scoreData }) => (
          <div key={key} className="text-center p-2 bg-gray-50 rounded-lg">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${getScoreColor(scoreData.score)}`} />
            <div className={`text-sm font-bold ${getScoreColor(scoreData.score)}`}>
              {scoreData.grade}
            </div>
            <div className="text-xs text-gray-500 truncate">{label}</div>
          </div>
        ))}
      </div>

      {/* Environmental Impact */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Environmental Impact</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">CO2 Saved</span>
            </div>
            <div className="text-lg font-bold text-green-700">
              {(profile.environmental.co2SavedKg / 1000).toFixed(1)} tons
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700">EV Trips</span>
            </div>
            <div className="text-lg font-bold text-blue-700">
              {profile.environmental.evTripPercentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Offset CTA */}
      {profile.carbonOffset.totalCO2Tons > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Carbon Offset Available</p>
              <p className="text-xs text-green-600">
                Offset {profile.carbonOffset.totalCO2Tons.toFixed(1)} tons CO2 for ~${profile.carbonOffset.estimatedCost.toFixed(0)}
              </p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg opacity-60 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Powered by Stripe Climate - verified carbon removal
          </p>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Earned Badges</h4>
            <Award className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 4).map((badge) => (
              <span
                key={badge.badgeCode}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  badge.rarity === 'LEGENDARY' ? 'bg-purple-100 text-purple-700' :
                  badge.rarity === 'EPIC' ? 'bg-yellow-100 text-yellow-700' :
                  badge.rarity === 'RARE' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {badge.badgeName}
              </span>
            ))}
            {badges.length > 4 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{badges.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Fleet Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span>{profile.fleet.totalVehicles} vehicles</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-green-500" />
            <span>{profile.fleet.evVehicleCount} EV</span>
          </div>
        </div>
        <div>
          <span className="text-green-600 font-medium">
            {profile.operations.incidentFreeRate.toFixed(0)}%
          </span>
          <span className="text-gray-500"> incident-free</span>
        </div>
      </div>
    </div>
  )
}
