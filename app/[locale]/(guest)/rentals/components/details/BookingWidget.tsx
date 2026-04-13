// app/(guest)/rentals/components/details/BookingWidget.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trackFunnelStep } from '@/app/lib/analytics/funnel-events'
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
import DateRangePicker, { isArizonaToday } from './DateRangePicker'
import { calculateEarliestPickup, getArizonaTodayString, addDays } from '@/app/lib/booking/booking-time-rules'

interface BookingWidgetProps {
  car: any
  isBookable?: boolean
  suspensionMessage?: string | null
  milesPerDay?: number | null
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


// Helper to extract date and time from ISO datetime string
function extractDateAndTime(isoString: string): { date: string; time: string } {
  if (!isoString) {
    return { date: '', time: '' }
  }
  
  // Handle both "YYYY-MM-DDTHH:MM" and "YYYY-MM-DD" formats
  const parts = isoString.split('T')
  const date = parts[0] || ''
  const time = parts[1] ? parts[1].substring(0, 5) : '10:00'
  
  return { date, time }
}

export default function BookingWidget({ car, isBookable = true, suspensionMessage, milesPerDay }: BookingWidgetProps) {
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
  const maxDays = car?.maxTripDuration || 30

  // Per-car availability settings
  const advanceHours = car?.advanceNotice ?? 2
  const is24Hour = car?.allow24HourPickup ?? false
  const defaultCheckIn = car?.checkInTime || '10:00'
  const defaultCheckOut = car?.checkOutTime || '10:00'

  // Read search params from URL
  const pickupDateParam = searchParams.get('pickupDate') || ''
  const returnDateParam = searchParams.get('returnDate') || ''
  
  // Extract dates and times from URL params
  const { date: pickupDateFromUrl, time: pickupTimeFromUrl } = extractDateAndTime(pickupDateParam)
  const { date: returnDateFromUrl, time: returnTimeFromUrl } = extractDateAndTime(returnDateParam)
  
  // Use defaults if no URL params (respect minimum trip duration)
  const today = getArizonaTodayString()
  const tomorrow = addDays(today, 1)

  // Read last search dates from sessionStorage — saved by RentalSearchWidget on search
  let sessionPickupDate = '', sessionReturnDate = ''
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('itwhip_search_dates')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Only use if saved within last 2 hours (fresh search session)
        if (parsed.savedAt && Date.now() - parsed.savedAt < 2 * 60 * 60 * 1000) {
          const { date: sd } = extractDateAndTime(parsed.pickupDate || '')
          const { date: ed } = extractDateAndTime(parsed.returnDate || '')
          sessionPickupDate = sd
          sessionReturnDate = ed
        }
      }
    } catch {}
  }

  // ── Compute correct initial start date/time ──
  // Default is always tomorrow 10AM. User must explicitly pick today in the date picker
  // to trigger the same-day guard (advance notice, evening cutoff, night blackout).
  const _rawInitDate = pickupDateFromUrl || sessionPickupDate || tomorrow
  const _initDate = isArizonaToday(_rawInitDate) ? tomorrow : _rawInitDate
  let _startDate = _initDate
  let _startTime = defaultCheckIn

  // Return date: URL param → session return date → startDate + minDays (24hrs for default 1-day rental)
  const _defaultReturnDate = returnDateFromUrl || sessionReturnDate || addDays(_startDate, minDays)

  const [startDate, setStartDate] = useState(_startDate)
  const [endDate, setEndDate] = useState(_defaultReturnDate)

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

    if (tripDays > maxDays) {
      setDateError(t('maxTripExceeded', { days: maxDays }))
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

    // Don't clear if today is still blocked by advance notice — that error takes priority
    if (isArizonaToday(startDate)) {
      const { date: eDate } = calculateEarliestPickup(advanceHours, { allow24HourPickup: is24Hour })
      if (eDate !== startDate) return
    }

    setDateError(null)
  }, [startDate, endDate, minDays, maxDays, blockedDates, validateDateRange])
  const [startTime, setStartTime] = useState(_startTime)
  const [endTime, setEndTime] = useState(_startTime)
  const returnTimeManuallySet = useRef(false)

  // Handlers that sync return time with pickup time
  // For today: enforce earliest allowed time — prevents user from bypassing the same-day guard
  const handleStartTimeChange = (time: string) => {
    let enforced = time
    if (isArizonaToday(startDate)) {
      const { date: eDate, time: eTime } = calculateEarliestPickup(advanceHours, { allow24HourPickup: is24Hour })
      if (eDate === startDate) {
        const [h, m] = time.split(':').map(Number)
        const [eh, em] = eTime.split(':').map(Number)
        if (h * 60 + m < eh * 60 + em) enforced = eTime
      }
      // eDate !== startDate means today is blocked by advance notice — time change is irrelevant
    }
    setStartTime(enforced)
    if (!returnTimeManuallySet.current) setEndTime(enforced)
  }
  const handleEndTimeChange = (time: string) => {
    setEndTime(time)
    returnTimeManuallySet.current = true
  }

  // Same-day guard: fires when startDate is today OR when car.advanceNotice loads/changes.
  // If advance notice makes today unavailable, show error so user knows the earliest available date.
  // If today is valid but time needs bumping, auto-correct time silently.
  useEffect(() => {
    if (!isArizonaToday(startDate)) return

    const { date: eDate, time: eTime } = calculateEarliestPickup(advanceHours, { allow24HourPickup: is24Hour })
    if (eDate !== startDate) {
      // Advance notice pushes past today — show error so user knows to pick a later date
      const dateLabel = format.dateTime(new Date(eDate + 'T00:00:00'), { weekday: 'short', month: 'short', day: 'numeric' })
      const [th, tm] = eTime.split(':').map(Number)
      const th12 = th === 0 ? 12 : th > 12 ? th - 12 : th
      const ampm = th < 12 ? 'AM' : 'PM'
      const timeLabel = `${th12}:${String(tm).padStart(2, '0')} ${ampm}`
      setDateError(t('advanceNoticeBlocked', { hours: advanceHours, date: dateLabel, time: timeLabel }))
    } else {
      // Always apply earliest time when user picks today — no stale-closure comparison needed
      setStartTime(eTime)
      if (!returnTimeManuallySet.current) setEndTime(eTime)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, car?.advanceNotice])

  // Update state when URL params change
  // NEVER override with today's date from URL — default is always tomorrow.
  // User must manually select today from the date picker to trigger same-day guards.
  useEffect(() => {
    if (pickupDateFromUrl && !isArizonaToday(pickupDateFromUrl)) {
      setStartDate(pickupDateFromUrl)
      setStartTime(pickupTimeFromUrl || defaultCheckIn)
    }
    if (returnDateFromUrl) {
      setEndDate(returnDateFromUrl)
      if (!isArizonaToday(returnDateFromUrl)) setEndTime(defaultCheckOut)
    }
  }, [pickupDateFromUrl, returnDateFromUrl, pickupTimeFromUrl, returnTimeFromUrl])
  
  // Collapsible sections
  const [showDelivery, setShowDelivery] = useState(false)
  const [showEnhancements, setShowEnhancements] = useState(false)
  const [showInsuranceOptions, setShowInsuranceOptions] = useState(false)
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
  
  // Fetch insurance quotes when dates or car change
  useEffect(() => {
    if (days > 0 && vehicleValue > 0 && startDate && endDate && car?.id) {
      fetchInsuranceQuotes()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, vehicleValue, car?.id, startDate, endDate])
  
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
  
  // Funnel: track dates selected (fires once when valid dates produce pricing)
  const datesTrackedRef = useRef(false)
  useEffect(() => {
    if (days > 0 && !dateError && !datesTrackedRef.current && car?.id) {
      datesTrackedRef.current = true
      trackFunnelStep('funnel_dates_selected', { carId: car.id, step: 3 })
    }
  }, [days, dateError, car?.id])

  // Funnel: track insurance tier change (fires once on first change from default)
  const insuranceTrackedRef = useRef(false)
  useEffect(() => {
    if (!insuranceTrackedRef.current && car?.id) {
      insuranceTrackedRef.current = true // skip initial mount
      return
    }
    if (car?.id) {
      trackFunnelStep('funnel_insurance_selected', { carId: car.id, insuranceTier, step: 4 })
    }
  }, [insuranceTier]) // eslint-disable-line react-hooks/exhaustive-deps

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

    // Funnel: book clicked — critical transition from browsing to checkout
    trackFunnelStep('funnel_book_clicked', {
      carId: car?.id, carName: car ? `${car.year} ${car.make} ${car.model}` : undefined,
      totalAmount: pricing.total, insuranceTier,
    })

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
      case 'MINIMUM': return t('insuranceTierNoInsurance')
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
      <div ref={widgetRef} className="bg-white dark:bg-gray-800 lg:rounded-lg lg:shadow-xl px-4 py-6 lg:p-6 lg:sticky lg:top-20 border-t border-gray-200 dark:border-gray-700 lg:border-t-0">
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
      <div ref={widgetRef} className="bg-gray-50 dark:bg-gray-900 lg:bg-white lg:dark:bg-gray-800 lg:rounded-lg lg:shadow-xl px-4 pt-3 pb-0 lg:p-6 lg:sticky lg:top-20 space-y-3">
        {/* Price Header */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${dailyRate.toLocaleString()}
              </span>
              <span className="text-gray-500 dark:text-gray-300">{t('perDay')}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-300">{minDays > 1 ? t('minDaysPlural', { days: minDays }) : t('minDays', { days: minDays })}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{milesPerDay == null ? t('unlimitedMileage') : t('milesPerDayIncluded', { miles: milesPerDay })}</p>
            </div>
          </div>
          {(carClass === 'exotic' || carClass === 'luxury') && (
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
            </div>
          )}
        </div>
        
        {/* Trip Dates */}
        <div className="pb-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
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
            advanceNotice={advanceHours}
            allow24HourPickup={is24Hour}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
          />

          {/* Trip Summary + Date Error — single consolidated card */}
          {days > 0 && (
            <div className={`py-2 px-3 rounded-lg ${dateError ? 'bg-red-600' : 'bg-black dark:bg-white'}`}>
              <div className="flex items-center justify-center gap-1.5">
                {dateError
                  ? <IoWarningOutline className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                  : <IoCalendarOutline className="w-3.5 h-3.5 flex-shrink-0 text-white dark:text-gray-900" />
                }
                <span className={`text-xs font-medium ${dateError ? 'text-white' : 'text-white dark:text-gray-900'}`}>
                  {days > 1 ? t('daysSummaryPlural', { days }) : t('daysSummary', { days })} · {format.dateTime(new Date(startDate + 'T00:00:00'), { month: 'short', day: 'numeric' })} – {format.dateTime(new Date(endDate + 'T00:00:00'), { month: 'short', day: 'numeric' })}
                </span>
              </div>
              {dateError && (
                <p className="text-xs text-white text-center mt-1 leading-snug">{dateError}</p>
              )}
              {isRideshare && !dateError && (
                <div className="flex items-center justify-center mt-1">
                  <span className="text-xs text-gray-300 dark:text-gray-500">
                    {t('rideshareMinDays', { days: minDays })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Duration Presets - Hidden for now, will bring back later */}
          {false && (isRideshare || car?.weeklyRate || car?.monthlyRate) && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('quickSelect')}</p>
              <div className="flex gap-2">
                {isRideshare && (
                  <button
                    onClick={() => {
                      const newEnd = getDatePlusDays(startDate, 3)
                      setEndDate(newEnd)
                    }}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      days === 3
                        ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t('threeDays')}
                  </button>
                )}
                <button
                  onClick={() => {
                    const newEnd = getDatePlusDays(startDate, 7)
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
                    const newEnd = getDatePlusDays(startDate, 14)
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
                    const newEnd = getDatePlusDays(startDate, 30)
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


        </div>

        {/* Insurance Protection - Database Driven */}
        <div>
          {loadingQuotes ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">{t('loadingInsuranceOptions')}</p>
            </div>
          ) : !showInsuranceOptions ? (
            /* Collapsed: show selected tier as a clickable button */
            <button
              onClick={() => setShowInsuranceOptions(true)}
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{t('insuranceProtection')}</span>
                <span className="text-xs text-amber-600 ml-1">
                  • {getInsuranceTierName(insuranceTier)}
                  {insuranceQuotes[insuranceTier]?.dailyPremium ? ` ($${insuranceQuotes[insuranceTier]!.dailyPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day)` : ''}
                </span>
              </div>
              <IoChevronDownOutline className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            </button>
          ) : (
            /* Expanded: show all options */
            <>
              <button
                onClick={() => setShowInsuranceOptions(false)}
                className="w-full flex items-center justify-between mb-3"
              >
                <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  {t('insuranceProtection')}
                  <span className="text-xs font-normal text-red-500">{t('required')}</span>
                </label>
                <IoChevronUpOutline className="w-5 h-5 text-gray-400 dark:text-gray-300" />
              </button>
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
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{getInsuranceTierName(tier)}</span>
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
            </>
          )}
        </div>
        
        {/* Delivery Method - COLLAPSIBLE */}
        <div>
          <button
            onClick={() => setShowDelivery(!showDelivery)}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
        <div>
          <button
            onClick={() => setShowEnhancements(!showEnhancements)}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
        
        {/* Price Breakdown — Trip Cost Preview */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
          {/* Rate math */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {t('rateMath', { days, dailyRate: formatPrice(dailyRate) })}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.basePrice)}</span>
          </div>

          {/* Line items */}
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

          {/* Trip Total */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
            <div className="flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900 dark:text-white">{t('tripTotalLabel')}</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">${formatPrice(pricing.total)}</span>
            </div>
          </div>

          {/* Refundable Deposit — visually separate */}
          {actualDeposit > 0 ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('refundableDeposit')}</span>
                <span className="text-sm font-bold text-blue-800 dark:text-blue-300">${formatPrice(actualDeposit)}</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('depositHoldExplanation')}</p>
            </div>
          ) : rateBasedDeposit > 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2">
                <span className="line-through text-sm text-gray-400 dark:text-gray-500">${formatPrice(rateBasedDeposit)}</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{t('depositWaived')}</span>
              </div>
            </div>
          ) : null}
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
        <div className="mt-2">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-700 dark:text-gray-300">
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
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${formatPrice(pricing.total)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('tripLabel')}</span>
                </div>
                {actualDeposit > 0 ? (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    + ${formatPrice(actualDeposit)} {t('refundableHold')}
                  </p>
                ) : rateBasedDeposit > 0 ? (
                  <p className="text-xs flex items-center gap-1">
                    <span className="line-through text-gray-400">${formatPrice(rateBasedDeposit)}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">{t('waived')}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-300">{days > 1 ? t('daysSummaryPlural', { days }) : t('daysSummary', { days })} • {t('taxIncluded')}</p>
                )}
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