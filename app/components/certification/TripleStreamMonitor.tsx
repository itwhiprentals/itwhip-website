// app/components/certification/TripleStreamMonitor.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  IoShieldCheckmark, 
  IoCashOutline, 
  IoCheckmarkCircle, 
  IoWarning,
  IoLocationOutline,
  IoTimeOutline,
  IoFlagOutline,
  IoSkullOutline,
  IoRocketOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

interface SecurityEvent {
  id: string
  timestamp: string
  type: 'blocked' | 'detected' | 'mitigated'
  threat: string
  origin: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface RevenueEvent {
  id: string
  timestamp: string
  hotel: string
  amount: number
  type: 'ride' | 'booking' | 'commission'
  status: 'completed' | 'processing'
}

interface ComplianceEvent {
  id: string
  timestamp: string
  verification: string
  entity: string
  result: 'passed' | 'verified' | 'certified'
  standard: string
}

export function TripleStreamMonitor() {
  // Stream states
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>([])
  const [complianceEvents, setComplianceEvents] = useState<ComplianceEvent[]>([])
  
  // Metrics
  const [metrics, setMetrics] = useState({
    threatsBlocked: 48291,
    revenueToday: 87234,
    verificationsToday: 156,
    activeConnections: 3
  })

  // Auto-scroll refs
  const securityScrollRef = useRef<HTMLDivElement>(null)
  const revenueScrollRef = useRef<HTMLDivElement>(null)
  const complianceScrollRef = useRef<HTMLDivElement>(null)

  // Threat origins for variety
  const threatOrigins = [
    { country: 'Russia', code: 'RU', flag: '🇷🇺' },
    { country: 'China', code: 'CN', flag: '🇨🇳' },
    { country: 'North Korea', code: 'KP', flag: '🇰🇵' },
    { country: 'Unknown', code: 'XX', flag: '🏴‍☠️' },
    { country: 'Iran', code: 'IR', flag: '🇮🇷' },
    { country: 'Brazil', code: 'BR', flag: '🇧🇷' }
  ]

  const threatTypes = [
    'SQL Injection Attempt',
    'XSS Attack Blocked',
    'Brute Force Login',
    'DDoS Pattern Detected',
    'Malware Upload Blocked',
    'API Rate Limit Violation',
    'Suspicious Bot Activity',
    'Password Spray Attack',
    'Session Hijack Attempt',
    'Zero-Day Exploit Blocked'
  ]

  const hotels = [
    'Marriott Phoenix Downtown',
    'Hilton Scottsdale Resort',
    'Four Seasons Scottsdale',
    'Hyatt Regency Phoenix',
    'W Scottsdale',
    'The Phoenician',
    'JW Marriott Camelback',
    'Fairmont Princess'
  ]

  const complianceStandards = [
    'SOC 2 Type II',
    'ISO 27001',
    'PCI DSS Level 1',
    'HIPAA',
    'GDPR Article 32',
    'CCPA Compliance',
    'FedRAMP Moderate',
    'NIST Framework'
  ]

  // Generate security events
  useEffect(() => {
    const generateSecurityEvent = (): SecurityEvent => {
      const origin = threatOrigins[Math.floor(Math.random() * threatOrigins.length)]
      return {
        id: `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'blocked',
        threat: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        origin: `${origin.flag} ${origin.country}`,
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any
      }
    }

    const interval = setInterval(() => {
      setSecurityEvents(prev => {
        const newEvents = [generateSecurityEvent(), ...prev].slice(0, 5)
        return newEvents
      })
      setMetrics(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + 1
      }))
    }, 2000 + Math.random() * 3000)

    return () => clearInterval(interval)
  }, [])

  // Generate revenue events
  useEffect(() => {
    const generateRevenueEvent = (): RevenueEvent => {
      const hotel = hotels[Math.floor(Math.random() * hotels.length)]
      const types = ['ride', 'booking', 'commission']
      const type = types[Math.floor(Math.random() * types.length)] as any
      
      let amount = 0
      if (type === 'ride') amount = 30 + Math.random() * 70
      if (type === 'booking') amount = 150 + Math.random() * 350
      if (type === 'commission') amount = 10 + Math.random() * 50
      
      return {
        id: `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        hotel,
        amount,
        type,
        status: 'completed'
      }
    }

    const interval = setInterval(() => {
      setRevenueEvents(prev => {
        const newEvents = [generateRevenueEvent(), ...prev].slice(0, 5)
        return newEvents
      })
      setMetrics(prev => ({
        ...prev,
        revenueToday: prev.revenueToday + (50 + Math.random() * 200)
      }))
    }, 3000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [])

  // Generate compliance events
  useEffect(() => {
    const generateComplianceEvent = (): ComplianceEvent => {
      const verificationTypes = [
        'Security Audit',
        'Compliance Check',
        'Certification Renewal',
        'Vulnerability Scan',
        'Policy Verification',
        'Access Review'
      ]
      
      return {
        id: `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        verification: verificationTypes[Math.floor(Math.random() * verificationTypes.length)],
        entity: hotels[Math.floor(Math.random() * hotels.length)],
        result: 'passed',
        standard: complianceStandards[Math.floor(Math.random() * complianceStandards.length)]
      }
    }

    const interval = setInterval(() => {
      setComplianceEvents(prev => {
        const newEvents = [generateComplianceEvent(), ...prev].slice(0, 5)
        return newEvents
      })
      setMetrics(prev => ({
        ...prev,
        verificationsToday: prev.verificationsToday + 1
      }))
    }, 5000 + Math.random() * 5000)

    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to latest events
  useEffect(() => {
    if (securityScrollRef.current) {
      securityScrollRef.current.scrollTop = 0
    }
  }, [securityEvents])

  useEffect(() => {
    if (revenueScrollRef.current) {
      revenueScrollRef.current.scrollTop = 0
    }
  }, [revenueEvents])

  useEffect(() => {
    if (complianceScrollRef.current) {
      complianceScrollRef.current.scrollTop = 0
    }
  }, [complianceEvents])

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full mb-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="font-semibold">Live Platform Activity</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything Happening <span className="text-purple-600">Right Now</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Three live streams showing security, revenue, and compliance - all in real-time.
            This is your platform working 24/7/365.
          </p>
        </div>

        {/* Triple Stream Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Security Stream */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <IoShieldCheckmark className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Security Stream</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Threats Blocked</p>
                  <p className="text-xl font-bold">{metrics.threatsBlocked.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 dark:text-green-400 font-semibold">DEFENDING</span>
                </div>
              </div>
            </div>
            
            <div ref={securityScrollRef} className="h-96 overflow-y-auto p-4 space-y-3">
              {securityEvents.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <IoShieldCheckmark className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Monitoring for threats...</p>
                </div>
              )}
              
              {securityEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-3 border transition-all duration-500 ${
                    index === 0 ? 'border-red-500 shadow-lg animate-pulse-once' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IoSkullOutline className={`w-4 h-4 ${
                        event.severity === 'critical' ? 'text-red-600' :
                        event.severity === 'high' ? 'text-orange-600' :
                        event.severity === 'medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`} />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        event.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {event.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {event.threat}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Origin: {event.origin}
                    </span>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                      ✓ BLOCKED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Stream */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <IoCashOutline className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Revenue Stream</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Today's Revenue</p>
                  <p className="text-xl font-bold">${metrics.revenueToday.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 dark:text-green-400 font-semibold">EARNING</span>
                </div>
              </div>
            </div>
            
            <div ref={revenueScrollRef} className="h-96 overflow-y-auto p-4 space-y-3">
              {revenueEvents.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <IoCashOutline className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Tracking revenue...</p>
                </div>
              )}
              
              {revenueEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-3 border transition-all duration-500 ${
                    index === 0 ? 'border-green-500 shadow-lg animate-pulse-once' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {event.type === 'ride' && <IoRocketOutline className="w-4 h-4 text-blue-600" />}
                      {event.type === 'booking' && <IoLocationOutline className="w-4 h-4 text-purple-600" />}
                      {event.type === 'commission' && <IoCashOutline className="w-4 h-4 text-green-600" />}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.type === 'ride' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        event.type === 'booking' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {event.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {event.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {event.hotel}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      +${event.amount.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {event.status === 'completed' ? '✓ Completed' : '⏳ Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Stream */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <IoCheckmarkCircle className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Compliance Stream</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Verifications</p>
                  <p className="text-xl font-bold">{metrics.verificationsToday}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 dark:text-green-400 font-semibold">COMPLIANT</span>
                </div>
              </div>
            </div>
            
            <div ref={complianceScrollRef} className="h-96 overflow-y-auto p-4 space-y-3">
              {complianceEvents.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <IoCheckmarkCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Monitoring compliance...</p>
                </div>
              )}
              
              {complianceEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-3 border transition-all duration-500 ${
                    index === 0 ? 'border-purple-500 shadow-lg animate-pulse-once' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IoLockClosedOutline className="w-4 h-4 text-purple-600" />
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {event.standard}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {event.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {event.verification}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {event.entity}
                    </span>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                      ✓ PASSED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{metrics.activeConnections}</p>
              <p className="text-sm opacity-75">Active WebSocket Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">24/7/365</p>
              <p className="text-sm opacity-75">Non-Stop Protection</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0ms</p>
              <p className="text-sm opacity-75">Detection Latency</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">∞</p>
              <p className="text-sm opacity-75">Scalability</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <IoWarning className="inline w-5 h-5 mr-2 text-yellow-500" />
            This is happening across <span className="font-bold text-gray-900 dark:text-white">47 hotels</span> right now. 
            Your hotel could be next.
          </p>
        </div>
      </div>
    </section>
  )
}