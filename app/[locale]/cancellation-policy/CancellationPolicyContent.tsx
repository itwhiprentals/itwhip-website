// app/cancellation-policy/CancellationPolicyContent.tsx
'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoCallOutline,
  IoMailOutline,
  IoArrowForwardOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

// Structured data for the cancellation policy page (stays in English for SEO)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cancellation & Refund Policy',
  description: 'ItWhip cancellation and refund policy for peer-to-peer car rentals in Phoenix, Arizona.',
  publisher: {
    '@type': 'Organization',
    name: 'ItWhip Technologies, Inc.',
    url: 'https://itwhip.com'
  },
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is ItWhip\'s cancellation policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ItWhip offers a day-based cancellation policy: Cancel 24+ hours before pickup for a full refund. Late cancellations (under 24 hours) incur a penalty of 1 day\'s average cost for trips 3+ days, or half a day for shorter trips. Security deposits are always released in full.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long do refunds take to process?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Refunds typically process within 5-10 business days for credit/debit cards, 3-5 days for PayPal and digital wallets, or instantly when applied as ItWhip credit.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I modify my booking instead of canceling?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Many hosts prefer modifications to cancellations. Contact your host to request date changes, which may avoid cancellation penalties while only paying any price difference.'
        }
      }
    ]
  }
}

export default function CancellationPolicyContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations('CancellationPolicy')

  const handleGetAppClick = () => {
    console.log('Get app clicked')
  }

  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                <IoCalendarOutline className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {t('heroTitle')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('heroSubtitle')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                {t('lastUpdated')}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
              <h2 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-300 mb-4 flex items-center">
                <IoTimeOutline className="w-5 h-5 mr-2" />
                {t('quickSummaryTitle')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 text-center border-2 border-green-200 dark:border-green-800">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{t('fullRefund')}</div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mt-1">{t('twentyFourPlusHours')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('noPenaltyDepositReleased')}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 text-center border-2 border-amber-200 dark:border-amber-800">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">{t('oneDayPenaltyShort')}</div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mt-1">{t('lessThan24Hours')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('penaltyBreakdown')}</div>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-3">
                {t('quickSummaryFootnote')}
              </p>
            </div>
          </div>
        </section>

        {/* Guest Cancellation Policy */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoPersonOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                {t('guestCancellationPolicy')}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('guestPolicyIntro')}
              </p>

              {/* 24+ Hours -- Free Cancellation */}
              <div className="border-l-4 border-green-500 pl-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mr-2" />
                  {t('freeCancellationTitle')}
                </h3>
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>{t('freeCancelItem1')}</li>
                  <li>{t('freeCancelItem2')}</li>
                  <li>{t('freeCancelItem3')}</li>
                  <li>{t('freeCancelItem4')}</li>
                  <li>{t('freeCancelItem5')}</li>
                  <li>{t('freeCancelItem6')}</li>
                </ul>
              </div>

              {/* Less than 24 Hours -- Late Cancellation */}
              <div className="border-l-4 border-amber-500 pl-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <IoAlertCircleOutline className="w-5 h-5 text-amber-500 mr-2" />
                  {t('lateCancellationTitle')}
                </h3>
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>{t('lateCancelItem1')}</li>
                  <li>{t('lateCancelItem2')}</li>
                  <li>{t('lateCancelItem3')}</li>
                  <li>{t('lateCancelItem4')}</li>
                  <li>{t('lateCancelItem5')}</li>
                  <li>{t('lateCancelItem6')}</li>
                  <li>{t('lateCancelItem7')}</li>
                </ul>
                <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                  {t('lateCancelExample')}
                </div>
              </div>

              {/* No-Show */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300 flex items-center">
                  <IoCloseCircleOutline className="w-5 h-5 mr-2" />
                  {t('noShowTitle')}
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-400 space-y-1">
                  <li>{t('noShowItem1')}</li>
                  <li>{t('noShowItem2')}</li>
                  <li>{t('noShowItem3')}</li>
                  <li>{t('noShowItem4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Host Cancellation Policy */}
        <section className="py-6 sm:py-8 bg-white dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoCarOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                {t('hostCancellationPolicy')}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('hostPolicyIntro')}
              </p>

              {/* When Host Cancels */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('whenHostCancels')}:</h3>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-2">
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {t('hostCancelGuest1')}
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {t('hostCancelGuest2')}
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {t('hostCancelGuest3')}
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {t('hostCancelGuest4')}
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {t('hostCancelGuest5')}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Host Penalties */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('hostPenaltiesTitle')}:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('firstOffense')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('firstOffensePenalty')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('secondOffense')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('secondOffensePenalty')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('thirdOffense')}</span>
                    <span className="text-sm font-medium text-orange-600">{t('thirdOffensePenalty')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('fourthOffense')}</span>
                    <span className="text-sm font-medium text-red-600">{t('fourthOffensePenalty')}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {t('hostPenaltiesAdditional')}
                </p>
              </div>

              {/* Acceptable Reasons */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('acceptableReasonsTitle')}:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>{t('acceptableReason1')}</li>
                  <li>{t('acceptableReason2')}</li>
                  <li>{t('acceptableReason3')}</li>
                  <li>{t('acceptableReason4')}</li>
                  <li>{t('acceptableReason5')}</li>
                  <li>{t('acceptableReason6')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Processing */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                {t('refundProcessingTitle')}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('refundProcessingIntro')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('processingTimeline')}</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex justify-between">
                      <span>{t('creditDebitCards')}</span>
                      <span className="font-medium">{t('fiveToTenDays')}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{t('paypal')}</span>
                      <span className="font-medium">{t('threeToFiveDays')}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{t('appleGooglePay')}</span>
                      <span className="font-medium">{t('threeToFiveDays')}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{t('itwhipCredit')}</span>
                      <span className="font-medium text-green-600">{t('instant')}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{t('bankTransfers')}</span>
                      <span className="font-medium">{t('sevenToFourteenDays')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('importantNotes')}</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li>{t('importantNote1')}</li>
                    <li>{t('importantNote2')}</li>
                    <li>{t('importantNote3')}</li>
                    <li>{t('importantNote4')}</li>
                    <li>{t('importantNote5')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trip Modifications */}
        <section className="py-6 sm:py-8 bg-white dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoCalendarOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                {t('tripModificationsTitle')}
              </h2>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {t('proTip')}
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('modificationOptionsTitle')}:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>{t('modOption1')}</span>
                </li>
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>{t('modOption2')}</span>
                </li>
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>{t('modOption3')}</span>
                </li>
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>{t('modOption4')}</span>
                </li>
              </ul>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('otherTripChangesTitle')}:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>{t('tripChangeExtensions')}</li>
                <li>{t('tripChangeEarlyReturns')}</li>
                <li>{t('tripChangeLocation')}</li>
                <li>{t('tripChangeDrivers')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Insurance & Protection */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                {t('insuranceTitle')}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('insuranceIntro')}
              </p>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('protectionTiersTitle')}:</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="text-2xl font-bold text-amber-600 mb-1">90%</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('tierCommercialPremium')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('tierCommercialDesc')}</div>
                </div>
                <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-1">75%</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('tierP2PStandard')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('tierP2PDesc')}</div>
                </div>
                <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-500 mb-1">40%</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('tierPlatformBasic')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('tierPlatformDesc')}</div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('specialCircumstancesTitle')}:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center">
                    <IoCheckmarkCircleOutline className="w-4 h-4 mr-2" />
                    {t('coveredCircumstancesTitle')}
                  </h4>
                  <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                    <li>{t('covered1')}</li>
                    <li>{t('covered2')}</li>
                    <li>{t('covered3')}</li>
                    <li>{t('covered4')}</li>
                    <li>{t('covered5')}</li>
                    <li>{t('covered6')}</li>
                    <li>{t('covered7')}</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2 flex items-center">
                    <IoCloseCircleOutline className="w-4 h-4 mr-2" />
                    {t('notCoveredTitle')}
                  </h4>
                  <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                    <li>{t('notCovered1')}</li>
                    <li>{t('notCovered2')}</li>
                    <li>{t('notCovered3')}</li>
                    <li>{t('notCovered4')}</li>
                    <li>{t('notCovered5')}</li>
                    <li>{t('notCovered6')}</li>
                    <li>{t('notCovered7')}</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/insurance-guide"
                  className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t('learnMoreInsurance')}
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How to Cancel */}
        <section className="py-6 sm:py-8 bg-white dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                {t('howToCancel')}
              </h2>

              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
                  <span>{t('cancelStep1')}</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
                  <span>{t('cancelStep2')}</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
                  <span>{t('cancelStep3')}</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</span>
                  <span>{t('cancelStep4')}</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">5</span>
                  <span>{t('cancelStep5')}</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">6</span>
                  <span>{t('cancelStep6')}</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">7</span>
                  <span>{t('cancelStep7')}</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 sm:p-8 text-white">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
                <IoCallOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                {t('needHelp')}
              </h2>
              <p className="text-sm sm:text-base text-amber-100 mb-6">
                {t('supportAvailability')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <IoMailOutline className="w-4 h-4 mr-2" />
                    {t('emailSupport')}
                  </h3>
                  <p className="text-sm text-amber-100">info@itwhip.com</p>
                  <p className="text-xs text-amber-200 mt-1">{t('emailResponseTime')}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <IoTimeOutline className="w-4 h-4 mr-2" />
                    {t('businessHours')}
                  </h3>
                  <p className="text-sm text-amber-100">{t('businessDays')}</p>
                  <p className="text-xs text-amber-200 mt-1">{t('businessTime')}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-amber-200">
                  {t('disputeNotice')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-6 sm:py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('relatedPolicies')}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/terms"
                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('termsOfService')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('termsOfServiceDesc')}</p>
              </Link>
              <Link
                href="/privacy"
                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('privacyPolicy')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('privacyPolicyDesc')}</p>
              </Link>
              <Link
                href="/insurance-guide"
                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('insuranceGuide')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('insuranceGuideDesc')}</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
