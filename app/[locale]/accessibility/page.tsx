'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoAccessibilityOutline,
  IoEyeOutline,
  IoEarOutline,
  IoHandLeftOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoMailOutline,
  IoCallOutline,
  IoInformationCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCarOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline
} from 'react-icons/io5'

const sectionDefs = [
  { id: 'commitment', titleKey: 'sectionCommitmentTitle', contentKey: 'sectionCommitmentContent', icon: IoAccessibilityOutline },
  { id: 'features', titleKey: 'sectionFeaturesTitle', contentKey: 'sectionFeaturesContent', icon: IoCheckmarkCircle },
  { id: 'visual', titleKey: 'sectionVisualTitle', contentKey: 'sectionVisualContent', icon: IoEyeOutline },
  { id: 'hearing', titleKey: 'sectionHearingTitle', contentKey: 'sectionHearingContent', icon: IoEarOutline },
  { id: 'motor', titleKey: 'sectionMotorTitle', contentKey: 'sectionMotorContent', icon: IoHandLeftOutline },
  { id: 'cognitive', titleKey: 'sectionCognitiveTitle', contentKey: 'sectionCognitiveContent', icon: IoPeopleOutline },
  { id: 'vehicles', titleKey: 'sectionVehiclesTitle', contentKey: 'sectionVehiclesContent', icon: IoCarOutline },
  { id: 'testing', titleKey: 'sectionTestingTitle', contentKey: 'sectionTestingContent', icon: IoDesktopOutline }
] as const

export default function AccessibilityPage() {
  const t = useTranslations('Accessibility')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [fontSize, setFontSize] = useState('normal')

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <IoAccessibilityOutline className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {t('heroTitle')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-6 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal')}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'} {t('textSize')}
              </button>
              <button
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                {t('highContrast')}
              </button>
              <button
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                {t('keyboardNavGuide')}
              </button>
              <button
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                {t('readAloud')}
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className={`py-8 sm:py-12 ${fontSize === 'large' ? 'text-lg' : fontSize === 'xlarge' ? 'text-xl' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sectionDefs.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      aria-expanded={expandedSections[section.id]}
                      aria-controls={`section-${section.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-left">
                          {t(section.titleKey)}
                        </h2>
                      </div>
                      {expandedSections[section.id] ? (
                        <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                      ) : (
                        <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {expandedSections[section.id] && (
                      <div id={`section-${section.id}`} className="px-6 pb-6">
                        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
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
        <section className="py-8 sm:py-12 bg-blue-50 dark:bg-blue-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('contactTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('contactSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <IoMailOutline className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('emailSupport')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('emailSupportDesc')}
                </p>
                <a href="mailto:info@itwhip.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  info@itwhip.com
                </a>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <IoCallOutline className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('ttySupport')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('ttySupportDesc')}
                </p>
                <p className="text-blue-600 font-medium">
                  711 (Relay Service)
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <IoPeopleOutline className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('feedback')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('feedbackDesc')}
                </p>
                <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('submitFeedback')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Statement */}
        <section className="py-8 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('complianceTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
              {t('complianceDesc')}
            </p>
            <p className="text-xs text-gray-500">
              {t('complianceAudit')}
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}