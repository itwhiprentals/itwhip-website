'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoBusinessOutline,
  IoCarOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoLockClosedOutline,
  IoWarningOutline,
  IoHandLeftOutline,
  IoScaleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

export default function PlatformAgreementPage() {
  const t = useTranslations('PlatformAgreement')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'overview',
      titleKey: 'sectionOverviewTitle',
      icon: IoBusinessOutline,
      contentKey: 'sectionOverviewContent'
    },
    {
      id: 'user-responsibilities',
      titleKey: 'sectionUserResponsibilitiesTitle',
      icon: IoCheckmarkCircle,
      contentKey: 'sectionUserResponsibilitiesContent'
    },
    {
      id: 'booking-terms',
      titleKey: 'sectionBookingTermsTitle',
      icon: IoTimerOutline,
      contentKey: 'sectionBookingTermsContent'
    },
    {
      id: 'payments',
      titleKey: 'sectionPaymentsTitle',
      icon: IoWalletOutline,
      contentKey: 'sectionPaymentsContent'
    },
    {
      id: 'insurance',
      titleKey: 'sectionInsuranceTitle',
      icon: IoShieldCheckmarkOutline,
      contentKey: 'sectionInsuranceContent'
    },
    {
      id: 'liability',
      titleKey: 'sectionLiabilityTitle',
      icon: IoScaleOutline,
      contentKey: 'sectionLiabilityContent'
    },
    {
      id: 'prohibited',
      titleKey: 'sectionProhibitedTitle',
      icon: IoWarningOutline,
      contentKey: 'sectionProhibitedContent'
    },
    {
      id: 'termination',
      titleKey: 'sectionTerminationTitle',
      icon: IoHandLeftOutline,
      contentKey: 'sectionTerminationContent'
    },
    {
      id: 'privacy',
      titleKey: 'sectionPrivacyTitle',
      icon: IoLockClosedOutline,
      contentKey: 'sectionPrivacyContent'
    },
    {
      id: 'updates',
      titleKey: 'sectionUpdatesTitle',
      icon: IoDocumentTextOutline,
      contentKey: 'sectionUpdatesContent'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
              <IoDocumentTextOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('legalDocumentBadge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pageTitle')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('pageSubtitle')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              {t('lastUpdated')}
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <IoWarningOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">{t('importantNoticeTitle')}</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t('importantNoticeDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSections[section.id]

              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-left">
                        {t(section.titleKey)}
                      </span>
                    </div>
                    {isExpanded ? (
                      <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                    ) : (
                      <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {t(section.contentKey)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-10 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('contactTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('contactDesc')}
            </p>
            <a
              href="mailto:info@itwhip.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('contactLegalTeam')}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
