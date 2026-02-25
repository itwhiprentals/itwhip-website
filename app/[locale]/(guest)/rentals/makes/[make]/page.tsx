// app/(guest)/rentals/makes/[make]/page.tsx
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
import { generateCarUrl } from '@/app/lib/utils/urls'
import {
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// SLUG → TRANSLATION KEY MAPPING
// ============================================
const SLUG_TO_KEY: Record<string, string> = {
  'tesla': 'tesla',
  'bmw': 'bmw',
  'mercedes': 'mercedes',
  'porsche': 'porsche',
  'lamborghini': 'lamborghini',
  'audi': 'audi',
  'lexus': 'lexus',
  'dodge': 'dodge',
  'toyota': 'toyota',
  'honda': 'honda',
  'ford': 'ford',
  'chevrolet': 'chevrolet',
  'jeep': 'jeep',
  'nissan': 'nissan',
  'hyundai': 'hyundai',
  'kia': 'kia',
  'subaru': 'subaru',
  'mazda': 'mazda',
  'volkswagen': 'volkswagen',
  'cadillac': 'cadillac',
  'genesis': 'genesis',
  'volvo': 'volvo',
  'land-rover': 'landRover',
  'ferrari': 'ferrari',
  'mclaren': 'mclaren',
  'bentley': 'bentley',
  'rolls-royce': 'rollsRoyce',
  'chrysler': 'chrysler',
  'ram': 'ram',
  'gmc': 'gmc',
}

// ============================================
// CAR MAKE DATA (non-translatable fields only)
// ============================================
const CAR_MAKE_DATA: Record<string, {
  displayName: string
  dbValue: string
  country: string
  founded: string
  keywords: string[]
  popularModels: string[]
  priceRange: string
}> = {
  'tesla': {
    displayName: 'Tesla',
    dbValue: 'Tesla',
    country: 'USA',
    founded: '2003',
    keywords: ['tesla rental phoenix', 'model 3 rental arizona', 'model y rental phoenix', 'electric car rental phoenix', 'tesla model s rental'],
    popularModels: ['Model 3', 'Model Y', 'Model S', 'Model X'],
    priceRange: '$80-250/day'
  },
  'bmw': {
    displayName: 'BMW',
    dbValue: 'BMW',
    country: 'Germany',
    founded: '1916',
    keywords: ['bmw rental phoenix', 'bmw 3 series rental arizona', 'bmw x5 rental phoenix', 'luxury german car rental', 'bmw rental scottsdale'],
    popularModels: ['3 Series', '5 Series', 'X3', 'X5', 'M4'],
    priceRange: '$90-350/day'
  },
  'mercedes': {
    displayName: 'Mercedes-Benz',
    dbValue: 'Mercedes-Benz',
    country: 'Germany',
    founded: '1926',
    keywords: ['mercedes rental phoenix', 'mercedes benz rental arizona', 'c class rental phoenix', 's class rental scottsdale', 'luxury car rental phoenix'],
    popularModels: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'AMG GT'],
    priceRange: '$100-500/day'
  },
  'porsche': {
    displayName: 'Porsche',
    dbValue: 'Porsche',
    country: 'Germany',
    founded: '1931',
    keywords: ['porsche rental phoenix', 'porsche 911 rental arizona', 'cayenne rental phoenix', 'taycan rental scottsdale', 'exotic car rental phoenix'],
    popularModels: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera'],
    priceRange: '$200-800/day'
  },
  'lamborghini': {
    displayName: 'Lamborghini',
    dbValue: 'Lamborghini',
    country: 'Italy',
    founded: '1963',
    keywords: ['lamborghini rental phoenix', 'huracan rental arizona', 'urus rental phoenix', 'exotic car rental scottsdale', 'supercar rental phoenix'],
    popularModels: ['Huracán', 'Urus', 'Aventador'],
    priceRange: '$800-2000/day'
  },
  'audi': {
    displayName: 'Audi',
    dbValue: 'Audi',
    country: 'Germany',
    founded: '1909',
    keywords: ['audi rental phoenix', 'audi a4 rental arizona', 'audi q7 rental phoenix', 'quattro rental scottsdale', 'german luxury car rental'],
    popularModels: ['A4', 'A6', 'Q5', 'Q7', 'RS6'],
    priceRange: '$85-300/day'
  },
  'lexus': {
    displayName: 'Lexus',
    dbValue: 'Lexus',
    country: 'Japan',
    founded: '1989',
    keywords: ['lexus rental phoenix', 'lexus es rental arizona', 'lexus rx rental phoenix', 'japanese luxury car rental', 'reliable luxury car rental'],
    popularModels: ['ES', 'IS', 'RX', 'GX', 'LC'],
    priceRange: '$80-250/day'
  },
  'dodge': {
    displayName: 'Dodge',
    dbValue: 'Dodge',
    country: 'USA',
    founded: '1900',
    keywords: ['dodge rental phoenix', 'challenger rental arizona', 'charger rental phoenix', 'hellcat rental phoenix', 'muscle car rental arizona'],
    popularModels: ['Challenger', 'Challenger SRT', 'Challenger Hellcat', 'Charger', 'Charger SRT', 'Charger Hellcat', 'Durango'],
    priceRange: '$80-400/day'
  },
  'toyota': {
    displayName: 'Toyota',
    dbValue: 'Toyota',
    country: 'Japan',
    founded: '1937',
    keywords: ['toyota rental phoenix', 'camry rental arizona', 'rav4 rental phoenix', 'highlander rental scottsdale', 'reliable car rental phoenix'],
    popularModels: ['Camry', 'RAV4', 'Highlander', '4Runner', 'Corolla'],
    priceRange: '$45-120/day'
  },
  'honda': {
    displayName: 'Honda',
    dbValue: 'Honda',
    country: 'Japan',
    founded: '1948',
    keywords: ['honda rental phoenix', 'civic rental arizona', 'accord rental phoenix', 'crv rental scottsdale', 'reliable car rental arizona'],
    popularModels: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
    priceRange: '$40-110/day'
  },
  'ford': {
    displayName: 'Ford',
    dbValue: 'Ford',
    country: 'USA',
    founded: '1903',
    keywords: ['ford rental phoenix', 'mustang rental arizona', 'f150 rental phoenix', 'bronco rental scottsdale', 'truck rental arizona'],
    popularModels: ['Mustang', 'F-150', 'Explorer', 'Bronco', 'Edge'],
    priceRange: '$50-200/day'
  },
  'chevrolet': {
    displayName: 'Chevrolet',
    dbValue: 'Chevrolet',
    country: 'USA',
    founded: '1911',
    keywords: ['chevrolet rental phoenix', 'chevy rental arizona', 'corvette rental phoenix', 'tahoe rental scottsdale', 'silverado rental arizona'],
    popularModels: ['Corvette', 'Silverado', 'Tahoe', 'Equinox', 'Camaro'],
    priceRange: '$50-350/day'
  },
  'jeep': {
    displayName: 'Jeep',
    dbValue: 'Jeep',
    country: 'USA',
    founded: '1941',
    keywords: ['jeep rental phoenix', 'wrangler rental arizona', 'grand cherokee rental phoenix', 'gladiator rental scottsdale', 'off road rental arizona'],
    popularModels: ['Wrangler', 'Grand Cherokee', 'Gladiator', 'Cherokee', 'Compass'],
    priceRange: '$70-180/day'
  },
  'nissan': {
    displayName: 'Nissan',
    dbValue: 'Nissan',
    country: 'Japan',
    founded: '1933',
    keywords: ['nissan rental phoenix', 'altima rental arizona', 'rogue rental phoenix', 'pathfinder rental scottsdale', 'gtr rental arizona'],
    popularModels: ['Altima', 'Rogue', 'Pathfinder', 'GT-R', 'Frontier'],
    priceRange: '$45-500/day'
  },
  'hyundai': {
    displayName: 'Hyundai',
    dbValue: 'Hyundai',
    country: 'South Korea',
    founded: '1967',
    keywords: ['hyundai rental phoenix', 'sonata rental arizona', 'tucson rental phoenix', 'palisade rental scottsdale', 'affordable car rental arizona'],
    popularModels: ['Sonata', 'Tucson', 'Palisade', 'Santa Fe', 'Elantra'],
    priceRange: '$40-100/day'
  },
  'kia': {
    displayName: 'Kia',
    dbValue: 'Kia',
    country: 'South Korea',
    founded: '1944',
    keywords: ['kia rental phoenix', 'telluride rental arizona', 'sportage rental phoenix', 'k5 rental scottsdale', 'affordable suv rental arizona'],
    popularModels: ['Telluride', 'Sportage', 'K5', 'Sorento', 'Carnival'],
    priceRange: '$40-110/day'
  },
  'subaru': {
    displayName: 'Subaru',
    dbValue: 'Subaru',
    country: 'Japan',
    founded: '1953',
    keywords: ['subaru rental phoenix', 'outback rental arizona', 'forester rental phoenix', 'wrx rental scottsdale', 'awd rental arizona'],
    popularModels: ['Outback', 'Forester', 'Crosstrek', 'WRX', 'Ascent'],
    priceRange: '$55-150/day'
  },
  'mazda': {
    displayName: 'Mazda',
    dbValue: 'Mazda',
    country: 'Japan',
    founded: '1920',
    keywords: ['mazda rental phoenix', 'mazda3 rental arizona', 'cx5 rental phoenix', 'miata rental scottsdale', 'fun car rental arizona'],
    popularModels: ['Mazda3', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30'],
    priceRange: '$45-120/day'
  },
  'volkswagen': {
    displayName: 'Volkswagen',
    dbValue: 'Volkswagen',
    country: 'Germany',
    founded: '1937',
    keywords: ['volkswagen rental phoenix', 'vw rental arizona', 'golf rental phoenix', 'atlas rental scottsdale', 'german car rental arizona'],
    popularModels: ['Golf', 'Jetta', 'Tiguan', 'Atlas', 'ID.4'],
    priceRange: '$50-130/day'
  },
  'cadillac': {
    displayName: 'Cadillac',
    dbValue: 'Cadillac',
    country: 'USA',
    founded: '1902',
    keywords: ['cadillac rental phoenix', 'escalade rental arizona', 'ct5 rental phoenix', 'luxury suv rental scottsdale', 'american luxury rental arizona'],
    popularModels: ['Escalade', 'CT5', 'Lyriq', 'XT5', 'XT6'],
    priceRange: '$90-400/day'
  },
  'genesis': {
    displayName: 'Genesis',
    dbValue: 'Genesis',
    country: 'South Korea',
    founded: '2015',
    keywords: ['genesis rental phoenix', 'g80 rental arizona', 'gv80 rental phoenix', 'luxury korean car rental scottsdale', 'premium car rental arizona'],
    popularModels: ['G70', 'G80', 'G90', 'GV70', 'GV80'],
    priceRange: '$80-200/day'
  },
  'volvo': {
    displayName: 'Volvo',
    dbValue: 'Volvo',
    country: 'Sweden',
    founded: '1927',
    keywords: ['volvo rental phoenix', 'xc90 rental arizona', 'xc60 rental phoenix', 'safe car rental scottsdale', 'scandinavian car rental arizona'],
    popularModels: ['XC40', 'XC60', 'XC90', 'S60', 'V60'],
    priceRange: '$70-180/day'
  },
  'land-rover': {
    displayName: 'Land Rover',
    dbValue: 'Land Rover',
    country: 'UK',
    founded: '1948',
    keywords: ['land rover rental phoenix', 'range rover rental arizona', 'defender rental phoenix', 'luxury suv rental scottsdale', 'off road luxury rental arizona'],
    popularModels: ['Range Rover', 'Range Rover Sport', 'Defender', 'Discovery', 'Evoque'],
    priceRange: '$150-600/day'
  },
  'ferrari': {
    displayName: 'Ferrari',
    dbValue: 'Ferrari',
    country: 'Italy',
    founded: '1947',
    keywords: ['ferrari rental phoenix', '488 rental arizona', 'f8 rental phoenix', 'supercar rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['488', 'F8 Tributo', 'SF90', 'Roma', 'Portofino'],
    priceRange: '$1000-3000/day'
  },
  'mclaren': {
    displayName: 'McLaren',
    dbValue: 'McLaren',
    country: 'UK',
    founded: '1963',
    keywords: ['mclaren rental phoenix', '720s rental arizona', 'artura rental phoenix', 'supercar rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['720S', 'Artura', 'GT', '765LT'],
    priceRange: '$1200-3500/day'
  },
  'bentley': {
    displayName: 'Bentley',
    dbValue: 'Bentley',
    country: 'UK',
    founded: '1919',
    keywords: ['bentley rental phoenix', 'continental gt rental arizona', 'bentayga rental phoenix', 'ultra luxury rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['Continental GT', 'Bentayga', 'Flying Spur'],
    priceRange: '$800-2000/day'
  },
  'rolls-royce': {
    displayName: 'Rolls-Royce',
    dbValue: 'Rolls-Royce',
    country: 'UK',
    founded: '1904',
    keywords: ['rolls royce rental phoenix', 'ghost rental arizona', 'cullinan rental phoenix', 'ultra luxury rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['Ghost', 'Cullinan', 'Phantom', 'Wraith'],
    priceRange: '$1500-4000/day'
  },
  'chrysler': {
    displayName: 'Chrysler',
    dbValue: 'Chrysler',
    country: 'USA',
    founded: '1925',
    keywords: ['chrysler rental phoenix', 'chrysler 300 rental arizona', 'pacifica rental phoenix', 'family car rental scottsdale', 'minivan rental arizona'],
    popularModels: ['300', 'Pacifica', 'Pacifica Hybrid'],
    priceRange: '$60-130/day'
  },
  'ram': {
    displayName: 'RAM',
    dbValue: 'Ram',
    country: 'USA',
    founded: '2010',
    keywords: ['ram rental phoenix', 'ram 1500 rental arizona', 'ram 2500 rental phoenix', 'truck rental scottsdale', 'heavy duty truck rental arizona'],
    popularModels: ['1500', '2500', '3500', 'TRX'],
    priceRange: '$80-250/day'
  },
  'gmc': {
    displayName: 'GMC',
    dbValue: 'GMC',
    country: 'USA',
    founded: '1911',
    keywords: ['gmc rental phoenix', 'sierra rental arizona', 'yukon rental phoenix', 'denali rental scottsdale', 'truck rental arizona'],
    popularModels: ['Sierra', 'Yukon', 'Acadia', 'Terrain', 'Hummer EV'],
    priceRange: '$80-350/day'
  }
}

// Slug aliases for makes with different URL formats
const MAKE_SLUG_ALIASES: Record<string, string> = {
  'mercedes-benz': 'mercedes',
}

// No generateStaticParams — pages render on-demand via ISR (revalidate = 60)

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; make: string }>
}): Promise<Metadata> {
  const { locale, make } = await params
  const lookupKey = MAKE_SLUG_ALIASES[make.toLowerCase()] || make.toLowerCase()
  const makeData = CAR_MAKE_DATA[lookupKey]
  const tKey = SLUG_TO_KEY[lookupKey]

  if (!makeData || !tKey) {
    const t = await getTranslations({ locale, namespace: 'RentalMake' })
    return { title: t('metaNotFound') }
  }

  const t = await getTranslations({ locale, namespace: 'RentalMake' })
  const description = t(`${tKey}Description`)
  const title = t('metaTitle', { make: makeData.displayName })

  return {
    title,
    description,
    keywords: makeData.keywords,
    openGraph: {
      title,
      description,
      url: getCanonicalUrl(`/rentals/makes/${make}`, locale),
      siteName: 'ItWhip',
      locale: getOgLocale(locale),
      type: 'website',
      images: [{
        url: 'https://itwhip.com/og-default-car.jpg',
        width: 1200,
        height: 630,
        alt: t('heroImageAlt', { make: makeData.displayName })
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://itwhip.com/og-default-car.jpg']
    },
    alternates: {
      canonical: getCanonicalUrl(`/rentals/makes/${make}`, locale),
      languages: getAlternateLanguages(`/rentals/makes/${make}`),
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
  params: Promise<{ locale: string; make: string }>
}) {
  const { locale, make } = await params
  const lookupKey = MAKE_SLUG_ALIASES[make.toLowerCase()] || make.toLowerCase()
  const makeData = CAR_MAKE_DATA[lookupKey]
  const tKey = SLUG_TO_KEY[lookupKey]

  if (!makeData || !tKey) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'RentalMake' })
  const description = t(`${tKey}Description`)
  const longDescription = t(`${tKey}LongDescription`)
  const knownFor = Array.from({ length: 5 }, (_, i) => t(`${tKey}KnownFor${i}`))

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
      vehicleType: true,
      dailyRate: true,
      city: true,
      state: true,
      seats: true,
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
    seats: car.seats,
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
      { '@type': 'ListItem', position: 3, name: t('breadcrumbMakeRentals', { make: makeData.displayName }), item: `https://itwhip.com/rentals/makes/${make}` }
    ]
  }

  const autoRentalSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': `https://itwhip.com/rentals/makes/${make}#autorental`,
    name: t('schemaRentalName', { make: makeData.displayName }),
    url: `https://itwhip.com/rentals/makes/${make}`,
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

  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: makeData.displayName,
    description,
    url: `https://itwhip.com/rentals/makes/${make}`
  }

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('heroTitle', { make: makeData.displayName }),
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

  // Get related makes (exclude current)
  const relatedMakes = Object.entries(CAR_MAKE_DATA)
    .filter(([key]) => key !== lookupKey)
    .slice(0, 6)

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
                {t('breadcrumbHome')}
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <Link href="/rentals" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                {t('breadcrumbRentals')}
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                {t('breadcrumbMakeRentals', { make: makeData.displayName })}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-4 sm:pt-6 pb-12 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <span>{makeData.country}</span>
                  <span>•</span>
                  <span>{t('established', { year: makeData.founded })}</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-amber-400">
                  {t('heroTitle', { make: makeData.displayName })}
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                  {longDescription}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <span className="text-gray-400 text-sm">{t('availableLabel')}</span>
                  <p className="text-3xl font-bold">{cars.length}</p>
                  <span className="text-gray-400 text-sm">{t('vehiclesLabel')}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <span className="text-gray-400 text-sm">{t('fromLabel')}</span>
                  <p className="text-2xl font-bold">{makeData.priceRange.split('-')[0]}</p>
                  <span className="text-gray-400 text-sm">{t('perDay')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Known For Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              {t('knownForTitle', { make: makeData.displayName.toUpperCase() })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {knownFor.map((trait, i) => (
                <span
                  key={i}
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
              {t('popularModelsTitle')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {makeData.popularModels.map((model) => {
                const modelSlug = model.toLowerCase().replace(/\s+/g, '-')
                return (
                  <Link
                    key={model}
                    href={`/rentals/makes/${make}/${modelSlug}`}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:border-purple-500 hover:text-purple-600 transition shadow-sm hover:shadow-md"
                  >
                    {makeData.displayName} {model}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Car Listings */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('availableVehiclesTitle', { make: makeData.displayName })}
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
                  {t('noVehiclesTitle', { make: makeData.displayName })}
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

        {/* Other Makes */}
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('browseOtherMakes')}
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
