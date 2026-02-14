// app/help/identity-verification/page.tsx

'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import IDScannerAnimation from '@/app/components/IDScannerAnimation'
import {
  IoShieldCheckmarkOutline,
  IoIdCardOutline,
  IoPersonOutline,
  IoCameraOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoLockClosedOutline,
  IoHelpCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

const verificationSteps = [
  {
    step: 1,
    icon: IoIdCardOutline,
    titleKey: 'steps.uploadId.title',
    descriptionKey: 'steps.uploadId.description',
    tipKeys: ['steps.uploadId.tip1', 'steps.uploadId.tip2', 'steps.uploadId.tip3']
  },
  {
    step: 2,
    icon: IoCameraOutline,
    titleKey: 'steps.selfie.title',
    descriptionKey: 'steps.selfie.description',
    tipKeys: ['steps.selfie.tip1', 'steps.selfie.tip2', 'steps.selfie.tip3']
  },
  {
    step: 3,
    icon: IoCheckmarkCircle,
    titleKey: 'steps.verification.title',
    descriptionKey: 'steps.verification.description',
    tipKeys: ['steps.verification.tip1', 'steps.verification.tip2', 'steps.verification.tip3']
  }
]

const acceptedDocuments = [
  { nameKey: 'documents.driversLicense.name', descriptionKey: 'documents.driversLicense.description' },
  { nameKey: 'documents.stateId.name', descriptionKey: 'documents.stateId.description' },
  { nameKey: 'documents.passport.name', descriptionKey: 'documents.passport.description' },
  { nameKey: 'documents.passportCard.name', descriptionKey: 'documents.passportCard.description' }
]

const benefits = [
  {
    icon: IoShieldCheckmarkOutline,
    titleKey: 'benefits.securePlatform.title',
    descriptionKey: 'benefits.securePlatform.description'
  },
  {
    icon: IoLockClosedOutline,
    titleKey: 'benefits.dataProtection.title',
    descriptionKey: 'benefits.dataProtection.description'
  },
  {
    icon: IoPersonOutline,
    titleKey: 'benefits.trustedRentals.title',
    descriptionKey: 'benefits.trustedRentals.description'
  }
]

const faqKeys = [
  { questionKey: 'faqs.whyVerify.question', answerKey: 'faqs.whyVerify.answer' },
  { questionKey: 'faqs.isSecure.question', answerKey: 'faqs.isSecure.answer' },
  { questionKey: 'faqs.howLong.question', answerKey: 'faqs.howLong.answer' },
  { questionKey: 'faqs.whatIfFails.question', answerKey: 'faqs.whatIfFails.answer' },
  { questionKey: 'faqs.verifyAgain.question', answerKey: 'faqs.verifyAgain.answer' },
  { questionKey: 'faqs.international.question', answerKey: 'faqs.international.answer' }
]

export default function IdentityVerificationPage() {
  const t = useTranslations('HelpIdentityVerification')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label={t('breadcrumbs.ariaLabel')}>
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-orange-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  {t('breadcrumbs.home')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-orange-600">{t('breadcrumbs.help')}</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbs.identityVerification')}</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('hero.title')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('hero.subtitle')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.rich('hero.description', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Interactive ID Scanner Animation */}
        <IDScannerAnimation />

        {/* How It Works */}
        <section className="pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCameraOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('howItWorks.title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('howItWorks.subtitle')}</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {verificationSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
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
                        {step.tipKeys.map((tipKey) => (
                          <span
                            key={tipKey}
                            className="text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                          >
                            {t(tipKey)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accepted Documents */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoIdCardOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('acceptedDocuments.title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('acceptedDocuments.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {acceptedDocuments.map((doc) => (
                <div
                  key={doc.nameKey}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{t(doc.nameKey)}</span>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t(doc.descriptionKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <IoWarningOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">{t('acceptedDocuments.importantLabel')}</p>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                    {t('acceptedDocuments.importantText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why We Verify */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('whyWeVerify.title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('whyWeVerify.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.titleKey}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(benefit.titleKey)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(benefit.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoHelpCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                {t('faqSection.title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">{t('faqSection.subtitle')}</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {faqKeys.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
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

        {/* Stripe Badge */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('stripeBadge.poweredBy')}</p>
              <a
                href="https://stripe.com/identity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/stripe-identity-badge.png"
                  alt={t('stripeBadge.imageAlt')}
                  className="h-24 sm:h-32 md:h-40 mx-auto dark:brightness-0 dark:invert"
                />
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {t('stripeBadge.description')}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('cta.title')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {t('cta.getStarted')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {t('cta.contactSupport')}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
