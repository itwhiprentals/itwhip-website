// app/support/cleaning-policy/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoSparklesOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoLeafOutline,
  IoPawOutline,
  IoFlameOutline,
  IoWaterOutline,
  IoTrashOutline
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('supportCleaningPolicyTitle'),
    description: t('supportCleaningPolicyDescription'),
  }
}

const CLEANING_FEES = [
  { levelKey: 'feeLevel1' as const, feeKey: 'feeRange1' as const, examplesKey: 'feeExamples1' as const, descKey: 'feeDesc1' as const },
  { levelKey: 'feeLevel2' as const, feeKey: 'feeRange2' as const, examplesKey: 'feeExamples2' as const, descKey: 'feeDesc2' as const },
  { levelKey: 'feeLevel3' as const, feeKey: 'feeRange3' as const, examplesKey: 'feeExamples3' as const, descKey: 'feeDesc3' as const },
  { levelKey: 'feeLevel4' as const, feeKey: 'feeRange4' as const, examplesKey: 'feeExamples4' as const, descKey: 'feeDesc4' as const }
]

const FAQS = [
  { questionKey: 'faqQuestion1' as const, answerKey: 'faqAnswer1' as const },
  { questionKey: 'faqQuestion2' as const, answerKey: 'faqAnswer2' as const },
  { questionKey: 'faqQuestion3' as const, answerKey: 'faqAnswer3' as const },
  { questionKey: 'faqQuestion4' as const, answerKey: 'faqAnswer4' as const },
  { questionKey: 'faqQuestion5' as const, answerKey: 'faqAnswer5' as const },
  { questionKey: 'faqQuestion6' as const, answerKey: 'faqAnswer6' as const }
]

const PRO_TIPS = [
  { icon: IoTrashOutline, tipKey: 'proTip1Title' as const, descKey: 'proTip1Desc' as const },
  { icon: IoWaterOutline, tipKey: 'proTip2Title' as const, descKey: 'proTip2Desc' as const },
  { icon: IoPawOutline, tipKey: 'proTip3Title' as const, descKey: 'proTip3Desc' as const },
  { icon: IoSparklesOutline, tipKey: 'proTip4Title' as const, descKey: 'proTip4Desc' as const }
]

export default async function CleaningPolicyPage() {
  const t = await getTranslations('SupportCleaningPolicy')

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

  const doItems = [
    t('doItem1'), t('doItem2'), t('doItem3'), t('doItem4'),
    t('doItem5'), t('doItem6'), t('doItem7')
  ]

  const dontItems = [
    t('dontItem1'), t('dontItem2'), t('dontItem3'), t('dontItem4'),
    t('dontItem5'), t('dontItem6'), t('dontItem7')
  ]

  const disputeSteps = [
    t('disputeStep1'), t('disputeStep2'), t('disputeStep3'),
    t('disputeStep4'), t('disputeStep5')
  ]

  return (
    <>
      <Script
        id="cleaning-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-violet-200 text-sm font-medium mb-3">
                <IoSparklesOutline className="w-5 h-5" />
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
                {t('breadcrumbCleaningPolicy')}
              </li>
            </ol>
          </nav>
        </div>

        {/* Golden Rule */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <IoLeafOutline className="w-6 h-6 text-amber-500" />
                {t('goldenRuleTitle')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {t('goldenRuleText')}
              </p>
            </div>
          </div>
        </section>

        {/* Return Checklist */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('returnChecklistTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Do */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                  {t('pleaseDo')}
                </h3>
                <ul className="space-y-2">
                  {doItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don't */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                  <IoCloseCircleOutline className="w-5 h-5" />
                  {t('pleaseDont')}
                </h3>
                <ul className="space-y-2">
                  {dontItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCloseCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Special Policies */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('specialPoliciesTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Smoking */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <IoFlameOutline className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('noSmokingTitle')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('noSmokingDesc')}
                </p>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {t('noSmokingFee')}
                  </p>
                </div>
              </div>

              {/* Pets */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <IoPawOutline className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('petPolicyTitle')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('petPolicyDesc')}
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    {t('petPolicyFee')}
                  </p>
                </div>
              </div>

              {/* Food & Drink */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <IoWaterOutline className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('foodDrinksTitle')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('foodDrinksDesc')}
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {t('foodDrinksFee')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cleaning Fees */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('feeGuidelinesTitle')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableLevel')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableFeeRange')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableExamples')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tableDescription')}</th>
                  </tr>
                </thead>
                <tbody>
                  {CLEANING_FEES.map((tier, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t(tier.levelKey)}</td>
                      <td className="px-4 py-3 text-violet-600 font-medium">{t(tier.feeKey)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t(tier.examplesKey)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t(tier.descKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <IoWarningOutline className="w-4 h-4 inline mr-1" />
              {t('feeDisclaimer')}
            </p>
          </div>
        </section>

        {/* Dispute Process */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('disputeTitle')}
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('disputeIntro')}
              </p>
              <ol className="space-y-3">
                {disputeSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-100 dark:bg-violet-900/30 text-violet-600 text-sm font-medium rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-violet-500" />
              {t('cleaningFaqTitle')}
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

        {/* Pro Tips */}
        <section className="py-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('proTipsTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRO_TIPS.map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <item.icon className="w-6 h-6 text-violet-500 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t(item.tipKey)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(item.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-10 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold mb-3">
              {t('ctaTitle')}
            </h2>
            <p className="text-white/90 mb-6">
              {t('ctaSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t('contactSupport')}
              </Link>
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
