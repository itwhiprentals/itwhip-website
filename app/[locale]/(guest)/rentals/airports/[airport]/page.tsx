// app/(guest)/rentals/airports/[airport]/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { HOST_CARD_SELECT } from '@/app/lib/database/host-select'
import { getAirportBySlug, AIRPORT_DATA, type AirportData } from '@/app/lib/data/airports'
import {
  IoAirplaneOutline,
  IoCarOutline,
  IoLocationOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCashOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoCallOutline,
  IoNavigateOutline,
  IoPersonOutline
} from 'react-icons/io5'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// No generateStaticParams — pages render on-demand via ISR (revalidate = 60)

// ============================================
// METADATA GENERATION
// ============================================
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; airport: string }>
}): Promise<Metadata> {
  const { locale, airport } = await params
  const airportData = getAirportBySlug(airport)
  const t = await getTranslations({ locale, namespace: 'AirportPage' })

  if (!airportData) {
    return { title: t('metaNotFound') }
  }

  const carCount = await prisma.rentalCar.count({
    where: {
      isActive: true,
      airportPickup: true
    }
  })

  return {
    title: airportData.metaTitle,
    description: airportData.metaDescription,
    keywords: [
      `${airportData.code} car rental`,
      `${airportData.name} airport rental`,
      `rent car ${airportData.code}`,
      `${airportData.name} airport pickup`,
      `car rental phoenix airport`,
      'airport car delivery',
      'peer to peer car rental',
      'turo alternative',
      ...airportData.nearbyAreas.map(area => `${area} car rental`)
    ],
    openGraph: {
      title: t('metaOgTitle', { name: airportData.name, count: carCount }),
      description: airportData.metaDescription,
      url: getCanonicalUrl(`/rentals/airports/${airport}`, locale),
      locale: getOgLocale(locale),
      images: [{
        url: 'https://itwhip.com/og/airports/arizona-airport.png',
        width: 1200,
        height: 630,
        alt: t('metaOgImageAlt', { fullName: airportData.fullName })
      }],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTwitterTitle', { name: airportData.name }),
      description: airportData.metaDescription,
      images: ['https://itwhip.com/og/airports/arizona-airport.png']
    },
    alternates: {
      canonical: getCanonicalUrl(`/rentals/airports/${airport}`, locale),
      languages: getAlternateLanguages(`/rentals/airports/${airport}`),
    },
  }
}

// ============================================
// HELPER FUNCTION
// ============================================
function transformCarForCompactCard(car: any) {
  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    seats: car.seats || 5,
    city: car.city,
    rating: car.rating ? Number(car.rating) : null,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto,
      isBusinessHost: car.host.isBusinessHost,
      partnerCompanyName: car.host.partnerCompanyName,
      partnerLogo: car.host.partnerLogo,
      partnerSlug: car.host.partnerSlug,
      hostType: car.host.hostType
    } : null
  }
}

// ============================================
// COMPONENTS
// ============================================

// Hero Section
function HeroSection({ airportData, carCount, minPrice, t }: {
  airportData: AirportData
  carCount: number
  minPrice: number
  t: any
}) {
  return (
    <section className="relative h-[280px] sm:h-[320px] lg:h-[380px] overflow-hidden">
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
          {/* Airport Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium mb-3">
            <IoAirplaneOutline className="w-3.5 h-3.5" />
            {airportData.code} - {airportData.fullName}
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {airportData.h1}
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-white/80 mb-4 max-w-xl">
            {airportData.heroSubtitle}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <IoCarOutline className="w-4 h-4 text-amber-400" />
              <span>{t('heroCarsAvailable', { count: carCount })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoCashOutline className="w-4 h-4 text-emerald-400" />
              <span>{t('heroFromPrice', { price: minPrice })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-400" />
              <span>{t('heroInsurance')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoFlashOutline className="w-4 h-4 text-purple-400" />
              <span>{t('heroCurbsideDelivery')}</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-5">
            <a
              href="#available-cars"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              <IoCarOutline className="w-4 h-4" />
              {t('heroBrowseCars', { code: airportData.code })}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Breadcrumbs
function Breadcrumbs({ airportData, t }: { airportData: AirportData; t: any }) {
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
          <Link href="/rentals" className="hover:text-amber-600 dark:hover:text-amber-400">
            {t('breadcrumbRentals')}
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="flex items-center gap-1.5">
          <span className="text-gray-600 dark:text-gray-300">{t('breadcrumbAirports')}</span>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="text-gray-800 dark:text-gray-200 font-medium">
          {airportData.name} ({airportData.code})
        </li>
      </ol>
    </nav>
  )
}

// How Pickup Works Section
function HowPickupWorks({ airportData, t }: { airportData: AirportData; t: any }) {
  const steps = [
    {
      icon: IoCarOutline,
      title: t('stepBrowseBookTitle'),
      description: t('stepBrowseBookDesc', { code: airportData.code })
    },
    {
      icon: IoAirplaneOutline,
      title: t('stepLandTextTitle'),
      description: t('stepLandTextDesc')
    },
    {
      icon: IoNavigateOutline,
      title: t('stepMeetCurbsideTitle'),
      description: t('stepMeetCurbsideDesc')
    },
    {
      icon: IoCheckmarkCircleOutline,
      title: t('stepQuickHandoffTitle'),
      description: t('stepQuickHandoffDesc')
    }
  ]

  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <IoAirplaneOutline className="w-5 h-5 text-amber-600" />
          {t('howPickupWorksHeading', { code: airportData.code })}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <step.icon className="w-8 h-8 text-amber-600 mb-2" />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{step.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Airport Info Section
function AirportInfoSection({ airportData, t }: { airportData: AirportData; t: any }) {
  return (
    <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              {t('aboutAirport', { fullName: airportData.fullName })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {airportData.description}
            </p>
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoAirplaneOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">{t('airportCode')}</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                {airportData.code}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoLocationOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">{t('terminals')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {airportData.terminals.join(', ')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoNavigateOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">{t('pickupLocations')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {t('pickupLocationsCount', { count: airportData.pickupLocations.length })}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoTimeOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">{t('pickupTime')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {t('pickupTimeValue')}
              </p>
            </div>
          </div>
        </div>

        {/* Pickup Locations */}
        <div className="mt-5 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <IoLocationOutline className="w-4 h-4 text-amber-600" />
            {t('pickupLocationsAt', { code: airportData.code })}
          </h3>
          <div className="flex flex-wrap gap-2">
            {airportData.pickupLocations.map((location, i) => (
              <span key={i} className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] sm:text-xs rounded-full">
                {location}
              </span>
            ))}
          </div>
        </div>

        {/* Nearby Areas */}
        <div className="mt-5 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <IoNavigateOutline className="w-4 h-4 text-amber-600" />
            {t('nearbyAreas')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {airportData.nearbyAreas.map((area, i) => (
              <Link
                key={i}
                href={`/rentals/cities/${area.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                {area}
              </Link>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-5 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <IoCheckmarkCircleOutline className="w-4 h-4 text-amber-600" />
            {t('pickupTips')}
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {airportData.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// FAQ Section
function FAQSection({ airportData, t }: { airportData: AirportData; t: any }) {
  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoHelpCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            {t('faqHeading', { code: airportData.code })}
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {airportData.faqs.map((faq, i) => (
              <details key={i} className="group bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {faq.question}
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Related Airports Section
function RelatedAirports({ currentSlug, t }: { currentSlug: string; t: any }) {
  const otherAirports = Object.entries(AIRPORT_DATA)
    .filter(([slug]) => slug !== currentSlug)

  if (otherAirports.length === 0) return null

  return (
    <section className="py-5 sm:py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
          {t('otherAirportsHeading')}
        </h2>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('otherAirportsSubtitle')}
        </p>
        <div className="flex flex-wrap gap-2">
          {otherAirports.map(([slug, data]) => (
            <Link
              key={slug}
              href={`/rentals/airports/${slug}`}
              className="group px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <span className="text-xs sm:text-sm font-medium">{data.name}</span>
              <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-amber-500">
                ({data.code})
              </span>
              <span className="ml-1 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default async function AirportPage({
  params
}: {
  params: Promise<{ airport: string }>
}) {
  const { airport } = await params
  const airportData = getAirportBySlug(airport)

  if (!airportData) {
    notFound()
  }

  const t = await getTranslations('AirportPage')

  // Fetch cars with airport pickup
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      airportPickup: true
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      seats: true,
      dailyRate: true,
      city: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      photos: {
        select: { url: true, caption: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: { select: HOST_CARD_SELECT }
    },
    orderBy: [
      { instantBook: 'desc' },
      { rating: 'desc' }
    ],
    take: 24
  })

  const carCount = cars.length
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => Number(c.dailyRate))) : 79
  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => Number(c.dailyRate))) : 999

  // Calculate priceValidUntil for structured data (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Generate JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // LocalBusiness
      {
        '@type': 'LocalBusiness',
        '@id': `https://itwhip.com/rentals/airports/${airport}#business`,
        name: `ItWhip Car Rentals - ${airportData.fullName}`,
        description: airportData.description,
        url: `https://itwhip.com/rentals/airports/${airport}`,
        telephone: '+1-855-703-0806',
        address: {
          '@type': 'PostalAddress',
          addressLocality: airportData.nearbyAreas[0] || 'Phoenix',
          addressRegion: 'AZ',
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: airportData.coordinates.lat,
          longitude: airportData.coordinates.lng
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
        '@id': `https://itwhip.com/rentals/airports/${airport}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
          { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://itwhip.com/rentals' },
          { '@type': 'ListItem', position: 3, name: 'Airports', item: 'https://itwhip.com/rentals/airports' },
          { '@type': 'ListItem', position: 4, name: `${airportData.name} (${airportData.code})`, item: `https://itwhip.com/rentals/airports/${airport}` }
        ]
      },
      // ItemList (Car Listings)
      {
        '@type': 'ItemList',
        '@id': `https://itwhip.com/rentals/airports/${airport}#carlist`,
        name: `Car Rentals at ${airportData.fullName}`,
        numberOfItems: carCount,
        itemListElement: cars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Rent this ${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)} at ${airportData.code}`,
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
                refundType: 'https://schema.org/FullRefund'
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
                    maxValue: 1,
                    unitCode: 'd'
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
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
        '@id': `https://itwhip.com/rentals/airports/${airport}#faq`,
        mainEntity: airportData.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      },
      // HowTo (for pickup process)
      {
        '@type': 'HowTo',
        '@id': `https://itwhip.com/rentals/airports/${airport}#howto`,
        name: `How to Pick Up Your Rental Car at ${airportData.code}`,
        description: `Step-by-step guide to picking up your rental car at ${airportData.fullName}`,
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Browse & Book',
            text: `Browse available cars with ${airportData.code} airport pickup and complete your booking on ItWhip.`
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Land & Text Your Host',
            text: 'When your flight lands, text your host through the ItWhip app to let them know you\'ve arrived.'
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Meet at Arrivals',
            text: `Your host will meet you curbside at ${airportData.pickupLocations[0] || 'arrivals'}. No shuttle buses required.`
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Complete Handoff',
            text: 'Do a quick vehicle walkthrough, sign digitally, and you\'re ready to drive!'
          }
        ]
      }
    ]
  }

  // Categorize cars
  const luxuryCars = cars.filter(car =>
    car.carType === 'LUXURY' || car.carType === 'CONVERTIBLE' || Number(car.dailyRate) >= 200 ||
    ['mercedes', 'bmw', 'audi', 'tesla', 'porsche', 'lamborghini', 'ferrari', 'bentley']
      .some(brand => car.make.toLowerCase().includes(brand))
  )

  const economyCars = cars.filter(car => Number(car.dailyRate) <= 100)

  const suvCars = cars.filter(car => car.carType === 'SUV')

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
          airportData={airportData}
          carCount={carCount}
          minPrice={minPrice}
          t={t}
        />

        <div>
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <Breadcrumbs airportData={airportData} t={t} />
          </div>

          {/* All Available Cars */}
          <section id="available-cars" className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-0.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {t('carsWithPickup', { code: airportData.code })}
                    </h2>
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                      {t('availableCount', { count: carCount })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('skipRentalCounter', { name: airportData.name })}
                  </p>
                </div>
              </div>

              {cars.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {cars.map((car) => (
                    <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('noCarsTitle')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noCarsDescription')}
                  </p>
                  <Link
                    href="/rentals/search"
                    className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                  >
                    {t('browseAllCars')}
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Luxury Cars Section */}
          {luxuryCars.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {t('luxuryPremium')}
                    </h2>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                      {t('carsCount', { count: luxuryCars.length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {luxuryCars.slice(0, 10).map((car) => (
                      <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="purple" />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* SUV Section */}
          {suvCars.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {t('suvsForAdventures')}
                    </h2>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">
                      {t('suvsCount', { count: suvCars.length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {suvCars.slice(0, 10).map((car) => (
                      <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="emerald" />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Budget Section */}
          {economyCars.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {t('budgetFriendly')}
                    </h2>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                      {t('under100PerDay')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {economyCars.slice(0, 10).map((car) => (
                      <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="blue" />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* How Pickup Works */}
          <HowPickupWorks airportData={airportData} t={t} />

          {/* Airport Info */}
          <AirportInfoSection airportData={airportData} t={t} />

          {/* FAQs */}
          <FAQSection airportData={airportData} t={t} />

          {/* Related Airports */}
          <RelatedAirports currentSlug={airport} t={t} />
        </div>

        <Footer />
      </div>
    </>
  )
}
