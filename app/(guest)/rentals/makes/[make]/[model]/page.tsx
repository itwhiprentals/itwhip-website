// app/(guest)/rentals/makes/[make]/[model]/page.tsx
// Dynamic model page - works for ANY make/model combination
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import prisma from '@/app/lib/database/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import { getCarModelBySlug } from '@/app/lib/data/car-models'
import {
  IoCarSportOutline,
  IoCarOutline,
  IoSpeedometerOutline,
  IoFlashOutline,
  IoPeopleOutline,
  IoLeafOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoStarOutline,
  IoSettingsOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'
import { MERCHANT_RETURN_POLICY, SHIPPING_DETAILS } from '@/app/lib/seo/return-policy'

export const revalidate = 60

// Reference to make data for display names
const MAKE_DISPLAY_NAMES: Record<string, string> = {
  'tesla': 'Tesla',
  'bmw': 'BMW',
  'mercedes': 'Mercedes-Benz',
  'porsche': 'Porsche',
  'lamborghini': 'Lamborghini',
  'audi': 'Audi',
  'lexus': 'Lexus',
  'dodge': 'Dodge',
  'toyota': 'Toyota',
  'honda': 'Honda',
  'ford': 'Ford',
  'chevrolet': 'Chevrolet',
  'jeep': 'Jeep',
  'nissan': 'Nissan',
  'hyundai': 'Hyundai',
  'kia': 'Kia',
  'subaru': 'Subaru',
  'mazda': 'Mazda',
  'volkswagen': 'Volkswagen',
  'cadillac': 'Cadillac',
  'genesis': 'Genesis',
  'volvo': 'Volvo',
  'land-rover': 'Land Rover',
  'ferrari': 'Ferrari',
  'mclaren': 'McLaren',
  'bentley': 'Bentley',
  'rolls-royce': 'Rolls-Royce',
  'chrysler': 'Chrysler',
  'ram': 'RAM',
  'gmc': 'GMC',
  'acura': 'Acura',
  'infiniti': 'Infiniti',
  'lincoln': 'Lincoln',
  'buick': 'Buick',
  'alfa-romeo': 'Alfa Romeo',
  'maserati': 'Maserati',
  'aston-martin': 'Aston Martin',
  'jaguar': 'Jaguar',
  'mini': 'MINI',
  'fiat': 'Fiat',
  'mitsubishi': 'Mitsubishi',
  'lucid': 'Lucid',
  'rivian': 'Rivian',
  'polestar': 'Polestar'
}

// Helper to format slug to display name
function formatDisplayName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to get make display name
function getMakeDisplayName(makeSlug: string): string {
  return MAKE_DISPLAY_NAMES[makeSlug.toLowerCase()] || formatDisplayName(makeSlug)
}

// Helper to format model slug to display name
function getModelDisplayName(modelSlug: string): string {
  // Handle common model naming patterns
  const modelMap: Record<string, string> = {
    'model-3': 'Model 3',
    'model-y': 'Model Y',
    'model-s': 'Model S',
    'model-x': 'Model X',
    'c-class': 'C-Class',
    'e-class': 'E-Class',
    's-class': 'S-Class',
    'gle': 'GLE',
    'glc': 'GLC',
    'gls': 'GLS',
    'amg-gt': 'AMG GT',
    '3-series': '3 Series',
    '5-series': '5 Series',
    '7-series': '7 Series',
    'x3': 'X3',
    'x5': 'X5',
    'x7': 'X7',
    'm3': 'M3',
    'm4': 'M4',
    'm5': 'M5',
    'a4': 'A4',
    'a6': 'A6',
    'a8': 'A8',
    'q5': 'Q5',
    'q7': 'Q7',
    'q8': 'Q8',
    'rs6': 'RS6',
    'rs7': 'RS7',
    'gt-r': 'GT-R',
    'cr-v': 'CR-V',
    'hr-v': 'HR-V',
    'rav4': 'RAV4',
    '4runner': '4Runner',
    'f-150': 'F-150',
    'f-250': 'F-250',
    'mustang-gt': 'Mustang GT',
    'gt350': 'GT350',
    'gt500': 'GT500',
    'cx-5': 'CX-5',
    'cx-9': 'CX-9',
    'cx-30': 'CX-30',
    'mx-5': 'MX-5 Miata',
    'id4': 'ID.4',
    'gti': 'GTI',
    'xc40': 'XC40',
    'xc60': 'XC60',
    'xc90': 'XC90',
    '911': '911',
    '718': '718',
    'taycan': 'Taycan',
    'cayenne': 'Cayenne',
    'macan': 'Macan',
    'panamera': 'Panamera',
    'huracan': 'Huracán',
    'urus': 'Urus',
    'aventador': 'Aventador',
    '488': '488',
    'f8': 'F8 Tributo',
    'sf90': 'SF90',
    'roma': 'Roma',
    '720s': '720S',
    'artura': 'Artura',
    'continental-gt': 'Continental GT',
    'bentayga': 'Bentayga',
    'flying-spur': 'Flying Spur',
    'ghost': 'Ghost',
    'phantom': 'Phantom',
    'cullinan': 'Cullinan',
    'wraith': 'Wraith',
    'g70': 'G70',
    'g80': 'G80',
    'g90': 'G90',
    'gv70': 'GV70',
    'gv80': 'GV80',
    '300': '300',
    'pacifica': 'Pacifica',
    '1500': '1500',
    '2500': '2500',
    '3500': '3500',
    'trx': 'TRX',
    'sierra': 'Sierra',
    'yukon': 'Yukon',
    'acadia': 'Acadia',
    'terrain': 'Terrain',
    'hummer-ev': 'Hummer EV',
    'wrangler': 'Wrangler',
    'grand-cherokee': 'Grand Cherokee',
    'gladiator': 'Gladiator',
    'challenger': 'Challenger',
    'charger': 'Charger',
    'durango': 'Durango',
    'hellcat': 'Hellcat',
    'corvette': 'Corvette',
    'camaro': 'Camaro',
    'silverado': 'Silverado',
    'tahoe': 'Tahoe',
    'suburban': 'Suburban'
  }

  return modelMap[modelSlug.toLowerCase()] || formatDisplayName(modelSlug)
}

interface PageProps {
  params: Promise<{ make: string; model: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { make, model } = await params

  // First check if we have predefined SEO data
  const predefinedData = getCarModelBySlug(make, model)
  if (predefinedData) {
    return {
      title: predefinedData.metaTitle,
      description: predefinedData.metaDescription,
      keywords: [
        `rent ${predefinedData.displayName}`,
        `${predefinedData.displayName} rental Phoenix`,
        `${predefinedData.make} rental Arizona`,
      ],
      openGraph: {
        title: predefinedData.metaTitle,
        description: predefinedData.metaDescription,
        url: `https://itwhip.com/rentals/makes/${make}/${model}`,
        type: 'website'
      },
      alternates: {
        canonical: `https://itwhip.com/rentals/makes/${make}/${model}`,
      },
    }
  }

  // Generate dynamic metadata
  const makeName = getMakeDisplayName(make)
  const modelName = getModelDisplayName(model)
  const displayName = `${makeName} ${modelName}`

  const title = `Rent ${displayName} in Phoenix | ${makeName} Rental | ItWhip`
  const description = `Rent a ${displayName} in Phoenix, AZ. Book directly from local owners. Competitive daily rates, flexible pickup options, and premium ${makeName} vehicles available now.`

  return {
    title,
    description,
    keywords: [
      `rent ${displayName}`,
      `${displayName} rental Phoenix`,
      `${makeName} rental Arizona`,
      `${displayName} for rent`,
      `hire ${displayName} Phoenix`
    ],
    openGraph: {
      title,
      description,
      url: `https://itwhip.com/rentals/makes/${make}/${model}`,
      type: 'website'
    },
    alternates: {
      canonical: `https://itwhip.com/rentals/makes/${make}/${model}`,
    },
  }
}

export default async function CarModelPage({ params }: PageProps) {
  const { make, model } = await params

  // Get display names
  const makeName = getMakeDisplayName(make)
  const modelName = getModelDisplayName(model)
  const displayName = `${makeName} ${modelName}`

  // Check for predefined rich SEO data
  const predefinedData = getCarModelBySlug(make, model)

  // Fetch matching cars from database - search by make AND model
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      make: { contains: makeName.replace('-', ' '), mode: 'insensitive' },
      model: { contains: modelName.replace('-', ' '), mode: 'insensitive' }
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
      state: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      transmission: true,
      fuelType: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true }
      }
    },
    orderBy: [
      { instantBook: 'desc' },
      { rating: 'desc' }
    ],
    take: 20
  })

  const totalCars = cars.length
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => Number(c.dailyRate))) : (predefinedData?.priceRange?.min || 50)
  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => Number(c.dailyRate))) : (predefinedData?.priceRange?.max || 200)
  // Calculate average rating only from cars that have ratings
  const carsWithRatings = cars.filter(c => c.rating && c.rating > 0)
  const avgRating = carsWithRatings.length > 0
    ? (carsWithRatings.reduce((acc, c) => acc + (c.rating || 0), 0) / carsWithRatings.length).toFixed(1)
    : null

  // Fetch other model cars from same make (different from current model) for "Other Models" section
  const otherModelCars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      make: { contains: makeName.replace('-', ' '), mode: 'insensitive' },
      NOT: {
        model: { contains: modelName.replace('-', ' '), mode: 'insensitive' }
      }
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
      state: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      transmission: true,
      fuelType: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true }
      }
    },
    orderBy: [
      { instantBook: 'desc' },
      { rating: 'desc' }
    ],
    take: 8
  })

  // Calculate priceValidUntil (90 days from now)
  const priceValidUntilDate = new Date()
  priceValidUntilDate.setDate(priceValidUntilDate.getDate() + 90)
  const priceValidUntil = priceValidUntilDate.toISOString().split('T')[0]

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: `${displayName} Rental`,
        description: `Rent a ${displayName} in Phoenix, AZ from local owners.`,
        image: cars[0]?.photos?.[0]?.url || 'https://itwhip.com/images/placeholder-car.jpg',
        brand: {
          '@type': 'Brand',
          name: makeName
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: minPrice,
          highPrice: maxPrice,
          offerCount: totalCars,
          priceValidUntil,
          availability: totalCars > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          shippingDetails: SHIPPING_DETAILS,
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY
        },
        ...(totalCars > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount: cars.reduce((acc, c) => acc + (c.totalTrips || 1), 0)
          }
        } : {})
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
          { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://itwhip.com/rentals' },
          { '@type': 'ListItem', position: 3, name: `${makeName} Rentals`, item: `https://itwhip.com/rentals/makes/${make}` },
          { '@type': 'ListItem', position: 4, name: modelName, item: `https://itwhip.com/rentals/makes/${make}/${model}` }
        ]
      }
    ]
  }

  // Use predefined data if available, otherwise use dynamic content
  const heroSubtitle = predefinedData?.heroSubtitle ||
    `Rent a ${displayName} from local owners in Phoenix. Experience premium ${makeName} quality with flexible booking and competitive daily rates.`

  const whyRent = predefinedData?.whyRent || [
    `Experience the ${displayName} without the commitment of ownership`,
    `Rent directly from verified local owners in Phoenix`,
    `Flexible pickup and delivery options throughout Arizona`,
    `Full insurance coverage included with every rental`,
    `24/7 roadside assistance for peace of mind`
  ]

  const perfectFor = predefinedData?.perfectFor || [
    'Weekend getaways around Arizona',
    'Special occasions and events',
    'Business trips requiring reliable transportation',
    'Test driving before you buy',
    'Visitors exploring Phoenix and Scottsdale'
  ]

  return (
    <>
      <Script
        id="car-model-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-6 sm:pt-8 pb-10 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-2 uppercase tracking-wide">
                  <IoCarSportOutline className="w-4 h-4" />
                  {makeName} {predefinedData?.carType && `• ${predefinedData.carType}`}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white">
                  Rent a <span className="text-amber-400">{displayName}</span> in Phoenix
                </h1>
                <p className="text-sm sm:text-base text-gray-300 mb-4">
                  {heroSubtitle}
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {totalCars > 0 && (
                    <div className="inline-flex items-baseline gap-1.5 bg-white/10 backdrop-blur rounded-lg px-3 py-1.5">
                      <span className="text-gray-400 text-xs">From</span>
                      <span className="text-xl font-bold text-amber-400">${minPrice}</span>
                      <span className="text-gray-400 text-xs">/day</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-300">
                    <span className="font-bold text-white">{totalCars}</span> available now
                  </div>
                  {totalCars > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <IoStarOutline className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-white">{avgRating}</span> avg rating
                    </div>
                  )}
                </div>

                {/* Key Specs if predefined */}
                {predefinedData?.specs && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {predefinedData.specs.horsepower && (
                      <div className="text-center">
                        <IoSpeedometerOutline className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                        <div className="text-xs font-semibold">{predefinedData.specs.horsepower}</div>
                        <div className="text-[10px] text-gray-400">Power</div>
                      </div>
                    )}
                    {predefinedData.specs.acceleration && (
                      <div className="text-center">
                        <IoFlashOutline className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                        <div className="text-xs font-semibold">{predefinedData.specs.acceleration}</div>
                        <div className="text-[10px] text-gray-400">0-60 mph</div>
                      </div>
                    )}
                    {predefinedData.specs.seats && (
                      <div className="text-center">
                        <IoPeopleOutline className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                        <div className="text-xs font-semibold">{predefinedData.specs.seats}</div>
                        <div className="text-[10px] text-gray-400">Seats</div>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  href={`/rentals/makes/${make}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Browse All {makeName} Rentals
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>

              {/* Right side - Specs Card or Features */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5 border border-white/10">
                {predefinedData?.specs ? (
                  <>
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <IoSettingsOutline className="w-4 h-4 text-amber-400" />
                      Specifications
                    </h2>
                    <dl className="space-y-2 text-sm">
                      {predefinedData.specs.engine && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400 text-xs">Engine</dt>
                          <dd className="font-medium text-xs">{predefinedData.specs.engine}</dd>
                        </div>
                      )}
                      {predefinedData.specs.range && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400 text-xs">Range</dt>
                          <dd className="font-medium text-xs">{predefinedData.specs.range}</dd>
                        </div>
                      )}
                      {predefinedData.specs.horsepower && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400 text-xs">Horsepower</dt>
                          <dd className="font-medium text-xs">{predefinedData.specs.horsepower}</dd>
                        </div>
                      )}
                      {predefinedData.specs.acceleration && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400 text-xs">Acceleration</dt>
                          <dd className="font-medium text-xs">{predefinedData.specs.acceleration}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-400 text-xs">Seating</dt>
                        <dd className="font-medium text-xs">{predefinedData.specs.seats} passengers</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400 text-xs">Drivetrain</dt>
                        <dd className="font-medium text-xs">{predefinedData.specs.drivetrain}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400 text-xs">Fuel</dt>
                        <dd className="font-medium text-xs flex items-center gap-1">
                          {predefinedData.specs.fuelType === 'Electric' && <IoLeafOutline className="w-3 h-3 text-green-400" />}
                          {predefinedData.specs.fuelType}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <IoShieldCheckmarkOutline className="w-4 h-4 text-amber-400" />
                      Why Rent with ItWhip?
                    </h2>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300">Verified local owners in Phoenix</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300">Full insurance coverage included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300">24/7 roadside assistance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300">Flexible pickup & delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300">No hidden fees or charges</span>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/rentals" className="hover:text-amber-600">
                  Rentals
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href={`/rentals/makes/${make}`} className="hover:text-amber-600">
                  {makeName}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {modelName}
              </li>
            </ol>
          </nav>
        </div>

        {/* Why Rent / Perfect For Section */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Why Rent */}
              <div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Why Rent a {displayName}?
                </h2>
                <ul className="space-y-2">
                  {whyRent.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Perfect For */}
              <div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Perfect For
                </h2>
                <ul className="space-y-2">
                  {perfectFor.map((use, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <IoStarOutline className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content */}
            {predefinedData?.content && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {predefinedData.content}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Features Grid - only if predefined */}
        {predefinedData?.features && (
          <section className="py-6 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Key Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {predefinedData.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Available Cars */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {totalCars > 0 ? `Available ${displayName} Rentals` : `${displayName} Rentals`}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {totalCars > 0
                    ? `${totalCars} ${displayName} vehicle${totalCars > 1 ? 's' : ''} available in Phoenix`
                    : `No ${displayName} vehicles currently available`
                  }
                </p>
              </div>
              <Link
                href={`/rentals/makes/${make}`}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View all {makeName}
                <IoChevronForwardOutline className="w-3.5 h-3.5" />
              </Link>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {cars.map((car) => (
                  <CompactCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <IoCarOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  No {displayName} Available Right Now
                </h3>
                <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
                  We don&apos;t currently have any {displayName} vehicles in our fleet, but check back soon or browse other {makeName} models below.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Link
                    href={`/rentals/makes/${make}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Browse All {makeName}
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/rentals"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Browse All Cars
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Other Models from Same Make - show actual cars with CompactCarCard */}
        {otherModelCars.length > 0 && (
          <section className="py-8 bg-gray-100 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Other {makeName} Models Available
                </h2>
                <Link
                  href={`/rentals/makes/${make}`}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                >
                  View all {makeName}
                  <IoChevronForwardOutline className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {otherModelCars.map((car) => (
                  <CompactCarCard key={car.id} car={car} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs - only if predefined */}
        {predefinedData?.faqs && predefinedData.faqs.length > 0 && (
          <section className="py-6 bg-gray-100 dark:bg-gray-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <IoHelpCircleOutline className="w-4 h-4 text-amber-500" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                {predefinedData.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-medium text-gray-900 dark:text-white">
                      {faq.question}
                      <IoChevronForwardOutline className="w-3.5 h-3.5 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                    </summary>
                    <div className="px-3 pb-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold mb-2">
              {totalCars > 0
                ? `Ready to Drive a ${displayName}?`
                : `Looking for a ${makeName}?`
              }
            </h2>
            <p className="text-sm text-white/90 mb-4">
              Book directly from local owners in Phoenix. Better cars, better prices, better experience.
            </p>
            <Link
              href={totalCars > 0 ? `/rentals/search?make=${encodeURIComponent(makeName)}&model=${encodeURIComponent(modelName)}` : `/rentals/makes/${make}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-amber-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              {totalCars > 0 ? `Book a ${displayName}` : `Browse ${makeName} Rentals`}
              <IoChevronForwardOutline className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
