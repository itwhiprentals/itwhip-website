// app/(guest)/rentals/components/details/BookingWidget.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoCalendarOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoPricetagOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoCarOutline,
  IoHomeOutline,
  IoAirplaneOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'
import { calculateRentalPrice } from '../../lib/pricing'
import type { RentalCarWithDetails } from '@/types/rental'

interface BookingWidgetProps {
  car: RentalCarWithDetails
  initialDates?: {
    startDate: string
    endDate: string
  }
  hotelBooking?: {
    checkIn: string
    checkOut: string
    hotelName: string
    hotelAddress: string
  }
}

// API function to check availability
async function checkCarAvailability(
  carId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      carId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
    
    const response = await fetch(`/api/rentals/availability?${params}`)
    
    if (!response.ok) {
      console.error('Availability check failed:', response.status)
      return false
    }
    
    const data = await response.json()
    return data.available ?? false
  } catch (error) {
    console.error('Error checking availability:', error)
    return false
  }
}

export default function BookingWidget({ car, initialDates, hotelBooking }: BookingWidgetProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [deliveryAddressError, setDeliveryAddressError] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Dates
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const defaultEndDate = new Date(Date.now() + 259200000).toISOString().split('T')[0] // 3 days
  
  const [startDate, setStartDate] = useState(
    hotelBooking?.checkIn || initialDates?.startDate || tomorrow
  )
  const [endDate, setEndDate] = useState(
    hotelBooking?.checkOut || initialDates?.endDate || defaultEndDate
  )
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('10:00')
  
  // Delivery - Auto-select hotel if hotel booking exists
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'airport' | 'hotel' | 'home'>(
    hotelBooking ? 'hotel' : 'pickup'
  )
  const [deliveryAddress, setDeliveryAddress] = useState(
    hotelBooking ? `${hotelBooking.hotelName}, ${hotelBooking.hotelAddress}` : ''
  )
  
  // Add-ons
  const [addInsurance, setAddInsurance] = useState(true)
  const [addGPS, setAddGPS] = useState(false)
  const [addChildSeat, setAddChildSeat] = useState(false)
  
  // Safe property access with defaults
  const dailyRate = car.dailyRate || 0
  const weeklyDiscount = car.weeklyDiscount || 0
  const monthlyDiscount = car.monthlyDiscount || 0
  const deliveryFee = car.deliveryFee || 25
  const insuranceDaily = car.insuranceDaily || 15
  const instantBook = car.instantBook ?? false
  const carSource = car.source || 'amadeus'
  
  // Calculate pricing with safe defaults
  const pricing = calculateRentalPrice({
    dailyRate,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    weeklyDiscount,
    monthlyDiscount,
    deliveryFee: deliveryType !== 'pickup' ? deliveryFee : 0,
    insuranceDaily: addInsurance ? insuranceDaily : 0,
    extras: {
      gps: addGPS ? 10 : 0,
      childSeat: addChildSeat ? 15 : 0
    }
  })
  
  // Ensure all pricing values are defined with defaults
  const safePricing = {
    days: pricing?.days || 1,
    basePrice: pricing?.basePrice || 0,
    discount: pricing?.discount || 0,
    deliveryFee: pricing?.deliveryFee || 0,
    insuranceFee: pricing?.insuranceFee || 0,
    extrasTotal: pricing?.extrasTotal || 0,
    serviceFee: pricing?.serviceFee || 0,
    taxes: pricing?.taxes || 0,
    total: pricing?.total || 0
  }
  
  // Validate dates and times
  const validateDateTime = useCallback(() => {
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    
    if (end <= start) {
      return 'End date/time must be after start date/time'
    }
    
    // Minimum rental period: 1 day
    const hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    if (hoursDiff < 24) {
      return 'Minimum rental period is 24 hours'
    }
    
    return null
  }, [startDate, endDate, startTime, endTime])
  
  // Check availability when dates change
  useEffect(() => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const checkAvailability = async () => {
      const dateError = validateDateTime()
      if (dateError) {
        setIsAvailable(false)
        return
      }
      
      setIsCheckingAvailability(true)
      setIsAvailable(null)
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()
      
      try {
        const available = await checkCarAvailability(
          car.id,
          new Date(startDate),
          new Date(endDate)
        )
        
        // Only update if request wasn't aborted
        if (!abortControllerRef.current.signal.aborted) {
          setIsAvailable(available)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Availability check error:', error)
          setIsAvailable(false)
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsCheckingAvailability(false)
        }
      }
    }
    
    checkAvailability()
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [car.id, startDate, endDate, startTime, endTime, validateDateTime])
  
  // Validate delivery address when needed
  useEffect(() => {
    if ((deliveryType === 'hotel' || deliveryType === 'home') && !deliveryAddress.trim()) {
      setDeliveryAddressError('Delivery address is required')
    } else {
      setDeliveryAddressError('')
    }
  }, [deliveryType, deliveryAddress])
  
  const handleBooking = () => {
    // Validation checks
    if (!isAvailable || isCheckingAvailability || isLoading) return
    
    const dateError = validateDateTime()
    if (dateError) {
      alert(dateError)
      return
    }
    
    if ((deliveryType === 'hotel' || deliveryType === 'home') && !deliveryAddress.trim()) {
      setDeliveryAddressError('Please enter a delivery address')
      return
    }
    
    setIsLoading(true)
    
    // Store booking details in sessionStorage
    const bookingDetails = {
      carId: car.id,
      carDetails: {
        make: car.make,
        model: car.model,
        year: car.year,
        dailyRate: car.dailyRate,
        source: car.source
      },
      startDate,
      endDate,
      startTime,
      endTime,
      deliveryType,
      deliveryAddress: deliveryAddress.trim(),
      addInsurance,
      addGPS,
      addChildSeat,
      pricing: safePricing,
      hotelBooking
    }
    
    try {
      sessionStorage.setItem('rentalBookingDetails', JSON.stringify(bookingDetails))
      router.push(`/rentals/${car.id}/book`)
    } catch (error) {
      console.error('Error saving booking details:', error)
      alert('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }
  
  const deliveryOptions = [
    { value: 'pickup', label: 'Host Location', icon: IoLocationOutline, fee: 0 },
    { value: 'airport', label: 'Airport', icon: IoAirplaneOutline, fee: deliveryFee },
    { value: 'hotel', label: 'Hotel', icon: IoHomeOutline, fee: deliveryFee },
    { value: 'home', label: 'Home Delivery', icon: IoCarOutline, fee: deliveryFee + 10 }
  ]
  
  const dateTimeError = validateDateTime()
  const canBook = isAvailable && !isCheckingAvailability && !isLoading && !dateTimeError && !deliveryAddressError

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-20">
      {/* Price Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ${dailyRate}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/ day</span>
        </div>
        {carSource === 'p2p' && (
          <div className="flex items-center gap-1 mt-2 text-amber-600">
            <IoSparklesOutline className="w-4 h-4" />
            <span className="text-sm font-medium">ItWhip Exclusive</span>
          </div>
        )}
      </div>
      
      {/* Dates Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IoCalendarOutline className="inline w-4 h-4 mr-1" />
            Trip Dates
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-date" className="sr-only">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white text-sm"
                aria-label="Start date"
              />
              <label htmlFor="start-time" className="sr-only">Start Time</label>
              <select
                id="start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white text-sm"
                aria-label="Start time"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0')
                  return (
                    <option key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label htmlFor="end-date" className="sr-only">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white text-sm"
                aria-label="End date"
              />
              <label htmlFor="end-time" className="sr-only">End Time</label>
              <select
                id="end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white text-sm"
                aria-label="End time"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0')
                  return (
                    <option key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          
          {/* Date/Time Validation Error */}
          {dateTimeError && (
            <div className="mt-2 flex items-center gap-1 text-red-600 text-xs">
              <IoWarningOutline className="w-4 h-4" />
              <span>{dateTimeError}</span>
            </div>
          )}
        </div>
        
        {/* Delivery Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IoLocationOutline className="inline w-4 h-4 mr-1" />
            Pickup / Delivery
          </label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Delivery options">
            {deliveryOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setDeliveryType(option.value as any)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                    deliveryType === option.value
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  aria-pressed={deliveryType === option.value}
                  aria-label={`${option.label} ${option.fee > 0 ? `plus $${option.fee} fee` : 'no fee'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  {option.fee > 0 && (
                    <span className="text-xs">+${option.fee}</span>
                  )}
                </button>
              )
            })}
          </div>
          
          {(deliveryType === 'hotel' || deliveryType === 'home') && (
            <>
              <label htmlFor="delivery-address" className="sr-only">
                {deliveryType === 'hotel' ? 'Hotel name or address' : 'Delivery address'}
              </label>
              <input
                id="delivery-address"
                type="text"
                placeholder={deliveryType === 'hotel' ? 'Hotel name or address' : 'Delivery address'}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className={`w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white text-sm ${
                  deliveryAddressError 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                aria-invalid={!!deliveryAddressError}
                aria-describedby={deliveryAddressError ? 'delivery-error' : undefined}
              />
              {deliveryAddressError && (
                <p id="delivery-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {deliveryAddressError}
                </p>
              )}
            </>
          )}
        </div>
        
        {/* Add-ons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IoPricetagOutline className="inline w-4 h-4 mr-1" />
            Protection & Extras
          </label>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={addInsurance}
                  onChange={(e) => setAddInsurance(e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  aria-label="Add protection plan"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Protection Plan</span>
                  </div>
                  <span className="text-xs text-gray-500">Recommended coverage</span>
                </div>
              </div>
              <span className="text-sm font-medium">${insuranceDaily}/day</span>
            </label>
            
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={addGPS}
                  onChange={(e) => setAddGPS(e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  aria-label="Add GPS navigation"
                />
                <span className="text-sm">GPS Navigation</span>
              </div>
              <span className="text-sm">$10/day</span>
            </label>
            
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={addChildSeat}
                  onChange={(e) => setAddChildSeat(e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  aria-label="Add child safety seat"
                />
                <span className="text-sm">Child Safety Seat</span>
              </div>
              <span className="text-sm">$15/day</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Price Breakdown */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            ${dailyRate} × {safePricing.days} {safePricing.days === 1 ? 'day' : 'days'}
          </span>
          <span>${safePricing.basePrice.toFixed(2)}</span>
        </div>
        
        {safePricing.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>
              {safePricing.days >= 30 ? 'Monthly' : safePricing.days >= 7 ? 'Weekly' : ''} discount
            </span>
            <span>-${safePricing.discount.toFixed(2)}</span>
          </div>
        )}
        
        {safePricing.deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Delivery fee</span>
            <span>${safePricing.deliveryFee.toFixed(2)}</span>
          </div>
        )}
        
        {safePricing.insuranceFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Protection plan</span>
            <span>${safePricing.insuranceFee.toFixed(2)}</span>
          </div>
        )}
        
        {safePricing.extrasTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Extras</span>
            <span>${safePricing.extrasTotal.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Service fee</span>
          <span>${safePricing.serviceFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Taxes</span>
          <span>${safePricing.taxes.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-xl">${safePricing.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Plus $500 refundable deposit
          </p>
        </div>
      </div>
      
      {/* Availability Status */}
      {isCheckingAvailability && (
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Checking availability...</span>
        </div>
      )}
      
      {!isCheckingAvailability && isAvailable === false && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg mb-4">
          <IoAlertCircleOutline className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">
            {dateTimeError || 'Not available for selected dates'}
          </span>
        </div>
      )}
      
      {!isCheckingAvailability && isAvailable === true && !dateTimeError && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg mb-4">
          <IoCheckmarkCircleOutline className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">Available for your dates!</span>
        </div>
      )}
      
      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!canBook}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          canBook
            ? 'bg-amber-600 hover:bg-amber-700 text-white'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </span>
        ) : instantBook ? (
          'Book Instantly'
        ) : (
          'Request to Book'
        )}
      </button>
      
      {/* Info */}
      <div className="mt-4 space-y-2">
        {instantBook && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <IoSparklesOutline className="w-4 h-4" />
            <span>Instant booking - no approval needed</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <IoInformationCircleOutline className="w-4 h-4" />
          <span>Free cancellation up to 24 hours before</span>
        </div>
      </div>
      
      {/* Hotel Integration Notice */}
      {hotelBooking && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <IoHomeOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Staying at {hotelBooking.hotelName}?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                We've matched your rental dates with your hotel stay. 
                Free delivery to your hotel available!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}