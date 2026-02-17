// app/insurance-guide/page.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoCarOutline,
  IoWalletOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoHelpCircleOutline,
  IoSwapHorizontalOutline,
  IoLayersOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoCallOutline,
  IoCameraOutline,
  IoDocumentOutline,
  IoFlashOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoMedkitOutline,
  IoPeopleOutline,
  IoReceiptOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoTrendingUpOutline,
  IoCarSportOutline,
  IoConstructOutline,
  IoLeafOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

// FAQ Accordion Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-left">{question}</span>
        {isOpen ? (
          <IoChevronUpOutline className="w-5 h-5 text-purple-600 flex-shrink-0" />
        ) : (
          <IoChevronDownOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HostInsurancePage() {
  const t = useTranslations('InsuranceGuide')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  // Section refs
  const overviewRef = useRef<HTMLElement>(null)
  const tiersRef = useRef<HTMLElement>(null)
  const primarySecondaryRef = useRef<HTMLElement>(null)
  const bringYourOwnRef = useRef<HTMLElement>(null)
  const coverageRef = useRef<HTMLElement>(null)
  const deductiblesRef = useRef<HTMLElement>(null)
  const fnolRef = useRef<HTMLElement>(null)
  const lapseRef = useRef<HTMLElement>(null)
  const guestRef = useRef<HTMLElement>(null)
  const faqRef = useRef<HTMLElement>(null)

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const refMap: Record<string, React.RefObject<HTMLElement | null>> = {
      overview: overviewRef,
      tiers: tiersRef,
      'primary-secondary': primarySecondaryRef,
      'bring-your-own': bringYourOwnRef,
      coverage: coverageRef,
      deductibles: deductiblesRef,
      fnol: fnolRef,
      lapse: lapseRef,
      guest: guestRef,
      faq: faqRef
    }
    
    const targetRef = refMap[sectionId]
    if (targetRef?.current) {
      const yOffset = -180
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const sections = [
      { id: 'overview', ref: overviewRef },
      { id: 'tiers', ref: tiersRef },
      { id: 'primary-secondary', ref: primarySecondaryRef },
      { id: 'bring-your-own', ref: bringYourOwnRef },
      { id: 'coverage', ref: coverageRef },
      { id: 'deductibles', ref: deductiblesRef },
      { id: 'fnol', ref: fnolRef },
      { id: 'lapse', ref: lapseRef },
      { id: 'guest', ref: guestRef },
      { id: 'faq', ref: faqRef }
    ]

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.ref.current) {
          if (scrollPosition >= section.ref.current.offsetTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { id: 'overview', label: t('navOverview') },
    { id: 'tiers', label: t('navTiers') },
    { id: 'primary-secondary', label: t('navPrimarySecondary') },
    { id: 'bring-your-own', label: t('navBringYourOwn') },
    { id: 'coverage', label: t('navCoverage') },
    { id: 'deductibles', label: t('navDeductibles') },
    { id: 'fnol', label: t('navFnol') },
    { id: 'lapse', label: t('navLapse') },
    { id: 'guest', label: t('navGuest') },
    { id: 'faq', label: t('navFaqs') }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Page Header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host/insurance-options" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('navHostInsuranceTiers')}
              </Link>
              <Link href="/support/insurance" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('navInsuranceSupport')}
              </Link>
              <Link href="/list-your-car" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('navStartHosting')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="fixed top-[106px] md:top-[112px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 pb-px">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mt-[150px] md:mt-[156px]">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('heroTitle')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                <span>{t('heroFeature1')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                <span>{t('heroFeature2')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                <span>{t('heroFeature3')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Banner */}
        <section className="py-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('quickLinksLabel')}</span>
              <Link
                href="/host/insurance-options"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                {t('quickLinksTiers')}
              </Link>
              <Link
                href="/support/insurance"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              >
                <IoHelpCircleOutline className="w-4 h-4" />
                {t('quickLinksSupport')}
              </Link>
              <Link
                href="/host-protection"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
              >
                <IoLayersOutline className="w-4 h-4" />
                {t('quickLinksProtection')}
              </Link>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section ref={overviewRef} id="overview" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('overviewTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('overviewSubtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('overviewSimpleVersion')}
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  {t('overviewSimpleText1')}
                </p>
                <p>
                  {t('overviewSimpleText2')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoLayersOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('tierSystemTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('tierSystemDesc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoSwapHorizontalOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('primarySecondaryTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('primarySecondaryDesc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('alwaysCoveredTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('alwaysCoveredDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Tiers Section */}
        <section ref={tiersRef} id="tiers" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('tiersTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('tiersSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* BASIC Tier */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-gray-300">
                <div className="bg-gray-500 text-white py-3 px-6 text-center">
                  <span className="text-sm font-bold">{t('basicTierLabel')}</span>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-gray-600 mb-2">{t('basicTierPercentage')}</div>
                    <div className="text-sm text-gray-500">{t('basicTierKeep')}</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('basicTierPoint1Title')}</div>
                        <div className="text-sm text-gray-500">{t('basicTierPoint1Desc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('basicTierPoint2Title')}</div>
                        <div className="text-sm text-gray-500">{t('basicTierPoint2Desc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('basicTierPoint3Title')}</div>
                        <div className="text-sm text-gray-500">{t('basicTierPoint3Desc')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('basicTierBestFor')}
                    </div>
                  </div>
                </div>
              </div>

              {/* STANDARD Tier */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-amber-500 relative">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {t('standardTierPopular')}
                </div>
                <div className="bg-amber-500 text-white py-3 px-6 text-center">
                  <span className="text-sm font-bold">{t('standardTierLabel')}</span>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-amber-600 mb-2">{t('standardTierPercentage')}</div>
                    <div className="text-sm text-gray-500">{t('standardTierKeep')}</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('standardTierPoint1Title')}</div>
                        <div className="text-sm text-gray-500">{t('standardTierPoint1Desc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('standardTierPoint2Title')}</div>
                        <div className="text-sm text-gray-500">{t('standardTierPoint2Desc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('standardTierPoint3Title')}</div>
                        <div className="text-sm text-gray-500">{t('standardTierPoint3Desc')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('standardTierBestFor')}
                    </div>
                  </div>
                </div>
              </div>

              {/* PREMIUM Tier */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-emerald-500">
                <div className="bg-emerald-500 text-white py-3 px-6 text-center">
                  <span className="text-sm font-bold">{t('premiumTierLabel')}</span>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-emerald-600 mb-2">{t('premiumTierPercentage')}</div>
                    <div className="text-sm text-gray-500">{t('premiumTierKeep')}</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('premiumTierPoint1Title')}</div>
                        <div className="text-sm text-gray-500">{t('premiumTierPoint1Desc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('premiumTierPoint2Title')}</div>
                        <div className="text-sm text-gray-500">{t('premiumTierPoint2Desc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{t('premiumTierPoint3Title')}</div>
                        <div className="text-sm text-gray-500">{t('premiumTierPoint3Desc')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('premiumTierBestFor')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Example */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                {t('earningsExampleTitle')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">{t('earningsTableScenario')}</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">{t('earningsTableBasic')}</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-amber-600">{t('earningsTableStandard')}</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-emerald-600">{t('earningsTablePremium')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{t('earningsTableTrip')}</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-gray-600">$40</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-amber-600">$75</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-emerald-600">$90</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{t('earningsTableMonthly')}</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-gray-600">$600</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-amber-600">$1,125</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-emerald-600">$1,350</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{t('earningsTableAnnual')}</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-gray-600">$7,200</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-amber-600">$13,500</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-emerald-600">$16,200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                {t('earningsNote')}
              </p>
            </div>
          </div>
        </section>

        {/* Primary vs Secondary Section */}
        <section ref={primarySecondaryRef} id="primary-secondary" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('primarySecondaryTitle2')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('primarySecondarySubtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('whatIsPrimary')}
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  {t('whatIsPrimaryText1')}
                </p>
                <p>
                  {t('whatIsPrimaryText2')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  {t('basicTierLabel2')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded">{t('basicTierPrimaryLabel')}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('basicTierPrimaryDesc')}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('basicTierExplain')}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  {t('standardTierLabel2')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-amber-600 px-2 py-0.5 rounded">{t('standardTierPrimaryLabel')}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('standardTierPrimaryDesc')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 bg-gray-300 px-2 py-0.5 rounded">{t('standardTierSecondaryLabel')}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('standardTierSecondaryDesc')}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('standardTierExplain')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 mb-8">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                {t('premiumTierLabel2')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">{t('premiumTierPrimaryLabel')}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('premiumTierPrimaryDesc')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600 bg-gray-300 px-2 py-0.5 rounded">{t('premiumTierSecondaryLabel')}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('premiumTierSecondaryDesc')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('premiumTierExplain')}
                </p>
              </div>
            </div>

            {/* The Insurance Hierarchy */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('hierarchyTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('hierarchyText')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t('hierarchyStep1')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('hierarchyStep1Desc')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t('hierarchyStep2')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('hierarchyStep2Desc')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t('hierarchyStep3')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('hierarchyStep3Desc')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bring Your Own Insurance Section */}
        <section ref={bringYourOwnRef} id="bring-your-own" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('bringYourOwnTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('bringYourOwnSubtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('processTitle')}
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('processStep1Title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t('processStep1Text')}
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('processStep1Option1')}</li>
                      <li>• {t('processStep1Option2')}</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('processStep2Title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('processStep2Text')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('processStep3Title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('processStep3Text')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('processStep4Title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('processStep4Text')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                  <IoRibbonOutline className="w-6 h-6" />
                  {t('tier75Title')}
                </h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>{t('tier75Accepted')}</strong></p>
                  <p className="ml-4">{t('tier75Providers')}</p>
                  <p className="mt-4">
                    <strong>{t('tier75Minimum')}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                  <IoDiamondOutline className="w-6 h-6" />
                  {t('tier90Title')}
                </h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>{t('tier90Requirements')}</strong></p>
                  <p className="ml-4">{t('tier90RequirementsList')}</p>
                  <p className="mt-4">
                    <strong>{t('tier90Minimum')}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <div className="flex gap-3">
                <IoWarningOutline className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                    {t('personalPolicyWarningTitle')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('personalPolicyWarningText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Details Section */}
        <section ref={coverageRef} id="coverage" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('coverageTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('coverageSubtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="bg-green-500 text-white py-3 px-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <IoCheckmarkCircle className="w-5 h-5" />
                  {t('whatIsCoveredTitle')}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('liabilityTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('liabilityPoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('liabilityPoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('liabilityPoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('liabilityPoint4')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('physicalDamageTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('physicalDamagePoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('physicalDamagePoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('physicalDamagePoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('physicalDamagePoint4')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('additionalBenefitsTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('additionalBenefitsPoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('additionalBenefitsPoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('additionalBenefitsPoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('additionalBenefitsPoint4')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('roadsideServicesTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('roadsideServicesPoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('roadsideServicesPoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('roadsideServicesPoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t('roadsideServicesPoint4')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-red-500 text-white py-3 px-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <IoCloseCircleOutline className="w-5 h-5" />
                  {t('whatIsNotCoveredTitle')}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('mechanicalIssuesTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('mechanicalIssuesPoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('mechanicalIssuesPoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('mechanicalIssuesPoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('mechanicalIssuesPoint4')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('personalPropertyTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('personalPropertyPoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('personalPropertyPoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('personalPropertyPoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('personalPropertyPoint4')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('driverBehaviorTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('driverBehaviorPoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('driverBehaviorPoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('driverBehaviorPoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('driverBehaviorPoint4')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('prohibitedUseTitle')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('prohibitedUsePoint1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('prohibitedUsePoint2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('prohibitedUsePoint3')}
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {t('prohibitedUsePoint4')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deductibles Section */}
        <section ref={deductiblesRef} id="deductibles" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('deductiblesTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('deductiblesSubtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('plainEnglish')}
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  {t('deductibleExplain')}
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">{t('whyLowerDeductibles')}</strong>
                </p>
                <p>
                  {t('whyLowerDeductiblesAnswer')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center border-2 border-gray-300">
                <div className="text-sm font-bold text-gray-500 mb-2">BASIC (40%)</div>
                <div className="text-4xl font-black text-gray-600 mb-2">{t('basicDeductible')}</div>
                <div className="text-sm text-gray-500">{t('deductibleLabel')}</div>
                <div className="mt-4 text-xs text-gray-500">
                  {t('basicDeductibleNote')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center border-2 border-amber-500">
                <div className="text-sm font-bold text-amber-500 mb-2">STANDARD (75%)</div>
                <div className="text-4xl font-black text-amber-600 mb-2">{t('standardDeductible')}</div>
                <div className="text-sm text-gray-500">{t('deductibleLabel')}</div>
                <div className="mt-4 text-xs text-gray-500">
                  {t('standardDeductibleNote')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center border-2 border-emerald-500">
                <div className="text-sm font-bold text-emerald-500 mb-2">PREMIUM (90%)</div>
                <div className="text-4xl font-black text-emerald-600 mb-2">{t('premiumDeductible')}</div>
                <div className="text-sm text-gray-500">{t('deductibleLabel')}</div>
                <div className="mt-4 text-xs text-gray-500">
                  {t('premiumDeductibleNote')}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                <IoHelpCircleOutline className="w-6 h-6" />
                {t('tierComparisonTitle')}
              </h4>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {t('tierComparisonBasic')}
                </p>
                <p>
                  {t('tierComparisonTiers')}
                </p>
                <p className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  {t('tierComparisonConclusion')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FNOL Section */}
        <section ref={fnolRef} id="fnol" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('fnolTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('fnolSubtitle')}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-400 mb-4">
                {t('whatIsFnol')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('whatIsFnolText1')}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t('whatIsFnolText2')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('timelineTitle')}
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoFlashOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('timelineStep1')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('timelineStep1Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoSearchOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('timelineStep2')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('timelineStep2Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoDocumentOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('timelineStep3')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('timelineStep3Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoSettingsOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('timelineStep4')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('timelineStep4Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {t('fnolCollectTitle')}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <IoCameraOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fnolCollectPoint1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoDocumentTextOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fnolCollectPoint2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCarOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fnolCollectPoint3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoReceiptOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fnolCollectPoint4')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoPeopleOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fnolCollectPoint5')}
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {t('fdcrIncludesTitle')}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <IoTrendingUpOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fdcrIncludesPoint1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fdcrIncludesPoint2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoTimeOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fdcrIncludesPoint3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoLeafOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fdcrIncludesPoint4')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoLockClosedOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    {t('fdcrIncludesPoint5')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Lapse Section */}
        <section ref={lapseRef} id="lapse" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('lapseTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('lapseSubtitle')}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-8 mb-8">
              <div className="flex gap-4">
                <IoAlertCircleOutline className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
                    {t('lapseSerious')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('lapseSeriousText')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('ifLapsesTitle')}
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('ifLapsesStep1')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('ifLapsesStep1Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('ifLapsesStep2')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('ifLapsesStep2Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('ifLapsesStep3')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('ifLapsesStep3Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('ifLapsesStep4')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('ifLapsesStep4Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                  <IoCheckmarkCircle className="w-6 h-6" />
                  {t('howToAvoid')}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• {t('howToAvoidPoint1')}</li>
                  <li>• {t('howToAvoidPoint2')}</li>
                  <li>• {t('howToAvoidPoint3')}</li>
                  <li>• {t('howToAvoidPoint4')}</li>
                  <li>• {t('howToAvoidPoint5')}</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <IoRefreshOutline className="w-6 h-6" />
                  {t('howToRestore')}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• {t('howToRestorePoint1')}</li>
                  <li>• {t('howToRestorePoint2')}</li>
                  <li>• {t('howToRestorePoint3')}</li>
                  <li>• {t('howToRestorePoint4')}</li>
                  <li>• {t('howToRestorePoint5')}</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t('trackingTitle')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('trackingText')}
              </p>
            </div>
          </div>
        </section>

        {/* Guest Insurance Section */}
        <section ref={guestRef} id="guest" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('guestTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('guestSubtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('guestAlreadyCovered')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('guestAlreadyCoveredText')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {t('withoutPersonal')}
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t('withoutPersonalPoint1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t('withoutPersonalPoint2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t('withoutPersonalPoint3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {t('withoutPersonalPoint4')}
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {t('withPersonal')}
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t('withPersonalPoint1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <strong className="text-green-600">{t('withPersonalPoint2')}</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t('withPersonalPoint3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t('withPersonalPoint4')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-4">
                {t('howGuestsAddInsurance')}
              </h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>{t('howGuestsAddStep1')}</li>
                <li>{t('howGuestsAddStep2')}</li>
                <li>{t('howGuestsAddStep3')}</li>
                <li>{t('howGuestsAddStep4')}</li>
              </ol>
              <p className="mt-4 text-sm text-gray-500">
                {t('howGuestsAddNote')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} id="faq" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('faqsTitle')}
              </h2>
            </div>

            <div className="space-y-4">
              <FAQItem
                question={t('faqQ1')}
                answer={t('faqA1')}
              />
              <FAQItem
                question={t('faqQ2')}
                answer={t('faqA2')}
              />
              <FAQItem
                question={t('faqQ3')}
                answer={`${t('faqA3Part1')}\n\n${t('faqA3Part2')}`}
              />
              <FAQItem
                question={t('faqQ4')}
                answer={`${t('faqA4Step1')}\n\n${t('faqA4Step2')}\n${t('faqA4Step3')}\n${t('faqA4Step4')}\n${t('faqA4Step5')}\n\n${t('faqA4Conclusion')}`}
              />
              <FAQItem
                question={t('faqQ5')}
                answer={t('faqA5')}
              />
              <FAQItem
                question={t('faqQ6')}
                answer={t('faqA6')}
              />
              <FAQItem
                question={t('faqQ7')}
                answer={`${t('faqA7Part1')}\n\n• ${t('faqA7Point1')}\n• ${t('faqA7Point2')}\n• ${t('faqA7Point3')}\n• ${t('faqA7Point4')}\n\n${t('faqA7Conclusion')}`}
              />
              <FAQItem
                question={t('faqQ8')}
                answer={t('faqA8')}
              />
              <FAQItem
                question={t('faqQ9')}
                answer={t('faqA9')}
              />
              <FAQItem
                question={t('faqQ10')}
                answer={`${t('faqA10Part1')}\n\n• ${t('faqA10Point1')}\n• ${t('faqA10Point2')}\n• ${t('faqA10Point3')}\n• ${t('faqA10Point4')}\n• ${t('faqA10Point5')}\n\n${t('faqA10Conclusion')}`}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              {t('ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/list-your-car"
                className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                {t('ctaPrimaryButton')}
              </Link>
              <Link
                href="/host/insurance-options"
                className="inline-block px-8 py-4 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition border border-purple-400"
              >
                {t('ctaSecondaryButton')}
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/support/insurance" className="text-purple-200 hover:text-white transition">
                {t('ctaBottomLink1')}
              </Link>
              <Link href="/host-protection" className="text-purple-200 hover:text-white transition">
                {t('ctaBottomLink2')}
              </Link>
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('legalTitle')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('legalText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}