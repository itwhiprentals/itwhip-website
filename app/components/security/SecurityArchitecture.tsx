// app/components/security/SecurityArchitecture.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoShieldCheckmarkOutline,
  IoSkullOutline,
  IoFlameOutline,
  IoAnalyticsOutline,
  IoCloudOutline,
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
  IoRadioButtonOn,
  IoStarOutline,
  IoArrowForwardOutline,
  IoInformationCircleOutline,
  IoBugOutline,
  IoEyeOutline,
  IoFingerPrintOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoSearchOutline,
  IoNuclearOutline,
  IoCubeOutline,
  IoInfiniteOutline,
  IoShieldOutline,
  IoSkullSharp,
  IoThunderstormOutline,
  IoScanOutline,
  IoColorPaletteOutline,
  IoTrophyOutline,
  IoDocumentTextOutline,
  IoLockOpenOutline,
  IoSparklesOutline,
  IoHardwareChipOutline
} from 'react-icons/io5'

interface SecurityMetrics {
  systemsProtected: number
  hackersOnline: number
  detectionSpeed: number
}

interface Threat {
  id: string
  origin: string
  status: string
  attempts: number
  blocked: number
}

interface SecurityArchitectureProps {
  securityMetrics: SecurityMetrics
  threats: Threat[]
}

interface ThreatEvent {
  id: string
  timestamp: string
  type: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  icon: React.ReactNode
  source?: string
  blocked: boolean
}

export default function SecurityArchitecture({ securityMetrics, threats }: SecurityArchitectureProps) {
  const [activePreview, setActivePreview] = useState('command-center')
  const [codeLanguage, setCodeLanguage] = useState('python')
  const [comparisonMode, setComparisonMode] = useState('industry')
  const [liveMetrics, setLiveMetrics] = useState({
    attacksPerSecond: 127,
    detectionTime: 2,
    protectionRate: 100,
    activeThreats: 0,
    dataScanned: 89.7,
    falsePositiveRate: 0.001
  })
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([])
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [quantumStrength, setQuantumStrength] = useState(98.7)
  const [hackerAttempts, setHackerAttempts] = useState(72458)

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Simulate real-time updates - only on client
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        attacksPerSecond: Math.floor(Math.random() * 50) + 100,
        detectionTime: Math.round(Math.max(1, Math.min(5, prev.detectionTime + (Math.random() * 2 - 1)))),
        protectionRate: 100,
        activeThreats: 0,
        dataScanned: parseFloat((prev.dataScanned + Math.random() * 0.3).toFixed(1)),
        falsePositiveRate: parseFloat((Math.random() * 0.005).toFixed(3))
      }))
      setHackerAttempts(prev => prev + Math.floor(Math.random() * 7) + 3)
      setQuantumStrength(prev => Math.min(100, Math.max(95, prev + (Math.random() * 2 - 1))))
    }, 2000)

    return () => clearInterval(interval)
  }, [isClient])

  // Generate threat events - only on client
  useEffect(() => {
    if (!isClient) return

    let eventCounter = 0 // Add counter for unique IDs

    const generateThreatEvent = (): ThreatEvent => {
      const threats = [
        { type: 'sql.injection', message: 'SQL injection blocked from 185.220.x.x', severity: 'critical' as const, icon: <IoCodeSlashOutline className="w-4 h-4" />, source: 'Russia' },
        { type: 'ddos.attempt', message: 'DDoS attack mitigated - 10K requests/sec', severity: 'high' as const, icon: <IoThunderstormOutline className="w-4 h-4" />, source: 'China' },
        { type: 'xss.payload', message: 'XSS payload neutralized in form input', severity: 'high' as const, icon: <IoWarningOutline className="w-4 h-4" />, source: 'Unknown' },
        { type: 'brute.force', message: 'Brute force login attempt - IP banned', severity: 'medium' as const, icon: <IoKeyOutline className="w-4 h-4" />, source: 'Brazil' },
        { type: 'port.scan', message: 'Port scan detected and logged', severity: 'low' as const, icon: <IoSearchOutline className="w-4 h-4" />, source: 'Netherlands' },
        { type: 'ai.attack', message: 'AI-generated phishing attempt blocked', severity: 'critical' as const, icon: <IoSkullOutline className="w-4 h-4" />, source: 'GPT-4' },
        { type: 'zero.day', message: 'Zero-day exploit attempt failed', severity: 'critical' as const, icon: <IoNuclearOutline className="w-4 h-4" />, source: 'Anonymous' },
        { type: 'supply.chain', message: 'Supply chain attack detected in npm package', severity: 'critical' as const, icon: <IoHardwareChipOutline className="w-4 h-4" />, source: 'Unknown' },
        { type: 'api.abuse', message: 'API rate limit enforced - 50K requests blocked', severity: 'medium' as const, icon: <IoServerOutline className="w-4 h-4" />, source: 'Vietnam' }
      ]
      
      const threat = threats[Math.floor(Math.random() * threats.length)]
      eventCounter++
      return {
        id: `threat-${Date.now()}-${eventCounter}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
        timestamp: new Date().toISOString(),
        blocked: true,
        ...threat
      }
    }

    // Initialize with some events
    setThreatEvents([
      generateThreatEvent(),
      generateThreatEvent()
    ])

    const interval = setInterval(() => {
      setThreatEvents(prev => [generateThreatEvent(), ...prev.slice(0, 9)])
    }, 3000)

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

  // Get comparison data based on selection
  const getComparisonData = () => {
    switch(comparisonMode) {
      case 'soc2':
        return {
          themCost: '$9.3M',
          themLabel: 'SOC 2 Companies',
          themBreaches: 'Avg 2.7/year',
          savingsAmount: '$9.3M',
          barHeights: [85, 92, 78, 88, 91, 82, 87]
        }
      case 'none':
        return {
          themCost: '$16.8M',
          themLabel: 'No Protection',
          themBreaches: 'Avg 8.4/year',
          savingsAmount: '$16.8M',
          barHeights: [100, 98, 95, 99, 96, 97, 100]
        }
      default:
        return {
          themCost: '$4.88M',
          themLabel: 'Industry Average',
          themBreaches: 'Avg 1.3/year',
          savingsAmount: '$4.88M',
          barHeights: [72, 68, 74, 71, 69, 73, 70]
        }
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enterprise Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-800 dark:text-purple-400 px-6 py-3 rounded-full mb-6 border border-purple-300 dark:border-purple-800">
            <IoLayersOutline className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-wider">TU-1-A Security Architecture</span>
            {isClient && (
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full text-green-600 text-xs font-medium animate-pulse">
                PROTECTED
              </span>
            )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Military-Grade <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Quantum-Resistant</span> Defense
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Google-scale infrastructure. NSA-level encryption. Kindergarten-simple dashboard.
          </p>
        </div>

        {/* System Status Bar - Make Larry Page's Eyes Widen */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4 mb-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {isClient && (
                  <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 animate-pulse"></div>
                )}
                <IoShieldCheckmarkOutline className="relative w-8 h-8" />
              </div>
              <div>
                <p className="font-bold">Zero Breaches Since 2019</p>
                <p className="text-sm opacity-90">That's {isClient ? Math.floor((Date.now() - new Date('2019-01-01').getTime()) / (1000 * 60 * 60 * 24)) : 2000}+ days of perfection</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{liveMetrics.protectionRate}%</p>
                <p className="text-xs opacity-90">Protection Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{liveMetrics.detectionTime}ms</p>
                <p className="text-xs opacity-90">Detection Speed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(hackerAttempts)}</p>
                <p className="text-xs opacity-90">Attacks Blocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{liveMetrics.dataScanned}PB</p>
                <p className="text-xs opacity-90">Data Protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Preview Tabs - Larry Page Would Click All of These */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'command-center', label: 'War Room', icon: <IoRocketOutline className="w-4 h-4" /> },
            { id: 'threat-intelligence', label: 'AI Brain', icon: <IoScanOutline className="w-4 h-4" /> },
            { id: 'analytics', label: 'Money Saved', icon: <IoAnalyticsOutline className="w-4 h-4" /> },
            { id: 'security-stack', label: 'Defense Layers', icon: <IoShieldOutline className="w-4 h-4" /> },
            { id: 'tu1a-portal', label: 'TU-1-A Live', icon: <IoShieldCheckmarkOutline className="w-4 h-4" /> },
            { id: 'hacker-console', label: 'Hacker View', icon: <IoSkullOutline className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePreview(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                activePreview === tab.id 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Platform Preview Window - This Will Blow Larry's Mind */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          
          {/* Security Command Center - The War Room */}
          {activePreview === 'command-center' && (
            <div>
              <div className="bg-gradient-to-r from-red-900 via-purple-900 to-indigo-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoRocketOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Global Threat Command Center</h3>
                      <p className="text-xs opacity-75">What the Pentagon wishes they had</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <IoWifiOutline className={`w-4 h-4 text-green-400 ${isClient ? 'animate-pulse' : ''}`} />
                      <span className="text-xs">Connected to ItWhip Global Defense Network</span>
                    </div>
                    <span className="text-xs text-red-400 font-bold animate-pulse">DEFCON 5</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Threat Level Matrix - Google Would Love This */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoSkullOutline className="w-5 h-5 text-red-600" />
                      <span className="text-xs text-red-600 font-semibold animate-pulse">CRITICAL</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Active APTs</div>
                    <div className="mt-2 h-1 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Last detected: 89 days ago</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoFlameOutline className="w-5 h-5 text-orange-600" />
                      <span className="text-xs text-green-600 font-semibold">BLOCKED</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{isClient ? liveMetrics.attacksPerSecond : 127}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Attacks/Second</div>
                    <div className="mt-2 flex space-x-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`flex-1 h-4 ${i <= 5 ? 'bg-green-500' : 'bg-slate-300'} rounded-sm transition-all`}></div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Peak: 3,847/sec</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoFingerPrintOutline className="w-5 h-5 text-purple-600" />
                      <IoRadioButtonOn className={`w-3 h-3 text-green-500 ${isClient ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{quantumStrength.toFixed(1)}%</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Quantum Shield</div>
                    <div className="mt-2 grid grid-cols-10 gap-0.5">
                      {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 19 ? 'bg-purple-500' : 'bg-slate-300'} transition-all`}></div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">2048-qubit protection</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-green-600 font-semibold">{liveMetrics.detectionTime}ms</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Protected</div>
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        <IoInfiniteOutline className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">Perpetual Shield</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Zero downtime</p>
                  </div>
                </div>

                {/* Advanced Threat Monitoring Dashboard */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-bold mb-3 flex items-center">
                    <IoSparklesOutline className="w-5 h-5 mr-2 text-yellow-400" />
                    AI-Powered Threat Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded p-3">
                      <p className="text-xs text-slate-400 mb-1">Pattern Recognition</p>
                      <p className="text-lg font-bold text-green-400">12,847 patterns</p>
                      <p className="text-xs text-slate-500">Updated 3ms ago</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-3">
                      <p className="text-xs text-slate-400 mb-1">Behavioral Anomalies</p>
                      <p className="text-lg font-bold text-yellow-400">27 detected</p>
                      <p className="text-xs text-slate-500">All quarantined</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-3">
                      <p className="text-xs text-slate-400 mb-1">Prediction Accuracy</p>
                      <p className="text-lg font-bold text-purple-400">99.97%</p>
                      <p className="text-xs text-slate-500">ML Model v8.3</p>
                    </div>
                  </div>
                </div>

                {/* Live Threat Feed & Global Attack Map */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Real-time Threat Feed */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                        <IoNotificationsOutline className="w-5 h-5 mr-2" />
                        Live Threat Neutralization
                      </h4>
                      <span className="text-xs text-red-500 animate-pulse">● LIVE</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {threatEvents.map((event) => (
                        <div key={event.id} className="flex items-start space-x-2 p-2 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors">
                          <div className={`mt-0.5 ${
                            event.severity === 'critical' ? 'text-red-500' :
                            event.severity === 'high' ? 'text-orange-500' :
                            event.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`}>
                            {event.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 dark:text-white">
                              {event.message}
                              {event.source && <span className="text-xs text-slate-500 ml-2">[{event.source}]</span>}
                            </p>
                            <p className="text-xs text-slate-500">{isClient ? new Date(event.timestamp).toLocaleTimeString() : '12:00:00 PM'}</p>
                          </div>
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Global Attack Origins Map */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                        <IoGlobeOutline className="w-5 h-5 mr-2" />
                        Global Attack Origins
                      </h4>
                      <span className="text-xs text-green-500">All Blocked</span>
                    </div>
                    <div className="relative h-48 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-lg overflow-hidden">
                      {/* Animated attack visualization */}
                      <div className="absolute inset-0">
                        {isClient && Array.from({length: 5}).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.5}s`,
                              animationDuration: '2s'
                            }}
                          />
                        ))}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur rounded p-2">
                        <div className="grid grid-cols-3 gap-2 text-xs text-white">
                          <div>
                            <span className="text-red-400">●</span> Russia: 3,892
                          </div>
                          <div>
                            <span className="text-orange-400">●</span> China: 2,673
                          </div>
                          <div>
                            <span className="text-yellow-400">●</span> Iran: 1,284
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Threat Intelligence - The Google Brain */}
          {activePreview === 'threat-intelligence' && (
            <div>
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoScanOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Quantum AI Threat Prediction Engine</h3>
                      <p className="text-xs opacity-75">Sees attacks 34 minutes before they happen (Google DeepMind wishes)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-green-500/20 rounded-full text-xs font-medium">
                      TensorFlow Quantum v7.2
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* What This Means Box - Larry Page Edition */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">What Makes Google Engineers Jealous</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        This isn't just AI. It's <strong>Quantum-Enhanced Neural Architecture</strong> that makes DeepMind look like a calculator:
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Predicts attacks</strong> before hackers even decide to attack (behavioral pre-crime)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Self-evolving defense</strong> that writes its own security patches in real-time</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Quantum entanglement</strong> creates unhackable communication channels</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Zero-knowledge proof</strong> validates without exposing any data (magic)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quantum Neural Network Visualization - This Will Blow Larry's Mind */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Quantum Threat Prediction Matrix</h4>
                    <span className="text-xs text-purple-600 font-medium bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                      Processing {formatNumber(isClient ? animatedValue * 1478 : 73900)} qubits/sec
                    </span>
                  </div>
                  
                  {/* Mind-Blowing Quantum Visualization */}
                  <div className="relative">
                    <svg className="w-full h-64" viewBox="0 0 600 250">
                      {/* Quantum Grid Background */}
                      <defs>
                        <pattern id="quantumGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.2"/>
                        </pattern>
                        {isClient && (
                          <linearGradient id="quantumFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0">
                              <animate attributeName="stop-opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="#ec4899" stopOpacity="1">
                              <animate attributeName="stop-opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                            </stop>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0">
                              <animate attributeName="stop-opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="1s" />
                            </stop>
                          </linearGradient>
                        )}
                      </defs>
                      <rect width="600" height="250" fill="url(#quantumGrid)" />
                      
                      {/* Quantum Threat Sources */}
                      <g>
                        <text x="50" y="20" className="fill-purple-600 text-xs font-semibold">Threat Vectors</text>
                        {[
                          { y: 50, label: 'Zero-Days', value: 'Scanning...' },
                          { y: 90, label: 'AI Attacks', value: 'Detected' },
                          { y: 130, label: 'Quantum', value: 'Protected' },
                          { y: 170, label: 'APTs', value: 'Tracking' },
                          { y: 210, label: 'Unknown', value: 'Learning' }
                        ].map((input, i) => (
                          <g key={`quantum-${i}`}>
                            <circle cx="80" cy={input.y} r="12" fill="#ec4899" className={isClient ? "animate-pulse" : ""} opacity="0.9">
                              {isClient && (
                                <animate attributeName="r" values="12;15;12" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                              )}
                            </circle>
                            <text x="100" y={input.y + 3} className="fill-slate-600 dark:fill-slate-400 text-xs">{input.label}</text>
                            <text x="100" y={input.y + 15} className="fill-purple-500 dark:fill-purple-400 text-xs opacity-75">{input.value}</text>
                          </g>
                        ))}
                      </g>
                      
                      {/* Quantum Processing Core */}
                      <g>
                        <text x="240" y="20" className="fill-purple-600 text-xs font-semibold">Quantum Core</text>
                        <circle cx="280" cy="130" r="30" fill="none" stroke="url(#quantumFlow)" strokeWidth="2">
                          {isClient && (
                            <animateTransform attributeName="transform" type="rotate" from="0 280 130" to="360 280 130" dur="10s" repeatCount="indefinite" />
                          )}
                        </circle>
                        <circle cx="280" cy="130" r="20" fill="none" stroke="url(#quantumFlow)" strokeWidth="2" opacity="0.6">
                          {isClient && (
                            <animateTransform attributeName="transform" type="rotate" from="360 280 130" to="0 280 130" dur="8s" repeatCount="indefinite" />
                          )}
                        </circle>
                        <circle cx="280" cy="130" r="10" fill="#8b5cf6" opacity="0.8">
                          {isClient && (
                            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                          )}
                        </circle>
                      </g>
                      
                      {/* Defense Actions */}
                      <g>
                        <text x="440" y="20" className="fill-purple-600 text-xs font-semibold">Quantum Defense</text>
                        {[
                          { y: 60, label: 'Block', value: 'Instant' },
                          { y: 105, label: 'Adapt', value: 'Real-time' },
                          { y: 150, label: 'Predict', value: '34min' },
                          { y: 195, label: 'Evolve', value: 'Continuous' }
                        ].map((output, i) => (
                          <g key={`defense-${i}`}>
                            <circle cx="480" cy={output.y} r="12" fill="#3b82f6" opacity="0.9">
                              {isClient && (
                                <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                              )}
                            </circle>
                            <text x="500" y={output.y + 3} className="fill-slate-600 dark:fill-slate-400 text-xs">{output.label}</text>
                            <text x="500" y={output.y + 15} className="fill-green-600 text-xs font-semibold">{output.value}</text>
                          </g>
                        ))}
                      </g>
                      
                      {/* Quantum Connections */}
                      {isClient && Array.from({length: 20}).map((_, i) => (
                        <line
                          key={`quantum-line-${i}`}
                          x1={80 + Math.random() * 400}
                          y1={50 + Math.random() * 150}
                          x2={80 + Math.random() * 400}
                          y2={50 + Math.random() * 150}
                          stroke="url(#quantumFlow)"
                          strokeWidth="1"
                          opacity="0.3"
                        >
                          <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
                        </line>
                      ))}
                    </svg>
                  </div>

                  {/* Quantum Processing Stats That Make Google Jealous */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{isClient ? Math.round(animatedValue * 0.34) : '17'}μs</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Quantum Decision</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">10^78</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Calculations/sec</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">∞</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Years to Crack</div>
                    </div>
                  </div>
                </div>

                {/* Why This Beats Google's Security */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 mb-6 border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
                    <IoTrendingUpOutline className="w-5 h-5 mr-2" />
                    Why Google Would Buy This Tomorrow
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Quantum Supremacy:</span> First production quantum security system
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Self-Healing Code:</span> AI writes patches before vulnerabilities exist
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Time-Travel Defense:</span> Predicts attacks from behavioral patterns
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Zero Trust++:</span> Even we can't access your data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Analytics - Show Me The Money */}
          {activePreview === 'analytics' && (
            <div>
              <div className="bg-gradient-to-r from-green-900 to-emerald-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoAnalyticsOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Security ROI Dashboard</h3>
                      <p className="text-xs opacity-75">Making CFOs cry tears of joy since 2019</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Saving</span>
                    <div className="px-2 py-1 bg-green-500/20 rounded text-xl font-bold animate-pulse">
                      {getComparisonData().savingsAmount}/year
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Money Saved Chart */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Breach Prevention Savings</h4>
                    <select 
                      className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
                      value={comparisonMode}
                      onChange={(e) => setComparisonMode(e.target.value)}
                    >
                      <option value="industry">vs Industry Average</option>
                      <option value="soc2">vs SOC 2 Companies</option>
                      <option value="none">vs No Protection</option>
                    </select>
                  </div>
                  
                  {/* Savings Visualization */}
                  <div className="h-32 flex items-end justify-between space-x-1">
                    {getComparisonData().barHeights.concat([0, 0, 0, 0, 0, 0, 0]).map((height, i) => (
                      <div key={i} className="flex-1 relative group">
                        <div className={`${i < 7 ? 'bg-gradient-to-t from-red-500 to-red-400' : 'bg-gradient-to-t from-green-500 to-green-400'} rounded-t transition-all duration-500 hover:opacity-80`} 
                          style={{ height: `${height}%` }}>
                          {height > 0 && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {i < 7 ? height : '0'}%
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-center block mt-1">{i < 7 ? getComparisonData().themLabel.split(' ')[0] : 'You'}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{getComparisonData().themLabel} Breach Cost</p>
                      <p className="text-lg font-bold text-red-600">{getComparisonData().themCost}</p>
                      <p className="text-xs text-slate-500">{getComparisonData().themBreaches}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Your Breach Cost</p>
                      <p className="text-lg font-bold text-green-600">$0</p>
                      <p className="text-xs text-slate-500">Zero breaches ever</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Money Saved</p>
                      <p className="text-lg font-bold text-purple-600">{getComparisonData().savingsAmount}</p>
                      <p className="text-xs text-slate-500">Annual savings</p>
                    </div>
                  </div>
                </div>

                {/* Key Financial Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Compliance Savings', value: '$385K/yr', change: 'vs SOC 2 + ISO', icon: <IoCashOutline className="w-4 h-4" /> },
                    { label: 'Staff Not Needed', value: '8 FTEs', change: '$960K saved', icon: <IoPersonCircleOutline className="w-4 h-4" /> },
                    { label: 'Insurance Reduction', value: '67%', change: '$284K/yr', icon: <IoShieldOutline className="w-4 h-4" /> },
                    { label: 'Total TCO Savings', value: '93%', change: `${getComparisonData().savingsAmount}/yr`, icon: <IoTrendingUpOutline className="w-4 h-4" /> }
                  ].map((metric, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-green-500">{metric.icon}</div>
                        <span className="text-xs text-green-600 font-medium">{metric.change}</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{metric.value}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Additional Financial Benefits */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Hidden Cost Savings Most Companies Miss</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                      <span className="text-slate-600 dark:text-slate-400">Incident Response Team</span>
                      <span className="font-bold text-green-600">-$480K/yr</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                      <span className="text-slate-600 dark:text-slate-400">Legal & PR Crisis</span>
                      <span className="font-bold text-green-600">-$320K/yr</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                      <span className="text-slate-600 dark:text-slate-400">Downtime Prevention</span>
                      <span className="font-bold text-green-600">-$1.4M/yr</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                      <span className="text-slate-600 dark:text-slate-400">Customer Trust Retained</span>
                      <span className="font-bold text-green-600">Priceless</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Stack - The Arsenal */}
          {activePreview === 'security-stack' && (
            <div>
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoShieldOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Defense-in-Depth Architecture</h3>
                      <p className="text-xs opacity-75">37 layers of "good luck getting through this"</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoLockClosedOutline className="w-4 h-4" />
                    <span className="text-xs">Military-Grade Everything</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Defense Layers Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: 'Quantum Firewall', status: 'Active', type: 'Perimeter', icon: <IoNuclearOutline className="w-6 h-6 text-purple-600" />, strength: '∞', description: '2048-qubit encryption' },
                    { name: 'AI Behavioral Analysis', status: 'Learning', type: 'Detection', icon: <IoFingerPrintOutline className="w-6 h-6 text-indigo-600" />, strength: '99.9%', description: 'Pattern recognition ML' },
                    { name: 'Zero Trust Network', status: 'Enforced', type: 'Access', icon: <IoLockClosedOutline className="w-6 h-6 text-blue-600" />, strength: '100%', description: 'Never trust, always verify' },
                    { name: 'Homomorphic Encryption', status: 'Active', type: 'Data', icon: <IoCubeOutline className="w-6 h-6 text-cyan-600" />, strength: 'Unbreakable', description: 'Compute on encrypted data' },
                    { name: 'SIEM Neural Net', status: 'Analyzing', type: 'Monitoring', icon: <IoScanOutline className="w-6 h-6 text-green-600" />, strength: '24/7', description: 'Real-time log analysis' },
                    { name: 'Honeypot Matrix', status: 'Baiting', type: 'Deception', icon: <IoColorPaletteOutline className="w-6 h-6 text-amber-600" />, strength: '1,847 traps', description: 'Decoy systems active' },
                    { name: 'DDoS Shield', status: 'Deflecting', type: 'Availability', icon: <IoThunderstormOutline className="w-6 h-6 text-red-600" />, strength: '10Tbps', description: 'Global edge protection' },
                    { name: 'Sandboxing Engine', status: 'Isolating', type: 'Containment', icon: <IoCubeOutline className="w-6 h-6 text-orange-600" />, strength: '100%', description: 'Complete isolation' },
                    { name: 'Chaos Engineering', status: 'Testing', type: 'Resilience', icon: <IoFlameOutline className="w-6 h-6 text-pink-600" />, strength: 'Netflix-level', description: 'Proactive failure testing' }
                  ].map((layer, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="flex items-start justify-between mb-2">
                        {layer.icon}
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          layer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          layer.status === 'Learning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {layer.status}
                        </div>
                      </div>
                      <h5 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">{layer.name}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{layer.type}</p>
                      <p className="text-xs text-purple-600 mt-2 font-bold">Strength: {layer.strength}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{layer.description}</p>
                    </div>
                  ))}
                </div>

                {/* The "Holy Shit" Stats */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                    <IoInfiniteOutline className="w-5 h-5 mr-2" />
                    Numbers That Make NSA Jealous
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">10^128</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Encryption Strength</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">0.001%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">False Positives</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">∞ years</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">To Brute Force</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">0</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Successful Breaches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TU-1-A Portal - The Standard */}
          {activePreview === 'tu1a-portal' && (
            <div>
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoShieldCheckmarkOutline className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">TU-1-A Certification Portal</h3>
                      <p className="text-xs opacity-75">The security standard that makes SOC 2 look like a participation trophy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="px-2 py-1 bg-green-500/20 rounded text-xs font-medium animate-pulse">
                      ✓ VALIDATED
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Live Validation Status */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { name: 'Continuous Testing', status: '72,458 tests', icon: <IoBugOutline className="w-6 h-6 text-purple-600" />, badge: 'LIVE' },
                    { name: 'Public Dashboard', status: 'Transparent', icon: <IoEyeOutline className="w-6 h-6 text-blue-600" />, badge: 'PUBLIC' },
                    { name: 'Bug Bounties', status: '$428K paid', icon: <IoCashOutline className="w-6 h-6 text-green-600" />, badge: 'ACTIVE' },
                    { name: 'Zero Breaches', status: 'Since 2019', icon: <IoShieldCheckmarkOutline className="w-6 h-6 text-indigo-600" />, badge: 'PERFECT' }
                  ].map((cert, i) => (
                    <div key={i} className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        {cert.icon}
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">{cert.badge}</span>
                      </div>
                      <h5 className="font-semibold text-slate-900 dark:text-white">{cert.name}</h5>
                      <p className="text-sm text-purple-600 font-bold">{cert.status}</p>
                    </div>
                  ))}
                </div>

                {/* Why TU-1-A > Everything Else */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                    <IoTrophyOutline className="w-5 h-5 mr-2 text-purple-600" />
                    TU-1-A vs The "Standards"
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span className="text-sm font-medium">Validation Frequency</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500">SOC 2: Annual</span>
                        <span className="text-xs font-bold text-purple-600">TU-1-A: Every Second</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span className="text-sm font-medium">Cost</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500">ISO 27001: $385K</span>
                        <span className="text-xs font-bold text-green-600">TU-1-A: FREE</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span className="text-sm font-medium">Proof</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500">Others: PDF Certificate</span>
                        <span className="text-xs font-bold text-blue-600">TU-1-A: Live Dashboard</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span className="text-sm font-medium">Testing Method</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500">PCI: Scans</span>
                        <span className="text-xs font-bold text-red-600">TU-1-A: Real Attacks</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span className="text-sm font-medium">Response Time</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500">GDPR: 72 hours</span>
                        <span className="text-xs font-bold text-green-600">TU-1-A: 2ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Certification Benefits */}
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                    <IoDocumentTextOutline className="w-5 h-5 mr-2 text-green-600" />
                    Compliance Coverage
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                    TU-1-A certification automatically satisfies requirements for:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['SOC 2 Type II', 'ISO 27001/27002', 'PCI DSS Level 1', 'HIPAA', 'GDPR Article 32', 'NIST Cybersecurity Framework', 'FedRAMP Moderate', 'CCPA'].map((compliance) => (
                      <div key={compliance} className="flex items-center space-x-2 text-sm">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                        <span className="text-slate-700 dark:text-slate-300">{compliance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hacker Console - The Challenge */}
          {activePreview === 'hacker-console' && (
            <div>
              <div className="bg-gradient-to-r from-black via-red-950 to-black text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoSkullOutline className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="font-bold text-lg font-mono">HACKER CHALLENGE INTERFACE</h3>
                      <p className="text-xs opacity-75 text-red-400">Think you're elite? Prove it. $428K bounty pool waiting.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 bg-red-500/20 rounded text-xs font-mono animate-pulse">
                      ◉ 287 HACKERS ONLINE
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-black">
                {/* Terminal Interface */}
                <div className="bg-black rounded-lg p-4 mb-6 border border-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-green-400 font-mono">root@tu1a-challenge:~#</span>
                  </div>
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
{`┌──────────────────────────────────────────────────┐
│  TU-1-A SECURITY CHALLENGE - HALL OF SHAME      │
├──────────────────────────────────────────────────┤
│  Total Attempts: ${formatNumber(hackerAttempts)}                          │
│  Successful Breaches: 0                         │
│  Current Jackpot: ${formatNumber(428000 + Math.floor(hackerAttempts / 100))}                        │
│  Your Chance: 0.00000000000001%                 │
└──────────────────────────────────────────────────┘

> Recent Failures:
[FAILED] xXx_1337_h4x0r_xXx - SQL Injection - Blocked in 2ms
[FAILED] Anonymous_Panda - XSS Attempt - Nice try kid
[FAILED] ZeroCool_2025 - Buffer Overflow - LOL no
[FAILED] AI_Overlord_GPT5 - AI Attack - Our AI is better
[FAILED] QuantumCracker - Quantum Attack - We're quantum-proof
[FAILED] ElonMusk_Real - Social Engineering - Not today
[FAILED] DefCon_Champion - Zero-day exploit - Already patched
[FAILED] NSA_Intern - Backdoor attempt - Door's locked

> Available Challenges:
1. [EASY] Find any vulnerability ($1,000)
2. [MEDIUM] Access user data ($10,000) 
3. [HARD] Breach payment system ($50,000)
4. [EXTREME] Take down TU-1-A ($100,000)
5. [IMPOSSIBLE] Prove we're not secure ($∞)
6. [LEGENDARY] Break quantum encryption ($1,000,000)

> Hall of Fame:
[EMPTY] - Be the first to succeed!

> Your Stats:
Attempts: 0
Success Rate: 0%
Rank: #∞ (Git gud)
Earned: $0
Time Wasted: 0 hours

Type 'hack --help' to begin your inevitable failure...`}</pre>
                </div>

                {/* Live Hacking Attempts */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { method: 'SQL', attempts: '23,847', blocked: '100%', bounty: '$0' },
                    { method: 'XSS', attempts: '18,923', blocked: '100%', bounty: '$0' },
                    { method: 'DDoS', attempts: '12,384', blocked: '100%', bounty: '$0' },
                    { method: 'Zero-Day', attempts: '3,892', blocked: '100%', bounty: '$0' },
                    { method: 'Social', attempts: '7,284', blocked: '100%', bounty: '$0' },
                    { method: 'Quantum', attempts: '73', blocked: '100%', bounty: '$0' },
                    { method: 'AI', attempts: '1,847', blocked: '100%', bounty: '$0' },
                    { method: 'Unknown', attempts: '???', blocked: '100%', bounty: '$0' }
                  ].map((attempt, i) => (
                    <div key={i} className="bg-gray-900 rounded-lg p-3 border border-green-500/20 hover:border-red-500/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-green-400">{attempt.method}</span>
                        <span className="text-xs text-red-500 font-mono">{attempt.blocked}</span>
                      </div>
                      <p className="text-xs font-mono text-gray-400">Attempts: {attempt.attempts}</p>
                      <p className="text-xs font-mono text-yellow-400">Earned: {attempt.bounty}</p>
                    </div>
                  ))}
                </div>

                {/* Advanced Hacking Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-lg p-3 border border-red-500/20">
                    <p className="text-xs font-mono text-red-400 mb-1">Most Creative Attempt</p>
                    <p className="text-sm font-mono text-green-400">"Time-based quantum injection"</p>
                    <p className="text-xs font-mono text-gray-500">Result: Nice imagination</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 border border-red-500/20">
                    <p className="text-xs font-mono text-red-400 mb-1">Longest Attack</p>
                    <p className="text-sm font-mono text-green-400">73 hours straight</p>
                    <p className="text-xs font-mono text-gray-500">Result: Still failed</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 border border-red-500/20">
                    <p className="text-xs font-mono text-red-400 mb-1">Closest to Success</p>
                    <p className="text-sm font-mono text-green-400">0.0000001%</p>
                    <p className="text-xs font-mono text-gray-500">Result: Not even close</p>
                  </div>
                </div>

                {/* The Taunt */}
                <div className="mt-6 bg-gradient-to-r from-red-900/20 to-black rounded-lg p-4 border border-red-500/20">
                  <h4 className="font-mono text-red-500 mb-2 animate-pulse">MESSAGE FROM TU-1-A:</h4>
                  <p className="text-green-400 font-mono text-sm">
                    "We've been waiting since 2019. Not a single breach. Not one. 
                    Your 'elite' skills? Our AI learned them in 2ms. Your zero-days? 
                    We patched them before you found them. Your quantum computer? 
                    Cute toy. Keep trying though - we need the training data."
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-3">
                    PS: Thanks for the free penetration testing. Invoice: $0.00
                  </p>
                  <p className="text-xs text-yellow-400 font-mono mt-2">
                    PPS: Your attempts are being live-streamed to our investors. They're laughing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Features Bar - The Closer */}
        <div className="mt-8 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-center">
            {[
              { label: 'Quantum Ready', value: 'Today', icon: <IoNuclearOutline className="w-5 h-5" /> },
              { label: 'AI Defense', value: 'Self-Evolving', icon: <IoFingerPrintOutline className="w-5 h-5" /> },
              { label: 'Detection', value: '2ms', icon: <IoFlashOutline className="w-5 h-5" /> },
              { label: 'False Positives', value: '0.001%', icon: <IoCheckmarkCircle className="w-5 h-5" /> },
              { label: 'Uptime', value: '100%', icon: <IoInfiniteOutline className="w-5 h-5" /> },
              { label: 'Cost', value: 'FREE', icon: <IoCashOutline className="w-5 h-5" /> }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-purple-500 dark:text-purple-400 mb-2">{feature.icon}</div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{feature.value}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack - Google Would Recognize These */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Technology That Makes Silicon Valley Jealous</p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {['Quantum Computing', 'TensorFlow Quantum', 'Zero-Knowledge Proof', 'Homomorphic Encryption', 'Neural Architecture Search', 'Chaos Engineering', 'Time-Series Prediction', 'Behavioral AI', 'Federated Learning', 'Differential Privacy'].map((tech) => (
              <span key={tech} className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 transition-colors cursor-pointer">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}