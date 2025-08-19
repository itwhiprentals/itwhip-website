// app/legal/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoLockClosedOutline,
  IoBusinessOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoWarningOutline,
  IoCodeSlashOutline,
  IoServerOutline,
  IoLayersOutline,
  IoGlobeOutline,
  IoConstructOutline,
  IoKeyOutline,
  IoMenuOutline,
  IoCloseOutline
} from 'react-icons/io5'

export default function LegalPage() {
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const sections = [
    {
      id: 'classification',
      title: '1. Service Classification & Platform Definition',
      icon: IoBusinessOutline,
      critical: true
    },
    {
      id: 'membership',
      title: '2. Membership & Private Club Terms',
      icon: IoShieldCheckmarkOutline,
      critical: true
    },
    {
      id: 'hotel-partnership',
      title: '3. Hotel Partnership Framework',
      icon: IoBusinessOutline,
      critical: false
    },
    {
      id: 'technology',
      title: '4. Technology & Intellectual Property',
      icon: IoCodeSlashOutline,
      critical: false
    },
    {
      id: 'third-party',
      title: '5. Third-Party Service Providers',
      icon: IoLayersOutline,
      critical: true
    },
    {
      id: 'sdk-api',
      title: '6. SDK & API Terms',
      icon: IoServerOutline,
      critical: false
    },
    {
      id: 'data-privacy',
      title: '7. Data Protection & Privacy',
      icon: IoLockClosedOutline,
      critical: false
    },
    {
      id: 'liability',
      title: '8. Limitation of Liability',
      icon: IoWarningOutline,
      critical: true
    },
    {
      id: 'indemnification',
      title: '9. Indemnification',
      icon: IoShieldCheckmarkOutline,
      critical: true
    },
    {
      id: 'dispute',
      title: '10. Dispute Resolution & Arbitration',
      icon: IoDocumentTextOutline,
      critical: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Simple Header - No imports */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16">
          <div className="flex justify-between items-center h-full">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              ItWhip
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <button onClick={handleSearchClick} className="text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Search
              </button>
              <button onClick={handleGetAppClick} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Get App
              </button>
            </nav>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <IoCloseOutline className="w-6 h-6" /> : <IoMenuOutline className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Page Title Section */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Legal Framework
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
                Last Updated: January 2025
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Privacy Policy
              </Link>
              <Link href="/private-club" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Membership Terms
              </Link>
              <Link 
                href="/contact"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Legal Inquiries
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/terms" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoDocumentTextOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Terms</span>
              </Link>
              <Link 
                href="/privacy" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLockClosedOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Privacy</span>
              </Link>
              <Link 
                href="/private-club" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Membership</span>
              </Link>
              <Link 
                href="/contact"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span>Legal Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <IoCheckmarkCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                  Fully Compliant Hospitality Platform
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Legal Terms & Conditions
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
                ItWhip Technologies, Inc. ("ItWhip," "we," "us," or "our") operates as a hospitality 
                technology platform and private membership club facilitating access to hotel amenities 
                and pre-purchased travel packages.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Important Legal Notice
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      By accessing or using any ItWhip services, websites, applications, or technology platforms, 
                      you acknowledge that you have read, understood, and agree to be bound by these Legal Terms 
                      and all incorporated policies and agreements. If you do not agree, you must not use our services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Legal Content */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Sections 1-10 */}
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-amber-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {section.title}
                        </h2>
                        {section.critical && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-semibold rounded">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <IoArrowForwardOutline className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedSection === section.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                    
                    {expandedSection === section.id && (
                      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Section content for {section.title}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Additional Legal Sections */}
            <div className="mt-8 space-y-6">
              
              {/* Section 11: Governing Law */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoGlobeOutline className="w-5 h-5 text-amber-600 mr-2" />
                  11. Governing Law & Jurisdiction
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    These Terms shall be governed by and construed in accordance with the laws of the State of Arizona, 
                    without regard to its conflict of law provisions.
                  </p>
                </div>
              </div>

              {/* Section 12: Modifications */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoConstructOutline className="w-5 h-5 text-amber-600 mr-2" />
                  12. Modifications & Updates
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    ItWhip reserves the right to modify these Terms at any time.
                  </p>
                </div>
              </div>

              {/* Section 13: Severability */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoLayersOutline className="w-5 h-5 text-amber-600 mr-2" />
                  13. Severability & Entire Agreement
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These Terms constitute the entire agreement between you and ItWhip.
                  </p>
                </div>
              </div>

              {/* Section 14: Contact Information */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoInformationCircleOutline className="w-5 h-5 text-amber-600 mr-2" />
                  14. Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Inquiries</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Legal Department<br />
                      ItWhip Technologies, Inc.<br />
                      2390 E Camelback Rd, Suite 130<br />
                      Phoenix, AZ 85016<br />
                      Email: legal@itwhip.com
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy & Data Protection</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Data Protection Officer<br />
                      Email: privacy@itwhip.com<br />
                      Phone: 1-855-ITWHIP1<br />
                      GDPR Representative: ItWhip EU Ltd.<br />
                      Dublin, Ireland
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 15: Definitions */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoKeyOutline className="w-5 h-5 text-amber-600 mr-2" />
                  15. Definitions
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <dl className="space-y-3">
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Platform</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                        The ItWhip technology platform.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Services</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                        Technology services provided by ItWhip.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Member</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                        Any individual or entity enrolled in the ItWhip private membership club.
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-center">
                  <IoLockClosedOutline className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Terms Acceptance Required
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                    By clicking Accept Terms below, you acknowledge that you have read, understood, and agree to be 
                    bound by all provisions of these Legal Terms and Conditions.
                  </p>
                  
                  <div className="flex items-start justify-center mb-6">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300 text-left max-w-md">
                      I have read, understood, and agree to the ItWhip Legal Terms and Conditions.
                    </label>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Decline & Exit
                    </button>
                    <button
                      disabled={!acceptedTerms}
                      onClick={() => {
                        if (acceptedTerms) {
                          localStorage.setItem('termsAccepted', new Date().toISOString())
                          router.push('/')
                        }
                      }}
                      className={`px-6 py-3 rounded-lg font-semibold transition ${
                        acceptedTerms 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Accept Terms & Continue
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                    Last Updated: January 2025 | Version 3.14.7
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  )
}