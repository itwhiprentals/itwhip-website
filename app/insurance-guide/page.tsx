// app/insurance-guide/page.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
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
    const refMap: Record<string, React.RefObject<HTMLElement>> = {
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
              <Link href="/host/insurance-options" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Host Insurance Tiers
              </Link>
              <Link href="/support/insurance" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Insurance Support
              </Link>
              <Link href="/list-your-car" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Start Hosting
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
              Insurance Made Simple
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Everything you need to know about protection on ItWhip, explained in plain English.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                <span>$1M Liability Coverage</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                <span>FNOL Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                <span>48-72hr Claims</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Banner */}
        <section className="py-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Quick Links:</span>
              <Link
                href="/host/insurance-options"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                Host Insurance Tiers
              </Link>
              <Link
                href="/support/insurance"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              >
                <IoHelpCircleOutline className="w-4 h-4" />
                Insurance Support
              </Link>
              <Link
                href="/host-protection"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
              >
                <IoLayersOutline className="w-4 h-4" />
                Host Protection
              </Link>
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

        {/* Primary vs Secondary Section */}
        <section ref={primarySecondaryRef} id="primary-secondary" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Primary vs Secondary Insurance
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Understanding which insurance pays first is crucial. Here's how it works.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                What Does "Primary" Mean?
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  <strong className="text-gray-900 dark:text-white">Primary insurance</strong> is the coverage that pays first when there's a claim. It's the "first responder" of insurance—the policy that steps up immediately.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Secondary insurance</strong> only kicks in after the primary coverage is exhausted or doesn't apply. Think of it as your backup safety net.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  BASIC Tier (40%)
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded">PRIMARY</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Platform Insurance</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We handle everything. Our insurance is the first (and only) coverage that applies during rentals.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  STANDARD Tier (75%)
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-amber-600 px-2 py-0.5 rounded">PRIMARY</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Your P2P Insurance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 bg-gray-300 px-2 py-0.5 rounded">SECONDARY</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Platform Insurance</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your P2P policy pays first. If it doesn't cover something or denies the claim, our platform insurance backs you up.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 mb-8">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                PREMIUM Tier (90%)
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">PRIMARY</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Your Commercial Insurance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600 bg-gray-300 px-2 py-0.5 rounded">SECONDARY</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Platform Insurance</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your commercial policy handles claims first. We provide backup coverage if needed.
                </p>
              </div>
            </div>

            {/* The Insurance Hierarchy */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                The Complete Insurance Hierarchy
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                When a claim is filed, here's the order in which insurance coverage is applied:
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Primary Coverage</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Host's verified insurance (P2P or Commercial) OR Platform insurance if host has none
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Secondary Coverage</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Platform insurance (backup if primary denies or doesn't cover)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Tertiary Coverage</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Guest's personal insurance (if they added and verified it)
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
                Bringing Your Own Insurance
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                How to qualify for the 75% or 90% tier by adding your own coverage.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Step-by-Step Process
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Get the Right Insurance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Not all insurance covers car sharing. You need either:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <strong>P2P Insurance</strong> - Policies from providers like State Farm, Farmers, or specialty P2P insurers</li>
                      <li>• <strong>Commercial Auto Insurance</strong> - A policy that explicitly covers rental/livery use</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Your Documents</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      In your host dashboard, upload your insurance declaration page showing coverage limits, policy number, expiration date, and named insured.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Fleet Verification</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our team reviews your policy to confirm it covers P2P rentals or commercial use. This usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tier Upgrade</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Once approved, your earnings tier automatically upgrades. You'll see the change in your dashboard immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                  <IoRibbonOutline className="w-6 h-6" />
                  For 75% Tier (P2P Insurance)
                </h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Accepted Providers:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• State Farm (P2P endorsement)</li>
                    <li>• Farmers (rideshare/P2P coverage)</li>
                    <li>• USAA (car sharing endorsement)</li>
                    <li>• Allstate (peer economy endorsement)</li>
                    <li>• Liberty Mutual (livery coverage)</li>
                    <li>• Specialty P2P insurers</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Minimum Coverage:</strong> $100K/$300K liability, comprehensive & collision
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                  <IoDiamondOutline className="w-6 h-6" />
                  For 90% Tier (Commercial)
                </h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Requirements:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Commercial auto policy</li>
                    <li>• Covers rental/livery use explicitly</li>
                    <li>• Named insured matches vehicle registration</li>
                    <li>• Active and valid through rental periods</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Minimum Coverage:</strong> $500K/$1M liability, full comprehensive & collision, garage keeper's liability
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <div className="flex gap-3">
                <IoWarningOutline className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                    Important: Personal Auto Policies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Most standard personal auto insurance policies do <strong>not</strong> cover car sharing. In fact, renting your car without proper coverage can void your personal policy entirely. Always check with your insurance provider or get a specific P2P/commercial endorsement.
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
                What's Covered (and What's Not)
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Complete breakdown of protection during rentals.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="bg-green-500 text-white py-3 px-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <IoCheckmarkCircle className="w-5 h-5" />
                  What IS Covered
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Liability Coverage ($1M)</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Bodily injury to third parties
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Property damage to others
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Legal defense costs
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Medical payments (up to $5K)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Physical Damage (ACV)</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Collision damage
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Comprehensive (theft, vandalism, weather)
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Hit-and-run damage
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Animal collisions
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Additional Benefits</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Loss of use compensation ($30-50/day)
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        24/7 roadside assistance
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Towing (up to 50 miles)
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Uninsured/underinsured motorist
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Roadside Services</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Jump starts
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Flat tire service
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Lockout assistance
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        Fuel delivery (up to 3 gallons)
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
                  What is NOT Covered
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Mechanical Issues</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Mechanical or electrical breakdown
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Normal wear and tear
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Pre-existing damage
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Manufacturing defects
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Personal Property</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Personal belongings in vehicle
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Undocumented aftermarket accessories
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Cash, jewelry, electronics
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Cargo or transported goods
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Driver Behavior</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Intentional damage
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        DUI/DWI incidents
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Racing or speed competitions
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Unauthorized drivers
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Prohibited Use</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Off-platform commercial use
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Rideshare (Uber/Lyft) while rented
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Illegal activities
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        Border crossings without approval
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
                How Deductibles Work
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your deductible is the amount you pay before coverage kicks in.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Plain English Explanation
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Think of a deductible as your "skin in the game." If there's $3,000 in damage and you have a $1,500 deductible, you pay the first $1,500 and insurance covers the remaining $1,500.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Why do higher tiers have lower deductibles?</strong>
                </p>
                <p>
                  Because you're bringing more insurance to the table. When you have commercial insurance (90% tier), your insurer has already assessed you as a lower risk—so we can offer you a lower deductible.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center border-2 border-gray-300">
                <div className="text-sm font-bold text-gray-500 mb-2">BASIC (40%)</div>
                <div className="text-4xl font-black text-gray-600 mb-2">$2,500</div>
                <div className="text-sm text-gray-500">Deductible</div>
                <div className="mt-4 text-xs text-gray-500">
                  Platform handles all insurance
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center border-2 border-amber-500">
                <div className="text-sm font-bold text-amber-500 mb-2">STANDARD (75%)</div>
                <div className="text-4xl font-black text-amber-600 mb-2">$1,500</div>
                <div className="text-sm text-gray-500">Deductible</div>
                <div className="mt-4 text-xs text-gray-500">
                  Your P2P insurance is primary
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center border-2 border-emerald-500">
                <div className="text-sm font-bold text-emerald-500 mb-2">PREMIUM (90%)</div>
                <div className="text-4xl font-black text-emerald-600 mb-2">$1,000</div>
                <div className="text-sm text-gray-500">Deductible</div>
                <div className="mt-4 text-xs text-gray-500">
                  Your commercial insurance is primary
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                <IoHelpCircleOutline className="w-6 h-6" />
                40% Tier vs Bringing Your Own Insurance
              </h4>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>40% Tier (BASIC):</strong> You don't need any insurance. We provide everything. But you keep less of each rental AND have a higher deductible ($2,500) if something goes wrong.
                </p>
                <p>
                  <strong>75%/90% Tier (STANDARD/PREMIUM):</strong> You bring your own coverage. You keep more money AND have lower deductibles ($1,500 or $1,000). Plus, your insurance likely has better service and faster claims because it's your policy.
                </p>
                <p className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <strong className="text-gray-900 dark:text-white">Bottom Line:</strong> If you're serious about hosting and plan to rent frequently, getting P2P or commercial insurance almost always pays for itself through higher earnings and lower deductibles.
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
                FNOL & FDCR: Our Claims Process
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                How we handle incidents from first report to resolution.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-400 mb-4">
                What is FNOL?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>FNOL (First Notice of Loss)</strong> is the insurance industry term for the initial report you make when an incident occurs. It's the official start of the claims process.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                On ItWhip, we've built an FNOL-ready system that captures all the information insurance carriers need right from the start. This means faster claims processing and fewer back-and-forth requests.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Our Claims Timeline
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoFlashOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Immediate: Incident Report (FNOL)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Guest or host reports incident through the app. Photos, location, and description are captured automatically.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoSearchOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Within 24 Hours: Initial Review</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our team reviews the claim, verifies coverage, and contacts all parties. We gather additional documentation if needed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoDocumentOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">24-48 Hours: FDCR Documentation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>FDCR (Full Documentation & Claims Report)</strong> is compiled with trip data, mileage forensics, photos, and guest/host statements.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    <IoSettingsOutline className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">48-72 Hours: Resolution</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Claim approved/denied, repair estimates provided, and payout processed. For complex claims, this may extend to 5-7 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  What We Collect for FNOL
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <IoCameraOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Damage photos with GPS/timestamp metadata
                  </li>
                  <li className="flex items-start gap-2">
                    <IoDocumentTextOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Written incident description
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCarOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Pre-trip and post-trip vehicle condition
                  </li>
                  <li className="flex items-start gap-2">
                    <IoReceiptOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Trip details (dates, mileage, booking info)
                  </li>
                  <li className="flex items-start gap-2">
                    <IoPeopleOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Third-party information (if applicable)
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  FDCR Includes
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <IoTrendingUpOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Mileage Forensics™ usage verification
                  </li>
                  <li className="flex items-start gap-2">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Insurance hierarchy documentation
                  </li>
                  <li className="flex items-start gap-2">
                    <IoTimeOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Complete trip timeline
                  </li>
                  <li className="flex items-start gap-2">
                    <IoLeafOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Host ESG/compliance status
                  </li>
                  <li className="flex items-start gap-2">
                    <IoLockClosedOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    Guest verification records
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
                What Happens If Your Insurance Lapses?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Important information for hosts in the 75% and 90% tiers.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-8 mb-8">
              <div className="flex gap-4">
                <IoAlertCircleOutline className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
                    This Is Serious
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    If you're in the 75% or 90% tier and your insurance expires, lapses, or is cancelled—you're no longer eligible for that tier. Here's what happens:
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                If Your Insurance Lapses
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Immediate Tier Downgrade</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You'll automatically drop to the 40% BASIC tier until you provide valid insurance again.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Higher Deductible Applies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Any claims during the lapse period will be subject to the $2,500 BASIC deductible, not your previous lower amount.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Earnings Impact</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All rentals during the lapse earn at the 40% rate, not your previous tier rate. This applies to any trips that start during the lapse.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Vehicle May Be Paused</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For extended lapses (30+ days), your vehicle listing may be temporarily paused until insurance is restored.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                  <IoCheckmarkCircle className="w-6 h-6" />
                  How to Avoid This
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Set calendar reminders for renewal dates</li>
                  <li>• Enable auto-pay with your insurance carrier</li>
                  <li>• Update your ItWhip profile when you renew</li>
                  <li>• Keep digital copies of your documents ready</li>
                  <li>• Notify us 30 days before expiration</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <IoRefreshOutline className="w-6 h-6" />
                  How to Restore Your Tier
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Get your insurance reinstated or renewed</li>
                  <li>• Upload new declaration page to your profile</li>
                  <li>• Submit for fleet verification</li>
                  <li>• Once approved, tier restores immediately</li>
                  <li>• Future rentals earn at your proper rate</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                We Track Expirations
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our system monitors your insurance expiration dates. You'll receive reminders at 60 days, 30 days, 14 days, and 7 days before expiration. We want you to stay in your highest earning tier—it's better for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Guest Insurance Section */}
        <section ref={guestRef} id="guest" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Guest Insurance Options
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                What renters need to know about protection during trips.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                For Guests: You're Already Covered
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Every rental on ItWhip includes $1M liability coverage. As a guest, you don't need to bring your own insurance to rent—but you can add it for extra benefits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Without Personal Insurance
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      $1M liability coverage included
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Physical damage protection
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      24/7 roadside assistance
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCloseCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      Full security deposit required
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    With Personal Insurance Added
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      All standard coverage included
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <strong className="text-green-600">50% off security deposit</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Your insurance as tertiary backup
                    </li>
                    <li className="flex items-start gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Faster claim resolution
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-4">
                How Guests Add Insurance
              </h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>1. Go to your guest profile settings</li>
                <li>2. Upload your personal auto insurance declaration page</li>
                <li>3. Our team verifies it covers rental vehicles</li>
                <li>4. Once approved, you get 50% off all future deposits</li>
              </ol>
              <p className="mt-4 text-sm text-gray-500">
                Note: Your personal insurance must explicitly cover rental vehicles. Many policies exclude P2P rentals—check with your carrier first.
              </p>
            </div>
          </div>
        </section>

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
                question="What happens during a claim if I have my own insurance?"
                answer={`If you're in the 75% or 90% tier with your own insurance:
                
1. Your insurance is primary - we file the claim with your carrier first
2. You pay your policy's deductible (not ours)
3. If your insurer denies or doesn't fully cover the claim, our platform insurance kicks in as secondary
4. You then pay our tier deductible ($1,500 or $1,000) for any remaining amount

This layered approach means you're never left without coverage.`}
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
                question="Can I switch tiers at any time?"
                answer="Yes, but changes only apply to future rentals, not current bookings. To upgrade your tier, simply upload your new insurance documents and wait for fleet verification (1-2 business days). To downgrade, you can update your settings anytime—but remember you'll earn less and have a higher deductible."
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
              <FAQItem 
                question="Does coverage apply if the guest drives outside Arizona?"
                answer="Coverage applies anywhere in the continental United States. However, trips to Mexico require advance approval and additional coverage. Trips to Canada are covered but require notification. Any international travel outside these areas is not covered."
              />
              <FAQItem 
                question="What if I have a claim and my insurance lapses during the process?"
                answer="Claims are evaluated based on your tier status at the time of the incident, not when the claim is resolved. If you had valid 75% or 90% tier insurance when the incident occurred, that coverage applies to the claim—even if your insurance later lapses. However, any new rentals would be at the 40% tier until insurance is restored."
              />
              <FAQItem 
                question="Are luxury and exotic cars covered differently?"
                answer={`Yes, high-value vehicles ($75K+) have additional requirements:

• Enhanced guest verification (higher age minimum, credit check)
• Larger security deposits ($2,500-5,000)
• GPS tracking required during rentals
• Priority claims handling
• Factory-authorized repair network only

Coverage limits are the same, but we take extra precautions to protect valuable vehicles.`}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Hosting?
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              Choose your tier and start earning with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/list-your-car"
                className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                List Your Car
              </Link>
              <Link
                href="/host/insurance-options"
                className="inline-block px-8 py-4 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition border border-purple-400"
              >
                View Insurance Tiers
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/support/insurance" className="text-purple-200 hover:text-white transition">
                Insurance Support &rarr;
              </Link>
              <Link href="/host-protection" className="text-purple-200 hover:text-white transition">
                Host Protection &rarr;
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