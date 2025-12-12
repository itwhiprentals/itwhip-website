// app/reviews/hosts/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoStar,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoPersonOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import HostCard from './HostCard'

// Rating Breakdown Component
function RatingBreakdown({
  distribution,
  total
}: {
  distribution: { rating: number; _count: { rating: number } }[]
  total: number
}) {
  const ratings = [5, 4, 3, 2, 1]

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Breakdown</h3>
      {ratings.map(star => {
        const count = distribution.find(d => d.rating === star)?._count?.rating || 0
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0

        return (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="w-6 text-gray-600 dark:text-gray-400 font-medium">{star}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                s <= star
                  ? <IoStar key={s} className="w-3.5 h-3.5 text-amber-500" />
                  : <IoStarOutline key={s} className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
              ))}
            </div>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-20 text-gray-500 dark:text-gray-400 text-right text-xs">
              {percentage}% ({count})
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const hostCount = await prisma.rentalHost.count({
    where: {
      active: true,
      rating: { gte: 4.5 },
      totalTrips: { gt: 0 },
      cars: { some: { isActive: true } }
    }
  })

  return {
    title: `Top-Rated Hosts (${hostCount}) | ItWhip Arizona`,
    description: 'Meet our top-rated hosts in Phoenix and Scottsdale. Verified car owners with excellent reviews, responsive communication, and well-maintained vehicles.',
    keywords: ['car sharing hosts phoenix', 'verified car owners', 'top rated hosts', 'trusted car rental hosts', 'best turo hosts phoenix'],
    openGraph: {
      title: `Top-Rated Hosts (${hostCount}) | ItWhip Arizona`,
      description: 'Meet our verified hosts with excellent reviews and well-maintained vehicles.',
      url: 'https://itwhip.com/reviews/hosts',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/reviews/hosts',
    },
  }
}

interface PageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function HostReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sortBy = params.sort || 'rating'

  // Build orderBy based on sort parameter
  const orderBy = sortBy === 'trips'
    ? [{ totalTrips: 'desc' as const }, { rating: 'desc' as const }]
    : sortBy === 'response'
    ? [{ responseRate: 'desc' as const }, { rating: 'desc' as const }]
    : sortBy === 'newest'
    ? [{ joinedAt: 'desc' as const }, { rating: 'desc' as const }]
    : [{ rating: 'desc' as const }, { totalTrips: 'desc' as const }]

  // Fetch top-rated hosts with their stats
  // Only include hosts who have at least one active car AND trips
  const hosts = await prisma.rentalHost.findMany({
    where: {
      active: true,
      rating: { gte: 4.5 },
      totalTrips: { gt: 0 },
      // Must have at least one active car to be featured
      cars: {
        some: { isActive: true }
      }
    },
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      bio: true,
      rating: true,
      totalTrips: true,
      responseRate: true,
      responseTime: true,
      isVerified: true,
      joinedAt: true,
      city: true,
      state: true,
      cars: {
        where: { isActive: true },
        select: { id: true },
        take: 1
      }
    },
    orderBy,
    take: 30
  })

  // Get overall stats and rating distribution
  const [stats, ratingDistribution, reviewCount] = await Promise.all([
    prisma.rentalHost.aggregate({
      where: { active: true, totalTrips: { gt: 0 } },
      _avg: { rating: true },
      _sum: { totalTrips: true },
      _count: true
    }),
    prisma.rentalReview.groupBy({
      by: ['rating'],
      where: {
        isVisible: true,
        host: { active: true }
      },
      _count: { rating: true },
      orderBy: { rating: 'desc' }
    }),
    prisma.rentalReview.count({
      where: {
        isVisible: true,
        host: { active: true }
      }
    })
  ])

  const avgRating = stats._avg.rating?.toFixed(1) || '4.9'
  const totalTrips = stats._sum.totalTrips || 0
  const totalHosts = stats._count || 0

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top-Rated ItWhip Hosts in Phoenix',
    description: 'Verified car owners with excellent reviews',
    numberOfItems: hosts.length,
    itemListElement: hosts.slice(0, 10).map((host, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: host.name,
        url: `https://itwhip.com/hosts/${host.id}`,
        description: `Verified car rental host in ${host.city || 'Phoenix'}, AZ with ${host.totalTrips} completed trips`,
        image: host.profilePhoto || 'https://itwhip.com/images/default-avatar.jpg',
        jobTitle: 'Car Rental Host',
        worksFor: {
          '@type': 'Organization',
          name: 'ItWhip',
          url: 'https://itwhip.com'
        },
        ...(host.rating && host.totalTrips > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: host.rating,
            reviewCount: host.totalTrips,
            bestRating: 5,
            worstRating: 1
          }
        } : {})
      }
    }))
  }

  return (
    <>
      <Script
        id="hosts-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        {/* Hero Section - Improved Typography */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            {/* Header Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-full px-4 py-2 mb-6">
                <IoPersonOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-400 text-sm font-medium">Verified Host Reviews</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Top-Rated Hosts in Phoenix
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Meet our verified hosts with excellent reviews, responsive communication, and well-maintained vehicles.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgRating}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Average Rating</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{reviewCount.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Host Reviews</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalHosts}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Verified Hosts</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalTrips.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Trips Completed</div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="max-w-xl mx-auto mb-8">
              <RatingBreakdown distribution={ratingDistribution} total={reviewCount} />
            </div>

            {/* Verification Notice */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Verified Hosts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    All hosts complete background checks and identity verification.
                    Reviews are from verified renters who completed trips.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/reviews" className="hover:text-amber-600">Reviews</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Hosts
              </li>
            </ol>
          </nav>
        </div>

        {/* Filter Tabs */}
        <section className="pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <Link
                href="/reviews"
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                All Reviews
              </Link>
              <Link
                href="/reviews/hosts"
                className="px-4 py-3 text-purple-600 border-b-2 border-purple-600 font-medium"
              >
                Host Reviews ({hosts.length})
              </Link>
              <Link
                href="/reviews/cars"
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Car Reviews
              </Link>
            </div>

            {/* Sort Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <div className="flex gap-1 flex-wrap">
                {[
                  { value: 'rating', label: 'Highest Rated' },
                  { value: 'trips', label: 'Most Trips' },
                  { value: 'response', label: 'Best Response' },
                  { value: 'newest', label: 'Newest' },
                ].map((option) => (
                  <Link
                    key={option.value}
                    href={option.value === 'rating' ? '/reviews/hosts' : `/reviews/hosts?sort=${option.value}`}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      sortBy === option.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
              {sortBy !== 'rating' && (
                <Link
                  href="/reviews/hosts"
                  className="ml-auto text-sm text-purple-600 hover:text-purple-700 dark:hover:text-purple-500"
                >
                  Clear
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Why Our Hosts Stand Out */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Why Our Hosts Stand Out
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: IoShieldCheckmarkOutline,
                  title: 'Verified Identity',
                  description: 'All hosts complete background checks and identity verification.'
                },
                {
                  icon: IoCheckmarkCircleOutline,
                  title: 'Quality Standards',
                  description: 'Vehicles meet strict cleanliness and maintenance requirements.'
                },
                {
                  icon: IoStar,
                  title: 'Excellent Reviews',
                  description: 'Our featured hosts maintain 4.5+ star ratings from guests.'
                },
                {
                  icon: IoCarOutline,
                  title: 'Well-Maintained Cars',
                  description: 'Regular inspections ensure vehicles are safe and reliable.'
                }
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hosts Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Hosts
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hosts.map((host) => (
                <HostCard key={host.id} host={host} />
              ))}
            </div>

            {hosts.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <IoPersonOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No hosts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back soon for featured hosts.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Become a Host CTA */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Want to Become a Host?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join our community of trusted hosts and start earning money with your vehicle.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/list-your-car"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
              >
                List Your Car
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Read All Reviews
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
