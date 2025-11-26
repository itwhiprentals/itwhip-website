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
  IoStatsChartOutline
} from 'react-icons/io5'

export default function HowItWorksPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'guest' | 'host'>('guest')
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
      title: 'Find Your Perfect Car',
      description: 'Browse cars from local Phoenix owners. Filter by type, price, features, and ESG impact score.',
      details: [
        'Economy to exotic vehicles from local hosts',
        'Real photos and verified reviews',
        'Transparent pricing - all fees shown upfront',
        'ESG Impact scores on every vehicle',
        'Instant availability calendar'
      ],
      cta: { text: 'Browse Cars', link: '/' }
    },
    {
      icon: IoFingerPrintOutline,
      title: 'Quick Verification',
      description: 'Complete our streamlined verification process. Just driver\'s license and selfie required.',
      details: [
        'Upload driver\'s license photo',
        'Quick selfie for identity match',
        'Instant background check',
        'Add personal insurance for 50% off deposits',
        'One-time setup for all future rentals'
      ]
    },
    {
      icon: IoKeyOutline,
      title: 'Pick Up & Drive',
      description: 'Meet your host or use contactless pickup. $1M liability coverage included on every trip.',
      details: [
        'Hotel lobby pickup at 50+ Arizona hotels',
        'Phoenix Sky Harbor Airport location',
        'Optional delivery to your address',
        '$1M liability coverage included',
        '24/7 roadside assistance'
      ]
    }
  ]

  const hostSteps = [
    {
      icon: IoDocumentTextOutline,
      title: 'List Your Vehicle',
      description: '5-minute application. Upload photos, set your price, choose your insurance tier.',
      details: [
        '2015 or newer vehicles qualify',
        'Under 130,000 miles required',
        'Clean title verification',
        'Professional photo guidelines provided',
        'Smart pricing suggestions included'
      ],
      cta: { text: 'Start Application', link: '/host/signup' }
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Choose Your Insurance Tier',
      description: 'Pick your tier based on the insurance you bring. More coverage = higher earnings.',
      details: [
        'BASIC (40%): We provide all insurance',
        'STANDARD (75%): You bring P2P insurance',
        'PREMIUM (90%): You bring commercial insurance',
        '$1M liability on all tiers',
        'Platform insurance always backs you up'
      ],
      cta: { text: 'View Insurance Details', link: '/insurance-guide' }
    },
    {
      icon: IoCashOutline,
      title: 'Get Paid in 48 Hours',
      description: 'Industry\'s fastest payments via direct deposit. Track earnings in real-time.',
      details: [
        '48-hour payment after trip completion',
        'Keep 40-90% based on your tier',
        'Real-time earnings dashboard',
        'Automated tax documentation (1099)',
        'Loss of use compensation if damaged'
      ],
      cta: { text: 'Calculate Earnings', link: '/host-protection' }
    }
  ]

  const guestBenefits = [
    {
      icon: IoPeopleOutline,
      title: 'Rent From Real People',
      description: 'Connect directly with local Phoenix car owners. Better cars, better prices, better experience.',
      highlight: 'P2P car sharing'
    },
    {
      icon: IoWalletOutline,
      title: 'Save 20-35%',
      description: 'No rental counter markup. No surge pricing. Transparent fees shown before you book.',
      highlight: 'Starting at $45/day'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: '$1M Coverage Included',
      description: 'Every rental includes comprehensive liability insurance. Add your own for 50% off deposits.',
      highlight: 'Fully insured trips'
    },
    {
      icon: IoLocationOutline,
      title: 'Convenient Pickup',
      description: 'Pick up at 50+ Arizona hotels, Sky Harbor Airport, or get it delivered.',
      highlight: 'Free hotel delivery'
    },
    {
      icon: IoLeafOutline,
      title: 'ESG Impact Tracking',
      description: 'See the environmental impact of your rental. Choose eco-friendly vehicles.',
      highlight: 'CSRD compliant'
    },
    {
      icon: IoStarOutline,
      title: 'Verified Hosts',
      description: 'All hosts are verified. Read real reviews from previous guests.',
      highlight: 'Trusted community'
    }
  ]

  const hostBenefits = [
    {
      icon: IoTrendingUpOutline,
      title: 'Earn Up to 90%',
      description: 'Keep 40-90% of each rental based on your insurance tier. You choose your earnings.',
      highlight: '$600-3,000/month average',
      link: '/host-protection'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Complete Protection',
      description: '$1M liability coverage on every trip. Platform insurance always backs you up.',
      highlight: 'All tiers protected',
      link: '/insurance-guide'
    },
    {
      icon: IoFlashOutline,
      title: '48-Hour Payments',
      description: 'Fastest in the industry. Direct deposit after each completed trip.',
      highlight: 'Get paid quickly'
    },
    {
      icon: IoAnalyticsOutline,
      title: 'Mileage Forensics™',
      description: 'Our proprietary system tracks usage patterns, prevents fraud, and verifies trips.',
      highlight: 'Advanced protection'
    },
    {
      icon: IoLeafOutline,
      title: 'ESG Dashboard',
      description: 'Track your vehicle\'s environmental impact. Earn badges and attract eco-conscious guests.',
      highlight: 'Sustainability metrics'
    },
    {
      icon: IoReceiptOutline,
      title: 'Tax Benefits',
      description: 'Deduct expenses and depreciation. Potential savings of $8,000-25,000 annually.',
      highlight: 'Maximize deductions'
    }
  ]

  const insuranceTiers = [
    {
      tier: 'BASIC',
      percentage: '40%',
      color: 'gray',
      insurance: 'Platform Insurance',
      deductible: '$2,500',
      description: 'No insurance needed from you. We handle everything.',
      best: 'New hosts, occasional renters'
    },
    {
      tier: 'STANDARD',
      percentage: '75%',
      color: 'amber',
      insurance: 'P2P Insurance',
      deductible: '$1,500',
      description: 'You bring peer-to-peer coverage, your insurance is primary.',
      best: 'Hosts with Getaround, State Farm P2P'
    },
    {
      tier: 'PREMIUM',
      percentage: '90%',
      color: 'emerald',
      insurance: 'Commercial Insurance',
      deductible: '$1,000',
      description: 'You bring commercial auto insurance, maximum earnings.',
      best: 'Fleet operators, serious hosts'
    }
  ]

  const guestVerification = [
    {
      step: 1,
      title: 'Driver\'s License',
      description: 'Upload a photo of your valid driver\'s license',
      icon: IoDocumentTextOutline
    },
    {
      step: 2,
      title: 'Selfie Verification',
      description: 'Quick selfie to match your ID photo',
      icon: IoCameraOutline
    },
    {
      step: 3,
      title: 'Background Check',
      description: 'Automated driving record and background verification',
      icon: IoFingerPrintOutline
    },
    {
      step: 4,
      title: 'Payment Method',
      description: 'Add a valid credit or debit card',
      icon: IoWalletOutline
    }
  ]

  const requirements = {
    guest: [
      { text: 'Valid driver\'s license (US or international)', required: true },
      { text: '21+ years old (25+ for luxury/exotic)', required: true },
      { text: 'Valid payment method (credit/debit card)', required: true },
      { text: 'Pass background & driving record check', required: true },
      { text: 'Personal auto insurance (optional, 50% off deposit)', required: false }
    ],
    host: [
      { text: 'Vehicle 2015 or newer', required: true },
      { text: 'Under 130,000 miles', required: true },
      { text: 'Clean title (no salvage/rebuilt)', required: true },
      { text: 'Pass vehicle safety inspection', required: true },
      { text: 'Phoenix metro area location', required: true },
      { text: 'P2P or commercial insurance (for higher tiers)', required: false }
    ]
  }

  const platformFeatures = [
    {
      title: 'Mileage Forensics™',
      description: 'Proprietary system tracks odometer readings between trips to verify usage and prevent fraud.',
      icon: IoStatsChartOutline
    },
    {
      title: 'ESG Scoring',
      description: 'Every vehicle has an environmental impact score. Hosts earn badges, guests make informed choices.',
      icon: IoLeafOutline
    },
    {
      title: 'FNOL-Ready Claims',
      description: 'First Notice of Loss system captures all data insurers need. Claims resolved in 48-72 hours.',
      icon: IoClipboardOutline
    },
    {
      title: 'Smart Guest Screening',
      description: 'Multi-point verification including identity, driving history, and background checks.',
      icon: IoFingerPrintOutline
    }
  ]

  const faqs = [
    {
      question: 'How is ItWhip different from Turo?',
      answer: 'ItWhip is a peer-to-peer car sharing platform focused on Arizona. We offer transparent insurance tiers where YOU choose your earnings (40-90%), $1M liability coverage on all trips, advanced Mileage Forensics™ fraud prevention, and ESG impact tracking. We also partner directly with 50+ Arizona hotels for convenient guest pickup.',
      category: 'general'
    },
    {
      question: 'What insurance is included?',
      answer: 'Every trip includes $1M liability coverage regardless of your tier. Physical damage coverage (collision & comprehensive), roadside assistance, and loss of use compensation are also included. Your tier determines who\'s primary: BASIC uses platform insurance, STANDARD/PREMIUM use your insurance with platform as backup.',
      category: 'general'
    },
    {
      question: 'How does guest verification work?',
      answer: 'Guests complete a simple 4-step verification: upload driver\'s license, take a selfie for ID matching, pass automated background/driving record check, and add a payment method. This is a one-time process for all future rentals. Guests who add personal insurance get 50% off security deposits.',
      category: 'guest'
    },
    {
      question: 'What are the pickup options?',
      answer: 'Multiple convenient options: meet your host at one of 50+ partner hotel lobbies, pick up at our Phoenix Sky Harbor Airport location, or request delivery to your address (fees may apply). You\'ll receive detailed instructions after booking.',
      category: 'guest'
    },
    {
      question: 'How do the insurance tiers work?',
      answer: 'Your earnings are determined by the insurance you bring: BASIC (40%) - we provide all coverage, STANDARD (75%) - you bring P2P insurance like State Farm or Getaround coverage, PREMIUM (90%) - you bring commercial auto insurance. Higher tiers also get lower deductibles ($2,500 → $1,500 → $1,000).',
      category: 'host'
    },
    {
      question: 'How much can I earn?',
      answer: 'Earnings vary by vehicle and tier. At the 90% tier: Economy cars average $800-1,400/month, standard vehicles $1,200-2,000/month, luxury $2,000-4,000/month based on 15-20 rental days. Use our earnings calculator to estimate your specific vehicle.',
      category: 'host'
    },
    {
      question: 'When do hosts get paid?',
      answer: 'Within 48 hours of trip completion via direct deposit - the fastest in the industry. You can track all earnings in real-time through your host dashboard. We also provide automated 1099 tax documentation.',
      category: 'host'
    },
    {
      question: 'What is Mileage Forensics™?',
      answer: 'Our proprietary system that tracks odometer readings between trips to verify usage patterns, detect potential fraud, and ensure hosts are using vehicles according to their declared usage type. This protects both hosts and insurance partners.',
      category: 'host'
    },
    {
      question: 'What happens if there\'s damage?',
      answer: 'Our FNOL (First Notice of Loss) system captures all information insurers need. Report damage within 24 hours through the app with photos. Claims are typically resolved within 48-72 hours. Your deductible depends on your tier: BASIC $2,500, STANDARD $1,500, PREMIUM $1,000.',
      category: 'general'
    },
    {
      question: 'Is ItWhip available outside Arizona?',
      answer: 'Currently, we\'re focused on the Phoenix metro area and Arizona. We operate under Arizona\'s P2P car sharing legislation (A.R.S. § 28-9601). Expansion to other states is planned for 2025.',
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
                How It Works
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host/signup" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Become a Host
              </Link>
              <Link href="/insurance-guide" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Insurance Guide
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
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-10 pb-0 sm:pb-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4">
                <IoPeopleOutline className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">Peer-to-Peer Car Sharing</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                Rent Cars From Local Owners
                <span className="block text-purple-600 mt-1">In Phoenix, Arizona</span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Skip the rental counter. Connect directly with local hosts. 
                Fully insured, transparent pricing, hosts earn up to 90%.
              </p>

              {/* Tab Selector */}
              <div className="inline-flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1.5 shadow-lg border border-gray-300 dark:border-gray-700 mt-8">
                <button
                  onClick={() => setActiveTab('guest')}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'guest' 
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-xl border-2 border-purple-500' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <IoPersonOutline className="inline w-5 h-5 mr-2" />
                  I Need a Car
                </button>
                <button
                  onClick={() => setActiveTab('host')}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'host' 
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-xl border-2 border-purple-500' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
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
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {activeTab === 'guest' ? '3 Simple Steps to Rent' : '3 Steps to Start Earning'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' 
                  ? 'Rent from local owners with full insurance coverage' 
                  : 'Choose your tier, set your price, get paid fast'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(activeTab === 'guest' ? guestSteps : hostSteps).map((step, idx) => (
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
                      <span className="text-sm font-bold text-purple-600">Step {idx + 1}</span>
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

        {/* Insurance Tiers Section - Host Only */}
        {activeTab === 'host' && (
          <section className="py-8 sm:py-10 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose Your Earnings Tier
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your earnings are determined by the insurance you bring
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {insuranceTiers.map((tier, idx) => (
                  <div 
                    key={idx}
                    className={`relative rounded-lg p-6 border-2 shadow-xl ${
                      tier.color === 'emerald' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                        : tier.color === 'amber'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300'
                    }`}
                  >
                    {tier.color === 'amber' && (
                      <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                        POPULAR
                      </div>
                    )}
                    <div className={`text-sm font-bold mb-2 ${
                      tier.color === 'emerald' ? 'text-emerald-600'
                      : tier.color === 'amber' ? 'text-amber-600'
                      : 'text-gray-600'
                    }`}>
                      {tier.tier} TIER
                    </div>
                    <div className={`text-4xl font-black mb-1 ${
                      tier.color === 'emerald' ? 'text-emerald-600'
                      : tier.color === 'amber' ? 'text-amber-600'
                      : 'text-gray-600'
                    }`}>
                      {tier.percentage}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">You Keep</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {tier.insurance}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {tier.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      Deductible: {tier.deductible}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500">Best for:</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{tier.best}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link 
                  href="/insurance-guide"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  Learn more about insurance tiers
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
                  Simple Verification Process
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  One-time setup, then rent any car on the platform
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {guestVerification.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-xs font-bold text-purple-600 mb-1">Step {item.step}</div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-5 text-center shadow-lg border border-green-200 dark:border-green-800">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                  Add Your Insurance, Save 50%
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Guests who verify personal auto insurance get 50% off security deposits on all rentals.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {activeTab === 'guest' ? 'Why Rent on ItWhip' : 'Why Hosts Choose ItWhip'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'guest' 
                  ? 'Peer-to-peer car sharing with full insurance coverage' 
                  : 'Transparent tiers, complete protection, professional tools'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeTab === 'guest' ? guestBenefits : hostBenefits).map((benefit, idx) => (
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
                  {benefit.link && (
                    <Link 
                      href={benefit.link}
                      className="inline-flex items-center mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Learn more
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
                What Makes ItWhip Different
              </h2>
              <p className="text-gray-400">
                Advanced technology for safer, smarter car sharing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {platformFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-5 text-center border border-white/20">
                  <feature.icon className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
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
                Requirements
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                {activeTab === 'guest' ? 'To Rent a Car' : 'To List Your Car'}
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
                        <span className="ml-2 text-xs text-gray-500">(Required)</span>
                      ) : (
                        <span className="ml-2 text-xs text-blue-500">(Optional)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href={activeTab === 'host' ? '/host-protection' : '/insurance-guide'}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  {activeTab === 'host' ? 'View full host protection details' : 'Learn about guest protection'}
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
                  Arizona P2P Car Sharing Compliant
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  ItWhip operates under Arizona's peer-to-peer car sharing legislation (A.R.S. § 28-9601 through 28-9613), 
                  which provides a clear regulatory framework for car sharing platforms.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>• Transaction Privilege Tax compliant</span>
                  <span>• State minimum exceeded ($1M vs $25K/$50K/$15K)</span>
                  <span>• Proper vehicle registration verification</span>
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
                Frequently Asked Questions
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
                Have more questions? Contact us
                <IoArrowForwardOutline className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-8 sm:py-10 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              {activeTab === 'guest' ? 'Ready to Rent?' : 'Ready to Earn?'}
            </h2>
            <p className="text-base sm:text-lg text-purple-100 mb-6">
              {activeTab === 'guest' 
                ? 'Find your perfect car from local Phoenix owners' 
                : 'Choose your tier and start earning up to 90%'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {activeTab === 'guest' ? (
                <>
                  <Link 
                    href="/"
                    className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-xl"
                  >
                    Browse Available Cars
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
                    href="/host/signup"
                    className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-xl"
                  >
                    List Your Car Now
                  </Link>
                  <Link 
                    href="/insurance-guide"
                    className="inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
                  >
                    Insurance Guide
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
                <div className="text-xs text-gray-500">Liability Coverage</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">48hr</div>
                <div className="text-xs text-gray-500">Host Payments</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">50+</div>
                <div className="text-xs text-gray-500">Hotel Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">90%</div>
                <div className="text-xs text-gray-500">Max Host Earnings</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}