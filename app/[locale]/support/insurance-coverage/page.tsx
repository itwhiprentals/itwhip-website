// app/support/insurance-coverage/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('supportInsuranceCoverageTitle'),
    description: t('supportInsuranceCoverageDescription'),
  }
}

const coverageTypes = [
  {
    titleKey: 'liabilityCoverageTitle' as const,
    amount: '$1,000,000',
    included: true,
    descKey: 'liabilityCoverageDesc' as const,
    detailKeys: ['liabilityDetail1', 'liabilityDetail2', 'liabilityDetail3'] as const
  },
  {
    titleKey: 'comprehensiveProtectionTitle' as const,
    amount: 'comprehensiveAmount' as const,
    included: false,
    descKey: 'comprehensiveProtectionDesc' as const,
    detailKeys: ['comprehensiveDetail1', 'comprehensiveDetail2', 'comprehensiveDetail3'] as const
  },
  {
    titleKey: 'collisionProtectionTitle' as const,
    amount: 'collisionAmount' as const,
    included: false,
    descKey: 'collisionProtectionDesc' as const,
    detailKeys: ['collisionDetail1', 'collisionDetail2', 'collisionDetail3'] as const
  }
]

const requirementKeys = [
  'byoiReq1' as const,
  'byoiReq2' as const,
  'byoiReq3' as const
]

export default async function InsuranceCoveragePage() {
  const t = await getTranslations('SupportInsuranceCoverage')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-orange-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  {t('breadcrumbHome')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-orange-600">{t('breadcrumbSupport')}</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbInsuranceCoverage')}</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('pageTitle')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{t('pageSubtitle')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Types */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {coverageTypes.map((coverage) => (
              <div
                key={coverage.titleKey}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {t(coverage.titleKey)}
                      {coverage.included && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {t('includedBadge')}
                        </span>
                      )}
                    </h2>
                    <p className="text-2xl font-bold text-orange-500">
                      {coverage.included ? coverage.amount : t(coverage.amount as 'comprehensiveAmount' | 'collisionAmount')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t(coverage.descKey)}</p>
                <ul className="space-y-2">
                  {coverage.detailKeys.map((detailKey) => (
                    <li key={detailKey} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t(detailKey)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* BYOI Section */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
                {t('byoiTitle')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('byoiDesc')}
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {requirementKeys.map((reqKey) => (
                  <li key={reqKey}>• {t(reqKey)}</li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/insurance-guide"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('fullInsuranceGuide')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
