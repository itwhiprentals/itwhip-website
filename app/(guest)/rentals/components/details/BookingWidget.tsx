// app/(guest)/rentals/components/details/BookingWidget.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  IoCalendarOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoCarSportOutline,
  IoHomeOutline,
  IoAirplaneOutline,
  IoSparklesOutline,
  IoFlashOutline,
  IoTrophyOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoWarningOutline,
  IoCarOutline,
  IoPersonAddOutline,
  IoWaterOutline,
  IoLockClosedOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface BookingWidgetProps {
  car: any
  isBookable?: boolean
  suspensionMessage?: string | null
}

interface InsuranceQuote {
  tier: string
  vehicleValue: number
  days: number
  dailyPremium: number
  totalPremium: number
  platformRevenue: number
  increasedDeposit: number | null
  coverage: {
    liability: number
    collision: number | string
    deductible: number
    description: string
  }
  provider: {
    id: string
    name: string
    type: string
  }
}

// Helper function to determine car class and deposit
function getCarClassAndDeposit(dailyRate: number): { carClass: string; deposit: number } {
  if (dailyRate < 150) {
    return { carClass: 'economy', deposit: 250 }
  } else if (dailyRate < 500) {
    return { carClass: 'luxury', deposit: 700 }
  } else {
    return { carClass: 'exotic', deposit: 1000 }
  }
}

// Helper function to get Arizona date string (no timezone conversion)
function getArizonaDateString(daysToAdd: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysToAdd)
  
  // Format as YYYY-MM-DD in local time (not UTC)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// Helper to extract date and time from ISO datetime string
function extractDateAndTime(isoString: string): { date: string; time: string } {
  if (!isoString) {
    return { date: '', time: '10:00' }
  }
  
  // Handle both "YYYY-MM-DDTHH:MM" and "YYYY-MM-DD" formats
  const parts = isoString.split('T')
  const date = parts[0] || ''
  const time = parts[1] ? parts[1].substring(0, 5) : '10:00'
  
  return { date, time }
}

export default function BookingWidget({ car, isBookable = true, suspensionMessage }: BookingWidgetProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showFloatingPrice, setShowFloatingPrice] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  
  // Read search params from URL
  const pickupDateParam = searchParams.get('pickupDate') || ''
  const returnDateParam = searchParams.get('returnDate') || ''
  
  // Extract dates and times from URL params
  const { date: pickupDateFromUrl, time: pickupTimeFromUrl } = extractDateAndTime(pickupDateParam)
  const { date: returnDateFromUrl, time: returnTimeFromUrl } = extractDateAndTime(returnDateParam)
  
  // Use defaults if no URL params
  const today = getArizonaDateString(0)
  const tomorrow = getArizonaDateString(1)
  const defaultEndDate = getArizonaDateString(3)
  
  // Initialize with URL params or defaults
  const [startDate, setStartDate] = useState(pickupDateFromUrl || tomorrow)
  const [endDate, setEndDate] = useState(returnDateFromUrl || defaultEndDate)
  const [startTime, setStartTime] = useState(pickupTimeFromUrl || '10:00')
  const [endTime, setEndTime] = useState(returnTimeFromUrl || '10:00')
  
  // Update state when URL params change
  useEffect(() => {
    if (pickupDateFromUrl) setStartDate(pickupDateFromUrl)
    if (returnDateFromUrl) setEndDate(returnDateFromUrl)
    if (pickupTimeFromUrl) setStartTime(pickupTimeFromUrl)
    if (returnTimeFromUrl) setEndTime(returnTimeFromUrl)
  }, [pickupDateFromUrl, returnDateFromUrl, pickupTimeFromUrl, returnTimeFromUrl])
  
  // Collapsible sections
  const [showDelivery, setShowDelivery] = useState(false)
  const [showEnhancements, setShowEnhancements] = useState(false)
  const [expandedInsurance, setExpandedInsurance] = useState<string | null>(null)
  
  // Insurance from database
  const [insuranceTier, setInsuranceTier] = useState<'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY'>('PREMIUM')
  const [insuranceQuotes, setInsuranceQuotes] = useState<{ [key: string]: InsuranceQuote | null }>({
    MINIMUM: null,
    BASIC: null,
    PREMIUM: null,
    LUXURY: null
  })
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  
  // Delivery
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'airport' | 'hotel' | 'valet'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  
  // Add-ons
  const [addOns, setAddOns] = useState({
    refuelService: false,
    additionalDriver: false,
    extraMiles: false,
    vipConcierge: false
  })
  
  // Pricing based on car
  const dailyRate = car?.dailyRate || 1495
  const vehicleValue = car?.value || dailyRate * 365 // Estimate if not provided
  const { carClass, deposit: baseDeposit } = getCarClassAndDeposit(dailyRate)
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1
  
  // Get current insurance quote
  const currentQuote = insuranceQuotes[insuranceTier]
  const insurancePrice = currentQuote?.totalPremium || 0
  const actualDeposit = currentQuote?.increasedDeposit || baseDeposit
  
  const basePrice = dailyRate * days
  const refuelService = addOns.refuelService ? 75 : 0
  const additionalDriver = addOns.additionalDriver ? 50 * days : 0
  const extraMiles = addOns.extraMiles ? 295 : 0
  const vipConcierge = addOns.vipConcierge ? 150 * days : 0
  const deliveryFee = deliveryType === 'valet' ? 195 : deliveryType === 'airport' ? 50 : deliveryType === 'hotel' ? 105 : 0
  
  const serviceFee = Math.round(basePrice * 0.15)
  const taxes = Math.round((basePrice + serviceFee) * 0.086)
  const total = basePrice + insurancePrice + refuelService + additionalDriver + extraMiles + vipConcierge + deliveryFee + serviceFee + taxes
  
  // Fetch insurance quotes when dates change
  useEffect(() => {
    if (days > 0) {
      fetchInsuranceQuotes()
    }
  }, [days, vehicleValue])
  
  const fetchInsuranceQuotes = async () => {
    setLoadingQuotes(true)
    try {
      // Fetch quotes for all tiers
      const tiers: Array<'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY'> = ['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY']
      const quotes: { [key: string]: InsuranceQuote | null } = {}
      
      for (const tier of tiers) {
        const response = await fetch('/api/bookings/insurance/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carId: car?.id,
            vehicleValue,
            startDate,
            endDate,
            tier
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          quotes[tier] = data.quote
        } else {
          quotes[tier] = null
        }
      }
      
      setInsuranceQuotes(quotes)
    } catch (error) {
      console.error('Failed to fetch insurance quotes:', error)
    } finally {
      setLoadingQuotes(false)
    }
  }
  
  // Handle scroll for floating price (mobile)
  useEffect(() => {
    const handleScroll = () => {
      if (widgetRef.current) {
        const rect = widgetRef.current.getBoundingClientRect()
        setShowFloatingPrice(rect.bottom < 100 || rect.top > window.innerHeight)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const handleBooking = () => {
    if (!isBookable) return
    
    setIsLoading(true)
    
    const bookingDetails = {
      carId: car?.id,
      carClass,
      startDate,
      endDate,
      startTime,
      endTime,
      timezone: 'America/Phoenix',
      deliveryType,
      deliveryAddress,
      insuranceTier,
      insuranceQuote: currentQuote,
      addOns,
      pricing: {
        days,
        dailyRate,
        basePrice,
        insurancePrice,
        deliveryFee,
        serviceFee,
        taxes,
        total,
        deposit: actualDeposit,
        breakdown: {
          refuelService,
          additionalDriver,
          extraMiles,
          vipConcierge
        }
      }
    }
    
    sessionStorage.setItem('rentalBookingDetails', JSON.stringify(bookingDetails))
    router.push(`/rentals/${car?.id}/book`)
  }
  
  const deliveryOptions = [
    { value: 'pickup', label: 'Pickup', icon: IoCarSportOutline, fee: 0, desc: 'Meet at location' },
    { value: 'valet', label: 'Valet', icon: IoSparklesOutline, fee: 195, desc: 'White glove service' },
    { value: 'airport', label: 'Airport', icon: IoAirplaneOutline, fee: 50, desc: 'PHX Sky Harbor' },
    { value: 'hotel', label: 'Hotel', icon: IoHomeOutline, fee: 105, desc: 'Your accommodation' }
  ]

  const getInsuranceTierName = (tier: string) => {
    const names: { [key: string]: string } = {
      MINIMUM: 'Minimum',
      BASIC: 'Basic',
      PREMIUM: 'Premium',
      LUXURY: 'Luxury'
    }
    return names[tier] || tier
  }

  // ============================================================================
  // 🔒 UNAVAILABLE STATE - PRIVACY PROTECTED
  // ============================================================================
  if (!isBookable) {
    return (
      <div ref={widgetRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sticky top-20">
        <div className="text-center mb-6">
          <IoLockClosedOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Currently Unavailable
          </h3>
          {/* 🔒 PRIVACY: Always show generic message - NEVER expose operational details */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This vehicle is currently unavailable.
          </p>
        </div>

        <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-2xl font-bold text-gray-500 dark:text-gray-400 line-through">
              ${dailyRate.toLocaleString()}
            </span>
            <span className="text-gray-400 dark:text-gray-500">/ day</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/rentals/dashboard/bookings"
            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <IoCalendarOutline className="w-5 h-5" />
            View Booking History
          </Link>

          <Link
            href={`/rentals/search?location=${car?.city || 'Phoenix'}&carType=${car?.carType || ''}`}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <IoCarOutline className="w-5 h-5" />
            Browse Similar Cars
          </Link>

          {/* ✅ FUNCTIONAL: Email support with vehicle context */}
          <a
            href={`mailto:support@itwhip.com?subject=Vehicle Unavailable - ${car?.year} ${car?.make} ${car?.model}&body=Hello ItWhip Support,%0A%0AI'm interested in this vehicle but it shows as unavailable:%0A%0AVehicle: ${car?.year} ${car?.make} ${car?.model}%0ACar ID: ${car?.id}%0ALocation: ${car?.city}, ${car?.state}%0A%0ACould you please let me know when it becomes available or suggest similar options?%0A%0AThank you!`}
            className="w-full py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 font-medium flex items-center justify-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg transition-colors"
          >
            <IoInformationCircleOutline className="w-4 h-4" />
            Email Support for Assistance
          </a>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <IoInformationCircleOutline className="inline w-3 h-3 mr-1" />
            This listing may become available again. Add it to your favorites to be notified of status changes.
          </p>
        </div>
      </div>
    )
  }

  // ============================================================================
  // NORMAL BOOKABLE WIDGET
  // ============================================================================
  return (
    <>
      <div ref={widgetRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sticky top-20">
        {/* Price Header */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${dailyRate.toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/ day</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {carClass === 'exotic' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs font-semibold rounded">
                    <IoTrophyOutline className="w-3 h-3" />
                    <span>EXOTIC</span>
                  </div>
                )}
                {carClass === 'luxury' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                    <IoSparklesOutline className="w-3 h-3" />
                    <span>LUXURY</span>
                  </div>
                )}
                {car?.instantBook && (
                  <div className="flex items-center gap-1 text-amber-600 text-sm">
                    <IoFlashOutline className="w-3.5 h-3.5" />
                    <span className="font-medium">Instant Book</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Min 1 day</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">200 mi/day included</p>
            </div>
          </div>
        </div>
        
        {/* Dates Selection */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoCalendarOutline className="w-4 h-4" />
            Select Dates
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Pickup</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Return</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
          {days > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              {days} {days === 1 ? 'day' : 'days'} rental
            </p>
          )}
        </div>
        
        {/* Insurance Protection - Database Driven */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-4 h-4" />
            Insurance Protection
            <span className="text-xs font-normal text-red-500">*Required</span>
          </label>
          
          {loadingQuotes ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Loading insurance options...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(['LUXURY', 'PREMIUM', 'BASIC', 'MINIMUM'] as const).map((tier) => {
                const quote = insuranceQuotes[tier]
                if (!quote) return null
                
                return (
                  <div key={tier} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <label className={`block p-3 cursor-pointer transition-all ${insuranceTier === tier ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="insurance"
                            value={tier}
                            checked={insuranceTier === tier}
                            onChange={(e) => setInsuranceTier(e.target.value as any)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <span className="text-sm font-medium">{getInsuranceTierName(tier)} Protection</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setExpandedInsurance(expandedInsurance === tier ? null : tier)
                              }}
                              className="ml-2 text-xs text-amber-600 hover:text-amber-700"
                            >
                              {expandedInsurance === tier ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          {quote.dailyPremium === 0 ? 'Included' : `$${quote.dailyPremium}/day`}
                        </span>
                      </div>
                    </label>
                    {expandedInsurance === tier && (
                      <div className="px-6 pb-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                        {tier === 'LUXURY' && (
                          <div className="mt-2 mb-2">
                            <span className="text-green-600 font-semibold">✓ RECOMMENDED OPTION</span>
                          </div>
                        )}
                        {tier === 'MINIMUM' && quote.increasedDeposit && (
                          <div className="mt-2 mb-2">
                            <span className="text-orange-600 font-semibold flex items-center gap-1">
                              <IoWarningOutline className="w-3 h-3" />
                              Requires ${quote.increasedDeposit.toLocaleString()} deposit
                            </span>
                          </div>
                        )}
                        <ul className="space-y-1 mt-2">
                          <li>• Liability: ${quote.coverage.liability.toLocaleString()}</li>
                          <li>• Collision: {typeof quote.coverage.collision === 'number' ? `$${quote.coverage.collision.toLocaleString()}` : quote.coverage.collision}</li>
                          <li>• Deductible: {quote.coverage.deductible === 0 ? 'None' : `$${quote.coverage.deductible.toLocaleString()}`}</li>
                          <li className="text-gray-500 mt-1">• {quote.coverage.description}</li>
                        </ul>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500">
                            Provider: {quote.provider.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Delivery Method - COLLAPSIBLE */}
        <div className="mb-4">
          <button
            onClick={() => setShowDelivery(!showDelivery)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <IoLocationOutline className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Delivery Method</span>
              {deliveryType !== 'pickup' && (
                <span className="text-xs text-amber-600 ml-2">
                  • {deliveryOptions.find(o => o.value === deliveryType)?.label} (+${deliveryOptions.find(o => o.value === deliveryType)?.fee})
                </span>
              )}
            </div>
            {showDelivery ? (
              <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
            ) : (
              <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showDelivery && (
            <div className="p-3 border-x border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-lg">
              <div className="grid grid-cols-2 gap-2">
                {deliveryOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => setDeliveryType(option.value as any)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        deliveryType === option.value
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs font-semibold">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                      {option.fee > 0 && <div className="text-xs font-medium mt-1">+${option.fee}</div>}
                    </button>
                  )
                })}
              </div>
              
              {(deliveryType === 'hotel' || deliveryType === 'valet') && (
                <input
                  type="text"
                  placeholder={deliveryType === 'hotel' ? 'Enter hotel name and address' : 'Enter delivery address'}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full mt-3 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm placeholder-gray-400"
                />
              )}
            </div>
          )}
        </div>
        
        {/* Enhancements - COLLAPSIBLE */}
        <div className="mb-6">
          <button
            onClick={() => setShowEnhancements(!showEnhancements)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <IoSparklesOutline className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Experience Enhancements</span>
              {Object.values(addOns).filter(v => v).length > 0 && (
                <span className="text-xs text-amber-600 ml-2">
                  • {Object.values(addOns).filter(v => v).length} selected
                </span>
              )}
            </div>
            {showEnhancements ? (
              <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
            ) : (
              <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showEnhancements && (
            <div className="p-3 border-x border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-lg space-y-2">
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={addOns.refuelService}
                    onChange={(e) => setAddOns({...addOns, refuelService: e.target.checked})}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium flex items-center gap-2">
                      <IoWaterOutline className="w-4 h-4" />
                      Refuel Service
                    </span>
                    <p className="text-xs text-gray-500">Skip the gas station - we'll refuel for you</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">$75</span>
              </label>
              
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={addOns.additionalDriver}
                    onChange={(e) => setAddOns({...addOns, additionalDriver: e.target.checked})}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium flex items-center gap-2">
                      <IoPersonAddOutline className="w-4 h-4" />
                      Additional Driver
                    </span>
                    <p className="text-xs text-gray-500">Add another authorized driver</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">${50}/day</span>
              </label>
              
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={addOns.extraMiles}
                    onChange={(e) => setAddOns({...addOns, extraMiles: e.target.checked})}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium flex items-center gap-2">
                      <IoCarOutline className="w-4 h-4" />
                      Extra Miles Package
                    </span>
                    <p className="text-xs text-gray-500">+500 miles added to your trip</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">$295</span>
              </label>
              
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={addOns.vipConcierge}
                    onChange={(e) => setAddOns({...addOns, vipConcierge: e.target.checked})}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium">VIP Concierge Service</span>
                    <p className="text-xs text-gray-500">24/7 personal assistant</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">${150}/day</span>
              </label>
            </div>
          )}
        </div>
        
        {/* Price Breakdown */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              ${dailyRate.toLocaleString()} × {days} {days === 1 ? 'day' : 'days'}
            </span>
            <span>${basePrice.toLocaleString()}</span>
          </div>
          
          {insurancePrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Insurance ({getInsuranceTierName(insuranceTier)})</span>
              <span>${insurancePrice.toLocaleString()}</span>
            </div>
          )}
          
          {(refuelService + additionalDriver + extraMiles + vipConcierge) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Enhancements</span>
              <span>${(refuelService + additionalDriver + extraMiles + vipConcierge).toLocaleString()}</span>
            </div>
          )}
          
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Delivery</span>
              <span>${deliveryFee}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Service fee</span>
            <span>${serviceFee.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Taxes</span>
            <span>${taxes.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${total.toLocaleString()}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Plus ${actualDeposit.toLocaleString()} security deposit (hold)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            'Continue to Checkout'
          )}
        </button>
        
        {/* Trust Badges */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              <span>Free cancellation</span>
            </div>
            <div className="flex items-center gap-1">
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              <span>Fully insured</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Price Bar (Mobile) */}
      {showFloatingPrice && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50 lg:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${total.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">total</span>
                </div>
                <p className="text-xs text-gray-500">{days} {days === 1 ? 'day' : 'days'} • {car?.make} {car?.model}</p>
              </div>
              <button
                onClick={handleBooking}
                className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg shadow-lg"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}