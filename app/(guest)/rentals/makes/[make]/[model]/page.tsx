// app/(guest)/rentals/makes/[make]/[model]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import prisma from '@/app/lib/database/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import {
  getCarModelBySlug,
  getAllCarModelSlugs,
  getModelsByMake
} from '@/app/lib/data/car-models'
import {
  IoCarSportOutline,
  IoSpeedometerOutline,
  IoFlashOutline,
  IoPeopleOutline,
  IoLeafOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoStarOutline,
  IoSettingsOutline
} from 'react-icons/io5'

export const revalidate = 60

interface PageProps {
  params: Promise<{ make: string; model: string }>
}

export async function generateStaticParams() {
  return getAllCarModelSlugs()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { make, model } = await params
  const carData = getCarModelBySlug(make, model)

  if (!carData) {
    return { title: 'Model Not Found | ItWhip' }
  }

  return {
    title: carData.metaTitle,
    description: carData.metaDescription,
    keywords: [
      `rent ${carData.displayName}`,
      `${carData.displayName} rental Phoenix`,
      `${carData.make} rental Arizona`,
      `${carData.displayName} for rent`,
      `hire ${carData.displayName}`
    ],
    openGraph: {
      title: carData.metaTitle,
      description: carData.metaDescription,
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
  const carData = getCarModelBySlug(make, model)

  if (!carData) {
    notFound()
  }

  // Fetch matching cars from database
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      make: { contains: carData.make, mode: 'insensitive' }
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
      rating: true,
      totalTrips: true,
      instantBook: true,
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
    take: 12
  })

  const totalCars = cars.length
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => Number(c.dailyRate))) : carData.priceRange.min
  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => Number(c.dailyRate))) : carData.priceRange.max

  // Get related models from same make
  const relatedModels = getModelsByMake(make).filter(m => m.modelSlug !== model).slice(0, 4)

  // JSON-LD for Product and FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: `${carData.displayName} Rental`,
        description: carData.metaDescription,
        brand: {
          '@type': 'Brand',
          name: carData.make
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: minPrice,
          highPrice: maxPrice,
          offerCount: totalCars,
          availability: totalCars > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        },
        aggregateRating: totalCars > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: totalCars * 5
        } : undefined
      },
      {
        '@type': 'FAQPage',
        mainEntity: carData.faqs.map(faq => ({
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
      <Script
        id="car-model-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                  <IoCarSportOutline className="w-5 h-5" />
                  {carData.make} • {carData.carType}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  <span className="text-amber-400">{carData.h1}</span>
                </h1>
                <p className="text-lg text-gray-300 mb-6">
                  {carData.heroSubtitle}
                </p>

                {/* Price Badge */}
                <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2 mb-6">
                  <span className="text-gray-400 text-sm">From</span>
                  <span className="text-3xl font-bold text-amber-400">${minPrice}</span>
                  <span className="text-gray-400">/day</span>
                </div>

                {/* Key Specs Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <IoSpeedometerOutline className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                    <div className="text-sm font-semibold">{carData.specs.horsepower}</div>
                    <div className="text-xs text-gray-400">Power</div>
                  </div>
                  <div className="text-center">
                    <IoFlashOutline className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                    <div className="text-sm font-semibold">{carData.specs.acceleration}</div>
                    <div className="text-xs text-gray-400">0-60 mph</div>
                  </div>
                  <div className="text-center">
                    <IoPeopleOutline className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                    <div className="text-sm font-semibold">{carData.specs.seats}</div>
                    <div className="text-xs text-gray-400">Seats</div>
                  </div>
                </div>

                <Link
                  href="/rentals"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Browse Available {carData.make}s
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>

              {/* Full Specs Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <IoSettingsOutline className="w-5 h-5 text-amber-400" />
                  Specifications
                </h2>
                <dl className="space-y-3">
                  {carData.specs.engine && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Engine</dt>
                      <dd className="font-medium">{carData.specs.engine}</dd>
                    </div>
                  )}
                  {carData.specs.range && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Range</dt>
                      <dd className="font-medium">{carData.specs.range}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Horsepower</dt>
                    <dd className="font-medium">{carData.specs.horsepower}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Acceleration</dt>
                    <dd className="font-medium">{carData.specs.acceleration}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Seating</dt>
                    <dd className="font-medium">{carData.specs.seats} passengers</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Drivetrain</dt>
                    <dd className="font-medium">{carData.specs.drivetrain}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Fuel</dt>
                    <dd className="font-medium flex items-center gap-1">
                      {carData.specs.fuelType === 'Electric' && <IoLeafOutline className="w-4 h-4 text-green-400" />}
                      {carData.specs.fuelType}
                    </dd>
                  </div>
                </dl>
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
                <span className="text-gray-600">{carData.make}</span>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {carData.model}
              </li>
            </ol>
          </nav>
        </div>

        {/* Why Rent Section */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Why Rent */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Why Rent a {carData.displayName}?
                </h2>
                <ul className="space-y-3">
                  {carData.whyRent.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Perfect For */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Perfect For
                </h2>
                <ul className="space-y-3">
                  {carData.perfectFor.map((use, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <IoStarOutline className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content */}
            <div className="mt-8 prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {carData.content}
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Key Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {carData.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Cars */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Available {carData.make} Rentals
                </h2>
                <p className="text-sm text-gray-500">
                  {totalCars} {carData.make} vehicles available in Phoenix
                </p>
              </div>
              <Link
                href={`/rentals?make=${encodeURIComponent(carData.make)}`}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View all
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cars.map((car) => (
                  <CompactCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <IoCarSportOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  No {carData.displayName} vehicles currently available
                </p>
                <Link
                  href="/rentals"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                >
                  Browse All Cars
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-500" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {carData.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
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
        </section>

        {/* Related Models */}
        {relatedModels.length > 0 && (
          <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Other {carData.make} Models
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedModels.map((relatedModel) => (
                  <Link
                    key={relatedModel.modelSlug}
                    href={`/rentals/makes/${relatedModel.makeSlug}/${relatedModel.modelSlug}`}
                    className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 mb-1">
                      {relatedModel.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{relatedModel.carType}</p>
                    <p className="text-sm text-amber-600 font-medium">
                      From ${relatedModel.priceRange.min}/day
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-10 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-3">
              Ready to Drive a {carData.displayName}?
            </h2>
            <p className="text-white/90 mb-6">
              Book directly from local owners in Phoenix. Better cars, better prices, better experience.
            </p>
            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Find Your {carData.make}
              <IoChevronForwardOutline className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
