// app/driver-requirements/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCarOutline,
  IoPersonOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoTimeOutline,
  IoWalletOutline,
  IoStarOutline,
  IoRocketOutline,
  IoInformationCircleOutline,
  IoHelpCircleOutline,
  IoBookOutline,
  IoAlertCircleOutline,
  IoTrophyOutline,
  IoSchoolOutline,
  IoCardOutline,
  IoGlobeOutline,
  IoSparklesOutline,
  IoServerOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

export default function DriverRequirementsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('drivers')
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const driverRequirements = [
    {
      category: 'Legal Requirements',
      icon: IoDocumentTextOutline,
      items: [
        'Valid Arizona driver license (or out-of-state with AZ residency)',
        'Minimum 3 years driving experience',
        'Clean driving record (no DUIs, no major violations in 3 years)',
        'Commercial insurance coverage (minimum $300K/$500K)',
        'Business license or LLC registration',
        'TPT license for Arizona tax compliance'
      ]
    },
    {
      category: 'Professional Standards',
      icon: IoBriefcaseOutline,
      items: [
        'Professional appearance and demeanor',
        'Hotel service training certification',
        'English proficiency required',
        'Background check clearance',
        'Drug screening compliance',
        'Maintain 4.9+ star rating'
      ]
    },
    {
      category: 'Platform Requirements',
      icon: IoGlobeOutline,
      items: [
        'Smartphone with iOS 14+ or Android 10+',
        'Active bank account for direct deposits',
        'Complete identity verification',
        'Availability for hotel partner priority requests',
        'Response time under 30 seconds',
        'Completion rate above 90%'
      ]
    }
  ]

  const vehicleRequirements = [
    {
      category: 'Vehicle Standards',
      icon: IoCarOutline,
      items: [
        'Model year 2019 or newer',
        'Luxury or premium brands preferred',
        'Four doors required (no coupes for standard service)',
        'Leather or premium interior',
        'Working AC and heating',
        'No cosmetic damage or modifications'
      ]
    },
    {
      category: 'Documentation',
      icon: IoDocumentTextOutline,
      items: [
        'Current vehicle registration',
        'Commercial vehicle insurance',
        'Regular maintenance records',
        'Annual safety inspection',
        'VIN verification',
        'Proof of ownership or lease agreement'
      ]
    },
    {
      category: 'Quality Standards',
      icon: IoSparklesOutline,
      items: [
        'Professional detailing twice monthly',
        'No smoking or strong odors',
        'Premium air fresheners only',
        'Phone chargers for iOS and Android',
        'Bottled water for passengers',
        'Trunk space for luggage'
      ]
    }
  ]

  const verificationProcess = [
    {
      step: 1,
      title: 'Submit Application',
      description: 'Complete online application with all required documents',
      time: '5 minutes',
      icon: IoDocumentTextOutline
    },
    {
      step: 2,
      title: 'Background Check',
      description: 'Comprehensive background and driving record verification',
      time: '24-48 hours',
      icon: IoShieldCheckmarkOutline
    },
    {
      step: 3,
      title: 'Vehicle Inspection',
      description: 'Schedule and complete vehicle quality inspection',
      time: '1-2 days',
      icon: IoCarOutline
    },
    {
      step: 4,
      title: 'Platform Training',
      description: 'Complete hotel service and platform orientation',
      time: '2 hours',
      icon: IoSchoolOutline
    },
    {
      step: 5,
      title: 'Activation',
      description: 'Receive approval and start accepting rides',
      time: 'Immediate',
      icon: IoRocketOutline
    }
  ]

  const trustFeatures = [
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Commercial Insurance',
      description: 'Every driver maintains commercial coverage exceeding state requirements'
    },
    {
      icon: IoBusinessOutline,
      title: 'Hotel Partner Network',
      description: 'Direct integration with premium hospitality partners'
    },
    {
      icon: IoServerOutline,
      title: 'GDS Integration',
      description: 'Amadeus-certified platform for travel industry compliance'
    },
    {
      icon: IoStarOutline,
      title: 'Quality Monitoring',
      description: 'Real-time performance tracking and guest feedback integration'
    },
    {
      icon: IoLockClosedOutline,
      title: 'Secure Platform',
      description: 'TU-1-A certified security with encrypted data protection'
    },
    {
      icon: IoWalletOutline,
      title: 'Guaranteed Payments',
      description: 'Direct deposit within 24 hours, no payment disputes'
    }
  ]

  const faqs = [
    {
      question: 'What type of insurance is required?',
      answer: 'All drivers must maintain commercial auto insurance with minimum coverage of $300,000 per person, $500,000 per accident for bodily injury, and $100,000 for property damage. Personal auto policies do not meet our requirements.'
    },
    {
      question: 'How are drivers vetted?',
      answer: 'Every driver undergoes comprehensive background checks including criminal history, driving records, and identity verification. We also verify commercial insurance, business licenses, and conduct vehicle inspections.'
    },
    {
      question: 'What vehicles qualify for the platform?',
      answer: 'Vehicles must be 2019 or newer, have four doors, leather or premium interior, and be in excellent condition. Luxury brands like Mercedes, BMW, Tesla, and Audi receive priority placement.'
    },
    {
      question: 'How does payment work for drivers?',
      answer: 'Drivers receive direct deposits within 24 hours of completed trips. Our GDS integration ensures guaranteed payments with no chargebacks or disputes.'
    },
    {
      question: 'What training is provided?',
      answer: 'All drivers complete hotel service training, platform orientation, and safety protocols. Ongoing training includes hospitality excellence and destination knowledge.'
    }
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
              <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Driver & Vehicle Standards
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/20 rounded">
                Professional Network
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/drive"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700"
              >
                Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Fixed */}
      <div className="fixed top-[106px] md:top-[112px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'drivers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Driver Requirements
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'vehicles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vehicle Standards
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'process'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Verification Process
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[156px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4 sm:mb-6">
                <IoShieldCheckmarkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">
                  Professionally Vetted Network
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Every Driver is
                <span className="block text-blue-600 mt-2">Professionally Certified</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                Our drivers maintain commercial insurance, pass comprehensive background checks, 
                and deliver hotel-grade service standards for every trip.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Insured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">4.9+</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monitored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">GDS</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Certified</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections Based on Active Tab */}
        {activeTab === 'drivers' && (
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Professional Driver Requirements
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Every driver in our network meets these comprehensive standards
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {driverRequirements.map((category, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.category}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'vehicles' && (
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Vehicle Standards & Requirements
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Only premium vehicles that meet our strict quality standards
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {vehicleRequirements.map((category, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.category}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'process' && (
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Comprehensive Verification Process
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Multi-step verification ensures only the best drivers join our network
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                {verificationProcess.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-start mb-8">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {step.step}
                        </div>
                      </div>
                      <div className="ml-6 flex-1">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {step.title}
                            </h3>
                            <span className="text-sm text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    {idx < verificationProcess.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust Features */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Why Travelers Trust Our Network
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Industry-leading standards and technology ensure safe, reliable transportation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trustFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-8 sm:py-12 bg-amber-50 dark:bg-amber-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
              <div className="flex items-start space-x-4">
                <IoAlertCircleOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Platform Notice
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    ItWhip is a GDS-integrated transportation technology platform that connects travelers 
                    with professional drivers. All drivers operate as independent contractors maintaining 
                    their own commercial insurance, business licenses, and tax compliance.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our platform facilitates connections, processes payments, and provides technology 
                    infrastructure while drivers maintain full responsibility for their insurance coverage 
                    and regulatory compliance. This ensures professional service standards while operating 
                    within Arizona transportation regulations.
                  </p>
                  <div className="mt-4">
                    <Link 
                      href="/terms"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read our Terms of Service →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Have more questions about our driver standards?
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>Contact our support team</span>
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Join Our Professional Network?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8">
              Earn more with guaranteed payments and access to premium travelers
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/drive" 
                className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg text-sm sm:text-base"
              >
                Apply to Drive
              </Link>
              <Link 
                href="/earnings"
                className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-400 transition text-sm sm:text-base"
              >
                View Earning Potential
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip. Professional transportation network serving the travel industry.</p>
              <div className="mt-3 sm:mt-4 space-x-3 sm:space-x-4">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                <Link href="/drive" className="hover:text-gray-700 dark:hover:text-gray-300">Drive</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}