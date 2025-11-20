// app/components/host/ESGDetailModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { IoClose, IoShieldCheckmarkOutline, IoLeafOutline, IoCarOutline, IoCheckmarkCircleOutline, IoTrophyOutline, IoTrendingUpOutline, IoInformationCircleOutline, IoFlashOutline, IoBatteryChargingOutline, IoWaterOutline, IoConstructOutline } from 'react-icons/io5'
import FleetCompositionChart from './FleetCompositionChart'
import GovernanceDetailPanel from './GovernanceDetailPanel'

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
  metrics?: {
    safety: {
      totalTrips: number
      incidentFreeTrips: number
      totalClaimsFiled: number
      currentStreak: number
      longestStreak: number
      lastIncidentDate: string | null
    }
    drivingImpact: {
      totalMiles: number
      avgMilesPerTrip: number
      completionRate: number
      unauthorizedMileage: number
      lateReturns: number
    }
    environmental: {
      totalEVTrips: number
      evTripPercentage: number
      estimatedCO2Saved: number
      fuelEfficiencyRating: string
    }
    maintenance: {
      onTime: boolean
      lastMaintenanceDate: string | null
      overdueCount: number
    }
    compliance: {
      responseRate: number
      avgResponseTimeHours: number
    }
    fleet: {
      totalVehicles: number
      activeVehicles: number
      evVehicleCount: number
      avgVehicleAge: number
    }
  }
}

interface Badge {
  badgeCode: string
  badgeName: string
  badgeIcon: string
  earnedAt: string
  rarity: string
}

interface ESGDetailModalProps {
  profile: ESGProfile
  hostId: string
  carId?: string // ⭐ NEW: Optional vehicle ID for vehicle-specific view
  onClose: () => void
}

export default function ESGDetailModal({ profile: initialProfile, hostId, carId, onClose }: ESGDetailModalProps) {
  const [fullProfile, setFullProfile] = useState<ESGProfile | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'governance' | 'fleet' | 'badges'>('overview')

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    fetchFullProfile()

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      document.body.style.overflow = 'unset'
    }
  }, [])

  const fetchFullProfile = async () => {
    try {
      const response = await fetch('/api/host/esg/profile', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setFullProfile(result.data.profile)
          setBadges(result.data.badges || [])
          setHistory(result.data.history || [])
        }
      }
    } catch (err) {
      console.error('Error fetching full ESG profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const profile = fullProfile || initialProfile

  // Helper functions
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 50) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-600 dark:text-yellow-400'
      case 'EPIC': return 'text-purple-600 dark:text-purple-400'
      case 'RARE': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  // ⭐ NEW: Conditionally show tabs based on view type
  const showFleetTab = !carId // Only show fleet tab for host-level view
  const showBadgesTab = !carId // Only show badges tab for host-level view

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal/Bottom Sheet */}
      <div className={`
        relative w-full bg-white dark:bg-gray-800 
        ${isMobile 
          ? 'rounded-t-2xl h-[85vh] animate-slide-up' 
          : 'rounded-lg max-w-4xl max-h-[90vh] mx-4'
        }
        overflow-hidden shadow-xl flex flex-col
      `}>
        {/* Mobile Drag Indicator */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        )}

        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {carId ? 'Vehicle ESG Score' : 'ESG Trust Score'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Updated {formatDate(profile.lastCalculatedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'governance'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Governance
            </button>
            {showFleetTab && (
              <button
                onClick={() => setActiveTab('fleet')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'fleet'
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Fleet
              </button>
            )}
            {showBadgesTab && (
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'badges'
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Badges
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Overall Score */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Overall Score</p>
                      <p className={`text-3xl font-bold mt-1 ${getScoreColor(profile.compositeScore)}`}>
                        {profile.compositeScore}/100
                      </p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                        {getScoreLabel(profile.compositeScore)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Confidence</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {profile.dataConfidence}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety Score */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Safety Score</h3>
                      <p className={`text-xl font-bold ${getScoreColor(profile.safetyScore)}`}>
                        {profile.safetyScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Trips</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.safety.totalTrips || profile.totalTrips}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Incident-Free</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.safety.incidentFreeTrips || profile.incidentFreeTrips}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current Streak</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.safety.currentStreak || profile.currentIncidentStreak}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Longest Streak</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.safety.longestStreak || profile.currentIncidentStreak}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Claims Filed</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.safety.totalClaimsFiled || profile.totalClaimsFiled}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Last Incident</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(profile.metrics?.safety.lastIncidentDate || null)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driving Impact Score */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCarOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Driving Impact</h3>
                      <p className={`text-xl font-bold ${getScoreColor(profile.drivingImpactScore)}`}>
                        {profile.drivingImpactScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Miles</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.drivingImpact.totalMiles.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg/Trip</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round(profile.metrics?.drivingImpact.avgMilesPerTrip || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completion</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round(profile.metrics?.drivingImpact.completionRate || 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Unauthorized</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round(profile.metrics?.drivingImpact.unauthorizedMileage || profile.unauthorizedMileage)} mi
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Late Returns</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.drivingImpact.lateReturns || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Environmental Score */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IoLeafOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Environmental</h3>
                      <p className={`text-xl font-bold ${getScoreColor(profile.emissionsScore)}`}>
                        {profile.emissionsScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">EV Trips</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.environmental.totalEVTrips || Math.round((profile.evTripPercentage * profile.totalTrips))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">EV %</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round((profile.metrics?.environmental.evTripPercentage || profile.evTripPercentage) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">CO2 Saved</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round(profile.metrics?.environmental.estimatedCO2Saved || profile.estimatedCO2Saved)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Efficiency</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.environmental.fuelEfficiencyRating || 'Good'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Maintenance Score */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Maintenance</h3>
                      <p className={`text-xl font-bold ${getScoreColor(profile.maintenanceScore)}`}>
                        {profile.maintenanceScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.maintenance.onTime || profile.maintenanceOnTime ? 'On-Time' : 'Overdue'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Last Service</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(profile.metrics?.maintenance.lastMaintenanceDate || null)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile.metrics?.maintenance.overdueCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compliance Score */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IoTrophyOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Compliance</h3>
                      <p className={`text-xl font-bold ${getScoreColor(profile.complianceScore)}`}>
                        {profile.complianceScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Response Rate</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round((profile.metrics?.compliance.responseRate || profile.claimResponseRate) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg Time</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(profile.metrics?.compliance.avgResponseTimeHours || profile.avgResponseTimeHours).toFixed(1)}h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Docs</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Complete
                      </p>
                    </div>
                  </div>
                </div>

                {/* Improvement Tips */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IoTrendingUpOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Improvement Tips</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {profile.currentIncidentStreak < 50 && (
                      <li className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Build your incident-free streak</span>
                      </li>
                    )}
                    {profile.evTripPercentage < 0.25 && (
                      <li className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Add electric vehicles to boost environmental score</span>
                      </li>
                    )}
                    {!profile.maintenanceOnTime && (
                      <li className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Stay on schedule with maintenance</span>
                      </li>
                    )}
                    {profile.compositeScore >= 85 && (
                      <li className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Excellent work! Keep it up</span>
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}

            {/* GOVERNANCE TAB */}
            {activeTab === 'governance' && (
              <GovernanceDetailPanel 
                hostId={hostId}
                carId={carId}
                profile={profile}
              />
            )}

            {/* FLEET TAB */}
            {activeTab === 'fleet' && showFleetTab && (
              <FleetCompositionChart hostId={hostId} />
            )}

            {/* BADGES TAB */}
            {activeTab === 'badges' && showBadgesTab && (
              <>
                {badges.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <IoTrophyOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Your Achievements ({badges.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {badges.map((badge) => (
                        <div
                          key={badge.badgeCode}
                          className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                        >
                          <div className="text-3xl mb-2">{badge.badgeIcon}</div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {badge.badgeName}
                          </p>
                          <p className={`text-xs font-medium ${getBadgeRarityColor(badge.rarity)}`}>
                            {badge.rarity}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(badge.earnedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                    <IoTrophyOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                      No badges earned yet
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Complete trips and maintain your fleet to earn achievements
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 px-4 py-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}