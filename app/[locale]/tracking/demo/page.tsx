// app/tracking/demo/page.tsx
// PUBLIC Fleet Tracking Demo - Interactive demo for public visitors
// No authentication required - showcases ItWhip+ tracking capabilities

'use client'

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
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
  HonkDemo,
  MileageForensicsDemo
} from '@/app/partner/tracking/demo/components'
import {
  IoAlertCircleOutline,
  IoArrowForwardOutline,
  IoCarSportOutline,
  IoEllipseOutline,
  IoFlashOffOutline,
  IoFlashOutline,
  IoLocationOutline,
  IoLockClosedOutline,
  IoMapOutline,
  IoPersonOutline,
  IoSnowOutline,
  IoSpeedometerOutline,
  IoThermometerOutline
} from 'react-icons/io5'

// Import shared types and data
import type { DemoVehicle, FeatureId } from '@/app/partner/tracking/shared/types'
import {
  PROVIDER_FEATURES,
  PHOENIX_LOCATIONS,
  LIVE_ALERT_PROVIDERS
} from '@/app/partner/tracking/shared/providers'

// Phoenix area coordinates
const PHOENIX_CENTER = PHOENIX_LOCATIONS.PHOENIX_CENTER
const SCOTTSDALE = PHOENIX_LOCATIONS.SCOTTSDALE
const SKY_HARBOR = PHOENIX_LOCATIONS.SKY_HARBOR

const DEMO_VEHICLES: DemoVehicle[] = [
  {
    id: 'demo-1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    licensePlate: '8ABC123',
    vin: '5YJ3E1EA1PF******',
    status: 'moving',
    location: 'I-10 E near 51st Ave, Phoenix AZ',
    coordinates: { lat: 33.4350, lng: -112.1350 },
    speed: 72,
    heading: 'East',
    lastUpdate: new Date().toISOString(),
    provider: 'Smartcar',
    guest: { name: 'Sarah Mitchell', phone: '(480) 555-1234' },
    tripStarted: new Date(Date.now() - 3600000 * 2).toISOString(),
    tripEndsAt: '4h 32m remaining',
    fuelLevel: 78,
    batteryLevel: 78,
    odometer: 34521,
    isElectric: true,
    isLocked: true,
    engineRunning: true,
    acOn: true,
    interiorTemp: 72,
    exteriorTemp: 108,
    route: [
      { lat: 33.4350, lng: -112.1350 },
      { lat: 33.4380, lng: -112.1000 },
      { lat: 33.4400, lng: -112.0700 },
      { lat: 33.4450, lng: -112.0400 },
      { lat: 33.4373, lng: -112.0078 }
    ],
    isDisabled: false
  },
  {
    id: 'demo-2',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    licensePlate: '7XYZ789',
    vin: 'WBAJB0C51JB******',
    status: 'parked',
    location: '7014 E Camelback Rd, Scottsdale AZ',
    coordinates: { lat: 33.5091, lng: -111.9782 },
    speed: 0,
    heading: null,
    lastUpdate: new Date(Date.now() - 1800000).toISOString(),
    provider: 'Bouncie',
    guest: null,
    tripStarted: null,
    tripEndsAt: null,
    fuelLevel: 82,
    batteryLevel: null,
    odometer: 28450,
    isElectric: false,
    isLocked: true,
    engineRunning: false,
    acOn: false,
    interiorTemp: 142,
    exteriorTemp: 112,
    route: [],
    isDisabled: false
  },
  {
    id: 'demo-3',
    make: 'Honda',
    model: 'Accord',
    year: 2022,
    licensePlate: '5DEF456',
    vin: '1HGCV1F34NA******',
    status: 'parked',
    location: '4420 N Scottsdale Rd, Scottsdale AZ',
    coordinates: { lat: 33.4942, lng: -111.9261 },
    speed: 0,
    heading: null,
    lastUpdate: new Date(Date.now() - 600000).toISOString(),
    provider: 'Bouncie',
    guest: { name: 'Mike Roberts', phone: '(602) 555-9876' },
    tripStarted: null,
    tripEndsAt: 'Pickup in 1h 48m',
    fuelLevel: 91,
    batteryLevel: null,
    odometer: 42100,
    isElectric: false,
    isLocked: true,
    engineRunning: false,
    acOn: false,
    interiorTemp: 138,
    exteriorTemp: 110,
    route: [],
    isDisabled: false
  }
]

const DEMO_ALERTS = [
  { id: '1', type: 'speed', message: 'Tesla Model 3 exceeded 85mph on I-10', timestamp: new Date(Date.now() - 3600000).toISOString(), vehicle: 'Tesla Model 3', severity: 'warning' },
  { id: '2', type: 'geofence', message: 'Tesla Model 3 approaching Phoenix metro boundary', timestamp: new Date(Date.now() - 7200000).toISOString(), vehicle: 'Tesla Model 3', severity: 'info' },
  { id: '3', type: 'temp', message: 'BMW X5 interior reached 142°F - MaxAC alert', timestamp: new Date(Date.now() - 5400000).toISOString(), vehicle: 'BMW X5', severity: 'critical' }
]

const WEBHOOK_ALERTS = [
  { type: 'speed', message: 'Tesla Model 3 hit 92mph near Loop 101', severity: 'warning' },
  { type: 'geofence', message: 'BMW X5 exited Phoenix Metro zone', severity: 'critical' },
  { type: 'temp', message: 'Tesla Model 3 interior at 128°F - cooling recommended', severity: 'warning' },
  { type: 'speed', message: 'BMW X5 exceeded 80mph on US-60', severity: 'warning' },
  { type: 'geofence', message: 'Tesla Model 3 entered Sky Harbor Airport zone', severity: 'info' },
  { type: 'temp', message: 'BMW X5 MaxAC triggered - cooling to 72°F', severity: 'info' },
]

const DEMO_GEOFENCES = [
  { id: 'phoenix-metro', name: 'Phoenix Metro', center: PHOENIX_CENTER, radius: 50, color: '#22c55e' },
  { id: 'sky-harbor', name: 'Sky Harbor Airport', center: SKY_HARBOR, radius: 5, color: '#3b82f6' },
  { id: 'home-base', name: 'Home Base', center: SCOTTSDALE, radius: 2, color: '#f97316' }
]

type FeatureDemo = FeatureId | null

export default function PublicTrackingDemoPage() {
  const [vehicles, setVehicles] = useState<DemoVehicle[]>(DEMO_VEHICLES)
  const [alerts, setAlerts] = useState(DEMO_ALERTS)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [showGeofences, setShowGeofences] = useState(true)
  const [activeFeatureDemo, setActiveFeatureDemo] = useState<FeatureDemo>(null)

  // Simulated webhook - new alerts appear periodically
  const webhookIndexRef = useRef(0)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const simulateWebhook = () => {
      const alert = WEBHOOK_ALERTS[webhookIndexRef.current % WEBHOOK_ALERTS.length]
      const newAlert = {
        id: `webhook-${Date.now()}`,
        ...alert,
        timestamp: new Date().toISOString(),
        vehicle: alert.message.includes('Tesla') ? 'Tesla Model 3' : 'BMW X5'
      }
      setAlerts(prev => [newAlert, ...prev].slice(0, 10))
      webhookIndexRef.current++
    }

    const initialTimer = setTimeout(() => {
      simulateWebhook()
      intervalId = setInterval(simulateWebhook, 6000)
    }, 3000)

    return () => {
      clearTimeout(initialTimer)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  const openFeatureDemo = (featureId: FeatureDemo) => {
    setActiveFeatureDemo(featureId)
  }

  const closeFeatureDemo = () => {
    setActiveFeatureDemo(null)
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const getFeatureColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      cyan: 'from-cyan-500 to-cyan-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600',
      gray: 'from-gray-600 to-gray-700',
      orange: 'from-orange-500 to-orange-600',
      amber: 'from-amber-500 to-amber-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      {/* Feature Demo Modal */}
      <FeatureDemoModal
        feature={PROVIDER_FEATURES.find(f => f.id === activeFeatureDemo) || null}
        isOpen={activeFeatureDemo !== null}
        onClose={closeFeatureDemo}
      >
        {activeFeatureDemo === 'gps' && <GpsDemo />}
        {activeFeatureDemo === 'lock' && <LockDemo />}
        {activeFeatureDemo === 'start' && <RemoteStartDemo />}
        {activeFeatureDemo === 'precool' && <PreCoolDemo />}
        {activeFeatureDemo === 'geofence' && <GeofenceDemo />}
        {activeFeatureDemo === 'speed' && <SpeedAlertDemo />}
        {activeFeatureDemo === 'killswitch' && <KillSwitchDemo />}
        {activeFeatureDemo === 'honk' && <HonkDemo />}
        {activeFeatureDemo === 'mileage' && <MileageForensicsDemo />}
      </FeatureDemoModal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">ItWhip+</span>
              <sup className="text-xs text-amber-500">™</sup>
              <span>in Action</span>
              <span className="px-2 py-0.5 text-xs bg-amber-500 text-white font-medium rounded-lg">LIVE DEMO</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Phoenix Demo Fleet • <span className="text-amber-600 dark:text-amber-400">OBD + API</span> = Unified Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">Live</span>
          </div>
        </div>
        {/* ItWhip+ Feature Suite */}
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-500/30 p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-1">
              <span className="text-amber-600 dark:text-amber-400">ItWhip+</span><sup className="text-[8px] text-amber-500">™</sup>
              <span className="hidden xs:inline">Feature Suite</span>
            </h2>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded border border-amber-300 dark:border-amber-500/30 whitespace-nowrap">
                OBD + API
              </span>
              <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-bold whitespace-nowrap">Free</span>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
            8 features unified • <span className="text-amber-600 dark:text-amber-400 font-medium">Mileage Forensics™</span> exclusive to ItWhip+
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
            {PROVIDER_FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => openFeatureDemo(feature.id)}
                className={`p-2 sm:p-3 bg-gradient-to-br ${getFeatureColor(feature.color)} rounded-lg text-center transition-all hover:scale-105 hover:shadow-lg group cursor-pointer relative ${
                  feature.id === 'mileage' ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-white dark:ring-offset-gray-800' : ''
                }`}
              >
                {feature.id === 'mileage' && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded shadow-sm">
                    EXCLUSIVE
                  </span>
                )}
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-0.5 sm:mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] sm:text-xs text-white font-medium leading-tight">{feature.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {/* Map - 2 columns */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col min-h-[400px] sm:min-h-[500px] lg:h-full">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                <IoMapOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">ItWhip+</span>
                <span>Fleet Map</span>
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowGeofences(!showGeofences)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    showGeofences
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoEllipseOutline className="w-3 h-3 inline mr-1" />
                  <span className="hidden sm:inline">Geofences</span>
                </button>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                <TrackingMap
                  vehicles={vehicles as any}
                  geofences={DEMO_GEOFENCES}
                  homeBase={SCOTTSDALE}
                  onVehicleSelect={setSelectedVehicle}
                  selectedVehicleId={selectedVehicle}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">
                  <div className="text-center">
                    <IoMapOutline className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Map requires Mapbox configuration</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Fleet Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-400">ItWhip+</span> Fleet Status
              </h3>
              <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{vehicles.length}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{vehicles.filter(v => v.status === 'moving').length}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Moving</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20">
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{vehicles.filter(v => v.status === 'parked').length}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Parked</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
                  <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{vehicles.filter(v => v.isDisabled).length}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Disabled</p>
                </div>
              </div>
            </div>

            {/* Alerts - Live Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-500/30 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wide">
                    ItWhip+ Alerts
                  </h3>
                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
                    UNIFIED
                  </span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {alerts.length}
                </span>
              </div>
              {/* Provider aggregation row */}
              <div className="flex items-center gap-1 mb-3 pb-2 border-b border-amber-100 dark:border-amber-500/20">
                <span className="text-[9px] text-gray-500 dark:text-gray-400">Aggregating from:</span>
                {LIVE_ALERT_PROVIDERS.slice(0, 2).map(provider => (
                  <span key={provider} className="px-1.5 py-0.5 text-[8px] font-medium rounded border-2 border-amber-300 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10">
                    {provider === 'Bouncie' ? 'Bouncie' : 'Smartcar'}
                  </span>
                ))}
                <span className="text-[8px] text-gray-400">+{LIVE_ALERT_PROVIDERS.length - 2}</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {alerts.slice(0, 8).map((alert, index) => (
                  <div
                    key={alert.id}
                    className={`py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 rounded-lg ${index === 0 ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`flex-shrink-0 ${
                        alert.type === 'speed' ? 'text-red-500' :
                        alert.type === 'geofence' ? 'text-yellow-500' :
                        alert.type === 'temp' ? 'text-orange-500' :
                        alert.type === 'killswitch' ? 'text-red-600' : 'text-blue-500'
                      }`}>
                        {alert.type === 'speed' && <IoSpeedometerOutline className="w-5 h-5" />}
                        {alert.type === 'geofence' && <IoLocationOutline className="w-5 h-5" />}
                        {alert.type === 'temp' && <IoThermometerOutline className="w-5 h-5" />}
                        {alert.type === 'killswitch' && <IoFlashOffOutline className="w-5 h-5" />}
                        {!['speed', 'geofence', 'temp', 'killswitch'].includes(alert.type) && <IoAlertCircleOutline className="w-5 h-5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm leading-tight ${
                          alert.type === 'speed' ? 'text-red-600 dark:text-red-400' :
                          alert.type === 'geofence' ? 'text-yellow-600 dark:text-yellow-400' :
                          alert.type === 'temp' ? 'text-orange-600 dark:text-orange-400' :
                          alert.type === 'killswitch' ? 'text-red-700 dark:text-red-300' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-600 dark:text-white font-medium">{formatRelativeTime(alert.timestamp)}</span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-300 dark:border-white/30 text-[9px] font-medium text-gray-700 dark:text-white">
                            <IoPersonOutline className="w-3 h-3" />
                            {alert.vehicle === 'Tesla Model 3' ? 'Marcus J.' : 'Sarah K.'}
                          </span>
                          {alert.type === 'speed' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-400/50 text-[9px] font-bold text-red-600 dark:text-red-400">
                              <IoFlashOutline className="w-3 h-3" />
                              {Math.floor(78 + Math.random() * 20)}mph
                            </span>
                          )}
                          {alert.type === 'temp' && (
                            <>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-orange-300 dark:border-orange-400/50 text-[9px] font-bold text-orange-600 dark:text-orange-400">
                                <IoThermometerOutline className="w-3 h-3" />
                                {Math.floor(125 + Math.random() * 20)}°F
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-cyan-300 dark:border-cyan-400/50 text-[9px] font-medium text-cyan-600 dark:text-cyan-400">
                                <IoSnowOutline className="w-3 h-3" />
                                A/C Off
                              </span>
                            </>
                          )}
                          {alert.type === 'geofence' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-yellow-300 dark:border-yellow-400/50 text-[9px] font-medium text-yellow-600 dark:text-yellow-400">
                              <IoMapOutline className="w-3 h-3" />
                              {alert.message.includes('Sky Harbor') ? 'Airport Zone' : alert.message.includes('exited') ? 'Outside Zone' : 'Metro Boundary'}
                            </span>
                          )}
                          {alert.type === 'killswitch' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-400 dark:border-red-400 text-[9px] font-bold text-red-700 dark:text-red-400">
                              <IoLockClosedOutline className="w-3 h-3" />
                              DISABLED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg p-4 sm:p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <IoCarSportOutline className="w-6 h-6" />
                <h3 className="font-bold">Start Tracking Your Fleet</h3>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Get all 8 features free when you become an ItWhip host. No monthly fees.
              </p>
              <Link
                href="/host-requirements"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg text-sm hover:bg-orange-50 transition-colors"
              >
                Become a Host
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
