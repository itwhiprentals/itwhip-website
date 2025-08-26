// app/components/certification/CertificationHero.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { IoShieldCheckmark, IoWarning, IoTrendingUp, IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5'
import Link from 'next/link'

interface LiveMetrics {
  attacksBlocked: number
  attacksThisMinute: number
  hotelsProtected: number
  revenueGenerated: number
  complianceSaved: number
  breachCount: number
  uptime: number
  certificationsToday: number
}

export function CertificationHero() {
  // Live metrics that update in real-time
  const [metrics, setMetrics] = useState<LiveMetrics>({
    attacksBlocked: 48291,
    attacksThisMinute: 23,
    hotelsProtected: 47,
    revenueGenerated: 2340000,
    complianceSaved: 8460000,
    breachCount: 0,
    uptime: 99.99,
    certificationsToday: 3
  })

  // Counter for money lost while reading
  const [moneyLostCounter, setMoneyLostCounter] = useState(0)
  const [timeOnPage, setTimeOnPage] = useState(0)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 5),
        attacksThisMinute: Math.floor(Math.random() * 50) + 10,
        revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 1000),
        certificationsToday: prev.certificationsToday + (Math.random() > 0.98 ? 1 : 0)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Money lost counter (average hotel loses $493/hour without protection)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage(prev => prev + 1)
      setMoneyLostCounter(prev => prev + 8.22) // $493/hour = $8.22/minute
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num}`
  }

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toLocaleString()
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pt-32 pb-20">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Animated threat particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alert Banner */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 backdrop-blur-sm">
            <IoAlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-sm text-red-400">
              <strong>{metrics.attacksThisMinute}</strong> attacks blocked in the last minute
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Compliance Monopoly
            </span>
            <br />
            Is Already Here
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            One certification that <span className="text-green-400 font-semibold">makes money</span> instead 
            of costing money. While others pay $180K/year for compliance, 
            our hotels <span className="text-green-400 font-semibold">earn $300K/year</span>.
          </p>

          {/* Verification Badge */}
          <div className="flex justify-center mb-8">
            <Link href="/verify/itwhip" className="group">
              <div className="flex items-center space-x-3 bg-green-500/10 border border-green-500/30 rounded-lg px-6 py-3 hover:bg-green-500/20 transition-all">
                <IoShieldCheckmark className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <p className="text-xs text-green-400 uppercase tracking-wide">Verified Security</p>
                  <p className="text-lg font-bold text-white">{metrics.breachCount} Breaches</p>
                </div>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                  Click to verify →
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Attacks Blocked */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Attacks Blocked</p>
                <IoWarning className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white">{formatCount(metrics.attacksBlocked)}</p>
              <p className="text-xs text-green-400 mt-1">+{metrics.attacksThisMinute} this minute</p>
            </div>
          </div>

          {/* Revenue Generated */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Hotels Earning</p>
                <IoTrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{formatNumber(metrics.revenueGenerated)}</p>
              <p className="text-xs text-green-400 mt-1">This month</p>
            </div>
          </div>

          {/* Compliance Saved */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Compliance Saved</p>
                <IoCheckmarkCircle className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{formatNumber(metrics.complianceSaved)}</p>
              <p className="text-xs text-purple-400 mt-1">Total saved</p>
            </div>
          </div>

          {/* Hotels Protected */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Hotels Protected</p>
                <IoShieldCheckmark className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.hotelsProtected}</p>
              <p className="text-xs text-blue-400 mt-1">+{metrics.certificationsToday} today</p>
            </div>
          </div>
        </div>

        {/* Money Lost While Reading */}
        <div className="text-center mb-12">
          <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-lg px-6 py-4">
            <p className="text-sm text-red-400 mb-1">While you've been reading this...</p>
            <p className="text-2xl font-bold text-white">
              Hotels without TU certification lost{' '}
              <span className="text-red-400">${moneyLostCounter.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Average hotel loses $493/hour without proper security & compliance
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:scale-105"
          >
            <span className="relative z-10">Calculate My ROI</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </button>
          
          <button 
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-bold text-white hover:bg-white/20 transition-all"
          >
            See Live Dashboard
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <IoCheckmarkCircle className="w-5 h-5 text-green-400" />
            <span>{metrics.uptime}% Uptime</span>
          </div>
          <div className="flex items-center space-x-2">
            <IoCheckmarkCircle className="w-5 h-5 text-green-400" />
            <span>SOC 2 Replacement</span>
          </div>
          <div className="flex items-center space-x-2">
            <IoCheckmarkCircle className="w-5 h-5 text-green-400" />
            <span>ISO 27001 Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <IoCheckmarkCircle className="w-5 h-5 text-green-400" />
            <span>15-min Setup</span>
          </div>
        </div>
      </div>
    </section>
  )
}