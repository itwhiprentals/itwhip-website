// app/(guest)/components/hero/search-components/LocationInput.tsx
// Clean version - uses external LocationDropdown component

'use client'

import { useState, useRef, useEffect } from 'react'
import {
  IoLocationOutline,
  IoCloseOutline,
  IoNavigateOutline,
} from 'react-icons/io5'
import { getGroupedLocations, getPopularLocations, type Location } from '@/lib/data/arizona-locations'
import LocationDropdown from './LocationDropdown' // Import the external component

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
  const [locationResults, setLocationResults] = useState<{ airports: Location[], cities: Location[] }>({
    airports: [],
    cities: []
  })
  
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Handle location selection from dropdown - FORMAT THE DISPLAY NAME
  const handleLocationSelect = (location: Location) => {
    const displayName = location.type === 'airport' 
      ? `${location.iataCode} - ${location.name}` 
      : `${location.name}, ${location.state}`
    
    setLocationQuery(displayName)
    onChange(displayName)
    onLocationSelect(location)
    setShowDropdown(false)
  }

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setLocationQuery(newValue)
    onChange(newValue)
    setShowDropdown(true)
  }

  // Clear location
  const handleClear = () => {
    setLocationQuery('')
    onChange('')
    setShowDropdown(false)
    inputRef.current?.focus()
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
        
        {/* Use the external LocationDropdown component - ADDED onClose! */}
        <LocationDropdown
          airports={locationResults.airports}
          cities={locationResults.cities}
          onSelect={handleLocationSelect}
          isVisible={showDropdown}
          inputRef={inputRef}
          onClose={() => setShowDropdown(false)}
        />
      </div>
    </div>
  )
}