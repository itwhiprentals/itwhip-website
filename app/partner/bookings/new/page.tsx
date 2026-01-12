// app/partner/bookings/new/page.tsx
// Manual Booking Creation Wizard

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  IoMailOutline,
  IoTimeOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

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
  primaryPhotoUrl: string | null
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  vehicleType: string
  minTripDuration: number
  status: string
}

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

  const [currentStep, setCurrentStep] = useState<Step>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Customer selection
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' })

  // Vehicle selection
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'rideshare' | 'rental'>('all')

  // Date selection
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Booking details
  const [pickupType, setPickupType] = useState<'partner' | 'delivery' | 'airport'>('partner')
  const [pickupLocation, setPickupLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentType, setPaymentType] = useState<'offline' | 'collect_later'>('offline')

  // Verification
  const [sendingVerification, setSendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [skipVerification, setSkipVerification] = useState(false)

  // Load preselected customer
  useEffect(() => {
    if (preselectedCustomerId) {
      loadPreselectedCustomer(preselectedCustomerId)
    }
  }, [preselectedCustomerId])

  // Load vehicles on mount
  useEffect(() => {
    fetchVehicles()
  }, [])

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
        setVehicles(data.vehicles.filter((v: Vehicle) => v.status === 'AVAILABLE'))
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
    if (!newCustomer.name || !newCustomer.email) {
      setError('Name and email are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      })

      const data = await response.json()

      if (data.success) {
        setSelectedCustomer(data.customer)
        setShowNewCustomerForm(false)
        setNewCustomer({ name: '', email: '', phone: '' })
        setCurrentStep('vehicle')
      } else {
        setError(data.error || 'Failed to create customer')
      }
    } catch (err) {
      setError('Failed to create customer')
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
      setAvailability({ available: false, reason: 'Failed to check availability' })
    } finally {
      setCheckingAvailability(false)
    }
  }

  useEffect(() => {
    if (selectedVehicle && startDate && endDate) {
      checkAvailability()
    }
  }, [selectedVehicle, startDate, endDate])

  const calculateTotal = () => {
    if (!selectedVehicle || !availability?.tripDays) return 0

    const days = availability.tripDays
    const dailyRate = selectedVehicle.dailyRate
    const weeklyRate = selectedVehicle.weeklyRate || dailyRate * 6.5
    const monthlyRate = selectedVehicle.monthlyRate || dailyRate * 25

    if (days >= 28) {
      return monthlyRate * Math.floor(days / 28) + dailyRate * (days % 28)
    } else if (days >= 7) {
      return weeklyRate * Math.floor(days / 7) + dailyRate * (days % 7)
    }
    return dailyRate * days
  }

  const createBooking = async () => {
    if (!selectedCustomer || !selectedVehicle || !startDate || !endDate) {
      setError('Please complete all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
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
          paymentType
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/partner/bookings?created=${data.booking.id}`)
      } else {
        setError(data.error || 'Failed to create booking')
      }
    } catch (err) {
      setError('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
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
        setVerificationError(data.error || 'Failed to send verification')
      }
    } catch (err) {
      setVerificationError('Failed to send verification email')
    } finally {
      setSendingVerification(false)
    }
  }

  // Check if customer is verified
  const isCustomerVerified = selectedCustomer?.stripeIdentityStatus === 'verified'
  const isCustomerPendingVerification = selectedCustomer?.stripeIdentityStatus === 'pending'

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'customer', label: 'Customer', icon: <IoPersonOutline className="w-5 h-5" /> },
    { key: 'verify', label: 'Verify', icon: <IoShieldCheckmarkOutline className="w-5 h-5" /> },
    { key: 'vehicle', label: 'Vehicle', icon: <IoCarOutline className="w-5 h-5" /> },
    { key: 'dates', label: 'Dates', icon: <IoCalendarOutline className="w-5 h-5" /> },
    { key: 'confirm', label: 'Confirm', icon: <IoCheckmarkCircleOutline className="w-5 h-5" /> }
  ]

  const stepIndex = steps.findIndex(s => s.key === currentStep)

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Booking</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manually book a vehicle for a customer</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => {
                  if (index < stepIndex) setCurrentStep(step.key)
                }}
                disabled={index > stepIndex}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  index === stepIndex
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : index < stepIndex
                    ? 'text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {index < stepIndex ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                ) : (
                  step.icon
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <IoChevronForwardOutline className={`w-5 h-5 mx-2 ${
                  index < stepIndex ? 'text-green-400' : 'text-gray-300 dark:text-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
          <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Customer Selection */}
        {currentStep === 'customer' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Customer</h2>

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
                    placeholder="Search by name, email, or phone..."
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
                            Previous Customer
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
                    Create New Customer
                  </button>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">New Customer</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowNewCustomerForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createNewCustomer}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium"
                      >
                        {loading ? 'Creating...' : 'Create & Select'}
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
                Continue to Verification
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Step 2: Identity Verification */}
        {currentStep === 'verify' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Identity Verification</h2>

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
                    <p className="font-semibold text-green-700 dark:text-green-400">Identity Verified</p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {selectedCustomer?.stripeVerifiedFirstName} {selectedCustomer?.stripeVerifiedLastName}
                      {selectedCustomer?.stripeIdentityVerifiedAt && (
                        <> • Verified on {new Date(selectedCustomer.stripeIdentityVerifiedAt).toLocaleDateString()}</>
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
                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">Verification Pending</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                      Verification email sent. Waiting for customer to complete identity verification.
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
                      <p className="font-medium text-blue-700 dark:text-blue-400">Verify Customer Identity</p>
                      <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                        Send a secure verification link to the customer. They'll verify their identity using a government ID and selfie via Stripe Identity.
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
                      Sending Verification...
                    </>
                  ) : (
                    <>
                      <IoMailOutline className="w-5 h-5" />
                      Send Verification Email
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  or
                </div>

                {/* In-Person Verification Option */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <IoPersonOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300">In-Person Verification</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Customer can verify at your location using their phone or your device.
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
                  <span className="font-medium">Skip verification for now</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    You can verify the customer later. Note: Unverified customers may have restrictions.
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('customer')}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('vehicle')}
                disabled={!isCustomerVerified && !skipVerification && !verificationSent}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isCustomerVerified ? 'Continue to Vehicle' : 'Continue (Skip Verification)'}
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Vehicle Selection */}
        {currentStep === 'vehicle' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Vehicle</h2>

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
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {filteredVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {vehicle.primaryPhotoUrl ? (
                        <img src={vehicle.primaryPhotoUrl} alt="" className="w-full h-full object-cover" />
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
                        {formatCurrency(vehicle.dailyRate)}/day
                        {vehicle.vehicleType === 'RIDESHARE' && vehicle.weeklyRate && (
                          <> • {formatCurrency(vehicle.weeklyRate)}/week</>
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
                          Min {vehicle.minTripDuration} days
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
                No available vehicles found
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('verify')}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('dates')}
                disabled={!selectedVehicle}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                Continue to Dates
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Date Selection */}
        {currentStep === 'dates' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Dates</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Checking availability...</p>
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
                            Available - {availability.tripDays} days
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
                        Next available: {new Date(availability.nextAvailable).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Pickup Options */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pickup Type</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'partner', label: 'Partner Location' },
                  { key: 'delivery', label: 'Delivery' },
                  { key: 'airport', label: 'Airport' }
                ] as const).map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setPickupType(option.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pickupType === option.key
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-2 border-orange-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-transparent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {pickupType !== 'partner' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {pickupType === 'airport' ? 'Airport' : 'Delivery Address'}
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder={pickupType === 'airport' ? 'e.g., Phoenix Sky Harbor (PHX)' : 'Enter delivery address'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Special instructions or notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('vehicle')}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('confirm')}
                disabled={!availability?.available}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                Review Booking
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 'confirm' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review & Confirm</h2>

            {/* Summary */}
            <div className="space-y-4 mb-6">
              {/* Customer */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoPersonOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer?.email}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoCarOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rental Period</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{availability?.tripDays} days</p>
                  </div>
                </div>
              </div>

              {/* Pickup */}
              {pickupType !== 'partner' && pickupLocation && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IoLocationOutline className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {pickupType === 'airport' ? 'Airport Pickup' : 'Delivery'}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">{pickupLocation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentType('offline')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                    paymentType === 'offline'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <p className="font-medium">Offline Payment</p>
                  <p className="text-xs opacity-75">Cash or external payment</p>
                </button>
                <button
                  onClick={() => setPaymentType('collect_later')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                    paymentType === 'collect_later'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <p className="font-medium">Collect Later</p>
                  <p className="text-xs opacity-75">Charge customer later</p>
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('dates')}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Back
              </button>
              <button
                onClick={createBooking}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IoCheckmarkOutline className="w-5 h-5" />
                    Create Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
