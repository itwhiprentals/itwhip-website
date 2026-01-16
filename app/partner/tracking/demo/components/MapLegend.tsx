// app/partner/tracking/demo/components/MapLegend.tsx
'use client'

import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5'

interface MapLegendProps {
  isExpanded?: boolean
  onToggle?: () => void
}

export default function MapLegend({ isExpanded = true, onToggle }: MapLegendProps) {
  return (
    // Position: bottom-right on mobile (avoid controls), bottom-left on desktop
    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto z-10">
      <div className={`bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl transition-all duration-300 ${
        isExpanded ? 'w-36 sm:w-44' : 'w-auto'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="w-full px-2 py-1.5 sm:p-2 flex items-center justify-between gap-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Legend
          </span>
          {isExpanded ? (
            <IoChevronDownOutline className="w-3 h-3 text-gray-400" />
          ) : (
            <IoChevronUpOutline className="w-3 h-3 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="px-2 pb-2 sm:p-3 sm:pt-0 space-y-1.5 sm:space-y-2 max-h-[180px] sm:max-h-none overflow-y-auto">
            {/* Vehicle Status */}
            <div className="space-y-1">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Vehicles</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 sm:grid-cols-1 sm:gap-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-500 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] text-gray-300">Moving</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-500" />
                  <span className="text-[9px] sm:text-[10px] text-gray-300">Parked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-yellow-500" />
                  <span className="text-[9px] sm:text-[10px] text-gray-300">Idle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-red-500" />
                  <span className="text-[9px] sm:text-[10px] text-gray-300">Disabled</span>
                </div>
              </div>
            </div>

            {/* Geofences */}
            <div className="space-y-1 pt-1.5 sm:pt-2 border-t border-gray-700">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Zones</p>
              <div className="grid grid-cols-1 gap-y-0.5 sm:gap-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-dashed border-green-500 bg-green-500/20" />
                  <span className="text-[9px] sm:text-[10px] text-gray-300">Safe Zone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-dashed border-blue-500 bg-blue-500/20" />
                  <span className="text-[9px] sm:text-[10px] text-gray-300">Airport</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-dashed border-orange-500 bg-orange-500/20" />
                  <span className="text-[9px] sm:text-[10px] text-gray-300">Home Base</span>
                </div>
              </div>
            </div>

            {/* Speed Indicator - Only show on desktop */}
            <div className="hidden sm:block space-y-1 pt-2 border-t border-gray-700">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Speed</p>
              <div className="flex items-center justify-between text-[9px] text-gray-400">
                <span>0</span>
                <div className="flex-1 mx-2 h-1.5 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                <span>100+</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
