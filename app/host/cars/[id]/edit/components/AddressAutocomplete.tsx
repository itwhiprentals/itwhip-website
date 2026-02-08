// app/host/cars/[id]/edit/components/AddressAutocomplete.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { IoLocationOutline, IoSearchOutline, IoCloseCircle } from 'react-icons/io5'

interface AddressResult {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
  fullAddress: string
}

interface MapboxFeature {
  id: string
  place_name: string
  center: [number, number]
  context?: Array<{
    id: string
    text: string
    short_code?: string
  }>
  address?: string
  text?: string
}

interface AddressAutocompleteProps {
  value: string
  city?: string
  state?: string
  zipCode?: string
  onAddressSelect: (address: AddressResult) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  hasError?: boolean
}

export function AddressAutocomplete({
  value,
  city,
  state,
  zipCode,
  onAddressSelect,
  disabled = false,
  placeholder = 'Enter street address...',
  className = '',
  hasError = false
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(undefined)

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

  // Update query when value prop changes
  useEffect(() => {
    if (value && value !== query) {
      setQuery(value)
    }
  }, [value])

  // Debounced search function
  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) {
        throw new Error('Mapbox token not configured')
      }

      // Build query with existing city/state if available for better results
      let fullQuery = searchQuery
      if (city && !searchQuery.toLowerCase().includes(city.toLowerCase())) {
        fullQuery += `, ${city}`
      }
      if (state && !searchQuery.toLowerCase().includes(state.toLowerCase())) {
        fullQuery += `, ${state}`
      }

      const params = new URLSearchParams({
        access_token: token,
        autocomplete: 'true',
        country: 'us',
        types: 'address',
        limit: '5',
        language: 'en'
      })

      // Bias towards Arizona
      params.append('proximity', '-112.0740,33.4484') // Phoenix center

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullQuery)}.json?${params}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const data = await response.json()
      setSuggestions(data.features || [])
      setShowDropdown(data.features?.length > 0)
    } catch (err) {
      console.error('Address search error:', err)
      setError('Failed to search addresses')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [city, state])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search (300ms)
    debounceRef.current = setTimeout(() => {
      searchAddresses(newQuery)
    }, 300)
  }

  // Parse address components from Mapbox result
  const parseAddress = (feature: MapboxFeature): AddressResult => {
    let streetAddress = ''
    let parsedCity = ''
    let parsedState = ''
    let parsedZipCode = ''

    // Extract street address
    if (feature.address && feature.text) {
      streetAddress = `${feature.address} ${feature.text}`
    } else if (feature.text) {
      streetAddress = feature.text
    }

    // Parse context for city, state, zip
    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id.startsWith('place')) {
          parsedCity = ctx.text
        } else if (ctx.id.startsWith('region')) {
          // State - use short code if available (e.g., "AZ")
          parsedState = ctx.short_code?.replace('US-', '') || ctx.text
        } else if (ctx.id.startsWith('postcode')) {
          parsedZipCode = ctx.text
        }
      }
    }

    return {
      streetAddress,
      city: parsedCity,
      state: parsedState,
      zipCode: parsedZipCode,
      latitude: feature.center[1],
      longitude: feature.center[0],
      fullAddress: feature.place_name
    }
  }

  // Handle address selection
  const handleSelect = (feature: MapboxFeature) => {
    const parsed = parseAddress(feature)
    setQuery(parsed.streetAddress)
    setSuggestions([])
    setShowDropdown(false)
    onAddressSelect(parsed)
  }

  // Clear input
  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input field */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <IoLocationOutline className="w-5 h-5" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2 border rounded-lg
            focus:ring-2 focus:ring-purple-600 focus:border-transparent
            dark:bg-gray-700 dark:text-white
            ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}
          `}
          autoComplete="off"
        />

        {/* Loading/Clear indicator */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          ) : query && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <IoCloseCircle className="w-5 h-5" />
            </button>
          ) : (
            <IoSearchOutline className="w-5 h-5 text-gray-400" />
          )}
        </span>
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => handleSelect(feature)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <IoLocationOutline className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {feature.address && feature.text
                      ? `${feature.address} ${feature.text}`
                      : feature.text
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {feature.place_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {/* Helper text */}
      {!disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Start typing to search for addresses
        </p>
      )}
    </div>
  )
}

export default AddressAutocomplete
