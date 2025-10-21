// app/(guest)/components/hero/RentalSearchWidget.tsx
// Professional search with Portals - medium readable dropdowns

'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)
  const timeDropdownRef = useRef<HTMLDivElement>(null)
  const timeButtonRef = useRef<HTMLButtonElement>(null)
  
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
  
  // Track if component is mounted (for Portal)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
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
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node) &&
          timeButtonRef.current && !timeButtonRef.current.contains(event.target as Node)) {
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
        try {
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
    if (!dateString) return 'Select'
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  // Format time for display - FULL FORMAT (10:00 AM)
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

  // Calendar Component - RENDERED VIA PORTAL
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
    
    const modalContent = (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm mx-auto shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {isPickup ? 'Pickup' : 'Return'} Date
            </h3>
            <button
              onClick={() => setShowCalendar(false)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoCloseOutline className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                if (viewMonth.month === 0) {
                  setViewMonth({ month: 11, year: viewMonth.year - 1 })
                } else {
                  setViewMonth({ ...viewMonth, month: viewMonth.month - 1 })
                }
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <IoChevronBackOutline className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
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
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <IoChevronForwardOutline className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 mb-1.5">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-1.5">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: getFirstDayOfMonth(viewMonth.month, viewMonth.year) }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              
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
                    className={`h-9 rounded-lg text-xs font-medium transition-colors
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

    return mounted ? createPortal(modalContent, document.body) : null
  }

  // Time Dropdown Component - RENDERED VIA PORTAL
  const TimeDropdown = ({ type }: { type: 'pickup' | 'return' }) => {
    const currentTime = type === 'pickup' ? searchParams.pickupTime : searchParams.returnTime
    
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    
    useEffect(() => {
      if (timeButtonRef.current) {
        const rect = timeButtonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }, [showTimeDropdown])
    
    const dropdownContent = (
      <div 
        ref={timeDropdownRef}
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top + 4}px`,
          left: `${dropdownPosition.left}px`,
          minWidth: `${dropdownPosition.width}px`,
        }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] max-h-[200px] overflow-y-auto"
      >
        <div className="p-1">
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
              className={`w-full h-8 px-2.5 py-1 text-left rounded-md text-[11px] transition-colors
                ${currentTime === option.value
                  ? 'bg-black dark:bg-white text-white dark:text-black font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )

    return mounted ? createPortal(dropdownContent, document.body) : null
  }

  // Location Dropdown Component - RENDERED VIA PORTAL - IMPROVED HEIGHT
  const LocationDropdown = () => {
    const hasResults = locationResults.airports.length > 0 || locationResults.cities.length > 0
    
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false })
    
    useEffect(() => {
      if (locationInputRef.current && showLocationDropdown) {
        const rect = locationInputRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        const dropdownHeight = 360 // max-height
        
        // Open upward if not enough space below but enough space above
        const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
        
        setDropdownPosition({
          top: openUpward ? rect.top + window.scrollY - dropdownHeight - 4 : rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          openUpward
        })
      }
    }, [showLocationDropdown])
    
    const dropdownContent = (
      <div 
        ref={locationDropdownRef}
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top + 4}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] max-h-[340px] sm:max-h-[260px] overflow-y-auto"
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

    return mounted && showLocationDropdown ? createPortal(dropdownContent, document.body) : null
  }
  
  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-0 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-1.5">
            {/* Single line layout on desktop, stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-1">
              
              {/* Location Field - COMPACT */}
              <div className="flex-1 sm:max-w-[240px]">
                <div className="relative">
                  <IoLocationOutline className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={locationQuery}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder="Where?"
                    className="w-full h-[38px] pl-7 pr-14 
                      bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                      text-gray-900 dark:text-white placeholder-gray-400
                      rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white 
                      transition-all text-[12px] font-medium"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5">
                    {locationQuery && (
                      <button
                        onClick={handleClearLocation}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <IoCloseOutline className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={handleUseMyLocation}
                      disabled={isGettingLocation}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Use my location"
                    >
                      {isGettingLocation ? (
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <IoNavigateOutline className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {showLocationDropdown && <LocationDropdown />}
                </div>
              </div>
              
              {/* Pickup Field - COMPACT */}
              <div className="flex-1 sm:max-w-[200px]">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setCalendarType('pickup')
                      setShowCalendar(true)
                    }}
                    className="flex-1 h-[38px]"
                  >
                    <div className="flex items-center justify-between px-2 h-full
                      bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                      hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <div className="flex items-center gap-1.5">
                        <IoCalendarOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <div className="text-left">
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-none">Pickup</p>
                          <p className="text-[12px] font-semibold text-gray-900 dark:text-white leading-tight mt-0.5">
                            {formatDate(searchParams.pickupDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <div className="relative">
                    <button
                      ref={timeButtonRef}
                      onClick={() => setShowTimeDropdown(showTimeDropdown === 'pickup' ? null : 'pickup')}
                      className="h-[38px] px-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                        hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <span className="text-[11px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatTime(searchParams.pickupTime)}
                      </span>
                      <IoChevronDownOutline className="w-3 h-3 text-gray-400" />
                    </button>
                    {showTimeDropdown === 'pickup' && <TimeDropdown type="pickup" />}
                  </div>
                </div>
              </div>
              
              {/* Return Field - COMPACT */}
              <div className="flex-1 sm:max-w-[200px]">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setCalendarType('return')
                      setShowCalendar(true)
                    }}
                    className="flex-1 h-[38px]"
                  >
                    <div className={`flex items-center justify-between px-2 h-full
                      bg-white dark:bg-gray-800 border transition-colors rounded-md
                      ${dateError 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <IoCalendarOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <div className="text-left">
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-none">Return</p>
                          <p className="text-[12px] font-semibold text-gray-900 dark:text-white leading-tight mt-0.5">
                            {formatDate(searchParams.returnDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <div className="relative">
                    <button
                      ref={timeButtonRef}
                      onClick={() => setShowTimeDropdown(showTimeDropdown === 'return' ? null : 'return')}
                      className="h-[38px] px-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                        hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <span className="text-[11px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatTime(searchParams.returnTime)}
                      </span>
                      <IoChevronDownOutline className="w-3 h-3 text-gray-400" />
                    </button>
                    {showTimeDropdown === 'return' && <TimeDropdown type="return" />}
                  </div>
                </div>
              </div>
              
              {/* Search Button - COMPACT */}
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchParams.location || !!dateError}
                className={`h-[38px] px-4 font-semibold rounded-md 
                  transition-all duration-200 whitespace-nowrap text-[12px] flex items-center justify-center gap-1.5 ${
                  searchParams.location && !dateError
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md' 
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <IoSearchOutline className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Date Error */}
            {dateError && (
              <div className="mt-1 text-[10px] text-red-600 dark:text-red-400 px-1">
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