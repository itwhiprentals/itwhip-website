// app/partner/tracking/demo/components/feature-demos/SpeedAlertDemo.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IoSpeedometerOutline,
  IoWarningOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoTimeOutline,
  IoNotificationsOutline,
  IoCarSportOutline,
  IoSettingsOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface SpeedAlert {
  speed: number
  threshold: number
  roadType: string
  timestamp: Date
  duration: number // seconds over limit
}

interface SpeedDataPoint {
  speed: number
  timestamp: number
}

const ROAD_LIMITS: Record<string, number> = {
  'Residential': 25,
  'City Street': 35,
  'Highway': 65,
  'Freeway': 75
}

export default function SpeedAlertDemo() {
  const [currentSpeed, setCurrentSpeed] = useState(58)
  const [threshold, setThreshold] = useState(65)
  const [speedHistory, setSpeedHistory] = useState<SpeedDataPoint[]>([])
  const [alerts, setAlerts] = useState<SpeedAlert[]>([
    { speed: 78, threshold: 65, roadType: 'Highway', timestamp: new Date(Date.now() - 3600000), duration: 45 },
    { speed: 72, threshold: 65, roadType: 'Highway', timestamp: new Date(Date.now() - 7200000), duration: 12 }
  ])
  const [currentRoadType, setCurrentRoadType] = useState('Highway')
  const [acceleration, setAcceleration] = useState(0)
  const [driverScore, setDriverScore] = useState(87)
  const [isOverLimit, setIsOverLimit] = useState(false)
  const [overLimitDuration, setOverLimitDuration] = useState(0)

  const prevSpeedRef = useRef(currentSpeed)

  // Simulate live speed updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed(prev => {
        // Random speed changes with momentum
        const change = (Math.random() - 0.5) * 8
        const newSpeed = Math.max(20, Math.min(95, prev + change))

        // Calculate acceleration
        const accel = newSpeed - prev
        setAcceleration(accel)

        // Update history
        setSpeedHistory(h => [
          ...h.slice(-60),
          { speed: newSpeed, timestamp: Date.now() }
        ])

        return Math.round(newSpeed)
      })

      // Occasionally change road type
      if (Math.random() > 0.95) {
        const roadTypes = Object.keys(ROAD_LIMITS)
        setCurrentRoadType(roadTypes[Math.floor(Math.random() * roadTypes.length)])
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Track previous over-limit state for edge detection
  const wasOverLimitRef = useRef(false)
  const overLimitDurationRef = useRef(0)

  // Check for speed limit violations (without duration in deps to avoid infinite loop)
  useEffect(() => {
    const isOver = currentSpeed > threshold
    setIsOverLimit(isOver)

    // Detect transition from over to under limit
    if (wasOverLimitRef.current && !isOver) {
      // Record alert if was over for more than 3 seconds
      if (overLimitDurationRef.current > 3) {
        setAlerts(prev => [
          {
            speed: prevSpeedRef.current,
            threshold,
            roadType: currentRoadType,
            timestamp: new Date(),
            duration: overLimitDurationRef.current
          },
          ...prev.slice(0, 9)
        ])
      }
      setOverLimitDuration(0)
      overLimitDurationRef.current = 0
    }

    wasOverLimitRef.current = isOver
    prevSpeedRef.current = currentSpeed
  }, [currentSpeed, threshold, currentRoadType])

  // Separate effect for duration counting and score updates (runs on 1-second interval)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOverLimit) {
        setOverLimitDuration(prev => {
          const newVal = prev + 1
          overLimitDurationRef.current = newVal
          return newVal
        })
        // Deduct from driver score slowly
        setDriverScore(prev => Math.max(0, prev - 0.1))
      } else {
        // Slowly recover driver score
        setDriverScore(prev => Math.min(100, prev + 0.02))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isOverLimit])

  const getSpeedColor = (speed: number, limit: number): string => {
    if (speed > limit + 10) return 'text-red-500'
    if (speed > limit) return 'text-orange-500'
    if (speed > limit - 10) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getSpeedBgColor = (speed: number, limit: number): string => {
    if (speed > limit + 10) return 'bg-red-500'
    if (speed > limit) return 'bg-orange-500'
    if (speed > limit - 10) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getNeedleRotation = (speed: number): number => {
    // Map 0-120 to -135 to 135 degrees
    return Math.min(135, Math.max(-135, (speed / 120) * 270 - 135))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Speedometer */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col items-center">
          {/* Circular Speedometer */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            {/* Background arc */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Full arc background */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#374151"
                strokeWidth="12"
                strokeDasharray="377"
                strokeDashoffset="94"
                strokeLinecap="round"
              />
              {/* Speed arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={currentSpeed > threshold ? '#ef4444' : '#22c55e'}
                strokeWidth="12"
                strokeDasharray="377"
                strokeDashoffset={377 - (currentSpeed / 120) * 283}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {/* Threshold marker */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeDasharray={`3 ${377 / 120 - 3}`}
                strokeDashoffset={377 - (threshold / 120) * 283 + 94}
                strokeLinecap="round"
              />
            </svg>

            {/* Needle */}
            <div
              className="absolute top-1/2 left-1/2 w-1 h-16 sm:h-20 bg-white origin-bottom rounded-full transition-transform duration-300"
              style={{
                transform: `translate(-50%, -100%) rotate(${getNeedleRotation(currentSpeed)}deg)`
              }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
            </div>

            {/* Center display */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className={`text-3xl sm:text-4xl font-bold font-mono transition-colors duration-300 ${
                getSpeedColor(currentSpeed, threshold)
              }`}>
                {currentSpeed}
              </p>
              <p className="text-xs text-gray-400">mph</p>
            </div>

            {/* Speed limit badge */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              Limit: {threshold}
            </div>

            {/* Acceleration indicator */}
            <div className="absolute top-4 right-4">
              {acceleration > 1 ? (
                <IoTrendingUpOutline className="w-5 h-5 text-green-400" />
              ) : acceleration < -1 ? (
                <IoTrendingDownOutline className="w-5 h-5 text-red-400" />
              ) : (
                <div className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Over limit warning */}
          {isOverLimit && (
            <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 animate-pulse">
              <IoWarningOutline className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-400 font-medium">
                Exceeding limit for {overLimitDuration}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Speed Trend Graph */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoTrendingUpOutline className="w-4 h-4" />
          Speed History (60s)
        </h4>
        <div className="h-20 sm:h-24 relative">
          {/* Threshold line */}
          <div
            className="absolute w-full h-px bg-orange-500 opacity-50"
            style={{ bottom: `${(threshold / 120) * 100}%` }}
          />
          <span
            className="absolute right-0 text-[8px] text-orange-400"
            style={{ bottom: `${(threshold / 120) * 100}%`, transform: 'translateY(50%)' }}
          >
            {threshold}
          </span>

          {/* Speed line chart */}
          <svg className="w-full h-full">
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              points={speedHistory
                .slice(-60)
                .map((point, i, arr) => {
                  const x = (i / (arr.length - 1 || 1)) * 100
                  const y = 100 - (point.speed / 120) * 100
                  return `${x}%,${y}%`
                })
                .join(' ')}
              className="transition-all duration-300"
            />
            {/* Current speed dot */}
            {speedHistory.length > 0 && (
              <circle
                cx="100%"
                cy={`${100 - (currentSpeed / 120) * 100}%`}
                r="4"
                fill={currentSpeed > threshold ? '#ef4444' : '#22c55e'}
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[8px] text-gray-500">
            <span>120</span>
            <span>60</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Current Road */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoCarSportOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-blue-400" />
          <p className="text-[10px] sm:text-xs font-medium text-white truncate">{currentRoadType}</p>
          <p className="text-[8px] sm:text-xs text-gray-400">{ROAD_LIMITS[currentRoadType]} mph</p>
        </div>

        {/* Driver Score */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoSpeedometerOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${getScoreColor(driverScore)}`} />
          <p className={`text-sm sm:text-lg font-bold ${getScoreColor(driverScore)}`}>
            {Math.round(driverScore)}
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">Score</p>
        </div>

        {/* Today's Alerts */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoWarningOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${alerts.length > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
          <p className="text-sm sm:text-lg font-bold text-white">{alerts.length}</p>
          <p className="text-[8px] sm:text-xs text-gray-400">Alerts</p>
        </div>

        {/* Max Speed */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoTrendingUpOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-red-400" />
          <p className="text-sm sm:text-lg font-bold text-white">
            {speedHistory.length > 0 ? Math.round(Math.max(...speedHistory.map(p => p.speed))) : currentSpeed}
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">Max mph</p>
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-300 flex items-center gap-2">
            <IoSettingsOutline className="w-4 h-4" />
            Alert Threshold
          </h4>
          <span className="text-sm font-bold text-orange-400">{threshold} mph</span>
        </div>
        <input
          type="range"
          min="25"
          max="85"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-orange-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>25 (School)</span>
          <span>55 (Highway)</span>
          <span>85 (Max)</span>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
          <IoNotificationsOutline className="w-4 h-4" />
          Recent Speed Alerts
        </h4>
        {alerts.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <IoWarningOutline className="w-3.5 h-3.5 text-orange-400" />
                  <span className={`font-bold ${getSpeedColor(alert.speed, alert.threshold)}`}>
                    {alert.speed} mph
                  </span>
                  <span className="text-gray-500">
                    ({alert.roadType}, limit {alert.threshold})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{alert.duration}s</span>
                  <span className="text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">No speed alerts recorded</p>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoInformationCircleOutline className="w-4 h-4" />
          How It Works
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Speed data is read from your vehicle&apos;s OBD-II port or telematics system and compared against your configured threshold. Alerts are generated when the threshold is exceeded.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          Important Notice
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Speed limit data may not be available for all roads. Alerts are typically delivered at the end of each trip, not in real-time while driving. Speed readings come from the vehicle&apos;s computer and may vary slightly from GPS-calculated speed. This feature is designed for fleet management and driver coaching, not real-time intervention.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">Bouncie:</span> Posted speed limit comparison, end-of-trip alerts</li>
          <li><span className="text-white font-medium">Zubie:</span> Instant alerts for speeding and harsh driving</li>
          <li><span className="text-white font-medium">MooveTrax:</span> Comprehensive driver behavior monitoring</li>
          <li><span className="text-white font-medium">Trackimo:</span> Customizable speed thresholds, multi-channel alerts</li>
          <li><span className="text-gray-500 font-medium">Smartcar:</span> <span className="text-gray-500">Does not specifically offer speed alerts</span></li>
        </ul>
      </div>
    </div>
  )
}
