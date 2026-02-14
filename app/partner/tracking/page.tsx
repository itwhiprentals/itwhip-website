// app/partner/tracking/page.tsx
// Vehicle Tracking - Provider selection and dashboard
// Demo mode is a separate page at /partner/tracking/demo

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  IoLocationOutline,
  IoCarSportOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoSettingsOutline,
  IoAddOutline,
  IoNavigateOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoDownloadOutline,
  IoMapOutline,
  IoStatsChartOutline,
  IoLinkOutline,
  IoPlayOutline,
  IoBatteryFullOutline,
  IoSpeedometerOutline,
  IoTrendingUpOutline,
  IoStar,
  IoCloseCircleOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoPowerOutline,
  IoSnowOutline,
  IoLocateOutline,
  IoFlashOutline,
  IoRadioOutline,
  IoCloseOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

// Import live fleet map
import dynamic from 'next/dynamic'
const LiveFleetMap = dynamic(() => import('./components/LiveFleetMap'), { ssr: false })

// Import provider data from shared module
import {
  MILEAGE_FORENSICS,
  getSecondaryProviders
} from './shared/providers'

// Import provider features configuration
import {
  TRACKING_FEATURES,
  PROVIDERS,
  getFeaturesByProvider,
  getBouncieOnlyFeatures
} from '@/app/lib/tracking/providerFeatures'

interface ConnectedProvider {
  id: string
  name: string
  vehicleCount: number
  lastSync: string
  status: 'active' | 'error' | 'syncing'
}

interface TrackedVehicle {
  id: string
  make: string
  model: string
  year: number
  status: 'moving' | 'parked' | 'offline' | 'disabled'
  location: string | null
  coordinates: { lat: number; lng: number } | null
  speed: number | null
  heading: string | null
  lastUpdate: string
  provider: string
  guest: { name: string; phone: string } | null
  tripEndsAt: string | null
  fuelLevel: number | null
  odometer: number | null
  batteryLevel: number | null
  tirePressure: { frontLeft: number; frontRight: number; backLeft: number; backRight: number } | null
  oilLife: number | null
  chargeState: { isPluggedIn: boolean; state: 'CHARGING' | 'FULLY_CHARGED' | 'NOT_CHARGING' | null } | null
  isEV: boolean
  isLocked: boolean
  engineRunning: boolean
  acOn: boolean
  isDisabled: boolean
  smartcarVehicleId?: string
}

interface SmartcarVehicle {
  id: string
  smartcarVehicleId: string
  make: string | null
  model: string | null
  year: number | null
  vin: string | null
  isActive: boolean
  lastSyncAt: string | null
  lastLocation: { lat: number; lng: number; timestamp: string } | null
  lastOdometer: number | null
  lastFuel: number | null
  lastBattery: number | null
  lastTirePressure: { frontLeft: number; frontRight: number; backLeft: number; backRight: number } | null
  lastOilLife: number | null
  lastChargeState: { isPluggedIn: boolean; state: 'CHARGING' | 'FULLY_CHARGED' | 'NOT_CHARGING' | null } | null
  connectedAt: string
  car?: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string | null
    photos: { url: string }[]
  } | null
}

interface BouncieDevice {
  id: string
  deviceImei: string
  nickname: string | null
  make: string | null
  model: string | null
  year: number | null
  vin: string | null
  isActive: boolean
  lastSyncAt: string | null
  lastLocation: { lat: number; lng: number; speed: number; heading: string; timestamp: string } | null
  lastOdometer: number | null
  lastFuel: number | null
  lastBatteryVoltage: number | null
  lastSpeed: number | null
  lastEngineStatus: string | null
  connectedAt: string
  car?: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string | null
  } | null
}

export default function TrackingPage() {
  const t = useTranslations('PartnerTracking')
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([])
  const [trackedVehicles, setTrackedVehicles] = useState<TrackedVehicle[]>([])
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  // Smartcar state
  const [smartcarVehicles, setSmartcarVehicles] = useState<SmartcarVehicle[]>([])
  const [smartcarConnecting, setSmartcarConnecting] = useState(false)
  const [smartcarNotification, setSmartcarNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Bouncie state (for future integration)
  const [bouncieDevices, setBouncieDevices] = useState<BouncieDevice[]>([])

  // Remote control states (Smartcar supports: lock/unlock, start/stop charging)
  const [isLocking, setIsLocking] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState<string | null>(null)
  const [isChargingControl, setIsChargingControl] = useState<string | null>(null)
  const [refreshingVehicle, setRefreshingVehicle] = useState<string | null>(null)
  const [mapRefreshing, setMapRefreshing] = useState(false)

  // Computed states
  const hasSmartcar = smartcarVehicles.length > 0
  const hasBouncie = bouncieDevices.length > 0
  const hasItWhipPlus = hasSmartcar && hasBouncie
  const hasTracking = connectedProviders.length > 0 || hasSmartcar || hasBouncie

  // Check URL params for Smartcar callback results
  useEffect(() => {
    const smartcarSuccess = searchParams.get('smartcar_success')
    const smartcarError = searchParams.get('smartcar_error')
    const smartcarCancelled = searchParams.get('smartcar_cancelled')
    const vehiclesConnected = searchParams.get('smartcar_vehicles_connected')

    if (smartcarSuccess === 'true') {
      setSmartcarNotification({
        type: 'success',
        message: t('smartcarConnectSuccess', { count: vehiclesConnected || '1' })
      })
      // Clear URL params after reading
      window.history.replaceState({}, '', '/partner/tracking')
      // Reload Smartcar vehicles
      loadSmartcarVehicles()
    } else if (smartcarCancelled === 'true') {
      // User cancelled - just clear URL params, no error notification needed
      window.history.replaceState({}, '', '/partner/tracking')
    } else if (smartcarError) {
      const errorMessages: Record<string, string> = {
        'access_denied': t('errorAccessDenied'),
        'no_vehicles': t('errorNoVehicles'),
        'state_expired': t('errorStateExpired'),
        'invalid_host': t('errorInvalidHost'),
        'missing_params': t('errorMissingParams'),
        'not_configured': t('errorNotConfigured'),
        'processing_failed': t('errorProcessingFailed')
      }
      setSmartcarNotification({
        type: 'error',
        message: errorMessages[smartcarError] || t('connectionFailed', { error: smartcarError })
      })
      window.history.replaceState({}, '', '/partner/tracking')
    }
  }, [searchParams])

  // Load Smartcar connected vehicles
  const loadSmartcarVehicles = async () => {
    try {
      const response = await fetch('/api/smartcar/vehicles', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSmartcarVehicles(data.vehicles || [])
        // Update connected providers if we have Smartcar vehicles
        if (data.vehicles && data.vehicles.length > 0) {
          setConnectedProviders(prev => {
            const withoutSmartcar = prev.filter(p => p.id !== 'smartcar')
            return [...withoutSmartcar, {
              id: 'smartcar',
              name: 'Smartcar',
              vehicleCount: data.vehicles.length,
              lastSync: new Date().toISOString(),
              status: 'active' as const
            }]
          })
        }
      }
    } catch (error) {
      console.error('Failed to load Smartcar vehicles:', error)
    }
  }

  // Refresh map data (fetch real-time from Smartcar)
  const handleMapRefresh = async () => {
    setMapRefreshing(true)
    try {
      const response = await fetch('/api/smartcar/vehicles?realtime=true', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSmartcarVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Map refresh failed:', error)
    } finally {
      setMapRefreshing(false)
    }
  }

  // Convert Smartcar vehicles to tracked vehicle format for unified display
  useEffect(() => {
    if (smartcarVehicles.length > 0) {
      const converted: TrackedVehicle[] = smartcarVehicles.map(sv => {
        // Determine if this is an EV (has battery data but no fuel data)
        const isEV = sv.lastBattery !== null && sv.lastFuel === null

        return {
          id: sv.id,
          make: sv.make || 'Unknown',
          model: sv.model || 'Vehicle',
          year: sv.year || 0,
          status: sv.lastLocation ? 'parked' : 'offline', // Default to parked if we have location
          location: sv.lastLocation
            ? `${sv.lastLocation.lat.toFixed(4)}, ${sv.lastLocation.lng.toFixed(4)}`
            : null,
          coordinates: sv.lastLocation
            ? { lat: sv.lastLocation.lat, lng: sv.lastLocation.lng }
            : null,
          speed: null,
          heading: null,
          lastUpdate: sv.lastSyncAt || sv.connectedAt,
          provider: 'Smartcar',
          guest: null, // Would come from active bookings
          tripEndsAt: null,
          fuelLevel: sv.lastFuel,
          odometer: sv.lastOdometer,
          batteryLevel: sv.lastBattery,
          tirePressure: sv.lastTirePressure,
          oilLife: sv.lastOilLife,
          chargeState: sv.lastChargeState,
          isEV,
          isLocked: true, // Default to locked
          engineRunning: false,
          acOn: false,
          isDisabled: false,
          smartcarVehicleId: sv.smartcarVehicleId
        }
      })
      setTrackedVehicles(converted)
    }
  }, [smartcarVehicles])

  useEffect(() => {
    // Load real tracking data from API
    const loadTrackingData = async () => {
      try {
        // Load fleet count
        try {
          const fleetRes = await fetch('/api/partner/fleet', { credentials: 'include' })
          if (fleetRes.ok) {
            const fleetData = await fleetRes.json()
            if (fleetData.success && fleetData.vehicles) {
              setTotalVehicles(fleetData.vehicles.length)
            }
          }
        } catch (e) {
          console.error('Failed to load fleet count:', e)
        }
        // Load Smartcar vehicles
        await loadSmartcarVehicles()
        setLoading(false)
      } catch (error) {
        console.error('Failed to load tracking data:', error)
        setLoading(false)
      }
    }
    loadTrackingData()
  }, [])

  // Handle Smartcar Connect button click
  const handleSmartcarConnect = async () => {
    setSmartcarConnecting(true)
    setSmartcarNotification(null)
    try {
      const response = await fetch('/api/smartcar/connect', { credentials: 'include' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get connect URL')
      }
      const data = await response.json()
      // Redirect to Smartcar Connect
      window.location.href = data.url
    } catch (error) {
      console.error('Smartcar connect error:', error)
      setSmartcarNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to start connection'
      })
      setSmartcarConnecting(false)
    }
  }

  // Handle Smartcar disconnect
  const handleSmartcarDisconnect = async (vehicleId: string) => {
    if (!confirm(t('confirmDisconnect'))) return
    try {
      const response = await fetch('/api/smartcar/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vehicleId })
      })
      if (response.ok) {
        setSmartcarVehicles(prev => prev.filter(v => v.id !== vehicleId))
        setSmartcarNotification({
          type: 'success',
          message: t('vehicleDisconnected')
        })
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      setSmartcarNotification({
        type: 'error',
        message: t('disconnectFailed')
      })
    }
  }

  // Handle Smartcar disconnect ALL vehicles (master disconnect)
  const [disconnectingAll, setDisconnectingAll] = useState(false)
  const handleSmartcarDisconnectAll = async () => {
    if (!confirm(t('confirmDisconnectAll', { count: smartcarVehicles.length }))) return
    setDisconnectingAll(true)
    try {
      let failed = 0
      for (const vehicle of smartcarVehicles) {
        const response = await fetch('/api/smartcar/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ vehicleId: vehicle.id })
        })
        if (!response.ok) failed++
      }
      setSmartcarVehicles([])
      setSmartcarNotification({
        type: failed > 0 ? 'error' : 'success',
        message: failed > 0
          ? t('disconnectAllPartialError', { failed })
          : t('disconnectAllSuccess')
      })
    } catch (error) {
      console.error('Disconnect all error:', error)
      setSmartcarNotification({
        type: 'error',
        message: t('disconnectAllFailed')
      })
    } finally {
      setDisconnectingAll(false)
    }
  }

  // Remote control handlers
  const toggleLock = async (vehicleId: string, smartcarVehicleId?: string) => {
    if (!smartcarVehicleId) return
    setIsLocking(vehicleId)
    try {
      const vehicle = trackedVehicles.find(v => v.id === vehicleId)
      const action = vehicle?.isLocked ? 'unlock' : 'lock'
      const response = await fetch('/api/smartcar/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vehicleId, action })
      })
      if (response.ok) {
        setTrackedVehicles(prev => prev.map(v =>
          v.id === vehicleId ? { ...v, isLocked: !v.isLocked } : v
        ))
        setSmartcarNotification({
          type: 'success',
          message: t('vehicleLockSuccess', { action })
        })
      } else {
        throw new Error('Failed to control vehicle')
      }
    } catch (error) {
      console.error('Lock/unlock error:', error)
      setSmartcarNotification({
        type: 'error',
        message: t('vehicleLockFailed')
      })
    } finally {
      setIsLocking(null)
    }
  }

  // EV Charging control (Smartcar supports start/stop charging for EVs)
  const toggleCharging = async (vehicleId: string) => {
    setIsChargingControl(vehicleId)
    try {
      const vehicle = trackedVehicles.find(v => v.id === vehicleId)
      const isCharging = vehicle?.chargeState?.state === 'CHARGING'
      const action = isCharging ? 'stop_charge' : 'start_charge'

      const response = await fetch('/api/smartcar/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vehicleId, action })
      })

      if (response.ok) {
        // Update local state
        setTrackedVehicles(prev => prev.map(v =>
          v.id === vehicleId
            ? {
                ...v,
                chargeState: {
                  isPluggedIn: v.chargeState?.isPluggedIn ?? true,
                  state: isCharging ? 'NOT_CHARGING' : 'CHARGING'
                }
              }
            : v
        ))
        setSmartcarNotification({
          type: 'success',
          message: isCharging ? t('chargingStopped') : t('chargingStarted')
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to control charging')
      }
    } catch (error) {
      console.error('Charging control error:', error)
      setSmartcarNotification({
        type: 'error',
        message: error instanceof Error ? error.message : t('chargingControlFailed')
      })
    } finally {
      setIsChargingControl(null)
    }
  }

  const refreshVehicleData = async (vehicleId: string) => {
    setRefreshingVehicle(vehicleId)
    try {
      const response = await fetch(`/api/smartcar/vehicles?vehicleId=${vehicleId}&realtime=true`, {
        credentials: 'include'
      })
      if (response.ok) {
        await loadSmartcarVehicles()
        setSmartcarNotification({
          type: 'success',
          message: t('vehicleDataRefreshed')
        })
      }
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshingVehicle(null)
    }
  }

  const locateVehicle = async (vehicleId: string) => {
    setIsLocating(vehicleId)
    const vehicle = trackedVehicles.find(v => v.id === vehicleId)
    if (vehicle?.coordinates) {
      // Open in Google Maps
      window.open(
        `https://www.google.com/maps?q=${vehicle.coordinates.lat},${vehicle.coordinates.lng}`,
        '_blank'
      )
    }
    setTimeout(() => setIsLocating(null), 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'parked': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'disabled': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'offline': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return t('justNow')
    if (diffMins < 60) return t('minutesAgo', { minutes: diffMins })
    if (diffHours < 24) return t('hoursAgo', { hours: diffHours })
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoLocationOutline className="w-7 h-7 text-orange-600" />
                {t('title')}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                <IoCarSportOutline className="w-4 h-4" />
                {t('trackedCount', { tracked: trackedVehicles.length, total: totalVehicles })}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('subtitle')}
            </p>
          </div>
          {hasTracking && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <IoAddOutline className="w-5 h-5" />
                <span className="hidden sm:inline">{t('addProvider')}</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <IoSettingsOutline className="w-5 h-5" />
                <span className="hidden sm:inline">{t('settings')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Smartcar Notification Banner */}
        {smartcarNotification && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            smartcarNotification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {smartcarNotification.type === 'success' ? (
              <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                smartcarNotification.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {smartcarNotification.message}
              </p>
            </div>
            <button
              onClick={() => setSmartcarNotification(null)}
              className={`p-1 rounded-full hover:bg-white/50 ${
                smartcarNotification.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              <IoCloseCircleOutline className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Connected Smartcar Vehicles Section */}
        {smartcarVehicles.length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <IoCarSportOutline className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('smartcarConnected')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('vehiclesLinked', { count: smartcarVehicles.length })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSmartcarDisconnectAll}
                  disabled={disconnectingAll}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <IoCloseCircleOutline className="w-4 h-4" />
                  {disconnectingAll ? t('disconnectingAll') : t('disconnectAll')}
                </button>
                <button
                  onClick={handleSmartcarConnect}
                  disabled={smartcarConnecting}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                >
                  <IoAddOutline className="w-4 h-4" />
                  {t('addMore')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {smartcarVehicles.map(vehicle => {
                const isEV = vehicle.lastBattery !== null && vehicle.lastFuel === null
                const isCharging = vehicle.lastChargeState?.state === 'CHARGING'
                const isFullyCharged = vehicle.lastChargeState?.state === 'FULLY_CHARGED'

                return (
                  <div key={vehicle.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isEV
                            ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          {isEV ? (
                            <IoFlashOutline className="w-5 h-5 text-white" />
                          ) : (
                            <IoCarSportOutline className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {vehicle.vin ? t('vinLabel', { lastSix: vehicle.vin.slice(-6) }) : t('vinPending')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                          {t('connected')}
                        </span>
                        {isEV && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium rounded">
                            {t('ev')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {/* Odometer */}
                      <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <IoSpeedometerOutline className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {vehicle.lastOdometer ? `${Math.round(vehicle.lastOdometer).toLocaleString()}` : '—'}
                        </p>
                        <p className="text-[10px] text-gray-500">{t('miles')}</p>
                      </div>

                      {/* Fuel or Battery */}
                      <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        {isEV ? (
                          <>
                            <IoBatteryFullOutline className={`w-4 h-4 mx-auto mb-1 ${
                              isCharging ? 'text-green-500 animate-pulse' :
                              (vehicle.lastBattery ?? 0) < 20 ? 'text-red-500' : 'text-gray-400'
                            }`} />
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              {vehicle.lastBattery !== null ? `${Math.round(vehicle.lastBattery)}%` : '—'}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {isCharging ? t('charging') : isFullyCharged ? t('full') : t('battery')}
                            </p>
                          </>
                        ) : (
                          <>
                            <IoFlashOutline className={`w-4 h-4 mx-auto mb-1 ${
                              (vehicle.lastFuel ?? 0) < 20 ? 'text-red-500' : 'text-gray-400'
                            }`} />
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              {vehicle.lastFuel !== null ? `${Math.round(vehicle.lastFuel)}%` : '—'}
                            </p>
                            <p className="text-[10px] text-gray-500">{t('fuel')}</p>
                          </>
                        )}
                      </div>

                      {/* Oil Life or Charge State */}
                      <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        {isEV && vehicle.lastChargeState ? (
                          <>
                            <IoFlashOutline className={`w-4 h-4 mx-auto mb-1 ${
                              isCharging ? 'text-green-500 animate-pulse' : 'text-gray-400'
                            }`} />
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              {vehicle.lastChargeState.isPluggedIn ? t('yes') : t('no')}
                            </p>
                            <p className="text-[10px] text-gray-500">{t('pluggedIn')}</p>
                          </>
                        ) : vehicle.lastOilLife !== null ? (
                          <>
                            <IoSpeedometerOutline className={`w-4 h-4 mx-auto mb-1 ${
                              vehicle.lastOilLife < 20 ? 'text-orange-500' : 'text-gray-400'
                            }`} />
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              {Math.round(vehicle.lastOilLife)}%
                            </p>
                            <p className="text-[10px] text-gray-500">{t('oilLife')}</p>
                          </>
                        ) : (
                          <>
                            <IoTimeOutline className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              {vehicle.lastSyncAt ? formatRelativeTime(vehicle.lastSyncAt) : '—'}
                            </p>
                            <p className="text-[10px] text-gray-500">{t('synced')}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tire Pressure (if available) */}
                    {vehicle.lastTirePressure && (
                      <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('tirePressureLabel')}</p>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('tireFl')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{vehicle.lastTirePressure.frontLeft}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('tireFr')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{vehicle.lastTirePressure.frontRight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('tireBl')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{vehicle.lastTirePressure.backLeft}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('tireBr')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{vehicle.lastTirePressure.backRight}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location Preview */}
                    {vehicle.lastLocation && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <IoLocationOutline className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        <span className="truncate">
                          {vehicle.lastLocation.lat.toFixed(4)}, {vehicle.lastLocation.lng.toFixed(4)}
                        </span>
                        <button
                          onClick={() => window.open(`https://www.google.com/maps?q=${vehicle.lastLocation!.lat},${vehicle.lastLocation!.lng}`, '_blank')}
                          className="ml-auto text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                        >
                          {t('view')}
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => refreshVehicleData(vehicle.id)}
                        disabled={refreshingVehicle === vehicle.id}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
                      >
                        <IoRefreshOutline className={`w-3.5 h-3.5 ${refreshingVehicle === vehicle.id ? 'animate-spin' : ''}`} />
                        {refreshingVehicle === vehicle.id ? t('syncingButton') : t('syncNow')}
                      </button>
                      {isEV && (
                        <button
                          onClick={() => toggleCharging(vehicle.id)}
                          disabled={isChargingControl === vehicle.id}
                          className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                            isCharging
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200'
                          }`}
                        >
                          <IoFlashOutline className={`w-3.5 h-3.5 ${isChargingControl === vehicle.id ? 'animate-pulse' : ''}`} />
                          {isCharging ? t('stopCharge') : t('startCharge')}
                        </button>
                      )}
                      <button
                        onClick={() => handleSmartcarDisconnect(vehicle.id)}
                        className="px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <IoCloseCircleOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Provider Features Section - Shows what features are available */}
        {(hasSmartcar || hasBouncie) && (
          <div className="mb-8">
            {/* ItWhip+ Active Banner - Both providers connected */}
            {hasItWhipPlus ? (
              <>
                <div className="mb-6 bg-gradient-to-r from-purple-600 via-orange-500 to-amber-500 rounded-lg p-6 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <IoStar className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">{t('itwhipPlusActive')}</h2>
                        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded">
                          {t('completeProtection')}
                        </span>
                      </div>
                      <p className="text-white/80">
                        {t('itwhipPlusDescription', { count: TRACKING_FEATURES.length })}
                      </p>
                    </div>
                  </div>

                  {/* All Features Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {TRACKING_FEATURES.map(feature => (
                      <div
                        key={feature.id}
                        className="flex items-center gap-2 p-2 bg-white/10 rounded-lg"
                      >
                        <IoCheckmarkCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                        <span className="text-xs text-white truncate">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Provider Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Smartcar Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROVIDERS.smartcar.color }}>
                        <IoCarSportOutline className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{PROVIDERS.smartcar.name}</h3>
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                            {t('connected')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('smartcarStatusDescription', { count: smartcarVehicles.length })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bouncie Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-800 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROVIDERS.bouncie.color }}>
                        <IoRadioOutline className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{PROVIDERS.bouncie.name}</h3>
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                            {t('connected')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('bouncieStatusDescription', { count: bouncieDevices.length })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoInformationCircleOutline className="w-5 h-5 text-gray-400" />
                  {t('yourTrackingCapabilities')}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Smartcar Features Card */}
                  <div className={`bg-white dark:bg-gray-800 rounded-lg p-5 ${
                    hasSmartcar
                      ? 'border-2 border-purple-200 dark:border-purple-800'
                      : 'border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROVIDERS.smartcar.color }}>
                        <IoCarSportOutline className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {PROVIDERS.smartcar.name}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            hasSmartcar
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {hasSmartcar ? t('connected') : t('notConnected')}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{PROVIDERS.smartcar.tagline}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        {hasSmartcar ? t('availableFeatures', { count: getFeaturesByProvider('smartcar').length }) : t('wouldUnlockFeatures', { count: getFeaturesByProvider('smartcar').length })}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {getFeaturesByProvider('smartcar').map(feature => (
                          <div
                            key={feature.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                              hasSmartcar
                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60'
                            }`}
                          >
                            {hasSmartcar ? (
                              <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <IoCloseOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`text-xs truncate ${
                              hasSmartcar ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                            }`}>{feature.name}</span>
                            {feature.isPremium && (
                              <IoStar className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {!hasSmartcar && (
                      <button
                        onClick={handleSmartcarConnect}
                        disabled={smartcarConnecting}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {smartcarConnecting ? t('connectingSmartcar') : t('connectSmartcar')}
                      </button>
                    )}
                  </div>

                  {/* Bouncie Features Card */}
                  <div className={`bg-white dark:bg-gray-800 rounded-lg p-5 ${
                    hasBouncie
                      ? 'border-2 border-emerald-200 dark:border-emerald-800'
                      : 'border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROVIDERS.bouncie.color }}>
                        <IoRadioOutline className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {PROVIDERS.bouncie.name}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            hasBouncie
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {hasBouncie ? t('connected') : t('notConnected')}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{PROVIDERS.bouncie.tagline}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        {hasBouncie ? t('availableFeaturesCount', { count: getBouncieOnlyFeatures().length }) : t('wouldUnlockFeaturesCount', { count: getBouncieOnlyFeatures().length })}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {getBouncieOnlyFeatures().map(feature => (
                          <div
                            key={feature.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                              hasBouncie
                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60'
                            }`}
                          >
                            {hasBouncie ? (
                              <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <IoCloseOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`text-xs truncate ${
                              hasBouncie ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                            }`}>{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {!hasBouncie && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {t('addBouncieDescription')}
                        </p>
                        <a
                          href="https://bouncie.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                        >
                          {t('getBouncieDevice')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* ItWhip+ Upsell Banner - Show when missing one provider */}
                {(hasSmartcar && !hasBouncie) || (!hasSmartcar && hasBouncie) ? (
                  <div className="mt-6 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg p-5 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <IoStar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{t('upgradeToItwhipPlus')}</h3>
                          <p className="text-white/80 text-sm">
                            {t('itwhipPlusUpsellDescription', { count: TRACKING_FEATURES.length })}
                          </p>
                        </div>
                      </div>
                      {hasSmartcar && !hasBouncie ? (
                        <a
                          href="https://bouncie.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                        >
                          {t('addBouncieComplete')}
                        </a>
                      ) : (
                        <button
                          onClick={handleSmartcarConnect}
                          disabled={smartcarConnecting}
                          className="px-6 py-2.5 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors flex-shrink-0"
                        >
                          {smartcarConnecting ? t('connecting') : t('addSmartcarComplete')}
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}

        {!hasTracking ? (
          // No Provider Connected - Onboarding View
          <div className="space-y-8">
            {/* Recommended Setup Card - Provider Card Style */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-5 transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <IoStar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('recommendedSetup')}</h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded border border-white/50 whitespace-nowrap">
                      <IoTrendingUpOutline className="w-3 h-3" />
                      {t('lessFleetBold')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('pricePerVehicle')}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('recommendedDescription')}
              </p>

              {/* Features Grid */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-gray-900 dark:text-white">{t('bouncieFeatures')}</strong> {t('bouncieFeaturesList')}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-gray-900 dark:text-white">{t('smartcarFeatures')}</strong> {t('smartcarFeaturesList')}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-gray-900 dark:text-white">{t('itwhipPlusFeatures')} <span className="text-green-600 dark:text-green-400">{t('itwhipPlusFree')}</span>:</strong> {t('itwhipPlusFeaturesList')}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-2">
                <a
                  href="https://bouncie.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {t('getBouncie')}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </a>
                <button
                  onClick={handleSmartcarConnect}
                  disabled={smartcarConnecting}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {smartcarConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('connecting')}
                    </>
                  ) : (
                    <>
                      <IoLinkOutline className="w-4 h-4" />
                      {t('connectSmartcarButton')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mileage Forensics™ Feature Section */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-5 border border-amber-200 dark:border-gray-700">
              {/* Header with Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <IoSpeedometerOutline className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {MILEAGE_FORENSICS.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded border border-white/50">
                      {t('exclusive')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('itwhipPlusFeature')}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {MILEAGE_FORENSICS.description}
              </p>

              {/* How it works */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {MILEAGE_FORENSICS.howItWorks.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="flex-shrink-0 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap gap-2">
                {MILEAGE_FORENSICS.benefits.slice(0, 4).map((benefit, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded border border-amber-200 dark:border-gray-600">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>


            {/* Other Provider Options */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                {t('otherProviderOptions')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                {t('otherProviderDescription')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getSecondaryProviders().map(provider => (
                  <div
                    key={provider.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    {/* Provider Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${
                        provider.id === 'zubie' ? 'from-green-500 to-green-600' :
                        provider.id === 'moovetrax' ? 'from-cyan-500 to-cyan-600' :
                        'from-red-500 to-red-600'
                      } rounded-lg flex items-center justify-center text-white font-bold`}>
                        {provider.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {provider.name}
                          </h3>
                          {provider.hasApiIntegration === false && (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded border border-white/50 whitespace-nowrap">
                              {t('noItwhipIntegration')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{provider.monthlyPrice}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {provider.description}
                    </p>

                    {/* Key Features */}
                    <div className="space-y-1 mb-3">
                      {provider.strengths.slice(0, 3).map((strength, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors text-center"
                    >
                      {t('learnMore')}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Already Have a Device */}
            <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {t('alreadyHaveDevice')}
              </p>
              <button
                onClick={handleSmartcarConnect}
                disabled={smartcarConnecting}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50 font-medium rounded-lg transition-colors"
              >
                {smartcarConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                    {t('connecting')}
                  </>
                ) : (
                  <>
                    <IoLinkOutline className="w-5 h-5" />
                    {t('connectViaSmartcar')}
                  </>
                )}
              </button>
            </div>

            {/* Interactive Demo Card - Provider Card Style */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-200 dark:border-orange-800 p-5 transition-all hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <IoPlayOutline className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('interactiveDemo')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('noSignupRequired')}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                  {t('tryFree')}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('demoDescription')}
              </p>

              {/* Features List */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span>{t('demoFeature1')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span>{t('demoFeature2')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span>{t('demoFeature3')}</span>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/partner/tracking/demo"
                className="block w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
              >
                {t('launchDemo')}
              </Link>
            </div>
          </div>
        ) : (
          // Provider Connected - Full Dashboard View
          <div className="space-y-6">
            {/* Connected Providers Bar */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {connectedProviders.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    provider.status === 'active' ? 'bg-green-500' :
                    provider.status === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-gray-900 dark:text-white">{provider.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {provider.vehicleCount} {t('vehicles')}
                  </span>
                </div>
              ))}
              <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors flex-shrink-0">
                <IoAddOutline className="w-4 h-4" />
                {t('add')}
              </button>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <IoMapOutline className="w-5 h-5 text-gray-400" />
                    {t('liveFleetMap')}
                  </h2>
                  <div className="flex items-center gap-2">
                    {smartcarVehicles.length > 0 && smartcarVehicles[0]?.lastSyncAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('lastSync', { time: formatRelativeTime(smartcarVehicles[0].lastSyncAt) })}
                      </span>
                    )}
                    <button
                      onClick={handleMapRefresh}
                      disabled={mapRefreshing}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <IoRefreshOutline className={`w-4 h-4 ${mapRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="h-96 relative">
                  <LiveFleetMap
                    vehicles={trackedVehicles.map(v => ({
                      id: v.id,
                      make: v.make,
                      model: v.model,
                      year: v.year,
                      status: v.status as 'moving' | 'parked' | 'offline',
                      coordinates: v.coordinates,
                      fuelLevel: v.fuelLevel,
                      batteryLevel: v.batteryLevel,
                      odometer: v.odometer,
                      lastUpdate: v.lastUpdate,
                      provider: v.provider
                    }))}
                    onVehicleSelect={setSelectedVehicle}
                    selectedVehicleId={selectedVehicle}
                    onRefresh={handleMapRefresh}
                    isRefreshing={mapRefreshing}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    {t('fleetStatus')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {trackedVehicles.length}/{totalVehicles}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('tracked')}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {trackedVehicles.filter(v => v.status === 'moving').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('moving')}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {trackedVehicles.filter(v => v.status === 'parked').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('parked')}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {trackedVehicles.filter(v => v.status === 'offline').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('offline')}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {t('quickActions')}
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <IoDownloadOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">{t('exportTripReport')}</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <IoStatsChartOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">{t('mileageForensics')}</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <IoSettingsOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">{t('geofenceSettings')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle List with Remote Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-orange-600 dark:text-orange-400">ItWhip+</span>
                  {t('vehicleControl')}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadSmartcarVehicles()}
                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                  >
                    <IoRefreshOutline className="w-4 h-4" />
                    {t('refresh')}
                  </button>
                  <button className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1">
                    <IoDownloadOutline className="w-4 h-4" />
                    {t('export')}
                  </button>
                </div>
              </div>

              {trackedVehicles.length === 0 ? (
                <div className="p-8 text-center">
                  <IoCarSportOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('noVehiclesConnected')}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {t('connectProviderPrompt')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {trackedVehicles.map(vehicle => (
                    <div key={vehicle.id}>
                      {/* Vehicle Row */}
                      <div
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                          selectedVehicle === vehicle.id ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                        } ${vehicle.isDisabled ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                        onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              vehicle.isDisabled
                                ? 'bg-red-100 dark:bg-red-500/20'
                                : vehicle.status === 'moving'
                                ? 'bg-blue-100 dark:bg-blue-500/20'
                                : vehicle.status === 'parked'
                                ? 'bg-green-100 dark:bg-green-500/20'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <IoCarSportOutline className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                vehicle.isDisabled
                                  ? 'text-red-600 dark:text-red-400'
                                  : vehicle.status === 'moving'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : vehicle.status === 'parked'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-400'
                              }`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                                {vehicle.isDisabled && (
                                  <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-500/30 text-red-600 dark:text-red-400 rounded">{t('statusDisabled').toUpperCase()}</span>
                                )}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                                <IoLocationOutline className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{vehicle.location || t('locationUnknown')}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-400">{t('via', { provider: vehicle.provider })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            {/* Status icons - hidden on mobile */}
                            <div className="hidden sm:flex items-center gap-2">
                              {vehicle.isLocked ? (
                                <IoLockClosedOutline className="w-4 h-4 text-green-500" title={t('locked')} />
                              ) : (
                                <IoLockOpenOutline className="w-4 h-4 text-red-500" title={t('unlocked')} />
                              )}
                              {vehicle.engineRunning && (
                                <IoPowerOutline className="w-4 h-4 text-blue-500 animate-pulse" title="Engine Running" />
                              )}
                              {vehicle.acOn && (
                                <IoSnowOutline className="w-4 h-4 text-cyan-500" title="AC On" />
                              )}
                            </div>
                            <span className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-lg ${getStatusColor(vehicle.status)}`}>
                              {vehicle.isDisabled
                                ? t('disabled')
                                : vehicle.status === 'moving' && vehicle.speed
                                ? t('speedMph', { speed: vehicle.speed })
                                : vehicle.status === 'moving' ? t('statusMoving')
                                : vehicle.status === 'parked' ? t('statusParked')
                                : vehicle.status === 'offline' ? t('statusOffline')
                                : vehicle.status}
                            </span>
                            {vehicle.guest && (
                              <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.guest.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.tripEndsAt}</p>
                              </div>
                            )}
                            <IoChevronForwardOutline className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform ${
                              selectedVehicle === vehicle.id ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Control Panel */}
                      {selectedVehicle === vehicle.id && (
                        <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            {/* Vehicle Stats */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4">
                              <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                                <IoSpeedometerOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                  {vehicle.odometer ? vehicle.odometer.toLocaleString() : '—'}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500">{t('milesLabel')}</p>
                              </div>
                              <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                                {vehicle.isEV ? (
                                  <IoBatteryFullOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                                    vehicle.chargeState?.state === 'CHARGING' ? 'text-green-500 animate-pulse' :
                                    (vehicle.batteryLevel ?? 0) < 20 ? 'text-red-500' : 'text-gray-400'
                                  }`} />
                                ) : (
                                  <IoFlashOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                                    (vehicle.fuelLevel ?? 0) < 20 ? 'text-red-500' : 'text-gray-400'
                                  }`} />
                                )}
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                  {vehicle.batteryLevel ?? vehicle.fuelLevel ?? '—'}%
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                  {vehicle.isEV ? (vehicle.chargeState?.state === 'CHARGING' ? t('chargingLabel') : t('batteryLabel')) : t('fuelLabel')}
                                </p>
                              </div>
                              {/* Oil Life (ICE vehicles) */}
                              {!vehicle.isEV && (
                                <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                                  <IoSpeedometerOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                                    (vehicle.oilLife ?? 100) < 20 ? 'text-orange-500' : 'text-gray-400'
                                  }`} />
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                    {vehicle.oilLife !== null ? `${Math.round(vehicle.oilLife)}%` : '—'}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-500">{t('oilLifeLabel')}</p>
                                </div>
                              )}
                              {/* Charging Status (EVs) */}
                              {vehicle.isEV && (
                                <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                                  <IoFlashOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                                    vehicle.chargeState?.isPluggedIn ? 'text-green-500' : 'text-gray-400'
                                  }`} />
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                    {vehicle.chargeState?.isPluggedIn ? t('yes') : t('no')}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-500">{t('pluggedInLabel')}</p>
                                </div>
                              )}
                              <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                                <IoTimeOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                  {formatRelativeTime(vehicle.lastUpdate)}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500">{t('updated')}</p>
                              </div>
                              <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm hidden sm:block">
                                {vehicle.isLocked ? (
                                  <IoLockClosedOutline className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto mb-1" />
                                ) : (
                                  <IoLockOpenOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto mb-1" />
                                )}
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                  {vehicle.isLocked ? t('locked') : t('unlocked')}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500">{t('doors')}</p>
                              </div>
                              <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm hidden sm:block">
                                <IoNavigateOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                  {vehicle.heading || '—'}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500">{t('heading')}</p>
                              </div>
                            </div>

                            {/* Tire Pressure (if available) */}
                            {vehicle.tirePressure && (
                              <div className="mb-4 p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t('tirePressurePsi')}</p>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                  <div>
                                    <p className="text-[10px] text-gray-500">{t('frontLeft')}</p>
                                    <p className={`text-sm font-semibold ${
                                      vehicle.tirePressure.frontLeft < 30 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                    }`}>{vehicle.tirePressure.frontLeft}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-500">{t('frontRight')}</p>
                                    <p className={`text-sm font-semibold ${
                                      vehicle.tirePressure.frontRight < 30 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                    }`}>{vehicle.tirePressure.frontRight}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-500">{t('backLeft')}</p>
                                    <p className={`text-sm font-semibold ${
                                      vehicle.tirePressure.backLeft < 30 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                    }`}>{vehicle.tirePressure.backLeft}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-500">{t('backRight')}</p>
                                    <p className={`text-sm font-semibold ${
                                      vehicle.tirePressure.backRight < 30 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                    }`}>{vehicle.tirePressure.backRight}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Remote Control Buttons */}
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                {t('remoteCommands')} {vehicle.isEV && <span className="text-emerald-600 ml-1">{t('evControlsAvailable')}</span>}
                              </p>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                                {/* Lock/Unlock */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleLock(vehicle.id, vehicle.smartcarVehicleId) }}
                                  disabled={isLocking === vehicle.id || vehicle.isDisabled}
                                  className={`flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-lg transition-all ${
                                    vehicle.isDisabled
                                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                      : vehicle.isLocked
                                      ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 border border-green-300 dark:border-green-500/30'
                                      : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 border border-red-300 dark:border-red-500/30'
                                  } ${isLocking === vehicle.id ? 'opacity-50' : ''}`}
                                >
                                  {isLocking === vehicle.id ? (
                                    <IoRefreshOutline className="w-5 h-5 animate-spin" />
                                  ) : vehicle.isLocked ? (
                                    <IoLockClosedOutline className="w-5 h-5" />
                                  ) : (
                                    <IoLockOpenOutline className="w-5 h-5" />
                                  )}
                                  <span className="text-[10px] font-medium">
                                    {isLocking === vehicle.id ? '...' : vehicle.isLocked ? t('unlock') : t('lock')}
                                  </span>
                                </button>

                                {/* EV Charging Control */}
                                {vehicle.isEV && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleCharging(vehicle.id) }}
                                    disabled={isChargingControl === vehicle.id || vehicle.isDisabled}
                                    className={`flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-lg transition-all border ${
                                      vehicle.isDisabled
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : vehicle.chargeState?.state === 'CHARGING'
                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 border-green-300 dark:border-green-500/30'
                                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 border-emerald-300 dark:border-emerald-500/30'
                                    } ${isChargingControl === vehicle.id ? 'opacity-50' : ''}`}
                                  >
                                    {isChargingControl === vehicle.id ? (
                                      <IoRefreshOutline className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <IoFlashOutline className={`w-5 h-5 ${vehicle.chargeState?.state === 'CHARGING' ? 'animate-pulse' : ''}`} />
                                    )}
                                    <span className="text-[10px] font-medium">
                                      {isChargingControl === vehicle.id ? '...' : vehicle.chargeState?.state === 'CHARGING' ? t('stopCharge') : t('startCharge')}
                                    </span>
                                  </button>
                                )}

                                {/* Locate */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); locateVehicle(vehicle.id) }}
                                  disabled={isLocating === vehicle.id || !vehicle.coordinates}
                                  className={`flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-lg transition-all border ${
                                    !vehicle.coordinates
                                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 cursor-not-allowed'
                                      : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 border-purple-300 dark:border-purple-500/30'
                                  } ${isLocating === vehicle.id ? 'opacity-50' : ''}`}
                                >
                                  {isLocating === vehicle.id ? (
                                    <IoRefreshOutline className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <IoLocateOutline className="w-5 h-5" />
                                  )}
                                  <span className="text-[10px] font-medium">{t('locate')}</span>
                                </button>

                                {/* Refresh Data */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); refreshVehicleData(vehicle.id) }}
                                  disabled={refreshingVehicle === vehicle.id}
                                  className={`flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-lg transition-all border bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 border-blue-300 dark:border-blue-500/30 ${refreshingVehicle === vehicle.id ? 'opacity-50' : ''}`}
                                >
                                  <IoRefreshOutline className={`w-5 h-5 ${refreshingVehicle === vehicle.id ? 'animate-spin' : ''}`} />
                                  <span className="text-[10px] font-medium">{t('sync')}</span>
                                </button>

                                {/* View on Map */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); locateVehicle(vehicle.id) }}
                                  disabled={!vehicle.coordinates}
                                  className={`flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-lg transition-all border ${
                                    !vehicle.coordinates
                                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 cursor-not-allowed'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border-gray-300 dark:border-gray-600'
                                  }`}
                                >
                                  <IoMapOutline className="w-5 h-5" />
                                  <span className="text-[10px] font-medium">{t('map')}</span>
                                </button>

                                {/* Trip History */}
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-lg transition-all border bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 border-orange-300 dark:border-orange-500/30"
                                >
                                  <IoStatsChartOutline className="w-5 h-5" />
                                  <span className="text-[10px] font-medium">{t('history')}</span>
                                </button>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
                                <IoMapOutline className="w-4 h-4" />
                                {t('viewTripHistory')}
                              </button>
                              {vehicle.guest && (
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                  <IoChatbubbleOutline className="w-4 h-4" />
                                  {t('messageGuest')}
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSmartcarDisconnect(vehicle.id) }}
                                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <IoCloseCircleOutline className="w-4 h-4" />
                                {t('disconnect')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
