// app/partners/resources/page.tsx
// Partner Resources Page

import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoBookOutline,
  IoVideocamOutline,
  IoHelpCircleOutline,
  IoArrowForward
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('partnersResourcesTitle'),
    description: t('partnersResourcesDescription'),
  }
}

const resources = [
  {
    icon: IoDocumentTextOutline,
    titleKey: 'resourceOnboardingGuideTitle',
    descKey: 'resourceOnboardingGuideDesc',
    typeKey: 'typePdfGuide',
    link: '#'
  },
  {
    icon: IoBookOutline,
    titleKey: 'resourceFleetBestPracticesTitle',
    descKey: 'resourceFleetBestPracticesDesc',
    typeKey: 'typeArticle',
    link: '#'
  },
  {
    icon: IoVideocamOutline,
    titleKey: 'resourceDashboardTutorialTitle',
    descKey: 'resourceDashboardTutorialDesc',
    typeKey: 'typeVideo',
    link: '#'
  },
  {
    icon: IoDocumentTextOutline,
    titleKey: 'resourceInsuranceRequirementsTitle',
    descKey: 'resourceInsuranceRequirementsDesc',
    typeKey: 'typePdfGuide',
    link: '#'
  },
  {
    icon: IoDownloadOutline,
    titleKey: 'resourcePhotoGuidelinesTitle',
    descKey: 'resourcePhotoGuidelinesDesc',
    typeKey: 'typePdfGuide',
    link: '#'
  },
  {
    icon: IoBookOutline,
    titleKey: 'resourcePricingStrategyTitle',
    descKey: 'resourcePricingStrategyDesc',
    typeKey: 'typeArticle',
    link: '#'
  }
]

const faqKeys = [
  { questionKey: 'faqCommissionsQuestion', answerKey: 'faqCommissionsAnswer' },
  { questionKey: 'faqPaymentQuestion', answerKey: 'faqPaymentAnswer' },
  { questionKey: 'faqAddVehiclesQuestion', answerKey: 'faqAddVehiclesAnswer' },
  { questionKey: 'faqInsuranceQuestion', answerKey: 'faqInsuranceAnswer' }
] as const

export default async function PartnerResourcesPage() {
  const t = await getTranslations('PartnersResources')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoBookOutline className="w-12 h-12 mx-auto mb-4 text-orange-400" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('heroTitle')}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('guidesAndDocs')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <Link
                  key={resource.titleKey}
                  href={resource.link}
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <resource.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                        {t(resource.typeKey)}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 transition-colors">
                        {t(resource.titleKey)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(resource.descKey)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <IoHelpCircleOutline className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('faqTitle')}
              </h2>
            </div>
            <div className="space-y-4">
              {faqKeys.map((faq) => (
                <div
                  key={faq.questionKey}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5"
                >
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {t(faq.questionKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t(faq.answerKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('ctaTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact?subject=Partner%20Support"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                {t('contactSupport')} <IoArrowForward className="w-4 h-4" />
              </Link>
              <Link
                href="/partner/login"
                className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('partnerDashboard')}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
