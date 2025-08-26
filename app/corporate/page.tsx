// app/corporate/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoBusinessOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoGlobeOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoStatsChartOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoRocketOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoServerOutline,
  IoCashOutline,
  IoAnalyticsOutline,
  IoLockClosedOutline,
  IoCloudOutline,
  IoConstructOutline,
  IoSparklesOutline,
  IoAirplaneOutline,
  IoBusOutline,
  IoAddCircleOutline,
  IoSwapHorizontalOutline,
  IoCheckmarkOutline,
  IoArrowForwardOutline,
  IoTrendingDownOutline,
  IoReceiptOutline,
  IoLayersOutline,
  IoWarningOutline,
  IoCartOutline,
  IoStorefrontOutline,
  IoLeafOutline,
  IoBarChartOutline,
  IoAlertCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFlashOutline,
  IoRefreshOutline,
  IoNotificationsOutline,
  IoEarthOutline,
  IoPulseOutline,
  IoExtensionPuzzleOutline,
  IoCarOutline,
  IoCalculatorOutline,
  IoPlayCircleOutline,
  IoTimerOutline,
  IoDiamondOutline,
  IoTrophyOutline,
  IoFlameOutline,
  IoCloseCircleOutline,
  IoBanOutline,
  IoGiftOutline
} from 'react-icons/io5'

export default function CorporatePage() {
  const router = useRouter()
  
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('qualifier')
  const [dashboardView, setDashboardView] = useState<'corporate' | 'hotel' | 'flow'>('corporate')
  const [animationStep, setAnimationStep] = useState(0)
  const [savingsCounter, setSavingsCounter] = useState(0)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [liveNotification, setLiveNotification] = useState(0)
  const [ghostActivity, setGhostActivity] = useState(0)
  
  // Qualifier state
  const [userType, setUserType] = useState<'corporate' | 'hotel' | 'cfo' | null>(null)
  const [situation, setSituation] = useState<'have-rates' | 'need-everything' | 'want-savings' | null>(null)
  const [spendLevel, setSpendLevel] = useState<'under-1m' | '1m-5m' | 'over-5m' | null>(null)
  const [showCustomResults, setShowCustomResults] = useState(false)
  
  // Calculator state
  const [hotelDiscount, setHotelDiscount] = useState(30)
  const [monthlySpend, setMonthlySpend] = useState(50000)
  
  // Section refs
  const qualifierRef = useRef<HTMLDivElement>(null)
  const problemRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const transportRef = useRef<HTMLDivElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const partnersRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  // Handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, section: string) => {
    setActiveSection(section)
    if (ref.current) {
      const yOffset = -170
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleQualifierSubmit = () => {
    if (userType && situation && spendLevel) {
      setShowCustomResults(true)
      scrollToSection(dashboardRef, 'dashboard')
    }
  }

  const calculateSavings = () => {
    const transportSpend = monthlySpend * 0.3 // Assume 30% is transport
    const savings = transportSpend * (hotelDiscount / 100)
    return Math.round(savings)
  }

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveNotification((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ghostActivities = [
      "Marriott Downtown Phoenix just earned $127 from IBM ride",
      "Microsoft saved $347 on LAX airport transfer",
      "Deloitte group saved $1,247 on conference transport",
      "Hilton Scottsdale earned $89 from Accenture guest",
      "United Airlines corporate rate extended to ground transport",
      "PWC saved $567 avoiding surge pricing at CES Vegas"
    ]
    
    const interval = setInterval(() => {
      setGhostActivity((prev) => (prev + 1) % ghostActivities.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const target = 900000
    const increment = target / 100
    const timer = setInterval(() => {
      setSavingsCounter((prev) => {
        if (prev < target) {
          return Math.min(prev + increment, target)
        }
        return prev
      })
    }, 20)
    return () => clearInterval(timer)
  }, [])

  // Data
  const ghostActivities = [
    "Downtown hotel just earned $127 from corporate ride",
    "Fortune 500 company saved $347 on airport transfer",
    "Corporate group saved $1,247 on conference transport",
    "Luxury hotel earned $89 from business guest",
    "Major airline rate extended to ground transport",
    "Enterprise client saved $567 avoiding surge pricing"
  ]

  const problems = [
    {
      icon: IoReceiptOutline,
      title: '73 Different Invoices',
      description: 'Monthly reconciliation nightmare with separate vendors for hotels, flights, and transport',
      impact: '-$45K/year in admin costs'
    },
    {
      icon: IoWarningOutline,
      title: 'No Control Over Surge Pricing',
      description: 'Employees paying 3x rates during conferences while you have negotiated hotel rates',
      impact: '-$900K/year in overspend'
    },
    {
      icon: IoLeafOutline,
      title: 'ESG Reporting Crisis',
      description: 'CSRD compliance starts 2025. Manual Scope 3 tracking takes 200+ hours monthly',
      impact: '-$180K/year compliance cost'
    },
    {
      icon: IoAlertCircleOutline,
      title: '44% Rogue Booking',
      description: 'Nearly half book outside policy because managed channels are too restrictive',
      impact: '-$1.2M/year leakage'
    },
    {
      icon: IoCarOutline,
      title: 'Transportation Black Hole',
      description: 'You negotiated everything EXCEPT ground transport - the source of most complaints',
      impact: '30% of budget unmanaged'
    },
    {
      icon: IoLocationOutline,
      title: 'No Duty of Care Visibility',
      description: "Don't know where employees are during emergencies. No unified communication",
      impact: 'Unlimited liability risk'
    }
  ]

  const transportSolutions = [
    {
      title: 'Extend What You Have',
      icon: IoExtensionPuzzleOutline,
      description: 'Your negotiated hotel rates automatically apply to transportation',
      features: [
        'IBM gets 30% off hotels → 30% off rides',
        'No new negotiations needed',
        'Instant implementation',
        'Works with existing contracts'
      ],
      bestFor: 'Companies with existing rates'
    },
    {
      title: 'Fill The Gaps',
      icon: IoConstructOutline,
      description: 'We negotiate transportation rates where you need them',
      features: [
        'Missing 31 cities? We handle it',
        'Connect with local providers',
        'Quality & compliance guaranteed',
        'One contract covers all'
      ],
      bestFor: 'Partial coverage situations'
    },
    {
      title: 'Complete Solution',
      icon: IoBusinessOutline,
      description: 'Full travel management with transportation at the core',
      features: [
        'We handle all negotiations',
        'Book all travel types',
        'Manage all logistics',
        'Single point of contact'
      ],
      bestFor: 'New programs or full outsourcing'
    }
  ]

  const comparisons = {
    tmc: [
      { feature: 'Setup Time', tmc: '6+ months', itwhip: '4 minutes', winner: 'itwhip' },
      { feature: 'Rate Updates', tmc: '48-72 hour delay', itwhip: 'Real-time', winner: 'itwhip' },
      { feature: 'Transportation', tmc: 'Separate vendor', itwhip: 'Integrated with rates', winner: 'itwhip' },
      { feature: 'Booking Fees', tmc: '$25-40 per booking', itwhip: 'Platform fee only', winner: 'itwhip' },
      { feature: 'Hotels Earn', tmc: 'Nothing', itwhip: '15% commission', winner: 'itwhip' },
      { feature: 'ESG Reporting', tmc: 'Extra cost', itwhip: 'Included free', winner: 'itwhip' },
      { feature: 'Compliance Rate', tmc: '56% non-compliant', itwhip: '100% compliant', winner: 'itwhip' }
    ],
    uber: [
      { feature: 'Surge Pricing', uber: 'Yes (up to 3x)', itwhip: 'Never (fixed rates)', winner: 'itwhip' },
      { feature: 'Corporate Rates', uber: 'Not applicable', itwhip: 'Extended to rides', winner: 'itwhip' },
      { feature: 'Hotel Integration', uber: 'None', itwhip: 'Full integration', winner: 'itwhip' },
      { feature: 'Driver Quality', uber: 'Random', itwhip: 'Professional only', winner: 'itwhip' },
      { feature: 'Hotel Revenue', uber: '$0', itwhip: '$500K/year avg', winner: 'itwhip' },
      { feature: 'Availability', uber: 'Best effort', itwhip: '99.9% guaranteed', winner: 'itwhip' },
      { feature: 'Invoice', uber: 'Separate', itwhip: 'Consolidated', winner: 'itwhip' }
    ],
    manual: [
      { feature: 'Booking Time', manual: 'Hours per trip', itwhip: 'Minutes total', winner: 'itwhip' },
      { feature: 'Rate Access', manual: 'Consumer rates', itwhip: 'Corporate rates', winner: 'itwhip' },
      { feature: 'Invoicing', manual: '73+ receipts', itwhip: 'Single invoice', winner: 'itwhip' },
      { feature: 'Compliance', manual: '44% rogue booking', itwhip: '100% enforced', winner: 'itwhip' },
      { feature: 'Visibility', manual: 'None', itwhip: 'Complete dashboard', winner: 'itwhip' },
      { feature: 'Cost Savings', manual: '0%', itwhip: '35% average', winner: 'itwhip' },
      { feature: 'ESG Tracking', manual: 'Manual/None', itwhip: 'Automated', winner: 'itwhip' }
    ]
  }

  const revenueScenarios = [
    {
      title: 'Corporate with Existing Rates',
      icon: IoBusinessOutline,
      entry: 'Company has hotel rates, needs transport',
      whatTheyPay: 'Platform subscription',
      benefits: ['Rate extension to transport', 'No new negotiations', 'Instant savings'],
      color: 'blue'
    },
    {
      title: 'Certified Hotel',
      icon: IoStorefrontOutline,
      entry: 'Hotel wants corporate business',
      whatTheyPay: 'Certification fee',
      benefits: ['Earn commission on rides', 'Attract corporate clients', 'Free ESG compliance'],
      color: 'green'
    },
    {
      title: 'New Corporate (No Rates)',
      icon: IoRocketOutline,
      entry: 'Startup needs everything',
      whatTheyPay: 'Full service package',
      benefits: ['Complete rate negotiations', 'All travel managed', 'Single point of contact'],
      color: 'purple'
    },
    {
      title: 'Non-Certified Hotel',
      icon: IoBanOutline,
      entry: 'Hotel exploring options',
      whatTheyPay: 'No service provided',
      benefits: ['Must certify first', 'Missing revenue opportunity', 'Competitors gain advantage'],
      color: 'red'
    }
  ]

  const notifications = [
    { company: 'Fortune 500', saved: 127, hotel: 'Downtown Hotel', earned: 19.05 },
    { company: 'Tech Giant', saved: 89, hotel: 'Airport Hilton', earned: 13.35 },
    { company: 'Consulting Firm', saved: 156, hotel: 'Resort Property', earned: 23.40 }
  ]

  const currentNotification = notifications[liveNotification]

  const corporateRates = [
    { company: 'Example: Tech Corp', rate: '-30%', properties: 127, status: 'active' },
    { company: 'Example: Finance Co', rate: '-25%', properties: 89, status: 'active' },
    { company: 'Example: Consulting', rate: '-35%', properties: 76, status: 'active' },
    { company: 'Major Airlines', rate: 'Business', properties: 'Global', status: 'active' },
    { company: 'Car Rental', rate: '$45/day', properties: 'All locations', status: 'active' }
  ]

  const hotelRates = [
    { company: 'Corporate A', rate: '-30%', rides: 234, revenue: 3510 },
    { company: 'Corporate B', rate: '-25%', rides: 189, revenue: 2835 },
    { company: 'Corporate C', rate: '-35%', rides: 167, revenue: 2505 },
    { company: 'Corporate D', rate: '-20%', rides: 145, revenue: 2175 }
  ]

  const plans = [
    {
      name: 'Starter',
      price: '$4,500',
      period: 'per month',
      users: '25-100 employees',
      features: [
        'Rate extension to transportation',
        'Basic ESG reporting (CSRD compliant)',
        'Single consolidated invoice',
        'Standard vehicle options',
        'Airport transfer coordination',
        'Email support'
      ],
      savings: 'Save ~$15,000/month',
      highlight: false
    },
    {
      name: 'Business',
      price: '$15,000',
      period: 'per month',
      users: '100-500 employees',
      features: [
        'Everything in Starter',
        'Full managed travel services',
        'Advanced ESG analytics & offsets',
        'Group event transportation',
        'Executive vehicle options',
        'API integration with TMC',
        'Dedicated account manager',
        '24/7 phone support'
      ],
      savings: 'Save ~$75,000/month',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Based on volume',
      users: '500+ employees',
      features: [
        'Everything in Business',
        'Complete travel outsourcing',
        'Custom rate negotiations',
        'International coverage',
        'VIP & board member services',
        'Custom integrations',
        'Quarterly business reviews',
        'On-site support team'
      ],
      savings: 'Save $1M+ annually',
      highlight: false
    }
  ]

  const faqs = [
    {
      question: "How do you extend our existing hotel rates to transportation?",
      answer: "Simple: You enter your negotiated rates once (takes 4 minutes). Our platform automatically applies the same discount percentage or fixed rate to ground transportation at those properties. If your company has 30% off at certain hotels, you get 30% off rides to/from those hotels. No new negotiations, no contracts, it just works."
    },
    {
      question: "What if our hotels aren't on your platform?",
      answer: "No problem. We have three options: 1) We call your hotels and onboard them (they usually say yes immediately when they learn they'll earn 15% commission on rides), 2) We find equivalent alternatives with similar rates, or 3) We work alongside your existing bookings and just handle the transportation component. You don't lose any existing relationships."
    },
    {
      question: "How does this help with ESG/CSRD compliance?",
      answer: "Ground transportation represents 23% of travel emissions but is rarely tracked properly. We automatically capture every mile, calculate Scope 3 emissions, and generate CSRD-compliant reports monthly. No manual data entry. Our TU-1-A certification exceeds CSRD requirements. You'll be ready for 2025 reporting with zero additional effort."
    },
    {
      question: "Can we keep our existing TMC?",
      answer: "Absolutely! We complement TMCs, not replace them. Your TMC continues handling hotels and flights while we manage ground transportation. Or we can fully integrate - your choice. Many clients use us just for transportation rate extension. We make your TMC look good by solving their transportation gap."
    },
    {
      question: "How do you handle group events and conferences?",
      answer: "Complete coordination from 1 to 5,000 attendees. We manage airport transfers, hotel shuttles, venue transportation, and executive services. Real-time tracking, automatic flight adjustments, and single invoice. Your event team gets a dedicated dashboard showing every movement."
    },
    {
      question: "What about data security and privacy?",
      answer: "TU-1-A certification (exceeds industry standards). End-to-end encryption, aggregated APIs mean no personal data exposure to partners. Hotels see anonymized analytics only. GDPR/CCPA compliant by design. Your data stays yours - we never sell or share it."
    },
    {
      question: "How do you guarantee transportation availability?",
      answer: "Network of 10,000+ verified professional drivers. AI predicts demand based on your bookings. 99.9% availability rate with financial penalties if we can't deliver. No surge pricing ever - rates are locked regardless of demand."
    },
    {
      question: "What's the implementation timeline?",
      answer: "Week 1: Rate entry and system setup. Week 2: Integration testing with your systems. Week 3: Pilot group testing. Week 4: Full rollout. Most clients see savings from day one. No IT resources required from your side."
    },
    {
      question: "How do we know the ROI is real?",
      answer: "Free ROI analysis using your actual travel data. We'll show: current transport spend, projected savings with rate extension, ESG compliance value, and invoice consolidation savings. Average client saves $900K annually. We guarantee minimum 20% cost reduction."
    },
    {
      question: "Why do hotels participate so eagerly?",
      answer: "Hotels currently lose guests to Uber surge pricing and get nothing. With us, they earn 15% commission on every ride (average $500K/year), get free ESG compliance ($180K value), and guests stop complaining about transport. They literally make money solving your transport problem. It's a win-win-win."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Bar */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoBusinessOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Complete Travel Management Solutions
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => scrollToSection(dashboardRef, 'dashboard')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600"
              >
                Live Demo
              </button>
              <button 
                onClick={() => scrollToSection(comparisonRef, 'comparison')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600"
              >
                Compare
              </button>
              <button 
                onClick={() => scrollToSection(pricingRef, 'pricing')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600"
              >
                Pricing
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Calculate ROI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost Activity Ticker */}
      <div className="fixed bottom-4 right-4 z-40 hidden lg:block">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-3 max-w-sm transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {ghostActivities[ghostActivity]}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <button 
                onClick={() => scrollToSection(qualifierRef, 'qualifier')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'qualifier' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoCalculatorOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Qualify</span>
              </button>
              <button 
                onClick={() => scrollToSection(dashboardRef, 'dashboard')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'dashboard' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoStatsChartOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Demo</span>
              </button>
              <button 
                onClick={() => scrollToSection(comparisonRef, 'comparison')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'comparison' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Compare</span>
              </button>
              <button 
                onClick={() => scrollToSection(pricingRef, 'pricing')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'pricing' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <IoReceiptOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Pricing</span>
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoCallOutline className="w-4 h-4 flex-shrink-0" />
                <span>Get ROI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-[145px] md:pt-[105px]">
        
        {/* Qualifier Section */}
        <section ref={qualifierRef} className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium mb-4">
                <IoGiftOutline className="w-4 h-4 mr-1" />
                First 10 Companies: 30-Day Free Pilot Program
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Find Your Perfect
                <span className="block text-blue-600 mt-2">Travel Solution in 30 Seconds</span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Answer 3 quick questions for personalized pricing and ROI
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Question 1 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  1. I am a...
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setUserType('corporate')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      userType === 'corporate' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg transform scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <IoPeopleOutline className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Corporate Travel Manager</span>
                  </button>
                  <button
                    onClick={() => setUserType('hotel')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      userType === 'hotel' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg transform scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <IoBusinessOutline className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Hotel Revenue Manager</span>
                  </button>
                  <button
                    onClick={() => setUserType('cfo')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      userType === 'cfo' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg transform scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <IoWalletOutline className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">CFO / Finance</span>
                  </button>
                </div>
              </div>

              {/* Question 2 */}
              {userType && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    2. My current situation...
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSituation('have-rates')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        situation === 'have-rates' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <IoCheckmarkCircle className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Have rates, need transport</span>
                    </button>
                    <button
                      onClick={() => setSituation('need-everything')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        situation === 'need-everything' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <IoRocketOutline className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Need complete solution</span>
                    </button>
                    <button
                      onClick={() => setSituation('want-savings')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        situation === 'want-savings' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <IoTrendingDownOutline className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Want to cut costs</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Question 3 */}
              {situation && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    3. My annual travel spend / volume...
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSpendLevel('under-1m')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        spendLevel === 'under-1m' 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm font-medium">Under $1M</span>
                    </button>
                    <button
                      onClick={() => setSpendLevel('1m-5m')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        spendLevel === '1m-5m' 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm font-medium">$1M - $5M</span>
                    </button>
                    <button
                      onClick={() => setSpendLevel('over-5m')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        spendLevel === 'over-5m' 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg transform scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm font-medium">Over $5M</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {spendLevel && (
                <div className="text-center">
                  <button
                    onClick={handleQualifierSubmit}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <IoCalculatorOutline className="inline w-5 h-5 mr-2" />
                    Get My Custom ROI & Pricing
                  </button>
                  
                  {showCustomResults && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-green-700 dark:text-green-300 font-semibold">
                        Perfect! Based on your profile:
                      </p>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        You could save ${spendLevel === 'under-1m' ? '180K' : spendLevel === '1m-5m' ? '900K' : '2.3M'}/year
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Scroll down to see your live demo →
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pilot Program Badge */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium shadow-lg">
                <IoTimerOutline className="w-4 h-4 mr-2" />
                Limited Time: 30-Day Free Pilot • No Setup Fees • Keep 100% of Savings
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-4">
                <IoCarOutline className="w-4 h-4 mr-1" />
                The Missing 30% of Your Travel Program
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Your Corporate Rates Should
                <span className="block text-blue-600 mt-2">Work Everywhere™</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                You negotiated everything except ground transport - the 30% that causes 80% of complaints.<br/>
                Finally extend your hotel rates to transportation. No new negotiations needed.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Hotels ✓</div>
                  <div className="text-xs text-gray-500">Negotiated rates</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Flights ✓</div>
                  <div className="text-xs text-gray-500">Corporate contracts</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-500">
                  <IoCarOutline className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Transport ✓</div>
                  <div className="text-xs text-blue-600 font-semibold">NOW INCLUDED!</div>
                </div>
              </div>

              {/* Video Placeholder */}
              <div className="mb-8">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <IoPlayCircleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    See How Companies Extend Their Rates in 4 Minutes
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Video demonstration coming soon</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => scrollToSection(dashboardRef, 'dashboard')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  See Live Demo
                </button>
                <button 
                  onClick={() => router.push('/contact')}
                  className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  Calculate Your Savings
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section ref={problemRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                The $2.3M Problem in Your Travel Program
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Six critical gaps costing you millions annually
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <problem.icon className="w-10 h-10 text-red-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {problem.description}
                  </p>
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {problem.impact}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center shadow-lg border border-red-200 dark:border-red-800">
              <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
                Total Annual Impact
              </h3>
              <div className="flex items-center justify-center space-x-8">
                <div>
                  <div className="text-3xl font-bold text-red-600">-$2.3M</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Direct costs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">44%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Non-compliance</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">0%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Transport control</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Calculator Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Calculate Your Transport Savings
              </h2>
              <p className="text-base sm:text-lg text-blue-100">
                See how much you'll save by extending your hotel rates
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Your Hotel Rate Discount
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={hotelDiscount}
                      onChange={(e) => setHotelDiscount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-white w-16 text-right">
                      {hotelDiscount}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Monthly Travel Spend
                  </label>
                  <input
                    type="number"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="text-center p-6 bg-white/20 rounded-lg">
                <p className="text-blue-100 mb-2">Monthly Transport Savings</p>
                <p className="text-4xl font-bold text-white mb-4">
                  ${calculateSavings().toLocaleString()}
                </p>
                <p className="text-blue-100">
                  Annual Savings: <span className="font-bold">${(calculateSavings() * 12).toLocaleString()}</span>
                </p>
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => router.push('/contact')}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Get Full ROI Analysis
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Demo Section */}
        <section ref={dashboardRef} className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                See How It All Connects: Live Dashboard Demo
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                Watch your rates flow from hotels to transportation in real-time
              </p>
              
              <div className="inline-flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setDashboardView('corporate')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    dashboardView === 'corporate' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoPeopleOutline className="inline w-4 h-4 mr-1" />
                  Corporate View
                </button>
                <button
                  onClick={() => setDashboardView('hotel')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    dashboardView === 'hotel' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoBusinessOutline className="inline w-4 h-4 mr-1" />
                  Hotel View
                </button>
                <button
                  onClick={() => setDashboardView('flow')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    dashboardView === 'flow' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoSwapHorizontalOutline className="inline w-4 h-4 mr-1" />
                  See Connection
                </button>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {dashboardView === 'corporate' ? 'Corporate Command Center' : 
                         dashboardView === 'hotel' ? 'Hotel Partner Portal - Marriott Downtown' : 
                         'Rate Flow System'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IoFlashOutline className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-500">Real-time updates</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {dashboardView === 'corporate' && (
                    <div>
                      <div className="mb-4 inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        <IoCheckmarkCircle className="w-3 h-3 mr-1" />
                        NO INTEGRATION REQUIRED - Works with any system
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Your Negotiated Rates - Now Working Everywhere
                      </h3>
                      
                      <div className="space-y-2 mb-6">
                        {corporateRates.map((rate, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${
                              animationStep === idx ? 'border-green-500 bg-green-50 dark:bg-green-900/20 transform scale-[1.02]' : 
                              'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{rate.company}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{rate.rate}</span>
                              <span className="text-sm font-semibold text-blue-600">
                                Applied to {rate.properties} {typeof rate.properties === 'number' ? 'properties' : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Live Activity</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-500">10:32am:</span>
                            <div>
                              <span className="text-gray-900 dark:text-white">Sarah from corporate client booked PHX → NYC</span>
                              <div className="text-xs text-gray-500 mt-1">
                                Flight: Major Airline (Business) ✓ | Hotel: Partner Property (-30%) ✓ | Transport: (-30%) ✓
                                <span className="text-green-600 font-semibold ml-2">Total saved: $347</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoTrendingDownOutline className="w-6 h-6 text-green-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${Math.floor(savingsCounter).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Annual savings</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoCheckmarkCircle className="w-6 h-6 text-blue-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                          <div className="text-xs text-gray-500">Policy compliance</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoLeafOutline className="w-6 h-6 text-green-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">A+</div>
                          <div className="text-xs text-gray-500">ESG score</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <IoReceiptOutline className="w-6 h-6 text-purple-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
                          <div className="text-xs text-gray-500">Invoice (was 73)</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {dashboardView === 'hotel' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Your Corporate Rates = New Revenue Stream
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        {hotelRates.map((rate, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${
                              animationStep === idx ? 'border-green-500 bg-green-50 dark:bg-green-900/20 transform scale-[1.02]' : 
                              'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{rate.company}</div>
                              <div className="text-sm text-gray-500">Rate: {rate.rate}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400">{rate.rides} rides</div>
                              <div className="text-lg font-semibold text-green-600">+${rate.revenue}/mo</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6 border border-amber-200 dark:border-amber-800">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Real-time Notifications
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <IoNotificationsOutline className="w-4 h-4 text-amber-600" />
                            <span className="text-gray-900 dark:text-white">
                              Corporate guest arriving in 20min from airport
                            </span>
                            <span className="text-green-600 font-semibold">Commission: $7.35</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IoNotificationsOutline className="w-4 h-4 text-amber-600" />
                            <span className="text-gray-900 dark:text-white">
                              Business group (12) needs transport @ 6pm
                            </span>
                            <span className="text-green-600 font-semibold">Potential: $180</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-green-200 dark:border-green-800">
                          <div className="text-2xl font-bold text-green-600">$8,850</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Monthly revenue</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-blue-200 dark:border-blue-800">
                          <div className="text-2xl font-bold text-blue-600">+23%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Guest satisfaction</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {dashboardView === 'flow' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        How Your Rates Flow Through The System
                      </h3>
                      
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 0 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Rate Entry (4 minutes)</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                            Hotel enters: "Corporate client gets 30% off rooms"
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 1 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Automatic Extension</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                            System: "Corporate now gets 30% off rides too"
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 2 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Employee Books</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                            Employee books room + ride
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${animationStep === 3 ? 'border-green-500 bg-green-50 dark:bg-green-900/20 transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Everyone Wins</h4>
                          </div>
                          <div className="ml-11 space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Room: $200 → $140 (30% off) ✓
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Ride: $50 → $35 (30% off) ✓
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              Corporate saves $65 | Hotel earns $5.25 | Employee happy (no surge!)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 dark:text-green-300">
                    {currentNotification.company} employee just saved ${currentNotification.saved} | {currentNotification.hotel} earned ${currentNotification.earned}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transportation Solution Section */}
        <section ref={transportRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                We Complete Your Travel Program With Transportation
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                The missing piece that makes everything work together
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {transportSolutions.map((solution, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <solution.icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {solution.description}
                  </p>
                  <ul className="space-y-2 mb-4">
                    {solution.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start">
                        <IoCheckmarkOutline className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-blue-600">Best for: {solution.bestFor}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center">Complete Ground Transportation Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <IoAirplaneOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Airport Transfers</h4>
                  <p className="text-sm text-blue-100">Fixed rates, no surge, flight tracking</p>
                </div>
                <div className="text-center">
                  <IoCarOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Local Transport</h4>
                  <p className="text-sm text-blue-100">City rides, meetings, dinners</p>
                </div>
                <div className="text-center">
                  <IoPeopleOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Group Events</h4>
                  <p className="text-sm text-blue-100">1 to 5,000 attendees coordinated</p>
                </div>
                <div className="text-center">
                  <IoShieldCheckmarkOutline className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Executive Services</h4>
                  <p className="text-sm text-blue-100">VIP, board members, roadshows</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section ref={comparisonRef} className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How We're Different
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                See why companies are switching to ItWhip
              </p>
            </div>

            {/* vs Traditional TMC */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                ItWhip vs Traditional TMCs (Amex GBT, CWT, BCD)
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Traditional TMC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ItWhip
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisons.tmc.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.feature}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'tmc' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner !== 'itwhip' && <IoCloseCircleOutline className="inline w-4 h-4 text-red-500 mr-1" />}
                              {item.tmc}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'itwhip' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner === 'itwhip' && <IoCheckmarkCircle className="inline w-4 h-4 text-green-500 mr-1" />}
                              {item.itwhip}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* vs Uber for Business */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                ItWhip vs Uber for Business
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Uber for Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ItWhip
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisons.uber.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.feature}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'uber' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner !== 'uber' && <IoCloseCircleOutline className="inline w-4 h-4 text-red-500 mr-1" />}
                              {item.uber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'itwhip' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner === 'itwhip' && <IoCheckmarkCircle className="inline w-4 h-4 text-green-500 mr-1" />}
                              {item.itwhip}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* vs Manual Booking */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                ItWhip vs Manual/Unmanaged Booking
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Manual Booking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ItWhip
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisons.manual.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.feature}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'manual' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner !== 'manual' && <IoCloseCircleOutline className="inline w-4 h-4 text-red-500 mr-1" />}
                              {item.manual}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={item.winner === 'itwhip' ? 'text-green-600 font-semibold' : ''}>
                              {item.winner === 'itwhip' && <IoCheckmarkCircle className="inline w-4 h-4 text-green-500 mr-1" />}
                              {item.itwhip}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Scenarios Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Service Models for Every Situation
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Four entry points, transparent pricing for everyone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {revenueScenarios.map((scenario, idx) => (
                <div key={idx} className={`bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 ${
                  scenario.color === 'blue' ? 'border-blue-500' :
                  scenario.color === 'green' ? 'border-green-500' :
                  scenario.color === 'purple' ? 'border-purple-500' :
                  'border-red-500'
                }`}>
                  <scenario.icon className={`w-10 h-10 mb-4 ${
                    scenario.color === 'blue' ? 'text-blue-600' :
                    scenario.color === 'green' ? 'text-green-600' :
                    scenario.color === 'purple' ? 'text-purple-600' :
                    'text-red-600'
                  }`} />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {scenario.entry}
                  </p>
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Investment: {scenario.whatTheyPay}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Key Benefits:</p>
                    {scenario.benefits.map((benefit, benefitIdx) => (
                      <div key={benefitIdx} className="flex items-start">
                        <IoCheckmarkOutline className="w-3 h-3 text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center shadow-xl">
              <IoFlameOutline className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">The Network Effect</h3>
              <p className="text-purple-100 max-w-2xl mx-auto mb-6">
                Once we have one major corporate client, hotels compete to serve them.
                Once we have key hotels, corporates want their inventory.
                The platform becomes the industry standard.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">Step 1</p>
                  <p className="text-sm text-purple-100">First corporate signs</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">Step 2</p>
                  <p className="text-sm text-purple-100">Hotels join to serve</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">Step 3</p>
                  <p className="text-sm text-purple-100">More corps follow</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">Step 4</p>
                  <p className="text-sm text-purple-100">Market adoption</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Benefits Section */}
        <section ref={partnersRef} className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Hotels & Airlines Love Working With Us
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Making your partners' lives easier means smoother travel for you
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center mb-6">
                  <IoBusinessOutline className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">For Your Hotel Partners</h3>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">The GDS Problem We Solve:</h4>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Current Reality:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• 3-4 hours daily updating GDS rates</li>
                      <li>• 48-72 hour delay for changes</li>
                      <li>• $2-25 per booking in fees</li>
                      <li>• Manual entry = errors</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">With ItWhip:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>✓ 4-minute rate setup</li>
                      <li>✓ Instant updates</li>
                      <li>✓ Zero GDS fees</li>
                      <li>✓ Real-time everything</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What They Get:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 15% commission on rides ($500K/year average)</li>
                    <li>• Free ESG compliance ($180K value)</li>
                    <li>• TU-1-A certification included</li>
                    <li>• Works with any PMS system</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center mb-6">
                  <IoLockClosedOutline className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">How We Protect Everyone's Data</h3>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Aggregated API Architecture:</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Corporate Data</span>
                        <IoArrowForwardOutline className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-green-600">[ENCRYPTED]</span>
                      </div>
                      <div className="flex items-center justify-center py-2">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-semibold">
                          ITWHIP SECURE LAYER
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Hotel Systems</span>
                        <IoArrowForwardOutline className="w-4 h-4 text-gray-400 rotate-180" />
                        <span className="font-semibold text-blue-600">[AGGREGATED ONLY]</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <IoShieldCheckmarkOutline className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">TU-1-A Certified</p>
                    <p className="text-xs text-gray-500">Industry leading</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <IoFlashOutline className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">127ms Response</p>
                    <p className="text-xs text-gray-500">vs 48hr GDS</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-center text-blue-900 dark:text-blue-100">
                    <strong>The Result:</strong> Hotels eagerly join because they earn $500K/year with zero investment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium mb-4">
                <IoTimerOutline className="w-4 h-4 mr-1" />
                Early Adopter Pricing - Ends January 31st
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Implementation Path
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                From rate extension to full travel management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {plans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-lg p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 ${
                    plan.highlight 
                      ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-blue-500' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.highlight && (
                    <div className="text-center mb-4">
                      <span className="inline-flex px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                        <IoTrophyOutline className="w-4 h-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className={`text-2xl font-bold mb-2 ${
                    plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className={`text-3xl font-bold ${
                      plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ml-2 ${
                      plan.highlight ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {plan.period}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-6 ${
                    plan.highlight ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {plan.users}
                  </p>
                  
                  {plan.savings && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      plan.highlight 
                        ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    }`}>
                      <p className="text-sm font-semibold">{plan.savings}</p>
                    </div>
                  )}
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start">
                        <IoCheckmarkCircle className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                          plan.highlight ? 'text-blue-200' : 'text-green-500'
                        }`} />
                        <span className={`text-sm ${
                          plan.highlight ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => router.push('/contact')}
                    className={`w-full py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                      plan.highlight 
                        ? 'bg-white text-blue-600 hover:bg-gray-100' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center shadow-xl">
              <IoLeafOutline className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">ESG Compliance Included at Every Tier</h3>
              <p className="text-green-100 max-w-2xl mx-auto">
                Automatic Scope 3 emissions tracking, CSRD-compliant reporting, carbon offset options. 
                Be ready for 2025 reporting requirements with zero additional effort.
              </p>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                <IoDiamondOutline className="w-4 h-4 mr-2" />
                TU-1-A Certification: Only 3 Enterprise slots remaining this quarter
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Everything you need to know about completing your travel program
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    {expandedFaq === idx ? (
                      <IoChevronUpOutline className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <IoChevronDownOutline className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ready to complete your travel program?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/contact')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Get Your ROI Analysis
                </button>
                <button 
                  onClick={() => window.location.href = 'tel:+1-844-ITWHIP'}
                  className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                >
                  <IoCallOutline className="w-5 h-5 mr-2" />
                  1-844-ITWHIP
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Finally, A Complete Travel Program
            </h2>
            <p className="text-base sm:text-lg text-blue-100 mb-8">
              Your negotiated rates working everywhere. Transportation included. ESG automated.
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-2xl mx-auto mb-8 border border-white/20">
              <div className="grid grid-cols-3 gap-4 text-white">
                <div>
                  <p className="text-3xl font-bold">$900K</p>
                  <p className="text-sm text-blue-100">Average Savings</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">4min</p>
                  <p className="text-sm text-blue-100">Setup Time</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-sm text-blue-100">Compliance</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                See Your Rates in Action
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-500"
              >
                Start Saving Today
              </button>
            </div>
            
            <p className="text-xs text-blue-200 mt-6">
              No IT resources required • Works with existing systems • Keep your current TMC
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}