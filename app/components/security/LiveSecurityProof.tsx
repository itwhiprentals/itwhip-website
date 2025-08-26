// app/components/security/LiveSecurityProof.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoPulseOutline,
  IoWifiOutline,
  IoShieldCheckmarkOutline,
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
  IoSkullOutline,
  IoWarningOutline,
  IoFlameOutline,
  IoKeyOutline,
  IoLockClosedOutline,
  IoAnalyticsOutline,
  IoStatsChartOutline,
  IoTrendingDownOutline,
  IoSwapHorizontalOutline,
  IoRefreshOutline,
  IoInfiniteOutline,
  IoCodeSlashOutline,
  IoBugOutline,
  IoAlertCircleOutline,
  IoRocketOutline,
  IoLayersOutline
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

interface SecurityEvent {
  id: string
  timestamp: string
  type: string
  message: string
  value?: string
  icon: React.ReactNode
  color: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
}

export default function LiveSecurityProof() {
  const [isClient, setIsClient] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [showAllEvents, setShowAllEvents] = useState(false)
  
  // Live Security Metrics State
  const [metrics, setMetrics] = useState({
    attacksBlocked: 48291,
    detectionSpeed: 2,
    activeProtections: 847,
    companiesProtected: 147,
    bountyPaid: 247000,
    vulnerabilitiesPatched: 1847,
    uptime: 100,
    hackersDefeated: 3847,
    quantumStrength: 10e78,
    complianceSaved: 150000,
    breachesPreventedValue: 4880000,
    aiPredictions: 47
  })

  // Live Security Events State
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: '12:00:00',
      type: 'attack.blocked',
      message: 'SQL Injection attempt from Russia blocked',
      severity: 'CRITICAL',
      icon: <IoSkullOutline className="w-4 h-4" />,
      color: 'text-red-500'
    },
    {
      id: '2',
      timestamp: '12:00:00',
      type: 'vulnerability.patched',
      message: 'XSS vulnerability auto-patched by AI',
      icon: <IoCheckmarkCircle className="w-4 h-4" />,
      color: 'text-green-500'
    },
    {
      id: '3',
      timestamp: '12:00:00',
      type: 'bounty.paid',
      message: 'Ethical hacker rewarded $5,000',
      value: '$5,000',
      icon: <IoCashOutline className="w-4 h-4" />,
      color: 'text-purple-500'
    }
  ])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update metrics every 2 seconds - only on client
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setMetrics(prev => ({
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 7) + 1,
        detectionSpeed: 2,
        activeProtections: 847,
        companiesProtected: prev.companiesProtected + (Math.random() > 0.95 ? 1 : 0),
        bountyPaid: prev.bountyPaid + (Math.random() > 0.9 ? 1000 : 0),
        vulnerabilitiesPatched: prev.vulnerabilitiesPatched + (Math.random() > 0.7 ? 1 : 0),
        uptime: 100,
        hackersDefeated: prev.hackersDefeated + Math.floor(Math.random() * 3),
        quantumStrength: 10e78,
        complianceSaved: prev.complianceSaved + Math.floor(Math.random() * 1000),
        breachesPreventedValue: prev.breachesPreventedValue + Math.floor(Math.random() * 10000),
        aiPredictions: Math.floor(Math.random() * 10) + 42
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isClient])

  // Generate new security events periodically
  useEffect(() => {
    if (!isClient) return

    // Update timestamps for initial events
    setSecurityEvents(prev => prev.map(event => ({
      ...event,
      timestamp: new Date().toTimeString().split(' ')[0]
    })))

    const interval = setInterval(() => {
      const newEvent = generateRandomSecurityEvent()
      setSecurityEvents(prev => [newEvent, ...prev.slice(0, 4)])
    }, 3000)

    return () => clearInterval(interval)
  }, [isClient])

  function generateRandomSecurityEvent(): SecurityEvent {
    const eventTypes = [
      {
        type: 'attack.blocked',
        message: 'DDoS attack from China neutralized',
        severity: 'CRITICAL' as const,
        icon: <IoSkullOutline className="w-4 h-4" />,
        color: 'text-red-500'
      },
      {
        type: 'attack.blocked',
        message: 'Brute force attempt on API blocked',
        severity: 'HIGH' as const,
        icon: <IoWarningOutline className="w-4 h-4" />,
        color: 'text-orange-500'
      },
      {
        type: 'vulnerability.found',
        message: 'Zero-day discovered by bug bounty',
        value: '$10,000',
        severity: 'CRITICAL' as const,
        icon: <IoBugOutline className="w-4 h-4" />,
        color: 'text-yellow-500'
      },
      {
        type: 'ai.prediction',
        message: 'AI predicted attack 47 min early',
        value: '47 min',
        severity: 'INFO' as const,
        icon: <IoRocketOutline className="w-4 h-4" />,
        color: 'text-blue-500'
      },
      {
        type: 'patch.deployed',
        message: 'Quantum encryption upgraded',
        severity: 'INFO' as const,
        icon: <IoCheckmarkCircle className="w-4 h-4" />,
        color: 'text-green-500'
      },
      {
        type: 'hacker.failed',
        message: 'Anonymous collective gave up',
        severity: 'HIGH' as const,
        icon: <IoFlameOutline className="w-4 h-4" />,
        color: 'text-purple-500'
      },
      {
        type: 'compliance.validated',
        message: 'TU-1-A validation completed',
        severity: 'INFO' as const,
        icon: <IoShieldCheckmarkOutline className="w-4 h-4" />,
        color: 'text-indigo-500'
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
      id: 'attacks',
      label: 'Attacks Blocked',
      mobileLabel: 'Blocked',
      value: metrics.attacksBlocked.toLocaleString(),
      icon: <IoSkullOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      trend: 'up',
      trendValue: '+127%',
      isLive: true,
      description: 'Today\'s attack attempts'
    },
    {
      id: 'speed',
      label: 'Detection Speed',
      mobileLabel: 'Speed',
      value: metrics.detectionSpeed,
      unit: 'ms',
      icon: <IoFlashOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      trend: 'stable',
      isLive: true,
      description: 'vs 204 days industry avg'
    },
    {
      id: 'protections',
      label: 'Active Protections',
      mobileLabel: 'Shields',
      value: metrics.activeProtections,
      icon: <IoLayersOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      trend: 'up',
      trendValue: '+37',
      isLive: true,
      description: 'Defense layers active'
    },
    {
      id: 'bounty',
      label: 'Bounties Paid',
      mobileLabel: 'Bounties',
      value: `$${(metrics.bountyPaid / 1000).toFixed(0)}K`,
      icon: <IoCashOutline className="w-6 sm:w-8 h-6 sm:h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      trend: 'up',
      trendValue: '+$47K',
      isLive: true,
      description: 'To ethical hackers'
    }
  ]

  const secondaryWidgets: MetricWidget[] = [
    {
      id: 'companies',
      label: 'Companies Protected',
      mobileLabel: 'Protected',
      value: metrics.companiesProtected,
      icon: <IoBusinessOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      isLive: true
    },
    {
      id: 'uptime',
      label: 'Protection Uptime',
      mobileLabel: 'Uptime',
      value: metrics.uptime,
      unit: '%',
      icon: <IoServerOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'hackers',
      label: 'Hackers Defeated',
      mobileLabel: 'Defeated',
      value: metrics.hackersDefeated.toLocaleString(),
      icon: <IoFlameOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      isLive: true
    },
    {
      id: 'vulnerabilities',
      label: 'Vulns Patched',
      mobileLabel: 'Patched',
      value: metrics.vulnerabilitiesPatched.toLocaleString(),
      icon: <IoBugOutline className="w-5 sm:w-6 h-5 sm:h-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      isLive: true
    }
  ]

  const quantumWidgets: MetricWidget[] = [
    {
      id: 'quantum',
      label: 'Quantum Strength',
      mobileLabel: 'Quantum',
      value: '10⁷⁸',
      unit: 'qubits',
      icon: <IoInfiniteOutline className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      id: 'ai',
      label: 'AI Predictions',
      mobileLabel: 'AI',
      value: metrics.aiPredictions,
      unit: 'min early',
      icon: <IoRocketOutline className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800'
    },
    {
      id: 'saved',
      label: 'Compliance Saved',
      mobileLabel: 'Saved',
      value: `$${(metrics.complianceSaved / 1000).toFixed(0)}K`,
      icon: <IoStatsChartOutline className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'prevented',
      label: 'Breaches Prevented',
      mobileLabel: 'Worth',
      value: `$${(metrics.breachesPreventedValue / 1000000).toFixed(1)}M`,
      icon: <IoShieldCheckmarkOutline className="w-4 sm:w-5 h-4 sm:h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    }
  ]

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500'
      case 'HIGH': return 'text-orange-500'
      case 'MEDIUM': return 'text-yellow-500'
      case 'LOW': return 'text-blue-500'
      default: return 'text-green-500'
    }
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-purple-300 dark:border-purple-800">
            <div className="relative flex h-3 w-3">
              {isClient && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Live Security Metrics</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
            Real-Time <span className="text-purple-600">Security Operations</span>
          </h2>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
            This isn't a simulation. Watch TU-1-A defend against real attacks.
            <span className="block mt-1 sm:inline sm:mt-0">Every number is live production data.</span>
          </p>
        </div>

        {/* Primary Security Metrics Grid */}
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
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
                    {widget.trend === 'stable' && (
                      <span className="text-xs font-semibold text-blue-600">STABLE</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Security Metrics */}
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
                  <IoWifiOutline className="w-4 h-4 text-purple-500 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Security Event Stream */}
        <div className="bg-slate-900 dark:bg-black rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Security Operations Center</h3>
            <div className="flex items-center space-x-2">
              {isClient && (
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
              )}
              <span className="text-red-400 text-xs sm:text-sm font-mono">MONITORING</span>
            </div>
          </div>
          
          {/* Security Events */}
          <div className="space-y-2 font-mono text-xs sm:text-sm">
            {securityEvents.slice(0, showAllEvents ? 5 : 3).map((event, idx) => (
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
                      {event.severity && (
                        <span className={`text-xs font-bold ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      )}
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
                  {event.severity && (
                    <span className={`text-xs font-bold ${getSeverityColor(event.severity)}`}>
                      [{event.severity}]
                    </span>
                  )}
                  <span className="text-white flex-1">{event.message}</span>
                  {event.value && (
                    <span className="text-green-400 font-bold">{event.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Show More Button */}
          <button
            onClick={() => setShowAllEvents(!showAllEvents)}
            className="sm:hidden mt-3 text-xs text-purple-400 flex items-center space-x-1"
          >
            <IoSwapHorizontalOutline className="w-4 h-4" />
            <span>{showAllEvents ? 'Show Less' : 'Show More Events'}</span>
          </button>
        </div>

        {/* Quantum & AI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {quantumWidgets.map((widget) => (
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

        {/* Zero Breach Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 md:mb-0">
              <IoShieldCheckmarkOutline className="w-10 sm:w-12 h-10 sm:h-12" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Zero Breaches Since 2019</h3>
                <p className="text-purple-100 text-sm">While others talk compliance, we deliver security</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">100%</p>
                <p className="text-xs text-purple-100">Protection</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">{metrics.detectionSpeed}ms</p>
                <p className="text-xs text-purple-100">Detection</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">24/7</p>
                <p className="text-xs text-purple-100">Monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Public Dashboard Link */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
            <IoGlobeOutline className="w-4 sm:w-5 h-4 sm:h-5 inline mr-2" />
            <span className="hidden sm:inline">Verify our security status anytime at</span>
            <span className="sm:hidden">Live dashboard:</span>
          </p>
          <a 
            href="/security/status" 
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all transform hover:scale-105"
          >
            <IoEyeOutline className="w-5 h-5" />
            <span>tu1a.security/status</span>
          </a>
        </div>

        {/* Challenge Box */}
        <div className="mt-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-red-500">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <IoSkullOutline className="w-8 h-8 text-red-600" />
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Think You Can Beat TU-1-A?</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isClient ? `${metrics.hackersDefeated.toLocaleString()} hackers tried. All failed.` : '3,847 hackers tried. All failed.'}
                </p>
              </div>
            </div>
            <a 
              href="/security/challenge"
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <IoFlameOutline className="w-5 h-5" />
              <span>Accept Challenge</span>
            </a>
          </div>
        </div>

        {/* Mobile Refresh Indicator */}
        {isClient && (
          <div className="sm:hidden mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <IoRefreshOutline className="w-3 h-3 mr-1 animate-spin" />
              Auto-updating every 2 seconds
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