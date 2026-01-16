// app/partner/tracking/demo/components/VehicleInfoOverlay.tsx
'use client'

import {
  IoSpeedometerOutline,
  IoThermometerOutline,
  IoBatteryFullOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoNavigateOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoSnowOutline,
  IoPowerOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface VehicleData {
  id: string
  make: string
  model: string
  speed: number
  heading: number
  fuelLevel: number
  interiorTemp: number
  exteriorTemp: number
  isLocked: boolean
  engineRunning: boolean
  acOn: boolean
  location: string
  distanceFromBase: number
  tripEndsAt: string
  isDisabled: boolean
}

interface VehicleInfoOverlayProps {
  vehicle: VehicleData
  onClose: () => void
  onStartTrip: () => void
}

const getHeadingDirection = (heading: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(heading / 45) % 8
  return directions[index]
}

export default function VehicleInfoOverlay({ vehicle, onClose, onStartTrip }: VehicleInfoOverlayProps) {
  return (
    // Mobile: bottom sheet style, Desktop: top-right overlay
    <div className="absolute inset-x-2 bottom-2 sm:inset-auto sm:top-4 sm:right-16 z-10 sm:w-64">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{vehicle.make} {vehicle.model}</p>
            <p className="text-[10px] text-orange-200 truncate">{vehicle.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0 ml-2"
          >
            <IoCloseOutline className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Speed Display - More compact on mobile */}
        <div className="px-3 py-3 sm:px-4 sm:py-4 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 sm:border-4 flex items-center justify-center ${
                vehicle.speed === 0 ? 'border-gray-600' :
                vehicle.speed < 45 ? 'border-green-500' :
                vehicle.speed < 65 ? 'border-blue-500' :
                vehicle.speed < 80 ? 'border-yellow-500' : 'border-red-500'
              }`}>
                <div className="text-center">
                  <p className={`text-lg sm:text-2xl font-bold ${
                    vehicle.speed === 0 ? 'text-gray-400' :
                    vehicle.speed < 45 ? 'text-green-400' :
                    vehicle.speed < 65 ? 'text-blue-400' :
                    vehicle.speed < 80 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {vehicle.speed}
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase">mph</p>
                </div>
              </div>
              {vehicle.speed > 0 && (
                <div className="absolute -top-1 -right-1">
                  <IoNavigateOutline
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"
                    style={{ transform: `rotate(${vehicle.heading}deg)` }}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-300">
                <IoNavigateOutline className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Heading {getHeadingDirection(vehicle.heading)}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-300">
                <IoLocationOutline className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{vehicle.distanceFromBase} mi from base</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Grid - More compact on mobile with 6 cols */}
        <div className="grid grid-cols-6 sm:grid-cols-3 gap-px bg-gray-700">
          {/* Fuel */}
          <div className="bg-gray-800 p-1.5 sm:p-2 text-center">
            <IoBatteryFullOutline className={`w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 ${
              vehicle.fuelLevel > 50 ? 'text-green-400' :
              vehicle.fuelLevel > 25 ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <p className="text-[10px] sm:text-sm font-bold text-white">{vehicle.fuelLevel}%</p>
            <p className="text-[7px] sm:text-[8px] text-gray-400 uppercase">Fuel</p>
          </div>

          {/* Interior Temp */}
          <div className="bg-gray-800 p-1.5 sm:p-2 text-center">
            <IoThermometerOutline className={`w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 ${
              vehicle.interiorTemp < 80 ? 'text-cyan-400' :
              vehicle.interiorTemp < 100 ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <p className="text-[10px] sm:text-sm font-bold text-white">{vehicle.interiorTemp}°</p>
            <p className="text-[7px] sm:text-[8px] text-gray-400 uppercase">Temp</p>
          </div>

          {/* Lock Status */}
          <div className="bg-gray-800 p-1.5 sm:p-2 text-center">
            {vehicle.isLocked ? (
              <IoLockClosedOutline className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-green-400" />
            ) : (
              <IoLockOpenOutline className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-red-400" />
            )}
            <p className="text-[10px] sm:text-sm font-bold text-white">{vehicle.isLocked ? 'Yes' : 'No'}</p>
            <p className="text-[7px] sm:text-[8px] text-gray-400 uppercase">Lock</p>
          </div>

          {/* Engine */}
          <div className="bg-gray-800 p-1.5 sm:p-2 text-center">
            <IoPowerOutline className={`w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 ${
              vehicle.engineRunning ? 'text-green-400 animate-pulse' : 'text-gray-500'
            }`} />
            <p className="text-[10px] sm:text-sm font-bold text-white">{vehicle.engineRunning ? 'On' : 'Off'}</p>
            <p className="text-[7px] sm:text-[8px] text-gray-400 uppercase">Eng</p>
          </div>

          {/* A/C */}
          <div className="bg-gray-800 p-1.5 sm:p-2 text-center">
            <IoSnowOutline className={`w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 ${
              vehicle.acOn ? 'text-cyan-400' : 'text-gray-500'
            }`} />
            <p className="text-[10px] sm:text-sm font-bold text-white">{vehicle.acOn ? 'On' : 'Off'}</p>
            <p className="text-[7px] sm:text-[8px] text-gray-400 uppercase">A/C</p>
          </div>

          {/* Trip */}
          <div className="bg-gray-800 p-1.5 sm:p-2 text-center">
            <IoTimeOutline className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-orange-400" />
            <p className="text-[8px] sm:text-[10px] font-bold text-white leading-tight truncate">{vehicle.tripEndsAt || '-'}</p>
            <p className="text-[7px] sm:text-[8px] text-gray-400 uppercase">Trip</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-2 sm:p-3">
          <button
            onClick={onStartTrip}
            className="w-full py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <IoNavigateOutline className="w-3 h-3 sm:w-4 sm:h-4" />
            Replay Trip History
          </button>
        </div>

        {/* Status Bar */}
        {vehicle.isDisabled && (
          <div className="px-3 py-2 bg-red-600/20 border-t border-red-500/30">
            <p className="text-[10px] text-red-400 font-semibold text-center uppercase tracking-wide">
              ⚠️ Vehicle Disabled - Kill Switch Active
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
