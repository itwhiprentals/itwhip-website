// app/partner/tracking/page.tsx
// Vehicle Tracking - Provider selection and dashboard
// Demo mode is a separate page at /partner/tracking/demo

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  IoAddOutline,
  IoNavigateOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoDownloadOutline,
  IoMapOutline,
  IoStatsChartOutline,
  IoLinkOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoPlayOutline,
  IoBatteryFullOutline,
  IoLockClosedOutline,
  IoPowerOutline,
  IoSnowOutline,
  IoEllipseOutline,
  IoFlashOffOutline,
  IoVolumeHighOutline
} from 'react-icons/io5'

// Provider data with real logo URLs
const TRACKING_PROVIDERS = [
  {
    id: 'bouncie',
    name: 'Bouncie',
    logoUrl: 'https://www.bouncie.com/cdn/shop/files/bouncie-logo-blue.png',
    description: 'OBD-II GPS Tracker',
    price: '$8/month per device',
    features: ['Real-time GPS', 'Trip history', 'Geofencing', 'Speed alerts', 'Vehicle health'],
    limitations: ['Easy to unplug'],
    connectType: 'device',
    websiteUrl: 'https://bouncie.com',
    color: 'blue'
  },
  {
    id: 'smartcar',
    name: 'Smartcar',
    logoUrl: 'https://assets-global.website-files.com/5e83a55a4f1bd40be93ac74f/5e83a55a4f1bd434b23ac7e2_smartcar-logo.svg',
    description: 'Connected Car API',
    price: 'Free tier available',
    features: ['No hardware needed', '40+ car brands', 'Lock/unlock', 'Remote start', 'Pre-cool via API'],
    limitations: ['Vehicle must support'],
    connectType: 'oauth',
    websiteUrl: 'https://smartcar.com',
    color: 'purple'
  },
  {
    id: 'zubie',
    name: 'Zubie',
    logoUrl: 'https://zubie.com/wp-content/uploads/2023/01/zubie-logo-white-1.png',
    description: 'Fleet Management',
    price: 'Fleet pricing',
    features: ['Real-time GPS', 'Driver scoring', 'Maintenance alerts', 'Fuel tracking'],
    limitations: ['OBD-II required'],
    connectType: 'device',
    websiteUrl: 'https://zubie.com',
    color: 'green'
  },
  {
    id: 'moovetrax',
    name: 'MooveTrax',
    logoUrl: null,
    description: 'Remote Vehicle Control',
    price: 'Contact for pricing',
    features: ['Kill switch', 'Remote start', 'Keyless entry', 'Real-time GPS', 'Hardwired install'],
    limitations: ['Professional install'],
    connectType: 'device',
    websiteUrl: 'https://moovetrax.com',
    color: 'cyan'
  },
  {
    id: 'trackimo',
    name: 'Trackimo',
    logoUrl: 'https://trackimo.com/wp-content/uploads/2020/01/trackimo-logo.png',
    description: 'Portable GPS Tracker',
    price: '$10/month',
    features: ['Portable device', 'Long battery', 'Geofencing', 'SOS button', 'Worldwide'],
    limitations: ['Battery dependent'],
    connectType: 'device',
    websiteUrl: 'https://trackimo.com',
    color: 'red'
  }
]

// Features showcase for demo section
const DEMO_FEATURES = [
  { icon: IoLocationOutline, label: 'Live GPS', color: 'text-blue-400' },
  { icon: IoLockClosedOutline, label: 'Lock/Unlock', color: 'text-green-400' },
  { icon: IoPowerOutline, label: 'Remote Start', color: 'text-purple-400' },
  { icon: IoSnowOutline, label: 'Pre-Cool', color: 'text-cyan-400' },
  { icon: IoEllipseOutline, label: 'Geofencing', color: 'text-yellow-400' },
  { icon: IoFlashOffOutline, label: 'Kill Switch', color: 'text-red-400' }
]

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
  status: 'moving' | 'parked' | 'offline'
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
}

export default function TrackingPage() {
  const [loading, setLoading] = useState(true)
  const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([])
  const [trackedVehicles, setTrackedVehicles] = useState<TrackedVehicle[]>([])
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  const hasTracking = connectedProviders.length > 0

  useEffect(() => {
    // Load real tracking data from API
    const loadTrackingData = async () => {
      try {
        // TODO: Replace with real API call
        setTotalVehicles(3)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load tracking data:', error)
        setLoading(false)
      }
    }
    loadTrackingData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'parked': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'offline': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getProviderBgColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
      green: 'bg-gradient-to-br from-green-500 to-green-600',
      cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      red: 'bg-gradient-to-br from-red-500 to-red-600'
    }
    return colors[color] || colors.blue
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <IoLocationOutline className="w-7 h-7 text-orange-600" />
              Vehicle Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your fleet in real-time, prevent theft, and resolve disputes faster
            </p>
          </div>
          {hasTracking && (
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <IoAddOutline className="w-5 h-5" />
                Add Provider
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <IoSettingsOutline className="w-5 h-5" />
                Settings
              </button>
            </div>
          )}
        </div>

        {!hasTracking ? (
          // No Provider Connected - Onboarding View
          <div className="space-y-8">
            {/* Value Proposition */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-8 border border-orange-100 dark:border-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Why Track Your Vehicles?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  GPS tracking powers ItWhip&apos;s Mileage Forensics™ and MaxAC™ systems
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 text-center shadow-sm">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IoShieldCheckmarkOutline className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Theft Protection</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Instant alerts if your car leaves a geofence or gets tampered with
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 text-center shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IoSpeedometerOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mileage Forensics™</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Auto-detect usage gaps for insurance compliance and tax reporting
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 text-center shadow-sm">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IoDownloadOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dispute Evidence</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    One-click export of trip logs, speed data, and route history
                  </p>
                </div>
              </div>
            </div>

            {/* Fleet Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <IoCarSportOutline className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">0</span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{totalVehicles}</span> vehicles tracked
                </span>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Choose Your Tracking Provider
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRACKING_PROVIDERS.map(provider => (
                  <div
                    key={provider.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    {/* Provider Header with Logo */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {provider.logoUrl ? (
                          <div className={`w-12 h-12 ${getProviderBgColor(provider.color)} rounded-lg flex items-center justify-center p-2`}>
                            <img
                              src={provider.logoUrl}
                              alt={provider.name}
                              className="w-full h-full object-contain filter brightness-0 invert"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                                ;(e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-white font-bold text-lg">${provider.name.charAt(0)}</span>`
                              }}
                            />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 ${getProviderBgColor(provider.color)} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                            {provider.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {provider.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{provider.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
                      {provider.price}
                    </p>

                    {/* Features */}
                    <div className="space-y-1.5 mb-4">
                      {provider.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {provider.limitations.slice(0, 1).map((limitation, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                          <IoCloseOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {provider.connectType === 'oauth' ? (
                      <button className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Connect Account
                      </button>
                    ) : provider.websiteUrl ? (
                      <a
                        href={provider.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors text-center"
                      >
                        Visit {provider.name}
                      </a>
                    ) : (
                      <button className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                        Learn More
                      </button>
                    )}

                    {/* Provider website link */}
                    {provider.websiteUrl && (
                      <p className="mt-2 text-center">
                        <a
                          href={provider.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {provider.websiteUrl.replace('https://', '')}
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Already Have a Device */}
            <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Already have a tracking device or account?
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium rounded-lg transition-colors">
                <IoLinkOutline className="w-5 h-5" />
                Connect Existing Account
              </button>
            </div>

            {/* Demo Section - Separate from providers */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                  or try our interactive demo
                </span>
              </div>
            </div>

            {/* Interactive Demo Card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg p-8 text-white overflow-hidden relative">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative flex flex-col lg:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="ItWhip"
                      width={48}
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    Try the ItWhip Tracking Demo
                  </h3>
                  <p className="text-white/80 mb-4 max-w-2xl">
                    See what hosts experience with a fully connected fleet. Interactive Mapbox map with live vehicle animations,
                    remote commands, real-time alerts, and all the features your tracking provider offers - unified in one dashboard.
                  </p>

                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {DEMO_FEATURES.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-sm"
                      >
                        <feature.icon className={`w-4 h-4 ${feature.color}`} />
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/partner/tracking/demo"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors shadow-lg"
                  >
                    <IoPlayOutline className="w-5 h-5" />
                    Launch Interactive Demo
                  </Link>

                  <p className="mt-4 text-sm text-white/60">
                    No signup required • Live map with Phoenix demo fleet
                  </p>
                </div>
              </div>
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
                    {provider.vehicleCount} vehicles
                  </span>
                </div>
              ))}
              <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors flex-shrink-0">
                <IoAddOutline className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <IoMapOutline className="w-5 h-5 text-gray-400" />
                    Live Fleet Map
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Last update: {formatRelativeTime(new Date().toISOString())}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <IoRefreshOutline className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500 text-sm">Connect a provider to see your fleet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Fleet Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {trackedVehicles.length}/{totalVehicles}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tracked</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {trackedVehicles.filter(v => v.status === 'moving').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Moving</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {trackedVehicles.filter(v => v.status === 'parked').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Parked</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {trackedVehicles.filter(v => v.status === 'offline').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Offline</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <IoDownloadOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">Export Trip Report</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <IoStatsChartOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">Mileage Forensics™</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <IoSettingsOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">Geofence Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">Vehicle Status</h2>
                <button className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1">
                  Export All
                  <IoDownloadOutline className="w-4 h-4" />
                </button>
              </div>

              {trackedVehicles.length === 0 ? (
                <div className="p-8 text-center">
                  <IoCarSportOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No vehicles connected</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Connect a tracking provider to see your vehicles here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {trackedVehicles.map(vehicle => (
                    <div
                      key={vehicle.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                        selectedVehicle === vehicle.id ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                      }`}
                      onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            vehicle.status === 'moving'
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : vehicle.status === 'parked'
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <IoCarSportOutline className={`w-6 h-6 ${
                              vehicle.status === 'moving'
                                ? 'text-blue-600 dark:text-blue-400'
                                : vehicle.status === 'parked'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <IoLocationOutline className="w-3 h-3" />
                              {vehicle.location || 'Location unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status === 'moving' && vehicle.speed ? `${vehicle.speed} mph` : vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                          </span>
                          {vehicle.guest && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.guest.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {vehicle.tripEndsAt}
                              </p>
                            </div>
                          )}
                          <IoChevronForwardOutline className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedVehicle === vehicle.id ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedVehicle === vehicle.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <IoSpeedometerOutline className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {vehicle.odometer?.toLocaleString() || '—'} mi
                              </p>
                              <p className="text-xs text-gray-500">Odometer</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <IoBatteryFullOutline className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {vehicle.fuelLevel || '—'}%
                              </p>
                              <p className="text-xs text-gray-500">Fuel/Battery</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <IoNavigateOutline className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {vehicle.heading || '—'}
                              </p>
                              <p className="text-xs text-gray-500">Heading</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <IoTimeOutline className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatRelativeTime(vehicle.lastUpdate)}
                              </p>
                              <p className="text-xs text-gray-500">Last Update</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
                              <IoMapOutline className="w-4 h-4" />
                              Track Live
                            </button>
                            {vehicle.guest && (
                              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <IoChatbubbleOutline className="w-4 h-4" />
                                Message Guest
                              </button>
                            )}
                            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <IoDownloadOutline className="w-4 h-4" />
                              Trip Log
                            </button>
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
