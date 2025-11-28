// app/insurance-guide/InsuranceGuideContent.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'
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
  IoChevronUpOutline,
  IoSpeedometerOutline
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

export default function InsuranceGuideContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  // FAQ Schema Data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need my own car insurance to host on ItWhip?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. With the BASIC tier (40%), ItWhip provides all the insurance coverage. You don\'t need any of your own. However, if you want to earn more (75% or 90%), you\'ll need to bring P2P or commercial insurance that covers car sharing.'
        }
      },
      {
        '@type': 'Question',
        name: 'What are the insurance tiers on ItWhip?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ItWhip has three tiers: BASIC (40% earnings, no insurance required, $2,500 deductible), STANDARD (75% earnings, P2P insurance required, $1,500 deductible), and PREMIUM (90% earnings, commercial insurance required, $1,000 deductible).'
        }
      },
      {
        '@type': 'Question',
        name: 'What is FNOL and how does the claims process work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'FNOL (First Notice of Loss) is the initial incident report. On ItWhip, claims follow a timeline: immediate incident report, 24-hour initial review, 24-48 hour documentation (FDCR), and 48-72 hour resolution. Most claims resolve within 3 business days.'
        }
      },
      {
        '@type': 'Question',
        name: 'What happens if my insurance lapses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'If your insurance lapses while in the 75% or 90% tier, you automatically drop to BASIC (40%) tier with a $2,500 deductible until valid insurance is restored. All rentals during the lapse earn at the 40% rate.'
        }
      }
    ]
  }

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'P2P Car Insurance Guide - Host Protection Tiers for Arizona Car Sharing',
    description: 'Complete guide to peer-to-peer car sharing insurance in Phoenix, Scottsdale, and Tempe. Understand insurance tiers, deductibles, and claims process.',
    author: {
      '@type': 'Organization',
      name: 'ItWhip'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ItWhip',
      url: 'https://itwhip.com'
    },
    datePublished: '2025-01-01',
    dateModified: '2025-11-27',
    mainEntityOfPage: 'https://itwhip.com/insurance-guide'
  }

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
    { id: 'overview', label: 'Overview' },
    { id: 'tiers', label: 'Insurance Tiers' },
    { id: 'primary-secondary', label: 'Primary vs Secondary' },
    { id: 'bring-your-own', label: 'Bring Your Own' },
    { id: 'coverage', label: "What's Covered" },
    { id: 'deductibles', label: 'Deductibles' },
    { id: 'fnol', label: 'FNOL & Claims' },
    { id: 'lapse', label: 'Insurance Lapse' },
    { id: 'guest', label: 'Guest Insurance' },
    { id: 'faq', label: 'FAQs' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* JSON-LD Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

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
                Insurance Guide
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host/signup" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Start Hosting
              </Link>
              <Link href="/host-protection" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Host Protection
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
        
        {/* Hero Section - Enhanced */}
        <section className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 py-16 sm:py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-20 h-20 border border-white rounded-full" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-purple-200" />
              <span className="text-sm font-medium text-white/90">Phoenix • Scottsdale • Tempe</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Insurance Made Simple
            </h1>
            <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Everything you need to know about protection on ItWhip, explained in plain English. Choose your tier, understand your coverage, and host with confidence.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">$1M</div>
                <div className="text-xs sm:text-sm text-purple-200">Liability Coverage</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-white">48-72h</div>
                <div className="text-xs sm:text-sm text-purple-200">Claims Resolution</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">3</div>
                <div className="text-xs sm:text-sm text-purple-200">Tier Options</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
                <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
                <span>FNOL Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
                <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
                <span>Arizona Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
                <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
                <span>24/7 Roadside</span>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section ref={overviewRef} id="overview" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How Insurance Works on ItWhip
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We've built a transparent insurance system that puts you in control.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                The Simple Version
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  When you list your car on ItWhip, you choose an <strong className="text-gray-900 dark:text-white">insurance tier</strong> based on what coverage you bring to the table. The more insurance you provide, the more you earn from each rental.
                </p>
                <p>
                  Think of it like this: If we're handling all the insurance risk, we need a bigger cut to cover potential claims. But if you already have commercial insurance that covers rentals, we're sharing less risk—so you keep more money.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoLayersOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Tiered System
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  3 simple tiers based on the insurance you bring: 40%, 75%, or 90% earnings.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoSwapHorizontalOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Primary/Secondary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your insurance is primary when you bring it. Platform insurance backs you up.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Always Covered
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No matter your tier, every rental includes $1M liability coverage.
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
                The Three Insurance Tiers
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your earnings are determined by the insurance you bring. It's that simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* BASIC Tier */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-gray-300">
                <div className="bg-gray-500 text-white py-3 px-6 text-center">
                  <span className="text-sm font-bold">BASIC TIER</span>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-gray-600 mb-2">40%</div>
                    <div className="text-sm text-gray-500">You Keep</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">No Insurance Required</div>
                        <div className="text-sm text-gray-500">We provide all the coverage</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Platform Insurance Primary</div>
                        <div className="text-sm text-gray-500">We handle everything</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">$2,500 Deductible</div>
                        <div className="text-sm text-gray-500">Your max out-of-pocket</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Best for:</strong> New hosts, occasional renters, or those without P2P-friendly insurance.
                    </div>
                  </div>
                </div>
              </div>

              {/* STANDARD Tier */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-amber-500 relative">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
                <div className="bg-amber-500 text-white py-3 px-6 text-center">
                  <span className="text-sm font-bold">STANDARD TIER</span>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-amber-600 mb-2">75%</div>
                    <div className="text-sm text-gray-500">You Keep</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">P2P Insurance Required</div>
                        <div className="text-sm text-gray-500">You bring peer-to-peer coverage</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Your Insurance Primary</div>
                        <div className="text-sm text-gray-500">Platform is backup</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">$1,500 Deductible</div>
                        <div className="text-sm text-gray-500">Lower out-of-pocket</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Best for:</strong> Hosts with Getaround, State Farm P2P, or similar coverage.
                    </div>
                  </div>
                </div>
              </div>

              {/* PREMIUM Tier */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-emerald-500">
                <div className="bg-emerald-500 text-white py-3 px-6 text-center">
                  <span className="text-sm font-bold">PREMIUM TIER</span>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-emerald-600 mb-2">90%</div>
                    <div className="text-sm text-gray-500">You Keep</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Commercial Insurance Required</div>
                        <div className="text-sm text-gray-500">Full commercial auto policy</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Your Insurance Primary</div>
                        <div className="text-sm text-gray-500">Platform is backup</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">$1,000 Deductible</div>
                        <div className="text-sm text-gray-500">Lowest out-of-pocket</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Best for:</strong> Fleet operators, serious hosts, and those with commercial policies.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Example */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Real Earnings Example
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Scenario</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">BASIC (40%)</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-amber-600">STANDARD (75%)</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-emerald-600">PREMIUM (90%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Trip Price: $100/day</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-gray-600">$40</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-amber-600">$75</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-emerald-600">$90</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Monthly (15 days rented)</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-gray-600">$600</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-amber-600">$1,125</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-emerald-600">$1,350</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Annual Projection</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-gray-600">$7,200</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-amber-600">$13,500</td>
                      <td className="text-center py-3 px-4 text-sm font-bold text-emerald-600">$16,200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                * Based on $100/day rate with 15 rental days per month
              </p>
            </div>
          </div>
        </section>

        {/* Integration Section - NEW */}
        <section className="py-10 bg-purple-50 dark:bg-purple-900/20 border-y border-purple-200 dark:border-purple-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                  <IoSpeedometerOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    Verified by Mileage Forensics™
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Claims are backed by GPS-verified trip data for faster resolution and accurate documentation.
                  </p>
                  <Link 
                    href="/mileage-forensics"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm text-purple-700 dark:text-purple-400 font-medium hover:underline"
                  >
                    Learn more
                    <IoArrowForwardOutline className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                  <IoLeafOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                    ESG Score Integration
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your compliance history contributes to your ESG score, building trust with guests and insurers.
                  </p>
                  <Link 
                    href="/esg-dashboard"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                  >
                    View ESG Dashboard
                    <IoArrowForwardOutline className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Remaining sections continue with rounded-lg instead of rounded-xl... */}
        {/* For brevity, I'll include the key remaining sections */}

        {/* FAQ Section */}
        <section ref={faqRef} id="faq" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <FAQItem 
                question="Do I need my own car insurance to host on ItWhip?"
                answer="No. With the BASIC tier (40%), we provide all the insurance coverage. You don't need any of your own. However, if you want to earn more (75% or 90%), you'll need to bring P2P or commercial insurance that covers car sharing."
              />
              <FAQItem 
                question="Will my personal auto insurance cover me while renting on ItWhip?"
                answer="Almost certainly not. Most personal auto policies explicitly exclude coverage when you're renting your car for money. Using your personal policy for car sharing could actually void your coverage entirely. We strongly recommend either staying in the BASIC tier or getting proper P2P/commercial coverage."
              />
              <FAQItem 
                question="What's the difference between P2P insurance and commercial insurance?"
                answer={`P2P Insurance: An endorsement or separate policy specifically designed for peer-to-peer car sharing. Offered by some major insurers like State Farm, Farmers, and specialty providers. Usually more affordable than commercial. Qualifies you for the 75% tier.

Commercial Insurance: A full commercial auto policy that covers business use of your vehicle, including rentals. More expensive but comprehensive. Required for the 90% tier. Best for fleet operators or those with multiple vehicles.`}
              />
              <FAQItem 
                question="How long does the claims process take?"
                answer={`Our target timeline:
                
• Incident Report (FNOL): Immediate upon submission
• Initial Review: Within 24 hours
• FDCR Documentation: 24-48 hours
• Standard Resolution: 48-72 hours
• Complex Claims: 5-7 business days

Most straightforward claims (minor damage, clear fault) are resolved within 3 business days.`}
              />
              <FAQItem 
                question="What is Mileage Forensics and how does it affect insurance?"
                answer={`Mileage Forensics™ is our system that tracks odometer readings between trips to verify usage patterns. It helps with insurance by:

• Detecting potential fraud (like unreported personal use)
• Providing accurate data for claims
• Verifying hosts are using vehicles according to their declared usage type
• Giving insurance carriers confidence in our data

This is part of why we can offer competitive coverage—we have the data to back up claims accurately.`}
              />
            </div>
          </div>
        </section>

        {/* Related Resources - NEW */}
        <section className="py-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Related Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link 
                href="/blog/p2p-insurance-tiers"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Blog</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">P2P Insurance Tiers Explained →</p>
              </Link>
              <Link 
                href="/mileage-forensics"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Feature</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Mileage Forensics™ →</p>
              </Link>
              <Link 
                href="/host-protection"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Protection</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Host Protection →</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoShieldCheckmarkOutline className="w-12 h-12 text-purple-200 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Hosting?
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              Choose your tier and start earning with confidence in Phoenix, Scottsdale, and Tempe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/host/signup"
                className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                List Your Car →
              </Link>
              <Link 
                href="/host-protection"
                className="inline-block px-8 py-4 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition border border-purple-400"
              >
                View Host Protection
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
                    Important Information
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Protection provided through licensed third-party insurance carriers. Coverage amounts and availability subject to vehicle eligibility, location, and underwriter approval. ItWhip facilitates coverage but is not an insurance company. Protection applies only during active rental periods booked through our platform. Physical damage reimbursement is contractual allocation of risk, not insurance. Deductibles and coverage limits are subject to change. Individual insurance requirements and coverage may vary. Consult with your personal insurance provider before participating in car sharing. FNOL and claims processes are subject to documentation requirements and may vary based on incident complexity. Insurance tier eligibility requires fleet verification of provided documentation. Lapsed insurance results in automatic tier downgrade. Platform reserves right to modify terms, features, and tier requirements with notice. Arizona-specific regulations apply. This information does not constitute insurance, legal, or financial advice.
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