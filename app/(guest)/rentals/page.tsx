// app/(guest)/rentals/page.tsx
// Server Component - Car Listings Page (Catalog Style)

import { Metadata } from 'next'
import { Suspense } from 'react'
import prisma from '@/app/lib/database/prisma'
import CarFilters from './components/CarFilters'
import CarGrid from './components/CarGrid'
import Breadcrumbs from './components/Breadcrumbs'
import Footer from '@/app/components/Footer'
import { IoCarSportOutline } from 'react-icons/io5'
import { MERCHANT_RETURN_POLICY, SHIPPING_DETAILS } from '@/app/lib/seo/return-policy'

const TYPE_LABELS: Record<string, string> = {
  suv: 'SUVs',
  sedan: 'Sedans',
  luxury: 'Luxury Cars',
  electric: 'Electric Vehicles',
  truck: 'Trucks',
  sports: 'Sports Cars',
  convertible: 'Convertibles'
}

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
  searchParams
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const type = params?.type
  const make = params?.make

  let title = 'Rent Cars in Phoenix | SUVs, Sedans & Luxury | ItWhip'
  let description = 'Browse and rent cars from local Phoenix hosts. Choose from SUVs, sedans, luxury cars, electric vehicles, and more. Book instantly with no hidden fees.'

  if (type && make) {
    const typeLabel = TYPE_LABELS[type.toLowerCase()] || type
    title = `Rent ${make} ${typeLabel} in Phoenix | ItWhip`
    description = `Find ${make} ${typeLabel} available for rent in Phoenix from local hosts. Book your perfect ${make} today.`
  } else if (type) {
    const typeLabel = TYPE_LABELS[type.toLowerCase()] || type
    title = `Rent ${typeLabel} in Phoenix | ItWhip`
    description = `Browse ${typeLabel} available for rent in Phoenix from local hosts. Find the perfect vehicle for your trip.`
  } else if (make) {
    title = `Rent ${make} Cars in Phoenix | ItWhip`
    description = `Find ${make} vehicles available for rent in Phoenix from local hosts. Book your ${make} today.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://itwhip.com/rentals',
      siteName: 'ItWhip',
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
      canonical: 'https://itwhip.com/rentals'
    }
  }
}

const ITEMS_PER_PAGE = 20

export default async function RentalsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const currentPage = parseInt(params?.page || '1', 10)

  // Build Prisma where clause from filters
  const whereClause: any = {
    isActive: true,
    vehicleType: 'RENTAL'  // Only show rental vehicles (not rideshare)
  }

  if (params?.type && params.type !== 'all') {
    whereClause.carType = params.type.toUpperCase()
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

    // Get distinct makes for filter dropdown (only from RENTAL vehicles)
    prisma.rentalCar.findMany({
      where: { isActive: true, vehicleType: 'RENTAL' },
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

    // Calculate average rating from reviews, fallback to static rating field
    const reviewCount = car.reviews?.length || 0
    let finalRating: number | null = null
    if (reviewCount > 0) {
      // Use calculated average from actual reviews
      const sum = car.reviews.reduce((acc, review) => acc + review.rating, 0)
      finalRating = sum / reviewCount
    } else if (car.rating) {
      // Fallback to static rating field from database
      finalRating = Number(car.rating)
    }

    return {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      carType: car.carType,
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

  // Build page title based on filters
  const getPageTitle = () => {
    if (params?.type && params?.make) {
      const typeLabel = TYPE_LABELS[params.type.toLowerCase()] || params.type
      return `${params.make} ${typeLabel}`
    }
    if (params?.type) {
      return TYPE_LABELS[params.type.toLowerCase()] || 'Cars'
    }
    if (params?.make) {
      return `${params.make} Cars`
    }
    return 'Browse Cars'
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
      ? `${TYPE_LABELS[params.type.toLowerCase()] || params.type} for Rent in Phoenix`
      : 'Cars for Rent in Phoenix',
    description: 'Browse rental cars from local Phoenix hosts',
    numberOfItems: totalCount,
    itemListElement: transformedCars.map((car, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: `${car.year} ${car.make} ${car.model}`,
        image: car.photos[0]?.url || 'https://itwhip.com/images/placeholder-car.jpg',
        description: `Rent a ${car.year} ${car.make} ${car.model} in ${car.city || 'Phoenix'}`,
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
        ...(car.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: car.rating.toFixed(1),
            bestRating: '5',
            worstRating: '1',
            ratingCount: car.totalTrips.toString()
          }
        })
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
                  <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span>
                  {' '}cars available in Phoenix
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
