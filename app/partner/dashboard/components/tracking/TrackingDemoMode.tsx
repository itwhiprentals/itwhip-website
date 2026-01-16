// app/partner/dashboard/components/tracking/TrackingDemoMode.tsx
// Map-first demo mode - NO internal containers, uses parent card styling

'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  IoClose,
  IoArrowForward,
  IoCarSportOutline,
  IoLocationOutline,
  IoLockClosedOutline,
  IoPowerOutline,
  IoSnowOutline,
  IoEllipseOutline,
  IoSpeedometerOutline,
  IoVolumeHighOutline
} from 'react-icons/io5'
import Link from 'next/link'

// Shared types and providers
import type {
  DemoVehicle,
  ProviderId,
  FeatureId,
} from '@/app/partner/tracking/shared/types'
import {
  PROVIDER_FEATURES,
  PHOENIX_LOCATIONS,
  generatePhoenixCoordinates,
  generateRoute,
  getCombinedFeatures
} from '@/app/partner/tracking/shared/providers'

// Demo components
import {
  TrackingMap,
  FeatureDemoModal,
  GpsDemo,
  LockDemo,
  RemoteStartDemo,
  PreCoolDemo,
  GeofenceDemo,
  SpeedAlertDemo,
  KillSwitchDemo,
  HonkDemo
} from '@/app/partner/tracking/demo/components'

// ============================================================================
// Types
// ============================================================================

interface FleetVehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  photo: string | null
}

interface TrackingDemoModeProps {
  vehicles: FleetVehicle[]
  onExit: () => void
  onConnect: () => void
}

// Feature badges - compact navigation
const FEATURE_BADGES = [
  { id: 'gps' as FeatureId, icon: IoLocationOutline, label: 'GPS', color: 'blue' },
  { id: 'lock' as FeatureId, icon: IoLockClosedOutline, label: 'Lock', color: 'green' },
  { id: 'start' as FeatureId, icon: IoPowerOutline, label: 'Start', color: 'purple' },
  { id: 'precool' as FeatureId, icon: IoSnowOutline, label: 'Cool', color: 'cyan' },
  { id: 'geofence' as FeatureId, icon: IoEllipseOutline, label: 'Fence', color: 'yellow' },
  { id: 'speed' as FeatureId, icon: IoSpeedometerOutline, label: 'Speed', color: 'red' },
  { id: 'honk' as FeatureId, icon: IoVolumeHighOutline, label: 'Honk', color: 'orange' },
]

// ============================================================================
// Helper
// ============================================================================

function createDemoVehicle(vehicle: FleetVehicle, index: number): DemoVehicle {
  const providers = ['Bouncie', 'Smartcar']
  const statuses: Array<'moving' | 'parked' | 'offline'> = ['moving', 'parked', 'parked']
  const status = statuses[index % 3]
  const baseCoords = generatePhoenixCoordinates()
  const isMoving = status === 'moving'

  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.licensePlate,
    vin: `${vehicle.make.substring(0, 3).toUpperCase()}${vehicle.year}****`,
    status,
    location: isMoving ? 'I-10 E, Phoenix AZ' : 'Scottsdale AZ',
    coordinates: baseCoords,
    speed: isMoving ? 45 + Math.floor(Math.random() * 30) : 0,
    heading: isMoving ? 'East' : null,
    lastUpdate: new Date().toISOString(),
    provider: providers[index % providers.length],
    guest: index === 0 ? { name: 'Demo Guest', phone: '(555) 123-4567' } : null,
    tripStarted: isMoving ? new Date(Date.now() - 3600000).toISOString() : null,
    tripEndsAt: isMoving ? '2h 15m' : null,
    fuelLevel: 50 + Math.floor(Math.random() * 50),
    batteryLevel: vehicle.make.toLowerCase() === 'tesla' ? 80 : null,
    odometer: 25000,
    isElectric: vehicle.make.toLowerCase() === 'tesla',
    isLocked: true,
    engineRunning: isMoving,
    acOn: isMoving,
    interiorTemp: isMoving ? 72 : 95,
    exteriorTemp: 98,
    route: isMoving ? generateRoute(baseCoords, PHOENIX_LOCATIONS.SKY_HARBOR, 8) : [],
    isDisabled: false
  }
}

// ============================================================================
// Component
// ============================================================================

export default function TrackingDemoMode({
  vehicles,
  onExit,
  onConnect
}: TrackingDemoModeProps) {
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  // Demo vehicles with simulated data
  const demoVehicles = useMemo(
    () => vehicles.map((v, i) => createDemoVehicle(v, i)),
    [vehicles]
  )

  const selectedVehicle = useMemo(
    () => demoVehicles.find(v => v.id === selectedVehicleId) || demoVehicles[0],
    [demoVehicles, selectedVehicleId]
  )

  const activeFeatureConfig = useMemo(
    () => activeFeature ? PROVIDER_FEATURES.find(f => f.id === activeFeature) : null,
    [activeFeature]
  )

  // Bouncie + Smartcar = recommended setup
  const selectedProviders: ProviderId[] = ['bouncie', 'smartcar']

  const isFeatureAvailable = useCallback((featureId: FeatureId) => {
    const combined = getCombinedFeatures(selectedProviders)
    return combined[featureId]
  }, [])

  const getBadgeStyle = (color: string, available: boolean) => {
    if (!available) return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
    const styles: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50',
    }
    return styles[color] || styles.blue
  }

  const renderFeatureDemo = () => {
    if (!activeFeature) return null
    const coords = selectedVehicle?.coordinates
    switch (activeFeature) {
      case 'gps': return <GpsDemo initialCoordinates={coords} />
      case 'lock': return <LockDemo />
      case 'start': return <RemoteStartDemo />
      case 'precool': return <PreCoolDemo />
      case 'geofence': return <GeofenceDemo />
      case 'speed': return <SpeedAlertDemo />
      case 'killswitch': return <KillSwitchDemo />
      case 'honk': return <HonkDemo />
      default: return null
    }
  }

  return (
    <>
      {/* Top: Feature Navigation Badges */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {/* Feature badges */}
        {FEATURE_BADGES.map((badge) => {
          const Icon = badge.icon
          const available = isFeatureAvailable(badge.id)
          return (
            <button
              key={badge.id}
              onClick={() => available && setActiveFeature(badge.id)}
              disabled={!available}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${getBadgeStyle(badge.color, available)} ${available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <Icon className="w-3 h-3" />
              {badge.label}
            </button>
          )
        })}

        {/* Exit button */}
        <button
          onClick={onExit}
          className="ml-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Exit Demo"
        >
          <IoClose className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Map - Full width, no container */}
      <div className="relative h-[300px] sm:h-[350px] rounded-lg overflow-hidden -mx-4 sm:-mx-6">
        <TrackingMap
          vehicles={demoVehicles.map(v => ({ ...v, heading: v.heading || null }))}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={setSelectedVehicleId}
          homeBase={PHOENIX_LOCATIONS.PHOENIX_CENTER}
          geofences={[{
            id: 'phoenix-metro',
            name: 'Phoenix Metro',
            center: PHOENIX_LOCATIONS.PHOENIX_CENTER,
            radius: 30,
            color: '#22c55e'
          }]}
        />

        {/* Vehicle chips overlay - positioned left side only, clear of right controls */}
        <div className="absolute bottom-8 left-2 right-28">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {demoVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded backdrop-blur-md text-[9px] transition-all flex-shrink-0 ${
                  selectedVehicleId === vehicle.id
                    ? 'bg-white/95 dark:bg-gray-900/95 shadow ring-1 ring-blue-500'
                    : 'bg-white/80 dark:bg-gray-900/80'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  vehicle.status === 'moving' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="font-medium text-gray-900 dark:text-white">{vehicle.make}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {vehicle.status === 'moving' ? `${vehicle.speed}` : '•'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected vehicle info overlay - centered */}
        {selectedVehicle && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg px-2 py-1 shadow-lg">
            <div className="flex items-center gap-2 text-xs">
              <IoCarSportOutline className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                selectedVehicle.status === 'moving'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {selectedVehicle.status === 'moving' ? `${selectedVehicle.speed} mph` : 'Parked'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onExit}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Exit Demo
        </button>
        <Link
          href="/partner/tracking"
          onClick={onConnect}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Connect for Real
          <IoArrowForward className="w-4 h-4" />
        </Link>
        <Link
          href="/partner/tracking/demo"
          className="px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
        >
          Full Demo
        </Link>
      </div>

      {/* Feature Demo Modal */}
      <FeatureDemoModal
        feature={activeFeatureConfig ? {
          id: activeFeatureConfig.id,
          icon: activeFeatureConfig.icon,
          label: activeFeatureConfig.label,
          description: activeFeatureConfig.description,
          providers: activeFeatureConfig.providers,
          color: activeFeatureConfig.color
        } : null}
        isOpen={activeFeature !== null}
        onClose={() => setActiveFeature(null)}
      >
        {renderFeatureDemo()}
      </FeatureDemoModal>
    </>
  )
}
