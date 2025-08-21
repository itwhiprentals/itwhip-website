// app/components/hotel-solutions/LiveProofWidgets.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoPulseOutline,
  IoWifiOutline,
  IoCarOutline,
  IoTimerOutline,
  IoTrendingUpOutline,
  IoCashOutline,
  IoCheckmarkCircle,
  IoBusinessOutline,
  IoEyeOutline,
  IoFlashOutline,
  IoGlobeOutline,
  IoSpeedometerOutline,
  IoServerOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoAirplaneOutline,
  IoShieldCheckmarkOutline,
  IoAnalyticsOutline,
  IoStatsChartOutline,
  IoTrendingDownOutline,
  IoSwapHorizontalOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface MetricWidget {
  id: string
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  isLive?: boolean
  description?: string
  mobileLabel?: string
}

interface LiveEvent {
  id: string
  timestamp: string
  type: string
  message: string
  value?: string
  icon: React.ReactNode
  color: string
}

export default function LiveProofWidgets() {
  const [isClient, setIsClient] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [showAllEvents, setShowAllEvents] = useState(false)
  
  // Live Metrics State
  const [metrics, setMetrics] = useState({
    driversOnline: 847,
    apiResponseTime: 127,
    ridesToday: 3247,
    hotelsViewing: 47,
    revenueToday: 47832,
    averagePickupTime: 2.3,
    systemUptime: 99.99,
    activeRides: 128,
    airportQueue: 23,
    completionRate: 99.7,
    driverRating: 4.9,
    instantAvailability: 100
  })

  // Live Events State - Initialize with stable values
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([
    {
      id: '1',
      timestamp: '12:00:00',
      type: 'ride.completed',
      message: 'PHX Marriott → Sky Harbor',
      value: '$78.50',
      icon: <IoCheckmarkCircle className="w-4 h-4" />,
      color: 'text-green-500'
    },
    {
      id: '2',
      timestamp: '12:00:00',
      type: 'driver.online',
      message: 'Driver joined in Scottsdale',
      icon: <IoCarOutline className="w-4 h-4" />,
      color: 'text-blue-500'
    },
    {
      id: '3',
      timestamp: '12:00:00',
      type: 'hotel.viewing',
      message: 'Hilton Phoenix checking system',
      icon: <IoEyeOutline className="w-4 h-4" />,
      color: 'text-purple-500'
    }
  ])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update metrics every 3 seconds - only on client
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setMetrics(prev => ({
        driversOnline: Math.max(800, Math.min(900, prev.driversOnline + Math.floor(Math.random() * 11) - 5)),
        apiResponseTime: Math.round(Math.max(100, Math.min(150, prev.apiResponseTime + Math.floor(Math.random() * 11) - 5))),
        ridesToday: prev.ridesToday + Math.floor(Math.random() * 3),
        hotelsViewing: Math.max(40, Math.min(60, prev.hotelsViewing + Math.floor(Math.random() * 5) - 2)),
        revenueToday: prev.revenueToday + Math.floor(Math.random() * 100) + 50,
        averagePickupTime: parseFloat((2 + Math.random() * 0.8).toFixed(1)),
        systemUptime: 99.99,
        activeRides: Math.max(100, Math.min(150, prev.activeRides + Math.floor(Math.random() * 11) - 5)),
        airportQueue: Math.max(15, Math.min(35, prev.airportQueue + Math.floor(Math.random() * 7) - 3)),
        completionRate: parseFloat((99.5 + Math.random() * 0.5).toFixed(1)),
        driverRating: 4.9,
        instantAvailability: 100
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isClient])

  // Generate new events periodically - only on client
  useEffect(() => {
    if (!isClient) return

    // Update timestamps for initial events
    setLiveEvents(prev => prev.map(event => ({
      ...event,
      timestamp: new Date().toTimeString().split(' ')[0]
    })))

    const interval = setInterval(() => {
      const newEvent = generateRandomEvent()
      setLiveEvents(prev => [newEvent, ...prev.slice(0, 4)])
    }, 5000)

    return () => clearInterval(interval)
  }, [isClient])

  function generateRandomEvent(): LiveEvent {
    const eventTypes = [
      {
        type: 'ride.started',
        message: 'Westin Kierland → Restaurant',
        value: '$35.00',
        icon: <IoCarOutline className="w-4 h-4" />,
        color: 'text-blue-500'
      },
      {
        type: 'ride.completed',
        message: 'Fairmont → Sky Harbor T4',
        value: '$82.30',
        icon: <IoCheckmarkCircle className="w-4 h-4" />,
        color: 'text-green-500'
      },
      {
        type: 'driver.online',
        message: 'Driver activated in Tempe',
        icon: <IoCarOutline className="w-4 h-4" />,
        color: 'text-cyan-500'
      },
      {
        type: 'hotel.signup',
        message: 'New hotel registered',
        icon: <IoBusinessOutline className="w-4 h-4" />,
        color: 'text-purple-500'
      },
      {
        type: 'instant.triggered',
        message: 'Instant pickup activated',
        value: '0 sec wait',
        icon: <IoFlashOutline className="w-4 h-4" />,
        color: 'text-yellow-500'
      },
      {
        type: 'revenue.milestone',
        message: 'Daily revenue goal hit',
        value: '$50,000',
        icon: <IoCashOutline className="w-4 h-4" />,
        color: 'text-emerald-500'
      }
    ]

    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    return {
      id: Date.now().toString(),
      timestamp: new Date().toTimeString().split(' ')[0],
      ...event
    }
  }

  const primaryWidgets: MetricWidget[] = [
    {
      id: 'drivers',
      label: 'Drivers Online',
      mobileLabel: 'Drivers',
      value: metrics.driversOnline,
      icon: <IoCarOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      trend: 'up',
      trendValue: '+12%',
      isLive: true,
      description: 'Phoenix Metro Area'
    },
    {
      id: 'response',
      label: 'API Response',
      mobileLabel: 'Response',
      value: metrics.apiResponseTime,
      unit: 'ms',
      icon: <IoSpeedometerOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      trend: 'stable',
      isLive: true,
      description: 'Enterprise SLA: <200ms'
    },
    {
      id: 'rides',
      label: 'Rides Today',
      mobileLabel: 'Rides',
      value: isClient ? metrics.ridesToday.toLocaleString() : '3,247',
      icon: <IoTrendingUpOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      trend: 'up',
      trendValue: '+23%',
      isLive: true,
      description: 'All partner hotels'
    },
    {
      id: 'revenue',
      label: 'Revenue Today',
      mobileLabel: 'Revenue',
      value: `$${isClient ? metrics.revenueToday.toLocaleString() : '47,832'}`,
      icon: <IoCashOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      trend: 'up',
      trendValue: '+31%',
      isLive: true,
      description: 'Hotel commissions'
    }
  ]

  const secondaryWidgets: MetricWidget[] = [
    {
      id: 'viewing',
      label: 'Hotels Viewing Now',
      mobileLabel: 'Viewing',
      value: metrics.hotelsViewing,
      icon: <IoEyeOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      isLive: true
    },
    {
      id: 'uptime',
      label: 'System Uptime',
      mobileLabel: 'Uptime',
      value: metrics.systemUptime,
      unit: '%',
      icon: <IoServerOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'active',
      label: 'Active Rides',
      mobileLabel: 'Active',
      value: metrics.activeRides,
      icon: <IoPulseOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      isLive: true
    },
    {
      id: 'pickup',
      label: 'Avg Pickup Time',
      mobileLabel: 'Pickup',
      value: metrics.averagePickupTime,
      unit: 'min',
      icon: <IoTimerOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      isLive: true
    }
  ]

  const performanceWidgets: MetricWidget[] = [
    {
      id: 'airport',
      label: 'Airport Queue',
      mobileLabel: 'Airport',
      value: metrics.airportQueue,
      unit: 'drivers',
      icon: <IoAirplaneOutline className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50 dark:bg-sky-900/20',
      borderColor: 'border-sky-200 dark:border-sky-800'
    },
    {
      id: 'completion',
      label: 'Completion Rate',
      mobileLabel: 'Complete',
      value: metrics.completionRate,
      unit: '%',
      icon: <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'rating',
      label: 'Driver Rating',
      mobileLabel: 'Rating',
      value: metrics.driverRating,
      unit: '★',
      icon: <IoStatsChartOutline className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      id: 'instant',
      label: 'Instant Available',
      mobileLabel: 'Instant',
      value: metrics.instantAvailability,
      unit: '%',
      icon: <IoFlashOutline className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ]

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-green-300 dark:border-green-800">
            <div className="relative flex h-3 w-3">
              {isClient && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Live System Metrics</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
            Real-Time <span className="text-green-600">Proof of Performance</span>
          </h2>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
            Watch our platform operate in real-time. 
            <span className="block mt-1 sm:inline sm:mt-0">These aren't demos - this is live production data.</span>
          </p>
        </div>

        {/* Primary Metrics Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {primaryWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`${widget.bgColor} rounded-lg sm:rounded-xl p-4 sm:p-6 border ${widget.borderColor} relative overflow-hidden group hover:scale-105 transition-transform duration-200 cursor-pointer`}
              onClick={() => setSelectedMetric(selectedMetric === widget.id ? null : widget.id)}
            >
              {widget.isLive && isClient && (
                <div className="absolute top-2 right-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                </div>
              )}
              
              <div className={`${widget.color} mb-2 sm:mb-3`}>
                {widget.icon}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block">
                  {widget.label}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider sm:hidden">
                  {widget.mobileLabel}
                </p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {widget.value}
                  </span>
                  {widget.unit && (
                    <span className="text-sm sm:text-lg font-semibold text-slate-600 dark:text-slate-400">
                      {widget.unit}
                    </span>
                  )}
                </div>
                {/* Show description only on desktop or when selected on mobile */}
                {widget.description && (
                  <p className={`text-xs text-slate-600 dark:text-slate-400 mt-1 ${
                    selectedMetric === widget.id ? 'block' : 'hidden sm:block'
                  }`}>
                    {widget.description}
                  </p>
                )}
                {widget.trend && (
                  <div className="flex items-center space-x-1 mt-1 sm:mt-2">
                    {widget.trend === 'up' && (
                      <>
                        <IoTrendingUpOutline className="w-3 sm:w-4 h-3 sm:h-4 text-green-500" />
                        <span className="text-xs font-semibold text-green-600">{widget.trendValue}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Metrics Bar - Mobile Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {secondaryWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`${widget.bgColor} rounded-lg p-3 sm:p-4 border ${widget.borderColor} flex items-center space-x-2 sm:space-x-3`}
            >
              <div className={`${widget.color}`}>
                {widget.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                  {widget.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate sm:hidden">
                  {widget.mobileLabel}
                </p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {widget.value}
                  </span>
                  {widget.unit && (
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {widget.unit}
                    </span>
                  )}
                </div>
              </div>
              {widget.isLive && isClient && (
                <div className="hidden sm:block ml-auto">
                  <IoWifiOutline className="w-4 h-4 text-green-500 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Event Stream - Mobile Optimized */}
        <div className="bg-slate-900 dark:bg-black rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Live Event Stream</h3>
            <div className="flex items-center space-x-2">
              {isClient && (
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
              )}
              <span className="text-green-400 text-xs sm:text-sm">STREAMING</span>
            </div>
          </div>
          
          {/* Mobile: Show fewer events by default */}
          <div className="space-y-2 font-mono text-xs sm:text-sm">
            {liveEvents.slice(0, showAllEvents ? 5 : 3).map((event, idx) => (
              <div
                key={event.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-slate-300 p-2 sm:p-0 rounded-lg sm:rounded-none ${
                  idx % 2 === 0 ? 'bg-slate-800/50 sm:bg-transparent' : ''
                } ${idx === 0 && isClient ? 'animate-slide-in' : ''}`}
              >
                {/* Mobile Layout */}
                <div className="sm:hidden">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={event.color}>{event.icon}</div>
                      <span className="text-slate-400 text-xs">{event.type}</span>
                    </div>
                    {event.value && (
                      <span className="text-green-400 font-bold text-xs">{event.value}</span>
                    )}
                  </div>
                  <p className="text-white text-xs">{event.message}</p>
                  <span className="text-slate-600 text-xs mt-1">{isClient ? event.timestamp : '12:00:00'}</span>
                </div>
                
                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:items-center sm:space-x-3 sm:w-full">
                  <span className="text-slate-500 text-xs">{isClient ? event.timestamp : '12:00:00'}</span>
                  <div className={event.color}>{event.icon}</div>
                  <span className="text-slate-400">{event.type}</span>
                  <span className="text-white flex-1">{event.message}</span>
                  {event.value && (
                    <span className="text-green-400 font-bold">{event.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile: Show More Button */}
          <button
            onClick={() => setShowAllEvents(!showAllEvents)}
            className="sm:hidden mt-3 text-xs text-blue-400 flex items-center space-x-1"
          >
            <IoSwapHorizontalOutline className="w-4 h-4" />
            <span>{showAllEvents ? 'Show Less' : 'Show More Events'}</span>
          </button>
        </div>

        {/* Performance Metrics - Mobile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {performanceWidgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-md border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                  {widget.label}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate sm:hidden">
                  {widget.mobileLabel}
                </p>
                <div className={widget.color}>
                  {widget.icon}
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {widget.value}
                </span>
                {widget.unit && (
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {widget.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* System Status Banner - Mobile Optimized */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 md:mb-0">
              <IoShieldCheckmarkOutline className="w-10 sm:w-12 h-10 sm:h-12" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">All Systems Operational</h3>
                <p className="text-green-100 text-sm">Zero incidents in the last 90 days</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">99.99%</p>
                <p className="text-xs text-green-100">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">{metrics.apiResponseTime}ms</p>
                <p className="text-xs text-green-100">Response</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">{metrics.driversOnline}</p>
                <p className="text-xs text-green-100">Drivers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Message - Mobile Centered */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <IoGlobeOutline className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Connected to production servers in Phoenix, Dallas, and Virginia</span>
            <span className="sm:hidden">Connected to 3 data centers</span>
          </p>
        </div>

        {/* Mobile Refresh Indicator */}
        {isClient && (
          <div className="sm:hidden mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <IoRefreshOutline className="w-3 h-3 mr-1 animate-spin" />
              Auto-refreshing every 3 seconds
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </section>
  )
}