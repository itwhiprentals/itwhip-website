// app/host-benefits/page.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import JsonLd, { hostBenefitsList } from '@/components/seo/JsonLd'
import { 
  IoCheckmarkCircle,
  IoCashOutline,
  IoShieldCheckmarkOutline,
  IoReceiptOutline,
  IoFlashOutline,
  IoAnalyticsOutline,
  IoWifiOutline,
  IoPeopleOutline,
  IoSchoolOutline,
  IoTimerOutline,
  IoCalculatorOutline,
  IoGlobeOutline,
  IoRocketOutline,
  IoSparklesOutline,
  IoDiamondOutline,
  IoTrophyOutline,
  IoArrowForwardOutline,
  IoDocumentTextOutline,
  IoFingerPrintOutline,
  IoCameraOutline,
  IoNotificationsOutline,
  IoConstructOutline,
  IoKeyOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoClipboardOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoSettingsOutline,
  IoTimeOutline,
  IoStarOutline,
  IoCalendarOutline,
  IoLayersOutline,
  IoLeafOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'

export default function HostBenefitsPage() {
  const t = useTranslations('HostBenefits')
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // FAQ data for JsonLd
  const hostBenefitsFAQs = [
    {
      question: 'How do the earnings tiers work?',
      answer: 'Your earnings percentage depends on the insurance you bring. Platform Coverage (40%) uses our insurance, P2P Coverage (75%) requires peer-to-peer insurance like State Farm, and Commercial Coverage (90%) requires commercial auto insurance. All tiers include $1M liability coverage.'
    },
    {
      question: 'What is included in every tier?',
      answer: 'Every tier includes: $1M liability coverage, 48-hour payments, guest verification, 24/7 support, Mileage Forensics™ tracking, ESG impact dashboard, and tax documentation. The only difference is your earnings percentage and deductible amount.'
    },
    {
      question: 'When do benefits start?',
      answer: 'All benefits activate immediately upon approval. Insurance coverage begins with your first booking. Host tier rewards unlock as you complete trips.'
    },
    {
      question: 'What is Mileage Forensics™ and why do hosts love it?',
      answer: 'Mileage Forensics™ is our GPS + OBD-II verified trip tracking system. It eliminates disputes, prevents fraud, and provides insurance-grade documentation for every rental. Hosts love it because it protects them from false claims and helps maintain lower insurance rates.'
    }
  ]

  // Translated benefit helper
  const tBenefit = (key: string) => ({
    title: t(`${key}_title`),
    description: t(`${key}_desc`),
    highlight: t(`${key}_highlight`),
    details: Array.from({length: 4}, (_, i) => t(`${key}_d${i}`))
  })

  // Comprehensive benefits organized by category
  const benefitCategories = [
    {
      id: 'earnings',
      name: t('cat_earnings'),
      icon: IoCashOutline,
      color: 'green',
      benefits: [
        { ...tBenefit('earn_0'), icon: IoLayersOutline },
        { ...tBenefit('earn_1'), icon: IoFlashOutline },
        { ...tBenefit('earn_2'), icon: IoWalletOutline },
        { ...tBenefit('earn_3'), icon: IoAnalyticsOutline },
      ]
    },
    {
      id: 'protection',
      name: t('cat_protection'),
      icon: IoShieldCheckmarkOutline,
      color: 'blue',
      benefits: [
        { ...tBenefit('prot_0'), icon: IoShieldCheckmarkOutline },
        { ...tBenefit('prot_1'), icon: IoLockClosedOutline },
        { ...tBenefit('prot_2'), icon: IoConstructOutline },
        { ...tBenefit('prot_3'), icon: IoTimerOutline },
      ]
    },
    {
      id: 'taxes',
      name: t('cat_taxes'),
      icon: IoReceiptOutline,
      color: 'purple',
      benefits: [
        { ...tBenefit('tax_0'), icon: IoCalculatorOutline },
        { ...tBenefit('tax_1'), icon: IoDocumentTextOutline },
        { ...tBenefit('tax_2'), icon: IoClipboardOutline },
      ]
    },
    {
      id: 'tools',
      name: t('cat_tools'),
      icon: IoSettingsOutline,
      color: 'indigo',
      benefits: [
        { ...tBenefit('tool_0'), icon: IoSpeedometerOutline },
        { ...tBenefit('tool_1'), icon: IoFingerPrintOutline },
        { ...tBenefit('tool_2'), icon: IoLeafOutline },
        { ...tBenefit('tool_3'), icon: IoCalendarOutline },
      ]
    },
    {
      id: 'support',
      name: t('cat_support'),
      icon: IoPeopleOutline,
      color: 'orange',
      benefits: [
        { ...tBenefit('supp_0'), icon: IoMailOutline },
        { ...tBenefit('supp_1'), icon: IoNotificationsOutline },
        { ...tBenefit('supp_2'), icon: IoSchoolOutline },
      ]
    },
    {
      id: 'rewards',
      name: t('cat_rewards'),
      icon: IoTrophyOutline,
      color: 'yellow',
      benefits: [
        { ...tBenefit('rew_0'), icon: IoDiamondOutline },
        { ...tBenefit('rew_1'), icon: IoPeopleOutline },
        { ...tBenefit('rew_2'), icon: IoStarOutline },
      ]
    },
    {
      id: 'flexibility',
      name: t('cat_flexibility'),
      icon: IoTimeOutline,
      color: 'teal',
      benefits: [
        { ...tBenefit('flex_0'), icon: IoKeyOutline },
        { ...tBenefit('flex_1'), icon: IoClipboardOutline },
        { ...tBenefit('flex_2'), icon: IoCalendarOutline },
      ]
    },
    {
      id: 'arizona',
      name: t('cat_arizona'),
      icon: IoGlobeOutline,
      color: 'amber',
      benefits: [
        { ...tBenefit('az_0'), icon: IoDocumentTextOutline },
        { ...tBenefit('az_1'), icon: IoReceiptOutline },
      ]
    }
  ]

  const allBenefits = benefitCategories.flatMap(cat => 
    cat.benefits.map(benefit => ({ ...benefit, category: cat.name, categoryId: cat.id }))
  )

  const filteredBenefits = selectedCategory === 'all' 
    ? allBenefits 
    : allBenefits.filter(b => b.categoryId === selectedCategory)

  // Key statistics - UPDATED
  const keyStats = [
    { value: '48hr', label: t('stat_0_label'), detail: t('stat_0_detail') },
    { value: '$1M', label: t('stat_1_label'), detail: t('stat_1_detail') },
    { value: '90%', label: t('stat_2_label'), detail: t('stat_2_detail') },
    { value: '40%', label: t('stat_3_label'), detail: t('stat_3_detail') },
    { value: '$8K+', label: t('stat_4_label'), detail: t('stat_4_detail') },
    { value: 'AZ', label: t('stat_5_label'), detail: t('stat_5_detail') }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* JSON-LD Structured Data */}
      <JsonLd type="faq" faqs={hostBenefitsFAQs} />
      <JsonLd type="itemlist" listName="ItWhip Host Benefits" listItems={hostBenefitsList} />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoTrophyOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded-lg">
                {t('benefitCount')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/insurance-guide" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('insuranceGuide')}
              </Link>
              <Link
                href="/list-your-car"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                {t('listYourCar')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        
        {/* Hero Section with Key Stats */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-purple-600 font-medium mb-4">
                {t('heroSubtitle')}
              </p>

              <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                {t('heroDescription')}
              </p>
              
              {/* Tier Quick Reference */}
              <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-black text-gray-600">40%</div>
                  <div className="text-xs font-semibold text-gray-500">{t('tierPlatform')}</div>
                  <div className="text-[10px] text-gray-400">{t('tierPlatformDesc')}</div>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 text-center border-2 border-amber-400">
                  <div className="text-2xl font-black text-amber-600">75%</div>
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t('tierP2P')}</div>
                  <div className="text-[10px] text-amber-600">{t('mostPopular')}</div>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-black text-emerald-600">90%</div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t('tierCommercial')}</div>
                  <div className="text-[10px] text-emerald-600">{t('maxEarnings')}</div>
                </div>
              </div>
              
              <Link 
                href="/insurance-guide"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('learnInsuranceTiers')}
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {keyStats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Arizona Compliance - HIGH POSITION */}
        <section className="py-6 bg-amber-50 dark:bg-amber-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <IoGlobeOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">
                  {t('azComplianceTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('azComplianceDesc')}
                </p>
                <Link
                  href="/legal"
                  className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
                >
                  {t('fullArizonaLaw')}
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-[106px] md:top-[112px] z-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {t('allBenefits', { count: allBenefits.length })}
              </button>
              {benefitCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-4 h-4 mr-1" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBenefits.map((benefit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <benefit.icon className="w-10 h-10 text-purple-600 flex-shrink-0" />
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                        {benefit.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {benefit.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {benefit.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start">
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-purple-600">
                        ✨ {benefit.highlight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/mileage-forensics"
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition"
              >
                <IoSpeedometerOutline className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('mileageForensics')}</div>
                  <div className="text-xs text-gray-500">{t('howItWorks')}</div>
                </div>
              </Link>
              <Link 
                href="/esg-dashboard"
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition"
              >
                <IoLeafOutline className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('esgDashboard')}</div>
                  <div className="text-xs text-gray-500">{t('seeYourImpact')}</div>
                </div>
              </Link>
              <Link 
                href="/legal"
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition"
              >
                <IoDocumentTextOutline className="w-8 h-8 text-amber-600" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t('arizonaLaw')}</div>
                  <div className="text-xs text-gray-500">{t('fullLegalText')}</div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Comparison Section - UPDATED */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('howWeCompare')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('seeWhyHosts')}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('feature')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                      ItWhip
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      {t('traditionalPlatforms')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{t('compareMaxEarnings')}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{t('compareUpTo90')}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">60-85%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{t('comparePaymentSpeed')}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{t('compare48Hours')}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{t('compare3to14Days')}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{t('compareLiability')}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{t('compare1MAllTiers')}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">$750K-1M</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{t('compareInsuranceOptions')}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{t('compare3Tiers')}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{t('comparePlatformDecides')}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{t('compareGuestScreening')}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{t('compareIdFaceRecord')}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{t('compareBasicId')}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{t('compareMileageTracking')}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{t('compareForensics')}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{t('compareBasicOdometer')}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{t('compareEsgTracking')}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{t('compareFullDashboard')}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{t('compareNone')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              {t('ctaDesc')}
            </p>

            <Link
              href="/list-your-car"
              className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
            >
              {t('listYourCar')}
            </Link>

            <p className="text-xs text-purple-200 mt-4">
              {t('ctaDisclaimer')}
            </p>
          </div>
        </section>

        {/* FAQ Section - UPDATED with Mileage Forensics */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('commonQuestions')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('faq1Q')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('faq1A')}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('faq2Q')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('faq2A')}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('faq3Q')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('faq3A')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('faq4Q')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('faq4A')}
                </p>
                <Link 
                  href="/mileage-forensics"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('learnMileageForensics')}
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}