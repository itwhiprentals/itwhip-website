// app/host-requirements/HostRequirementsContent.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoCheckmarkCircle,
  IoCarOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoPhonePortraitOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoBusinessOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoStarOutline,
  IoTrophyOutline,
  IoRocketOutline,
  IoKeyOutline,
  IoBuildOutline,
  IoWaterOutline,
  IoFlashOutline,
  IoThermometerOutline,
  IoConstructOutline,
  IoSparklesOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoMedalOutline,
  IoGlobeOutline,
  IoFingerPrintOutline,
  IoWifiOutline,
  IoCameraOutline,
  IoClipboardOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

export default function HostRequirementsContent() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState('all')
  const [expandedSection, setExpandedSection] = useState('vehicle')
  const [showQuickCheck, setShowQuickCheck] = useState(false)
  
  // Quick check form state
  const [quickCheckData, setQuickCheckData] = useState({
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    mileage: '',
    hasCleanTitle: '',
    hostAge: ''
  })
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const vehicleTiers = [
    {
      id: 'economy',
      name: 'Economy',
      icon: IoCarOutline,
      examples: 'Honda Civic, Toyota Corolla, Nissan Sentra, Hyundai Elantra',
      color: 'blue',
      requirements: {
        age: '2015 or newer',
        mileage: 'Under 130,000 miles',
        condition: 'Good mechanical condition',
        features: 'Working A/C and heat'
      },
      earnings: '$600-1,100/month',
      guestProfile: '21+ years, basic verification'
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: IoCarOutline,
      examples: 'Toyota Camry, Honda Accord, CR-V, Mazda CX-5',
      color: 'green',
      requirements: {
        age: '2015 or newer',
        mileage: 'Under 130,000 miles',
        condition: 'Well-maintained interior',
        features: 'All features functional'
      },
      earnings: '$900-1,500/month',
      guestProfile: '21+ years, basic verification'
    },
    {
      id: 'luxury',
      name: 'Luxury',
      icon: IoDiamondOutline,
      examples: 'BMW 3 Series, Mercedes C-Class, Audi A4, Lexus IS',
      color: 'purple',
      requirements: {
        age: '2015 or newer',
        mileage: 'Under 75,000 miles preferred',
        condition: 'Excellent condition, no cosmetic damage',
        features: 'Premium features all functional'
      },
      earnings: '$1,500-3,000/month',
      guestProfile: '25+ years, 700+ credit score'
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: IoStarOutline,
      examples: 'Tesla Model S/X, BMW 7 Series, Mercedes S-Class',
      color: 'amber',
      requirements: {
        age: '2018 or newer preferred',
        mileage: 'Under 50,000 miles',
        condition: 'Pristine condition required',
        features: 'All luxury features operational'
      },
      earnings: '$3,000-5,000/month',
      guestProfile: '30+ years, 750+ credit score'
    },
    {
      id: 'exotic',
      name: 'Exotic',
      icon: IoRocketOutline,
      examples: 'Porsche 911, Ferrari, Lamborghini, McLaren',
      color: 'red',
      requirements: {
        age: 'Model-specific requirements',
        mileage: 'Under 30,000 miles',
        condition: 'Factory specifications maintained',
        features: 'Authorized service only'
      },
      earnings: '$5,000-10,000/month',
      guestProfile: '30+ years, verified, $5K deposit'
    }
  ]

  const universalRequirements = [
    {
      category: 'Vehicle Eligibility',
      icon: IoCarOutline,
      items: [
        { text: '2015 or newer (10 years maximum age)', required: true },
        { text: 'Clean title - no salvage or rebuilt', required: true },
        { text: 'Current registration and insurance', required: true },
        { text: 'Under 130,000 miles', required: true },
        { text: 'Pass ItWhip safety inspection', required: true }
      ]
    },
    {
      category: 'Safety & Functionality',
      icon: IoShieldCheckmarkOutline,
      items: [
        { text: 'All safety features operational (airbags, seatbelts, lights)', required: true },
        { text: 'Working A/C and heating system', required: true },
        { text: 'No dashboard warning lights', required: true },
        { text: 'Tires with adequate tread (4/32" minimum)', required: true },
        { text: 'Functional brakes and steering', required: true }
      ]
    },
    {
      category: 'Cleanliness Standards',
      icon: IoSparklesOutline,
      items: [
        { text: 'Professional detailing standard interior', required: true },
        { text: 'No smoking odors or pet hair', required: true },
        { text: 'No personal items in vehicle', required: true },
        { text: 'Clean exterior without major damage', required: true },
        { text: 'Stain-free upholstery and carpets', required: true }
      ]
    }
  ]

  const hostRequirements = [
    {
      category: 'Basic Eligibility',
      icon: IoPersonOutline,
      items: [
        { text: '21 years or older', required: true },
        { text: 'Valid driver\'s license (2+ years)', required: true },
        { text: 'Pass background check', required: true },
        { text: 'Smartphone with ItWhip app', required: true },
        { text: 'Active personal auto insurance', required: true }
      ]
    },
    {
      category: 'Operational Requirements',
      icon: IoTimeOutline,
      items: [
        { text: 'Respond to bookings within 2 hours', required: true },
        { text: 'Maintain 90%+ acceptance rate', required: false },
        { text: 'Available for guest communication', required: true },
        { text: 'Complete monthly vehicle inspections', required: true },
        { text: 'Update availability calendar regularly', required: true }
      ]
    },
    {
      category: 'Location Requirements',
      icon: IoLocationOutline,
      items: [
        { text: 'Vehicle located in Phoenix metro area', required: true },
        { text: 'Parking in safe, accessible location', required: true },
        { text: 'Within 25 miles of Sky Harbor preferred', required: false },
        { text: 'Covered parking available preferred', required: false },
        { text: 'Willing to offer delivery (optional)', required: false }
      ]
    }
  ]

  const fleetOwnerBenefits = [
    {
      vehicles: '3-5 vehicles',
      benefits: [
        '1% commission reduction',
        'Dedicated onboarding specialist',
        'Bulk listing tools',
        'Priority support'
      ],
      icon: IoMedalOutline,
      color: 'bronze'
    },
    {
      vehicles: '6-10 vehicles',
      benefits: [
        '2% commission reduction',
        'Account manager assigned',
        'Custom pricing tools',
        'Monthly performance reports'
      ],
      icon: IoRibbonOutline,
      color: 'silver'
    },
    {
      vehicles: '11-20 vehicles',
      benefits: [
        '3% commission reduction',
        'White-label options',
        'API access',
        'Quarterly business reviews'
      ],
      icon: IoDiamondOutline,
      color: 'gold'
    },
    {
      vehicles: '20+ vehicles',
      benefits: [
        'Custom commission rates',
        'Dedicated support team',
        'Revenue sharing opportunities',
        'Co-marketing initiatives'
      ],
      icon: IoTrophyOutline,
      color: 'platinum'
    }
  ]

  const notAccepted = [
    'Salvage or rebuilt titles',
    'Vehicles over 130,000 miles',
    'Vehicles older than 2015',
    'Commercial trucks or vans (unless specialty)',
    'Vehicles with unrepaired damage',
    'Vehicles with non-functional safety features',
    'Vehicles with expired registration',
    'Vehicles without proper insurance'
  ]

  const inspectionProcess = [
    {
      step: 1,
      title: 'Schedule Inspection',
      description: 'Book a convenient time online or through the app',
      time: '5 minutes',
      icon: IoCalendarOutline
    },
    {
      step: 2,
      title: 'Vehicle Review',
      description: 'Quick 20-point safety and quality check',
      time: '15-20 minutes',
      icon: IoClipboardOutline
    },
    {
      step: 3,
      title: 'Photo Documentation',
      description: 'Professional photos taken for your listing',
      time: '10 minutes',
      icon: IoCameraOutline
    },
    {
      step: 4,
      title: 'Instant Approval',
      description: 'Get approved and go live immediately',
      time: 'Immediate',
      icon: IoCheckmarkCircle
    }
  ]

  const handleQuickCheck = () => {
    const year = parseInt(quickCheckData.vehicleYear)
    const mileage = parseInt(quickCheckData.mileage)
    const age = parseInt(quickCheckData.hostAge)
    
    let qualified = true
    let tier = 'economy'
    let issues = []
    
    // Check vehicle year
    if (year < 2015) {
      qualified = false
      issues.push('Vehicle must be 2015 or newer')
    }
    
    // Check mileage
    if (mileage > 130000) {
      qualified = false
      issues.push('Vehicle must have less than 130,000 miles')
    } else if (mileage < 50000 && year >= 2018) {
      tier = 'premium'
    } else if (mileage < 75000 && year >= 2015) {
      tier = 'luxury'
    } else if (mileage < 100000) {
      tier = 'standard'
    }
    
    // Check title
    if (quickCheckData.hasCleanTitle === 'no') {
      qualified = false
      issues.push('Vehicle must have a clean title')
    }
    
    // Check host age
    if (age < 21) {
      qualified = false
      issues.push('Host must be 21 or older')
    }
    
    alert(
      qualified 
        ? `✅ Great news! Your vehicle qualifies for our ${tier} tier. You could earn ${vehicleTiers.find(t => t.id === tier)?.earnings}!`
        : `❌ Your vehicle doesn't currently qualify. Issues: ${issues.join(', ')}`
    )
  }

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
              <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Host Requirements
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded">
                All Vehicles Welcome
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setShowQuickCheck(!showQuickCheck)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Quick Eligibility Check
              </button>
              <Link 
                href="/list-your-car"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                Start Application →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Simple Requirements, Clear Standards
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Every vehicle 2015 or newer qualifies. Higher tiers unlock higher earnings.
                No hidden requirements, no surprises.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">2015+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Minimum year</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">130K</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Max miles</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">21+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Host age</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">20min</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Inspection time</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Check Tool */}
        {showQuickCheck && (
          <section className="py-6 bg-purple-50 dark:bg-purple-900/10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Eligibility Check
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Vehicle Year"
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.vehicleYear}
                    onChange={(e) => setQuickCheckData({...quickCheckData, vehicleYear: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Current Mileage"
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.mileage}
                    onChange={(e) => setQuickCheckData({...quickCheckData, mileage: e.target.value})}
                  />
                  <select
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.hasCleanTitle}
                    onChange={(e) => setQuickCheckData({...quickCheckData, hasCleanTitle: e.target.value})}
                  >
                    <option value="">Clean Title?</option>
                    <option value="yes">Yes - Clean Title</option>
                    <option value="no">No - Salvage/Rebuilt</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Vehicle Make"
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.vehicleMake}
                    onChange={(e) => setQuickCheckData({...quickCheckData, vehicleMake: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Vehicle Model"
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.vehicleModel}
                    onChange={(e) => setQuickCheckData({...quickCheckData, vehicleModel: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Your Age"
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.hostAge}
                    onChange={(e) => setQuickCheckData({...quickCheckData, hostAge: e.target.value})}
                  />
                </div>
                <button
                  onClick={handleQuickCheck}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                >
                  Check Eligibility →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Vehicle Tiers */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Find Your Vehicle Tier
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                All vehicles meeting basic requirements qualify. Higher tiers = higher earnings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicleTiers.map((tier) => (
                <div key={tier.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <tier.icon className="w-8 h-8 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tier.name}
                      </h3>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {tier.earnings}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {tier.examples}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Requirements:
                      </h4>
                      <ul className="space-y-1">
                        {Object.entries(tier.requirements).map(([key, value]) => (
                          <li key={key} className="flex items-start">
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        <strong>Guest Profile:</strong> {tier.guestProfile}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Universal Requirements */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Universal Vehicle Requirements
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Every vehicle must meet these basic safety and quality standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {universalRequirements.map((category, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <category.icon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.category}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start">
                        {item.required ? (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <IoInformationCircleOutline className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Host Requirements */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Host Requirements
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Simple requirements to ensure quality and safety for all users
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hostRequirements.map((category, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <category.icon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.category}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start">
                        {item.required ? (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <IoStarOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${item.required ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inspection Process */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Simple 30-Minute Inspection Process
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Quick, free inspection gets you earning immediately
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {inspectionProcess.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Step {step.step}: {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {step.description}
                  </p>
                  <span className="text-xs text-purple-600 font-semibold">
                    {step.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Inspections available 7 days a week at multiple Phoenix locations
              </p>
              <Link 
                href="/list-your-car"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
              >
                Schedule Your Inspection →
              </Link>
            </div>
          </div>
        </section>

        {/* Fleet Owner Benefits */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Fleet Owner? Even Better.
              </h2>
              <p className="text-purple-100">
                Special benefits and reduced commissions for multiple vehicles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fleetOwnerBenefits.map((tier, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <tier.icon className="w-10 h-10 text-white mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {tier.vehicles}
                  </h3>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-purple-100">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-purple-100 mb-4">
                Have a fleet? Let's talk about custom solutions.
              </p>
              <Link 
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition"
              >
                Contact Fleet Team →
              </Link>
            </div>
          </div>
        </section>

        {/* What We Don't Accept */}
        <section className="py-12 sm:py-16 bg-red-50 dark:bg-red-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                What We Don't Accept
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                For safety and quality, we cannot accept these vehicles
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notAccepted.map((item, idx) => (
                  <div key={idx} className="flex items-start">
                    <IoCloseCircleOutline className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Common Questions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  My car is from 2014. Can I still list it?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unfortunately, we only accept vehicles 2015 or newer to ensure safety and reliability. 
                  This requirement helps maintain quality standards and guest satisfaction.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do you accept commercial vehicles or vans?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We accept passenger vans and specialty commercial vehicles on a case-by-case basis. 
                  Work trucks and cargo vans are generally not accepted unless they're specialty/luxury models.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What if my vehicle has minor cosmetic damage?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minor wear is acceptable for economy/standard tiers. Luxury and above require excellent 
                  cosmetic condition. All safety-related damage must be repaired before listing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I list multiple vehicles?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Absolutely! Fleet owners receive reduced commissions and additional benefits. 
                  Starting at just 3 vehicles, you'll get priority support and bulk management tools.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do I need commercial insurance?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No! Protection is included in our commission. You only need to maintain your personal 
                  auto insurance. We provide up to $2M liability coverage during active rentals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Vehicle Probably Qualifies
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              2015 or newer? Under 130,000 miles? You're likely ready to start earning.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/list-your-car"
                className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
              >
                Check Your Vehicle →
              </Link>
              <Link 
                href="/host-earnings"
                className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition border-2 border-purple-600"
              >
                Calculate Earnings
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Free inspection</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Instant approval</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>No fees</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}