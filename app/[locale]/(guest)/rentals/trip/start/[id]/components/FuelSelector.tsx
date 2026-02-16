// app/(guest)/rentals/trip/start/[id]/components/FuelSelector.tsx

'use client'

import { useState } from 'react'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import {
  IoCheckmarkCircle,
  IoWater,
  IoAlertCircle,
} from 'react-icons/io5'

interface FuelSelectorProps {
  booking: any
  data: any
  onFuelChange: (level: string) => void
}

const FUEL_CONFIG: Record<string, { percent: number; color: string; bgColor: string; darkBgColor: string }> = {
  'Empty':  { percent: 5,   color: 'text-red-500',    bgColor: 'bg-red-500',    darkBgColor: 'bg-red-500' },
  '1/4':   { percent: 25,  color: 'text-orange-500', bgColor: 'bg-orange-500', darkBgColor: 'bg-orange-500' },
  '1/2':   { percent: 50,  color: 'text-amber-500',  bgColor: 'bg-amber-500',  darkBgColor: 'bg-amber-500' },
  '3/4':   { percent: 75,  color: 'text-green-500',  bgColor: 'bg-green-500',  darkBgColor: 'bg-green-500' },
  'Full':  { percent: 100, color: 'text-green-600',  bgColor: 'bg-green-600',  darkBgColor: 'bg-green-600' },
}

export function FuelSelector({ booking, data, onFuelChange }: FuelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState(data.fuelLevel || '')

  const handleSelect = (level: string) => {
    setSelectedLevel(level)
    onFuelChange(level)
  }

  const config = selectedLevel ? FUEL_CONFIG[selectedLevel] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <IoWater className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Fuel Level</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Select the current fuel level on the dashboard gauge</p>
        </div>
      </div>

      {/* Fuel gauge visualization */}
      <div className="bg-gray-900 dark:bg-black rounded-xl p-6">
        {/* Horizontal gauge */}
        <div className="relative">
          {/* Labels */}
          <div className="flex justify-between mb-2 px-1">
            <span className="text-[10px] font-medium text-red-400">E</span>
            <span className="text-[10px] font-medium text-gray-500">1/4</span>
            <span className="text-[10px] font-medium text-gray-500">1/2</span>
            <span className="text-[10px] font-medium text-gray-500">3/4</span>
            <span className="text-[10px] font-medium text-green-400">F</span>
          </div>

          {/* Track */}
          <div className="h-6 bg-gray-800 dark:bg-gray-900 rounded-full overflow-hidden relative">
            {/* Fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                config
                  ? config.percent <= 25
                    ? 'bg-gradient-to-r from-red-600 to-red-500'
                    : config.percent <= 50
                    ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500'
                    : config.percent <= 75
                    ? 'bg-gradient-to-r from-red-600 via-amber-500 to-green-500'
                    : 'bg-gradient-to-r from-red-600 via-amber-500 to-green-500'
                  : ''
              }`}
              style={{ width: config ? `${config.percent}%` : '0%' }}
            />

            {/* Tick marks */}
            {[25, 50, 75].map(tick => (
              <div
                key={tick}
                className="absolute top-0 bottom-0 w-px bg-gray-600/50"
                style={{ left: `${tick}%` }}
              />
            ))}
          </div>

          {/* Selected value display */}
          {selectedLevel && (
            <div className="text-center mt-3">
              <span className={`text-2xl font-bold ${config?.color || 'text-white'}`}>
                {selectedLevel}
              </span>
            </div>
          )}
          {!selectedLevel && (
            <div className="text-center mt-3">
              <span className="text-sm text-gray-500">Select a fuel level below</span>
            </div>
          )}
        </div>
      </div>

      {/* Selection buttons */}
      <div className="grid grid-cols-5 gap-2">
        {TRIP_CONSTANTS.FUEL_LEVELS.map((level) => {
          const isSelected = selectedLevel === level
          const levelConfig = FUEL_CONFIG[level]

          return (
            <button
              key={level}
              onClick={() => handleSelect(level)}
              className={`relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Mini gauge bar */}
              <div className="w-5 h-8 bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden flex flex-col-reverse">
                <div
                  className={`w-full transition-all ${levelConfig.bgColor}`}
                  style={{ height: `${levelConfig.percent}%` }}
                />
              </div>

              <span className={`text-xs font-semibold ${
                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {level}
              </span>

              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5">
                  <IoCheckmarkCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 bg-white dark:bg-gray-900 rounded-full" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected summary */}
      {selectedLevel && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              Fuel level: <span className="font-bold">{selectedLevel}</span>
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">Return at same level or higher</p>
          </div>
        </div>
      )}

      {/* Policy note */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
        <IoAlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
          <p className="font-medium">Refueling Policy</p>
          <p>Return with same fuel level or higher. A $75 refueling fee applies if returned lower.</p>
        </div>
      </div>
    </div>
  )
}
