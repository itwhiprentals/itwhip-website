// app/(guest)/components/hero/RentalSearchWidget.tsx
// Mobile-optimized hero search widget for car rentals

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoCarOutline, 
  IoLocationOutline, 
  IoCalendarOutline,
  IoTimeOutline,
  IoSparklesOutline,
  IoAirplaneOutline,
  IoBedOutline,
  IoFlashOutline,
  IoSearchOutline,
  IoBusinessOutline,
  IoHomeOutline,
  IoLocateOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoTrendingUpOutline,
  IoChevronDownOutline
} from 'react-icons/io5'

interface Location {
  id: string
  name: string
  type: 'airport' | 'hotel' | 'area' | 'address' | 'current'
  address?: string
  lat?: number
  lng?: number
  popular?: boolean
}

interface RentalSearchWidgetProps {
  hotelBooking?: {
    hotelName?: string
    hotelAddress?: string
    checkIn?: string
    checkOut?: string
  }
  userLocation?: {
    lat: number
    lng: number
    address?: string
  }
  variant?: 'hero' | 'compact' | 'sidebar'
  onSearch?: (params: any) => void
}

export default function RentalSearchWidget({ 
  hotelBooking, 
  userLocation,
  variant = 'hero',
  onSearch
}: RentalSearchWidgetProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showQuickDates, setShowQuickDates] = useState(false)
  const [availableCount, setAvailableCount] = useState<number | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const locationInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Calculate smart defaults
  const getDefaultDates = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    
    const returnDay = new Date(tomorrow)
    returnDay.setDate(returnDay.getDate() + 2)
    
    return {
      pickup: tomorrow.toISOString().split('T')[0],
      return: returnDay.toISOString().split('T')[0]
    }
  }
  
  const defaults = getDefaultDates()
  
  const [searchParams, setSearchParams] = useState({
    location: '',
    pickupDate: defaults.pickup,
    pickupTime: '10:00',
    returnDate: defaults.return,
    returnTime: '10:00',
    latitude: userLocation?.lat || 33.4352,
    longitude: userLocation?.lng || -112.0101
  })
  
  // Phoenix-specific locations
  const phoenixLocations: Location[] = [
    { 
      id: 'phx-t4', 
      name: 'Sky Harbor Airport - Terminal 4', 
      type: 'airport', 
      address: '3400 E Sky Harbor Blvd, Phoenix, AZ 85034',
      lat: 33.4352,
      lng: -112.0101,
      popular: true
    },
    { 
      id: 'phx-t3', 
      name: 'Sky Harbor Airport - Terminal 3', 
      type: 'airport', 
      address: '3400 E Sky Harbor Blvd, Phoenix, AZ 85034',
      lat: 33.4352,
      lng: -112.0101
    },
    { 
      id: 'phx-rental', 
      name: 'Sky Harbor Rental Car Center', 
      type: 'airport', 
      address: '1805 E Sky Harbor Cir S, Phoenix, AZ',
      lat: 33.4352,
      lng: -112.0101
    },
    { 
      id: 'downtown', 
      name: 'Downtown Phoenix', 
      type: 'area', 
      address: 'Central Phoenix, AZ',
      lat: 33.4484,
      lng: -112.0740,
      popular: true
    },
    { 
      id: 'scottsdale', 
      name: 'Old Town Scottsdale', 
      type: 'area', 
      address: 'Scottsdale, AZ 85251',
      lat: 33.4942,
      lng: -111.9261,
      popular: true
    },
    { 
      id: 'tempe', 
      name: 'Tempe - ASU Area', 
      type: 'area', 
      address: 'Tempe, AZ 85281',
      lat: 33.4242,
      lng: -111.9281
    }
  ]
  
  // Filter locations based on input
  const getFilteredLocations = () => {
    if (!searchParams.location || searchParams.location.length < 2) {
      return phoenixLocations.filter(loc => loc.popular).slice(0, 5)
    }
    
    const query = searchParams.location.toLowerCase()
    return phoenixLocations.filter(loc => 
      loc.name.toLowerCase().includes(query) ||
      loc.address?.toLowerCase().includes(query)
    )
  }
  
  // Fetch availability on mount and when dates change
  useEffect(() => {
    fetchAvailability()
  }, [searchParams.pickupDate, searchParams.returnDate])
  
  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/rentals/search?countOnly=true')
      const data = await response.json()
      if (data?.success) {
        setAvailableCount(data.count || Math.floor(Math.random() * 100) + 250)
        setPriceRange(data.priceRange || { min: 45, max: 195 })
      }
    } catch (error) {
      // Set fallback values
      setAvailableCount(Math.floor(Math.random() * 100) + 250)
      setPriceRange({ min: 45, max: 195 })
    }
  }
  
  // Handle search
  const handleSearch = async () => {
    if (!searchParams.location) {
      locationInputRef.current?.focus()
      setFocusedField('location')
      return
    }
    
    setIsLoading(true)
    
    const query = {
      location: searchParams.location,
      pickupDate: `${searchParams.pickupDate}T${searchParams.pickupTime}`,
      returnDate: `${searchParams.returnDate}T${searchParams.returnTime}`,
      latitude: searchParams.latitude.toString(),
      longitude: searchParams.longitude.toString()
    }
    
    // Save to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentCarSearches') || '[]')
    recentSearches.unshift({
      ...query,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('recentCarSearches', JSON.stringify(recentSearches.slice(0, 5)))
    
    if (onSearch) {
      onSearch(query)
      setIsLoading(false)
    } else {
      const params = new URLSearchParams(query)
      router.push(`/rentals/search?${params.toString()}`)
    }
  }
  
  // Handle location selection
  const selectLocation = (location: Location) => {
    setSearchParams(prev => ({
      ...prev,
      location: location.name,
      latitude: location.lat || prev.latitude,
      longitude: location.lng || prev.longitude
    }))
    setShowLocationDropdown(false)
    setFocusedField(null)
  }
  
  // Quick date options
  const quickDates = [
    { label: 'Today', getValue: () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return {
        pickup: today.toISOString().split('T')[0],
        return: tomorrow.toISOString().split('T')[0]
      }
    }},
    { label: 'Weekend', getValue: () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const friday = new Date(today)
      friday.setDate(today.getDate() + (5 - dayOfWeek + 7) % 7)
      const sunday = new Date(friday)
      sunday.setDate(friday.getDate() + 2)
      return {
        pickup: friday.toISOString().split('T')[0],
        return: sunday.toISOString().split('T')[0]
      }
    }},
    { label: '1 Week', getValue: () => {
      const start = new Date()
      start.setDate(start.getDate() + 1)
      const end = new Date(start)
      end.setDate(start.getDate() + 7)
      return {
        pickup: start.toISOString().split('T')[0],
        return: end.toISOString().split('T')[0]
      }
    }},
    { label: 'Monthly', getValue: () => {
      const start = new Date()
      start.setDate(start.getDate() + 1)
      const end = new Date(start)
      end.setDate(start.getDate() + 30)
      return {
        pickup: start.toISOString().split('T')[0],
        return: end.toISOString().split('T')[0]
      }
    }}
  ]
  
  // Apply quick date
  const applyQuickDate = (option: typeof quickDates[0]) => {
    const dates = option.getValue()
    setSearchParams(prev => ({
      ...prev,
      pickupDate: dates.pickup,
      returnDate: dates.return
    }))
    setShowQuickDates(false)
  }
  
  // Generate time options
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    const time = `${hour.toString().padStart(2, '0')}:${minute}`
    const period = hour < 12 ? 'AM' : 'PM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return {
      value: time,
      label: `${displayHour}:${minute} ${period}`
    }
  })
  
  // Calculate rental duration
  const getRentalDuration = () => {
    const start = new Date(searchParams.pickupDate)
    const end = new Date(searchParams.returnDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }
  
  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams(prev => ({
            ...prev,
            location: 'Current Location - Phoenix, AZ',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
          setShowLocationDropdown(false)
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
        setShowQuickDates(false)
        setFocusedField(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Hero variant - mobile optimized
  if (variant === 'hero') {
    return (
      <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100/50 p-3 sm:p-2">
          {/* Mobile: Stack vertically, Desktop: Horizontal */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-2">
            
            {/* Location Input */}
            <div className="flex-1 lg:flex-[2] relative">
              <div 
                className={`relative rounded-lg sm:rounded-xl transition-all duration-200 ${
                  focusedField === 'location' 
                    ? 'ring-2 ring-black shadow-lg sm:transform sm:scale-[1.02]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <IoLocationOutline className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  ref={locationInputRef}
                  type="text"
                  value={searchParams.location}
                  onChange={(e) => {
                    setSearchParams(prev => ({ ...prev, location: e.target.value }))
                    setShowLocationDropdown(true)
                  }}
                  onFocus={() => {
                    setFocusedField('location')
                    setShowLocationDropdown(true)
                  }}
                  placeholder={isMobile ? "Location" : "City, airport, or hotel"}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-4 py-3 sm:py-4 text-gray-900 placeholder-gray-400 focus:outline-none rounded-lg sm:rounded-xl text-sm sm:text-base bg-transparent"
                />
                
                {/* Clear button */}
                {searchParams.location && (
                  <button
                    onClick={() => setSearchParams(prev => ({ ...prev, location: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <IoCloseOutline className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                
                {/* Location Dropdown - Mobile Optimized */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-60 sm:max-h-96 overflow-y-auto">
                    
                    {/* Current Location */}
                    <button
                      onClick={getCurrentLocation}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100 group"
                    >
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <IoLocateOutline className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">Use current location</div>
                        <div className="text-xs sm:text-sm text-gray-500">Detect my location</div>
                      </div>
                    </button>
                    
                    {/* Popular/Filtered Locations */}
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                        {searchParams.location ? 'Search Results' : 'Popular'}
                      </div>
                      {getFilteredLocations().map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => selectLocation(loc)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
                        >
                          <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                            loc.type === 'airport' ? 'bg-amber-100 group-hover:bg-amber-200' :
                            loc.type === 'hotel' ? 'bg-blue-100 group-hover:bg-blue-200' :
                            'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            {loc.type === 'airport' && <IoAirplaneOutline className="w-4 h-4 text-amber-600" />}
                            {loc.type === 'hotel' && <IoBedOutline className="w-4 h-4 text-blue-600" />}
                            {loc.type === 'area' && <IoBusinessOutline className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              {isMobile && loc.name.length > 30 ? loc.name.substring(0, 30) + '...' : loc.name}
                              {loc.popular && (
                                <span className="ml-2 text-xs text-amber-600 font-normal">Popular</span>
                              )}
                            </div>
                            {loc.address && !isMobile && (
                              <div className="text-xs sm:text-sm text-gray-500">{loc.address}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Date/Time Container - Mobile Stacked */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 flex-1 lg:flex-[3]">
              
              {/* Pickup Date/Time */}
              <div 
                className={`flex-1 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  focusedField === 'pickup' 
                    ? 'ring-2 ring-black shadow-lg sm:transform sm:scale-[1.02]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center h-full px-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Pickup</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={searchParams.pickupDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, pickupDate: e.target.value }))}
                        onFocus={() => setFocusedField('pickup')}
                        className="bg-transparent text-xs sm:text-sm font-medium text-gray-900 focus:outline-none w-full"
                      />
                      {!isMobile && (
                        <select
                          value={searchParams.pickupTime}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, pickupTime: e.target.value }))}
                          className="bg-transparent text-xs sm:text-sm text-gray-600 focus:outline-none"
                        >
                          {timeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Return Date/Time */}
              <div 
                className={`flex-1 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  focusedField === 'return' 
                    ? 'ring-2 ring-black shadow-lg sm:transform sm:scale-[1.02]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center h-full px-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Return</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={searchParams.returnDate}
                        min={searchParams.pickupDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                        onFocus={() => setFocusedField('return')}
                        className="bg-transparent text-xs sm:text-sm font-medium text-gray-900 focus:outline-none w-full"
                      />
                      {!isMobile && (
                        <select
                          value={searchParams.returnTime}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, returnTime: e.target.value }))}
                          className="bg-transparent text-xs sm:text-sm text-gray-600 focus:outline-none"
                        >
                          {timeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search Button - Full Width on Mobile */}
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchParams.location}
              className={`w-full lg:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg sm:rounded-xl transition-all duration-200 transform ${
                searchParams.location 
                  ? 'bg-black text-white hover:bg-gray-800 sm:hover:scale-105 hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IoSearchOutline className="w-5 h-5 sm:hidden" />
                  <span>Search</span>
                </span>
              )}
            </button>
          </div>
          
          {/* Quick Actions Bar - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3 border-t border-gray-100 mt-2">
            {/* Quick Dates - Horizontal Scroll on Mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {quickDates.map((option) => (
                <button
                  key={option.label}
                  onClick={() => applyQuickDate(option)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Live Stats - Simplified on Mobile */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              {availableCount && (
                <span className="flex items-center gap-1">
                  <span className="relative flex h-1.5 sm:h-2 w-1.5 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 bg-green-500"></span>
                  </span>
                  <span className="font-semibold text-gray-900">{availableCount}</span>
                  <span className="hidden sm:inline">cars</span>
                </span>
              )}
              {priceRange && (
                <span>
                  From <span className="font-semibold text-gray-900">${priceRange.min}</span>
                  <span className="hidden sm:inline">/day</span>
                </span>
              )}
              {getRentalDuration() > 0 && !isMobile && (
                <span>
                  <span className="font-semibold text-gray-900">{getRentalDuration()}</span> days
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Popular Searches - Hidden on Mobile */}
        <div className="hidden sm:flex mt-4 flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-white/70">Popular:</span>
          {phoenixLocations.filter(loc => loc.popular).slice(0, 3).map(loc => (
            <button 
              key={loc.id}
              onClick={() => {
                selectLocation(loc)
                handleSearch()
              }}
              className="px-3 py-1.5 text-white/90 bg-white/10 backdrop-blur hover:bg-white/20 rounded-full transition-all hover:scale-105"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  // Compact variant for mobile/sidebar
  if (variant === 'compact') {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Location"
            value={searchParams.location}
            onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={searchParams.pickupDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, pickupDate: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="date"
              value={searchParams.returnDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
              min={searchParams.pickupDate}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchParams.location}
            className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
          >
            Search
          </button>
        </div>
      </div>
    )
  }
  
  // Default to hero variant
  return null
}