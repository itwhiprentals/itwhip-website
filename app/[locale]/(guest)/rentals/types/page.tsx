// app/[locale]/(guest)/rentals/types/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import prisma from '@/app/lib/database/prisma'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'
import {
  IoCarSportOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const revalidate = 60

// Cloudinary base path for vehicle type images (with auto-format, auto-quality, responsive width)
const CLD = 'https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_420,c_fill,g_auto'

// All vehicle types with their slugs, translation keys, images, and DB values
const VEHICLE_TYPES = [
  { slug: 'sedan', tKey: 'sedan', image: `${CLD}/vehicle-types/sedan-car-rental.jpg`, dbValue: 'SEDAN' },
  { slug: 'suv', tKey: 'suv', image: `${CLD}/vehicle-types/suv-car-rental.jpg`, dbValue: 'SUV' },
  { slug: 'luxury', tKey: 'luxury', image: `${CLD}/vehicle-types/luxury-car-rental.jpg`, dbValue: 'LUXURY' },
  { slug: 'sports', tKey: 'sports', image: `${CLD}/vehicle-types/sports-car-rental.jpg`, dbValue: 'SPORTS' },
  { slug: 'convertible', tKey: 'convertible', image: `${CLD}/vehicle-types/convertible-car-rental.jpg`, dbValue: 'CONVERTIBLE' },
  { slug: 'electric', tKey: 'electric', image: `${CLD}/vehicle-types/electric-car-rental.jpg`, dbValue: 'ELECTRIC' },
  { slug: 'truck', tKey: 'truck', image: `${CLD}/vehicle-types/truck-car-rental.jpg`, dbValue: 'TRUCK' },
  { slug: 'exotic', tKey: 'exotic', image: `${CLD}/vehicle-types/exotic-car-rental.jpg`, dbValue: 'EXOTIC' },
  { slug: 'coupe', tKey: 'coupe', image: `${CLD}/vehicle-types/coupe-car-rental.jpg`, dbValue: 'COUPE' },
  { slug: 'economy', tKey: 'economy', image: `${CLD}/vehicle-types/economy-car-rental.jpg`, dbValue: 'SEDAN' },
  { slug: 'family', tKey: 'family', image: `${CLD}/vehicle-types/family-car-rental.jpg`, dbValue: 'SUV' },
  { slug: '7-seater', tKey: 'sevenSeater', image: `${CLD}/vehicle-types/7-seater-car-rental.jpg`, dbValue: 'SUV' },
  { slug: '8-seater', tKey: 'eightSeater', image: `${CLD}/vehicle-types/8-seater-car-rental.jpg`, dbValue: 'SUV' },
] as const

const PRICE_RANGES: Record<string, string> = {
  'sedan': '$35-120/day',
  'suv': '$45-150/day',
  'luxury': '$100-500/day',
  'sports': '$150-800/day',
  'convertible': '$80-400/day',
  'electric': '$80-300/day',
  'truck': '$60-180/day',
  'exotic': '$500-2000/day',
  'coupe': '$100-400/day',
  'economy': '$29-55/day',
  'family': '$55-150/day',
  '7-seater': '$75-175/day',
  '8-seater': '$85-225/day',
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'RentalTypeIndex' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: getCanonicalUrl('/rentals/types', locale),
      siteName: 'ItWhip',
      locale: getOgLocale(locale),
      type: 'website',
      images: [{
        url: 'https://itwhip.com/og-default-car.jpg',
        width: 1200,
        height: 630,
        alt: t('heroTitle')
      }]
    },
    alternates: {
      canonical: getCanonicalUrl('/rentals/types', locale),
      languages: getAlternateLanguages('/rentals/types')
    },
    robots: { index: true, follow: true }
  }
}

export default async function VehicleTypesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'RentalTypeIndex' })
  const tType = await getTranslations({ locale, namespace: 'RentalType' })

  // Count active vehicles per car type
  const typeCounts = await prisma.rentalCar.groupBy({
    by: ['carType'],
    where: { isActive: true },
    _count: { id: true }
  })

  const countMap: Record<string, number> = {}
  typeCounts.forEach(tc => {
    countMap[tc.carType.toUpperCase()] = tc._count.id
  })

  // Also count electric by fuelType
  const electricCount = await prisma.rentalCar.count({
    where: {
      isActive: true,
      OR: [
        { carType: { equals: 'ELECTRIC', mode: 'insensitive' } },
        { fuelType: { in: ['electric', 'ELECTRIC', 'Electric'] } }
      ]
    }
  })

  const totalCars = await prisma.rentalCar.count({ where: { isActive: true } })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tType('breadcrumbHome'), item: 'https://itwhip.com' },
      { '@type': 'ListItem', position: 2, name: tType('breadcrumbRentals'), item: 'https://itwhip.com/rentals' },
      { '@type': 'ListItem', position: 3, name: t('breadcrumbAllTypes'), item: 'https://itwhip.com/rentals/types' }
    ]
  }

  function getCount(slug: string, dbValue: string): number {
    if (slug === 'electric') return electricCount
    // Economy/family/7-seater/8-seater share dbValues with sedan/suv — show the parent count
    return countMap[dbValue] || 0
  }

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <Header />

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1">
                <IoHomeOutline className="w-4 h-4" />
                {tType('breadcrumbHome')}
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <Link href="/rentals" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                {tType('breadcrumbRentals')}
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                {t('breadcrumbAllTypes')}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <IoCarSportOutline className="w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                {t('heroTitle')}
              </h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mb-4">
              {t('heroSubtitle')}
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              <span className="text-purple-100 text-sm">{t('totalAvailable')}</span>
              <p className="text-2xl font-bold">{t('vehicleCount', { count: totalCars })}</p>
            </div>
          </div>
        </section>

        {/* Type Grid */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('chooseType')}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {VEHICLE_TYPES.map((vt) => {
                const displayName = tType(`${vt.tKey}DisplayName`)
                const count = getCount(vt.slug, vt.dbValue)

                return (
                  <Link
                    key={vt.slug}
                    href={`/rentals/types/${vt.slug}`}
                    className="group"
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200">
                      <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                        <img
                          src={vt.image}
                          alt={displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {count > 0 && (
                          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          {displayName}
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                          {PRICE_RANGES[vt.slug]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 hidden sm:block">
                          {tType(`${vt.tKey}Description`)}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('ctaTitle')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-5 max-w-xl mx-auto">
              {t('ctaSubtitle')}
            </p>
            <Link
              href="/rentals/search"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium shadow-sm"
            >
              {t('ctaButton')}
              <IoChevronForwardOutline className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
