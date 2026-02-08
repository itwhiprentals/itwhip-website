// app/partner/fleet/[id]/edit/page.tsx
// Partner Fleet - Edit Vehicle with Tab-based Layout
'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoChevronBack,
  IoSaveOutline,
  IoCarOutline,
  IoCarSportOutline,
  IoKeyOutline,
  IoImageOutline,
  IoPricetagOutline,
  IoSparklesOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoTrashOutline,
  IoStar,
  IoStarOutline,
  IoAddOutline,
  IoToggle,
  IoToggleOutline,
  IoShieldCheckmark,
  IoShieldOutline
} from 'react-icons/io5'
import { AddressAutocomplete, AddressResult } from '@/app/components/shared/AddressAutocomplete'
import { CAR_COLORS } from '@/app/host/cars/[id]/edit/types'
import { getVehicleFeatures, groupFeaturesByCategory } from '@/app/lib/data/vehicle-features'

interface PhotoItem {
  id: string
  url: string
  isHero: boolean
  order: number
}

interface VehicleData {
  id: string
  vin: string
  make: string
  model: string
  year: number
  trim: string | null
  color: string
  licensePlate: string | null
  doors: number
  seats: number
  transmission: string
  fuelType: string
  driveType: string | null
  carType: string
  currentMileage: number | null
  description: string | null
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number | null
  longitude: number | null
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  deliveryFee: number
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  isActive: boolean
  instantBook: boolean
  advanceNotice: number
  minTripDuration: number
  maxTripDuration: number
  features: string[]
  titleStatus: string
  photos: PhotoItem[]
  totalTrips: number
  rating: number
  vinVerifiedAt: string | null
  vinVerificationMethod: string | null
  hasActiveBooking: boolean
  vehicleType: 'RENTAL' | 'RIDESHARE'
  // Insurance fields
  insuranceEligible: boolean
  insuranceExpiryDate: string | null
  insuranceInfo: {
    hasOwnInsurance: boolean
    provider: string | null
    policyNumber: string | null
    useForRentals: boolean
  } | null
}

const TABS = [
  { id: 'details', label: 'Details', icon: IoCarOutline },
  { id: 'photos', label: 'Photos', icon: IoImageOutline },
  { id: 'pricing', label: 'Pricing', icon: IoPricetagOutline },
  { id: 'features', label: 'Features', icon: IoSparklesOutline },
  { id: 'insurance', label: 'Insurance', icon: IoShieldOutline },
  { id: 'availability', label: 'Availability', icon: IoCalendarOutline }
]

export default function PartnerFleetEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('details')
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [formData, setFormData] = useState<Partial<VehicleData>>({})
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/partner/fleet/${id}`)
        const data = await res.json()

        if (data.success) {
          setVehicle(data.vehicle)
          setFormData(data.vehicle)
          setPhotos(data.vehicle.photos || [])
        } else {
          setError(data.error || 'Failed to load vehicle')
        }
      } catch (err) {
        setError('Failed to load vehicle')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicle()
  }, [id])

  // Track changes
  useEffect(() => {
    if (vehicle) {
      const changed = JSON.stringify(formData) !== JSON.stringify(vehicle)
      setHasChanges(changed)
    }
  }, [formData, vehicle])

  // Handle input changes
  const handleChange = (field: keyof VehicleData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle address selection
  const handleAddressSelect = (address: AddressResult) => {
    setFormData(prev => ({
      ...prev,
      address: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      latitude: address.latitude,
      longitude: address.longitude
    }))
  }

  // Save changes
  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const res = await fetch(`/api/partner/fleet/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setSuccessMessage('Changes saved successfully')
        setVehicle({ ...vehicle, ...formData } as VehicleData)
        setHasChanges(false)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to save changes')
      }
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle active status
  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/partner/fleet/${id}/toggle-active`, {
        method: 'POST'
      })

      const data = await res.json()

      if (data.success) {
        setFormData(prev => ({ ...prev, isActive: data.isActive }))
        setVehicle(prev => prev ? { ...prev, isActive: data.isActive } : null)
        setSuccessMessage(data.message)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to toggle status')
      }
    } catch (err) {
      setError('Failed to toggle status')
    }
  }

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhoto(true)

    try {
      const uploadedUrls: { url: string; isHero: boolean }[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'vehicle-photo')

        const uploadRes = await fetch('/api/partner/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadRes.ok) {
          const data = await uploadRes.json()
          uploadedUrls.push({
            url: data.url,
            isHero: photos.length === 0 && i === 0
          })
        }
      }

      if (uploadedUrls.length > 0) {
        const res = await fetch(`/api/partner/fleet/${id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: uploadedUrls })
        })

        const data = await res.json()

        if (data.success) {
          setPhotos(data.photos)
        }
      }
    } catch (err) {
      console.error('Photo upload error:', err)
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  // Set hero photo
  const handleSetHero = async (photoId: string) => {
    try {
      const res = await fetch(`/api/partner/fleet/${id}/photos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })

      if (res.ok) {
        setPhotos(prev => prev.map(p => ({
          ...p,
          isHero: p.id === photoId
        })))
      }
    } catch (err) {
      console.error('Set hero error:', err)
    }
  }

  // Delete photo
  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/partner/fleet/${id}/photos/${photoId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        setPhotos(data.photos)
      }
    } catch (err) {
      console.error('Delete photo error:', err)
    }
  }

  // Handle feature toggle
  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.features || []
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature]
    handleChange('features', newFeatures)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoWarningOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link href="/partner/fleet" className="text-purple-600 hover:underline">
            Back to Fleet
          </Link>
        </div>
      </div>
    )
  }

  if (!vehicle) return null

  // Get auto-detected features based on vehicle
  const autoFeatures = getVehicleFeatures(
    formData.carType || 'SEDAN',
    formData.year || vehicle.year,
    formData.fuelType || vehicle.fuelType,
    formData.make || vehicle.make,
    formData.model || vehicle.model
  )
  const groupedFeatures = groupFeaturesByCategory(autoFeatures)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/partner/fleet" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <IoChevronBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.trim || 'Standard'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Active Toggle */}
              <button
                onClick={handleToggleActive}
                disabled={vehicle.hasActiveBooking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                } ${vehicle.hasActiveBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={vehicle.hasActiveBooking ? 'Cannot toggle while booking is active' : ''}
              >
                {formData.isActive ? (
                  <>
                    <IoToggle className="w-6 h-6" />
                    Active
                  </>
                ) : (
                  <>
                    <IoToggleOutline className="w-6 h-6" />
                    Inactive
                  </>
                )}
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IoSaveOutline className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      {error && vehicle && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <IoWarningOutline className="w-5 h-5 text-red-600" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* VIN Info (Locked) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IoShieldCheckmark className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">VIN Verified Details</h3>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  Locked
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">VIN</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Make</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Model</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.year}</p>
                </div>
              </div>
            </div>

            {/* Service Type - Rental vs Rideshare vs Driver */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Service Type</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose how this vehicle will be listed. This affects where it appears and booking requirements.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Rental Option */}
                <label
                  className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.vehicleType === 'RENTAL'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="vehicleType"
                    value="RENTAL"
                    checked={formData.vehicleType === 'RENTAL'}
                    onChange={(e) => {
                      handleChange('vehicleType', e.target.value)
                      handleChange('minTripDuration', 1) // Rentals allow 1-day minimum
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      formData.vehicleType === 'RENTAL'
                        ? 'bg-purple-100 dark:bg-purple-800'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <IoKeyOutline className={`w-6 h-6 ${
                        formData.vehicleType === 'RENTAL'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <span className={`font-semibold ${
                      formData.vehicleType === 'RENTAL'
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      Rental
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    For personal & business short-term rentals
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      Flexible 1+ day bookings
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      Listed on /rentals marketplace
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      Guest verification required
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      Mileage limits apply
                    </li>
                  </ul>
                  {formData.vehicleType === 'RENTAL' && (
                    <div className="absolute top-3 right-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                </label>

                {/* Rideshare Option */}
                <label
                  className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.vehicleType === 'RIDESHARE'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="vehicleType"
                    value="RIDESHARE"
                    checked={formData.vehicleType === 'RIDESHARE'}
                    onChange={(e) => {
                      handleChange('vehicleType', e.target.value)
                      handleChange('minTripDuration', 3) // Rideshare requires 3-day minimum
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      formData.vehicleType === 'RIDESHARE'
                        ? 'bg-orange-100 dark:bg-orange-800'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <IoCarSportOutline className={`w-6 h-6 ${
                        formData.vehicleType === 'RIDESHARE'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <span className={`font-semibold ${
                      formData.vehicleType === 'RIDESHARE'
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      Rideshare
                    </span>
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                      GIG
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    For Uber, Lyft, DoorDash drivers
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      Minimum 3-day rental
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      Listed on /rideshare/[your-slug]
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      Weekly & monthly rates
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      Unlimited mileage
                    </li>
                  </ul>
                  {formData.vehicleType === 'RIDESHARE' && (
                    <div className="absolute top-3 right-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    </div>
                  )}
                </label>

                {/* Driver/Chauffeur Option - Coming Soon */}
                <div
                  className="relative flex flex-col p-4 border-2 rounded-xl border-gray-200 dark:border-gray-600 opacity-60 cursor-not-allowed"
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 bg-gray-500 text-white text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <IoCarOutline className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="font-semibold text-gray-400">
                      Chauffeur
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Vehicle with professional driver
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Hourly & daily rates
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Driver assignment required
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Premium service offering
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Events & VIP transport
                    </li>
                  </ul>
                </div>
              </div>

              {/* Service Type Info Banner */}
              {formData.vehicleType === 'RIDESHARE' && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    <strong>Rideshare Mode:</strong> This vehicle will be listed for gig economy drivers with a 3-day minimum rental.
                    Weekly and monthly rates are emphasized. Mileage is unlimited.
                  </p>
                </div>
              )}
              {formData.vehicleType === 'RENTAL' && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>Rental Mode:</strong> This vehicle will be listed on the main /rentals marketplace.
                    Guest identity verification is required. Daily mileage limits apply with overage charges.
                  </p>
                </div>
              )}
            </div>

            {/* Editable Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <select
                    value={formData.color || ''}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                  >
                    {CAR_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate || ''}
                    onChange={(e) => handleChange('licensePlate', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Mileage
                  </label>
                  <input
                    type="number"
                    value={formData.currentMileage || ''}
                    onChange={(e) => handleChange('currentMileage', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  placeholder="Describe your vehicle..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Vehicle Location</h3>

              <AddressAutocomplete
                value={formData.address || ''}
                city={formData.city}
                state={formData.state}
                zipCode={formData.zipCode}
                onAddressSelect={handleAddressSelect}
              />

              {formData.city && formData.state && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Vehicle Photos</h3>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer flex items-center gap-2">
                <IoAddOutline className="w-5 h-5" />
                {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo count */}
            <div className={`mb-4 p-3 rounded-lg ${
              photos.length >= 3
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              <p className={`text-sm ${photos.length >= 3 ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                {photos.length < 3 && ` (${3 - photos.length} more recommended)`}
              </p>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <IoImageOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No photos uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group aspect-[4/3]">
                    <Image
                      src={photo.url}
                      alt="Vehicle"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleSetHero(photo.id)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg"
                        title="Set as main photo"
                      >
                        {photo.isHero ? (
                          <IoStar className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <IoStarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg"
                        title="Delete photo"
                      >
                        <IoTrashOutline className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                    {photo.isHero && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                        Main Photo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* Service Type Indicator */}
            <div className={`p-4 rounded-xl border-2 ${
              formData.vehicleType === 'RIDESHARE'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
            }`}>
              <div className="flex items-center gap-2">
                {formData.vehicleType === 'RIDESHARE' ? (
                  <IoCarSportOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                ) : (
                  <IoKeyOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
                <span className={`font-medium ${
                  formData.vehicleType === 'RIDESHARE'
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-purple-700 dark:text-purple-300'
                }`}>
                  {formData.vehicleType === 'RIDESHARE' ? 'Rideshare Pricing' : 'Rental Pricing'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                formData.vehicleType === 'RIDESHARE'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-purple-600 dark:text-purple-400'
              }`}>
                {formData.vehicleType === 'RIDESHARE'
                  ? 'Weekly and monthly rates are emphasized for gig drivers. Mileage is unlimited.'
                  : 'Daily rate is primary. Mileage limits and overage charges apply.'
                }
              </p>
            </div>

            {/* Rates Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rates</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Rate *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.dailyRate || ''}
                      onChange={(e) => handleChange('dailyRate', parseFloat(e.target.value) || 0)}
                      min="25"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.vehicleType === 'RIDESHARE' ? 'Base rate (3-day min)' : 'Starting from 1 day'}
                  </p>
                </div>

                <div className={formData.vehicleType === 'RIDESHARE' ? 'ring-2 ring-orange-300 dark:ring-orange-700 rounded-lg p-2 -m-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weekly Rate {formData.vehicleType === 'RIDESHARE' && <span className="text-orange-500">★</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.weeklyRate || ''}
                      onChange={(e) => handleChange('weeklyRate', parseFloat(e.target.value) || 0)}
                      placeholder={String(Math.round((formData.dailyRate || 0) * 6.5))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.vehicleType === 'RIDESHARE'
                      ? 'Popular for gig drivers'
                      : `Suggested: $${Math.round((formData.dailyRate || 0) * 6.5)}`}
                  </p>
                </div>

                <div className={formData.vehicleType === 'RIDESHARE' ? 'ring-2 ring-orange-300 dark:ring-orange-700 rounded-lg p-2 -m-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Rate {formData.vehicleType === 'RIDESHARE' && <span className="text-orange-500">★</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.monthlyRate || ''}
                      onChange={(e) => handleChange('monthlyRate', parseFloat(e.target.value) || 0)}
                      placeholder={String(Math.round((formData.dailyRate || 0) * 25))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.vehicleType === 'RIDESHARE'
                      ? 'Best value for drivers'
                      : `Suggested: $${Math.round((formData.dailyRate || 0) * 25)}`}
                  </p>
                </div>
              </div>

              {/* Mileage Policy - Only for Rentals */}
              {formData.vehicleType === 'RENTAL' && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Mileage Policy</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Included Miles per Day
                      </label>
                      <input
                        type="number"
                        value={(formData as any).includedMilesPerDay || 200}
                        onChange={(e) => handleChange('includedMilesPerDay' as any, parseInt(e.target.value) || 200)}
                        min="50"
                        max="500"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Standard: 200 miles/day</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Overage Rate (per mile)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={(formData as any).mileageOverageRate || 0.45}
                          onChange={(e) => handleChange('mileageOverageRate' as any, parseFloat(e.target.value) || 0.45)}
                          min="0.25"
                          max="1.00"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Standard: $0.45/mile</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Unlimited Mileage Badge - For Rideshare */}
              {formData.vehicleType === 'RIDESHARE' && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">Unlimited Mileage Included</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Rideshare rentals include unlimited miles - perfect for gig drivers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Options</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.airportPickup || false}
                    onChange={(e) => handleChange('airportPickup', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Airport Pickup Available</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hotelDelivery || false}
                    onChange={(e) => handleChange('hotelDelivery', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Hotel Delivery Available</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.homeDelivery || false}
                    onChange={(e) => handleChange('homeDelivery', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Home Delivery Available</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Fee
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.deliveryFee || 0}
                    onChange={(e) => handleChange('deliveryFee', parseFloat(e.target.value) || 0)}
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Vehicle Features</h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the features available on your vehicle.
            </p>

            <div className="space-y-6">
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {category === 'safety' ? 'Safety' :
                     category === 'comfort' ? 'Comfort & Interior' :
                     category === 'technology' ? 'Technology' : 'Utility'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categoryFeatures.map(feature => {
                      const isActive = (formData.features || []).includes(feature)
                      return (
                        <label
                          key={feature}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleFeature(feature)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className={`text-sm ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'}`}>
                            {feature}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insurance Tab */}
        {activeTab === 'insurance' && (
          <div className="space-y-6">
            {/* Insurance Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <IoShieldOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Vehicle Insurance</h3>
                  <p className="text-sm text-gray-500">Configure insurance coverage for this vehicle</p>
                </div>
              </div>

              {/* Has Own Insurance Toggle */}
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Vehicle Has Its Own Insurance</p>
                    <p className="text-sm text-gray-500">This vehicle has a commercial or rideshare insurance policy</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.insuranceInfo?.hasOwnInsurance || false}
                    onChange={(e) => {
                      const newValue = e.target.checked
                      handleChange('insuranceInfo', {
                        ...(formData.insuranceInfo || {}),
                        hasOwnInsurance: newValue,
                        useForRentals: newValue ? (formData.insuranceInfo?.useForRentals ?? true) : false
                      })
                      handleChange('hasOwnInsurance' as any, newValue)
                    }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                  />
                </label>

                {/* Insurance Details - Only show if has own insurance */}
                {formData.insuranceInfo?.hasOwnInsurance && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          value={formData.insuranceInfo?.provider || ''}
                          onChange={(e) => {
                            handleChange('insuranceInfo', {
                              ...(formData.insuranceInfo || {}),
                              provider: e.target.value
                            })
                            handleChange('insuranceProvider' as any, e.target.value)
                          }}
                          placeholder="e.g., State Farm, Progressive"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Policy Number
                        </label>
                        <input
                          type="text"
                          value={formData.insuranceInfo?.policyNumber || ''}
                          onChange={(e) => {
                            handleChange('insuranceInfo', {
                              ...(formData.insuranceInfo || {}),
                              policyNumber: e.target.value
                            })
                            handleChange('insurancePolicyNumber' as any, e.target.value)
                          }}
                          placeholder="Policy number"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Policy Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.insuranceExpiryDate?.split('T')[0] || ''}
                        onChange={(e) => handleChange('insuranceExpiryDate', e.target.value)}
                        className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Use for Rentals Toggle */}
                    <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Use This Insurance for Rentals</p>
                        <p className="text-sm text-gray-500">
                          Cover guests with this vehicle's insurance during rentals
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.insuranceInfo?.useForRentals || false}
                        onChange={(e) => {
                          handleChange('insuranceInfo', {
                            ...(formData.insuranceInfo || {}),
                            useForRentals: e.target.checked
                          })
                          handleChange('useForRentals' as any, e.target.checked)
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Insurance Status</h4>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Vehicle Insurance Status */}
                <div className={`p-4 rounded-lg ${
                  formData.insuranceInfo?.hasOwnInsurance && formData.insuranceInfo?.useForRentals
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {formData.insuranceInfo?.hasOwnInsurance && formData.insuranceInfo?.useForRentals ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <IoShieldOutline className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`font-medium ${
                      formData.insuranceInfo?.hasOwnInsurance && formData.insuranceInfo?.useForRentals
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Vehicle Coverage
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.insuranceInfo?.hasOwnInsurance && formData.insuranceInfo?.useForRentals
                      ? `Covered by ${formData.insuranceInfo?.provider || 'vehicle insurance'}`
                      : 'No vehicle insurance configured for rentals'
                    }
                  </p>
                </div>

                {/* Partner Insurance Status - Info */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <IoShieldCheckmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">Partner Insurance</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Configure partner-level insurance in{' '}
                    <Link href="/partner/insurance" className="underline hover:no-underline">
                      Insurance Settings
                    </Link>
                  </p>
                </div>
              </div>

              {/* Warning if no insurance configured */}
              {!formData.insuranceInfo?.hasOwnInsurance && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-300">No Vehicle Insurance</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                        Without vehicle-level insurance, guests will need to provide their own insurance or use the platform's guest insurance option during booking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Availability Settings</h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Instant Book</p>
                    <p className="text-sm text-gray-500">Guests can book without requesting approval</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.instantBook || false}
                    onChange={(e) => handleChange('instantBook', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                </label>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Advance Notice (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.advanceNotice || 2}
                      onChange={(e) => handleChange('advanceNotice', parseInt(e.target.value) || 2)}
                      min="0"
                      max="72"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Trip Duration (days)
                    </label>
                    <input
                      type="number"
                      value={formData.minTripDuration || 1}
                      onChange={(e) => handleChange('minTripDuration', parseInt(e.target.value) || 1)}
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Trip Duration (days)
                    </label>
                    <input
                      type="number"
                      value={formData.maxTripDuration || 30}
                      onChange={(e) => handleChange('maxTripDuration', parseInt(e.target.value) || 30)}
                      min="1"
                      max="90"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Vehicle Stats</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.totalTrips}</p>
                  <p className="text-sm text-gray-500">Total Trips</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.rating.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{photos.length}</p>
                  <p className="text-sm text-gray-500">Photos</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-sm text-gray-500">Status</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
