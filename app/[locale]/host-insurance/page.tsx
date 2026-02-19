// app/host-protection/page.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoCarOutline,
  IoWalletOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoCalculatorOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoTrophyOutline,
  IoCashOutline,
  IoFlashOutline,
  IoLockClosedOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoFingerPrintOutline,
  IoAnalyticsOutline,
  IoConstructOutline,
  IoGlobeOutline,
  IoHeartOutline,
  IoReceiptOutline,
  IoTimerOutline,
  IoCameraOutline,
  IoClipboardOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoMedalOutline,
  IoShieldOutline,
  IoWifiOutline,
  IoSchoolOutline,
  IoCallOutline,
  IoLeafOutline,
  IoCarSportOutline,
  IoMedkitOutline,
  IoHomeOutline,
  IoBanOutline,
  IoHammerOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

export default function HostProtectionPage() {
  const t = useTranslations('HostProtection')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('protection')
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [dailyRate, setDailyRate] = useState(100)
  const [monthlyDays, setMonthlyDays] = useState(15)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Section refs for smooth scrolling
  const protectionRef = useRef<HTMLElement>(null)
  const tiersRef = useRef<HTMLElement>(null)
  const coverageRef = useRef<HTMLElement>(null)
  const luxuryRef = useRef<HTMLElement>(null)
  const toolsRef = useRef<HTMLElement>(null)
  const documentationRef = useRef<HTMLElement>(null)
  const earningsRef = useRef<HTMLElement>(null)
  const rewardsRef = useRef<HTMLElement>(null)
  const supportRef = useRef<HTMLElement>(null)
  const faqRef = useRef<HTMLElement>(null)

  // Scroll to section handler
  const scrollToSection = (tabId: string) => {
    setActiveTab(tabId)
    
    const refMap: Record<string, React.RefObject<HTMLElement | null>> = {
      protection: protectionRef,
      tiers: tiersRef,
      coverage: coverageRef,
      luxury: luxuryRef,
      tools: toolsRef,
      documentation: documentationRef,
      earnings: earningsRef,
      rewards: rewardsRef,
      support: supportRef,
      faq: faqRef
    }
    
    const targetRef = refMap[tabId]
    if (targetRef?.current) {
      const yOffset = -180
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Update active tab based on scroll position
  useEffect(() => {
    const sections = [
      { id: 'protection', ref: protectionRef },
      { id: 'tiers', ref: tiersRef },
      { id: 'coverage', ref: coverageRef },
      { id: 'luxury', ref: luxuryRef },
      { id: 'tools', ref: toolsRef },
      { id: 'documentation', ref: documentationRef },
      { id: 'earnings', ref: earningsRef },
      { id: 'rewards', ref: rewardsRef },
      { id: 'support', ref: supportRef },
      { id: 'faq', ref: faqRef }
    ]

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop
          if (scrollPosition >= offsetTop) {
            setActiveTab(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate earnings based on insurance tier
  const calculateEarnings = () => {
    const tierPercentages = {
      basic: 40,
      standard: 75,
      premium: 90
    }
    
    const hostPercentage = tierPercentages[selectedTier]
    const dailyEarnings = dailyRate * (hostPercentage / 100)
    const monthlyEarnings = dailyEarnings * monthlyDays
    const yearlyEarnings = monthlyEarnings * 12
    
    return {
      hostPercentage,
      dailyEarnings: dailyEarnings.toFixed(0),
      monthlyEarnings: monthlyEarnings.toFixed(0),
      yearlyEarnings: yearlyEarnings.toFixed(0),
      platformFee: (100 - hostPercentage)
    }
  }

  const earnings = calculateEarnings()

  const insuranceTiers = [
    {
      id: 'basic',
      name: 'BASIC',
      percentage: 40,
      color: 'gray',
      insurance: 'Platform Insurance',
      deductible: '$2,500',
      description: 'No insurance needed. We handle everything. Perfect for getting started.',
      features: [
        'Platform insurance is primary',
        'No insurance costs for you',
        'Full platform support',
        'Zero barrier to entry'
      ]
    },
    {
      id: 'standard',
      name: 'STANDARD',
      percentage: 75,
      color: 'amber',
      insurance: 'P2P Insurance',
      deductible: '$1,500',
      description: 'You bring peer-to-peer insurance. Solid earnings, lower insurance costs.',
      features: [
        'Your P2P policy is primary',
        'Platform provides secondary coverage',
        'Standard claims processing',
        'Partial tax benefits'
      ]
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      percentage: 90,
      color: 'emerald',
      insurance: 'Commercial Insurance',
      deductible: '$1,000',
      description: 'You bring your commercial insurance. Highest earnings, full business benefits.',
      features: [
        'Your commercial policy is primary',
        'Platform insurance as backup',
        'Priority claims processing',
        'Full tax deductions available'
      ]
    }
  ]

  // Coverage details data
  const coverageDetails = {
    included: [
      {
        title: 'Liability Coverage',
        amount: 'Up to $1,000,000',
        icon: IoShieldCheckmarkOutline,
        description: 'Covers bodily injury and property damage to third parties during rental periods',
        details: [
          'Bodily injury per person: $250,000',
          'Bodily injury per accident: $500,000',
          'Property damage: $250,000',
          'Legal defense costs included'
        ]
      },
      {
        title: 'Physical Damage - Collision',
        amount: 'Actual Cash Value',
        icon: IoCarSportOutline,
        description: 'Covers damage to your vehicle from accidents with other vehicles or objects',
        details: [
          'Single-vehicle accidents',
          'Multi-vehicle collisions',
          'Rollover incidents',
          'Hit-and-run damage'
        ]
      },
      {
        title: 'Physical Damage - Comprehensive',
        amount: 'Actual Cash Value',
        icon: IoShieldOutline,
        description: 'Covers non-collision damage including theft, vandalism, and weather',
        details: [
          'Theft and attempted theft',
          'Vandalism and malicious damage',
          'Hail, flood, and storm damage',
          'Fire and explosion',
          'Falling objects',
          'Animal collisions'
        ]
      },
      {
        title: 'Loss of Use Compensation',
        amount: 'Up to $50/day',
        icon: IoTimerOutline,
        description: 'Daily compensation while your vehicle is being repaired after a covered claim',
        details: [
          'BASIC tier: $30/day (max 14 days)',
          'STANDARD tier: $40/day (max 21 days)',
          'PREMIUM tier: $50/day (max 30 days)',
          'Paid after claim approval'
        ]
      },
      {
        title: 'Roadside Assistance',
        amount: 'Included',
        icon: IoConstructOutline,
        description: '24/7 roadside assistance for guests during active rentals',
        details: [
          'Towing up to 50 miles',
          'Flat tire service',
          'Jump starts',
          'Lockout assistance',
          'Fuel delivery (up to 3 gallons)',
          'Winching service'
        ]
      },
      {
        title: 'Medical Payments',
        amount: 'Up to $5,000',
        icon: IoMedkitOutline,
        description: 'Covers medical expenses for driver and passengers regardless of fault',
        details: [
          'Emergency room visits',
          'Ambulance services',
          'X-rays and diagnostics',
          'Follow-up care'
        ]
      }
    ],
    deductibles: [
      {
        tier: 'BASIC',
        collision: '$2,500',
        comprehensive: '$2,500',
        color: 'gray'
      },
      {
        tier: 'STANDARD',
        collision: '$1,500',
        comprehensive: '$1,500',
        color: 'amber'
      },
      {
        tier: 'PREMIUM',
        collision: '$1,000',
        comprehensive: '$1,000',
        color: 'emerald'
      }
    ],
    exclusions: [
      {
        title: 'Mechanical & Wear',
        icon: IoHammerOutline,
        items: [
          'Mechanical or electrical breakdown',
          'Normal wear and tear',
          'Pre-existing damage',
          'Manufacturing defects',
          'Tire damage from road hazards (unless collision)',
          'Brake or clutch damage from misuse'
        ]
      },
      {
        title: 'Driver Behavior',
        icon: IoWarningOutline,
        items: [
          'Intentional damage',
          'DUI/DWI incidents',
          'Reckless driving violations',
          'Off-road use (unless vehicle is rated)',
          'Racing or speed competitions',
          'Unauthorized drivers'
        ]
      },
      {
        title: 'Personal Property',
        icon: IoHomeOutline,
        items: [
          'Personal belongings in vehicle',
          'Aftermarket accessories not documented',
          'Cash, jewelry, electronics',
          'Custom modifications not disclosed',
          'Cargo or transported goods'
        ]
      },
      {
        title: 'Prohibited Use',
        icon: IoBanOutline,
        items: [
          'Commercial use outside platform',
          'Rideshare (Uber/Lyft) while rented',
          'Illegal activities',
          'Border crossings without approval',
          'Subletting to third parties',
          'Use outside approved territory'
        ]
      }
    ],
    arizona: [
      {
        title: 'State Minimum Requirements',
        details: 'Arizona requires minimum liability coverage of 25/50/15 ($25K per person, $50K per accident for bodily injury, $15K property damage). ItWhip coverage exceeds state minimums significantly.'
      },
      {
        title: 'Transaction Privilege Tax (TPT)',
        details: 'Vehicle rentals in Arizona are subject to Transaction Privilege Tax. ItWhip automatically calculates and collects applicable taxes on all bookings.'
      },
      {
        title: 'No-Fault State',
        details: 'Arizona is an at-fault state, meaning the driver who caused the accident is responsible for damages. Our coverage protects you regardless of fault determination.'
      },
      {
        title: 'Uninsured Motorist Coverage',
        details: 'All tiers include uninsured/underinsured motorist coverage to protect against drivers without adequate insurance.'
      }
    ]
  }

  const luxuryProtection = {
    verification: [
      {
        title: 'Multi-Point Identity Check',
        description: 'Government ID, selfie verification, and background validation',
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
        title: 'Mileage Forensics™',
        description: 'Trip verification, usage patterns, fraud detection',
        details: 'Verify declared usage matches actual behavior'
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
        description: 'Dedicated claims hotline'
      },
      {
        step: 'Expert Assessment',
        time: '< 24 hours',
        description: 'Certified vehicle appraisers'
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

  const hostTools = [
    {
      title: 'Vehicle Dashboard',
      description: 'Complete vehicle management system',
      icon: IoCarOutline,
      features: [
        'Multi-vehicle management',
        'Calendar synchronization', 
        'Booking management',
        'Performance metrics',
        'Pricing controls',
        'Maintenance scheduling'
      ]
    },
    {
      title: 'Smart Pricing',
      description: 'Optimize your earnings',
      icon: IoAnalyticsOutline,
      features: [
        'Market demand insights',
        'Event surge pricing',
        'Seasonal adjustments',
        'Competitor benchmarking',
        'Daily/weekly/monthly rates',
        'Discount controls'
      ]
    },
    {
      title: 'Guest Verification',
      description: 'Know who rents your car',
      icon: IoShieldOutline,
      features: [
        'Identity verification',
        'Background checks',
        'Driving record review',
        'Previous rental history',
        'Rating system',
        'Block list management'
      ]
    },
    {
      title: 'Earnings Center',
      description: 'Track your income',
      icon: IoReceiptOutline,
      features: [
        'Real-time revenue tracking',
        'Payout management',
        'Tax documentation',
        'Expense tracking',
        'Profit analysis',
        'Export reports'
      ]
    },
    {
      title: 'ESG Impact Dashboard',
      description: 'Track sustainability metrics',
      icon: IoLeafOutline,
      features: [
        'Emissions tracking',
        'Maintenance scoring',
        'Impact badges',
        'Sustainability reports',
        'Guest impact sharing',
        'Green incentives'
      ]
    },
    {
      title: 'Listing Tools',
      description: 'Optimize your listings',
      icon: IoCameraOutline,
      features: [
        'Photo guidelines',
        'Description templates',
        'Feature highlights',
        'SEO optimization',
        'Review management',
        'Response templates'
      ]
    }
  ]

  const documentationProcess = [
    {
      phase: 'Pre-Trip',
      items: [
        '360° exterior walkthrough',
        'Interior condition photos',
        'Odometer reading capture',
        'Fuel gauge documentation',
        'Existing damage notation',
        'Personal items checklist'
      ]
    },
    {
      phase: 'Check-Out',
      items: [
        'Guest ID verification',
        'License validation',
        'Insurance confirmation',
        'Security deposit hold',
        'Terms acknowledgment',
        'Emergency contact'
      ]
    },
    {
      phase: 'During Trip',
      items: [
        'GPS location tracking',
        'Mileage monitoring',
        'Usage verification',
        'Boundary alerts',
        'Driving patterns',
        'Fuel consumption'
      ]
    },
    {
      phase: 'Post-Trip',
      items: [
        'Return condition photos',
        'Final mileage recording',
        'Fuel level verification',
        'Damage assessment',
        'Cleaning check',
        'Guest rating'
      ]
    }
  ]

  const premiumHostBenefits = [
    {
      tier: 'Rising Host',
      requirement: '5+ trips, 4.5+ rating',
      benefits: [
        'Verified badge',
        'Search boost',
        'Email support priority',
        'Host community access'
      ],
      badge: IoMedalOutline
    },
    {
      tier: 'Established Host',
      requirement: '15+ trips, 4.7+ rating',
      benefits: [
        'Featured in search',
        'Faster payouts',
        'Phone support',
        'Monthly insights'
      ],
      badge: IoRibbonOutline
    },
    {
      tier: 'Top Host',
      requirement: '30+ trips, 4.9+ rating',
      benefits: [
        'Homepage features',
        'Priority support',
        'Early feature access',
        'Quarterly bonus'
      ],
      badge: IoDiamondOutline
    },
    {
      tier: 'Elite Fleet',
      requirement: '5+ vehicles, $5K+ monthly',
      benefits: [
        'Dedicated manager',
        'Custom solutions',
        'API access',
        'Annual summit invite'
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
        { item: 'Car payment interest', amount: '$800-2,400/year' }
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
        { item: 'Business mileage', amount: '$0.67/mile' }
      ]
    }
  ]

  const insuranceComparison = [
    {
      aspect: 'Coverage Limit',
      itwhip: 'Up to $1M liability',
      turo: '$750K typical',
      advantage: 'Higher protection'
    },
    {
      aspect: 'Host Earnings',
      itwhip: '40-90% (you choose)',
      turo: '60-85% (platform decides)',
      advantage: 'More control'
    },
    {
      aspect: 'Insurance Tiers',
      itwhip: '3 tiers based on YOUR insurance',
      turo: 'Fixed by platform',
      advantage: 'Transparent system'
    },
    {
      aspect: 'Claims Process',
      itwhip: '48-72 hour resolution',
      turo: '1-2 weeks typical',
      advantage: 'Faster resolution'
    },
    {
      aspect: 'Mileage Tracking',
      itwhip: 'Mileage Forensics™ included',
      turo: 'Basic tracking',
      advantage: 'Fraud prevention'
    },
    {
      aspect: 'Loss of Use',
      itwhip: 'Up to $50/day, 30 days',
      turo: 'Limited availability',
      advantage: 'Better compensation'
    }
  ]

  const supportLevels = [
    {
      level: 'Standard Support',
      availability: '24/7 chat & email',
      response: '< 1 hour',
      includes: ['Troubleshooting', 'Booking help', 'General questions']
    },
    {
      level: 'Priority Support',
      availability: '24/7 phone & chat',
      response: '< 15 minutes',
      includes: ['Dedicated line', 'Account management', 'Escalation priority']
    },
    {
      level: 'Elite Concierge',
      availability: 'Dedicated agent',
      response: 'Immediate',
      includes: ['Personal manager', 'White-glove service', 'Custom solutions']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Page Title */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host/signup" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('startEarning')}
              </Link>
              <Link href="/insurance-guide" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('insuranceGuide')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="fixed top-[106px] md:top-[112px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 pb-px">
            {[
              { id: 'protection', label: 'Overview' },
              { id: 'tiers', label: 'Insurance Tiers' },
              { id: 'coverage', label: 'Coverage Details', icon: IoShieldOutline },
              { id: 'luxury', label: 'Luxury & Exotic', icon: IoDiamondOutline },
              { id: 'tools', label: 'Host Tools' },
              { id: 'documentation', label: 'Documentation' },
              { id: 'earnings', label: 'Earnings & Taxes' },
              { id: 'rewards', label: 'Host Rewards' },
              { id: 'support', label: 'Support' },
              { id: 'faq', label: 'FAQs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4 mr-1" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[156px]">
        
        {/* Hero Section with Earnings Calculator */}
        <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('heroTitle')}
                <span className="block text-purple-600 mt-2">{t('heroSubtitle')}</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                {t('heroDescription')}
              </p>

              {/* Earnings Calculator */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <IoCalculatorOutline className="inline w-5 h-5 mr-2" />
                  {t('earningsCalculator')}
                </h3>
                
                {/* Tier Selector */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {insuranceTiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                      className={`p-3 rounded-lg text-center transition ${
                        selectedTier === tier.id
                          ? tier.color === 'emerald' ? 'bg-emerald-500 text-white'
                          : tier.color === 'amber' ? 'bg-amber-500 text-white'
                          : 'bg-gray-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div className="text-2xl font-bold">{tier.percentage}%</div>
                      <div className="text-xs">{tier.name}</div>
                      <div className="text-xs opacity-80">{tier.insurance}</div>
                    </button>
                  ))}
                </div>

                {/* Daily Rate Slider */}
                <div className="mb-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                    Daily Rate: ${dailyRate}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="500"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Days Per Month Slider */}
                <div className="mb-6">
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

                {/* Earnings Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-400 mb-3">
                      Your Earnings ({earnings.hostPercentage}% tier)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Per rental day:</span>
                        <span className="font-bold text-purple-600">${earnings.dailyEarnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Monthly ({monthlyDays} days):</span>
                        <span className="font-bold text-purple-600">${earnings.monthlyEarnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Annual projection:</span>
                        <span className="font-bold text-purple-600">${parseInt(earnings.yearlyEarnings).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-3">
                      Platform Fee ({earnings.platformFee}%)
                    </h4>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <p>✓ $1M liability coverage</p>
                      <p>✓ Guest verification</p>
                      <p>✓ 24/7 support</p>
                      <p>✓ Payment processing</p>
                      <p>✓ Mileage Forensics™</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/host/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
                >
                  Start Earning <IoArrowForwardOutline className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  href="/insurance-guide"
                  className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg border border-purple-200"
                >
                  Insurance Guide
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Protection Section */}
        <section ref={protectionRef} id="protection" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How We Compare
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ItWhip vs other P2P car sharing platforms
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                      ItWhip
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      Other Platforms
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
                        {item.turo}
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

        {/* Tiers Section */}
        <section ref={tiersRef} id="tiers" className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Simple Insurance-Based Tiers
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your earnings are determined ONLY by the insurance you bring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insuranceTiers.map((tier) => (
                <div 
                  key={tier.id}
                  className={`relative rounded-lg p-6 border-2 hover:shadow-xl transition-shadow ${
                    tier.color === 'emerald' 
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-500'
                      : tier.color === 'amber'
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-500'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-400'
                  }`}
                >
                  <div className={`absolute -top-3 left-6 px-3 py-0.5 rounded-full text-xs font-bold text-white ${
                    tier.color === 'emerald' ? 'bg-emerald-500'
                    : tier.color === 'amber' ? 'bg-amber-500'
                    : 'bg-gray-500'
                  }`}>
                    {tier.name}
                  </div>
                  <div className="mt-2">
                    <div className={`text-4xl font-black mb-1 ${
                      tier.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400'
                      : tier.color === 'amber' ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {tier.percentage}%
                    </div>
                    <div className="text-sm text-gray-500 mb-3">Deductible: {tier.deductible}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {tier.insurance}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {tier.description}
                    </p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <IoCheckmarkCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            tier.color === 'emerald' ? 'text-emerald-500'
                            : tier.color === 'amber' ? 'text-amber-500'
                            : 'text-gray-500'
                          }`} />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/insurance-guide"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Learn more about insurance options →
              </Link>
            </div>
          </div>
        </section>

        {/* Coverage Details Section - NEW */}
        <section ref={coverageRef} id="coverage" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600" />
                <span className="text-purple-600 font-semibold">Comprehensive Protection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                What's Covered
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Every rental is backed by comprehensive coverage. Here's exactly what protection you get.
              </p>
            </div>

            {/* Coverage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {coverageDetails.included.map((coverage, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <coverage.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {coverage.title}
                      </h3>
                      <div className="text-sm font-bold text-purple-600">{coverage.amount}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {coverage.description}
                  </p>
                  <ul className="space-y-1">
                    {coverage.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Deductibles by Tier */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Deductibles by Tier
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coverageDetails.deductibles.map((tier, idx) => (
                  <div 
                    key={idx} 
                    className={`p-6 rounded-lg border-2 text-center ${
                      tier.color === 'emerald' 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : tier.color === 'amber'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-400 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-2 ${
                      tier.color === 'emerald' ? 'text-emerald-600'
                      : tier.color === 'amber' ? 'text-amber-600'
                      : 'text-gray-600'
                    }`}>
                      {tier.tier} TIER
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500">Collision</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{tier.collision}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Comprehensive</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{tier.comprehensive}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Lower deductibles with higher tiers. Deductible is the amount you pay before coverage kicks in.
              </p>
            </div>

            {/* Exclusions */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                <IoAlertCircleOutline className="inline w-6 h-6 text-red-500 mr-2" />
                What's NOT Covered
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coverageDetails.exclusions.map((exclusion, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <exclusion.icon className="w-8 h-8 text-red-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {exclusion.title}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {exclusion.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <IoCloseCircleOutline className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Arizona-Specific */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-400 mb-6 text-center">
                <IoGlobeOutline className="inline w-6 h-6 mr-2" />
                Arizona-Specific Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coverageDetails.arizona.map((item, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Luxury Section */}
        <section ref={luxuryRef} id="luxury" className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mb-4">
                <IoDiamondOutline className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Premium Vehicle Protection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Specialized Protection for High-Value Vehicles
              </h2>
            </div>

            {/* Guest Verification */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                4-Layer Guest Verification
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
                Real-Time Vehicle Monitoring
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

            {/* Claims Process */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-400 mb-6 text-center">
                Priority Claims Service
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

        {/* Tools Section */}
        <section ref={toolsRef} id="tools" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Professional Host Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Everything you need to manage your car sharing business
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

        {/* Documentation Section */}
        <section ref={documentationRef} id="documentation" className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Complete Trip Documentation
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
          </div>
        </section>

        {/* Earnings Section */}
        <section ref={earningsRef} id="earnings" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Maximize Your Tax Benefits
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Turn your vehicle into a tax-advantaged business
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
                $8,000 - $25,000/year
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

        {/* Rewards Section */}
        <section ref={rewardsRef} id="rewards" className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Host Achievement Tiers
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Grow your business and unlock exclusive benefits
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
          </div>
        </section>

        {/* Support Section */}
        <section ref={supportRef} id="support" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Support When You Need It
              </h2>
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
                  <ul className="space-y-1">
                    {level.includes.map((item, iIdx) => (
                      <li key={iIdx} className="text-xs text-gray-600 dark:text-gray-400">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Emergency Support */}
            <div className="mt-12 bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center">
              <IoCallOutline className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-400 mb-2">
                24/7 Emergency Hotline
              </h3>
              <p className="text-2xl font-bold text-red-600 mb-2">1-855-703-0806</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For accidents, theft, or urgent safety issues
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} id="faq" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How do the insurance tiers work?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your earnings percentage is based solely on the insurance you provide. BASIC (40%) uses our platform insurance, 
                  STANDARD (75%) requires P2P insurance like Getaround or similar, and PREMIUM (90%) requires commercial auto insurance. 
                  The more coverage you bring, the more you earn.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What happens if my car is damaged?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All tiers include $1M liability coverage. For STANDARD and PREMIUM tiers, your insurance is primary and our 
                  platform insurance serves as backup. Claims are processed within 48-72 hours. We handle coordination with 
                  repair shops and provide loss-of-use compensation up to $50/day while your vehicle is being repaired.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What are the deductibles?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deductibles vary by tier: BASIC tier has a $2,500 deductible, STANDARD tier has a $1,500 deductible, 
                  and PREMIUM tier has a $1,000 deductible. Lower deductibles are a benefit of bringing your own insurance.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How are guests verified?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every guest undergoes identity verification, driving record check, and background screening. For luxury vehicles, 
                  we require additional financial verification, higher age minimums, and larger security deposits.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How quickly do I get paid?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payments are processed within 48 hours of trip completion via direct deposit. Top Hosts get instant payouts. 
                  All payments include detailed breakdowns of earnings, fees, and any adjustments.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What is Mileage Forensics™?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our proprietary system tracks mileage between trips to verify hosts are using vehicles according to their 
                  declared usage type. This protects both hosts and our insurance partners by ensuring accurate risk assessment 
                  and preventing fraud.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Is roadside assistance included?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes! All tiers include 24/7 roadside assistance during active rentals. This covers towing up to 50 miles, 
                  flat tire service, jump starts, lockout assistance, and fuel delivery.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What if the guest damages my personal belongings in the car?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personal belongings are not covered by our protection plans. We recommend removing all personal items 
                  before each rental. Aftermarket accessories and custom modifications should be documented during onboarding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">48hr</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('paymentSpeed')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">$1M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('liabilityCoverage')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">40-90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('hostEarnings')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('support')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-base sm:text-lg text-purple-100 mb-8">
              {t('ctaDesc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/host/signup"
                className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                {t('listYourCar')}
              </Link>
              <Link
                href="/insurance-guide"
                className="inline-block px-8 py-4 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition border border-purple-400"
              >
                {t('insuranceGuide')}
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
                    {t('importantInfo')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Protection provided through licensed third-party insurance carriers. Coverage amounts and availability subject to vehicle eligibility, location, and underwriter approval. ItWhip facilitates coverage but is not an insurance company. Protection applies only during active rental periods booked through our platform. Earnings estimates based on platform averages and not guaranteed. Individual results vary based on vehicle type, location, availability, seasonality, and market conditions. Tax benefits vary by individual situation - consult a tax professional. Payment timing subject to banking holidays and verification requirements. 48-hour payment applies to verified hosts with completed documentation. Vehicle eligibility requirements include age, condition, and safety standards. Guest screening includes third-party background checks but does not guarantee renter behavior. Platform features, benefits, and commission rates subject to terms of host agreement and may vary by market. Host tier benefits require maintaining qualification criteria. Support response times are targets, not guarantees. GPS tracking and telematics features require compatible hardware installation. Professional photography and other services may have additional fees in some markets. Reserve fund protection subject to platform terms and conditions. Luxury and exotic vehicle coverage may require additional verification and documentation. Commercial use outside platform prohibited. Personal insurance required for non-rental use. Business licenses and permits vary by jurisdiction - hosts responsible for compliance. Platform reserves right to modify terms, features, and pricing with notice. Arizona-specific regulations apply including Transaction Privilege Tax requirements. Airport and hotel partnerships vary by location. Not all features available in all markets. Elite host programs have specific qualification requirements. This information does not constitute legal, tax, or financial advice. All trademarks and partner references are property of their respective owners.
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