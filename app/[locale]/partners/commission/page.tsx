// app/partners/commission/page.tsx
// Commission Tiers Information Page

import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoTrendingUpOutline,
  IoCheckmarkCircle,
  IoArrowForward
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Commission Tiers | Fleet Partner Program | ItWhip',
  description: 'Learn about our tiered commission structure. Earn more as your fleet grows: 25% → 20% → 15% → 10%.',
}

const commissionTiers = [
  {
    tierKey: 'tierStandard',
    vehicles: '1-9',
    rate: '25%',
    descKey: 'tierStandardDesc',
    featureKeys: [
      'featureStandardApprovals',
      'featureWeeklyPayouts',
      'featureBasicAnalytics',
      'featureEmailSupport'
    ]
  },
  {
    tierKey: 'tierGold',
    vehicles: '10-49',
    rate: '20%',
    descKey: 'tierGoldDesc',
    featureKeys: [
      'featurePriorityApprovals',
      'featureWeeklyPayouts',
      'featureAdvancedAnalytics',
      'featurePriorityEmail',
      'featureBulkUpload'
    ]
  },
  {
    tierKey: 'tierPlatinum',
    vehicles: '50-99',
    rate: '15%',
    descKey: 'tierPlatinumDesc',
    featureKeys: [
      'featureInstantApprovals',
      'featureBiweeklyPayouts',
      'featureFullAnalytics',
      'featurePriorityPhone',
      'featureDedicatedManager',
      'featureCustomPromoTools'
    ]
  },
  {
    tierKey: 'tierDiamond',
    vehicles: '100+',
    rate: '10%',
    featured: true,
    descKey: 'tierDiamondDesc',
    featureKeys: [
      'featureInstantApprovals',
      'featureFlexiblePayouts',
      'featureEnterpriseAnalytics',
      'featureDedicatedSupportLine',
      'featureSeniorManager',
      'featureCoMarketing',
      'featureCustomIntegrations'
    ]
  }
]

export default async function CommissionTiersPage() {
  const t = await getTranslations('PartnersCommission')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoTrendingUpOutline className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('heroTitle')}
            </h1>
            <p className="text-lg text-orange-100 max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        {/* Tier Progression */}
        <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-center">
              <div className="flex-1">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">25%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('progressionOneToNine')}</div>
              </div>
              <div className="text-gray-300 dark:text-gray-600">&rarr;</div>
              <div className="flex-1">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">20%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('progressionTenToFortyNine')}</div>
              </div>
              <div className="text-gray-300 dark:text-gray-600">&rarr;</div>
              <div className="flex-1">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">15%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('progressionFiftyToNinetyNine')}</div>
              </div>
              <div className="text-gray-300 dark:text-gray-600">&rarr;</div>
              <div className="flex-1">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">10%</div>
                <div className="text-xs text-orange-600 font-medium">{t('progressionHundredPlus')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Tiers */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {commissionTiers.map((tier) => (
                <div
                  key={tier.tierKey}
                  className={`rounded-lg p-5 ${
                    tier.featured
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-2 ring-orange-300'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {tier.featured && (
                    <div className="text-xs font-bold bg-orange-800 text-white px-2 py-0.5 rounded-full inline-block mb-3">
                      {t('bestValue')}
                    </div>
                  )}
                  <div className={`text-xs font-medium mb-1 ${tier.featured ? 'text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {t(tier.tierKey)}
                  </div>
                  <div className={`text-4xl font-bold mb-1 ${tier.featured ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {tier.rate}
                  </div>
                  <div className={`text-sm mb-4 ${tier.featured ? 'text-orange-200' : 'text-gray-600 dark:text-gray-400'}`}>
                    {tier.vehicles} {t('vehicles')}
                  </div>
                  <p className={`text-sm mb-4 ${tier.featured ? 'text-orange-100' : 'text-gray-600 dark:text-gray-300'}`}>
                    {t(tier.descKey)}
                  </p>
                  <ul className="space-y-2">
                    {tier.featureKeys.map((featureKey) => (
                      <li key={featureKey} className="flex items-start gap-2 text-sm">
                        <IoCheckmarkCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.featured ? 'text-orange-200' : 'text-green-500'}`} />
                        <span className={tier.featured ? 'text-orange-100' : 'text-gray-700 dark:text-gray-300'}>{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('ctaTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('ctaSubtitle')}
            </p>
            <Link
              href="/partners/apply"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {t('applyNow')} <IoArrowForward className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
