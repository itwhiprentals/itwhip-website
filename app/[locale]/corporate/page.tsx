// app/corporate/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoBusinessOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoGlobeOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoStatsChartOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoRocketOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoServerOutline,
  IoCashOutline,
  IoAnalyticsOutline,
  IoLockClosedOutline,
  IoCloudOutline,
  IoConstructOutline,
  IoSparklesOutline,
  IoAirplaneOutline,
  IoBusOutline,
  IoAddCircleOutline,
  IoSwapHorizontalOutline,
  IoCheckmarkOutline,
  IoArrowForwardOutline,
  IoTrendingDownOutline,
  IoReceiptOutline,
  IoLayersOutline,
  IoWarningOutline,
  IoCartOutline,
  IoStorefrontOutline,
  IoLeafOutline,
  IoBarChartOutline,
  IoAlertCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFlashOutline,
  IoRefreshOutline,
  IoNotificationsOutline,
  IoEarthOutline,
  IoPulseOutline,
  IoExtensionPuzzleOutline,
  IoCarOutline,
  IoCalculatorOutline,
  IoPlayCircleOutline,
  IoTimerOutline,
  IoDiamondOutline,
  IoTrophyOutline,
  IoFlameOutline,
  IoCloseCircleOutline,
  IoBanOutline,
  IoGiftOutline
} from 'react-icons/io5'

export default function CorporatePage() {
  const t = useTranslations('Corporate')
  const router = useRouter()
  
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('qualifier')
  const [dashboardView, setDashboardView] = useState<'corporate' | 'hotel' | 'flow'>('corporate')
  const [animationStep, setAnimationStep] = useState(0)
  const [savingsCounter, setSavingsCounter] = useState(0)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [liveNotification, setLiveNotification] = useState(0)
  const [ghostActivity, setGhostActivity] = useState(0)
  
  // Qualifier state
  const [userType, setUserType] = useState<'corporate' | 'hotel' | 'cfo' | null>(null)
  const [situation, setSituation] = useState<'have-rates' | 'need-everything' | 'want-savings' | null>(null)
  const [spendLevel, setSpendLevel] = useState<'under-1m' | '1m-5m' | 'over-5m' | null>(null)
  const [showCustomResults, setShowCustomResults] = useState(false)
  
  // Calculator state
  const [hotelDiscount, setHotelDiscount] = useState(30)
  const [monthlySpend, setMonthlySpend] = useState(50000)
  
  // Section refs
  const qualifierRef = useRef<HTMLDivElement>(null)
  const problemRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const transportRef = useRef<HTMLDivElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const partnersRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  // Handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, section: string) => {
    setActiveSection(section)
    if (ref.current) {
      const yOffset = -170
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleQualifierSubmit = () => {
    if (userType && situation && spendLevel) {
      setShowCustomResults(true)
      scrollToSection(dashboardRef, 'dashboard')
    }
  }

  const calculateSavings = () => {
    const transportSpend = monthlySpend * 0.3 // Assume 30% is transport
    const savings = transportSpend * (hotelDiscount / 100)
    return Math.round(savings)
  }

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveNotification((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setGhostActivity((prev) => (prev + 1) % 6)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const target = 900000
    const increment = target / 100
    const timer = setInterval(() => {
      setSavingsCounter((prev) => {
        if (prev < target) {
          return Math.min(prev + increment, target)
        }
        return prev
      })
    }, 20)
    return () => clearInterval(timer)
  }, [])

  // Data
  const ghostActivities = [
    t('ghostActivity1'),
    t('ghostActivity2'),
    t('ghostActivity3'),
    t('ghostActivity4'),
    t('ghostActivity5'),
    t('ghostActivity6')
  ]

  const problems = [
    {
      icon: IoReceiptOutline,
      titleKey: 'problem1Title',
      descKey: 'problem1Desc',
      impactKey: 'problem1Impact'
    },
    {
      icon: IoWarningOutline,
      titleKey: 'problem2Title',
      descKey: 'problem2Desc',
      impactKey: 'problem2Impact'
    },
    {
      icon: IoLeafOutline,
      titleKey: 'problem3Title',
      descKey: 'problem3Desc',
      impactKey: 'problem3Impact'
    },
    {
      icon: IoAlertCircleOutline,
      titleKey: 'problem4Title',
      descKey: 'problem4Desc',
      impactKey: 'problem4Impact'
    },
    {
      icon: IoCarOutline,
      titleKey: 'problem5Title',
      descKey: 'problem5Desc',
      impactKey: 'problem5Impact'
    },
    {
      icon: IoLocationOutline,
      titleKey: 'problem6Title',
      descKey: 'problem6Desc',
      impactKey: 'problem6Impact'
    }
  ]

  const transportSolutions = [
    {
      titleKey: 'transportSol1Title',
      icon: IoExtensionPuzzleOutline,
      descKey: 'transportSol1Desc',
      featureKeys: ['transportSol1F1', 'transportSol1F2', 'transportSol1F3', 'transportSol1F4'],
      bestForKey: 'transportSol1Best'
    },
    {
      titleKey: 'transportSol2Title',
      icon: IoConstructOutline,
      descKey: 'transportSol2Desc',
      featureKeys: ['transportSol2F1', 'transportSol2F2', 'transportSol2F3', 'transportSol2F4'],
      bestForKey: 'transportSol2Best'
    },
    {
      titleKey: 'transportSol3Title',
      icon: IoBusinessOutline,
      descKey: 'transportSol3Desc',
      featureKeys: ['transportSol3F1', 'transportSol3F2', 'transportSol3F3', 'transportSol3F4'],
      bestForKey: 'transportSol3Best'
    }
  ]

  const comparisons = {
    tmc: [
      { featureKey: 'tmcSetupTime', tmcKey: 'tmcSetupTimeTMC', itwhipKey: 'tmcSetupTimeIW', winner: 'itwhip' },
      { featureKey: 'tmcRateUpdates', tmcKey: 'tmcRateUpdatesTMC', itwhipKey: 'tmcRateUpdatesIW', winner: 'itwhip' },
      { featureKey: 'tmcTransportation', tmcKey: 'tmcTransportationTMC', itwhipKey: 'tmcTransportationIW', winner: 'itwhip' },
      { featureKey: 'tmcBookingFees', tmcKey: 'tmcBookingFeesTMC', itwhipKey: 'tmcBookingFeesIW', winner: 'itwhip' },
      { featureKey: 'tmcHotelsEarn', tmcKey: 'tmcHotelsEarnTMC', itwhipKey: 'tmcHotelsEarnIW', winner: 'itwhip' },
      { featureKey: 'tmcESG', tmcKey: 'tmcESGTMC', itwhipKey: 'tmcESGIW', winner: 'itwhip' },
      { featureKey: 'tmcCompliance', tmcKey: 'tmcComplianceTMC', itwhipKey: 'tmcComplianceIW', winner: 'itwhip' }
    ],
    uber: [
      { featureKey: 'uberSurge', uberKey: 'uberSurgeUber', itwhipKey: 'uberSurgeIW', winner: 'itwhip' },
      { featureKey: 'uberCorpRates', uberKey: 'uberCorpRatesUber', itwhipKey: 'uberCorpRatesIW', winner: 'itwhip' },
      { featureKey: 'uberHotelInteg', uberKey: 'uberHotelIntegUber', itwhipKey: 'uberHotelIntegIW', winner: 'itwhip' },
      { featureKey: 'uberDriverQuality', uberKey: 'uberDriverQualityUber', itwhipKey: 'uberDriverQualityIW', winner: 'itwhip' },
      { featureKey: 'uberHotelRevenue', uberKey: 'uberHotelRevenueUber', itwhipKey: 'uberHotelRevenueIW', winner: 'itwhip' },
      { featureKey: 'uberAvailability', uberKey: 'uberAvailabilityUber', itwhipKey: 'uberAvailabilityIW', winner: 'itwhip' },
      { featureKey: 'uberInvoice', uberKey: 'uberInvoiceUber', itwhipKey: 'uberInvoiceIW', winner: 'itwhip' }
    ],
    manual: [
      { featureKey: 'manualBookingTime', manualKey: 'manualBookingTimeManual', itwhipKey: 'manualBookingTimeIW', winner: 'itwhip' },
      { featureKey: 'manualRateAccess', manualKey: 'manualRateAccessManual', itwhipKey: 'manualRateAccessIW', winner: 'itwhip' },
      { featureKey: 'manualInvoicing', manualKey: 'manualInvoicingManual', itwhipKey: 'manualInvoicingIW', winner: 'itwhip' },
      { featureKey: 'manualCompliance', manualKey: 'manualComplianceManual', itwhipKey: 'manualComplianceIW', winner: 'itwhip' },
      { featureKey: 'manualVisibility', manualKey: 'manualVisibilityManual', itwhipKey: 'manualVisibilityIW', winner: 'itwhip' },
      { featureKey: 'manualCostSavings', manualKey: 'manualCostSavingsManual', itwhipKey: 'manualCostSavingsIW', winner: 'itwhip' },
      { featureKey: 'manualESG', manualKey: 'manualESGManual', itwhipKey: 'manualESGIW', winner: 'itwhip' }
    ]
  }

  const revenueScenarios = [
    {
      titleKey: 'scenario1Title',
      icon: IoBusinessOutline,
      entryKey: 'scenario1Entry',
      payKey: 'scenario1Pay',
      benefitKeys: ['scenario1B1', 'scenario1B2', 'scenario1B3'],
      color: 'blue'
    },
    {
      titleKey: 'scenario2Title',
      icon: IoStorefrontOutline,
      entryKey: 'scenario2Entry',
      payKey: 'scenario2Pay',
      benefitKeys: ['scenario2B1', 'scenario2B2', 'scenario2B3'],
      color: 'green'
    },
    {
      titleKey: 'scenario3Title',
      icon: IoRocketOutline,
      entryKey: 'scenario3Entry',
      payKey: 'scenario3Pay',
      benefitKeys: ['scenario3B1', 'scenario3B2', 'scenario3B3'],
      color: 'purple'
    },
    {
      titleKey: 'scenario4Title',
      icon: IoBanOutline,
      entryKey: 'scenario4Entry',
      payKey: 'scenario4Pay',
      benefitKeys: ['scenario4B1', 'scenario4B2', 'scenario4B3'],
      color: 'red'
    }
  ]

  const notifications = [
    { companyKey: 'notifCompany1', saved: 127, hotelKey: 'notifHotel1', earned: 19.05 },
    { companyKey: 'notifCompany2', saved: 89, hotelKey: 'notifHotel2', earned: 13.35 },
    { companyKey: 'notifCompany3', saved: 156, hotelKey: 'notifHotel3', earned: 23.40 }
  ]

  const currentNotification = notifications[liveNotification]

  const corporateRates = [
    { companyKey: 'corpRate1', rate: '-30%', properties: 127, status: 'active' },
    { companyKey: 'corpRate2', rate: '-25%', properties: 89, status: 'active' },
    { companyKey: 'corpRate3', rate: '-35%', properties: 76, status: 'active' },
    { companyKey: 'corpRate4', rate: t('corpRateBusiness'), properties: 'Global', status: 'active' },
    { companyKey: 'corpRate5', rate: '$45/day', properties: t('corpRateAllLocations'), status: 'active' }
  ]

  const hotelRates = [
    { companyKey: 'hotelRateCompanyA', rate: '-30%', rides: 234, revenue: 3510 },
    { companyKey: 'hotelRateCompanyB', rate: '-25%', rides: 189, revenue: 2835 },
    { companyKey: 'hotelRateCompanyC', rate: '-35%', rides: 167, revenue: 2505 },
    { companyKey: 'hotelRateCompanyD', rate: '-20%', rides: 145, revenue: 2175 }
  ]

  const plans = [
    {
      nameKey: 'planStarterName',
      priceKey: 'planStarterPrice',
      periodKey: 'planStarterPeriod',
      usersKey: 'planStarterUsers',
      featureKeys: ['planStarterF1', 'planStarterF2', 'planStarterF3', 'planStarterF4', 'planStarterF5', 'planStarterF6'],
      savingsKey: 'planStarterSavings',
      highlight: false
    },
    {
      nameKey: 'planBusinessName',
      priceKey: 'planBusinessPrice',
      periodKey: 'planBusinessPeriod',
      usersKey: 'planBusinessUsers',
      featureKeys: ['planBusinessF1', 'planBusinessF2', 'planBusinessF3', 'planBusinessF4', 'planBusinessF5', 'planBusinessF6', 'planBusinessF7', 'planBusinessF8'],
      savingsKey: 'planBusinessSavings',
      highlight: true
    },
    {
      nameKey: 'planEnterpriseName',
      priceKey: 'planEnterprisePrice',
      periodKey: 'planEnterprisePeriod',
      usersKey: 'planEnterpriseUsers',
      featureKeys: ['planEnterpriseF1', 'planEnterpriseF2', 'planEnterpriseF3', 'planEnterpriseF4', 'planEnterpriseF5', 'planEnterpriseF6', 'planEnterpriseF7', 'planEnterpriseF8'],
      savingsKey: 'planEnterpriseSavings',
      highlight: false
    }
  ]

  const faqs = [
    { questionKey: 'faq1Q', answerKey: 'faq1A' },
    { questionKey: 'faq2Q', answerKey: 'faq2A' },
    { questionKey: 'faq3Q', answerKey: 'faq3A' },
    { questionKey: 'faq4Q', answerKey: 'faq4A' },
    { questionKey: 'faq5Q', answerKey: 'faq5A' },
    { questionKey: 'faq6Q', answerKey: 'faq6A' },
    { questionKey: 'faq7Q', answerKey: 'faq7A' },
    { questionKey: 'faq8Q', answerKey: 'faq8A' },
    { questionKey: 'faq9Q', answerKey: 'faq9A' },
    { questionKey: 'faq10Q', answerKey: 'faq10A' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Bar */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoBusinessOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => scrollToSection(dashboardRef, 'dashboard')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600"
              >
                {t('liveDemo')}
              </button>
              <button 
                onClick={() => scrollToSection(comparisonRef, 'comparison')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600"
              >
                {t('compare')}
              </button>
              <button
                onClick={() => scrollToSection(pricingRef, 'pricing')}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600"
              >
                {t('pricing')}
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {t('calculateROI')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost Activity Ticker */}
      <div className="fixed bottom-4 right-4 z-40 hidden lg:block">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-3 max-w-sm transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {ghostActivities[ghostActivity]}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <button 
                onClick={() => scrollToSection(qualifierRef, 'qualifier')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'qualifier' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoCalculatorOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('qualify')}</span>
              </button>
              <button 
                onClick={() => scrollToSection(dashboardRef, 'dashboard')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'dashboard' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoStatsChartOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('demo')}</span>
              </button>
              <button 
                onClick={() => scrollToSection(comparisonRef, 'comparison')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'comparison' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('compare')}</span>
              </button>
              <button 
                onClick={() => scrollToSection(pricingRef, 'pricing')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'pricing' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoReceiptOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('pricing')}</span>
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoCallOutline className="w-4 h-4 flex-shrink-0" />
                <span>{t('getROI')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-[145px] md:pt-[105px]">
        
        {/* Qualifier Section */}
        <section ref={qualifierRef} className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium mb-4">
                <IoGiftOutline className="w-4 h-4 mr-1" />
                {t('pilotBadge')}
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t('heroTitle')}
                <span className="block text-blue-600 mt-2">{t('heroSubtitle')}</span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {t('heroDescription')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Question 1 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('qualifierQ1')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setUserType('corporate')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      userType === 'corporate' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg transform scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <IoPeopleOutline className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{t('corporateTravelManager')}</span>
                  </button>
                  <button
                    onClick={() => setUserType('hotel')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      userType === 'hotel' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg transform scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <IoBusinessOutline className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{t('hotelRevenueManager')}</span>
                  </button>
                  <button
                    onClick={() => setUserType('cfo')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      userType === 'cfo' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg transform scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <IoWalletOutline className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{t('cfoFinance')}</span>
                  </button>
                </div>
              </div>

              {/* Question 2 */}
              {userType && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('qualifierQ2')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSituation('have-rates')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        situation === 'have-rates' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <IoCheckmarkCircle className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">{t('haveRates')}</span>
                    </button>
                    <button
                      onClick={() => setSituation('need-everything')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        situation === 'need-everything' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <IoRocketOutline className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">{t('needComplete')}</span>
                    </button>
                    <button
                      onClick={() => setSituation('want-savings')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        situation === 'want-savings' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <IoTrendingDownOutline className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">{t('wantCutCosts')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Question 3 */}
              {situation && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('qualifierQ3')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSpendLevel('under-1m')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        spendLevel === 'under-1m' 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm font-medium">{t('spendUnder1M')}</span>
                    </button>
                    <button
                      onClick={() => setSpendLevel('1m-5m')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        spendLevel === '1m-5m'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg transform scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm font-medium">{t('spend1Mto5M')}</span>
                    </button>
                    <button
                      onClick={() => setSpendLevel('over-5m')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        spendLevel === 'over-5m'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg transform scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm font-medium">{t('spendOver5M')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {spendLevel && (
                <div className="text-center">
                  <button
                    onClick={handleQualifierSubmit}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <IoCalculatorOutline className="inline w-5 h-5 mr-2" />
                    {t('getCustomROI')}
                  </button>
                  
                  {showCustomResults && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-green-700 dark:text-green-300 font-semibold">
                        {t('qualifierResultIntro')}
                      </p>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {spendLevel === 'under-1m' ? t('qualifierResultSavings180K') : spendLevel === '1m-5m' ? t('qualifierResultSavings900K') : t('qualifierResultSavings2_3M')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {t('qualifierResultScroll')} &rarr;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pilot Program Badge */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium shadow-lg">
                <IoTimerOutline className="w-4 h-4 mr-2" />
                {t('pilotProgramBadge')}
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-4">
                <IoCarOutline className="w-4 h-4 mr-1" />
                {t('missing30Badge')}
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('heroTitle2')}
                <span className="block text-blue-600 mt-2">{t('heroSubtitle2')}</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                {t('heroP1')}<br/>
                {t('heroP2')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{t('heroCardHotels')} ✓</div>
                  <div className="text-xs text-gray-500">{t('heroCardHotelsCheck')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{t('heroCardFlights')} ✓</div>
                  <div className="text-xs text-gray-500">{t('heroCardFlightsCheck')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-500">
                  <IoCarOutline className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{t('heroCardTransport')} ✓</div>
                  <div className="text-xs text-blue-600 font-semibold">{t('heroCardTransportCheck')}</div>
                </div>
              </div>

              {/* Video Placeholder */}
              <div className="mb-8">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <IoPlayCircleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {t('videoTitle')}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{t('videoSubtitle')}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => scrollToSection(dashboardRef, 'dashboard')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {t('seeLiveDemo')}
                </button>
                <button 
                  onClick={() => router.push('/contact')}
                  className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  {t('calculateSavings')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section ref={problemRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('problemTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('problemSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <problem.icon className="w-10 h-10 text-red-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t(problem.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t(problem.descKey)}
                  </p>
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {t(problem.impactKey)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center shadow-lg border border-red-200 dark:border-red-800">
              <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
                {t('totalAnnualImpact')}
              </h3>
              <div className="flex items-center justify-center space-x-8">
                <div>
                  <div className="text-3xl font-bold text-red-600">-$2.3M</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('directCosts')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">44%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('nonCompliance')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">0%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('transportControl')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Calculator Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                {t('calcTitle')}
              </h2>
              <p className="text-base sm:text-lg text-blue-100">
                {t('calcSubtitle')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {t('calcHotelDiscount')}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={hotelDiscount}
                      onChange={(e) => setHotelDiscount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-white w-16 text-right">
                      {hotelDiscount}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {t('calcMonthlySpend')}
                  </label>
                  <input
                    type="number"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="text-center p-6 bg-white/20 rounded-lg">
                <p className="text-blue-100 mb-2">{t('calcMonthlyTransportSavings')}</p>
                <p className="text-4xl font-bold text-white mb-4">
                  ${calculateSavings().toLocaleString()}
                </p>
                <p className="text-blue-100">
                  {t('calcAnnualSavings')} <span className="font-bold">${(calculateSavings() * 12).toLocaleString()}</span>
                </p>
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => router.push('/contact')}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {t('calcGetFullROI')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Demo Section */}
        <section ref={dashboardRef} className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('dashboardTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                {t('dashboardSubtitle')}
              </p>
              
              <div className="inline-flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setDashboardView('corporate')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    dashboardView === 'corporate' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoPeopleOutline className="inline w-4 h-4 mr-1" />
                  {t('dashboardCorporateView')}
                </button>
                <button
                  onClick={() => setDashboardView('hotel')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    dashboardView === 'hotel'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoBusinessOutline className="inline w-4 h-4 mr-1" />
                  {t('dashboardHotelView')}
                </button>
                <button
                  onClick={() => setDashboardView('flow')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    dashboardView === 'flow'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoSwapHorizontalOutline className="inline w-4 h-4 mr-1" />
                  {t('dashboardSeeConnection')}
                </button>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {dashboardView === 'corporate' ? t('dashboardCorporateCenter') :
                         dashboardView === 'hotel' ? t('dashboardHotelPortal') :
                         t('dashboardRateFlow')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoFlashOutline className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-500">{t('dashboardRealTimeUpdates')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {dashboardView === 'corporate' && (
                    <div>
                      <div className="mb-4 inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        <IoCheckmarkCircle className="w-3 h-3 mr-1" />
                        {t('dashboardNoIntegration')}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t('dashboardRatesWorking')}
                      </h3>
                      
                      <div className="space-y-2 mb-6">
                        {corporateRates.map((rate, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${
                              animationStep === idx ? 'border-green-500 bg-green-50 dark:bg-green-900/20 transform scale-[1.02]' : 
                              'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{t(rate.companyKey)}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{rate.rate}</span>
                              <span className="text-sm font-semibold text-blue-600">
                                {t('dashboardAppliedTo')} {rate.properties} {typeof rate.properties === 'number' ? t('dashboardProperties') : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('dashboardLiveActivity')}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-500">{t('dashboardLiveTime')}:</span>
                            <div>
                              <span className="text-gray-900 dark:text-white">{t('dashboardLiveBooking')}</span>
                              <div className="text-xs text-gray-500 mt-1">
                                {t('dashboardLiveBookingDetail')} ✓
                                <span className="text-green-600 font-semibold ml-2">{t('dashboardLiveBookingSaved')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoTrendingDownOutline className="w-6 h-6 text-green-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${Math.floor(savingsCounter).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{t('dashboardAnnualSavings')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoCheckmarkCircle className="w-6 h-6 text-blue-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                          <div className="text-xs text-gray-500">{t('dashboardPolicyCompliance')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoLeafOutline className="w-6 h-6 text-green-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">A+</div>
                          <div className="text-xs text-gray-500">{t('dashboardESGScore')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoReceiptOutline className="w-6 h-6 text-purple-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
                          <div className="text-xs text-gray-500">{t('dashboardInvoiceCount')}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {dashboardView === 'hotel' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t('dashboardHotelTitle')}
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        {hotelRates.map((rate, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${
                              animationStep === idx ? 'border-green-500 bg-green-50 dark:bg-green-900/20 transform scale-[1.02]' : 
                              'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{t(rate.companyKey)}</div>
                              <div className="text-sm text-gray-500">{t('hotelRatePrefix')} {rate.rate}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400">{rate.rides} {t('ridesLabel')}</div>
                              <div className="text-lg font-semibold text-green-600">+${rate.revenue}{t('perMonth')}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6 border border-amber-200 dark:border-amber-800">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {t('dashboardRealtimeNotifications')}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <IoNotificationsOutline className="w-4 h-4 text-amber-600" />
                            <span className="text-gray-900 dark:text-white">
                              {t('dashboardNotif1')}
                            </span>
                            <span className="text-green-600 font-semibold">{t('dashboardNotif1Commission')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IoNotificationsOutline className="w-4 h-4 text-amber-600" />
                            <span className="text-gray-900 dark:text-white">
                              {t('dashboardNotif2')}
                            </span>
                            <span className="text-green-600 font-semibold">{t('dashboardNotif2Potential')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-green-200 dark:border-green-800">
                          <div className="text-2xl font-bold text-green-600">$8,850</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboardMonthlyRevenue')}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-blue-200 dark:border-blue-800">
                          <div className="text-2xl font-bold text-blue-600">+23%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboardGuestSatisfaction')}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {dashboardView === 'flow' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        {t('dashboardFlowTitle')}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 0 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{t('dashboardFlowStep1Title')}</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                            {t('dashboardFlowStep1Desc')}
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 1 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{t('dashboardFlowStep2Title')}</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                            {t('dashboardFlowStep2Desc')}
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 2 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{t('dashboardFlowStep3Title')}</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                            {t('dashboardFlowStep3Desc')}
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 3 ? 'border-green-500 bg-green-50 dark:bg-green-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{t('dashboardFlowStep4Title')}</h4>
                          </div>
                          <div className="ml-11 space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('dashboardFlowStep4Room')} ✓
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('dashboardFlowStep4Ride')} ✓
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              {t('dashboardFlowStep4Summary')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 dark:text-green-300">
                    {t(currentNotification.companyKey)} {t('notifEmployeeSaved')} ${currentNotification.saved} | {t(currentNotification.hotelKey)} {t('notifHotelEarned')} ${currentNotification.earned}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transportation Solution Section */}
        <section ref={transportRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('transportTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('transportSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {transportSolutions.map((solution, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <solution.icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t(solution.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t(solution.descKey)}
                  </p>
                  <ul className="space-y-2 mb-4">
                    {solution.featureKeys.map((featureKey, featureIdx) => (
                      <li key={featureIdx} className="flex items-start">
                        <IoCheckmarkOutline className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-blue-600">{t('transportBestFor')} {t(solution.bestForKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center">{t('transportCoverageTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <IoAirplaneOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">{t('transportAirport')}</h4>
                  <p className="text-sm text-blue-100">{t('transportAirportDesc')}</p>
                </div>
                <div className="text-center">
                  <IoCarOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">{t('transportLocal')}</h4>
                  <p className="text-sm text-blue-100">{t('transportLocalDesc')}</p>
                </div>
                <div className="text-center">
                  <IoPeopleOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">{t('transportGroup')}</h4>
                  <p className="text-sm text-blue-100">{t('transportGroupDesc')}</p>
                </div>
                <div className="text-center">
                  <IoShieldCheckmarkOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">{t('transportExec')}</h4>
                  <p className="text-sm text-blue-100">{t('transportExecDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section ref={comparisonRef} className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('comparisonTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('comparisonSubtitle')}
              </p>
            </div>

            {/* vs Traditional TMC */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {t('comparisonVsTMC')}
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonFeature')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonTMC')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonItWhip')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisons.tmc.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {t(item.featureKey)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'tmc' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner !== 'itwhip' && <IoCloseCircleOutline className="inline w-4 h-4 text-red-500 mr-1" />}
                              {t(item.tmcKey)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'itwhip' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner === 'itwhip' && <IoCheckmarkCircle className="inline w-4 h-4 text-green-500 mr-1" />}
                              {t(item.itwhipKey)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* vs Uber for Business */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {t('comparisonVsUber')}
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonFeature')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonUberBiz')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonItWhip')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisons.uber.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {t(item.featureKey)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'uber' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner !== 'uber' && <IoCloseCircleOutline className="inline w-4 h-4 text-red-500 mr-1" />}
                              {t(item.uberKey)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'itwhip' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner === 'itwhip' && <IoCheckmarkCircle className="inline w-4 h-4 text-green-500 mr-1" />}
                              {t(item.itwhipKey)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* vs Manual Booking */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {t('comparisonVsManual')}
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonFeature')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonManualBooking')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('comparisonItWhip')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisons.manual.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {t(item.featureKey)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'manual' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner !== 'manual' && <IoCloseCircleOutline className="inline w-4 h-4 text-red-500 mr-1" />}
                              {t(item.manualKey)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'itwhip' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner === 'itwhip' && <IoCheckmarkCircle className="inline w-4 h-4 text-green-500 mr-1" />}
                              {t(item.itwhipKey)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Scenarios Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('scenariosTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('scenariosSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {revenueScenarios.map((scenario, idx) => (
                <div key={idx} className={`bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 ${
                  scenario.color === 'blue' ? 'border-blue-500' :
                  scenario.color === 'green' ? 'border-green-500' :
                  scenario.color === 'purple' ? 'border-purple-500' :
                  'border-red-500'
                }`}>
                  <scenario.icon className={`w-10 h-10 mb-4 ${
                    scenario.color === 'blue' ? 'text-blue-600' :
                    scenario.color === 'green' ? 'text-green-600' :
                    scenario.color === 'purple' ? 'text-purple-600' :
                    'text-red-600'
                  }`} />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t(scenario.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t(scenario.entryKey)}
                  </p>
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('scenarioInvestment')} {t(scenario.payKey)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('scenarioKeyBenefits')}</p>
                    {scenario.benefitKeys.map((benefitKey, benefitIdx) => (
                      <div key={benefitIdx} className="flex items-start">
                        <IoCheckmarkOutline className="w-3 h-3 text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t(benefitKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center shadow-xl">
              <IoFlameOutline className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">{t('networkEffectTitle')}</h3>
              <p className="text-purple-100 max-w-2xl mx-auto mb-6">
                {t('networkEffectDesc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">{t('networkStep1')}</p>
                  <p className="text-sm text-purple-100">{t('networkStep1Desc')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{t('networkStep2')}</p>
                  <p className="text-sm text-purple-100">{t('networkStep2Desc')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{t('networkStep3')}</p>
                  <p className="text-sm text-purple-100">{t('networkStep3Desc')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{t('networkStep4')}</p>
                  <p className="text-sm text-purple-100">{t('networkStep4Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Benefits Section */}
        <section ref={partnersRef} className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('partnersTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('partnersSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center mb-6">
                  <IoBusinessOutline className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('partnersHotelTitle')}</h3>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('partnersGDSProblem')}</h4>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">{t('partnersCurrentReality')}</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('partnersGDS1')}</li>
                      <li>• {t('partnersGDS2')}</li>
                      <li>• {t('partnersGDS3')}</li>
                      <li>• {t('partnersGDS4')}</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">{t('partnersWithItWhip')}</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>✓ {t('partnersIW1')}</li>
                      <li>✓ {t('partnersIW2')}</li>
                      <li>✓ {t('partnersIW3')}</li>
                      <li>✓ {t('partnersIW4')}</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('partnersWhatTheyGet')}</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• {t('partnersGet1')}</li>
                    <li>• {t('partnersGet2')}</li>
                    <li>• {t('partnersGet3')}</li>
                    <li>• {t('partnersGet4')}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center mb-6">
                  <IoLockClosedOutline className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('securityTitle')}</h3>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('securityArchitecture')}</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('securityCorporateData')}</span>
                        <IoArrowForwardOutline className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-green-600">{t('securityEncrypted')}</span>
                      </div>
                      <div className="flex items-center justify-center py-2">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-semibold">
                          {t('securitySecureLayer')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('securityHotelSystems')}</span>
                        <IoArrowForwardOutline className="w-4 h-4 text-gray-400 rotate-180" />
                        <span className="font-semibold text-blue-600">{t('securityAggregated')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <IoShieldCheckmarkOutline className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('securityCertified')}</p>
                    <p className="text-xs text-gray-500">{t('securityCertifiedDesc')}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <IoFlashOutline className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('securityResponse')}</p>
                    <p className="text-xs text-gray-500">{t('securityResponseDesc')}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-center text-blue-900 dark:text-blue-100">
                    {t('securityResult')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium mb-4">
                <IoTimerOutline className="w-4 h-4 mr-1" />
                {t('earlyAdopterBadge')}
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('pricingTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('pricingSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {plans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-lg p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 ${
                    plan.highlight 
                      ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-blue-500' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.highlight && (
                    <div className="text-center mb-4">
                      <span className="inline-flex px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                        <IoTrophyOutline className="w-4 h-4 mr-1" />
                        {t('pricingMostPopular')}
                      </span>
                    </div>
                  )}
                  
                  <h3 className={`text-2xl font-bold mb-2 ${
                    plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {t(plan.nameKey)}
                  </h3>

                  <div className="mb-4">
                    <span className={`text-3xl font-bold ${
                      plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {t(plan.priceKey)}
                    </span>
                    <span className={`text-sm ml-2 ${
                      plan.highlight ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {t(plan.periodKey)}
                    </span>
                  </div>

                  <p className={`text-sm mb-6 ${
                    plan.highlight ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {t(plan.usersKey)}
                  </p>

                  {plan.savingsKey && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      plan.highlight 
                        ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    }`}>
                      <p className="text-sm font-semibold">{t(plan.savingsKey)}</p>
                    </div>
                  )}

                  <ul className="space-y-3 mb-8">
                    {plan.featureKeys.map((featureKey, featureIdx) => (
                      <li key={featureIdx} className="flex items-start">
                        <IoCheckmarkCircle className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                          plan.highlight ? 'text-blue-200' : 'text-green-500'
                        }`} />
                        <span className={`text-sm ${
                          plan.highlight ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {t(featureKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => router.push('/contact')}
                    className={`w-full py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                      plan.highlight 
                        ? 'bg-white text-blue-600 hover:bg-gray-100' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {t('pricingGetStarted')}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center shadow-xl">
              <IoLeafOutline className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">{t('esgIncludedTitle')}</h3>
              <p className="text-green-100 max-w-2xl mx-auto">
                {t('esgIncludedDesc')}
              </p>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                <IoDiamondOutline className="w-4 h-4 mr-2" />
                {t('certSlots')}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('faqTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {t('faqDesc')}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4">
                      {t(faq.questionKey)}
                    </span>
                    {expandedFaq === idx ? (
                      <IoChevronUpOutline className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <IoChevronDownOutline className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(faq.answerKey)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('readyToComplete')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/contact')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {t('getROIAnalysis')}
                </button>
                <button 
                  onClick={() => window.location.href = 'tel:+1-844-ITWHIP'}
                  className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                >
                  <IoCallOutline className="w-5 h-5 mr-2" />
                  1-844-ITWHIP
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-base sm:text-lg text-blue-100 mb-8">
              {t('ctaDesc')}
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-2xl mx-auto mb-8 border border-white/20">
              <div className="grid grid-cols-3 gap-4 text-white">
                <div>
                  <p className="text-3xl font-bold">$900K</p>
                  <p className="text-sm text-blue-100">{t('averageSavings')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">4min</p>
                  <p className="text-sm text-blue-100">{t('setupTime')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-sm text-blue-100">{t('compliance')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {t('seeRatesAction')}
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-500"
              >
                {t('startSavingToday')}
              </button>
            </div>
            
            <p className="text-xs text-blue-200 mt-6">
              {t('ctaDisclaimer')}
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}