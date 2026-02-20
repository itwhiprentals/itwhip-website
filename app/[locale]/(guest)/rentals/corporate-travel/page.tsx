// app/(guest)/rentals/corporate-travel/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import { getTranslations } from 'next-intl/server'
import prisma from '@/app/lib/database/prisma'
import { HOST_CARD_SELECT } from '@/app/lib/database/host-select'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import {
  IoBusinessOutline,
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoStatsChartOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoReceiptOutline,
  IoFlashOutline,
  IoHelpCircleOutline,
  IoLeafOutline,
  IoRocketOutline,
  IoCashOutline,
  IoLocationOutline
} from 'react-icons/io5'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('rentalsCorporateTravelTitle'),
    description: t('rentalsCorporateTravelDescription'),
    keywords: ['corporate car rental phoenix', 'business travel rentals', 'company car rental', 'executive car rental', 'corporate fleet phoenix'],
    openGraph: {
      title: t('rentalsCorporateTravelTitle'),
      description: t('rentalsCorporateTravelDescription'),
      url: 'https://itwhip.com/rentals/corporate-travel',
      type: 'website'
    },
    alternates: {
      canonical: 'https://itwhip.com/rentals/corporate-travel',
    },
  }
}

function transformCarForCompactCard(car: any) {
  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    seats: car.seats || 5,
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
      hostType: car.host.hostType
    } : null
  }
}

export default async function CorporateTravelPage() {
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      carType: { in: ['LUXURY', 'SEDAN', 'SUV'] }
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
      host: { select: HOST_CARD_SELECT }
    },
    orderBy: [
      { rating: 'desc' },
      { totalTrips: 'desc' }
    ],
    take: 24
  })

  const totalCars = cars.length
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => Number(c.dailyRate))) : 65
  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => Number(c.dailyRate))) : 350

  const t = await getTranslations('RentalsCorporateTravel')

  const problems = [
    {
      icon: IoReceiptOutline,
      titleKey: 'problemInvoiceChaos' as const,
      descKey: 'problemInvoiceChaosDesc' as const,
      solutionKey: 'problemInvoiceChaosSolution' as const
    },
    {
      icon: IoTrendingUpOutline,
      titleKey: 'problemNoControlSurge' as const,
      descKey: 'problemNoControlSurgeDesc' as const,
      solutionKey: 'problemNoControlSurgeSolution' as const
    },
    {
      icon: IoLeafOutline,
      titleKey: 'problemEsgGap' as const,
      descKey: 'problemEsgGapDesc' as const,
      solutionKey: 'problemEsgGapSolution' as const
    },
    {
      icon: IoLocationOutline,
      titleKey: 'problemZeroVisibility' as const,
      descKey: 'problemZeroVisibilityDesc' as const,
      solutionKey: 'problemZeroVisibilitySolution' as const
    }
  ]

  const features = [
    {
      icon: IoWalletOutline,
      titleKey: 'featureVolumeDiscounts' as const,
      descKey: 'featureVolumeDiscountsDesc' as const
    },
    {
      icon: IoDocumentTextOutline,
      titleKey: 'featureCentralizedBilling' as const,
      descKey: 'featureCentralizedBillingDesc' as const
    },
    {
      icon: IoStatsChartOutline,
      titleKey: 'featureExpenseReports' as const,
      descKey: 'featureExpenseReportsDesc' as const
    },
    {
      icon: IoPeopleOutline,
      titleKey: 'featureAccountManager' as const,
      descKey: 'featureAccountManagerDesc' as const
    },
    {
      icon: IoShieldCheckmarkOutline,
      titleKey: 'featureInsurance1M' as const,
      descKey: 'featureInsurance1MDesc' as const
    },
    {
      icon: IoFlashOutline,
      titleKey: 'featureInstantBooking' as const,
      descKey: 'featureInstantBookingDesc' as const
    }
  ]

  const plans = [
    {
      nameKey: 'planStarter' as const,
      price: '$4,500',
      period: '/month',
      usersKey: 'planStarterUsers' as const,
      featureKeys: [
        'planStarterFeature1' as const,
        'planStarterFeature2' as const,
        'planStarterFeature3' as const,
        'planStarterFeature4' as const,
        'planStarterFeature5' as const
      ],
      savingsKey: 'planStarterSavings' as const,
      popular: false
    },
    {
      nameKey: 'planBusiness' as const,
      price: '$15,000',
      period: '/month',
      usersKey: 'planBusinessUsers' as const,
      featureKeys: [
        'planBusinessFeature1' as const,
        'planBusinessFeature2' as const,
        'planBusinessFeature3' as const,
        'planBusinessFeature4' as const,
        'planBusinessFeature5' as const,
        'planBusinessFeature6' as const
      ],
      savingsKey: 'planBusinessSavings' as const,
      popular: true
    },
    {
      nameKey: 'planEnterprise' as const,
      price: 'Custom',
      period: '',
      usersKey: 'planEnterpriseUsers' as const,
      featureKeys: [
        'planEnterpriseFeature1' as const,
        'planEnterpriseFeature2' as const,
        'planEnterpriseFeature3' as const,
        'planEnterpriseFeature4' as const,
        'planEnterpriseFeature5' as const
      ],
      savingsKey: 'planEnterpriseSavings' as const,
      popular: false
    }
  ]

  const faqs = [
    {
      questionKey: 'faqCorporateAccountsQuestion' as const,
      answerKey: 'faqCorporateAccountsAnswer' as const
    },
    {
      questionKey: 'faqDiscountsQuestion' as const,
      answerKey: 'faqDiscountsAnswer' as const
    },
    {
      questionKey: 'faqEmployeesBookQuestion' as const,
      answerKey: 'faqEmployeesBookAnswer' as const
    },
    {
      questionKey: 'faqEsgComplianceQuestion' as const,
      answerKey: 'faqEsgComplianceAnswer' as const
    },
    {
      questionKey: 'faqImplementationQuestion' as const,
      answerKey: 'faqImplementationAnswer' as const
    }
  ]

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Corporate Car Rentals Phoenix',
        description: 'Corporate travel program with volume discounts, centralized billing, and ESG compliance.',
        provider: {
          '@type': 'Organization',
          name: 'ItWhip'
        },
        areaServed: {
          '@type': 'City',
          name: 'Phoenix'
        },
        offers: {
          '@type': 'Offer',
          price: minPrice,
          priceCurrency: 'USD',
          priceValidUntil
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://itwhip.com/rentals/corporate-travel#faq',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: t(faq.questionKey),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(faq.answerKey)
          }
        }))
      }
    ]
  }

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-6 sm:pt-8 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-4">
                  <IoBusinessOutline className="w-4 h-4" />
                  {t('heroBadge')}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
                  <span className="text-amber-400">{t('heroCorporate')}</span> {t('heroCarRentalsIn')} <span className="text-amber-400">Phoenix</span>
                </h1>

                <p className="text-lg text-gray-300 mb-6">
                  {t('heroDescription')}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <IoCarOutline className="w-5 h-5 text-amber-400" />
                    <span><strong>{totalCars}</strong> {t('vehicles')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoCashOutline className="w-5 h-5 text-emerald-400" />
                    <span>${minPrice}-${maxPrice}/{t('day')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-400" />
                    <span>{t('insurance1M')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/corporate"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    <IoRocketOutline className="w-5 h-5" />
                    {t('fullCorporatePortal')}
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                  <a
                    href="#available-cars"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                  >
                    <IoCarOutline className="w-5 h-5" />
                    {t('browseVehicles')}
                  </a>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <IoStatsChartOutline className="w-5 h-5 text-amber-400" />
                  {t('whyCompaniesChoose')} <span className="text-amber-400">ItWhip</span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">35%</div>
                    <div className="text-xs text-gray-400">{t('avgCostSavings')}</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">100%</div>
                    <div className="text-xs text-gray-400">{t('bookingCompliance')}</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">$0</div>
                    <div className="text-xs text-gray-400">{t('surgePricing')}</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">1</div>
                    <div className="text-xs text-gray-400">{t('invoiceMonthly')}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link
                    href="/corporate"
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1"
                  >
                    {t('calculateRoi')}
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  {t('home')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/rentals" className="hover:text-amber-600">
                  {t('rentals')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {t('corporateTravel')}
              </li>
            </ol>
          </nav>
        </div>

        {/* Problems We Solve */}
        <section className="py-8 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoTrendingUpOutline className="w-6 h-6 text-amber-600" />
              {t('problemsWeSolve')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {problems.map((problem, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <problem.icon className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(problem.titleKey)}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t(problem.descKey)}</p>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <IoCheckmarkCircleOutline className="w-4 h-4" />
                    {t(problem.solutionKey)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm"
              >
                {t('seeCompleteSolution')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('corporateAccountFeatures')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <feature.icon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{t(feature.titleKey)}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t(feature.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Cars */}
        <section id="available-cars" className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('premiumVehicles')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('premiumVehiclesDesc')}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                {t('availableCount', { count: totalCars })}
              </span>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {cars.slice(0, 15).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('noCarsAvailable')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('checkBackSoon')}
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                >
                  {t('browseAllCars')}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}

            {cars.length > 15 && (
              <div className="mt-6 text-center">
                <Link
                  href="/rentals/search?type=LUXURY,SEDAN,SUV"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t('viewAllVehicles', { count: totalCars })}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Pricing Overview */}
        <section className="py-10 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('corporatePlans')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('flexiblePricing')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-6 border ${
                    plan.popular
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="text-center mb-3">
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                        {t('mostPopular')}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t(plan.nameKey)}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t(plan.usersKey)}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">{t(plan.savingsKey)}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.featureKeys.map((featureKey, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                {t('viewFullPricing')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-600" />
              {t('faqTitle')}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                    {t(faq.questionKey)}
                    <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(faq.answerKey)}
                  </div>
                </details>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                {t('viewAllFaqs')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg text-white/90 mb-6">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoBusinessOutline className="w-5 h-5" />
                {t('visitCorporatePortal')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg border-2 border-white hover:bg-amber-700 transition-colors"
              >
                {t('contactSales')}
              </Link>
            </div>
          </div>
        </section>

        {/* Related Options */}
        <section className="py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('otherRentalOptions')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { slug: 'long-term', labelKey: 'optionLongTerm' as const },
                { slug: 'airport-delivery', labelKey: 'optionAirportDelivery' as const },
                { slug: 'hotel-delivery', labelKey: 'optionHotelDelivery' as const },
                { slug: 'business', labelKey: 'optionBusiness' as const }
              ].map(item => (
                <Link
                  key={item.slug}
                  href={`/rentals/${item.slug}`}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm font-medium border border-gray-200 dark:border-gray-700"
                >
                  {t(item.labelKey)}
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
