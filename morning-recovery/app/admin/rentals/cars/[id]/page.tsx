// app/admin/rentals/cars/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoCarSportOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoCashOutline,
  IoFlashOutline,
  IoStarOutline,
  IoStar,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoCreateOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoImageOutline,
  IoSpeedometerOutline,
  IoColorPaletteOutline,
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
  IoWaterOutline,
  IoBatteryChargingOutline,
  IoCaretForwardOutline,
  IoWarningOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'

interface CarDetails {
  id: string
  make: string
  model: string
  year: number
  trim?: string
  color?: string
  licensePlate?: string
  vin?: string
  carType: string
  seats: number
  doors: number
  transmission: string
  fuelType: string
  mpgCity?: number
  mpgHighway?: number
  currentMileage?: number
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  deliveryFee: number
  weeklyDiscount?: number
  monthlyDiscount?: number
  features?: string
  address?: string
  city: string
  state: string
  zipCode?: string
  latitude?: number
  longitude?: number
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  isActive: boolean
  instantBook: boolean
  advanceNotice: number
  minTripDuration: number
  maxTripDuration: number
  rules?: string
  insuranceIncluded: boolean
  insuranceDaily: number
  totalTrips: number
  rating: number
  createdAt: string
  updatedAt: string
  host?: {
    id: string
    name: string
    email: string
    phone?: string
    rating?: number
    isVerified?: boolean
    responseTime?: number
    totalTrips?: number
  }
  photos?: Array<{
    id: string
    url: string
    caption?: string
    isHero?: boolean
    order?: number
  }>
  bookings?: Array<{
    id: string
    bookingCode: string
    status: string
    startDate: string
    endDate: string
    totalAmount: number
    guestName?: string
  }>
  reviews?: Array<{
    id: string
    rating: number
    title?: string
    comment: string
    createdAt: string
    reviewerName?: string
  }>
}

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [car, setCar] = useState<CarDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchCarDetails()
    }
  }, [id])

  const fetchCarDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/sys-2847/fleet/api/cars/${id}`)
      if (response.ok) {
        const data = await response.json()
        const carData = data.data || data
        setCar(carData)
        if (carData.photos && carData.photos.length > 0) {
          const heroPhoto = carData.photos.find((p: any) => p.isHero)
          setSelectedPhoto(heroPhoto?.url || carData.photos[0].url)
        }
      }
    } catch (error) {
      console.error('Failed to fetch car details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<IoStar key={i} className="w-5 h-5 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<IoStarOutline key={i} className="w-5 h-5 text-yellow-400" />)
      } else {
        stars.push(<IoStarOutline key={i} className="w-5 h-5 text-gray-300" />)
      }
    }
    return stars
  }

  const parseFeatures = (features: string | undefined) => {
    if (!features) return []
    try {
      return JSON.parse(features)
    } catch {
      return features.split(',').map((f: string) => f.trim())
    }
  }

  const parseRules = (rules: string | undefined) => {
    if (!rules) return []
    try {
      return JSON.parse(rules)
    } catch {
      return rules.split(',').map((r: string) => r.trim())
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <IoCarSportOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Car Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The car you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/admin/rentals/cars')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Cars
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/rentals/cars')}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <IoArrowBackOutline className="w-5 h-5 mr-2" />
                <span>Back to Cars</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/sys-2847/fleet/edit/${car.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <IoCreateOutline className="w-5 h-5" />
                <span>Edit Car</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Car Header with Photos */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photo Gallery */}
            <div>
              <div className="aspect-w-16 aspect-h-12 mb-4">
                {selectedPhoto ? (
                  <img
                    src={selectedPhoto}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <IoImageOutline className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>
              {car.photos && car.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {car.photos.slice(0, 8).map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo.url)}
                      className={`relative aspect-w-16 aspect-h-12 ${
                        selectedPhoto === photo.url ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-20 object-cover rounded"
                      />
                      {photo.isHero && (
                        <span className="absolute top-1 left-1 px-1 py-0.5 bg-blue-600 text-white text-xs rounded">
                          Main
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {car.year} {car.make} {car.model}
                  </h1>
                  {car.trim && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">{car.trim}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      car.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {car.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {car.instantBook && (
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 flex items-center">
                        <IoFlashOutline className="w-4 h-4 mr-1" />
                        Instant Book
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">${car.dailyRate}/day</p>
                  <div className="flex items-center justify-end mt-1">
                    {getRatingStars(car.rating)}
                    <span className="ml-2 text-sm text-gray-600">({car.totalTrips} trips)</span>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoColorPaletteOutline className="w-5 h-5 mr-2" />
                  <span>{car.color || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoCarSportOutline className="w-5 h-5 mr-2" />
                  <span>{car.carType}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoSettingsOutline className="w-5 h-5 mr-2" />
                  <span>{car.transmission}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoWaterOutline className="w-5 h-5 mr-2" />
                  <span>{car.fuelType}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoPersonOutline className="w-5 h-5 mr-2" />
                  <span>{car.seats} seats</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoSpeedometerOutline className="w-5 h-5 mr-2" />
                  <span>{car.currentMileage?.toLocaleString() || 'N/A'} miles</span>
                </div>
              </div>

              {/* Location */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <h3 className="font-semibold mb-2">Location</h3>
                <div className="flex items-start text-gray-600 dark:text-gray-400">
                  <IoLocationOutline className="w-5 h-5 mr-2 mt-0.5" />
                  <div>
                    <p>{car.address || 'Address not specified'}</p>
                    <p>{car.city}, {car.state} {car.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              {car.host && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold mb-2">Host</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                        <IoPersonOutline className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center">
                          {car.host.name}
                          {car.host.isVerified && (
                            <IoCheckmarkCircle className="w-4 h-4 ml-1 text-blue-500" />
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{car.host.email}</p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/rentals/hosts/${car.host.id}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      View Host
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">${car.dailyRate}</p>
            <p className="text-xs text-gray-600">Daily</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">${car.weeklyRate || car.dailyRate * 7}</p>
            <p className="text-xs text-gray-600">Weekly</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">${car.monthlyRate || car.dailyRate * 30}</p>
            <p className="text-xs text-gray-600">Monthly</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">${car.deliveryFee}</p>
            <p className="text-xs text-gray-600">Delivery</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">{car.totalTrips}</p>
            <p className="text-xs text-gray-600">Trips</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">{car.rating.toFixed(1)}</p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">{car.advanceNotice}h</p>
            <p className="text-xs text-gray-600">Notice</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-2xl font-bold">{car.minTripDuration}d</p>
            <p className="text-xs text-gray-600">Min Trip</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              {['overview', 'specifications', 'bookings', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Features */}
                {car.features && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {parseFeatures(car.features).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <IoCheckmarkCircle className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rules */}
                {car.rules && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Rental Guidelines</h3>
                    <div className="space-y-2">
                      {parseRules(car.rules).map((rule: string, index: number) => (
                        <div key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <IoWarningOutline className="w-4 h-4 mr-2 mt-0.5 text-yellow-500" />
                          {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Options */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Delivery Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border ${
                      car.airportPickup ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        {car.airportPickup ? (
                          <IoCheckmarkCircle className="w-5 h-5 mr-2 text-green-500" />
                        ) : (
                          <IoCloseCircleOutline className="w-5 h-5 mr-2 text-gray-400" />
                        )}
                        <span className="font-medium">Airport Pickup</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      car.hotelDelivery ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        {car.hotelDelivery ? (
                          <IoCheckmarkCircle className="w-5 h-5 mr-2 text-green-500" />
                        ) : (
                          <IoCloseCircleOutline className="w-5 h-5 mr-2 text-gray-400" />
                        )}
                        <span className="font-medium">Hotel Delivery</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      car.homeDelivery ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        {car.homeDelivery ? (
                          <IoCheckmarkCircle className="w-5 h-5 mr-2 text-green-500" />
                        ) : (
                          <IoCloseCircleOutline className="w-5 h-5 mr-2 text-gray-400" />
                        )}
                        <span className="font-medium">Home Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Insurance</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {car.insuranceIncluded ? (
                      <p className="text-green-600 font-medium">✓ Basic insurance included</p>
                    ) : (
                      <p className="text-gray-600">Basic insurance available at ${car.insuranceDaily}/day</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Make</span>
                        <span className="font-medium">{car.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model</span>
                        <span className="font-medium">{car.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year</span>
                        <span className="font-medium">{car.year}</span>
                      </div>
                      {car.trim && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trim</span>
                          <span className="font-medium">{car.trim}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color</span>
                        <span className="font-medium">{car.color || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium">{car.carType}</span>
                      </div>
                      {car.licensePlate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">License Plate</span>
                          <span className="font-medium">{car.licensePlate}</span>
                        </div>
                      )}
                      {car.vin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">VIN (Last 4)</span>
                          <span className="font-medium">{car.vin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transmission</span>
                        <span className="font-medium">{car.transmission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel Type</span>
                        <span className="font-medium">{car.fuelType}</span>
                      </div>
                      {car.mpgCity && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">MPG City</span>
                          <span className="font-medium">{car.mpgCity}</span>
                        </div>
                      )}
                      {car.mpgHighway && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">MPG Highway</span>
                          <span className="font-medium">{car.mpgHighway}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seats</span>
                        <span className="font-medium">{car.seats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doors</span>
                        <span className="font-medium">{car.doors}</span>
                      </div>
                      {car.currentMileage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Mileage</span>
                          <span className="font-medium">{car.currentMileage.toLocaleString()} miles</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Trip Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Advance Notice</span>
                        <span className="font-medium">{car.advanceNotice} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Trip Duration</span>
                        <span className="font-medium">{car.minTripDuration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Trip Duration</span>
                        <span className="font-medium">{car.maxTripDuration} days</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instant Book</span>
                        <span className="font-medium">{car.instantBook ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekly Discount</span>
                        <span className="font-medium">{(car.weeklyDiscount || 0) * 100}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Discount</span>
                        <span className="font-medium">{(car.monthlyDiscount || 0) * 100}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                {car.bookings && car.bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {car.bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 text-sm font-medium">{booking.bookingCode}</td>
                            <td className="px-6 py-4 text-sm">{booking.guestName || 'Guest'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold">
                              ${booking.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IoDocumentTextOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No bookings yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {car.reviews && car.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {car.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              {getRatingStars(review.rating)}
                              <span className="ml-3 font-medium">{review.title}</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm text-gray-500">
                                {review.reviewerName || 'Anonymous'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IoStarOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}