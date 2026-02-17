'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCarOutline,
  IoBusinessOutline,
  IoLayersOutline,
  IoDocumentTextOutline,
  IoSpeedometerOutline,
  IoInformationCircleOutline,
  IoHelpCircleOutline,
  IoWalletOutline,
  IoPeopleOutline
} from 'react-icons/io5'


export default function InsuranceOptionsPage() {
  const t = useTranslations('HostInsuranceOptions')

  const HOST_TIERS = [
    {
      tier: t('tier1Label'),
      earnings: '40%',
      platformFee: '60%',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      title: t('tier1Title'),
      subtitle: t('tier1Subtitle'),
      description: t('tier1Description'),
      primaryInsurance: t('tier1PrimaryInsurance'),
      deductibles: {
        collision: '$2,500',
        comprehensive: '$1,000'
      },
      features: [
        t('tier1Feature1'),
        t('tier1Feature2'),
        t('tier1Feature3'),
        t('tier1Feature4'),
        t('tier1Feature5')
      ],
      bestFor: t('tier1BestFor')
    },
    {
      tier: t('tier2Label'),
      earnings: '75%',
      platformFee: '25%',
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      title: t('tier2Title'),
      subtitle: t('tier2Subtitle'),
      description: t('tier2Description'),
      primaryInsurance: t('tier2PrimaryInsurance'),
      deductibles: {
        collision: t('tier2DeductibleCollision'),
        comprehensive: t('tier2DeductibleComprehensive')
      },
      features: [
        t('tier2Feature1'),
        t('tier2Feature2'),
        t('tier2Feature3'),
        t('tier2Feature4'),
        t('tier2Feature5')
      ],
      bestFor: t('tier2BestFor'),
      popular: true
    },
    {
      tier: t('tier3Label'),
      earnings: '90%',
      platformFee: '10%',
      color: 'from-emerald-500 to-green-500',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      title: t('tier3Title'),
      subtitle: t('tier3Subtitle'),
      description: t('tier3Description'),
      primaryInsurance: t('tier3PrimaryInsurance'),
      deductibles: {
        collision: t('tier3DeductibleCollision'),
        comprehensive: t('tier3DeductibleComprehensive')
      },
      features: [
        t('tier3Feature1'),
        t('tier3Feature2'),
        t('tier3Feature3'),
        t('tier3Feature4'),
        t('tier3Feature5')
      ],
      bestFor: t('tier3BestFor')
    }
  ]

  const DECLARATIONS = [
    {
      type: t('declarationRentalType'),
      description: t('declarationRentalDesc'),
      mileage: t('declarationRentalMileage'),
      icon: IoCarOutline
    },
    {
      type: t('declarationMixedType'),
      description: t('declarationMixedDesc'),
      mileage: t('declarationMixedMileage'),
      icon: IoPeopleOutline
    },
    {
      type: t('declarationCommercialType'),
      description: t('declarationCommercialDesc'),
      mileage: t('declarationCommercialMileage'),
      icon: IoBusinessOutline
    }
  ]

  const FAQS = [
    {
      question: t('faq1Question'),
      answer: t('faq1Answer')
    },
    {
      question: t('faq2Question'),
      answer: t('faq2Answer')
    },
    {
      question: t('faq3Question'),
      answer: t('faq3Answer')
    },
    {
      question: t('faq4Question'),
      answer: t('faq4Answer')
    },
    {
      question: t('faq5Question'),
      answer: t('faq5Answer')
    },
    {
      question: t('faq6Question'),
      answer: t('faq6Answer')
    }
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <>
      <Script
        id="insurance-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 rounded-full text-emerald-200 text-xs font-medium mb-4">
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                {t('heroBadge')}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-emerald-100 mb-6">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  {t('heroTagPerTrip')}
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  {t('heroTagCoverageTypes')}
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
                <Link href="/list-your-car" className="hover:text-amber-600">{t('breadcrumbHost')}</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {t('breadcrumbInsuranceOptions')}
              </li>
            </ol>
          </nav>
        </div>

        {/* Quick Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{t('relatedLabel')}</span>
            <Link
              href="/insurance-guide"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
            >
              <IoDocumentTextOutline className="w-4 h-4" />
              {t('relatedFullGuide')}
            </Link>
            <Link
              href="/support/insurance"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
            >
              <IoHelpCircleOutline className="w-4 h-4" />
              {t('relatedInsuranceSupport')}
            </Link>
            <Link
              href="/host-protection"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
            >
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              {t('relatedHostProtection')}
            </Link>
            <Link
              href="/host/payouts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
            >
              <IoWalletOutline className="w-4 h-4" />
              {t('relatedPayoutsEarnings')}
            </Link>
          </div>
        </div>

        {/* The Three Tiers */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('tiersHeading')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('tiersSubheading')}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {HOST_TIERS.map((tier, i) => (
                <div
                  key={i}
                  className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 ${tier.borderColor} overflow-hidden shadow-sm hover:shadow-lg transition-shadow`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {t('popularBadge')}
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className={`bg-gradient-to-r ${tier.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">{tier.tier}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {tier.platformFee} {t('platformFeeLabel')}
                      </span>
                    </div>
                    <div className="text-5xl font-bold mb-1">{tier.earnings}</div>
                    <div className="text-sm opacity-90">{t('hostEarningsLabel')}</div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      {tier.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {tier.subtitle}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {tier.description}
                    </p>

                    <div className={`${tier.bgColor} rounded-lg p-3 mb-4`}>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('primaryInsuranceLabel')}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {tier.primaryInsurance}
                      </div>
                    </div>

                    {/* Deductibles */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                        <div className="text-xs text-gray-500">{t('collisionLabel')}</div>
                        <div className="font-medium text-gray-900 dark:text-white">{tier.deductibles.collision}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                        <div className="text-xs text-gray-500">{t('comprehensiveLabel')}</div>
                        <div className="font-medium text-gray-900 dark:text-white">{tier.deductibles.comprehensive}</div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {tier.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('bestForLabel')}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tier.bestFor}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Hierarchy */}
        <section className="py-10 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoLayersOutline className="w-6 h-6 text-emerald-500" />
              {t('hierarchyHeading')}
            </h2>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Pyramid Visual */}
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {t('hierarchyIntro')}
                </p>
                <div className="space-y-2">
                  {/* Primary */}
                  <div className="bg-emerald-500 text-white rounded-lg p-4 text-center">
                    <div className="text-xs font-medium opacity-80 mb-1">{t('hierarchyPrimaryLabel')}</div>
                    <div className="font-bold">{t('hierarchyPrimaryTitle')}</div>
                    <div className="text-sm opacity-90">{t('hierarchyPrimarySubtitle')}</div>
                  </div>

                  {/* Secondary */}
                  <div className="bg-amber-500 text-white rounded-lg p-4 text-center mx-6">
                    <div className="text-xs font-medium opacity-80 mb-1">{t('hierarchySecondaryLabel')}</div>
                    <div className="font-bold">{t('hierarchySecondaryTitle')}</div>
                    <div className="text-sm opacity-90">{t('hierarchySecondarySubtitle')}</div>
                  </div>

                  {/* Tertiary */}
                  <div className="bg-blue-500 text-white rounded-lg p-4 text-center mx-12">
                    <div className="text-xs font-medium opacity-80 mb-1">{t('hierarchyTertiaryLabel')}</div>
                    <div className="font-bold">{t('hierarchyTertiaryTitle')}</div>
                    <div className="text-sm opacity-90">{t('hierarchyTertiarySubtitle')}</div>
                  </div>
                </div>
              </div>

              {/* How Layers Combine */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {t('layersCombineHeading')}
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-6">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('layersCombineItem1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('layersCombineItem2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('layersCombineItem3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('layersCombineItem4')}
                  </li>
                </ul>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                    {t('commercialHostsHeading')}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('commercialHostsDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guest Insurance & Deposits */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoWalletOutline className="w-6 h-6 text-emerald-500" />
              {t('guestInsuranceHeading')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {t('guestProtectionTitle')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t('guestProtectionDescription')}
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('guestProtectionFeature1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('guestProtectionFeature2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('guestProtectionFeature3')}
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {t('securityDepositsTitle')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t('securityDepositsDescription')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-gray-600 dark:text-gray-400">{t('depositEconomy')}</span>
                    <span className="font-medium">{t('depositEconomyRange')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-gray-600 dark:text-gray-400">{t('depositStandard')}</span>
                    <span className="font-medium">{t('depositStandardRange')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-gray-600 dark:text-gray-400">{t('depositLuxury')}</span>
                    <span className="font-medium">{t('depositLuxuryRange')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Host Declarations */}
        <section className="py-10 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoDocumentTextOutline className="w-6 h-6 text-emerald-500" />
              {t('declarationsHeading')}
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('declarationsIntro')}
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {DECLARATIONS.map((dec, i) => {
                const Icon = dec.icon
                return (
                  <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <Icon className="w-8 h-8 text-emerald-500 mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dec.type}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dec.description}</p>
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <IoSpeedometerOutline className="w-4 h-4" />
                      {dec.mileage}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t('mileageForensicsNotice')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-10 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-emerald-500" />
              {t('faqHeading')}
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
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

        {/* CTA */}
        <section className="py-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t('ctaHeading')}
            </h2>
            <p className="text-white/90 mb-6">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/list-your-car"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t('ctaListYourCar')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/support/insurance"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                {t('ctaFullInsuranceGuide')}
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
