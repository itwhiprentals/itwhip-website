// app/partner/tracking/demo/components/feature-demos/GeofenceDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
  IoEnterOutline,
  IoExitOutline,
  IoTimeOutline,
  IoNotificationsOutline,
  IoCarSportOutline,
  IoInformationCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface GeofenceZone {
  id: string
  name: string
  type: 'home' | 'work' | 'restricted' | 'custom'
  color: string
  radius: number // in pixels for display
  alerts: {
    onEnter: boolean
    onExit: boolean
    afterHours: boolean
  }
}

interface GeofenceEvent {
  zoneId: string
  zoneName: string
  type: 'enter' | 'exit'
  timestamp: Date
  vehicleName: string
}

const DEMO_ZONES: GeofenceZone[] = [
  {
    id: 'home',
    name: 'Home Base',
    type: 'home',
    color: '#22c55e',
    radius: 60,
    alerts: { onEnter: true, onExit: true, afterHours: false }
  },
  {
    id: 'office',
    name: 'Office',
    type: 'work',
    color: '#3b82f6',
    radius: 50,
    alerts: { onEnter: false, onExit: true, afterHours: true }
  },
  {
    id: 'restricted',
    name: 'Restricted Area',
    type: 'restricted',
    color: '#ef4444',
    radius: 45,
    alerts: { onEnter: true, onExit: false, afterHours: false }
  }
]

export default function GeofenceDemo() {
  const [vehiclePosition, setVehiclePosition] = useState({ x: 50, y: 70 })
  const [vehicleDirection, setVehicleDirection] = useState(0)
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [events, setEvents] = useState<GeofenceEvent[]>([
    { zoneId: 'home', zoneName: 'Home Base', type: 'exit', timestamp: new Date(Date.now() - 3600000), vehicleName: 'Tesla Model 3' },
    { zoneId: 'office', zoneName: 'Office', type: 'enter', timestamp: new Date(Date.now() - 1800000), vehicleName: 'Tesla Model 3' }
  ])
  const [timeInZone, setTimeInZone] = useState<Record<string, number>>({
    home: 28800, // 8 hours
    office: 14400, // 4 hours
    restricted: 0
  })
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  // Zone positions on the visualization
  const zonePositions: Record<string, { x: number; y: number }> = {
    home: { x: 25, y: 30 },
    office: { x: 75, y: 35 },
    restricted: { x: 50, y: 75 }
  }

  // Animate vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehiclePosition(prev => {
        // Random movement biased toward zones
        const targetX = prev.x + (Math.random() - 0.5) * 8
        const targetY = prev.y + (Math.random() - 0.5) * 8

        // Keep within bounds
        const newX = Math.max(10, Math.min(90, targetX))
        const newY = Math.max(15, Math.min(85, targetY))

        // Calculate direction
        const angle = Math.atan2(newY - prev.y, newX - prev.x) * (180 / Math.PI)
        setVehicleDirection(angle)

        return { x: newX, y: newY }
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Check zone entry/exit
  useEffect(() => {
    let newActiveZone: string | null = null

    for (const zone of DEMO_ZONES) {
      const pos = zonePositions[zone.id]
      const distance = Math.sqrt(
        Math.pow(vehiclePosition.x - pos.x, 2) +
        Math.pow(vehiclePosition.y - pos.y, 2)
      )
      const radiusPercent = zone.radius / 4 // Convert pixel radius to approximate %

      if (distance < radiusPercent) {
        newActiveZone = zone.id
        break
      }
    }

    // Trigger events on zone change
    if (newActiveZone !== activeZone) {
      if (activeZone) {
        const exitedZone = DEMO_ZONES.find(z => z.id === activeZone)
        if (exitedZone && exitedZone.alerts.onExit) {
          triggerAlert(`Vehicle exited ${exitedZone.name}`, 'exit')
          setEvents(prev => [
            { zoneId: activeZone, zoneName: exitedZone.name, type: 'exit', timestamp: new Date(), vehicleName: 'Tesla Model 3' },
            ...prev.slice(0, 9)
          ])
        }
      }

      if (newActiveZone) {
        const enteredZone = DEMO_ZONES.find(z => z.id === newActiveZone)
        if (enteredZone && enteredZone.alerts.onEnter) {
          triggerAlert(`Vehicle entered ${enteredZone.name}`, 'enter')
          setEvents(prev => [
            { zoneId: newActiveZone!, zoneName: enteredZone.name, type: 'enter', timestamp: new Date(), vehicleName: 'Tesla Model 3' },
            ...prev.slice(0, 9)
          ])
        }
      }

      setActiveZone(newActiveZone)
    }

    // Update time in zone
    if (newActiveZone) {
      setTimeInZone(prev => ({
        ...prev,
        [newActiveZone!]: (prev[newActiveZone!] || 0) + 1
      }))
    }
  }, [vehiclePosition, activeZone])

  const triggerAlert = (message: string, type: 'enter' | 'exit') => {
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const getZoneTypeColor = (type: string): string => {
    switch (type) {
      case 'home': return 'text-green-400'
      case 'work': return 'text-blue-400'
      case 'restricted': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alert Notification */}
      {showAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gray-900 border border-orange-500 rounded-lg px-4 py-3 shadow-xl flex items-center gap-3">
            <IoNotificationsOutline className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="text-sm text-white">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* Zone Visualization */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-5">
            {[...Array(10)].map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${i * 10}%` }} />
            ))}
            {[...Array(10)].map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${i * 10}%` }} />
            ))}
          </div>

          {/* Geofence Zones */}
          {DEMO_ZONES.map(zone => {
            const pos = zonePositions[zone.id]
            const isActive = activeZone === zone.id
            const isSelected = selectedZone === zone.id

            return (
              <div
                key={zone.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                  isActive ? 'scale-110' : ''
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => setSelectedZone(isSelected ? null : zone.id)}
              >
                {/* Zone circle */}
                <div
                  className={`rounded-full border-2 transition-all duration-300 ${
                    isActive ? 'animate-pulse' : ''
                  }`}
                  style={{
                    width: `${zone.radius}px`,
                    height: `${zone.radius}px`,
                    borderColor: zone.color,
                    backgroundColor: `${zone.color}${isActive ? '40' : '20'}`,
                    boxShadow: isSelected ? `0 0 20px ${zone.color}60` : 'none'
                  }}
                />
                {/* Zone label */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                  <p className="text-[10px] sm:text-xs font-medium text-white">{zone.name}</p>
                </div>
                {/* Zone icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {zone.type === 'home' && <IoLocationOutline className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />}
                  {zone.type === 'work' && <IoShieldCheckmarkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
                  {zone.type === 'restricted' && <IoAlertCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
                </div>
              </div>
            )
          })}

          {/* Vehicle marker */}
          <div
            className="absolute w-8 h-8 sm:w-10 sm:h-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
            style={{ left: `${vehiclePosition.x}%`, top: `${vehiclePosition.y}%` }}
          >
            <div
              className="w-full h-full bg-orange-500 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300"
              style={{ transform: `rotate(${vehicleDirection + 90}deg)` }}
            >
              <IoCarSportOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white" style={{ transform: `rotate(-90deg)` }} />
            </div>
            {/* Pulsing indicator when in zone */}
            {activeZone && (
              <div className="absolute inset-0 rounded-lg bg-orange-500 animate-ping opacity-30" />
            )}
          </div>

          {/* Status indicator */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur rounded-lg px-2 py-1">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${activeZone ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-[10px] sm:text-xs text-gray-300">
                {activeZone ? `In: ${DEMO_ZONES.find(z => z.id === activeZone)?.name}` : 'Outside zones'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {DEMO_ZONES.map(zone => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
            className={`bg-gray-800 rounded-lg p-2 sm:p-3 text-center transition-all ${
              selectedZone === zone.id ? 'ring-2' : ''
            }`}
            style={{ '--tw-ring-color': zone.color } as React.CSSProperties}
          >
            <div
              className="w-3 h-3 rounded-full mx-auto mb-1"
              style={{ backgroundColor: zone.color }}
            />
            <p className="text-xs sm:text-sm font-medium text-white truncate">{zone.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">{formatDuration(timeInZone[zone.id] || 0)}</p>
          </button>
        ))}
      </div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4" style={{ borderColor: DEMO_ZONES.find(z => z.id === selectedZone)?.color }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">
              {DEMO_ZONES.find(z => z.id === selectedZone)?.name}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              getZoneTypeColor(DEMO_ZONES.find(z => z.id === selectedZone)?.type || '')
            } bg-gray-700`}>
              {DEMO_ZONES.find(z => z.id === selectedZone)?.type}
            </span>
          </div>

          {/* Alert Configuration */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Alert Settings:</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ZONES.find(z => z.id === selectedZone)?.alerts.onEnter && (
                <span className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded flex items-center gap-1">
                  <IoEnterOutline className="w-3 h-3" /> On Enter
                </span>
              )}
              {DEMO_ZONES.find(z => z.id === selectedZone)?.alerts.onExit && (
                <span className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded flex items-center gap-1">
                  <IoExitOutline className="w-3 h-3" /> On Exit
                </span>
              )}
              {DEMO_ZONES.find(z => z.id === selectedZone)?.alerts.afterHours && (
                <span className="text-[10px] px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded flex items-center gap-1">
                  <IoTimeOutline className="w-3 h-3" /> After Hours
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Log */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
          <IoTimeOutline className="w-4 h-4" />
          Recent Zone Events
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {events.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-2">
                {event.type === 'enter' ? (
                  <IoEnterOutline className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <IoExitOutline className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className="text-gray-300">{event.vehicleName}</span>
                <span className="text-gray-500">
                  {event.type === 'enter' ? 'entered' : 'exited'}
                </span>
                <span className="text-white font-medium">{event.zoneName}</span>
              </div>
              <span className="text-gray-400">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>Home</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Work</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Restricted</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoInformationCircleOutline className="w-4 h-4" />
          How It Works
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Geofences are virtual boundaries defined by GPS coordinates. When your vehicle crosses a boundary, an alert is triggered and sent via push notification, SMS, or email within seconds.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          Important Notice
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Geofence accuracy depends on GPS signal quality. Alerts may be delayed in areas with poor cellular coverage. For time-sensitive boundaries, set zones slightly larger than the actual area to account for GPS drift of 3-10 meters.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">Bouncie:</span> Unlimited geo-zones, instant entry/exit alerts</li>
          <li><span className="text-white font-medium">Zubie:</span> Unlimited boundaries, restricted area monitoring</li>
          <li><span className="text-white font-medium">MooveTrax:</span> Unlimited geofences including nested zones</li>
          <li><span className="text-white font-medium">Trackimo:</span> Standard geofence crossing alerts</li>
          <li><span className="text-white font-medium">Smartcar:</span> API integration for custom geofence logic</li>
        </ul>
      </div>
    </div>
  )
}
