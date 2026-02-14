// app/help/guest-account/page.tsx
// Comprehensive guide to ItWhip Guest Accounts
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoPersonOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoIdCardOutline,
  IoDocumentTextOutline,
  IoGiftOutline,
  IoStarOutline,
  IoHelpCircleOutline,
  IoSparklesOutline,
  IoCardOutline,
  IoRocketOutline,
  IoLockClosedOutline,
  IoFingerPrintOutline,
  IoServerOutline,
  IoLinkOutline,
  IoDownloadOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoSwapHorizontalOutline
} from 'react-icons/io5'

const bookingSteps = [
  {
    step: 1,
    icon: IoCarSportOutline,
    titleKey: 'bookingStep1Title',
    descriptionKey: 'bookingStep1Desc',
    detailKeys: ['bookingStep1Detail1', 'bookingStep1Detail2', 'bookingStep1Detail3']
  },
  {
    step: 2,
    icon: IoIdCardOutline,
    titleKey: 'bookingStep2Title',
    descriptionKey: 'bookingStep2Desc',
    detailKeys: ['bookingStep2Detail1', 'bookingStep2Detail2', 'bookingStep2Detail3']
  },
  {
    step: 3,
    icon: IoCardOutline,
    titleKey: 'bookingStep3Title',
    descriptionKey: 'bookingStep3Desc',
    detailKeys: ['bookingStep3Detail1', 'bookingStep3Detail2', 'bookingStep3Detail3']
  },
  {
    step: 4,
    icon: IoCheckmarkCircle,
    titleKey: 'bookingStep4Title',
    descriptionKey: 'bookingStep4Desc',
    detailKeys: ['bookingStep4Detail1', 'bookingStep4Detail2', 'bookingStep4Detail3']
  }
]

const accountBenefits = [
  {
    icon: IoTimeOutline,
    titleKey: 'benefitBookingHistoryTitle',
    descriptionKey: 'benefitBookingHistoryDesc'
  },
  {
    icon: IoWalletOutline,
    titleKey: 'benefitDigitalWalletTitle',
    descriptionKey: 'benefitDigitalWalletDesc'
  },
  {
    icon: IoRocketOutline,
    titleKey: 'benefitInstantBookingsTitle',
    descriptionKey: 'benefitInstantBookingsDesc'
  },
  {
    icon: IoStarOutline,
    titleKey: 'benefitReviewsTitle',
    descriptionKey: 'benefitReviewsDesc'
  },
  {
    icon: IoShieldCheckmarkOutline,
    titleKey: 'benefitVerifiedStatusTitle',
    descriptionKey: 'benefitVerifiedStatusDesc'
  },
  {
    icon: IoDocumentTextOutline,
    titleKey: 'benefitSavedDocsTitle',
    descriptionKey: 'benefitSavedDocsDesc'
  }
]

const creditsBonuses = [
  {
    icon: IoGiftOutline,
    titleKey: 'creditWelcomeBonusTitle',
    color: 'emerald',
    descriptionKey: 'creditWelcomeBonusDesc'
  },
  {
    icon: IoSparklesOutline,
    titleKey: 'creditReferralTitle',
    color: 'blue',
    descriptionKey: 'creditReferralDesc'
  },
  {
    icon: IoWalletOutline,
    titleKey: 'creditDepositWalletTitle',
    color: 'amber',
    descriptionKey: 'creditDepositWalletDesc'
  }
]

const verificationLevels = [
  {
    levelKey: 'verificationQuickLevel',
    timingKey: 'verificationQuickTiming',
    descriptionKey: 'verificationQuickDesc',
    icon: IoIdCardOutline
  },
  {
    levelKey: 'verificationFullLevel',
    timingKey: 'verificationFullTiming',
    descriptionKey: 'verificationFullDesc',
    icon: IoShieldCheckmarkOutline
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

export default function GuestAccountPage() {
  const t = useTranslations('HelpGuestAccount')

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
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbGuestAccount')}</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <IoPersonOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
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
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 sm:p-4 text-center border border-orange-200 dark:border-orange-800">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{t('statFreeValue')}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('statFreeLabel')}</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 sm:p-4 text-center border border-emerald-200 dark:border-emerald-800">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">{t('statInstantValue')}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('statInstantLabel')}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center border border-blue-200 dark:border-blue-800">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{t('stat247Value')}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('stat247Label')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* How Booking Works */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('howBookingWorksTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('howBookingWorksSubtitle')}</p>
            </div>

            <div className="space-y-4">
              {bookingSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center relative">
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
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

            {/* Important Note */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <IoSparklesOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t('noAccountNoteTitle')}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t('noAccountNoteDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Benefits */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoStarOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('accountBenefitsTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('accountBenefitsSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accountBenefits.map((benefit) => (
                <div
                  key={benefit.titleKey}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{t(benefit.titleKey)}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t(benefit.descriptionKey)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Process */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('verificationTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('verificationSubtitle')}</p>
            </div>

            <div className="space-y-4">
              {verificationLevels.map((level, index) => (
                <div
                  key={level.levelKey}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 ${index === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'} rounded-lg flex items-center justify-center`}>
                        <level.icon className={`w-6 h-6 ${index === 0 ? 'text-blue-600' : 'text-green-600'}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{t(level.levelKey)}</h3>
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                          index === 0
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                          {t(level.timingKey)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t(level.descriptionKey)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/help/identity-verification"
                className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                {t('verificationLearnMore')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Credits & Bonuses */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('creditsBonusesTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('creditsBonusesSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {creditsBonuses.map((item) => (
                <div
                  key={item.titleKey}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border-2 ${
                    item.color === 'emerald' ? 'border-emerald-200 dark:border-emerald-800' :
                    item.color === 'blue' ? 'border-blue-200 dark:border-blue-800' :
                    'border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className={`w-12 h-12 ${
                    item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  } rounded-lg flex items-center justify-center mb-3`}>
                    <item.icon className={`w-6 h-6 ${
                      item.color === 'emerald' ? 'text-emerald-600' :
                      item.color === 'blue' ? 'text-blue-600' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(item.titleKey)}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t(item.descriptionKey)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-4 sm:p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <IoGiftOutline className="w-6 h-6" />
                <h3 className="font-bold text-lg">{t('proTipTitle')}</h3>
              </div>
              <p className="text-sm opacity-90">
                {t.rich('proTipDesc', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Payment Security */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoLockClosedOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('paymentSecurityTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('paymentSecuritySubtitle')}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoCardOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('poweredByStripeTitle')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.rich('poweredByStripeDesc', {
                      strong: (chunks) => <strong>{chunks}</strong>
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoLockClosedOutline className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('neverStoreCardTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('neverStoreCardDesc')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoServerOutline className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('whatWeStoreTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('whatWeStoreDesc')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('authorizationHoldsTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('authorizationHoldsDesc')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoWalletOutline className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('secureDepositsTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('secureDepositsDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Identity & Data Storage */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoFingerPrintOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('identityDataTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('identityDataSubtitle')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('identityDataIntro')}
                </p>

                <div className="space-y-4">
                  {/* What ItWhip Stores */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <IoServerOutline className="w-5 h-5" />
                      {t('whatItWhipStoresTitle')}
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('itwhipStoresProfile', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('itwhipStoresDL', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('itwhipStoresBookings', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('itwhipStoresVerification', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                    </ul>
                  </div>

                  {/* What Stripe Stores */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                      <IoLockClosedOutline className="w-5 h-5" />
                      {t('whatStripeStoresTitle')}
                    </h4>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('stripeStoresCard', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('stripeStoresIdentity', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('stripeStoresBiometric', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{t.rich('stripeStoresTransactions', { strong: (chunks) => <strong>{chunks}</strong> })}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-gray-100 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {t.rich('dataProtectedNote', {
                      strong: (chunks) => <strong className="text-gray-900 dark:text-white">{chunks}</strong>
                    })}
                  </p>
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
                <IoLinkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
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
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('switchGuestHostTitle')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('switchGuestHostDesc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoPersonOutline className="w-5 h-5 text-orange-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('oneIdentityTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('oneIdentityDesc')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCarSportOutline className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{t('whyHostsNeedGuestTitle')}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('whyHostsNeedGuestDesc')}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t.rich('howToLinkGuest', {
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
                <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
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
                <IoHelpCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
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
                href="/rentals/search"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {t('ctaBrowseCars')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {t('ctaCreateAccount')}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
