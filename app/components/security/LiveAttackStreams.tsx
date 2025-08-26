// app/components/security/LiveAttackStreams.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoNotificationsOutline,
  IoShieldCheckmarkOutline,
  IoBugOutline,
  IoWarningOutline,
  IoTimeOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoTrendingUpOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoLockClosedOutline,
  IoSkullOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoCodeSlashOutline,
  IoGlobeOutline,
  IoServerOutline,
  IoKeyOutline,
  IoFingerPrintOutline,
  IoSearchOutline
} from 'react-icons/io5'

export interface SecurityEvent {
  time: string
  type: string
  detail: string
  value: string
  icon?: React.ReactNode
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info'
}

interface LiveAttackStreamsProps {
  attackEvents: SecurityEvent[]
  vulnerabilityEvents: SecurityEvent[]
  complianceEvents: SecurityEvent[]
}

export default function LiveAttackStreams({ 
  attackEvents, 
  vulnerabilityEvents, 
  complianceEvents 
}: LiveAttackStreamsProps) {
  const [activeEventStream, setActiveEventStream] = useState('attacks')
  const [isClient, setIsClient] = useState(false)
  const [newEventIndicator, setNewEventIndicator] = useState(false)
  const [eventCount, setEventCount] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Simulate new events coming in
  useEffect(() => {
    if (!isClient) return
    
    const interval = setInterval(() => {
      setNewEventIndicator(true)
      setEventCount(prev => prev + 1)
      setTimeout(() => setNewEventIndicator(false), 1000)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isClient])

  // Add icons and severity to events
  const enhanceEvents = (events: SecurityEvent[], type: string): SecurityEvent[] => {
    return events.map(event => {
      let icon: React.ReactNode = <IoNotificationsOutline className="w-4 h-4" />
      let severity: SecurityEvent['severity'] = 'info'
      
      if (type === 'attacks') {
        if (event.type.includes('sql')) {
          icon = <IoCodeSlashOutline className="w-4 h-4 text-red-400" />
          severity = 'critical'
        } else if (event.type.includes('xss')) {
          icon = <IoWarningOutline className="w-4 h-4 text-orange-400" />
          severity = 'high'
        } else if (event.type.includes('ddos')) {
          icon = <IoSkullOutline className="w-4 h-4 text-red-500" />
          severity = 'critical'
        } else if (event.type.includes('brute')) {
          icon = <IoKeyOutline className="w-4 h-4 text-yellow-400" />
          severity = 'medium'
        } else if (event.type.includes('scan')) {
          icon = <IoSearchOutline className="w-4 h-4 text-blue-400" />
          severity = 'low'
        } else {
          icon = <IoShieldCheckmarkOutline className="w-4 h-4 text-purple-400" />
          severity = 'info'
        }
      } else if (type === 'vulnerabilities') {
        if (event.type.includes('bounty.claimed')) {
          icon = <IoBugOutline className="w-4 h-4 text-yellow-400" />
          severity = 'medium'
        } else if (event.type.includes('patch')) {
          icon = <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400" />
          severity = 'info'
        } else if (event.type.includes('zero.day')) {
          icon = <IoAlertCircleOutline className="w-4 h-4 text-red-400" />
          severity = 'critical'
        } else if (event.type.includes('dependency')) {
          icon = <IoServerOutline className="w-4 h-4 text-orange-400" />
          severity = 'high'
        } else {
          icon = <IoEyeOutline className="w-4 h-4 text-blue-400" />
          severity = 'low'
        }
      } else if (type === 'compliance') {
        if (event.type.includes('tu1a')) {
          icon = <IoShieldCheckmarkOutline className="w-4 h-4 text-purple-400" />
          severity = 'info'
        } else if (event.type.includes('pci')) {
          icon = <IoLockClosedOutline className="w-4 h-4 text-green-400" />
          severity = 'info'
        } else if (event.type.includes('gdpr')) {
          icon = <IoFingerPrintOutline className="w-4 h-4 text-blue-400" />
          severity = 'info'
        } else if (event.type.includes('audit')) {
          icon = <IoDocumentTextOutline className="w-4 h-4 text-amber-400" />
          severity = 'medium'
        } else {
          icon = <IoGlobeOutline className="w-4 h-4 text-cyan-400" />
          severity = 'low'
        }
      }
      
      return { ...event, icon, severity }
    })
  }

  const enhancedAttackEvents = enhanceEvents(attackEvents, 'attacks')
  const enhancedVulnerabilityEvents = enhanceEvents(vulnerabilityEvents, 'vulnerabilities')
  const enhancedComplianceEvents = enhanceEvents(complianceEvents, 'compliance')

  const streamConfig = {
    attacks: { 
      color: 'bg-red-600', 
      count: enhancedAttackEvents.length,
      label: 'Attacks',
      fullLabel: 'Attack Attempts',
      icon: <IoCloseCircleOutline className="w-4 h-4" />,
      description: 'Real-time threat blocking'
    },
    vulnerabilities: { 
      color: 'bg-orange-600', 
      count: enhancedVulnerabilityEvents.length,
      label: 'Vulns',
      fullLabel: 'Vulnerabilities',
      icon: <IoBugOutline className="w-4 h-4" />,
      description: 'Bug bounty & patches'
    },
    compliance: { 
      color: 'bg-purple-600', 
      count: enhancedComplianceEvents.length,
      label: 'Compliance',
      fullLabel: 'TU-1-A Validation',
      icon: <IoShieldCheckmarkOutline className="w-4 h-4" />,
      description: 'Continuous certification'
    }
  }

  const getCurrentEvents = () => {
    switch (activeEventStream) {
      case 'attacks': return enhancedAttackEvents
      case 'vulnerabilities': return enhancedVulnerabilityEvents
      case 'compliance': return enhancedComplianceEvents
      default: return enhancedAttackEvents
    }
  }

  const getSeverityColor = (severity?: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-green-500'
    }
  }

  const getSeverityBadge = (severity?: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'CRITICAL'
      case 'high': return 'HIGH'
      case 'medium': return 'MEDIUM'
      case 'low': return 'LOW'
      default: return 'INFO'
    }
  }

  return (
    <div className="relative bg-black border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Header with Stream Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between sm:justify-start">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-green-500 rounded-full ${isClient ? 'animate-pulse' : ''}`}></div>
              <span className="text-white text-xs sm:text-sm font-bold uppercase">Security Monitor</span>
              {isClient && newEventIndicator && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
                  THREAT
                </span>
              )}
            </div>
            {/* Mobile Event Counter */}
            <div className="sm:hidden flex items-center space-x-1 text-xs text-slate-400">
              <IoTimeOutline className="w-3 h-3" />
              <span>{isClient ? eventCount : 0} events</span>
            </div>
          </div>
          
          {/* Stream Selector Tabs - Enhanced for Mobile */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            {Object.entries(streamConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveEventStream(key)}
                className={`px-3 sm:px-4 py-1.5 sm:py-1 text-xs font-medium rounded transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeEventStream === key
                    ? `${config.color} text-white shadow-lg`
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {config.icon}
                <span className="hidden sm:inline">{config.fullLabel}</span>
                <span className="sm:hidden">{config.label}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activeEventStream === key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {config.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Text - Desktop Only */}
        <p className="text-xs text-slate-500 mb-3 hidden sm:block">
          {streamConfig[activeEventStream as keyof typeof streamConfig].description} • Updated in real-time
        </p>

        {/* Mobile Info Bar */}
        <div className="sm:hidden bg-slate-900/50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <IoFlashOutline className="w-3 h-3 text-purple-400" />
            <span className="text-slate-400">TU-1-A Protection Active</span>
          </div>
          <span className="text-xs text-green-400 font-medium">100% Blocked</span>
        </div>

        {/* Event Streams Container */}
        <div className="relative">
          {/* Events List - Mobile Optimized */}
          <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto custom-scrollbar">
            {getCurrentEvents().map((event, idx) => (
              <div 
                key={idx} 
                className={`flex items-start sm:items-center space-x-2 sm:space-x-4 text-xs sm:text-sm p-2 sm:p-0 rounded-lg sm:rounded-none ${
                  idx % 2 === 0 ? 'bg-slate-900/30 sm:bg-transparent' : ''
                } ${isClient && idx === 0 && newEventIndicator ? 'animate-pulse bg-red-900/20' : ''}`}
              >
                {/* Icon - Mobile & Desktop */}
                <div className="mt-0.5 sm:mt-0 flex-shrink-0">
                  {event.icon}
                </div>
                
                {/* Time - Desktop Only */}
                <span className="text-slate-500 font-mono text-xs hidden sm:inline whitespace-nowrap">
                  {event.time}
                </span>
                
                {/* Content Container */}
                <div className="flex-1 min-w-0">
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium text-xs ${getSeverityColor(event.severity)}`}>
                          {getSeverityBadge(event.severity)}
                        </span>
                        <span className="text-slate-400 text-xs truncate">{event.type}</span>
                      </div>
                      {event.value && (
                        <span className="text-white font-bold text-xs ml-2 flex-shrink-0">{event.value}</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{event.detail}</p>
                    <span className="text-slate-600 text-xs mt-0.5">{event.time}</span>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:space-x-4">
                    <span className={`font-medium min-w-[80px] ${getSeverityColor(event.severity)}`}>
                      {getSeverityBadge(event.severity)}
                    </span>
                    <span className="text-slate-400 min-w-[140px]">{event.type}</span>
                    <span className="text-slate-300 flex-1 truncate">{event.detail}</span>
                    {event.value && <span className="text-white font-bold">{event.value}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient Fade at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none sm:hidden"></div>
        </div>

        {/* Mobile Quick Stats */}
        <div className="sm:hidden grid grid-cols-3 gap-2 mt-3">
          <div className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-red-400 text-sm font-bold">{enhancedAttackEvents.length}</p>
            <p className="text-xs text-slate-500">Blocked</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-orange-400 text-sm font-bold">{enhancedVulnerabilityEvents.length}</p>
            <p className="text-xs text-slate-500">Patched</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-purple-400 text-sm font-bold">98.7%</p>
            <p className="text-xs text-slate-500">TU-1-A</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
    </div>
  )
}