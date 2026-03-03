// app/partner/bookings/new/page.tsx
// Manual Booking Creation Wizard — stepper shell

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5'
import {
  Customer,
  Vehicle,
  AvailabilityResult,
  PartnerAddress,
  PartnerTier,
  PartnerInsurance,
  GuestInsurance,
  InsuranceOption,
  Step,
} from './types'
import { calculatePriceBreakdown } from './utils/pricing'
import BookingStepper from './components/BookingStepper'
import CustomerStep from './components/CustomerStep'
import VerifyStep from './components/VerifyStep'
import VehicleStep from './components/VehicleStep'
import DatesStep from './components/DatesStep'
import ConfirmStep from './components/ConfirmStep'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get('customerId')
  const t = useTranslations('PartnerBookingNew')
  const locale = useLocale()

  // ─── Shared State ──────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<Step>('customer')
  const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set(['customer']))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Navigate to step + track as visited (keeps components mounted for state persistence)
  const goToStep = useCallback((step: Step) => {
    setVisitedSteps(prev => {
      if (prev.has(step)) return prev
      const next = new Set(prev)
      next.add(step)
      return next
    })
    setCurrentStep(step)
  }, [])

  // Customer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Vehicle
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Dates & Times
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('10:00')
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Booking details
  const [pickupType, setPickupType] = useState<'partner' | 'delivery' | 'airport'>('partner')
  const [pickupLocation, setPickupLocation] = useState('')
  const [selectedAirport, setSelectedAirport] = useState('')
  const [notes, setNotes] = useState('')

  // Insurance
  const [insuranceOption, setInsuranceOption] = useState<InsuranceOption>('guest')
  const [guestInsurance, setGuestInsurance] = useState<GuestInsurance>({
    hasConfirmed: false,
    provider: '',
    policyNumber: ''
  })

  // Partner info
  const [partnerAddress, setPartnerAddress] = useState<PartnerAddress | null>(null)
  const [partnerTier, setPartnerTier] = useState<PartnerTier | null>(null)
  const [partnerInsurance, setPartnerInsurance] = useState<PartnerInsurance | null>(null)
  const [agreementPreference, setAgreementPreference] = useState<string | null>(null)

  // ─── Data Fetching ─────────────────────────────────────

  useEffect(() => {
    if (preselectedCustomerId) loadPreselectedCustomer(preselectedCustomerId)
  }, [preselectedCustomerId])

  useEffect(() => {
    fetchVehicles()
    fetchPartnerInsurance()
    fetchPartnerAddress()
    fetchAgreementPreference()
  }, [])

  useEffect(() => {
    if (selectedVehicle && startDate && endDate) checkAvailability()
  }, [selectedVehicle, startDate, endDate])

  const fetchPartnerAddress = async () => {
    try {
      const response = await fetch('/api/partner/settings')
      const data = await response.json()
      if (data.success) {
        if (data.partner) {
          setPartnerAddress({
            address: data.partner.businessAddress || '',
            city: data.partner.businessCity || '',
            state: data.partner.businessState || '',
            zipCode: data.partner.businessZipCode || ''
          })
        }
        if (data.tier) {
          setPartnerTier({
            tier: data.tier.name || 'Standard',
            commissionRate: data.tier.commissionRate || 0.25,
            fleetSize: data.tier.fleetSize || 0
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch partner address:', err)
    }
  }

  const fetchPartnerInsurance = async () => {
    try {
      const response = await fetch('/api/partner/insurance')
      const data = await response.json()
      if (data.success) {
        setPartnerInsurance({
          hasInsurance: data.insurance.hasPartnerInsurance,
          coversDuringRentals: data.insurance.coversDuringRentals || false,
          insuranceProvider: data.insurance.insuranceProvider || null,
          rentalCoveredVehicleIds: data.insurance.rentalCoveredVehicleIds || []
        })
      }
    } catch (err) {
      console.error('Failed to fetch partner insurance:', err)
    }
  }

  const fetchAgreementPreference = async () => {
    try {
      const response = await fetch('/api/partner/session-info')
      const data = await response.json()
      if (data.host?.agreementPreference) {
        setAgreementPreference(data.host.agreementPreference)
      }
    } catch (err) {
      console.error('Failed to fetch agreement preference:', err)
    }
  }

  const loadPreselectedCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/partner/customers/${id}`)
      const data = await response.json()
      if (data.success && data.customer) {
        setSelectedCustomer({
          id: data.customer.id,
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          photo: data.customer.photo
        })
        goToStep('vehicle')
      }
    } catch (err) {
      console.error('Failed to load preselected customer:', err)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/partner/fleet')
      const data = await response.json()
      if (data.success) {
        // Show all cars except maintenance — hosts can book inactive (unlisted) cars too
        setVehicles(data.vehicles.filter((v: Vehicle) => v.status !== 'maintenance'))
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
    }
  }

  const checkAvailability = async () => {
    if (!selectedVehicle || !startDate || !endDate) return

    setCheckingAvailability(true)
    setAvailability(null)

    try {
      const params = new URLSearchParams({
        carId: selectedVehicle.id,
        startDate,
        endDate
      })
      const response = await fetch(`/api/partner/bookings/availability?${params}`)
      const data = await response.json()
      setAvailability(data)
    } catch {
      setAvailability({ available: false, reason: t('failedCheckAvailability') })
    } finally {
      setCheckingAvailability(false)
    }
  }

  // ─── Helpers ───────────────────────────────────────────

  const getMinEndDate = (start: string, minDays: number) => {
    if (!start) return ''
    const startDateObj = new Date(start)
    startDateObj.setDate(startDateObj.getDate() + minDays)
    return startDateObj.toISOString().split('T')[0]
  }

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate)
    if (selectedVehicle && newStartDate) {
      const minDays = selectedVehicle.minTripDuration || 1
      const minEndDate = getMinEndDate(newStartDate, minDays)
      if (!endDate || endDate < minEndDate) setEndDate(minEndDate)
    }
  }

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    if (startDate) {
      const minDays = vehicle.minTripDuration || 1
      const minEndDate = getMinEndDate(startDate, minDays)
      if (!endDate || endDate < minEndDate) setEndDate(minEndDate)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const breakdown = calculatePriceBreakdown(selectedVehicle, availability, pickupType, partnerTier)

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <IoArrowBackOutline className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pageTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('pageSubtitle')}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <BookingStepper currentStep={currentStep} onStepClick={goToStep} />

      {error && (
        <div className="mb-6 max-w-5xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
          <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-5xl mx-auto">
        {/* Step header — full width above the grid so cards & sidebar align */}
        {currentStep !== 'confirm' && (
          <div className="mb-4">
            {currentStep === 'customer' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('selectCustomerTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('selectCustomerDescription')}</p>
              </div>
            )}
            {currentStep === 'verify' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('identityVerificationTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('identityVerificationDescription')}</p>
              </div>
            )}
            {currentStep === 'vehicle' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('selectVehicleTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('selectVehicleDescription')} <Link href="/partner/fleet/add" className="text-orange-600 dark:text-orange-400 hover:underline">{t('addNewVehicleLink')}</Link> {t('selectVehicleDescriptionSuffix')}
                </p>
              </div>
            )}
            {currentStep === 'dates' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('selectDatesTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('selectDatesDescription')}</p>
              </div>
            )}
          </div>
        )}

        {/* Two-column grid for cards + sidebar (steps 1-4), full-width for confirm */}
        <div className={currentStep === 'confirm' ? '' : 'lg:grid lg:grid-cols-3 lg:gap-6'}>
          {/* Main step content */}
          <div className={currentStep === 'confirm' ? '' : 'lg:col-span-2'}>
            {/* Steps stay mounted (hidden) once visited to preserve local state */}
            <div className={currentStep === 'customer' ? '' : 'hidden'}>
              <CustomerStep
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
                onNext={() => goToStep('verify')}
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
              />
            </div>

            {visitedSteps.has('verify') && (
              <div className={currentStep === 'verify' ? '' : 'hidden'}>
                <VerifyStep
                  selectedCustomer={selectedCustomer}
                  onCustomerUpdate={setSelectedCustomer}
                  onBack={() => goToStep('customer')}
                  onNext={() => goToStep('vehicle')}
                />
              </div>
            )}

            {visitedSteps.has('vehicle') && (
              <div className={currentStep === 'vehicle' ? '' : 'hidden'}>
                <VehicleStep
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={handleVehicleSelect}
                  onBack={() => goToStep('verify')}
                  onNext={() => goToStep('dates')}
                  formatCurrency={formatCurrency}
                />
              </div>
            )}

            {visitedSteps.has('dates') && (
              <div className={currentStep === 'dates' ? '' : 'hidden'}>
                <DatesStep
                  selectedVehicle={selectedVehicle}
                  startDate={startDate}
                  endDate={endDate}
                  startTime={startTime}
                  endTime={endTime}
                  onStartDateChange={handleStartDateChange}
                  onEndDateChange={setEndDate}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                  availability={availability}
                  checkingAvailability={checkingAvailability}
                  pickupType={pickupType}
                  onPickupTypeChange={setPickupType}
                  pickupLocation={pickupLocation}
                  onPickupLocationChange={setPickupLocation}
                  selectedAirport={selectedAirport}
                  onSelectedAirportChange={setSelectedAirport}
                  partnerAddress={partnerAddress}
                  partnerInsurance={partnerInsurance}
                  guestInsurance={guestInsurance}
                  onGuestInsuranceChange={setGuestInsurance}
                  notes={notes}
                  onNotesChange={setNotes}
                  onBack={() => goToStep('vehicle')}
                  onNext={() => goToStep('confirm')}
                  onChangeVehicle={() => goToStep('vehicle')}
                  getMinEndDate={getMinEndDate}
                />
              </div>
            )}

            {visitedSteps.has('confirm') && (
              <div className={currentStep === 'confirm' ? '' : 'hidden'}>
                <ConfirmStep
                  selectedCustomer={selectedCustomer}
                  selectedVehicle={selectedVehicle}
                  startDate={startDate}
                  endDate={endDate}
                  startTime={startTime}
                  endTime={endTime}
                  availability={availability}
                  pickupType={pickupType}
                  pickupLocation={pickupLocation}
                  partnerAddress={partnerAddress}
                  partnerTier={partnerTier}
                  partnerInsurance={partnerInsurance}
                  insuranceOption={insuranceOption}
                  onInsuranceOptionChange={setInsuranceOption}
                  guestInsurance={guestInsurance}
                  notes={notes}
                  breakdown={breakdown}
                  formatCurrency={formatCurrency}
                  onBack={() => goToStep('dates')}
                  onGoToStep={goToStep}
                  loading={loading}
                  setLoading={setLoading}
                  error={error}
                  setError={setError}
                  initialAgreementPreference={agreementPreference}
                />
              </div>
            )}
          </div>

          {/* Desktop sidebar — info box (hidden on confirm step & mobile) */}
          {currentStep !== 'confirm' && (
            <div className="hidden lg:block">
              <div className="lg:sticky lg:top-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <IoInformationCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-0.5">{t('howSelfBookingWorksTitle')}</p>
                      <ul className="space-y-0.5 text-blue-700 dark:text-blue-300">
                        <li>• <strong>{t('infoAgreementLabel')}</strong> {t('infoAgreementDescription')}</li>
                        <li>• <strong>{t('infoPaymentLabel')}</strong> {t('infoPaymentDescription')}</li>
                        <li>• <strong>{t('infoVerificationLabel')}</strong> {t('infoVerificationDescription')}</li>
                        <li>• <strong>{t('infoVehiclesLabel')}</strong> {t('infoVehiclesDescription')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only info box at bottom (hidden on confirm step) */}
      {currentStep !== 'confirm' && (
        <div className="lg:hidden max-w-5xl mx-auto mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <IoInformationCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-0.5">{t('howSelfBookingWorksTitle')}</p>
                <ul className="space-y-0.5 text-blue-700 dark:text-blue-300">
                  <li>• <strong>{t('infoAgreementLabel')}</strong> {t('infoAgreementDescription')}</li>
                  <li>• <strong>{t('infoPaymentLabel')}</strong> {t('infoPaymentDescription')}</li>
                  <li>• <strong>{t('infoVerificationLabel')}</strong> {t('infoVerificationDescription')}</li>
                  <li>• <strong>{t('infoVehiclesLabel')}</strong> {t('infoVehiclesDescription')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
