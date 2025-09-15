// app/host-protection/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoCarOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoHelpCircleOutline,
  IoCalculatorOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoTrophyOutline,
  IoCashOutline,
  IoFlashOutline,
  IoLockClosedOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoPhonePortraitOutline,
  IoNotificationsOutline,
  IoFingerPrintOutline,
  IoAnalyticsOutline,
  IoConstructOutline,
  IoGlobeOutline,
  IoHeartOutline,
  IoKeyOutline,
  IoListOutline,
  IoMapOutline,
  IoPricetagOutline,
  IoReceiptOutline,
  IoServerOutline,
  IoSettingsOutline,
  IoSpeedometerOutline,
  IoTerminalOutline,
  IoTimerOutline,
  IoTrendingUpOutline,
  IoVideocamOutline,
  IoCameraOutline,
  IoClipboardOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoMedalOutline,
  IoShieldOutline,
  IoWifiOutline,
  IoBatteryChargingOutline,
  IoQrCodeOutline,
  IoFlagOutline,
  IoBookOutline,
  IoSchoolOutline,
  IoStarOutline,
  IoCallOutline
} from 'react-icons/io5'

export default function HostProtectionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('protection')
  const [showEarningsCalc, setShowEarningsCalc] = useState(false)
  const [carValue, setCarValue] = useState(150)
  const [monthlyDays, setMonthlyDays] = useState(15)
  const [selectedVehicleType, setSelectedVehicleType] = useState('standard')
  const [showLuxuryDetails, setShowLuxuryDetails] = useState(false)
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Calculate fees based on car value
  const calculateFees = (dailyRate: number) => {
    let platformFee = 0
    let hostKeeps = 0
    let feePercentage = 0
    
    if (dailyRate < 100) {
      feePercentage = 15
    } else if (dailyRate < 200) {
      feePercentage = 18
    } else {
      feePercentage = 20
    }
    
    platformFee = dailyRate * (feePercentage / 100)
    hostKeeps = dailyRate - platformFee
    
    // Monthly calculations
    const monthlyEarnings = hostKeeps * monthlyDays
    const yearlyEarnings = monthlyEarnings * 12
    
    // Insurance savings calculation
    const commercialInsuranceCost = 400 // Average monthly commercial insurance
    const annualSavings = commercialInsuranceCost * 12
    
    return {
      platformFee: platformFee.toFixed(0),
      hostKeeps: hostKeeps.toFixed(0),
      feePercentage,
      monthlyEarnings: monthlyEarnings.toFixed(0),
      yearlyEarnings: yearlyEarnings.toFixed(0),
      insuranceSavings: annualSavings.toFixed(0)
    }
  }

  const fees = calculateFees(carValue)

  const luxuryProtection = {
    verification: [
      {
        title: 'Multi-Point Identity Check',
        description: 'Government ID, selfie verification, and social media validation',
        icon: IoFingerPrintOutline
      },
      {
        title: 'Financial Verification',
        description: 'Credit score minimum 700+, valid credit card with $5,000 available',
        icon: IoWalletOutline
      },
      {
        title: 'Driving History Analysis',
        description: 'Clean record required, no accidents in 5 years, 25+ age minimum',
        icon: IoClipboardOutline
      },
      {
        title: 'Security Deposit Hold',
        description: '$2,500-5,000 pre-authorization based on vehicle value',
        icon: IoLockClosedOutline
      }
    ],
    monitoring: [
      {
        title: 'GPS Tracking',
        description: 'Real-time location, speed monitoring, geofence alerts',
        details: 'Know where your vehicle is 24/7 with live tracking'
      },
      {
        title: 'Telematics Data',
        description: 'Acceleration, braking, cornering analysis',
        details: 'Monitor driving behavior to prevent abuse'
      },
      {
        title: 'Trip Recording',
        description: 'Start/end photos, mileage tracking, fuel levels',
        details: 'Complete documentation of vehicle condition'
      },
      {
        title: 'Instant Alerts',
        description: 'Speeding, harsh driving, boundary violations',
        details: 'Immediate notification of any concerning behavior'
      }
    ],
    claims: [
      {
        step: 'Immediate Response',
        time: '< 5 minutes',
        description: 'Dedicated luxury claims hotline'
      },
      {
        step: 'Expert Assessment',
        time: '< 24 hours',
        description: 'Certified exotic vehicle appraisers'
      },
      {
        step: 'Preferred Repair Network',
        time: 'Same day',
        description: 'Factory-authorized service centers'
      },
      {
        step: 'Loss Compensation',
        time: '48-72 hours',
        description: 'Full market value replacement'
      }
    ]
  }

  const vehicleTypes = [
    {
      type: 'economy',
      label: 'Economy',
      examples: 'Civic, Corolla, Sentra',
      dailyRange: '$45-75',
      commission: '15%',
      avgBookings: '18-22 days/month',
      coverage: 'Standard $750K liability'
    },
    {
      type: 'standard',
      label: 'Standard',
      examples: 'Camry, Accord, Malibu',
      dailyRange: '$75-150',
      commission: '15%',
      avgBookings: '15-20 days/month',
      coverage: 'Standard $750K liability'
    },
    {
      type: 'luxury',
      label: 'Luxury',
      examples: 'BMW, Mercedes, Audi',
      dailyRange: '$150-400',
      commission: '18%',
      avgBookings: '12-18 days/month',
      coverage: 'Enhanced $1M liability available'
    },
    {
      type: 'exotic',
      label: 'Exotic',
      examples: 'Porsche, Tesla, Maserati',
      dailyRange: '$400-800',
      commission: '20%',
      avgBookings: '8-15 days/month',
      coverage: 'Premium $2M liability available'
    }
  ]

  const hostTools = [
    {
      title: 'Fleet Command Center',
      description: 'Professional multi-vehicle management system',
      icon: IoBusinessOutline,
      features: [
        'Bulk listing management',
        'Cross-calendar synchronization', 
        'Team access controls',
        'Performance benchmarking',
        'Automated pricing rules',
        'Maintenance scheduling'
      ]
    },
    {
      title: 'Smart Pricing Engine',
      description: 'AI-powered dynamic pricing optimization',
      icon: IoAnalyticsOutline,
      features: [
        'Market demand analysis',
        'Competitor rate tracking',
        'Event surge pricing',
        'Seasonal adjustments',
        'Occupancy optimization',
        'A/B price testing'
      ]
    },
    {
      title: 'Guest Vetting System',
      description: 'Comprehensive renter verification',
      icon: IoShieldOutline,
      features: [
        'Identity verification',
        'Criminal background check',
        'Driving record analysis',
        'Credit score validation',
        'Previous rental history',
        'Social media screening'
      ]
    },
    {
      title: 'Financial Dashboard',
      description: 'Complete earnings and tax management',
      icon: IoReceiptOutline,
      features: [
        'Real-time revenue tracking',
        'Expense categorization',
        'Tax deduction calculator',
        'Automated 1099 generation',
        'QuickBooks integration',
        'Profit margin analysis'
      ]
    },
    {
      title: 'Vehicle Health Monitor',
      description: 'Proactive maintenance and care tracking',
      icon: IoConstructOutline,
      features: [
        'Service interval alerts',
        'Diagnostic code reading',
        'Fuel level monitoring',
        'Battery health tracking',
        'Tire pressure alerts',
        'Oil life indicators'
      ]
    },
    {
      title: 'Marketing Toolkit',
      description: 'Professional listing optimization',
      icon: IoCameraOutline,
      features: [
        'Professional photography',
        'Virtual tour creation',
        'Listing copywriting',
        'SEO optimization',
        'Social media templates',
        'Review management'
      ]
    }
  ]

  const documentationProcess = [
    {
      phase: 'Pre-Trip',
      items: [
        '360° exterior video walkthrough',
        'Interior condition photos (8 angles)',
        'Odometer reading capture',
        'Fuel gauge documentation',
        'Existing damage notation',
        'Personal items checklist'
      ]
    },
    {
      phase: 'Check-Out',
      items: [
        'Guest ID verification photo',
        'License validation scan',
        'Insurance confirmation',
        'Security deposit authorization',
        'Terms acknowledgment signature',
        'Emergency contact collection'
      ]
    },
    {
      phase: 'During Trip',
      items: [
        'GPS location tracking',
        'Speed monitoring alerts',
        'Daily mileage updates',
        'Boundary violation notices',
        'Driving behavior scores',
        'Fuel consumption tracking'
      ]
    },
    {
      phase: 'Post-Trip',
      items: [
        'Return condition video',
        'Final mileage recording',
        'Fuel level verification',
        'Damage assessment scan',
        'Cleaning status check',
        'Guest rating submission'
      ]
    }
  ]

  const premiumHostBenefits = [
    {
      tier: 'Silver Host',
      requirement: '10+ trips, 4.8+ rating',
      benefits: [
        '10% fee reduction',
        'Priority placement',
        'Dedicated support',
        'Monthly coaching call'
      ],
      badge: IoMedalOutline
    },
    {
      tier: 'Gold Host',
      requirement: '25+ trips, 4.9+ rating',
      benefits: [
        '15% fee reduction',
        'Featured listings',
        'Instant payouts',
        'Quarterly bonus pool'
      ],
      badge: IoRibbonOutline
    },
    {
      tier: 'Platinum Host',
      requirement: '50+ trips, 5.0 rating',
      benefits: [
        '20% fee reduction',
        'Homepage features',
        'API access',
        'Annual summit invite'
      ],
      badge: IoDiamondOutline
    },
    {
      tier: 'Elite Fleet',
      requirement: '10+ vehicles, $10K+ monthly',
      benefits: [
        'Custom pricing',
        'Account manager',
        'White-label options',
        'Revenue sharing'
      ],
      badge: IoTrophyOutline
    }
  ]

  const taxBenefits = [
    {
      category: 'Vehicle Expenses',
      deductions: [
        { item: 'Depreciation', amount: '$5,000-15,000/year' },
        { item: 'Insurance & Registration', amount: '$1,200-3,000/year' },
        { item: 'Maintenance & Repairs', amount: '$1,500-4,000/year' },
        { item: 'Car payments interest', amount: '$800-2,400/year' }
      ]
    },
    {
      category: 'Operating Expenses',
      deductions: [
        { item: 'Cleaning & Detailing', amount: '$600-1,800/year' },
        { item: 'Platform fees', amount: '100% deductible' },
        { item: 'Phone & Internet', amount: '$300-600/year' },
        { item: 'Parking & Tolls', amount: '$200-800/year' }
      ]
    },
    {
      category: 'Business Expenses',
      deductions: [
        { item: 'Professional photos', amount: '$200-500 one-time' },
        { item: 'Key replacements', amount: '$100-300/year' },
        { item: 'Guest amenities', amount: '$200-400/year' },
        { item: 'Business mileage', amount: '$0.655/mile' }
      ]
    }
  ]

  const insuranceComparison = [
    {
      aspect: 'Coverage Limit',
      itwhip: 'Up to $2M liability',
      traditional: '$25K-50K typical',
      advantage: '40x more protection'
    },
    {
      aspect: 'Monthly Cost',
      itwhip: '$0 (included)',
      traditional: '$250-500/month',
      advantage: 'Save $3,000-6,000/year'
    },
    {
      aspect: 'Activation',
      itwhip: 'Automatic per trip',
      traditional: 'Always active',
      advantage: 'Only pay when earning'
    },
    {
      aspect: 'Claims Process',
      itwhip: '48-72 hour resolution',
      traditional: '2-4 weeks typical',
      advantage: '10x faster claims'
    },
    {
      aspect: 'Deductible',
      itwhip: '$0-1,000 based on plan',
      traditional: '$500-2,500 typical',
      advantage: 'Lower out-of-pocket'
    }
  ]

  const supportLevels = [
    {
      level: 'Standard Support',
      availability: '24/7 chat & email',
      response: '< 1 hour',
      includes: ['Basic troubleshooting', 'Booking assistance', 'General questions']
    },
    {
      level: 'Priority Support',
      availability: '24/7 phone & chat',
      response: '< 15 minutes',
      includes: ['Dedicated line', 'Account management', 'Escalation priority']
    },
    {
      level: 'Luxury Concierge',
      availability: 'Dedicated agent',
      response: 'Immediate',
      includes: ['Personal account manager', 'White-glove service', 'Custom solutions']
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
              <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Complete Host Protection & Success Platform
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/list-your-car" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Start Earning
              </Link>
              <Link href="/host-university" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Host University
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="fixed top-[106px] md:top-[112px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('protection')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'protection'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Protection Overview
            </button>
            <button
              onClick={() => setActiveTab('luxury')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center ${
                activeTab === 'luxury'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IoDiamondOutline className="w-4 h-4 mr-1" />
              Luxury & Exotic
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'tools'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Host Tools
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'documentation'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'earnings'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Earnings & Taxes
            </button>
            <button
              onClick={() => setActiveTab('coverage')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'coverage'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Coverage Details
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'rewards'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rewards & Tiers
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'support'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Support Levels
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              FAQs
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[156px]">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Professional Car Sharing Platform
                <span className="block text-purple-600 mt-2">Built for Serious Hosts</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                Industry-leading protection, fastest payments, and technology that maximizes 
                your earnings while protecting your investment.
              </p>

              {/* Enhanced Earnings Calculator with Insurance Savings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Earnings & Savings Calculator
                </h3>
                
                {/* Vehicle Type Selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {vehicleTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => {
                        setSelectedVehicleType(type.type)
                        if (type.type === 'economy') setCarValue(60)
                        if (type.type === 'standard') setCarValue(110)
                        if (type.type === 'luxury') setCarValue(250)
                        if (type.type === 'exotic') setCarValue(600)
                      }}
                      className={`p-2 rounded-lg text-xs transition ${
                        selectedVehicleType === type.type
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs opacity-80">{type.dailyRange}</div>
                    </button>
                  ))}
                </div>

                {/* Daily Rate Slider */}
                <div className="mb-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                    Daily Rate: ${carValue}
                  </label>
                  <input
                    type="range"
                    min="45"
                    max="800"
                    value={carValue}
                    onChange={(e) => setCarValue(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Days Per Month Slider */}
                <div className="mb-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                    Rental Days Per Month: {monthlyDays}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={monthlyDays}
                    onChange={(e) => setMonthlyDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Earnings & Savings Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-400 mb-3">
                      Your Earnings
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Daily (after {fees.feePercentage}% fee):</span>
                        <span className="font-bold text-purple-600">${fees.hostKeeps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Monthly:</span>
                        <span className="font-bold text-purple-600">${fees.monthlyEarnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Annual:</span>
                        <span className="font-bold text-purple-600">${fees.yearlyEarnings}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-400 mb-3">
                      Your Savings
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Insurance savings/year:</span>
                        <span className="font-bold text-green-600">${fees.insuranceSavings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Tax deductions:</span>
                        <span className="font-bold text-green-600">~30% of expenses</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Total benefit:</span>
                        <span className="font-bold text-green-600">${(parseInt(fees.yearlyEarnings) + parseInt(fees.insuranceSavings)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/list-your-car"
                  className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
                >
                  List Your Vehicle
                </Link>
                <Link 
                  href="/host-demo"
                  className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
                >
                  See Live Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Based on Active Tab */}
        {activeTab === 'protection' && (
          <>
            {/* Insurance Comparison Table */}
            <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Protection That Saves You Thousands
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Compare our included protection vs. traditional commercial insurance
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Coverage Aspect
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                          ItWhip Protection
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                          Traditional Insurance
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                          Your Advantage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {insuranceComparison.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.aspect}
                          </td>
                          <td className="px-6 py-4 text-sm text-center font-medium text-purple-600">
                            {item.itwhip}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">
                            {item.traditional}
                          </td>
                          <td className="px-6 py-4 text-sm text-center font-bold text-green-600">
                            {item.advantage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'luxury' && (
          <>
            {/* Luxury & Exotic Protection */}
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mb-4">
                    <IoDiamondOutline className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">Premium Vehicle Protection</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Specialized Protection for High-Value Vehicles
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Luxury and exotic vehicles require exceptional protection. Our multi-layered 
                    security system ensures your investment is protected at every step.
                  </p>
                </div>

                {/* Guest Verification Process */}
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                    4-Layer Guest Verification for Premium Vehicles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {luxuryProtection.verification.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <item.icon className="w-10 h-10 text-amber-600 mb-4" />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-Time Monitoring */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 mb-12">
                  <h3 className="text-xl font-semibold text-white mb-6 text-center">
                    Real-Time Vehicle Monitoring & Protection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {luxuryProtection.monitoring.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <IoWifiOutline className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-300 mb-1">{item.description}</p>
                        <p className="text-xs text-amber-400">{item.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Claims Process for Luxury */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-8">
                  <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-400 mb-6 text-center">
                    White-Glove Claims Service for Premium Vehicles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {luxuryProtection.claims.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-3xl font-bold text-amber-600 mb-2">{item.time}</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {item.step}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'tools' && (
          <>
            {/* Enhanced Host Tools */}
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Professional-Grade Management Tools
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Everything you need to run a successful car sharing business
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {hostTools.map((tool, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <tool.icon className="w-10 h-10 text-purple-600 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {tool.description}
                      </p>
                      <ul className="space-y-2">
                        {tool.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start">
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'documentation' && (
          <>
            {/* Documentation Process */}
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Complete Documentation & Protection Process
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Every trip is fully documented for your protection
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {documentationProcess.map((phase, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                          {idx + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {phase.phase}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {phase.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start">
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Documentation Benefits */}
                <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-400 mb-6 text-center">
                    Why Documentation Matters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <IoShieldCheckmarkOutline className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Dispute Protection
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Photographic evidence prevents false damage claims
                      </p>
                    </div>
                    <div>
                      <IoReceiptOutline className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Tax Documentation
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Complete records for maximum deductions
                      </p>
                    </div>
                    <div>
                      <IoTimerOutline className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Quick Resolution
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Clear documentation speeds up any claims
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'earnings' && (
          <>
            {/* Comprehensive Tax Benefits */}
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Maximize Tax Benefits as a Car Sharing Business
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Turn your vehicle into a tax-advantaged business with these deductions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {taxBenefits.map((category, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {category.category}
                      </h3>
                      <ul className="space-y-3">
                        {category.deductions.map((deduction, dIdx) => (
                          <li key={dIdx} className="flex justify-between items-start">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {deduction.item}
                            </span>
                            <span className="text-sm font-bold text-green-600 text-right">
                              {deduction.amount}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 text-center">
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-400 mb-4">
                    Total Potential Tax Savings
                  </h3>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    $8,000-25,000/year
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on typical host with one vehicle renting 15 days/month
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    * Consult with a tax professional for your specific situation
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'coverage' && (
          <>
            {/* Detailed Coverage Information */}
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Comprehensive Coverage Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Understanding exactly what's protected
                  </p>
                </div>

                {/* Coverage by Vehicle Type */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                  {vehicleTypes.map((type, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {type.label} Vehicles
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">{type.examples}</p>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {type.coverage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What's Covered vs Not Covered - Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                      <IoCheckmarkCircle className="w-5 h-5 mr-2" />
                      Comprehensive Coverage Includes
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Third-Party Liability
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Up to $2M for bodily injury and property damage
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Physical Damage Protection
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Collision and comprehensive up to actual cash value
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Medical Payments
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Up to $5,000 per person for medical expenses
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Uninsured Motorist
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Protection when other driver lacks insurance
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Legal Defense
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Full legal representation if sued
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-amber-600 mb-4 flex items-center">
                      <IoWarningOutline className="w-5 h-5 mr-2" />
                      Exclusions & Limitations
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <IoCloseCircleOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Mechanical Issues
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Engine, transmission, or mechanical failures
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCloseCircleOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Wear & Tear
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Normal deterioration from regular use
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCloseCircleOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Personal Property
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Items left in vehicle by host or guest
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCloseCircleOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Intentional Damage
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Deliberate acts by guest or third parties
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCloseCircleOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Off-Platform Use
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Incidents outside of active rental periods
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'rewards' && (
          <>
            {/* Host Rewards & Tier System */}
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Host Rewards & Achievement Tiers
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Earn more as you grow with exclusive benefits and reduced fees
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {premiumHostBenefits.map((tier, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 relative">
                      <div className="absolute top-4 right-4">
                        <tier.badge className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {tier.tier}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">{tier.requirement}</p>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, bIdx) => (
                          <li key={bIdx} className="flex items-start">
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Additional Rewards */}
                <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold text-center mb-6">
                    Additional Host Rewards
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <IoGlobeOutline className="w-10 h-10 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Referral Program</h4>
                      <p className="text-sm opacity-90">
                        Earn $500 for each new host you bring to the platform
                      </p>
                    </div>
                    <div>
                      <IoSchoolOutline className="w-10 h-10 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Host University</h4>
                      <p className="text-sm opacity-90">
                        Free courses, webinars, and certification programs
                      </p>
                    </div>
                    <div>
                      <IoHeartOutline className="w-10 h-10 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Community Events</h4>
                      <p className="text-sm opacity-90">
                        Annual summit, local meetups, and networking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'support' && (
          <>
            {/* Support Levels */}
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Dedicated Support at Every Level
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get the help you need, when you need it
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {supportLevels.map((level, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <div className="text-center mb-4">
                        <IoPeopleOutline className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {level.level}
                        </h3>
                      </div>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Availability:</span>
                          <span className="font-medium">{level.availability}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Response:</span>
                          <span className="font-medium text-green-600">{level.response}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Includes:
                        </p>
                        <ul className="space-y-1">
                          {level.includes.map((item, iIdx) => (
                            <li key={iIdx} className="text-xs text-gray-600 dark:text-gray-400">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Emergency Support */}
                <div className="mt-12 bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center">
                  <IoCallOutline className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-900 dark:text-red-400 mb-2">
                    24/7 Emergency Hotline
                  </h3>
                  <p className="text-2xl font-bold text-red-600 mb-2">1-800-ITWHIP-1</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For accidents, theft, or urgent safety issues
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'faq' && (
          <>
            {/* Comprehensive FAQ Section */}
            <section className="py-12 sm:py-16">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Everything You Need to Know
                  </h2>
                </div>

                {/* FAQ Categories */}
                <div className="space-y-8">
                  {/* Getting Started */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center">
                      <IoRocketOutline className="w-5 h-5 mr-2" />
                      Getting Started
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          How quickly can I start earning?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Our instant approval process means you can list your car in under 20 minutes. 
                          Most hosts receive their first booking within 48 hours. With our hotel partnerships 
                          providing pre-verified guests, your car could be earning money today.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What vehicles qualify for the platform?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Vehicles must be 2015 or newer, have a clean title, pass our safety inspection, 
                          and be valued under $200K for standard coverage (higher values available with 
                          premium protection). We accept sedans, SUVs, trucks, luxury vehicles, and exotics.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Do I need special insurance or permits?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No special commercial insurance is required - protection is included automatically. 
                          In Arizona, you'll need to register for a Transaction Privilege Tax license ($12) 
                          which we help you obtain. Your personal insurance should be maintained for non-rental use.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payments & Earnings */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center">
                      <IoCashOutline className="w-5 h-5 mr-2" />
                      Payments & Earnings
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          How and when do I get paid?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Payments are processed via direct deposit within 48 hours of trip completion - 
                          the fastest in the industry. You can choose daily or weekly payout schedules. 
                          Premium hosts get instant payouts. All payments include detailed breakdowns.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What fees does the platform charge?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Our simple commission structure: 15% for economy/standard vehicles, 18% for 
                          luxury, and 20% for exotics. No hidden fees, no subscription charges, no 
                          listing fees. Your rate is locked in and will never increase.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          How much can I realistically earn?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Earnings vary by vehicle type and location. Economy cars average $600-900/month, 
                          standard vehicles $900-1,500/month, luxury $1,500-3,000/month, and exotics 
                          $3,000-8,000/month based on 12-15 rental days. Top hosts earn significantly more.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Protection & Safety */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center">
                      <IoShieldCheckmarkOutline className="w-5 h-5 mr-2" />
                      Protection & Safety
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What happens if my car is damaged?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Our protection covers physical damage during rentals with a $0-1,000 deductible 
                          depending on your tier. Claims are processed within 48-72 hours. We handle all 
                          coordination with repair shops and provide loss-of-use compensation while your 
                          vehicle is being repaired.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          How are guests screened and verified?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Every guest undergoes multi-point verification: government ID validation, facial 
                          recognition matching, driving record check, criminal background screening, and 
                          credit verification. Luxury/exotic rentals require additional financial verification 
                          and higher security deposits.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Can I track my vehicle during rentals?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Yes, all vehicles have GPS tracking with real-time location, speed monitoring, 
                          and geofence alerts. You'll receive instant notifications for speeding, harsh 
                          driving, or boundary violations. Telematics data helps prevent vehicle abuse.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Management */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center">
                      <IoCarOutline className="w-5 h-5 mr-2" />
                      Vehicle Management
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          How do I handle key exchanges?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Multiple options available: keyless entry technology (we provide the device), 
                          lockbox installations, hotel concierge handoffs, or meet-and-greet service. 
                          For premium vehicles, we recommend our white-glove valet service.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What about cleaning and maintenance?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Guests are required to return vehicles in the same condition. Our partner 
                          network offers discounted detailing and maintenance services. Cleaning fees 
                          can be charged for excessively dirty returns. All maintenance costs are 
                          tax-deductible business expenses.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Can I block dates when I need my car?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          You have complete control over your calendar. Block dates instantly from the app, 
                          set recurring blackouts, or use our smart availability that learns your patterns. 
                          You can also set minimum rental periods and advance notice requirements.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Luxury & Exotic Specific */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center">
                      <IoDiamondOutline className="w-5 h-5 mr-2" />
                      Luxury & Exotic Vehicles
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          How are luxury vehicles extra protected?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Luxury vehicles get enhanced protection: higher guest requirements (25+ age, 
                          700+ credit score), $2,500-5,000 security deposits, real-time monitoring, 
                          restricted speed settings, and access to factory-authorized repair centers. 
                          Premium protection extends coverage to $2M liability.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What about depreciation and wear?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Our pricing algorithm factors in depreciation to ensure profitable rates. 
                          Mileage limits (typically 100-200 miles/day) minimize wear. Excess mileage 
                          is charged at $1-3/mile. Most luxury hosts find rental income more than 
                          compensates for depreciation.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Can I set special requirements for exotic rentals?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Yes, you can set custom requirements: minimum age (up to 30), driving experience 
                          requirements, additional documentation, in-person verification, and restricted 
                          usage areas. You can also require professional driving experience for high-performance vehicles.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tax & Legal */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center">
                      <IoReceiptOutline className="w-5 h-5 mr-2" />
                      Tax & Legal
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What are the tax implications?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Car sharing income is taxable, but comes with significant deductions: vehicle 
                          depreciation, insurance, maintenance, cleaning, platform fees, and mileage. 
                          Most hosts save 25-35% through deductions. We provide automated 1099s and 
                          integrate with tax software.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Do I need a business license?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          In Arizona, you need a Transaction Privilege Tax license ($12) which we help 
                          you obtain. Some cities may require additional permits for commercial vehicle 
                          use. We provide guidance for your specific location and handle tax remittance.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Should I create an LLC?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Many professional hosts operate through LLCs for liability protection and 
                          tax benefits. While not required, it's recommended for hosts with multiple 
                          vehicles or high-value assets. Consult with a business attorney for your 
                          specific situation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Trust Indicators */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Professional Hosts Choose Us
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">48hr</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payment Speed</div>
                <div className="text-xs text-gray-500">Industry's Fastest</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">$2M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Max Protection</div>
                <div className="text-xs text-gray-500">Premium Coverage</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">15-20%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Commission</div>
                <div className="text-xs text-gray-500">Locked Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                <div className="text-xs text-gray-500">Real Humans</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Start Your Car Sharing Business Today
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-8">
              Join thousands of successful hosts earning with confidence
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Link 
                href="/list-your-car"
                className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                List Your Car
              </Link>
              <Link 
                href="/schedule-call"
                className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
              >
                Schedule Call
              </Link>
              <Link 
                href="/download-guide"
                className="inline-block px-6 py-3 bg-purple-800 text-white rounded-lg font-bold hover:bg-purple-900 transition"
              >
                Host Guide
              </Link>
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-4 bg-white dark:bg-black rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Important Information:</strong> Protection provided through licensed third-party insurance carriers. Coverage amounts and availability subject to vehicle eligibility, location, and underwriter approval. ItWhip facilitates coverage but is not an insurance company. Protection applies only during active rental periods booked through our platform. Earnings estimates based on platform averages and not guaranteed. Individual results vary based on vehicle type, location, availability, seasonality, and market conditions. Tax benefits vary by individual situation - consult a tax professional. Payment timing subject to banking holidays and verification requirements. 48-hour payment applies to verified hosts with completed documentation. Vehicle eligibility requirements include age, condition, and safety standards. Guest screening includes third-party background checks but does not guarantee renter behavior. Platform features, benefits, and commission rates subject to terms of host agreement and may vary by market. Host tier benefits require maintaining qualification criteria. Support response times are targets, not guarantees. GPS tracking and telematics features require compatible hardware installation. Professional photography and other services may have additional fees in some markets. Reserve fund protection subject to platform terms and conditions. Luxury and exotic vehicle coverage may require additional verification and documentation. Commercial use outside platform prohibited. Personal insurance required for non-rental use. Business licenses and permits vary by jurisdiction - hosts responsible for compliance. Platform reserves right to modify terms, features, and pricing with notice. Arizona-specific regulations apply including Transaction Privilege Tax requirements. Airport and hotel partnerships vary by location. Not all features available in all markets. Elite host programs have specific qualification requirements. This information does not constitute legal, tax, or financial advice. All trademarks and partner references are property of their respective owners.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}