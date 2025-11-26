// app/switch-from-turo/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoSwapHorizontalOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoFlashOutline,
  IoCarOutline,
  IoCalculatorOutline,
  IoTrendingUpOutline,
  IoGlobeOutline,
  IoSpeedometerOutline,
  IoLeafOutline,
  IoRibbonOutline,
  IoStarOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoLayersOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function SwitchFromTuroPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [monthlyRevenue, setMonthlyRevenue] = useState(2000)

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Insurance tiers
  const insuranceTiers = [
    { id: 'basic', name: 'Platform Coverage', percentage: 40, color: 'gray' },
    { id: 'standard', name: 'P2P Coverage', percentage: 75, color: 'amber', popular: true },
    { id: 'premium', name: 'Commercial Coverage', percentage: 90, color: 'emerald' }
  ]

  const currentTier = insuranceTiers.find(t => t.id === selectedTier) || insuranceTiers[1]

  // Calculate savings
  const calculateSavings = () => {
    const turoPercentage = 0.65 // Turo hosts typically keep ~65%
    const itwhipPercentage = currentTier.percentage / 100

    const turoEarnings = monthlyRevenue * turoPercentage
    const itwhipEarnings = monthlyRevenue * itwhipPercentage
    const monthlySavings = itwhipEarnings - turoEarnings
    const annualSavings = monthlySavings * 12

    return {
      turoEarnings: Math.round(turoEarnings),
      itwhipEarnings: Math.round(itwhipEarnings),
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings)
    }
  }

  const savings = calculateSavings()

  // Comparison data
  const comparisonFeatures = [
    {
      feature: 'Host Earnings',
      itwhip: 'Up to 90%',
      turo: '60-85%',
      itwhipWins: true,
      note: 'Based on insurance tier'
    },
    {
      feature: 'Liability Coverage',
      itwhip: '$1M (all tiers)',
      turo: '$750K',
      itwhipWins: true,
      note: 'Higher protection'
    },
    {
      feature: 'Payment Speed',
      itwhip: '48 hours',
      turo: '3-5 days',
      itwhipWins: true,
      note: 'Industry fastest'
    },
    {
      feature: 'Deductible Options',
      itwhip: '$1,000-$2,500',
      turo: '$250-$2,500',
      itwhipWins: false,
      note: 'Varies by plan'
    },
    {
      feature: 'Mileage Tracking',
      itwhip: 'Mileage Forensics™',
      turo: 'Basic odometer',
      itwhipWins: true,
      note: 'GPS-verified trips'
    },
    {
      feature: 'ESG Dashboard',
      itwhip: '✓ Included',
      turo: '✗ Not available',
      itwhipWins: true,
      note: 'Track environmental impact'
    },
    {
      feature: 'Arizona P2P Compliant',
      itwhip: '✓ A.R.S. § 28-9601',
      turo: '✓ Compliant',
      itwhipWins: null,
      note: 'Both compliant'
    },
    {
      feature: 'Fleet Tools',
      itwhip: '✓ Built-in',
      turo: '✓ Available',
      itwhipWins: null,
      note: 'Multi-vehicle management'
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
              <IoSwapHorizontalOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Switch & Save
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded-lg">
                Save $2,400+/year
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host-earnings" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Earnings Calculator
              </Link>
              <Link 
                href="/list-your-car"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                Start Earning →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px]">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6">
                <IoSparklesOutline className="w-5 h-5 text-white" />
                <span className="text-sm text-white font-medium">
                  Arizona's Highest-Paying P2P Platform
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Switch from Turo.
                <span className="block text-green-600 mt-2">Keep Up to 90% of Your Earnings.</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Phoenix • Scottsdale • Tempe • Mesa • Chandler
              </p>
              
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Same guests. Same cars. More money in your pocket. 
                ITWhip's insurance-based tier system lets you keep up to 90% — 
                compared to Turo's typical 60-85%.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">+25%</div>
                  <div className="text-xs text-gray-500">More Earnings</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">$1M</div>
                  <div className="text-xs text-gray-500">Liability Coverage</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">48hr</div>
                  <div className="text-xs text-gray-500">Faster Payments</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/list-your-car"
                  className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
                >
                  Switch Now — Keep More →
                </Link>
                <a 
                  href="#calculator"
                  className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-green-600 rounded-lg font-bold hover:bg-green-50 transition border-2 border-green-600"
                >
                  Calculate My Savings
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                ITWhip vs Turo: Side-by-Side
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                See exactly how we compare on what matters most to hosts
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                      ITWhip
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      Turo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className={item.itwhipWins ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.feature}
                        </div>
                        <div className="text-xs text-gray-500">{item.note}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-semibold ${item.itwhipWins ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                          {item.itwhip}
                        </span>
                        {item.itwhipWins && (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 inline ml-1" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-500">
                          {item.turo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              *Comparison based on publicly available Turo terms as of November 2025. Actual rates may vary.
            </p>
          </div>
        </section>

        {/* Savings Calculator */}
        <section id="calculator" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Calculate Your Savings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                See how much more you'd earn on ITWhip
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 sm:p-8">
              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Monthly Revenue */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Your Current Monthly Revenue (Gross)
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="100"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(parseInt(e.target.value))}
                    className="w-full mb-2"
                  />
                  <div className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                    ${monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-center text-xs text-gray-500">per month gross revenue</div>
                </div>

                {/* Tier Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Your ITWhip Insurance Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {insuranceTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                        className={`relative p-3 rounded-lg text-center transition ${
                          selectedTier === tier.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {tier.popular && selectedTier !== tier.id && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            POPULAR
                          </div>
                        )}
                        <div className="font-bold">{tier.percentage}%</div>
                        <div className="text-xs opacity-80">{tier.id === 'basic' ? 'Platform' : tier.id === 'standard' ? 'P2P' : 'Commercial'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Turo */}
                  <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      On Turo (~65%)
                    </h3>
                    <div className="text-3xl font-bold text-gray-600">
                      ${savings.turoEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">monthly earnings</div>
                  </div>

                  {/* ITWhip */}
                  <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
                    <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">
                      On ITWhip ({currentTier.percentage}%)
                    </h3>
                    <div className="text-3xl font-bold text-green-600">
                      ${savings.itwhipEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">monthly earnings</div>
                  </div>
                </div>

                {/* Savings Highlight */}
                {savings.monthlySavings > 0 && (
                  <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white text-center">
                    <div className="text-sm font-medium mb-2">Your Annual Savings with ITWhip</div>
                    <div className="text-4xl font-bold mb-2">
                      +${savings.annualSavings.toLocaleString()}/year
                    </div>
                    <div className="text-sm opacity-90">
                      That's ${savings.monthlySavings.toLocaleString()} more every month
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <Link 
                  href="/list-your-car"
                  className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
                >
                  Start Earning More Today →
                </Link>
                <p className="text-xs text-gray-500 mt-3">
                  Free to list • 0% fee for first 7 days • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Hosts Switch */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Hosts Are Switching
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Real benefits that make a real difference
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Benefit 1 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4">
                  <IoCashOutline className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Higher Earnings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep up to 90% with commercial insurance vs Turo's max 85%. 
                  That's thousands more annually.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
                  <IoFlashOutline className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Faster Payments
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get paid in 48 hours, not 3-5 days. Better cash flow means 
                  a better business.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
                  <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  $1M Coverage
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Higher liability protection on every tier. 
                  Your vehicle is better protected.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-fit mb-4">
                  <IoSpeedometerOutline className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Mileage Forensics™
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  GPS-verified trip data eliminates disputes. 
                  Know exactly how your car is used.
                </p>
              </div>

              {/* Benefit 5 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit mb-4">
                  <IoLeafOutline className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ESG Dashboard
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your environmental impact. Stand out with 
                  sustainability-conscious guests.
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                  <IoLayersOutline className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  You Choose Your Tier
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bring your own insurance, keep more earnings. 
                  No complex protection plans to navigate.
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
                  ITWhip operates under Arizona's peer-to-peer car sharing legislation 
                  (A.R.S. § 28-9601 through 28-9613). Same legal protections as Turo, 
                  with better earnings for you.
                </p>
                <Link href="/legal" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-medium mt-2">
                  View full Arizona law text →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How to Switch */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Switch in 3 Easy Steps
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We make the transition seamless
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Create Your Listing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import your vehicle details in minutes. We'll help optimize your listing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Choose Your Tier
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select 40%, 75%, or 90% based on the insurance you bring.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Start Earning More
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Go live and keep more of every booking. Get paid in 48 hours.
                </p>
              </div>
            </div>

            {/* Earnings Match Offer */}
            <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white text-center">
              <IoRibbonOutline className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Earnings Match Guarantee</h3>
              <p className="text-sm opacity-90 mb-4">
                We'll match your best month from the last 90 days on Turo. 
                Switch risk-free.
              </p>
              <Link 
                href="/list-your-car"
                className="inline-block px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                Claim Your Match →
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Keep More of Your Earnings?
            </h2>
            <p className="text-lg text-green-100 mb-8">
              Switch today. Earn up to 90%. Get paid in 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/list-your-car"
                className="w-full sm:w-auto px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition shadow-lg"
              >
                Switch Now →
              </Link>
              <Link 
                href="/host-earnings"
                className="w-full sm:w-auto px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-400 transition"
              >
                Earnings Calculator
              </Link>
            </div>
            
            <p className="text-xs text-green-200 mt-6">
              Free to list • 0% fee for first 7 days • $1M coverage • Cancel anytime
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}