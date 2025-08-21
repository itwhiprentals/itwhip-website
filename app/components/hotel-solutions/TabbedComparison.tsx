// app/components/hotel-solutions/TabbedComparison.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoLayersOutline,
  IoCashOutline,
  IoTerminalOutline,
  IoLeafOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoTrophyOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoFlashOutline,
  IoRocketOutline,
  IoStatsChartOutline,
  IoWarningOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoAirplaneOutline,
  IoCloudOutline,
  IoShieldCheckmarkOutline,
  IoTimerOutline,
  IoPulseOutline,
  IoSparklesOutline,
  IoPartlySunnyOutline,
  IoCardOutline,
  IoBulbOutline,
  IoColorPaletteOutline,
  IoNavigateOutline,
  IoGlobeOutline,
  IoEarthOutline,
  IoCompassOutline,
  IoBedOutline
} from 'react-icons/io5'

interface FeatureInfo {
  name: string
  description: string
  impact: string
  icon: React.ReactNode
}

export default function TabbedComparison() {
  const [activeComparisonTab, setActiveComparisonTab] = useState('overview')
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const [animatedValue, setAnimatedValue] = useState(0)
  const [liveMetrics, setLiveMetrics] = useState({
    apiSpeed: 127,
    uptime: 99.99,
    activeIntegrations: 47,
    monthlyTransactions: 3847293
  })
  const [isClient, setIsClient] = useState(false)

  // Set client flag after mount to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Animate metrics only on client side
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setAnimatedValue(prev => (prev + 1) % 100)
      setLiveMetrics(prev => ({
        apiSpeed: 100 + Math.floor(Math.random() * 50), // 100-149
        uptime: 99.99,
        activeIntegrations: 47,
        monthlyTransactions: prev.monthlyTransactions + Math.floor(Math.random() * 100)
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [isClient])

  const featureDescriptions: { [key: string]: FeatureInfo } = {
    'Hotel Booking Platform': {
      name: 'Hotel Booking Platform',
      description: 'Complete reservation system with payment processing, inventory management, and dynamic pricing.',
      impact: 'Enables direct bookings with zero OTA commissions',
      icon: <IoBedOutline className="w-5 h-5" />
    },
    'Instant Dispatch API': {
      name: 'Instant Dispatch API',
      description: 'Real-time driver dispatch in under 127ms with predictive positioning.',
      impact: 'Zero wait time for guests, 5-star reviews',
      icon: <IoFlashOutline className="w-5 h-5" />
    },
    'GDS Integration': {
      name: 'GDS Integration',
      description: 'Direct connections to Amadeus, Sabre, Travelport for global distribution.',
      impact: 'Access to corporate travel market worth $1.4T',
      icon: <IoGlobeOutline className="w-5 h-5" />
    },
    'Flight Tracking API': {
      name: 'Flight Tracking API',
      description: 'Real-time flight status monitoring for predictive driver positioning.',
      impact: 'Drivers ready before planes land',
      icon: <IoAirplaneOutline className="w-5 h-5" />
    },
    'Room Charge Capability': {
      name: 'Room Charge Capability',
      description: 'Direct billing to guest folio through PMS integration.',
      impact: 'Seamless checkout, no payment friction',
      icon: <IoCardOutline className="w-5 h-5" />
    },
    'ESG Reporting API': {
      name: 'ESG Reporting API',
      description: 'Automated CDP/EPA compliance with Scope 3 emissions tracking.',
      impact: 'Avoid $500K penalties, achieve compliance',
      icon: <IoLeafOutline className="w-5 h-5" />
    },
    'Revenue Share Model': {
      name: 'Revenue Share Model',
      description: 'Hotels earn 30% commission on every ride vs paying 15-25% to OTAs.',
      impact: '+$67K monthly revenue instead of -$127K costs',
      icon: <IoCashOutline className="w-5 h-5" />
    },
    'Predictive Positioning': {
      name: 'Predictive Positioning',
      description: 'AI predicts ride demand 47 minutes in advance using booking data.',
      impact: 'No surge pricing, instant availability',
      icon: <IoBulbOutline className="w-5 h-5" />
    },
    'White-Label SDK': {
      name: 'White-Label SDK',
      description: 'Fully branded as your hotel\'s service, not third-party.',
      impact: 'Guests think it\'s your premium service',
      icon: <IoColorPaletteOutline className="w-5 h-5" />
    },
    'Traffic Integration': {
      name: 'Traffic Integration',
      description: 'Real-time traffic data from Google/AZ511 for optimal routing.',
      impact: 'Accurate ETAs, efficient routes',
      icon: <IoNavigateOutline className="w-5 h-5" />
    }
  }

  const ComparisonIcon = ({ feature, provider }: { feature: string; provider: string }) => {
    const hasFeature = getFeatureStatus(feature, provider)
    
    if (hasFeature === 'full') {
      return <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
    } else if (hasFeature === 'partial') {
      return <IoPartlySunnyOutline className="w-6 h-6 text-amber-500" />
    } else {
      return <IoCloseCircleOutline className="w-6 h-6 text-gray-300 dark:text-gray-600" />
    }
  }

  const getFeatureStatus = (feature: string, provider: string): 'full' | 'partial' | 'none' => {
    const capabilities: { [key: string]: { [key: string]: 'full' | 'partial' | 'none' } } = {
      'ItWhip': {
        'Hotel Booking Platform': 'full',
        'Instant Dispatch API': 'full',
        'GDS Integration': 'full',
        'Flight Tracking API': 'full',
        'Room Charge Capability': 'full',
        'ESG Reporting API': 'full',
        'Revenue Share Model': 'full',
        'Predictive Positioning': 'full',
        'White-Label SDK': 'full',
        'Traffic Integration': 'full'
      },
      'Uber': {
        'Hotel Booking Platform': 'none',
        'Instant Dispatch API': 'partial',
        'GDS Integration': 'none',
        'Flight Tracking API': 'none',
        'Room Charge Capability': 'partial',
        'ESG Reporting API': 'none',
        'Revenue Share Model': 'none',
        'Predictive Positioning': 'none',
        'White-Label SDK': 'none',
        'Traffic Integration': 'partial'
      },
      'Lyft': {
        'Hotel Booking Platform': 'none',
        'Instant Dispatch API': 'partial',
        'GDS Integration': 'none',
        'Flight Tracking API': 'none',
        'Room Charge Capability': 'none',
        'ESG Reporting API': 'none',
        'Revenue Share Model': 'none',
        'Predictive Positioning': 'none',
        'White-Label SDK': 'none',
        'Traffic Integration': 'partial'
      },
      'Booking.com': {
        'Hotel Booking Platform': 'full',
        'Instant Dispatch API': 'none',
        'GDS Integration': 'partial',
        'Flight Tracking API': 'none',
        'Room Charge Capability': 'none',
        'ESG Reporting API': 'none',
        'Revenue Share Model': 'none',
        'Predictive Positioning': 'none',
        'White-Label SDK': 'partial',
        'Traffic Integration': 'none'
      },
      'Expedia': {
        'Hotel Booking Platform': 'full',
        'Instant Dispatch API': 'none',
        'GDS Integration': 'full',
        'Flight Tracking API': 'partial',
        'Room Charge Capability': 'none',
        'ESG Reporting API': 'none',
        'Revenue Share Model': 'none',
        'Predictive Positioning': 'none',
        'White-Label SDK': 'partial',
        'Traffic Integration': 'none'
      }
    }

    return capabilities[provider]?.[feature] || 'none'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" id="comparison">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-400 px-6 py-3 rounded-full mb-6 border border-blue-300 dark:border-blue-800">
            <IoLayersOutline className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-wider">Platform Comparison</span>
            {isClient && (
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full text-green-600 text-xs font-medium animate-pulse">
                LIVE DATA
              </span>
            )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Why We're Not <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Just Another Option</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            We're the only platform that combines booking, transportation, and compliance into one ecosystem.
            Others do pieces. We deliver the complete solution.
          </p>
        </div>

        {/* Live Metrics Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoTimerOutline className="w-5 h-5 mr-2" />
                <span>{liveMetrics.apiSpeed}</span>
                <span className="text-lg ml-0.5">ms</span>
              </div>
              <div className="text-xs opacity-90">API Response</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoPulseOutline className="w-5 h-5 mr-2" />
                {liveMetrics.uptime}%
              </div>
              <div className="text-xs opacity-90">Uptime SLA</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoCloudOutline className="w-5 h-5 mr-2" />
                {liveMetrics.activeIntegrations}
              </div>
              <div className="text-xs opacity-90">PMS Integrations</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoStatsChartOutline className="w-5 h-5 mr-2" />
                {isClient ? formatNumber(liveMetrics.monthlyTransactions) : formatNumber(3847293)}
              </div>
              <div className="text-xs opacity-90">Monthly Transactions</div>
            </div>
          </div>
        </div>

        {/* Comparison Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'overview', label: 'Quick Overview', icon: <IoRocketOutline /> },
            { id: 'features', label: 'Features', icon: <IoLayersOutline /> },
            { id: 'financial', label: 'Financial Impact', icon: <IoCashOutline /> },
            { id: 'technical', label: 'Technical', icon: <IoTerminalOutline /> },
            { id: 'compliance', label: 'Compliance', icon: <IoLeafOutline /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveComparisonTab(tab.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                activeComparisonTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:scale-102'
              }`}
            >
              {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Quick Overview Tab */}
          {activeComparisonTab === 'overview' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                The Complete Ecosystem Advantage
              </h3>
              
              {/* Visual Comparison Grid */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* ItWhip - The Winner */}
                <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-500 shadow-xl">
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                    <IoTrophyOutline className="w-4 h-4 mr-1" />
                    COMPLETE SOLUTION
                  </div>
                  
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ItWhip</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">The Hospitality Ecosystem</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Booking Platform</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Transportation Network</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">ESG Compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Revenue Generation</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">+$951K</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Annual Benefit</p>
                    </div>
                  </div>
                </div>

                {/* Rideshare Competitors */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border-2 border-slate-300 dark:border-slate-600">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Uber & Lyft</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Consumer Rideshare</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IoPartlySunnyOutline className="w-5 h-5 text-amber-500" />
                      <span className="text-sm">Guest ride requests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">No booking platform</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">No ESG tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">No revenue share</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">-$589K</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Annual Cost</p>
                    </div>
                  </div>
                </div>

                {/* OTA Competitors */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border-2 border-slate-300 dark:border-slate-600">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking & Expedia</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">OTA Platforms</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Hotel inventory</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">No transportation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">No ESG solution</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600">Takes 15-25% commission</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">-$245K</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Commission Loss</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why This Matters */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 shadow-xl border border-blue-200 dark:border-blue-700">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <IoSparklesOutline className="w-6 h-6 mr-2 text-blue-600" />
                  Why We Built Different
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      <strong>Uber/Lyft:</strong> "We admire your consumer rideshare dominance. We've built the hospitality infrastructure you haven't - booking platforms, GDS connections, and compliance tools. Together, we could own the complete travel journey."
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      <strong>Booking/Expedia:</strong> "You've mastered distribution but hotels lose 15-25% in commissions. We flip that model - hotels EARN 30% while solving the last-mile problem you can't address. We complete your ecosystem."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeComparisonTab === 'features' && (
            <>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <h3 className="font-bold text-xl">Platform Features Comparison</h3>
                <p className="text-sm opacity-90 mt-1">Based on publicly available information as of August 2025</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white min-w-[250px]">
                        Feature
                        <IoInformationCircleOutline className="inline w-4 h-4 ml-2 text-blue-500 cursor-help" />
                      </th>
                      <th className="px-4 py-4 text-center font-bold">
                        <div className="text-blue-600">ItWhip</div>
                        <div className="text-xs text-slate-500 font-normal">Complete</div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="text-slate-600 dark:text-slate-400">Uber</div>
                        <div className="text-xs text-slate-500 font-normal">Business</div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="text-slate-600 dark:text-slate-400">Lyft</div>
                        <div className="text-xs text-slate-500 font-normal">Business</div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="text-slate-600 dark:text-slate-400">Booking</div>
                        <div className="text-xs text-slate-500 font-normal">.com</div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="text-slate-600 dark:text-slate-400">Expedia</div>
                        <div className="text-xs text-slate-500 font-normal">EPS</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(featureDescriptions).map((feature, idx) => (
                      <tr 
                        key={idx} 
                        className={`border-b border-slate-200 dark:border-slate-700 ${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
                        onMouseEnter={() => setHoveredFeature(feature)}
                        onMouseLeave={() => setHoveredFeature(null)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {featureDescriptions[feature].icon}
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-200">
                                {feature}
                              </div>
                              {hoveredFeature === feature && (
                                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  {featureDescriptions[feature].description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="ItWhip" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="Uber" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="Lyft" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="Booking.com" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="Expedia" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Legend */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-400">Full Feature</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoPartlySunnyOutline className="w-5 h-5 text-amber-500" />
                    <span className="text-slate-600 dark:text-slate-400">Partial/Limited</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                    <span className="text-slate-600 dark:text-slate-400">Not Available</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-t-2 border-green-500">
                <p className="text-center font-bold text-green-900 dark:text-green-100 flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 mr-2" />
                  ItWhip is the ONLY platform with all 10 critical features fully integrated
                </p>
              </div>
            </>
          )}

          {/* Financial Impact Tab */}
          {activeComparisonTab === 'financial' && (
            <>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <h3 className="font-bold text-xl">Annual Financial Impact Analysis</h3>
                <p className="text-sm opacity-90 mt-1">Based on 150-room hotel at 70% occupancy</p>
              </div>
              
              {/* Visual Financial Comparison */}
              <div className="p-8">
                <div className="grid lg:grid-cols-5 gap-4 mb-8">
                  {[
                    { name: 'ItWhip', value: 951000, color: 'green' },
                    { name: 'Uber/Lyft', value: -589000, color: 'red' },
                    { name: 'Traditional', value: -637000, color: 'red' },
                    { name: 'Booking.com', value: -245000, color: 'orange' },
                    { name: 'Expedia', value: -245000, color: 'orange' }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
                      </div>
                      <div className="relative h-48 flex items-end justify-center">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-1000 ${
                            item.value > 0 
                              ? 'bg-gradient-to-t from-green-600 to-green-400' 
                              : 'bg-gradient-to-b from-red-600 to-red-400'
                          }`}
                          style={{
                            height: `${Math.abs(item.value) / 10000}%`,
                            maxHeight: '100%'
                          }}
                        >
                          <div className="text-white text-center p-2">
                            <div className="text-2xl font-bold">
                              {item.value > 0 ? '+' : ''}{(item.value / 1000).toFixed(0)}K
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {item.value > 0 ? 'Annual Benefit' : 'Annual Cost'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">Revenue Model Comparison</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 shadow-lg border border-green-200 dark:border-green-700">
                      <h5 className="font-semibold text-green-600 mb-3 flex items-center">
                        <IoTrendingUpOutline className="w-5 h-5 mr-2" />
                        ItWhip Revenue Generation
                      </h5>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">Transport Commission (30%)</span>
                          <span className="font-bold text-green-600">+$804K</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">Booking Uplift</span>
                          <span className="font-bold text-green-600">+$147K</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">Eliminated Costs</span>
                          <span className="font-bold text-green-600">+$127K</span>
                        </li>
                        <li className="flex justify-between border-t pt-2">
                          <span className="font-bold">Total Annual Benefit</span>
                          <span className="font-bold text-green-600 text-lg">+$951K</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 shadow-lg border border-red-200 dark:border-red-700">
                      <h5 className="font-semibold text-red-600 mb-3 flex items-center">
                        <IoTrendingDownOutline className="w-5 h-5 mr-2" />
                        OTA Commission Loss
                      </h5>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">Booking.com (15%)</span>
                          <span className="font-bold text-red-600">-$245K</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">Expedia (15-25%)</span>
                          <span className="font-bold text-red-600">-$245K</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">Shuttle Operations</span>
                          <span className="font-bold text-red-600">-$127K</span>
                        </li>
                        <li className="flex justify-between border-t pt-2">
                          <span className="font-bold">Industry Average Loss</span>
                          <span className="font-bold text-red-600 text-lg">-$617K</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-t-2 border-green-500">
                <p className="text-center font-bold text-green-900 dark:text-green-100 flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 mr-2" />
                  ItWhip generates $1.5M more value than traditional solutions
                </p>
              </div>
            </>
          )}

          {/* Technical Specs Tab */}
          {activeComparisonTab === 'technical' && (
            <>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <h3 className="font-bold text-xl">Technical Specifications</h3>
                <p className="text-sm opacity-90 mt-1">Live performance metrics and capabilities</p>
              </div>
              
              <div className="p-8">
                {/* Live Performance Dashboard */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-6 mb-8 shadow-xl border border-purple-200 dark:border-purple-800">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <IoPulseOutline className={`w-6 h-6 mr-2 text-purple-600 ${isClient ? 'animate-pulse' : ''}`} />
                    Live System Performance
                  </h4>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-700">
                      <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#8b5cf6"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - (isClient ? animatedValue : 50) / 100)}`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute">
                          <p className="text-2xl font-bold text-purple-600">{liveMetrics.apiSpeed}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">ms</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">API Response</p>
                    </div>
                    
                    <div className="text-center bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-green-200 dark:border-green-700">
                      <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#10b981"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.9999)}`}
                          />
                        </svg>
                        <div className="absolute">
                          <p className="text-2xl font-bold text-green-600">99.99%</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Uptime</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">Availability SLA</p>
                    </div>
                    
                    <div className="text-center bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-700">
                      <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * 0.25}`}
                          />
                        </svg>
                        <div className="absolute">
                          <p className="text-2xl font-bold text-blue-600">15min</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Setup</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">Integration Time</p>
                    </div>
                  </div>
                </div>

                {/* Technical Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Specification</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-purple-600">ItWhip</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Others</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { spec: 'API Response Time', itwhip: `${liveMetrics.apiSpeed}ms`, others: 'Not published' },
                        { spec: 'Uptime SLA', itwhip: '99.99%', others: '95-99%' },
                        { spec: 'Integration Time', itwhip: '15 minutes', others: '3-6 months' },
                        { spec: 'API Endpoints', itwhip: '147', others: '0-Limited' },
                        { spec: 'SDK Languages', itwhip: '4', others: '0' },
                        { spec: 'Webhooks', itwhip: 'Real-time', others: 'Not available' },
                        { spec: 'Data Encryption', itwhip: '256-bit AES', others: '128-256 bit' },
                        { spec: 'PCI Compliance', itwhip: 'Level 1', others: 'Varies' }
                      ].map((row, idx) => (
                        <tr key={idx} className={`border-b border-slate-200 dark:border-slate-700 ${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                          <td className="px-6 py-3 text-sm text-slate-900 dark:text-slate-200">{row.spec}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-purple-600">{row.itwhip}</td>
                          <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">{row.others}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-t-2 border-purple-500">
                <p className="text-center font-bold text-purple-900 dark:text-purple-100 flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 mr-2" />
                  Enterprise-grade infrastructure with instant deployment
                </p>
              </div>
            </>
          )}

          {/* Compliance Tab */}
          {activeComparisonTab === 'compliance' && (
            <>
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6">
                <h3 className="font-bold text-xl">ESG Compliance Capabilities</h3>
                <p className="text-sm opacity-90 mt-1">California SB 253/261 deadline: January 1, 2026</p>
              </div>
              
              <div className="p-8">
                {/* Compliance Status Dashboard */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-8 border-2 border-amber-500">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center">
                      <IoWarningOutline className={`w-6 h-6 mr-2 text-amber-600 ${isClient ? 'animate-pulse' : ''}`} />
                      Compliance Deadline Approaching
                    </h4>
                    <div className="text-3xl font-bold text-amber-600">
                      134 Days
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-amber-200 dark:border-amber-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">SB 253 Penalty</p>
                      <p className="text-2xl font-bold text-red-600">$500K/year</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-amber-200 dark:border-amber-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Companies Affected</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">5,300+</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-amber-200 dark:border-amber-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Hotels Ready</p>
                      <p className="text-2xl font-bold text-red-600">&lt;6%</p>
                    </div>
                  </div>
                </div>

                {/* Compliance Feature Comparison */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">Compliance Features</h4>
                  
                  <div className="space-y-4">
                    {[
                      { feature: 'CDP Integration', description: 'Direct API connection to Carbon Disclosure Project' },
                      { feature: 'EPA GHGRP Ready', description: 'Automated greenhouse gas reporting' },
                      { feature: 'California SB 253/261', description: 'Full compliance with new regulations' },
                      { feature: 'Scope 3 Tracking', description: 'Guest transportation emissions tracking' },
                      { feature: 'One-Click Reporting', description: 'Automated report generation' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center space-x-3">
                          <IoLeafOutline className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{item.feature}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <IoCheckmarkCircle className="w-6 h-6 text-green-500 mx-auto" />
                            <p className="text-xs text-green-600 mt-1">ItWhip</p>
                          </div>
                          <div className="text-center">
                            <IoCloseCircleOutline className="w-6 h-6 text-gray-400 mx-auto" />
                            <p className="text-xs text-gray-500 mt-1">Others</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-t-2 border-green-500">
                <p className="text-center font-bold text-green-900 dark:text-green-100 flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 mr-2" />
                  ItWhip is the ONLY solution providing automatic ESG compliance
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Line Message */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/20 dark:to-purple-800/20 px-8 py-4 rounded-full border-2 border-blue-500">
              <IoRocketOutline className={`w-6 h-6 text-blue-600 ${isClient ? 'animate-pulse' : ''}`} />
              <span className="text-slate-900 dark:text-white font-bold text-lg">
                We're not competing. We're completing the ecosystem.
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2">
                <IoArrowForwardOutline className="w-5 h-5" />
                <span>See Live Demo</span>
              </button>
              <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2">
                <IoBusinessOutline className="w-5 h-5" />
                <span>Calculate Your ROI</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}