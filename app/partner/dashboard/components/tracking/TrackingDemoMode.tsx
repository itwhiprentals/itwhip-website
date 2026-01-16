// app/partner/dashboard/components/tracking/TrackingDemoMode.tsx
// Main demo mode container for the TrackingSecurityCard
// Stripe-style interactive demo using user's actual vehicles

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  IoClose,
  IoArrowForward,
  IoCarSportOutline,
  IoLocationOutline,
  IoSpeedometerOutline,
  IoBatteryFullOutline,
  IoTimeOutline,
  IoRefresh,
  IoPlayCircle,
  IoInformationCircle,
  IoChevronForward
} from 'react-icons/io5'
import Link from 'next/link'

// Shared types and providers
import type {
  DemoVehicle,
  ProviderId,
  FeatureId,
  Coordinates
} from '@/app/partner/tracking/shared/types'
import {
  PROVIDER_FEATURES,
  PROVIDER_CAPABILITIES,
  PHOENIX_LOCATIONS,
  generatePhoenixCoordinates,
  generateRoute,
  getCombinedFeatures
} from '@/app/partner/tracking/shared/providers'

// Demo components (reused from tracking/demo)
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

// Local components
import ProviderSelector from './ProviderSelector'
import ProviderFeatureMatrix from './ProviderFeatureMatrix'

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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert fleet vehicle to demo vehicle with simulated tracking data
 */
function createDemoVehicle(vehicle: FleetVehicle, index: number): DemoVehicle {
  const providers = ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo']
  const statuses: Array<'moving' | 'parked' | 'offline'> = ['moving', 'parked', 'parked']
  const status = statuses[index % 3]

  // Generate coordinates around Phoenix
  const baseCoords = generatePhoenixCoordinates()
  const isMoving = status === 'moving'

  // Create a route if moving
  const route = isMoving
    ? generateRoute(
        baseCoords,
        PHOENIX_LOCATIONS.SKY_HARBOR,
        8
      )
    : []

  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.licensePlate,
    vin: `${vehicle.make.substring(0, 3).toUpperCase()}${vehicle.year}****`,
    status,
    location: isMoving
      ? 'I-10 E near 51st Ave, Phoenix AZ'
      : '7014 E Camelback Rd, Scottsdale AZ',
    coordinates: baseCoords,
    speed: isMoving ? 45 + Math.floor(Math.random() * 30) : 0,
    heading: isMoving ? 'East' : null,
    lastUpdate: new Date().toISOString(),
    provider: providers[index % providers.length],
    guest: index === 0
      ? { name: 'Demo Guest', phone: '(555) 123-4567' }
      : null,
    tripStarted: isMoving ? new Date(Date.now() - 3600000).toISOString() : null,
    tripEndsAt: isMoving ? '2h 15m remaining' : null,
    fuelLevel: 50 + Math.floor(Math.random() * 50),
    batteryLevel: vehicle.make.toLowerCase() === 'tesla' ? 75 + Math.floor(Math.random() * 25) : null,
    odometer: 20000 + Math.floor(Math.random() * 30000),
    isElectric: vehicle.make.toLowerCase() === 'tesla',
    isLocked: true,
    engineRunning: isMoving,
    acOn: isMoving,
    interiorTemp: isMoving ? 72 : 95 + Math.floor(Math.random() * 20),
    exteriorTemp: 95 + Math.floor(Math.random() * 20),
    route,
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
  // State
  const [selectedProviders, setSelectedProviders] = useState<ProviderId[]>(['bouncie', 'smartcar'])
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Convert fleet vehicles to demo vehicles
  const demoVehicles = useMemo(
    () => vehicles.map((v, i) => createDemoVehicle(v, i)),
    [vehicles]
  )

  // Find selected demo vehicle
  const selectedVehicle = useMemo(
    () => demoVehicles.find(v => v.id === selectedVehicleId) || demoVehicles[0],
    [demoVehicles, selectedVehicleId]
  )

  // Get active feature config
  const activeFeatureConfig = useMemo(
    () => activeFeature ? PROVIDER_FEATURES.find(f => f.id === activeFeature) : null,
    [activeFeature]
  )

  // Check if feature is available with selected providers
  const isFeatureAvailable = useCallback((featureId: FeatureId) => {
    const combined = getCombinedFeatures(selectedProviders)
    return combined[featureId]
  }, [selectedProviders])

  // Simulate position updates for moving vehicles
  useEffect(() => {
    const interval = setInterval(() => {
      // This would update vehicle positions in a real implementation
      // For demo, we'll just update the lastUpdate timestamp
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsRefreshing(false)
  }

  // Handle feature click
  const handleFeatureClick = (featureId: FeatureId) => {
    setActiveFeature(featureId)
  }

  // Close feature modal
  const handleCloseFeatureModal = () => {
    setActiveFeature(null)
  }

  // Render feature demo content
  const renderFeatureDemo = () => {
    if (!activeFeature) return null

    // Pass initial coordinates from selected vehicle if available
    const initialCoords = selectedVehicle?.coordinates

    switch (activeFeature) {
      case 'gps':
        return <GpsDemo initialCoordinates={initialCoords} />
      case 'lock':
        return <LockDemo />
      case 'start':
        return <RemoteStartDemo />
      case 'precool':
        return <PreCoolDemo />
      case 'geofence':
        return <GeofenceDemo />
      case 'speed':
        return <SpeedAlertDemo />
      case 'killswitch':
        return <KillSwitchDemo />
      case 'honk':
        return <HonkDemo />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Demo Mode Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded uppercase tracking-wide">
            Demo Mode
          </span>
          <span className="text-xs text-gray-500">
            Preview tracking with your vehicles
          </span>
        </div>
        <button
          onClick={onExit}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          title="Exit Demo"
        >
          <IoClose className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Provider Selection */}
      <ProviderSelector
        selectedProviders={selectedProviders}
        onSelectionChange={setSelectedProviders}
        showPricing={true}
        className="bg-gray-900/50 rounded-lg p-3 border border-gray-800"
      />

      {/* Mini Map with Vehicles */}
      <div className="relative rounded-lg overflow-hidden border border-gray-800">
        {/* Map Container */}
        <div className="h-[200px] bg-gray-900">
          <TrackingMap
            vehicles={demoVehicles.map(v => ({
              ...v,
              heading: v.heading || null
            }))}
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={setSelectedVehicleId}
            homeBase={PHOENIX_LOCATIONS.PHOENIX_CENTER}
            geofences={[
              {
                id: 'phoenix-metro',
                name: 'Phoenix Metro',
                center: PHOENIX_LOCATIONS.PHOENIX_CENTER,
                radius: 30,
                color: '#22c55e'
              }
            ]}
          />
        </div>

        {/* Vehicle List Overlay */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {demoVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  border transition-all duration-200 flex-shrink-0
                  backdrop-blur-md
                  ${selectedVehicleId === vehicle.id
                    ? 'bg-gray-900/90 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-900/70 border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {/* Status Dot */}
                <div className={`
                  w-2 h-2 rounded-full flex-shrink-0
                  ${vehicle.status === 'moving'
                    ? 'bg-green-400 animate-pulse'
                    : vehicle.status === 'parked'
                    ? 'bg-blue-400'
                    : 'bg-gray-500'
                  }
                `} />

                {/* Vehicle Info */}
                <div className="text-left">
                  <span className="text-xs font-medium text-white block">
                    {vehicle.year} {vehicle.make}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {vehicle.status === 'moving'
                      ? `${vehicle.speed}mph`
                      : vehicle.status
                    }
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`
            absolute top-2 right-2 p-2 rounded-lg
            bg-gray-900/80 border border-gray-700
            hover:bg-gray-800 transition-all
            ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <IoRefresh className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <IoCarSportOutline className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </span>
            </div>
            <span className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${selectedVehicle.status === 'moving'
                ? 'bg-green-500/20 text-green-400'
                : selectedVehicle.status === 'parked'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gray-500/20 text-gray-400'
              }
            `}>
              {selectedVehicle.status}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-800/50 rounded-lg">
              <IoSpeedometerOutline className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-white font-medium">{selectedVehicle.speed} mph</span>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded-lg">
              <IoBatteryFullOutline className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-white font-medium">
                {selectedVehicle.batteryLevel || selectedVehicle.fuelLevel}%
              </span>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded-lg">
              <IoTimeOutline className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-white font-medium">Just now</span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Matrix */}
      {selectedProviders.length > 0 && (
        <ProviderFeatureMatrix
          selectedProviders={selectedProviders}
          onFeatureClick={handleFeatureClick}
          showITWhipPlus={true}
          className="bg-gray-900/50 rounded-lg p-3 border border-gray-800"
        />
      )}

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
        onClose={handleCloseFeatureModal}
      >
        {renderFeatureDemo()}
      </FeatureDemoModal>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onExit}
          className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Exit Demo
        </button>
        <Link
          href="/partner/tracking"
          onClick={onConnect}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all text-sm font-medium"
        >
          Connect for Real
          <IoArrowForward className="w-4 h-4" />
        </Link>
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <IoInformationCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-200">
            This demo uses your actual vehicles with simulated tracking data.
            Connect a real provider to see live location, alerts, and remote control.
          </p>
          <Link
            href="/partner/tracking/demo"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1.5 transition-colors"
          >
            View full interactive demo
            <IoChevronForward className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
