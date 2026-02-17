'use client'
// app/host/payouts/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCashOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCalendarOutline,
  IoCalculatorOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoTrendingUpOutline,
  IoDocumentTextOutline,
  IoPhonePortraitOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoCheckmarkDoneOutline,
  IoInformationCircleOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'
import { BsBank2 } from 'react-icons/bs'
import { SiStripe } from 'react-icons/si'


export default function PayoutsPage() {
  const t = useTranslations('HostPayouts')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 rounded-full text-emerald-200 text-xs font-medium mb-4">
              <IoCashOutline className="w-4 h-4" />
              {t('heroBadge')}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-yellow-400">{t('heroTitleLine1')}</span>{' '}
              <span className="text-white">{t('heroTitleLine2')}</span>
            </h1>
            <p className="text-xl text-emerald-100 mb-6">
              {t('heroDescription')}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                <SiStripe className="w-12 h-5 text-white" />
                <span className="text-sm font-medium">{t('poweredByStripe')}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200 text-sm">
                <IoShieldCheckmarkOutline className="w-5 h-5" />
                {t('bankLevelSecurity')}
              </div>
              <div className="flex items-center gap-2 text-emerald-200 text-sm">
                <IoFlashOutline className="w-5 h-5" />
                {t('instantPayoutsAvailable')}
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
              <Link href="/" className="hover:text-emerald-600 flex items-center gap-1">
                <IoHomeOutline className="w-3.5 h-3.5" />
                {t('breadcrumbHome')}
              </Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/list-your-car" className="hover:text-emerald-600">{t('breadcrumbHost')}</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              {t('breadcrumbPayouts')}
            </li>
          </ol>
        </nav>
      </div>

      {/* Stripe Connect Onboarding Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('setupTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('setupDescription')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Onboarding Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center">
                  <SiStripe className="w-7 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('onboardingTitle')}</h3>
                  <p className="text-sm text-gray-500">{t('onboardingSubtitle')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <IoPersonOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('step1Title')}</h4>
                      <span className="text-xs text-emerald-600 font-medium">{t('step1Time')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('step1Description')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <IoBusinessOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('step2Title')}</h4>
                      <span className="text-xs text-emerald-600 font-medium">{t('step2Time')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('step2Description')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <BsBank2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('step3Title')}</h4>
                      <span className="text-xs text-emerald-600 font-medium">{t('step3Time')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('step3Description')}</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                      <IoCheckmarkDoneOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('step4Title')}</h4>
                      <span className="text-xs text-emerald-600 font-medium">{t('step4Time')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('step4Description')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/host/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#635BFF] text-white font-semibold rounded-lg hover:bg-[#5851e0] transition-colors"
                >
                  <SiStripe className="w-10 h-4" />
                  {t('completeStripeSetup')}
                  <IoChevronForwardOutline className="w-5 h-5" />
                </Link>
                <p className="text-xs text-gray-500 text-center mt-3">
                  {t('stripeRedirectNote')}
                </p>
              </div>
            </div>

            {/* Why Stripe */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#635BFF]/10 to-purple-100/50 dark:from-[#635BFF]/20 dark:to-purple-900/20 rounded-lg p-6 border border-[#635BFF]/20">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-[#635BFF]" />
                  {t('whyStripeTitle')}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-[#635BFF] flex-shrink-0 mt-0.5" />
                    {t('whyStripe1')}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-[#635BFF] flex-shrink-0 mt-0.5" />
                    {t('whyStripe2')}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-[#635BFF] flex-shrink-0 mt-0.5" />
                    {t('whyStripe3')}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-[#635BFF] flex-shrink-0 mt-0.5" />
                    {t('whyStripe4')}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-[#635BFF] flex-shrink-0 mt-0.5" />
                    {t('whyStripe5')}
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600 shadow-md">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoInformationCircleOutline className="w-5 h-5 text-emerald-600" />
                  {t('whatYouNeedTitle')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t('needItem1Label')}</p>
                    <p className="text-xs text-gray-500">{t('needItem1Desc')}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t('needItem2Label')}</p>
                    <p className="text-xs text-gray-500">{t('needItem2Desc')}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t('needItem3Label')}</p>
                    <p className="text-xs text-gray-500">{t('needItem3Desc')}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t('needItem4Label')}</p>
                    <p className="text-xs text-gray-500">{t('needItem4Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Timeline */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('timelineTitle')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Step 1: Trip Ends */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('timelineStep1Title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{t('timelineStep1Desc')}</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    {t('timelineStep1Badge')}
                  </span>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <IoChevronForwardOutline className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoSpeedometerOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('timelineStep2Title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{t('timelineStep2Desc')}</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    {t('timelineStep2Badge')}
                  </span>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <IoChevronForwardOutline className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Step 3: Payout Sent */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoCashOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('timelineStep3Title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{t('timelineStep3Desc')}</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    {t('timelineStep3Badge')}
                  </span>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <IoChevronForwardOutline className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Step 4: In Your Bank */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BsBank2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('timelineStep4Title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{t('timelineStep4Desc')}</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    {t('timelineStep4Badge')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <IoFlashOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('instantPayoutBannerTitle')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('instantPayoutBannerDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Breakdown */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('earningsTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('earningsDescription')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Basic Protection Plan */}
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg p-6 border-2 shadow-md hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('planBasicName')}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-emerald-600">{t('planBasicEarnings')}</span>
                  <span className="text-gray-500 text-sm ml-1">{t('earningsLabel')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('planBasicFee')}</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planBasicFeature1')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planBasicFeature2')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planBasicFeature3')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planBasicFeature4')}
                </li>
              </ul>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  {t('bestForLabel')} <span className="font-medium text-gray-700 dark:text-gray-300">{t('planBasicBestFor')}</span>
                </p>
              </div>
            </div>

            {/* Standard Protection Plan */}
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg p-6 border-2 shadow-md hover:shadow-lg transition-shadow border-emerald-500 dark:border-emerald-400"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                {t('mostPopular')}
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('planStandardName')}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-emerald-600">{t('planStandardEarnings')}</span>
                  <span className="text-gray-500 text-sm ml-1">{t('earningsLabel')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('planStandardFee')}</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planStandardFeature1')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planStandardFeature2')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planStandardFeature3')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planStandardFeature4')}
                </li>
              </ul>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  {t('bestForLabel')} <span className="font-medium text-gray-700 dark:text-gray-300">{t('planStandardBestFor')}</span>
                </p>
              </div>
            </div>

            {/* Premium Protection Plan */}
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg p-6 border-2 shadow-md hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('planPremiumName')}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-emerald-600">{t('planPremiumEarnings')}</span>
                  <span className="text-gray-500 text-sm ml-1">{t('earningsLabel')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('planPremiumFee')}</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planPremiumFeature1')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planPremiumFeature2')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planPremiumFeature3')}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('planPremiumFeature4')}
                </li>
              </ul>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  {t('bestForLabel')} <span className="font-medium text-gray-700 dark:text-gray-300">{t('planPremiumBestFor')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 sm:p-8 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <IoCalculatorOutline className="w-5 h-5" />
              {t('exampleCalcTitle')}
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <p className="text-white text-sm font-medium">{t('calcTripPriceLabel')}</p>
                <p className="text-2xl font-bold">{t('calcTripPriceValue')}</p>
                <p className="text-xs text-white/80">{t('calcTripPriceNote')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <p className="text-white text-sm font-medium">{t('calcEarningsLabel')}</p>
                <p className="text-2xl font-bold">{t('calcEarningsValue')}</p>
                <p className="text-xs text-white/80">{t('calcEarningsNote')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <p className="text-white text-sm font-medium">{t('calcFeeLabel')}</p>
                <p className="text-2xl font-bold">{t('calcFeeValue')}</p>
                <p className="text-xs text-white/80">{t('calcFeeNote')}</p>
              </div>
              <div className="bg-white/30 rounded-lg p-4 border border-white/40">
                <p className="text-white text-sm font-medium">{t('calcDepositLabel')}</p>
                <p className="text-2xl font-bold text-yellow-300">{t('calcDepositValue')}</p>
                <p className="text-xs text-white/80">{t('calcDepositNote')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Methods */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('payoutMethodsTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-emerald-500 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <BsBank2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('bankTransferTitle')}</h3>
                  <span className="text-xs text-emerald-600 font-medium">{t('bankTransferBadge')}</span>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />
                  {t('bankTransferFeature1')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />
                  {t('bankTransferFeature2')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />
                  {t('bankTransferFeature3')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />
                  {t('bankTransferFeature4')}
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <IoFlashOutline className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('instantPayoutTitle')}</h3>
                  <span className="text-xs text-yellow-600 font-medium">{t('instantPayoutBadge')}</span>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-yellow-500" />
                  {t('instantPayoutFeature1')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-yellow-500" />
                  {t('instantPayoutFeature2')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-yellow-500" />
                  {t('instantPayoutFeature3')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-yellow-500" />
                  {t('instantPayoutFeature4')}
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <IoCalendarOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('scheduledPayoutTitle')}</h3>
                  <span className="text-xs text-purple-600 font-medium">{t('scheduledPayoutBadge')}</span>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500" />
                  {t('scheduledPayoutFeature1')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500" />
                  {t('scheduledPayoutFeature2')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500" />
                  {t('scheduledPayoutFeature3')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500" />
                  {t('scheduledPayoutFeature4')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Dashboard Preview */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('dashboardTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('dashboardDescription')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md overflow-hidden">
            {/* Mock Dashboard Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                <div>
                  <p className="text-emerald-200 text-sm">{t('dashboardAvailableBalance')}</p>
                  <p className="text-2xl font-bold">{t('dashboardAvailableBalanceValue')}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">{t('dashboardPending')}</p>
                  <p className="text-2xl font-bold">{t('dashboardPendingValue')}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">{t('dashboardThisMonth')}</p>
                  <p className="text-2xl font-bold">{t('dashboardThisMonthValue')}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">{t('dashboardAllTime')}</p>
                  <p className="text-2xl font-bold">{t('dashboardAllTimeValue')}</p>
                </div>
              </div>
            </div>

            {/* Mock Transaction List */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('recentTransactions')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                      <BsBank2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t('tx1Type')}</p>
                      <p className="text-xs text-gray-500">{t('tx1Desc')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{t('tx1Amount')}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      {t('tx1Date')}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                      <IoCashOutline className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t('tx2Type')}</p>
                      <p className="text-xs text-gray-500">{t('tx2Desc')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{t('tx2Amount')}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      {t('tx2Date')}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                      <IoCashOutline className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t('tx3Type')}</p>
                      <p className="text-xs text-gray-500">{t('tx3Desc')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{t('tx3Amount')}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      {t('tx3Date')}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                      <BsBank2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t('tx4Type')}</p>
                      <p className="text-xs text-gray-500">{t('tx4Desc')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{t('tx4Amount')}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      {t('tx4Date')}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Reporting */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('taxTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('taxDescription')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('taxFeature1')}
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('taxFeature2')}
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('taxFeature3')}
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t('taxFeature4')}
                </li>
              </ul>
              <Link
                href="/host/tax-benefits"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mt-6"
              >
                {t('taxDeductionsLink')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <IoDocumentTextOutline className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('taxDocumentsTitle')}</h3>
                  <p className="text-sm text-gray-500">{t('taxDocumentsAvailable')}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('taxDoc1099K')}</span>
                  <span className="text-xs text-gray-500">{t('taxDocPending')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('taxDocAnnualSummary')}</span>
                  <span className="text-xs text-emerald-600 font-medium">{t('taxDocDownload')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('taxDocTransactionHistory')}</span>
                  <span className="text-xs text-emerald-600 font-medium">{t('taxDocDownload')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('faqTitle')}
          </h2>
          <div className="space-y-4">
            <details className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-gray-900 dark:text-white">{t('faq1Question')}</span>
                <IoChevronForwardOutline className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('faq1Answer')}</p>
              </div>
            </details>

            <details className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-gray-900 dark:text-white">{t('faq2Question')}</span>
                <IoChevronForwardOutline className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('faq2Answer')}</p>
              </div>
            </details>

            <details className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-gray-900 dark:text-white">{t('faq3Question')}</span>
                <IoChevronForwardOutline className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('faq3Answer')}</p>
              </div>
            </details>

            <details className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-gray-900 dark:text-white">{t('faq4Question')}</span>
                <IoChevronForwardOutline className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('faq4Answer')}</p>
              </div>
            </details>

            <details className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-gray-900 dark:text-white">{t('faq5Question')}</span>
                <IoChevronForwardOutline className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('faq5Answer')}</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-emerald-100 mb-8">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/list-your-car"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {t('ctaListYourCar')}
              <IoChevronForwardOutline className="w-5 h-5" />
            </Link>
            <Link
              href="/host/insurance-options"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500/30 text-white font-semibold rounded-lg hover:bg-emerald-500/40 transition-colors"
            >
              {t('ctaCompareProtection')}
            </Link>
          </div>
          <p className="text-center text-sm text-emerald-200 mt-4">
            {t('ctaEstimatePrompt')}{' '}
            <Link href="/host-earnings" className="text-white hover:text-emerald-100 font-medium underline">
              {t('ctaCalculatorLink')}
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
