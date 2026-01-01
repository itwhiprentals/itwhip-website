// app/partner/fleet/[id]/page.tsx
// Partner Fleet - Vehicle Detail Page
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
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
  IoLeaf
} from 'react-icons/io5'

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
  features: string[]
  photos: { id: string; url: string; isHero: boolean; order: number }[]
  totalTrips: number
  rating: number
  vinVerifiedAt: string | null
  hasActiveBooking: boolean
}

export default function PartnerFleetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/partner/fleet/${id}`)
        const data = await res.json()

        if (data.success) {
          setVehicle(data.vehicle)
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
        setError(data.error || 'Failed to toggle status')
      }
    } catch (err) {
      setError('Failed to toggle status')
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
        setError(data.error || 'Failed to delete vehicle')
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setError('Failed to delete vehicle')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
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

  const heroPhoto = vehicle.photos.find(p => p.isHero) || vehicle.photos[0]
  const fuelBadge = vehicle.fuelType?.toLowerCase()

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
              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                vehicle.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {vehicle.isActive ? 'Active' : 'Inactive'}
              </span>

              <Link
                href={`/partner/fleet/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                <IoCreateOutline className="w-5 h-5" />
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Photos */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Main Photo */}
              <div className="relative aspect-[4/3]">
                {vehicle.photos.length > 0 ? (
                  <Image
                    src={vehicle.photos[selectedPhoto]?.url || heroPhoto?.url || ''}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <IoCarOutline className="w-24 h-24 text-gray-400" />
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
                    {fuelBadge === 'electric' ? 'Electric' : 'Hybrid'}
                  </div>
                )}
              </div>

              {/* Photo Thumbnails */}
              {vehicle.photos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {vehicle.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(index)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                        selectedPhoto === index ? 'ring-2 ring-purple-600' : ''
                      }`}
                    >
                      <Image
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.totalTrips}</p>
                <p className="text-sm text-gray-500">Trips</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <IoStar className="w-5 h-5 text-yellow-500" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.rating.toFixed(1)}</p>
                </div>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.photos.length}</p>
                <p className="text-sm text-gray-500">Photos</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold text-purple-600">${vehicle.dailyRate}</p>
                  <p className="text-sm text-gray-500">per day</p>
                </div>
                {vehicle.weeklyRate && (
                  <div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">${vehicle.weeklyRate}</p>
                    <p className="text-sm text-gray-500">per week</p>
                  </div>
                )}
                {vehicle.monthlyRate && (
                  <div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">${vehicle.monthlyRate}</p>
                    <p className="text-sm text-gray-500">per month</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <IoShieldCheckmark className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">VIN</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Color</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transmission</p>
                  <p className="text-gray-900 dark:text-white capitalize">{vehicle.transmission}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fuel Type</p>
                  <p className="text-gray-900 dark:text-white capitalize">{vehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Doors</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.doors}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="text-gray-900 dark:text-white">{vehicle.seats}</p>
                </div>
                {vehicle.currentMileage && (
                  <div>
                    <p className="text-xs text-gray-500">Mileage</p>
                    <p className="text-gray-900 dark:text-white">{vehicle.currentMileage.toLocaleString()} mi</p>
                  </div>
                )}
                {vehicle.licensePlate && (
                  <div>
                    <p className="text-xs text-gray-500">License Plate</p>
                    <p className="text-gray-900 dark:text-white">{vehicle.licensePlate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <IoLocationOutline className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h2>
              </div>
              <p className="text-gray-900 dark:text-white">
                {vehicle.address && `${vehicle.address}, `}
                {vehicle.city}, {vehicle.state} {vehicle.zipCode}
              </p>
            </div>

            {/* Delivery Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Options</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {vehicle.airportPickup ? (
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoCloseCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={vehicle.airportPickup ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                    Airport Pickup
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {vehicle.hotelDelivery ? (
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoCloseCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={vehicle.hotelDelivery ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                    Hotel Delivery
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {vehicle.homeDelivery ? (
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoCloseCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={vehicle.homeDelivery ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                    Home Delivery
                  </span>
                </div>
                {vehicle.deliveryFee > 0 && (
                  <p className="text-sm text-gray-500 mt-2">Delivery fee: ${vehicle.deliveryFee}</p>
                )}
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
                <p className="text-gray-700 dark:text-gray-300">{vehicle.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleToggleActive}
                  disabled={vehicle.hasActiveBooking}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    vehicle.isActive
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                  } ${vehicle.hasActiveBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {vehicle.isActive ? (
                    <>
                      <IoToggleOutline className="w-5 h-5" />
                      Deactivate Vehicle
                    </>
                  ) : (
                    <>
                      <IoToggle className="w-5 h-5" />
                      Activate Vehicle
                    </>
                  )}
                </button>
                {vehicle.hasActiveBooking && (
                  <p className="text-xs text-gray-500 text-center">Cannot deactivate while booking is active</p>
                )}

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={vehicle.hasActiveBooking}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium ${
                    vehicle.hasActiveBooking ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <IoTrashOutline className="w-5 h-5" />
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Vehicle?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this {vehicle.year} {vehicle.make} {vehicle.model}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
