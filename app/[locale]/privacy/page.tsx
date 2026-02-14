'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoGlobeOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoBusinessOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoAnalyticsOutline,
  IoPersonOutline,
  IoTimerOutline,
  IoKeyOutline
} from 'react-icons/io5'
import { IconType } from 'react-icons'

const sections: { id: string; titleKey: string; icon: IconType; contentKey: string }[] = [
  { id: 'introduction', titleKey: 'section1Title', icon: IoInformationCircleOutline, contentKey: 'section1Content' },
  { id: 'collection', titleKey: 'section2Title', icon: IoPhonePortraitOutline, contentKey: 'section2Content' },
  { id: 'use', titleKey: 'section3Title', icon: IoBusinessOutline, contentKey: 'section3Content' },
  { id: 'sharing', titleKey: 'section4Title', icon: IoGlobeOutline, contentKey: 'section4Content' },
  { id: 'security', titleKey: 'section5Title', icon: IoShieldCheckmarkOutline, contentKey: 'section5Content' },
  { id: 'rights', titleKey: 'section6Title', icon: IoKeyOutline, contentKey: 'section6Content' },
  { id: 'cookies', titleKey: 'section7Title', icon: IoAnalyticsOutline, contentKey: 'section7Content' },
  { id: 'communications', titleKey: 'section8Title', icon: IoMailOutline, contentKey: 'section8Content' },
  { id: 'international', titleKey: 'section9Title', icon: IoGlobeOutline, contentKey: 'section9Content' },
  { id: 'children', titleKey: 'section10Title', icon: IoPersonOutline, contentKey: 'section10Content' },
  { id: 'california', titleKey: 'section11Title', icon: IoLocationOutline, contentKey: 'section11Content' },
  { id: 'changes', titleKey: 'section12Title', icon: IoTimerOutline, contentKey: 'section12Content' },
  { id: 'contact', titleKey: 'section13Title', icon: IoMailOutline, contentKey: 'section13Content' },
]

export default function PrivacyPage() {
  const t = useTranslations('Privacy')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-3">
                <IoLockClosedOutline className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('pageTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {t('lastUpdatedLabel')} {t('lastUpdated')} • {t('effectiveDateLabel')} {t('effectiveDate')}
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
                    {t('yourPrivacyMattersHeading')}
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                    {t('yourPrivacyMattersDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Commitments */}
        <section className="py-3 sm:py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-green-900 dark:text-green-300 mb-2">
                    {t('privacyCommitmentsHeading')}
                  </h2>
                  <ul className="text-xs sm:text-sm text-green-800 dark:text-green-400 space-y-1">
                    <li>• {t('commitment1')}</li>
                    <li>• {t('commitment2')}</li>
                    <li>• {t('commitment3')}</li>
                    <li>• {t('commitment4')}</li>
                    <li>• {t('commitment5')}</li>
                    <li>• {t('commitment6')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Sections */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
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

        {/* Contact Section */}
        <section className="py-6 sm:py-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoMailOutline className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-600" />
                {t('questionsAboutPrivacyHeading')}
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>{t('privacyTeamContact')}</strong></p>
                <p>Email: {t('contactEmail')}</p>
                <p>{t('responseTime')}</p>
                <p>{t('businessHours')}</p>
                <p className="pt-2">{t('contactFooterDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Agreement Section */}
        <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2">
                {t('byUsingItWhipHeading')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
                {t('agreementDesc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  {t('viewTermsOfService')}
                </Link>
                <Link href="/contact" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  {t('contactSupport')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
