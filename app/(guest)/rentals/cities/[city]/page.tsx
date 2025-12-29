// app/(guest)/rentals/cities/[city]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import CitySearchWrapper from '@/app/(guest)/rentals/cities/[city]/CitySearchWrapper'
import {
  IoLocationOutline,
  IoFlashOutline,
  IoStarSharp,
  IoCarOutline,
  IoStarOutline,
  IoCarSportOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoMapOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCashOutline,
  IoSearchOutline
} from 'react-icons/io5'
import { getCitySeoData, getAllCitySlugs, CITY_SEO_DATA, CitySeoData } from '@/app/lib/data/city-seo-data'

// Add ISR - Revalidate every 60 seconds
export const revalidate = 60


// City-specific FAQs
const CITY_FAQS = (cityName: string, carCount: number, minPrice: number) => [
  {
    question: `How do I rent a car in ${cityName}?`,
    answer: `Renting a car in ${cityName} with ItWhip is simple. Browse our ${carCount}+ available vehicles, select your dates, and book instantly. Choose delivery to your location or pick up from the host. All rentals include $1M liability coverage. <a href="/rentals?location=${encodeURIComponent(cityName)}" class="text-amber-600 hover:underline">Browse ${cityName} cars →</a>`
  },
  {
    question: `What's the cheapest car rental in ${cityName}?`,
    answer: `Car rentals in ${cityName} start from ${minPrice}/day on ItWhip. We offer a range of vehicles from budget-friendly sedans to luxury SUVs. Book directly from local owners and save up to 35% compared to traditional rental companies. <a href="/rentals?location=${encodeURIComponent(cityName)}&sort=price" class="text-amber-600 hover:underline">View cheapest options →</a>`
  },
  {
    question: `Can I get a rental car delivered in ${cityName}?`,
    answer: `Yes! Many hosts in ${cityName} offer free delivery to airports, hotels, and homes. Look for the delivery icon when browsing vehicles. Delivery options and fees vary by host.`
  },
  {
    question: `Is insurance included with ${cityName} car rentals?`,
    answer: `Yes, all ItWhip rentals include $1M liability coverage. You can also add additional protection plans for comprehensive coverage. Guests can bring their own insurance for a 50% deposit discount. <a href="/insurance-guide" class="text-amber-600 hover:underline">Read our full insurance guide →</a>`
  },
  {
    question: `What do I need to rent a car in ${cityName}?`,
    answer: `To rent a car in ${cityName}, you need: a valid driver's license, to be 21+ years old (25+ for some vehicles), a clean driving record, and a valid payment method. Verification takes just minutes.`
  },
  {
    question: `Does ItWhip track environmental impact?`,
    answer: `Yes! ItWhip provides ESG (Environmental, Social, Governance) tracking for every rental. See your CO2 savings, support eco-friendly hosts, and get sustainability reports for corporate travel compliance. <a href="/esg-dashboard" class="text-amber-600 hover:underline">Learn about ESG tracking →</a>`
  }
]

// ============================================
// METADATA GENERATION
// ============================================
export async function generateMetadata({
  params
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const cityData = getCitySeoData(city)

  // Return minimal metadata for invalid cities (page will 404)
  if (!cityData) {
    return {
      title: 'City Not Found | ItWhip',
      description: 'This city page is not available.',
      robots: { index: false, follow: false }
    }
  }

  const cityName = cityData.name

  const carCount = await prisma.rentalCar.count({
    where: {
      city: { equals: cityName, mode: 'insensitive' },
      isActive: true
    }
  })

  const topCars = await prisma.rentalCar.findMany({
    where: {
      city: { equals: cityName, mode: 'insensitive' },
      isActive: true,
      photos: { some: {} }
    },
    select: {
      make: true,
      model: true,
      year: true
    },
    orderBy: [{ rating: 'desc' }, { totalTrips: 'desc' }],
    take: 3
  })

  // Use Arizona OG image for all city pages
  const ogImage = 'https://itwhip.com/og/cities/arizona.png'

  const carTypes = topCars.length > 0
    ? `including ${topCars[0].year} ${topCars[0].make} ${topCars[0].model}`
    : 'from economy to luxury'

  return {
    title: cityData.metaTitle || `${cityName} Car Rentals | ${carCount} Cars from Local Owners | ItWhip`,
    description: cityData.metaDescription || `Rent cars in ${cityName}, Arizona from $45/day. ${carCount} peer-to-peer rental cars available ${carTypes}. Book from local owners with free airport delivery. $1M insurance included.`,
    keywords: [
      `${cityName} car rental`,
      `rent a car ${cityName}`,
      `${cityName} Arizona car rental`,
      `cheap car rental ${cityName}`,
      `${cityData.airport || 'airport'} car rental`,
      'peer to peer car rental',
      'turo alternative',
      `${cityName} rental cars`,
      ...cityData.searchTerms
    ],
    openGraph: {
      title: `${cityName} Car Rentals - ${carCount} Available | ItWhip`,
      description: `Browse ${carCount} rental cars in ${cityName}. From luxury to economy, find your perfect ride with instant booking and free delivery.`,
      url: `https://itwhip.com/rentals/cities/${city}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Car rentals in ${cityName}, Arizona` }],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cityName} Car Rentals - ${carCount} Available`,
      description: `Browse ${carCount} rental cars in ${cityName}. Instant booking available.`,
      images: [ogImage]
    },
    alternates: {
      canonical: `https://itwhip.com/rentals/cities/${city}`,
    },
  }
}

// ============================================
// STATIC PARAMS FOR PRE-RENDERING
// ============================================
export async function generateStaticParams() {
  // Get cities from database
  const dbCities = await prisma.rentalCar.findMany({
    where: { isActive: true },
    select: { city: true },
    distinct: ['city'],
  })

  const dbCitySlugs = dbCities.map((item: { city: string | null }) => ({
    city: (item.city || 'phoenix').toLowerCase().replace(/\s+/g, '-'),
  }))

  // Combine with all SEO data slugs to ensure all pages are generated
  const seoSlugs = getAllCitySlugs().map(slug => ({ city: slug }))

  // Merge and deduplicate
  const allSlugs = [...dbCitySlugs, ...seoSlugs]
  const uniqueSlugs = Array.from(new Set(allSlugs.map(s => s.city))).map(city => ({ city }))

  return uniqueSlugs
}

// ============================================
// COMPONENTS
// ============================================

// Hero Section Component
function HeroSection({ cityName, cityData, minPrice }: {
  cityName: string
  cityData: CitySeoData
  minPrice: number
}) {
  return (
    <section className="relative h-[280px] sm:h-[320px] lg:h-[360px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero/arizona-hero.jpg)' }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium mb-3">
            <IoLocationOutline className="w-3.5 h-3.5" />
            {cityName}, Arizona
          </div>
          
          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            Rent Cars from Local Owners in {cityName}
          </h1>
          
          {/* Subheading */}
          <p className="text-sm sm:text-base text-white/80 mb-4 max-w-xl">
            Rent directly from local owners starting at ${minPrice}/day with $1M insurance included.
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <IoCashOutline className="w-4 h-4 text-emerald-400" />
              <span>From <strong>${minPrice}</strong>/day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-400" />
              <span><strong>$1M</strong> insurance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoFlashOutline className="w-4 h-4 text-purple-400" />
              <span>Instant booking</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-5">
            <a 
              href="#new-listings" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              <IoSearchOutline className="w-4 h-4" />
              Browse {cityName} Cars
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Breadcrumb Component
function Breadcrumbs({ cityName }: { cityName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1">
            <IoHomeOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="flex items-center gap-1.5">
          <Link href="/rentals/cities" className="hover:text-amber-600 dark:hover:text-amber-400">
            Cities
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="text-gray-800 dark:text-gray-200 font-medium">
          {cityName}
        </li>
      </ol>
    </nav>
  )
}

// Transform car data for CompactCarCard
function transformCarForCompactCard(car: any, cityName: string) {
  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    seats: car.seats || 5,
    city: car.city || cityName,
    rating: car.rating ? Number(car.rating) : null,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto
    } : null
  }
}

// SEO Content Section
function CityInfoSection({ cityName, cityData, carCount }: {
  cityName: string
  cityData: CitySeoData
  carCount: number
}) {
  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              About {cityName} Car Rentals
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed whitespace-pre-line">
              {cityData.description}
            </p>
            {cityData.whyRent.length > 0 && (
              <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
                {cityData.whyRent.map((reason: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {cityData.airport && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                  <IoAirplaneOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-semibold text-[10px] sm:text-xs">Nearest Airport</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  {cityData.airport}
                </p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoCarOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">Available Cars</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {carCount}+ vehicles ready
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoShieldCheckmarkOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">Insurance</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                $1M liability included
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoTimeOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">Booking</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                Instant confirmation
              </p>
            </div>
          </div>
        </div>

        {/* Landmarks & Neighborhoods */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-5 sm:mt-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <IoBusinessOutline className="w-4 h-4 text-amber-600" />
              Popular Landmarks
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cityData.landmarks.map((landmark: string, i: number) => (
                <span key={i} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs rounded-full">
                  {landmark}
                </span>
              ))}
            </div>
          </div>

          {cityData.neighborhoods && cityData.neighborhoods.length > 0 && (
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <IoMapOutline className="w-4 h-4 text-amber-600" />
                Neighborhoods We Serve
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cityData.neighborhoods.map((neighborhood: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs rounded-full">
                    {neighborhood}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Popular Routes */}
        <div className="mt-5 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <IoCarSportOutline className="w-4 h-4 text-amber-600" />
            Popular Road Trips from {cityName}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cityData.popularRoutes.map((route: string, i: number) => (
              <div
                key={i}
                className="px-2.5 py-2 sm:px-3 sm:py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] sm:text-xs text-amber-800 dark:text-amber-300 leading-snug"
              >
                {route}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// FAQ Section
function FAQSection({ cityName, carCount, minPrice }: { 
  cityName: string
  carCount: number
  minPrice: number 
}) {
  const faqs = CITY_FAQS(cityName, carCount, minPrice)
  
  return (
    <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoHelpCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {faq.question}
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Related Cities Section
function RelatedCities({ currentCity }: { currentCity: string }) {
  // Get all city slugs from the centralized SEO data
  const allSlugs = Object.keys(CITY_SEO_DATA)
  const currentSlug = currentCity.toLowerCase().replace(/\s+/g, '-')
  const otherSlugs = allSlugs.filter(slug => slug !== currentSlug).slice(0, 6)

  return (
    <section className="py-5 sm:py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
          Rent Cars in Other Arizona Cities
        </h2>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3">
          Explore peer-to-peer car rentals across the Phoenix metro area
        </p>
        <div className="flex flex-wrap gap-2">
          {otherSlugs.map((slug) => {
            const cityData = CITY_SEO_DATA[slug]
            return (
              <Link
                key={slug}
                href={`/rentals/cities/${slug}`}
                className="group px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium">{cityData?.name || slug}</span>
                {cityData?.airport && (
                  <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-amber-500">
                    ({cityData.airport})
                  </span>
                )}
                <span className="ml-1 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/rentals/cities"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View all Arizona cities
            <IoChevronForwardOutline className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default async function CityPage({
  params
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const cityData = getCitySeoData(city)

  // Return 404 for invalid cities (fixes soft 404 SEO issue)
  if (!cityData) {
    notFound()
  }

  const cityName = cityData.name

  // Fetch all cars for this city
  const allCars = await prisma.rentalCar.findMany({
    where: { 
      city: { equals: cityName, mode: 'insensitive' },
      isActive: true 
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      transmission: true,
      seats: true,
      dailyRate: true,
      weeklyRate: true,
      monthlyRate: true,
      features: true,
      city: true,
      address: true,
      fuelType: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      createdAt: true,
      photos: {
        select: { url: true, caption: true, isHero: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true, isVerified: true }
      }
    }
  })

  // Show "no cars" page instead of 404 for valid cities with no inventory
  if (allCars.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <HeroSection cityName={cityName} cityData={cityData} minPrice={45} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                <IoCarOutline className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                No Cars Available in {cityName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                We're expanding to {cityName} soon! Browse cars in nearby cities below.
              </p>
            </div>
          </div>

          <RelatedCities currentCity={cityName} />
          <Footer />
        </div>
      </>
    )
  }

  // Get price stats
  const minPrice = Math.min(...allCars.map(c => c.dailyRate))
  const maxPrice = Math.max(...allCars.map(c => c.dailyRate))

  // Parse features
  const carsWithParsedFeatures = allCars.map(car => {
    let parsedFeatures: string[] = []
    try {
      if (typeof car.features === 'string') {
        parsedFeatures = JSON.parse(car.features)
      } else if (Array.isArray(car.features)) {
        parsedFeatures = car.features as string[]
      }
    } catch { parsedFeatures = [] }
    return { ...car, features: parsedFeatures }
  })

  // Categorize cars
  const newListings = carsWithParsedFeatures
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const topRated = carsWithParsedFeatures
    .filter(car => car.rating && car.rating >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))

  const luxuryCars = carsWithParsedFeatures
    .filter(car => 
      car.carType === 'luxury' || car.carType === 'convertible' || car.dailyRate >= 200 ||
      ['mercedes', 'bmw', 'audi', 'tesla', 'porsche', 'lamborghini', 'ferrari']
        .some(brand => car.make.toLowerCase().includes(brand))
    )
    .sort((a, b) => b.dailyRate - a.dailyRate)

  const electricCars = carsWithParsedFeatures
    .filter(car => 
      car.fuelType === 'electric' || car.fuelType === 'hybrid' ||
      car.make.toLowerCase().includes('tesla') ||
      car.model.toLowerCase().includes('electric') || car.model.toLowerCase().includes('ev')
    )

  const affordableCars = carsWithParsedFeatures
    .filter(car => car.dailyRate <= 100)
    .sort((a, b) => a.dailyRate - b.dailyRate)

  // Searchable content for wrapper
  const searchableContent = [
    { sectionId: 'new-listings', searchTerms: newListings.flatMap(car => [car.make, car.model, car.carType || '', car.year.toString(), ...car.features, 'new', 'recent']) },
    { sectionId: 'top-rated', searchTerms: topRated.flatMap(car => [car.make, car.model, car.carType || '', 'top', 'rated', 'best']) },
    { sectionId: 'luxury', searchTerms: luxuryCars.flatMap(car => [car.make, car.model, 'luxury', 'premium']) },
    { sectionId: 'electric', searchTerms: electricCars.flatMap(car => [car.make, car.model, 'electric', 'ev', 'hybrid', 'eco']) },
    { sectionId: 'affordable', searchTerms: affordableCars.flatMap(car => [car.make, car.model, 'budget', 'cheap', 'affordable']) }
  ].filter(section => section.searchTerms.length > 0)

  // Calculate priceValidUntil once for all offers (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Generate JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // LocalBusiness
      {
        '@type': 'LocalBusiness',
        '@id': `https://itwhip.com/rentals/cities/${city}#business`,
        name: `ItWhip Car Rentals - ${cityName}`,
        description: `Rent cars from local owners in ${cityName}, Arizona. ${allCars.length} vehicles available.`,
        url: `https://itwhip.com/rentals/cities/${city}`,
        telephone: '+1-480-555-0100',
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityName,
          addressRegion: 'AZ',
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: cityData.coordinates.lat,
          longitude: cityData.coordinates.lng
        },
        priceRange: `$${minPrice}-$${maxPrice}/day`,
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59'
        }
      },
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': `https://itwhip.com/rentals/cities/${city}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
          { '@type': 'ListItem', position: 2, name: 'Cities', item: 'https://itwhip.com/rentals/cities' },
          { '@type': 'ListItem', position: 3, name: `${cityName} Car Rentals`, item: `https://itwhip.com/rentals/cities/${city}` }
        ]
      },
      // ItemList (Car Listings)
      {
        '@type': 'ItemList',
        '@id': `https://itwhip.com/rentals/cities/${city}#carlist`,
        name: `Car Rentals in ${cityName}`,
        numberOfItems: allCars.length,
        itemListElement: allCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${car.make} ${car.model}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Rent this ${car.year} ${car.make} ${car.model} in ${cityName}`,
            image: car.photos?.[0]?.url,
            offers: {
              '@type': 'Offer',
              price: car.dailyRate,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceValidUntil,
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'US',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 3,
                returnMethod: 'https://schema.org/ReturnAtKiosk',
                returnFees: 'https://schema.org/FreeReturn',
                refundType: 'https://schema.org/FullRefund',
                returnPolicyCountry: 'US'
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: 0,
                  currency: 'USD'
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'US',
                  addressRegion: 'AZ'
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 24,
                    unitCode: 'd'
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 2,
                    unitCode: 'd'
                  }
                }
              }
            },
            aggregateRating: car.rating ? {
              '@type': 'AggregateRating',
              ratingValue: car.rating,
              reviewCount: car.totalTrips || 1
            } : undefined
          }
        }))
      },
      // FAQPage
      {
        '@type': 'FAQPage',
        '@id': `https://itwhip.com/rentals/cities/${city}#faq`,
        mainEntity: CITY_FAQS(cityName, allCars.length, minPrice).map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    ]
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        {/* Hero Section */}
        <HeroSection 
          cityName={cityName} 
          cityData={cityData} 
          minPrice={minPrice} 
        />
        
        <div>
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <Breadcrumbs cityName={cityName} />
          </div>

          <CitySearchWrapper
            cityName={cityName}
            totalCars={allCars.length}
            searchableContent={searchableContent}
          >
            {/* New Listings */}
            {newListings.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="new-listings" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">New Listings</h2>
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">{newListings.length} cars</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recently added cars in {cityName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {newListings.map((car) => <CompactCarCard key={car.id} car={transformCarForCompactCard(car, cityName)} />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Top Rated */}
            {topRated.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="top-rated" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Top Rated</h2>
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">4.5+ stars</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Highest-rated cars by our customers</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {topRated.map((car) => <CompactCarCard key={car.id} car={transformCarForCompactCard(car, cityName)} accentColor="emerald" />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Luxury */}
            {luxuryCars.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="luxury" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Luxury & Premium</h2>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">{luxuryCars.length} cars</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Premium vehicles for special occasions</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {luxuryCars.map((car) => <CompactCarCard key={car.id} car={transformCarForCompactCard(car, cityName)} accentColor="purple" />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Electric */}
            {electricCars.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="electric" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Electric & Eco-Friendly</h2>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">Zero emissions</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sustainable and efficient vehicles</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {electricCars.map((car) => <CompactCarCard key={car.id} car={transformCarForCompactCard(car, cityName)} accentColor="emerald" />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Affordable */}
            {affordableCars.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="affordable" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Budget-Friendly</h2>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">Under $100/day</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Affordable options for every budget</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {affordableCars.map((car) => <CompactCarCard key={car.id} car={transformCarForCompactCard(car, cityName)} accentColor="blue" />)}
                    </div>
                  </div>
                </section>
              </>
            )}
          </CitySearchWrapper>
          
          {/* SEO Content Sections */}
          <CityInfoSection cityName={cityName} cityData={cityData} carCount={allCars.length} />
          <FAQSection cityName={cityName} carCount={allCars.length} minPrice={minPrice} />
          <RelatedCities currentCity={cityName} />
        </div>
        
        <Footer />
      </div>
    </>
  )
}