// app/(guest)/rentals/budget/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { CITY_SEO_DATA } from '@/app/lib/data/city-seo-data'
import {
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoCarOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

// Add ISR - Revalidate every 60 seconds
export const revalidate = 60

// Budget threshold
const MAX_DAILY_RATE = 100

// Budget-specific FAQs
const BUDGET_FAQS = (carCount: number, minPrice: number) => [
  {
    question: 'How can I find cheap car rentals in Phoenix?',
    answer: `ItWhip offers ${carCount}+ budget-friendly cars starting at just $${minPrice}/day. Our peer-to-peer model means you rent directly from local owners, saving up to 35% compared to traditional rental companies. All rentals include $1M liability coverage with no hidden fees.`
  },
  {
    question: 'What\'s the cheapest car rental in Arizona?',
    answer: `Budget car rentals on ItWhip start from $${minPrice}/day. We have ${carCount} vehicles available under $${MAX_DAILY_RATE}/day, including economy sedans, compact cars, and reliable SUVs. Prices are transparent with no surprise charges at pickup.`
  },
  {
    question: 'Are budget car rentals on ItWhip safe?',
    answer: 'Absolutely! Every rental includes $1M liability insurance. All hosts and vehicles are verified, and we maintain strict safety standards. You get the same protection as premium rentals at a fraction of the cost.'
  },
  {
    question: 'Can I get airport delivery with a budget car rental?',
    answer: 'Yes! Many budget-friendly hosts offer free delivery to Phoenix Sky Harbor (PHX), Mesa Gateway (AZA), and other locations. Look for the delivery icon when browsing vehicles to find hosts who offer this service.'
  },
  {
    question: 'What do I need to rent a budget car in Arizona?',
    answer: 'To rent any car on ItWhip, you need: a valid driver\'s license, to be 21+ years old, a clean driving record, and a valid payment method. Verification takes just minutes, and many cars offer instant booking.'
  },
  {
    question: 'Why are ItWhip rentals cheaper than Hertz or Enterprise?',
    answer: 'ItWhip is a peer-to-peer platform where you rent directly from local car owners. Without expensive rental lots and corporate overhead, owners can offer competitive rates while still earning more than selling to traditional companies. Everyone wins!'
  }
]

// Metadata
export const metadata: Metadata = {
  title: 'Budget Car Rentals in Arizona - Under $100/day | ItWhip',
  description: 'Find cheap car rentals in Phoenix & Arizona starting at $29/day. Budget-friendly cars from local owners with $1M insurance included. No hidden fees. Book instantly!',
  keywords: [
    'cheap car rental phoenix',
    'budget car rental arizona',
    'affordable car rental phoenix',
    'cheap car rental near me',
    'budget rental cars phoenix az',
    'low cost car rental arizona',
    'discount car rental phoenix',
    'economy car rental arizona',
    'phoenix car rental under $100',
    'cheap rental cars scottsdale',
    'budget friendly car rental mesa',
    'inexpensive car rental tempe'
  ],
  openGraph: {
    title: 'Budget Car Rentals - Under $100/day | ItWhip Arizona',
    description: 'Affordable car rentals from local owners. $1M insurance included. No hidden fees.',
    url: 'https://itwhip.com/rentals/budget',
    images: [{ url: 'https://itwhip.com/og/budget-rentals.png', width: 1200, height: 630 }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budget Car Rentals Under $100/day',
    description: 'Affordable Arizona car rentals with $1M insurance included.'
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/budget'
  }
}

// Hero Section
function HeroSection({ carCount, minPrice }: { carCount: number; minPrice: number }) {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
            <IoWalletOutline className="w-4 h-4" />
            Under ${MAX_DAILY_RATE}/day
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Budget Car Rentals in Arizona
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Affordable cars from local owners. $1M insurance included. No hidden fees.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white mb-8">
            <div className="flex items-center gap-2">
              <IoCashOutline className="w-5 h-5" />
              <span>From <strong>${minPrice}</strong>/day</span>
            </div>
            <div className="flex items-center gap-2">
              <IoCarOutline className="w-5 h-5" />
              <span><strong>{carCount}</strong> cars available</span>
            </div>
            <div className="flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-5 h-5" />
              <span><strong>$1M</strong> insurance</span>
            </div>
          </div>

          {/* Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-white/90 text-sm">
            <span className="flex items-center gap-1">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              No hidden fees
            </span>
            <span className="flex items-center gap-1">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              Free cancellation
            </span>
            <span className="flex items-center gap-1">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              Airport delivery
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Breadcrumbs
function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
            <IoHomeOutline className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="flex items-center gap-1.5">
          <Link href="/rentals" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            Rentals
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="text-gray-800 dark:text-gray-200 font-medium">
          Budget Rentals
        </li>
      </ol>
    </nav>
  )
}

// FAQ Section
function FAQSection({ carCount, minPrice }: { carCount: number; minPrice: number }) {
  const faqs = BUDGET_FAQS(carCount, minPrice)

  return (
    <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoHelpCircleOutline className="w-6 h-6 text-emerald-600" />
            Budget Car Rental FAQs
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                  {faq.question}
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
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
function RelatedCities() {
  const citySlugs = Object.keys(CITY_SEO_DATA).slice(0, 8)

  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Budget Rentals by City
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Find affordable cars across the Phoenix metro area
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
            View all cities
            <IoChevronForwardOutline className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/rentals/types"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Browse by car type
            <IoChevronForwardOutline className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Main Page Component
export default async function BudgetRentalsPage() {
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
      reviews: {
        select: { rating: true }
      },
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true }
      }
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
            name: `${car.year} ${car.make} ${car.model}`,
            description: `Budget ${car.year} ${car.make} ${car.model} rental in ${car.city || 'Arizona'} - $${car.dailyRate}/day`,
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
            aggregateRating: car.rating ? {
              '@type': 'AggregateRating',
              ratingValue: car.rating,
              reviewCount: car.totalTrips || 1
            } : undefined
          }
        }))
      },
      // FAQPage
      {
        '@type': 'FAQPage',
        '@id': 'https://itwhip.com/rentals/budget#faq',
        mainEntity: BUDGET_FAQS(carCount, minPrice).map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
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
                Budget Cars Under ${MAX_DAILY_RATE}/day
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {carCount} affordable rentals sorted by lowest price
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-emerald-500" />
              All include $1M insurance
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
                No budget cars available right now
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Check back soon or browse all our available cars.
              </p>
              <Link
                href="/rentals"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Browse All Cars
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Savings Callout */}
          {carCount > 0 && (
            <div className="mt-8 p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    Save up to 35% vs Traditional Rentals
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Rent directly from local owners and skip the rental counter fees. Same great cars, better prices.
                  </p>
                </div>
                <Link
                  href="/how-it-works"
                  className="flex-shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  Learn How It Works
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
