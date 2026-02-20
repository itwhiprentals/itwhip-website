// app/(guest)/rentals/budget/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import Script from 'next/script'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { HOST_CARD_SELECT } from '@/app/lib/database/host-select'
import { CITY_SEO_DATA } from '@/app/lib/data/city-seo-data'
import {
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline
} from 'react-icons/io5'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'

// Add ISR - Revalidate every 60 seconds
export const revalidate = 60

// Budget threshold
const MAX_DAILY_RATE = 100

// Number of FAQ entries in translation files (faq0 through faq7)
const FAQ_COUNT = 8

// Shared link class for FAQ rich text
const faqLinkClass = 'text-emerald-600 hover:underline font-medium'

// Rich text tag handlers for FAQ answers (used with t.rich())
const faqRichTextTags = {
  howItWorksLink: (chunks: React.ReactNode) => <Link href="/how-it-works" className={faqLinkClass}>{chunks}</Link>,
  insuranceLink: (chunks: React.ReactNode) => <Link href="/insurance-guide" className={faqLinkClass}>{chunks}</Link>,
  rideshareLink: (chunks: React.ReactNode) => <Link href="/rideshare" className={faqLinkClass}>{chunks}</Link>,
  rentalsLink: (chunks: React.ReactNode) => <Link href="/rentals" className={faqLinkClass}>{chunks}</Link>,
  weeklyLink: (chunks: React.ReactNode) => <Link href="/rentals/weekly" className={faqLinkClass}>{chunks}</Link>,
  protectionLink: (chunks: React.ReactNode) => <Link href="/host-protection" className={faqLinkClass}>{chunks}</Link>,
}

// Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('rentalsBudgetTitle'),
    description: t('rentalsBudgetDescription'),
    openGraph: {
      title: t('rentalsBudgetOgTitle'),
      description: t('rentalsBudgetOgDescription'),
      url: 'https://itwhip.com/rentals/budget',
      type: 'website',
      images: [{ url: 'https://itwhip.com/og/budget-rentals.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('rentalsBudgetTwitterTitle'),
      description: t('rentalsBudgetTwitterDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/rentals/budget',
    },
  }
}

// Hero Section
async function HeroSection({ carCount, minPrice }: { carCount: number; minPrice: number }) {
  const t = await getTranslations('RentalsBudget')
  return (
    <section className="relative h-[280px] sm:h-[320px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/og/budget-rentals.png"
        alt={t('heroImageAlt')}
        fill
        className="object-cover object-center"
        priority
      />
      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            {t('heroTitle')}
          </h1>
          <p className="text-white/90 text-sm sm:text-base mb-3">
            {t('heroSubtitle', { minPrice, carCount })}
          </p>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-white/80">
            <span className="flex items-center gap-1">
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              {t('insurance1M')}
            </span>
            <span className="flex items-center gap-1">
              <IoCarOutline className="w-4 h-4" />
              {t('uberLyftReady')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Breadcrumbs
async function Breadcrumbs() {
  const t = await getTranslations('RentalsBudget')
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
            <IoHomeOutline className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('home')}</span>
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="flex items-center gap-1.5">
          <Link href="/rentals" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            {t('rentals')}
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="text-gray-800 dark:text-gray-200 font-medium">
          {t('budgetRentals')}
        </li>
      </ol>
    </nav>
  )
}

// FAQ Section
async function FAQSection({ carCount, minPrice }: { carCount: number; minPrice: number }) {
  const t = await getTranslations('RentalsBudget')
  const faqIndices = Array.from({ length: FAQ_COUNT }, (_, i) => i)

  return (
    <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoHelpCircleOutline className="w-6 h-6 text-emerald-600" />
            {t('faqTitle')}
          </h2>
          <div className="space-y-3">
            {faqIndices.map((i) => (
              <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                  {t(`faq${i}Question`)}
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.rich(`faq${i}Answer`, { carCount, minPrice, ...faqRichTextTags })}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Related Cities Section
async function RelatedCities() {
  const t = await getTranslations('RentalsBudget')
  const citySlugs = Object.keys(CITY_SEO_DATA).slice(0, 8)

  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {t('budgetRentalsByCity')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t('findAffordableCars')}
        </p>
        <div className="flex flex-wrap gap-2">
          {citySlugs.map((slug) => {
            const cityData = CITY_SEO_DATA[slug]
            return (
              <Link
                key={slug}
                href={`/rentals/cities/${slug}`}
                className="group px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-sm"
              >
                {cityData?.name || slug}
                <span className="ml-1 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
          <Link
            href="/rentals/cities"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t('viewAllCities')}
            <IoChevronForwardOutline className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/rentals/types"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t('browseByCarType')}
            <IoChevronForwardOutline className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Main Page Component
export default async function BudgetRentalsPage() {
  const t = await getTranslations('RentalsBudget')
  // Fetch budget cars (under $100/day)
  const budgetCars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      dailyRate: { lte: MAX_DAILY_RATE }
    },
    orderBy: { dailyRate: 'asc' },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      seats: true,
      dailyRate: true,
      city: true,
      fuelType: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      vehicleType: true,
      reviews: {
        select: { rating: true }
      },
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: { select: HOST_CARD_SELECT }
    }
  })

  // Transform cars to calculate rating from reviews with fallback to static rating
  const transformedCars = budgetCars.map((car: typeof budgetCars[number]) => {
    const reviewCount = car.reviews?.length || 0
    let finalRating: number | null = null
    if (reviewCount > 0) {
      const sum = car.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0)
      finalRating = sum / reviewCount
    } else if (car.rating) {
      finalRating = Number(car.rating)
    }
    return {
      ...car,
      dailyRate: Number(car.dailyRate),
      rating: finalRating
    }
  })

  const carCount = transformedCars.length
  const minPrice = carCount > 0 ? Math.min(...transformedCars.map(c => c.dailyRate)) : 29

  // Calculate priceValidUntil (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://itwhip.com/rentals/budget#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
          { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://itwhip.com/rentals' },
          { '@type': 'ListItem', position: 3, name: 'Budget Rentals', item: 'https://itwhip.com/rentals/budget' }
        ]
      },
      // ItemList (Car Listings)
      {
        '@type': 'ItemList',
        '@id': 'https://itwhip.com/rentals/budget#carlist',
        name: 'Budget Car Rentals in Arizona',
        description: `${carCount} affordable car rentals under $${MAX_DAILY_RATE}/day`,
        numberOfItems: carCount,
        itemListElement: transformedCars.slice(0, 20).map((car: typeof transformedCars[number], index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Budget ${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)} rental in ${car.city || 'Arizona'} - $${car.dailyRate}/day`,
            image: car.photos?.[0]?.url,
            brand: {
              '@type': 'Brand',
              name: car.make
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
      },
      // FAQPage — pass tag handlers as identity functions to get plain text for JSON-LD
      {
        '@type': 'FAQPage',
        '@id': 'https://itwhip.com/rentals/budget#faq',
        mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => ({
          '@type': 'Question',
          name: t(`faq${i}Question`),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(`faq${i}Answer`, {
              carCount,
              minPrice,
              howItWorksLink: (chunks: string) => chunks,
              insuranceLink: (chunks: string) => chunks,
              rideshareLink: (chunks: string) => chunks,
              rentalsLink: (chunks: string) => chunks,
              weeklyLink: (chunks: string) => chunks,
              protectionLink: (chunks: string) => chunks,
            })
          }
        }))
      }
    ]
  }

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
        <HeroSection carCount={carCount} minPrice={minPrice} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {t('budgetCarsUnder', { maxRate: MAX_DAILY_RATE })}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('affordableRentalsSorted', { count: carCount })}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-emerald-500" />
              {t('allIncludeInsurance')}
            </div>
          </div>

          {/* Car Grid */}
          {carCount > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {transformedCars.map((car: typeof transformedCars[number]) => (
                <CompactCarCard key={car.id} car={car} accentColor="emerald" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <IoCarOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('noBudgetCars')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('checkBackSoon')}
              </p>
              <Link
                href="/rentals"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                {t('browseAllCars')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Savings Callout */}
          {carCount > 0 && (
            <div className="mt-8 p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    {t('saveUpTo35')}
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    {t('rentDirectly')}
                  </p>
                </div>
                <Link
                  href="/how-it-works"
                  className="flex-shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  {t('learnHowItWorks')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <FAQSection carCount={carCount} minPrice={minPrice} />

        {/* Related Cities */}
        <RelatedCities />

        <Footer />
      </div>
    </>
  )
}
