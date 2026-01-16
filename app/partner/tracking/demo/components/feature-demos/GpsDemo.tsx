// app/partner/tracking/demo/components/feature-demos/GpsDemo.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IoLocationOutline,
  IoSpeedometerOutline,
  IoNavigateOutline,
  IoTimeOutline,
  IoCarSportOutline,
  IoCellularOutline,
  IoAnalyticsOutline,
  IoTrendingUpOutline,
  IoInformationCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface GpsPoint {
  lat: number
  lng: number
  speed: number
  heading: number
  accuracy: number
  timestamp: Date
}

interface GpsDemoProps {
  initialCoordinates?: { lat: number; lng: number }
}

const HEADING_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function getHeadingDirection(degrees: number): string {
  const index = Math.round(degrees / 45) % 8
  return HEADING_DIRECTIONS[index]
}

function getSpeedColor(speed: number): string {
  if (speed < 45) return 'text-green-400'
  if (speed < 65) return 'text-blue-400'
  if (speed < 80) return 'text-yellow-400'
  return 'text-red-400'
}

function getSpeedBorderColor(speed: number): string {
  if (speed < 45) return 'border-green-500'
  if (speed < 65) return 'border-blue-500'
  if (speed < 80) return 'border-yellow-500'
  return 'border-red-500'
}

export default function GpsDemo({ initialCoordinates = { lat: 33.4350, lng: -112.1350 } }: GpsDemoProps) {
  const [trail, setTrail] = useState<GpsPoint[]>([])
  const [currentPosition, setCurrentPosition] = useState(initialCoordinates)
  const [currentSpeed, setCurrentSpeed] = useState(72)
  const [currentHeading, setCurrentHeading] = useState(90) // East
  const [signalStrength, setSignalStrength] = useState(4) // 0-5
  const [accuracy, setAccuracy] = useState(3.2) // meters
  const [tripDistance, setTripDistance] = useState(12.4) // miles
  const [updateCount, setUpdateCount] = useState(0)

  // Simulate live GPS updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new position
      const newLat = currentPosition.lat + (Math.random() - 0.5) * 0.001
      const newLng = currentPosition.lng + (Math.random() - 0.3) * 0.002 // Bias eastward
      const newSpeed = Math.max(0, Math.min(95, currentSpeed + (Math.random() - 0.5) * 8))
      const newHeading = (currentHeading + (Math.random() - 0.5) * 20 + 360) % 360

      const newPoint: GpsPoint = {
        lat: newLat,
        lng: newLng,
        speed: Math.round(newSpeed),
        heading: Math.round(newHeading),
        accuracy: Math.max(1, accuracy + (Math.random() - 0.5) * 2),
        timestamp: new Date()
      }

      setTrail(prev => [...prev.slice(-30), newPoint])
      setCurrentPosition({ lat: newLat, lng: newLng })
      setCurrentSpeed(Math.round(newSpeed))
      setCurrentHeading(Math.round(newHeading))
      setAccuracy(Math.max(1, accuracy + (Math.random() - 0.5)))
      setTripDistance(prev => prev + 0.02)
      setUpdateCount(prev => prev + 1)

      // Randomly vary signal strength
      if (Math.random() > 0.9) {
        setSignalStrength(prev => Math.max(2, Math.min(5, prev + (Math.random() > 0.5 ? 1 : -1))))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPosition, currentSpeed, currentHeading, accuracy])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Live GPS Visualization */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-6">
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden mb-4">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(10)].map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-blue-500" style={{ top: `${i * 10}%` }} />
            ))}
            {[...Array(10)].map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-blue-500" style={{ left: `${i * 10}%` }} />
            ))}
          </div>

          {/* Accuracy circle behind vehicle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500/30 bg-blue-500/10"
            style={{ width: `${Math.min(150, accuracy * 20)}px`, height: `${Math.min(150, accuracy * 20)}px` }}
          />

          {/* Breadcrumb trail */}
          <svg className="absolute inset-0 w-full h-full">
            {trail.map((point, i) => {
              const x = 15 + (i / trail.length) * 70
              const y = 50 + Math.sin(i * 0.3) * 20
              const isLatest = i === trail.length - 1
              const speedColor = point.speed < 45 ? '#22c55e' : point.speed < 65 ? '#3b82f6' : point.speed < 80 ? '#eab308' : '#ef4444'

              return (
                <g key={i}>
                  {i > 0 && (
                    <line
                      x1={`${15 + ((i - 1) / trail.length) * 70}%`}
                      y1={`${50 + Math.sin((i - 1) * 0.3) * 20}%`}
                      x2={`${x}%`}
                      y2={`${y}%`}
                      stroke={speedColor}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                    />
                  )}
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r={isLatest ? 6 : 3}
                    fill={speedColor}
                    className={isLatest ? 'animate-pulse' : ''}
                  />
                </g>
              )
            })}
          </svg>

          {/* Current position vehicle */}
          <div className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Direction arrow */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 transition-transform duration-300"
                style={{ transform: `translateX(-50%) rotate(${currentHeading}deg)` }}
              >
                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l-4 8h8l-4-8z"/>
                </svg>
              </div>
              {/* Vehicle icon */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-lg ${getSpeedBorderColor(currentSpeed)} border-2 bg-gradient-to-br from-blue-500 to-blue-700 animate-pulse`}>
                <IoCarSportOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              {/* Speed badge */}
              <div className={`absolute -top-1 -right-1 min-w-[24px] h-6 rounded-full flex items-center justify-center shadow-lg border-2 bg-white ${getSpeedBorderColor(currentSpeed)}`}>
                <span className={`text-[10px] font-bold px-1 ${getSpeedColor(currentSpeed).replace('text-', 'text-').replace('-400', '-600')}`}>
                  {currentSpeed}
                </span>
              </div>
              {/* Live indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </div>
          </div>

          {/* Coordinates display */}
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/70 backdrop-blur rounded-lg px-2 py-1 sm:px-3 sm:py-2">
            <p className="text-[10px] sm:text-xs text-gray-400">Current Position</p>
            <p className="text-xs sm:text-sm font-mono text-green-400">
              {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
            </p>
          </div>

          {/* Signal & Update info */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/70 backdrop-blur rounded-lg px-2 py-1 sm:px-3 sm:py-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      i < signalStrength ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                    style={{ height: `${8 + i * 3}px` }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] sm:text-xs text-gray-300">Live</span>
              </div>
            </div>
          </div>

          {/* Update frequency */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/70 backdrop-blur rounded-lg px-2 py-1">
            <div className="flex items-center gap-1.5">
              <IoTimeOutline className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] sm:text-xs text-gray-300">1s updates</span>
            </div>
          </div>
        </div>

        {/* GPS Info Cards - 2 rows on mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {/* Speed */}
          <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
            <IoSpeedometerOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${getSpeedColor(currentSpeed)}`} />
            <p className={`text-sm sm:text-lg font-bold ${getSpeedColor(currentSpeed)}`}>{currentSpeed}</p>
            <p className="text-[8px] sm:text-xs text-gray-400">mph</p>
          </div>

          {/* Heading */}
          <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
            <IoNavigateOutline
              className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-blue-400 transition-transform duration-300"
              style={{ transform: `rotate(${currentHeading}deg)` }}
            />
            <p className="text-sm sm:text-lg font-bold text-white">{getHeadingDirection(currentHeading)}</p>
            <p className="text-[8px] sm:text-xs text-gray-400">{currentHeading}°</p>
          </div>

          {/* Accuracy */}
          <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
            <IoLocationOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-green-400" />
            <p className="text-sm sm:text-lg font-bold text-white">±{accuracy.toFixed(1)}</p>
            <p className="text-[8px] sm:text-xs text-gray-400">meters</p>
          </div>

          {/* Signal */}
          <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
            <IoCellularOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${signalStrength >= 3 ? 'text-green-400' : 'text-yellow-400'}`} />
            <p className="text-sm sm:text-lg font-bold text-white">{signalStrength}/5</p>
            <p className="text-[8px] sm:text-xs text-gray-400">Signal</p>
          </div>

          {/* Trip Distance */}
          <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
            <IoAnalyticsOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-sm sm:text-lg font-bold text-white">{tripDistance.toFixed(1)}</p>
            <p className="text-[8px] sm:text-xs text-gray-400">miles</p>
          </div>

          {/* Updates */}
          <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
            <IoTrendingUpOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-cyan-400" />
            <p className="text-sm sm:text-lg font-bold text-white">{updateCount}</p>
            <p className="text-[8px] sm:text-xs text-gray-400">Updates</p>
          </div>
        </div>
      </div>

      {/* Recent Position Log */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
          <IoTimeOutline className="w-4 h-4" />
          Recent Position History
        </h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {trail.slice(-5).reverse().map((point, i) => (
            <div
              key={i}
              className={`flex items-center justify-between text-xs py-1 ${i === 0 ? 'text-green-400' : 'text-gray-400'}`}
            >
              <span className="font-mono">
                {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
              </span>
              <span className={`font-medium ${getSpeedColor(point.speed)}`}>
                {point.speed} mph
              </span>
              <span>
                {point.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoInformationCircleOutline className="w-4 h-4" />
          How It Works
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Real-time GPS coordinates are captured each second during trips and transmitted via cellular network. Location accuracy varies from 3-30 meters depending on satellite visibility and environmental factors.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          Important Notice
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          GPS tracking may be unavailable in tunnels, parking garages, dense urban areas, or regions with limited cellular coverage. Signal quality indicators show current tracking reliability. All vehicle occupants should be notified that location tracking is active.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">Bouncie:</span> 1-second updates, trip history, speed data</li>
          <li><span className="text-white font-medium">Smartcar:</span> API-based real-time signals</li>
          <li><span className="text-white font-medium">Zubie:</span> Always-on tracking with detailed maps</li>
          <li><span className="text-white font-medium">MooveTrax:</span> Worldwide coverage, automatic network switching</li>
          <li><span className="text-white font-medium">Trackimo:</span> GPS + Wi-Fi + Bluetooth + GSM triangulation</li>
        </ul>
      </div>
    </div>
  )
}
