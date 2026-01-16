// app/partner/tracking/demo/components/feature-demos/PreCoolDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoSnowOutline,
  IoSunnyOutline,
  IoThermometerOutline,
  IoPersonOutline,
  IoSpeedometerOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoFlashOutline,
  IoInformationCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

type ClimatePhase = 'off' | 'starting' | 'cooling' | 'heating' | 'reached'
type ZoneMode = 'off' | 'cool' | 'heat'

interface ZoneSettings {
  driver: ZoneMode
  passenger: ZoneMode
  rear: ZoneMode
}

interface SeatSettings {
  driverCool: boolean
  driverHeat: boolean
  passengerCool: boolean
  passengerHeat: boolean
}

export default function PreCoolDemo() {
  const [phase, setPhase] = useState<ClimatePhase>('off')
  const [exteriorTemp, setExteriorTemp] = useState(98) // Hot day
  const [interiorTemp, setInteriorTemp] = useState(112)
  const [targetTemp, setTargetTemp] = useState(72)
  const [zones, setZones] = useState<ZoneSettings>({
    driver: 'off',
    passenger: 'off',
    rear: 'off'
  })
  const [seats, setSeats] = useState<SeatSettings>({
    driverCool: false,
    driverHeat: false,
    passengerCool: false,
    passengerHeat: false
  })
  const [fanSpeed, setFanSpeed] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [runtime, setRuntime] = useState(0)
  const [powerDraw, setPowerDraw] = useState(0)
  const [defrostActive, setDefrostActive] = useState(false)

  // Calculate estimated time based on temp difference
  useEffect(() => {
    const diff = Math.abs(interiorTemp - targetTemp)
    setEstimatedTime(Math.ceil(diff / 5) * 60) // ~5°F per minute
  }, [interiorTemp, targetTemp])

  // Simulate cooling/heating
  useEffect(() => {
    if (phase !== 'cooling' && phase !== 'heating') return

    const interval = setInterval(() => {
      setRuntime(prev => prev + 1)

      setInteriorTemp(prev => {
        const isCooling = phase === 'cooling'
        const change = isCooling ? -0.8 : 0.6
        const newTemp = prev + change + (Math.random() - 0.5) * 0.2

        // Check if target reached
        if ((isCooling && newTemp <= targetTemp) || (!isCooling && newTemp >= targetTemp)) {
          setPhase('reached')
          return targetTemp
        }

        return newTemp
      })

      // Simulate varying fan speed
      setFanSpeed(prev => Math.min(5, prev + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)))

      // Power draw varies with intensity
      setPowerDraw(prev => {
        const base = phase === 'cooling' ? 3.2 : 2.1
        return base + (Math.random() - 0.5) * 0.4
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, targetTemp])

  const handleActivate = () => {
    if (phase !== 'off' && phase !== 'reached') return

    setPhase('starting')
    setRuntime(0)
    setFanSpeed(3)
    setPowerDraw(1.5)

    // Determine if cooling or heating based on current vs target
    setTimeout(() => {
      if (interiorTemp > targetTemp) {
        setPhase('cooling')
        setZones({ driver: 'cool', passenger: 'cool', rear: 'cool' })
        setSeats(prev => ({ ...prev, driverCool: true }))
      } else {
        setPhase('heating')
        setZones({ driver: 'heat', passenger: 'heat', rear: 'heat' })
        setSeats(prev => ({ ...prev, driverHeat: true }))
      }
    }, 1500)
  }

  const handleStop = () => {
    setPhase('off')
    setFanSpeed(0)
    setPowerDraw(0)
    setZones({ driver: 'off', passenger: 'off', rear: 'off' })
    setSeats({ driverCool: false, driverHeat: false, passengerCool: false, passengerHeat: false })
    setRuntime(0)
  }

  const getTempColor = (temp: number): string => {
    if (temp >= 90) return 'text-red-500'
    if (temp >= 80) return 'text-orange-500'
    if (temp >= 70) return 'text-green-500'
    if (temp >= 60) return 'text-blue-400'
    return 'text-blue-600'
  }

  const getTempGradient = (temp: number): string => {
    if (temp >= 90) return 'from-red-500 to-orange-500'
    if (temp >= 80) return 'from-orange-500 to-yellow-500'
    if (temp >= 70) return 'from-green-500 to-emerald-500'
    if (temp >= 60) return 'from-blue-400 to-cyan-400'
    return 'from-blue-600 to-indigo-600'
  }

  const getZoneIcon = (mode: ZoneMode) => {
    if (mode === 'cool') return <IoSnowOutline className="w-4 h-4 text-blue-400" />
    if (mode === 'heat') return <IoSunnyOutline className="w-4 h-4 text-orange-400" />
    return <div className="w-4 h-4 rounded-full border border-gray-500" />
  }

  const isActive = phase === 'cooling' || phase === 'heating' || phase === 'reached'

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Temperature Display */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col items-center">
          {/* Dual Temperature Gauge */}
          <div className="relative w-64 h-32 sm:w-80 sm:h-40">
            {/* Interior Temp (large, center) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center">
              <div className="flex items-baseline gap-1">
                <span className={`text-5xl sm:text-6xl font-bold font-mono ${getTempColor(interiorTemp)}`}>
                  {Math.round(interiorTemp)}
                </span>
                <span className="text-xl sm:text-2xl text-gray-400">°F</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Interior</p>
            </div>

            {/* Temperature animation rays when cooling/heating */}
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-1 h-6 rounded-full opacity-30 ${
                      phase === 'cooling' ? 'bg-blue-400' : 'bg-orange-400'
                    }`}
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-50px)`,
                      animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Target Temp Control */}
          <div className="mt-4 w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Target Temperature</span>
              <span className="text-sm font-bold text-white">{targetTemp}°F</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="60"
                max="85"
                value={targetTemp}
                onChange={(e) => setTargetTemp(Number(e.target.value))}
                disabled={isActive}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>60°</span>
                <span>72°</span>
                <span>85°</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`mt-4 px-4 py-2 rounded-full flex items-center gap-2 ${
            phase === 'reached'
              ? 'bg-green-500/20 text-green-400'
              : phase === 'cooling'
                ? 'bg-blue-500/20 text-blue-400'
                : phase === 'heating'
                  ? 'bg-orange-500/20 text-orange-400'
                  : phase === 'starting'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-700 text-gray-400'
          }`}>
            {phase === 'starting' && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {phase === 'cooling' && <IoSnowOutline className="w-4 h-4" />}
            {phase === 'heating' && <IoSunnyOutline className="w-4 h-4" />}
            {phase === 'reached' && <IoCheckmarkCircle className="w-4 h-4" />}
            <span className="text-sm font-medium capitalize">
              {phase === 'off' ? 'Climate Off' : phase === 'reached' ? 'Target Reached' : phase}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Exterior Temp */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoSunnyOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-yellow-500" />
          <p className="text-sm sm:text-lg font-bold text-yellow-500">{exteriorTemp}°</p>
          <p className="text-[8px] sm:text-xs text-gray-400">Outside</p>
        </div>

        {/* Fan Speed */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoSpeedometerOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${fanSpeed > 0 ? 'text-blue-400' : 'text-gray-500'}`} />
          <p className="text-sm sm:text-lg font-bold text-white">{fanSpeed}/5</p>
          <p className="text-[8px] sm:text-xs text-gray-400">Fan</p>
        </div>

        {/* Power Draw */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoFlashOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${powerDraw > 0 ? 'text-yellow-400' : 'text-gray-500'}`} />
          <p className="text-sm sm:text-lg font-bold text-white">{powerDraw.toFixed(1)}</p>
          <p className="text-[8px] sm:text-xs text-gray-400">kW</p>
        </div>

        {/* Runtime / ETA */}
        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
          <IoTimeOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${isActive ? 'text-green-400' : 'text-gray-500'}`} />
          <p className="text-sm sm:text-lg font-bold text-white">
            {isActive ? Math.floor(runtime / 60) : Math.floor(estimatedTime / 60)}
          </p>
          <p className="text-[8px] sm:text-xs text-gray-400">
            {isActive ? 'min' : 'ETA min'}
          </p>
        </div>
      </div>

      {/* Zone Controls */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <IoPersonOutline className="w-4 h-4" />
          Climate Zones
        </h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Driver Zone */}
          <div className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-colors ${
            zones.driver !== 'off'
              ? zones.driver === 'cool' ? 'border-blue-500 bg-blue-500/10' : 'border-orange-500 bg-orange-500/10'
              : 'border-gray-700 bg-gray-900'
          }`}>
            {getZoneIcon(zones.driver)}
            <p className="text-xs sm:text-sm font-medium text-white mt-1">Driver</p>
            <p className="text-[10px] text-gray-400 capitalize">{zones.driver}</p>
          </div>

          {/* Passenger Zone */}
          <div className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-colors ${
            zones.passenger !== 'off'
              ? zones.passenger === 'cool' ? 'border-blue-500 bg-blue-500/10' : 'border-orange-500 bg-orange-500/10'
              : 'border-gray-700 bg-gray-900'
          }`}>
            {getZoneIcon(zones.passenger)}
            <p className="text-xs sm:text-sm font-medium text-white mt-1">Passenger</p>
            <p className="text-[10px] text-gray-400 capitalize">{zones.passenger}</p>
          </div>

          {/* Rear Zone */}
          <div className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-colors ${
            zones.rear !== 'off'
              ? zones.rear === 'cool' ? 'border-blue-500 bg-blue-500/10' : 'border-orange-500 bg-orange-500/10'
              : 'border-gray-700 bg-gray-900'
          }`}>
            {getZoneIcon(zones.rear)}
            <p className="text-xs sm:text-sm font-medium text-white mt-1">Rear</p>
            <p className="text-[10px] text-gray-400 capitalize">{zones.rear}</p>
          </div>
        </div>
      </div>

      {/* Seat Climate Status */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3">Seat Climate</h4>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Driver Seat */}
          <div className="flex items-center justify-between bg-gray-900 rounded-lg p-2 sm:p-3">
            <span className="text-xs sm:text-sm text-gray-300">Driver Seat</span>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${seats.driverCool ? 'bg-blue-500/20' : 'bg-gray-700'}`}>
                <IoSnowOutline className={`w-3.5 h-3.5 ${seats.driverCool ? 'text-blue-400' : 'text-gray-500'}`} />
              </div>
              <div className={`p-1.5 rounded ${seats.driverHeat ? 'bg-orange-500/20' : 'bg-gray-700'}`}>
                <IoSunnyOutline className={`w-3.5 h-3.5 ${seats.driverHeat ? 'text-orange-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </div>

          {/* Passenger Seat */}
          <div className="flex items-center justify-between bg-gray-900 rounded-lg p-2 sm:p-3">
            <span className="text-xs sm:text-sm text-gray-300">Passenger Seat</span>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${seats.passengerCool ? 'bg-blue-500/20' : 'bg-gray-700'}`}>
                <IoSnowOutline className={`w-3.5 h-3.5 ${seats.passengerCool ? 'text-blue-400' : 'text-gray-500'}`} />
              </div>
              <div className={`p-1.5 rounded ${seats.passengerHeat ? 'bg-orange-500/20' : 'bg-gray-700'}`}>
                <IoSunnyOutline className={`w-3.5 h-3.5 ${seats.passengerHeat ? 'text-orange-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={handleActivate}
          disabled={phase !== 'off' && phase !== 'reached'}
          className={`flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            phase !== 'off' && phase !== 'reached'
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
          }`}
        >
          <IoSnowOutline className="w-5 h-5 sm:w-6 sm:h-6" />
          {phase === 'reached' ? 'Restart' : 'Start Climate'}
        </button>

        <button
          onClick={handleStop}
          disabled={!isActive && phase !== 'starting'}
          className={`flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            !isActive && phase !== 'starting'
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25'
          }`}
        >
          Stop Climate
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoInformationCircleOutline className="w-4 h-4" />
          How It Works
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Climate preconditioning activates your vehicle&apos;s HVAC system to cool or heat the cabin before departure. On electric vehicles, this can be done while plugged in to preserve battery range.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          Important Notice
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Climate control preconditioning is available independently of remote start on many electric and hybrid vehicles. This feature uses battery power and may reduce available range if not plugged in. Effectiveness depends on exterior temperature and vehicle insulation.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">Smartcar:</span> Full climate preconditioning API for supported vehicles</li>
          <li><span className="text-gray-500 font-medium">MooveTrax/Bouncie/Zubie/Trackimo:</span> <span className="text-gray-500">Do not offer climate control</span></li>
          <li><span className="text-green-400 font-medium">Works best on:</span> EVs and newer vehicles with connected services</li>
        </ul>
      </div>
    </div>
  )
}
