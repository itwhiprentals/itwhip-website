// app/partner/tracking/demo/components/MapControls.tsx
'use client'

import { useState } from 'react'
import {
  IoLayersOutline,
  IoLocateOutline,
  IoContractOutline,
  IoExpandOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoMapOutline,
  IoGlobeOutline,
  IoEarthOutline
} from 'react-icons/io5'

export type MapStyle = 'dark' | 'satellite' | 'streets' | 'outdoors'

interface MapControlsProps {
  currentStyle: MapStyle
  onStyleChange: (style: MapStyle) => void
  showGeofences: boolean
  onToggleGeofences: () => void
  showTrails: boolean
  onToggleTrails: () => void
  show3D: boolean
  onToggle3D: () => void
  onFitBounds: () => void
  onZoomToVehicle?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

const MAP_STYLES: { id: MapStyle; label: string; icon: typeof IoMapOutline }[] = [
  { id: 'dark', label: 'Dark', icon: IoMapOutline },
  { id: 'satellite', label: 'Satellite', icon: IoEarthOutline },
  { id: 'streets', label: 'Streets', icon: IoGlobeOutline },
  { id: 'outdoors', label: 'Terrain', icon: IoLayersOutline }
]

export default function MapControls({
  currentStyle,
  onStyleChange,
  showGeofences,
  onToggleGeofences,
  showTrails,
  onToggleTrails,
  show3D,
  onToggle3D,
  onFitBounds,
  onZoomToVehicle,
  isFullscreen,
  onToggleFullscreen
}: MapControlsProps) {
  const [showStylePicker, setShowStylePicker] = useState(false)

  return (
    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-1.5 sm:gap-2">
      {/* Map Style Picker */}
      <div className="relative">
        <button
          onClick={() => setShowStylePicker(!showStylePicker)}
          className="p-1.5 sm:p-2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl hover:bg-gray-800 transition-colors group"
          title="Map Style"
        >
          <IoLayersOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white" />
        </button>

        {showStylePicker && (
          <div className="absolute top-full left-0 mt-1 sm:mt-2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl overflow-hidden">
            {MAP_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => {
                  onStyleChange(style.id)
                  setShowStylePicker(false)
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm transition-colors ${
                  currentStyle === style.id
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <style.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {style.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fit All Vehicles */}
      <button
        onClick={onFitBounds}
        className="p-1.5 sm:p-2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl hover:bg-gray-800 transition-colors group"
        title="Fit All Vehicles"
      >
        <IoContractOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white" />
      </button>

      {/* Toggle Geofences */}
      <button
        onClick={onToggleGeofences}
        className={`p-1.5 sm:p-2 backdrop-blur-sm rounded-lg border shadow-xl transition-colors group ${
          showGeofences
            ? 'bg-green-600/80 border-green-500 hover:bg-green-700'
            : 'bg-gray-900/95 border-gray-700 hover:bg-gray-800'
        }`}
        title={showGeofences ? 'Hide Geofences' : 'Show Geofences'}
      >
        {showGeofences ? (
          <IoEyeOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <IoEyeOffOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white" />
        )}
      </button>

      {/* Toggle Trails */}
      <button
        onClick={onToggleTrails}
        className={`p-1.5 sm:p-2 backdrop-blur-sm rounded-lg border shadow-xl transition-colors group ${
          showTrails
            ? 'bg-blue-600/80 border-blue-500 hover:bg-blue-700'
            : 'bg-gray-900/95 border-gray-700 hover:bg-gray-800'
        }`}
        title={showTrails ? 'Hide Trails' : 'Show Trails'}
      >
        <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${showTrails ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="21" cy="9" r="2" fill="currentColor" />
        </svg>
      </button>

      {/* Toggle 3D */}
      <button
        onClick={onToggle3D}
        className={`p-1.5 sm:p-2 backdrop-blur-sm rounded-lg border shadow-xl transition-colors group ${
          show3D
            ? 'bg-purple-600/80 border-purple-500 hover:bg-purple-700'
            : 'bg-gray-900/95 border-gray-700 hover:bg-gray-800'
        }`}
        title={show3D ? 'Disable 3D' : 'Enable 3D'}
      >
        <span className={`text-[10px] sm:text-xs font-bold ${show3D ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>3D</span>
      </button>

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 sm:p-2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl hover:bg-gray-800 transition-colors group"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <IoContractOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white" />
          ) : (
            <IoExpandOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white" />
          )}
        </button>
      )}
    </div>
  )
}
