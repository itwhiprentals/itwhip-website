// app/(guest)/components/hero/search-components/LocationDropdown.tsx
// Memoized dropdown with PORTAL rendering - floats above everything!

'use client'

import { memo, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IoAirplaneOutline, IoBusinessOutline } from 'react-icons/io5'
import type { Location } from '@/lib/data/arizona-locations'

interface LocationDropdownProps {
  airports: Location[]
  cities: Location[]
  onSelect: (location: Location) => void
  isVisible: boolean
  inputRef: React.RefObject<HTMLInputElement>
}

const LocationDropdown = memo(function LocationDropdown({
  airports,
  cities,
  onSelect,
  isVisible,
  inputRef
}: LocationDropdownProps) {
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Update position when dropdown opens or window resizes
  useEffect(() => {
    if (isVisible && inputRef.current) {
      const updatePosition = () => {
        const rect = inputRef.current!.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }

      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition)
      
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition)
      }
    }
  }, [isVisible, inputRef])

  if (!isVisible) return null
  
  const hasResults = airports.length > 0 || cities.length > 0

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: `${dropdownPosition.top + 4}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
      }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] max-h-[360px] sm:max-h-[260px] overflow-y-auto"
    >
      {!hasResults ? (
        <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-xs">
          No locations found
        </div>
      ) : (
        <div className="p-1.5">
          {/* Airports Section */}
          {airports.length > 0 && (
            <div className="mb-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Airports
              </div>
              {airports.map((location) => (
                <button
                  key={location.id}
                  onClick={() => onSelect(location)}
                  className="w-full min-h-[40px] px-2.5 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                    <IoAirplaneOutline className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                      {location.iataCode} - {location.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {location.city}, {location.state}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Cities Section */}
          {cities.length > 0 && (
            <div>
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cities
              </div>
              {cities.map((location) => (
                <button
                  key={location.id}
                  onClick={() => onSelect(location)}
                  className="w-full min-h-[40px] px-2.5 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                    <IoBusinessOutline className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                      {location.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {location.city}, {location.state}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return mounted ? createPortal(dropdownContent, document.body) : null
})

export default LocationDropdown