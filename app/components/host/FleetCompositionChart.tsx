'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'  // ✅ NEW: Import Next.js Image
import { 
  IoLeafOutline,
  IoFlashOutline,
  IoCarSportOutline,
  IoBatteryChargingOutline,
  IoWaterOutline,
  IoTrendingUpOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

interface FleetCompositionChartProps {
  hostId: string
  className?: string
}

interface VehicleInfo {
  id: string
  make: string
  model: string
  year: number
  fuelType: string
  totalTrips: number
  esgScore: number | null
  photoUrl: string | null  // ✅ NEW: Added photo URL
}

interface FleetData {
  totalVehicles: number
  activeVehicles: number
  inactiveVehicles: number
  composition: {
    electric: {
      count: number
      percentage: number
      tripPercentage: number
      vehicles: VehicleInfo[]
    }
    hybrid: {
      count: number
      percentage: number
      tripPercentage: number
      vehicles: VehicleInfo[]
    }
    gas: {
      count: number
      percentage: number
      tripPercentage: number
      vehicles: VehicleInfo[]
    }
  }
  environmentalImpact: {
    totalCO2Saved: number
    avgEmissionsRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
    evAdoptionLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL'
  }
  fleetHealth: {
    avgVehicleAge: number
    avgESGScore: number
    totalTrips: number
    totalClaims: number
    claimRate: number
    avgMilesPerVehicle?: number
  }
  insights: string[]
}

export default function FleetCompositionChart({ hostId, className = '' }: FleetCompositionChartProps) {
  const [data, setData] = useState<FleetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFleetData()
  }, [hostId])

  const fetchFleetData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching fleet data for host:', hostId)

      const response = await fetch(`/api/host/esg/profile?key=phoenix-fleet-2847`, {
        credentials: 'include',
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('📦 API Response:', result)

      if (result.success && result.data && result.data.fleetComposition) {
        console.log('✅ Fleet composition found:', result.data.fleetComposition)
        setData(result.data.fleetComposition)
      } else {
        console.error('❌ No fleet composition in response:', result)
        setError('Fleet data not found in response')
      }
    } catch (err) {
      console.error('❌ Error fetching fleet data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const getEmissionsColor = (rating: string): string => {
    switch (rating) {
      case 'EXCELLENT': return 'text-green-600 dark:text-green-400'
      case 'GOOD': return 'text-blue-600 dark:text-blue-400'
      case 'FAIR': return 'text-yellow-600 dark:text-yellow-400'
      case 'POOR': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getAdoptionBadge = (level: string) => {
    switch (level) {
      case 'FULL':
        return { text: '100% Electric', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: '⚡' }
      case 'HIGH':
        return { text: 'High EV Adoption', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: '🔋' }
      case 'MEDIUM':
        return { text: 'Medium EV Adoption', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: '🌱' }
      case 'LOW':
        return { text: 'Low EV Adoption', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', icon: '🌿' }
      default:
        return { text: 'No EVs', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400', icon: '⛽' }
    }
  }

  const getFuelTypeIcon = (fuelType: string) => {
    if (['Electric', 'EV', 'ELECTRIC'].includes(fuelType)) {
      return <IoFlashOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
    } else if (['Hybrid', 'PHEV', 'HYBRID'].includes(fuelType)) {
      return <IoBatteryChargingOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    } else {
      return <IoWaterOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const getFuelTypeBadge = (fuelType: string) => {
    if (['Electric', 'EV', 'ELECTRIC'].includes(fuelType)) {
      return { color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400', label: 'Electric' }
    } else if (['Hybrid', 'PHEV', 'HYBRID'].includes(fuelType)) {
      return { color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400', label: 'Hybrid' }
    } else {
      return { color: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400', label: 'Gas' }
    }
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
        <p className="text-red-800 dark:text-red-300 font-medium">Unable to load fleet composition</p>
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">Error: {error}</p>}
        <button 
          onClick={fetchFleetData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  const adoptionBadge = getAdoptionBadge(data.environmentalImpact.evAdoptionLevel)

  // Get all vehicles in one list
  const allVehicles = [
    ...data.composition.electric.vehicles,
    ...data.composition.hybrid.vehicles,
    ...data.composition.gas.vehicles
  ].sort((a, b) => b.totalTrips - a.totalTrips) // Sort by most trips first

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Fleet Composition
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.totalVehicles} vehicle{data.totalVehicles !== 1 ? 's' : ''} • {data.activeVehicles} active
            </p>
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${adoptionBadge.color}`}>
            <span>{adoptionBadge.icon}</span>
            {adoptionBadge.text}
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="p-6">
        {/* Stacked Bar Chart */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fleet Mix</span>
            <div className="flex-1 h-8 flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              {/* Electric */}
              {data.composition.electric.percentage > 0 && (
                <div
                  style={{ width: `${data.composition.electric.percentage}%` }}
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium hover:bg-green-600 transition-colors"
                  title={`Electric: ${data.composition.electric.percentage}%`}
                >
                  {data.composition.electric.percentage >= 15 && `${data.composition.electric.percentage}%`}
                </div>
              )}
              {/* Hybrid */}
              {data.composition.hybrid.percentage > 0 && (
                <div
                  style={{ width: `${data.composition.hybrid.percentage}%` }}
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                  title={`Hybrid: ${data.composition.hybrid.percentage}%`}
                >
                  {data.composition.hybrid.percentage >= 15 && `${data.composition.hybrid.percentage}%`}
                </div>
              )}
              {/* Gas */}
              {data.composition.gas.percentage > 0 && (
                <div
                  style={{ width: `${data.composition.gas.percentage}%` }}
                  className="bg-gray-500 flex items-center justify-center text-white text-xs font-medium hover:bg-gray-600 transition-colors"
                  title={`Gas: ${data.composition.gas.percentage}%`}
                >
                  {data.composition.gas.percentage >= 15 && `${data.composition.gas.percentage}%`}
                </div>
              )}
            </div>
          </div>

          {/* Trip Volume Distribution */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trip Volume</span>
            <div className="flex-1 h-8 flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              {/* Electric Trips */}
              {data.composition.electric.tripPercentage > 0 && (
                <div
                  style={{ width: `${data.composition.electric.tripPercentage}%` }}
                  className="bg-green-400 flex items-center justify-center text-white text-xs font-medium hover:bg-green-500 transition-colors"
                  title={`EV Trips: ${data.composition.electric.tripPercentage}%`}
                >
                  {data.composition.electric.tripPercentage >= 15 && `${data.composition.electric.tripPercentage}%`}
                </div>
              )}
              {/* Hybrid Trips */}
              {data.composition.hybrid.tripPercentage > 0 && (
                <div
                  style={{ width: `${data.composition.hybrid.tripPercentage}%` }}
                  className="bg-blue-400 flex items-center justify-center text-white text-xs font-medium hover:bg-blue-500 transition-colors"
                  title={`Hybrid Trips: ${data.composition.hybrid.tripPercentage}%`}
                >
                  {data.composition.hybrid.tripPercentage >= 15 && `${data.composition.hybrid.tripPercentage}%`}
                </div>
              )}
              {/* Gas Trips */}
              {data.composition.gas.tripPercentage > 0 && (
                <div
                  style={{ width: `${data.composition.gas.tripPercentage}%` }}
                  className="bg-gray-400 flex items-center justify-center text-white text-xs font-medium hover:bg-gray-500 transition-colors"
                  title={`Gas Trips: ${data.composition.gas.tripPercentage}%`}
                >
                  {data.composition.gas.tripPercentage >= 15 && `${data.composition.gas.tripPercentage}%`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Electric */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <IoFlashOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-200">Electric</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {data.composition.electric.count}
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
              {data.composition.electric.tripPercentage}% of trips
            </p>
          </div>

          {/* Hybrid */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <IoBatteryChargingOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Hybrid</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {data.composition.hybrid.count}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              {data.composition.hybrid.tripPercentage}% of trips
            </p>
          </div>

          {/* Gas */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <IoWaterOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Gas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.composition.gas.count}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
              {data.composition.gas.tripPercentage}% of trips
            </p>
          </div>
        </div>

        {/* ✅ UPDATED: VEHICLE LIST WITH PHOTOS */}
        {allVehicles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Your Vehicles</h4>
            <div className="space-y-2">
              {allVehicles.map((vehicle) => {
                const badge = getFuelTypeBadge(vehicle.fuelType)
                return (
                  <div
                    key={vehicle.id}
                    className={`border ${badge.color} rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-shadow`}
                  >
                    {/* ✅ NEW: CAR PHOTO */}
                    <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {vehicle.photoUrl ? (
                        <Image
                          src={vehicle.photoUrl}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoCarSportOutline className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {getFuelTypeIcon(vehicle.fuelType)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color} border`}>
                              {badge.label}
                            </span>
                            {vehicle.esgScore !== null && (
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                ESG: {vehicle.esgScore}/100
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {vehicle.totalTrips}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">trips</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <IoLeafOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Environmental Impact</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">CO₂ Saved</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {data.environmentalImpact.totalCO2Saved >= 1000 
                      ? `${(data.environmentalImpact.totalCO2Saved / 1000).toFixed(1)} tons`
                      : `${Math.round(data.environmentalImpact.totalCO2Saved)} kg`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Emissions Rating</p>
                  <p className={`font-semibold ${getEmissionsColor(data.environmentalImpact.avgEmissionsRating)}`}>
                    {data.environmentalImpact.avgEmissionsRating}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Health Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Vehicle Age</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.fleetHealth.avgVehicleAge} years
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg ESG Score</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.fleetHealth.avgESGScore}/100
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Trips</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.fleetHealth.totalTrips.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Claim Rate</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.fleetHealth.claimRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-2">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <h4 className="font-medium text-blue-900 dark:text-blue-200">Fleet Insights</h4>
            </div>
            <ul className="space-y-1.5">
              {data.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}