// app/(guest)/rentals/page.tsx
// Server Component - Car Listings Page (Catalog Style)

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import prisma from '@/app/lib/database/prisma'
import CarFilters from './components/CarFilters'
import CarGrid from './components/CarGrid'
import Breadcrumbs from './components/Breadcrumbs'
import Footer from '@/app/components/Footer'
import { IoCarSportOutline } from 'react-icons/io5'
import { MERCHANT_RETURN_POLICY, SHIPPING_DETAILS } from '@/app/lib/seo/return-policy'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'


interface SearchParams {
  type?: string
  make?: string
  priceMin?: string
  priceMax?: string
  price?: string
  page?: string
}

// Dynamic meta tags based on filters
export async function generateMetadata({
  params: localeParams,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const { locale } = await localeParams
  const t = await getTranslations('SeoMeta')
  const tc = await getTranslations('RentalsCatalog')
  const params = await searchParams
  const type = params?.type
  const make = params?.make

  const TYPE_LABELS_I18N: Record<string, string> = {
    suv: tc('suvs'),
    sedan: tc('sedans'),
    luxury: tc('luxuryCars'),
    electric: tc('electricVehicles'),
    truck: tc('trucks'),
    sports: tc('sportsCars'),
    convertible: tc('convertibles')
  }

  let title = t('rentalsTitle')
  let description = t('rentalsDescription')

  if (type && make) {
    const typeLabel = TYPE_LABELS_I18N[type.toLowerCase()] || type
    title = t('rentalsTypeMakeTitle', { make, type: typeLabel })
    description = t('rentalsTypeMakeDescription', { make, type: typeLabel })
  } else if (type) {
    const typeLabel = TYPE_LABELS_I18N[type.toLowerCase()] || type
    title = t('rentalsTypeTitle', { type: typeLabel })
    description = t('rentalsTypeDescription', { type: typeLabel })
  } else if (make) {
    title = t('rentalsMakeTitle', { make })
    description = t('rentalsMakeDescription', { make })
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: getCanonicalUrl('/rentals', locale),
      siteName: 'ItWhip',
      locale: getOgLocale(locale),
      images: [
        {
          url: 'https://itwhip.com/og-rentals.jpg',
          width: 1200,
          height: 630,
          alt: 'ItWhip Car Rentals'
        }
      ],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    alternates: {
      canonical: getCanonicalUrl('/rentals', locale),
      languages: getAlternateLanguages('/rentals'),
    }
  }
}

const ITEMS_PER_PAGE = 20

export default async function RentalsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const t = await getTranslations('RentalsCatalog')
  const params = await searchParams
  const currentPage = parseInt(params?.page || '1', 10)

  // Build Prisma where clause from filters
  const whereClause: any = {
    isActive: true,
    // Only show cars from approved hosts (same filter as search page)
    host: {
      approvalStatus: 'APPROVED'
    }
  }

  if (params?.type && params.type !== 'all') {
    // Case-insensitive carType matching
    whereClause.carType = { equals: params.type.toUpperCase(), mode: 'insensitive' }
  }

  if (params?.make) {
    whereClause.make = {
      equals: params.make,
      mode: 'insensitive'
    }
  }

  if (params?.priceMin || params?.priceMax) {
    whereClause.dailyRate = {}
    if (params.priceMin) whereClause.dailyRate.gte = parseFloat(params.priceMin)
    if (params.priceMax) whereClause.dailyRate.lte = parseFloat(params.priceMax)
  }

  // Fetch cars and counts in parallel
  const [cars, totalCount, makesData] = await Promise.all([
    // Fetch cars with pagination
    prisma.rentalCar.findMany({
      where: whereClause,
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        carType: true,
        seats: true,
        dailyRate: true,
        instantBook: true,
        rating: true,
        totalTrips: true,
        vehicleType: true,  // For rideshare badge
        reviews: {
          select: {
            rating: true
          }
        },
        city: true,
        latitude: true,
        longitude: true,
        features: true,
        photos: {
          select: {
            url: true,
            caption: true
          },
          orderBy: { order: 'asc' },
          take: 1
        },
        host: {
          select: {
            name: true,
            isVerified: true,
            profilePhoto: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalTrips: 'desc' }
      ],
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE
    }),

    // Get total count for pagination
    prisma.rentalCar.count({
      where: whereClause
    }),

    // Get distinct makes for filter dropdown
    prisma.rentalCar.findMany({
      where: { isActive: true },
      select: { make: true },
      distinct: ['make']
    })
  ])

  // Parse features safely and transform cars for client
  const transformedCars = cars.map(car => {
    let parsedFeatures: string[] = []
    try {
      if (typeof car.features === 'string') {
        parsedFeatures = JSON.parse(car.features)
      } else if (Array.isArray(car.features)) {
        parsedFeatures = car.features as string[]
      }
    } catch {
      parsedFeatures = []
    }

    // Calculate average rating from actual reviews only — ignore DB default (5.0)
    const reviewCount = car.reviews?.length || 0
    let finalRating: number | null = null
    if (reviewCount > 0) {
      const sum = car.reviews.reduce((acc, review) => acc + review.rating, 0)
      finalRating = sum / reviewCount
    }

    return {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      carType: car.carType,
      vehicleType: car.vehicleType,  // For rideshare badge
      seats: car.seats,
      dailyRate: Number(car.dailyRate),
      instantBook: car.instantBook,
      rating: finalRating,
      totalTrips: car.totalTrips,
      city: car.city,
      latitude: car.latitude ? Number(car.latitude) : null,
      longitude: car.longitude ? Number(car.longitude) : null,
      photos: car.photos,
      features: parsedFeatures.slice(0, 5),
      host: car.host
    }
  })

  const makes = makesData.map(m => m.make)

  // Build translated type labels
  const TYPE_LABELS_I18N: Record<string, string> = {
    suv: t('suvs'),
    sedan: t('sedans'),
    luxury: t('luxuryCars'),
    electric: t('electricVehicles'),
    truck: t('trucks'),
    sports: t('sportsCars'),
    convertible: t('convertibles')
  }

  // Build page title based on filters
  const getPageTitle = () => {
    if (params?.type && params?.make) {
      const typeLabel = TYPE_LABELS_I18N[params.type.toLowerCase()] || params.type
      return `${params.make} ${typeLabel}`
    }
    if (params?.type) {
      return TYPE_LABELS_I18N[params.type.toLowerCase()] || t('cars')
    }
    if (params?.make) {
      return `${params.make} ${t('cars')}`
    }
    return t('browseCars')
  }

  // Calculate priceValidUntil (90 days from now)
  const priceValidUntilDate = new Date()
  priceValidUntilDate.setDate(priceValidUntilDate.getDate() + 90)
  const priceValidUntil = priceValidUntilDate.toISOString().split('T')[0]

  // Build ItemList JSON-LD schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: params?.type
      ? t('schemaTypeListName', { type: TYPE_LABELS_I18N[params.type.toLowerCase()] || params.type })
      : t('schemaListName'),
    description: t('schemaDescription'),
    numberOfItems: totalCount,
    itemListElement: transformedCars.map((car, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
        url: `https://itwhip.com/rentals/${car.id}`,
        image: car.photos[0]?.url || 'https://itwhip.com/images/placeholder-car.jpg',
        description: t('schemaCarDescription', { year: car.year, make: capitalizeCarMake(car.make), model: normalizeModelName(car.model, car.make), city: car.city || 'Phoenix' }),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: car.dailyRate.toString(),
          priceValidUntil,
          availability: 'https://schema.org/InStock',
          url: `https://itwhip.com/rentals/${car.id}`,
          shippingDetails: SHIPPING_DETAILS,
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY
        },
        ...(car.rating && car.totalTrips > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: car.rating.toFixed(1),
            bestRating: '5',
            worstRating: '1',
            ratingCount: car.totalTrips.toString()
          }
        } : {})
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Page Header - Clean & Simple */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs type={params?.type} make={params?.make} />

          {/* Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <IoCarSportOutline className="w-5 h-5" />
                <span>
                  {t('carsAvailableInCity', { count: totalCount })}
                </span>
              </p>
            </div>

            {/* Optional: Sort dropdown could go here */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Filters */}
          <Suspense fallback={<div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
            <CarFilters
              currentType={params?.type || ''}
              currentMake={params?.make || ''}
              currentPriceRange={params?.price || ''}
              makes={makes}
              totalCount={totalCount}
            />
          </Suspense>

          {/* Car Grid */}
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          }>
            <CarGrid
              initialCars={transformedCars}
              totalCount={totalCount}
              currentPage={currentPage}
              perPage={ITEMS_PER_PAGE}
              filters={{
                type: params?.type,
                make: params?.make,
                priceMin: params?.priceMin,
                priceMax: params?.priceMax
              }}
            />
          </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
