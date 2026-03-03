// app/partner/bookings/new/components/ConfirmStep.tsx

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import {
  IoPersonOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoCheckmarkOutline,
  IoWarningOutline,
  IoShieldOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoLocationOutline,
  IoWalletOutline,
  IoMailOutline,
  IoCashOutline,
  IoCardOutline,
} from 'react-icons/io5'
import {
  Customer,
  Vehicle,
  AvailabilityResult,
  PartnerAddress,
  PartnerTier,
  PartnerInsurance,
  InsuranceOption,
  DELIVERY_FEES,
} from '../types'
import { PriceBreakdown } from '../utils/pricing'

type AgreementType = 'ITWHIP' | 'OWN' | 'BOTH'

// Format "14:00" → "2:00 PM"
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

interface ConfirmStepProps {
  selectedCustomer: Customer | null
  selectedVehicle: Vehicle | null
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  availability: AvailabilityResult | null
  pickupType: 'partner' | 'delivery' | 'airport'
  pickupLocation: string
  partnerAddress: PartnerAddress | null
  partnerTier: PartnerTier | null
  partnerInsurance: PartnerInsurance | null
  insuranceOption: InsuranceOption
  onInsuranceOptionChange: (option: InsuranceOption) => void
  guestInsurance: { hasConfirmed: boolean; provider: string; policyNumber: string }
  notes: string
  breakdown: PriceBreakdown
  formatCurrency: (amount: number) => string
  onBack: () => void
  onGoToStep: (step: 'customer' | 'verify' | 'vehicle' | 'dates' | 'confirm') => void
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string
  setError: (error: string) => void
  initialAgreementPreference?: string | null
}

// Card input styling for Stripe CardElement
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626' },
  },
}

export default function ConfirmStep({
  selectedCustomer,
  selectedVehicle,
  startDate,
  endDate,
  startTime,
  endTime,
  availability,
  pickupType,
  pickupLocation,
  partnerAddress,
  partnerTier,
  partnerInsurance,
  insuranceOption,
  onInsuranceOptionChange,
  guestInsurance,
  notes,
  breakdown,
  formatCurrency,
  onBack,
  onGoToStep,
  loading,
  setLoading,
  error,
  setError,
  initialAgreementPreference,
}: ConfirmStepProps) {
  const router = useRouter()
  const t = useTranslations('PartnerBookingNew')

  const [agreementType, setAgreementType] = useState<AgreementType>(
    (initialAgreementPreference as AgreementType) || 'ITWHIP'
  )
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'platform'>('cash')
  const stripe = useStripe()
  const elements = useElements()

  const createBooking = async () => {
    if (!selectedCustomer || !selectedVehicle || !startDate || !endDate) {
      setError(t('completeAllFields'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/bookings/create-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Send customerId for real users, guestInfo for guest-only
          ...(selectedCustomer.isGuestOnly
            ? {
                guestInfo: {
                  name: selectedCustomer.name,
                  email: selectedCustomer.email,
                  phone: selectedCustomer.phone,
                },
              }
            : { customerId: selectedCustomer.id }),
          carId: selectedVehicle.id,
          startDate,
          endDate,
          startTime,
          endTime,
          pickupType: pickupType === 'partner' ? 'PARTNER_LOCATION' : pickupType.toUpperCase(),
          pickupLocation: pickupType !== 'partner' ? pickupLocation : null,
          notes,
          insuranceOption,
          guestInsurance: insuranceOption === 'guest' ? {
            provider: guestInsurance.provider,
            policyNumber: guestInsurance.policyNumber,
          } : undefined,
          agreementType,
          paymentMethod,
        })
      })
      const data = await response.json()
      if (data.success) {
        if (data.clientSecret && paymentMethod === 'platform' && stripe && elements) {
          // Confirm the card payment with Stripe
          const cardElement = elements.getElement(CardElement)
          if (!cardElement) {
            setError(t('paymentFailed'))
            setLoading(false)
            return
          }

          const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: { card: cardElement }
          })

          if (stripeError) {
            setError(stripeError.message || t('paymentFailed'))
            setLoading(false)
            return
          }

          // Payment confirmed — redirect to booking
          router.push(`/partner/bookings/${data.booking.id}`)
        } else {
          // Cash payment: go directly to booking
          router.push(`/partner/bookings/${data.booking.id}`)
        }
      } else {
        setError(data.error || t('failedCreateBooking'))
      }
    } catch {
      setError(t('failedCreateBooking'))
    } finally {
      setLoading(false)
    }
  }

  const tierName = partnerTier?.tier || 'Standard'
  const commissionPercent = Math.round((breakdown.platformCommissionRate || 0.25) * 100)

  const agreementOptions: Array<{
    value: AgreementType
    icon: typeof IoShieldCheckmarkOutline
    title: string
    description: string
    tag?: string
    tagColor?: string
  }> = [
    {
      value: 'ITWHIP',
      icon: IoShieldCheckmarkOutline,
      title: t('agreementItwhip'),
      description: t('agreementItwhipDesc'),
      tag: t('agreementRecommended'),
      tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      value: 'OWN',
      icon: IoDocumentTextOutline,
      title: t('agreementOwn'),
      description: t('agreementOwnDesc'),
    },
    {
      value: 'BOTH',
      icon: IoLayersOutline,
      title: t('agreementBoth'),
      description: t('agreementBothDesc'),
      tag: t('agreementMostProtection'),
      tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('reviewConfirmTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('reviewConfirmDescription')}
        </p>
      </div>

      {/* Two-column layout on desktop */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* ── Left Column: Summary + Selections ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prominent Selected Vehicle Display */}
          {selectedVehicle && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-4">
                {selectedVehicle.photo ? (
                  <img
                    src={selectedVehicle.photo}
                    alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="w-32 h-24 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-32 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <IoCarOutline className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVehicle.year} {selectedVehicle.make}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedVehicle.model}{selectedVehicle.trim ? ` ${selectedVehicle.trim}` : ''}
                  </p>
                  <div className="flex items-center flex-wrap gap-2 mt-1.5">
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">
                      ${selectedVehicle.dailyRate}/{t('day')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium">
                      {selectedVehicle.carType || t('standard')}
                    </span>
                    {selectedVehicle.currentMileage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedVehicle.currentMileage.toLocaleString()} {t('milesAbbr')}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedVehicle.vehicleType === 'RIDESHARE'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}>
                      {selectedVehicle.vehicleType === 'RIDESHARE' ? t('rideshare') : t('rental')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary — single card with dividers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Customer */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <IoPersonOutline className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('customerLabel')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer?.email}</p>
                </div>
              </div>
              <button onClick={() => onGoToStep('customer')} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                {t('edit')}
              </button>
            </div>

            {/* Vehicle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <IoCarOutline className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleLabel')}</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {selectedVehicle?.year} {selectedVehicle?.make}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedVehicle?.model}{selectedVehicle?.trim ? ` ${selectedVehicle.trim}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => onGoToStep('vehicle')} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                {t('edit')}
              </button>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('rentalPeriodLabel')}</p>
                  <div className="space-y-0.5">
                    <p className="font-medium text-gray-900 dark:text-white">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-normal mr-1">{t('startLabel')}</span>
                      {new Date(startDate.split('T')[0] + 'T12:00:00').toLocaleDateString()} {formatTime(startTime)}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-normal mr-1">{t('endLabel')}</span>
                      {new Date(endDate.split('T')[0] + 'T12:00:00').toLocaleDateString()} {formatTime(endTime)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('daysCount', { count: availability?.tripDays || 0 })}</p>
                </div>
              </div>
              <button onClick={() => onGoToStep('dates')} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                {t('edit')}
              </button>
            </div>

            {/* Pickup Location */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {pickupType === 'airport' ? (
                  <IoAirplaneOutline className="w-5 h-5 text-gray-400" />
                ) : pickupType === 'delivery' ? (
                  <IoLocationOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoBusinessOutline className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pickupType === 'airport' ? t('airportPickupLabel') : pickupType === 'delivery' ? t('deliveryLabel') : t('partnerLocationLabel')}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {pickupType === 'partner'
                      ? (partnerAddress?.address
                          ? (() => {
                              // Build address without duplicating city/state if already in the address line
                              const addr = partnerAddress.address
                              const cityState = [partnerAddress.city, partnerAddress.state].filter(Boolean).join(', ')
                              if (cityState && addr.includes(cityState)) return addr
                              return cityState ? `${addr}, ${cityState}` : addr
                            })()
                          : t('businessLocation'))
                      : pickupLocation || t('notSpecified')}
                  </p>
                  {DELIVERY_FEES[pickupType] > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                      +${DELIVERY_FEES[pickupType]} {pickupType === 'airport' ? t('airportFee') : t('deliveryFee')}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => onGoToStep('dates')} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                {t('edit')}
              </button>
            </div>

            {/* Current Insurance Status */}
            {selectedVehicle && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <IoShieldOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('insuranceCoverageLabel')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(() => {
                        const hasVehicleIns = selectedVehicle.insuranceEligible && selectedVehicle.insuranceInfo?.useForRentals
                        const hasPartnerIns = partnerInsurance?.hasInsurance &&
                          partnerInsurance?.coversDuringRentals &&
                          partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id)
                        if (hasVehicleIns) return t('insuranceVehicleSource', { provider: selectedVehicle.insuranceInfo?.provider || t('ownPolicy') })
                        if (hasPartnerIns) return t('insurancePartnerSource', { provider: partnerInsurance?.insuranceProvider || t('businessPolicy') })
                        return t('guestMustProvide')
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Insurance Selection — standalone card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <IoShieldOutline className="w-5 h-5" />
              {t('insuranceCoverageTitle')}
            </label>

            {/* No Coverage Warning Banner */}
            {selectedVehicle && (() => {
              const hasVehicleIns = selectedVehicle.insuranceEligible && selectedVehicle.insuranceInfo?.useForRentals
              const hasPartnerIns = partnerInsurance?.hasInsurance &&
                partnerInsurance?.coversDuringRentals &&
                partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id)

              if (!hasVehicleIns && !hasPartnerIns) {
                return (
                  <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                    <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('noCoverageWarningTitle')}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {t('noCoverageWarningDescription')}
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            <div className="space-y-2">
              {/* Vehicle Insurance Option */}
              {selectedVehicle?.insuranceEligible && selectedVehicle?.insuranceInfo?.useForRentals && (
                <button
                  onClick={() => onInsuranceOptionChange('vehicle')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    insuranceOption === 'vehicle'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      insuranceOption === 'vehicle' ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {insuranceOption === 'vehicle' && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                    </div>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{t('vehicleInsuranceOption')}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                    {t('coveredBy', { provider: selectedVehicle.insuranceInfo.provider || t('vehiclePolicy') })}
                  </p>
                </button>
              )}

              {/* Partner Insurance Option */}
              {partnerInsurance?.hasInsurance &&
               partnerInsurance?.coversDuringRentals &&
               selectedVehicle &&
               partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id) && (
                <button
                  onClick={() => onInsuranceOptionChange('partner')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    insuranceOption === 'partner'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      insuranceOption === 'partner' ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {insuranceOption === 'partner' && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                    </div>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{t('partnerInsuranceOption')}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                    {t('coveredByBusinessInsurance', { provider: partnerInsurance.insuranceProvider ? ` (${partnerInsurance.insuranceProvider})` : '' })}
                  </p>
                </button>
              )}

              {/* Guest Provides Insurance */}
              <button
                onClick={() => onInsuranceOptionChange('guest')}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  insuranceOption === 'guest'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    insuranceOption === 'guest' ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {insuranceOption === 'guest' && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                  </div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{t('guestProvidesInsuranceOption')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                  {t('guestProvidesInsuranceDescription')}
                </p>
              </button>

              {/* No Insurance */}
              <button
                onClick={() => onInsuranceOptionChange('none')}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  insuranceOption === 'none'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    insuranceOption === 'none' ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {insuranceOption === 'none' && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                  </div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{t('noInsuranceOption')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                  {t('noInsuranceDescription')}
                </p>
              </button>
            </div>

            {insuranceOption === 'none' && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {t('noInsuranceWarning')}
                </p>
              </div>
            )}
          </div>

          {/* Agreement Selection — standalone card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <IoDocumentTextOutline className="w-5 h-5" />
              {t('agreementTypeLabel')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {t('agreementTypeDescription')}
            </p>

            <div className="space-y-2">
              {agreementOptions.map((option) => {
                const Icon = option.icon
                const isSelected = agreementType === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => setAgreementType(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{option.title}</span>
                          {option.tag && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${option.tagColor}`}>
                              {option.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Method — standalone card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <IoWalletOutline className="w-5 h-5" />
              {t('paymentLabel')}
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                  </div>
                  <IoCashOutline className={`w-4 h-4 ${paymentMethod === 'cash' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{t('offlinePayment')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                  {t('offlinePaymentDescription')}
                </p>
              </button>

              <button
                onClick={() => setPaymentMethod('platform')}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'platform'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'platform' ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {paymentMethod === 'platform' && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                  </div>
                  <IoCardOutline className={`w-4 h-4 ${paymentMethod === 'platform' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{t('collectLater')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                  {t('collectLaterDescription')}
                </p>
              </button>

              {/* Inline Card Entry */}
              {paymentMethod === 'platform' && (
                <div className="p-4 bg-gray-200/70 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {t('enterCardDetails')}
                  </label>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-3">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Pricing + Submit (sticky on desktop) ── */}
        <div className="lg:col-span-1 mt-4 lg:mt-0">
          <div className="lg:sticky lg:top-4 space-y-4">
            {/* Price Breakdown */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('priceBreakdownTitle')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(breakdown.dailyRate)} x {breakdown.days} {breakdown.days === 1 ? t('dayUnit') : t('daysUnit')}
                  </span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.rentalSubtotal)}</span>
                </div>

                {breakdown.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {pickupType === 'airport' ? t('airportPickupFee') : t('deliveryFeeLabel')}
                    </span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.deliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('serviceFee')}</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.serviceFee)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-500 text-xs font-medium uppercase">{t('taxesAndFees')}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('arizonaStateTax')}</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.stateTax)}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('maricopaCountyTax')}</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.countyTax)}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('phoenixCityTax')}</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.cityTax)}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('rentalSurcharge')}</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.rentalTax)}</span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-gray-600 dark:text-gray-400">{t('totalTaxes')}</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.totalTaxes)}</span>
                </div>

                <div className="border-t-2 border-orange-200 dark:border-orange-800 my-2" />

                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900 dark:text-white text-base">{t('total')}</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(breakdown.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Partner Payout Estimate */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                <IoWalletOutline className="w-5 h-5" />
                {t('estimatedPayoutTitle')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    tierName === 'Diamond' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                    tierName === 'Platinum' ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300' :
                    tierName === 'Gold' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {t('tierLabel', { tier: tierName })}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('tierDetails', { vehicles: partnerTier?.fleetSize || 0, percent: commissionPercent })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('rentalEarnings')}</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.rentalSubtotal)}</span>
                </div>

                {breakdown.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {pickupType === 'airport' ? t('airportFeeYouKeep') : t('deliveryFeeYouKeep')}
                    </span>
                    <span className="text-green-600 dark:text-green-400">+{formatCurrency(breakdown.deliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>{t('platformFee', { percent: commissionPercent })}</span>
                  <span>-{formatCurrency(breakdown.platformCommission)}</span>
                </div>

                <div className="border-t border-green-200 dark:border-green-700 my-2" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-800 dark:text-green-300">{t('yourPayout')}</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(breakdown.partnerPayout)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>{t('platformKeeps')}</span>
                    <span>{formatCurrency(breakdown.serviceFee + breakdown.platformCommission)}</span>
                  </div>
                  <p className="mt-1 text-gray-400 dark:text-gray-500">
                    {t('payoutDeductionNote')}
                  </p>
                </div>
              </div>
            </div>

            {/* What happens next info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
              <div className="flex items-start gap-2">
                <IoMailOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">{t('whatHappensOnSubmit')}</p>
                  <ul className="space-y-0.5 text-blue-600 dark:text-blue-400">
                    <li>• {t('submitStep1')}</li>
                    <li>• {t('submitStep2')}</li>
                    <li>• {t('submitStep3')}</li>
                    <li>• {t('submitStep4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {t('back')}
              </button>
              <button
                onClick={createBooking}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    {t('creatingBooking')}
                  </>
                ) : (
                  <>
                    <IoCheckmarkOutline className="w-5 h-5" />
                    {t('createBookingAndSend')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
