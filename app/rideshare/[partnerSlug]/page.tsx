// app/rideshare/[partnerSlug]/page.tsx
// Partner Landing Page with SEO metadata

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoCarOutline,
  IoGridOutline,
  IoListOutline,
  IoFlashOutline,
  IoStarOutline,
  IoLocationOutline,
  IoFilterOutline
} from 'react-icons/io5'
import PartnerHero from '../components/PartnerHero'
import DiscountBanner from '../components/DiscountBanner'
import FAQAccordion from '../components/FAQAccordion'

interface PageProps {
  params: Promise<{ partnerSlug: string }>
}

async function getPartner(slug: string) {
  try {
    const partner = await prisma.rentalHost.findFirst({
      where: {
        partnerSlug: slug,
        hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
        approvalStatus: 'APPROVED',
        active: true
      },
      include: {
        cars: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            weeklyRate: true,
            monthlyRate: true,
            photos: true,
            city: true,
            state: true,
            instantBook: true,
            transmission: true,
            fuelType: true,
            seats: true,
            description: true,
            features: true,
            rating: true,
            totalTrips: true
          }
        },
        partnerDiscounts: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            percentage: true,
            expiresAt: true,
            maxUses: true,
            usedCount: true
          }
        },
        partnerFaqs: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            answer: true
          }
        }
      }
    })

    return partner
  } catch (error) {
    console.error('[Partner Landing] Error:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { partnerSlug } = await params
  const partner = await getPartner(partnerSlug)

  if (!partner) {
    return {
      title: 'Partner Not Found | ItWhip'
    }
  }

  const companyName = partner.partnerCompanyName || partner.displayName || 'Partner'
  const vehicleCount = partner.cars.length
  const prices = partner.cars.map((c: any) => c.dailyRate).filter((p: number) => p > 0)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0

  const description = partner.partnerBio ||
    `Rent rideshare-ready vehicles from ${companyName}. ${vehicleCount} vehicles available starting at $${minPrice}/day.`

  return {
    title: `${companyName} - Rideshare Rentals | ItWhip`,
    description,
    openGraph: {
      title: `${companyName} - Rideshare Rentals | ItWhip`,
      description,
      type: 'website',
      images: partner.partnerLogo ? [partner.partnerLogo] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} - Rideshare Rentals`,
      description
    }
  }
}

export default async function PartnerLandingPage({ params }: PageProps) {
  const { partnerSlug } = await params
  const partner = await getPartner(partnerSlug)

  if (!partner) {
    notFound()
  }

  const companyName = partner.partnerCompanyName || partner.displayName || 'Partner Fleet'

  // Calculate stats
  const operatingCities = [...new Set(partner.cars.map((c: any) => c.city ? `${c.city}, ${c.state}` : null).filter(Boolean))]
  const totalTrips = partner.cars.reduce((sum: number, c: any) => sum + (c.totalTrips || 0), 0)
  const totalReviews = partner.totalReviews || 0
  const avgRating = partner.averageRating ||
    (partner.cars.length > 0
      ? partner.cars.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / partner.cars.length
      : 0)
  const prices = partner.cars.map((c: any) => c.dailyRate).filter((p: number) => p > 0)
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0
  }

  const stats = {
    fleetSize: partner.cars.length,
    avgRating,
    totalTrips,
    totalReviews,
    operatingCities: operatingCities.length,
    priceRange
  }

  const discounts = partner.partnerDiscounts.map(d => ({
    id: d.id,
    code: d.code,
    title: d.title,
    description: d.description,
    percentage: d.percentage,
    expiresAt: d.expiresAt?.toISOString() || null,
    remaining: d.maxUses ? d.maxUses - d.usedCount : null
  }))

  const faqs = partner.partnerFaqs.map(f => ({
    id: f.id,
    question: f.question,
    answer: f.answer
  }))

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: companyName,
    description: partner.partnerBio,
    image: partner.partnerLogo,
    email: partner.partnerSupportEmail || partner.email,
    telephone: partner.partnerSupportPhone || partner.phone,
    address: partner.location ? {
      '@type': 'PostalAddress',
      addressLocality: partner.location
    } : undefined,
    aggregateRating: avgRating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: totalReviews
    } : undefined,
    priceRange: `$${priceRange.min} - $${priceRange.max}`
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
                Home
              </Link>
              <span>/</span>
              <Link href="/rideshare" className="hover:text-gray-700 dark:hover:text-gray-300">
                Rideshare
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{companyName}</span>
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Partner Hero */}
          <PartnerHero
            companyName={companyName}
            logo={partner.partnerLogo}
            bio={partner.partnerBio}
            location={partner.location}
            supportEmail={partner.partnerSupportEmail || partner.email}
            supportPhone={partner.partnerSupportPhone || partner.phone}
            stats={stats}
          />

          {/* Discount Banner */}
          {discounts.length > 0 && (
            <section className="mt-8">
              <DiscountBanner discounts={discounts} variant="hero" />
            </section>
          )}

          {/* Operating Cities */}
          {operatingCities.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoLocationOutline className="w-5 h-5 text-orange-500" />
                Operating Areas
              </h2>
              <div className="flex flex-wrap gap-2">
                {operatingCities.map((city, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Vehicles Grid */}
          <section className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Available Vehicles ({partner.cars.length})
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                  <IoGridOutline className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <IoListOutline className="w-5 h-5" />
                </button>
              </div>
            </div>

            {partner.cars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {partner.cars.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/cars/${vehicle.id}`}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-44 bg-gray-200 dark:bg-gray-700">
                      {vehicle.photos?.[0] ? (
                        <Image
                          src={vehicle.photos[0]}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoCarOutline className="w-16 h-16 text-gray-400" />
                        </div>
                      )}

                      {vehicle.instantBook && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          <IoFlashOutline className="w-3 h-3" />
                          Instant
                        </div>
                      )}

                      {vehicle.rating && vehicle.rating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-xs font-medium rounded-full">
                          <IoStarOutline className="w-3 h-3 text-yellow-500" />
                          {vehicle.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {vehicle.city && vehicle.state ? `${vehicle.city}, ${vehicle.state}` : ''}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{vehicle.transmission}</span>
                        <span>•</span>
                        <span>{vehicle.seats} seats</span>
                        {vehicle.totalTrips && vehicle.totalTrips > 0 && (
                          <>
                            <span>•</span>
                            <span>{vehicle.totalTrips} trips</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            ${vehicle.dailyRate}
                          </span>
                          <span className="text-sm text-gray-500">/day</span>
                        </div>
                        {vehicle.weeklyRate && (
                          <span className="text-sm text-gray-500">
                            ${vehicle.weeklyRate}/week
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No vehicles currently available
                </p>
              </div>
            )}
          </section>

          {/* FAQs */}
          {faqs.length > 0 && (
            <section className="mt-12">
              <FAQAccordion faqs={faqs} />
            </section>
          )}

          {/* Back to Marketplace */}
          <div className="mt-12 text-center">
            <Link
              href="/rideshare"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
            >
              ← Back to Rideshare Marketplace
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
