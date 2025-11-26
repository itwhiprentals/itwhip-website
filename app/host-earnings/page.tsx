// app/host-earnings/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
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
  IoLocationOutline,
  IoLayersOutline
} from 'react-icons/io5'

export default function HostEarningsPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [selectedVehicle, setSelectedVehicle] = useState('luxury')
  const [monthlyBookings, setMonthlyBookings] = useState(15)
  const [activeVehicleTab, setActiveVehicleTab] = useState('luxury')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Insurance-based tier system (matches list-your-car and host-benefits)
  const insuranceTiers = [
    {
      id: 'basic',
      name: 'PLATFORM COVERAGE',
      percentage: 40,
      platformFee: 60,
      color: 'gray',
      insurance: 'We Provide Insurance',
      deductible: '$2,500',
      description: 'No insurance needed. Platform provides all coverage.',
      best: 'New hosts, occasional renters'
    },
    {
      id: 'standard',
      name: 'P2P COVERAGE',
      percentage: 75,
      platformFee: 25,
      color: 'amber',
      insurance: 'You Bring P2P Insurance',
      deductible: '$1,500',
      description: 'Bring peer-to-peer insurance (State Farm, etc).',
      best: 'Active hosts with P2P policies',
      popular: true
    },
    {
      id: 'premium',
      name: 'COMMERCIAL COVERAGE',
      percentage: 90,
      platformFee: 10,
      color: 'emerald',
      insurance: 'You Bring Commercial Insurance',
      deductible: '$1,000',
      description: 'Bring commercial auto insurance.',
      best: 'Fleet operators, serious hosts'
    }
  ]

  // Vehicle categories for earnings estimation
  const vehicleCategories = [
    { id: 'economy', name: 'Economy', examples: 'Civic, Corolla, Sentra', avgDaily: 55, color: 'blue' },
    { id: 'standard', name: 'Standard', examples: 'Camry, Accord, CRV', avgDaily: 85, color: 'green' },
    { id: 'luxury', name: 'Luxury', examples: 'BMW 3, Mercedes C, Audi A4', avgDaily: 150, color: 'purple' },
    { id: 'premium', name: 'Premium', examples: 'Tesla S, Mercedes S, BMW 7', avgDaily: 250, color: 'amber' },
    { id: 'exotic', name: 'Exotic', examples: 'Lamborghini, Ferrari, McLaren', avgDaily: 500, color: 'red' }
  ]

  const currentTier = insuranceTiers.find(t => t.id === selectedTier) || insuranceTiers[1]
  const currentVehicle = vehicleCategories.find(v => v.id === selectedVehicle) || vehicleCategories[2]

  // Calculate earnings based on insurance tier
  const calculateEarnings = () => {
    const dailyRate = currentVehicle.avgDaily
    const totalRevenue = dailyRate * monthlyBookings
    const hostPercentage = currentTier.percentage / 100
    const hostEarnings = totalRevenue * hostPercentage
    const platformFee = totalRevenue - hostEarnings
    const annualEarnings = hostEarnings * 12
    const taxSavings = 8000

    // Competitor comparison (typical platform)
    const competitorPercentage = 0.65 // 65% typical
    const competitorEarnings = totalRevenue * competitorPercentage
    const monthlySavings = hostEarnings - competitorEarnings
    const annualSavings = monthlySavings * 12

    return {
      dailyRate,
      totalRevenue,
      hostEarnings: Math.round(hostEarnings),
      platformFee: Math.round(platformFee),
      annualEarnings: Math.round(annualEarnings),
      totalBenefit: Math.round(annualEarnings + taxSavings),
      competitorEarnings: Math.round(competitorEarnings),
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings)
    }
  }

  const earnings = calculateEarnings()

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
                Host Earnings
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                Up to 90%
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
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px]">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Launch Special Badge */}
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full mb-4 sm:mb-6">
                <IoSparklesOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-xs sm:text-sm text-white font-medium">
                  Limited Time: 0% Platform Fee for 7 Days
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Earn Up to 90% of Every Rental
                <span className="block text-purple-600 mt-2">Your Insurance Tier = Your Earnings</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto">
                Phoenix • Scottsdale • Tempe • Mesa • Chandler
              </p>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Choose your insurance tier. Keep 40-90% of earnings. $1M liability on every rental.
                Arizona's highest-paying P2P car sharing platform.
              </p>

              {/* Tier Quick Reference */}
              <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto mb-8">
                {insuranceTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                    className={`relative rounded-lg p-3 text-center transition-all ${
                      selectedTier === tier.id
                        ? tier.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500'
                        : tier.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-400'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        POPULAR
                      </div>
                    )}
                    <div className={`text-2xl font-black ${
                      tier.color === 'emerald' ? 'text-emerald-600'
                      : tier.color === 'amber' ? 'text-amber-600'
                      : 'text-gray-600'
                    }`}>
                      {tier.percentage}%
                    </div>
                    <div className="text-[10px] font-semibold text-gray-500">{tier.name}</div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/list-your-car"
                  className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
                >
                  Start Earning Today →
                </Link>
                <Link 
                  href="/insurance-guide"
                  className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition border-2 border-purple-600"
                >
                  Learn About Tiers
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Tier Earnings Section */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Your Earnings by Insurance Tier
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Bring your own insurance, keep more earnings. Simple as that.
              </p>
            </div>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {insuranceTiers.map((tier) => (
                <div 
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                  className={`relative cursor-pointer rounded-lg p-6 border-2 transition-all ${
                    selectedTier === tier.id
                      ? tier.color === 'emerald' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-lg'
                        : tier.color === 'amber'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-lg'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-400 shadow-lg'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className={`text-sm font-bold mb-2 ${
                    tier.color === 'emerald' ? 'text-emerald-600'
                    : tier.color === 'amber' ? 'text-amber-600'
                    : 'text-gray-600'
                  }`}>
                    {tier.name}
                  </div>
                  <div className={`text-5xl font-black mb-2 ${
                    tier.color === 'emerald' ? 'text-emerald-600'
                    : tier.color === 'amber' ? 'text-amber-600'
                    : 'text-gray-600'
                  }`}>
                    {tier.percentage}%
                  </div>
                  <div className="text-sm text-gray-500 mb-3">You Keep</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {tier.insurance}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {tier.description}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deductible:</span>
                      <span className="font-medium">{tier.deductible}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Liability:</span>
                      <span className="font-medium">$1M</span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">Best for:</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{tier.best}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link 
                href="/insurance-guide"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                Full insurance guide with coverage details
                <IoArrowForwardOutline className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Vehicle Type Navigation Tabs */}
        <section className="py-8 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select Your Vehicle Category
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get personalized earnings estimates for your vehicle type
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {vehicleCategories.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => {setActiveVehicleTab(vehicle.id); setSelectedVehicle(vehicle.id)}}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeVehicleTab === vehicle.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {vehicle.id === 'exotic' ? (
                    <IoRocketOutline className="inline w-4 h-4 mr-1" />
                  ) : vehicle.id === 'premium' ? (
                    <IoStarOutline className="inline w-4 h-4 mr-1" />
                  ) : vehicle.id === 'luxury' ? (
                    <IoDiamondOutline className="inline w-4 h-4 mr-1" />
                  ) : (
                    <IoCarOutline className="inline w-4 h-4 mr-1" />
                  )}
                  {vehicle.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Earnings Calculator */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Calculate Your Earnings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                See exactly how much you'll earn with your insurance tier
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg p-6 sm:p-8">
              {/* Calculator Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Insurance Tier Selector */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    1. Your Insurance Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {insuranceTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                        className={`p-3 rounded-lg text-sm transition ${
                          selectedTier === tier.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-bold">{tier.percentage}%</div>
                        <div className="text-xs opacity-80">{tier.id === 'basic' ? 'Platform' : tier.id === 'standard' ? 'P2P' : 'Commercial'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Type Selector */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    2. Your Vehicle Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicleCategories.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle.id)}
                        className={`p-3 rounded-lg text-sm transition ${
                          selectedVehicle === vehicle.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-semibold">{vehicle.name}</div>
                        <div className="text-xs opacity-80">${vehicle.avgDaily}/day</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Days Slider */}
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  3. Expected Booking Days Per Month
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

              {/* Earnings Display */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Your Earnings */}
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-400">
                        Your ITWhip Earnings
                      </h3>
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-lg">
                        {currentTier.percentage}% tier
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gross Revenue:</span>
                        <span className="font-semibold">${earnings.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fee ({currentTier.platformFee}%):</span>
                        <span className="text-gray-500">-${earnings.platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Deductible (if claim):</span>
                        <span className="font-medium">{currentTier.deductible}</span>
                      </div>
                      <div className="pt-3 border-t border-purple-200 dark:border-purple-700">
                        <div className="flex justify-between">
                          <span className="font-semibold">Monthly Earnings:</span>
                          <span className="text-2xl font-bold text-purple-600">
                            ${earnings.hostEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitor Comparison */}
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        Traditional Platforms
                      </h3>
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-lg">
                        ~65% typical
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gross Revenue:</span>
                        <span className="font-semibold">${earnings.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fee (~35%):</span>
                        <span className="text-red-600">-${(earnings.totalRevenue - earnings.competitorEarnings).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">High deductibles:</span>
                        <span className="text-red-600">$2,500+</span>
                      </div>
                      <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                        <div className="flex justify-between">
                          <span className="font-semibold">Monthly Earnings:</span>
                          <span className="text-2xl font-bold text-gray-600">
                            ${earnings.competitorEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings Highlight */}
                {earnings.monthlySavings > 0 && (
                  <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-center">
                    <div className="text-sm font-medium mb-2">Your Additional Earnings with ITWhip</div>
                    <div className="text-4xl font-bold mb-2">
                      +${earnings.monthlySavings.toLocaleString()}/month
                    </div>
                    <div className="text-sm opacity-90">
                      That's ${earnings.annualSavings.toLocaleString()} more per year
                    </div>
                  </div>
                )}

                {/* Annual Projection */}
                <div className="mt-6 text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Projected Annual Earnings + Tax Savings
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${earnings.totalBenefit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on {monthlyBookings} days/month + ~$8K estimated tax deductions
                  </div>
                </div>
              </div>

              {/* Platform Features Note */}
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  <strong>Platform fee includes:</strong> $1M liability coverage, Mileage Forensics™, 
                  ESG dashboard, guest verification, 24/7 support, payment processing. 
                  <Link href="/insurance-guide" className="text-purple-600 ml-1">Learn more →</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Arizona Compliance */}
        <section className="py-8 bg-amber-50 dark:bg-amber-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <IoGlobeOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">
                  Arizona P2P Car Sharing Compliant
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ITWhip operates under Arizona's peer-to-peer car sharing legislation (A.R.S. § 28-9601 through 28-9613). 
                  Proper insurance coverage, liability protections, and full compliance with Arizona motor vehicle requirements.
                </p>
                <Link href="/legal" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-medium mt-2">
                  View full Arizona law text →
                </Link>
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
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 hover:shadow-lg transition">
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

        {/* How You Get Paid */}
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
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoTimerOutline className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  48-Hour Standard
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Payments processed within 48 hours of trip completion. No weekly holds.
                </p>
                <div className="text-xs text-purple-600 font-semibold">
                  vs. 3-5 days elsewhere
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
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

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoShieldCheckmarkOutline className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Guaranteed Payment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  We pay you regardless of guest issues. No chargebacks, no reversals.
                </p>
                <div className="text-xs text-purple-600 font-semibold">
                  Your money is protected
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
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-4">
                  Volume Benefits
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">3-5 vehicles</span>
                    <span className="font-bold text-indigo-600">Priority support</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">6-10 vehicles</span>
                    <span className="font-bold text-indigo-600">Dedicated manager</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">11-20 vehicles</span>
                    <span className="font-bold text-indigo-600">API access</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">20+ vehicles</span>
                    <span className="font-bold text-indigo-600">Custom terms</span>
                  </li>
                </ul>
              </div>

              {/* Fleet Management Tools */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
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
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Revenue Optimization
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mileage Forensics™
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      GPS-verified trips protect your fleet
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ESG Dashboard
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Track environmental impact across fleet
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Smart Pricing
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Dynamic rates based on demand
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/mileage-forensics" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    Learn about Mileage Forensics™ →
                  </Link>
                </div>
              </div>
            </div>

            {/* Fleet Success Metrics */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white">
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

        {/* Tax Benefits Section */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Maximize Your Tax Benefits
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Turn your vehicle into a tax-advantaged business
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
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
                      <span className="text-gray-600 dark:text-gray-400">Meeting guests</span>
                      <span className="font-medium">100% deductible</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Average Tax Savings:</strong> $8,000-$25,000 per vehicle per year
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  *Consult with a tax professional for your specific situation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Phoenix Market Data */}
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
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-400">
                    Peak Season (Oct - Apr)
                  </h3>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg">
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
                    <li>• Business travel increases</li>
                    <li>• Spring training brings fans</li>
                  </ul>
                </div>
              </div>

              {/* Summer Season */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400">
                    Summer Season (May - Sep)
                  </h3>
                  <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-lg">
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
                </div>
              </div>
            </div>

            {/* Special Events */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
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
              </div>
            </div>
          </div>
        </section>

        {/* Switch from Competitors */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
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
                    Dedicated onboarding specialist
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/switch-from-turo"
                  className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg mb-3"
                >
                  Calculate Your Savings →
                </Link>
                <p className="text-xs text-gray-500">
                  Average host saves $2,400+ per year
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Hosts Choose ITWhip
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">40-90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Host Earnings</div>
                <div className="text-xs text-gray-500">Based on your tier</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">$1M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Liability Coverage</div>
                <div className="text-xs text-gray-500">Every rental</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">48hr</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payment Speed</div>
                <div className="text-xs text-gray-500">Industry fastest</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">AZ</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">P2P Compliant</div>
                <div className="text-xs text-gray-500">A.R.S. § 28-9601</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Start Earning Up to 90% Today
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-8">
              Choose your insurance tier. List your car. Get paid in 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/list-your-car"
                className="w-full sm:w-auto inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                List Your Car →
              </Link>
              <Link 
                href="/insurance-guide"
                className="w-full sm:w-auto inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
              >
                Insurance Guide
              </Link>
            </div>
            
            <p className="text-xs text-purple-200 mt-6">
              0% platform fee for first 7 days • $1M coverage included • Cancel anytime
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}