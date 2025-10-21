// app/(guest)/components/hero/RentalSearchWidget.tsx
// Refactored - Clean, modular, TIMEZONE & TIME SELECTION FIXED!

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
  
  const pickupTimeButtonRef = useRef<HTMLButtonElement>(null)
  const returnTimeButtonRef = useRef<HTMLButtonElement>(null)
  
  // Calculate default dates
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

  // Handle location selection
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

  // Handle time selection - FIXED!
  const handlePickupTimeSelect = (time: string) => {
    console.log('✅ PARENT: Pickup time selected:', time)
    setSearchParams(prev => {
      const newParams = { ...prev, pickupTime: time }
      console.log('✅ PARENT: New state:', newParams)
      return newParams
    })
    // Close dropdown after a tiny delay to ensure state updates
    setTimeout(() => {
      setShowTimeDropdown(null)
    }, 50)
  }

  const handleReturnTimeSelect = (time: string) => {
    console.log('✅ PARENT: Return time selected:', time)
    setSearchParams(prev => {
      const newParams = { ...prev, returnTime: time }
      console.log('✅ PARENT: New state:', newParams)
      return newParams
    })
    // Close dropdown after a tiny delay to ensure state updates
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
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-0 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-1.5">
            {/* Single line layout on desktop, stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-1">
              
              {/* Location Field */}
              <LocationInput
                value={searchParams.location}
                onChange={(value) => setSearchParams(prev => ({ ...prev, location: value }))}
                onLocationSelect={handleLocationSelect}
                placeholder="Where?"
              />
              
              {/* Pickup Field */}
              <div className="flex-1 sm:max-w-[200px]">
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
              
              {/* Return Field */}
              <div className="flex-1 sm:max-w-[200px]">
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
      />
      
      <TimeDropdown
        isOpen={showTimeDropdown === 'return'}
        currentTime={searchParams.returnTime}
        onSelect={handleReturnTimeSelect}
        buttonRef={returnTimeButtonRef}
      />
    </>
  )
}