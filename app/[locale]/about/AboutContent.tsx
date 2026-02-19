'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Link } from '@/i18n/navigation'
import {
  IoGlobeOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoPeopleOutline,
  IoLeafOutline,
  IoWalletOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoRocketOutline,
  IoMailOutline,
  IoHeartOutline,
  IoLocationOutline
} from 'react-icons/io5'

export default function AboutContent() {
  const t = useTranslations('About')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'our-story',
      title: t('section1Title'),
      icon: IoBusinessOutline,
      content: t('section1Content')
    },
    {
      id: 'mission-values',
      title: t('section2Title'),
      icon: IoHeartOutline,
      content: `${t('section2MissionLabel')}\n\n${t('section2Mission')}\n\n${t('section2ValuesLabel')}\n\n${t('section2CommunityFirst')}\n\n${t('section2Trust')}\n\n${t('section2Transparency')}\n\n${t('section2Sustainability')}\n\n${t('section2Innovation')}\n\n${t('section2Accessibility')}`
    },
    {
      id: 'how-it-works',
      title: t('section3Title'),
      icon: IoCarOutline,
      content: `${t('section3GuestLabel')}\n\n${t('section3GuestFinding')}\n\n${t('section3GuestBooking')}\n\n${t('section3GuestProtection')}\n\n${t('section3HostLabel')}\n\n${t('section3HostList')}\n\n${t('section3HostControl')}\n\n${t('section3HostEconomics')}\n\n${t('section3HostProtection')}\n\n${t('section3PartnerLabel')}\n\n${t('section3PartnerCorporate')}\n\n${t('section3PartnerEvent')}`
    },
    {
      id: 'why-choose-us',
      title: t('section4Title'),
      icon: IoTrendingUpOutline,
      content: `${t('section4LocalLabel')}\n\n${t('section4LocalPhoenix')}\n\n${t('section4LocalEconomy')}\n\n${t('section4EconomicsLabel')}\n\n${t('section4EconomicsGuest')}\n\n${t('section4EconomicsHost')}\n\n${t('section4TechLabel')}\n\n${t('section4TechSeamless')}\n\n${t('section4TechArizona')}\n\n${t('section4SafetyLabel')}\n\n${t('section4SafetyVerification')}\n\n${t('section4SafetyCoverage')}\n\n${t('section4EnvironmentLabel')}\n\n${t('section4EnvironmentCarbon')}\n\n${t('section4EnvironmentSustainable')}`
    },
    {
      id: 'community-impact',
      title: t('section5Title'),
      icon: IoPeopleOutline,
      content: `${t('section5EconomicLabel')}\n\n${t('section5EconomicFamilies')}\n\n${t('section5EconomicOpportunities')}\n\n${t('section5EconomicBusiness')}\n\n${t('section5SocialLabel')}\n\n${t('section5SocialAccessibility')}\n\n${t('section5SocialPartnerships')}\n\n${t('section5SocialEquity')}\n\n${t('section5EnvironmentLabel')}\n\n${t('section5EnvironmentMeasurable')}\n\n${t('section5EnvironmentGreen')}\n\n${t('section5EnvironmentFuture')}`
    },
    {
      id: 'looking-ahead',
      title: t('section6Title'),
      icon: IoRocketOutline,
      content: `${t('section6ExpansionLabel')}\n\n${t('section6ExpansionGrowing')}\n\n${t('section6ExpansionRegional')}\n\n${t('section6FeaturesLabel')}\n\n${t('section6FeaturesMobileApps')}\n\n${t('section6FeaturesSubscription')}\n\n${t('section6FeaturesEnhanced')}\n\n${t('section6InnovationLabel')}\n\n${t('section6InnovationTechnology')}\n\n${t('section6InnovationService')}\n\n${t('section6CommitmentLabel')}\n\n${t('section6CommitmentHosts')}\n\n${t('section6CommitmentGuests')}\n\n${t('section6CommitmentCommunity')}\n\n${t('section6CommitmentClosing')}`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Page Content */}
      <div className="flex-1 mt-14 md:mt-16">
        {/* Page Title */}
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <IoGlobeOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                <IoBusinessOutline className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('heroSubtitle')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('heroDescription')}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-6 sm:py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoCarOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">100+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('statsVehicles')}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoLocationOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">18</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('statsCities')}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoWalletOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">40-90%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('statsHostEarnings')}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">$1M</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('statsProtection')}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoLeafOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">ESG</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">{t('statsFleet')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-left">
                          {section.title}
                        </h2>
                      </div>
                      {expandedSections[section.id] ? (
                        <IoChevronUpOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <IoChevronDownOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedSections[section.id] && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-8 sm:py-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('ctaHeading')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto whitespace-pre-line">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/list-your-car"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
              >
                {t('ctaListYourVehicle')}
              </Link>
              <Link
                href="/rentals"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600"
              >
                {t('ctaBrowseRentals')}
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition"
              >
                {t('ctaContactUs')}
              </Link>
            </div>

            {/* Internal Links for SEO */}
            <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-800/30">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{t('ctaDestinationsLabel')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/rentals/cities/phoenix" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">{t('ctaPhoenix')}</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link href="/rentals/cities/scottsdale" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">{t('ctaScottsdale')}</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link href="/rentals/cities/tempe" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">{t('ctaTempe')}</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link href="/rentals/airports/phoenix-sky-harbor" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">{t('ctaSkyHarborAirport')}</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link href="/rentals/types/luxury" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">{t('ctaLuxuryCars')}</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link href="/rentals/types/suv" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">{t('ctaSUVs')}</Link>
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
                {t('contactHeading')}
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">{t('contactPhoneSupport')}</p>
                <p>{t('contactGeneralInquiries')}</p>
                <p>{t('contactHostSupport')}</p>
                <p>{t('contactPartnerInquiries')}</p>
                <p>{t('contactMediaInquiries')}</p>
                <p className="pt-2">{t('contactResponseTime')}</p>
                <p>{t('contactBusinessHours')}</p>
                <p className="pt-2 italic">{t('contactLocation')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer - Using existing Footer component */}
      <Footer />
    </div>
  )
}