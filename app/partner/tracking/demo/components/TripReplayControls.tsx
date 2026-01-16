// app/partner/tracking/demo/components/TripReplayControls.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IoPlayOutline,
  IoPauseOutline,
  IoPlaySkipBackOutline,
  IoPlaySkipForwardOutline,
  IoSpeedometerOutline,
  IoTimeOutline,
  IoLocationOutline
} from 'react-icons/io5'

interface TripPoint {
  lat: number
  lng: number
  speed: number
  timestamp: string
}

interface TripReplayControlsProps {
  tripData: TripPoint[]
  vehicleName: string
  isPlaying: boolean
  onPlayPause: () => void
  onSeek: (index: number) => void
  currentIndex: number
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
  onClose: () => void
}

export default function TripReplayControls({
  tripData,
  vehicleName,
  isPlaying,
  onPlayPause,
  onSeek,
  currentIndex,
  playbackSpeed,
  onSpeedChange,
  onClose
}: TripReplayControlsProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const currentPoint = tripData[currentIndex] || tripData[0]
  const progress = tripData.length > 0 ? (currentIndex / (tripData.length - 1)) * 100 : 0

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newIndex = Math.floor(percentage * (tripData.length - 1))
    onSeek(Math.max(0, Math.min(tripData.length - 1, newIndex)))
  }

  const getSpeedColor = (speed: number) => {
    if (speed < 45) return 'text-green-400'
    if (speed < 65) return 'text-blue-400'
    if (speed < 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-20 sm:w-[90%] sm:max-w-xl">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-b border-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <IoTimeOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-white">Trip Replay</span>
            <span className="text-[10px] sm:text-xs text-gray-400 truncate">• {vehicleName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-[10px] sm:text-xs flex-shrink-0 ml-2"
          >
            Close
          </button>
        </div>

        {/* Current Stats - Compact on mobile */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-gray-800/50">
          <div className="text-center">
            <IoSpeedometerOutline className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 ${getSpeedColor(currentPoint?.speed || 0)}`} />
            <p className={`text-sm sm:text-lg font-bold ${getSpeedColor(currentPoint?.speed || 0)}`}>
              {currentPoint?.speed || 0}
            </p>
            <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase">mph</p>
          </div>
          <div className="text-center">
            <IoTimeOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 text-blue-400" />
            <p className="text-xs sm:text-sm font-semibold text-white">
              {currentPoint?.timestamp || '--:--'}
            </p>
            <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase">Time</p>
          </div>
          <div className="text-center">
            <IoLocationOutline className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 text-green-400" />
            <p className="text-xs sm:text-sm font-semibold text-white">
              {currentIndex + 1}/{tripData.length}
            </p>
            <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase">Point</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div
            ref={progressRef}
            className="relative h-1.5 sm:h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
            onClick={handleProgressClick}
          >
            {/* Speed gradient background */}
            <div className="absolute inset-0 flex">
              {tripData.map((point, i) => {
                const width = 100 / tripData.length
                const color = point.speed < 45 ? '#22c55e' : point.speed < 65 ? '#3b82f6' : point.speed < 80 ? '#eab308' : '#ef4444'
                return (
                  <div
                    key={i}
                    style={{ width: `${width}%`, backgroundColor: color, opacity: i <= currentIndex ? 1 : 0.3 }}
                  />
                )
              })}
            </div>
            {/* Progress indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg border-2 border-orange-500 transition-all"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
        </div>

        {/* Controls - Simplified on mobile */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-t border-gray-700">
          {/* Playback Speed - Hidden on very small screens */}
          <div className="hidden xs:flex items-center gap-0.5 sm:gap-1">
            {[0.5, 1, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Play/Pause Controls */}
          <div className="flex items-center gap-1 sm:gap-2 mx-auto xs:mx-0">
            <button
              onClick={() => onSeek(0)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors"
            >
              <IoPlaySkipBackOutline className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onPlayPause}
              className="p-2 sm:p-3 bg-orange-600 hover:bg-orange-700 rounded-full transition-colors"
            >
              {isPlaying ? (
                <IoPauseOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <IoPlayOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </button>
            <button
              onClick={() => onSeek(tripData.length - 1)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors"
            >
              <IoPlaySkipForwardOutline className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Duration - Hidden on very small screens */}
          <div className="hidden xs:block text-right">
            <p className="text-[10px] sm:text-xs text-gray-400">Duration</p>
            <p className="text-xs sm:text-sm font-semibold text-white">
              {Math.floor(tripData.length * 10 / 60)}:{String(tripData.length * 10 % 60).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
