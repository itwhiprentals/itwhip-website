// app/how-it-works/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoTimeOutline,
  IoPhonePortraitOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoBusinessOutline,
  IoStarOutline,
  IoTrendingUpOutline,
  IoKeyOutline,
  IoCarOutline,
  IoSearchOutline,
  IoFlashOutline,
  IoCashOutline,
  IoHeartOutline,
  IoReceiptOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoChevronForwardOutline,
  IoSparklesOutline,
  IoCameraOutline,
  IoFingerPrintOutline,
  IoNotificationsOutline,
  IoMailOutline,
  IoAnalyticsOutline,
  IoClipboardOutline,
  IoTimerOutline,
  IoWifiOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoMedalOutline
} from 'react-icons/io5'

export default function HowItWorksPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'guest' | 'host'>('guest')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const guestSteps = [
    {
      icon: IoSearchOutline,
      title: 'Find Your Perfect Car',
      description: 'Browse our curated fleet. Filter by type, price, and features. No account required.',
      details: [
        'Economy to exotic vehicles available',
        'Real photos and verified reviews',
        'Transparent pricing with all fees shown',
        'Instant availability calendar'
      ],
      cta: { text: 'Browse Cars', link: '/' }
    },
    {
      icon: IoMailOutline,
      title: 'Book in 60 Seconds',
      description: 'Book with just your email - no signup hassles. Guest checkout available.',
      details: [
        'No app download required',
        'Email confirmation instantly',
        'Secure payment processing',
        'Manage booking via email link'
      ]
    },
    {
      icon: IoKeyOutline,
      title: 'Pick Up & Drive',
      description: 'Multiple convenient pickup options. Full protection included automatically.',
      details: [
        'Hotel lobby pickup available',
        'Airport location (Sky Harbor)',
        'Optional delivery to your location',
        'Comprehensive insurance included'
      ]
    }
  ]

  const hostSteps = [
    {
      icon: IoDocumentTextOutline,
      title: 'Quick Application',
      description: '5-minute online application. Instant approval for qualifying vehicles.',
      details: [
        '2015 or newer vehicles qualify',
        'Under 130,000 miles required',
        'Clean title verification',
        'Free 20-minute inspection'
      ],
      cta: { text: 'Start Application', link: '/list-your-car' }
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'We Handle Everything',
      description: 'Complete protection included. Guest screening, payments, and support managed.',
      details: [
        'Up to $2M liability coverage',
        'Multi-point guest verification',
        'All communication handled',
        '48-72 hour claims resolution'
      ],
      cta: { text: 'View Protection Details', link: '/host-protection' }
    },
    {
      icon: IoCashOutline,
      title: 'Get Paid in 48 Hours',
      description: 'Industry\'s fastest payments via direct deposit. Track earnings in real-time.',
      details: [
        '48-hour payment guarantee',
        'Keep 78-85% of rental revenue',
        'No payment processing fees',
        'Automated tax documentation'
      ],
      cta: { text: 'Calculate Earnings', link: '/host-earnings' }
    }
  ]

  const guestBenefits = [
    {
      icon: IoWalletOutline,
      title: 'Better Prices',
      description: 'Save 20-35% compared to traditional rentals. No surge pricing ever.',
      highlight: 'Starting at $45/day'
    },
    {
      icon: IoPhonePortraitOutline,
      title: 'No Account Required',
      description: 'Book with just email. Access booking anytime via secure link.',
      highlight: 'Guest checkout available'
    },
    {
      icon: IoLocationOutline,
      title: 'Convenient Locations',
      description: 'Vehicles at major hotels and Sky Harbor Airport.',
      highlight: 'Free hotel delivery'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Full Protection',
      description: 'Every rental includes comprehensive insurance coverage.',
      highlight: 'Peace of mind included'
    },
    {
      icon: IoTimeOutline,
      title: 'Flexible Rentals',
      description: 'Daily or weekly rentals. Extend easily through our platform.',
      highlight: 'Instant booking'
    },
    {
      icon: IoStarOutline,
      title: 'Quality Vehicles',
      description: 'All cars inspected and maintained. Wide selection available.',
      highlight: 'Verified reviews'
    }
  ]

  const hostBenefits = [
    {
      icon: IoTrendingUpOutline,
      title: 'Higher Earnings',
      description: 'Keep 78-85% of rental revenue. Simple, transparent commission.',
      highlight: '$600-3,000/month average',
      link: '/host-earnings'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: '$0 Insurance Cost',
      description: 'Protection included - save $3,000-6,000/year vs commercial insurance.',
      highlight: 'Up to $2M coverage',
      link: '/host-protection'
    },
    {
      icon: IoFlashOutline,
      title: '48-Hour Payments',
      description: 'Fastest in the industry. Direct deposit after each trip.',
      highlight: 'Get paid quickly'
    },
    {
      icon: IoAnalyticsOutline,
      title: 'Smart Tools',
      description: 'GPS tracking, pricing optimization, and earnings analytics.',
      highlight: 'Professional platform'
    },
    {
      icon: IoReceiptOutline,
      title: 'Tax Benefits',
      description: 'Deduct expenses and depreciation. Save $8,000-25,000 annually.',
      highlight: 'Maximize deductions'
    },
    {
      icon: IoHeartOutline,
      title: 'Full Support',
      description: 'We handle guest communication and claims. You just provide the car.',
      highlight: 'Hassle-free hosting'
    }
  ]

  const requirements = {
    guest: [
      { text: 'Valid driver\'s license', required: true },
      { text: '21+ years old (25+ for luxury/exotic)', required: true },
      { text: 'Valid payment method', required: true },
      { text: 'Pass verification check', required: true },
      { text: 'Smartphone for best experience', required: false }
    ],
    host: [
      { text: 'Vehicle 2015 or newer', required: true },
      { text: 'Under 130,000 miles', required: true },
      { text: 'Clean title (no salvage)', required: true },
      { text: 'Pass safety inspection', required: true },
      { text: 'Phoenix metro location', required: true }
    ]
  }

  const hostTiers = [
    {
      tier: 'Standard Host',
      trips: 'Starting out',
      commission: '15-20%',
      benefits: 'Full protection, 48hr payments'
    },
    {
      tier: 'Silver Host',
      trips: '10+ trips',
      commission: '14-19%',
      benefits: 'Priority placement, dedicated support'
    },
    {
      tier: 'Gold Host',
      trips: '25+ trips',
      commission: '13-18%',
      benefits: 'Featured listings, instant payouts'
    },
    {
      tier: 'Platinum Host',
      trips: '50+ trips',
      commission: '12-17%',
      benefits: 'Homepage features, API access'
    }
  ]

  const faqs = [
    {
      question: 'How is this different from traditional car rental?',
      answer: 'We offer a curated fleet at better prices with more convenient pickup locations. No rental counter lines, transparent pricing, and the option to book without creating an account.',
      category: 'general'
    },
    {
      question: 'What protection is included?',
      answer: 'Every rental includes liability insurance up to $2M and physical damage protection. Both guests and hosts are fully protected during the rental period.',
      category: 'general'
    },
    {
      question: 'Can I book without an account?',
      answer: 'Yes! Book with just your email address. We\'ll send confirmation and a secure link to manage your booking. No app download required.',
      category: 'guest'
    },
    {
      question: 'How do I pick up the car?',
      answer: 'Multiple options: hotel lobby pickup, airport location, or delivery to your address. You\'ll receive detailed pickup instructions via email.',
      category: 'guest'
    },
    {
      question: 'How much can I earn as a host?',
      answer: 'Earnings vary by vehicle: Economy cars average $600-1,100/month, standard vehicles $900-1,500/month, luxury $1,500-3,000/month based on 15-20 rental days.',
      category: 'host'
    },
    {
      question: 'When do hosts get paid?',
      answer: 'Within 48 hours of trip completion via direct deposit - the fastest in the industry. Choose daily or weekly payout schedules.',
      category: 'host'
    },
    {
      question: 'What are the vehicle requirements?',
      answer: 'Vehicles must be 2015 or newer, have under 130,000 miles, clean title, and pass our safety inspection. All types welcome from economy to exotic.',
      category: 'host'
    },
    {
      question: 'How does pricing work?',
      answer: 'Hosts set competitive daily rates. We add a 15-20% platform fee that covers insurance and support. Guests see the total price upfront with no hidden fees.',
      category: 'general'
    },
    {
      question: 'What if something goes wrong?',
      answer: 'Our support team responds within 1-2 hours during business hours. For accidents or urgent issues, we have priority handling with typical response in minutes.',
      category: 'general'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
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
              <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                How It Works
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/list-your-car" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Become a Host
              </Link>
              <Link href="/" className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                Find a Car
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Car Rentals Made Simple
                <span className="block text-purple-600 mt-2">For Phoenix</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                Whether you need a car or want to earn from yours, we've made it simple.
              </p>

              {/* Tab Selector */}
              <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('guest')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'guest' 
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <IoPersonOutline className="inline w-5 h-5 mr-2" />
                  I Need a Car
                </button>
                <button
                  onClick={() => setActiveTab('host')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'host' 
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <IoCarOutline className="inline w-5 h-5 mr-2" />
                  I Have a Car
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {activeTab === 'guest' ? '3 Simple Steps to Your Perfect Rental' : 'Start Earning in 24 Hours'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' 
                  ? 'Book in under 60 seconds. No account required.' 
                  : 'Quick approval. Complete protection. Fast payments.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(activeTab === 'guest' ? guestSteps : hostSteps).map((step, idx) => (
                <div key={idx} className="relative">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 left-full w-full">
                      <IoChevronForwardOutline className="w-8 h-8 text-purple-300 -ml-4" />
                    </div>
                  )}
                  
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Step {idx + 1}: {step.title}
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

        {/* Benefits Section */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {activeTab === 'guest' ? 'Why Rent With Us' : 'Why Hosts Choose Us'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' 
                  ? 'Better prices, more convenience, full protection' 
                  : 'Higher earnings, zero insurance costs, professional tools'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'guest' ? guestBenefits : hostBenefits).map((benefit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <benefit.icon className="w-10 h-10 text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {benefit.description}
                  </p>
                  <p className="text-xs font-semibold text-purple-600">
                    {benefit.highlight}
                  </p>
                  {benefit.link && (
                    <Link 
                      href={benefit.link}
                      className="inline-flex items-center mt-3 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Learn more
                      <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {activeTab === 'host' && (
              <div className="mt-12 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  <IoSparklesOutline className="w-4 h-4 mr-2" />
                  Limited Time: 0% commission for your first 60 days
                </div>
                <div className="mt-4">
                  <Link 
                    href="/list-your-car"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Start earning today
                    <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Simple Requirements
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {activeTab === 'guest' ? 'To Rent a Car' : 'To List Your Car'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements[activeTab].map((req, idx) => (
                  <div key={idx} className="flex items-start">
                    {req.required ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    ) : (
                      <IoInformationCircleOutline className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-gray-700 dark:text-gray-300">{req.text}</span>
                      {req.required && (
                        <span className="ml-2 text-xs text-gray-500">(Required)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {activeTab === 'host' ? (
                  <Link 
                    href="/host-requirements"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View detailed requirements
                    <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <Link 
                    href="/contact"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Have questions? Contact us
                    <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Host Tiers - Only show for hosts */}
        {activeTab === 'host' && (
          <section className="py-12 sm:py-16 bg-white dark:bg-black">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Earn More as You Grow
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Unlock rewards and reduced commissions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hostTiers.map((tier, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                    {idx === 0 && <IoCarOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />}
                    {idx === 1 && <IoMedalOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />}
                    {idx === 2 && <IoRibbonOutline className="w-8 h-8 text-yellow-500 mx-auto mb-2" />}
                    {idx === 3 && <IoDiamondOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />}
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{tier.tier}</h4>
                    <p className="text-xs text-gray-500 mb-2">{tier.trips}</p>
                    <p className="text-sm font-bold text-purple-600 mb-2">{tier.commission}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{tier.benefits}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link 
                  href="/host-benefits"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View all host benefits →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* FAQs Section */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs
                .filter(faq => faq.category === 'general' || faq.category === activeTab)
                .map((faq, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
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

            <div className="mt-8 text-center">
              <Link 
                href="/contact"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                Have more questions? Contact us
                <IoArrowForwardOutline className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-8">
              {activeTab === 'guest' 
                ? 'Find your perfect car in Phoenix today' 
                : 'Turn your car into a revenue generator'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {activeTab === 'guest' ? (
                <>
                  <Link 
                    href="/"
                    className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
                  >
                    Search Available Cars
                  </Link>
                  <button 
                    onClick={() => setActiveTab('host')}
                    className="inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
                  >
                    Or List Your Car
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/list-your-car"
                    className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
                  >
                    List Your Car Now
                  </Link>
                  <Link 
                    href="/host-earnings"
                    className="inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
                  >
                    Calculate Earnings
                  </Link>
                </>
              )}
            </div>

            {activeTab === 'host' && (
              <p className="text-xs text-purple-200 mt-6">
                Join hundreds of Phoenix hosts earning extra income
              </p>
            )}
          </div>
        </section>

        {/* Support Notice */}
        <section className="py-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <IoNotificationsOutline className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Quick Response Support
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Contact us through our support center - typical response within 1-2 hours during business hours
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For urgent issues, mark as priority for faster response
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}