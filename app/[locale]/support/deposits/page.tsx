// app/support/deposits/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoWalletOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoInformationCircleOutline,
  IoAlertCircleOutline,
  IoRefreshOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Security Deposits Explained | ItWhip Support',
  description: 'Learn about ItWhip security deposits - how they work, when they\'re charged, refund timelines, and how to reduce your deposit with verified insurance.',
  keywords: [
    'security deposit car rental',
    'rental car deposit',
    'itwhip deposit',
    'car rental hold',
    'deposit refund'
  ],
  openGraph: {
    title: 'Security Deposits | ItWhip Support',
    description: 'Everything you need to know about security deposits on ItWhip rentals.',
    url: 'https://itwhip.com/support/deposits',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/support/deposits',
  },
}

const DEPOSIT_TIERS = [
  { tierKey: 'tierName1' as const, carTypesKey: 'tierCarTypes1' as const, rangeKey: 'tierRange1' as const, descKey: 'tierDesc1' as const },
  { tierKey: 'tierName2' as const, carTypesKey: 'tierCarTypes2' as const, rangeKey: 'tierRange2' as const, descKey: 'tierDesc2' as const },
  { tierKey: 'tierName3' as const, carTypesKey: 'tierCarTypes3' as const, rangeKey: 'tierRange3' as const, descKey: 'tierDesc3' as const }
]

const FAQS = [
  { questionKey: 'faqQuestion1' as const, answerKey: 'faqAnswer1' as const },
  { questionKey: 'faqQuestion2' as const, answerKey: 'faqAnswer2' as const },
  { questionKey: 'faqQuestion3' as const, answerKey: 'faqAnswer3' as const },
  { questionKey: 'faqQuestion4' as const, answerKey: 'faqAnswer4' as const },
  { questionKey: 'faqQuestion5' as const, answerKey: 'faqAnswer5' as const },
  { questionKey: 'faqQuestion6' as const, answerKey: 'faqAnswer6' as const }
]

export default async function DepositsPage() {
  const t = await getTranslations('SupportDeposits')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: t(faq.questionKey),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(faq.answerKey)
      }
    }))
  }

  const howItWorksSteps = [
    { step: '1', titleKey: 'stepTitle1' as const, descKey: 'stepDesc1' as const },
    { step: '2', titleKey: 'stepTitle2' as const, descKey: 'stepDesc2' as const },
    { step: '3', titleKey: 'stepTitle3' as const, descKey: 'stepDesc3' as const },
    { step: '4', titleKey: 'stepTitle4' as const, descKey: 'stepDesc4' as const }
  ]

  const reduceSteps = [
    t('reduceStep1'), t('reduceStep2'), t('reduceStep3'), t('reduceStep4')
  ]

  const deductionItems = [
    { titleKey: 'deductTitle1' as const, descKey: 'deductDesc1' as const },
    { titleKey: 'deductTitle2' as const, descKey: 'deductDesc2' as const },
    { titleKey: 'deductTitle3' as const, descKey: 'deductDesc3' as const },
    { titleKey: 'deductTitle4' as const, descKey: 'deductDesc4' as const },
    { titleKey: 'deductTitle5' as const, descKey: 'deductDesc5' as const },
    { titleKey: 'deductTitle6' as const, descKey: 'deductDesc6' as const },
    { titleKey: 'deductTitle7' as const, descKey: 'deductDesc7' as const },
    { titleKey: 'deductTitle8' as const, descKey: 'deductDesc8' as const }
  ]

  return (
    <>
      <Script
        id="deposits-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-3">
                <IoWalletOutline className="w-5 h-5" />
                {t('supportGuide')}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-white/90">
                {t('heroSubtitle')}
              </p>
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
                <Link href="/support" className="hover:text-amber-600">
                  {t('breadcrumbSupport')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {t('breadcrumbDeposits')}
              </li>
            </ol>
          </nav>
        </div>

        {/* Key Points */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('keyPointTitle1')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('keyPointDesc1')}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <IoTimeOutline className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('keyPointTitle2')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('keyPointDesc2')}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <IoCardOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('keyPointTitle3')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('keyPointDesc3')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('howItWorksTitle')}
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {howItWorksSteps.map((item, i) => (
                <div key={i} className="relative">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {t(item.titleKey)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(item.descKey)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deposit Tiers */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('depositTiersTitle')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableTier')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableVehicleTypes')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableTypicalDeposit')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableNotes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPOSIT_TIERS.map((tier, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t(tier.tierKey)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t(tier.carTypesKey)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{t(tier.rangeKey)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t(tier.descKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <IoInformationCircleOutline className="w-4 h-4 inline mr-1" />
              {t('depositDisclaimer')}
            </p>
          </div>
        </section>

        {/* Reducing Your Deposit */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('reduceTitle')}
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('reduceIntro')}
              </p>
              <ol className="space-y-3">
                {reduceSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('reduceInsuranceNote')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Deposits Cover */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('deductionsTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {deductionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <IoAlertCircleOutline className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{t(item.titleKey)}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t(item.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-blue-500" />
              {t('faqTitle')}
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
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
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-10 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t('ctaTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('ctaSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                {t('contactSupport')}
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                {t('backToSupport')}
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
