// app/calculator/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  IoCalculatorOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoCarOutline,
  IoDiamondOutline,
  IoStarOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline
} from 'react-icons/io5'

export default function CalculatorPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [selectedVehicle, setSelectedVehicle] = useState('luxury')
  const [monthlyBookings, setMonthlyBookings] = useState(15)
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
              <IoCalculatorOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Earnings Calculator
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                Up to 90%
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/list-your-car" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                List Your Car
              </Link>
              <Link href="/host-earnings" className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                Full Earnings Guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px]">

        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Calculate Your Earnings
                <span className="block text-purple-600 mt-2">Your Insurance = Your Profit</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                See exactly how much you can earn hosting your car on ItWhip.
                Choose your insurance tier and vehicle type to get a personalized estimate.
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
            </div>
          </div>
        </section>

        {/* Interactive Earnings Calculator */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        Your ItWhip Earnings
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
                    <div className="text-sm font-medium mb-2">Your Additional Earnings with ItWhip</div>
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
                  <strong>Platform fee includes:</strong> $1M liability coverage, Mileage Forensics,
                  ESG dashboard, guest verification, 24/7 support, payment processing.
                  <Link href="/insurance-guide" className="text-purple-600 ml-1">Learn more</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Tier Details */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Understand Your Insurance Tiers
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
                  className={`relative cursor-pointer rounded-lg p-6 border-2 transition-all shadow-md ${
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

        {/* Trust Indicators */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="text-xs text-gray-500">A.R.S. 28-9601</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-8">
              List your car today and keep up to 90% of every rental.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/list-your-car"
                className="w-full sm:w-auto inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                List Your Car
              </Link>
              <Link
                href="/host-earnings"
                className="w-full sm:w-auto inline-block px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
              >
                Full Earnings Guide
              </Link>
            </div>

            <p className="text-xs text-purple-200 mt-6">
              0% platform fee for first 7 days | $1M coverage included | Cancel anytime
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
