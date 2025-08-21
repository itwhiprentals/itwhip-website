// app/components/hotel-solutions/LiveEventStreams.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoNotificationsOutline,
  IoCarOutline,
  IoLeafOutline,
  IoCashOutline,
  IoTimeOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoTrendingUpOutline,
  IoAlertCircleOutline,
  IoBusinessOutline,
  IoAirplaneOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

export interface Event {
  time: string
  type: string
  detail: string
  value: string
  icon?: React.ReactNode
}

interface LiveEventStreamsProps {
  bookingEvents: Event[]
  driverEvents: Event[]
  esgEvents: Event[]
}

export default function LiveEventStreams({ 
  bookingEvents, 
  driverEvents, 
  esgEvents 
}: LiveEventStreamsProps) {
  const [activeEventStream, setActiveEventStream] = useState('booking')
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

  // Add icons to events
  const enhanceEvents = (events: Event[], type: string): Event[] => {
    return events.map(event => {
      let icon: React.ReactNode = <IoNotificationsOutline className="w-4 h-4" />
      
      if (type === 'booking') {
        if (event.type.includes('booking.new')) icon = <IoCashOutline className="w-4 h-4 text-green-400" />
        else if (event.type.includes('instant')) icon = <IoFlashOutline className="w-4 h-4 text-blue-400" />
        else if (event.type.includes('cart')) icon = <IoBusinessOutline className="w-4 h-4 text-amber-400" />
        else if (event.type.includes('revenue')) icon = <IoTrendingUpOutline className="w-4 h-4 text-emerald-400" />
      } else if (type === 'driver') {
        if (event.type.includes('assigned')) icon = <IoCarOutline className="w-4 h-4 text-blue-400" />
        else if (event.type.includes('arrived')) icon = <IoLocationOutline className="w-4 h-4 text-green-400" />
        else if (event.type.includes('vip')) icon = <IoPersonOutline className="w-4 h-4 text-purple-400" />
        else if (event.type.includes('completed')) icon = <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-400" />
        else if (event.type.includes('airport')) icon = <IoAirplaneOutline className="w-4 h-4 text-cyan-400" />
      } else if (type === 'esg') {
        if (event.type.includes('emission')) icon = <IoLeafOutline className="w-4 h-4 text-green-400" />
        else if (event.type.includes('compliance')) icon = <IoShieldCheckmarkOutline className="w-4 h-4 text-purple-400" />
        else if (event.type.includes('milestone')) icon = <IoAlertCircleOutline className="w-4 h-4 text-amber-400" />
        else if (event.type.includes('report')) icon = <IoDocumentTextOutline className="w-4 h-4 text-blue-400" />
      }
      
      return { ...event, icon }
    })
  }

  const enhancedBookingEvents = enhanceEvents(bookingEvents, 'booking')
  const enhancedDriverEvents = enhanceEvents(driverEvents, 'driver')
  const enhancedEsgEvents = enhanceEvents(esgEvents, 'esg')

  const streamConfig = {
    booking: { 
      color: 'bg-blue-600', 
      count: enhancedBookingEvents.length,
      label: 'Revenue',
      fullLabel: 'Booking & Revenue',
      icon: <IoCashOutline className="w-4 h-4" />
    },
    driver: { 
      color: 'bg-green-600', 
      count: enhancedDriverEvents.length,
      label: 'Operations',
      fullLabel: 'Driver Operations',
      icon: <IoCarOutline className="w-4 h-4" />
    },
    esg: { 
      color: 'bg-purple-600', 
      count: enhancedEsgEvents.length,
      label: 'Compliance',
      fullLabel: 'ESG Compliance',
      icon: <IoLeafOutline className="w-4 h-4" />
    }
  }

  const getCurrentEvents = () => {
    switch (activeEventStream) {
      case 'booking': return enhancedBookingEvents
      case 'driver': return enhancedDriverEvents
      case 'esg': return enhancedEsgEvents
      default: return enhancedBookingEvents
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
              <span className="text-white text-xs sm:text-sm font-bold uppercase">Live Dashboard</span>
              {isClient && newEventIndicator && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full animate-pulse">
                  NEW
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
          Real-time alerts available via webhook, SDK, or your admin portal
        </p>

        {/* Mobile Info Bar */}
        <div className="sm:hidden bg-slate-900/50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <IoFlashOutline className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Live feed from your dashboard</span>
          </div>
          <span className="text-xs text-green-400 font-medium">Active</span>
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
                } ${isClient && idx === 0 && newEventIndicator ? 'animate-pulse bg-green-900/20' : ''}`}
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
                      <span className={`font-medium text-xs ${
                        event.type.includes('booking.new') || event.type.includes('assigned') || event.type.includes('emission') ? 'text-green-400' : 
                        event.type.includes('instant') || event.type.includes('arrived') || event.type.includes('compliance') ? 'text-blue-400' : 
                        event.type.includes('cart') || event.type.includes('vip') || event.type.includes('milestone') ? 'text-amber-400' : 
                        event.type.includes('revenue') || event.type.includes('completed') || event.type.includes('report') ? 'text-emerald-400' : 
                        'text-slate-400'
                      }`}>
                        {event.type.replace('.', ' ')}
                      </span>
                      {event.value && (
                        <span className="text-white font-bold text-xs ml-2">{event.value}</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{event.detail}</p>
                    <span className="text-slate-600 text-xs mt-0.5">{event.time}</span>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:space-x-4">
                    <span className={`font-medium min-w-[120px] ${
                      event.type.includes('booking.new') || event.type.includes('assigned') || event.type.includes('emission') ? 'text-green-400' : 
                      event.type.includes('instant') || event.type.includes('arrived') || event.type.includes('compliance') ? 'text-blue-400' : 
                      event.type.includes('cart') || event.type.includes('vip') || event.type.includes('milestone') ? 'text-amber-400' : 
                      event.type.includes('revenue') || event.type.includes('completed') || event.type.includes('report') ? 'text-emerald-400' : 
                      'text-slate-400'
                    }`}>
                      {event.type}
                    </span>
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
            <p className="text-green-400 text-sm font-bold">{enhancedBookingEvents.length}</p>
            <p className="text-xs text-slate-500">Bookings</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-blue-400 text-sm font-bold">{enhancedDriverEvents.length}</p>
            <p className="text-xs text-slate-500">Rides</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-purple-400 text-sm font-bold">{enhancedEsgEvents.length}</p>
            <p className="text-xs text-slate-500">ESG</p>
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