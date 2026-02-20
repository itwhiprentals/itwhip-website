// app/partner/fleet/[id]/page.tsx
// Partner Fleet - Vehicle Detail Page
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoChevronBack,
  IoCreateOutline,
  IoCarOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoStar,
  IoToggle,
  IoToggleOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoShieldCheckmark,
  IoFlash,
  IoLeaf,
  IoCalendarOutline,
  IoCashOutline,
  IoShareSocialOutline,
  IoCopyOutline,
  IoOpenOutline,
  IoSettingsOutline,
  IoBusinessOutline,
  IoInformationCircleOutline,
  IoStarOutline
} from 'react-icons/io5'

// Import components
import HostAssignmentSection from './components/HostAssignmentSection'
import InviteHostModal from './components/InviteHostModal'
import PricingSection from './components/PricingSection'
import RentalGuidelinesCard from './components/RentalGuidelinesCard'
import PickupLocationCard from './components/PickupLocationCard'

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
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  deliveryFee: number
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  isActive: boolean
  instantBook: boolean
  advanceNotice: number | null
  minTripDuration: number | null
  maxTripDuration: number | null
  vehicleType: string | null
  rules: string | null
  includedMilesPerDay: number | null
  overageMileRate: number | null
  features: string[]
  photos: { id: string; url: string; isHero: boolean; order: number }[]
  totalTrips: number
  rating: number
  vinVerifiedAt: string | null
  hasActiveBooking: boolean
}

// Helper function to properly capitalize vehicle make/model
const formatVehicleName = (text: string) => {
  if (!text) return ''
  return text.toLowerCase().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export default function PartnerFleetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const t = useTranslations('PartnerVehicleDetail')

  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [refreshManagement, setRefreshManagement] = useState(0)
  const [activeTab, setActiveTab] = useState<'info' | 'share' | 'actions'>('info')
  const [settingHero, setSettingHero] = useState<string | null>(null)

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/partner/fleet/${id}`)
        const data = await res.json()

        if (data.success) {
          setVehicle(data.vehicle)
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

  const handleToggleActive = async () => {
    if (!vehicle) return

    try {
      const res = await fetch(`/api/partner/fleet/${id}/toggle-active`, {
        method: 'POST'
      })

      const data = await res.json()

      if (data.success) {
        setVehicle(prev => prev ? { ...prev, isActive: data.isActive } : null)
      } else {
        setError(data.error || t('failedToToggleStatus'))
      }
    } catch (err) {
      setError(t('failedToToggleStatus'))
    }
  }

  const handleDelete = async () => {
    if (!vehicle) return

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/partner/fleet/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        router.push('/partner/fleet')
      } else {
        setError(data.error || t('failedToDeleteVehicle'))
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setError(t('failedToDeleteVehicle'))
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSetHero = async (photoId: string) => {
    setSettingHero(photoId)
    try {
      const res = await fetch(`/api/partner/fleet/${id}/photos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })
      const data = await res.json()
      if (data.success && vehicle) {
        setVehicle({
          ...vehicle,
          photos: vehicle.photos.map(p => ({ ...p, isHero: p.id === photoId }))
        })
      }
    } catch (err) {
      console.error('Failed to set hero photo:', err)
    } finally {
      setSettingHero(null)
    }
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
          <IoWarningOutline className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link href="/partner/fleet" className="text-purple-600 hover:underline">
            {t('backToFleet')}
          </Link>
        </div>
      </div>
    )
  }

  if (!vehicle) return null

  const heroPhoto = vehicle.photos.find(p => p.isHero) || vehicle.photos[0]
  const fuelBadge = vehicle.fuelType?.toLowerCase()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/partner/fleet" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0">
                <IoChevronBack className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {vehicle.year} {formatVehicleName(vehicle.make)}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal truncate">{formatVehicleName(vehicle.model)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Status Badge */}
              <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                vehicle.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {vehicle.isActive ? t('active') : t('inactive')}
              </span>

              <Link
                href={`/partner/fleet/${id}/edit`}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-sm"
              >
                <IoCreateOutline className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[52px] sm:top-[60px] z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {[
              { id: 'info' as const, label: t('tabInfo'), icon: IoInformationCircleOutline },
              { id: 'share' as const, label: t('tabShare'), icon: IoShareSocialOutline },
              { id: 'actions' as const, label: t('tabActions'), icon: IoSettingsOutline },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-4">
          {/* Photos */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Main Photo */}
              <div className="relative aspect-[4/3]">
                {vehicle.photos.length > 0 ? (
                  <Image
                    src={vehicle.photos[selectedPhoto]?.url || heroPhoto?.url || ''}
                    alt={`${vehicle.year} ${formatVehicleName(vehicle.make)} ${formatVehicleName(vehicle.model)}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <IoCarOutline className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
                  </div>
                )}

                {/* Fuel Badge */}
                {(fuelBadge === 'electric' || fuelBadge === 'hybrid') && (
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                    fuelBadge === 'electric'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    {fuelBadge === 'electric' ? <IoFlash className="w-4 h-4" /> : <IoLeaf className="w-4 h-4" />}
                    {fuelBadge === 'electric' ? t('electric') : t('hybrid')}
                  </div>
                )}
              </div>

              {/* Photo Thumbnails */}
              {vehicle.photos.length > 1 && (
                <div className="p-2 sm:p-4">
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
                    {vehicle.photos.map((photo, index) => (
                      <div key={photo.id} className="relative flex-shrink-0">
                        <button
                          onClick={() => setSelectedPhoto(index)}
                          className={`relative w-14 h-10 sm:w-20 sm:h-16 rounded sm:rounded-lg overflow-hidden ${
                            selectedPhoto === index ? 'ring-2 ring-purple-600' : 'ring-1 ring-gray-200 dark:ring-gray-600'
                          }`}
                        >
                          <Image
                            src={photo.url}
                            alt={t('photoNumber', { number: index + 1 })}
                            fill
                            className="object-cover"
                          />
                        </button>
                        {/* Hero star badge */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSetHero(photo.id) }}
                          disabled={settingHero === photo.id}
                          className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-sm ${
                            photo.isHero
                              ? 'bg-yellow-400 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-400 hover:text-yellow-500 border border-gray-200 dark:border-gray-600'
                          }`}
                          title={photo.isHero ? 'Main photo' : 'Set as main photo'}
                        >
                          {photo.isHero
                            ? <IoStar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            : <IoStarOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5">Tap the star to set as main photo</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{vehicle.totalTrips}</p>
                <p className="text-[10px] sm:text-sm text-gray-500">{t('trips')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                {vehicle.totalTrips > 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      <IoStar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-500" />
                      <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{vehicle.rating.toFixed(1)}</p>
                    </div>
                    <p className="text-[10px] sm:text-sm text-gray-500">{t('rating')}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-500">—</p>
                    <p className="text-[10px] sm:text-sm text-gray-400">{t('noReviews')}</p>
                  </>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{vehicle.photos.length}</p>
                <p className="text-[10px] sm:text-sm text-gray-500">{t('photos')}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{t('pricing')}</h2>
                <Link
                  href={`/partner/fleet/${id}/edit`}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <IoCreateOutline className="w-3.5 h-3.5" />
                  {t('edit')}
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">${vehicle.dailyRate}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{t('perDay')}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">${vehicle.weeklyRate || '—'}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{t('perWeek')}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">${vehicle.monthlyRate || '—'}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{t('perMonth')}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="flex items-center gap-2">
                  <IoShieldCheckmark className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{t('vehicleDetails')}</h2>
                </div>
                <Link
                  href={`/partner/fleet/${id}/edit`}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <IoCreateOutline className="w-3.5 h-3.5" />
                  {t('edit')}
                </Link>
              </div>
              {/* Non-editable Info (VIN verified) */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <IoShieldCheckmark className="w-3 h-3 text-green-600" />
                  {t('vinVerified')}
                </p>
                <p className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white break-all">{vehicle.vin}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 sm:gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t('color')}</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('transmission')}</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{vehicle.transmission}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('fuelType')}</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{vehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('doors')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{vehicle.doors}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('seats')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{vehicle.seats}</p>
                </div>
                {vehicle.currentMileage && (
                  <div>
                    <p className="text-xs text-gray-500">{t('mileage')}</p>
                    <p className="text-sm text-gray-900 dark:text-white">{vehicle.currentMileage.toLocaleString()} {t('mi')}</p>
                  </div>
                )}
                {vehicle.licensePlate && (
                  <div>
                    <p className="text-xs text-gray-500">{t('licensePlate')}</p>
                    <p className="text-sm text-gray-900 dark:text-white">{vehicle.licensePlate}</p>
                  </div>
                )}
              </div>

              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                Vehicle specs verified via VIN decode. Editable fields can be updated in Full Edit.
              </p>
            </div>

            {/* Delivery Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">{t('deliveryOptions')}</h2>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  {vehicle.airportPickup ? (
                    <IoCheckmarkCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <IoCloseCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs sm:text-base ${vehicle.airportPickup ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                    {t('airportPickup')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {vehicle.hotelDelivery ? (
                    <IoCheckmarkCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <IoCloseCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs sm:text-base ${vehicle.hotelDelivery ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                    {t('hotelDelivery')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {vehicle.homeDelivery ? (
                    <IoCheckmarkCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <IoCloseCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs sm:text-base ${vehicle.homeDelivery ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                    {t('homeDelivery')}
                  </span>
                </div>
                {vehicle.deliveryFee > 0 && (
                  <p className="text-[10px] sm:text-sm text-gray-500 mt-1.5 sm:mt-2">{t('deliveryFee', { fee: vehicle.deliveryFee })}</p>
                )}
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">{t('features')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">These features are displayed on your public listing page.</p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                  {vehicle.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-[10px] sm:text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">{t('description')}</h2>
                <p className="text-xs sm:text-base text-gray-700 dark:text-gray-300">{vehicle.description}</p>
              </div>
            )}

            {/* Pricing Section */}
            <PricingSection
              vehicleId={vehicle.id}
              vehicleType={vehicle.vehicleType || 'RENTAL'}
              dailyRate={vehicle.dailyRate || 0}
              weeklyRate={vehicle.weeklyRate || null}
              monthlyRate={vehicle.monthlyRate || null}
              includedMilesPerDay={vehicle.includedMilesPerDay || null}
              overageMileRate={vehicle.overageMileRate || null}
            />

            {/* Rental Guidelines */}
            <RentalGuidelinesCard
              vehicleId={vehicle.id}
              rules={vehicle.rules || null}
            />

            {/* Pickup Location */}
            <PickupLocationCard
              vehicleId={vehicle.id}
              city={vehicle.city || ''}
              state={vehicle.state || 'AZ'}
              zipCode={vehicle.zipCode || ''}
              address={vehicle.address || ''}
              advanceNotice={vehicle.advanceNotice || 24}
              minTripDuration={vehicle.minTripDuration || 1}
              maxTripDuration={vehicle.maxTripDuration || 30}
              instantBook={vehicle.instantBook || false}
            />

            {/* Host Assignment Section */}
            <HostAssignmentSection
              key={refreshManagement}
              vehicleId={id}
              onInviteHost={() => setShowInviteModal(true)}
            />
          </div>
          )}

            {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('shareAndPreview')}</h2>
                <div className="space-y-3">
                  <Link
                    href={`/rentals/${vehicle.id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <IoOpenOutline className="w-5 h-5" />
                    {t('previewPublicListing')}
                  </Link>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/rentals/${vehicle.id}`
                      navigator.clipboard.writeText(url)
                      alert(t('linkCopied'))
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <IoCopyOutline className="w-5 h-5" />
                    {t('copyListingLink')}
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/rentals/${vehicle.id}`
                      if (navigator.share) {
                        navigator.share({ title: `${vehicle.year} ${formatVehicleName(vehicle.make)} ${formatVehicleName(vehicle.model)}`, url })
                      } else {
                        navigator.clipboard.writeText(url)
                        alert(t('linkCopied'))
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <IoShareSocialOutline className="w-5 h-5" />
                    {t('shareListing')}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quickLinks')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/partner/fleet/${id}/bookings`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <IoCalendarOutline className="w-4 h-4" />
                    {t('bookings')}
                  </Link>
                  <Link
                    href={`/partner/fleet/${id}/earnings`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <IoCashOutline className="w-4 h-4" />
                    {t('earnings')}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('vehicleStatus')}</h2>
              <div className="space-y-3">
                <button
                  onClick={handleToggleActive}
                  disabled={vehicle.hasActiveBooking}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    vehicle.isActive
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                  } ${vehicle.hasActiveBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {vehicle.isActive ? (
                    <>
                      <IoToggleOutline className="w-5 h-5" />
                      {t('deactivateVehicle')}
                    </>
                  ) : (
                    <>
                      <IoToggle className="w-5 h-5" />
                      {t('activateVehicle')}
                    </>
                  )}
                </button>
                {vehicle.hasActiveBooking && (
                  <p className="text-xs text-gray-500 text-center">{t('cannotDeactivate')}</p>
                )}

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={vehicle.hasActiveBooking}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium ${
                    vehicle.hasActiveBooking ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <IoTrashOutline className="w-5 h-5" />
                  {t('deleteVehicle')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('deleteVehicleTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('deleteVehicleConfirm', { vehicle: `${vehicle.year} ${formatVehicleName(vehicle.make)} ${formatVehicleName(vehicle.model)}` })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Host Modal */}
      <InviteHostModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        vehicleId={id}
        vehicleName={`${vehicle.year} ${formatVehicleName(vehicle.make)} ${formatVehicleName(vehicle.model)}`}
        onInviteSent={() => {
          setRefreshManagement(prev => prev + 1)
        }}
      />
    </div>
  )
}
