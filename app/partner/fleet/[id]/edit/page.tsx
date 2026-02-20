// app/partner/fleet/[id]/edit/page.tsx
// Partner Fleet - Edit Vehicle with Tab-based Layout
'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  IoShieldOutline,
  IoDocumentTextOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import { useTranslations } from 'next-intl'
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
  rules: string | null
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
  { id: 'guidelines', label: 'Guidelines', icon: IoDocumentTextOutline },
  { id: 'insurance', label: 'Insurance', icon: IoShieldOutline },
  { id: 'availability', label: 'Availability', icon: IoCalendarOutline }
]

export default function PartnerFleetEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('PartnerVehicleEdit')

  const tabFromUrl = searchParams.get('tab')
  const validTabs = TABS.map(t => t.id)
  const [activeTab, setActiveTab] = useState(tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'details')
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
          // Ensure only one hero photo (fix any DB inconsistency)
          const rawPhotos: PhotoItem[] = data.vehicle.photos || []
          let foundHero = false
          const cleanedPhotos = rawPhotos.map(p => {
            if (p.isHero && !foundHero) {
              foundHero = true
              return p
            }
            return { ...p, isHero: false }
          })
          setPhotos(cleanedPhotos)
        } else {
          setError(data.error || t('failedToLoadVehicle'))
        }
      } catch (err) {
        setError(t('failedToLoadVehicle'))
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
        setSuccessMessage(t('changesSavedSuccessfully'))
        setVehicle({ ...vehicle, ...formData } as VehicleData)
        setHasChanges(false)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || t('failedToSaveChanges'))
      }
    } catch (err) {
      setError(t('failedToSaveChanges'))
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
        setError(data.error || t('failedToToggleStatus'))
      }
    } catch (err) {
      setError(t('failedToToggleStatus'))
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
        if (vehicle) {
          formData.append('vehicleName', `${vehicle.year} ${vehicle.make} ${vehicle.model}`)
        }

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

  // Set hero photo (also moves it to first position)
  const handleSetHero = async (photoId: string) => {
    try {
      const res = await fetch(`/api/partner/fleet/${id}/photos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })

      const data = await res.json()
      if (data.success && data.photos) {
        setPhotos(data.photos)
      }
    } catch (err) {
      console.error('Set hero error:', err)
    }
  }

  // Move photo left or right
  const handleMovePhoto = async (photoId: string, direction: 'left' | 'right') => {
    try {
      const res = await fetch(`/api/partner/fleet/${id}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, direction })
      })

      const data = await res.json()
      if (data.success && data.photos) {
        setPhotos(data.photos)
      }
    } catch (err) {
      console.error('Move photo error:', err)
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
            {t('backToFleet')}
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
                  {vehicle.year} {vehicle.make}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.model}</p>
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
                title={vehicle.hasActiveBooking ? t('cannotToggle') : ''}
              >
                {formData.isActive ? (
                  <>
                    <IoToggle className="w-6 h-6" />
                    {t('active')}
                  </>
                ) : (
                  <>
                    <IoToggleOutline className="w-6 h-6" />
                    {t('inactive')}
                  </>
                )}
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <IoSaveOutline className="w-5 h-5" />
                    Save
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
                {t(`tab_${tab.id}`)}
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('vinVerifiedDetails')}</h3>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {t('locked')}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t('vin')}</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('make')}</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('model')}</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('year')}</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.year}</p>
                </div>
              </div>
            </div>

            {/* Service Type - Rental vs Rideshare vs Driver */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('serviceType')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('serviceTypeDescription')}
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
                      {t('rental')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t('rentalDescription')}
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      {t('rentalBullet1')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      {t('rentalBullet2')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      {t('rentalBullet3')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-500 rounded-full" />
                      {t('rentalBullet4')}
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
                      {t('rideshare')}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                      {t('gig')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t('rideshareDescription')}
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      {t('rideshareBullet1')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      {t('rideshareBullet2')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      {t('rideshareBullet3')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-orange-500 rounded-full" />
                      {t('rideshareBullet4')}
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
                      {t('comingSoon')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <IoCarOutline className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="font-semibold text-gray-400">
                      {t('chauffeur')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    {t('chauffeurDescription')}
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {t('chauffeurBullet1')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {t('chauffeurBullet2')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {t('chauffeurBullet3')}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {t('chauffeurBullet4')}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Service Type Info Banner */}
              {formData.vehicleType === 'RIDESHARE' && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    <strong>{t('rideshareModeBannerTitle')}</strong> {t('rideshareModeBannerText')}
                  </p>
                </div>
              )}
              {formData.vehicleType === 'RENTAL' && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>{t('rentalModeBannerTitle')}</strong> {t('rentalModeBannerText')}
                  </p>
                </div>
              )}
            </div>

            {/* Editable Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('vehicleDetails')}</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('color')}
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
                    {t('licensePlate')}
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
                    {t('currentMileage')}
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
                  {t('description')}
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('vehicleLocation')}</h3>

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
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('vehiclePhotos')}</h3>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer flex items-center gap-2">
                <IoAddOutline className="w-5 h-5" />
                {uploadingPhoto ? t('uploading') : t('addPhotos')}
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
                {t('photosUploaded', { count: photos.length })}
                {photos.length < 3 && ` (${t('moreRecommended', { count: 3 - photos.length })})`}
              </p>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <IoImageOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">{t('noPhotosYet')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className={`relative group aspect-[4/3] ${photo.isHero ? 'ring-2 ring-yellow-400 rounded-lg' : ''}`}>
                    <Image
                      src={photo.url}
                      alt={t('vehiclePhotoAlt')}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {/* Top controls — star + delete */}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!photo.isHero && (
                        <button
                          onClick={() => handleSetHero(photo.id)}
                          className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm"
                          title={t('setAsMainPhoto')}
                        >
                          <IoStarOutline className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm"
                        title={t('deletePhoto')}
                      >
                        <IoTrashOutline className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    {/* Move arrows */}
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          onClick={() => handleMovePhoto(photo.id, 'left')}
                          className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm"
                          title="Move left"
                        >
                          <IoChevronBackOutline className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                      )}
                      {index < photos.length - 1 && (
                        <button
                          onClick={() => handleMovePhoto(photo.id, 'right')}
                          className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm"
                          title="Move right"
                        >
                          <IoChevronForwardOutline className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                      )}
                    </div>
                    {/* Main photo badge */}
                    {photo.isHero && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded flex items-center gap-1">
                        <IoStar className="w-3 h-3" />
                        Main
                      </div>
                    )}
                    {/* Position number */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
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
                  {formData.vehicleType === 'RIDESHARE' ? t('ridesharePricing') : t('rentalPricing')}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                formData.vehicleType === 'RIDESHARE'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-purple-600 dark:text-purple-400'
              }`}>
                {formData.vehicleType === 'RIDESHARE'
                  ? t('ridesharePricingDescription')
                  : t('rentalPricingDescription')
                }
              </p>
            </div>

            {/* Rates Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('rates')}</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('dailyRate')}
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
                    {formData.vehicleType === 'RIDESHARE' ? t('baseRate3DayMin') : t('startingFrom1Day')}
                  </p>
                </div>

                <div className={formData.vehicleType === 'RIDESHARE' ? 'ring-2 ring-orange-300 dark:ring-orange-700 rounded-lg p-2 -m-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('weeklyRate')} {formData.vehicleType === 'RIDESHARE' && <span className="text-orange-500">★</span>}
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
                      ? t('popularForGigDrivers')
                      : t('suggestedPrice', { price: Math.round((formData.dailyRate || 0) * 6.5) })}
                  </p>
                </div>

                <div className={formData.vehicleType === 'RIDESHARE' ? 'ring-2 ring-orange-300 dark:ring-orange-700 rounded-lg p-2 -m-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('monthlyRate')} {formData.vehicleType === 'RIDESHARE' && <span className="text-orange-500">★</span>}
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
                      ? t('bestValueForDrivers')
                      : t('suggestedPrice', { price: Math.round((formData.dailyRate || 0) * 25) })}
                  </p>
                </div>
              </div>

              {/* Mileage Policy */}
              {(() => {
                // Check if "Unlimited mileage" is in the rules
                let currentRules: string[] = []
                try {
                  const parsed = JSON.parse(formData.rules || '[]')
                  if (Array.isArray(parsed)) currentRules = parsed
                } catch {}
                const isUnlimited = formData.vehicleType === 'RIDESHARE' || currentRules.includes('Unlimited mileage')

                const toggleUnlimited = (checked: boolean) => {
                  const updated = currentRules.filter(r => r !== 'Unlimited mileage')
                  if (checked) {
                    updated.push('Unlimited mileage')
                    // Clear mileage fields when unlimited
                    handleChange('includedMilesPerDay' as any, null)
                    handleChange('mileageOverageRate' as any, null)
                  }
                  handleChange('rules', updated.length > 0 ? JSON.stringify(updated) : null)
                }

                return (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">{t('mileagePolicy')}</h4>

                    {/* Unlimited Mileage Toggle */}
                    <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-4">
                      <input
                        type="checkbox"
                        checked={isUnlimited}
                        onChange={(e) => toggleUnlimited(e.target.checked)}
                        disabled={formData.vehicleType === 'RIDESHARE'}
                        className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:focus:ring-white"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Unlimited mileage</span>
                        {formData.vehicleType === 'RIDESHARE' && (
                          <p className="text-xs text-green-600 dark:text-green-400">Always enabled for rideshare vehicles</p>
                        )}
                      </div>
                    </label>

                    {/* Miles/Day + Overage - only when NOT unlimited */}
                    {!isUnlimited && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('includedMilesPerDay')}
                          </label>
                          <input
                            type="number"
                            value={(formData as any).includedMilesPerDay || 200}
                            onChange={(e) => handleChange('includedMilesPerDay' as any, parseInt(e.target.value) || 200)}
                            min="50"
                            max="500"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">{t('standardMilesPerDay')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('overageRate')}
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
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{t('standardOverageRate')}</p>
                        </div>
                      </div>
                    )}

                    {/* Unlimited badge when checked */}
                    {isUnlimited && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-300">{t('unlimitedMileageIncluded')}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {t('unlimitedMileageDescription')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Delivery Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('deliveryOptions')}</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.airportPickup || false}
                    onChange={(e) => handleChange('airportPickup', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('airportPickupAvailable')}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hotelDelivery || false}
                    onChange={(e) => handleChange('hotelDelivery', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('hotelDeliveryAvailable')}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.homeDelivery || false}
                    onChange={(e) => handleChange('homeDelivery', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('homeDeliveryAvailable')}</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('deliveryFee')}
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('vehicleFeatures')}</h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('selectFeatures')}
            </p>

            <div className="space-y-6">
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {category === 'safety' ? t('categorySafety') :
                     category === 'comfort' ? t('categoryComfort') :
                     category === 'technology' ? t('categoryTechnology') : t('categoryUtility')}
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

        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (() => {
          // Parse existing rules into a set for checkbox state
          let existingRules: string[] = []
          try {
            const parsed = JSON.parse(formData.rules || '[]')
            if (Array.isArray(parsed)) existingRules = parsed
          } catch {}

          const PRESET_RULES = [
            'No smoking',
            'No pets allowed',
            'No off-road driving',
            'No racing or track use',
            'No towing or hauling',
            'No modifications or alterations',
            'No international travel',
            'No subleasing or lending to others',
            'Valid driver\'s license and insurance required',
            'Vehicle must be returned clean',
            'Report any damage immediately',
            'Fuel must be returned at same level'
          ]

          const AGE_OPTIONS = [
            { value: 0, label: 'No age requirement' },
            { value: 21, label: 'Must be 21+ to book' },
            { value: 25, label: 'Must be 25+ to book' },
            { value: 30, label: 'Must be 30+ to book' }
          ]

          // Extract current age rule
          const currentAgeRule = existingRules.find(r => /^Must be \d+\+ to book$/.test(r))
          const currentAge = currentAgeRule ? parseInt(currentAgeRule.match(/\d+/)?.[0] || '0') : 0

          // Extract cleaning fee
          const cleaningFeeRule = existingRules.find(r => /cleaning fee/i.test(r))
          const cleaningFee = cleaningFeeRule ? parseInt(cleaningFeeRule.match(/\$(\d+)/)?.[1] || '0') : 0

          // Extract late return fee
          const lateFeeRule = existingRules.find(r => /late return fee/i.test(r))
          const lateFee = lateFeeRule ? parseInt(lateFeeRule.match(/\$(\d+)/)?.[1] || '0') : 0

          // Rebuild rules array from current selections
          const rebuildRules = (updates: {
            presets?: Record<string, boolean>
            age?: number
            cleaning?: number
            lateReturn?: number
          }) => {
            const rules: string[] = []

            // Preset checkboxes
            for (const rule of PRESET_RULES) {
              const isChecked = updates.presets !== undefined
                ? updates.presets[rule] ?? existingRules.includes(rule)
                : existingRules.includes(rule)
              if (isChecked) rules.push(rule)
            }

            // Preserve "Unlimited mileage" if it exists (managed from Pricing tab)
            if (existingRules.includes('Unlimited mileage')) {
              rules.push('Unlimited mileage')
            }

            // Age rule
            const ageVal = updates.age !== undefined ? updates.age : currentAge
            if (ageVal > 0) rules.push(`Must be ${ageVal}+ to book`)

            // Cleaning fee
            const cleanVal = updates.cleaning !== undefined ? updates.cleaning : cleaningFee
            if (cleanVal > 0) rules.push(`$${cleanVal} cleaning fee for excessive mess`)

            // Late return fee
            const lateVal = updates.lateReturn !== undefined ? updates.lateReturn : lateFee
            if (lateVal > 0) rules.push(`$${lateVal}/hour late return fee`)

            handleChange('rules', rules.length > 0 ? JSON.stringify(rules) : null)
          }

          return (
          <div className="space-y-6">
            {/* Preset Rules */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Rental Rules</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select the rules that apply to your vehicle.
              </p>

              <div className="space-y-3">
                {PRESET_RULES.map(rule => (
                  <label key={rule} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={existingRules.includes(rule)}
                      onChange={(e) => rebuildRules({ presets: { [rule]: e.target.checked } })}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black dark:focus:ring-white"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{rule}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age & Fees */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Age & Fees</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Set minimum age and fee policies.
              </p>

              <div className="space-y-4">
                {/* Minimum Age Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Driver Age
                  </label>
                  <select
                    value={currentAge}
                    onChange={(e) => rebuildRules({ age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {AGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Cleaning Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cleaning Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={cleaningFee || ''}
                      onChange={(e) => rebuildRules({ cleaning: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">For excessive mess</p>
                  </div>

                  {/* Late Return Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Late Return Fee ($/hr)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={lateFee || ''}
                      onChange={(e) => rebuildRules({ lateReturn: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Per hour late</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              These rules are shown to guests before booking as a checklist on your listing.
            </p>
          </div>
          )
        })()}

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
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('vehicleInsurance')}</h3>
                  <p className="text-sm text-gray-500">{t('configureInsurance')}</p>
                </div>
              </div>

              {/* Has Own Insurance Toggle */}
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('vehicleHasOwnInsurance')}</p>
                    <p className="text-sm text-gray-500">{t('vehicleHasOwnInsuranceDescription')}</p>
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
                          {t('insuranceProvider')}
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
                          placeholder={t('insuranceProviderPlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('policyNumber')}
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
                          placeholder={t('policyNumberPlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('policyExpiryDate')}
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
                        <p className="font-medium text-gray-900 dark:text-white">{t('useInsuranceForRentals')}</p>
                        <p className="text-sm text-gray-500">
                          {t('useInsuranceForRentalsDescription')}
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
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('insuranceStatus')}</h4>

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
                      {t('vehicleCoverage')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.insuranceInfo?.hasOwnInsurance && formData.insuranceInfo?.useForRentals
                      ? t('coveredBy', { provider: formData.insuranceInfo?.provider || t('vehicleInsuranceFallback') })
                      : t('noVehicleInsuranceConfigured')
                    }
                  </p>
                </div>

                {/* Partner Insurance Status - Info */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <IoShieldCheckmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">{t('partnerInsurance')}</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {t('configurePartnerInsurance')}{' '}
                    <Link href="/partner/insurance" className="underline hover:no-underline">
                      {t('insuranceSettings')}
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
                      <p className="font-medium text-amber-700 dark:text-amber-300">{t('noVehicleInsurance')}</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                        {t('noVehicleInsuranceWarning')}
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('availabilitySettings')}</h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('instantBook')}</p>
                    <p className="text-sm text-gray-500">{t('instantBookDescription')}</p>
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
                      {t('advanceNotice')}
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
                      {t('minTripDuration')}
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
                      {t('maxTripDuration')}
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('vehicleStats')}</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.totalTrips}</p>
                  <p className="text-sm text-gray-500">{t('totalTrips')}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.rating.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">{t('rating')}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{photos.length}</p>
                  <p className="text-sm text-gray-500">{t('photos')}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.isActive ? t('active') : t('inactive')}
                  </p>
                  <p className="text-sm text-gray-500">{t('status')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
