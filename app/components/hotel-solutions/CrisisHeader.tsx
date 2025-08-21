// app/components/hotel-solutions/CrisisHeader.tsx

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoWarningOutline,
  IoSkullOutline,
  IoFlameOutline,
  IoCarOutline,
  IoFlashOutline,
  IoBusinessOutline,
  IoTrendingDownOutline,
  IoTimeOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface CrisisMetrics {
  dailyLoss: number
  totalLoss: number
  missedRides: number
  surgePricing: number
  nuclearVerdicts: number
  californiaDeadline: number
}

interface CrisisHeaderProps {
  crisisMetrics: CrisisMetrics
  onSeeSolution: () => void
}

export default function CrisisHeader({ crisisMetrics, onSeeSolution }: CrisisHeaderProps) {
  const [isClient, setIsClient] = useState(false)
  const [animatedLoss, setAnimatedLoss] = useState(crisisMetrics.dailyLoss)
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Animate the daily loss counter
  useEffect(() => {
    if (!isClient) return
    
    const interval = setInterval(() => {
      setAnimatedLoss(prev => prev + Math.floor(Math.random() * 10) + 1)
    }, 3000)
    
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
    { icon: IoSkullOutline, value: `$${crisisMetrics.nuclearVerdicts}M`, label: 'Nuclear Verdict', color: 'text-red-400' },
    { icon: IoFlameOutline, value: `$${animatedLoss.toLocaleString()}`, label: 'Lost Today', color: 'text-orange-400' },
    { icon: IoCarOutline, value: crisisMetrics.missedRides.toString(), label: 'Missed Rides', color: 'text-yellow-400' },
    { icon: IoWarningOutline, value: `${crisisMetrics.surgePricing}x`, label: 'Surge Now', color: 'text-amber-400' }
  ]

  const CurrentIcon = mobileMetrics[currentMetricIndex].icon

  return (
    <section className="relative pt-16 sm:pt-20 pb-6 sm:pb-8 overflow-hidden bg-gradient-to-br from-red-950 via-slate-950 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>
      </div>

      {/* Mobile-Optimized Crisis Ticker */}
      <div className="relative">
        <div className="bg-red-900/20 border-y border-red-500/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            {/* Desktop Version */}
            <div className="hidden sm:flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Live Industry Crisis</span>
              </div>
              <div className="flex flex-wrap gap-4 lg:gap-6 text-sm">
                {mobileMetrics.map((metric, i) => {
                  const Icon = metric.icon
                  return (
                    <div key={i} className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${metric.color} ${isClient ? 'animate-pulse' : ''}`} />
                      <span className="text-white font-bold">{metric.value}</span>
                      <span className="text-slate-400 hidden lg:inline">{metric.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Mobile Version - Rotating Metrics */}
            <div className="flex sm:hidden items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 bg-red-500 rounded-full ${isClient ? 'animate-pulse' : ''}`}></div>
                <span className="text-red-400 text-xs font-bold uppercase">Crisis Alert</span>
              </div>
              <div className="flex items-center space-x-2">
                <CurrentIcon className={`w-4 h-4 ${mobileMetrics[currentMetricIndex].color} ${isClient ? 'animate-pulse' : ''}`} />
                <span className="text-white font-bold text-sm">{mobileMetrics[currentMetricIndex].value}</span>
                <span className="text-slate-400 text-xs">{mobileMetrics[currentMetricIndex].label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="text-center">
          {/* Nuclear Verdict Warning - Mobile Optimized */}
          <div className="inline-flex items-center space-x-2 bg-red-900/30 text-red-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 border border-red-500/30 backdrop-blur-sm">
            <IoSkullOutline className={`w-5 sm:w-6 h-5 sm:h-6 ${isClient ? 'animate-pulse' : ''}`} />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              <span className="hidden sm:inline">$462 Million Verdict • Your Shuttle is a Bankruptcy Time Bomb</span>
              <span className="sm:hidden">$462M Verdict Risk</span>
            </span>
          </div>

          {/* Main Headline - Responsive Typography */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight">
            <span className="block sm:inline">Your Hotel is</span>{' '}
            <span className="block sm:inline">Hemorrhaging</span>
            <br className="hidden sm:block" />
            <span className="text-red-500 text-4xl sm:text-5xl md:text-6xl lg:text-7xl block mt-2">
              ${isClient ? Math.round(animatedLoss / 24) : Math.round(crisisMetrics.dailyLoss / 24)}/Hour
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl text-slate-400 mt-2">on Transportation</span>
          </h1>

          {/* Description - Mobile Optimized */}
          <p className="text-base sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto px-2">
            <span className="block sm:inline">
              While you operate money-losing shuttles with catastrophic liability,
            </span>{' '}
            <span className="block mt-2 sm:inline sm:mt-0">
              your competitors are earning <span className="text-green-400 font-bold whitespace-nowrap">$67,000/month</span> with our platform.
            </span>{' '}
            <span className="block mt-2 sm:inline sm:mt-0">
              <IoTrendingDownOutline className="inline w-5 h-5 text-amber-400 mr-1" />
              <span className="text-amber-400 font-bold">Every day costs you $2,847.</span>
            </span>
          </p>

          {/* Compliance Countdown - Mobile Optimized */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 sm:p-6 max-w-2xl mx-auto mb-6 sm:mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-3 sm:space-y-0">
              <IoWarningOutline className={`w-8 h-8 text-amber-400 ${isClient ? 'animate-pulse' : ''}`} />
              <div className="text-center sm:text-left">
                <p className="text-amber-400 font-bold text-sm sm:text-lg flex items-center justify-center sm:justify-start">
                  <IoTimeOutline className="w-4 h-4 mr-1" />
                  California Compliance Deadline
                </p>
                <p className="text-white text-2xl sm:text-3xl font-black">
                  {crisisMetrics.californiaDeadline} Days
                </p>
                <p className="text-slate-400 text-xs sm:text-sm flex items-center justify-center sm:justify-start">
                  <IoAlertCircleOutline className="w-3 h-3 mr-1" />
                  $500K penalties for non-compliance
                </p>
              </div>
            </div>
          </div>

          {/* Mobile-First Progress Indicator */}
          <div className="sm:hidden mb-6">
            <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/20">
              <p className="text-xs text-red-400 mb-2">Crisis Impact Today</p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: isClient ? `${Math.min((animatedLoss / 100000) * 100, 100)}%` : '0%' }}
                ></div>
              </div>
              <p className="text-white text-sm font-bold mt-2">${isClient ? animatedLoss.toLocaleString() : crisisMetrics.dailyLoss.toLocaleString()} lost</p>
            </div>
          </div>

          {/* Primary CTA - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
            <button
              onClick={onSeeSolution}
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-base sm:text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <IoFlashOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span>See the Solution</span>
            </button>
            <Link
              href="/portal/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-lg font-bold text-base sm:text-lg hover:bg-slate-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <IoBusinessOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span className="hidden sm:inline">Check Your Hotel Status</span>
              <span className="sm:hidden">Check Status</span>
            </Link>
          </div>

          {/* Mobile-Only Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-6 sm:hidden">
            <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
              <p className="text-red-400 text-2xl font-bold">24/7</p>
              <p className="text-xs text-slate-500">Loss Rate</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
              <p className="text-amber-400 text-2xl font-bold">94%</p>
              <p className="text-xs text-slate-500">At Risk</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
              <p className="text-green-400 text-2xl font-bold">15m</p>
              <p className="text-xs text-slate-500">To Fix</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}