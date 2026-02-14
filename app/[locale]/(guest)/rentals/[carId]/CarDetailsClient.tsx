// app/(guest)/rentals/[carId]/CarDetailsClient.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { extractCarId } from '@/app/lib/utils/urls'
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
  IoCalendarOutline,
  IoWarningOutline,
  IoLockClosedOutline
} from 'react-icons/io5'
import PhotoGallery from '../components/details/PhotoGallery'
import BookingWidget from '../components/details/BookingWidget'
import HostProfile from '../components/details/HostProfile'
import PartnerProfile from '../components/details/PartnerProfile'
import ReviewSection from '../components/details/ReviewSection'
import SimilarCars from '../components/details/SimilarCars'
import { formatCurrency } from '@/app/[locale]/(guest)/rentals/lib/rental-utils'
import Header from '@/app/components/Header'
import VehicleBadge from '@/app/components/VehicleBadge'
import { getVehicleClass, formatFuelTypeBadge } from '@/app/lib/utils/vehicleClassification'
import { getVehicleSpecData } from '@/app/lib/utils/vehicleSpec'
import { formatRating } from '@/app/lib/utils/formatCarSpecs'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'

// Updated type definition with suspension fields
interface RentalCarWithDetails {
  id: string
  hostId?: string
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
    isCompany?: boolean
    approvalStatus?: string
    // Partner-specific fields
    hostType?: 'INDIVIDUAL' | 'FLEET_PARTNER' | 'PARTNER' | string
    partnerCompanyName?: string
    partnerSlug?: string
    partnerLogo?: string
    partnerBio?: string
    partnerFleetSize?: number
    partnerAvgRating?: number
    partnerTotalBookings?: number
    partnerSupportEmail?: string
    partnerSupportPhone?: string
    partnerBadges?: any
    yearEstablished?: number
    location?: string
    isBusinessHost?: boolean
    businessApprovalStatus?: string
  }
  reviews?: any[]
  currentMileage?: number
  engineSize?: string
  driveType?: string
  vin?: string
  licensePlate?: string
  // SUSPENSION FIELDS
  isBookable?: boolean
  hostStatus?: string
  suspensionMessage?: string | null
  isActive?: boolean
  // RIDESHARE FIELDS
  vehicleType?: 'RENTAL' | 'RIDESHARE' | string
}

// Type for SSR-fetched similar car data
interface SimilarCarData {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  carType?: string
  city: string
  state: string
  rating?: number | null
  totalTrips?: number
  instantBook?: boolean
  photos?: { url: string }[]
  seats?: number
  transmission?: string
  location?: {
    lat?: number
    lng?: number
    address?: string
  }
  hostId?: string
  host?: {
    name?: string
    profilePhoto?: string
    isVerified?: boolean
  }
}

interface PageProps {
  params: Promise<{ carId: string }>
  initialSimilarCars?: SimilarCarData[]
  initialHostCars?: SimilarCarData[]
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


export default function CarDetailsClient({ params, initialSimilarCars, initialHostCars }: PageProps) {
  const router = useRouter()
  const t = useTranslations('CarDetails')

  // Translated format helpers (must be inside component to access t())
  const tTransmission = (transmission?: string | null): string => {
    if (!transmission) return t('transmissionAutomatic')
    switch(transmission.toUpperCase()) {
      case 'AUTOMATIC': return t('transmissionAutomatic')
      case 'MANUAL': return t('transmissionManual')
      case 'SEMI_AUTOMATIC': return t('transmissionSemiAuto')
      case 'CVT': return t('transmissionCVT')
      default: return transmission.charAt(0).toUpperCase() + transmission.slice(1).toLowerCase()
    }
  }

  const tFuelType = (fuelType?: string | null): string => {
    if (!fuelType) return t('fuelRegular')
    switch(fuelType.toUpperCase()) {
      case 'REGULAR': return t('fuelRegular')
      case 'PREMIUM': return t('fuelPremium')
      case 'DIESEL': return t('fuelDiesel')
      case 'ELECTRIC': return t('fuelElectric')
      case 'HYBRID': return t('fuelHybrid')
      case 'PLUGIN_HYBRID': return t('fuelPluginHybrid')
      default: return fuelType.charAt(0).toUpperCase() + fuelType.slice(1).toLowerCase()
    }
  }

  const tCarType = (carType?: string | null): string => {
    if (!carType) return t('carTypeSedan')
    switch(carType.toUpperCase()) {
      case 'SEDAN': return t('carTypeSedan')
      case 'SUV': return t('carTypeSUV')
      case 'TRUCK': return t('carTypeTruck')
      case 'VAN': return t('carTypeVan')
      case 'MINIVAN': return t('carTypeMinivan')
      case 'COUPE': return t('carTypeCoupe')
      case 'CONVERTIBLE': return t('carTypeConvertible')
      case 'SPORTS': return t('carTypeSportsCar')
      case 'LUXURY': return t('carTypeLuxury')
      case 'EXOTIC': return t('carTypeExotic')
      case 'HATCHBACK': return t('carTypeHatchback')
      case 'WAGON': return t('carTypeWagon')
      default: return carType.charAt(0).toUpperCase() + carType.slice(1).toLowerCase()
    }
  }

  const tDriveType = (driveType?: string | null): string => {
    if (!driveType) return ''
    switch(driveType.toUpperCase()) {
      case 'FWD': return t('driveTypeFWD')
      case 'RWD': return t('driveTypeRWD')
      case 'AWD': return t('driveTypeAWD')
      case '4WD': return t('driveType4WD')
      default: return driveType.toUpperCase()
    }
  }

  const resolvedParams = use(params)
  const urlSlug = resolvedParams.carId

  // Extract the real car ID from the URL
  const carId = extractCarId(urlSlug)

  // Smart back navigation: go back if history exists, otherwise go home
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }
  
  const [car, setCar] = useState<RentalCarWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAboutCar, setShowAboutCar] = useState(true)
  const [showGuidelines, setShowGuidelines] = useState(true)
  const [showAllAboutFeatures, setShowAllAboutFeatures] = useState(false)
  const [hasBookingHistory, setHasBookingHistory] = useState(false)
  const [isViewingAllPhotos, setIsViewingAllPhotos] = useState(false)

  useEffect(() => {
    if (carId) {
      loadCarDetails(carId)
      checkIfFavorited(carId)
      checkBookingHistory(carId)
    }
  }, [carId])

  const loadCarDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rentals/cars/${id}`, {
        cache: 'no-store',
        next: { revalidate: 0 }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Car data loaded:', { 
          carId: data.id,
          isBookable: data.isBookable,
          hostStatus: data.hostStatus,
          suspensionMessage: data.suspensionMessage
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

  const checkBookingHistory = (carId: string) => {
    // Check if user has booking history with this car
    const bookingHistory = JSON.parse(localStorage.getItem('rental_booking_history') || '[]')
    setHasBookingHistory(bookingHistory.includes(carId))
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
          text: t('shareText'),
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
            {t('carNotFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('carNotFoundDescription')}
          </p>
          <Link
            href="/rentals/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            {t('backToSearch')}
          </Link>
        </div>
      </div>
    )
  }

  // Parse features
  let features: string[] = []
  
  try {
    if (car.features) {
      if (typeof car.features === 'string') {
        try {
          let parsed = JSON.parse(car.features)
          
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed)
            } catch {
              features = car.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
            }
          }
          
          if (Array.isArray(parsed)) {
            features = parsed.filter(f => typeof f === 'string' && f.length > 0)
          }
        } catch {
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

  // Parse rules
  let rules: string[] = []
  
  try {
    if (car.rules) {
      if (typeof car.rules === 'string') {
        if (car.rules.toLowerCase() === 'rules') {
          rules = []
        } else {
          try {
            let parsed = JSON.parse(car.rules)
            
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed)
              } catch {
                parsed = car.rules
              }
            }
            
            if (Array.isArray(parsed)) {
              rules = parsed.filter(rule => 
                typeof rule === 'string' && 
                rule.length > 0 && 
                rule.toLowerCase() !== 'rules'
              )
            } else if (typeof parsed === 'string' && parsed.length > 0) {
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
            if (car.rules.includes('. ')) {
              rules = car.rules.split('. ')
                .map(rule => rule.trim())
                .filter(rule => rule.length > 0 && rule.toLowerCase() !== 'rules')
                .map(rule => rule.endsWith('.') ? rule.slice(0, -1) : rule)
            } 
            else if (car.rules.includes(';')) {
              rules = car.rules.split(';')
                .map(rule => rule.trim())
                .filter(rule => rule.length > 0 && rule.toLowerCase() !== 'rules')
            }
            else if (car.rules.includes(',') && !car.rules.includes('miles/day')) {
              rules = car.rules.split(',')
                .map(rule => rule.trim())
                .filter(rule => rule.length > 0 && rule.toLowerCase() !== 'rules')
            }
            else if (car.rules.length > 0 && car.rules.toLowerCase() !== 'rules') {
              rules = [car.rules.trim()]
            }
          }
        }
      } else if (Array.isArray(car.rules)) {
        rules = car.rules.filter(rule => 
          typeof rule === 'string' && 
          rule.length > 0 && 
          rule.toLowerCase() !== 'rules'
        )
      }
    }
    
    if (rules.length === 0) {
      rules = [
        t('defaultRule1'),
        t('defaultRule2'),
        t('defaultRule3'),
        t('defaultRule4'),
        t('defaultRule5')
      ]
    }
  } catch (error) {
    console.error('Error parsing rules:', error)
    rules = [
      t('defaultRule1'),
      t('defaultRule2'),
      t('defaultRule3'),
      t('defaultRule4'),
      t('defaultRule5')
    ]
  }
  
  const dailyRate = typeof car.dailyRate === 'string'
    ? parseFloat(car.dailyRate)
    : car.dailyRate

  // Calculate vehicle classification and fuel type badges
  const vehicleClass = getVehicleClass(car.make, car.model, (car.carType || car.type || null) as any)
  const fuelTypeBadge = formatFuelTypeBadge(car.fuelType || null)

  // Rideshare detection - check vehicleType OR if host is a fleet partner OR approved business host
  const isApprovedBusinessHost = car.host?.isBusinessHost === true && car.host?.businessApprovalStatus === 'APPROVED' && !!car.host?.partnerSlug
  const isFleetPartner = car.host?.hostType === 'FLEET_PARTNER' || car.host?.hostType === 'PARTNER' || isApprovedBusinessHost
  const isRideshare = car.vehicleType?.toUpperCase() === 'RIDESHARE' || isFleetPartner
  const isPartner = isFleetPartner

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* SUSPENSION WARNING BANNER */}
      {car.suspensionMessage && (
        <div className="pt-16 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {car.suspensionMessage}
                </p>
                {hasBookingHistory && (
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t('youHavePreviousBooking')}{' '}
                    <Link href="/rentals/dashboard/bookings" className="underline ml-1 hover:text-amber-800">
                      {t('viewYourBookingHistory')}
                    </Link>
                  </p>
                )}
                {!hasBookingHistory && (
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    <Link href="/rentals/search" className="underline hover:text-amber-800">
                      {t('browseSimilarAvailableCars')}
                    </Link>
                  </p>
                )}
              </div>
              {!car.isBookable && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                  <IoLockClosedOutline className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    {t('notBookable')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery - Hero image with overlay buttons */}
      <div className={`relative ${car.isBookable === false ? 'pt-0 opacity-90' : 'pt-16'}`}>
        {/* Desktop: Constrained width container */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 pt-4">
          <div className="relative">
            {/* Overlay buttons on photo - hidden when viewing all photos */}
            {!isViewingAllPhotos && (
              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
                <button
                  onClick={handleBackNavigation}
                  className="bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg hover:bg-black/60 transition-colors flex items-center gap-2"
                >
                  <IoArrowBackOutline className="w-5 h-5" />
                  <span className="text-sm font-medium pr-1">{t('back')}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    className="bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg hover:bg-black/60 transition-colors"
                  >
                    {isFavorited ? (
                      <IoHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <IoHeartOutline className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg hover:bg-black/60 transition-colors"
                  >
                    <IoShareSocialOutline className="w-5 h-5" />
                  </button>
                  <button className="bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg hover:bg-black/60 transition-colors">
                    <IoFlagOutline className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            <PhotoGallery
              photos={car.photos || []}
              carName={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
              onViewModeChange={setIsViewingAllPhotos}
            />
          </div>
        </div>

        {/* Mobile: Full width with overlay buttons */}
        <div className="sm:hidden relative">
          {/* Overlay buttons - hidden when viewing all photos */}
          {!isViewingAllPhotos && (
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
              <button
                onClick={handleBackNavigation}
                className="bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg"
              >
                <IoArrowBackOutline className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFavorite}
                  className="bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg"
                >
                  {isFavorited ? (
                    <IoHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <IoHeartOutline className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg"
                >
                  <IoShareSocialOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          <PhotoGallery
            photos={car.photos || []}
            carName={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
            onViewModeChange={setIsViewingAllPhotos}
          />
        </div>
      </div>

      {/* Main Content - Hidden when viewing all photos */}
      <div className={`max-w-7xl mx-auto px-4 py-8 ${isViewingAllPhotos ? 'hidden' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Car Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {car.year} {capitalizeCarMake(car.make)}
                </h1>
                {vehicleClass && <VehicleBadge label={vehicleClass} />}
                {fuelTypeBadge && <VehicleBadge label={fuelTypeBadge} />}
              </div>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-3">
                {normalizeModelName(car.model, car.make)}
              </p>
              
              {/* Location and Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <IoLocationOutline className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {car.city}, {car.state}
                  </span>
                </div>
                
                {/* Rating and Trips Display */}
                {!car.totalTrips || car.totalTrips === 0 ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">{t('newListing')}</span>
                ) : car.rating && car.rating > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      <IoStar className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="font-semibold ml-1">
                        {formatRating(car.rating)}
                      </span>
                    </div>
                    <span className="text-gray-500">({car.totalTrips} {car.totalTrips === 1 ? t('trip') : t('trips')})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">{t('noReviewsYet')}</span>
                    <span className="text-gray-500">({car.totalTrips} {car.totalTrips === 1 ? t('trip') : t('trips')})</span>
                  </div>
                )}

                {isRideshare ? (
                  <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <IoCarSportOutline className="w-4 h-4" />
                    <span className="font-medium">{t('rideshare')}</span>
                  </div>
                ) : car.instantBook && car.isBookable !== false && (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <IoFlashOutline className="w-4 h-4" />
                    <span className="font-medium">{t('instantBook')}</span>
                  </div>
                )}
                
                {/* Show suspension status if suspended */}
                {car.hostStatus && car.hostStatus !== 'APPROVED' && (
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <IoWarningOutline className="w-4 h-4" />
                    <span className="font-medium">{t('limitedAvailability')}</span>
                  </div>
                )}
              </div>

              {/* Key Specs Bar */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <IoPeopleOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('seats')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {car.seats || 5}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <IoSpeedometerOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('trans')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tTransmission(car.transmission)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <IoWaterOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('fuel')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tFuelType(car.fuelType)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <IoCarSportOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('type')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tCarType(car.carType || car.type)}
                  </span>
                </div>

                {/* Doors - use vehicle spec lookup for accurate count */}
                {(() => {
                  // Look up correct doors from vehicle specs database
                  const vehicleSpec = getVehicleSpecData(car.make, car.model, String(car.year))
                  const actualDoors = vehicleSpec.doors || car.doors
                  if (!actualDoors) return null
                  return (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h7a2 2 0 012 2v12a2 2 0 01-2 2H4V4z" />
                        <circle cx="9" cy="12" r="1" fill="currentColor" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 4h3v16h-3" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('doors')}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {actualDoors}
                      </span>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* About This Car - Expandable - FIXED ALL && TO TERNARY */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowAboutCar(!showAboutCar)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('aboutThisCar')}
                </h2>
                {showAboutCar ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showAboutCar ? (
                <div className="px-6 pb-6 space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('carDescription', {
                        year: car.year,
                        make: capitalizeCarMake(car.make),
                        model: normalizeModelName(car.model, car.make),
                        carType: tCarType(car.carType || car.type).toLowerCase(),
                        seats: car.seats || 5,
                        transmissionArticle: t(car.transmission?.toUpperCase() === 'AUTOMATIC' || !car.transmission ? 'transmissionArticleAn' : 'transmissionArticleA'),
                        transmission: tTransmission(car.transmission).toLowerCase()
                      })}
                    </p>

                    {car.mpgCity && car.mpgHighway ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        {t('mpgDescription', {
                          mpgCity: car.mpgCity,
                          mpgHighway: car.mpgHighway
                        })}
                      </p>
                    ) : null}
                    
                    {car.color ? (
                      <div className="mt-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {t('exteriorColor')}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="capitalize">{car.color}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Additional specs if available */}
                  {(car.engineSize || car.driveType || car.currentMileage) ? (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {t('additionalSpecifications')}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {car.engineSize ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('engine')}</span>
                            <span className="text-gray-900 dark:text-white">{car.engineSize}</span>
                          </div>
                        ) : null}
                        {car.driveType ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('drive')}</span>
                            <span className="text-gray-900 dark:text-white">{tDriveType(car.driveType)}</span>
                          </div>
                        ) : null}
                        {car.currentMileage ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('mileage')}</span>
                            <span className="text-gray-900 dark:text-white">
                              {car.currentMileage.toLocaleString()} {t('milesUnit')}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* Features - FIXED: Changed from && to ternary */}
                  {features.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {t('features')}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      
                      {features.length > 6 ? (
                        <button
                          onClick={() => setShowAllAboutFeatures(!showAllAboutFeatures)}
                          className="mt-3 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 font-medium transition-colors"
                        >
                          {showAllAboutFeatures ? (
                            <>{t('showLess')}</>
                          ) : (
                            <>{t('viewAllFeatures', { count: features.length })}</>
                          )}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {/* MPG Info - FIXED TO PREVENT STRAY ZEROS */}
                  {(car.mpgCity || car.mpgHighway) ? (
                    <div className="flex items-center gap-4 pt-2">
                      {car.mpgCity ? (
                        <div className="flex items-center gap-2">
                          <IoSpeedometerOutline className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('cityMpg', { mpg: car.mpgCity })}
                          </span>
                        </div>
                      ) : null}
                      {car.mpgHighway ? (
                        <div className="flex items-center gap-2">
                          <IoSpeedometerOutline className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('highwayMpg', { mpg: car.mpgHighway })}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Rental Guidelines - Expandable */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('rentalGuidelines')}
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
                      {t('houseRules')}
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

                  {/* Pickup Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {t('pickupLocation')}
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
                          {t('exactPickupAddressProvidedAfterBooking')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoTimeOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('advanceNoticeRequired', { hours: car.advanceNotice || 2 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('minMaxRental', { minDays: car.minTripDuration || 1, dayLabel: (car.minTripDuration || 1) === 1 ? t('day') : t('days'), maxDays: car.maxTripDuration || 30 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Info */}
                  {car.insuranceIncluded && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('basicInsuranceIncluded')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Host/Partner Profile - Show partner branding for fleet vehicles and approved business hosts */}
            {car.host && (
              isFleetPartner ? (
                <PartnerProfile partner={car.host} />
              ) : (
                <HostProfile host={car.host} />
              )
            )}

            {/* Reviews */}
            <ReviewSection carId={car.id} reviews={car.reviews || []} />
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:sticky lg:top-20 h-fit">
            <BookingWidget
              car={car}
              isBookable={car.isBookable}
              suspensionMessage={car.suspensionMessage}
            />
          </div>
        </div>

        {/* Similar Cars Section - with SSR initial data for SEO */}
        <SimilarCars
          currentCarId={car.id}
          carType={car.carType || car.type}
          city={car.city}
          dailyRate={dailyRate}
          features={features}
          instantBook={car.instantBook}
          location={car.location}
          hostId={car.hostId || car.host?.id}
          hostName={car.host?.name}
          hostProfilePhoto={car.host?.profilePhoto || (car.host as any)?.profileImage}
          isCompany={car.host?.isCompany}
          initialSimilarCars={initialSimilarCars as any}
          initialHostCars={initialHostCars as any}
        />

        {/* Important Information Footer */}
        <section className="pt-3 pb-16 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-start gap-2">
            <IoInformationCircleOutline className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('importantInformation')}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('importantInformationText')}{' '}
                <Link
                  href="/insurance-guide"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  {t('readMoreAboutInsuranceCoverage')}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}