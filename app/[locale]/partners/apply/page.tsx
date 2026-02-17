// app/partners/apply/page.tsx
// Partner Application Landing Page - "Become a Fleet Partner"

import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarSportOutline,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoSpeedometerOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoArrowForward,
  IoBusinessOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoHeadsetOutline
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('partnersApplyTitle'),
    description: t('partnersApplyDescription'),
    openGraph: {
      title: t('partnersApplyOgTitle'),
      description: t('partnersApplyOgDescription'),
      type: 'website',
    },
  }
}

const benefits = [
  {
    icon: IoTrendingUpOutline,
    titleKey: 'benefitVolumeDiscountsTitle',
    descKey: 'benefitVolumeDiscountsDesc'
  },
  {
    icon: IoSpeedometerOutline,
    titleKey: 'benefitInstantApprovalsTitle',
    descKey: 'benefitInstantApprovalsDesc'
  },
  {
    icon: IoShieldCheckmarkOutline,
    titleKey: 'benefitCommercialInsuranceTitle',
    descKey: 'benefitCommercialInsuranceDesc'
  },
  {
    icon: IoWalletOutline,
    titleKey: 'benefitWeeklyPayoutsTitle',
    descKey: 'benefitWeeklyPayoutsDesc'
  },
  {
    icon: IoStatsChartOutline,
    titleKey: 'benefitAnalyticsDashboardTitle',
    descKey: 'benefitAnalyticsDashboardDesc'
  },
  {
    icon: IoHeadsetOutline,
    titleKey: 'benefitDedicatedSupportTitle',
    descKey: 'benefitDedicatedSupportDesc'
  }
]

const commissionTiers = [
  { vehicles: '1-9', rate: '25%', tierKey: 'tierStandard' },
  { vehicles: '10-49', rate: '20%', tierKey: 'tierGold' },
  { vehicles: '50-99', rate: '15%', tierKey: 'tierPlatinum' },
  { vehicles: '100+', rate: '10%', tierKey: 'tierDiamond' }
]

const requirementKeys = [
  'requirementBusinessEntity',
  'requirementCommercialInsurance',
  'requirementFleetSize',
  'requirementBusinessLicense',
  'requirementW9',
  'requirementBackgroundCheck'
] as const

const steps = [
  {
    step: 1,
    titleKey: 'stepApplyOnlineTitle',
    descKey: 'stepApplyOnlineDesc'
  },
  {
    step: 2,
    titleKey: 'stepDocVerificationTitle',
    descKey: 'stepDocVerificationDesc'
  },
  {
    step: 3,
    titleKey: 'stepAccountSetupTitle',
    descKey: 'stepAccountSetupDesc'
  },
  {
    step: 4,
    titleKey: 'stepStartEarningTitle',
    descKey: 'stepStartEarningDesc'
  }
]

export default async function PartnerApplyPage() {
  const t = await getTranslations('PartnersApply')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center text-white pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/rideshare/hero-prius-highway.jpg"
            alt={t('heroImageAlt')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <IoBusinessOutline className="w-5 h-5" />
              <span className="text-orange-300 font-medium text-sm">{t('heroBadge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="text-base sm:text-lg text-gray-200 mb-6">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/partners/apply/start"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                {t('applyNow')}
                <IoArrowForward className="w-4 h-4" />
              </Link>
              <Link
                href="/contact?subject=Fleet%20Partnership"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                {t('contactSales')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('commissionTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('commissionSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {commissionTiers.map((tier, index) => (
              <div
                key={tier.tierKey}
                className={`relative rounded-lg p-5 text-center shadow-sm ${
                  index === 3
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-2 ring-orange-300'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {index === 3 && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {t('bestValue')}
                  </div>
                )}
                <div className={`text-xs font-medium mb-1 ${index === 3 ? 'text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t(tier.tierKey)}
                </div>
                <div className={`text-3xl font-bold mb-1 ${index === 3 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {tier.rate}
                </div>
                <div className={`text-xs ${index === 3 ? 'text-orange-200' : 'text-gray-600 dark:text-gray-300'}`}>
                  {tier.vehicles} {t('vehicles')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('benefitsTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('benefitsSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.titleKey}
                className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3">
                  <benefit.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {t(benefit.titleKey)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t(benefit.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-4" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="lg:pl-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('requirementsTitle')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                {t('requirementsSubtitle')}
              </p>
              <ul className="space-y-3">
                {requirementKeys.map((reqKey) => (
                  <li key={reqKey} className="flex items-start gap-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t(reqKey)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5">
                <IoTimeOutline className="w-7 h-7 text-orange-600" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('averageApprovalTime')}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{t('approvalTimeValue')}</div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('timelineApplicationReview')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('timelineSameDay')}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('timelineDocVerification')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('timelineOneToTwoDays')}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('timelineAccountActivation')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('timelineImmediate')}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('timelineFirstVehicleLive')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('timelineSameDay')}</span>
                </div>
              </div>
              <Link
                href="/partners/apply/start"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                {t('startYourApplication')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <IoPeopleOutline className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {t('ctaTitle')}
          </h2>
          <p className="text-base text-gray-300 mb-6">
            {t('ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/partners/apply/start"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {t('applyNow')}
              <IoArrowForward className="w-4 h-4" />
            </Link>
            <Link
              href="/contact?subject=Fleet%20Partnership%20Inquiry"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors"
            >
              {t('scheduleACall')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
