// app/host/cars/add/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import {
  IoArrowBackOutline,
  IoCarSportOutline,
  IoChevronDownOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoCarOutline,
  IoFlashOutline
} from 'react-icons/io5'
import {
  getAllMakes,
  getModelsByMake,
  getYears,
  getPopularMakes,
  getTrimsByModel,
  getModelSpec,
  requiresFuelTypeSelection,
  requiresTransmissionSelection,
  getFuelTypeOptions,
  getTransmissionOptions,
  CarSpec,
  FuelType
} from '@/app/lib/data/vehicles'

// Standard car colors
const CAR_COLORS = [
  { value: 'Black', label: 'Black' },
  { value: 'White', label: 'White' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Gray', label: 'Gray' },
  { value: 'Red', label: 'Red' },
  { value: 'Blue', label: 'Blue' },
  { value: 'Navy', label: 'Navy Blue' },
  { value: 'Brown', label: 'Brown' },
  { value: 'Beige', label: 'Beige' },
  { value: 'Green', label: 'Green' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Orange', label: 'Orange' },
  { value: 'Yellow', label: 'Yellow' },
  { value: 'Purple', label: 'Purple' },
  { value: 'Burgundy', label: 'Burgundy' },
  { value: 'Champagne', label: 'Champagne' },
  { value: 'Pearl White', label: 'Pearl White' },
  { value: 'Midnight Blue', label: 'Midnight Blue' },
  { value: 'Other', label: 'Other' }
]

export default function AddCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Access control states
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [canAccess, setCanAccess] = useState(false)
  const [accessDeniedReason, setAccessDeniedReason] = useState<'pending' | 'rejected' | null>(null)
  const [isFleetPartner, setIsFleetPartner] = useState(false)

  // Form data - simplified to just basics + conditional specs
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    trim: '',
    vehicleType: 'RENTAL' as 'RENTAL' | 'RIDESHARE',
    // Conditional fields (only shown when needed)
    transmission: '' as 'automatic' | 'manual' | '',
    fuelType: '' as FuelType | ''
  })

  // Auto-filled specs from database (displayed but not editable)
  const [autoSpecs, setAutoSpecs] = useState<CarSpec | null>(null)

  // Available options
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [availableTrims, setAvailableTrims] = useState<string[]>([])
  const allMakes = getAllMakes()
  const popularMakes = getPopularMakes()
  const years = getYears()

  // Conditional field requirements
  const needsFuelType = formData.make && formData.model && requiresFuelTypeSelection(formData.make, formData.model)
  const needsTransmission = formData.make && formData.model && requiresTransmissionSelection(formData.make, formData.model)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if host can access this page
  // Only APPROVED hosts can add additional vehicles
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Fetch host profile to check approval status
        const profileRes = await fetch('/api/host/profile', {
          credentials: 'include'
        })

        if (!profileRes.ok) {
          // Not logged in or error - redirect to dashboard
          router.push('/host/dashboard')
          return
        }

        const profileData = await profileRes.json()
        const profile = profileData.profile || profileData
        const approvalStatus = profile.approvalStatus

        // Only APPROVED hosts can add additional cars
        if (approvalStatus === 'APPROVED') {
          setCanAccess(true)
          // Check if host is a fleet partner (can add rideshare vehicles)
          const hostType = profile.hostType
          if (hostType === 'FLEET_PARTNER' || hostType === 'PARTNER') {
            setIsFleetPartner(true)
          }
          setCheckingAccess(false)
          return
        }

        // PENDING or NEEDS_ATTENTION hosts should complete their first car first
        if (approvalStatus === 'PENDING' || approvalStatus === 'NEEDS_ATTENTION') {
          // Fetch their existing cars to redirect to edit
          const carsRes = await fetch(`/api/host/cars?hostId=${profile.id}`, {
            credentials: 'include'
          })

          if (carsRes.ok) {
            const carsData = await carsRes.json()
            const cars = carsData.cars || carsData.data || []

            if (cars.length > 0) {
              // Redirect to edit their first car
              console.log('[AddCarPage] PENDING host has car, redirecting to edit:', cars[0].id)
              router.push(`/host/cars/${cars[0].id}/edit`)
              return
            }
          }

          // Show "pending" message - they need to complete signup first
          setAccessDeniedReason('pending')
          setCheckingAccess(false)
          return
        }

        // REJECTED hosts cannot add cars
        if (approvalStatus === 'REJECTED' || approvalStatus === 'DECLINED') {
          setAccessDeniedReason('rejected')
          setCheckingAccess(false)
          return
        }

        // Unknown status - redirect to dashboard
        router.push('/host/dashboard')
      } catch (error) {
        console.error('Error checking access:', error)
        router.push('/host/dashboard')
      }
    }

    checkAccess()
  }, [router])

  // Update available models when make changes
  useEffect(() => {
    if (formData.make) {
      const models = getModelsByMake(formData.make)
      setAvailableModels(models)
      // Reset model if current model not in new make's models
      if (!models.includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: '', trim: '', transmission: '', fuelType: '' }))
        setAvailableTrims([])
        setAutoSpecs(null)
      }
    } else {
      setAvailableModels([])
      setAvailableTrims([])
      setAutoSpecs(null)
    }
  }, [formData.make])

  // Update trims and auto-specs when model changes
  useEffect(() => {
    if (formData.make && formData.model) {
      // Get trims for this model
      const trims = getTrimsByModel(formData.make, formData.model)
      setAvailableTrims(trims)

      // Get auto-filled specs
      const spec = getModelSpec(formData.make, formData.model)
      setAutoSpecs(spec)

      // Reset conditional fields when model changes
      setFormData(prev => ({ ...prev, trim: '', transmission: '', fuelType: '' }))
    } else {
      setAvailableTrims([])
      setAutoSpecs(null)
    }
  }, [formData.make, formData.model])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.make) newErrors.make = 'Please select a make'
    if (!formData.model) newErrors.model = 'Please select a model'
    if (!formData.year) newErrors.year = 'Please select a year'
    if (!formData.color) newErrors.color = 'Please select a color'

    // Validate conditional fields
    if (needsTransmission && !formData.transmission) {
      newErrors.transmission = 'Please select a transmission type'
    }
    if (needsFuelType && !formData.fuelType) {
      newErrors.fuelType = 'Please select a fuel type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Determine final transmission and fuel type
      // Use user selection if required, otherwise use spec defaults
      const finalTransmission = needsTransmission
        ? formData.transmission
        : autoSpecs?.transmission === 'both'
          ? 'automatic' // Default to automatic if somehow both
          : autoSpecs?.transmission || 'automatic'

      const finalFuelType = needsFuelType
        ? formData.fuelType
        : (autoSpecs?.fuelType && !autoSpecs.fuelType.includes('/'))
          ? autoSpecs.fuelType as FuelType
          : 'gas'

      const response = await fetch('/api/host/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          color: formData.color,
          trim: formData.trim || undefined,
          vehicleType: formData.vehicleType,
          // Auto-filled specs from database
          seats: autoSpecs?.seats || 5,
          doors: autoSpecs?.doors || 4,
          transmission: finalTransmission,
          carType: autoSpecs?.carType || 'sedan',
          fuelType: finalFuelType,
          // Set defaults for required fields
          dailyRate: 0,
          isActive: false
        })
      })

      if (response.ok) {
        const data = await response.json()
        const carId = data.car?.id || data.id
        if (carId) {
          // Redirect to edit page to complete the listing
          router.push(`/host/cars/${carId}/edit`)
        } else {
          router.push('/host/cars')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add car')
      }
    } catch (err) {
      console.error('Error adding car:', err)
      setError('Failed to add car. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while checking access
  if (checkingAccess) {
    return (
      <>
        <Header />
        <main className="pt-16">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Show access denied message for PENDING hosts
  if (accessDeniedReason === 'pending') {
    return (
      <>
        <Header />
        <main className="pt-16">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoWarningOutline className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Complete Your Application First
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to complete your host application before adding additional vehicles.
                Please finish setting up your profile and first vehicle listing.
              </p>
              <Link
                href="/host/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Show access denied message for REJECTED hosts
  if (accessDeniedReason === 'rejected') {
    return (
      <>
        <Header />
        <main className="pt-16">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoWarningOutline className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to Add Vehicles
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your host application was not approved. Please contact support if you believe this is an error.
              </p>
              <Link
                href="/host/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Don't render form if access denied (redirect is in progress)
  if (!canAccess) {
    return (
      <>
        <Header />
        <main className="pt-16">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-8">
              <Link
                href="/host/cars"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
              >
                <IoArrowBackOutline className="w-5 h-5" />
                Back to Cars
              </Link>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <IoCarSportOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Vehicle</h1>
                  <p className="text-gray-600 dark:text-gray-400">Enter your vehicle details to get started</p>
                </div>
              </div>
            </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Make */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Make <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.make ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select make</option>
                  <optgroup label="Popular Makes">
                    {popularMakes.map(make => (
                      <option key={`popular-${make}`} value={make}>{make}</option>
                    ))}
                  </optgroup>
                  <optgroup label="All Makes">
                    {allMakes.filter(m => !popularMakes.includes(m)).map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </optgroup>
                </select>
                <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.make && <p className="mt-1 text-sm text-red-500">{errors.make}</p>}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Model <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  disabled={!formData.make}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">{formData.make ? 'Select model' : 'Select make first'}</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model}</p>}
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select year</option>
                  {years.map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
                <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year}</p>}
            </div>

            {/* Trim - show dropdown if trims available, otherwise text input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Trim <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              {availableTrims.length > 0 ? (
                <div className="relative">
                  <select
                    value={formData.trim}
                    onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                    disabled={!formData.model}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select trim (optional)</option>
                    {availableTrims.map(trim => (
                      <option key={trim} value={trim}>{trim}</option>
                    ))}
                  </select>
                  <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  value={formData.trim}
                  onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                  placeholder={formData.model ? "Enter trim (e.g., LE, XLE, Sport)" : "Select model first"}
                  disabled={!formData.model}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Color <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select color</option>
                  {CAR_COLORS.map(color => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>
                <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.color && <p className="mt-1 text-sm text-red-500">{errors.color}</p>}
            </div>

            {/* Vehicle Type (only shown for fleet partners) */}
            {isFleetPartner && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Listing Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vehicleType: 'RENTAL' })}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      formData.vehicleType === 'RENTAL'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <IoCarOutline className={`w-6 h-6 ${formData.vehicleType === 'RENTAL' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.vehicleType === 'RENTAL' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Rental
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      1+ day min
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vehicleType: 'RIDESHARE' })}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      formData.vehicleType === 'RIDESHARE'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <IoFlashOutline className={`w-6 h-6 ${formData.vehicleType === 'RIDESHARE' ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.vehicleType === 'RIDESHARE' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Rideshare
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      3+ day min
                    </span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {formData.vehicleType === 'RIDESHARE'
                    ? 'Rideshare vehicles appear on the rideshare page with 3-day minimum bookings.'
                    : 'Rental vehicles appear on the main rentals page with 1-day minimum bookings.'}
                </p>
              </div>
            )}

            {/* Conditional: Transmission (only shown when model has 'both' options) */}
            {needsTransmission && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Transmission <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value as 'automatic' | 'manual' })}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.transmission ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select transmission</option>
                    {getTransmissionOptions(formData.make, formData.model).map(option => (
                      <option key={option} value={option}>
                        {option === 'automatic' ? 'Automatic' : 'Manual'}
                      </option>
                    ))}
                  </select>
                  <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.transmission && <p className="mt-1 text-sm text-red-500">{errors.transmission}</p>}
              </div>
            )}

            {/* Conditional: Fuel Type (only shown when model has multiple fuel options) */}
            {needsFuelType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.fuelType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select fuel type</option>
                    {getFuelTypeOptions(formData.make, formData.model).map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.fuelType && <p className="mt-1 text-sm text-red-500">{errors.fuelType}</p>}
              </div>
            )}
          </div>

          {/* Auto-filled specs display (only show when model is selected) */}
          {autoSpecs && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                Auto-filled Vehicle Specs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="ml-1 text-gray-900 dark:text-white capitalize">{autoSpecs.carType}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Seats:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{autoSpecs.seats}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Doors:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{autoSpecs.doors}</span>
                </div>
                {!needsTransmission && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Trans:</span>
                    <span className="ml-1 text-gray-900 dark:text-white capitalize">{autoSpecs.transmission}</span>
                  </div>
                )}
                {!needsFuelType && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Fuel:</span>
                    <span className="ml-1 text-gray-900 dark:text-white capitalize">{autoSpecs.fuelType}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              After adding your vehicle, you&apos;ll be taken to complete your listing with photos, pricing, and other details.
            </p>
          </div>

            {/* Submit button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding Vehicle...
                  </>
                ) : (
                  'Continue to Complete Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </>
  )
}
