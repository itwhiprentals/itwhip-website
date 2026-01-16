// app/partner/tracking/page.tsx
// Vehicle Tracking - Provider selection and dashboard
// Demo mode is a separate page at /partner/tracking/demo

'use client'

import { useState, useEffect } from 'react'
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
  IoStar
} from 'react-icons/io5'

// Import provider data from shared module
import {
  MILEAGE_FORENSICS,
  getSecondaryProviders
} from './shared/providers'

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
            {/* Recommended Setup Card - Provider Card Style */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-5 transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <IoStar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recommended Setup</h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded border border-white/50 whitespace-nowrap">
                      <IoTrendingUpOutline className="w-3 h-3" />
                      44% less than FleetBold
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">~$15/mo per vehicle</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get complete fleet protection with Bouncie + Smartcar combination. All 8 features covered plus Mileage Forensics™.
              </p>

              {/* Features Grid */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-gray-900 dark:text-white">Bouncie ($8/mo):</strong> GPS, Speed Alerts, Geofencing, OBD Diagnostics</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-gray-900 dark:text-white">Smartcar ($1.99/mo):</strong> Lock/Unlock, Remote Start, Climate Control</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-gray-900 dark:text-white">ItWhip+ <span className="text-green-600 dark:text-green-400">(Free)</span>:</strong> Mileage Forensics™, Unified Dashboard</span>
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
                  Get Started
                  <IoChevronForwardOutline className="w-4 h-4" />
                </a>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <IoLinkOutline className="w-4 h-4" />
                  Connect
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
                      EXCLUSIVE
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ItWhip+ Feature</p>
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

            {/* Other Provider Options */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                Other Provider Options
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                Alternative tracking solutions if you prefer a single provider
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
                              No ItWhip+ integration
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
                      Learn More
                    </a>
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

            {/* Interactive Demo Card - Provider Card Style */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-200 dark:border-orange-800 p-5 transition-all hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <IoPlayOutline className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Demo</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">No signup required</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                  Try Free
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                See what hosts experience with a fully connected fleet. Live map, remote commands, and real-time alerts.
              </p>

              {/* Features List */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span>Live GPS • Lock/Unlock • Remote Start • Pre-Cool</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span>Geofencing • Speed Alerts • Horn/Lights • Mileage Forensics™</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span>Interactive Mapbox map with Phoenix demo fleet</span>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/partner/tracking/demo"
                className="block w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
              >
                Launch Demo
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
