// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroSection from './rentals-sections/HeroSection'
import QuickActionsBar from './rentals-sections/QuickActionsBar'
import BrowseByTypeSection from './rentals-sections/BrowseByTypeSection'
import BenefitsSection from './rentals-sections/BenefitsSection'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { 
  IoCarOutline, 
  IoFlashOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoLocationOutline,
  IoStarSharp,
  IoCarSportOutline,
  IoLeaf,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoBedOutline,
  IoCalendarOutline,
  IoThermometerOutline,
  IoCashOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircle,
  IoTrophyOutline,
  IoDocumentTextOutline,
  IoBusinessOutline,
  IoStatsChartOutline
} from 'react-icons/io5'

// City coordinates for distance calculation
const CITY_COORDS = {
  Phoenix: { lat: 33.4484, lng: -112.0740 },
  Scottsdale: { lat: 33.4942, lng: -111.9261 },
  Tempe: { lat: 33.4255, lng: -111.9400 },
  Mesa: { lat: 33.4152, lng: -111.8315 },
  Chandler: { lat: 33.3062, lng: -111.8413 }
}

// Enhanced Image Component
function CarImage({ car, className }) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getImageUrl = () => {
    const sources = [car.photos, car.RentalCarPhoto, car.carPhotos, car.images, car.photo, car.image, car.imageUrl, car.photoUrl]
    for (const src of sources) {
      if (src) {
        if (Array.isArray(src) && src.length > 0) {
          const first = src[0]
          if (first.url) return first.url
          if (typeof first === 'string') return first
        }
        if (typeof src === 'object' && src.url) return src.url
        if (typeof src === 'string') return src
      }
    }

    const make = (car.make || '').toLowerCase()
    const model = (car.model || '').toLowerCase()
    const type = (car.carType || '').toLowerCase()

    const brandImages = {
      tesla: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
      bmw: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      mercedes: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      audi: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&h=600&fit=crop',
      porsche: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
      lexus: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop',
      toyota: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop',
      honda: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      ford: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop',
      chevrolet: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      nissan: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      hyundai: 'https://images.unsplash.com/photo-1562141961-401595f78d6e?w=800&h=600&fit=crop',
      kia: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop'
    }

    if (brandImages[make]) return brandImages[make]
    if (model.includes('suv') || type.includes('suv')) return brandImages.nissan
    if (model.includes('sedan') || type.includes('sedan')) return brandImages.bmw
    if (model.includes('coupe') || type.includes('coupe')) return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop'
    if (model.includes('convertible') || type.includes('convertible')) return brandImages.porsche
    if (model.includes('truck') || type.includes('truck')) return 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
    if (model.includes('hatchback') || type.includes('hatchback')) return brandImages.kia

    return 'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=800&h=600&fit=crop'
  }

  const imageUrl = getImageUrl()

  if (imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center`}>
        <div className="text-center">
          <IoCarOutline className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{car.year} {car.make} {car.model}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center absolute inset-0 z-10`}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={`${car.make} ${car.model} ${car.year}`}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => { setImageError(true); setIsLoading(false) }}
        loading="lazy"
      />
    </div>
  )
}

// Skeleton Component
function CarCardSkeleton() {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl animate-pulse">
      <div className="relative h-48 sm:h-56 bg-gray-200 dark:bg-gray-700">
        <div className="absolute top-3 left-3 h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="absolute bottom-3 right-3 px-4 py-2.5 bg-gray-300 dark:bg-gray-600 rounded-lg w-20 h-10" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="flex justify-between">
          <div className="flex gap-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-600">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Car Card Component with Smart ESG Badge
function CarCard({ car }) {
  const isTraditional = car.provider_type === 'traditional'
  const showLocalHostBadge = car.host && !car.instantBook
  const tripCount = car.trips || car.totalTrips || car.rating?.count || 0
  const carUrl = generateCarUrl(car)
  const esgScore = car.esgScore || car.impactScore || car.esg_score || null
  const showEcoElite = esgScore && esgScore >= 85

  return (
    <Link href={carUrl} className="group block">
      <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <CarImage car={car} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showLocalHostBadge && (
              <span className="px-3 py-1 bg-black/80 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <IoStarSharp className="w-3 h-3" /> LOCAL HOST
              </span>
            )}
            {car.instantBook && (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <IoFlashOutline className="w-3 h-3" /> INSTANT
              </span>
            )}
            {isTraditional && car.provider && (
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                {car.provider.toUpperCase()}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg px-4 py-2.5 shadow-xl border border-white/20">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 dark:text-white">${car.dailyRate || car.totalDaily}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">/day</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                {car.year} {car.make}
              </h3>
              {showEcoElite && (
                <div className="group/tooltip relative">
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <IoLeaf className="w-3 h-3" /> Eco Elite
                  </span>
                  <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10">
                    <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      Impact Score: {esgScore}/100
                      <div className="text-[10px] text-gray-300 mt-0.5">CSRD Compliant • Scope 3 Ready</div>
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-black transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {car.model}
            </h4>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {car.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <IoStarOutline
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(car.rating.average || car.rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {(car.rating.average || car.rating).toFixed(1)}
                  </span>
                </div>
              )}
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <IoCarSportOutline className="w-3.5 h-3.5" /> {tripCount} trips
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <IoLocationOutline className="w-3 h-3" /> {car.location?.city || 'Phoenix'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
              Airport Delivery
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
              Hotel Delivery
            </span>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
              <IoLocationOutline className="w-3.5 h-3.5" />
              {car.location?.lat ? (() => {
                const R = 3959
                const dLat = (car.location.lat - 33.4484) * Math.PI / 180
                const dLon = (car.location.lng - -112.0740) * Math.PI / 180
                const a = Math.sin(dLat/2)**2 + Math.cos(33.4484 * Math.PI / 180) * Math.cos(car.location.lat * Math.PI / 180) * Math.sin(dLon/2)**2
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
                let d = R * c
                if (d < 1) d = 1.1 + (car.id.charCodeAt(0) % 9) / 10
                return `${d.toFixed(1)} mi away`
              })() : 'Phoenix area'}
            </div>
            <div className="flex items-center text-amber-600 dark:text-amber-400 font-semibold group-hover:gap-2 transition-all">
              View <IoArrowForwardOutline className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

// NEW: Corporate B2B Section
function CorporateBusinessSection() {
  return (
    <section className="py-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Enterprise Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            ItWhip Business: ESG-Compliant Corporate Travel
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Meet CSRD and SEC climate disclosure requirements with verified Scope 3 emissions tracking on every rental. 
            Built for Fortune 500 companies and enterprise travel programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white mb-6">
              <IoDocumentTextOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quarterly ESG Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Automated compliance documentation for CSRD and SEC requirements. Export-ready emissions data.
            </p>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              From $500/quarter
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center text-white mb-6">
              <IoCheckmarkCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Per-Booking Certificates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Individual emissions certificates for expense reports. CO₂ calculations and sustainability metrics.
            </p>
            <div className="text-teal-600 dark:text-teal-400 font-bold text-lg">
              $10/booking
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white mb-6">
              <IoBusinessOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              B2B Platform Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Seamless integration with Concur, Expensify, and corporate travel platforms. Automated ESG tracking.
            </p>
            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">
              Enterprise pricing
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg mb-10">
          <div className="flex items-start gap-4 mb-6">
            <IoStatsChartOutline className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Why Fortune 500 Companies Choose ItWhip
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Scope 3 emissions from business travel represent 75% of corporate carbon footprints. Our verified tracking system 
                provides the documentation your sustainability team needs for CSRD compliance, SEC climate disclosures, and 
                net-zero commitments. Every rental includes verified mileage forensics and real-time emissions data.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">CSRD Ready</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">EU Compliance</div>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">SEC Compliant</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">U.S. Disclosure</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">Scope 3 Verified</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Travel Emissions</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/business" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg">
            Learn About Corporate Solutions <IoArrowForwardOutline className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Join S&P 500 companies using ItWhip for verified ESG travel reporting
          </p>
        </div>
      </div>
    </section>
  )
}

// Hotel Delivery Section
function HotelDeliverySection() {
  const hotels = {
    'Scottsdale Luxury': [
      'Four Seasons Resort Scottsdale',
      'The Phoenician',
      'Fairmont Scottsdale Princess',
      'W Scottsdale',
      'The Boulders Resort',
      'Andaz Scottsdale Resort',
      'The Westin Kierland',
      'Hyatt Regency Scottsdale',
      'The McCormick Scottsdale',
      'Hotel Valley Ho',
      'The Scottsdale Resort',
      'Talking Stick Resort',
      'Casino Arizona',
      'Sanctuary Camelback Mountain',
      'Mountain Shadows Resort'
    ],
    'Phoenix Hotels': [
      'The Ritz-Carlton Phoenix',
      'Arizona Biltmore',
      'Royal Palms Resort',
      'The Camby',
      'Kimpton Hotel Palomar',
      'Renaissance Phoenix Downtown',
      'The Westin Phoenix',
      'Sheraton Grand Phoenix',
      'Hilton Phoenix Resort',
      'JW Marriott Desert Ridge',
      'Pointe Hilton Tapatio Cliffs',
      'Pointe Hilton Squaw Peak',
      'The Wigwam',
      'Arizona Grand Resort',
      'Boulders on Southern'
    ],
    'Tempe & Airport': [
      'Tempe Mission Palms',
      'Aloft Phoenix Airport',
      'Graduate Tempe',
      'AC Hotel Phoenix Tempe',
      'Moxy Phoenix Tempe',
      'DoubleTree Tempe',
      'Embassy Suites Tempe',
      'Courtyard Tempe Downtown',
      'Four Points Tempe',
      'Hampton Inn Phoenix Airport',
      'Holiday Inn Express Airport',
      'Crowne Plaza Phoenix Airport',
      'Drury Inn Phoenix Airport',
      'Best Western Airport',
      'La Quinta Phoenix Airport'
    ],
    'Mesa & Chandler': [
      'Sheraton Mesa',
      'Delta Hotels Mesa',
      'Marriott Phoenix Mesa',
      'Hilton Phoenix East Mesa',
      'Residence Inn Mesa',
      'Sheraton Wild Horse Pass',
      'Fairfield Inn Chandler',
      'Crowne Plaza Chandler',
      'Hilton Phoenix Chandler',
      'DoubleTree Chandler'
    ]
  }

  return (
    <section className="py-10 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Free Delivery Network
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            We Deliver to 50+ Arizona Hotels
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Skip the rental counter. We bring your car directly to your hotel. Free delivery within 15 miles, $29 beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(hotels).map(([category, hotelList]) => (
            <div key={category} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoBedOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                {category}
              </h3>
              <ul className="space-y-2">
                {hotelList.map(hotel => (
                  <li key={hotel} className="flex items-start gap-2 text-sm">
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{hotel}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 text-center">
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            Not seeing your hotel? We likely deliver there too. Contact us for confirmation.
          </p>
        </div>
      </div>
    </section>
  )
}

// Mileage Forensics Section
function MileageForensicsSection() {
  return (
    <section className="py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Truth Verification
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Mileage Forensics™ System
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            The only platform that verifies every mile. Complete transparency for hosts, guests, and insurers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white mb-6">
              <IoSpeedometerOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Rental Only (15 mi max)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Host declares vehicle is ONLY for rentals. System flags any gap over 15 miles between trips as potential misuse.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                Best insurance rates
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                100% business deduction
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                Fraud detection active
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-white mb-6">
              <IoSpeedometerOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Mixed Use (500 mi max)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Host declares vehicle for rentals AND personal use. Allows up to 500 miles between trips without flags.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-amber-500" />
                Moderate insurance rates
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-amber-500" />
                Partial tax deduction
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-amber-500" />
                Flexible usage allowed
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white mb-6">
              <IoSpeedometerOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Commercial (300 mi max)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Host declares vehicle for rentals AND business operations. Up to 300 miles for business travel allowed.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-blue-500" />
                Commercial insurance rates
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-blue-500" />
                Full business deduction
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <IoCheckmarkCircle className="w-4 h-4 text-blue-500" />
                Trip logs required
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 bg-black text-white rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-3">Why This Matters</h3>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Insurance carriers finally get truthful usage data. Every mile is tracked, gaps are analyzed, and fraud is prevented. 
            This transparency creates trust, reduces claims disputes, and ensures accurate underwriting.
          </p>
        </div>
      </div>
    </section>
  )
}

// Insurance Tiers Section
function InsuranceTiersSection() {
  return (
    <section className="py-10 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Transparent Earnings
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Simple Insurance-Based Tiers
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your earnings are determined ONLY by the insurance you bring. No complex metrics, no hidden calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-8 border-2 border-emerald-500">
            <div className="absolute -top-4 left-8 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              PREMIUM
            </div>
            <div className="mt-4">
              <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 mb-4">90%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Commercial Insurance
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                You bring your commercial insurance. Highest earnings, full business benefits.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Your commercial policy is primary</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Platform insurance as backup</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Priority claims processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Full tax deductions available</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-8 border-2 border-amber-500">
            <div className="absolute -top-4 left-8 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              STANDARD
            </div>
            <div className="mt-4">
              <div className="text-5xl font-black text-amber-600 dark:text-amber-400 mb-4">75%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                P2P Insurance
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                You bring peer-to-peer insurance. Solid earnings, lower insurance costs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Your P2P policy is primary</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Platform provides secondary coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Standard claims processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Partial tax benefits</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg p-8 border-2 border-gray-400">
            <div className="absolute -top-4 left-8 bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              BASIC
            </div>
            <div className="mt-4">
              <div className="text-5xl font-black text-gray-600 dark:text-gray-400 mb-4">40%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Platform Insurance
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                No insurance needed. We handle everything. Perfect for getting started.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Platform insurance is primary</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">No insurance costs for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Full platform support</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Zero barrier to entry</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-gray-100 dark:bg-gray-900 rounded-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Important Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Impact Scores DO NOT affect earnings.</strong> They influence booking rates and pricing power only.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Declaration type affects underwriting,</strong> not your earnings percentage.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Only insurance determines your tier.</strong> Simple, transparent, fair.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Arizona Events Section
function ArizonaEventsSection() {
  const events = [
    { month: 'JAN', name: 'Barrett-Jackson', desc: 'Classic car auction week', icon: IoTrophyOutline, multiplier: '1.5x rates' },
    { month: 'JAN-FEB', name: 'PGA Phoenix Open', desc: 'Waste Management Open', icon: IoTrophyOutline, multiplier: '1.3x rates' },
    { month: 'FEB-MAR', name: 'Spring Training', desc: '15 MLB teams', icon: IoTrophyOutline, multiplier: '1.4x rates' },
    { month: 'MAR', name: 'Scottsdale Arts Festival', desc: 'Convertible weather', icon: IoCalendarOutline, multiplier: 'Peak demand' },
    { month: 'APR', name: 'Phoenix Film Festival', desc: 'Celebrity arrivals', icon: IoCalendarOutline, multiplier: '1.2x rates' },
    { month: 'OCT', name: 'Arizona State Fair', desc: 'Family travel surge', icon: IoCalendarOutline, multiplier: '1.3x rates' },
    { month: 'NOV', name: 'Las Vegas F1 Overflow', desc: 'Vegas visitors', icon: IoTrophyOutline, multiplier: '1.5x rates' },
    { month: 'DEC', name: 'Fiesta Bowl', desc: 'College football championship', icon: IoTrophyOutline, multiplier: '1.4x rates' }
  ]

  return (
    <section className="py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Dynamic Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Arizona Events Calendar
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Maximize earnings during peak events. Our dynamic pricing adjusts automatically for major Arizona events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map(event => {
            const Icon = event.icon
            return (
              <div key={event.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                    {event.month}
                  </span>
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {event.desc}
                </p>
                <div className="flex items-center gap-2">
                  <IoCashOutline className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {event.multiplier}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Summer Special</h3>
          <p className="text-gray-700 dark:text-gray-300">
            June-August: 20% discount automatically applied. Help guests beat the heat while maintaining steady bookings.
          </p>
        </div>
      </div>
    </section>
  )
}

// MaxAC Heat Section
function MaxACSection() {
  return (
    <section className="py-10 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Arizona Ready
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Every Car MaxAC™ Certified
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            All vehicles tested for extreme heat performance. No hot parking lots, no broken AC, no compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              115°F
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Desert-Ready AC
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every vehicle tested to perform in Phoenix summer heat. No exceptions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <IoThermometerOutline className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Pre-Cooled Delivery
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your car arrives cool and comfortable, not sitting in a hot rental lot.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <IoShieldCheckmarkOutline className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              UV Protection
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Legal tint levels and sun protection. Stay cool, stay legal, stay comfortable.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Main Page Component
export default function RentalsPage() {
  const [esgCars, setEsgCars] = useState([])
  const [cityCars, setCityCars] = useState([])
  const [userCity, setUserCity] = useState('Phoenix')
  const [temp, setTemp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        console.log('🚀 [Homepage] Starting initialization...')
        
        // Get geolocation
        const geo = await (await fetch('https://ipapi.co/json/')).json()
        const detectedCity = geo.city || 'Phoenix'
        console.log('📍 [Homepage] Detected location:', detectedCity, geo.region)
        
        // ✅ FIX: Only use detected city if it's in Arizona, otherwise default to Phoenix
        const isArizonaCity = detectedCity in CITY_COORDS
        const city = isArizonaCity ? detectedCity : 'Phoenix'
        setUserCity(city)
        
        if (!isArizonaCity) {
          console.log('⚠️ [Homepage] City not in Arizona, defaulting to Phoenix')
        }

        const coords = CITY_COORDS[city]
        const weather = await (await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=imperial`
        )).json()
        setTemp(Math.round(weather.main.temp))
        console.log('🌡️ [Homepage] Temperature:', weather.main.temp)

        console.log('🚗 [Homepage] Fetching cars from API...')
        console.log('🔍 [Homepage] Search city:', city)
        
        // ✅ FIX: Always search Phoenix area for cars (Arizona-only platform)
        const [esgRes, cityRes] = await Promise.all([
          fetch('/api/rentals/search?location=Phoenix,AZ&sortBy=impactScore&limit=6'),
          fetch(`/api/rentals/search?location=${city},AZ&limit=6`)
        ])
        
        console.log('📡 [Homepage] ESG API Status:', esgRes.status, esgRes.ok ? 'OK' : 'FAILED')
        console.log('📡 [Homepage] City API Status:', cityRes.status, cityRes.ok ? 'OK' : 'FAILED')
        
        const [esgData, cityData] = await Promise.all([esgRes.json(), cityRes.json()])

        // 🔍 TEMPORARY DEBUG LOGGING
        console.log('🔍 ESG API Response:', {
          success: esgData.success,
          location: esgData.location,
          total: esgData.total,
          resultsLength: esgData.results?.length,
          resultsIsArray: Array.isArray(esgData.results),
          firstCar: esgData.results?.[0]
        })

        console.log('🔍 City API Response:', {
          success: cityData.success,
          location: cityData.location, 
          total: cityData.total,
          resultsLength: cityData.results?.length,
          resultsIsArray: Array.isArray(cityData.results),
          firstCar: cityData.results?.[0]
        })

        setEsgCars(esgData.results?.slice(0, 6) || [])
        setCityCars(cityData.results?.slice(0, 6) || [])
        
        console.log('✅ [Homepage] Cars set in state:', {
          esgCarsCount: esgData.results?.length || 0,
          cityCarsCount: cityData.results?.length || 0
        })
      } catch (err) {
        console.error('❌ [Homepage] Initialization error:', err)
        setUserCity('Phoenix')
      } finally {
        setIsLoading(false)
        console.log('✅ [Homepage] Initialization complete')
      }
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={mobileMenuOpen} setIsMobileMenuOpen={setMobileMenuOpen} />

      <div className="pt-16">
        <HeroSection userCity={userCity} temp={temp} />
        <QuickActionsBar />
        <BrowseByTypeSection />

        {/* Impact Leaders Section */}
        <section className="py-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Impact Leaders</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">Top Verified Vehicles</h2>
              </div>
              <Link href="/rentals/search?filter=impact" className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                View all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? [...Array(6)].map((_, i) => <CarCardSkeleton key={i} />) : esgCars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
            {!isLoading && esgCars.length > 0 && (
              <div className="mt-6 text-center sm:hidden">
                <Link href="/rentals/search?filter=impact" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium">
                  View all Impact Leaders <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* NEW: Corporate Business Section - INSERTED AFTER IMPACT LEADERS */}
        <CorporateBusinessSection />

        {/* Local Cars Section */}
        <section className="py-6 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">Near You</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">Available in {userCity}</h2>
              </div>
              <Link href="/rentals/search" className="hidden sm:flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                Browse all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? [...Array(6)].map((_, i) => <CarCardSkeleton key={i} />) : cityCars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
            {!isLoading && cityCars.length > 0 && (
              <div className="mt-6 text-center sm:hidden">
                <Link href="/rentals/search" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium">
                  View all cars <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <BenefitsSection />
        <HotelDeliverySection />
        <InsuranceTiersSection />
        <MileageForensicsSection />
        <MaxACSection />
        <ArizonaEventsSection />

        {/* Enhanced Final CTA Section with Business Option */}
        <section className="py-16 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join Arizona's only verified, transparent, insurance-backed car rental platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rentals/search" className="px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Browse Cars
              </Link>
              <Link href="/host/register" className="px-8 py-4 bg-amber-500 text-black rounded-lg font-semibold text-lg hover:bg-amber-400 transition-colors">
                Become a Host
              </Link>
              <Link href="/business" className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors">
                Corporate Solutions
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}