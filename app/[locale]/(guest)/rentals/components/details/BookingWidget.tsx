// app/(guest)/rentals/components/details/BookingWidget.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations, useFormatter } from 'next-intl'
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

// Import shared booking pricing utility (ensures consistent calculations across all booking stages)
import { calculateFromWidgetState, formatPrice, getActualDeposit, getCarClassAndDefaultDeposit } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'

// Import availability hook and date picker component
import { useCarAvailability } from '@/app/hooks/useCarAvailability'
import DateRangePicker from './DateRangePicker'

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
  const t = useTranslations('BookingWidget')
  const format = useFormatter()
  const [isLoading, setIsLoading] = useState(false)
  const [showFloatingPrice, setShowFloatingPrice] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Fetch blocked dates for this car
  const { blockedDates, loading: availabilityLoading, validateDateRange } = useCarAvailability(car?.id)

  // Rideshare detection - vehicleType is set when adding vehicles in partner dashboard
  // Fallback checks for legacy records: host type or partnerSlug
  const isRideshare = car?.vehicleType?.toUpperCase() === 'RIDESHARE'
    || car?.host?.hostType === 'FLEET_PARTNER'
    || car?.host?.hostType === 'PARTNER'
    || !!car?.host?.partnerSlug
  // RIDESHARE = ALWAYS 3+ DAYS, NO EXCEPTIONS (ignores DB value if it's wrong)
  // For rentals only, use minTripDuration from DB or default to 1
  const minDays = isRideshare ? 3 : (car?.minTripDuration || 1)
  
  // Read search params from URL
  const pickupDateParam = searchParams.get('pickupDate') || ''
  const returnDateParam = searchParams.get('returnDate') || ''
  
  // Extract dates and times from URL params
  const { date: pickupDateFromUrl, time: pickupTimeFromUrl } = extractDateAndTime(pickupDateParam)
  const { date: returnDateFromUrl, time: returnTimeFromUrl } = extractDateAndTime(returnDateParam)
  
  // Use defaults if no URL params (respect minimum trip duration)
  const today = getArizonaDateString(0)
  const tomorrow = getArizonaDateString(1)
  const defaultEndDate = getArizonaDateString(minDays + 1) // +1 because start is tomorrow

  // Initialize with URL params or defaults
  const [startDate, setStartDate] = useState(pickupDateFromUrl || tomorrow)
  const [endDate, setEndDate] = useState(returnDateFromUrl || defaultEndDate)

  // Helper to get date string N days from a given date
  const getDatePlusDays = (dateStr: string, daysToAdd: number): string => {
    const date = new Date(dateStr + 'T00:00:00')
    date.setDate(date.getDate() + daysToAdd)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Calculate minimum end date (startDate + minDays)
  const minEndDate = getDatePlusDays(startDate, minDays)

  // Auto-adjust end date when start date changes or if end date is too soon
  // Also validate selected dates against blocked dates
  useEffect(() => {
    const tripDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    if (tripDays < minDays) {
      const newEndDate = getDatePlusDays(startDate, minDays)
      setEndDate(newEndDate)
      setDateError(null)
      return
    }

    // Check if selected range overlaps with blocked dates
    if (blockedDates.length > 0) {
      const { available, conflictDates } = validateDateRange(startDate, endDate)
      if (!available) {
        const formatted = conflictDates.slice(0, 3).map(d => {
          const [y, m, day] = d.split('-').map(Number)
          return format.dateTime(new Date(y, m - 1, day), { month: 'short', day: 'numeric' })
        }).join(', ')
        const extra = conflictDates.length > 3 ? ` +${conflictDates.length - 3} more` : ''
        setDateError(`${t('unavailableDatePrefix')} ${formatted}${extra}`)
        return
      }
    }

    setDateError(null)
  }, [startDate, endDate, minDays, blockedDates, validateDateRange])
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
  // Use shared deposit calculation that respects host/vehicle deposit settings
  const baseDeposit = getActualDeposit(car)
  // Get car class for UI display (exotic badge, etc.) AND the rate-based default deposit
  // We need the rate-based deposit to show "waived" amounts when host disables deposits
  const { carClass, deposit: rateBasedDeposit } = getCarClassAndDefaultDeposit(dailyRate)
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

  // Use shared pricing utility for consistent calculations across all booking stages
  const carCity = car?.city || car?.address || 'Phoenix'
  const pricing = calculateFromWidgetState({
    dailyRate,
    days,
    weeklyRate: car?.weeklyRate,
    monthlyRate: car?.monthlyRate,
    insurancePrice,
    deliveryFee,
    refuelService,
    additionalDriver,
    extraMiles,
    vipConcierge,
    city: carCity
  })

  // Extract values from shared calculation
  const { serviceFee, taxes, taxRate, taxRateDisplay, total } = pricing
  
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
        basePrice: pricing.basePrice,  // Use shared calculation (includes discounts)
        insurancePrice: pricing.insurancePrice,
        deliveryFee: pricing.deliveryFee,
        serviceFee: pricing.serviceFee,
        taxes: pricing.taxes,
        taxRate: pricing.taxRate,
        taxRateDisplay: pricing.taxRateDisplay,
        total: pricing.total,
        deposit: actualDeposit,
        // Stripe-ready line items for payment processing
        lineItems: pricing.lineItems,
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
    { value: 'pickup', label: t('pickup'), icon: IoCarSportOutline, fee: 0, desc: t('meetAtLocation') },
    { value: 'valet', label: t('valet'), icon: IoSparklesOutline, fee: 195, desc: t('whiteGloveService') },
    { value: 'airport', label: t('airport'), icon: IoAirplaneOutline, fee: 50, desc: t('phxSkyHarbor') },
    { value: 'hotel', label: t('hotel'), icon: IoHomeOutline, fee: 105, desc: t('yourAccommodation') }
  ]

  const getInsuranceTierName = (tier: string) => {
    switch (tier) {
      case 'MINIMUM': return t('insuranceTierMinimum')
      case 'BASIC': return t('insuranceTierBasic')
      case 'PREMIUM': return t('insuranceTierPremium')
      case 'LUXURY': return t('insuranceTierLuxury')
      default: return tier
    }
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
            {t('currentlyUnavailable')}
          </h3>
          {/* 🔒 PRIVACY: Always show generic message - NEVER expose operational details */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('vehicleCurrentlyUnavailable')}
          </p>
        </div>

        <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-2xl font-bold text-gray-500 dark:text-gray-400 line-through">
              ${dailyRate.toLocaleString()}
            </span>
            <span className="text-gray-400 dark:text-gray-500">{t('perDay')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href={`/rentals/search?location=${car?.city || 'Phoenix'}&carType=${car?.carType || ''}`}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <IoCarOutline className="w-5 h-5" />
            {t('browseSimilarCars')}
          </Link>

          {/* ✅ FUNCTIONAL: Email support with vehicle context */}
          <a
            href={`mailto:info@itwhip.com?subject=Vehicle Unavailable - ${car?.year} ${car?.make} ${car?.model}&body=Hello ItWhip Support,%0A%0AI'm interested in this vehicle but it shows as unavailable:%0A%0AVehicle: ${car?.year} ${car?.make} ${car?.model}%0ACar ID: ${car?.id}%0ALocation: ${car?.city}, ${car?.state}%0A%0ACould you please let me know when it becomes available or suggest similar options?%0A%0AThank you!`}
            className="w-full py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 font-medium flex items-center justify-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg transition-colors"
          >
            <IoInformationCircleOutline className="w-4 h-4" />
            {t('emailSupportForAssistance')}
          </a>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <IoInformationCircleOutline className="inline w-3 h-3 mr-1" />
            {t('listingMayBecomeAvailable')}
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
                <span className="text-gray-500 dark:text-gray-300">{t('perDay')}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {carClass === 'exotic' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs font-semibold rounded">
                    <IoTrophyOutline className="w-3 h-3" />
                    <span>{t('exotic')}</span>
                  </div>
                )}
                {carClass === 'luxury' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                    <IoSparklesOutline className="w-3 h-3" />
                    <span>{t('luxury')}</span>
                  </div>
                )}
                {isRideshare ? (
                  <div className="flex items-center gap-1 text-orange-600 text-sm">
                    <IoCarOutline className="w-3.5 h-3.5" />
                    <span className="font-medium">{t('rideshare')}</span>
                  </div>
                ) : car?.instantBook && (
                  <div className="flex items-center gap-1 text-amber-600 text-sm">
                    <IoFlashOutline className="w-3.5 h-3.5" />
                    <span className="font-medium">{t('instantBook')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-300">{minDays > 1 ? t('minDaysPlural', { days: minDays }) : t('minDays', { days: minDays })}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{t('milesPerDayIncluded')}</p>
            </div>
          </div>
        </div>
        
        {/* Trip Dates */}
        <div className="mb-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <IoCalendarOutline className="w-3.5 h-3.5 text-amber-600" />
            {t('tripDates')}
          </h3>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            minDate={today}
            minEndDate={minEndDate}
            blockedDates={blockedDates}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />

          {/* Trip Summary */}
          {days > 0 && (
            <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <IoCalendarOutline className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                {days > 1 ? t('daysSummaryPlural', { days }) : t('daysSummary', { days })} · {format.dateTime(new Date(startDate + 'T00:00:00'), { month: 'short', day: 'numeric' })} – {format.dateTime(new Date(endDate + 'T00:00:00'), { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}

          {/* Date Error */}
          {dateError && (
            <div className="flex items-center gap-1.5 py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <IoWarningOutline className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">{dateError}</span>
            </div>
          )}

          {/* Duration Presets - Show for rideshare or when weekly/monthly rates available */}
          {(isRideshare || car?.weeklyRate || car?.monthlyRate) && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('quickSelect')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newEnd = getArizonaDateString(8) // 1 week from tomorrow
                    setEndDate(newEnd)
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    days === 7
                      ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('oneWeek')}
                  {car?.weeklyRate && (
                    <span className="block text-green-600 dark:text-green-400 mt-0.5">
                      {t('save', { amount: Math.round((car.dailyRate * 7) - car.weeklyRate) })}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    const newEnd = getArizonaDateString(15) // 2 weeks from tomorrow
                    setEndDate(newEnd)
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    days === 14
                      ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('twoWeeks')}
                  {car?.weeklyRate && (
                    <span className="block text-green-600 dark:text-green-400 mt-0.5">
                      {t('save', { amount: Math.round((car.dailyRate * 14) - (car.weeklyRate * 2)) })}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    const newEnd = getArizonaDateString(31) // 1 month from tomorrow
                    setEndDate(newEnd)
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    days >= 28 && days <= 31
                      ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('oneMonth')}
                  {car?.monthlyRate && (
                    <span className="block text-green-600 dark:text-green-400 mt-0.5">
                      {t('save', { amount: Math.round((car.dailyRate * 30) - car.monthlyRate) })}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Rideshare Notice */}
          {isRideshare && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-2">
                <IoCarSportOutline className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">{t('rideshareReady')}</span>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                    {t('rideshareMinDays', { days: minDays })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Insurance Protection - Database Driven */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-4 h-4" />
            {t('insuranceProtection')}
            <span className="text-xs font-normal text-red-500">{t('required')}</span>
          </label>
          
          {loadingQuotes ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">{t('loadingInsuranceOptions')}</p>
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
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{getInsuranceTierName(tier)} {t('protection')}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setExpandedInsurance(expandedInsurance === tier ? null : tier)
                              }}
                              className="ml-2 text-xs text-amber-600 hover:text-amber-700"
                            >
                              {expandedInsurance === tier ? t('hide') : t('details')}
                            </button>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {quote.dailyPremium === 0 ? t('included') : t('perDayPrice', { price: quote.dailyPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                        </span>
                      </div>
                    </label>
                    {expandedInsurance === tier && (
                      <div className="px-6 pb-3 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50">
                        {tier === 'LUXURY' && (
                          <div className="mt-2 mb-2">
                            <span className="text-green-600 dark:text-green-400 font-semibold">{t('recommendedOption')}</span>
                          </div>
                        )}
                        {tier === 'MINIMUM' && quote.increasedDeposit && (
                          <div className="mt-2 mb-2">
                            <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                              <IoWarningOutline className="w-3 h-3" />
                              {t('requiresDeposit', { amount: quote.increasedDeposit.toLocaleString() })}
                            </span>
                          </div>
                        )}
                        <ul className="space-y-1 mt-2">
                          <li>• {t('liability')} ${quote.coverage.liability.toLocaleString()}</li>
                          <li>• {t('collision')} {typeof quote.coverage.collision === 'number' ? `$${quote.coverage.collision.toLocaleString()}` : quote.coverage.collision}</li>
                          <li>• {t('deductible')} {quote.coverage.deductible === 0 ? t('deductibleNone') : `$${quote.coverage.deductible.toLocaleString()}`}</li>
                          <li className="text-gray-500 dark:text-gray-400 mt-1">• {quote.coverage.description}</li>
                        </ul>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('provider')} {quote.provider.name}
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
              <IoLocationOutline className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{t('deliveryMethod')}</span>
              {deliveryType !== 'pickup' && (
                <span className="text-xs text-amber-600 ml-2">
                  • {deliveryOptions.find(o => o.value === deliveryType)?.label} (+${deliveryOptions.find(o => o.value === deliveryType)?.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              )}
            </div>
            {showDelivery ? (
              <IoChevronUpOutline className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            ) : (
              <IoChevronDownOutline className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            )}
          </button>
          
          {showDelivery && (
            <div className="p-3 border-x border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
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
                      <Icon className="w-4 h-4 mx-auto mb-1 text-gray-700 dark:text-gray-300" />
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
                      {option.fee > 0 && <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">+${option.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                    </button>
                  )
                })}
              </div>
              
              {(deliveryType === 'hotel' || deliveryType === 'valet') && (
                <input
                  type="text"
                  placeholder={deliveryType === 'hotel' ? t('enterHotelNameAddress') : t('enterDeliveryAddress')}
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
              <IoSparklesOutline className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{t('experienceEnhancements')}</span>
              {Object.values(addOns).filter(v => v).length > 0 && (
                <span className="text-xs text-amber-600 ml-2">
                  • {t('selected', { count: Object.values(addOns).filter(v => v).length })}
                </span>
              )}
            </div>
            {showEnhancements ? (
              <IoChevronUpOutline className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            ) : (
              <IoChevronDownOutline className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            )}
          </button>
          
          {showEnhancements && (
            <div className="p-3 border-x border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg space-y-2">
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={addOns.refuelService}
                    onChange={(e) => setAddOns({...addOns, refuelService: e.target.checked})}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <IoWaterOutline className="w-4 h-4" />
                      {t('refuelService')}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('refuelServiceDesc')}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">$75.00</span>
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <IoPersonAddOutline className="w-4 h-4" />
                      {t('additionalDriver')}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('additionalDriverDesc')}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">$50.00/day</span>
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <IoCarOutline className="w-4 h-4" />
                      {t('extraMilesPackage')}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('extraMilesPackageDesc')}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">$295.00</span>
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('vipConciergeService')}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('vipConciergeServiceDesc')}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">$150.00/day</span>
              </label>
            </div>
          )}
        </div>
        
        {/* Price Breakdown - Using shared pricing for consistency */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              ${formatPrice(dailyRate)} × {days > 1 ? t('daysSummaryPlural', { days }) : t('daysSummary', { days })}
            </span>
            <span className="text-gray-900 dark:text-white">${formatPrice(pricing.basePrice)}</span>
          </div>

          {pricing.insurancePrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{t('insurance')} ({getInsuranceTierName(insuranceTier)})</span>
              <span className="text-gray-900 dark:text-white">${formatPrice(pricing.insurancePrice)}</span>
            </div>
          )}

          {pricing.enhancementsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{t('enhancements')}</span>
              <span className="text-gray-900 dark:text-white">${formatPrice(pricing.enhancementsTotal)}</span>
            </div>
          )}

          {pricing.deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{t('delivery')}</span>
              <span className="text-gray-900 dark:text-white">${formatPrice(pricing.deliveryFee)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">{t('serviceFee')}</span>
            <span className="text-gray-900 dark:text-white">${formatPrice(pricing.serviceFee)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">{t('taxes', { rate: pricing.taxRateDisplay })}</span>
            <span className="text-gray-900 dark:text-white">${formatPrice(pricing.taxes)}</span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-gray-900 dark:text-white">{t('total')}</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(pricing.total)}
                </span>
                {/* Deposit display: show strikethrough when waived, normal when required */}
                {actualDeposit > 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    {t('securityDepositHold', { amount: formatPrice(actualDeposit) })}
                  </p>
                ) : rateBasedDeposit > 0 ? (
                  <p className="text-xs mt-1 flex items-center justify-end gap-1.5">
                    <span className="line-through text-gray-400 dark:text-gray-500">
                      ${formatPrice(rateBasedDeposit)}
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {t('depositWaived')}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        
        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={isLoading || !!dateError || loadingQuotes || !currentQuote}
          className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('processing')}
            </span>
          ) : loadingQuotes ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('loadingInsurance')}
            </span>
          ) : dateError ? (
            t('selectAtLeastDays', { days: minDays })
          ) : !currentQuote ? (
            t('insuranceRequired')
          ) : (
            t('continueToCheckout')
          )}
        </button>
        
        {/* Trust Badges */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              <span>{t('freeCancellation')}</span>
            </div>
            <div className="flex items-center gap-1">
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              <span>{t('fullyInsured')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Price Bar (Mobile) */}
      {showFloatingPrice && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50 lg:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${formatPrice(pricing.total)}
                  </span>
                  {/* Show deposit info in floating bar */}
                  {actualDeposit > 0 ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('hold', { amount: formatPrice(actualDeposit) })}
                    </span>
                  ) : rateBasedDeposit > 0 ? (
                    <span className="text-xs flex items-center gap-1">
                      <span className="line-through text-gray-400">${formatPrice(rateBasedDeposit)}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{t('waived')}</span>
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-300">{days > 1 ? t('daysSummaryPlural', { days }) : t('daysSummary', { days })} • {t('taxIncluded')}</p>
              </div>
              <button
                onClick={handleBooking}
                className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg shadow-lg"
              >
                {t('bookNow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}