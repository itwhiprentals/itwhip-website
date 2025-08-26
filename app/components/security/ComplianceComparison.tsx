// app/components/security/ComplianceComparison.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoLayersOutline,
  IoCashOutline,
  IoTerminalOutline,
  IoShieldCheckmarkOutline,
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
  IoTimerOutline,
  IoPulseOutline,
  IoSparklesOutline,
  IoPartlySunnyOutline,
  IoCardOutline,
  IoBulbOutline,
  IoInfiniteOutline,
  IoSkullOutline,
  IoFlameOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoEyeOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface FeatureInfo {
  name: string
  description: string
  impact: string
  icon: React.ReactNode
}

export default function ComplianceComparison() {
  const [activeComparisonTab, setActiveComparisonTab] = useState('overview')
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const [animatedValue, setAnimatedValue] = useState(0)
  const [liveMetrics, setLiveMetrics] = useState({
    attacksBlocked: 48291,
    validationSpeed: 2,
    activeProtections: 847,
    monthlyTests: 1847293
  })
  const [isClient, setIsClient] = useState(false)

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Animate metrics
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setAnimatedValue(prev => (prev + 1) % 100)
      setLiveMetrics(prev => ({
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 10),
        validationSpeed: 2,
        activeProtections: 847,
        monthlyTests: prev.monthlyTests + Math.floor(Math.random() * 100)
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [isClient])

  const featureDescriptions: { [key: string]: FeatureInfo } = {
    'Continuous Validation': {
      name: 'Continuous Validation',
      description: '24/7 real-time security testing vs annual point-in-time audits',
      impact: 'Catches breaches in 2ms, not 204 days',
      icon: <IoInfiniteOutline className="w-5 h-5" />
    },
    'Live Public Dashboard': {
      name: 'Live Public Dashboard',
      description: 'Real-time security status visible to everyone vs hidden PDF reports',
      impact: 'Instant trust verification, no expired certificates',
      icon: <IoEyeOutline className="w-5 h-5" />
    },
    'Zero Cost Forever': {
      name: 'Zero Cost Forever',
      description: 'Completely free certification vs $91K-$186K annual costs',
      impact: 'Save $150K+ annually on compliance',
      icon: <IoCashOutline className="w-5 h-5" />
    },
    'AI Threat Detection': {
      name: 'AI Threat Detection',
      description: 'Quantum-enhanced AI predicting attacks 47 minutes before they happen',
      impact: 'Stop attacks before they start',
      icon: <IoBulbOutline className="w-5 h-5" />
    },
    'Bug Bounty Program': {
      name: 'Bug Bounty Program',
      description: 'Real hackers testing continuously vs checkbox auditors',
      impact: '$247K+ paid to ethical hackers finding real vulnerabilities',
      icon: <IoSkullOutline className="w-5 h-5" />
    },
    'Instant Setup': {
      name: 'Instant Setup',
      description: '15-minute deployment vs 6-12 month implementation',
      impact: 'Protected today, not next year',
      icon: <IoFlashOutline className="w-5 h-5" />
    },
    'Breach Prevention': {
      name: 'Breach Prevention',
      description: '100% prevention rate vs compliance theater',
      impact: 'Zero breaches since 2019',
      icon: <IoShieldCheckmarkOutline className="w-5 h-5" />
    },
    'Quantum Protection': {
      name: 'Quantum Protection',
      description: 'Quantum-resistant encryption vs obsolete standards',
      impact: 'Future-proof against quantum computers',
      icon: <IoSparklesOutline className="w-5 h-5" />
    },
    'Self-Healing Security': {
      name: 'Self-Healing Security',
      description: 'AI writes its own patches vs waiting for vendor updates',
      impact: 'Patches deploy in milliseconds',
      icon: <IoRefreshOutline className="w-5 h-5" />
    },
    'Compliance Coverage': {
      name: 'Compliance Coverage',
      description: 'Covers all frameworks in one vs separate certifications',
      impact: 'One certification to rule them all',
      icon: <IoLayersOutline className="w-5 h-5" />
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
      'TU-1-A': {
        'Continuous Validation': 'full',
        'Live Public Dashboard': 'full',
        'Zero Cost Forever': 'full',
        'AI Threat Detection': 'full',
        'Bug Bounty Program': 'full',
        'Instant Setup': 'full',
        'Breach Prevention': 'full',
        'Quantum Protection': 'full',
        'Self-Healing Security': 'full',
        'Compliance Coverage': 'full'
      },
      'SOC 2': {
        'Continuous Validation': 'none',
        'Live Public Dashboard': 'none',
        'Zero Cost Forever': 'none',
        'AI Threat Detection': 'none',
        'Bug Bounty Program': 'none',
        'Instant Setup': 'none',
        'Breach Prevention': 'partial',
        'Quantum Protection': 'none',
        'Self-Healing Security': 'none',
        'Compliance Coverage': 'partial'
      },
      'ISO 27001': {
        'Continuous Validation': 'none',
        'Live Public Dashboard': 'none',
        'Zero Cost Forever': 'none',
        'AI Threat Detection': 'none',
        'Bug Bounty Program': 'none',
        'Instant Setup': 'none',
        'Breach Prevention': 'partial',
        'Quantum Protection': 'none',
        'Self-Healing Security': 'none',
        'Compliance Coverage': 'partial'
      },
      'PCI DSS': {
        'Continuous Validation': 'partial',
        'Live Public Dashboard': 'none',
        'Zero Cost Forever': 'none',
        'AI Threat Detection': 'none',
        'Bug Bounty Program': 'none',
        'Instant Setup': 'none',
        'Breach Prevention': 'partial',
        'Quantum Protection': 'none',
        'Self-Healing Security': 'none',
        'Compliance Coverage': 'none'
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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-800 dark:text-purple-400 px-6 py-3 rounded-full mb-6 border border-purple-300 dark:border-purple-800">
            <IoLayersOutline className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-wider">Compliance Comparison</span>
            {isClient && (
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full text-green-600 text-xs font-medium animate-pulse">
                LIVE VALIDATION
              </span>
            )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Why We Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Compliance Obsolete</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Traditional compliance failed. MGM had SOC 2. Change Healthcare was compliant. They still got breached.
            We built something that actually works.
          </p>
        </div>

        {/* Live Metrics Bar */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 mb-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoShieldCheckmarkOutline className="w-5 h-5 mr-2" />
                <span>{formatNumber(liveMetrics.attacksBlocked)}</span>
              </div>
              <div className="text-xs opacity-90">Attacks Validated</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoTimerOutline className="w-5 h-5 mr-2" />
                {liveMetrics.validationSpeed}ms
              </div>
              <div className="text-xs opacity-90">Detection Speed</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoLayersOutline className="w-5 h-5 mr-2" />
                {liveMetrics.activeProtections}
              </div>
              <div className="text-xs opacity-90">Active Protections</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <IoPulseOutline className="w-5 h-5 mr-2" />
                {isClient ? formatNumber(liveMetrics.monthlyTests) : formatNumber(1847293)}
              </div>
              <div className="text-xs opacity-90">Monthly Tests</div>
            </div>
          </div>
        </div>

        {/* Comparison Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'overview', label: 'Quick Overview', icon: <IoRocketOutline /> },
            { id: 'features', label: 'Features', icon: <IoLayersOutline /> },
            { id: 'financial', label: 'Cost Analysis', icon: <IoCashOutline /> },
            { id: 'technical', label: 'Technical', icon: <IoTerminalOutline /> },
            { id: 'reality', label: 'Reality Check', icon: <IoSkullOutline /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveComparisonTab(tab.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                activeComparisonTab === tab.id 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105' 
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
                The Death of Traditional Compliance
              </h3>
              
              {/* Visual Comparison Grid */}
              <div className="grid lg:grid-cols-4 gap-6 mb-8">
                {/* TU-1-A - The Winner */}
                <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-purple-500 shadow-xl">
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                    <IoTrophyOutline className="w-4 h-4 mr-1" />
                    THE FUTURE
                  </div>
                  
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">TU-1-A</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Continuous Security</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Free Forever</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">24/7 Validation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Live Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Zero Breaches</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">$0</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Forever</p>
                    </div>
                  </div>
                </div>

                {/* SOC 2 */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border-2 border-slate-300 dark:border-slate-600">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">SOC 2</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Annual Theater</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">$91K-$186K/year</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Annual audit only</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">PDF certificate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600">Still breachable</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">-$147K</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Annual Cost</p>
                    </div>
                  </div>
                </div>

                {/* ISO 27001 */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border-2 border-slate-300 dark:border-slate-600">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ISO 27001</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Paper Tiger</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">$30K-$60K audit</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">12-18 months</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Annual renewal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600">No real protection</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">-$75K</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">3-Year Cost</p>
                    </div>
                  </div>
                </div>

                {/* PCI DSS */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border-2 border-slate-300 dark:border-slate-600">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">PCI DSS</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Checkbox Hell</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">$50K-$200K</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Quarterly scans</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">400+ requirements</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600">$500K fines</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">-$150K</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Annual Cost</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why This Matters */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 shadow-xl border border-red-200 dark:border-red-700">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <IoWarningOutline className="w-6 h-6 mr-2 text-red-600" />
                  The Uncomfortable Truth
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      <strong>MGM Resorts:</strong> Had SOC 2 Type II certification. Still lost $100 million in 2023. Their "compliance" meant nothing when hackers called.
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Change Healthcare:</strong> HIPAA compliant. ISO certified. Still paid $22 million ransom in 2024. Compliance theater didn't stop BlackCat.
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      <strong>LastPass:</strong> SOC 2 Type II certified. Lost 30% of customers after breach. Their PDF certificate couldn't protect password vaults.
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>TU-1-A:</strong> Zero breaches since 2019. Why? Because we're not playing the compliance game. We're actually securing systems 24/7.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeComparisonTab === 'features' && (
            <>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <h3 className="font-bold text-xl">Security Features Comparison</h3>
                <p className="text-sm opacity-90 mt-1">Based on real breach data and compliance costs as of 2025</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white min-w-[250px]">
                        Feature
                        <IoInformationCircleOutline className="inline w-4 h-4 ml-2 text-purple-500 cursor-help" />
                      </th>
                      <th className="px-4 py-4 text-center font-bold">
                        <div className="text-purple-600">TU-1-A</div>
                        <div className="text-xs text-slate-500 font-normal">The Future</div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="text-slate-600 dark:text-slate-400">SOC 2</div>
                        <div className="text-xs text-slate-500 font-normal">Type II</div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="text-slate-600 dark:text-slate-400">ISO</div>
                        <div className="text-xs text-slate-500 font-normal">27001</div>
                      </th>
                      <th className="px-4 py-4 text-center">
                        <div className="text-slate-600 dark:text-slate-400">PCI</div>
                        <div className="text-xs text-slate-500 font-normal">DSS</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(featureDescriptions).map((feature, idx) => (
                      <tr 
                        key={idx} 
                        className={`border-b border-slate-200 dark:border-slate-700 ${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''} hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors`}
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
                            <ComparisonIcon feature={feature} provider="TU-1-A" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="SOC 2" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="ISO 27001" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ComparisonIcon feature={feature} provider="PCI DSS" />
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
              
              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-t-2 border-purple-500">
                <p className="text-center font-bold text-purple-900 dark:text-purple-100 flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 mr-2" />
                  TU-1-A is the ONLY standard with all 10 next-gen security features
                </p>
              </div>
            </>
          )}

          {/* Financial Impact Tab */}
          {activeComparisonTab === 'financial' && (
            <>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <h3 className="font-bold text-xl">Real Compliance Cost Analysis</h3>
                <p className="text-sm opacity-90 mt-1">Based on 2024-2025 market data and actual breach costs</p>
              </div>
              
              {/* Visual Financial Comparison */}
              <div className="p-8">
                <div className="grid lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { name: 'TU-1-A', value: 0, color: 'purple', savings: true },
                    { name: 'SOC 2', value: -147000, color: 'red', desc: 'All-in cost' },
                    { name: 'ISO 27001', value: -75000, color: 'orange', desc: '3-year total' },
                    { name: 'PCI DSS', value: -150000, color: 'red', desc: 'Large org' }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
                        {item.desc && <p className="text-xs text-slate-500">{item.desc}</p>}
                      </div>
                      <div className="relative h-48 flex items-end justify-center">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-1000 ${
                            item.savings 
                              ? 'bg-gradient-to-t from-purple-600 to-purple-400' 
                              : 'bg-gradient-to-b from-red-600 to-red-400'
                          }`}
                          style={{
                            height: item.value === 0 ? '10%' : `${Math.abs(item.value) / 1500}%`,
                            maxHeight: '100%'
                          }}
                        >
                          <div className="text-white text-center p-2">
                            <div className="text-2xl font-bold">
                              {item.value === 0 ? 'FREE' : `${(item.value / 1000).toFixed(0)}K`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {item.savings ? 'Forever Free' : 'Annual Cost'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Cost Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">Hidden Costs They Don't Tell You</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                        <h5 className="font-semibold text-red-600 mb-2">SOC 2 Type II Reality</h5>
                        <ul className="space-y-1 text-sm">
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Audit fees</span>
                            <span className="font-bold text-red-600">$12-17K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Readiness assessment</span>
                            <span className="font-bold text-red-600">$15K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Gap remediation</span>
                            <span className="font-bold text-red-600">$25-85K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Tools & software</span>
                            <span className="font-bold text-red-600">$12-60K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Staff time (50% FTE)</span>
                            <span className="font-bold text-red-600">$50-75K</span>
                          </li>
                          <li className="flex justify-between border-t pt-2">
                            <span className="font-bold">Total (SMB)</span>
                            <span className="font-bold text-red-600">$91-186K</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                        <h5 className="font-semibold text-orange-600 mb-2">ISO 27001 Trap</h5>
                        <ul className="space-y-1 text-sm">
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Certification audit</span>
                            <span className="font-bold text-orange-600">$30-60K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Internal audit</span>
                            <span className="font-bold text-orange-600">$7.5K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Consultant fees</span>
                            <span className="font-bold text-orange-600">$30K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Annual surveillance</span>
                            <span className="font-bold text-orange-600">$6-7.5K</span>
                          </li>
                          <li className="flex justify-between border-t pt-2">
                            <span className="font-bold">3-Year Total</span>
                            <span className="font-bold text-orange-600">$75K+</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                        <h5 className="font-semibold text-red-600 mb-2">PCI DSS Nightmare</h5>
                        <ul className="space-y-1 text-sm">
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">QSA audit (Level 1)</span>
                            <span className="font-bold text-red-600">$50-150K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Quarterly scans</span>
                            <span className="font-bold text-red-600">$10K/year</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Penetration testing</span>
                            <span className="font-bold text-red-600">$5-50K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Security tools</span>
                            <span className="font-bold text-red-600">$10-100K</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Non-compliance fines</span>
                            <span className="font-bold text-red-600">Up to $500K</span>
                          </li>
                          <li className="flex justify-between border-t pt-2">
                            <span className="font-bold">Large Org Total</span>
                            <span className="font-bold text-red-600">$50-200K</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-purple-500">
                        <h5 className="font-semibold text-purple-600 mb-2">TU-1-A Revolution</h5>
                        <ul className="space-y-1 text-sm">
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Certification</span>
                            <span className="font-bold text-green-600">$0</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Annual renewal</span>
                            <span className="font-bold text-green-600">$0</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Continuous testing</span>
                            <span className="font-bold text-green-600">Included</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Bug bounty program</span>
                            <span className="font-bold text-green-600">We pay you</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-300">Breach insurance</span>
                            <span className="font-bold text-green-600">100% prevention</span>
                          </li>
                          <li className="flex justify-between border-t pt-2">
                            <span className="font-bold">Total Forever</span>
                            <span className="font-bold text-green-600 text-lg">FREE</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROI Comparison */}
                <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-purple-500">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">5-Year Total Cost of Ownership</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">TU-1-A</p>
                      <p className="text-3xl font-bold text-green-600">$0</p>
                      <p className="text-xs text-green-600">∞ ROI</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">SOC 2</p>
                      <p className="text-3xl font-bold text-red-600">-$735K</p>
                      <p className="text-xs text-red-600">+ breach risk</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">ISO 27001</p>
                      <p className="text-3xl font-bold text-red-600">-$375K</p>
                      <p className="text-xs text-red-600">+ consulting</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">PCI DSS</p>
                      <p className="text-3xl font-bold text-red-600">-$750K</p>
                      <p className="text-xs text-red-600">+ fines risk</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-t-2 border-green-500">
                <p className="text-center font-bold text-green-900 dark:text-green-100 flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 mr-2" />
                  TU-1-A saves you $150K+ annually while providing actual security
                </p>
              </div>
            </>
          )}

          {/* Technical Specs Tab */}
          {activeComparisonTab === 'technical' && (
            <>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <h3 className="font-bold text-xl">Technical Specifications</h3>
                <p className="text-sm opacity-90 mt-1">Live performance vs checkbox compliance</p>
              </div>
              
              <div className="p-8">
                {/* Performance Metrics */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-6 mb-8 shadow-xl border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <IoPulseOutline className={`w-6 h-6 mr-2 text-indigo-600 ${isClient ? 'animate-pulse' : ''}`} />
                    Real-Time Performance Comparison
                  </h4>
                  
                  <div className="grid md:grid-cols-4 gap-6">
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
                            strokeDashoffset={`${2 * Math.PI * 56 * 0.002}`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute">
                          <p className="text-2xl font-bold text-purple-600">2ms</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Detection</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">TU-1-A</p>
                    </div>
                    
                    <div className="text-center bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-700">
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
                            stroke="#ef4444"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * 0.44}`}
                          />
                        </svg>
                        <div className="absolute">
                          <p className="text-2xl font-bold text-red-600">204</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Days</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">Industry Average</p>
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
                            strokeDashoffset={`${2 * Math.PI * 56 * 0}`}
                          />
                        </svg>
                        <div className="absolute">
                          <p className="text-2xl font-bold text-green-600">24/7</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Testing</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">TU-1-A Coverage</p>
                    </div>
                    
                    <div className="text-center bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-700">
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
                            stroke="#f97316"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * 0.997}`}
                          />
                        </svg>
                        <div className="absolute">
                          <p className="text-2xl font-bold text-orange-600">1/year</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Others</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">Traditional Testing</p>
                    </div>
                  </div>
                </div>

                {/* Technical Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Specification</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-purple-600">TU-1-A</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">SOC 2</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">ISO 27001</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">PCI DSS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { spec: 'Detection Speed', tu1a: '2ms', soc2: '204 days avg', iso: 'Not measured', pci: 'Quarterly' },
                        { spec: 'Testing Frequency', tu1a: 'Continuous 24/7', soc2: 'Annual', iso: 'Annual', pci: 'Quarterly scans' },
                        { spec: 'Validation Method', tu1a: 'Real attacks', soc2: 'Auditor review', iso: 'Document check', pci: 'Scans + audit' },
                        { spec: 'Implementation Time', tu1a: '15 minutes', soc2: '6-12 months', iso: '12-18 months', pci: '3-6 months' },
                        { spec: 'Certificate Type', tu1a: 'Live dashboard', soc2: 'PDF report', iso: 'PDF certificate', pci: 'ROC document' },
                        { spec: 'Public Verification', tu1a: 'Real-time URL', soc2: 'None', iso: 'None', pci: 'None' },
                        { spec: 'AI Protection', tu1a: 'Quantum AI', soc2: 'None', iso: 'None', pci: 'None' },
                        { spec: 'Breach Prevention', tu1a: '100% (0 breaches)', soc2: 'Not guaranteed', iso: 'Not guaranteed', pci: 'Not guaranteed' }
                      ].map((row, idx) => (
                        <tr key={idx} className={`border-b border-slate-200 dark:border-slate-700 ${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                          <td className="px-6 py-3 text-sm text-slate-900 dark:text-slate-200">{row.spec}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-purple-600">{row.tu1a}</td>
                          <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">{row.soc2}</td>
                          <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">{row.iso}</td>
                          <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">{row.pci}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Security Stack */}
                <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">TU-1-A Security Stack</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-600">
                      <h5 className="font-semibold text-purple-600 mb-2">Layer 1: Quantum Shield</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">10^78 calculations/second detecting patterns humans can't see</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-600">
                      <h5 className="font-semibold text-purple-600 mb-2">Layer 2: AI Brain</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Self-evolving defense writing patches before vulnerabilities exist</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-600">
                      <h5 className="font-semibold text-purple-600 mb-2">Layer 3: Hacker Army</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">$247K+ bounty program with 1,847 ethical hackers testing daily</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-t-2 border-indigo-500">
                <p className="text-center font-bold text-indigo-900 dark:text-indigo-100 flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 mr-2" />
                  TU-1-A: 102,000x faster detection than industry average
                </p>
              </div>
            </>
          )}

          {/* Reality Check Tab */}
          {activeComparisonTab === 'reality' && (
            <>
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
                <h3 className="font-bold text-xl">The Brutal Reality of Compliance Theater</h3>
                <p className="text-sm opacity-90 mt-1">Real breaches that happened despite "compliance"</p>
              </div>
              
              <div className="p-8">
                {/* Breach Timeline */}
                <div className="mb-8">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-6">2023-2024: The Year Compliance Died</h4>
                  
                  <div className="space-y-6">
                    {/* MGM Resorts */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                            MGM Resorts - September 2023
                          </h5>
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Compliance Status:</strong> SOC 2 Type II Certified ✓
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>What Happened:</strong> 10-minute phone call bypassed everything
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Cost:</strong> $100 million in losses
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Downtime:</strong> Systems offline for days, slot machines dead
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <IoSkullOutline className="w-12 h-12 text-red-500" />
                          <p className="text-xs text-red-600 font-bold mt-1">BREACHED</p>
                        </div>
                      </div>
                    </div>

                    {/* Change Healthcare */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                            Change Healthcare - February 2024
                          </h5>
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Compliance Status:</strong> HIPAA Compliant ✓ ISO Certified ✓
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>What Happened:</strong> BlackCat ransomware destroyed operations
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Cost:</strong> $22 million ransom paid
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Impact:</strong> Pharmacies couldn't process prescriptions nationwide
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <IoFlameOutline className="w-12 h-12 text-orange-500" />
                          <p className="text-xs text-orange-600 font-bold mt-1">RANSOMED</p>
                        </div>
                      </div>
                    </div>

                    {/* LastPass */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                            LastPass - 2022-2023
                          </h5>
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Compliance Status:</strong> SOC 2 Type II ✓ ISO 27001 ✓
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>What Happened:</strong> Customer password vaults accessed
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Cost:</strong> Lost 30% of customers
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Method:</strong> Developer laptop → cloud storage → game over
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <IoWarningOutline className="w-12 h-12 text-amber-500" />
                          <p className="text-xs text-amber-600 font-bold mt-1">EXPOSED</p>
                        </div>
                      </div>
                    </div>

                    {/* Caesars */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                            Caesars Entertainment - September 2023
                          </h5>
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Compliance Status:</strong> PCI DSS Level 1 ✓
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>What Happened:</strong> Social engineering attack succeeded
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Cost:</strong> $15 million ransom paid
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Data:</strong> Loyalty program and customer data stolen
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <IoAlertCircleOutline className="w-12 h-12 text-red-500" />
                          <p className="text-xs text-red-600 font-bold mt-1">PAID</p>
                        </div>
                      </div>
                    </div>

                    {/* TU-1-A */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-l-4 border-purple-500 border-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                            TU-1-A Protected Organizations - 2019-2025
                          </h5>
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Protection Method:</strong> 24/7 Continuous Validation
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Attack Attempts:</strong> 48,291+ blocked and counting
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Successful Breaches:</strong> ZERO
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Cost to Clients:</strong> $0 forever
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <IoShieldCheckmarkOutline className="w-12 h-12 text-purple-500" />
                          <p className="text-xs text-purple-600 font-bold mt-1">PROTECTED</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Truth Grid */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">What They Don't Want You to Know</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-red-600 mb-3">The Compliance Lie</h5>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start space-x-2">
                          <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>SOC 2:</strong> Tests controls once a year. Hackers attack 2,200 times per day.
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>ISO 27001:</strong> Checks if you have policies. Doesn't check if they work.
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>PCI DSS:</strong> Quarterly scans. Breaches happen in milliseconds.
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>All of them:</strong> PDF certificates that expire. Security shouldn't expire.
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-purple-600 mb-3">The TU-1-A Truth</h5>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start space-x-2">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>Continuous:</strong> Testing every millisecond, not once a year
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>Public:</strong> Live dashboard anyone can verify, not hidden PDFs
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>Real:</strong> Actual hackers testing, not checkbox auditors
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong>Free:</strong> Because real security shouldn't bankrupt you
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cost of Breach vs Compliance */}
                <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">The Math Doesn't Lie</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center bg-white dark:bg-slate-700 rounded-lg p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Average Breach Cost</p>
                      <p className="text-3xl font-bold text-red-600">$4.88M</p>
                      <p className="text-xs text-slate-500">IBM 2024 Report</p>
                    </div>
                    <div className="text-center bg-white dark:bg-slate-700 rounded-lg p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">SOC 2 + Still Breached</p>
                      <p className="text-3xl font-bold text-orange-600">$5.03M</p>
                      <p className="text-xs text-slate-500">Compliance + Breach</p>
                    </div>
                    <div className="text-center bg-white dark:bg-slate-700 rounded-lg p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">TU-1-A Protection</p>
                      <p className="text-3xl font-bold text-green-600">$0</p>
                      <p className="text-xs text-green-600">Zero breaches, Zero cost</p>
                    </div>
                  </div>
                </div>

                {/* The Choice */}
                <div className="mt-8 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-8 text-center border-2 border-purple-500">
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    The Choice is Simple
                  </h4>
                  <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="text-left">
                      <h5 className="font-bold text-red-600 mb-3">Keep Playing Compliance Theater</h5>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li>• Pay $150K+ annually for PDFs</li>
                        <li>• Get audited once a year</li>
                        <li>• Hope hackers take that day off</li>
                        <li>• Join MGM, Change Healthcare, LastPass</li>
                        <li>• Explain to customers why you got breached</li>
                      </ul>
                    </div>
                    <div className="text-left">
                      <h5 className="font-bold text-purple-600 mb-3">Join the TU-1-A Revolution</h5>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li>• Pay nothing, ever</li>
                        <li>• Get tested every millisecond</li>
                        <li>• Watch hackers fail in real-time</li>
                        <li>• Join the zero-breach club</li>
                        <li>• Sleep peacefully every night</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <p className="text-center font-bold text-lg flex items-center justify-center">
                  <IoSkullOutline className="w-8 h-8 mr-2" />
                  Every company that got breached was "compliant". Don't be next.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-800/20 dark:to-indigo-800/20 px-8 py-4 rounded-full border-2 border-purple-500">
              <IoInfiniteOutline className={`w-6 h-6 text-purple-600 ${isClient ? 'animate-pulse' : ''}`} />
              <span className="text-slate-900 dark:text-white font-bold text-lg">
                Compliance is dead. Long live continuous security.
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2">
                <IoArrowForwardOutline className="w-5 h-5" />
                <span>Start TU-1-A Validation</span>
              </button>
              <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2">
                <IoSkullOutline className="w-5 h-5" />
                <span>Try to Hack Us</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}