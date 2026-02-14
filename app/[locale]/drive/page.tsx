// app/drive/page.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import { 
  IoCarSportOutline,
  IoCashOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoStarOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoArrowForwardOutline,
  IoPeopleOutline,
  IoBusinessOutline,
  IoInformationCircleOutline,
  IoPhonePortraitOutline,
  IoWalletOutline,
  IoFlashOutline,
  IoDocumentTextOutline,
  IoCallOutline
} from 'react-icons/io5'

export default function DrivePage() {
  const t = useTranslations('Drive')
  const router = useRouter()
  const [selectedVehicle, setSelectedVehicle] = useState('luxury')
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const earnings = {
    standard: {
      hourly: '$35-45',
      weekly: '$1,400-1,800',
      monthly: '$5,600-7,200',
      annual: '$67,000-86,000'
    },
    luxury: {
      hourly: '$45-60',
      weekly: '$1,800-2,400',
      monthly: '$7,200-9,600',
      annual: '$86,000-115,000'
    },
    premium: {
      hourly: '$60-85',
      weekly: '$2,400-3,400',
      monthly: '$9,600-13,600',
      annual: '$115,000-163,000'
    }
  }

  const vehicleRequirements = {
    standard: {
      title: 'Standard Class',
      vehicles: ['Tesla Model 3', 'BMW 3 Series', 'Mercedes C-Class', 'Audi A4'],
      requirements: ['2021 or newer', 'Black, white, or silver', 'Leather interior', 'No cosmetic damage']
    },
    luxury: {
      title: 'Luxury Class',
      vehicles: ['Tesla Model S/X', 'BMW 5 Series', 'Mercedes E-Class', 'Audi A6'],
      requirements: ['2022 or newer', 'Premium colors only', 'Premium interior', 'Pristine condition']
    },
    premium: {
      title: 'Premium Class',
      vehicles: ['Mercedes S-Class', 'BMW 7 Series', 'Porsche Panamera', 'Range Rover'],
      requirements: ['2023 or newer', 'Executive colors', 'Full luxury package', 'Showroom condition']
    }
  }

  const benefits = [
    {
      icon: IoCashOutline,
      title: t('benefitHigherEarnings'),
      description: t('benefitHigherEarningsDesc')
    },
    {
      icon: IoTimeOutline,
      title: t('benefitFlexSchedule'),
      description: t('benefitFlexScheduleDesc')
    },
    {
      icon: IoBusinessOutline,
      title: t('benefitPremiumClients'),
      description: t('benefitPremiumClientsDesc')
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: t('benefitFullInsurance'),
      description: t('benefitFullInsuranceDesc')
    },
    {
      icon: IoWalletOutline,
      title: t('benefitInstantPay'),
      description: t('benefitInstantPayDesc')
    },
    {
      icon: IoSparklesOutline,
      title: t('benefitNoSurge'),
      description: t('benefitNoSurgeDesc')
    }
  ]

  const requirements = [
    t('req1'),
    t('req2'),
    t('req3'),
    t('req4'),
    t('req5'),
    t('req6')
  ]

  const faqs = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') }
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
              <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                {t('bonusBadge')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#earnings" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('navEarnings')}
              </a>
              <a href="#requirements" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('navRequirements')}
              </a>
              <Link href="/driver-portal" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('navDriverPortal')}
              </Link>
              <button
                onClick={() => setShowApplicationForm(true)}
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                {t('applyNow')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <a 
                href="#earnings" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCashOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('navEarnings')}</span>
              </a>
              <a
                href="#requirements"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoDocumentTextOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('navRequirements')}</span>
              </a>
              <Link
                href="/driver-portal"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoBusinessOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('navPortal')}</span>
              </Link>
              <button
                onClick={() => setShowApplicationForm(true)}
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoRocketOutline className="w-4 h-4 flex-shrink-0" />
                <span>{t('applyNow')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 sm:mb-6">
                <IoFlashOutline className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
                  {t('heroBadge')}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('heroTitle')}
                <span className="block text-amber-600 mt-2">{t('heroSubtitle')}</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                {t('heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition shadow-lg"
                >
                  {t('startApplication')}
                </button>
                <a href="#earnings" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
                  {t('seeEarnings')}
                </a>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-amber-200 dark:bg-amber-800 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-300 dark:bg-amber-700 rounded-full opacity-10 blur-3xl"></div>
        </section>

        {/* Live Stats Bar */}
        <section className="bg-amber-600 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">847</div>
                <div className="text-xs sm:text-sm text-amber-100">{t('statActiveDrivers')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">$8,450</div>
                <div className="text-xs sm:text-sm text-amber-100">{t('statAvgMonthly')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">4.9</div>
                <div className="text-xs sm:text-sm text-amber-100">{t('statAvgRating')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">18min</div>
                <div className="text-xs sm:text-sm text-amber-100">{t('statAvgBetweenRides')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section id="earnings" className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t('earningPotentialTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('earningPotentialDesc')}
              </p>
            </div>

            {/* Vehicle Class Selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                {Object.keys(vehicleRequirements).map((vehicle) => (
                  <button
                    key={vehicle}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base ${
                      selectedVehicle === vehicle
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {vehicleRequirements[vehicle as keyof typeof vehicleRequirements].title}
                  </button>
                ))}
              </div>
            </div>

            {/* Earnings Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Earnings Breakdown */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {vehicleRequirements[selectedVehicle as keyof typeof vehicleRequirements].title} {t('earnings')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('hourly')}</span>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {earnings[selectedVehicle as keyof typeof earnings].hourly}
                      </p>
                    </div>
                    <IoTimeOutline className="w-8 h-8 text-amber-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('weekly')}</span>
                      <p className="text-2xl font-bold text-green-600">
                        {earnings[selectedVehicle as keyof typeof earnings].weekly}
                      </p>
                    </div>
                    <IoCalendarOutline className="w-8 h-8 text-green-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('monthly')}</span>
                      <p className="text-2xl font-bold text-blue-600">
                        {earnings[selectedVehicle as keyof typeof earnings].monthly}
                      </p>
                    </div>
                    <IoTrendingUpOutline className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-500">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('annual')}</span>
                      <p className="text-3xl font-bold text-amber-600">
                        {earnings[selectedVehicle as keyof typeof earnings].annual}
                      </p>
                    </div>
                    <IoCashOutline className="w-8 h-8 text-amber-600" />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  {t('earningsDisclaimer')}
                </p>
              </div>

              {/* Vehicle Requirements */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('vehicleRequirements')}
                </h3>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {t('acceptedVehicles')}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicleRequirements[selectedVehicle as keyof typeof vehicleRequirements].vehicles.map((vehicle) => (
                      <div key={vehicle} className="flex items-center space-x-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{vehicle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {t('navRequirements')}:
                  </h4>
                  <ul className="space-y-2">
                    {vehicleRequirements[selectedVehicle as keyof typeof vehicleRequirements].requirements.map((req) => (
                      <li key={req} className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>{t('noLuxuryVehicle')}</strong> {t('noLuxuryVehicleDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t('whyDriversTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('whyDriversDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                    <benefit.icon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section id="requirements" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('driverRequirementsTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('driverRequirementsDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
              <ul className="space-y-3">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>{t('backgroundCheck')}</strong> {t('backgroundCheckDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('faqTitle')}
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-amber-100 mb-8">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => setShowApplicationForm(true)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg"
              >
                {t('applyNow5Min')}
              </button>
              <a href="tel:+14805550188" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition">
                {t('callPhone')}
              </a>
            </div>
            <p className="text-xs text-amber-100 mt-4">
              {t('bonusDisclaimer')}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>{t('copyright')}</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/driver-requirements" className="hover:text-gray-700 dark:hover:text-gray-300">{t('navRequirements')}</Link>
                <Link href="/earnings" className="hover:text-gray-700 dark:hover:text-gray-300">{t('navEarnings')}</Link>
                <Link href="/driver-portal" className="hover:text-gray-700 dark:hover:text-gray-300">{t('navDriverPortal')}</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">{t('support')}</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Application Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('startApplication')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('applicationDesc')}
            </p>
            
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>{t('selectVehicleType')}</option>
                <option>Tesla Model 3/Y</option>
                <option>Tesla Model S/X</option>
                <option>BMW 3/5 Series</option>
                <option>Mercedes C/E Class</option>
                <option>Mercedes S-Class</option>
                <option>{t('otherLuxury')}</option>
                <option>{t('needVehicle')}</option>
              </select>
              
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
                >
                  {t('continueApplication')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}