// app/(guest)/rentals/types/[type]/page.tsx
import { Metadata } from 'next'
import Image from 'next/image'
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
}

const TYPE_ALT_TEXT: Record<string, string> = {
  'sedan': 'Sedan car rentals in Phoenix Arizona - ItWhip',
  'suv': 'SUV rentals in Phoenix Arizona - ItWhip',
  'sports': 'Sports car rentals in Phoenix Arizona - ItWhip',
  'electric': 'Electric vehicle rentals in Phoenix Arizona - ItWhip',
}

// ============================================
// CAR TYPE SEO DATA
// ============================================
const CAR_TYPE_SEO_DATA: Record<string, {
  displayName: string
  dbValue: string
  description: string
  longDescription: string
  icon: string
  keywords: string[]
  popularMakes: string[]
  idealFor: string[]
  priceRange: string
}> = {
  'suv': {
    displayName: 'SUV',
    dbValue: 'SUV',
    description: 'Spacious SUV rentals perfect for Arizona road trips, family vacations, and outdoor adventures. From compact crossovers to full-size luxury SUVs.',
    longDescription: 'Arizona\'s diverse terrain demands a capable vehicle. Our SUV rentals offer the space, comfort, and capability you need for everything from Phoenix city driving to Sedona off-road adventures. Choose from compact crossovers for easy parking to full-size luxury SUVs for the whole family.',
    icon: 'suv',
    keywords: ['suv rental phoenix', 'suv rental arizona', 'rent suv phoenix az', 'family car rental phoenix', 'large car rental arizona'],
    popularMakes: ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Jeep', 'Land Rover'],
    idealFor: ['Family trips', 'Road trips to Grand Canyon', 'Golf outings', 'Airport pickups', 'Moving day'],
    priceRange: '$45-150/day'
  },
  'luxury': {
    displayName: 'Luxury',
    dbValue: 'LUXURY',
    description: 'Premium luxury car rentals in Phoenix. Experience Mercedes, BMW, Audi, and more. Perfect for special occasions, business travel, and weekend getaways.',
    longDescription: 'Make a statement with a luxury rental from ItWhip. Our curated collection of premium vehicles includes the latest from Mercedes-Benz, BMW, Audi, Lexus, and more. Whether it\'s a business meeting in Scottsdale or a romantic weekend in Sedona, arrive in style.',
    icon: 'luxury',
    keywords: ['luxury car rental phoenix', 'premium car rental arizona', 'exotic car rental scottsdale', 'high end car rental phoenix', 'mercedes rental phoenix'],
    popularMakes: ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Porsche', 'Maserati'],
    idealFor: ['Business travel', 'Special occasions', 'Weddings', 'Date nights', 'Client meetings'],
    priceRange: '$100-500/day'
  },
  'sports': {
    displayName: 'Sports Car',
    dbValue: 'SPORTS',
    description: 'High-performance sports car rentals in Phoenix. Feel the thrill of a Porsche, Corvette, or Mustang on Arizona\'s scenic highways.',
    longDescription: 'Life\'s too short for boring cars. Rent a sports car and experience the thrill of open Arizona roads. From the iconic Porsche 911 to the American muscle of a Corvette, our sports car collection delivers pure driving excitement.',
    icon: 'sports',
    keywords: ['sports car rental phoenix', 'performance car rental arizona', 'porsche rental phoenix', 'corvette rental arizona', 'mustang rental phoenix'],
    popularMakes: ['Porsche', 'Chevrolet', 'Ford', 'BMW', 'Dodge', 'Nissan'],
    idealFor: ['Weekend drives', 'Scenic routes', 'Car enthusiasts', 'Special celebrations', 'Photo shoots'],
    priceRange: '$150-800/day'
  },
  'sedan': {
    displayName: 'Sedan',
    dbValue: 'SEDAN',
    description: 'Comfortable sedan rentals in Phoenix. Reliable, fuel-efficient, and perfect for business trips or everyday driving in Arizona.',
    longDescription: 'The classic choice for comfort and efficiency. Our sedan rentals range from economical commuters to premium executive sedans. Perfect for business travelers, couples, or anyone who values a smooth, comfortable ride around Phoenix and beyond.',
    icon: 'sedan',
    keywords: ['sedan rental phoenix', 'car rental phoenix az', 'economy car rental arizona', 'business car rental phoenix', 'commuter car rental'],
    popularMakes: ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus'],
    idealFor: ['Business travel', 'Daily commuting', 'Airport transfers', 'City driving', 'Fuel efficiency'],
    priceRange: '$35-120/day'
  },
  'convertible': {
    displayName: 'Convertible',
    dbValue: 'CONVERTIBLE',
    description: 'Convertible car rentals in Phoenix. Enjoy Arizona\'s 300+ days of sunshine with the top down. Perfect for scenic drives and special occasions.',
    longDescription: 'With over 300 days of sunshine, Arizona is convertible country. Feel the warm desert breeze as you cruise through Scottsdale or take the scenic route to Sedona. Our convertible collection lets you experience Arizona the way it was meant to be enjoyed.',
    icon: 'convertible',
    keywords: ['convertible rental phoenix', 'drop top rental arizona', 'cabriolet rental phoenix', 'open top car rental', 'mustang convertible rental'],
    popularMakes: ['Ford', 'Chevrolet', 'BMW', 'Porsche', 'Mercedes-Benz', 'Mazda'],
    idealFor: ['Scenic drives', 'Special occasions', 'Date nights', 'Tourism', 'Photography'],
    priceRange: '$80-400/day'
  },
  'truck': {
    displayName: 'Truck',
    dbValue: 'TRUCK',
    description: 'Pickup truck rentals in Phoenix. From half-tons to heavy-duty, perfect for hauling, towing, moving, or off-road adventures in Arizona.',
    longDescription: 'Need to haul, tow, or tackle tough terrain? Our truck rentals have you covered. From capable half-tons perfect for moving day to heavy-duty trucks ready for serious work, find the right truck for your Arizona adventure.',
    icon: 'truck',
    keywords: ['truck rental phoenix', 'pickup rental arizona', 'f150 rental phoenix', 'moving truck rental', 'towing vehicle rental arizona'],
    popularMakes: ['Ford', 'Chevrolet', 'Toyota', 'Ram', 'GMC', 'Nissan'],
    idealFor: ['Moving', 'Hauling', 'Towing', 'Construction', 'Off-road adventures'],
    priceRange: '$60-180/day'
  },
  'electric': {
    displayName: 'Electric',
    dbValue: 'ELECTRIC',
    description: 'Electric car rentals in Phoenix. Experience Tesla, Rivian, and more. Zero emissions, instant torque, and savings on gas in Arizona.',
    longDescription: 'Go green without sacrificing performance. Our electric vehicle collection features the latest from Tesla, Rivian, and other EV leaders. Enjoy instant torque, zero emissions, and significant fuel savings while exploring Arizona in cutting-edge style.',
    icon: 'electric',
    keywords: ['electric car rental phoenix', 'tesla rental arizona', 'ev rental phoenix', 'zero emission car rental', 'green car rental arizona'],
    popularMakes: ['Tesla', 'Rivian', 'BMW', 'Mercedes-Benz', 'Porsche', 'Audi'],
    idealFor: ['Eco-conscious travel', 'Tech enthusiasts', 'City driving', 'Fuel savings', 'Quiet rides'],
    priceRange: '$80-300/day'
  },
  'coupe': {
    displayName: 'Coupe',
    dbValue: 'COUPE',
    description: 'Sleek coupe rentals in Phoenix. Two-door style meets performance. BMW, Mercedes, Audi coupes and more for the discerning driver.',
    longDescription: 'For those who appreciate style and sportiness, our coupe collection delivers. From elegant Mercedes-Benz coupes to aggressive BMW M-series, these two-door beauties combine head-turning design with exhilarating performance. Perfect for couples or solo travelers who want to make a statement.',
    icon: 'coupe',
    keywords: ['coupe rental phoenix', 'two door car rental arizona', 'bmw coupe rental', 'mercedes coupe rental', 'sports coupe rental phoenix'],
    popularMakes: ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Lexus', 'Infiniti'],
    idealFor: ['Style-conscious drivers', 'Date nights', 'Weekend getaways', 'Business travel', 'Special occasions'],
    priceRange: '$100-400/day'
  },
  'exotic': {
    displayName: 'Exotic',
    dbValue: 'EXOTIC',
    description: 'Exotic car rentals in Phoenix. Drive a Lamborghini, Ferrari, Bentley, or Rolls-Royce. Ultimate luxury and supercar experiences in Arizona.',
    longDescription: 'Experience the pinnacle of automotive excellence. Our exotic car collection features the world\'s most prestigious marques: Lamborghini, Ferrari, Bentley, Rolls-Royce, and McLaren. Whether it\'s for a special celebration, photo shoot, or simply to fulfill a dream, drive something extraordinary in the Arizona sun.',
    icon: 'exotic',
    keywords: ['exotic car rental phoenix', 'lamborghini rental arizona', 'ferrari rental phoenix', 'supercar rental scottsdale', 'bentley rental phoenix', 'rolls royce rental arizona'],
    popularMakes: ['Lamborghini', 'Ferrari', 'Bentley', 'Rolls-Royce', 'McLaren', 'Aston Martin'],
    idealFor: ['Special celebrations', 'Weddings', 'Photo shoots', 'Bachelor parties', 'Bucket list experiences'],
    priceRange: '$500-2000/day'
  },
  'pickup-truck': {
    displayName: 'Pickup Truck',
    dbValue: 'TRUCK',
    description: 'Pickup truck rentals in Phoenix. Full-size trucks for hauling, towing, moving, and weekend projects. F-150, Silverado, Ram, and more.',
    longDescription: 'Need serious hauling or towing capability? Our pickup truck rentals range from mid-size workhorses to full-size heavy-duty trucks. Perfect for moving, construction projects, towing boats or trailers, or just tackling Arizona\'s rugged terrain.',
    icon: 'truck',
    keywords: ['pickup truck rental phoenix', 'truck rental arizona', 'f150 rental phoenix', 'silverado rental arizona', 'ram truck rental phoenix'],
    popularMakes: ['Ford', 'Chevrolet', 'Ram', 'Toyota', 'GMC', 'Nissan'],
    idealFor: ['Moving day', 'Hauling equipment', 'Towing trailers', 'Construction work', 'Off-road adventures'],
    priceRange: '$65-200/day'
  },
  '7-seater': {
    displayName: '7-Seater',
    dbValue: 'SUV',
    description: '7-seater vehicle rentals in Phoenix. SUVs and minivans with third-row seating. Perfect for large families, groups, and airport pickups.',
    longDescription: 'Traveling with a group? Our 7-seater rentals provide comfortable seating for the whole crew. From three-row SUVs to spacious minivans, find the perfect vehicle for family vacations, group outings, or airport runs with multiple passengers.',
    icon: 'suv',
    keywords: ['7 seater rental phoenix', '7 passenger suv rental arizona', 'large family car rental', 'group vehicle rental phoenix', 'minivan rental arizona'],
    popularMakes: ['Toyota', 'Honda', 'Chevrolet', 'Ford', 'Kia', 'Chrysler'],
    idealFor: ['Large families', 'Group travel', 'Airport pickups', 'Road trips', 'Sports team transport'],
    priceRange: '$75-175/day'
  },
  '8-seater': {
    displayName: '8-Seater',
    dbValue: 'SUV',
    description: '8-seater vehicle rentals in Phoenix. Full-size SUVs and passenger vans for large groups. Maximum capacity for your Arizona adventure.',
    longDescription: 'Need maximum seating capacity? Our 8-seater rentals are perfect for large groups, sports teams, or extended families. Choose from full-size SUVs with captain\'s chairs to passenger vans with bench seating for the ultimate group transportation.',
    icon: 'suv',
    keywords: ['8 seater rental phoenix', '8 passenger suv rental arizona', 'large group vehicle rental', 'passenger van rental phoenix', 'extended family car rental'],
    popularMakes: ['Chevrolet', 'Ford', 'GMC', 'Toyota', 'Nissan', 'Mercedes-Benz'],
    idealFor: ['Large groups', 'Corporate shuttles', 'Wedding parties', 'Sports teams', 'Family reunions'],
    priceRange: '$85-225/day'
  },
  'economy': {
    displayName: 'Economy',
    dbValue: 'SEDAN',
    description: 'Economy car rentals in Phoenix. Affordable, fuel-efficient vehicles perfect for budget-conscious travelers and daily driving.',
    longDescription: 'Get the best value without sacrificing quality. Our economy rentals offer reliable, fuel-efficient vehicles at wallet-friendly prices. Perfect for budget travelers, daily commuters, or anyone who wants to save on rental costs and gas.',
    icon: 'sedan',
    keywords: ['cheap car rental phoenix', 'economy car rental arizona', 'budget car rental phoenix', 'affordable rental car arizona', 'fuel efficient rental phoenix'],
    popularMakes: ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda'],
    idealFor: ['Budget travel', 'Daily commuting', 'City driving', 'First-time renters', 'Fuel savings'],
    priceRange: '$29-55/day'
  },
  'family': {
    displayName: 'Family',
    dbValue: 'SUV',
    description: 'Family car rentals in Phoenix. Spacious SUVs, minivans, and crossovers with room for kids, gear, and everything else.',
    longDescription: 'Family travel demands space, comfort, and reliability. Our family-friendly rentals feature spacious SUVs, minivans, and crossovers with plenty of room for car seats, luggage, strollers, and everything else families need on the road.',
    icon: 'suv',
    keywords: ['family car rental phoenix', 'family suv rental arizona', 'minivan rental phoenix', 'car seat friendly rental', 'kid friendly car rental'],
    popularMakes: ['Toyota', 'Honda', 'Chevrolet', 'Ford', 'Kia', 'Chrysler'],
    idealFor: ['Family vacations', 'Road trips with kids', 'Disney trips', 'Sports practice', 'Grocery runs'],
    priceRange: '$55-150/day'
  }
}

// Generate static params for all types
export async function generateStaticParams() {
  return Object.keys(CAR_TYPE_SEO_DATA).map((type) => ({ type }))
}

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const typeData = CAR_TYPE_SEO_DATA[type.toLowerCase()]

  if (!typeData) {
    return { title: 'Car Type Not Found - ItWhip' }
  }

  const title = `${typeData.displayName} Rentals in Phoenix, AZ | ItWhip`
  const description = typeData.description

  // Use hero image if available, otherwise fall back to default
  const heroImage = TYPE_HERO_IMAGES[type.toLowerCase()]
    ? `https://itwhip.com${TYPE_HERO_IMAGES[type.toLowerCase()]}`
    : 'https://itwhip.com/og-default-car.jpg'
  const altText = TYPE_ALT_TEXT[type.toLowerCase()] || `${typeData.displayName} Rentals in Phoenix`

  return {
    title,
    description,
    keywords: typeData.keywords,
    openGraph: {
      title,
      description,
      url: `https://itwhip.com/rentals/types/${type}`,
      siteName: 'ItWhip',
      locale: 'en_US',
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
      canonical: `https://itwhip.com/rentals/types/${type}`
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
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const typeData = CAR_TYPE_SEO_DATA[type.toLowerCase()]

  if (!typeData) {
    notFound()
  }

  // Fetch cars of this type from database
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      carType: typeData.dbValue
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
    seats: 5, // Default since not in select
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
      { '@type': 'ListItem', position: 3, name: `${typeData.displayName} Rentals`, item: `https://itwhip.com/rentals/types/${type}` }
    ]
  }

  // Calculate priceValidUntil once for all offers (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${typeData.displayName} Rentals in Phoenix, AZ`,
    description: typeData.description,
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
                unitCode: 'D01'
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 2,
                unitCode: 'D01'
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

  // Get related types (exclude current)
  const relatedTypes = Object.entries(CAR_TYPE_SEO_DATA)
    .filter(([key]) => key !== type.toLowerCase())
    .slice(0, 4)

  return (
    <>
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
                Home
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <Link href="/rentals" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                Rentals
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                {typeData.displayName} Rentals
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        {TYPE_HERO_IMAGES[type.toLowerCase()] ? (
          <section className="relative h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden">
            <Image
              src={TYPE_HERO_IMAGES[type.toLowerCase()]}
              alt={TYPE_ALT_TEXT[type.toLowerCase()] || `${typeData.displayName} Rentals in Phoenix`}
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
                    {typeData.displayName} Rentals in Phoenix, AZ
                  </h1>
                </div>
                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mb-4 line-clamp-2 sm:line-clamp-none">
                  {typeData.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-white/80 text-xs sm:text-sm">Available Now</span>
                    <p className="text-lg sm:text-2xl font-bold text-white">{cars.length} vehicles</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-white/80 text-xs sm:text-sm">Starting at</span>
                    <p className="text-lg sm:text-2xl font-bold text-white">{typeData.priceRange.split('-')[0]}/day</p>
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
                  {typeData.displayName} Rentals in Phoenix, AZ
                </h1>
              </div>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-6">
                {typeData.longDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-purple-100 text-sm">Available Now</span>
                  <p className="text-2xl font-bold">{cars.length} vehicles</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-purple-100 text-sm">Price Range</span>
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
              IDEAL FOR
            </h2>
            <div className="flex flex-wrap gap-2">
              {typeData.idealFor.map((use) => (
                <span
                  key={use}
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
              Available {typeData.displayName}s
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
                  No {typeData.displayName}s Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Check back soon or browse other vehicle types.
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

        {/* Popular Makes in This Category */}
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Popular {typeData.displayName} Makes
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
              Browse Other Vehicle Types
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedTypes.map(([key, data]) => (
                <Link
                  key={key}
                  href={`/rentals/types/${key}`}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition group border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <IoCarSportOutline className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600">
                    {data.displayName} Rentals
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {data.priceRange}
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
