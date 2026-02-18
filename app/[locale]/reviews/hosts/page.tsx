// app/reviews/hosts/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/app/lib/database/prisma'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'
import {
  IoStar,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoPersonOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoOpenOutline
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import HostCard from './HostCard'

// Rating Breakdown Component - Compact
function RatingBreakdown({
  distribution,
  total,
  title
}: {
  distribution: { rating: number; _count: { rating: number } }[]
  total: number
  title: string
}) {
  const ratings = [5, 4, 3, 2, 1]

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      {ratings.map(star => {
        const count = distribution.find(d => d.rating === star)?._count?.rating || 0
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0

        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-gray-600 dark:text-gray-400 font-medium">{star}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                s <= star
                  ? <IoStar key={s} className="w-3 h-3 text-amber-500" />
                  : <IoStarOutline key={s} className="w-3 h-3 text-gray-300 dark:text-gray-600" />
              ))}
            </div>
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-16 text-gray-500 dark:text-gray-400 text-right text-[10px]">
              {percentage}% ({count})
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('SeoMeta')
  const hostCount = await prisma.rentalHost.count({
    where: {
      active: true,
      rating: { gte: 4.5 },
      totalTrips: { gt: 0 },
      cars: { some: { isActive: true } }
    }
  })

  return {
    title: t('reviewsHostsTitle', { count: hostCount }),
    description: t('reviewsHostsDescription'),
    keywords: ['car sharing hosts phoenix', 'verified car owners', 'top rated hosts', 'trusted car rental hosts', 'best turo hosts phoenix'],
    openGraph: {
      title: t('reviewsHostsOgTitle', { count: hostCount }),
      description: t('reviewsHostsOgDescription'),
      url: getCanonicalUrl('/reviews/hosts', locale),
      locale: getOgLocale(locale),
      type: 'website',
    },
    alternates: {
      canonical: getCanonicalUrl('/reviews/hosts', locale),
      languages: getAlternateLanguages('/reviews/hosts'),
    },
  }
}

interface PageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function HostReviewsPage({ searchParams }: PageProps) {
  const t = await getTranslations('HostReviews')
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

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        {/* Hero Section - Compact Typography */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-400 text-xs font-medium mb-3">
                <IoPersonOutline className="w-3.5 h-3.5" />
                {t('verifiedHostReviews')}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t('heroTitle', { count: totalHosts })}
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                {t('heroDescription')}
              </p>
            </div>

            {/* Stats Row - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{avgRating}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('averageRating')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{reviewCount.toLocaleString()}+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('hostReviewsStat')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalHosts}+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('verifiedHosts')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalTrips.toLocaleString()}+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('tripsCompleted')}</div>
              </div>
            </div>

            {/* Rating Breakdown - Compact */}
            <div className="max-w-md mx-auto mb-6">
              <RatingBreakdown distribution={ratingDistribution} total={reviewCount} title={t('ratingBreakdown')} />
            </div>

            {/* Google Reviews Badge */}
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('googleSeeWhat')}</p>
              <a
                href="https://www.google.com/search?q=ItWhip+Phoenix+AZ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 rounded-lg px-4 py-2.5 transition-all hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900 dark:text-white font-semibold text-sm">5.0</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <IoStar key={i} className="w-3.5 h-3.5 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400">{t('googleReviewCount')}</span>
                </div>
                <IoOpenOutline className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              </a>
            </div>

            {/* Verification Notice - Compact */}
            <div className="max-w-lg mx-auto">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-start gap-2">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{t('verifiedNoticeTitle')}</p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                    {t('verifiedNoticeDesc')}
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
                  {t('breadcrumbHome')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/reviews" className="hover:text-amber-600">{t('breadcrumbReviews')}</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {t('breadcrumbHosts')}
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
                {t('tabAllReviews')}
              </Link>
              <Link
                href="/reviews/hosts"
                className="px-4 py-3 text-purple-600 border-b-2 border-purple-600 font-medium"
              >
                {t('tabHostReviews', { count: hosts.length })}
              </Link>
              <Link
                href="/reviews/cars"
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t('tabCarReviews')}
              </Link>
            </div>

            {/* Sort Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('sortBy')}</span>
              <div className="flex gap-1 flex-wrap">
                {[
                  { value: 'rating', label: t('sortHighestRated') },
                  { value: 'trips', label: t('sortMostTrips') },
                  { value: 'response', label: t('sortBestResponse') },
                  { value: 'newest', label: t('sortNewest') },
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
                  {t('clear')}
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Why Our Hosts Stand Out */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('whyHostsTitle')}
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: IoShieldCheckmarkOutline,
                  title: t('feature1Title'),
                  description: t('feature1Desc')
                },
                {
                  icon: IoCheckmarkCircleOutline,
                  title: t('feature2Title'),
                  description: t('feature2Desc')
                },
                {
                  icon: IoStar,
                  title: t('feature3Title'),
                  description: t('feature3Desc')
                },
                {
                  icon: IoCarOutline,
                  title: t('feature4Title'),
                  description: t('feature4Desc')
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
              {t('featuredHosts')}
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
                  {t('noHostsFound')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('noHostsDesc')}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Become a Host CTA */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('ctaDescription')}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/list-your-car"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
              >
                {t('listYourCar')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {t('readAllReviews')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
