// app/(guest)/rentals/dashboard/bookings/[id]/components/ModifyBookingSheet.tsx
// Full booking modification bottom sheet: dates, insurance, add-ons
// Uses saved card on file (stripePaymentMethodId) to re-authorize new total

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import BottomSheet from '@/app/components/BottomSheet'
import { Booking } from '../types'
import {
  IoShieldCheckmarkOutline,
  IoWaterOutline,
  IoPersonAddOutline,
  IoCarOutline,
  IoDiamondOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoCarSportOutline,
  IoSparklesOutline,
  IoAirplaneOutline,
  IoHomeOutline,
  IoLocationOutline
} from 'react-icons/io5'
import { calculateBookingPricing, formatPrice } from '@/app/(guest)/rentals/lib/booking-pricing'

// ============================================================================
// TYPES
// ============================================================================

interface InsuranceQuote {
  tier: string
  dailyPremium: number
  totalPremium: number
  coverage: {
    liability: number
    collision: number | string
    deductible: number
    description: string
  }
}

interface AddOnsState {
  refuelService: boolean
  additionalDriver: boolean
  extraMiles: boolean
  vipConcierge: boolean
}

interface ModifyBookingSheetProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// ============================================================================
// ADD-ON PRICING CONSTANTS
// ============================================================================

const ADDON_PRICES = {
  refuelService: { flat: 75, label: 'Refuel Service', desc: 'Skip the gas station — we\'ll refuel for you', icon: IoWaterOutline },
  additionalDriver: { perDay: 50, label: 'Additional Driver', desc: 'Add another authorized driver', icon: IoPersonAddOutline },
  extraMiles: { flat: 295, label: 'Extra Miles (+500mi)', desc: 'Add 500 extra miles to your trip', icon: IoCarOutline },
  vipConcierge: { perDay: 150, label: 'VIP Concierge', desc: '24/7 personal assistant for your trip', icon: IoDiamondOutline },
}

const INSURANCE_TIERS = ['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY'] as const

const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'Pickup', icon: IoCarSportOutline, fee: 0, desc: 'Meet at host location' },
  { value: 'valet', label: 'Valet', icon: IoSparklesOutline, fee: 195, desc: 'White glove service' },
  { value: 'airport', label: 'Airport', icon: IoAirplaneOutline, fee: 50, desc: 'PHX Sky Harbor' },
  { value: 'hotel', label: 'Hotel', icon: IoHomeOutline, fee: 105, desc: 'Your accommodation' },
] as const

// ============================================================================
// COMPONENT
// ============================================================================

export const ModifyBookingSheet: React.FC<ModifyBookingSheetProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  // Dates
  const [newStartDate, setNewStartDate] = useState<Date | null>(new Date(booking.startDate))
  const [newEndDate, setNewEndDate] = useState<Date | null>(new Date(booking.endDate))

  // Insurance
  const [insuranceTier, setInsuranceTier] = useState<string>(booking.insuranceSelection || booking.insuranceType || 'BASIC')
  const [insuranceQuotes, setInsuranceQuotes] = useState<Record<string, InsuranceQuote>>({})
  const [loadingQuotes, setLoadingQuotes] = useState(false)

  // Add-ons
  const [addOns, setAddOns] = useState<AddOnsState>({
    refuelService: booking.refuelService || false,
    additionalDriver: booking.additionalDriver || false,
    extraMiles: booking.extraMilesPackage || false,
    vipConcierge: booking.vipConcierge || false,
  })

  // Delivery
  const [deliveryType, setDeliveryType] = useState<string>(booking.pickupType || 'pickup')
  const [deliveryAddress, setDeliveryAddress] = useState<string>(booking.deliveryAddress || '')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setNewStartDate(new Date(booking.startDate))
      setNewEndDate(new Date(booking.endDate))
      setInsuranceTier(booking.insuranceSelection || booking.insuranceType || 'BASIC')
      setAddOns({
        refuelService: booking.refuelService || false,
        additionalDriver: booking.additionalDriver || false,
        extraMiles: booking.extraMilesPackage || false,
        vipConcierge: booking.vipConcierge || false,
      })
      setDeliveryType(booking.pickupType || 'pickup')
      setDeliveryAddress(booking.deliveryAddress || '')
      setError(null)
      setIsAvailable(null)
    }
  }, [isOpen, booking])

  // Calculate days
  const days = useMemo(() => {
    if (!newStartDate || !newEndDate) return 0
    return Math.max(1, Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24)))
  }, [newStartDate, newEndDate])

  // Format date for API
  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  // Check if dates changed
  const datesChanged = useMemo(() => {
    if (!newStartDate || !newEndDate) return false
    return formatDate(newStartDate) !== formatDate(new Date(booking.startDate)) ||
           formatDate(newEndDate) !== formatDate(new Date(booking.endDate))
  }, [newStartDate, newEndDate, booking.startDate, booking.endDate])

  // Fetch insurance quotes when dates change
  const fetchInsuranceQuotes = useCallback(async () => {
    if (!newStartDate || !newEndDate || days < 1) return

    setLoadingQuotes(true)
    const quotes: Record<string, InsuranceQuote> = {}

    try {
      for (const tier of INSURANCE_TIERS) {
        const res = await fetch('/api/bookings/insurance/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carId: booking.car.id,
            vehicleValue: 30000, // Default estimate
            startDate: formatDate(newStartDate),
            endDate: formatDate(newEndDate),
            tier
          })
        })
        if (res.ok) {
          const data = await res.json()
          quotes[tier] = data.quote || data
        }
      }
      setInsuranceQuotes(quotes)
    } catch {
      // Silently fail — user can still modify dates and add-ons
    } finally {
      setLoadingQuotes(false)
    }
  }, [newStartDate, newEndDate, days, booking.car.id])

  // Debounced insurance fetch when dates change
  useEffect(() => {
    if (!isOpen || !datesChanged) return
    const timer = setTimeout(fetchInsuranceQuotes, 800)
    return () => clearTimeout(timer)
  }, [fetchInsuranceQuotes, isOpen, datesChanged])

  // Initial insurance quote fetch
  useEffect(() => {
    if (isOpen && Object.keys(insuranceQuotes).length === 0) {
      fetchInsuranceQuotes()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Check availability when dates change
  useEffect(() => {
    if (!isOpen || !datesChanged || !newStartDate || !newEndDate) {
      setIsAvailable(null)
      return
    }
    setCheckingAvailability(true)
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          startDate: formatDate(newStartDate),
          endDate: formatDate(newEndDate)
        })
        const res = await fetch(`/api/rentals/bookings/${booking.id}/modify?${params}`)
        const data = await res.json()
        setIsAvailable(data.available ?? null)
      } catch {
        setIsAvailable(null)
      } finally {
        setCheckingAvailability(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [isOpen, datesChanged, newStartDate, newEndDate, booking.id])

  // Calculate add-on dollar amounts
  const addOnAmounts = useMemo(() => ({
    refuelService: addOns.refuelService ? ADDON_PRICES.refuelService.flat : 0,
    additionalDriver: addOns.additionalDriver ? ADDON_PRICES.additionalDriver.perDay * days : 0,
    extraMiles: addOns.extraMiles ? ADDON_PRICES.extraMiles.flat : 0,
    vipConcierge: addOns.vipConcierge ? ADDON_PRICES.vipConcierge.perDay * days : 0,
  }), [addOns, days])

  // Calculate delivery fee based on selected type
  const selectedDeliveryFee = useMemo(() => {
    const option = DELIVERY_OPTIONS.find(o => o.value === deliveryType)
    return option?.fee ?? 0
  }, [deliveryType])

  // Get insurance price for selected tier
  const selectedInsurancePrice = useMemo(() => {
    const quote = insuranceQuotes[insuranceTier]
    if (quote) return quote.totalPremium
    // Fallback: use current booking's insurance fee if tier unchanged
    if (insuranceTier === (booking.insuranceSelection || booking.insuranceType || 'BASIC')) {
      return booking.insuranceFee
    }
    return booking.insuranceFee
  }, [insuranceTier, insuranceQuotes, booking])

  // Calculate new pricing
  const newPricing = useMemo(() => {
    if (days < 1) return null
    return calculateBookingPricing({
      dailyRate: booking.dailyRate,
      days,
      insurancePrice: selectedInsurancePrice,
      deliveryFee: selectedDeliveryFee,
      enhancements: addOnAmounts,
      city: booking.car.city || 'phoenix'
    })
  }, [days, booking.dailyRate, selectedInsurancePrice, selectedDeliveryFee, addOnAmounts, booking.car.city])

  // Price difference
  const priceDiff = newPricing ? Math.round((newPricing.total - booking.totalAmount) * 100) / 100 : 0

  // Check if anything changed
  const hasChanges = useMemo(() => {
    if (datesChanged) return true
    if (insuranceTier !== (booking.insuranceSelection || booking.insuranceType || 'BASIC')) return true
    if (deliveryType !== (booking.pickupType || 'pickup')) return true
    if (addOns.refuelService !== (booking.refuelService || false)) return true
    if (addOns.additionalDriver !== (booking.additionalDriver || false)) return true
    if (addOns.extraMiles !== (booking.extraMilesPackage || false)) return true
    if (addOns.vipConcierge !== (booking.vipConcierge || false)) return true
    return false
  }, [datesChanged, insuranceTier, deliveryType, addOns, booking])

  // Submit modification
  const handleSubmit = async () => {
    if (!newStartDate || !newEndDate || !hasChanges || !newPricing) return
    if (datesChanged && isAvailable === false) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: formatDate(newStartDate),
          endDate: formatDate(newEndDate),
          insuranceTier,
          deliveryType,
          deliveryAddress: (deliveryType === 'hotel' || deliveryType === 'valet') ? deliveryAddress : undefined,
          addOns: {
            refuelService: addOns.refuelService,
            additionalDriver: addOns.additionalDriver,
            extraMiles: addOns.extraMiles,
            vipConcierge: addOns.vipConcierge
          }
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to modify booking')
        return
      }

      onSuccess()
    } catch {
      setError('Failed to modify booking')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Availability check blocked
  const dateBlocked = datesChanged && isAvailable === false

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Modify Booking"
      subtitle="Change dates, delivery, insurance, or add-ons"
      size="large"
      footer={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Keep Current
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasChanges || submitting || dateBlocked || checkingAvailability}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating...' : 'Confirm Changes'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ================================================================
            SECTION 1: DATES
            ================================================================ */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Rental Dates</h3>

          {/* Current dates */}
          <div className="p-2.5 bg-gray-50 rounded-lg mb-3">
            <p className="text-[10px] font-medium text-gray-500 mb-0.5">Current</p>
            <p className="text-xs text-gray-900">
              {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' → '}
              {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="text-gray-500 ml-1">
                ({booking.numberOfDays || Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
              </span>
            </p>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-gray-600 mb-1 block">Pickup</label>
              <DatePicker
                selected={newStartDate}
                onChange={(date: Date | null) => {
                  setNewStartDate(date)
                  if (date && newEndDate && date >= newEndDate) {
                    const next = new Date(date)
                    next.setDate(next.getDate() + 1)
                    setNewEndDate(next)
                  }
                }}
                minDate={today}
                dateFormat="MMM d, yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-600 mb-1 block">Return</label>
              <DatePicker
                selected={newEndDate}
                onChange={(date: Date | null) => setNewEndDate(date)}
                minDate={newStartDate ? new Date(newStartDate.getTime() + 86400000) : today}
                dateFormat="MMM d, yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Availability status */}
          {datesChanged && (
            <div className="mt-2">
              {checkingAvailability ? (
                <p className="text-[10px] text-blue-600">Checking availability...</p>
              ) : isAvailable === false ? (
                <p className="text-[10px] text-red-600">These dates are not available</p>
              ) : isAvailable === true ? (
                <p className="text-[10px] text-green-600">Dates available</p>
              ) : null}
            </div>
          )}
        </div>

        {/* ================================================================
            SECTION 2: INSURANCE TIER
            ================================================================ */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Insurance Protection</h3>

          {loadingQuotes ? (
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500">Loading insurance quotes...</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {INSURANCE_TIERS.map((tier) => {
                const quote = insuranceQuotes[tier]
                const isSelected = insuranceTier === tier
                const isCurrent = tier === (booking.insuranceSelection || booking.insuranceType || 'BASIC')
                const dailyRate = quote?.dailyPremium
                const totalPrice = quote?.totalPremium ?? 0

                return (
                  <button
                    key={tier}
                    onClick={() => setInsuranceTier(tier)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-900">{tier}</span>
                          {isCurrent && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-gray-200 text-gray-600 rounded">
                              Current
                            </span>
                          )}
                          {tier === 'LUXURY' && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-green-100 text-green-700 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {dailyRate !== undefined ? (
                          <>
                            <p className="text-xs font-medium text-gray-900">${formatPrice(totalPrice)}</p>
                            <p className="text-[10px] text-gray-500">${formatPrice(dailyRate)}/day</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-gray-400">—</p>
                        )}
                      </div>
                    </div>
                    {quote?.coverage?.description && isSelected && (
                      <p className="text-[10px] text-gray-500 mt-1.5 ml-5.5 pl-0.5">
                        {quote.coverage.description}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ================================================================
            SECTION 3: DELIVERY
            ================================================================ */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Method</h3>

          <div className="grid grid-cols-2 gap-1.5">
            {DELIVERY_OPTIONS.map((option) => {
              const isSelected = deliveryType === option.value
              const isCurrent = option.value === (booking.pickupType || 'pickup')
              const Icon = option.icon

              return (
                <button
                  key={option.value}
                  onClick={() => setDeliveryType(option.value)}
                  className={`text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium text-gray-900">{option.label}</span>
                    {isCurrent && (
                      <span className="px-1 py-0.5 text-[8px] font-medium bg-gray-200 text-gray-600 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">{option.desc}</p>
                  <p className="text-[10px] font-medium text-gray-700 mt-0.5">
                    {option.fee === 0 ? 'Free' : `$${option.fee}`}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Address input for hotel/valet */}
          {(deliveryType === 'hotel' || deliveryType === 'valet') && (
            <div className="mt-2">
              <label className="text-[10px] font-medium text-gray-600 mb-1 block">
                <IoLocationOutline className="w-3 h-3 inline mr-0.5" />
                {deliveryType === 'hotel' ? 'Hotel name & address' : 'Delivery address'}
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={deliveryType === 'hotel' ? 'e.g. Hyatt Regency Phoenix' : 'Enter delivery address'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* ================================================================
            SECTION 4: ENHANCEMENTS / ADD-ONS
            ================================================================ */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Enhancements</h3>

          <div className="space-y-1.5">
            {(Object.entries(ADDON_PRICES) as [keyof typeof ADDON_PRICES, typeof ADDON_PRICES[keyof typeof ADDON_PRICES]][]).map(([key, config]) => {
              const isChecked = addOns[key as keyof AddOnsState]
              const price = 'flat' in config
                ? config.flat
                : config.perDay * days
              const priceLabel = 'flat' in config
                ? `$${config.flat}`
                : `$${config.perDay}/day × ${days} = $${config.perDay * days}`
              const Icon = config.icon

              return (
                <button
                  key={key}
                  onClick={() => setAddOns(prev => ({ ...prev, [key]: !prev[key as keyof AddOnsState] }))}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {isChecked && <IoCheckmarkCircle className="w-3 h-3 text-white" />}
                    </div>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isChecked ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">{config.label}</p>
                      <p className="text-[10px] text-gray-500">{config.desc}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-700 flex-shrink-0">
                      ${formatPrice(price)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ================================================================
            SECTION 4: PRICE SUMMARY
            ================================================================ */}
        {newPricing && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Price Summary</h3>

            <div className="p-3 bg-gray-50 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">{days} day{days !== 1 ? 's' : ''} × ${formatPrice(booking.dailyRate)}/day</span>
                <span>${formatPrice(newPricing.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance ({insuranceTier})</span>
                <span>${formatPrice(newPricing.insurancePrice)}</span>
              </div>
              {newPricing.enhancementsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Enhancements</span>
                  <span>${formatPrice(newPricing.enhancementsTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery ({DELIVERY_OPTIONS.find(o => o.value === deliveryType)?.label || 'Pickup'})
                </span>
                <span>{newPricing.deliveryFee > 0 ? `$${formatPrice(newPricing.deliveryFee)}` : 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee (15%)</span>
                <span>${formatPrice(newPricing.serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({newPricing.taxRateDisplay})</span>
                <span>${formatPrice(newPricing.taxes)}</span>
              </div>

              <div className="flex justify-between pt-1.5 border-t border-gray-200 font-medium text-gray-900">
                <span>New Total</span>
                <span>${formatPrice(newPricing.total)}</span>
              </div>

              {/* Price difference */}
              {hasChanges && Math.abs(priceDiff) > 0.01 && (
                <div className={`mt-2 px-2.5 py-1.5 rounded text-[11px] font-medium text-center ${
                  priceDiff > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {priceDiff > 0
                    ? `+$${formatPrice(priceDiff)} more — will be authorized on your card`
                    : `$${formatPrice(Math.abs(priceDiff))} less — hold will be reduced`}
                </div>
              )}

              {/* Current total reference */}
              {hasChanges && (
                <p className="text-[10px] text-gray-400 text-center mt-1">
                  Current total: ${formatPrice(booking.totalAmount)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <IoAlertCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
