// app/partner/tracking/demo/components/feature-demos/HonkDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoVolumeHighOutline,
  IoFlashlightOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCarSportOutline,
  IoNavigateOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

type HonkPhase = 'idle' | 'sending' | 'honking'

interface HonkOptions {
  flash: boolean
  duration: number // seconds
  intensity: 'low' | 'medium' | 'high' | 'panic'
}

interface ParkingLocation {
  lat: number
  lng: number
  address: string
  timestamp: Date
}

export default function HonkDemo() {
  const [phase, setPhase] = useState<HonkPhase>('idle')
  const [options, setOptions] = useState<HonkOptions>({
    flash: true,
    duration: 3,
    intensity: 'medium'
  })
  const [waveCount, setWaveCount] = useState(0)
  const [flashState, setFlashState] = useState(false)
  const [parkingLocation] = useState<ParkingLocation>({
    lat: 33.4350,
    lng: -112.1350,
    address: '2501 E Camelback Rd, Phoenix, AZ',
    timestamp: new Date(Date.now() - 3600000)
  })
  const [distance] = useState(0.3) // miles
  const [recentHonks, setRecentHonks] = useState([
    { timestamp: new Date(Date.now() - 7200000), duration: 3, flash: true },
    { timestamp: new Date(Date.now() - 86400000), duration: 2, flash: false }
  ])

  // Honking animation
  useEffect(() => {
    if (phase !== 'honking') return

    // Sound wave animation
    const waveInterval = setInterval(() => {
      setWaveCount(prev => (prev + 1) % 4)
    }, 200)

    // Flash animation
    let flashInterval: NodeJS.Timeout | null = null
    if (options.flash) {
      flashInterval = setInterval(() => {
        setFlashState(prev => !prev)
      }, 150)
    }

    // Duration timer
    const durationTimeout = setTimeout(() => {
      setPhase('idle')
      setWaveCount(0)
      setFlashState(false)
    }, options.duration * 1000)

    return () => {
      clearInterval(waveInterval)
      if (flashInterval) clearInterval(flashInterval)
      clearTimeout(durationTimeout)
    }
  }, [phase, options.duration, options.flash])

  const handleHonk = () => {
    if (phase !== 'idle') return

    setPhase('sending')
    setTimeout(() => {
      setPhase('honking')
      setRecentHonks(prev => [
        { timestamp: new Date(), duration: options.duration, flash: options.flash },
        ...prev.slice(0, 4)
      ])
    }, 800)
  }

  const getIntensityColor = (intensity: string): string => {
    switch (intensity) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'panic': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getIntensityBg = (intensity: string): string => {
    switch (intensity) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-orange-500'
      case 'panic': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Vehicle Visualization */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="relative flex flex-col items-center">
          {/* Sound Waves */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Concentric wave circles */}
            {phase === 'honking' && [...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full border-2 transition-all duration-300 ${
                  i <= waveCount
                    ? `border-${options.intensity === 'panic' ? 'red' : 'orange'}-500 opacity-${100 - i * 20}`
                    : 'border-gray-700 opacity-20'
                }`}
                style={{
                  width: `${80 + i * 40}px`,
                  height: `${80 + i * 40}px`,
                  transform: i <= waveCount ? 'scale(1.1)' : 'scale(1)',
                  borderColor: i <= waveCount
                    ? options.intensity === 'panic' ? '#ef4444' : '#f97316'
                    : '#374151'
                }}
              />
            ))}

            {/* Car with headlights */}
            <div className="relative z-10">
              {/* Headlight beams */}
              {phase === 'honking' && options.flash && (
                <>
                  <div
                    className={`absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-4 rounded-full blur-md transition-opacity ${
                      flashState ? 'bg-yellow-400 opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div
                    className={`absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-4 rounded-full blur-md transition-opacity ${
                      flashState ? 'bg-yellow-400 opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              )}

              {/* Car body */}
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center transition-all duration-150 ${
                phase === 'honking'
                  ? options.intensity === 'panic'
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : 'bg-orange-500 shadow-lg shadow-orange-500/50'
                  : 'bg-gray-700'
              } ${phase === 'honking' ? 'animate-pulse' : ''}`}>
                <IoCarSportOutline className={`w-10 h-10 sm:w-12 sm:h-12 ${
                  phase === 'honking' ? 'text-white' : 'text-gray-400'
                }`} />
              </div>

              {/* Sound icon */}
              {phase === 'honking' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <IoVolumeHighOutline className={`w-6 h-6 ${
                    options.intensity === 'panic' ? 'text-red-400' : 'text-orange-400'
                  } animate-bounce`} />
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className={`mt-4 px-4 py-2 rounded-full flex items-center gap-2 ${
            phase === 'honking'
              ? options.intensity === 'panic'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-orange-500/20 text-orange-400'
              : phase === 'sending'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-gray-700 text-gray-400'
          }`}>
            {phase === 'sending' && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {phase === 'honking' && <IoVolumeHighOutline className="w-4 h-4 animate-pulse" />}
            {phase === 'idle' && <IoCheckmarkCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {phase === 'idle' && 'Ready'}
              {phase === 'sending' && 'Sending Signal...'}
              {phase === 'honking' && (options.intensity === 'panic' ? 'PANIC ALARM!' : 'Honking...')}
            </span>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Flash Lights Toggle */}
        <button
          onClick={() => setOptions(prev => ({ ...prev, flash: !prev.flash }))}
          disabled={phase !== 'idle'}
          className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
            options.flash
              ? 'border-yellow-500 bg-yellow-500/20'
              : 'border-gray-700 bg-gray-800'
          } ${phase !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <IoFlashlightOutline className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
            options.flash ? 'text-yellow-400' : 'text-gray-500'
          }`} />
          <p className="text-sm font-medium text-white">Flash Lights</p>
          <p className="text-[10px] text-gray-400">{options.flash ? 'Enabled' : 'Disabled'}</p>
        </button>

        {/* Duration Selector */}
        <div className="p-3 sm:p-4 rounded-lg border-2 border-gray-700 bg-gray-800">
          <IoTimeOutline className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-400" />
          <p className="text-sm font-medium text-white mb-2">Duration</p>
          <div className="flex gap-1 justify-center">
            {[2, 3, 5, 10].map(sec => (
              <button
                key={sec}
                onClick={() => setOptions(prev => ({ ...prev, duration: sec }))}
                disabled={phase !== 'idle'}
                className={`px-2 py-1 text-xs rounded ${
                  options.duration === sec
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                } ${phase !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Intensity Selector */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <IoVolumeHighOutline className="w-4 h-4" />
          Sound Intensity
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {(['low', 'medium', 'high', 'panic'] as const).map(intensity => (
            <button
              key={intensity}
              onClick={() => setOptions(prev => ({ ...prev, intensity }))}
              disabled={phase !== 'idle'}
              className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                options.intensity === intensity
                  ? `border-current ${getIntensityColor(intensity)} bg-gray-900`
                  : 'border-gray-700 text-gray-500'
              } ${phase !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                {[1, 2, 3, 4].slice(0, ['low', 'medium', 'high', 'panic'].indexOf(intensity) + 1).map(bar => (
                  <div
                    key={bar}
                    className={`w-full h-1 rounded ${
                      options.intensity === intensity ? getIntensityBg(intensity) : 'bg-gray-600'
                    }`}
                  />
                ))}
                <span className="text-[10px] sm:text-xs capitalize mt-1">{intensity}</span>
              </div>
            </button>
          ))}
        </div>
        {options.intensity === 'panic' && (
          <p className="text-[10px] text-red-400 mt-2 text-center">
            Panic mode: Continuous alarm with maximum volume and rapid flashing
          </p>
        )}
      </div>

      {/* Parking Location */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <IoLocationOutline className="w-4 h-4" />
          Last Known Location
        </h4>
        <div className="flex items-start gap-3">
          {/* Mini Map Preview */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="relative">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-orange-500 rounded-full animate-ping opacity-50" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{parkingLocation.address}</p>
            <p className="text-xs text-gray-400 mt-1">
              Parked {parkingLocation.timestamp.toLocaleTimeString()}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <IoNavigateOutline className="w-3.5 h-3.5" />
                <span>{distance} mi away</span>
              </div>
              <button className="text-xs text-orange-400 hover:text-orange-300 underline">
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Honk Button */}
      <button
        onClick={handleHonk}
        disabled={phase !== 'idle'}
        className={`w-full py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all flex items-center justify-center gap-3 ${
          phase !== 'idle'
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : options.intensity === 'panic'
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25'
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-500/25'
        }`}
      >
        <IoVolumeHighOutline className="w-6 h-6 sm:w-7 sm:h-7" />
        {options.intensity === 'panic' ? 'Activate Panic Alarm' : 'Honk Horn'}
      </button>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
          <IoTimeOutline className="w-4 h-4" />
          Recent Activity
        </h4>
        <div className="space-y-2">
          {recentHonks.map((honk, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-2">
                <IoVolumeHighOutline className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-gray-300">Horn activated</span>
                <span className="text-gray-500">({honk.duration}s{honk.flash ? ', lights' : ''})</span>
              </div>
              <span className="text-gray-400">
                {honk.timestamp.toLocaleTimeString()}
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
          Remote horn and lights commands are sent to your vehicle to help locate it in parking lots or alert nearby people. The horn sounds and/or lights flash for a configurable duration.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          Important Notice
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Horn and lights features are intended for vehicle location assistance only. Excessive use in residential areas may violate noise ordinances. Panic mode should only be used in genuine emergencies. This feature requires compatible vehicle hardware and may not work on all makes/models.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">MooveTrax:</span> Remote honk and flash lights</li>
          <li><span className="text-white font-medium">Trackimo:</span> Device beep for locating the tracker itself</li>
          <li><span className="text-gray-500 font-medium">Bouncie/Smartcar/Zubie:</span> <span className="text-gray-500">Do not offer horn/lights control</span></li>
        </ul>
      </div>
    </div>
  )
}
