// app/how-it-works/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoStarOutline,
  IoTrendingUpOutline,
  IoKeyOutline,
  IoCarOutline,
  IoSearchOutline,
  IoFlashOutline,
  IoCashOutline,
  IoReceiptOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoChevronForwardOutline,
  IoCameraOutline,
  IoFingerPrintOutline,
  IoAnalyticsOutline,
  IoClipboardOutline,
  IoLeafOutline,
  IoGlobeOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoBusinessOutline,
  IoShareSocialOutline
} from 'react-icons/io5'

export default function HowItWorksPage() {
  const router = useRouter()
  const t = useTranslations('HowItWorks')
  const [activeTab, setActiveTab] = useState<'guest' | 'host' | 'fleet'>('guest')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const guestSteps = [
    {
      icon: IoSearchOutline,
      title: t('guestStepFindTitle'),
      description: t('guestStepFindDescription'),
      details: [
        t('guestStepFindDetail1'),
        t('guestStepFindDetail2'),
        t('guestStepFindDetail3'),
        t('guestStepFindDetail4'),
        t('guestStepFindDetail5')
      ],
      cta: { text: t('guestStepFindCta'), link: '/' }
    },
    {
      icon: IoFingerPrintOutline,
      title: t('guestStepVerificationTitle'),
      description: t('guestStepVerificationDescription'),
      details: [
        t('guestStepVerificationDetail1'),
        t('guestStepVerificationDetail2'),
        t('guestStepVerificationDetail3'),
        t('guestStepVerificationDetail4'),
        t('guestStepVerificationDetail5')
      ]
    },
    {
      icon: IoKeyOutline,
      title: t('guestStepPickupTitle'),
      description: t('guestStepPickupDescription'),
      details: [
        t('guestStepPickupDetail1'),
        t('guestStepPickupDetail2'),
        t('guestStepPickupDetail3'),
        t('guestStepPickupDetail4'),
        t('guestStepPickupDetail5')
      ]
    }
  ]

  const hostSteps = [
    {
      icon: IoDocumentTextOutline,
      title: t('hostStepListTitle'),
      description: t('hostStepListDescription'),
      details: [
        t('hostStepListDetail1'),
        t('hostStepListDetail2'),
        t('hostStepListDetail3'),
        t('hostStepListDetail4'),
        t('hostStepListDetail5')
      ],
      cta: { text: t('hostStepListCta'), link: '/host/signup' }
    },
    {
      icon: IoTrendingUpOutline,
      title: t('hostStepGrowTitle'),
      description: t('hostStepGrowDescription'),
      details: [
        t('hostStepGrowDetail1'),
        t('hostStepGrowDetail2'),
        t('hostStepGrowDetail3'),
        t('hostStepGrowDetail4'),
        t('hostStepGrowDetail5')
      ],
      cta: { text: t('hostStepGrowCta'), link: '/host-protection' }
    },
    {
      icon: IoCashOutline,
      title: t('hostStepPaidTitle'),
      description: t('hostStepPaidDescription'),
      details: [
        t('hostStepPaidDetail1'),
        t('hostStepPaidDetail2'),
        t('hostStepPaidDetail3'),
        t('hostStepPaidDetail4'),
        t('hostStepPaidDetail5')
      ],
      cta: { text: t('hostStepPaidCta'), link: '/host-protection' }
    }
  ]

  const fleetSteps = [
    {
      icon: IoBusinessOutline,
      title: t('fleetStepSignUpTitle'),
      description: t('fleetStepSignUpDescription'),
      details: [
        t('fleetStepSignUpDetail1'),
        t('fleetStepSignUpDetail2'),
        t('fleetStepSignUpDetail3'),
        t('fleetStepSignUpDetail4'),
        t('fleetStepSignUpDetail5')
      ],
      cta: { text: t('fleetStepSignUpCta'), link: '/host/signup' }
    },
    {
      icon: IoPeopleOutline,
      title: t('fleetStepInviteTitle'),
      description: t('fleetStepInviteDescription'),
      details: [
        t('fleetStepInviteDetail1'),
        t('fleetStepInviteDetail2'),
        t('fleetStepInviteDetail3'),
        t('fleetStepInviteDetail4'),
        t('fleetStepInviteDetail5')
      ]
    },
    {
      icon: IoCashOutline,
      title: t('fleetStepEarnTitle'),
      description: t('fleetStepEarnDescription'),
      details: [
        t('fleetStepEarnDetail1'),
        t('fleetStepEarnDetail2'),
        t('fleetStepEarnDetail3'),
        t('fleetStepEarnDetail4'),
        t('fleetStepEarnDetail5')
      ],
      cta: { text: t('fleetStepEarnCta'), link: '/partners/commission' }
    }
  ]

  const guestBenefits = [
    {
      icon: IoPersonOutline,
      title: t('guestBenefitsTitle'),
      description: t('guestBenefitsDescription'),
      highlight: t('guestBenefitsHighlight'),
      link: '/help/guest-account'
    },
    {
      icon: IoPeopleOutline,
      title: t('rentFromPeopleTitle'),
      description: t('rentFromPeopleDescription'),
      highlight: t('rentFromPeopleHighlight')
    },
    {
      icon: IoWalletOutline,
      title: t('savingsTitle'),
      description: t('savingsDescription'),
      highlight: t('savingsHighlight')
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: t('coverageTitle'),
      description: t('coverageDescription'),
      highlight: t('coverageHighlight')
    },
    {
      icon: IoLocationOutline,
      title: t('pickupTitle'),
      description: t('pickupDescription'),
      highlight: t('pickupHighlight')
    },
    {
      icon: IoLeafOutline,
      title: t('esgTrackingTitle'),
      description: t('esgTrackingDescription'),
      highlight: t('esgTrackingHighlight')
    },
    {
      icon: IoStarOutline,
      title: t('verifiedHostsTitle'),
      description: t('verifiedHostsDescription'),
      highlight: t('verifiedHostsHighlight')
    }
  ]

  const hostBenefits = [
    {
      icon: IoTrendingUpOutline,
      title: t('hostEarningsTitle'),
      description: t('hostEarningsDescription'),
      highlight: t('hostEarningsHighlight'),
      link: '/host-protection'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: t('hostProtectionTitle'),
      description: t('hostProtectionDescription'),
      highlight: t('hostProtectionHighlight'),
      link: '/insurance-guide'
    },
    {
      icon: IoFlashOutline,
      title: t('hostPaymentsTitle'),
      description: t('hostPaymentsDescription'),
      highlight: t('hostPaymentsHighlight')
    },
    {
      icon: IoAnalyticsOutline,
      title: t('mileageForensicsTitle'),
      description: t('mileageForensicsDescription'),
      highlight: t('mileageForensicsHighlight')
    },
    {
      icon: IoLeafOutline,
      title: t('hostEsgTitle'),
      description: t('hostEsgDescription'),
      highlight: t('hostEsgHighlight')
    },
    {
      icon: IoReceiptOutline,
      title: t('hostTaxTitle'),
      description: t('hostTaxDescription'),
      highlight: t('hostTaxHighlight')
    }
  ]

  const fleetBenefits = [
    {
      icon: IoCarOutline,
      title: t('fleetNoCarTitle'),
      description: t('fleetNoCarDescription'),
      highlight: t('fleetNoCarHighlight')
    },
    {
      icon: IoTrendingUpOutline,
      title: t('fleetCommissionTitle'),
      description: t('fleetCommissionDescription'),
      highlight: t('fleetCommissionHighlight')
    },
    {
      icon: IoGlobeOutline,
      title: t('fleetPageTitle'),
      description: t('fleetPageDescription'),
      highlight: t('fleetPageHighlight')
    },
    {
      icon: IoShareSocialOutline,
      title: t('fleetSocialTitle'),
      description: t('fleetSocialDescription'),
      highlight: t('fleetSocialHighlight')
    },
    {
      icon: IoWalletOutline,
      title: t('fleetPayoutsTitle'),
      description: t('fleetPayoutsDescription'),
      highlight: t('fleetPayoutsHighlight')
    },
    {
      icon: IoStatsChartOutline,
      title: t('fleetDashboardTitle'),
      description: t('fleetDashboardDescription'),
      highlight: t('fleetDashboardHighlight')
    }
  ]

  const commissionTiers = [
    {
      tier: t('standardTier'),
      hostKeeps: t('standardKeeps'),
      platformTakes: t('standardTakes'),
      color: 'gray',
      vehicles: t('standardVehicles'),
      description: t('standardDescription'),
      best: t('standardBest')
    },
    {
      tier: t('goldTier'),
      hostKeeps: t('goldKeeps'),
      platformTakes: t('goldTakes'),
      color: 'amber',
      vehicles: t('goldVehicles'),
      description: t('goldDescription'),
      best: t('goldBest')
    },
    {
      tier: t('platinumTier'),
      hostKeeps: t('platinumKeeps'),
      platformTakes: t('platinumTakes'),
      color: 'purple',
      vehicles: t('platinumVehicles'),
      description: t('platinumDescription'),
      best: t('platinumBest')
    },
    {
      tier: t('diamondTier'),
      hostKeeps: t('diamondKeeps'),
      platformTakes: t('diamondTakes'),
      color: 'emerald',
      vehicles: t('diamondVehicles'),
      description: t('diamondDescription'),
      best: t('diamondBest')
    }
  ]

  const guestVerification = [
    {
      step: 1,
      title: t('verificationStep1Title'),
      description: t('verificationStep1Description'),
      icon: IoDocumentTextOutline
    },
    {
      step: 2,
      title: t('verificationStep2Title'),
      description: t('verificationStep2Description'),
      icon: IoCameraOutline
    },
    {
      step: 3,
      title: t('verificationStep3Title'),
      description: t('verificationStep3Description'),
      icon: IoFingerPrintOutline
    },
    {
      step: 4,
      title: t('verificationStep4Title'),
      description: t('verificationStep4Description'),
      icon: IoWalletOutline
    }
  ]

  const requirements: Record<'guest' | 'host' | 'fleet', { text: string; required: boolean }[]> = {
    guest: [
      { text: t('guestReqLicense'), required: true },
      { text: t('guestReqAge'), required: true },
      { text: t('guestReqPayment'), required: true },
      { text: t('guestReqBackground'), required: true },
      { text: t('guestReqInsurance'), required: false }
    ],
    host: [
      { text: t('hostReqYear'), required: true },
      { text: t('hostReqMiles'), required: true },
      { text: t('hostReqTitle'), required: true },
      { text: t('hostReqInspection'), required: true },
      { text: t('hostReqLocation'), required: true },
      { text: t('hostReqInsurance'), required: false }
    ],
    fleet: [
      { text: t('fleetReqId'), required: true },
      { text: t('fleetReqAge'), required: true },
      { text: t('fleetReqBackground'), required: true },
      { text: t('fleetReqStripe'), required: true },
      { text: t('fleetReqLocation'), required: true },
      { text: t('fleetReqSocial'), required: false }
    ]
  }

  const platformFeatures = [
    {
      title: t('featureMileageTitle'),
      description: t('featureMileageDescription'),
      icon: IoStatsChartOutline
    },
    {
      title: t('featureEsgTitle'),
      description: t('featureEsgDescription'),
      icon: IoLeafOutline
    },
    {
      title: t('featureFnolTitle'),
      description: t('featureFnolDescription'),
      icon: IoClipboardOutline
    },
    {
      title: t('featureScreeningTitle'),
      description: t('featureScreeningDescription'),
      icon: IoFingerPrintOutline
    }
  ]

  const faqs = [
    {
      question: t('faqDifferenceQuestion'),
      answer: t('faqDifferenceAnswer'),
      category: 'general'
    },
    {
      question: t('faqInsuranceQuestion'),
      answer: t('faqInsuranceAnswer'),
      category: 'general'
    },
    {
      question: t('faqVerificationQuestion'),
      answer: t('faqVerificationAnswer'),
      category: 'guest'
    },
    {
      question: t('faqPickupQuestion'),
      answer: t('faqPickupAnswer'),
      category: 'guest'
    },
    {
      question: t('faqCommissionQuestion'),
      answer: t('faqCommissionAnswer'),
      category: 'host'
    },
    {
      question: t('faqEarningsQuestion'),
      answer: t('faqEarningsAnswer'),
      category: 'host'
    },
    {
      question: t('faqPaymentQuestion'),
      answer: t('faqPaymentAnswer'),
      category: 'host'
    },
    {
      question: t('faqMileageQuestion'),
      answer: t('faqMileageAnswer'),
      category: 'host'
    },
    {
      question: t('faqDamageQuestion'),
      answer: t('faqDamageAnswer'),
      category: 'general'
    },
    {
      question: t('faqExpansionQuestion'),
      answer: t('faqExpansionAnswer'),
      category: 'general'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
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
              <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('headerTitle')}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host/signup" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('headerBecomeAHost')}
              </Link>
              <Link href="/insurance-guide" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('headerInsuranceGuide')}
              </Link>
              <Link href="/" className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                {t('headerFindACar')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-10 sm:py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-6">
                <IoPeopleOutline className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">{t('peerToPeerLabel')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {activeTab === 'guest' && (
                  <>
                    {t('heroGuestTitle')}
                    <span className="block text-purple-600 mt-2">{t('heroGuestSubtitle')}</span>
                  </>
                )}
                {activeTab === 'host' && (
                  <>
                    {t('heroHostTitle')}
                    <span className="block text-purple-600 mt-2">{t('heroHostSubtitle')}</span>
                  </>
                )}
                {activeTab === 'fleet' && (
                  <>
                    {t('heroFleetTitle')}
                    <span className="block text-purple-600 mt-2">{t('heroFleetSubtitle')}</span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
                {activeTab === 'guest' && t('heroGuestDescription')}
                {activeTab === 'host' && t('heroHostDescription')}
                {activeTab === 'fleet' && t('heroFleetDescription')}
              </p>

              {/* Tab Selector */}
              <div className="inline-flex flex-wrap justify-center bg-gray-200 dark:bg-gray-800 rounded-lg p-1.5 shadow-lg border border-gray-300 dark:border-gray-700 gap-1">
                <button
                  onClick={() => setActiveTab('guest')}
                  className={`px-4 sm:px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'guest'
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-xl border-2 border-purple-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <IoPersonOutline className="inline w-5 h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('tabINeedACar')}</span>
                  <span className="sm:hidden">{t('tabRent')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('host')}
                  className={`px-4 sm:px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'host'
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-xl border-2 border-purple-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <IoCarOutline className="inline w-5 h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('tabIHaveACar')}</span>
                  <span className="sm:hidden">{t('tabHost')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('fleet')}
                  className={`px-4 sm:px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'fleet'
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-xl border-2 border-purple-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <IoBusinessOutline className="inline w-5 h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('tabIDontHaveACar')}</span>
                  <span className="sm:hidden">{t('tabManage')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {activeTab === 'guest' && t('stepsHeadingGuest')}
                {activeTab === 'host' && t('stepsHeadingHost')}
                {activeTab === 'fleet' && t('stepsHeadingFleet')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' && t('stepsSubheadingGuest')}
                {activeTab === 'host' && t('stepsSubheadingHost')}
                {activeTab === 'fleet' && t('stepsSubheadingFleet')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(activeTab === 'guest' ? guestSteps : activeTab === 'host' ? hostSteps : fleetSteps).map((step, idx) => (
                <div key={idx} className="relative">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 left-full w-full">
                      <IoChevronForwardOutline className="w-8 h-8 text-purple-300 -ml-4" />
                    </div>
                  )}
                  
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow h-full border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-sm font-bold text-purple-600">{t('step')} {idx + 1}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2 mb-4">
                      {step.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-start">
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{detail}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {step.cta && (
                      <Link 
                        href={step.cta.link}
                        className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        {step.cta.text}
                        <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Tiers Section - Host Only */}
        {activeTab === 'host' && (
          <section className="py-6 sm:py-8 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('commissionTierHeading')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('commissionTierSubheading')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commissionTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg p-4 border shadow-lg ${
                      tier.color === 'emerald'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400'
                        : tier.color === 'amber'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400'
                        : tier.color === 'purple'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400'
                        : 'bg-white dark:bg-gray-800 border-gray-300'
                    }`}
                  >
                    {tier.color === 'amber' && (
                      <div className="absolute -top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {t('popular')}
                      </div>
                    )}
                    <div className={`text-xs font-bold mb-1 ${
                      tier.color === 'emerald' ? 'text-emerald-600'
                      : tier.color === 'amber' ? 'text-amber-600'
                      : tier.color === 'purple' ? 'text-purple-600'
                      : 'text-gray-600'
                    }`}>
                      {tier.tier}
                    </div>
                    <div className={`text-2xl font-black mb-0.5 ${
                      tier.color === 'emerald' ? 'text-emerald-600'
                      : tier.color === 'amber' ? 'text-amber-600'
                      : tier.color === 'purple' ? 'text-purple-600'
                      : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {tier.hostKeeps}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('youKeep')}</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {tier.vehicles}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                      {tier.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-800 dark:text-green-300 text-center">
                  <strong>{t('liabilityAll')}</strong> {t('liabilityAllDescription')}
                </p>
              </div>

              <div className="text-center mt-4">
                <Link
                  href="/host-protection"
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('learnMoreHostProtection')}
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Guest Verification Section - Guest Only */}
        {activeTab === 'guest' && (
          <section className="py-8 sm:py-10 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('verificationHeading')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('verificationSubheading')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {guestVerification.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-xs font-bold text-purple-600 mb-1">{t('step')} {item.step}</div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-5 text-center shadow-lg border border-green-200 dark:border-green-800">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                  {t('addInsuranceTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('addInsuranceDescription')}
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/help/guest-account"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('learnMoreGuestAccount')}
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Fleet Manager Commission Section - Fleet Only */}
        {activeTab === 'fleet' && (
          <section className="py-8 sm:py-10 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('fleetEarningHeading')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('fleetEarningSubheading')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl text-center border border-gray-100 dark:border-gray-700">
                  <div className="text-4xl font-black text-purple-600 mb-2">10%</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('starterCommission')}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('starterVehicles')}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 shadow-xl text-center border-2 border-purple-500 relative">
                  <div className="absolute -top-3 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                    {t('popular')}
                  </div>
                  <div className="text-4xl font-black text-purple-600 mb-2">20%</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('growthCommission')}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('growthVehicles')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl text-center border border-gray-100 dark:border-gray-700">
                  <div className="text-4xl font-black text-purple-600 mb-2">30%</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('proCommission')}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('proVehicles')}</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5 shadow-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <IoInformationCircleOutline className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">
                      {t('defaultCommissionSplitTitle')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('defaultCommissionSplitDescription')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/partners/commission"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('viewFullCommission')}
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {activeTab === 'guest' && t('benefitsHeadingGuest')}
                {activeTab === 'host' && t('benefitsHeadingHost')}
                {activeTab === 'fleet' && t('benefitsHeadingFleet')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' && t('benefitsSubheadingGuest')}
                {activeTab === 'host' && t('benefitsSubheadingHost')}
                {activeTab === 'fleet' && t('benefitsSubheadingFleet')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeTab === 'guest' ? guestBenefits : activeTab === 'host' ? hostBenefits : fleetBenefits).map((benefit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-5 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-800">
                  <benefit.icon className="w-10 h-10 text-purple-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {benefit.description}
                  </p>
                  <p className="text-xs font-semibold text-purple-600">
                    {benefit.highlight}
                  </p>
                  {'link' in benefit && (benefit as any).link && (
                    <Link
                      href={(benefit as any).link}
                      className="inline-flex items-center mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      {t('learnMore')}
                      <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-8 sm:py-10 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {t('platformHeading')}
              </h2>
              <p className="text-gray-400">
                {t('platformSubheading')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {platformFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-5 text-center border border-white/20">
                  <feature.icon className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-8 sm:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('requirementsHeading')}
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                {activeTab === 'guest' && t('requirementGuestHeading')}
                {activeTab === 'host' && t('requirementHostHeading')}
                {activeTab === 'fleet' && t('requirementFleetHeading')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requirements[activeTab].map((req, idx) => (
                  <div key={idx} className="flex items-start">
                    {req.required ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    ) : (
                      <IoInformationCircleOutline className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{req.text}</span>
                      {req.required ? (
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">{t('required')}</span>
                      ) : (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">{t('optional')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={activeTab === 'host' ? '/host-protection' : activeTab === 'fleet' ? '/partners/commission' : '/insurance-guide'}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  {activeTab === 'guest' && t('learnGuestProtection')}
                  {activeTab === 'host' && t('learnHostProtection')}
                  {activeTab === 'fleet' && t('learnCommissionStructure')}
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Arizona Compliance */}
        <section className="py-6 sm:py-8 bg-amber-50 dark:bg-amber-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <IoGlobeOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">
                  {t('complianceTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('complianceDescription')}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>• {t('complianceTax')}</span>
                  <span>• {t('complianceLiability')}</span>
                  <span>• {t('complianceVerification')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-8 sm:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('faqHeading')}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs
                .filter(faq => faq.category === 'general' || faq.category === activeTab)
                .map((faq, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-5 shadow-lg border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-start">
                      <IoHelpCircleOutline className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                      {faq.answer}
                    </p>
                  </div>
                ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('contactQuestion')}
                <IoArrowForwardOutline className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-8 sm:py-10 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              {activeTab === 'guest' && t('ctaReadyRentGuest')}
              {activeTab === 'host' && t('ctaReadyEarnHost')}
              {activeTab === 'fleet' && t('ctaReadyFleet')}
            </h2>
            <p className="text-base sm:text-lg text-purple-100 mb-6">
              {activeTab === 'guest' && t('ctaDescriptionGuest')}
              {activeTab === 'host' && t('ctaDescriptionHost')}
              {activeTab === 'fleet' && t('ctaDescriptionFleet')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {activeTab === 'guest' && (
                <>
                  <Link
                    href="/"
                    className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-xl"
                  >
                    {t('ctaBrowseAvailableCars')}
                  </Link>
                  <button
                    onClick={() => setActiveTab('host')}
                    className="inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
                  >
                    {t('ctaOrListYourCar')}
                  </button>
                </>
              )}
              {activeTab === 'host' && (
                <>
                  <Link
                    href="/host/signup"
                    className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-xl"
                  >
                    {t('ctaListYourCarNow')}
                  </Link>
                  <Link
                    href="/insurance-guide"
                    className="inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
                  >
                    {t('headerInsuranceGuide')}
                  </Link>
                </>
              )}
              {activeTab === 'fleet' && (
                <>
                  <Link
                    href="/host/signup"
                    className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-xl"
                  >
                    {t('ctaApplyFleetManager')}
                  </Link>
                  <Link
                    href="/partners/commission"
                    className="inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
                  >
                    {t('hostStepGrowCta')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-6 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">$1M</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('trustLiability')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">48hr</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('trustPayments')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">161+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('trustCarsAvailable')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">90%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('trustMaxEarnings')}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}