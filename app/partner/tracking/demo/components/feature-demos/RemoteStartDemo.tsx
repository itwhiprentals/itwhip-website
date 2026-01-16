// app/partner/tracking/demo/components/feature-demos/RemoteStartDemo.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IoFlameOutline,
  IoSpeedometerOutline,
  IoThermometerOutline,
  IoBatteryChargingOutline,
  IoWaterOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoStopCircleOutline,
  IoPlayCircleOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

type EnginePhase = 'off' | 'starting' | 'cranking' | 'running' | 'stopping'

interface EngineStats {
  rpm: number
  coolantTemp: number
  oilTemp: number
  batteryVoltage: number
  fuelLevel: number
  runtime: number
}

interface StartEvent {
  action: 'start' | 'stop'
  timestamp: Date
  runtime: number
  success: boolean
}

const MAX_RUNTIME = 600 // 10 minutes in seconds

export default function RemoteStartDemo() {
  const [enginePhase, setEnginePhase] = useState<EnginePhase>('off')
  const [stats, setStats] = useState<EngineStats>({
    rpm: 0,
    coolantTemp: 72,
    oilTemp: 68,
    batteryVoltage: 12.4,
    fuelLevel: 78,
    runtime: 0
  })
  const [startHistory, setStartHistory] = useState<StartEvent[]>([
    { action: 'stop', timestamp: new Date(Date.now() - 1800000), runtime: 480, success: true },
    { action: 'start', timestamp: new Date(Date.now() - 2100000), runtime: 0, success: true }
  ])

  // Simulate engine running
  useEffect(() => {
    if (enginePhase !== 'running') return

    const interval = setInterval(() => {
      setStats(prev => {
        const newRuntime = prev.runtime + 1
        // Auto-stop after max runtime
        if (newRuntime >= MAX_RUNTIME) {
          setEnginePhase('stopping')
          return prev
        }

        return {
          ...prev,
          rpm: 750 + Math.random() * 100,
          coolantTemp: Math.min(195, prev.coolantTemp + (prev.coolantTemp < 180 ? 2 : 0.1)),
          oilTemp: Math.min(210, prev.oilTemp + (prev.oilTemp < 190 ? 1.5 : 0.05)),
          batteryVoltage: 14.2 + Math.random() * 0.3,
          runtime: newRuntime
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [enginePhase])

  // Handle phase transitions
  useEffect(() => {
    if (enginePhase === 'starting') {
      setTimeout(() => setEnginePhase('cranking'), 500)
    } else if (enginePhase === 'cranking') {
      // Simulate cranking animation
      const crankInterval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          rpm: Math.random() * 400 + 100
        }))
      }, 100)

      setTimeout(() => {
        clearInterval(crankInterval)
        setStats(prev => ({
          ...prev,
          rpm: 800,
          batteryVoltage: 14.4
        }))
        setEnginePhase('running')
        setStartHistory(prev => [
          { action: 'start', timestamp: new Date(), runtime: 0, success: true },
          ...prev.slice(0, 4)
        ])
      }, 2000)

      return () => clearInterval(crankInterval)
    } else if (enginePhase === 'stopping') {
      setStats(prev => {
        setStartHistory(h => [
          { action: 'stop', timestamp: new Date(), runtime: prev.runtime, success: true },
          ...h.slice(0, 4)
        ])
        return {
          ...prev,
          rpm: 0,
          batteryVoltage: 12.4,
          runtime: 0
        }
      })
      setTimeout(() => setEnginePhase('off'), 500)
    }
  }, [enginePhase])

  const handleStart = () => {
    if (enginePhase !== 'off') return
    setEnginePhase('starting')
  }

  const handleStop = () => {
    if (enginePhase !== 'running') return
    setEnginePhase('stopping')
  }

  const formatRuntime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const getRpmAngle = (rpm: number): number => {
    // Map 0-8000 RPM to -135 to 135 degrees
    return Math.min(135, Math.max(-135, (rpm / 8000) * 270 - 135))
  }

  const getTempColor = (temp: number, type: 'coolant' | 'oil'): string => {
    const optimal = type === 'coolant' ? 195 : 210
    const cold = type === 'coolant' ? 140 : 130
    if (temp < cold) return 'text-blue-400'
    if (temp >= optimal - 10) return 'text-green-400'
    return 'text-yellow-400'
  }

  const isRunning = enginePhase === 'running'
  const isTransitioning = enginePhase === 'starting' || enginePhase === 'cranking' || enginePhase === 'stopping'

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* RPM Gauge */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col items-center">
          {/* Circular RPM Gauge */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            {/* Background arc */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Gauge background */}
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
              {/* Active gauge */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={isRunning ? '#22c55e' : isTransitioning ? '#eab308' : '#6b7280'}
                strokeWidth="12"
                strokeDasharray="377"
                strokeDashoffset={377 - (stats.rpm / 8000) * 283}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {/* Tick marks */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                const angle = (i / 8) * 270 - 135
                const rad = (angle * Math.PI) / 180
                const x1 = 100 + 65 * Math.cos(rad)
                const y1 = 100 + 65 * Math.sin(rad)
                const x2 = 100 + 75 * Math.cos(rad)
                const y2 = 100 + 75 * Math.sin(rad)
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#9ca3af"
                    strokeWidth="2"
                    transform="rotate(90 100 100)"
                  />
                )
              })}
            </svg>

            {/* Needle */}
            <div
              className="absolute top-1/2 left-1/2 w-1 h-16 sm:h-20 bg-red-500 origin-bottom rounded-full transition-transform duration-100"
              style={{
                transform: `translate(-50%, -100%) rotate(${getRpmAngle(stats.rpm)}deg)`
              }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
            </div>

            {/* Center hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full border-2 border-gray-600" />

            {/* RPM Display */}
            <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 text-center">
              <p className={`text-2xl sm:text-3xl font-bold font-mono ${isRunning ? 'text-green-400' : 'text-gray-400'}`}>
                {Math.round(stats.rpm)}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">RPM</p>
            </div>

            {/* Engine status icon */}
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 ${
              isRunning ? 'text-green-400' : isTransitioning ? 'text-yellow-400 animate-pulse' : 'text-gray-500'
            }`}>
              <IoFlameOutline className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>

          {/* Status Badge */}
          <div className={`mt-4 px-4 py-2 rounded-full flex items-center gap-2 ${
            isRunning
              ? 'bg-green-500/20 text-green-400'
              : isTransitioning
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-gray-700 text-gray-400'
          }`}>
            {isTransitioning && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {isRunning && <IoCheckmarkCircle className="w-4 h-4" />}
            <span className="text-sm font-medium capitalize">
              Engine {enginePhase === 'off' ? 'Off' : enginePhase}
            </span>
          </div>
        </div>
      </div>

      {/* Engine Stats Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Coolant Temp */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoThermometerOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${getTempColor(stats.coolantTemp, 'coolant')}`} />
          <p className={`text-sm sm:text-lg font-bold ${getTempColor(stats.coolantTemp, 'coolant')}`}>
            {Math.round(stats.coolantTemp)}°
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">Coolant</p>
        </div>

        {/* Oil Temp */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoWaterOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${getTempColor(stats.oilTemp, 'oil')}`} />
          <p className={`text-sm sm:text-lg font-bold ${getTempColor(stats.oilTemp, 'oil')}`}>
            {Math.round(stats.oilTemp)}°
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">Oil Temp</p>
        </div>

        {/* Battery */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoBatteryChargingOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
            stats.batteryVoltage > 13.5 ? 'text-green-400' : 'text-yellow-400'
          }`} />
          <p className="text-sm sm:text-lg font-bold text-white">
            {stats.batteryVoltage.toFixed(1)}
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">Volts</p>
        </div>

        {/* Fuel Level */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22V8a2 2 0 012-2h8a2 2 0 012 2v14" className={stats.fuelLevel > 20 ? 'text-green-400' : 'text-red-400'} />
            <path d="M15 22V10a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2" className="text-gray-400" />
          </svg>
          <p className={`text-sm sm:text-lg font-bold ${stats.fuelLevel > 20 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.fuelLevel}%
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">Fuel</p>
        </div>

        {/* Runtime */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center col-span-3 sm:col-span-1">
          <IoTimeOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${isRunning ? 'text-orange-400' : 'text-gray-400'}`} />
          <p className={`text-sm sm:text-lg font-bold font-mono ${isRunning ? 'text-orange-400' : 'text-gray-400'}`}>
            {formatRuntime(stats.runtime)}
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">
            {isRunning ? `/ ${formatRuntime(MAX_RUNTIME)}` : 'Runtime'}
          </p>
        </div>
      </div>

      {/* Runtime Progress Bar (when running) */}
      {isRunning && (
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Auto-stop in {formatRuntime(MAX_RUNTIME - stats.runtime)}</span>
            <span>{Math.round((stats.runtime / MAX_RUNTIME) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-1000"
              style={{ width: `${(stats.runtime / MAX_RUNTIME) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={handleStart}
          disabled={enginePhase !== 'off'}
          className={`flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            enginePhase !== 'off'
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25'
          }`}
        >
          <IoPlayCircleOutline className="w-5 h-5 sm:w-6 sm:h-6" />
          Start Engine
        </button>

        <button
          onClick={handleStop}
          disabled={enginePhase !== 'running'}
          className={`flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            enginePhase !== 'running'
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25'
          }`}
        >
          <IoStopCircleOutline className="w-5 h-5 sm:w-6 sm:h-6" />
          Stop Engine
        </button>
      </div>

      {/* Start History */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
          <IoTimeOutline className="w-4 h-4" />
          Start History
        </h4>
        <div className="space-y-2">
          {startHistory.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-2">
                {event.action === 'start' ? (
                  <IoPlayCircleOutline className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <IoStopCircleOutline className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className="text-gray-300 capitalize">Engine {event.action}ed</span>
                {event.action === 'stop' && event.runtime > 0 && (
                  <span className="text-gray-500">({formatRuntime(event.runtime)})</span>
                )}
              </div>
              <span className="text-gray-400">
                {event.timestamp.toLocaleTimeString()}
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
          Remote start sends a secure command to your vehicle&apos;s engine control module. The engine runs for a preset duration (typically 10-15 minutes) to allow cabin conditioning before driving.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          Important Notice
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Remote start is primarily available through manufacturer apps (FordPass, GM OnStar, Kia UVO). Third-party tracking providers have limited remote start capabilities. Never use remote start in enclosed spaces. Vehicle must be in Park with doors locked. Some jurisdictions restrict remote start usage—check local regulations.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">Smartcar:</span> Working to add remote start API (not currently available)</li>
          <li><span className="text-gray-500 font-medium">MooveTrax/Bouncie/Zubie/Trackimo:</span> <span className="text-gray-500">Do not offer remote start</span></li>
          <li><span className="text-green-400 font-medium">Best option:</span> Use manufacturer&apos;s official connected car app</li>
        </ul>
      </div>
    </div>
  )
}
