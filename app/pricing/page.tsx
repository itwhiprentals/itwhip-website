// app/pricing/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoCarSportOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoSparklesOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoTrendingUpOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoWarningOutline,
  IoCalculatorOutline,
  IoReceiptOutline,
  IoPeopleOutline,
  IoGiftOutline,
  IoKeyOutline,
  IoCashOutline,
  IoBarChartOutline,
  IoMedalOutline,
  IoTrophyOutline,
  IoRibbonOutline,
  IoDiamondOutline,
  IoHeartOutline,
  IoSchoolOutline,
  IoSwapHorizontalOutline,
  IoTimerOutline,
  IoFingerPrintOutline,
  IoConstructOutline,
  IoAnalyticsOutline,
  IoGlobeOutline
} from 'react-icons/io5'

export default function PricingPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('rentals')
  const [selectedVehicleTier, setSelectedVehicleTier] = useState('standard')
  const [rentalDays, setRentalDays] = useState(3)
  const [showHostCommission, setShowHostCommission] = useState(false)
  const [membershipType, setMembershipType] = useState('hotel')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Vehicle tiers matching host documentation
  const vehicleTiers = {
    economy: {
      name: 'Economy',
      examples: 'Civic, Corolla, Sentra',
      dailyRate: 45,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      hostCommission: 0.15,
      insurance: 'Included - $750K liability',
      deposit: 500,
      minAge: 21,
      deliveryFee: 35
    },
    standard: {
      name: 'Standard',
      examples: 'Camry, Accord, CRV',
      dailyRate: 75,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      hostCommission: 0.15,
      insurance: 'Included - $750K liability',
      deposit: 500,
      minAge: 21,
      deliveryFee: 35
    },
    luxury: {
      name: 'Luxury',
      examples: 'BMW, Mercedes, Audi',
      dailyRate: 150,
      weeklyDiscount: 0.20,
      monthlyDiscount: 0.35,
      hostCommission: 0.18,
      insurance: 'Included - $1M liability',
      deposit: 1000,
      minAge: 25,
      deliveryFee: 50
    },
    premium: {
      name: 'Premium',
      examples: 'Tesla S/X, BMW 7, S-Class',
      dailyRate: 250,
      weeklyDiscount: 0.20,
      monthlyDiscount: 0.35,
      hostCommission: 0.20,
      insurance: 'Included - $1M liability',
      deposit: 2500,
      minAge: 30,
      deliveryFee: 75
    },
    exotic: {
      name: 'Exotic',
      examples: 'Porsche, Ferrari, Lamborghini',
      dailyRate: 500,
      weeklyDiscount: 0.25,
      monthlyDiscount: 0.40,
      hostCommission: 0.22,
      insurance: 'Included - $2M liability',
      deposit: 5000,
      minAge: 30,
      deliveryFee: 100
    }
  }

  const currentTier = vehicleTiers[selectedVehicleTier as keyof typeof vehicleTiers]
  
  // Calculate pricing based on rental days
  const calculatePrice = () => {
    const basePrice = currentTier.dailyRate * rentalDays
    let discount = 0
    
    if (rentalDays >= 30) {
      discount = currentTier.monthlyDiscount
    } else if (rentalDays >= 7) {
      discount = currentTier.weeklyDiscount
    }
    
    const discountedPrice = basePrice * (1 - discount)
    const platformFee = discountedPrice * 0.10 // 10% booking fee
    const insuranceIncluded = 0 // Insurance is included in daily rate
    const totalPrice = discountedPrice + platformFee + currentTier.deliveryFee
    
    return {
      basePrice,
      discount,
      discountAmount: basePrice * discount,
      discountedPrice,
      platformFee,
      deliveryFee: currentTier.deliveryFee,
      totalPrice,
      dailyAverage: totalPrice / rentalDays,
      hostEarnings: discountedPrice * (1 - currentTier.hostCommission),
      hostCommission: discountedPrice * currentTier.hostCommission
    }
  }

  const pricing = calculatePrice()

  // Membership benefits
  const membershipBenefits = {
    hotel: {
      name: 'Hotel Guest',
      price: 'Included with stay',
      benefits: [
        'No membership fees',
        'Priority booking',
        'Member pricing',
        'Room charging',
        'Concierge support',
        'Package deals'
      ]
    },
    monthly: {
      name: 'ItWhip Plus',
      price: '$29/month',
      benefits: [
        '10% off all rentals',
        'No delivery fees',
        'Priority support',
        'Free upgrades',
        'Cancel anytime',
        'Monthly credits'
      ]
    },
    annual: {
      name: 'ItWhip Elite',
      price: '$249/year',
      benefits: [
        '15% off all rentals',
        'No delivery fees',
        'VIP support',
        'Guaranteed upgrades',
        'Airport lounge access',
        'Exclusive vehicles'
      ]
    }
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
              <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Transparent Pricing
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                Insurance Included
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setSelectedTab('rentals')}
                className={`text-sm ${selectedTab === 'rentals' ? 'text-purple-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
              >
                Guest Pricing
              </button>
              <button 
                onClick={() => setSelectedTab('hosts')}
                className={`text-sm ${selectedTab === 'hosts' ? 'text-purple-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
              >
                Host Earnings
              </button>
              <button 
                onClick={() => setSelectedTab('insurance')}
                className={`text-sm ${selectedTab === 'insurance' ? 'text-purple-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
              >
                Protection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Mobile */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          <button 
            onClick={() => setSelectedTab('rentals')}
            className={`flex-1 py-3 text-xs font-medium ${selectedTab === 'rentals' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            Guest
          </button>
          <button 
            onClick={() => setSelectedTab('hosts')}
            className={`flex-1 py-3 text-xs font-medium ${selectedTab === 'hosts' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            Host
          </button>
          <button 
            onClick={() => setSelectedTab('insurance')}
            className={`flex-1 py-3 text-xs font-medium ${selectedTab === 'insurance' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            Protection
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[112px] pb-20">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                  All Insurance Included • No Hidden Fees • Dynamic Pricing Benefits Everyone
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Simple, Fair Pricing for Everyone
                <span className="block text-purple-600 mt-2">Guests Pay Less. Hosts Earn More.</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Our unique model leverages hotel partnerships to reduce costs for everyone. 
                No surge pricing. No insurance fees. Just transparent rates that work.
              </p>

              {/* Key Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoCashOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Save 30-50%</div>
                  <div className="text-xs text-gray-500">vs traditional rentals</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Insurance Included</div>
                  <div className="text-xs text-gray-500">Up to $2M coverage</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoGiftOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Member Benefits</div>
                  <div className="text-xs text-gray-500">Exclusive perks</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {selectedTab === 'rentals' && (
          <>
            {/* Interactive Pricing Calculator */}
            <section className="py-12 bg-white dark:bg-black">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Calculate Your Rental Cost
                </h2>

                {/* Vehicle Tier Selector */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                    Select Vehicle Type:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(vehicleTiers).map(([key, tier]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedVehicleTier(key)}
                        className={`p-3 rounded-lg transition-all ${
                          selectedVehicleTier === key
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-semibold text-sm">{tier.name}</div>
                        <div className="text-xs opacity-80">${tier.dailyRate}/day</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">{currentTier.examples}</p>
                </div>

                {/* Days Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Rental Duration:
                    </label>
                    <span className="text-lg font-bold text-purple-600">{rentalDays} days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 day</span>
                    <span>1 week (15% off)</span>
                    <span>1 month (30% off)</span>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guest Cost */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-4">
                      Your Total Cost
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Base ({rentalDays} × ${currentTier.dailyRate}):</span>
                        <span className="font-medium">${pricing.basePrice.toFixed(0)}</span>
                      </div>
                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Discount ({(pricing.discount * 100).toFixed(0)}% off):</span>
                          <span className="font-medium text-green-600">-${pricing.discountAmount.toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Platform fee (10%):</span>
                        <span className="font-medium">${pricing.platformFee.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                        <span className="font-medium">${pricing.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-semibold">Insurance:</span>
                        <span className="font-bold text-blue-600">INCLUDED</span>
                      </div>
                      <div className="pt-3 border-t border-purple-200">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total:</span>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">${pricing.totalPrice.toFixed(0)}</div>
                            <div className="text-xs text-gray-500">${pricing.dailyAverage.toFixed(0)}/day avg</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Everything Included
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {currentTier.insurance}
                          </span>
                          <span className="text-xs text-gray-500 block">Zero deductible for guests</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            24/7 Roadside Assistance
                          </span>
                          <span className="text-xs text-gray-500 block">Help always available</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${currentTier.deposit} Security Deposit
                          </span>
                          <span className="text-xs text-gray-500 block">Hold only, not charged</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Free Cancellation
                          </span>
                          <span className="text-xs text-gray-500 block">Up to 24 hours before</span>
                        </div>
                      </li>
                    </ul>

                    <button
                      onClick={() => setShowHostCommission(!showHostCommission)}
                      className="mt-4 text-xs text-purple-600 hover:text-purple-700"
                    >
                      {showHostCommission ? 'Hide' : 'Show'} host earnings →
                    </button>

                    {showHostCommission && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Host receives: <span className="font-bold">${pricing.hostEarnings.toFixed(0)}</span>
                          <br />
                          Platform fee: ${pricing.hostCommission.toFixed(0)} ({(currentTier.hostCommission * 100).toFixed(0)}%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comparison with Others */}
                <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4">
                    Compare with Traditional Rentals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Enterprise/Hertz</div>
                      <div className="text-2xl font-bold text-red-600 line-through">
                        ${(pricing.totalPrice * 1.8).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">+ Insurance $25/day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Turo Average</div>
                      <div className="text-2xl font-bold text-red-600 line-through">
                        ${(pricing.totalPrice * 1.3).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">+ Insurance varies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-purple-600">ItWhip</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${pricing.totalPrice.toFixed(0)}
                      </div>
                      <div className="text-xs text-green-600">Insurance included!</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Membership Options */}
            <section className="py-12 bg-gray-50 dark:bg-gray-950">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Membership Benefits
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(membershipBenefits).map(([key, membership]) => (
                    <div key={key} className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 ${
                      key === 'monthly' ? 'border-2 border-purple-500' : ''
                    }`}>
                      {key === 'monthly' && (
                        <div className="text-center mb-2">
                          <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                            MOST POPULAR
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {membership.name}
                      </h3>
                      <div className="text-2xl font-bold text-purple-600 mb-4">
                        {membership.price}
                      </div>
                      <ul className="space-y-2">
                        {membership.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start">
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Hotel guests automatically get member pricing. No signup needed.
                  </p>
                  <Link href="/membership" className="text-purple-600 hover:text-purple-700 font-medium">
                    Learn more about membership →
                  </Link>
                </div>
              </div>
            </section>

            {/* Why Our Pricing Works */}
            <section className="py-12 bg-white dark:bg-black">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Why We Can Offer Better Prices
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <IoBusinessOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Hotel Partnership Advantage
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our exclusive partnerships with 500+ hotels provide us with guaranteed booking volume, 
                        allowing us to negotiate better insurance rates and pass savings to both guests and hosts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <IoBarChartOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Dynamic Pricing Benefits Everyone
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our algorithm optimizes pricing based on demand, ensuring hosts maximize earnings during 
                        peak times while guests get fair rates during off-peak periods. No surge pricing games.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Bulk Insurance Purchasing Power
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        By bundling coverage for thousands of rentals, we secure commercial rates that would cost 
                        individual hosts $300-500/month. This saving is built into our simple commission structure.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <IoPeopleOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Pre-Verified Guest Network
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Hotel guests are already verified with credit cards on file, reducing fraud and claims by 
                        70% compared to peer-to-peer platforms. Lower risk = lower costs = better prices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedTab === 'hosts' && (
          <>
            {/* Host Earnings Section */}
            <section className="py-12 bg-white dark:bg-black">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Host Commission Structure
                </h2>

                <div className="overflow-x-auto mb-8">
                  <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Vehicle Tier
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          Commission
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-purple-600">
                          You Keep
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          Insurance Value
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">Economy</div>
                          <div className="text-xs text-gray-500">Civic, Corolla</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">15%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">85%</td>
                        <td className="px-4 py-4 text-center text-sm">$300/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">85% + $300</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">Standard</div>
                          <div className="text-xs text-gray-500">Camry, Accord</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">15%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">85%</td>
                        <td className="px-4 py-4 text-center text-sm">$350/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">85% + $350</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">Luxury</div>
                          <div className="text-xs text-gray-500">BMW, Mercedes</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">18%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">82%</td>
                        <td className="px-4 py-4 text-center text-sm">$450/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">82% + $450</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">Premium</div>
                          <div className="text-xs text-gray-500">Tesla S/X, S-Class</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">20%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">80%</td>
                        <td className="px-4 py-4 text-center text-sm">$550/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">80% + $550</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">Exotic</div>
                          <div className="text-xs text-gray-500">Ferrari, Lamborghini</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">22%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">78%</td>
                        <td className="px-4 py-4 text-center text-sm">$800/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">78% + $800</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Host Tier Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                    <IoMedalOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">New Host</h4>
                    <p className="text-xs text-gray-500 mb-2">0-10 trips</p>
                    <p className="text-sm font-bold text-purple-600">Standard rates</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                    <IoRibbonOutline className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Silver Host</h4>
                    <p className="text-xs text-gray-500 mb-2">10+ trips</p>
                    <p className="text-sm font-bold text-purple-600">-1% commission</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                    <IoDiamondOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Gold Host</h4>
                    <p className="text-xs text-gray-500 mb-2">25+ trips</p>
                    <p className="text-sm font-bold text-purple-600">-2% commission</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                    <IoTrophyOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Platinum</h4>
                    <p className="text-xs text-gray-500 mb-2">50+ trips</p>
                    <p className="text-sm font-bold text-purple-600">-3% commission</p>
                  </div>
                </div>

                {/* Fleet Owner Benefits */}
                <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4 text-center">Fleet Owner Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold mb-1">3-5 vehicles</div>
                      <div className="text-sm opacity-90">Additional 1% off commission</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold mb-1">6-10 vehicles</div>
                      <div className="text-sm opacity-90">Additional 2% off commission</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold mb-1">10+ vehicles</div>
                      <div className="text-sm opacity-90">Custom pricing available</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedTab === 'insurance' && (
          <>
            {/* Insurance & Protection Details */}
            <section className="py-12 bg-white dark:bg-black">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Comprehensive Protection Included
                </h2>

                {/* Coverage by Tier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="text-center mb-4">
                      <IoShieldCheckmarkOutline className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Economy/Standard</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Liability:</span>
                        <span className="font-medium">$750K</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                        <span className="font-medium">$500</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Guest age:</span>
                        <span className="font-medium">21+</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monthly value:</span>
                        <span className="font-medium text-green-600">$300-350</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-2 border-purple-500">
                    <div className="text-center mb-4">
                      <IoShieldCheckmarkOutline className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Luxury/Premium</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Liability:</span>
                        <span className="font-medium">$1M</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                        <span className="font-medium">$750-1000</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Guest age:</span>
                        <span className="font-medium">25-30+</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monthly value:</span>
                        <span className="font-medium text-green-600">$450-550</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="text-center mb-4">
                      <IoShieldCheckmarkOutline className="w-12 h-12 text-red-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Exotic</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Liability:</span>
                        <span className="font-medium">$2M</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                        <span className="font-medium">$2,500</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Guest age:</span>
                        <span className="font-medium">30+, verified</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monthly value:</span>
                        <span className="font-medium text-green-600">$800+</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* What's Covered */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 dark:text-green-400 mb-4 flex items-center">
                      <IoCheckmarkCircle className="w-5 h-5 mr-2" />
                      What's Covered
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Third-party liability (up to $2M)</li>
                      <li>• Physical damage protection</li>
                      <li>• Theft protection</li>
                      <li>• 24/7 roadside assistance</li>
                      <li>• Medical payments coverage</li>
                      <li>• Uninsured motorist protection</li>
                      <li>• Legal defense costs</li>
                      <li>• Loss of use compensation (hosts)</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-400 mb-4 flex items-center">
                      <IoWarningOutline className="w-5 h-5 mr-2" />
                      Not Covered
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Mechanical breakdown</li>
                      <li>• Normal wear and tear</li>
                      <li>• Personal belongings</li>
                      <li>• Intentional damage</li>
                      <li>• DUI/illegal activities</li>
                      <li>• Off-road damage</li>
                      <li>• Racing or speed contests</li>
                      <li>• Commercial use beyond ItWhip</li>
                    </ul>
                  </div>
                </div>

                {/* Claims Process */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4">
                    48-72 Hour Claims Resolution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">1</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Report incident</p>
                      <p className="text-xs text-gray-500">24/7 hotline</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">2</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Document damage</p>
                      <p className="text-xs text-gray-500">Upload photos</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">3</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Get approval</p>
                      <p className="text-xs text-gray-500">Within 24hrs</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">4</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Receive payment</p>
                      <p className="text-xs text-gray-500">48-72hrs total</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Why This Works Section */}
        <section className="py-12 bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              The ItWhip Advantage: Everyone Wins
            </h2>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-purple-600 mb-3 flex items-center">
                  <IoPeopleOutline className="w-5 h-5 mr-2" />
                  For Guests
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Save 30-50% vs traditional rentals with insurance included</li>
                  <li>• No surge pricing - ever</li>
                  <li>• Hotel partnership benefits and room charging</li>
                  <li>• 24/7 support and roadside assistance</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-purple-600 mb-3 flex items-center">
                  <IoCarSportOutline className="w-5 h-5 mr-2" />
                  For Hosts
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Keep 78-85% of revenue (more with tier benefits)</li>
                  <li>• Save $300-800/month on commercial insurance</li>
                  <li>• Access to pre-verified hotel guests</li>
                  <li>• 48-hour payments and professional tools included</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-purple-600 mb-3 flex items-center">
                  <IoBusinessOutline className="w-5 h-5 mr-2" />
                  For Hotels
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Enhanced guest experience with transportation</li>
                  <li>• Additional revenue stream through partnerships</li>
                  <li>• Differentiation from competitors</li>
                  <li>• No operational overhead or fleet management</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience the Difference
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              Fair pricing. Complete protection. Better for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/rentals"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                Book a Car
              </Link>
              <Link 
                href="/list-your-car"
                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
              >
                List Your Car
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-4">
                Insurance provided through licensed third-party carriers. Coverage amounts and deductibles vary by vehicle tier. 
                All prices in USD. Discounts apply to rentals of 7+ and 30+ days. Host earnings after commission. 
                Hotel partnerships provide volume discounts passed to all users.
              </p>
              <div className="space-x-4">
                <Link href="/insurance-details" className="hover:text-purple-600">Full Insurance Details</Link>
                <Link href="/host-agreement" className="hover:text-purple-600">Host Agreement</Link>
                <Link href="/terms" className="hover:text-purple-600">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}