// app/help/host-account/page.tsx
// Comprehensive guide to ItWhip Host Accounts
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoDocumentTextOutline,
  IoStarOutline,
  IoHelpCircleOutline,
  IoSparklesOutline,
  IoCardOutline,
  IoTrendingUpOutline,
  IoLockClosedOutline,
  IoServerOutline,
  IoAnalyticsOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoSettingsOutline,
  IoTimeOutline,
  IoLeafOutline,
  IoCashOutline,
  IoCarOutline,
  IoBusinessOutline,
  IoLinkOutline,
  IoDownloadOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoSwapHorizontalOutline,
  IoPersonOutline
} from 'react-icons/io5'

const gettingStartedSteps = [
  {
    step: 1,
    icon: IoDocumentTextOutline,
    titleKey: 'gettingStartedStep1Title',
    descriptionKey: 'gettingStartedStep1Desc',
    detailKeys: ['gettingStartedStep1Detail1', 'gettingStartedStep1Detail2', 'gettingStartedStep1Detail3']
  },
  {
    step: 2,
    icon: IoCarOutline,
    titleKey: 'gettingStartedStep2Title',
    descriptionKey: 'gettingStartedStep2Desc',
    detailKeys: ['gettingStartedStep2Detail1', 'gettingStartedStep2Detail2', 'gettingStartedStep2Detail3']
  },
  {
    step: 3,
    icon: IoCardOutline,
    titleKey: 'gettingStartedStep3Title',
    descriptionKey: 'gettingStartedStep3Desc',
    detailKeys: ['gettingStartedStep3Detail1', 'gettingStartedStep3Detail2', 'gettingStartedStep3Detail3']
  },
  {
    step: 4,
    icon: IoCheckmarkCircle,
    titleKey: 'gettingStartedStep4Title',
    descriptionKey: 'gettingStartedStep4Desc',
    detailKeys: ['gettingStartedStep4Detail1', 'gettingStartedStep4Detail2', 'gettingStartedStep4Detail3']
  }
]

const dashboardFeatures = [
  {
    icon: IoAnalyticsOutline,
    titleKey: 'dashboardRevenueTitle',
    descriptionKey: 'dashboardRevenueDesc'
  },
  {
    icon: IoCalendarOutline,
    titleKey: 'dashboardCalendarTitle',
    descriptionKey: 'dashboardCalendarDesc'
  },
  {
    icon: IoCarSportOutline,
    titleKey: 'dashboardFleetTitle',
    descriptionKey: 'dashboardFleetDesc'
  },
  {
    icon: IoPeopleOutline,
    titleKey: 'dashboardGuestMgmtTitle',
    descriptionKey: 'dashboardGuestMgmtDesc'
  },
  {
    icon: IoLocationOutline,
    titleKey: 'dashboardTrackingTitle',
    descriptionKey: 'dashboardTrackingDesc'
  },
  {
    icon: IoSettingsOutline,
    titleKey: 'dashboardSettingsTitle',
    descriptionKey: 'dashboardSettingsDesc'
  }
]

const commissionTiers = [
  {
    tierKey: 'tierStandard',
    hostKeeps: '75%',
    vehiclesKey: 'tierStandardVehicles',
    color: 'gray',
    descriptionKey: 'tierStandardDesc'
  },
  {
    tierKey: 'tierGold',
    hostKeeps: '80%',
    vehiclesKey: 'tierGoldVehicles',
    color: 'amber',
    popular: true,
    descriptionKey: 'tierGoldDesc'
  },
  {
    tierKey: 'tierPlatinum',
    hostKeeps: '85%',
    vehiclesKey: 'tierPlatinumVehicles',
    color: 'purple',
    descriptionKey: 'tierPlatinumDesc'
  },
  {
    tierKey: 'tierDiamond',
    hostKeeps: '90%',
    vehiclesKey: 'tierDiamondVehicles',
    color: 'emerald',
    descriptionKey: 'tierDiamondDesc'
  }
]

const protectionFeatures = [
  {
    icon: IoShieldCheckmarkOutline,
    titleKey: 'protectionLiabilityTitle',
    descriptionKey: 'protectionLiabilityDesc'
  },
  {
    icon: IoAnalyticsOutline,
    titleKey: 'protectionMileageTitle',
    descriptionKey: 'protectionMileageDesc'
  },
  {
    icon: IoDocumentTextOutline,
    titleKey: 'protectionGuestVerifTitle',
    descriptionKey: 'protectionGuestVerifDesc'
  },
  {
    icon: IoTimeOutline,
    titleKey: 'protectionRoadsideTitle',
    descriptionKey: 'protectionRoadsideDesc'
  }
]

const faqKeys = [
  { questionKey: 'faq1Question', answerKey: 'faq1Answer' },
  { questionKey: 'faq2Question', answerKey: 'faq2Answer' },
  { questionKey: 'faq3Question', answerKey: 'faq3Answer' },
  { questionKey: 'faq4Question', answerKey: 'faq4Answer' },
  { questionKey: 'faq5Question', answerKey: 'faq5Answer' },
  { questionKey: 'faq6Question', answerKey: 'faq6Answer' },
  { questionKey: 'faq7Question', answerKey: 'faq7Answer' },
  { questionKey: 'faq8Question', answerKey: 'faq8Answer' }
]

export default function HostAccountPage() {
  const t = useTranslations('HelpHostAccount')

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
                <Link href="/support" className="hover:text-orange-600">{t('breadcrumbHelp')}</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbHostAccount')}</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <IoBusinessOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('heroTitle')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('heroSubtitle')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.rich('heroDescription', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 sm:p-4 text-center border border-emerald-200 dark:border-emerald-800">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">{t('stat90Value')}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('stat90Label')}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 sm:p-4 text-center border border-amber-200 dark:border-amber-800">
                <div className="text-xl sm:text-2xl font-bold text-amber-600">{t('stat48hrValue')}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('stat48hrLabel')}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center border border-blue-200 dark:border-blue-800">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{t('stat1MValue')}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('stat1MLabel')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started Steps */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('gettingStartedTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('gettingStartedSubtitle')}</p>
            </div>

            <div className="space-y-4">
              {gettingStartedSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center relative">
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                        <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                          {step.step}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{t(step.titleKey)}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">{t(step.descriptionKey)}</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {step.detailKeys.map((detailKey) => (
                          <span
                            key={detailKey}
                            className="text-[10px] sm:text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-gray-200 dark:border-gray-600"
                          >
                            {t(detailKey)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/host/signup"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {t('startHostingNow')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Features */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoSettingsOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('dashboardTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('dashboardSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardFeatures.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{t(feature.titleKey)}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t(feature.descriptionKey)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Tiers */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoTrendingUpOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('commissionTiersTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('commissionTiersSubtitle')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commissionTiers.map((tier) => (
                <div
                  key={tier.tierKey}
                  className={`relative rounded-lg p-4 border shadow-sm ${
                    tier.color === 'emerald'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400'
                      : tier.color === 'amber'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400'
                      : tier.color === 'purple'
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {t('popularBadge')}
                    </div>
                  )}
                  <div className={`text-xs font-bold mb-1 ${
                    tier.color === 'emerald' ? 'text-emerald-600'
                    : tier.color === 'amber' ? 'text-amber-600'
                    : tier.color === 'purple' ? 'text-purple-600'
                    : 'text-gray-600'
                  }`}>
                    {t(tier.tierKey)}
                  </div>
                  <div className={`text-2xl font-black mb-0.5 ${
                    tier.color === 'emerald' ? 'text-emerald-600'
                    : tier.color === 'amber' ? 'text-amber-600'
                    : tier.color === 'purple' ? 'text-purple-600'
                    : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {tier.hostKeeps}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('youKeep')}</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t(tier.vehiclesKey)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-800 dark:text-green-300 text-center">
                {t.rich('commissionNote', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Protection & Insurance */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('hostProtectionTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('hostProtectionSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {protectionFeatures.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{t(feature.titleKey)}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t(feature.descriptionKey)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/host-protection"
                className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                {t('viewProtectionDetails')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Payouts & Banking */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCashOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('payoutsBankingTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('payoutsBankingSubtitle')}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoCardOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('poweredByStripeConnectTitle')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('poweredByStripeConnectDesc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoTimeOutline className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('payout48hrTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('payout48hrDesc')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCalendarOutline className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('payoutFlexibleTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('payoutFlexibleDesc')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoDocumentTextOutline className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('payoutTaxDocsTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('payoutTaxDocsDesc')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoLockClosedOutline className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('payoutBankSecurityTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('payoutBankSecurityDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ESG & Sustainability */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoLeafOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('esgTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('esgSubtitle')}</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoLeafOutline className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">{t('esgScoreTitle')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t('esgScoreDesc')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {t('esgBadgeCSRD')}
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {t('esgBadgeCarbon')}
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {t('esgBadgeSustainability')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Linking */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoLinkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('accountLinkingTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('accountLinkingSubtitle')}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoSwapHorizontalOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('switchHostGuestTitle')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('switchHostGuestDesc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoPersonOutline className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('oneIdentityTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('oneIdentityDesc')}
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCarSportOutline className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">{t('wantToBookTitle')}</h4>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t.rich('wantToBookDesc', {
                      strong: (chunks) => <strong>{chunks}</strong>
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t.rich('howToLinkHost', {
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Export & Account Deletion */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('dataPrivacyTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('dataPrivacySubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Download My Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IoDownloadOutline className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{t('downloadDataTitle')}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {t('downloadDataDesc')}
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 ml-13 mb-4">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{t('downloadDataItem1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{t('downloadDataItem2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{t('downloadDataItem3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{t('downloadDataItem4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{t('downloadDataItem5')}</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.rich('downloadDataLocation', {
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
              </div>

              {/* Delete Account */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IoTrashOutline className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{t('deleteAccountTitle')}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {t('deleteAccountDesc')}
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800 mb-4">
                  <div className="flex items-start gap-2">
                    <IoWarningOutline className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('gracePeriodTitle')}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {t('gracePeriodDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{t('deleteItem1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{t('deleteItem2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{t('deleteItem3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{t('deleteItem4')}</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.rich('deleteAccountLocation', {
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoHelpCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                {t('faqTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('faqSubtitle')}</p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {faqKeys.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    <span className="pr-2">{t(faq.questionKey)}</span>
                    <IoChevronForwardOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(faq.answerKey)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('ctaTitle')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              {t('ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/host/signup"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {t('ctaBecomeHost')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/host-university"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {t('ctaHostUniversity')}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
