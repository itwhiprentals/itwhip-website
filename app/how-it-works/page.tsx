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
  IoSparklesOutline
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
      title: 'Search & Book',
      description: 'Find your perfect ride near any Phoenix hotel or location. No account required.',
      details: [
        'Instant availability across Phoenix metro',
        'Compare vehicles by type and price',
        'Book with just email - no signup needed',
        'Transparent pricing with no hidden fees'
      ],
      cta: { text: 'Search Cars', link: '/' }
    },
    {
      icon: IoKeyOutline,
      title: 'Pick Up',
      description: 'Convenient pickup at hotels, airport, or delivery to your location.',
      details: [
        'Hotel lobby pickup available',
        'Sky Harbor Airport location',
        'Optional delivery service',
        'Contactless options available'
      ]
    },
    {
      icon: IoCarOutline,
      title: 'Drive & Return',
      description: 'Enjoy your trip with full protection included. Easy return process.',
      details: [
        'Comprehensive insurance included',
        'Responsive digital support',
        'Flexible return locations',
        'Simple inspection process'
      ]
    }
  ]

  const hostSteps = [
    {
      icon: IoDocumentTextOutline,
      title: 'List Your Vehicle',
      description: 'Quick approval process. Professional photos. Set your availability.',
      details: [
        'Vehicles 2015 or newer qualify',
        'Set your own pricing and rules',
        'Control your calendar',
        'Professional listing support'
      ],
      cta: { text: 'Start Listing Process', link: '/list-your-car' }
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'We Handle Everything',
      description: 'Guest screening, insurance, payments, and support all managed for you.',
      details: [
        'Comprehensive protection included',
        'All guests verified',
        'We handle guest communication',
        'Damage claims managed'
      ],
      cta: { text: 'Learn About Protection', link: '/host-protection' }
    },
    {
      icon: IoCashOutline,
      title: 'Get Paid Fast',
      description: 'Direct deposit within 48 hours. Track earnings in real-time.',
      details: [
        'Industry-leading payment speed',
        'No payment processing fees',
        'Detailed earnings reports',
        'Tax documentation provided'
      ],
      cta: { text: 'View Earnings Potential', link: '/host-earnings' }
    }
  ]

  const guestBenefits = [
    {
      icon: IoWalletOutline,
      title: 'Transparent Pricing',
      description: 'No surge pricing. Clear rates upfront. All fees shown before booking.',
      highlight: 'Save up to 35% vs traditional rentals'
    },
    {
      icon: IoPhonePortraitOutline,
      title: 'Book Without Account',
      description: 'No app download required. Book with just your email. Get instant confirmation.',
      highlight: 'Ready in 60 seconds'
    },
    {
      icon: IoLocationOutline,
      title: 'Convenient Locations',
      description: 'Vehicles available at major hotels and Sky Harbor Airport.',
      highlight: 'Phoenix metro coverage'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Full Protection',
      description: 'Every rental includes comprehensive insurance coverage with clear deductibles.',
      highlight: 'Peace of mind included'
    },
    {
      icon: IoTimeOutline,
      title: 'Flexible Options',
      description: 'Hourly, daily, or weekly rentals. Extend easily through the app.',
      highlight: 'Your schedule, your way'
    },
    {
      icon: IoStarOutline,
      title: 'Quality Vehicles',
      description: 'All cars inspected and maintained. Wide selection from economy to luxury.',
      highlight: 'Something for everyone'
    }
  ]

  const hostBenefits = [
    {
      icon: IoTrendingUpOutline,
      title: 'Maximize Earnings',
      description: 'Earn up to 85% of each rental. No listing fees. No hidden charges.',
      highlight: 'Keep more of what you earn',
      link: '/host-earnings'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Complete Protection',
      description: 'Up to $1M liability coverage. Physical damage protection with deductibles. We handle all claims.',
      highlight: 'Your car is protected',
      link: '/host-protection'
    },
    {
      icon: IoBusinessOutline,
      title: 'Access Hotel Guests',
      description: 'Tap into demand from our growing hotel network. Prime placement at partner locations.',
      highlight: 'Built-in demand'
    },
    {
      icon: IoFlashOutline,
      title: 'Fast Payments',
      description: 'Get paid within 48 hours. Direct deposit. Real-time earnings tracking.',
      highlight: 'Fastest in the industry'
    },
    {
      icon: IoHeartOutline,
      title: 'We Handle Support',
      description: 'All guest communication managed. Responsive digital support. You just provide the car.',
      highlight: 'Hassle-free hosting'
    },
    {
      icon: IoReceiptOutline,
      title: 'Tax Benefits',
      description: 'Automated tax reporting. Business expense tracking. Potential deductions available.',
      highlight: 'Simplify tax season'
    }
  ]

  const requirements = {
    guest: [
      { text: 'Valid driver\'s license', required: true },
      { text: '21 years or older (25+ for luxury)', required: true },
      { text: 'Valid payment method', required: true },
      { text: 'Clean driving record', required: false },
      { text: 'Smartphone for app features', required: false }
    ],
    host: [
      { text: 'Vehicle 2015 or newer', required: true },
      { text: 'Clean title', required: true },
      { text: 'Valid registration & insurance', required: true },
      { text: 'Pass safety inspection', required: true },
      { text: 'Phoenix metro location', required: true }
    ]
  }

  const faqs = [
    {
      question: 'How is this different from traditional car rental?',
      answer: 'We connect you directly with local vehicle owners and our managed fleet, offering more variety, better prices, and convenient hotel pickup locations. No rental counter lines, no hidden fees.',
      category: 'general'
    },
    {
      question: 'What protection is included?',
      answer: 'Every rental includes liability insurance up to $1M and physical damage protection with reasonable deductibles. Hosts are fully protected, and guests have peace of mind.',
      category: 'general'
    },
    {
      question: 'How do hotel pickups work?',
      answer: 'Many vehicles are available at partner hotels. Simply select hotel pickup during booking, and collect keys from the concierge or designated area. Some hosts offer lobby meet-and-greet.',
      category: 'guest'
    },
    {
      question: 'Can I book without creating an account?',
      answer: 'Yes! Book with just your email address. We\'ll send confirmation and access details instantly. Download our app for the best experience, but it\'s not required.',
      category: 'guest'
    },
    {
      question: 'How quickly do hosts get paid?',
      answer: 'Hosts receive payment via direct deposit within 48 hours of trip completion. This is significantly faster than other platforms.',
      category: 'host'
    },
    {
      question: 'What if my car is damaged?',
      answer: 'Our protection covers physical damage with deductibles based on vehicle value. We handle all claims and coordinate repairs. You\'re never alone in the process.',
      category: 'host'
    },
    {
      question: 'What are the vehicle requirements?',
      answer: 'Vehicles must be 2015 or newer, have a clean title, pass our safety inspection, and be registered in Arizona. All types welcome from economy to luxury.',
      category: 'host'
    },
    {
      question: 'How does pricing work?',
      answer: 'Hosts set their daily rates. We add a platform fee for our services and protection. Guests see total price upfront with no hidden fees. Airport and delivery fees shown clearly.',
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
                Car Sharing Made Simple
                <span className="block text-purple-600 mt-2">For Phoenix</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                Whether you're looking to rent a car or earn from your vehicle,
                we've streamlined everything.
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
                {activeTab === 'guest' ? 'Book a Car in 3 Simple Steps' : 'Start Earning in 3 Simple Steps'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' 
                  ? 'No account required. Book in under 60 seconds.' 
                  : 'Quick approval. Professional support. Fast payments.'}
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
                {activeTab === 'guest' ? 'Why Guests Choose Us' : 'Why Hosts Love Us'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' 
                  ? 'Better prices, more convenience, full protection' 
                  : 'Higher earnings, complete protection, hassle-free management'}
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
                Join our growing community of Phoenix hosts earning extra income
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}