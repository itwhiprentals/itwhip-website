// app/driver-requirements/page.tsx

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCarOutline,
  IoPersonOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoTimeOutline,
  IoWalletOutline,
  IoStarOutline,
  IoRocketOutline,
  IoInformationCircleOutline,
  IoHelpCircleOutline,
  IoBookOutline,
  IoAlertCircleOutline,
  IoTrophyOutline,
  IoSchoolOutline,
  IoCardOutline,
  IoGlobeOutline,
  IoSparklesOutline,
  IoServerOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

export default function DriverRequirementsPage() {
  const router = useRouter()
  const t = useTranslations('DriverRequirements')
  const [activeTab, setActiveTab] = useState('drivers')

  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const driverRequirements = [
    {
      category: t('legalRequirementsCategory'),
      icon: IoDocumentTextOutline,
      items: [
        t('legalRequirement1'),
        t('legalRequirement2'),
        t('legalRequirement3'),
        t('legalRequirement4'),
        t('legalRequirement5'),
        t('legalRequirement6')
      ]
    },
    {
      category: t('professionalStandardsCategory'),
      icon: IoBriefcaseOutline,
      items: [
        t('professionalStandard1'),
        t('professionalStandard2'),
        t('professionalStandard3'),
        t('professionalStandard4'),
        t('professionalStandard5'),
        t('professionalStandard6')
      ]
    },
    {
      category: t('platformRequirementsCategory'),
      icon: IoGlobeOutline,
      items: [
        t('platformRequirement1'),
        t('platformRequirement2'),
        t('platformRequirement3'),
        t('platformRequirement4'),
        t('platformRequirement5'),
        t('platformRequirement6')
      ]
    }
  ]

  const vehicleRequirements = [
    {
      category: t('vehicleStandardsCategory'),
      icon: IoCarOutline,
      items: [
        t('vehicleStandard1'),
        t('vehicleStandard2'),
        t('vehicleStandard3'),
        t('vehicleStandard4'),
        t('vehicleStandard5'),
        t('vehicleStandard6')
      ]
    },
    {
      category: t('documentationCategory'),
      icon: IoDocumentTextOutline,
      items: [
        t('documentation1'),
        t('documentation2'),
        t('documentation3'),
        t('documentation4'),
        t('documentation5'),
        t('documentation6')
      ]
    },
    {
      category: t('qualityStandardsCategory'),
      icon: IoSparklesOutline,
      items: [
        t('qualityStandard1'),
        t('qualityStandard2'),
        t('qualityStandard3'),
        t('qualityStandard4'),
        t('qualityStandard5'),
        t('qualityStandard6')
      ]
    }
  ]

  const verificationProcess = [
    {
      step: 1,
      title: t('verificationStep1Title'),
      description: t('verificationStep1Description'),
      time: t('verificationStep1Time'),
      icon: IoDocumentTextOutline
    },
    {
      step: 2,
      title: t('verificationStep2Title'),
      description: t('verificationStep2Description'),
      time: t('verificationStep2Time'),
      icon: IoShieldCheckmarkOutline
    },
    {
      step: 3,
      title: t('verificationStep3Title'),
      description: t('verificationStep3Description'),
      time: t('verificationStep3Time'),
      icon: IoCarOutline
    },
    {
      step: 4,
      title: t('verificationStep4Title'),
      description: t('verificationStep4Description'),
      time: t('verificationStep4Time'),
      icon: IoSchoolOutline
    },
    {
      step: 5,
      title: t('verificationStep5Title'),
      description: t('verificationStep5Description'),
      time: t('verificationStep5Time'),
      icon: IoRocketOutline
    }
  ]

  const trustFeatures = [
    {
      icon: IoShieldCheckmarkOutline,
      title: t('trustFeatureCommercialInsuranceTitle'),
      description: t('trustFeatureCommercialInsuranceDescription')
    },
    {
      icon: IoBusinessOutline,
      title: t('trustFeatureHotelPartnerTitle'),
      description: t('trustFeatureHotelPartnerDescription')
    },
    {
      icon: IoServerOutline,
      title: t('trustFeatureGDSTitle'),
      description: t('trustFeatureGDSDescription')
    },
    {
      icon: IoStarOutline,
      title: t('trustFeatureQualityMonitoringTitle'),
      description: t('trustFeatureQualityMonitoringDescription')
    },
    {
      icon: IoLockClosedOutline,
      title: t('trustFeatureSecureTitle'),
      description: t('trustFeatureSecureDescription')
    },
    {
      icon: IoWalletOutline,
      title: t('trustFeaturePaymentsTitle'),
      description: t('trustFeaturePaymentsDescription')
    }
  ]

  const faqs = [
    {
      question: t('faqQuestion1'),
      answer: t('faqAnswer1')
    },
    {
      question: t('faqQuestion2'),
      answer: t('faqAnswer2')
    },
    {
      question: t('faqQuestion3'),
      answer: t('faqAnswer3')
    },
    {
      question: t('faqQuestion4'),
      answer: t('faqAnswer4')
    },
    {
      question: t('faqQuestion5'),
      answer: t('faqAnswer5')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main Header Component with Full Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Section - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/20 rounded">
                {t('badgeText')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/drive"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700"
              >
                {t('becomeADriverButton')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Fixed */}
      <div className="fixed top-[106px] md:top-[112px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'drivers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabDriverRequirements')}
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'vehicles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabVehicleStandards')}
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'process'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabVerificationProcess')}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[156px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4 sm:mb-6">
                <IoShieldCheckmarkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">
                  {t('heroSubtitle')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('heroHeading')}
                <span className="block text-blue-600 mt-2">{t('heroHeadingHighlight')}</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                {t('heroDescription')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('statInsured')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">4.9+</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('statRating')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('statMonitored')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">GDS</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('statCertified')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections Based on Active Tab */}
        {activeTab === 'drivers' && (
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('driverRequirementsSection')}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {t('driverRequirementsSectionDescription')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {driverRequirements.map((category, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.category}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'vehicles' && (
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('vehicleStandardsSection')}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {t('vehicleStandardsSectionDescription')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {vehicleRequirements.map((category, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.category}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'process' && (
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('verificationProcessSection')}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {t('verificationProcessDescription')}
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                {verificationProcess.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-start mb-8">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {step.step}
                        </div>
                      </div>
                      <div className="ml-6 flex-1">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {step.title}
                            </h3>
                            <span className="text-sm text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    {idx < verificationProcess.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust Features */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t('trustFeaturesSection')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('trustFeaturesSectionDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trustFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-8 sm:py-12 bg-amber-50 dark:bg-amber-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
              <div className="flex items-start space-x-4">
                <IoAlertCircleOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('platformNoticeTitle')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('platformNoticeText1')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('platformNoticeText2')}
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/terms"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t('readTermsLink')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t('faqsSection')}
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('faqMoreQuestionsText')}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>{t('contactSupportLink')}</span>
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              {t('ctaHeading')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8">
              {t('ctaSubheading')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/drive"
                className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg text-sm sm:text-base"
              >
                {t('ctaApplyButton')}
              </Link>
              <Link
                href="/earnings"
                className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-400 transition text-sm sm:text-base"
              >
                {t('ctaEarningsButton')}
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>{t('footerCopyright')}</p>
              <div className="mt-3 sm:mt-4 space-x-3 sm:space-x-4">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">{t('footerTermsLink')}</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">{t('footerPrivacyLink')}</Link>
                <Link href="/drive" className="hover:text-gray-700 dark:hover:text-gray-300">{t('footerDriveLink')}</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">{t('footerContactLink')}</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
