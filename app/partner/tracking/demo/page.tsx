// app/partner/tracking/demo/page.tsx
// Interactive Tracking Demo - Tesla-inspired feature demonstrations
// This is separate from the real tracking implementation

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
} from './components'
import {
  IoLocationOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoSettingsOutline,
  IoNavigateOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoDownloadOutline,
  IoMapOutline,
  IoStatsChartOutline,
  IoFlashOutline,
  IoThermometerOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoPlayOutline,
  IoBatteryFullOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoPowerOutline,
  IoEllipseOutline,
  IoVolumeHighOutline,
  IoSnowOutline,
  IoSunnyOutline,
  IoLocateOutline,
  IoNotificationsOutline,
  IoPulseOutline,
  IoArrowBackOutline,
  IoCarOutline,
  IoEyeOutline,
  IoFlashOffOutline,
  IoStopCircleOutline,
  IoRadioButtonOnOutline,
  IoHandLeftOutline,
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline
} from 'react-icons/io5'


// Phoenix area coordinates
const PHOENIX_CENTER = { lat: 33.4484, lng: -112.0740 }
const SCOTTSDALE = { lat: 33.4942, lng: -111.9261 }
const SKY_HARBOR = { lat: 33.4373, lng: -112.0078 }

// Demo vehicles with realistic Phoenix data
interface DemoVehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin: string
  status: 'moving' | 'parked' | 'offline' | 'disabled'
  location: string
  coordinates: { lat: number; lng: number }
  speed: number
  heading: string | null
  lastUpdate: string
  provider: string
  guest: { name: string; phone: string } | null
  tripStarted: string | null
  tripEndsAt: string | null
  fuelLevel: number
  batteryLevel: number | null
  odometer: number
  isElectric: boolean
  isLocked: boolean
  engineRunning: boolean
  acOn: boolean
  interiorTemp: number
  exteriorTemp: number
  route: Array<{ lat: number; lng: number }>
  isDisabled: boolean
}

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
  { id: '3', type: 'temp', message: 'BMW X5 interior reached 142°F - MaxAC™ alert', timestamp: new Date(Date.now() - 5400000).toISOString(), vehicle: 'BMW X5', severity: 'critical' }
]

// Simulated webhook alerts that will appear over time
const WEBHOOK_ALERTS = [
  { type: 'speed', message: 'Tesla Model 3 hit 92mph near Loop 101', severity: 'warning' },
  { type: 'geofence', message: 'BMW X5 exited Phoenix Metro zone', severity: 'critical' },
  { type: 'temp', message: 'Tesla Model 3 interior at 128°F - cooling recommended', severity: 'warning' },
  { type: 'speed', message: 'BMW X5 exceeded 80mph on US-60', severity: 'warning' },
  { type: 'geofence', message: 'Tesla Model 3 entered Sky Harbor Airport zone', severity: 'info' },
  { type: 'temp', message: 'BMW X5 MaxAC™ triggered - cooling to 72°F', severity: 'info' },
  { type: 'speed', message: 'Tesla Model 3 rapid acceleration detected', severity: 'warning' },
  { type: 'geofence', message: 'BMW X5 approaching restricted area', severity: 'critical' },
]

// Geofence zones
const DEMO_GEOFENCES = [
  { id: 'phoenix-metro', name: 'Phoenix Metro', center: PHOENIX_CENTER, radius: 50, color: '#22c55e' },
  { id: 'sky-harbor', name: 'Sky Harbor Airport', center: SKY_HARBOR, radius: 5, color: '#3b82f6' },
  { id: 'home-base', name: 'Home Base', center: SCOTTSDALE, radius: 2, color: '#f97316' }
]

// Feature demo type
type FeatureDemo = 'gps' | 'lock' | 'start' | 'precool' | 'geofence' | 'speed' | 'killswitch' | 'honk' | null

// Alert type to provider mapping - which providers support each alert type
const ALERT_PROVIDER_SUPPORT: Record<string, { providers: string[]; description: string }> = {
  speed: {
    providers: ['Bouncie', 'Zubie', 'Trackimo'],
    description: 'Real-time speed monitoring with customizable thresholds'
  },
  geofence: {
    providers: ['Bouncie', 'Smartcar', 'Zubie', 'Trackimo'],
    description: 'Virtual boundary alerts when vehicle enters/exits zones'
  },
  temp: {
    providers: ['Smartcar', 'MooveTrax'],
    description: 'Interior temperature monitoring for climate control'
  },
  killswitch: {
    providers: ['MooveTrax'],
    description: 'Remote vehicle disable for theft prevention'
  },
  info: {
    providers: ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo'],
    description: 'General vehicle status notifications'
  }
}

// Live alerts overall - all providers that support real-time alerts
const LIVE_ALERT_PROVIDERS = ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo']

// Demo renter data
const DEMO_RENTERS = {
  'Tesla Model 3': {
    name: 'Marcus Johnson',
    phone: '+1 (602) 555-0147',
    email: 'marcus.j@email.com',
    photo: null,
    licenseVerified: true,
    bookingId: 'BK-2024-8847',
    tripStart: '2024-01-12',
    tripEnd: '2024-01-19',
    daysRemaining: 4
  },
  'BMW X5': {
    name: 'Sarah Kim',
    phone: '+1 (480) 555-0293',
    email: 'sarah.kim@email.com',
    photo: null,
    licenseVerified: true,
    bookingId: 'BK-2024-8851',
    tripStart: '2024-01-10',
    tripEnd: '2024-01-17',
    daysRemaining: 2
  }
}

// Provider features showcase
const PROVIDER_FEATURES = [
  { id: 'gps' as FeatureDemo, icon: IoLocationOutline, label: 'Real-time GPS', description: 'Live location updates every 10 seconds', providers: ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo'], color: 'blue' },
  { id: 'lock' as FeatureDemo, icon: IoLockClosedOutline, label: 'Lock/Unlock', description: 'Remote door lock control', providers: ['Smartcar', 'MooveTrax'], color: 'green' },
  { id: 'start' as FeatureDemo, icon: IoPowerOutline, label: 'Remote Start', description: 'Start engine remotely', providers: ['Smartcar', 'MooveTrax'], color: 'purple' },
  { id: 'precool' as FeatureDemo, icon: IoSnowOutline, label: 'Pre-Cool (MaxAC™)', description: 'Cool car before guest pickup', providers: ['Smartcar'], color: 'cyan' },
  { id: 'geofence' as FeatureDemo, icon: IoEllipseOutline, label: 'Geofencing', description: 'Alerts when car leaves area', providers: ['Bouncie', 'Smartcar', 'Zubie', 'Trackimo'], color: 'yellow' },
  { id: 'speed' as FeatureDemo, icon: IoSpeedometerOutline, label: 'Speed Alerts', description: 'Notifications for speeding', providers: ['Bouncie', 'Zubie', 'Trackimo'], color: 'red' },
  { id: 'killswitch' as FeatureDemo, icon: IoFlashOffOutline, label: 'Kill Switch', description: 'Disable vehicle remotely', providers: ['MooveTrax'], color: 'red' },
  { id: 'honk' as FeatureDemo, icon: IoVolumeHighOutline, label: 'Honk Horn', description: 'Locate car in parking lot', providers: ['Smartcar', 'MooveTrax'], color: 'yellow' }
]

export default function TrackingDemoPage() {
  const [vehicles, setVehicles] = useState<DemoVehicle[]>(DEMO_VEHICLES)
  const [alerts, setAlerts] = useState(DEMO_ALERTS)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [showGeofences, setShowGeofences] = useState(true)

  // Feature demo modal state
  const [activeFeatureDemo, setActiveFeatureDemo] = useState<FeatureDemo>(null)
  const [demoStep, setDemoStep] = useState(0)
  const [demoAnimating, setDemoAnimating] = useState(false)

  // Remote action states
  const [isLocking, setIsLocking] = useState<string | null>(null)
  const [isStartingEngine, setIsStartingEngine] = useState<string | null>(null)
  const [isPreCooling, setIsPreCooling] = useState<string | null>(null)
  const [isHonking, setIsHonking] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState<string | null>(null)
  const [isKilling, setIsKilling] = useState<string | null>(null)

  // Demo-specific states
  const [gpsTrail, setGpsTrail] = useState<Array<{ lat: number; lng: number; time: string }>>([])
  const [currentSpeed, setCurrentSpeed] = useState(72)
  const [speedAlertThreshold, setSpeedAlertThreshold] = useState(80)
  const [tempDisplay, setTempDisplay] = useState(142)
  const [lockAnimationPhase, setLockAnimationPhase] = useState(0)
  const [engineAnimationPhase, setEngineAnimationPhase] = useState(0)
  const [hornWaves, setHornWaves] = useState(0)
  const [killSwitchConfirm, setKillSwitchConfirm] = useState(false)

  // Alert detail modal state
  const [selectedAlert, setSelectedAlert] = useState<typeof DEMO_ALERTS[0] | null>(null)
  const [alertMessage, setAlertMessage] = useState('')
  const [messageSent, setMessageSent] = useState(false)

  // Simulated webhook - new alerts appear every 5-8 seconds
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
      setAlerts(prev => [newAlert, ...prev].slice(0, 10)) // Keep max 10 alerts
      webhookIndexRef.current++
    }

    // Add first alert after 3 seconds, then every 6 seconds
    const initialTimer = setTimeout(() => {
      simulateWebhook()
      intervalId = setInterval(simulateWebhook, 6000)
    }, 3000)

    return () => {
      clearTimeout(initialTimer)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  // Feature demo animations
  useEffect(() => {
    if (!activeFeatureDemo) {
      setDemoStep(0)
      setDemoAnimating(false)
      return
    }

    // Auto-progress demos
    const timer = setInterval(() => {
      if (activeFeatureDemo === 'gps') {
        // Add GPS breadcrumb
        setGpsTrail(prev => {
          const newPoint = {
            lat: 33.4350 + (Math.random() - 0.5) * 0.01,
            lng: -112.1350 + prev.length * 0.005,
            time: new Date().toLocaleTimeString()
          }
          return [...prev.slice(-20), newPoint]
        })
      } else if (activeFeatureDemo === 'speed') {
        // Fluctuate speed
        setCurrentSpeed(prev => {
          const newSpeed = prev + (Math.random() - 0.4) * 5
          return Math.max(45, Math.min(95, newSpeed))
        })
      } else if (activeFeatureDemo === 'precool') {
        // Cool down temperature
        setTempDisplay(prev => Math.max(72, prev - 2))
      }
    }, 500)

    return () => clearInterval(timer)
  }, [activeFeatureDemo])

  // Feature demo handlers
  const openFeatureDemo = (featureId: FeatureDemo) => {
    setActiveFeatureDemo(featureId)
    setDemoStep(0)
    setDemoAnimating(false)
    setGpsTrail([])
    setTempDisplay(142)
    setCurrentSpeed(72)
    setLockAnimationPhase(0)
    setEngineAnimationPhase(0)
    setHornWaves(0)
    setKillSwitchConfirm(false)
  }

  const closeFeatureDemo = () => {
    setActiveFeatureDemo(null)
  }

  // Demo action simulations
  const runLockDemo = async () => {
    setDemoAnimating(true)
    setLockAnimationPhase(1) // Sending signal
    await new Promise(r => setTimeout(r, 800))
    setLockAnimationPhase(2) // Doors locking
    await new Promise(r => setTimeout(r, 600))
    setLockAnimationPhase(3) // Confirmed
    await new Promise(r => setTimeout(r, 400))
    setLockAnimationPhase(4) // Complete
    setDemoAnimating(false)
  }

  const runEngineDemo = async () => {
    setDemoAnimating(true)
    setEngineAnimationPhase(1) // Authenticating
    await new Promise(r => setTimeout(r, 1000))
    setEngineAnimationPhase(2) // Starting
    await new Promise(r => setTimeout(r, 1500))
    setEngineAnimationPhase(3) // Running
    setDemoAnimating(false)
  }

  const runHonkDemo = async () => {
    setDemoAnimating(true)
    for (let i = 0; i < 3; i++) {
      setHornWaves(i + 1)
      await new Promise(r => setTimeout(r, 400))
    }
    await new Promise(r => setTimeout(r, 500))
    setHornWaves(0)
    setDemoAnimating(false)
  }

  const runKillSwitchDemo = async () => {
    if (!killSwitchConfirm) {
      setKillSwitchConfirm(true)
      return
    }
    setDemoAnimating(true)
    await new Promise(r => setTimeout(r, 2000))
    setVehicles(prev => prev.map(v =>
      v.id === 'demo-2' ? { ...v, isDisabled: true, status: 'disabled' as const, engineRunning: false } : v
    ))
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'killswitch',
      message: 'BMW X5 DISABLED - Kill switch activated',
      timestamp: new Date().toISOString(),
      vehicle: 'BMW X5',
      severity: 'critical'
    }, ...prev])
    setDemoAnimating(false)
    setKillSwitchConfirm(false)
  }

  // Remote action handlers
  const toggleLock = async (vehicleId: string) => {
    setIsLocking(vehicleId)
    await new Promise(r => setTimeout(r, 1500))
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, isLocked: !v.isLocked } : v
    ))
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'info',
      message: `${vehicle?.make} ${vehicle?.model} ${vehicle?.isLocked ? 'unlocked' : 'locked'} successfully`,
      timestamp: new Date().toISOString(),
      vehicle: `${vehicle?.make} ${vehicle?.model}`,
      severity: 'info'
    }, ...prev])
    setIsLocking(null)
  }

  const toggleEngine = async (vehicleId: string) => {
    setIsStartingEngine(vehicleId)
    await new Promise(r => setTimeout(r, 2000))
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, engineRunning: !v.engineRunning } : v
    ))
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'info',
      message: `${vehicle?.make} ${vehicle?.model} engine ${vehicle?.engineRunning ? 'stopped' : 'started'} remotely`,
      timestamp: new Date().toISOString(),
      vehicle: `${vehicle?.make} ${vehicle?.model}`,
      severity: 'info'
    }, ...prev])
    setIsStartingEngine(null)
  }

  const startPreCool = async (vehicleId: string) => {
    setIsPreCooling(vehicleId)
    await new Promise(r => setTimeout(r, 2500))
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, acOn: true, interiorTemp: 72, engineRunning: true } : v
    ))
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'success',
      message: `MaxAC™ Pre-cooling started on ${vehicle?.make} ${vehicle?.model}`,
      timestamp: new Date().toISOString(),
      vehicle: `${vehicle?.make} ${vehicle?.model}`,
      severity: 'success'
    }, ...prev])
    setIsPreCooling(null)
  }

  const honkHorn = async (vehicleId: string) => {
    setIsHonking(vehicleId)
    await new Promise(r => setTimeout(r, 1000))
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'info',
      message: `Horn activated on ${vehicle?.make} ${vehicle?.model}`,
      timestamp: new Date().toISOString(),
      vehicle: `${vehicle?.make} ${vehicle?.model}`,
      severity: 'info'
    }, ...prev])
    setIsHonking(null)
  }

  const locateVehicle = async (vehicleId: string) => {
    setIsLocating(vehicleId)
    await new Promise(r => setTimeout(r, 1000))
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle && mapRef.current) {
      mapRef.current.flyTo({
        center: [vehicle.coordinates.lng, vehicle.coordinates.lat],
        zoom: 16,
        pitch: 60,
        bearing: 0
      })
    }
    setIsLocating(null)
  }

  const activateKillSwitch = async (vehicleId: string) => {
    setIsKilling(vehicleId)
    await new Promise(r => setTimeout(r, 2500))
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, isDisabled: true, status: 'disabled' as const, engineRunning: false, speed: 0 } : v
    ))
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'killswitch',
      message: `KILL SWITCH ACTIVATED - ${vehicle?.make} ${vehicle?.model} disabled`,
      timestamp: new Date().toISOString(),
      vehicle: `${vehicle?.make} ${vehicle?.model}`,
      severity: 'critical'
    }, ...prev])
    setIsKilling(null)
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'parked': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'disabled': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'speed': return 'border-red-300 dark:border-red-400 bg-red-50 dark:bg-red-950 text-red-700 dark:text-white dark:shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      case 'geofence': return 'border-yellow-300 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-white dark:shadow-[0_0_10px_rgba(234,179,8,0.3)]'
      case 'temp': return 'border-orange-300 dark:border-orange-400 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-white dark:shadow-[0_0_10px_rgba(249,115,22,0.3)]'
      case 'success': return 'border-green-300 dark:border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-white dark:shadow-[0_0_10px_rgba(34,197,94,0.3)]'
      case 'killswitch': return 'border-red-500 dark:border-red-500 bg-red-100 dark:bg-red-900 text-red-800 dark:text-white font-bold dark:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
      case 'info': return 'border-blue-300 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-white dark:shadow-[0_0_10px_rgba(59,130,246,0.3)]'
      default: return 'border-gray-200 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white'
    }
  }

  const getFeatureColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500',
      green: 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500',
      cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500',
      yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500',
      red: 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Feature Demo Modal - Using Componentized Demos */}
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
      </FeatureDemoModal>

      {/* Demo Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Top row on mobile: Back + Logo + Live indicator */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link
                  href="/partner/tracking"
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <IoArrowBackOutline className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Back</span>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Image
                    src="/logo.png"
                    alt="ItWhip"
                    width={28}
                    height={28}
                    className="rounded-lg sm:w-8 sm:h-8"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div>
                    <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <span className="hidden xs:inline">ItWhip</span> Tracking Demo
                      <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-white/20 rounded-lg hidden sm:inline">INTERACTIVE</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Experience the full tracking dashboard</p>
                  </div>
                </div>
              </div>
              {/* Live indicator - visible on mobile next to logo */}
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-white/20 rounded-lg sm:hidden">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm">Live</span>
              </div>
            </div>
            {/* Right side - Desktop only location + Live indicator */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-white/60">Demo Fleet</p>
                <p className="text-sm font-semibold">Phoenix, Arizona</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Provider Features Showcase - Now clickable! */}
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Available Features by Provider
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">Tap any feature to see it in action</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
            {PROVIDER_FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => openFeatureDemo(feature.id)}
                className={`p-2 sm:p-3 bg-gradient-to-br ${getFeatureColor(feature.color)} rounded-lg text-center transition-all hover:scale-105 hover:shadow-lg group cursor-pointer`}
              >
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
                <IoMapOutline className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                Live Fleet Map
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
                  vehicles={vehicles}
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
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Fleet Status</h3>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
              {/* Header with provider support */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wide">Live Alerts</h3>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {alerts.length}
                </span>
              </div>
              {/* Provider support row */}
              <div className="flex items-center gap-1 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[9px] text-gray-500 dark:text-gray-400">Supported by:</span>
                {LIVE_ALERT_PROVIDERS.map(provider => (
                  <span key={provider} className="px-1.5 py-0.5 text-[8px] font-medium rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
                    {provider}
                  </span>
                ))}
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {alerts.slice(0, 8).map((alert, index) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors ${index === 0 ? 'animate-pulse' : ''}`}
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
                        {/* Info badges row */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-600 dark:text-white font-medium">{formatRelativeTime(alert.timestamp)}</span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          {/* Driver badge */}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-300 dark:border-white/30 text-[9px] font-medium text-gray-700 dark:text-white">
                            <IoPersonOutline className="w-3 h-3" />
                            {alert.vehicle === 'Tesla Model 3' ? 'Marcus J.' : 'Sarah K.'}
                          </span>
                          {/* Speed badge for speed alerts */}
                          {alert.type === 'speed' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-400/50 text-[9px] font-bold text-red-600 dark:text-red-400">
                              <IoFlashOutline className="w-3 h-3" />
                              {Math.floor(78 + Math.random() * 20)}mph
                            </span>
                          )}
                          {/* Temp badge for temp alerts */}
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
                          {/* Zone badge for geofence alerts */}
                          {alert.type === 'geofence' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-yellow-300 dark:border-yellow-400/50 text-[9px] font-medium text-yellow-600 dark:text-yellow-400">
                              <IoMapOutline className="w-3 h-3" />
                              {alert.message.includes('Sky Harbor') ? 'Airport Zone' : alert.message.includes('exited') ? 'Outside Zone' : 'Metro Boundary'}
                            </span>
                          )}
                          {/* Kill switch badge */}
                          {alert.type === 'killswitch' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-400 dark:border-red-400 text-[9px] font-bold text-red-700 dark:text-red-400">
                              <IoLockClosedOutline className="w-3 h-3" />
                              DISABLED
                            </span>
                          )}
                          {/* Tap for details hint */}
                          <IoChevronForwardOutline className="w-3 h-3 text-gray-400 dark:text-gray-500 ml-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <IoDownloadOutline className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">Export Trip Report</span>
                </button>
                <button className="w-full flex items-center gap-3 p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <IoStatsChartOutline className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">Mileage Forensics™</span>
                </button>
                <button className="w-full flex items-center gap-3 p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <IoNotificationsOutline className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">Alert Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle List with Remote Controls */}
        <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Vehicle Status & Remote Control</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">Tap a vehicle to access remote commands</span>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {vehicles.map(vehicle => (
              <div key={vehicle.id}>
                {/* Vehicle Row */}
                <div
                  className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    selectedVehicle === vehicle.id ? 'bg-orange-50 dark:bg-orange-500/10' : ''
                  } ${vehicle.isDisabled ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                  onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        vehicle.isDisabled
                          ? 'bg-red-100 dark:bg-red-500/20'
                          : vehicle.status === 'moving'
                          ? 'bg-blue-100 dark:bg-blue-500/20'
                          : 'bg-green-100 dark:bg-green-500/20'
                      }`}>
                        <IoCarSportOutline className={`w-5 h-5 sm:w-7 sm:h-7 ${
                          vehicle.isDisabled
                            ? 'text-red-600 dark:text-red-400'
                            : vehicle.status === 'moving'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                          {vehicle.isDisabled && (
                            <span className="ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-red-100 dark:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg">DISABLED</span>
                          )}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                          <IoLocationOutline className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{vehicle.location}</span>
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1">
                          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{vehicle.licensePlate}</span>
                          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">via {vehicle.provider}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-2">
                        {vehicle.isLocked ? (
                          <IoLockClosedOutline className="w-4 h-4 text-green-500 dark:text-green-400" title="Locked" />
                        ) : (
                          <IoLockOpenOutline className="w-4 h-4 text-red-500 dark:text-red-400" title="Unlocked" />
                        )}
                        {vehicle.engineRunning && (
                          <IoPowerOutline className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-pulse" title="Engine Running" />
                        )}
                        {vehicle.acOn && (
                          <IoSnowOutline className="w-4 h-4 text-cyan-500 dark:text-cyan-400" title="AC On" />
                        )}
                        {vehicle.isDisabled && (
                          <IoFlashOffOutline className="w-4 h-4 text-red-500 dark:text-red-400" title="Kill Switch Active" />
                        )}
                      </div>
                      <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-lg ${getStatusColor(vehicle.status)}`}>
                        {vehicle.isDisabled
                          ? 'Disabled'
                          : vehicle.status === 'moving' && vehicle.speed
                          ? `${vehicle.speed} mph`
                          : vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                      {vehicle.guest && (
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.guest.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.tripEndsAt}</p>
                        </div>
                      )}
                      <IoChevronForwardOutline className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 transition-transform ${
                        selectedVehicle === vehicle.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Control Panel */}
                {selectedVehicle === vehicle.id && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Vehicle Stats */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                          <IoSpeedometerOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{vehicle.odometer.toLocaleString()}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Odometer</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                          {vehicle.isElectric ? (
                            <IoBatteryFullOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                          ) : (
                            <IoFlashOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                          )}
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{vehicle.isElectric ? vehicle.batteryLevel : vehicle.fuelLevel}%</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{vehicle.isElectric ? 'Battery' : 'Fuel'}</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                          <IoThermometerOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                          <p className={`text-xs sm:text-sm font-medium ${vehicle.interiorTemp > 100 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {vehicle.interiorTemp}°F
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Interior</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm hidden sm:block">
                          <IoSunnyOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{vehicle.exteriorTemp}°F</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Outside</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm hidden sm:block">
                          <IoTimeOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{formatRelativeTime(vehicle.lastUpdate)}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Last Update</p>
                        </div>
                      </div>

                      {/* Remote Control Buttons */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 sm:mb-3">
                          Remote Commands
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
                          {/* Lock/Unlock */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLock(vehicle.id) }}
                            disabled={isLocking === vehicle.id || vehicle.isDisabled}
                            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg transition-all ${
                              vehicle.isDisabled
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : vehicle.isLocked
                                ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 border border-green-300 dark:border-green-500/30'
                                : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 border border-red-300 dark:border-red-500/30'
                            } ${isLocking === vehicle.id ? 'opacity-50' : ''}`}
                          >
                            {isLocking === vehicle.id ? (
                              <IoRefreshOutline className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            ) : vehicle.isLocked ? (
                              <IoLockClosedOutline className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <IoLockOpenOutline className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                            <span className="text-[10px] sm:text-xs font-medium">
                              {isLocking === vehicle.id ? '...' : vehicle.isLocked ? 'Unlock' : 'Lock'}
                            </span>
                          </button>

                          {/* Engine Start/Stop */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleEngine(vehicle.id) }}
                            disabled={isStartingEngine === vehicle.id || vehicle.isDisabled}
                            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg transition-all border ${
                              vehicle.isDisabled
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                                : vehicle.engineRunning
                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 border-blue-300 dark:border-blue-500/30'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                            } ${isStartingEngine === vehicle.id ? 'opacity-50' : ''}`}
                          >
                            {isStartingEngine === vehicle.id ? (
                              <IoRefreshOutline className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            ) : (
                              <IoPowerOutline className={`w-5 h-5 sm:w-6 sm:h-6 ${vehicle.engineRunning ? 'animate-pulse' : ''}`} />
                            )}
                            <span className="text-[10px] sm:text-xs font-medium">
                              {isStartingEngine === vehicle.id ? '...' : vehicle.engineRunning ? 'Stop' : 'Start'}
                            </span>
                          </button>

                          {/* Pre-Cool (MaxAC) */}
                          <button
                            onClick={(e) => { e.stopPropagation(); startPreCool(vehicle.id) }}
                            disabled={isPreCooling === vehicle.id || vehicle.acOn || vehicle.isDisabled}
                            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg transition-all border ${
                              vehicle.isDisabled
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                                : vehicle.acOn
                                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30'
                                : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-500/30 border-orange-300 dark:border-orange-500/30'
                            } ${isPreCooling === vehicle.id ? 'opacity-50' : ''}`}
                          >
                            {isPreCooling === vehicle.id ? (
                              <IoRefreshOutline className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            ) : (
                              <IoSnowOutline className={`w-5 h-5 sm:w-6 sm:h-6 ${vehicle.acOn ? 'animate-pulse' : ''}`} />
                            )}
                            <span className="text-[10px] sm:text-xs font-medium">
                              {isPreCooling === vehicle.id ? '...' : vehicle.acOn ? 'AC On' : 'Cool'}
                            </span>
                          </button>

                          {/* Honk */}
                          <button
                            onClick={(e) => { e.stopPropagation(); honkHorn(vehicle.id) }}
                            disabled={isHonking === vehicle.id || vehicle.isDisabled}
                            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg transition-all border ${
                              vehicle.isDisabled
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                                : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-500/30 border-yellow-300 dark:border-yellow-500/30'
                            } ${isHonking === vehicle.id ? 'opacity-50' : ''}`}
                          >
                            {isHonking === vehicle.id ? (
                              <IoRefreshOutline className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            ) : (
                              <IoVolumeHighOutline className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                            <span className="text-[10px] sm:text-xs font-medium">
                              {isHonking === vehicle.id ? '...' : 'Honk'}
                            </span>
                          </button>

                          {/* Locate */}
                          <button
                            onClick={(e) => { e.stopPropagation(); locateVehicle(vehicle.id) }}
                            disabled={isLocating === vehicle.id}
                            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all border border-purple-300 dark:border-purple-500/30 ${isLocating === vehicle.id ? 'opacity-50' : ''}`}
                          >
                            {isLocating === vehicle.id ? (
                              <IoRefreshOutline className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            ) : (
                              <IoLocateOutline className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                            <span className="text-[10px] sm:text-xs font-medium">
                              {isLocating === vehicle.id ? '...' : 'Locate'}
                            </span>
                          </button>

                          {/* Track Live */}
                          <button
                            onClick={(e) => { e.stopPropagation(); locateVehicle(vehicle.id) }}
                            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-300 dark:border-gray-600"
                          >
                            <IoPulseOutline className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-[10px] sm:text-xs font-medium">Track</span>
                          </button>

                          {/* Kill Switch */}
                          <button
                            onClick={(e) => { e.stopPropagation(); activateKillSwitch(vehicle.id) }}
                            disabled={isKilling === vehicle.id || vehicle.isDisabled}
                            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg transition-all border ${
                              vehicle.isDisabled
                                ? 'bg-red-200 dark:bg-red-900/30 text-red-400 dark:text-red-300 border-red-400 dark:border-red-500/50'
                                : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 border-red-300 dark:border-red-500/30'
                            } ${isKilling === vehicle.id ? 'opacity-50' : ''}`}
                          >
                            {isKilling === vehicle.id ? (
                              <IoRefreshOutline className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            ) : (
                              <IoFlashOffOutline className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                            <span className="text-[10px] sm:text-xs font-medium">
                              {isKilling === vehicle.id ? '...' : vehicle.isDisabled ? 'Off' : 'Kill'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
                          <IoMapOutline className="w-4 h-4" />
                          View Trip History
                        </button>
                        {vehicle.guest && (
                          <button className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <IoChatbubbleOutline className="w-4 h-4" />
                            Message Guest
                          </button>
                        )}
                        <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <IoDownloadOutline className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo CTA */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 rounded-lg border border-orange-300 dark:border-orange-500/30 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Ready to track your fleet?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connect a tracking provider to start monitoring your vehicles in real-time.</p>
            </div>
            <Link
              href="/partner/tracking"
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Connect a Provider
              <IoChevronForwardOutline className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal/Bottomsheet */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSelectedAlert(null)
              setAlertMessage('')
              setMessageSent(false)
            }}
          />

          {/* Modal Content - Bottomsheet on mobile, centered modal on desktop */}
          <div className="relative w-full sm:w-[500px] sm:max-w-lg max-h-[80vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col">
            {/* Drag handle for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-lg ${
                  selectedAlert.type === 'speed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  selectedAlert.type === 'geofence' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  selectedAlert.type === 'temp' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                  selectedAlert.type === 'killswitch' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {selectedAlert.type === 'speed' && <IoSpeedometerOutline className="w-5 h-5" />}
                  {selectedAlert.type === 'geofence' && <IoLocationOutline className="w-5 h-5" />}
                  {selectedAlert.type === 'temp' && <IoThermometerOutline className="w-5 h-5" />}
                  {selectedAlert.type === 'killswitch' && <IoFlashOffOutline className="w-5 h-5" />}
                  {!['speed', 'geofence', 'temp', 'killswitch'].includes(selectedAlert.type) && <IoAlertCircleOutline className="w-5 h-5" />}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedAlert.type === 'speed' ? 'Speed Alert' :
                     selectedAlert.type === 'geofence' ? 'Geofence Alert' :
                     selectedAlert.type === 'temp' ? 'Temperature Alert' :
                     selectedAlert.type === 'killswitch' ? 'Kill Switch Alert' : 'Alert'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(selectedAlert.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAlert(null)
                  setAlertMessage('')
                  setMessageSent(false)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* Alert Message */}
              <div className={`p-3 rounded-lg border ${
                selectedAlert.type === 'speed' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50' :
                selectedAlert.type === 'geofence' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/50' :
                selectedAlert.type === 'temp' ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50' :
                'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
              }`}>
                <p className={`font-semibold text-sm ${
                  selectedAlert.type === 'speed' ? 'text-red-700 dark:text-red-300' :
                  selectedAlert.type === 'geofence' ? 'text-yellow-700 dark:text-yellow-300' :
                  selectedAlert.type === 'temp' ? 'text-orange-700 dark:text-orange-300' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {selectedAlert.message}
                </p>
              </div>

              {/* Provider Support */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">This alert type supported by</p>
                <div className="flex flex-wrap gap-1.5">
                  {(ALERT_PROVIDER_SUPPORT[selectedAlert.type]?.providers || ALERT_PROVIDER_SUPPORT.info.providers).map(provider => (
                    <span key={provider} className="px-2 py-1 text-xs font-medium rounded border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {provider}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {ALERT_PROVIDER_SUPPORT[selectedAlert.type]?.description || ALERT_PROVIDER_SUPPORT.info.description}
                </p>
              </div>

              {/* Renter Information */}
              {(() => {
                const renter = DEMO_RENTERS[selectedAlert.vehicle as keyof typeof DEMO_RENTERS]
                if (!renter) return null
                return (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Renter Information</p>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                          {renter.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{renter.name}</p>
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <IoShieldCheckmarkOutline className="w-3 h-3" />
                            License Verified
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <a href={`tel:${renter.phone}`} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <IoCallOutline className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700 dark:text-gray-300 text-xs truncate">{renter.phone}</span>
                        </a>
                        <a href={`mailto:${renter.email}`} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <IoMailOutline className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300 text-xs truncate">{renter.email}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Vehicle Snapshot */}
              {(() => {
                const vehicle = vehicles.find(v => v.make + ' ' + v.model === selectedAlert.vehicle)
                if (!vehicle) return null
                return (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Vehicle Snapshot</p>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedAlert.vehicle}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.licensePlate} • via {vehicle.provider}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status === 'moving' ? `${vehicle.speed} mph` : vehicle.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <IoSpeedometerOutline className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{vehicle.speed || 0}</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">mph</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <IoThermometerOutline className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{vehicle.interiorTemp}°</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">interior</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <IoBatteryFullOutline className="w-4 h-4 text-green-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{vehicle.fuelLevel}%</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">fuel</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {vehicle.isLocked ? (
                            <IoLockClosedOutline className="w-4 h-4 text-green-400 mx-auto mb-1" />
                          ) : (
                            <IoLockOpenOutline className="w-4 h-4 text-red-400 mx-auto mb-1" />
                          )}
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{vehicle.isLocked ? 'Yes' : 'No'}</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">locked</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <IoLocationOutline className="w-4 h-4" />
                        <span>{vehicle.location}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Trip Details */}
              {(() => {
                const renter = DEMO_RENTERS[selectedAlert.vehicle as keyof typeof DEMO_RENTERS]
                if (!renter) return null
                return (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Trip Details</p>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Booking ID</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{renter.bookingId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Trip Dates</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{renter.tripStart.slice(5)} → {renter.tripEnd.slice(5)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Days Left</p>
                          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">{renter.daysRemaining} days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Send Message */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Send Message to Driver</p>
                </div>
                <div className="p-3">
                  {messageSent ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                      <p className="text-sm text-green-700 dark:text-green-300">Message sent successfully!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={alertMessage}
                        onChange={(e) => setAlertMessage(e.target.value)}
                        placeholder="Type a message to the driver..."
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={2}
                      />
                      <button
                        onClick={() => {
                          if (alertMessage.trim()) {
                            setMessageSent(true)
                            setTimeout(() => setMessageSent(false), 3000)
                          }
                        }}
                        disabled={!alertMessage.trim()}
                        className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <IoChatbubbleOutline className="w-4 h-4" />
                        Send Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    // Simulate snapshot
                    alert('Snapshot saved to trip records')
                  }}
                  className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <IoDownloadOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">Snapshot</span>
                </button>
                <button
                  className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <IoMapOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">View Map</span>
                </button>
                <a
                  href={`tel:${DEMO_RENTERS[selectedAlert.vehicle as keyof typeof DEMO_RENTERS]?.phone || ''}`}
                  className="flex flex-col items-center gap-1 p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <IoCallOutline className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-medium text-white">Call Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
