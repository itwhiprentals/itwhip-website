// app/components/security/SecurityCrisisHeader.tsx

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoWarningOutline,
  IoSkullOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoFlameOutline,
  IoLockClosedOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoBusinessOutline,
  IoBugOutline,
  IoEyeOutline,
  IoRocketOutline
} from 'react-icons/io5'

interface SecurityMetrics {
  attacksBlocked: number
  threatsDetected: number
  bountiesPaid: number
  protectionRate: number
  breachesPreventedValue: number
  complianceScore: number
  detectionSpeed: number
}

interface SecurityCrisisHeaderProps {
  securityMetrics: SecurityMetrics
  onSeeSolution: () => void
}

export default function SecurityCrisisHeader({ 
  securityMetrics, 
  onSeeSolution 
}: SecurityCrisisHeaderProps) {
  const [isClient, setIsClient] = useState(false)
  const [animatedAttacks, setAnimatedAttacks] = useState(securityMetrics.attacksBlocked)
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Animate the attack counter
  useEffect(() => {
    if (!isClient) return
    
    const interval = setInterval(() => {
      setAnimatedAttacks(prev => prev + Math.floor(Math.random() * 7) + 3)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [isClient])

  // Rotate through metrics on mobile
  useEffect(() => {
    if (!isClient) return
    
    const interval = setInterval(() => {
      setCurrentMetricIndex(prev => (prev + 1) % 4)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [isClient])

  const mobileMetrics = [
    { 
      icon: IoShieldCheckmarkOutline, 
      value: animatedAttacks.toLocaleString(), 
      label: 'Attacks Blocked', 
      color: 'text-purple-400' 
    },
    { 
      icon: IoSkullOutline, 
      value: `$${(securityMetrics.breachesPreventedValue / 1000000).toFixed(1)}M`, 
      label: 'Saved from Breaches', 
      color: 'text-green-400' 
    },
    { 
      icon: IoBugOutline, 
      value: `$${(securityMetrics.bountiesPaid / 1000).toFixed(0)}K`, 
      label: 'Bounties Paid', 
      color: 'text-yellow-400' 
    },
    { 
      icon: IoFlashOutline, 
      value: `${securityMetrics.detectionSpeed}ms`, 
      label: 'Detection Speed', 
      color: 'text-blue-400' 
    }
  ]

  const CurrentIcon = mobileMetrics[currentMetricIndex].icon

  return (
    <section className="relative pt-16 sm:pt-20 pb-6 sm:pb-8 overflow-hidden bg-gradient-to-br from-purple-950 via-slate-950 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>
      </div>

      {/* Mobile-Optimized Security Ticker */}
      <div className="relative">
        <div className="bg-purple-900/20 border-y border-purple-500/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            {/* Desktop Version */}
            <div className="hidden sm:flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-purple-400 text-sm font-bold uppercase tracking-wider">Live Security Status</span>
              </div>
              <div className="flex flex-wrap gap-4 lg:gap-6 text-sm">
                {mobileMetrics.map((metric, i) => {
                  const Icon = metric.icon
                  return (
                    <div key={i} className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${metric.color} ${isClient ? 'animate-pulse' : ''}`} />
                      <span className="text-white font-bold">{i === 0 && isClient ? animatedAttacks.toLocaleString() : metric.value}</span>
                      <span className="text-slate-400 hidden lg:inline">{metric.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Mobile Version - Rotating Metrics */}
            <div className="flex sm:hidden items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 bg-purple-500 rounded-full ${isClient ? 'animate-pulse' : ''}`}></div>
                <span className="text-purple-400 text-xs font-bold uppercase">TU-1-A Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CurrentIcon className={`w-4 h-4 ${mobileMetrics[currentMetricIndex].color} ${isClient ? 'animate-pulse' : ''}`} />
                <span className="text-white font-bold text-sm">
                  {currentMetricIndex === 0 && isClient ? animatedAttacks.toLocaleString() : mobileMetrics[currentMetricIndex].value}
                </span>
                <span className="text-slate-400 text-xs">{mobileMetrics[currentMetricIndex].label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="text-center">
          {/* Security Alert Badge - Mobile Optimized */}
          <div className="inline-flex items-center space-x-2 bg-purple-900/30 text-purple-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 border border-purple-500/30 backdrop-blur-sm">
            <IoWarningOutline className={`w-5 sm:w-6 h-5 sm:h-6 ${isClient ? 'animate-pulse' : ''}`} />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              <span className="hidden sm:inline">TU-1-A Standard • Superior to SOC 2 & ISO 27001</span>
              <span className="sm:hidden">TU-1-A Certified</span>
            </span>
          </div>

          {/* Main Headline - Responsive Typography */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight">
            <span className="block sm:inline">Your Platform Faces</span>{' '}
            <br className="hidden sm:block" />
            <span className="text-purple-500 text-4xl sm:text-5xl md:text-6xl lg:text-7xl block mt-2">
              {isClient ? animatedAttacks.toLocaleString() : securityMetrics.attacksBlocked.toLocaleString()} Attacks
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl text-slate-400 mt-2">Every Single Day</span>
          </h1>

          {/* Description - Mobile Optimized */}
          <p className="text-base sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto px-2">
            <span className="block sm:inline">
              While others rely on annual audits and PDF certificates,
            </span>{' '}
            <span className="block mt-2 sm:inline sm:mt-0">
              we validate security <span className="text-purple-400 font-bold">every second</span> through real attacks.
            </span>{' '}
            <span className="block mt-2 sm:inline sm:mt-0">
              <IoShieldCheckmarkOutline className="inline w-5 h-5 text-green-400 mr-1" />
              <span className="text-green-400 font-bold">100% Protection Rate. Zero Breaches Since 2019.</span>
            </span>
          </p>

          {/* Compliance Comparison Box - Mobile Optimized */}
          <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-lg p-4 sm:p-6 max-w-2xl mx-auto mb-6 sm:mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-3 sm:space-y-0">
              <IoAlertCircleOutline className={`w-8 h-8 text-purple-400 ${isClient ? 'animate-pulse' : ''}`} />
              <div className="text-center sm:text-left">
                <p className="text-purple-400 font-bold text-sm sm:text-lg flex items-center justify-center sm:justify-start">
                  <IoTimeOutline className="w-4 h-4 mr-1" />
                  Traditional Compliance vs TU-1-A
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-red-400 text-xs sm:text-sm">SOC 2: Annual Check</p>
                    <p className="text-white text-lg sm:text-xl font-bold">$75,000/year</p>
                  </div>
                  <div>
                    <p className="text-green-400 text-xs sm:text-sm">TU-1-A: Continuous</p>
                    <p className="text-white text-lg sm:text-xl font-bold">Free Forever</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-First Security Indicator */}
          <div className="sm:hidden mb-6">
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
              <p className="text-xs text-purple-400 mb-2">Real-Time Protection</p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${securityMetrics.protectionRate}%` }}
                ></div>
              </div>
              <p className="text-white text-sm font-bold mt-2">{securityMetrics.protectionRate}% Protected</p>
            </div>
          </div>

          {/* Primary CTA - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
            <button
              onClick={onSeeSolution}
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-base sm:text-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <IoShieldCheckmarkOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span>Start TU-1-A Validation</span>
            </button>
            <Link
              href="/security/challenge"
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-lg font-bold text-base sm:text-lg hover:bg-slate-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <IoBugOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span className="hidden sm:inline">Test Our Security</span>
              <span className="sm:hidden">Try to Hack Us</span>
            </Link>
          </div>

          {/* Mobile-Only Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-6 sm:hidden">
            <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
              <p className="text-purple-400 text-2xl font-bold">24/7</p>
              <p className="text-xs text-slate-500">Monitoring</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
              <p className="text-green-400 text-2xl font-bold">0</p>
              <p className="text-xs text-slate-500">Breaches</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
              <p className="text-yellow-400 text-2xl font-bold">$247K</p>
              <p className="text-xs text-slate-500">Bounties</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}