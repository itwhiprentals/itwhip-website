// app/(guest)/rentals/[carId]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoLocationOutline,
  IoStarOutline,
  IoStar,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoPeopleOutline,
  IoSpeedometerOutline,
  IoWaterOutline,
  IoColorPaletteOutline,
  IoCalendarOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoShareSocialOutline,
  IoHeartOutline,
  IoHeart,
  IoFlagOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import PhotoGallery from '../components/details/PhotoGallery'
import BookingWidget from '../components/details/BookingWidget'
import HostProfile from '../components/details/HostProfile'
import CarFeatures from '../components/details/CarFeatures'
import ReviewSection from '../components/details/ReviewSection'
import { formatCurrency } from '@/app/(guest)/rentals/lib/rental-utils'

// Type definition for the car data
interface RentalCarWithDetails {
  id: string
  make: string
  model: string
  year: number
  carType?: string
  type?: string
  transmission?: string
  seats: number
  fuelType?: string
  color?: string
  dailyRate: number | string
  city: string
  state: string
  zipCode?: string
  address?: string
  location?: {
    address?: string
  }
  rating?: number
  totalTrips?: number
  instantBook?: boolean
  mpgCity?: number
  mpgHighway?: number
  minTripDuration?: number
  maxTripDuration?: number
  advanceNotice?: number
  insuranceIncluded?: boolean
  airportPickup?: boolean
  hotelDelivery?: boolean
  homeDelivery?: boolean
  deliveryFee?: number
  features?: string | any[]
  rules?: string | any[]
  photos?: any[]
  host?: any
  reviews?: any[]
}

// Next.js 15 requires params to be a Promise
interface PageProps {
  params: Promise<{ carId: string }>
}

export default function CarDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params) // Use React 19's 'use' to unwrap the Promise
  const carId = resolvedParams.carId
  
  const [car, setCar] = useState<RentalCarWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'guidelines' | 'location'>('description')

  useEffect(() => {
    if (carId) {
      loadCarDetails(carId)
      checkIfFavorited(carId)
    }
  }, [carId])

  const loadCarDetails = async (id: string) => {
    try {
      setLoading(true)
      // Use API route to fetch car details (works in browser)
      const response = await fetch(`/api/rentals/cars/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCar(data as RentalCarWithDetails)
      } else if (response.status === 404) {
        // Car not found
        setCar(null)
      } else {
        console.error('Failed to fetch car details')
        setCar(null)
      }
    } catch (error) {
      console.error('Error loading car details:', error)
      setCar(null)
    } finally {
      setLoading(false)
    }
  }

  const checkIfFavorited = (id: string) => {
    const favorites = JSON.parse(localStorage.getItem('rental_favorites') || '[]')
    setIsFavorited(favorites.includes(id))
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('rental_favorites') || '[]')
    let newFavorites
    
    if (favorites.includes(carId)) {
      newFavorites = favorites.filter((id: string) => id !== carId)
    } else {
      newFavorites = [...favorites, carId]
    }
    
    localStorage.setItem('rental_favorites', JSON.stringify(newFavorites))
    setIsFavorited(!isFavorited)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${car?.year} ${car?.make} ${car?.model}`,
          text: `Check out this car on ItWhip`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-700" />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Car Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This car is no longer available or doesn't exist.
          </p>
          <Link
            href="/rentals/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  // Parse JSON fields safely - FIXED VERSION
  let features = []
  let rules = []
  
  try {
    if (car.features) {
      if (typeof car.features === 'string') {
        // Try to parse as JSON first
        try {
          features = JSON.parse(car.features)
        } catch {
          // If JSON parse fails, treat as comma-separated string
          features = car.features.split(', ')
        }
      } else if (Array.isArray(car.features)) {
        features = car.features
      }
    }
  } catch (error) {
    console.error('Error parsing features:', error)
    features = []
  }

  try {
    if (car.rules) {
      if (typeof car.rules === 'string') {
        // Try to parse as JSON first
        try {
          rules = JSON.parse(car.rules)
        } catch {
          // If JSON parse fails, treat as single rule or split by periods
          rules = car.rules.split('. ').filter(rule => rule.trim())
        }
      } else if (Array.isArray(car.rules)) {
        rules = car.rules
      }
    }
  } catch (error) {
    console.error('Error parsing rules:', error)
    rules = []
  }
  
  const dailyRate = typeof car.dailyRate === 'string' 
    ? parseFloat(car.dailyRate) 
    : car.dailyRate

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <IoArrowBackOutline className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isFavorited ? (
                  <IoHeart className="w-6 h-6 text-red-500" />
                ) : (
                  <IoHeartOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoShareSocialOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <IoFlagOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery photos={car.photos || []} carName={`${car.year} ${car.make} ${car.model}`} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Car Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {car.year} {car.make} {car.model}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <IoLocationOutline className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {car.city}, {car.state}
                  </span>
                </div>
                
                {car.rating && car.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <IoStar className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{car.rating}</span>
                    <span className="text-gray-500">({car.totalTrips || 0} trips)</span>
                  </div>
                )}

                {car.instantBook && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <IoCheckmarkCircle className="w-4 h-4" />
                    <span>Instant Book</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <IoPeopleOutline className="w-5 h-5" />
                  <span className="text-sm">Seats</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{car.seats}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <IoSpeedometerOutline className="w-5 h-5" />
                  <span className="text-sm">Trans</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {car.transmission?.toLowerCase() || 'automatic'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <IoWaterOutline className="w-5 h-5" />
                  <span className="text-sm">Fuel</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {car.fuelType?.toLowerCase() || 'gas'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <IoColorPaletteOutline className="w-5 h-5" />
                  <span className="text-sm">Color</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {car.color?.toLowerCase() || 'varies'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-8 px-6">
                  {['description', 'features', 'guidelines', 'location'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`
                        py-4 border-b-2 transition-colors capitalize
                        ${activeTab === tab
                          ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400">
                      Experience the perfect blend of style and performance with this {car.year} {car.make} {car.model}. 
                      This {car.carType || car.type || 'vehicle'} offers comfortable seating for {car.seats} passengers and comes equipped with 
                      {car.transmission?.toLowerCase() === 'automatic' ? ' an' : ' a'} {car.transmission?.toLowerCase() || 'automatic'} transmission for a smooth driving experience.
                    </p>
                    
                    {car.mpgCity && car.mpgHighway && (
                      <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Fuel efficient with {car.mpgCity} MPG in the city and {car.mpgHighway} MPG on the highway, 
                        making it perfect for both urban commutes and road trips.
                      </p>
                    )}

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Trip Duration
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Minimum rental: {car.minTripDuration || 1} {car.minTripDuration === 1 ? 'day' : 'days'}<br />
                        Maximum rental: {car.maxTripDuration || 30} days
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <CarFeatures features={features} />
                )}

                {activeTab === 'guidelines' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        House Rules
                      </h3>
                      <div className="space-y-2">
                        {rules.length > 0 ? (
                          rules.map((rule: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">{rule}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-600 dark:text-gray-400">
                            Standard rental rules apply. No smoking, return with same fuel level, treat the vehicle with care.
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Additional Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <IoInformationCircleOutline className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Advance notice required: {car.advanceNotice || 2} hours
                          </span>
                        </div>
                        {car.insuranceIncluded && (
                          <div className="flex items-center gap-2">
                            <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Basic insurance included
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Pickup Location
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {car.address || car.location?.address || 'Contact host for exact address'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {car.city}, {car.state} {car.zipCode || ''}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {car.airportPickup && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <IoCheckmarkCircle className="w-5 h-5" />
                          <span>Airport pickup available</span>
                        </div>
                      )}
                      {car.hotelDelivery && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <IoCheckmarkCircle className="w-5 h-5" />
                          <span>Hotel delivery available (+{formatCurrency(car.deliveryFee || 35)})</span>
                        </div>
                      )}
                      {car.homeDelivery && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <IoCheckmarkCircle className="w-5 h-5" />
                          <span>Home delivery available</span>
                        </div>
                      )}
                    </div>

                    {/* Map placeholder */}
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Map view coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Host Profile */}
            {car.host && <HostProfile host={car.host} />}

            {/* Reviews */}
            <ReviewSection carId={car.id} reviews={car.reviews || []} />
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:sticky lg:top-20 h-fit">
            <BookingWidget car={car} />
          </div>
        </div>

        {/* Similar Cars */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Similar Cars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Placeholder for similar cars */}
            <p className="text-gray-600 dark:text-gray-400 col-span-full">
              Loading similar cars...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}