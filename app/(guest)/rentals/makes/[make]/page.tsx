// app/(guest)/rentals/makes/[make]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import {
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// CAR MAKE SEO DATA
// ============================================
const CAR_MAKE_SEO_DATA: Record<string, {
  displayName: string
  dbValue: string
  description: string
  longDescription: string
  country: string
  founded: string
  keywords: string[]
  popularModels: string[]
  knownFor: string[]
  priceRange: string
}> = {
  'tesla': {
    displayName: 'Tesla',
    dbValue: 'Tesla',
    description: 'Tesla rentals in Phoenix, AZ. Experience Model 3, Model Y, Model S, and Model X electric vehicles. Zero emissions, instant torque, Autopilot included.',
    longDescription: 'Experience the future of driving with a Tesla rental from ItWhip. Our Tesla fleet includes the sporty Model 3, versatile Model Y, luxurious Model S, and spacious Model X. Enjoy instant torque, zero emissions, and access to Arizona\'s Supercharger network.',
    country: 'USA',
    founded: '2003',
    keywords: ['tesla rental phoenix', 'model 3 rental arizona', 'model y rental phoenix', 'electric car rental phoenix', 'tesla model s rental'],
    popularModels: ['Model 3', 'Model Y', 'Model S', 'Model X'],
    knownFor: ['Electric vehicles', 'Autopilot', 'Over-the-air updates', 'Supercharger network', 'Instant torque'],
    priceRange: '$80-250/day'
  },
  'bmw': {
    displayName: 'BMW',
    dbValue: 'BMW',
    description: 'BMW rentals in Phoenix, AZ. Drive the Ultimate Driving Machine. From the 3 Series to X5, experience German engineering excellence.',
    longDescription: 'The Ultimate Driving Machine awaits. Our BMW rental collection spans from the agile 3 Series sedan to the commanding X5 SUV. Experience precision German engineering, luxurious interiors, and the legendary BMW driving dynamics on Arizona\'s roads.',
    country: 'Germany',
    founded: '1916',
    keywords: ['bmw rental phoenix', 'bmw 3 series rental arizona', 'bmw x5 rental phoenix', 'luxury german car rental', 'bmw rental scottsdale'],
    popularModels: ['3 Series', '5 Series', 'X3', 'X5', 'M4'],
    knownFor: ['Driving dynamics', 'Luxury interiors', 'German engineering', 'Performance', 'Technology'],
    priceRange: '$90-350/day'
  },
  'mercedes': {
    displayName: 'Mercedes-Benz',
    dbValue: 'Mercedes-Benz',
    description: 'Mercedes-Benz rentals in Phoenix, AZ. Experience luxury and innovation with C-Class, E-Class, S-Class, and GLE models.',
    longDescription: 'Experience "The Best or Nothing" with a Mercedes-Benz rental. From the elegant C-Class to the flagship S-Class, our Mercedes collection delivers unmatched luxury, cutting-edge technology, and timeless German craftsmanship for your Arizona journey.',
    country: 'Germany',
    founded: '1926',
    keywords: ['mercedes rental phoenix', 'mercedes benz rental arizona', 'c class rental phoenix', 's class rental scottsdale', 'luxury car rental phoenix'],
    popularModels: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'AMG GT'],
    knownFor: ['Luxury', 'Innovation', 'Safety', 'Comfort', 'Prestige'],
    priceRange: '$100-500/day'
  },
  'porsche': {
    displayName: 'Porsche',
    dbValue: 'Porsche',
    description: 'Porsche rentals in Phoenix, AZ. Feel the thrill of a 911, Cayenne, or Taycan. Pure driving excitement in the Arizona desert.',
    longDescription: 'There is no substitute. Rent a Porsche and experience automotive perfection on Arizona\'s scenic roads. From the iconic 911 to the versatile Cayenne and revolutionary Taycan, every Porsche delivers an unforgettable driving experience.',
    country: 'Germany',
    founded: '1931',
    keywords: ['porsche rental phoenix', 'porsche 911 rental arizona', 'cayenne rental phoenix', 'taycan rental scottsdale', 'exotic car rental phoenix'],
    popularModels: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera'],
    knownFor: ['Performance', 'Racing heritage', 'Engineering', 'Design', 'Driving experience'],
    priceRange: '$200-800/day'
  },
  'lamborghini': {
    displayName: 'Lamborghini',
    dbValue: 'Lamborghini',
    description: 'Lamborghini rentals in Phoenix, AZ. Turn heads in a Huracán or Urus. Italian exotic supercar experience in Arizona.',
    longDescription: 'Make a statement with a Lamborghini rental. Our Italian exotic collection features the stunning Huracán and the powerful Urus SUV. Experience head-turning style, thunderous V10 and V8 power, and the thrill of driving an automotive icon.',
    country: 'Italy',
    founded: '1963',
    keywords: ['lamborghini rental phoenix', 'huracan rental arizona', 'urus rental phoenix', 'exotic car rental scottsdale', 'supercar rental phoenix'],
    popularModels: ['Huracán', 'Urus', 'Aventador'],
    knownFor: ['Exotic styling', 'V10/V12 engines', 'Italian craftsmanship', 'Head-turning presence', 'Supercar performance'],
    priceRange: '$800-2000/day'
  },
  'audi': {
    displayName: 'Audi',
    dbValue: 'Audi',
    description: 'Audi rentals in Phoenix, AZ. Vorsprung durch Technik. From A4 to Q7, experience quattro all-wheel drive and German luxury.',
    longDescription: 'Advancement through technology. Our Audi rental fleet showcases German innovation from the sporty A4 to the spacious Q7 SUV. Experience legendary quattro all-wheel drive, virtual cockpit displays, and refined luxury throughout your Arizona travels.',
    country: 'Germany',
    founded: '1909',
    keywords: ['audi rental phoenix', 'audi a4 rental arizona', 'audi q7 rental phoenix', 'quattro rental scottsdale', 'german luxury car rental'],
    popularModels: ['A4', 'A6', 'Q5', 'Q7', 'RS6'],
    knownFor: ['Quattro AWD', 'Virtual Cockpit', 'Build quality', 'Technology', 'Understated luxury'],
    priceRange: '$85-300/day'
  },
  'lexus': {
    displayName: 'Lexus',
    dbValue: 'Lexus',
    description: 'Lexus rentals in Phoenix, AZ. Japanese luxury and reliability. From ES to RX, experience refined comfort and legendary dependability.',
    longDescription: 'Experience the pursuit of perfection. Our Lexus rental collection combines Japanese reliability with world-class luxury. From the smooth ES sedan to the popular RX crossover, enjoy whisper-quiet rides and legendary dependability across Arizona.',
    country: 'Japan',
    founded: '1989',
    keywords: ['lexus rental phoenix', 'lexus es rental arizona', 'lexus rx rental phoenix', 'japanese luxury car rental', 'reliable luxury car rental'],
    popularModels: ['ES', 'IS', 'RX', 'GX', 'LC'],
    knownFor: ['Reliability', 'Quiet comfort', 'Build quality', 'Hybrid technology', 'Customer service'],
    priceRange: '$80-250/day'
  },
  'dodge': {
    displayName: 'Dodge',
    dbValue: 'Dodge',
    description: 'Dodge rentals in Phoenix, AZ. Experience American muscle with Challenger, Charger, and Durango. Hellcat and SRT models available for the ultimate thrill.',
    longDescription: 'Unleash American muscle on Arizona roads. Our Dodge rental fleet features the iconic Challenger and Charger, including earth-shaking Hellcat and SRT variants. From the rumble of a V8 to the practicality of the Durango SUV, experience raw American performance.',
    country: 'USA',
    founded: '1900',
    keywords: ['dodge rental phoenix', 'challenger rental arizona', 'charger rental phoenix', 'hellcat rental phoenix', 'challenger rental scottsdale', 'muscle car rental arizona', 'srt rental phoenix', 'dodge charger hellcat rental'],
    popularModels: ['Challenger', 'Challenger SRT', 'Challenger Hellcat', 'Charger', 'Charger SRT', 'Charger Hellcat', 'Durango'],
    knownFor: ['American muscle', 'V8 power', 'Hellcat supercharged engines', 'Bold styling', 'Raw performance'],
    priceRange: '$80-400/day'
  }
}

// Generate static params
export async function generateStaticParams() {
  return Object.keys(CAR_MAKE_SEO_DATA).map((make) => ({ make }))
}

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ make: string }>
}): Promise<Metadata> {
  const { make } = await params
  const makeData = CAR_MAKE_SEO_DATA[make.toLowerCase()]

  if (!makeData) {
    return { title: 'Make Not Found - ItWhip' }
  }

  const title = `${makeData.displayName} Rentals in Phoenix, AZ | ItWhip`
  const description = makeData.description

  return {
    title,
    description,
    keywords: makeData.keywords,
    openGraph: {
      title,
      description,
      url: `https://itwhip.com/rentals/makes/${make}`,
      siteName: 'ItWhip',
      locale: 'en_US',
      type: 'website',
      images: [{
        url: 'https://itwhip.com/og-default-car.jpg',
        width: 1200,
        height: 630,
        alt: `${makeData.displayName} Rentals in Phoenix`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://itwhip.com/og-default-car.jpg']
    },
    alternates: {
      canonical: `https://itwhip.com/rentals/makes/${make}`
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

// Page component
export default async function CarMakePage({
  params
}: {
  params: Promise<{ make: string }>
}) {
  const { make } = await params
  const makeData = CAR_MAKE_SEO_DATA[make.toLowerCase()]

  if (!makeData) {
    notFound()
  }

  // Fetch cars of this make from database
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      make: {
        equals: makeData.dbValue,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      dailyRate: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      fuelType: true,
      esgScore: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          rating: true
        }
      }
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
    seats: 5,
    city: car.city,
    rating: car.rating ? Number(car.rating) : null,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto
    } : null
  }))

  // Generate schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
      { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://itwhip.com/rentals' },
      { '@type': 'ListItem', position: 3, name: `${makeData.displayName} Rentals`, item: `https://itwhip.com/rentals/makes/${make}` }
    ]
  }

  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: makeData.displayName,
    description: makeData.description,
    url: `https://itwhip.com/rentals/makes/${make}`
  }

  // Calculate priceValidUntil once for all offers (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${makeData.displayName} Rentals in Phoenix, AZ`,
    description: makeData.description,
    numberOfItems: cars.length,
    itemListElement: cars.slice(0, 10).map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${car.year} ${car.make} ${car.model}`,
        description: `Rent this ${car.year} ${car.make} ${car.model} in ${car.city}, AZ`,
        image: car.photos?.[0]?.url || '',
        url: `https://itwhip.com${generateCarUrl({ id: car.id, make: car.make, model: car.model, year: car.year, city: car.city })}`,
        brand: {
          '@type': 'Brand',
          name: makeData.displayName
        },
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
                unitCode: 'HUR'
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 2,
                unitCode: 'HUR'
              }
            }
          }
        },
        ...(car.rating ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: car.rating,
            reviewCount: car.totalTrips || 1
          }
        } : {})
      }
    }))
  }

  // Get related makes (exclude current)
  const relatedMakes = Object.entries(CAR_MAKE_SEO_DATA)
    .filter(([key]) => key !== make.toLowerCase())
    .slice(0, 6)

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="brand-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
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
                Home
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <Link href="/rentals" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                Rentals
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                {makeData.displayName} Rentals
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <span>{makeData.country}</span>
                  <span>•</span>
                  <span>Est. {makeData.founded}</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {makeData.displayName} Rentals in Phoenix, AZ
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                  {makeData.longDescription}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <span className="text-gray-400 text-sm">Available</span>
                  <p className="text-3xl font-bold">{cars.length}</p>
                  <span className="text-gray-400 text-sm">vehicles</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <span className="text-gray-400 text-sm">From</span>
                  <p className="text-2xl font-bold">{makeData.priceRange.split('-')[0]}</p>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Known For Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              {makeData.displayName.toUpperCase()} IS KNOWN FOR
            </h2>
            <div className="flex flex-wrap gap-2">
              {makeData.knownFor.map((trait) => (
                <span
                  key={trait}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-gray-200 dark:border-gray-700"
                >
                  <IoShieldCheckmarkOutline className="w-4 h-4 text-green-500" />
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Models */}
        <section className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              POPULAR MODELS
            </h2>
            <div className="flex flex-wrap gap-3">
              {makeData.popularModels.map((model) => (
                <Link
                  key={model}
                  href={`/rentals/search?make=${makeData.dbValue}&q=${encodeURIComponent(model)}`}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:border-purple-500 hover:text-purple-600 transition shadow-sm hover:shadow-md"
                >
                  {makeData.displayName} {model}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Car Listings */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available {makeData.displayName} Vehicles
            </h2>

            {transformedCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {transformedCars.map((car) => (
                  <CompactCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No {makeData.displayName} Vehicles Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Check back soon or browse other makes.
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Browse All Cars
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Other Makes */}
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Browse Other Makes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {relatedMakes.map(([key, data]) => (
                <Link
                  key={key}
                  href={`/rentals/makes/${key}`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-lg transition group border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600">
                    {data.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {data.country}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
