// app/rideshare/makes/[make]/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'
import {
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoCarSportOutline,
} from 'react-icons/io5'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// RIDESHARE MAKE STATIC DATA (non-translatable)
// ============================================
const RIDESHARE_MAKE_DATA: Record<string, {
  displayName: string
  dbValue: string
  slug: string
  country: string
  keywords: string[]
  popularModels: string[]
  weeklyPriceRange: string
  logo: string
}> = {
  'toyota': {
    displayName: 'Toyota',
    dbValue: 'Toyota',
    slug: 'toyota',
    country: 'Japan',
    keywords: ['toyota rideshare rental phoenix', 'camry uber rental', 'prius lyft rental phoenix', 'toyota uber car phoenix', 'rideshare car rental arizona', 'toyota gig driver rental'],
    popularModels: ['Camry', 'Corolla', 'Prius', 'RAV4', 'Camry Hybrid'],
    weeklyPriceRange: '$299-399/week',
    logo: '/logos/makes/toyota.png',
  },
  'honda': {
    displayName: 'Honda',
    dbValue: 'Honda',
    slug: 'honda',
    country: 'Japan',
    keywords: ['honda rideshare rental phoenix', 'accord uber rental', 'civic lyft rental phoenix', 'honda uber car phoenix', 'rideshare honda arizona', 'honda gig driver rental'],
    popularModels: ['Accord', 'Civic', 'CR-V', 'Accord Hybrid', 'HR-V'],
    weeklyPriceRange: '$289-389/week',
    logo: '/logos/makes/honda.png',
  },
  'hyundai': {
    displayName: 'Hyundai',
    dbValue: 'Hyundai',
    slug: 'hyundai',
    country: 'South Korea',
    keywords: ['hyundai rideshare rental phoenix', 'elantra uber rental', 'sonata lyft rental phoenix', 'hyundai uber car phoenix', 'cheap rideshare rental arizona', 'hyundai gig driver rental'],
    popularModels: ['Elantra', 'Sonata', 'Tucson', 'Elantra Hybrid', 'Santa Fe'],
    weeklyPriceRange: '$269-359/week',
    logo: '/logos/makes/hyundai.png',
  },
  'kia': {
    displayName: 'Kia',
    dbValue: 'Kia',
    slug: 'kia',
    country: 'South Korea',
    keywords: ['kia rideshare rental phoenix', 'forte uber rental', 'k5 lyft rental phoenix', 'kia uber car phoenix', 'affordable rideshare rental arizona', 'cheapest uber rental phoenix'],
    popularModels: ['Forte', 'K5', 'Sportage', 'Soul', 'Seltos'],
    weeklyPriceRange: '$249-339/week',
    logo: '/logos/makes/kia.png',
  },
  'nissan': {
    displayName: 'Nissan',
    dbValue: 'Nissan',
    slug: 'nissan',
    country: 'Japan',
    keywords: ['nissan rideshare rental phoenix', 'altima uber rental', 'sentra lyft rental phoenix', 'nissan uber car phoenix', 'rideshare nissan arizona', 'nissan gig driver rental'],
    popularModels: ['Altima', 'Sentra', 'Rogue', 'Versa', 'Kicks'],
    weeklyPriceRange: '$259-349/week',
    logo: '/logos/makes/nissan.png',
  },
  'chevrolet': {
    displayName: 'Chevrolet',
    dbValue: 'Chevrolet',
    slug: 'chevrolet',
    country: 'USA',
    keywords: ['chevrolet rideshare rental phoenix', 'malibu uber rental', 'equinox lyft rental phoenix', 'chevy uber car phoenix', 'american rideshare car arizona', 'chevrolet gig driver rental'],
    popularModels: ['Malibu', 'Equinox', 'Trax', 'Cruze', 'Bolt EV'],
    weeklyPriceRange: '$269-369/week',
    logo: '/logos/makes/chevrolet.png',
  }
}

// Get other makes for related section
const getRelatedMakes = (currentMake: string) => {
  return Object.entries(RIDESHARE_MAKE_DATA)
    .filter(([key]) => key !== currentMake)
    .map(([key, data]) => ({
      slug: key,
      name: data.displayName,
      logo: data.logo,
      price: data.weeklyPriceRange.split('-')[0]
    }))
}

// No generateStaticParams — pages render on-demand via ISR (revalidate = 60)

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; make: string }>
}): Promise<Metadata> {
  const { locale, make } = await params
  const makeData = RIDESHARE_MAKE_DATA[make.toLowerCase()]

  if (!makeData) {
    const t = await getTranslations({ locale, namespace: 'RideshareMake' })
    return { title: t('metaNotFound') }
  }

  const t = await getTranslations({ locale, namespace: 'RideshareMake' })
  const title = t('metaTitle', { make: makeData.displayName })
  const description = t(`${makeData.slug}Description`)

  return {
    title,
    description,
    keywords: makeData.keywords,
    openGraph: {
      title,
      description,
      url: getCanonicalUrl(`/rideshare/makes/${make}`, locale),
      siteName: 'ItWhip',
      locale: getOgLocale(locale),
      type: 'website',
      images: [{
        url: 'https://itwhip.com/og-rideshare.jpg',
        width: 1200,
        height: 630,
        alt: t('metaImageAlt', { make: makeData.displayName })
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://itwhip.com/og-rideshare.jpg']
    },
    alternates: {
      canonical: getCanonicalUrl(`/rideshare/makes/${make}`, locale),
      languages: getAlternateLanguages(`/rideshare/makes/${make}`)
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

// Page component
export default async function RideshareMakePage({
  params
}: {
  params: Promise<{ locale: string; make: string }>
}) {
  const { locale, make } = await params
  const makeData = RIDESHARE_MAKE_DATA[make.toLowerCase()]

  if (!makeData) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'RideshareMake' })
  const slug = makeData.slug

  // Build translated per-make content
  const advantages = Array.from({ length: 5 }, (_, i) => t(`${slug}Advantage${i}`))
  const faqs = Array.from({ length: 6 }, (_, i) => ({
    question: t(`${slug}Faq${i}Question`),
    answer: t(`${slug}Faq${i}Answer`)
  }))

  // Fetch rideshare cars of this make from database
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      vehicleType: 'RIDESHARE',
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
      weeklyRate: true,
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
      { weeklyRate: 'asc' },
      { rating: 'desc' }
    ],
    take: 24
  })

  // Transform cars for display
  const transformedCars = cars.map(car => ({
    ...car,
    url: generateCarUrl(car)
  }))

  const relatedMakes = getRelatedMakes(make.toLowerCase())
  const minWeeklyRate = cars.length > 0
    ? Math.min(...cars.filter(c => c.weeklyRate).map(c => c.weeklyRate!))
    : null

  // JSON-LD Schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('schemaHome'), item: 'https://itwhip.com' },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbRideshare'), item: 'https://itwhip.com/rideshare' },
      { '@type': 'ListItem', position: 3, name: makeData.displayName, item: `https://itwhip.com/rideshare/makes/${make}` }
    ]
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  const autoRentalSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: t('schemaAutoRentalName', { make: makeData.displayName }),
    description: t(`${slug}Description`),
    url: `https://itwhip.com/rideshare/makes/${make}`,
    areaServed: {
      '@type': 'City',
      name: 'Phoenix',
      containedInPlace: { '@type': 'State', name: 'Arizona' }
    },
    priceRange: makeData.weeklyPriceRange,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '156'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(autoRentalSchema) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                <IoHomeOutline className="w-4 h-4" />
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 mx-2" />
              <Link href="/rideshare" className="hover:text-gray-700 dark:hover:text-gray-300">
                {t('breadcrumbRideshare')}
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 mx-2" />
              <span className="text-gray-900 dark:text-white font-medium">{makeData.displayName}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                <img
                  src={makeData.logo}
                  alt={`${makeData.displayName} logo`}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>

              {/* Content */}
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-3">
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('uberLyftApproved')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                  {t('heroTitle', { make: makeData.displayName })}
                </h1>
                <p className="text-sm sm:text-base text-orange-100 max-w-xl mb-3">
                  {t(`${slug}LongDescription`)}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm">
                  {minWeeklyRate && (
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5">
                      <span className="font-bold">{t('fromPrice', { price: `$${minWeeklyRate}` })}</span>
                      <span className="text-orange-100">{t('perWeek')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-orange-100">
                    <IoCarSportOutline className="w-4 h-4" />
                    <span>{t('vehiclesAvailable', { count: cars.length })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Make Section */}
        <section className="py-4 sm:py-5 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">
              {t('whyMakeTitle', { make: makeData.displayName })}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
              {advantages.map((advantage, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-2.5">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Grid or No Cars Message */}
        <section className="py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {t('availableVehiclesTitle', { make: makeData.displayName })}
              </h2>
              {cars.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('vehiclesCount', { count: cars.length })}
                </span>
              )}
            </div>

            {transformedCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {transformedCars.map((car) => (
                  <CompactCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-lg">
                <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                  {t('noVehiclesTitle', { make: makeData.displayName })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  {t('noVehiclesDescription', { make: makeData.displayName })}
                </p>
                <Link
                  href="/rideshare"
                  className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
                >
                  {t('browseAllVehicles')}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Popular Models */}
        <section className="py-4 sm:py-5 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
              {t('popularModelsTitle', { make: makeData.displayName })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {makeData.popularModels.map((model) => (
                <div
                  key={model}
                  className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium"
                >
                  {makeData.displayName} {model}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-6 sm:py-8 bg-gray-50 dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {t('faqsTitle', { make: makeData.displayName })}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Makes */}
        <section className="py-4 sm:py-6 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('otherMakesTitle')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedMakes.map((relMake) => (
                <Link
                  key={relMake.slug}
                  href={`/rideshare/makes/${relMake.slug}`}
                  className="group bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:bg-orange-50 dark:hover:bg-orange-900/20 transition border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500"
                >
                  <div className="w-10 h-10 mx-auto mb-1.5">
                    <img
                      src={relMake.logo}
                      alt={relMake.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {relMake.name}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                    {t('pricePerWeek', { price: relMake.price })}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 sm:py-8 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              {t('ctaTitle', { make: makeData.displayName })}
            </h2>
            <p className="text-sm text-orange-100 mb-4">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/rideshare"
                className="inline-block px-6 py-2.5 bg-white text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-50 transition shadow-lg"
              >
                {t('browseAllVehicles')}
              </Link>
              <Link
                href="/rideshare/apply"
                className="inline-block px-6 py-2.5 bg-orange-400 text-white rounded-lg text-sm font-bold hover:bg-orange-300 transition"
              >
                {t('ctaApply')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
