// app/partner/bookings/new/page.tsx
// Manual Booking Creation Wizard

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import {
  IoArrowBackOutline,
  IoSearchOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoAddOutline,
  IoCloseOutline,
  IoLocationOutline,
  IoWarningOutline,
  IoCheckmarkOutline,
  IoChevronForwardOutline,
  IoShieldCheckmarkOutline,
  IoShieldOutline,
  IoMailOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import { AddressAutocomplete, AddressResult } from '@/app/components/shared/AddressAutocomplete'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  photo: string | null
  isPreviousCustomer?: boolean
  totalBookings?: number
  // Verification status
  stripeIdentityStatus?: 'not_started' | 'pending' | 'verified' | 'failed' | null
  stripeIdentityVerifiedAt?: string | null
  stripeVerifiedFirstName?: string | null
  stripeVerifiedLastName?: string | null
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  photo: string | null
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  vehicleType: string
  minTripDuration: number
  status: string
  // Vehicle specs
  carType: string
  currentMileage: number | null
  // Insurance fields
  insuranceEligible?: boolean
  insuranceInfo?: {
    hasOwnInsurance: boolean
    provider: string | null
    policyNumber: string | null
    useForRentals: boolean
  } | null
}

// Arizona airports for dropdown
const ARIZONA_AIRPORTS = [
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport' },
  { code: 'TUS', name: 'Tucson International Airport' },
  { code: 'AZA', name: 'Phoenix-Mesa Gateway Airport' },
  { code: 'SDL', name: 'Scottsdale Airport' },
  { code: 'GCN', name: 'Grand Canyon National Park Airport' },
  { code: 'FLG', name: 'Flagstaff Pulliam Airport' },
  { code: 'YUM', name: 'Yuma International Airport' },
  { code: 'PRC', name: 'Prescott Ernest A. Love Field' },
  { code: 'IWA', name: 'Phoenix-Mesa Gateway Airport (IWA)' },
  { code: 'DVT', name: 'Phoenix Deer Valley Airport' }
]

// Delivery/Airport fees
const DELIVERY_FEES = {
  partner: 0,
  delivery: 35,
  airport: 25
}

type InsuranceOption = 'vehicle' | 'guest' | 'partner' | 'none'

interface AvailabilityResult {
  available: boolean
  reason?: string
  conflicts?: any[]
  nextAvailable?: string
  tripDays?: number
}

type Step = 'customer' | 'verify' | 'vehicle' | 'dates' | 'confirm'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get('customerId')
  const t = useTranslations('PartnerBookingNew')

  const locale = useLocale()

  const [currentStep, setCurrentStep] = useState<Step>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Customer selection
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  // Phone number formatting helper
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')

    // Format as (###) ###-####
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setNewCustomer(prev => ({ ...prev, phone: formatted }))
  }

  // Vehicle selection
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'rideshare' | 'rental'>('all')

  // Date selection
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Helper to calculate minimum end date based on vehicle's minimum trip duration
  const getMinEndDate = (start: string, minDays: number) => {
    if (!start) return ''
    const startDateObj = new Date(start)
    startDateObj.setDate(startDateObj.getDate() + minDays)
    return startDateObj.toISOString().split('T')[0]
  }

  // Handle start date change - auto-adjust end date for rideshare minimum
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate)

    if (selectedVehicle && newStartDate) {
      const minDays = selectedVehicle.minTripDuration || 1
      const minEndDate = getMinEndDate(newStartDate, minDays)

      // If current end date is less than minimum, auto-adjust it
      if (!endDate || endDate < minEndDate) {
        setEndDate(minEndDate)
      }
    }
  }

  // Handle vehicle selection - auto-adjust end date if needed
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)

    // If start date is already set, ensure end date meets minimum
    if (startDate) {
      const minDays = vehicle.minTripDuration || 1
      const minEndDate = getMinEndDate(startDate, minDays)

      if (!endDate || endDate < minEndDate) {
        setEndDate(minEndDate)
      }
    }
  }

  // Booking details
  const [pickupType, setPickupType] = useState<'partner' | 'delivery' | 'airport'>('partner')
  const [pickupLocation, setPickupLocation] = useState('')
  const [selectedAirport, setSelectedAirport] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentType, setPaymentType] = useState<'offline' | 'collect_later'>('offline')

  // Partner business address
  const [partnerAddress, setPartnerAddress] = useState<{
    address: string
    city: string
    state: string
    zipCode: string
  } | null>(null)

  // Partner tier and commission rate
  const [partnerTier, setPartnerTier] = useState<{
    tier: string
    commissionRate: number
    fleetSize: number
  } | null>(null)

  // Insurance
  const [insuranceOption, setInsuranceOption] = useState<InsuranceOption>('guest')
  const [partnerInsurance, setPartnerInsurance] = useState<{
    hasInsurance: boolean
    coversDuringRentals: boolean
    insuranceProvider: string | null
    rentalCoveredVehicleIds: string[]
  } | null>(null)

  // Guest insurance info (when guest must provide their own)
  const [guestInsurance, setGuestInsurance] = useState({
    hasConfirmed: false,
    provider: '',
    policyNumber: ''
  })

  // Verification
  const [sendingVerification, setSendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [skipVerification, setSkipVerification] = useState(false)

  // Send review to customer
  const [sendingReview, setSendingReview] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)
  const [preBookingId, setPreBookingId] = useState<string | null>(null)

  // Load preselected customer
  useEffect(() => {
    if (preselectedCustomerId) {
      loadPreselectedCustomer(preselectedCustomerId)
    }
  }, [preselectedCustomerId])

  // Load vehicles and partner info on mount
  useEffect(() => {
    fetchVehicles()
    fetchPartnerInsurance()
    fetchPartnerAddress()
  }, [])

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
    } catch (error) {
      console.error('Failed to fetch partner address:', error)
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
    } catch (error) {
      console.error('Failed to fetch partner insurance:', error)
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
        setCurrentStep('vehicle')
      }
    } catch (error) {
      console.error('Failed to load preselected customer:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/partner/fleet')
      const data = await response.json()
      if (data.success) {
        // Filter for available vehicles (API returns lowercase 'available')
        setVehicles(data.vehicles.filter((v: Vehicle) => v.status === 'available'))
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/partner/customers/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.customers)
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const createNewCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.email) {
      setError(t('firstNameEmailRequired'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newCustomer.firstName.trim(),
          lastName: newCustomer.lastName.trim(),
          email: newCustomer.email.trim().toLowerCase(),
          phone: newCustomer.phone || null
        })
      })

      const data = await response.json()

      if (data.success) {
        setSelectedCustomer(data.customer)
        setShowNewCustomerForm(false)
        setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' })
        // Go to verify step instead of skipping it
        setCurrentStep('verify')
      } else {
        setError(data.error || t('failedCreateCustomer'))
      }
    } catch (err) {
      setError(t('failedCreateCustomer'))
    } finally {
      setLoading(false)
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
    } catch (error) {
      console.error('Availability check failed:', error)
      setAvailability({ available: false, reason: t('failedCheckAvailability') })
    } finally {
      setCheckingAvailability(false)
    }
  }

  useEffect(() => {
    if (selectedVehicle && startDate && endDate) {
      checkAvailability()
    }
  }, [selectedVehicle, startDate, endDate])

  // Tax rates (Arizona)
  const TAX_RATES = {
    stateSalesTax: 0.056, // 5.6% Arizona state sales tax
    countyTax: 0.007, // 0.7% Maricopa County
    cityTax: 0.023, // 2.3% Phoenix city tax
    rentalTax: 0.05, // 5% rental surcharge
    serviceFeePercent: 0.10 // 10% platform service fee
  }

  const calculatePriceBreakdown = () => {
    if (!selectedVehicle || !availability?.tripDays) {
      return {
        days: 0,
        dailyRate: 0,
        rentalSubtotal: 0,
        deliveryFee: 0,
        serviceFee: 0,
        stateTax: 0,
        countyTax: 0,
        cityTax: 0,
        rentalTax: 0,
        totalTaxes: 0,
        total: 0,
        // Payout breakdown
        platformCommissionRate: 0,
        platformCommission: 0,
        partnerPayout: 0
      }
    }

    const days = availability.tripDays
    const dailyRate = selectedVehicle.dailyRate
    const weeklyRate = selectedVehicle.weeklyRate || dailyRate * 6.5
    const monthlyRate = selectedVehicle.monthlyRate || dailyRate * 25

    // Calculate rental subtotal with weekly/monthly discounts
    let rentalSubtotal = 0
    if (days >= 28) {
      rentalSubtotal = monthlyRate * Math.floor(days / 28) + dailyRate * (days % 28)
    } else if (days >= 7) {
      rentalSubtotal = weeklyRate * Math.floor(days / 7) + dailyRate * (days % 7)
    } else {
      rentalSubtotal = dailyRate * days
    }

    // Delivery/Airport fee
    const deliveryFee = DELIVERY_FEES[pickupType] || 0

    // Service fee (platform fee from customer - separate from partner commission)
    const serviceFee = rentalSubtotal * TAX_RATES.serviceFeePercent

    // Calculate taxes on subtotal + service fee
    const taxableAmount = rentalSubtotal + serviceFee
    const stateTax = taxableAmount * TAX_RATES.stateSalesTax
    const countyTax = taxableAmount * TAX_RATES.countyTax
    const cityTax = taxableAmount * TAX_RATES.cityTax
    const rentalTax = taxableAmount * TAX_RATES.rentalTax
    const totalTaxes = stateTax + countyTax + cityTax + rentalTax

    // Total customer pays
    const total = rentalSubtotal + deliveryFee + serviceFee + totalTaxes

    // Partner payout calculation (commission is on rental subtotal only)
    const platformCommissionRate = partnerTier?.commissionRate || 0.25
    const platformCommission = rentalSubtotal * platformCommissionRate
    // Partner gets: rental subtotal - platform commission + delivery fees (partner keeps delivery fees)
    const partnerPayout = rentalSubtotal - platformCommission + deliveryFee

    return {
      days,
      dailyRate,
      rentalSubtotal,
      deliveryFee,
      serviceFee,
      stateTax,
      countyTax,
      cityTax,
      rentalTax,
      totalTaxes,
      total,
      // Payout breakdown
      platformCommissionRate,
      platformCommission,
      partnerPayout
    }
  }

  const calculateTotal = () => {
    return calculatePriceBreakdown().total
  }

  const createBooking = async () => {
    if (!selectedCustomer || !selectedVehicle || !startDate || !endDate) {
      setError(t('completeAllFields'))
      return
    }

    setLoading(true)
    setError('')

    try {
      // If we have a pre-booking from "Send for Review", confirm it instead of creating new
      if (reviewSent && preBookingId) {
        const response = await fetch('/api/partner/bookings/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: preBookingId
          })
        })

        const data = await response.json()

        if (data.success) {
          router.push(`/partner/bookings?confirmed=${data.booking.id}`)
        } else {
          setError(data.error || t('failedConfirmBooking'))
        }
      } else {
        // Create new booking directly
        const response = await fetch('/api/partner/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: selectedCustomer.id,
            carId: selectedVehicle.id,
            startDate,
            endDate,
            pickupType: pickupType === 'partner' ? 'PARTNER_LOCATION' : pickupType.toUpperCase(),
            pickupLocation: pickupType !== 'partner' ? pickupLocation : null,
            notes,
            totalPrice: calculateTotal(),
            paymentType,
            insuranceOption,
            insuranceSource: insuranceOption === 'vehicle' ? 'VEHICLE' :
                            insuranceOption === 'partner' ? 'PARTNER' :
                            insuranceOption === 'guest' ? 'GUEST' : 'NONE'
          })
        })

        const data = await response.json()

        if (data.success) {
          router.push(`/partner/bookings?created=${data.booking.id}`)
        } else {
          setError(data.error || t('failedCreateBooking'))
        }
      }
    } catch (err) {
      setError(t('failedCreateBooking'))
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredVehicles = vehicles.filter(v => {
    if (vehicleFilter === 'all') return true
    if (vehicleFilter === 'rideshare') return v.vehicleType === 'RIDESHARE'
    if (vehicleFilter === 'rental') return v.vehicleType === 'RENTAL'
    return true
  })

  // Send verification email to customer
  const sendVerificationEmail = async () => {
    if (!selectedCustomer) return

    setSendingVerification(true)
    setVerificationError('')

    try {
      const response = await fetch('/api/partner/verify/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone || '',
          existingProfileId: selectedCustomer.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setVerificationSent(true)
        // Update customer with new verification status
        setSelectedCustomer(prev => prev ? {
          ...prev,
          stripeIdentityStatus: 'pending'
        } : null)
      } else {
        setVerificationError(data.error || t('failedSendVerification'))
      }
    } catch (err) {
      setVerificationError(t('failedSendVerificationEmail'))
    } finally {
      setSendingVerification(false)
    }
  }

  // Send booking review to customer for verification
  const sendBookingReview = async () => {
    if (!selectedCustomer || !selectedVehicle || !startDate || !endDate) {
      setError(t('completeAllFields'))
      return
    }

    setSendingReview(true)
    setError('')

    try {
      // Calculate price breakdown for the email
      const breakdown = calculatePriceBreakdown()

      const response = await fetch('/api/partner/bookings/send-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          carId: selectedVehicle.id,
          startDate,
          endDate,
          pickupType,
          pickupLocation: pickupType === 'delivery' ? pickupLocation : null,
          selectedAirport: pickupType === 'airport' ? selectedAirport : null,
          notes,
          insuranceOption,
          priceBreakdown: breakdown.total > 0 ? {
            rentalSubtotal: breakdown.rentalSubtotal,
            deliveryFee: breakdown.deliveryFee,
            serviceFee: breakdown.serviceFee,
            totalTaxes: breakdown.totalTaxes,
            total: breakdown.total
          } : null
        })
      })

      const data = await response.json()

      if (data.success) {
        setReviewSent(true)
        setPreBookingId(data.booking.id)
      } else {
        setError(data.error || t('failedSendReview'))
      }
    } catch (err) {
      setError(t('failedSendReview'))
    } finally {
      setSendingReview(false)
    }
  }

  // Check if customer is verified
  const isCustomerVerified = selectedCustomer?.stripeIdentityStatus === 'verified'
  const isCustomerPendingVerification = selectedCustomer?.stripeIdentityStatus === 'pending'

  const steps = [
    { id: 1, key: 'customer' as Step, title: t('stepCustomer') },
    { id: 2, key: 'verify' as Step, title: t('stepVerify') },
    { id: 3, key: 'vehicle' as Step, title: t('stepVehicle') },
    { id: 4, key: 'dates' as Step, title: t('stepDates') },
    { id: 5, key: 'confirm' as Step, title: t('stepConfirm') }
  ]

  const stepIndex = steps.findIndex(s => s.key === currentStep)
  const currentStepNum = stepIndex + 1

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => {
                  if (index < stepIndex) setCurrentStep(step.key)
                }}
                disabled={index > stepIndex}
                className="flex flex-col items-center"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  index < stepIndex
                    ? 'bg-green-600 text-white'
                    : index === stepIndex
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {index < stepIndex ? (
                    <IoCheckmarkCircleOutline className="w-6 h-6" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-1 text-center">
                  <p className={`text-[10px] sm:text-xs font-medium ${
                    index <= stepIndex
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center px-1 sm:px-2 -mt-5">
                  <IoChevronForwardOutline className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    index < stepIndex
                      ? 'text-green-600'
                      : 'text-gray-300 dark:text-gray-600'
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
          <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Customer Selection */}
        {currentStep === 'customer' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('selectCustomerTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('selectCustomerDescription')}
            </p>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  {selectedCustomer.photo ? (
                    <img src={selectedCustomer.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <IoPersonOutline className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                >
                  <IoCloseOutline className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchCustomerPlaceholder')}
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      searchCustomers(e.target.value)
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 mb-4">
                    {searchResults.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setCustomerSearch('')
                          setSearchResults([])
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      >
                        {customer.photo ? (
                          <img src={customer.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <IoPersonOutline className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                        {customer.isPreviousCustomer && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                            {t('previousCustomer')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Create New Customer */}
                {!showNewCustomerForm ? (
                  <button
                    onClick={() => setShowNewCustomerForm(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    <IoAddOutline className="w-5 h-5" />
                    {t('createNewCustomer')}
                  </button>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{t('newCustomerTitle')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('firstNameLabel')}</label>
                        <input
                          type="text"
                          value={newCustomer.firstName}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder={t('firstNamePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('lastNameLabel')}</label>
                        <input
                          type="text"
                          value={newCustomer.lastName}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder={t('lastNamePlaceholder')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailLabel')}</label>
                      <input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        placeholder={t('emailPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phoneLabel')}</label>
                      <input
                        type="tel"
                        value={newCustomer.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        placeholder={t('phonePlaceholder')}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowNewCustomerForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={createNewCustomer}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium"
                      >
                        {loading ? t('creating') : t('createAndSelect')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedCustomer && (
              <button
                onClick={() => setCurrentStep('verify')}
                className="w-full mt-4 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {t('continueToVerification')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Step 2: Identity Verification */}
        {currentStep === 'verify' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('identityVerificationTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('identityVerificationDescription')}
            </p>

            {/* Customer Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
              {selectedCustomer?.photo ? (
                <img src={selectedCustomer.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <IoPersonOutline className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer?.email}</p>
                {selectedCustomer?.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.phone}</p>
                )}
              </div>
            </div>

            {/* Verification Status */}
            {isCustomerVerified ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <IoCheckmarkCircleOutline className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">{t('identityVerified')}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {selectedCustomer?.stripeVerifiedFirstName} {selectedCustomer?.stripeVerifiedLastName}
                      {selectedCustomer?.stripeIdentityVerifiedAt && (
                        <> • {t('verifiedOn', { date: new Date(selectedCustomer.stripeIdentityVerifiedAt).toLocaleDateString() })}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : isCustomerPendingVerification || verificationSent ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <IoTimeOutline className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">{t('verificationPending')}</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                      {t('verificationPendingDescription')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-400">{t('verifyCustomerIdentity')}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                        {t('verifyCustomerIdentityDescription')}
                      </p>
                    </div>
                  </div>
                </div>

                {verificationError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                    <IoAlertCircleOutline className="w-5 h-5 flex-shrink-0" />
                    {verificationError}
                  </div>
                )}

                <button
                  onClick={sendVerificationEmail}
                  disabled={sendingVerification}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
                >
                  {sendingVerification ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      {t('sendingVerification')}
                    </>
                  ) : (
                    <>
                      <IoMailOutline className="w-5 h-5" />
                      {t('sendVerificationEmail')}
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('or')}
                </div>

                {/* In-Person Verification Option */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <IoPersonOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300">{t('inPersonVerification')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('inPersonVerificationDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skip Verification Checkbox */}
            {!isCustomerVerified && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
                <input
                  type="checkbox"
                  id="skipVerification"
                  checked={skipVerification}
                  onChange={(e) => setSkipVerification(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="skipVerification" className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t('skipVerificationLabel')}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {t('skipVerificationNote')}
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('customer')}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {t('back')}
              </button>
              <button
                onClick={() => setCurrentStep('vehicle')}
                disabled={!isCustomerVerified && !skipVerification && !verificationSent}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isCustomerVerified ? t('continueToVehicle') : t('continueSkipVerification')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Vehicle Selection */}
        {currentStep === 'vehicle' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('selectVehicleTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('selectVehicleDescription')} <Link href="/partner/fleet/add" className="text-orange-600 dark:text-orange-400 hover:underline">{t('addNewVehicleLink')}</Link> {t('selectVehicleDescriptionSuffix')}
            </p>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {(['all', 'rideshare', 'rental'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setVehicleFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    vehicleFilter === f
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {f === 'all' ? t('filterAll') : f === 'rideshare' ? t('filterRideshare') : t('filterRental')}
                </button>
              ))}
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {filteredVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {vehicle.photo ? (
                        <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoCarOutline className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(vehicle.dailyRate)}/{t('day')}
                        {vehicle.vehicleType === 'RIDESHARE' && vehicle.weeklyRate && (
                          <> • {formatCurrency(vehicle.weeklyRate)}/{t('week')}</>
                        )}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          vehicle.vehicleType === 'RIDESHARE'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        }`}>
                          {vehicle.vehicleType}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('minDays', { count: vehicle.minTripDuration })}
                        </span>
                      </div>
                    </div>
                    {selectedVehicle?.id === vehicle.id && (
                      <IoCheckmarkCircleOutline className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('noVehiclesFound')}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('verify')}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {t('back')}
              </button>
              <button
                onClick={() => setCurrentStep('dates')}
                disabled={!selectedVehicle}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {t('continueToDates')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Date Selection */}
        {currentStep === 'dates' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('selectDatesTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('selectDatesDescription')}
            </p>

            {/* Selected Vehicle Display */}
            {selectedVehicle && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3 border border-gray-200 dark:border-gray-600">
                {selectedVehicle.photo ? (
                  <img
                    src={selectedVehicle.photo}
                    alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="w-20 h-14 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-20 h-14 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                    <IoCarOutline className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </p>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      ${selectedVehicle.dailyRate}/{t('day')}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {selectedVehicle.carType || t('standard')}
                    </span>
                    {selectedVehicle.currentMileage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedVehicle.currentMileage.toLocaleString()} {t('milesAbbr')}
                      </span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      selectedVehicle.vehicleType === 'RIDESHARE'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {selectedVehicle.vehicleType === 'RIDESHARE' ? t('rideshare') : t('rental')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep('vehicle')}
                  className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                >
                  {t('change')}
                </button>
              </div>
            )}

            {/* Minimum days notice for rideshare */}
            {selectedVehicle && selectedVehicle.minTripDuration > 1 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    {selectedVehicle.vehicleType === 'RIDESHARE'
                      ? t('rideshareMinDaysTitle', { days: selectedVehicle.minTripDuration })
                      : t('vehicleMinDaysTitle', { days: selectedVehicle.minTripDuration })}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                    {t('minDaysDescription', { days: selectedVehicle.minTripDuration })}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDateLabel')}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDateLabel')}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate ? getMinEndDate(startDate, selectedVehicle?.minTripDuration || 1) : new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Availability Status */}
            {(startDate && endDate) && (
              <div className="mb-4">
                {checkingAvailability ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('checkingAvailability')}</p>
                  </div>
                ) : availability ? (
                  <div className={`p-4 rounded-lg ${
                    availability.available
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {availability.available ? (
                        <>
                          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-700 dark:text-green-400">
                            {t('availableDays', { days: availability.tripDays || 0 })}
                          </span>
                        </>
                      ) : (
                        <>
                          <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <span className="font-medium text-red-700 dark:text-red-400">
                            {availability.reason}
                          </span>
                        </>
                      )}
                    </div>
                    {availability.nextAvailable && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {t('nextAvailable', { date: new Date(availability.nextAvailable).toLocaleDateString() })}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Pickup Options */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pickupTypeLabel')}</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'partner', label: t('pickupPartnerLocation'), icon: IoBusinessOutline, fee: DELIVERY_FEES.partner },
                  { key: 'delivery', label: t('pickupDelivery'), icon: IoLocationOutline, fee: DELIVERY_FEES.delivery },
                  { key: 'airport', label: t('pickupAirport'), icon: IoAirplaneOutline, fee: DELIVERY_FEES.airport }
                ] as const).map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setPickupType(option.key)
                      if (option.key === 'partner') {
                        setPickupLocation('')
                        setSelectedAirport('')
                      }
                    }}
                    className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                      pickupType === option.key
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-2 border-orange-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-transparent'
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                    <span>{option.label}</span>
                    {option.fee > 0 && (
                      <span className="text-xs text-gray-500">+${option.fee}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Partner Location Display */}
            {pickupType === 'partner' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <IoBusinessOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('pickupAtPartnerLocation')}</p>
                    {partnerAddress && partnerAddress.address ? (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {partnerAddress.address}, {partnerAddress.city}, {partnerAddress.state} {partnerAddress.zipCode}
                      </p>
                    ) : (
                      <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                        {t('businessAddressUsedForPickup')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address with Mapbox */}
            {pickupType === 'delivery' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('deliveryAddressLabel')}
                </label>
                <AddressAutocomplete
                  value={pickupLocation}
                  onAddressSelect={(address: AddressResult) => {
                    setPickupLocation(address.fullAddress)
                  }}
                  placeholder={t('deliveryAddressPlaceholder')}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <IoLocationOutline className="w-3 h-3" />
                  {t('deliveryFeeAmount', { amount: DELIVERY_FEES.delivery })}
                </p>
              </div>
            )}

            {/* Arizona Airports Dropdown */}
            {pickupType === 'airport' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('selectAirportLabel')}
                </label>
                <select
                  value={selectedAirport}
                  onChange={(e) => {
                    setSelectedAirport(e.target.value)
                    const airport = ARIZONA_AIRPORTS.find(a => a.code === e.target.value)
                    if (airport) {
                      setPickupLocation(`${airport.name} (${airport.code})`)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{t('selectAirportPlaceholder')}</option>
                  {ARIZONA_AIRPORTS.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.name} ({airport.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <IoAirplaneOutline className="w-3 h-3" />
                  {t('airportFeeAmount', { amount: DELIVERY_FEES.airport })}
                </p>
              </div>
            )}

            {/* Insurance Status Indicator */}
            {selectedVehicle && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <IoShieldOutline className="w-4 h-4" />
                  {t('insuranceStatusLabel')}
                </label>
                {(() => {
                  const hasVehicleInsurance = selectedVehicle.insuranceEligible && selectedVehicle.insuranceInfo?.useForRentals
                  const hasPartnerCoverage = partnerInsurance?.hasInsurance &&
                    partnerInsurance?.coversDuringRentals &&
                    partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id)

                  if (hasVehicleInsurance) {
                    return (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">{t('vehicleInsuranceLabel')}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {t('coveredBy', { provider: selectedVehicle.insuranceInfo?.provider || t('vehiclePolicy') })}
                          </p>
                        </div>
                      </div>
                    )
                  } else if (hasPartnerCoverage) {
                    return (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('partnerInsuranceLabel')}</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">
                            {t('coveredByBusinessInsurance', { provider: partnerInsurance?.insuranceProvider ? ` (${partnerInsurance.insuranceProvider})` : '' })}
                          </p>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-start gap-2 mb-3">
                          <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('guestMustProvideInsurance')}</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {t('noCoverageDescription')}
                            </p>
                          </div>
                        </div>

                        {/* Guest Insurance Options */}
                        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700 space-y-3">
                          {/* Option 1: Add guest insurance info now */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('addGuestInsuranceOptional')}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={guestInsurance.provider}
                                onChange={(e) => setGuestInsurance(prev => ({ ...prev, provider: e.target.value }))}
                                placeholder={t('insuranceProviderPlaceholder')}
                                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                type="text"
                                value={guestInsurance.policyNumber}
                                onChange={(e) => setGuestInsurance(prev => ({ ...prev, policyNumber: e.target.value }))}
                                placeholder={t('policyNumberPlaceholder')}
                                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Option 2: Confirm guest will bring insurance */}
                          <label className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={guestInsurance.hasConfirmed}
                              onChange={(e) => setGuestInsurance(prev => ({ ...prev, hasConfirmed: e.target.checked }))}
                              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t('guestWillBringInsurance')}
                            </span>
                          </label>
                        </div>
                      </div>
                    )
                  }
                })()}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notesLabel')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={t('notesPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('vehicle')}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {t('back')}
              </button>
              <button
                onClick={() => setCurrentStep('confirm')}
                disabled={!availability?.available}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {t('reviewBooking')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 'confirm' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('reviewConfirmTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('reviewConfirmDescription')}
            </p>

            {/* Prominent Selected Vehicle Display */}
            {selectedVehicle && (
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-4">
                  {selectedVehicle.photo ? (
                    <img
                      src={selectedVehicle.photo}
                      alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="w-28 h-20 object-cover rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-28 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <IoCarOutline className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </p>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
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

            {/* Summary */}
            <div className="space-y-4 mb-6">
              {/* Customer */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoPersonOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('customerLabel')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer?.email}</p>
                  </div>
                </div>
                {!reviewSent && (
                  <button
                    onClick={() => setCurrentStep('customer')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t('edit')}
                  </button>
                )}
              </div>

              {/* Vehicle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoCarOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleLabel')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                    </p>
                  </div>
                </div>
                {!reviewSent && (
                  <button
                    onClick={() => setCurrentStep('vehicle')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t('edit')}
                  </button>
                )}
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('rentalPeriodLabel')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('daysCount', { count: availability?.tripDays || 0 })}</p>
                  </div>
                </div>
                {!reviewSent && (
                  <button
                    onClick={() => setCurrentStep('dates')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t('edit')}
                  </button>
                )}
              </div>

              {/* Pickup Location */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                            ? `${partnerAddress.address}, ${partnerAddress.city}, ${partnerAddress.state}`
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
                {!reviewSent && (
                  <button
                    onClick={() => setCurrentStep('dates')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t('edit')}
                  </button>
                )}
              </div>

              {/* Current Insurance Status */}
              {selectedVehicle && (
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  (() => {
                    const hasVehicleIns = selectedVehicle.insuranceEligible && selectedVehicle.insuranceInfo?.useForRentals
                    const hasPartnerIns = partnerInsurance?.hasInsurance &&
                      partnerInsurance?.coversDuringRentals &&
                      partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id)
                    if (hasVehicleIns) return 'bg-green-50 dark:bg-green-900/20'
                    if (hasPartnerIns) return 'bg-purple-50 dark:bg-purple-900/20'
                    return 'bg-amber-50 dark:bg-amber-900/20'
                  })()
                }`}>
                  <div className="flex items-center gap-3">
                    <IoShieldOutline className={`w-5 h-5 ${
                      (() => {
                        const hasVehicleIns = selectedVehicle.insuranceEligible && selectedVehicle.insuranceInfo?.useForRentals
                        const hasPartnerIns = partnerInsurance?.hasInsurance &&
                          partnerInsurance?.coversDuringRentals &&
                          partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id)
                        if (hasVehicleIns) return 'text-green-600'
                        if (hasPartnerIns) return 'text-purple-600'
                        return 'text-amber-600'
                      })()
                    }`} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('insuranceCoverageLabel')}</p>
                      <p className={`font-medium ${
                        (() => {
                          const hasVehicleIns = selectedVehicle.insuranceEligible && selectedVehicle.insuranceInfo?.useForRentals
                          const hasPartnerIns = partnerInsurance?.hasInsurance &&
                            partnerInsurance?.coversDuringRentals &&
                            partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id)
                          if (hasVehicleIns) return 'text-green-700 dark:text-green-300'
                          if (hasPartnerIns) return 'text-purple-700 dark:text-purple-300'
                          return 'text-amber-700 dark:text-amber-300'
                        })()
                      }`}>
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

            {/* Insurance Selection */}
            <div className="mb-6">
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
                {/* Vehicle Insurance Option - only show if vehicle has insurance */}
                {selectedVehicle?.insuranceEligible && selectedVehicle?.insuranceInfo?.useForRentals && (
                  <button
                    onClick={() => setInsuranceOption('vehicle')}
                    className={`w-full p-3 rounded-lg text-sm text-left transition-colors border-2 ${
                      insuranceOption === 'vehicle'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        insuranceOption === 'vehicle' ? 'border-blue-500' : 'border-gray-400'
                      }`}>
                        {insuranceOption === 'vehicle' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <span className="font-medium">{t('vehicleInsuranceOption')}</span>
                    </div>
                    <p className="text-xs opacity-75 ml-6 mt-1">
                      {t('coveredBy', { provider: selectedVehicle.insuranceInfo.provider || t('vehiclePolicy') })}
                    </p>
                  </button>
                )}

                {/* Partner Insurance Option - only show if partner has insurance that covers this vehicle */}
                {partnerInsurance?.hasInsurance &&
                 partnerInsurance?.coversDuringRentals &&
                 selectedVehicle &&
                 partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id) && (
                  <button
                    onClick={() => setInsuranceOption('partner')}
                    className={`w-full p-3 rounded-lg text-sm text-left transition-colors border-2 ${
                      insuranceOption === 'partner'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        insuranceOption === 'partner' ? 'border-purple-500' : 'border-gray-400'
                      }`}>
                        {insuranceOption === 'partner' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                      </div>
                      <span className="font-medium">{t('partnerInsuranceOption')}</span>
                    </div>
                    <p className="text-xs opacity-75 ml-6 mt-1">
                      {t('coveredByBusinessInsurance', { provider: partnerInsurance.insuranceProvider ? ` (${partnerInsurance.insuranceProvider})` : '' })}
                    </p>
                  </button>
                )}

                {/* Guest Provides Insurance */}
                <button
                  onClick={() => setInsuranceOption('guest')}
                  className={`w-full p-3 rounded-lg text-sm text-left transition-colors border-2 ${
                    insuranceOption === 'guest'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600 dark:text-green-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      insuranceOption === 'guest' ? 'border-green-500' : 'border-gray-400'
                    }`}>
                      {insuranceOption === 'guest' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                    </div>
                    <span className="font-medium">{t('guestProvidesInsuranceOption')}</span>
                  </div>
                  <p className="text-xs opacity-75 ml-6 mt-1">
                    {t('guestProvidesInsuranceDescription')}
                  </p>
                </button>

                {/* No Insurance - Warning */}
                <button
                  onClick={() => setInsuranceOption('none')}
                  className={`w-full p-3 rounded-lg text-sm text-left transition-colors border-2 ${
                    insuranceOption === 'none'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      insuranceOption === 'none' ? 'border-amber-500' : 'border-gray-400'
                    }`}>
                      {insuranceOption === 'none' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                    <span className="font-medium">{t('noInsuranceOption')}</span>
                  </div>
                  <p className="text-xs opacity-75 ml-6 mt-1">
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

            {/* Payment Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('paymentLabel')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentType('offline')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                    paymentType === 'offline'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <p className="font-medium">{t('offlinePayment')}</p>
                  <p className="text-xs opacity-75">{t('offlinePaymentDescription')}</p>
                </button>
                <button
                  onClick={() => setPaymentType('collect_later')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                    paymentType === 'collect_later'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <p className="font-medium">{t('collectLater')}</p>
                  <p className="text-xs opacity-75">{t('collectLaterDescription')}</p>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('priceBreakdownTitle')}</h3>
              {(() => {
                const breakdown = calculatePriceBreakdown()
                return (
                  <div className="space-y-2 text-sm">
                    {/* Rental */}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatCurrency(breakdown.dailyRate)} x {breakdown.days} {breakdown.days === 1 ? t('dayUnit') : t('daysUnit')}
                      </span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.rentalSubtotal)}</span>
                    </div>

                    {/* Delivery/Airport Fee */}
                    {breakdown.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {pickupType === 'airport' ? t('airportPickupFee') : t('deliveryFeeLabel')}
                        </span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.deliveryFee)}</span>
                      </div>
                    )}

                    {/* Service Fee */}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('serviceFee')}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.serviceFee)}</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2" />

                    {/* Taxes Header */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-500 text-xs font-medium uppercase">{t('taxesAndFees')}</span>
                    </div>

                    {/* State Tax */}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{t('arizonaStateTax')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.stateTax)}</span>
                    </div>

                    {/* County Tax */}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{t('maricopaCountyTax')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.countyTax)}</span>
                    </div>

                    {/* City Tax */}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{t('phoenixCityTax')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.cityTax)}</span>
                    </div>

                    {/* Rental Tax */}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{t('rentalSurcharge')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrency(breakdown.rentalTax)}</span>
                    </div>

                    {/* Total Taxes */}
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('totalTaxes')}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.totalTaxes)}</span>
                    </div>

                    {/* Total Divider */}
                    <div className="border-t-2 border-orange-200 dark:border-orange-800 my-2" />

                    {/* Grand Total */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-gray-900 dark:text-white text-base">{t('total')}</span>
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(breakdown.total)}
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Partner Payout Estimate */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                <IoWalletOutline className="w-5 h-5" />
                {t('estimatedPayoutTitle')}
              </h3>
              {(() => {
                const breakdown = calculatePriceBreakdown()
                const tierName = partnerTier?.tier || 'Standard'
                const commissionPercent = Math.round((breakdown.platformCommissionRate || 0.25) * 100)

                return (
                  <div className="space-y-2 text-sm">
                    {/* Tier Info */}
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

                    {/* Rental earnings */}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('rentalEarnings')}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(breakdown.rentalSubtotal)}</span>
                    </div>

                    {/* Delivery fee (if any) */}
                    {breakdown.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {pickupType === 'airport' ? t('airportFeeYouKeep') : t('deliveryFeeYouKeep')}
                        </span>
                        <span className="text-green-600 dark:text-green-400">+{formatCurrency(breakdown.deliveryFee)}</span>
                      </div>
                    )}

                    {/* Platform commission */}
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>{t('platformFee', { percent: commissionPercent })}</span>
                      <span>-{formatCurrency(breakdown.platformCommission)}</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-green-200 dark:border-green-700 my-2" />

                    {/* Your payout */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-800 dark:text-green-300">{t('yourPayout')}</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(breakdown.partnerPayout)}
                      </span>
                    </div>

                    {/* Platform earnings note */}
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
                )
              })()}
            </div>

            {/* Review sent success message */}
            {reviewSent && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 dark:text-green-300">{t('reviewSentTitle')}</h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {t('reviewSentDescription', { email: selectedCustomer?.email || '' })} <span className="font-mono font-semibold">{preBookingId?.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">{t('whatHappensNext')}</p>
                      <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                        <li>• {t('nextStep1')}</li>
                        <li>• {t('nextStep2')}</li>
                        <li>• {t('nextStep3')}</li>
                        <li>• {t('nextStep4')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Pre-review: Send for Review Button */}
              {!reviewSent && (
                <button
                  onClick={sendBookingReview}
                  disabled={sendingReview || loading}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {sendingReview ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      {t('sendingReview')}
                    </>
                  ) : (
                    <>
                      <IoMailOutline className="w-5 h-5" />
                      {t('sendToCustomerForReview')}
                    </>
                  )}
                </button>
              )}

              {/* Divider with "or" - only before review sent */}
              {!reviewSent && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('or')}</span>
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                </div>
              )}

              {/* Post-review: Action buttons */}
              {reviewSent ? (
                <div className="space-y-3">
                  {/* Primary: Confirm Booking Now */}
                  <button
                    onClick={createBooking}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        {t('confirming')}
                      </>
                    ) : (
                      <>
                        <IoCheckmarkOutline className="w-5 h-5" />
                        {t('confirmBookingNow')}
                      </>
                    )}
                  </button>

                  {/* Secondary actions */}
                  <div className="flex gap-3">
                    <Link
                      href="/partner/bookings"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-center"
                    >
                      {t('viewAllBookings')}
                    </Link>
                    <button
                      onClick={() => {
                        // Reset form for new booking
                        setSelectedCustomer(null)
                        setSelectedVehicle(null)
                        setStartDate('')
                        setEndDate('')
                        setPickupType('partner')
                        setPickupLocation('')
                        setSelectedAirport('')
                        setNotes('')
                        setPaymentType('offline')
                        setInsuranceOption('guest')
                        setReviewSent(false)
                        setPreBookingId(null)
                        setCurrentStep('customer')
                      }}
                      className="flex-1 px-4 py-3 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium flex items-center justify-center gap-2"
                    >
                      <IoAddOutline className="w-5 h-5" />
                      {t('newBooking')}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {t('preBookingSavedNote')}
                  </p>
                </div>
              ) : (
                <>
                  {/* Back and Create Booking buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep('dates')}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                    >
                      {t('back')}
                    </button>
                    <button
                      onClick={createBooking}
                      disabled={loading || sendingReview}
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
                          {t('createBookingDirectly')}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Help text */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {t('sendForReviewHelpText')}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* How This Works - Info Banner */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <IoInformationCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-0.5">{t('howSelfBookingWorksTitle')}</p>
              <ul className="space-y-0.5 text-blue-700 dark:text-blue-300">
                <li>• <strong>{t('infoPaymentLabel')}</strong> {t('infoPaymentDescription')}</li>
                <li>• <strong>{t('infoVerificationLabel')}</strong> {t('infoVerificationDescription')}</li>
                <li>• <strong>{t('infoVehiclesLabel')}</strong> {t('infoVehiclesDescription')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
