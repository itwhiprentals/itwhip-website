// app/switch-from-turo/page.tsx

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoSwapHorizontalOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoFlashOutline,
  IoCarOutline,
  IoCalculatorOutline,
  IoTrendingUpOutline,
  IoGlobeOutline,
  IoSpeedometerOutline,
  IoLeafOutline,
  IoRibbonOutline,
  IoStarOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoLayersOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function SwitchFromTuroPage() {
  const t = useTranslations('SwitchFromTuro')
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [monthlyRevenue, setMonthlyRevenue] = useState(2000)

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Insurance tiers
  const insuranceTiers = [
    { id: 'basic', nameKey: 'tierPlatformCoverage' as const, percentage: 40, color: 'gray' },
    { id: 'standard', nameKey: 'tierP2pCoverage' as const, percentage: 75, color: 'amber', popular: true },
    { id: 'premium', nameKey: 'tierCommercialCoverage' as const, percentage: 90, color: 'emerald' }
  ]

  const currentTier = insuranceTiers.find(t => t.id === selectedTier) || insuranceTiers[1]

  // Calculate savings
  const calculateSavings = () => {
    const turoPercentage = 0.65 // Turo hosts typically keep ~65%
    const itwhipPercentage = currentTier.percentage / 100

    const turoEarnings = monthlyRevenue * turoPercentage
    const itwhipEarnings = monthlyRevenue * itwhipPercentage
    const monthlySavings = itwhipEarnings - turoEarnings
    const annualSavings = monthlySavings * 12

    return {
      turoEarnings: Math.round(turoEarnings),
      itwhipEarnings: Math.round(itwhipEarnings),
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings)
    }
  }

  const savings = calculateSavings()

  // Comparison data
  const comparisonFeatures = [
    {
      featureKey: 'compFeatureHostEarnings',
      itwhipKey: 'compItwhipHostEarnings',
      turoKey: 'compTuroHostEarnings',
      itwhipWins: true,
      noteKey: 'compNoteHostEarnings'
    },
    {
      featureKey: 'compFeatureLiability',
      itwhipKey: 'compItwhipLiability',
      turoKey: 'compTuroLiability',
      itwhipWins: true,
      noteKey: 'compNoteLiability'
    },
    {
      featureKey: 'compFeaturePaymentSpeed',
      itwhipKey: 'compItwhipPaymentSpeed',
      turoKey: 'compTuroPaymentSpeed',
      itwhipWins: true,
      noteKey: 'compNotePaymentSpeed'
    },
    {
      featureKey: 'compFeatureDeductible',
      itwhipKey: 'compItwhipDeductible',
      turoKey: 'compTuroDeductible',
      itwhipWins: false,
      noteKey: 'compNoteDeductible'
    },
    {
      featureKey: 'compFeatureMileage',
      itwhipKey: 'compItwhipMileage',
      turoKey: 'compTuroMileage',
      itwhipWins: true,
      noteKey: 'compNoteMileage'
    },
    {
      featureKey: 'compFeatureEsg',
      itwhipKey: 'compItwhipEsg',
      turoKey: 'compTuroEsg',
      itwhipWins: true,
      noteKey: 'compNoteEsg'
    },
    {
      featureKey: 'compFeatureArizonaCompliant',
      itwhipKey: 'compItwhipArizonaCompliant',
      turoKey: 'compTuroArizonaCompliant',
      itwhipWins: null,
      noteKey: 'compNoteArizonaCompliant'
    },
    {
      featureKey: 'compFeatureFleetTools',
      itwhipKey: 'compItwhipFleetTools',
      turoKey: 'compTuroFleetTools',
      itwhipWins: null,
      noteKey: 'compNoteFleetTools'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoSwapHorizontalOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded-lg">
                {t('saveBadge')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host-earnings" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('earningsCalculatorLink')}
              </Link>
              <Link
                href="/list-your-car"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                {t('startEarningCta')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px]">

        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6">
                <IoSparklesOutline className="w-5 h-5 text-white" />
                <span className="text-sm text-white font-medium">
                  {t('heroBadge')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {t('heroTitleLine1')}
                <span className="block text-green-600 mt-2">{t('heroTitleLine2')}</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Phoenix • Scottsdale • Tempe • Mesa • Chandler
              </p>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                {t('heroDescription')}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">+25%</div>
                  <div className="text-xs text-gray-500">{t('statMoreEarnings')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">$1M</div>
                  <div className="text-xs text-gray-500">{t('statLiabilityCoverage')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">48hr</div>
                  <div className="text-xs text-gray-500">{t('statFasterPayments')}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/list-your-car"
                  className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
                >
                  {t('switchNowKeepMore')}
                </Link>
                <a
                  href="#calculator"
                  className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-green-600 rounded-lg font-bold hover:bg-green-50 transition border-2 border-green-600"
                >
                  {t('calculateMySavings')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('comparisonTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('comparisonSubtitle')}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('tableHeaderFeature')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                      ItWhip
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      Turo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className={item.itwhipWins ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(item.featureKey)}
                        </div>
                        <div className="text-xs text-gray-500">{t(item.noteKey)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-semibold ${item.itwhipWins ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                          {t(item.itwhipKey)}
                        </span>
                        {item.itwhipWins && (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 inline ml-1" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-500">
                          {t(item.turoKey)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              {t('comparisonDisclaimer')}
            </p>
          </div>
        </section>

        {/* Savings Calculator */}
        <section id="calculator" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('calculatorTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('calculatorSubtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 sm:p-8">
              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Monthly Revenue */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    {t('monthlyRevenueLabel')}
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="100"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(parseInt(e.target.value))}
                    className="w-full mb-2"
                  />
                  <div className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                    ${monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-center text-xs text-gray-500">{t('perMonthGrossRevenue')}</div>
                </div>

                {/* Tier Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    {t('insuranceTierLabel')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {insuranceTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                        className={`relative p-3 rounded-lg text-center transition ${
                          selectedTier === tier.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {tier.popular && selectedTier !== tier.id && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            {t('popular')}
                          </div>
                        )}
                        <div className="font-bold">{tier.percentage}%</div>
                        <div className="text-xs opacity-80">{tier.id === 'basic' ? t('tierPlatformLabel') : tier.id === 'standard' ? t('tierP2pLabel') : t('tierCommercialLabel')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Turo */}
                  <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {t('onTuroLabel')}
                    </h3>
                    <div className="text-3xl font-bold text-gray-600">
                      ${savings.turoEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{t('monthlyEarnings')}</div>
                  </div>

                  {/* ItWhip */}
                  <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
                    <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">
                      {t('onItwhipLabel', { percentage: currentTier.percentage })}
                    </h3>
                    <div className="text-3xl font-bold text-green-600">
                      ${savings.itwhipEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">{t('monthlyEarnings')}</div>
                  </div>
                </div>

                {/* Savings Highlight */}
                {savings.monthlySavings > 0 && (
                  <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white text-center">
                    <div className="text-sm font-medium mb-2">{t('annualSavingsLabel')}</div>
                    <div className="text-4xl font-bold mb-2">
                      +${savings.annualSavings.toLocaleString()}/{t('year')}
                    </div>
                    <div className="text-sm opacity-90">
                      {t('moreEveryMonth', { amount: `$${savings.monthlySavings.toLocaleString()}` })}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <Link
                  href="/list-your-car"
                  className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
                >
                  {t('startEarningMoreToday')}
                </Link>
                <p className="text-xs text-gray-500 mt-3">
                  {t('freeToListShort')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Hosts Switch */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('whySwitchTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('whySwitchSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Benefit 1 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4">
                  <IoCashOutline className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('benefitHigherEarningsTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('benefitHigherEarningsDesc')}
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
                  <IoFlashOutline className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('benefitFasterPaymentsTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('benefitFasterPaymentsDesc')}
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
                  <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('benefitCoverageTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('benefitCoverageDesc')}
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-fit mb-4">
                  <IoSpeedometerOutline className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('benefitMileageTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('benefitMileageDesc')}
                </p>
              </div>

              {/* Benefit 5 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit mb-4">
                  <IoLeafOutline className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('benefitEsgTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('benefitEsgDesc')}
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                  <IoLayersOutline className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('benefitChooseTierTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('benefitChooseTierDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Arizona Compliance */}
        <section className="py-8 bg-amber-50 dark:bg-amber-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <IoGlobeOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">
                  {t('arizonaComplianceTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('arizonaComplianceDesc')}
                </p>
                <Link href="/legal" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-medium mt-2">
                  {t('viewArizonaLawLink')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How to Switch */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('stepsTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('stepsSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step1Title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('step1Desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step2Title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('step2Desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step3Title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('step3Desc')}
                </p>
              </div>
            </div>

            {/* Earnings Match Offer */}
            <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white text-center">
              <IoRibbonOutline className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">{t('earningsMatchTitle')}</h3>
              <p className="text-sm opacity-90 mb-4">
                {t('earningsMatchDesc')}
              </p>
              <Link
                href="/list-your-car"
                className="inline-block px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                {t('claimYourMatch')}
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('finalCtaTitle')}
            </h2>
            <p className="text-lg text-green-100 mb-8">
              {t('finalCtaSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/list-your-car"
                className="w-full sm:w-auto px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition shadow-lg"
              >
                {t('switchNowCta')}
              </Link>
              <Link
                href="/host-earnings"
                className="w-full sm:w-auto px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-400 transition"
              >
                {t('earningsCalculatorLink')}
              </Link>
            </div>

            <p className="text-xs text-green-200 mt-6">
              {t('freeToListFull')}
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
