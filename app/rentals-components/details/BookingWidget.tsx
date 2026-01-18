// app/(guest)/rentals/components/details/BookingWidget.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  IoWaterOutline
} from 'react-icons/io5'

interface BookingWidgetProps {
  car: any
}

// Helper function to determine car class and default deposit
// Used as fallback when host/vehicle don't have explicit deposit settings
function getCarClassAndDefaultDeposit(dailyRate: number): { carClass: string; deposit: number } {
  if (dailyRate < 150) {
    return { carClass: 'economy', deposit: 250 }
  } else if (dailyRate < 500) {
    return { carClass: 'luxury', deposit: 700 }
  } else {
    return { carClass: 'exotic', deposit: 1000 }
  }
}

// Determine actual deposit based on per-vehicle deposit mode
// HYBRID system - each VEHICLE can be assigned to either mode:
//
// GLOBAL MODE (vehicle.vehicleDepositMode === 'global', default):
//   1. If host.requireDeposit === false → no deposit (0)
//   2. Check for make-specific override (e.g., all Toyotas = $400)
//   3. Use host's global depositAmount
//   4. Fallback to rate-based default
//
// INDIVIDUAL MODE (vehicle.vehicleDepositMode === 'individual'):
//   1. If vehicle has noDeposit === true → no deposit (0)
//   2. Use vehicle's customDepositAmount
//   3. Fallback to rate-based default
//
function getActualDeposit(car: any): number {
  const host = car?.host

  // DEBUG: Log deposit calculation inputs
  console.log('🔍 [Deposit Debug]', {
    vehicleDepositMode: car?.vehicleDepositMode,
    hostDepositAmount: host?.depositAmount,
    hostRequireDeposit: host?.requireDeposit,
    hostMakeDeposits: host?.makeDeposits,
    carMake: car?.make,
    dailyRate: car?.dailyRate,
    hostExists: !!host
  })

  // Check per-vehicle deposit mode - "individual" uses vehicle-specific settings
  // Default to 'global' if not set
  const vehicleDepositMode = car?.vehicleDepositMode || 'global'

  if (vehicleDepositMode === 'individual') {
    // Individual mode: vehicle-specific settings take precedence
    if (car?.noDeposit === true) {
      return 0
    }
    if (car?.customDepositAmount !== null && car?.customDepositAmount !== undefined) {
      return Number(car.customDepositAmount)
    }
    // Fallback to rate-based default
    const { deposit } = getCarClassAndDefaultDeposit(car?.dailyRate || 0)
    return deposit
  }

  // Global mode (default): host-level settings apply to all vehicles
  if (host?.requireDeposit === false) {
    return 0
  }

  // Check for make-specific override in global mode
  const makeDeposits = host?.makeDeposits as Record<string, number> | null
  if (makeDeposits && car?.make && makeDeposits[car.make] !== undefined) {
    return makeDeposits[car.make]
  }

  // Use host's global deposit amount if set
  if (host?.depositAmount !== null && host?.depositAmount !== undefined) {
    return Number(host.depositAmount)
  }

  // Fallback to rate-based default
  const { deposit } = getCarClassAndDefaultDeposit(car?.dailyRate || 0)
  return deposit
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

export default function BookingWidget({ car }: BookingWidgetProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showFloatingPrice, setShowFloatingPrice] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Rideshare detection - vehicleType is set when adding vehicles in partner dashboard
  // Fallback checks for legacy records: host type or partnerSlug
  const isRideshare = car?.vehicleType?.toUpperCase() === 'RIDESHARE'
    || car?.host?.hostType === 'FLEET_PARTNER'
    || car?.host?.hostType === 'PARTNER'
    || !!car?.host?.partnerSlug
  // RIDESHARE = ALWAYS 3+ DAYS, NO EXCEPTIONS (ignores DB value if it's wrong)
  // For rentals only, use minTripDuration from DB or default to 1
  const minDays = isRideshare ? 3 : (car?.minTripDuration || 1)

  // Use Arizona dates (local time, not UTC)
  const today = getArizonaDateString(0)
  const tomorrow = getArizonaDateString(1)
  const defaultEndDate = getArizonaDateString(minDays + 1) // +1 because start is tomorrow

  const [startDate, setStartDate] = useState(tomorrow)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('10:00')

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
  useEffect(() => {
    const tripDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    if (tripDays < minDays) {
      // Automatically adjust end date to meet minimum
      const newEndDate = getDatePlusDays(startDate, minDays)
      setEndDate(newEndDate)
    }
  }, [startDate, endDate, minDays])
  
  // Collapsible sections - START COLLAPSED
  const [showDelivery, setShowDelivery] = useState(false)
  const [showEnhancements, setShowEnhancements] = useState(false)
  const [expandedInsurance, setExpandedInsurance] = useState<string | null>(null)
  
  // Delivery
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'airport' | 'hotel' | 'valet'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  
  // Insurance options (separate from add-ons)
  const [insuranceType, setInsuranceType] = useState<'premium' | 'standard' | 'basic'>('premium')
  
  // Updated Add-ons (removed track insurance and photoshoot, added refuel and additional driver)
  const [addOns, setAddOns] = useState({
    refuelService: false,
    additionalDriver: false,
    extraMiles: false,
    vipConcierge: false
  })
  
  // Pricing based on car
  const dailyRate = car?.dailyRate || 1495
  const { carClass } = getCarClassAndDefaultDeposit(dailyRate)
  // Use actual deposit from host/vehicle settings (with clear precedence)
  const deposit = getActualDeposit(car)
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1
  
  const basePrice = dailyRate * days
  const insurancePrice = insuranceType === 'premium' ? 195 * days : insuranceType === 'standard' ? 125 * days : 75 * days
  const refuelService = addOns.refuelService ? 75 : 0
  const additionalDriver = addOns.additionalDriver ? 50 * days : 0
  const extraMiles = addOns.extraMiles ? 295 : 0
  const vipConcierge = addOns.vipConcierge ? 150 * days : 0
  const deliveryFee = deliveryType === 'valet' ? 195 : deliveryType === 'airport' ? 50 : deliveryType === 'hotel' ? 105 : 0
  
  const serviceFee = Math.round(basePrice * 0.15)
  const taxes = Math.round((basePrice + serviceFee) * 0.086)
  const total = basePrice + insurancePrice + refuelService + additionalDriver + extraMiles + vipConcierge + deliveryFee + serviceFee + taxes
  
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
    setIsLoading(true)
    
    // Store dates with timezone context
    const bookingDetails = {
      carId: car?.id,
      carClass,
      startDate,  // Keep as YYYY-MM-DD
      endDate,    // Keep as YYYY-MM-DD
      startTime,
      endTime,
      timezone: 'America/Phoenix',  // Add timezone indicator
      deliveryType,
      deliveryAddress,
      insuranceType,
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
        deposit,
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
                {isRideshare ? (
                  <div className="flex items-center gap-1 text-orange-600 text-sm">
                    <IoCarOutline className="w-3.5 h-3.5" />
                    <span className="font-medium">Rideshare</span>
                  </div>
                ) : car?.instantBook && (
                  <div className="flex items-center gap-1 text-amber-600 text-sm">
                    <IoFlashOutline className="w-3.5 h-3.5" />
                    <span className="font-medium">Instant Book</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Min {minDays} day{minDays > 1 ? 's' : ''}
              </p>
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
                min={minEndDate}
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
        
        {/* Insurance Protection - Updated without badges in main view */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-4 h-4" />
            Insurance Protection
            <span className="text-xs font-normal text-red-500">*Required</span>
          </label>
          
          <div className="space-y-2">
            {/* Premium Protection */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <label className={`block p-3 cursor-pointer transition-all ${insuranceType === 'premium' ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="insurance"
                      value="premium"
                      checked={insuranceType === 'premium'}
                      onChange={(e) => setInsuranceType(e.target.value as any)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Premium Protection</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setExpandedInsurance(expandedInsurance === 'premium' ? null : 'premium')
                        }}
                        className="ml-2 text-xs text-amber-600 hover:text-amber-700"
                      >
                        {expandedInsurance === 'premium' ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">${195}/day</span>
                </div>
              </label>
              {expandedInsurance === 'premium' && (
                <div className="px-6 pb-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                  <div className="mt-2 mb-2">
                    <span className="text-green-600 font-semibold">✓ RECOMMENDED OPTION</span>
                  </div>
                  <ul className="space-y-1">
                    <li>• $1,000 deductible (lowest available)</li>
                    <li>• Covers all damage including undercarriage</li>
                    <li>• 24/7 roadside assistance & towing</li>
                    <li>• Loss of use coverage included</li>
                    <li>• Personal effects up to $5,000</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Standard Protection */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <label className={`block p-3 cursor-pointer transition-all ${insuranceType === 'standard' ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="insurance"
                      value="standard"
                      checked={insuranceType === 'standard'}
                      onChange={(e) => setInsuranceType(e.target.value as any)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Standard Protection</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setExpandedInsurance(expandedInsurance === 'standard' ? null : 'standard')
                        }}
                        className="ml-2 text-xs text-amber-600 hover:text-amber-700"
                      >
                        {expandedInsurance === 'standard' ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">${125}/day</span>
                </div>
              </label>
              {expandedInsurance === 'standard' && (
                <div className="px-6 pb-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                  <ul className="space-y-1 mt-2">
                    <li>• $2,500 deductible</li>
                    <li>• Covers major damage and theft</li>
                    <li>• Business hours roadside assistance</li>
                    <li>• Basic liability coverage</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Basic Protection */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <label className={`block p-3 cursor-pointer transition-all ${insuranceType === 'basic' ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="insurance"
                      value="basic"
                      checked={insuranceType === 'basic'}
                      onChange={(e) => setInsuranceType(e.target.value as any)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Basic Protection</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setExpandedInsurance(expandedInsurance === 'basic' ? null : 'basic')
                        }}
                        className="ml-2 text-xs text-amber-600 hover:text-amber-700"
                      >
                        {expandedInsurance === 'basic' ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">${75}/day</span>
                </div>
              </label>
              {expandedInsurance === 'basic' && (
                <div className="px-6 pb-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                  <div className="mt-2 mb-2">
                    <span className="text-orange-600 font-semibold flex items-center gap-1">
                      <IoWarningOutline className="w-3 h-3" />
                      HIGH RISK - Limited Coverage
                    </span>
                  </div>
                  <ul className="space-y-1">
                    <li>• $5,000 deductible</li>
                    <li>• State minimum liability only</li>
                    <li>• No roadside assistance</li>
                    <li>• You're responsible for most damages</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
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
        
        {/* Updated Enhancements - COLLAPSIBLE */}
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
              {/* Refuel Service - NEW */}
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
              
              {/* Additional Driver - NEW */}
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
              
              {/* Extra Miles */}
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
              
              {/* VIP Concierge */}
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
              <span className="text-gray-600 dark:text-gray-400">Insurance protection</span>
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
                {deposit > 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Plus ${deposit.toLocaleString()} security deposit (hold)
                  </p>
                ) : (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    No security deposit required
                  </p>
                )}
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