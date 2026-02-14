// app/investors/InvestorsContent.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import InvestorInquiryBottomSheet from '@/app/components/InvestorInquiryBottomSheet'
import {
  IoRocketOutline,
  IoTrendingUpOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoLockClosedOutline,
  IoDocumentTextOutline,
  IoBarChartOutline,
  IoCarOutline,
  IoLeafOutline,
  IoInformationCircleOutline,
  IoCashOutline,
  IoAnalyticsOutline
} from 'react-icons/io5'

export default function InvestorsContent() {
  const t = useTranslations('Investors')
  const [showContactForm, setShowContactForm] = useState(false)

  const metrics = [
    { labelKey: 'metricVehiclesListed' as const, value: '100+', growthKey: 'metricGrowingWeekly' as const },
    { labelKey: 'metricArizonaCities' as const, value: '18', growthKey: 'metricStatewideCoverage' as const },
    { labelKey: 'metricHostEarnings' as const, value: '40-90%', growthKey: 'metricIndustryLeading' as const },
    { labelKey: 'metricInsuranceCoverage' as const, value: '$1M', growthKey: 'metricPerTrip' as const }
  ]

  const timeline = [
    { year: '2023', eventKey: 'timelineFirstRide' as const, highlight: true },
    { year: 'Sep 2024', eventKey: 'timelineInsuranceTier' as const, highlight: false },
    { year: 'Oct 2024', eventKey: 'timelineStatewide' as const, highlight: true },
    { year: 'Dec 2024', eventKey: 'timelineMileageForensics' as const, highlight: true },
    { year: 'Q2 2025', eventKey: 'timelineNativeApps' as const, highlight: true },
    { year: '2025', eventKey: 'timelineSeriesA' as const, highlight: true }
  ]

  const fundAllocation = [
    { categoryKey: 'fundSouthwestExpansion' as const, percentage: 35, descKey: 'fundSouthwestExpansionDesc' as const },
    { categoryKey: 'fundTechnologyPlatform' as const, percentage: 25, descKey: 'fundTechnologyPlatformDesc' as const },
    { categoryKey: 'fundHostAcquisition' as const, percentage: 20, descKey: 'fundHostAcquisitionDesc' as const },
    { categoryKey: 'fundMarketingGrowth' as const, percentage: 15, descKey: 'fundMarketingGrowthDesc' as const },
    { categoryKey: 'fundWorkingCapital' as const, percentage: 5, descKey: 'fundWorkingCapitalDesc' as const }
  ]

  const advantages = [
    {
      icon: IoCarOutline,
      titleKey: 'advantageArizonaFirst' as const,
      descKey: 'advantageArizonaFirstDesc' as const
    },
    {
      icon: IoTrendingUpOutline,
      titleKey: 'advantageHostPayouts' as const,
      descKey: 'advantageHostPayoutsDesc' as const
    },
    {
      icon: IoShieldCheckmarkOutline,
      titleKey: 'advantageMileageForensics' as const,
      descKey: 'advantageMileageForensicsDesc' as const
    },
    {
      icon: IoLeafOutline,
      titleKey: 'advantageEsgFleet' as const,
      descKey: 'advantageEsgFleetDesc' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-14 md:mt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-14 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-6">
                <IoCarOutline className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  {t('heroBadge')}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {t('heroTitle')}
                <span className="block text-amber-600 mt-2">{t('heroTarget')}</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                {t('heroDescriptionPrefix')}
                <span className="font-semibold text-gray-900 dark:text-white">{t('heroMarketSize')}</span>
                {t('heroDescriptionMiddle')}
                <span className="font-semibold text-amber-600">{t('heroHostPayouts')}</span>{t('heroDescriptionSuffix')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition shadow-lg"
                >
                  {t('requestInvestorDeck')}
                </button>
                <a
                  href="#metrics"
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600"
                >
                  {t('viewMetrics')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section id="metrics" className="pb-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('provenTraction')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('provenTractionDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">{metric.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t(metric.labelKey)}</div>
                  <div className="text-xs text-green-600 font-semibold">{t(metric.growthKey)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <IoCarOutline className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('vehicleTypes')}</h3>
                  <p className="text-xl font-bold text-amber-600">{t('economyToExotic')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('fullFleetDiversity')}</p>
                </div>
                <div>
                  <IoTrendingUpOutline className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('hostEconomics')}</h3>
                  <p className="text-xl font-bold text-green-600">40-90%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('payoutsBasedOnTier')}</p>
                </div>
                <div>
                  <IoCashOutline className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('avgHostEarnings')}</h3>
                  <p className="text-xl font-bold text-purple-600">$850/mo</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('supplementalIncome')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="pb-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('marketOpportunity')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('marketOpportunityDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 text-center">
                <IoGlobeOutline className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('totalAddressableMarket')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$35B</p>
                <p className="text-xs text-gray-500">{t('usCarRentalIndustry')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 text-center">
                <IoBusinessOutline className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('serviceableMarket')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$5B</p>
                <p className="text-xs text-gray-500">{t('p2pCarSharing')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 text-center">
                <IoRocketOutline className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('obtainableMarket')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$500M</p>
                <p className="text-xs text-gray-500">{t('southwestTarget')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Growth Timeline */}
        <section className="pb-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('rapidExecution')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('rapidExecutionDesc')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="relative pl-8 border-l-2 border-amber-200 dark:border-amber-800">
                {timeline.map((item, idx) => (
                  <div key={idx} className={`relative ${idx < timeline.length - 1 ? 'pb-8' : ''}`}>
                    {/* Timeline dot */}
                    <div className={`absolute -left-[25px] w-4 h-4 rounded-full ${
                      item.highlight
                        ? 'bg-amber-600 ring-4 ring-amber-100 dark:ring-amber-900/50'
                        : 'bg-gray-400 dark:bg-gray-600'
                    }`}></div>

                    {/* Content */}
                    <div className="ml-4">
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        item.highlight
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {item.year}
                      </span>
                      <div className={`mt-1 ${
                        item.highlight
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500'
                          : 'bg-gray-50 dark:bg-gray-800'
                      } rounded-r-lg p-3`}>
                        <p className={`text-sm ${
                          item.highlight
                            ? 'font-medium text-amber-900 dark:text-amber-200'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {t(item.eventKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="pb-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('defensibleMoats')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('defensibleMoatsDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {advantages.map((advantage, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <advantage.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {t(advantage.titleKey)}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t(advantage.descKey)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center">
                {t('esgCommitment')}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <IoLeafOutline className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('electricFleet')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('byEndOf2025')}</p>
                </div>
                <div>
                  <IoGlobeOutline className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('carbonNeutral')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('offsetProgramActive')}</p>
                </div>
                <div>
                  <IoBusinessOutline className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('localEmployment')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('localDrivers')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use of Funds */}
        <section className="pb-8 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('strategicUseOfCapital')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('strategicUseOfCapitalDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                {fundAllocation.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t(item.categoryKey)}
                      </h3>
                      <span className="text-sm font-bold text-blue-600">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t(item.descKey)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t('investmentHighlights')}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {t('provenUnitEconomics')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('provenUnitEconomicsDesc')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {t('scalableTechnology')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('scalableTechnologyDesc')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {t('clearPathTo10x')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('clearPathTo10xDesc')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {t('exitStrategy')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('exitStrategyDesc')}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Investor Resources */}
        <section className="pb-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('investorResources')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('investorResourcesDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <IoDocumentTextOutline className="w-8 h-8 text-blue-600" />
                  <IoLockClosedOutline className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('investorDeck')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('investorDeckDesc')}
                </p>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('requestAccess')}
                </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <IoBarChartOutline className="w-8 h-8 text-green-600" />
                  <IoLockClosedOutline className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('financialModel')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('financialModelDesc')}
                </p>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('requestAccess')}
                </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <IoAnalyticsOutline className="w-8 h-8 text-purple-600" />
                  <IoLockClosedOutline className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('dataRoom')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('dataRoomDesc')}
                </p>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('requestAccess')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Terms */}
        <section className="pb-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {t('seriesATerms')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h3 className="font-semibold mb-4">{t('investmentDetails')}</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('targetRaise')}</span>
                      <span className="font-semibold">$5M</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('preMoneyValuation')}</span>
                      <span className="font-semibold">$20M</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('minimumInvestment')}</span>
                      <span className="font-semibold">$250K</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('type')}</span>
                      <span className="font-semibold">{t('preferredEquity')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h3 className="font-semibold mb-4">{t('keyMetrics')}</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('revenueMultiple')}</span>
                      <span className="font-semibold">9.5x</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('growthRate')}</span>
                      <span className="font-semibold">156% YoY</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('burnMultiple')}</span>
                      <span className="font-semibold">{t('negativeProfitable')}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">{t('cacPayback')}</span>
                      <span className="font-semibold">{t('fourMonths')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  {t('scheduleMeeting')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('importantInformation')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('disclaimer')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>

      {/* Investor Inquiry Bottomsheet */}
      <InvestorInquiryBottomSheet
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />
    </div>
  )
}