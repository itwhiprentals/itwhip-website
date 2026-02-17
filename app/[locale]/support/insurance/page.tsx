// app/support/insurance/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoCarOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoAlertCircleOutline,
  IoCallOutline,
  IoMailOutline,
  IoChatbubblesOutline,
  IoTimeOutline,
  IoWarningOutline
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('supportInsuranceTitle'),
    description: t('supportInsuranceDescription'),
    openGraph: {
      title: t('supportInsuranceOgTitle'),
      description: t('supportInsuranceOgDescription'),
      url: 'https://itwhip.com/support/insurance',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/support/insurance',
    },
  }
}

const COMMON_QUESTION_KEYS = [
  { questionKey: 'faqQuestion1' as const, answerKey: 'faqAnswer1' as const },
  { questionKey: 'faqQuestion2' as const, answerKey: 'faqAnswer2' as const },
  { questionKey: 'faqQuestion3' as const, answerKey: 'faqAnswer3' as const },
  { questionKey: 'faqQuestion4' as const, answerKey: 'faqAnswer4' as const },
  { questionKey: 'faqQuestion5' as const, answerKey: 'faqAnswer5' as const },
  { questionKey: 'faqQuestion6' as const, answerKey: 'faqAnswer6' as const },
  { questionKey: 'faqQuestion7' as const, answerKey: 'faqAnswer7' as const },
  { questionKey: 'faqQuestion8' as const, answerKey: 'faqAnswer8' as const },
  { questionKey: 'faqQuestion9' as const, answerKey: 'faqAnswer9' as const },
  { questionKey: 'faqQuestion10' as const, answerKey: 'faqAnswer10' as const },
]

const CLAIM_STEPS = [
  {
    step: 1,
    titleKey: 'claimStep1Title' as const,
    descKey: 'claimStep1Desc' as const,
    icon: IoAlertCircleOutline
  },
  {
    step: 2,
    titleKey: 'claimStep2Title' as const,
    descKey: 'claimStep2Desc' as const,
    icon: IoDocumentTextOutline
  },
  {
    step: 3,
    titleKey: 'claimStep3Title' as const,
    descKey: 'claimStep3Desc' as const,
    icon: IoCheckmarkCircleOutline
  },
  {
    step: 4,
    titleKey: 'claimStep4Title' as const,
    descKey: 'claimStep4Desc' as const,
    icon: IoTimeOutline
  }
]

export default async function InsuranceSupportPage() {
  const t = await getTranslations('SupportInsurance')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COMMON_QUESTION_KEYS.map(faq => ({
      '@type': 'Question',
      name: t(faq.questionKey),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(faq.answerKey)
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
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-3">
                <IoHelpCircleOutline className="w-5 h-5" />
                {t('supportCenter')}
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
                <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  {t('breadcrumbHome')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-blue-600">
                  {t('breadcrumbSupport')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {t('breadcrumbInsurance')}
              </li>
            </ol>
          </nav>
        </div>

        {/* Quick Actions */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="#file-claim"
                className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <IoAlertCircleOutline className="w-8 h-8 text-red-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('quickFileClaimTitle')}</div>
                  <div className="text-xs text-gray-500">{t('quickFileClaimDesc')}</div>
                </div>
              </Link>

              <Link
                href="#faq"
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
              >
                <IoHelpCircleOutline className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('quickCommonQuestionsTitle')}</div>
                  <div className="text-xs text-gray-500">{t('quickCommonQuestionsDesc')}</div>
                </div>
              </Link>

              <Link
                href="/host/insurance-options"
                className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition"
              >
                <IoShieldCheckmarkOutline className="w-8 h-8 text-emerald-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('quickHostTiersTitle')}</div>
                  <div className="text-xs text-gray-500">{t('quickHostTiersDesc')}</div>
                </div>
              </Link>

              <Link
                href="#contact"
                className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
              >
                <IoChatbubblesOutline className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('quickContactSupportTitle')}</div>
                  <div className="text-xs text-gray-500">{t('quickContactSupportDesc')}</div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* How to File a Claim */}
        <section id="file-claim" className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoAlertCircleOutline className="w-6 h-6 text-red-500" />
              {t('fileClaimTitle')}
            </h2>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {CLAIM_STEPS.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.step} className="relative">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <Icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                        {t(step.titleKey)}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t(step.descKey)}
                      </p>
                    </div>
                    {step.step < 4 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                        <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <IoWarningOutline className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>{t('importantLabel')}</strong> {t('lateReportingWarning')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Overview */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-emerald-500" />
              {t('whatsCoveredTitle')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                  {t('coveredDuringTripsTitle')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('coveredItem1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('coveredItem2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('coveredItem3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('coveredItem4')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t('coveredItem5')}
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <IoAlertCircleOutline className="w-5 h-5" />
                  {t('notCoveredTitle')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {t('notCoveredItem1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {t('notCoveredItem2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {t('notCoveredItem3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {t('notCoveredItem4')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {t('notCoveredItem5')}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/insurance-guide"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {t('viewFullInsuranceGuide')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Insurance Hierarchy Quick Reference */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoLayersOutline className="w-6 h-6 text-blue-500" />
              {t('claimsProcessedTitle')}
            </h2>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {t('claimsHierarchyDesc')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('tier1Title')}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('tier1Desc')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('tier2Title')}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('tier2Desc')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('tier3Title')}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('tier3Desc')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/host/insurance-options"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {t('learnHostInsuranceTiers')}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-blue-500" />
              {t('commonQuestionsTitle')}
            </h2>
            <div className="space-y-3">
              {COMMON_QUESTION_KEYS.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
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

        {/* Contact Support */}
        <section id="contact" className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoChatbubblesOutline className="w-6 h-6 text-purple-500" />
              {t('contactInsuranceSupportTitle')}
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
                <IoCallOutline className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contactPhoneTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('contactPhoneDesc')}</p>
                <a href="tel:+14805551234" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  (480) 555-1234
                </a>
                <p className="text-xs text-gray-500 mt-1">{t('contactPhoneHours')}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
                <IoMailOutline className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contactEmailTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('contactEmailDesc')}</p>
                <a href="mailto:info@itwhip.com" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  info@itwhip.com
                </a>
                <p className="text-xs text-gray-500 mt-1">{t('contactEmailResponse')}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
                <IoChatbubblesOutline className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contactChatTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('contactChatDesc')}</p>
                <span className="text-blue-600 font-medium text-sm">
                  {t('contactChatAction')}
                </span>
                <p className="text-xs text-gray-500 mt-1">{t('contactChatAvailability')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('relatedResourcesTitle')}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/host/insurance-options"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                {t('resourceHostInsuranceTiers')}
              </Link>
              <Link
                href="/insurance-guide"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-400 transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                {t('resourceFullInsuranceGuide')}
              </Link>
              <Link
                href="/host-protection"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors"
              >
                <IoCarOutline className="w-4 h-4" />
                {t('resourceHostProtection')}
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <IoHelpCircleOutline className="w-4 h-4" />
                {t('resourceHelpCenter')}
              </Link>
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="py-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold mb-3">
              {t('needImmediateHelpTitle')}
            </h2>
            <p className="text-white/90 mb-6">
              {t('needImmediateHelpDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="tel:+14805551234"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoCallOutline className="w-5 h-5" />
                {t('callClaimsTeam')}
              </a>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
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
