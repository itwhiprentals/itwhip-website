// app/(guest)/rentals/[carId]/CarDetailsClient.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { extractCarId } from '@/app/lib/utils/urls'  // ADD THIS IMPORT
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
  IoCarSportOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircle,
  IoShareSocialOutline,
  IoHeartOutline,
  IoHeart,
  IoFlagOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFlashOutline,
  IoTimeOutline,
  IoCalendarOutline
} from 'react-icons/io5'
import PhotoGallery from '../components/details/PhotoGallery'
import BookingWidget from '../components/details/BookingWidget'
import HostProfile from '../components/details/HostProfile'
import ReviewSection from '../components/details/ReviewSection'
import SimilarCars from '../components/details/SimilarCars'
import { formatCurrency } from '@/app/(guest)/rentals/lib/rental-utils'

// Type definition for the car data - UPDATED to include hostId
interface RentalCarWithDetails {
  id: string
  hostId?: string  // Added hostId field
  make: string
  model: string
  year: number
  carType?: string
  type?: string
  transmission?: string
  fuelType?: string
  seats?: number
  doors?: number
  color?: string
  dailyRate: number | string
  city: string
  state: string
  zipCode?: string
  address?: string
  location?: {
    lat?: number
    lng?: number
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
  airportFee?: number
  hotelFee?: number
  homeFee?: number
  deliveryFee?: number
  features?: string | any[]
  rules?: string | any[]
  photos?: any[]
  host?: {
    id: string
    name: string
    profilePhoto?: string
    rating?: number
    responseTime?: number
    isVerified?: boolean
    isCompany?: boolean  // Added for company detection
  }
  reviews?: any[]
  currentMileage?: number
  engineSize?: string
  driveType?: string
  vin?: string
  licensePlate?: string
}

interface PageProps {
  params: Promise<{ carId: string }>
}

// Helper functions for formatting vehicle specs
function formatTransmission(transmission?: string | null): string {
  if (!transmission) return 'Automatic'
  
  switch(transmission.toUpperCase()) {
    case 'AUTOMATIC': return 'Automatic'
    case 'MANUAL': return 'Manual'
    case 'SEMI_AUTOMATIC': return 'Semi-Auto'
    case 'CVT': return 'CVT'
    default: return transmission.charAt(0).toUpperCase() + transmission.slice(1).toLowerCase()
  }
}

function formatFuelType(fuelType?: string | null): string {
  if (!fuelType) return 'Regular'
  
  switch(fuelType.toUpperCase()) {
    case 'REGULAR': return 'Regular'
    case 'PREMIUM': return 'Premium'
    case 'DIESEL': return 'Diesel'
    case 'ELECTRIC': return 'Electric'
    case 'HYBRID': return 'Hybrid'
    case 'PLUGIN_HYBRID': return 'Plug-in Hybrid'
    default: return fuelType.charAt(0).toUpperCase() + fuelType.slice(1).toLowerCase()
  }
}

function formatCarType(carType?: string | null): string {
  if (!carType) return 'Sedan'
  
  switch(carType.toUpperCase()) {
    case 'SEDAN': return 'Sedan'
    case 'SUV': return 'SUV'
    case 'TRUCK': return 'Truck'
    case 'VAN': return 'Van'
    case 'MINIVAN': return 'Minivan'
    case 'COUPE': return 'Coupe'
    case 'CONVERTIBLE': return 'Convertible'
    case 'SPORTS': return 'Sports Car'
    case 'LUXURY': return 'Luxury'
    case 'EXOTIC': return 'Exotic'
    case 'HATCHBACK': return 'Hatchback'
    case 'WAGON': return 'Wagon'
    default: return carType.charAt(0).toUpperCase() + carType.slice(1).toLowerCase()
  }
}

function formatDriveType(driveType?: string | null): string {
  if (!driveType) return ''
  
  switch(driveType.toUpperCase()) {
    case 'FWD': return 'Front-Wheel Drive'
    case 'RWD': return 'Rear-Wheel Drive'
    case 'AWD': return 'All-Wheel Drive'
    case '4WD': return '4-Wheel Drive'
    default: return driveType.toUpperCase()
  }
}

export default function CarDetailsClient({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const urlSlug = resolvedParams.carId
  
  // Extract the real car ID from the URL (handles both old and new formats)
  const carId = extractCarId(urlSlug)
  
  const [car, setCar] = useState<RentalCarWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAboutCar, setShowAboutCar] = useState(true)
  const [showGuidelines, setShowGuidelines] = useState(true)
  const [showAllAboutFeatures, setShowAllAboutFeatures] = useState(false) // NEW STATE FOR FEATURES

  useEffect(() => {
    if (carId) {
      loadCarDetails(carId)
      checkIfFavorited(carId)
    }
  }, [carId])

  // FIXED: Added cache: 'no-store' to prevent browser caching
  const loadCarDetails = async (id: string) => {
    try {
      setLoading(true)
      // Force fresh data every time - no caching
      const response = await fetch(`/api/rentals/cars/${id}`, {
        cache: 'no-store',  // Prevents browser caching
        next: { revalidate: 0 }  // Tells Next.js to always fetch fresh data
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Car data loaded (fresh):', { 
          carId: data.id, 
          make: data.make,
          model: data.model,
          totalTrips: data.totalTrips,  // This will now show current value
          rating: data.rating,  // This will now show current value
          timestamp: new Date().toISOString()  // Log when fetched
        })
        setCar(data as RentalCarWithDetails)
      } else if (response.status === 404) {
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
                <div className="h-32 bg-gray-200 dark:bg-gray-700" />
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="h-64 bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700" />
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  // Parse features with better error handling
  let features: string[] = []
  
  try {
    if (car.features) {
      if (typeof car.features === 'string') {
        try {
          // Try to parse as JSON
          let parsed = JSON.parse(car.features)
          
          // Check if it was double-stringified
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed)
            } catch {
              // It's a regular string, split by comma
              features = car.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
            }
          }
          
          if (Array.isArray(parsed)) {
            features = parsed.filter(f => typeof f === 'string' && f.length > 0)
          }
        } catch {
          // Not JSON, try comma-separated
          if (car.features.includes(',')) {
            features = car.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
          } else if (car.features.length > 0 && car.features.length < 100) {
            features = [car.features]
          }
        }
      } else if (Array.isArray(car.features)) {
        features = car.features.filter(f => typeof f === 'string' && f.length > 0)
      }
    }
  } catch (error) {
    console.error('Error parsing features:', error)
    features = []
  }

  // Parse rules - properly handle JSON format from RentalGuidelines
  let rules: string[] = []
  
  try {
    if (car.rules) {
      if (typeof car.rules === 'string') {
        // Skip if it's just the word "rules" (bad data)
        if (car.rules.toLowerCase() === 'rules') {
          rules = []
        } else {
          // Try to parse as JSON array (this is what RentalGuidelines saves)
          try {
            let parsed = JSON.parse(car.rules)
            
            // Check if it was double-stringified
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed)
              } catch {
                // It's a regular string, not double-stringified
                parsed = car.rules
              }
            }
            
            // Now check if we have an array
            if (Array.isArray(parsed)) {
              rules = parsed.filter(rule => 
                typeof rule === 'string' && 
                rule.length > 0 && 
                rule.toLowerCase() !== 'rules'
              )
            } else if (typeof parsed === 'string' && parsed.length > 0) {
              // Single rule string - try to split it
              if (parsed.includes('. ')) {
                rules = parsed.split('. ')
                  .map(rule => rule.trim())
                  .filter(rule => rule.length > 0 && rule.toLowerCase() !== 'rules')
                  .map(rule => rule.endsWith('.') ? rule.slice(0, -1) : rule)
              } else {
                rules = [parsed]
              }
            }
          } catch (jsonError) {
            // Try period-separated format (legacy)
            if (car.rules.includes('. ')) {
              rules = car.rules.split('. ')
                .map(rule => rule.trim())
                .filter(rule => rule.length > 0 && rule.toLowerCase() !== 'rules')
                .map(rule => rule.endsWith('.') ? rule.slice(0, -1) : rule)
            } 
            // Try semicolon-separated format (legacy)
            else if (car.rules.includes(';')) {
              rules = car.rules.split(';')
                .map(rule => rule.trim())
                .filter(rule => rule.length > 0 && rule.toLowerCase() !== 'rules')
            }
            // Try comma-separated ONLY if it doesn't look like a mileage rule
            else if (car.rules.includes(',') && !car.rules.includes('miles/day')) {
              rules = car.rules.split(',')
                .map(rule => rule.trim())
                .filter(rule => rule.length > 0 && rule.toLowerCase() !== 'rules')
            }
            // Single rule or unrecognized format
            else if (car.rules.length > 0 && car.rules.toLowerCase() !== 'rules') {
              rules = [car.rules.trim()]
            }
          }
        }
      } else if (Array.isArray(car.rules)) {
        // Already an array
        rules = car.rules.filter(rule => 
          typeof rule === 'string' && 
          rule.length > 0 && 
          rule.toLowerCase() !== 'rules'
        )
      }
    }
    
    // If no rules found, provide sensible defaults
    if (rules.length === 0) {
      rules = [
        "200 miles/day included, $3/mile after",
        "No smoking",
        "Return with same fuel level",
        "Valid driver's license and insurance required",
        "Must be 25+ to book"
      ]
    }
  } catch (error) {
    console.error('Error parsing rules:', error)
    // Provide default rules on error
    rules = [
      "200 miles/day included, $3/mile after",
      "No smoking",
      "Return with same fuel level",
      "Valid driver's license and insurance required",
      "Must be 25+ to book"
    ]
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isFavorited ? (
                  <IoHeart className="w-6 h-6 text-red-500" />
                ) : (
                  <IoHeartOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <IoShareSocialOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {car.year} {car.make} {car.model}
              </h1>
              
              {/* Location and Meta Info - THIS IS WHERE THE RATING/TRIPS DISPLAY */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <IoLocationOutline className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {car.city}, {car.state}
                  </span>
                </div>
                
                {/* Rating and Trips Display - Now shows fresh data */}
                {car.rating && car.rating > 0 && car.totalTrips && car.totalTrips > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      <IoStar className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="font-semibold ml-1">
                        {typeof car.rating === 'number' ? car.rating.toFixed(1) : car.rating} </span>                    </div>
                    <span className="text-gray-500">({car.totalTrips} {car.totalTrips === 1 ? 'trip' : 'trips'})</span>
                  </div>
                ) : (
                  <span className="text-gray-500">New listing</span>
                )}

                {car.instantBook && (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <IoFlashOutline className="w-4 h-4" />
                    <span className="font-medium">Instant Book</span>
                  </div>
                )}
              </div>

              {/* Key Specs Bar - Updated to handle VehicleSpecs data */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <IoPeopleOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Seats</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {car.seats || 5}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <IoSpeedometerOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trans</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatTransmission(car.transmission)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <IoWaterOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fuel</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatFuelType(car.fuelType)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <IoCarSportOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCarType(car.carType || car.type)}
                  </span>
                </div>
                
                {car.doors && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Doors</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {car.doors}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* About This Car - Expandable */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowAboutCar(!showAboutCar)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  About this car
                </h2>
                {showAboutCar ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showAboutCar && (
                <div className="px-6 pb-6 space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Experience the perfect blend of style and performance with this {car.year} {car.make} {car.model}. 
                      This {formatCarType(car.carType || car.type).toLowerCase()} offers comfortable seating for {car.seats || 5} passengers 
                      and comes equipped with {formatTransmission(car.transmission).toLowerCase() === 'automatic' ? 'an' : 'a'} {formatTransmission(car.transmission).toLowerCase()} transmission 
                      for a smooth driving experience.
                    </p>
                    
                    {car.mpgCity && car.mpgHighway && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        Fuel efficient with {car.mpgCity} MPG in the city and {car.mpgHighway} MPG on the highway, 
                        making it perfect for both urban commutes and road trips.
                      </p>
                    )}
                    
                    {car.color && (
                      <div className="mt-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Exterior Color
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="capitalize">{car.color}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional specs if available */}
                  {(car.engineSize || car.driveType || car.currentMileage) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Additional Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {car.engineSize && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Engine:</span>
                            <span className="text-gray-900 dark:text-white">{car.engineSize}</span>
                          </div>
                        )}
                        {car.driveType && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Drive:</span>
                            <span className="text-gray-900 dark:text-white">{formatDriveType(car.driveType)}</span>
                          </div>
                        )}
                        {car.currentMileage && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                            <span className="text-gray-900 dark:text-white">
                              {car.currentMileage.toLocaleString()} miles
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Features - UPDATED WITH CLEANER DESIGN */}
                  {features.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Features
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {/* Show only first 6 features or all if showAllAboutFeatures is true */}
                        {(showAllAboutFeatures ? features : features.slice(0, 6)).map((feature: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Show more/less button if there are more than 6 features */}
                      {features.length > 6 && (
                        <button
                          onClick={() => setShowAllAboutFeatures(!showAllAboutFeatures)}
                          className="mt-3 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 font-medium transition-colors"
                        >
                          {showAllAboutFeatures ? (
                            <>← Show less</>
                          ) : (
                            <>View all {features.length} features →</>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* MPG Info */}
                  {(car.mpgCity || car.mpgHighway) && (
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <IoSpeedometerOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          City: {car.mpgCity || 'N/A'} MPG
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoSpeedometerOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Highway: {car.mpgHighway || 'N/A'} MPG
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rental Guidelines - Expandable */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rental Guidelines
                </h2>
                {showGuidelines ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showGuidelines && (
                <div className="px-6 pb-6 space-y-4">
                  {/* Rules */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      House Rules
                    </h3>
                    <div className="space-y-2">
                      {rules.map((rule: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Info - Generalized */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Pickup Location
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IoLocationOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {car.city}, {car.state} {car.zipCode ? `(${car.zipCode.substring(0,3)}xx)` : ''}
                        </span>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <IoInformationCircleOutline className="inline w-3 h-3 mr-1" />
                          Exact pickup address will be provided after booking confirmation
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoTimeOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Advance notice required: {car.advanceNotice || 2} hours
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Min rental: {car.minTripDuration || 1} {car.minTripDuration === 1 ? 'day' : 'days'} • 
                          Max rental: {car.maxTripDuration || 30} days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Info */}
                  {car.insuranceIncluded && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Basic insurance included
                      </span>
                    </div>
                  )}
                </div>
              )}
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

        {/* Similar Cars Section - FIXED WITH PROPER HOST ID AND PROFILE PHOTO */}
        <SimilarCars 
          currentCarId={car.id}
          carType={car.carType || car.type}
          city={car.city}
          dailyRate={dailyRate}
          features={features}
          instantBook={car.instantBook}
          location={car.location}
          hostId={car.hostId || car.host?.id}  // Use hostId from car or fallback to host.id
          hostName={car.host?.name}
          hostProfilePhoto={car.host?.profilePhoto || car.host?.profileImage}  // Pass host profile photo
          isCompany={car.host?.isCompany}  // Pass company flag if available
        />
      </div>
    </div>
  )
}