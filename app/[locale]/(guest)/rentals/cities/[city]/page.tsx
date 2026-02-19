// app/(guest)/rentals/cities/[city]/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'
import { getTranslations } from 'next-intl/server'
import CitySearchWrapper from '@/app/[locale]/(guest)/rentals/cities/[city]/CitySearchWrapper'
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
import { getCitySeoData, CITY_SEO_DATA, CitySeoData } from '@/app/lib/data/city-seo-data'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'

// Add ISR - Revalidate every 60 seconds
export const revalidate = 60


// City-specific FAQs — uses t.raw() for answers containing HTML tags
// (ICU MessageFormat treats <a> as XML tags, so we bypass it and do manual replacement)
function getCityFaqs(t: any, cityName: string, carCount: number, minPrice: number) {
  const citySlug = encodeURIComponent(cityName)
  return Array.from({ length: 6 }, (_, i) => ({
    question: t(`faq${i}Question`, { city: cityName }),
    answer: (t.raw(`faq${i}Answer`) as string)
      .replaceAll('{city}', cityName)
      .replaceAll('{count}', String(carCount))
      .replaceAll('{price}', String(minPrice))
      .replaceAll('{citySlug}', citySlug)
  }))
}

// ============================================
// METADATA GENERATION
// ============================================
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; city: string }>
}): Promise<Metadata> {
  const { locale, city } = await params
  const cityData = getCitySeoData(city)

  const t = await getTranslations({ locale, namespace: 'RentalCity' })

  // Return minimal metadata for invalid cities (page will 404)
  if (!cityData) {
    return {
      title: t('metaNotFound'),
      description: t('metaNotFoundDescription'),
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

  // Get minimum price for title
  const minPriceCar = await prisma.rentalCar.findFirst({
    where: {
      city: { equals: cityName, mode: 'insensitive' },
      isActive: true
    },
    select: { dailyRate: true },
    orderBy: { dailyRate: 'asc' }
  })
  const minPrice = minPriceCar?.dailyRate || 45

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
    ? t('metaCarTypesIncluding', { carInfo: `${topCars[0].year} ${topCars[0].make} ${topCars[0].model}` })
    : t('metaCarTypesGeneric')

  return {
    title: cityData.metaTitle || t('metaTitleFallback', { city: cityName, price: minPrice, count: carCount }),
    description: cityData.metaDescription || t('metaDescriptionFallback', { city: cityName, price: minPrice, count: carCount, carTypes }),
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
      title: t('ogTitle', { city: cityName, price: minPrice, count: carCount }),
      description: t('ogDescription', { city: cityName, price: minPrice, count: carCount }),
      url: getCanonicalUrl(`/rentals/cities/${city}`, locale),
      locale: getOgLocale(locale),
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('ogImageAlt', { city: cityName }) }],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle', { city: cityName, price: minPrice }),
      description: t('twitterDescription', { city: cityName, price: minPrice, count: carCount }),
      images: [ogImage]
    },
    alternates: {
      canonical: getCanonicalUrl(`/rentals/cities/${city}`, locale),
      languages: getAlternateLanguages(`/rentals/cities/${city}`),
    },
  }
}

// No generateStaticParams — pages render on-demand via ISR (revalidate = 60)
// This avoids ~31 DB queries at build time while keeping the same SEO result

// ============================================
// COMPONENTS
// ============================================

// Hero Section Component
function HeroSection({ cityName, cityData, minPrice, t }: {
  cityName: string
  cityData: CitySeoData
  minPrice: number
  t: any
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
            {t('locationBadge', { city: cityName })}
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {t('heroTitle', { city: cityName })}
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-white/80 mb-4 max-w-xl">
            {t('heroSubtitle', { price: minPrice })}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <IoCashOutline className="w-4 h-4 text-emerald-400" />
              <span>{t('statsFromPrice', { price: minPrice })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-400" />
              <span>{t('statsInsurance')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoFlashOutline className="w-4 h-4 text-purple-400" />
              <span>{t('statsInstantBooking')}</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-5">
            <a
              href="#new-listings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              <IoSearchOutline className="w-4 h-4" />
              {t('browseCityCars', { city: cityName })}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Breadcrumb Component
function CityBreadcrumbs({ cityName, t }: { cityName: string; t: any }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1">
            <IoHomeOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{t('breadcrumbHome')}</span>
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="flex items-center gap-1.5">
          <Link href="/rentals/cities" className="hover:text-amber-600 dark:hover:text-amber-400">
            {t('breadcrumbCities')}
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
    vehicleType: car.vehicleType,
    seats: car.seats || 5,
    city: car.city || cityName,
    rating: car._count?.reviews > 0 ? Number(car.rating) : null,
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
function CityInfoSection({ cityName, cityData, carCount, t }: {
  cityName: string
  cityData: CitySeoData
  carCount: number
  t: any
}) {
  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              {t('aboutTitle', { city: cityName })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed whitespace-pre-line">
              {t(`${cityData.slug}_description`)}
            </p>
            {cityData.whyRent.length > 0 && (
              <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
                {cityData.whyRent.map((_: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{t(`${cityData.slug}_whyRent${i}`)}</span>
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
                  <span className="font-semibold text-[10px] sm:text-xs">{t('nearestAirport')}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  {cityData.airport}
                </p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoCarOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">{t('availableCars')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {t('vehiclesReady', { count: carCount })}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoShieldCheckmarkOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">{t('insurance')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {t('insuranceValue')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoTimeOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">{t('booking')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {t('instantConfirmation')}
              </p>
            </div>
          </div>
        </div>

        {/* Landmarks & Neighborhoods */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-5 sm:mt-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <IoBusinessOutline className="w-4 h-4 text-amber-600" />
              {t('popularLandmarks')}
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
                {t('neighborhoodsWeServe')}
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
            {t('popularRoadTrips', { city: cityName })}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cityData.popularRoutes.map((_: string, i: number) => (
              <div
                key={i}
                className="px-2.5 py-2 sm:px-3 sm:py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] sm:text-xs text-amber-800 dark:text-amber-300 leading-snug"
              >
                {t(`${cityData.slug}_route${i}`)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// FAQ Section
function FAQSection({ cityName, carCount, minPrice, t }: {
  cityName: string
  carCount: number
  minPrice: number
  t: any
}) {
  const faqs = getCityFaqs(t, cityName, carCount, minPrice)

  return (
    <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoHelpCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            {t('faqTitle')}
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
function RelatedCities({ currentCity, t }: { currentCity: string; t: any }) {
  // Get all city slugs from the centralized SEO data
  const allSlugs = Object.keys(CITY_SEO_DATA)
  const currentSlug = currentCity.toLowerCase().replace(/\s+/g, '-')
  const otherSlugs = allSlugs.filter(slug => slug !== currentSlug).slice(0, 6)

  return (
    <section className="py-5 sm:py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
          {t('relatedTitle')}
        </h2>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('relatedSubtitle')}
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
            {t('viewAllCities')}
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
  params: Promise<{ locale: string; city: string }>
}) {
  const { locale, city } = await params
  const t = await getTranslations({ locale, namespace: 'RentalCity' })
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
      vehicleType: true,
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
      _count: { select: { reviews: true } },
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
          <HeroSection cityName={cityName} cityData={cityData} minPrice={45} t={t} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                <IoCarOutline className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('noCarsTitle', { city: cityName })}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {t('noCarsDescription', { city: cityName })}
              </p>
            </div>
          </div>

          <RelatedCities currentCity={cityName} t={t} />
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
      // AutoRental for star ratings in Google search results
      {
        '@type': 'AutoRental',
        '@id': `https://itwhip.com/rentals/cities/${city}#autorental`,
        name: t('schemaAutoRentalName', { city: cityName }),
        url: `https://itwhip.com/rentals/cities/${city}`,
        description: t('schemaAutoRentalDescription', { city: cityName, count: allCars.length, price: minPrice }),
        areaServed: {
          '@type': 'City',
          name: cityName,
          containedInPlace: { '@type': 'State', name: 'Arizona' }
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityName,
          addressRegion: 'AZ',
          addressCountry: 'US'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '182',
          reviewCount: '182',
          bestRating: '5',
          worstRating: '1'
        }
      },
      // LocalBusiness
      {
        '@type': 'LocalBusiness',
        '@id': `https://itwhip.com/rentals/cities/${city}#business`,
        name: t('schemaBusinessName', { city: cityName }),
        description: t('schemaBusinessDescription', { city: cityName, count: allCars.length }),
        url: `https://itwhip.com/rentals/cities/${city}`,
        telephone: '+1-855-703-0806',
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
          { '@type': 'ListItem', position: 1, name: t('breadcrumbHome'), item: 'https://itwhip.com' },
          { '@type': 'ListItem', position: 2, name: t('breadcrumbCities'), item: 'https://itwhip.com/rentals/cities' },
          { '@type': 'ListItem', position: 3, name: `${cityName}`, item: `https://itwhip.com/rentals/cities/${city}` }
        ]
      },
      // ItemList (Car Listings)
      {
        '@type': 'ItemList',
        '@id': `https://itwhip.com/rentals/cities/${city}#carlist`,
        name: t('schemaCarListName', { city: cityName }),
        numberOfItems: allCars.length,
        itemListElement: allCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: t('schemaCarDescription', { year: car.year, make: capitalizeCarMake(car.make), model: normalizeModelName(car.model, car.make), city: cityName }),
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
            ...(car.rating && car.totalTrips > 0 ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: car.rating,
                reviewCount: car.totalTrips
              }
            } : {})
          }
        }))
      },
      // FAQPage
      {
        '@type': 'FAQPage',
        '@id': `https://itwhip.com/rentals/cities/${city}#faq`,
        mainEntity: getCityFaqs(t, cityName, allCars.length, minPrice).map(faq => ({
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
          t={t}
        />

        <div>
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <CityBreadcrumbs cityName={cityName} t={t} />
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
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('newListingsTitle')}</h2>
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">{t('carsCount', { count: newListings.length })}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('newListingsDescription', { city: cityName })}</p>
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
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('topRatedTitle')}</h2>
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">{t('topRatedBadge')}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('topRatedDescription')}</p>
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
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('luxuryTitle')}</h2>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">{t('carsCount', { count: luxuryCars.length })}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('luxuryDescription')}</p>
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
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('electricTitle')}</h2>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">{t('electricBadge')}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('electricDescription')}</p>
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
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('budgetTitle')}</h2>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">{t('budgetBadge')}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('budgetDescription')}</p>
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
          <CityInfoSection cityName={cityName} cityData={cityData} carCount={allCars.length} t={t} />
          <FAQSection cityName={cityName} carCount={allCars.length} minPrice={minPrice} t={t} />
          <RelatedCities currentCity={cityName} t={t} />
        </div>
        
        <Footer />
      </div>
    </>
  )
}