// app/(guest)/components/hero/RentalSearchWidget.tsx
// Compact rental search card optimized for cinematic hero

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoLocationOutline, 
  IoCalendarOutline,
  IoTimeOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoSearchOutline,
  IoNavigateOutline
} from 'react-icons/io5'
import { searchLocations, getGroupedLocations, getPopularLocations, type Location } from '@/lib/data/arizona-locations'

interface RentalSearchCardProps {
  onSearch?: (params: any) => void
  variant?: 'hero' | 'compact'
}

export default function RentalSearchCard({ 
  onSearch,
  variant = 'hero'
}: RentalSearchCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarType, setCalendarType] = useState<'pickup' | 'return'>('pickup')
  const [showTimeDropdown, setShowTimeDropdown] = useState<'pickup' | 'return' | null>(null)
  const [dateError, setDateError] = useState<string>('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const timeDropdownRef = useRef<HTMLDivElement>(null)
  
  // Location autocomplete state
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [locationResults, setLocationResults] = useState<{ airports: Location[], cities: Location[] }>({
    airports: [],
    cities: []
  })
  const locationInputRef = useRef<HTMLInputElement>(null)
  const locationDropdownRef = useRef<HTMLDivElement>(null)
  
  // Calculate defaults
  const getDefaultDates = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
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
    returnTime: '10:00'
  })

  // Date validation
  useEffect(() => {
    if (searchParams.pickupDate && searchParams.returnDate) {
      const pickupDateTime = new Date(`${searchParams.pickupDate}T${searchParams.pickupTime}`)
      const returnDateTime = new Date(`${searchParams.returnDate}T${searchParams.returnTime}`)
      
      if (returnDateTime <= pickupDateTime) {
        setDateError('Return must be after pickup')
      } else {
        setDateError('')
      }
    }
  }, [searchParams.pickupDate, searchParams.pickupTime, searchParams.returnDate, searchParams.returnTime])

  // Debounced location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationQuery.trim().length > 0) {
        const grouped = getGroupedLocations(locationQuery)
        setLocationResults(grouped)
        setShowLocationDropdown(true)
      } else {
        // Show popular locations when empty
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(null)
      }
      
      if (
        locationDropdownRef.current && 
        !locationDropdownRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false)
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
        const { latitude, longitude } = position.coords
        
        // Use reverse geocoding to get city name
        try {
          // For now, default to Phoenix since we're Phoenix-focused
          // In production, you'd use Google Maps Geocoding API here
          const phoenixLocation = getPopularLocations().find(loc => loc.city === 'Phoenix' && loc.type === 'city')
          if (phoenixLocation) {
            handleLocationSelect(phoenixLocation)
          } else {
            setLocationQuery('Phoenix, AZ')
            setSearchParams(prev => ({ ...prev, location: 'Phoenix, AZ' }))
          }
        } catch (error) {
          console.error('Error getting location name:', error)
          setLocationQuery('Phoenix, AZ')
          setSearchParams(prev => ({ ...prev, location: 'Phoenix, AZ' }))
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

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setLocationQuery(location.name)
    setSearchParams(prev => ({ ...prev, location: location.name }))
    setShowLocationDropdown(false)
  }

  // Handle location input change
  const handleLocationInputChange = (value: string) => {
    setLocationQuery(value)
    setSearchParams(prev => ({ ...prev, location: value }))
    if (value.trim().length > 0) {
      setShowLocationDropdown(true)
    }
  }

  // Clear location
  const handleClearLocation = () => {
    setLocationQuery('')
    setSelectedLocation(null)
    setSearchParams(prev => ({ ...prev, location: '' }))
    setShowLocationDropdown(false)
    locationInputRef.current?.focus()
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date'
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':')
    const hourNum = parseInt(hour)
    const period = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
    return `${displayHour}:${minute} ${period}`
  }
  
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
  
  const handleSearch = async () => {
    if (!searchParams.location) return
    if (dateError) return
    
    setIsLoading(true)
    
    const query = {
      location: searchParams.location,
      pickupDate: `${searchParams.pickupDate}T${searchParams.pickupTime}`,
      returnDate: `${searchParams.returnDate}T${searchParams.returnTime}`
    }
    
    if (onSearch) {
      onSearch(query)
      setIsLoading(false)
    } else {
      const params = new URLSearchParams(query)
      router.push(`/rentals/search?${params.toString()}`)
    }
  }

  // Calendar Component
  const CalendarModal = () => {
    const isPickup = calendarType === 'pickup'
    const currentDate = isPickup ? searchParams.pickupDate : searchParams.returnDate
    const minDate = isPickup ? new Date().toISOString().split('T')[0] : searchParams.pickupDate
    
    const [viewMonth, setViewMonth] = useState(() => {
      const date = currentDate ? new Date(currentDate) : new Date()
      return { month: date.getMonth(), year: date.getFullYear() }
    })

    const getDaysInMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (month: number, year: number) => {
      return new Date(year, month, 1).getDay()
    }

    const handleDateSelect = (day: number) => {
      const selected = new Date(viewMonth.year, viewMonth.month, day).toISOString().split('T')[0]
      
      if (isPickup) {
        setSearchParams(prev => ({ 
          ...prev, 
          pickupDate: selected,
          returnDate: selected > prev.returnDate ? selected : prev.returnDate
        }))
      } else {
        setSearchParams(prev => ({ ...prev, returnDate: selected }))
      }
      setShowCalendar(false)
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December']
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm mx-auto shadow-2xl">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isPickup ? 'Pickup' : 'Return'} Date
            </h3>
            <button
              onClick={() => setShowCalendar(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoCloseOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                if (viewMonth.month === 0) {
                  setViewMonth({ month: 11, year: viewMonth.year - 1 })
                } else {
                  setViewMonth({ ...viewMonth, month: viewMonth.month - 1 })
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <IoChevronBackOutline className="w-5 h-5" />
            </button>
            <span className="text-base font-medium text-gray-900 dark:text-white">
              {monthNames[viewMonth.month]} {viewMonth.year}
            </span>
            <button
              onClick={() => {
                if (viewMonth.month === 11) {
                  setViewMonth({ month: 0, year: viewMonth.year + 1 })
                } else {
                  setViewMonth({ ...viewMonth, month: viewMonth.month + 1 })
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <IoChevronForwardOutline className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Names */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: getFirstDayOfMonth(viewMonth.month, viewMonth.year) }).map((_, i) => (
                <div key={`empty-${i}`} className="p-3" />
              ))}
              
              {/* Month days */}
              {Array.from({ length: getDaysInMonth(viewMonth.month, viewMonth.year) }).map((_, i) => {
                const day = i + 1
                const dateStr = new Date(viewMonth.year, viewMonth.month, day).toISOString().split('T')[0]
                const isSelected = dateStr === currentDate
                const isDisabled = dateStr < minDate
                const isToday = dateStr === new Date().toISOString().split('T')[0]
                
                return (
                  <button
                    key={day}
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    disabled={isDisabled}
                    className={`min-h-[44px] p-2 rounded-lg text-sm font-medium transition-colors
                      ${isSelected 
                        ? 'bg-black dark:bg-white text-white dark:text-black' 
                        : isToday
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : isDisabled
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Time Dropdown Component
  const TimeDropdown = ({ type }: { type: 'pickup' | 'return' }) => {
    const currentTime = type === 'pickup' ? searchParams.pickupTime : searchParams.returnTime
    
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
        <div className="p-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                if (type === 'pickup') {
                  setSearchParams(prev => ({ ...prev, pickupTime: option.value }))
                } else {
                  setSearchParams(prev => ({ ...prev, returnTime: option.value }))
                }
                setShowTimeDropdown(null)
              }}
              className={`w-full min-h-[44px] px-3 py-2.5 text-left rounded-lg text-sm transition-colors
                ${currentTime === option.value
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Location Dropdown Component
  const LocationDropdown = () => {
    const hasResults = locationResults.airports.length > 0 || locationResults.cities.length > 0
    
    return (
      <div 
        ref={locationDropdownRef}
        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
      >
        {!hasResults ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No locations found
          </div>
        ) : (
          <div className="p-2">
            {/* Airports Section */}
            {locationResults.airports.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Airports
                </div>
                {locationResults.airports.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full min-h-[44px] px-3 py-2.5 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <IoAirplaneOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {location.iataCode} - {location.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
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
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cities
                </div>
                {locationResults.cities.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full min-h-[44px] px-3 py-2.5 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <IoBusinessOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {location.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
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
  }
  
  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-0">
        <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-2 sm:p-2.5">
            {/* Mobile: Stack vertically / Desktop: All in one line */}
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-1.5">
              
              {/* Location Field with Autocomplete + Use My Location */}
              <div className="flex-1">
                <div className="relative">
                  <IoLocationOutline className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={locationQuery}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder="City or Airport"
                    className="w-full min-h-[44px] pl-8 sm:pl-9 pr-20 sm:pr-24 py-2 
                      bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                      text-gray-900 dark:text-white placeholder-gray-500
                      rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white 
                      transition-all text-sm"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
                    {locationQuery && (
                      <button
                        onClick={handleClearLocation}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <IoCloseOutline className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={handleUseMyLocation}
                      disabled={isGettingLocation}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Use my location"
                    >
                      {isGettingLocation ? (
                        <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <IoNavigateOutline className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  
                  {/* Location Dropdown */}
                  {showLocationDropdown && <LocationDropdown />}
                </div>
              </div>
              
              {/* Pickup Field */}
              <div className="flex-1 sm:min-w-[180px]">
                <div className="flex gap-1">
                  {/* Date Button */}
                  <button
                    onClick={() => {
                      setCalendarType('pickup')
                      setShowCalendar(true)
                    }}
                    className="flex-1 min-h-[44px]"
                  >
                    <div className="flex items-center px-2 sm:px-2.5 py-1.5 sm:py-2 
                      bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                      hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left h-full">
                      <IoCalendarOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mr-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">Pickup</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {formatDate(searchParams.pickupDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Time Button */}
                  <div className="relative" ref={showTimeDropdown === 'pickup' ? timeDropdownRef : undefined}>
                    <button
                      onClick={() => setShowTimeDropdown(showTimeDropdown === 'pickup' ? null : 'pickup')}
                      className="min-h-[44px]"
                    >
                      <div className="flex items-center px-1.5 sm:px-2 py-1.5 sm:py-2 h-full
                        bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                        hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <IoTimeOutline className="w-3.5 h-3.5 text-gray-400 mr-0.5 flex-shrink-0" />
                        <span className="text-[11px] sm:text-xs font-medium text-gray-900 dark:text-white">
                          {formatTime(searchParams.pickupTime)}
                        </span>
                        <IoChevronDownOutline className="w-3 h-3 text-gray-400 ml-0.5" />
                      </div>
                    </button>
                    {showTimeDropdown === 'pickup' && <TimeDropdown type="pickup" />}
                  </div>
                </div>
              </div>
              
              {/* Return Field */}
              <div className="flex-1 sm:min-w-[180px]">
                <div className="flex gap-1">
                  {/* Date Button */}
                  <button
                    onClick={() => {
                      setCalendarType('return')
                      setShowCalendar(true)
                    }}
                    className="flex-1 min-h-[44px]"
                  >
                    <div className={`flex items-center px-2 sm:px-2.5 py-1.5 sm:py-2 
                      bg-white dark:bg-gray-800 border transition-colors text-left h-full rounded-lg
                      ${dateError 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>
                      <IoCalendarOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mr-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">Return</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {formatDate(searchParams.returnDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Time Button */}
                  <div className="relative" ref={showTimeDropdown === 'return' ? timeDropdownRef : undefined}>
                    <button
                      onClick={() => setShowTimeDropdown(showTimeDropdown === 'return' ? null : 'return')}
                      className="min-h-[44px]"
                    >
                      <div className="flex items-center px-1.5 sm:px-2 py-1.5 sm:py-2 h-full
                        bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                        hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <IoTimeOutline className="w-3.5 h-3.5 text-gray-400 mr-0.5 flex-shrink-0" />
                        <span className="text-[11px] sm:text-xs font-medium text-gray-900 dark:text-white">
                          {formatTime(searchParams.returnTime)}
                        </span>
                        <IoChevronDownOutline className="w-3 h-3 text-gray-400 ml-0.5" />
                      </div>
                    </button>
                    {showTimeDropdown === 'return' && <TimeDropdown type="return" />}
                  </div>
                </div>
              </div>
              
              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchParams.location || !!dateError}
                className={`min-h-[44px] px-3 sm:px-4 py-2 font-semibold rounded-lg 
                  transition-all duration-200 whitespace-nowrap text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  searchParams.location && !dateError
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' 
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <IoSearchOutline className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Date Error Message */}
            {dateError && (
              <div className="mt-1.5 text-xs text-red-600 dark:text-red-400 px-1">
                {dateError}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showCalendar && <CalendarModal />}
    </>
  )
}