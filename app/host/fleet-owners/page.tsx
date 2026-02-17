'use client'

// app/host/fleet-owners/page.tsx
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarOutline,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoAnalyticsOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCashOutline,
  IoSettingsOutline,
  IoLeafOutline,
  IoSpeedometerOutline,
  IoDocumentTextOutline,
  IoFlashOutline,
  IoLayersOutline,
  IoLockClosedOutline,
  IoRocketOutline,
  IoBriefcaseOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoWarningOutline,
  IoCheckmarkDoneOutline
} from 'react-icons/io5'


export default function FleetOwnersPage() {
  const t = useTranslations('HostFleetOwners')

  const challenges = [
    {
      icon: IoWarningOutline,
      title: t('challengeRegulatoryPressureTitle'),
      description: t('challengeRegulatoryPressureDescription'),
      color: 'red'
    },
    {
      icon: IoTrendingUpOutline,
      title: t('challengeRisingInsuranceCostsTitle'),
      description: t('challengeRisingInsuranceCostsDescription'),
      color: 'orange'
    },
    {
      icon: IoAnalyticsOutline,
      title: t('challengeDataOverloadTitle'),
      description: t('challengeDataOverloadDescription'),
      color: 'yellow'
    },
    {
      icon: IoFlashOutline,
      title: t('challengeElectrificationComplexityTitle'),
      description: t('challengeElectrificationComplexityDescription'),
      color: 'blue'
    }
  ]

  const insuranceTiers = [
    {
      tier: t('insuranceTierBasicName'),
      percentage: t('insuranceTierBasicPercentage'),
      color: 'gray',
      description: t('insuranceTierBasicDescription'),
      features: [
        t('insuranceTierBasicFeature0'),
        t('insuranceTierBasicFeature1'),
        t('insuranceTierBasicFeature2'),
        t('insuranceTierBasicFeature3'),
      ]
    },
    {
      tier: t('insuranceTierStandardName'),
      percentage: t('insuranceTierStandardPercentage'),
      color: 'indigo',
      description: t('insuranceTierStandardDescription'),
      features: [
        t('insuranceTierStandardFeature0'),
        t('insuranceTierStandardFeature1'),
        t('insuranceTierStandardFeature2'),
        t('insuranceTierStandardFeature3'),
      ],
      popular: true
    },
    {
      tier: t('insuranceTierPremiumName'),
      percentage: t('insuranceTierPremiumPercentage'),
      color: 'purple',
      description: t('insuranceTierPremiumDescription'),
      features: [
        t('insuranceTierPremiumFeature0'),
        t('insuranceTierPremiumFeature1'),
        t('insuranceTierPremiumFeature2'),
        t('insuranceTierPremiumFeature3'),
      ]
    }
  ]

  const carrierBenefits = [
    {
      title: t('carrierBenefitVerifiedMileageTitle'),
      description: t('carrierBenefitVerifiedMileageDescription'),
    },
    {
      title: t('carrierBenefitDigitalAuditTrailTitle'),
      description: t('carrierBenefitDigitalAuditTrailDescription'),
    },
    {
      title: t('carrierBenefitFraudDetectionTitle'),
      description: t('carrierBenefitFraudDetectionDescription'),
    },
    {
      title: t('carrierBenefitFasterClaimsTitle'),
      description: t('carrierBenefitFasterClaimsDescription'),
    }
  ]

  const fleetBenefits = [
    {
      icon: IoPersonOutline,
      title: t('fleetBenefitDedicatedAccountManagerTitle'),
      description: t('fleetBenefitDedicatedAccountManagerDescription'),
    },
    {
      icon: IoSettingsOutline,
      title: t('fleetBenefitBulkManagementToolsTitle'),
      description: t('fleetBenefitBulkManagementToolsDescription'),
    },
    {
      icon: IoStatsChartOutline,
      title: t('fleetBenefitAdvancedAnalyticsTitle'),
      description: t('fleetBenefitAdvancedAnalyticsDescription'),
    },
    {
      icon: IoTrendingUpOutline,
      title: t('fleetBenefitPreferredPlacementTitle'),
      description: t('fleetBenefitPreferredPlacementDescription'),
    },
    {
      icon: IoCashOutline,
      title: t('fleetBenefitVolumeDiscountsTitle'),
      description: t('fleetBenefitVolumeDiscountsDescription'),
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: t('fleetBenefitPremiumProtectionTitle'),
      description: t('fleetBenefitPremiumProtectionDescription'),
    }
  ]

  const fleetProgramTiers = [
    {
      name: t('fleetTierStarterName'),
      vehicles: t('fleetTierStarterVehicles'),
      features: [
        t('fleetTierStarterFeature0'),
        t('fleetTierStarterFeature1'),
        t('fleetTierStarterFeature2'),
        t('fleetTierStarterFeature3'),
      ],
      color: 'gray'
    },
    {
      name: t('fleetTierProfessionalName'),
      vehicles: t('fleetTierProfessionalVehicles'),
      features: [
        t('fleetTierProfessionalFeature0'),
        t('fleetTierProfessionalFeature1'),
        t('fleetTierProfessionalFeature2'),
        t('fleetTierProfessionalFeature3'),
        t('fleetTierProfessionalFeature4'),
      ],
      color: 'indigo',
      popular: true
    },
    {
      name: t('fleetTierEnterpriseName'),
      vehicles: t('fleetTierEnterpriseVehicles'),
      features: [
        t('fleetTierEnterpriseFeature0'),
        t('fleetTierEnterpriseFeature1'),
        t('fleetTierEnterpriseFeature2'),
        t('fleetTierEnterpriseFeature3'),
        t('fleetTierEnterpriseFeature4'),
        t('fleetTierEnterpriseFeature5'),
      ],
      color: 'purple'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 rounded-full text-indigo-200 text-xs font-medium mb-4">
              <IoRocketOutline className="w-4 h-4" />
              {t('heroBadge')}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-yellow-400">{t('heroTitleLine1')}</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {t('heroTitleLine2')}
              </span>
            </h1>
            <p className="text-xl text-indigo-100 mb-6">
              {t('heroDescription')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/host/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {t('heroApplyButton')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                {t('heroConsultationButton')}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <IoShieldCheckmarkOutline className="w-5 h-5" />
                <span>{t('trustBadgeInsurance')}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <IoLeafOutline className="w-5 h-5" />
                <span>{t('trustBadgeEsg')}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <IoSpeedometerOutline className="w-5 h-5" />
                <span>{t('trustBadgeMileageForensics')}</span>
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
              <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
                <IoHomeOutline className="w-3.5 h-3.5" />
                {t('breadcrumbHome')}
              </Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/list-your-car" className="hover:text-indigo-600">{t('breadcrumbHost')}</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              {t('breadcrumbFleetOwners')}
            </li>
          </ol>
        </nav>
      </div>

      {/* The 2025 Fleet Challenge */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('challengeSectionTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('challengeSectionDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((challenge, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  challenge.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  challenge.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  challenge.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <challenge.icon className={`w-6 h-6 ${
                    challenge.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    challenge.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    challenge.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Edge */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-4">
              <IoLayersOutline className="w-4 h-4" />
              {t('techEdgeBadge')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('techEdgeTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('techEdgeDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mileage Forensics */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-8 border border-indigo-100 dark:border-indigo-800 shadow-sm">
              <div className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <IoSpeedometerOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('mileageForensicsTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('mileageForensicsDescription')}
              </p>
              <ul className="space-y-2">
                {[
                  t('mileageForensicsItem0'),
                  t('mileageForensicsItem1'),
                  t('mileageForensicsItem2'),
                  t('mileageForensicsItem3'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Declarations */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-8 border border-green-100 dark:border-green-800 shadow-sm">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <IoDocumentTextOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('usageDeclarationsTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('usageDeclarationsDescription')}
              </p>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">{t('usageDeclRentalOnlyLabel')}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{t('usageDeclRentalOnlyBadge')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('usageDeclRentalOnlyNote')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">{t('usageDeclRentalPersonalLabel')}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">{t('usageDeclRentalPersonalBadge')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('usageDeclRentalPersonalNote')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">{t('usageDeclCommercialLabel')}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{t('usageDeclCommercialBadge')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('usageDeclCommercialNote')}</p>
                </div>
              </div>
            </div>

            {/* ESG Dashboard */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-8 border border-emerald-100 dark:border-emerald-800 shadow-sm">
              <div className="w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center mb-6">
                <IoLeafOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('esgDashboardTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('esgDashboardDescription')}
              </p>
              <ul className="space-y-2">
                {[
                  t('esgDashboardItem0'),
                  t('esgDashboardItem1'),
                  t('esgDashboardItem2'),
                  t('esgDashboardItem3'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/esg-dashboard"
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-4"
              >
                {t('esgDashboardLearnMore')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>

            {/* Insurance Intelligence */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8 border border-purple-100 dark:border-purple-800 shadow-sm">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <IoShieldCheckmarkOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('insuranceIntelligenceTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('insuranceIntelligenceDescription')}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{t('insuranceIntelligenceClaimValue')}</div>
                  <div className="text-xs text-gray-500">{t('insuranceIntelligenceClaimLabel')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{t('insuranceIntelligenceIndustryValue')}</div>
                  <div className="text-xs text-gray-500">{t('insuranceIntelligenceIndustryLabel')}</div>
                </div>
              </div>
              <Link
                href="/mileage-forensics"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-4"
              >
                {t('insuranceIntelligenceExploreLink')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Tiers */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('insuranceTierSectionTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('insuranceTierSectionDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {insuranceTiers.map((tier, i) => (
              <div
                key={i}
                className={`relative bg-white dark:bg-gray-800 rounded-lg p-6 border-2 shadow-sm hover:shadow-md transition-shadow ${
                  tier.popular
                    ? 'border-indigo-500 dark:border-indigo-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                    {t('mostPopularBadge')}
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {tier.tier} {t('tierSuffix')}
                  </h3>
                  <div className="text-4xl font-bold text-indigo-600 mb-1">{tier.percentage}</div>
                  <div className="text-sm text-gray-500">{t('revenueShareLabel')}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tier.description}</p>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Insurance Partners */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-indigo-200 text-xs font-medium mb-4">
                <IoBriefcaseOutline className="w-4 h-4" />
                {t('carrierSectionBadge')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                {t('carrierSectionTitle')}
              </h2>
              <p className="text-indigo-100 mb-6">
                {t('carrierSectionDescription')}
              </p>
              <div className="space-y-4">
                {carrierBenefits.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IoCheckmarkDoneOutline className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-indigo-200">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors mt-8"
              >
                {t('carrierPartnerButton')}
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-lg p-8 border border-white/10">
              <h3 className="text-lg font-semibold mb-6">{t('metricsTitle')}</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-indigo-200">{t('metricsClaimResolutionLabel')}</span>
                    <span className="font-medium">{t('metricsClaimResolutionValue')}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[23%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  </div>
                  <div className="text-xs text-indigo-300 mt-1">{t('metricsClaimResolutionNote')}</div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-indigo-200">{t('metricsDataVerificationLabel')}</span>
                    <span className="font-medium">{t('metricsDataVerificationValue')}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                  </div>
                  <div className="text-xs text-indigo-300 mt-1">{t('metricsDataVerificationNote')}</div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-indigo-200">{t('metricsFraudDetectionLabel')}</span>
                    <span className="font-medium">{t('metricsFraudDetectionValue')}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                  </div>
                  <div className="text-xs text-indigo-300 mt-1">{t('metricsFraudDetectionNote')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('fleetBenefitsSectionTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {fleetBenefits.map((benefit, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Tiers */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('fleetProgramTiersSectionTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {fleetProgramTiers.map((tier, i) => (
              <div
                key={i}
                className={`relative rounded-lg p-6 border-2 shadow-sm hover:shadow-md transition-shadow ${
                  tier.popular
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                    {t('mostPopularBadge')}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{tier.name}</h3>
                <div className="text-3xl font-bold text-indigo-600 mb-4">{tier.vehicles} <span className="text-base font-normal text-gray-500">{t('vehiclesSuffix')}</span></div>
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('requirementsSectionTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <IoCheckmarkDoneOutline className="w-5 h-5 text-indigo-600" />
                {t('requirementsToQualifyTitle')}
              </h3>
              <ul className="space-y-4">
                {[
                  t('requirementToQualify0'),
                  t('requirementToQualify1'),
                  t('requirementToQualify2'),
                  t('requirementToQualify3'),
                  t('requirementToQualify4'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <IoRocketOutline className="w-5 h-5 text-indigo-600" />
                {t('requirementsWeProvideTitle')}
              </h3>
              <ul className="space-y-4">
                {[
                  t('requirementWeProvide0'),
                  t('requirementWeProvide1'),
                  t('requirementWeProvide2'),
                  t('requirementWeProvide3'),
                  t('requirementWeProvide4'),
                  t('requirementWeProvide5'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-indigo-100 mb-8">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/host/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {t('ctaApplyButton')}
              <IoChevronForwardOutline className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {t('ctaConsultationButton')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
