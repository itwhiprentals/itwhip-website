// app/(guest)/rentals/types/[type]/page.tsx
import { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { HOST_CARD_SELECT } from '@/app/lib/database/host-select'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'
import {
  IoCarOutline,
  IoCarSportOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// HERO IMAGE MAPPINGS
// ============================================
const TYPE_HERO_IMAGES: Record<string, string> = {
  'sedan': '/images/types/sedan-car-rental-phoenix-arizona.jpg',
  'suv': '/images/types/suv-car-rental-phoenix-arizona.jpg',
  'sports': '/images/types/sports-car-rental-phoenix-arizona.jpg',
  'electric': '/images/types/electric-car-rental-phoenix-arizona.jpg',
  'luxury': '/images/types/luxury-car-rental-phoenix-arizona.png',
  'truck': '/images/types/truck-car-rental-phoenix-arizona.png',
}

// ============================================
// SLUG → TRANSLATION KEY MAPPING
// ============================================
const SLUG_TO_KEY: Record<string, string> = {
  'suv': 'suv',
  'luxury': 'luxury',
  'sports': 'sports',
  'sedan': 'sedan',
  'convertible': 'convertible',
  'truck': 'truck',
  'electric': 'electric',
  'coupe': 'coupe',
  'exotic': 'exotic',
  'pickup-truck': 'pickupTruck',
  '7-seater': 'sevenSeater',
  '8-seater': 'eightSeater',
  'economy': 'economy',
  'family': 'family',
}

// ============================================
// CAR TYPE DATA (non-translatable fields only)
// ============================================
const CAR_TYPE_DATA: Record<string, {
  dbValue: string
  icon: string
  keywords: string[]
  popularMakes: string[]
  priceRange: string
}> = {
  'suv': {
    dbValue: 'SUV',
    icon: 'suv',
    keywords: ['suv rental phoenix', 'suv rental arizona', 'rent suv phoenix az', 'family car rental phoenix', 'large car rental arizona'],
    popularMakes: ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Jeep', 'Land Rover'],
    priceRange: '$45-150/day'
  },
  'luxury': {
    dbValue: 'LUXURY',
    icon: 'luxury',
    keywords: ['luxury car rental phoenix', 'premium car rental arizona', 'exotic car rental scottsdale', 'high end car rental phoenix', 'mercedes rental phoenix'],
    popularMakes: ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Porsche', 'Maserati'],
    priceRange: '$100-500/day'
  },
  'sports': {
    dbValue: 'SPORTS',
    icon: 'sports',
    keywords: ['sports car rental phoenix', 'performance car rental arizona', 'porsche rental phoenix', 'corvette rental arizona', 'mustang rental phoenix'],
    popularMakes: ['Porsche', 'Chevrolet', 'Ford', 'BMW', 'Dodge', 'Nissan'],
    priceRange: '$150-800/day'
  },
  'sedan': {
    dbValue: 'SEDAN',
    icon: 'sedan',
    keywords: ['sedan rental phoenix', 'car rental phoenix az', 'economy car rental arizona', 'business car rental phoenix', 'commuter car rental'],
    popularMakes: ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus'],
    priceRange: '$35-120/day'
  },
  'convertible': {
    dbValue: 'CONVERTIBLE',
    icon: 'convertible',
    keywords: ['convertible rental phoenix', 'drop top rental arizona', 'cabriolet rental phoenix', 'open top car rental', 'mustang convertible rental'],
    popularMakes: ['Ford', 'Chevrolet', 'BMW', 'Porsche', 'Mercedes-Benz', 'Mazda'],
    priceRange: '$80-400/day'
  },
  'truck': {
    dbValue: 'TRUCK',
    icon: 'truck',
    keywords: ['truck rental phoenix', 'pickup rental arizona', 'f150 rental phoenix', 'moving truck rental', 'towing vehicle rental arizona'],
    popularMakes: ['Ford', 'Chevrolet', 'Toyota', 'Ram', 'GMC', 'Nissan'],
    priceRange: '$60-180/day'
  },
  'electric': {
    dbValue: 'ELECTRIC',
    icon: 'electric',
    keywords: ['electric car rental phoenix', 'tesla rental arizona', 'ev rental phoenix', 'zero emission car rental', 'green car rental arizona'],
    popularMakes: ['Tesla', 'Rivian', 'BMW', 'Mercedes-Benz', 'Porsche', 'Audi'],
    priceRange: '$80-300/day'
  },
  'coupe': {
    dbValue: 'COUPE',
    icon: 'coupe',
    keywords: ['coupe rental phoenix', 'two door car rental arizona', 'bmw coupe rental', 'mercedes coupe rental', 'sports coupe rental phoenix'],
    popularMakes: ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Lexus', 'Infiniti'],
    priceRange: '$100-400/day'
  },
  'exotic': {
    dbValue: 'EXOTIC',
    icon: 'exotic',
    keywords: ['exotic car rental phoenix', 'lamborghini rental arizona', 'ferrari rental phoenix', 'supercar rental scottsdale', 'bentley rental phoenix', 'rolls royce rental arizona'],
    popularMakes: ['Lamborghini', 'Ferrari', 'Bentley', 'Rolls-Royce', 'McLaren', 'Aston Martin'],
    priceRange: '$500-2000/day'
  },
  'pickup-truck': {
    dbValue: 'TRUCK',
    icon: 'truck',
    keywords: ['pickup truck rental phoenix', 'truck rental arizona', 'f150 rental phoenix', 'silverado rental arizona', 'ram truck rental phoenix'],
    popularMakes: ['Ford', 'Chevrolet', 'Ram', 'Toyota', 'GMC', 'Nissan'],
    priceRange: '$65-200/day'
  },
  '7-seater': {
    dbValue: 'SUV',
    icon: 'suv',
    keywords: ['7 seater rental phoenix', '7 passenger suv rental arizona', 'large family car rental', 'group vehicle rental phoenix', 'minivan rental arizona'],
    popularMakes: ['Toyota', 'Honda', 'Chevrolet', 'Ford', 'Kia', 'Chrysler'],
    priceRange: '$75-175/day'
  },
  '8-seater': {
    dbValue: 'SUV',
    icon: 'suv',
    keywords: ['8 seater rental phoenix', '8 passenger suv rental arizona', 'large group vehicle rental', 'passenger van rental phoenix', 'extended family car rental'],
    popularMakes: ['Chevrolet', 'Ford', 'GMC', 'Toyota', 'Nissan', 'Mercedes-Benz'],
    priceRange: '$85-225/day'
  },
  'economy': {
    dbValue: 'SEDAN',
    icon: 'sedan',
    keywords: ['cheap car rental phoenix', 'economy car rental arizona', 'budget car rental phoenix', 'affordable rental car arizona', 'fuel efficient rental phoenix'],
    popularMakes: ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda'],
    priceRange: '$29-55/day'
  },
  'family': {
    dbValue: 'SUV',
    icon: 'suv',
    keywords: ['family car rental phoenix', 'family suv rental arizona', 'minivan rental phoenix', 'car seat friendly rental', 'kid friendly car rental'],
    popularMakes: ['Toyota', 'Honda', 'Chevrolet', 'Ford', 'Kia', 'Chrysler'],
    priceRange: '$55-150/day'
  }
}

// No generateStaticParams — pages render on-demand via ISR (revalidate = 60)

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; type: string }>
}): Promise<Metadata> {
  const { locale, type } = await params
  const typeData = CAR_TYPE_DATA[type.toLowerCase()]
  const tKey = SLUG_TO_KEY[type.toLowerCase()]

  if (!typeData || !tKey) {
    const t = await getTranslations({ locale, namespace: 'RentalType' })
    return { title: t('metaNotFound') }
  }

  const t = await getTranslations({ locale, namespace: 'RentalType' })
  const displayName = t(`${tKey}DisplayName`)
  const description = t(`${tKey}Description`)

  const title = t('metaTitle', { type: displayName })

  const heroImage = TYPE_HERO_IMAGES[type.toLowerCase()]
    ? `https://itwhip.com${TYPE_HERO_IMAGES[type.toLowerCase()]}`
    : 'https://itwhip.com/og-default-car.jpg'
  const altText = t('heroImageAlt', { type: displayName })

  return {
    title,
    description,
    keywords: typeData.keywords,
    openGraph: {
      title,
      description,
      url: getCanonicalUrl(`/rentals/types/${type}`, locale),
      siteName: 'ItWhip',
      locale: getOgLocale(locale),
      type: 'website',
      images: [{
        url: heroImage,
        width: 1200,
        height: 630,
        alt: altText
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [heroImage]
    },
    alternates: {
      canonical: getCanonicalUrl(`/rentals/types/${type}`, locale),
      languages: getAlternateLanguages(`/rentals/types/${type}`)
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

// Page component
export default async function CarTypePage({
  params
}: {
  params: Promise<{ locale: string; type: string }>
}) {
  const { locale, type } = await params
  const typeData = CAR_TYPE_DATA[type.toLowerCase()]
  const tKey = SLUG_TO_KEY[type.toLowerCase()]

  if (!typeData || !tKey) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'RentalType' })
  const displayName = t(`${tKey}DisplayName`)
  const description = t(`${tKey}Description`)
  const longDescription = t(`${tKey}LongDescription`)
  const idealFor = Array.from({ length: 5 }, (_, i) => t(`${tKey}IdealFor${i}`))

  // Fetch cars of this type from database
  const LUXURY_MAKES = ['Mercedes-Benz', 'Bentley', 'Rolls-Royce', 'Maybach', 'Maserati', 'Aston Martin']
  const PREMIUM_MAKES = ['BMW', 'Audi', 'Lexus', 'Porsche', 'Cadillac', 'Land Rover', 'Jaguar', 'Genesis', 'Lincoln']
  const SPORTS_MODELS = ['911', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'AMG', 'RS', 'Hellcat', 'SRT', 'Corvette', 'GT', 'Cayman', 'Boxster', 'Type R', 'GR86', 'Supra']

  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      ...(type.toLowerCase() === 'electric' ? {
        OR: [
          { carType: { equals: 'ELECTRIC', mode: 'insensitive' } },
          { fuelType: { in: ['electric', 'ELECTRIC', 'Electric'] } }
        ]
      } : type.toLowerCase() === 'luxury' ? {
        OR: [
          { carType: { equals: 'LUXURY', mode: 'insensitive' } },
          { AND: [
            { make: { in: LUXURY_MAKES, mode: 'insensitive' } },
            { dailyRate: { gte: 150 } }
          ]},
          { make: { in: ['Bentley', 'Rolls-Royce', 'Maybach'], mode: 'insensitive' } }
        ]
      } : type.toLowerCase() === 'sports' ? {
        OR: [
          { carType: { equals: 'SPORTS', mode: 'insensitive' } },
          { model: { contains: 'Hellcat', mode: 'insensitive' } },
          { model: { contains: 'SRT', mode: 'insensitive' } },
          { model: { contains: 'AMG', mode: 'insensitive' } },
          { model: { contains: 'M4', mode: 'insensitive' } },
          { model: { contains: 'M6', mode: 'insensitive' } },
          { model: { contains: 'RS 7', mode: 'insensitive' } },
          { model: { contains: '911', mode: 'insensitive' } },
          { model: { contains: 'Cayman', mode: 'insensitive' } },
          { model: { contains: 'GR86', mode: 'insensitive' } },
          { model: { contains: 'Corvette', mode: 'insensitive' } }
        ]
      } : {
        carType: { equals: typeData.dbValue, mode: 'insensitive' }
      })
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      vehicleType: true,
      dailyRate: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      fuelType: true,
      seats: true,
      esgScore: true,
      photos: {
        select: { url: true },
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

  // Transform cars for CompactCarCard component
  const transformedCars = cars.map(car => ({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    vehicleType: car.vehicleType as 'RENTAL' | 'RIDESHARE' | null,
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
  }))

  // Generate schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbHome'), item: 'https://itwhip.com' },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbRentals'), item: 'https://itwhip.com/rentals' },
      { '@type': 'ListItem', position: 3, name: t('breadcrumbTypeRentals', { type: displayName }), item: `https://itwhip.com/rentals/types/${type}` }
    ]
  }

  const autoRentalSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': `https://itwhip.com/rentals/types/${type}#autorental`,
    name: t('schemaRentalName', { type: displayName }),
    url: `https://itwhip.com/rentals/types/${type}`,
    description,
    areaServed: {
      '@type': 'State',
      name: 'Arizona',
      containedInPlace: { '@type': 'Country', name: 'United States' }
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Phoenix',
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
  }

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('heroTitle', { type: displayName }),
    description,
    numberOfItems: cars.length,
    itemListElement: cars.slice(0, 10).map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
        description: t('schemaRentDescription', { year: car.year, make: capitalizeCarMake(car.make), model: normalizeModelName(car.model, car.make), city: car.city }),
        image: car.photos?.[0]?.url || '',
        url: `https://itwhip.com${generateCarUrl({ id: car.id, make: car.make, model: car.model, year: car.year, city: car.city })}`,
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
  }

  // Get related types (exclude current)
  const relatedTypes = Object.entries(CAR_TYPE_DATA)
    .filter(([key]) => key !== type.toLowerCase())
    .slice(0, 4)

  return (
    <>
      <Script
        id="autorental-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(autoRentalSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <Header />

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1">
                <IoHomeOutline className="w-4 h-4" />
                {t('breadcrumbHome')}
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <Link href="/rentals" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                {t('breadcrumbRentals')}
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                {t('breadcrumbTypeRentals', { type: displayName })}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        {TYPE_HERO_IMAGES[type.toLowerCase()] ? (
          <section className="relative h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden">
            <Image
              src={TYPE_HERO_IMAGES[type.toLowerCase()]}
              alt={t('heroImageAlt', { type: displayName })}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <IoCarSportOutline className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    {t('heroTitle', { type: displayName })}
                  </h1>
                </div>
                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mb-4 line-clamp-2 sm:line-clamp-none">
                  {description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-white/80 text-xs sm:text-sm">{t('availableNow')}</span>
                    <p className="text-lg sm:text-2xl font-bold text-white">{t('vehicleCount', { count: cars.length })}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-white/80 text-xs sm:text-sm">{t('startingAt')}</span>
                    <p className="text-lg sm:text-2xl font-bold text-white">{typeData.priceRange.split('-')[0]}{t('perDay')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-4">
                <IoCarSportOutline className="w-10 h-10" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  {t('heroTitle', { type: displayName })}
                </h1>
              </div>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-6">
                {longDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-purple-100 text-sm">{t('availableNow')}</span>
                  <p className="text-2xl font-bold">{t('vehicleCount', { count: cars.length })}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-purple-100 text-sm">{t('priceRangeLabel')}</span>
                  <p className="text-2xl font-bold">{typeData.priceRange}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Ideal For Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              {t('idealForTitle')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {idealFor.map((use, i) => (
                <span
                  key={i}
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-200 dark:border-purple-700"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Car Listings */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('availableTitle', { type: displayName })}
            </h2>

            {transformedCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {transformedCars.map((car) => (
                  <CompactCarCard key={car.id} car={car} accentColor="purple" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('noVehiclesTitle', { type: displayName })}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('noVehiclesDescription')}
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {t('browseAllCars')}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Popular Makes in This Category */}
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('popularMakesTitle', { type: displayName })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {typeData.popularMakes.map((make) => (
                <Link
                  key={make}
                  href={`/rentals/makes/${make.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center hover:bg-purple-50 dark:hover:bg-purple-900/20 transition group border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
                >
                  <span className="text-gray-900 dark:text-white font-medium group-hover:text-purple-600">
                    {make}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Related Types */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('browseOtherTypes')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedTypes.map(([key]) => {
                const relatedTKey = SLUG_TO_KEY[key]
                return (
                  <Link
                    key={key}
                    href={`/rentals/types/${key}`}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition group border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <IoCarSportOutline className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600">
                      {t('typeRentals', { type: t(`${relatedTKey}DisplayName`) })}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {CAR_TYPE_DATA[key].priceRange}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
