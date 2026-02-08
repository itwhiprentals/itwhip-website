// app/(guest)/components/hero/RentalSearchWidget.tsx
// Refactored - Clean, modular, TIMEZONE & TIME SELECTION & LOCATION FIXED!

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IoCalendarOutline, IoChevronDownOutline } from 'react-icons/io5'
import type { Location } from '@/lib/data/arizona-locations'

// Import our new components
import LocationInput from './search-components/LocationInput'
import CalendarModal from './search-components/CalendarModal'
import TimeDropdown from './search-components/TimeDropdown'
import SearchButton from './search-components/SearchButton'
import AISearchButton from './search-components/AISearchButton'

interface RentalSearchCardProps {
  onSearch?: (params: any) => void
  onAISearch?: () => void
  variant?: 'hero' | 'compact'
  // NEW: Props for initial values
  initialLocation?: string
  initialPickupDate?: string
  initialReturnDate?: string
  initialPickupTime?: string
  initialReturnTime?: string
}

export default function RentalSearchCard({
  onSearch,
  onAISearch,
  variant = 'hero',
  initialLocation,
  initialPickupDate,
  initialReturnDate,
  initialPickupTime,
  initialReturnTime
}: RentalSearchCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarType, setCalendarType] = useState<'pickup' | 'return'>('pickup')
  const [showTimeDropdown, setShowTimeDropdown] = useState<'pickup' | 'return' | null>(null)
  const [dateError, setDateError] = useState<string>('')
  
  const pickupTimeButtonRef = useRef<HTMLButtonElement>(null)
  const returnTimeButtonRef = useRef<HTMLButtonElement>(null)
  
  // Calculate default dates - only on client to avoid hydration mismatch
  const getDefaultDates = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const returnDay = new Date(tomorrow)
    returnDay.setDate(returnDay.getDate() + 2)

    // Format in local timezone
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return {
      pickup: formatLocalDate(tomorrow),
      return: formatLocalDate(returnDay)
    }
  }

  // Track if component has mounted (for hydration-safe date initialization)
  const [hasMounted, setHasMounted] = useState(false)
  
  // Helper to extract date from ISO string (handles "2025-10-22T10:00" format)
  const extractDate = (dateString?: string) => {
    if (!dateString) return ''
    // If it has time component (T), extract just the date part
    return dateString.split('T')[0]
  }
  
  // Helper to extract time from ISO string (handles "2025-10-22T10:00" format)
  const extractTime = (dateString?: string, defaultTime: string = '10:00') => {
    if (!dateString) return defaultTime
    // If it has time component (T), extract just the time part
    const parts = dateString.split('T')
    if (parts.length > 1) {
      return parts[1].substring(0, 5) // Get HH:MM
    }
    return defaultTime
  }
  
  // Initialize with empty dates to avoid hydration mismatch (server/client time diff)
  const [searchParams, setSearchParams] = useState({
    location: initialLocation || '',
    pickupDate: extractDate(initialPickupDate) || '',
    pickupTime: extractTime(initialPickupDate, initialPickupTime || '10:00'),
    returnDate: extractDate(initialReturnDate) || '',
    returnTime: extractTime(initialReturnDate, initialReturnTime || '10:00')
  })

  // Set default dates on client only (after hydration) to avoid mismatch
  useEffect(() => {
    setHasMounted(true)
    if (!initialPickupDate && !initialReturnDate) {
      const defaults = getDefaultDates()
      setSearchParams(prev => ({
        ...prev,
        pickupDate: prev.pickupDate || defaults.pickup,
        returnDate: prev.returnDate || defaults.return
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update state when initial props change (for compact variant on search page)
  useEffect(() => {
    if (initialLocation !== undefined) {
      setSearchParams(prev => ({
        ...prev,
        location: initialLocation,
        pickupDate: extractDate(initialPickupDate) || prev.pickupDate,
        pickupTime: extractTime(initialPickupDate, initialPickupTime || '10:00'),
        returnDate: extractDate(initialReturnDate) || prev.returnDate,
        returnTime: extractTime(initialReturnDate, initialReturnTime || '10:00')
      }))
    }
  }, [initialLocation, initialPickupDate, initialReturnDate, initialPickupTime, initialReturnTime])

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

  // Handle location change (from typing)
  const handleLocationChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, location: value }))
  }

  // Handle location selection (from dropdown)
  const handleLocationSelect = (location: Location) => {
    setSearchParams(prev => ({ ...prev, location: location.name }))
  }

  // Handle date selection
  const handleDateSelect = (date: string) => {
    if (calendarType === 'pickup') {
      setSearchParams(prev => ({ 
        ...prev, 
        pickupDate: date,
        returnDate: date > prev.returnDate ? date : prev.returnDate
      }))
    } else {
      setSearchParams(prev => ({ ...prev, returnDate: date }))
    }
    setShowCalendar(false)
  }

  // Handle time selection
  const handlePickupTimeSelect = (time: string) => {
    setSearchParams(prev => ({ ...prev, pickupTime: time }))
    setTimeout(() => {
      setShowTimeDropdown(null)
    }, 50)
  }

  const handleReturnTimeSelect = (time: string) => {
    setSearchParams(prev => ({ ...prev, returnTime: time }))
    setTimeout(() => {
      setShowTimeDropdown(null)
    }, 50)
  }

  // Format date for display - FIXED FOR TIMEZONE
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select'
    
    // Parse YYYY-MM-DD in local timezone
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    
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

  // Handle search
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

  return (
    <>
      {/* Conditional wrapper based on variant - hero gets max-w-5xl, compact gets full width */}
      <div className={`w-full relative z-10 ${variant === 'hero' ? 'max-w-5xl mx-auto px-4 sm:px-0' : ''}`}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-1.5">
            {/* Single line layout on desktop, stack on mobile - ULTRA MAXIMIZED WIDTHS FOR COMPACT */}
            <div className="flex flex-col sm:flex-row gap-1">
              
              {/* Location Field - ULTRA MAXIMIZED to 460px in compact */}
              <div className={variant === 'compact' ? 'flex-1 sm:max-w-[460px]' : 'flex-1'}>
                <LocationInput
                  value={searchParams.location}
                  onChange={handleLocationChange}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Where?"
                  onAISearch={onAISearch}
                />
              </div>
              
              {/* Pickup Field - ULTRA MAXIMIZED to 360px in compact */}
              <div className={variant === 'compact' ? 'flex-1 sm:max-w-[360px]' : 'flex-1 sm:max-w-[200px]'}>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setCalendarType('pickup')
                      setShowCalendar(true)
                    }}
                    className="flex-1 h-[38px]"
                    type="button"
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
                  
                  <button
                    ref={pickupTimeButtonRef}
                    onClick={() => setShowTimeDropdown(showTimeDropdown === 'pickup' ? null : 'pickup')}
                    className="h-[38px] px-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                      hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-1"
                    type="button"
                  >
                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatTime(searchParams.pickupTime)}
                    </span>
                    <IoChevronDownOutline className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Return Field - ULTRA MAXIMIZED to 360px in compact */}
              <div className={variant === 'compact' ? 'flex-1 sm:max-w-[360px]' : 'flex-1 sm:max-w-[200px]'}>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setCalendarType('return')
                      setShowCalendar(true)
                    }}
                    className="flex-1 h-[38px]"
                    type="button"
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
                  
                  <button
                    ref={returnTimeButtonRef}
                    onClick={() => setShowTimeDropdown(showTimeDropdown === 'return' ? null : 'return')}
                    className="h-[38px] px-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                      hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-1"
                    type="button"
                  >
                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatTime(searchParams.returnTime)}
                    </span>
                    <IoChevronDownOutline className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Search Button */}
              <SearchButton
                onClick={handleSearch}
                disabled={!searchParams.location || !!dateError}
                isLoading={isLoading}
              />

              {/* AI Search Button - desktop only */}
              <div className="hidden sm:block">
                <AISearchButton onActivate={onAISearch} />
              </div>
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
      
      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        currentDate={calendarType === 'pickup' ? searchParams.pickupDate : searchParams.returnDate}
        minDate={calendarType === 'pickup' ? new Date().toISOString().split('T')[0] : searchParams.pickupDate}
        onDateSelect={handleDateSelect}
        title={`${calendarType === 'pickup' ? 'Pickup' : 'Return'} Date`}
      />
      
      {/* Time Dropdowns */}
      <TimeDropdown
        isOpen={showTimeDropdown === 'pickup'}
        currentTime={searchParams.pickupTime}
        onSelect={handlePickupTimeSelect}
        buttonRef={pickupTimeButtonRef}
        onClose={() => setShowTimeDropdown(null)}
      />
      
      <TimeDropdown
        isOpen={showTimeDropdown === 'return'}
        currentTime={searchParams.returnTime}
        onSelect={handleReturnTimeSelect}
        buttonRef={returnTimeButtonRef}
        onClose={() => setShowTimeDropdown(null)}
      />
    </>
  )
}