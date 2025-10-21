// app/(guest)/components/hero/search-components/LocationInput.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  IoLocationOutline,
  IoCloseOutline,
  IoNavigateOutline,
  IoAirplaneOutline,
  IoBusinessOutline
} from 'react-icons/io5'
import { getGroupedLocations, getPopularLocations, type Location } from '@/lib/data/arizona-locations'

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect: (location: Location) => void
  placeholder?: string
}

export default function LocationInput({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Where?"
}: LocationInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [locationQuery, setLocationQuery] = useState(value)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [locationResults, setLocationResults] = useState<{ airports: Location[], cities: Location[] }>({
    airports: [],
    cities: []
  })
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track if component is mounted (for Portal)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Sync internal state with prop value
  useEffect(() => {
    setLocationQuery(value)
  }, [value])

  // Debounced location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationQuery.trim().length > 0) {
        const grouped = getGroupedLocations(locationQuery)
        setLocationResults(grouped)
      } else {
        const popular = getPopularLocations()
        const grouped = {
          airports: popular.filter(loc => loc.type === 'airport'),
          cities: popular.filter(loc => loc.type === 'city')
        }
        setLocationResults(grouped)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [locationQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get user's location
  const handleUseMyLocation = async () => {
    setIsGettingLocation(true)
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const phoenixLocation = getPopularLocations().find(
            loc => loc.city === 'Phoenix' && loc.type === 'city'
          )
          if (phoenixLocation) {
            handleLocationSelect(phoenixLocation)
          } else {
            setLocationQuery('Phoenix, AZ')
            onChange('Phoenix, AZ')
          }
        } catch (error) {
          console.error('Error getting location name:', error)
          setLocationQuery('Phoenix, AZ')
          onChange('Phoenix, AZ')
        }
        
        setIsGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please enter it manually.')
        setIsGettingLocation(false)
      }
    )
  }

  // Handle location selection from dropdown
  const handleLocationSelect = (location: Location) => {
    setLocationQuery(location.name)
    onChange(location.name)
    onLocationSelect(location)
    setShowDropdown(false)
  }

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setLocationQuery(newValue)
    onChange(newValue)
    if (newValue.trim().length > 0 || newValue === '') {
      setShowDropdown(true)
    }
  }

  // Clear location
  const handleClear = () => {
    setLocationQuery('')
    onChange('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  // Location Dropdown Component
  const LocationDropdown = () => {
    const hasResults = locationResults.airports.length > 0 || locationResults.cities.length > 0
    
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    
    useEffect(() => {
      if (inputRef.current && showDropdown) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }, [showDropdown])
    
    const dropdownContent = (
      <div 
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top + 4}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] max-h-[240px] overflow-y-auto"
      >
        {!hasResults ? (
          <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-xs">
            No locations found
          </div>
        ) : (
          <div className="p-1.5">
            {/* Airports Section */}
            {locationResults.airports.length > 0 && (
              <div className="mb-1.5">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Airports
                </div>
                {locationResults.airports.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full min-h-[40px] px-2.5 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                    type="button"
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
            {locationResults.cities.length > 0 && (
              <div>
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cities
                </div>
                {locationResults.cities.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full min-h-[40px] px-2.5 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                    type="button"
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

    return mounted && showDropdown ? createPortal(dropdownContent, document.body) : null
  }

  return (
    <div className="flex-1 sm:max-w-[240px]">
      <div className="relative">
        <IoLocationOutline className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={locationQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full h-[38px] pl-7 pr-14 
            bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
            text-gray-900 dark:text-white placeholder-gray-400
            rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white 
            transition-all text-[12px] font-medium"
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 z-10">
          {locationQuery && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              type="button"
            >
              <IoCloseOutline className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <button
            onClick={handleUseMyLocation}
            disabled={isGettingLocation}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Use my location"
            type="button"
          >
            {isGettingLocation ? (
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <IoNavigateOutline className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>
        
        <LocationDropdown />
      </div>
    </div>
  )
}