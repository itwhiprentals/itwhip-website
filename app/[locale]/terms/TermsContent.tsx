'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoMailOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoDownloadOutline
} from 'react-icons/io5'

export default function TermsContent() {
  const t = useTranslations('Terms')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleGetAppClick = () => {
    console.log('Get app clicked')
  }

  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  const sections = [
    {
      id: 'acceptance',
      titleKey: 'section1Title' as const,
      icon: IoDocumentTextOutline,
      contentKey: 'section1Content' as const,
    },
    {
      id: 'eligibility',
      titleKey: 'section2Title' as const,
      icon: IoCheckmarkCircle,
      contentKey: 'section2Content' as const,
    },
    {
      id: 'booking',
      titleKey: 'section3Title' as const,
      icon: IoCarOutline,
      contentKey: 'section3Content' as const,
    },
    {
      id: 'pricing',
      titleKey: 'section4Title' as const,
      icon: IoWalletOutline,
      contentKey: 'section4Content' as const,
    },
    {
      id: 'cancellation',
      titleKey: 'section5Title' as const,
      icon: IoTimerOutline,
      contentKey: 'section5Content' as const,
    },
    {
      id: 'insurance',
      titleKey: 'section6Title' as const,
      icon: IoShieldCheckmarkOutline,
      warning: true,
      contentKey: 'section6Content' as const,
    },
    {
      id: 'prohibited',
      titleKey: 'section7Title' as const,
      icon: IoWarningOutline,
      contentKey: 'section7Content' as const,
    },
    {
      id: 'liability',
      titleKey: 'section8Title' as const,
      icon: IoAlertCircleOutline,
      warning: true,
      contentKey: 'section8Content' as const,
    },
    {
      id: 'user-obligations',
      titleKey: 'section9Title' as const,
      icon: IoBusinessOutline,
      contentKey: 'section9Content' as const,
    },
    {
      id: 'privacy',
      titleKey: 'section10Title' as const,
      icon: IoLockClosedOutline,
      contentKey: 'section10Content' as const,
    },
    {
      id: 'disputes',
      titleKey: 'section11Title' as const,
      icon: IoGlobeOutline,
      contentKey: 'section11Content' as const,
    },
    {
      id: 'termination',
      titleKey: 'section12Title' as const,
      icon: IoLockClosedOutline,
      contentKey: 'section12Content' as const,
    },
    {
      id: 'esg',
      titleKey: 'section13Title' as const,
      icon: IoGlobeOutline,
      contentKey: 'section13Content' as const,
    },
    {
      id: 'misc',
      titleKey: 'section14Title' as const,
      icon: IoDocumentTextOutline,
      contentKey: 'section14Content' as const,
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      <div className="pt-16">
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-3">
                <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('pageTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {t('lastUpdated')}
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-3 sm:py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <IoInformationCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    {t('noticeTitle')}
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                    {t('noticeDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id} className={section.warning ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <section.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${section.warning ? 'text-red-600' : 'text-amber-600'}`} />
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-left">
                          {t(section.titleKey)}
                        </h2>
                      </div>
                      {expandedSections[section.id] ? (
                        <IoChevronUpOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      ) : (
                        <IoChevronDownOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </button>

                    {expandedSections[section.id] && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                          {t(section.contentKey)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-6 sm:py-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoMailOutline className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-600" />
                {t('contactTitle')}
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>{t('contactCompany')}</strong></p>
                <p>{t('contactEmail')}</p>
                <p>{t('contactResponseTime')}</p>
                <p>{t('contactBusinessHours')}</p>
                <p>{t('contactEmergency')}</p>
                <p className="italic text-xs mt-2">{t('contactAddress')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
