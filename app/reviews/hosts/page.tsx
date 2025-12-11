// app/reviews/hosts/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoStar,
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

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Top-Rated Hosts in Phoenix | Verified Car Owners | ItWhip',
  description: 'Meet our top-rated hosts in Phoenix and Scottsdale. Verified car owners with excellent reviews, responsive communication, and well-maintained vehicles.',
  keywords: ['car sharing hosts phoenix', 'verified car owners', 'top rated hosts', 'trusted car rental hosts', 'best turo hosts phoenix'],
  openGraph: {
    title: 'Top-Rated Hosts in Phoenix | ItWhip',
    description: 'Meet our verified hosts with excellent reviews and well-maintained vehicles.',
    url: 'https://itwhip.com/reviews/hosts',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itwhip.com/reviews/hosts',
  },
}

export default async function HostReviewsPage() {
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
    orderBy: [
      { rating: 'desc' },
      { totalTrips: 'desc' }
    ],
    take: 30
  })

  // Get overall stats
  const stats = await prisma.rentalHost.aggregate({
    where: { active: true, totalTrips: { gt: 0 } },
    _avg: { rating: true },
    _sum: { totalTrips: true },
    _count: true
  })

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
        image: host.profilePhoto,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: host.rating,
          reviewCount: host.totalTrips,
          bestRating: 5,
          worstRating: 1
        }
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

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero */}
        <section className="bg-gradient-to-br from-purple-800 via-indigo-700 to-purple-800 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/30 rounded-full text-purple-200 text-xs font-medium mb-4">
                <IoPersonOutline className="w-4 h-4" />
                Host Reviews
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Top-Rated Hosts in Phoenix
              </h1>
              <p className="text-xl text-purple-100 mb-6">
                Meet our verified hosts with excellent reviews, responsive communication, and well-maintained vehicles.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar key={star} className="w-5 h-5 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-lg">{avgRating}</span>
                  <span className="text-purple-200">average</span>
                </div>
                <div className="text-purple-200">
                  <span className="font-semibold text-white">{totalHosts}</span> verified hosts
                </div>
                <div className="text-purple-200">
                  <span className="font-semibold text-white">{totalTrips.toLocaleString()}</span> trips completed
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
