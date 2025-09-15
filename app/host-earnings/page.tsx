// app/host-earnings/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoCashOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoInformationCircleOutline,
  IoTrendingUpOutline,
  IoCarOutline,
  IoCalculatorOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoStarOutline,
  IoFlashOutline,
  IoTrophyOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoBarChartOutline,
  IoSwapHorizontalOutline,
  IoDiamondOutline,
  IoLockClosedOutline,
  IoTimeOutline,
  IoGlobeOutline,
  IoRibbonOutline,
  IoFingerPrintOutline,
  IoLocationOutline
} from 'react-icons/io5'

export default function HostEarningsPage() {
  const router = useRouter()
  const [selectedVehicle, setSelectedVehicle] = useState('luxury')
  const [monthlyBookings, setMonthlyBookings] = useState(15)
  const [showComparison, setShowComparison] = useState(false)
  const [activeVehicleTab, setActiveVehicleTab] = useState('luxury')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Simple, transparent pricing by vehicle type
  const pricingModel = {
    economy: {
      commission: 15,
      daily: 65,
      examples: 'Civic, Corolla, Sentra',
      coverage: 'Up to $75K vehicle value',
      turoAverage: 25,
      turoDeductible: 250
    },
    standard: {
      commission: 15,
      daily: 85,
      examples: 'Camry, Accord, Malibu',
      coverage: 'Up to $100K vehicle value',
      turoAverage: 25,
      turoDeductible: 250
    },
    luxury: {
      commission: 18,
      daily: 150,
      examples: 'BMW 3 Series, Mercedes C-Class, Audi A4',
      coverage: 'Up to $150K vehicle value',
      turoAverage: 30,
      turoDeductible: 750
    },
    premium: {
      commission: 20,
      daily: 250,
      examples: 'Tesla Model S, Mercedes S-Class, BMW 7 Series',
      coverage: 'Up to $200K vehicle value',
      turoAverage: 35,
      turoDeductible: 1625
    },
    exotic: {
      commission: 22,
      daily: 500,
      examples: 'Lamborghini, Ferrari, McLaren, Porsche 911',
      coverage: 'Up to $300K vehicle value',
      turoAverage: 40,
      turoDeductible: 2500
    }
  }

  // Calculate earnings with comparison
  const calculateEarnings = () => {
    const vehicle = pricingModel[selectedVehicle as keyof typeof pricingModel]
    const dailyRate = vehicle.daily
    const totalRevenue = dailyRate * monthlyBookings
    
    // ItWhip calculations
    const itwhipCommission = (totalRevenue * vehicle.commission) / 100
    const itwhipHostEarnings = totalRevenue - itwhipCommission
    
    // Competitor calculations (Turo)
    const turoCommission = (totalRevenue * vehicle.turoAverage) / 100
    const turoHostEarnings = totalRevenue - turoCommission
    const turoDeductibleRisk = vehicle.turoDeductible // Annual deductible exposure
    
    // Savings calculation
    const monthlySavings = itwhipHostEarnings - turoHostEarnings
    const annualSavings = (monthlySavings * 12) + turoDeductibleRisk
    
    return {
      dailyRate,
      totalRevenue,
      itwhipCommission,
      itwhipHostEarnings,
      turoCommission,
      turoHostEarnings,
      turoDeductible: vehicle.turoDeductible,
      monthlySavings,
      annualSavings,
      annualEarnings: itwhipHostEarnings * 12
    }
  }

  const earnings = calculateEarnings()
  const currentVehicle = pricingModel[selectedVehicle as keyof typeof pricingModel]

  // Premium services add-ons
  const premiumServices = [
    {
      name: 'Professional Photography',
      price: '$199',
      frequency: 'one-time',
      description: 'HDR photos by certified automotive photographers',
      value: 'Increases bookings by 40%'
    },
    {
      name: 'Priority Placement',
      price: '$49',
      frequency: 'monthly',
      description: 'Top positioning in search results',
      value: 'Double your visibility'
    },
    {
      name: 'Instant Payouts',
      price: '$29',
      frequency: 'monthly',
      description: 'Get paid within 2 hours of trip completion',
      value: 'Improve cash flow'
    },
    {
      name: 'Elite Support',
      price: '$99',
      frequency: 'monthly',
      description: 'Dedicated account manager & priority support',
      value: 'White-glove service'
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
              <IoDiamondOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Professional Host Earnings
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded">
                Premium Platform
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/list-your-car" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                List Your Car
              </Link>
              <Link href="/switch-from-turo" className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                Switch & Save
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        
        {/* Hero Section - Premium Positioning */}
        <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Launch Special Badge */}
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full mb-4 sm:mb-6">
                <IoSparklesOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-xs sm:text-sm text-white font-medium">
                  Limited Time: 0% Commission for 60 Days
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Professional Car Sharing for
                <span className="block text-purple-600 mt-2">Discerning Hosts</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Simple 15-22% commission. Zero deductible. Full protection included. 
                Join the premium platform where hotel-verified guests meet professional hosts.
              </p>

              {/* Key Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Full Protection</div>
                  <div className="text-xs text-gray-500">Competitive deductibles</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoBusinessOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Hotel Guests</div>
                  <div className="text-xs text-gray-500">Pre-verified travelers</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoFlashOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">48hr Payouts</div>
                  <div className="text-xs text-gray-500">Industry's fastest</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/list-your-car"
                  className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
                >
                  Start Earning Today
                </Link>
                <button 
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
                >
                  Compare Platforms
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle Type Navigation Tabs */}
        <section className="py-8 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select Your Vehicle Category
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get personalized insights for your specific vehicle type
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {setActiveVehicleTab('economy'); setSelectedVehicle('economy')}}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeVehicleTab === 'economy'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                <IoCarOutline className="inline w-4 h-4 mr-1" />
                Economy
              </button>
              <button
                onClick={() => {setActiveVehicleTab('standard'); setSelectedVehicle('standard')}}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeVehicleTab === 'standard'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                <IoCarOutline className="inline w-4 h-4 mr-1" />
                Standard
              </button>
              <button
                onClick={() => {setActiveVehicleTab('luxury'); setSelectedVehicle('luxury')}}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeVehicleTab === 'luxury'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                <IoDiamondOutline className="inline w-4 h-4 mr-1" />
                Luxury
              </button>
              <button
                onClick={() => {setActiveVehicleTab('premium'); setSelectedVehicle('premium')}}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeVehicleTab === 'premium'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                <IoStarOutline className="inline w-4 h-4 mr-1" />
                Premium
              </button>
              <button
                onClick={() => {setActiveVehicleTab('exotic'); setSelectedVehicle('exotic')}}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeVehicleTab === 'exotic'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                <IoRocketOutline className="inline w-4 h-4 mr-1" />
                Exotic
              </button>
            </div>
          </div>
        </section>

        {/* Vehicle-Specific Content Sections */}
        {activeVehicleTab === 'economy' && (
          <section className="py-12 bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                  <IoCarOutline className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Economy Vehicle Owner</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Maximize Volume, Minimize Downtime
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Economy vehicles are the backbone of car sharing. With high demand from budget-conscious travelers 
                  and business guests, your reliable vehicle can generate consistent monthly income.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Advantages</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Highest booking frequency (20-25 days/month)</li>
                    <li>• Quick turnover between rentals</li>
                    <li>• Lower maintenance costs</li>
                    <li>• Broader guest appeal</li>
                    <li>• Year-round demand</li>
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Typical Earnings</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">$1,100-1,625</div>
                      <div className="text-xs text-gray-500">Monthly revenue (25 days)</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">$935-1,381</div>
                      <div className="text-xs text-gray-500">Your earnings after 15% commission</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Protection Details</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coverage:</span>
                      <span className="font-medium">$750K liability</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                      <span className="font-medium">$500</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Claims support:</span>
                      <span className="font-medium">24/7</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-3">Success Strategy for Economy Hosts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <strong>Maximize Bookings:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Enable instant booking for quick conversions</li>
                      <li>• Offer airport pickup/dropoff ($35 extra)</li>
                      <li>• Maintain spotless cleanliness ratings</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Optimize Operations:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Use express cleaning between rentals</li>
                      <li>• Set 2-hour turnover windows</li>
                      <li>• Keep maintenance on strict schedule</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeVehicleTab === 'standard' && (
          <section className="py-12 bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                  <IoCarOutline className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">Standard Vehicle Owner</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  The Sweet Spot of Car Sharing
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Standard vehicles offer the perfect balance of earnings and demand. Popular with families, 
                  business travelers, and tourists, your comfortable sedan provides reliable monthly income.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Advantages</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Optimal price-to-demand ratio</li>
                    <li>• 18-22 booking days average</li>
                    <li>• Versatile guest appeal</li>
                    <li>• Moderate maintenance costs</li>
                    <li>• Strong repeat guest rate</li>
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Typical Earnings</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-green-600">$1,530-1,870</div>
                      <div className="text-xs text-gray-500">Monthly revenue (20 days)</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">$1,300-1,590</div>
                      <div className="text-xs text-gray-500">Your earnings after 15% commission</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Protection Details</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coverage:</span>
                      <span className="font-medium">$750K liability</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                      <span className="font-medium">$500</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Guest minimum age:</span>
                      <span className="font-medium">21+</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 dark:text-green-400 mb-3">Success Strategy for Standard Hosts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <strong>Target Premium Guests:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Focus on weekly rentals for better rates</li>
                      <li>• Highlight comfort features (leather, sunroof)</li>
                      <li>• Offer business traveler amenities</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Increase Value:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Add GPS and phone mounts</li>
                      <li>• Provide local area guides</li>
                      <li>• Maintain immaculate presentation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeVehicleTab === 'luxury' && (
          <section className="py-12 bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                  <IoDiamondOutline className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Luxury Vehicle Owner</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Premium Experiences, Premium Returns
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Luxury vehicle owners provide elevated experiences to discerning guests. Your BMW, Mercedes, or Audi 
                  attracts executives, special occasions, and travelers who value comfort and prestige.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Advantages</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Higher daily rates ($150-200)</li>
                    <li>• Quality over quantity bookings</li>
                    <li>• Professional guest demographic</li>
                    <li>• Enhanced guest vetting (25+ age)</li>
                    <li>• Premium support priority</li>
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Typical Earnings</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">$2,250-3,000</div>
                      <div className="text-xs text-gray-500">Monthly revenue (15-20 days)</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">$1,845-2,460</div>
                      <div className="text-xs text-gray-500">Your earnings after 18% commission</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Protection Details</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coverage:</span>
                      <span className="font-medium">$1M liability</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                      <span className="font-medium">$750</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Guest requirements:</span>
                      <span className="font-medium">700+ credit</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                <h3 className="font-semibold text-purple-900 dark:text-purple-400 mb-3">Luxury Host Excellence Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-900 dark:text-white">Guest Experience:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Professional photography included</li>
                      <li>• Priority placement in search</li>
                      <li>• Concierge guest support</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Vehicle Care:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Premium detailing partners</li>
                      <li>• Authorized service centers</li>
                      <li>• Paint protection coverage</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Earning Optimization:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Dynamic pricing tools</li>
                      <li>• Special event surge rates</li>
                      <li>• Corporate account access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeVehicleTab === 'premium' && (
          <section className="py-12 bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                  <IoStarOutline className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Premium Vehicle Owner</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Elite Vehicles for Distinguished Guests
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Tesla Model S, Mercedes S-Class, and BMW 7 Series owners serve the most selective clientele. 
                  Your premium vehicle commands top rates while delivering unforgettable experiences.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Advantages</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Premium rates ($250-350/day)</li>
                    <li>• Executive guest profile</li>
                    <li>• Enhanced screening (750+ credit)</li>
                    <li>• Dedicated account manager</li>
                    <li>• White-glove support</li>
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Typical Earnings</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-amber-600">$3,750-5,250</div>
                      <div className="text-xs text-gray-500">Monthly revenue (15 days)</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">$3,000-4,200</div>
                      <div className="text-xs text-gray-500">Your earnings after 20% commission</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Protection Details</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coverage:</span>
                      <span className="font-medium">$1M liability</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                      <span className="font-medium">$1,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Guest age:</span>
                      <span className="font-medium">30+ required</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl p-6">
                <h3 className="font-semibold text-amber-900 dark:text-amber-400 mb-3">Premium Host Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Exclusive Services</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                        <span>Personal account manager for all bookings</span>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                        <span>Valet pickup/delivery service included</span>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                        <span>Premium detailing between rentals</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Revenue Optimization</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                        <span>Corporate rental program access</span>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                        <span>Special event premium pricing</span>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                        <span>Multi-day booking incentives</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeVehicleTab === 'exotic' && (
          <section className="py-12 bg-gradient-to-b from-red-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full mb-4">
                  <IoRocketOutline className="w-5 h-5" />
                  <span className="text-sm font-medium">Exotic & Supercar Owner</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Lamborghini Deserves White-Glove Treatment
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  As an exotic vehicle owner, you're not just renting a car - you're providing dream experiences. 
                  Your Lamborghini, Ferrari, or McLaren requires exceptional care, and we've built a dedicated program 
                  to protect your investment while maximizing returns.
                </p>
              </div>

              {/* Exotic Protection Program */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 mb-8 text-white">
                <h3 className="text-2xl font-bold mb-6 text-center">Exotic Protection Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IoShieldCheckmarkOutline className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-2">$2M Coverage</h4>
                    <p className="text-xs opacity-90">Highest liability protection in the industry</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IoFingerPrintOutline className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-2">Elite Vetting</h4>
                    <p className="text-xs opacity-90">Background, credit, and driving history verified</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IoLocationOutline className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-2">GPS Tracking</h4>
                    <p className="text-xs opacity-90">Real-time monitoring with speed alerts</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IoCashOutline className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-2">$5K Deposits</h4>
                    <p className="text-xs opacity-90">High security deposits protect your asset</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Earnings Potential</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-3xl font-bold text-red-600">$7,500-10,000</div>
                      <div className="text-xs text-gray-500">Monthly revenue (15 days)</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-gray-900 dark:text-white">$5,850-7,800</div>
                      <div className="text-xs text-gray-500">Your earnings after 22% commission</div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Annual projection:</div>
                      <div className="text-lg font-bold text-green-600">$70,000-93,600</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Guest Requirements</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Minimum age: 30 years</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Credit score: 750+</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Valid insurance verification</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Clean driving record (5 years)</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>$5,000 security deposit</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>In-person verification</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Exclusive Services</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <IoDiamondOutline className="w-4 h-4 text-purple-500 mr-2 mt-0.5" />
                      <span>Enclosed transport available</span>
                    </li>
                    <li className="flex items-start">
                      <IoDiamondOutline className="w-4 h-4 text-purple-500 mr-2 mt-0.5" />
                      <span>Factory-certified maintenance</span>
                    </li>
                    <li className="flex items-start">
                      <IoDiamondOutline className="w-4 h-4 text-purple-500 mr-2 mt-0.5" />
                      <span>Professional photo shoots</span>
                    </li>
                    <li className="flex items-start">
                      <IoDiamondOutline className="w-4 h-4 text-purple-500 mr-2 mt-0.5" />
                      <span>Event partnership opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <IoDiamondOutline className="w-4 h-4 text-purple-500 mr-2 mt-0.5" />
                      <span>Personal account executive</span>
                    </li>
                    <li className="flex items-start">
                      <IoDiamondOutline className="w-4 h-4 text-purple-500 mr-2 mt-0.5" />
                      <span>Priority claims handling</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Exotic Owner Peace of Mind */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-4">
                  Your Lamborghini Is In Safe Hands
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Pre-Rental Process</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Professional inspection & photos</li>
                      <li>• Guest orientation session</li>
                      <li>• Speed limiter activation (optional)</li>
                      <li>• Route restrictions setting</li>
                      <li>• Emergency contact confirmation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">During Rental</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Live GPS tracking dashboard</li>
                      <li>• Speed violation alerts</li>
                      <li>• Geofence boundary monitoring</li>
                      <li>• 24/7 dedicated support line</li>
                      <li>• Immediate intervention capability</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Damage Protection:</strong> In the unlikely event of damage, our streamlined claims process 
                    ensures repairs at authorized dealerships only. Loss of use compensation continues while your vehicle 
                    is being repaired, and we handle all guest recovery efforts.
                  </p>
                </div>
              </div>

              {/* Success Tips for Exotic Owners */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Maximize Revenue</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Offer track day experiences</li>
                    <li>• Partner with luxury hotels</li>
                    <li>• Target special events</li>
                    <li>• Create video content</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Protect Your Asset</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Set strict mileage limits</li>
                    <li>• Require supercar experience</li>
                    <li>• Use valet mode settings</li>
                    <li>• Document everything</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Build Reputation</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Provide orientation videos</li>
                    <li>• Offer exclusive routes</li>
                    <li>• Create memorable experiences</li>
                    <li>• Cultivate repeat clients</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Simple, Transparent Commission
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                No complex tiers. No deductible trade-offs. Just straightforward pricing.
              </p>
            </div>

            {/* Pricing Table */}
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Vehicle Type
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Examples
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                      Our Commission
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Protection Included
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      Others Charge
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(pricingModel).map(([key, vehicle]) => (
                    <tr 
                      key={key}
                      className={`cursor-pointer transition-colors ${
                        selectedVehicle === key ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedVehicle(key)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {key}
                        </div>
                        <div className="text-xs text-gray-500">${vehicle.daily}/day average</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {vehicle.examples}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-bold text-purple-600">{vehicle.commission}%</div>
                        <div className="text-xs text-gray-500">$0 deductible</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {vehicle.coverage}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-500 line-through">{vehicle.turoAverage}%</div>
                        <div className="text-xs text-red-600">+ ${vehicle.turoDeductible} deductible</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Value Proposition */}
            <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <IoLockClosedOutline className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400">
                  What's Included in Every Commission
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">Comprehensive Insurance</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Up to $2M liability, zero deductible</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">24/7 Guest Support</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">We handle all communication</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">Professional Claims</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">48-72 hour resolution</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Earnings Calculator */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Calculate Your Professional Earnings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                See exactly how much more you'll earn with transparent pricing
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
              {/* Calculator Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Select Your Vehicle Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(pricingModel).map(([key, vehicle]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedVehicle(key)}
                        className={`p-3 rounded-lg text-sm transition ${
                          selectedVehicle === key
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-semibold capitalize">{key}</div>
                        <div className="text-xs opacity-80">${vehicle.daily}/day</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Expected Booking Days Per Month
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={monthlyBookings}
                    onChange={(e) => setMonthlyBookings(parseInt(e.target.value))}
                    className="w-full mb-2"
                  />
                  <div className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                    {monthlyBookings} days
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    Industry average: 15-20 days
                  </div>
                </div>
              </div>

              {/* Earnings Comparison Display */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* ItWhip Earnings */}
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-400">
                        Your ItWhip Earnings
                      </h3>
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                        {currentVehicle.commission}% commission
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gross Revenue:</span>
                        <span className="font-semibold">${earnings.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fee:</span>
                        <span className="text-gray-500">-${earnings.itwhipCommission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Deductible:</span>
                        <span className="font-semibold text-green-600">$0</span>
                      </div>
                      <div className="pt-3 border-t border-purple-200 dark:border-purple-700">
                        <div className="flex justify-between">
                          <span className="font-semibold">Monthly Earnings:</span>
                          <span className="text-2xl font-bold text-purple-600">
                            ${earnings.itwhipHostEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitor Comparison */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        Other Platforms
                      </h3>
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                        {currentVehicle.turoAverage}% + deductible
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gross Revenue:</span>
                        <span className="font-semibold">${earnings.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fee:</span>
                        <span className="text-red-600">-${earnings.turoCommission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Deductible Risk:</span>
                        <span className="text-red-600">-${earnings.turoDeductible}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                        <div className="flex justify-between">
                          <span className="font-semibold">Monthly Earnings:</span>
                          <span className="text-2xl font-bold text-gray-600">
                            ${earnings.turoHostEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings Highlight */}
                <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-center">
                  <div className="text-sm font-medium mb-2">Your Additional Earnings with ItWhip</div>
                  <div className="text-4xl font-bold mb-2">
                    +${earnings.monthlySavings.toLocaleString()}/month
                  </div>
                  <div className="text-sm opacity-90">
                    That's ${earnings.annualSavings.toLocaleString()} more per year including deductible savings
                  </div>
                </div>

                {/* Annual Projection */}
                <div className="mt-6 text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Projected Annual Earnings
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${earnings.annualEarnings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on {monthlyBookings} booking days per month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Services */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Enhance Your Earnings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Optional premium services to maximize your success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {premiumServices.map((service, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {service.price}
                    <span className="text-xs text-gray-500 ml-1">/{service.frequency}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {service.description}
                  </p>
                  <div className="text-xs text-green-600 font-semibold">
                    {service.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How You Get Paid - Premium Focus */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Industry-Leading Payment Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get paid faster than any other platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <IoTimerOutline className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  48-Hour Standard
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Payments processed within 48 hours of trip completion. No weekly holds or delays.
                </p>
                <div className="text-xs text-purple-600 font-semibold">
                  vs. 3-5 days elsewhere
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <IoFlashOutline className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Instant Option
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Need funds immediately? Upgrade to instant payouts and receive money in 2 hours.
                </p>
                <div className="text-xs text-purple-600 font-semibold">
                  Available 24/7/365
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <IoShieldCheckmarkOutline className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Guaranteed Payment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  We pay you regardless of guest issues. No chargebacks, no payment reversals.
                </p>
                <div className="text-xs text-purple-600 font-semibold">
                  Your money is protected
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Support */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                White-Glove Host Support
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We handle all guest communication so you can focus on what matters
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoTimeOutline className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold mb-2">Pre-Booking</h4>
                  <p className="text-sm opacity-90">
                    We qualify guests, answer questions, handle negotiations
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoCarOutline className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold mb-2">During Rental</h4>
                  <p className="text-sm opacity-90">
                    24/7 support for any issues, extensions, or emergencies
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoCheckmarkCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold mb-2">Post-Rental</h4>
                  <p className="text-sm opacity-90">
                    Claims handling, reviews, and all follow-up communication
                  </p>
                </div>
              </div>

              <div className="text-center p-4 bg-white/10 rounded-lg">
                <p className="text-lg font-semibold mb-2">
                  Your only responsibility: Keep your vehicle clean and maintained
                </p>
                <p className="text-sm opacity-90">
                  We handle everything else - that's the professional difference
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Details Section - Accurate Information */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Understanding Your Protection
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive coverage through licensed insurance partners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                  <IoCheckmarkCircle className="w-5 h-5 mr-2" />
                  What's Covered
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Liability Protection
                      </span>
                      <span className="text-xs text-gray-500 block">
                        $750K-$2M based on vehicle tier during active rentals
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Physical Damage
                      </span>
                      <span className="text-xs text-gray-500 block">
                        Actual cash value coverage with applicable deductible
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Claims Support
                      </span>
                      <span className="text-xs text-gray-500 block">
                        We manage the entire claims process for you
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Loss of Use
                      </span>
                      <span className="text-xs text-gray-500 block">
                        Compensation while vehicle is being repaired
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-amber-600 mb-4 flex items-center">
                  <IoInformationCircleOutline className="w-5 h-5 mr-2" />
                  Important to Know
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <IoArrowForwardOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Personal Insurance Required
                      </span>
                      <span className="text-xs text-gray-500 block">
                        Maintain your policy for non-rental periods
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoArrowForwardOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Deductibles Apply
                      </span>
                      <span className="text-xs text-gray-500 block">
                        $500-$2,500 based on vehicle value tier
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoArrowForwardOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Active Rental Only
                      </span>
                      <span className="text-xs text-gray-500 block">
                        Coverage applies during booked rental periods
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoArrowForwardOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Guest Screening
                      </span>
                      <span className="text-xs text-gray-500 block">
                        All renters verified through our vetting system
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                <strong>Pro Tip:</strong> Our deductibles are competitive with or better than other platforms, 
                and our commission rates are consistently lower, meaning more money in your pocket overall.
              </p>
            </div>
          </div>
        </section>

        {/* Host Success Stories */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Host Success Metrics
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Real data from our Phoenix market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Occupancy Rate
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Premium vehicles during peak season thanks to hotel partnerships
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">$2,847</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Average Monthly Earnings
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  For luxury vehicles renting 15+ days per month
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9★</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Average Guest Rating
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Hotel-verified guests provide quality experiences
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Benefits Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Maximize Your Tax Benefits
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Turn your vehicle into a tax-advantaged business
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Vehicle Expenses</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Depreciation</span>
                      <span className="font-medium">$5-15K/year</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                      <span className="font-medium">100% deductible</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                      <span className="font-medium">100% deductible</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Operating Costs</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Platform fees</span>
                      <span className="font-medium">100% deductible</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cleaning</span>
                      <span className="font-medium">$50-100/month</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Supplies</span>
                      <span className="font-medium">100% deductible</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Business Mileage</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">2024 Rate</span>
                      <span className="font-medium">$0.67/mile</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery miles</span>
                      <span className="font-medium">100% deductible</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Meeting hosts</span>
                      <span className="font-medium">100% deductible</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Average Tax Savings:</strong> $8,000-$15,000 per vehicle per year
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  *Consult with a tax professional for your specific situation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Earnings Projections - Phoenix Market */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Phoenix Seasonal Earnings Guide
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Maximize revenue by understanding local demand patterns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Peak Season */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-400">
                    Peak Season (Oct - Apr)
                  </h3>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    +40% rates
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-green-600">25-30 days/month</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Average bookings</div>
                  </div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Snowbird season drives demand</li>
                    <li>• Perfect weather attracts tourists</li>
                    <li>• Corporate travel increases</li>
                    <li>• Spring training brings fans</li>
                  </ul>
                  <div className="pt-3 border-t border-green-200 dark:border-green-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Strategy:</strong> Increase rates 30-50%, require 3-day minimums
                    </p>
                  </div>
                </div>
              </div>

              {/* Summer Season */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400">
                    Summer Season (May - Sep)
                  </h3>
                  <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded">
                    Standard rates
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-amber-600">12-18 days/month</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Average bookings</div>
                  </div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Local demand remains steady</li>
                    <li>• Business travel continues</li>
                    <li>• Weekend getaways popular</li>
                    <li>• Convention season active</li>
                  </ul>
                  <div className="pt-3 border-t border-amber-200 dark:border-amber-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Strategy:</strong> Offer weekly discounts, target locals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Events Calendar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Major Phoenix Events - Premium Pricing Opportunities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Barrett-Jackson (Jan)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Luxury/exotic demand spikes</p>
                  <p className="text-xs text-purple-600 font-semibold mt-1">+100-200% rates</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Phoenix Open (Feb)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All vehicle types in demand</p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">+75-150% rates</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Spring Training (Mar)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Month-long high demand</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">+50-100% rates</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Super Bowl (When hosted)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Extreme demand all categories</p>
                  <p className="text-xs text-red-600 font-semibold mt-1">+200-400% rates</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Final Four (When hosted)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Premium vehicle demand</p>
                  <p className="text-xs text-orange-600 font-semibold mt-1">+150-300% rates</p>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Music Festivals</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Economy/standard popular</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">+25-75% rates</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fleet Owner Section */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full mb-4">
                <IoBusinessOutline className="w-5 h-5" />
                <span className="text-sm font-medium">Fleet Owner Program</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Scale Your Car Sharing Business
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Special benefits and tools for hosts with multiple vehicles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Volume Discounts */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-6">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-4">
                  Volume Commission Discounts
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">3-5 vehicles</span>
                    <span className="font-bold text-indigo-600">-1% commission</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">6-10 vehicles</span>
                    <span className="font-bold text-indigo-600">-2% commission</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">11-20 vehicles</span>
                    <span className="font-bold text-indigo-600">-3% commission</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">20+ vehicles</span>
                    <span className="font-bold text-indigo-600">Custom pricing</span>
                  </li>
                </ul>
              </div>

              {/* Fleet Management Tools */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Fleet Management Tools
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Bulk listing management</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Cross-calendar synchronization</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Fleet performance analytics</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Automated pricing rules</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Team access management</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Maintenance scheduling</span>
                  </li>
                </ul>
              </div>

              {/* Revenue Optimization */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Revenue Optimization
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cross-promotion
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Upsell guests between your vehicles
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fleet packages
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Offer multi-vehicle deals for events
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Corporate accounts
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Direct billing for business clients
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fleet Success Metrics */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 text-center">Fleet Owner Success Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">$42K</div>
                  <div className="text-xs opacity-80">Avg monthly revenue (10 cars)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">82%</div>
                  <div className="text-xs opacity-80">Fleet utilization rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">3.2x</div>
                  <div className="text-xs opacity-80">ROI vs single vehicle</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">6mo</div>
                  <div className="text-xs opacity-80">Payback period</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Claims Examples */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Real Claims Scenarios
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Understanding exactly how claims work and what you'll pay
              </p>
            </div>

            {/* Claims Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Minor Damage */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Minor Damage Scenario</h3>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Common</span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Guest returns luxury BMW with door ding and scraped rim
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Repair estimate:</span>
                    <span className="font-medium">$1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Your deductible:</span>
                    <span className="font-medium text-red-600">$750</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Insurance covers:</span>
                    <span className="font-medium text-green-600">$450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Guest deposit applied:</span>
                    <span className="font-medium text-blue-600">$750</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Your out-of-pocket:</span>
                      <span className="text-green-600">$0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Major Accident */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Major Accident Scenario</h3>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Rare</span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Guest totals your Tesla Model S in highway accident
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Vehicle value:</span>
                    <span className="font-medium">$75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Your deductible:</span>
                    <span className="font-medium text-red-600">$1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Insurance pays:</span>
                    <span className="font-medium text-green-600">$74,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Loss of use (30 days):</span>
                    <span className="font-medium text-green-600">$7,500</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Your maximum loss:</span>
                      <span className="text-orange-600">$1,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Claims Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Typical Claims Resolution Timeline
              </h3>
              <div className="relative">
                <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-purple-200 dark:bg-purple-800"></div>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mt-1 z-10 relative"></div>
                    <div className="ml-6">
                      <div className="font-medium text-gray-900 dark:text-white">Hour 0-2</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Incident reported, photos uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mt-1 z-10 relative"></div>
                    <div className="ml-6">
                      <div className="font-medium text-gray-900 dark:text-white">Hour 2-24</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Claims team reviews, approves coverage</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mt-1 z-10 relative"></div>
                    <div className="ml-6">
                      <div className="font-medium text-gray-900 dark:text-white">Day 2-3</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Repair shop estimate, work begins</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mt-1 z-10 relative"></div>
                    <div className="ml-6">
                      <div className="font-medium text-gray-900 dark:text-white">Day 5-7</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment issued, car back in service</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Market Data */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Phoenix Market Intelligence
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Local insights to maximize your earnings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Airport vs Downtown */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Location Demand Patterns
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Sky Harbor Airport</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">70% of all bookings start here</p>
                    <p className="text-xs text-blue-600 mt-1">Best for: All vehicle types, instant bookings</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Scottsdale</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Premium vehicles dominate</p>
                    <p className="text-xs text-purple-600 mt-1">Best for: Luxury/exotic, weekly rentals</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Downtown Phoenix</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Business travelers, short trips</p>
                    <p className="text-xs text-green-600 mt-1">Best for: Standard/luxury, 1-3 day rentals</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Tempe/ASU</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Budget-conscious, weekend trips</p>
                    <p className="text-xs text-orange-600 mt-1">Best for: Economy/standard vehicles</p>
                  </div>
                </div>
              </div>

              {/* Hotel Partnerships */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Hotel Partnership Zones
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Scottsdale Resorts</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Four Seasons, Fairmont</div>
                    </div>
                    <div className="text-sm font-bold text-purple-600">45% of bookings</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Airport Hotels</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Marriott, Hilton chains</div>
                    </div>
                    <div className="text-sm font-bold text-blue-600">30% of bookings</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Downtown Business</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Westin, Sheraton</div>
                    </div>
                    <div className="text-sm font-bold text-green-600">25% of bookings</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Pro Tip:</strong> Position vehicles near partner hotels for 3x more bookings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Switch from Competitors */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8">
              <div className="text-center mb-8">
                <IoSwapHorizontalOutline className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Switching is Simple
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Moving from other platforms? We make it easy with migration support and earnings matching.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <IoRibbonOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Earnings Match</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    We'll match your best month from the last 90 days
                  </p>
                </div>
                <div className="text-center">
                  <IoGlobeOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Import Listings</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Transfer your vehicle details with one click
                  </p>
                </div>
                <div className="text-center">
                  <IoStarOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Priority Support</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dedicated onboarding specialist for smooth transition
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/switch-from-turo"
                  className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg mb-3"
                >
                  Calculate Your Savings
                </Link>
                <p className="text-xs text-gray-500">
                  Average host saves $2,400+ per year
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Professional Hosts Choose Us
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">15-22%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Simple Commission</div>
                <div className="text-xs text-gray-500">No hidden fees</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">$0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Deductible Always</div>
                <div className="text-xs text-gray-500">Full protection</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">48hr</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payment Speed</div>
                <div className="text-xs text-gray-500">Industry fastest</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Guest Support</div>
                <div className="text-xs text-gray-500">We handle it all</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Join the Professional Platform
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-8">
              Start with 0% commission for 60 days. No contracts. No hidden fees.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Link 
                href="/list-your-car"
                className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                List Your Car
              </Link>
              <Link 
                href="/schedule-demo"
                className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
              >
                See Demo
              </Link>
              <Link 
                href="/host-guide"
                className="inline-block px-6 py-3 bg-purple-800 text-white rounded-lg font-bold hover:bg-purple-900 transition"
              >
                Host Guide
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. All rights reserved.</p>
              <p className="mt-2 text-xs">
                Insurance coverage provided by licensed third-party carriers. Actual earnings vary by location, vehicle type, and market conditions.
              </p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/list-your-car" className="hover:text-gray-700 dark:hover:text-gray-300">List Your Car</Link>
                <Link href="/switch-from-turo" className="hover:text-gray-700 dark:hover:text-gray-300">Switch & Save</Link>
                <Link href="/host-guide" className="hover:text-gray-700 dark:hover:text-gray-300">Host Guide</Link>
                <Link href="/insurance" className="hover:text-gray-700 dark:hover:text-gray-300">Coverage Details</Link>
                <Link href="/support" className="hover:text-gray-700 dark:hover:text-gray-300">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}