// app/components/hotel-solutions/PlatformPreview.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoBedOutline,
  IoCarSportOutline,
  IoAirplaneOutline,
  IoLeafOutline,
  IoAnalyticsOutline,
  IoCloudOutline,
  IoShieldCheckmarkOutline,
  IoServerOutline,
  IoGlobeOutline,
  IoTerminalOutline,
  IoNotificationsOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoFlashOutline,
  IoSpeedometerOutline,
  IoLayersOutline,
  IoKeyOutline,
  IoSyncOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoPulseOutline,
  IoWifiOutline,
  IoLockClosedOutline,
  IoCodeSlashOutline,
  IoRocketOutline,
  IoStatsChartOutline,
  IoPersonCircleOutline,
  IoConstructOutline,
  IoCashOutline,
  IoBarChartOutline,
  IoEllipsisHorizontalOutline,
  IoExpandOutline,
  IoRadioButtonOnOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface Flight {
  flight: string
  eta: string
  passengers: number
  hotelGuests: number
  status: string
  instantReady: boolean
  gate?: string
  airline?: string
  origin?: string
}

interface CrisisMetrics {
  hotelRevenue: number
  instantRidesActive: number
  driversAvailable: number
}

interface PlatformPreviewProps {
  crisisMetrics: CrisisMetrics
  flights: Flight[]
}

// Enterprise-grade data structures
interface SystemMetric {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  status?: 'success' | 'warning' | 'critical'
}

interface RealtimeEvent {
  id: string
  timestamp: string
  type: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
  icon: React.ReactNode
}

export default function PlatformPreview({ crisisMetrics, flights }: PlatformPreviewProps) {
  const [activePreview, setActivePreview] = useState('command-center')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [liveMetrics, setLiveMetrics] = useState({
    apiCalls: 47823,
    responseTime: 127,
    uptime: 99.99,
    activeConnections: 1247,
    dataProcessed: 3.7,
    errorRate: 0.02
  })
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([])
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Simulate real-time updates - only on client
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 10),
        responseTime: Math.round(Math.max(100, Math.min(150, prev.responseTime + (Math.random() * 10 - 5)))),
        uptime: 99.99,
        activeConnections: Math.max(1200, Math.min(1300, prev.activeConnections + Math.floor(Math.random() * 10 - 5))),
        dataProcessed: parseFloat((prev.dataProcessed + Math.random() * 0.1).toFixed(1)),
        errorRate: parseFloat((Math.random() * 0.05).toFixed(2))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isClient])

  // Generate realistic events - only on client
  useEffect(() => {
    if (!isClient) return

    const generateEvent = (): RealtimeEvent => {
      const events = [
        { type: 'api.request', message: 'PMS sync completed - Opera Cloud', severity: 'success' as const, icon: <IoSyncOutline className="w-4 h-4" /> },
        { type: 'driver.dispatch', message: 'Instant dispatch triggered - Terminal 4', severity: 'info' as const, icon: <IoCarSportOutline className="w-4 h-4" /> },
        { type: 'booking.integrated', message: 'Reservation 4827391 linked', severity: 'success' as const, icon: <IoBedOutline className="w-4 h-4" /> },
        { type: 'compliance.update', message: 'CDP report generated', severity: 'info' as const, icon: <IoLeafOutline className="w-4 h-4" /> },
        { type: 'security.scan', message: 'Security audit passed - SOC 2', severity: 'success' as const, icon: <IoShieldCheckmarkOutline className="w-4 h-4" /> }
      ]
      
      const event = events[Math.floor(Math.random() * events.length)]
      return {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...event
      }
    }

    // Initialize with some events
    setRealtimeEvents([
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'api.request',
        message: 'PMS sync completed - Opera Cloud',
        severity: 'success',
        icon: <IoSyncOutline className="w-4 h-4" />
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        type: 'driver.dispatch',
        message: 'Instant dispatch triggered - Terminal 4',
        severity: 'info',
        icon: <IoCarSportOutline className="w-4 h-4" />
      }
    ])

    const interval = setInterval(() => {
      setRealtimeEvents(prev => [generateEvent(), ...prev.slice(0, 4)])
    }, 5000)

    return () => clearInterval(interval)
  }, [isClient])

  // Animated counter effect - only on client
  useEffect(() => {
    if (!isClient) return

    const timer = setInterval(() => {
      setAnimatedValue(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(timer)
  }, [isClient])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enterprise Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-400 px-6 py-3 rounded-full mb-6 border border-blue-300 dark:border-blue-800">
            <IoLayersOutline className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-wider">Enterprise Platform</span>
            {isClient && (
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full text-green-600 text-xs font-medium animate-pulse">
                LIVE
              </span>
            )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Unified Hospitality <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Intelligence Platform</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Real-time orchestration of transportation, bookings, and compliance through a single pane of glass
          </p>
        </div>

        {/* System Status Bar */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 mb-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {isClient && (
                  <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 animate-pulse"></div>
                )}
                <IoCheckmarkCircle className="relative w-8 h-8" />
              </div>
              <div>
                <p className="font-bold">All Systems Operational</p>
                <p className="text-sm opacity-90">Last incident: 147 days ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{liveMetrics.uptime}%</p>
                <p className="text-xs opacity-90">Uptime SLA</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(liveMetrics.responseTime)}ms</p>
                <p className="text-xs opacity-90">P99 Latency</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(liveMetrics.apiCalls)}</p>
                <p className="text-xs opacity-90">API Calls/Hour</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{liveMetrics.dataProcessed}TB</p>
                <p className="text-xs opacity-90">Data Processed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Preview Tabs - Enhanced */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'command-center', label: 'Command Center', icon: <IoRocketOutline className="w-4 h-4" /> },
            { id: 'orchestration', label: 'Orchestration Engine', icon: <IoLayersOutline className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics Suite', icon: <IoAnalyticsOutline className="w-4 h-4" /> },
            { id: 'integrations', label: 'Integration Hub', icon: <IoServerOutline className="w-4 h-4" /> },
            { id: 'compliance', label: 'Compliance Portal', icon: <IoShieldCheckmarkOutline className="w-4 h-4" /> },
            { id: 'developer', label: 'Developer Console', icon: <IoCodeSlashOutline className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePreview(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                activePreview === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Platform Preview Window - Enterprise Grade */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          
          {/* Command Center */}
          {activePreview === 'command-center' && (
            <div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoRocketOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Unified Command Center</h3>
                      <p className="text-xs opacity-75">Real-time operational intelligence</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <IoWifiOutline className={`w-4 h-4 text-green-400 ${isClient ? 'animate-pulse' : ''}`} />
                      <span className="text-xs">Connected to 3 data centers</span>
                    </div>
                    <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                      <IoExpandOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* KPI Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoTrendingUpOutline className="w-5 h-5 text-blue-600" />
                      <span className="text-xs text-green-600 font-semibold">+23%</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">${(crisisMetrics.hotelRevenue / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Monthly Revenue</div>
                    <div className="mt-2 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: '73%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoCarSportOutline className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-green-600 font-semibold">LIVE</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{crisisMetrics.instantRidesActive}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Active Rides</div>
                    <div className="mt-2 flex space-x-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`flex-1 h-4 ${i <= 4 ? 'bg-green-500' : 'bg-slate-300'} rounded-sm transition-all`}></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoPulseOutline className="w-5 h-5 text-purple-600" />
                      <IoRadioButtonOnOutline className={`w-3 h-3 text-green-500 ${isClient ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{crisisMetrics.driversAvailable}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Drivers Online</div>
                    <div className="mt-2 grid grid-cols-10 gap-0.5">
                      {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 16 ? 'bg-purple-500' : 'bg-slate-300'} transition-all`}></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoFlashOutline className="w-5 h-5 text-amber-600" />
                      <span className="text-xs text-amber-600 font-semibold">0ms</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">Instant</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Avg Wait Time</div>
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">100% SLA Met</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Real-time Events */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                        <IoNotificationsOutline className="w-5 h-5 mr-2" />
                        System Events
                      </h4>
                      <span className="text-xs text-slate-500">Real-time</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {realtimeEvents.map((event) => (
                        <div key={event.id} className="flex items-start space-x-2 p-2 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors">
                          <div className={`mt-0.5 ${
                            event.severity === 'success' ? 'text-green-500' :
                            event.severity === 'warning' ? 'text-amber-500' :
                            event.severity === 'error' ? 'text-red-500' : 'text-blue-500'
                          }`}>
                            {event.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 dark:text-white truncate">{event.message}</p>
                            <p className="text-xs text-slate-500">{isClient ? new Date(event.timestamp).toLocaleTimeString() : '12:00:00 PM'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Performance */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                        <IoSpeedometerOutline className="w-5 h-5 mr-2" />
                        Performance Metrics
                      </h4>
                      <span className="text-xs text-green-500">Optimal</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">API Response</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" style={{ width: `${100 - (liveMetrics.responseTime - 100) / 0.5}%` }}></div>
                          </div>
                          <span className="text-sm font-mono text-slate-900 dark:text-white">{Math.round(liveMetrics.responseTime)}ms</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Error Rate</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(5, 100 - liveMetrics.errorRate * 2000)}%` }}></div>
                          </div>
                          <span className="text-sm font-mono text-slate-900 dark:text-white">{liveMetrics.errorRate.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Connections</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${(liveMetrics.activeConnections / 1500) * 100}%` }}></div>
                          </div>
                          <span className="text-sm font-mono text-slate-900 dark:text-white">{formatNumber(liveMetrics.activeConnections)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orchestration Engine */}
          {activePreview === 'orchestration' && (
            <div>
              <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoLayersOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">AI Orchestration Engine</h3>
                      <p className="text-xs opacity-75">Your intelligent automation brain that predicts, decides, and acts in milliseconds</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-green-500/20 rounded-full text-xs font-medium">
                      ML Model v3.2.1
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* What This Means Box */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">What You're Looking At</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        This AI brain processes <strong>thousands of data points every second</strong> to make instant decisions:
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Predicts demand</strong> 47 minutes before guests need rides</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Positions drivers</strong> at your hotel before checkout rushes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Learns patterns</strong> from your specific hotel's guest behavior</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Saves money</strong> by eliminating wait times and surge pricing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Enhanced Neural Network Visualization */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Live AI Decision Making</h4>
                    <span className="text-xs text-purple-600 font-medium bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                      Processing {formatNumber(isClient ? animatedValue * 127 : 6350)} decisions/sec
                    </span>
                  </div>
                  
                  {/* Enhanced Animated Neural Network */}
                  <div className="relative">
                    <svg className="w-full h-64" viewBox="0 0 600 250">
                      {/* Background Grid */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="600" height="250" fill="url(#grid)" />
                      
                      {/* Animated Data Flow Lines - only animate on client */}
                      {isClient ? (
                        <defs>
                          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0">
                              <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="#7c3aed" stopOpacity="1">
                              <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                            </stop>
                            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0">
                              <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
                            </stop>
                          </linearGradient>
                        </defs>
                      ) : (
                        <defs>
                          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>
                      )}

                      {/* Input Layer - Data Sources */}
                      <g>
                        <text x="50" y="20" className="fill-purple-600 text-xs font-semibold">Data Inputs</text>
                        {[
                          { y: 50, label: 'Flight Data', value: '27 flights' },
                          { y: 90, label: 'Bookings', value: '847 guests' },
                          { y: 130, label: 'Weather', value: 'Clear' },
                          { y: 170, label: 'Traffic', value: 'Normal' },
                          { y: 210, label: 'History', value: '3M records' }
                        ].map((input, i) => (
                          <g key={`input-${i}`}>
                            <circle cx="80" cy={input.y} r="12" fill="#8b5cf6" className={isClient ? "animate-pulse" : ""} opacity="0.9" />
                            <text x="100" y={input.y + 3} className="fill-slate-600 dark:fill-slate-400 text-xs">{input.label}</text>
                            <text x="100" y={input.y + 15} className="fill-slate-500 dark:fill-slate-500 text-xs opacity-75">{input.value}</text>
                            {/* Connection lines to processing layer */}
                            {[0, 1, 2].map((j) => (
                              <line 
                                key={`line1-${i}-${j}`}
                                x1="92" y1={input.y} 
                                x2="268" y2={70 + j * 60} 
                                stroke="url(#flowGradient)" 
                                strokeWidth="2"
                                opacity="0.6"
                              />
                            ))}
                          </g>
                        ))}
                      </g>
                      
                      {/* Processing Layer - AI Analysis */}
                      <g>
                        <text x="240" y="20" className="fill-purple-600 text-xs font-semibold">AI Processing</text>
                        {[
                          { y: 70, label: 'Pattern Analysis', status: 'Active' },
                          { y: 130, label: 'Demand Prediction', status: 'Computing' },
                          { y: 190, label: 'Resource Optimization', status: 'Active' }
                        ].map((process, i) => (
                          <g key={`process-${i}`}>
                            <circle cx="280" cy={process.y} r="16" fill="#7c3aed">
                              {isClient && (
                                <animate attributeName="r" values="16;18;16" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                              )}
                            </circle>
                            <text x="305" y={process.y + 3} className="fill-slate-600 dark:fill-slate-400 text-xs">{process.label}</text>
                            <text x="305" y={process.y + 15} className="fill-green-600 text-xs">{process.status}</text>
                            {/* Connection lines to output layer */}
                            {[0, 1, 2, 3].map((j) => (
                              <line 
                                key={`line2-${i}-${j}`}
                                x1="296" y1={process.y} 
                                x2="468" y2={60 + j * 45} 
                                stroke="url(#flowGradient)" 
                                strokeWidth="2"
                                opacity="0.6"
                              />
                            ))}
                          </g>
                        ))}
                      </g>
                      
                      {/* Output Layer - Actions */}
                      <g>
                        <text x="440" y="20" className="fill-purple-600 text-xs font-semibold">Instant Actions</text>
                        {[
                          { y: 60, label: 'Dispatch Driver', value: 'Now' },
                          { y: 105, label: 'Position Fleet', value: '12 cars' },
                          { y: 150, label: 'Alert Hotels', value: '3 hotels' },
                          { y: 195, label: 'Adjust Pricing', value: 'Stable' }
                        ].map((output, i) => (
                          <g key={`output-${i}`}>
                            <circle cx="480" cy={output.y} r="12" fill="#6d28d9" opacity="0.9">
                              {isClient && (
                                <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                              )}
                            </circle>
                            <text x="500" y={output.y + 3} className="fill-slate-600 dark:fill-slate-400 text-xs">{output.label}</text>
                            <text x="500" y={output.y + 15} className="fill-green-600 text-xs font-semibold">{output.value}</text>
                          </g>
                        ))}
                      </g>
                    </svg>
                  </div>

                  {/* Real-time Processing Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{isClient ? (animatedValue * 3.7).toFixed(1) : '185.0'}ms</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Decision Speed</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">96.7%</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Accuracy Rate</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">$2.3K</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Saved Today</div>
                    </div>
                  </div>
                </div>

                {/* What This Means for Your Hotel */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6 border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
                    <IoTrendingUpOutline className="w-5 h-5 mr-2" />
                    Bottom Line Impact
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Zero Wait Times:</span> Guests never wait because AI knows when they'll need rides
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">No Surge Pricing:</span> Pre-positioned drivers eliminate supply-demand gaps
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Higher Reviews:</span> 5-star transportation = happier guests
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Revenue Growth:</span> Better service drives repeat bookings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Examples */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoFlashOutline className="w-5 h-5 text-amber-500" />
                      <span className="text-xs text-green-600">Live</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">47min</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Early Prediction</div>
                    <div className="text-xs text-green-600 mt-1">Before guest needs</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoStatsChartOutline className="w-5 h-5 text-blue-500" />
                      <span className="text-xs text-green-600">+12%</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">3,247</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">AI Decisions</div>
                    <div className="text-xs text-blue-600 mt-1">Made today</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoSyncOutline className="w-5 h-5 text-green-500" />
                      <IoRadioButtonOnOutline className={`w-3 h-3 text-green-500 ${isClient ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">100%</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Automated</div>
                    <div className="text-xs text-green-600 mt-1">No manual work</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoRocketOutline className="w-5 h-5 text-purple-500" />
                      <span className="text-xs text-purple-600">ML</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">24/7</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Learning</div>
                    <div className="text-xs text-purple-600 mt-1">Gets smarter daily</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Suite */}
          {activePreview === 'analytics' && (
            <div>
              <div className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoAnalyticsOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Business Intelligence Suite</h3>
                      <p className="text-xs opacity-75">Real-time analytics & predictive insights</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Powered by</span>
                    <div className="px-2 py-1 bg-white/20 rounded text-xs font-bold">
                      Snowflake
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Revenue Chart */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Revenue Trajectory</h4>
                    <select className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last Quarter</option>
                    </select>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="h-32 flex items-end justify-between space-x-1">
                    {[65, 72, 68, 81, 89, 92, 87, 94, 91, 96, 93, 98, 95, 97].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" 
                        style={{ height: `${height}%` }}>
                        <div className="text-xs text-white text-center mt-1 hidden lg:block">{height}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Total Revenue</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">$1.24M</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Growth Rate</p>
                      <p className="text-lg font-bold text-green-600">+23.7%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Projection</p>
                      <p className="text-lg font-bold text-blue-600">$1.47M</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Conversion Rate', value: '18.3%', change: '+2.1%', icon: <IoTrendingUpOutline className="w-4 h-4" /> },
                    { label: 'Avg Trip Value', value: '$47.82', change: '+$3.20', icon: <IoCashOutline className="w-4 h-4" /> },
                    { label: 'Guest Satisfaction', value: '4.9/5', change: '+0.3', icon: <IoStarOutline className="w-4 h-4" /> },
                    { label: 'Utilization', value: '87%', change: '+5%', icon: <IoBarChartOutline className="w-4 h-4" /> }
                  ].map((metric, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-slate-500">{metric.icon}</div>
                        <span className="text-xs text-green-600 font-medium">{metric.change}</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{metric.value}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integration Hub */}
          {activePreview === 'integrations' && (
            <div>
              <div className="bg-gradient-to-r from-cyan-900 to-blue-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoServerOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Enterprise Integration Hub</h3>
                      <p className="text-xs opacity-75">PMS, GDS, Channel Manager & API Gateway</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoLockClosedOutline className="w-4 h-4" />
                    <span className="text-xs">OAuth 2.0 / SAML 2.0</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Connected Systems */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: 'Opera Cloud', status: 'Connected', type: 'PMS', icon: <IoBedOutline className="w-6 h-6 text-blue-600" />, lastSync: '2 min ago' },
                    { name: 'Amadeus GDS', status: 'Connected', type: 'GDS', icon: <IoAirplaneOutline className="w-6 h-6 text-indigo-600" />, lastSync: '1 min ago' },
                    { name: 'Sabre Synxis', status: 'Connected', type: 'CRS', icon: <IoGlobeOutline className="w-6 h-6 text-purple-600" />, lastSync: '3 min ago' },
                    { name: 'Salesforce', status: 'Connected', type: 'CRM', icon: <IoCloudOutline className="w-6 h-6 text-cyan-600" />, lastSync: '5 min ago' },
                    { name: 'CDP Platform', status: 'Syncing', type: 'ESG', icon: <IoLeafOutline className="w-6 h-6 text-green-600" />, lastSync: 'In progress' },
                    { name: 'Stripe Connect', status: 'Connected', type: 'Payment', icon: <IoCashOutline className="w-6 h-6 text-emerald-600" />, lastSync: '1 min ago' },
                    { name: 'Mews Systems', status: 'Connected', type: 'PMS', icon: <IoServerOutline className="w-6 h-6 text-orange-600" />, lastSync: '4 min ago' },
                    { name: 'Oracle MICROS', status: 'Connected', type: 'POS', icon: <IoTerminalOutline className="w-6 h-6 text-red-600" />, lastSync: '2 min ago' },
                    { name: 'Duetto RMS', status: 'Connected', type: 'Revenue', icon: <IoStatsChartOutline className="w-6 h-6 text-pink-600" />, lastSync: '6 min ago' }
                  ].map((system, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        {system.icon}
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          system.status === 'Connected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {system.status}
                        </div>
                      </div>
                      <h5 className="font-semibold text-slate-900 dark:text-white">{system.name}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{system.type}</p>
                      <p className="text-xs text-slate-500 mt-2">Sync: {system.lastSync}</p>
                    </div>
                  ))}
                </div>

                {/* View All Integrations Link */}
                <div className="text-center mb-6">
                  <a 
                    href="/integrations" 
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                  >
                    <IoLayersOutline className="w-5 h-5" />
                    <span>View All 47+ Integrations</span>
                    <IoArrowForwardOutline className="w-4 h-4" />
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    PMS, Channel Managers, Payment Gateways, CRM, Revenue Management & More
                  </p>
                </div>

                {/* API Gateway Stats */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                    <IoCloudOutline className="w-5 h-5 mr-2" />
                    API Gateway Performance
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(liveMetrics.apiCalls)}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Requests/Hour</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">99.99%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Success Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{Math.round(liveMetrics.responseTime)}ms</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Avg Latency</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">256-bit</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Encryption</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Portal */}
          {activePreview === 'compliance' && (
            <div>
              <div className="bg-gradient-to-r from-emerald-900 to-green-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoShieldCheckmarkOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Compliance & Security Portal</h3>
                      <p className="text-xs opacity-75">SOC 2 Type II | ISO 27001 | PCI DSS Level 1</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="px-2 py-1 bg-green-500/20 rounded text-xs font-medium">
                      ✓ All Compliant
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Compliance Status Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { name: 'SOC 2 Type II', status: 'Certified', date: 'Exp: Dec 2025', icon: <IoShieldCheckmarkOutline className="w-6 h-6 text-green-600" /> },
                    { name: 'ISO 27001', status: 'Certified', date: 'Exp: Mar 2026', icon: <IoGlobeOutline className="w-6 h-6 text-blue-600" /> },
                    { name: 'PCI DSS', status: 'Level 1', date: 'Exp: Jun 2025', icon: <IoLockClosedOutline className="w-6 h-6 text-purple-600" /> },
                    { name: 'GDPR', status: 'Compliant', date: 'Continuous', icon: <IoKeyOutline className="w-6 h-6 text-indigo-600" /> }
                  ].map((cert, i) => (
                    <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        {cert.icon}
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <h5 className="font-semibold text-slate-900 dark:text-white">{cert.name}</h5>
                      <p className="text-xs text-green-600 font-medium">{cert.status}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{cert.date}</p>
                    </div>
                  ))}
                </div>

                {/* ESG Metrics */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                    <IoLeafOutline className="w-5 h-5 mr-2 text-green-600" />
                    ESG Performance Dashboard
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-green-600">2,847</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Tonnes CO2 Saved</p>
                      <div className="mt-1 h-1 bg-green-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">CDP A</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Rating Score</p>
                      <p className="text-xs text-green-600 mt-1">↑ Improved</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">100%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Data Coverage</p>
                      <p className="text-xs text-slate-500 mt-1">Scope 1, 2, 3</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">Q1 2025</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Next Report</p>
                      <p className="text-xs text-green-600 mt-1">Auto-Generated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Developer Console */}
          {activePreview === 'developer' && (
            <div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoCodeSlashOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Developer Console</h3>
                      <p className="text-xs opacity-75">API Documentation, SDKs & Sandbox Environment</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 bg-green-500/20 rounded text-xs font-medium">
                      v3.14.2
                    </div>
                    <a href="/gds" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors text-white">
                      View Docs
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Code Example */}
                <div className="bg-slate-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <select 
                      className="text-xs bg-slate-800 text-white px-2 py-1 rounded"
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      value={codeLanguage}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                    </select>
                  </div>
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
{codeLanguage === 'javascript' ? `// Initialize ItWhip SDK
import { ItWhipClient } from '@itwhip/sdk';

const client = new ItWhipClient({
  apiKey: process.env.ITWHIP_API_KEY,
  environment: 'production',
  hotelId: 'PHX-MAR-001'
});

// Instant Ride Dispatch
const ride = await client.rides.dispatch({
  pickup: { lat: 33.4484, lng: -112.0740 },
  destination: 'Sky Harbor Terminal 4',
  guest: { 
    reservationId: 'RES-2024-8473',
    vip: true 
  }
});

console.log(\`Ride \${ride.id} dispatched - ETA: \${ride.eta}s\`);` 
: codeLanguage === 'python' ? `# Initialize ItWhip SDK
from itwhip import ItWhipClient

client = ItWhipClient(
    api_key=os.environ['ITWHIP_API_KEY'],
    environment='production',
    hotel_id='PHX-MAR-001'
)

# Instant Ride Dispatch
ride = client.rides.dispatch(
    pickup={'lat': 33.4484, 'lng': -112.0740},
    destination='Sky Harbor Terminal 4',
    guest={
        'reservation_id': 'RES-2024-8473',
        'vip': True
    }
)

print(f"Ride {ride.id} dispatched - ETA: {ride.eta}s")`
: codeLanguage === 'java' ? `// Initialize ItWhip SDK
import com.itwhip.sdk.ItWhipClient;
import com.itwhip.sdk.models.*;

ItWhipClient client = new ItWhipClient.Builder()
    .apiKey(System.getenv("ITWHIP_API_KEY"))
    .environment("production")
    .hotelId("PHX-MAR-001")
    .build();

// Instant Ride Dispatch
Location pickup = new Location(33.4484, -112.0740);
Guest guest = new Guest("RES-2024-8473", true);

Ride ride = client.rides().dispatch(
    pickup,
    "Sky Harbor Terminal 4",
    guest
);

System.out.println("Ride " + ride.getId() + 
    " dispatched - ETA: " + ride.getEta() + "s");`
: `// Initialize ItWhip SDK
using ItWhip.SDK;
using ItWhip.SDK.Models;

var client = new ItWhipClient(
    apiKey: Environment.GetEnvironmentVariable("ITWHIP_API_KEY"),
    environment: "production",
    hotelId: "PHX-MAR-001"
);

// Instant Ride Dispatch
var pickup = new Location { Lat = 33.4484, Lng = -112.0740 };
var guest = new Guest 
{ 
    ReservationId = "RES-2024-8473",
    Vip = true 
};

var ride = await client.Rides.DispatchAsync(
    pickup,
    "Sky Harbor Terminal 4",
    guest
);

Console.WriteLine($"Ride {ride.Id} dispatched - ETA: {ride.Eta}s");`}
                  </pre>
                </div>

                {/* API Endpoints */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { method: 'POST', endpoint: '/rides/dispatch', latency: '127ms' },
                    { method: 'GET', endpoint: '/rides/:id', latency: '43ms' },
                    { method: 'POST', endpoint: '/bookings/sync', latency: '89ms' },
                    { method: 'GET', endpoint: '/analytics/revenue', latency: '156ms' },
                    { method: 'POST', endpoint: '/compliance/report', latency: '234ms' },
                    { method: 'GET', endpoint: '/drivers/available', latency: '67ms' }
                  ].map((api, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${
                          api.method === 'POST' ? 'text-green-600' : 'text-blue-600'
                        }`}>{api.method}</span>
                        <span className="text-xs text-slate-500">{api.latency}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300">{api.endpoint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Features Bar */}
        <div className="mt-8 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-center">
            {[
              { label: 'Multi-Region', value: '6 Regions', icon: <IoGlobeOutline className="w-5 h-5" /> },
              { label: 'Encryption', value: 'AES-256', icon: <IoLockClosedOutline className="w-5 h-5" /> },
              { label: 'Backup', value: 'Real-time', icon: <IoCloudOutline className="w-5 h-5" /> },
              { label: 'Support', value: '24/7 SLA', icon: <IoTimeOutline className="w-5 h-5" /> },
              { label: 'Deployment', value: 'Multi-Cloud', icon: <IoServerOutline className="w-5 h-5" /> },
              { label: 'Updates', value: 'Zero-Downtime', icon: <IoSyncOutline className="w-5 h-5" /> }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-slate-500 dark:text-slate-400 mb-2">{feature.icon}</div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{feature.value}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Powered by Enterprise Technology</p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {['AWS', 'Snowflake', 'Kubernetes', 'TensorFlow', 'Redis', 'PostgreSQL', 'ElasticSearch', 'Kafka'].map((tech) => (
              <span key={tech} className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}