// app/support/damage-process/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoWarningOutline,
  IoCameraOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCallOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoAlertCircleOutline,
  IoHelpCircleOutline,
  IoCashOutline
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('supportDamageProcessTitle'),
    description: t('supportDamageProcessDescription'),
  }
}

const DAMAGE_STEPS = [
  {
    step: 1,
    icon: IoCameraOutline,
    titleKey: 'step1Title' as const,
    descKey: 'step1Desc' as const,
    tipKeys: ['step1Tip1', 'step1Tip2', 'step1Tip3', 'step1Tip4'] as const
  },
  {
    step: 2,
    icon: IoAlertCircleOutline,
    titleKey: 'step2Title' as const,
    descKey: 'step2Desc' as const,
    tipKeys: ['step2Tip1', 'step2Tip2', 'step2Tip3', 'step2Tip4'] as const
  },
  {
    step: 3,
    icon: IoDocumentTextOutline,
    titleKey: 'step3Title' as const,
    descKey: 'step3Desc' as const,
    tipKeys: ['step3Tip1', 'step3Tip2', 'step3Tip3', 'step3Tip4'] as const
  },
  {
    step: 4,
    icon: IoShieldCheckmarkOutline,
    titleKey: 'step4Title' as const,
    descKey: 'step4Desc' as const,
    tipKeys: ['step4Tip1', 'step4Tip2', 'step4Tip3', 'step4Tip4'] as const
  }
]

const FAQ_KEYS = [
  { questionKey: 'faqQuestion1' as const, answerKey: 'faqAnswer1' as const },
  { questionKey: 'faqQuestion2' as const, answerKey: 'faqAnswer2' as const },
  { questionKey: 'faqQuestion3' as const, answerKey: 'faqAnswer3' as const },
  { questionKey: 'faqQuestion4' as const, answerKey: 'faqAnswer4' as const },
  { questionKey: 'faqQuestion5' as const, answerKey: 'faqAnswer5' as const },
  { questionKey: 'faqQuestion6' as const, answerKey: 'faqAnswer6' as const },
  { questionKey: 'faqQuestion7' as const, answerKey: 'faqAnswer7' as const },
  { questionKey: 'faqQuestion8' as const, answerKey: 'faqAnswer8' as const },
]

export default async function DamageProcessPage() {
  const t = await getTranslations('SupportDamageProcess')

  // JSON-LD for HowTo schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Report Vehicle Damage on ItWhip',
    description: 'Step-by-step guide for reporting and resolving vehicle damage during your rental.',
    step: DAMAGE_STEPS.map((step) => ({
      '@type': 'HowToStep',
      position: step.step,
      name: t(step.titleKey),
      text: t(step.descKey)
    }))
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map(faq => ({
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
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-500 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <IoWarningOutline className="w-8 h-8" />
                <h1 className="text-3xl sm:text-4xl font-bold">
                  {t('heroTitle')}
                </h1>
              </div>
              <p className="text-lg text-white/90 mb-4">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#steps"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors text-sm"
                >
                  {t('viewProcess')}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </a>
                <a
                  href="tel:+18557030806"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <IoCallOutline className="w-5 h-5" />
                  {t('emergencyPhone')}
                </a>
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
                <Link href="/support" className="hover:text-amber-600">
                  {t('breadcrumbSupport')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {t('breadcrumbDamageProcess')}
              </li>
            </ol>
          </nav>
        </div>

        {/* Prevention Tips */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    {t('preventionTitle')}
                  </h2>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('preventionDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section id="steps" className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('howToReportTitle')}
            </h2>
            <div className="space-y-6">
              {DAMAGE_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-amber-600">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t(step.titleKey)}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {t(step.descKey)}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.tipKeys.map((tipKey, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {t(tipKey)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Info */}
        <section className="py-8 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-amber-600" />
              {t('protectionPlanTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('basicCoverageTitle')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$2,500</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('maxOutOfPocket')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('basicCoverageDesc')}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">{t('standardProtectionTitle')}</h3>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">$1,000</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">{t('maxOutOfPocket')}</p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {t('standardProtectionDesc')}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">{t('premiumProtectionTitle')}</h3>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">$250</p>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">{t('maxOutOfPocket')}</p>
                <p className="text-xs text-green-800 dark:text-green-200">
                  {t('premiumProtectionDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-600" />
              {t('faqTitle')}
            </h2>
            <div className="space-y-3">
              {FAQ_KEYS.map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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

        {/* Emergency Contact */}
        <section className="py-8 bg-red-50 dark:bg-red-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <IoAlertCircleOutline className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-900 dark:text-red-100">
                    {t('emergencyTitle')}
                  </h2>
                  <p className="text-red-800 dark:text-red-200">
                    {t('emergencyDesc')}
                  </p>
                </div>
              </div>
              <a
                href="tel:+18557030806"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                <IoCallOutline className="w-5 h-5" />
                {t('call247Support')}
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
