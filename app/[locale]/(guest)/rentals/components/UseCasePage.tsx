'use client'

// app/[locale]/(guest)/rentals/components/UseCasePage.tsx
// Shared component for use case pages

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import { type UseCaseData } from '@/app/lib/data/use-cases'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import {
  IoCarOutline,
  IoLocationOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCashOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoCalendarOutline,
  IoTrendingUpOutline
} from 'react-icons/io5'
import { MERCHANT_RETURN_POLICY, SHIPPING_DETAILS } from '@/app/lib/seo/return-policy'

interface UseCasePageProps {
  useCaseData: UseCaseData
  cars: any[]
  totalCars: number
  minPrice: number
  maxPrice: number
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

export default function UseCasePage({
  useCaseData,
  cars,
  totalCars,
  minPrice,
  maxPrice
}: UseCasePageProps) {
  const t = useTranslations('UseCasePage')
  const tc = useTranslations('UseCases')
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Resolve translated strings from keys
  const title = tc(useCaseData.titleKey)
  const h1 = tc(useCaseData.h1Key)
  const heroSubtitle = tc(useCaseData.heroSubtitleKey)
  const content = tc(useCaseData.contentKey)
  const priceRange = tc(useCaseData.priceRangeKey)
  const durationSuggestion = tc(useCaseData.durationSuggestionKey)
  const benefits = useCaseData.benefitKeys.map(key => tc(key))
  const tips = useCaseData.tipKeys.map(key => tc(key))
  const faqs = useCaseData.faqKeys.map(faq => ({
    question: tc(faq.questionKey),
    answer: tc.raw(faq.answerKey)
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        '@id': `https://itwhip.com/rentals/${useCaseData.slug}#carlist`,
        name: title,
        description: useCaseData.metaDescription,
        numberOfItems: totalCars,
        itemListElement: cars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `${title} - ${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
            image: car.photos?.[0]?.url,
            offers: {
              '@type': 'Offer',
              price: car.dailyRate,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceValidUntil,
              shippingDetails: SHIPPING_DETAILS,
              hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY
            }
          }
        }))
      },
      {
        '@type': 'FAQPage',
        '@id': `https://itwhip.com/rentals/${useCaseData.slug}#faq`,
        mainEntity: faqs.map(faq => ({
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
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[420px] sm:h-[440px] lg:h-[460px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/hero/arizona-hero.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pt-20 pb-8 sm:pb-10 lg:pb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium mb-3">
                <IoCarOutline className="w-3.5 h-3.5" />
                {title}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                {h1}
              </h1>

              <p className="text-sm sm:text-base text-white/80 mb-4 max-w-xl">
                {heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <IoCarOutline className="w-4 h-4 text-amber-400" />
                  <span>{t('carsAvailable', { count: totalCars })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IoCashOutline className="w-4 h-4 text-emerald-400" />
                  <span>{priceRange}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IoCalendarOutline className="w-4 h-4 text-blue-400" />
                  <span>{durationSuggestion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IoShieldCheckmarkOutline className="w-4 h-4 text-purple-400" />
                  <span>{t('insurance1M')}</span>
                </div>
              </div>

              <div className="mt-5">
                <a
                  href="#available-cars"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <IoCarOutline className="w-4 h-4" />
                  {t('browseCars')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">{t('home')}</span>
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
                {title}
              </li>
            </ol>
          </nav>
        </div>

        {/* Benefits Section */}
        <section className="py-6 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoTrendingUpOutline className="w-5 h-5 text-amber-600" />
              {t('whyTitle', { title })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-3xl">
              {content}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Cars */}
        <section id="available-cars" className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {t('availableCars')}
              </h2>
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                {t('nAvailable', { count: totalCars })}
              </span>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {cars.map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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

            {cars.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t('viewAllCars')}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-6 bg-amber-50 dark:bg-amber-900/20 border-y border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4">
              {t('tipsFor', { title })}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-600" />
              {t('faqsTitle', { title })}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                    {faq.question}
                    <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <div
                    className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed [&_a]:text-amber-600 [&_a]:hover:text-amber-700 [&_a]:underline [&_a]:font-medium"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related Use Cases */}
        <section className="py-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('otherOptions')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { slug: 'long-term', labelKey: 'longTerm' as const },
                { slug: 'weekend', labelKey: 'weekend' as const },
                { slug: 'airport-delivery', labelKey: 'airportDelivery' as const },
                { slug: 'road-trip', labelKey: 'roadTrip' as const },
                { slug: 'business', labelKey: 'business' as const },
                { slug: 'snowbird', labelKey: 'snowbird' as const },
                { slug: 'spring-training', labelKey: 'springTraining' as const }
              ].filter(item => item.slug !== useCaseData.slug).map(item => (
                <Link
                  key={item.slug}
                  href={`/rentals/${item.slug}`}
                  className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm font-medium border border-gray-200 dark:border-gray-600"
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
