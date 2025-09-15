// app/private-club/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoCheckmarkCircle,
  IoLockClosedOutline,
  IoRibbonOutline,
  IoTrophyOutline,
  IoStarOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoHomeOutline,
  IoDiamondOutline,
  IoPeopleOutline,
  IoTicketOutline,
  IoWalletOutline,
  IoFlashOutline,
  IoCalculatorOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoTimerOutline,
  IoCashOutline,
  IoReceiptOutline,
  IoTrendingUpOutline,
  IoSwapHorizontalOutline,
  IoBarChartOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export default function PrivateClubPage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState('standard')
  const [rentalDays, setRentalDays] = useState(3)
  const [showCalculator, setShowCalculator] = useState(true)
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Pricing data
  const vehiclePricing = {
    economy: {
      daily: 60,
      insurance: 25,
      turoDaily: 55,
      turoInsurance: 30,
      hertzDaily: 89,
      hertzInsurance: 35,
      commission: 15
    },
    standard: {
      daily: 110,
      insurance: 30,
      turoDaily: 100,
      turoInsurance: 35,
      hertzDaily: 145,
      hertzInsurance: 40,
      commission: 15
    },
    luxury: {
      daily: 200,
      insurance: 40,
      turoDaily: 185,
      turoInsurance: 50,
      hertzDaily: 289,
      hertzInsurance: 55,
      commission: 18
    },
    exotic: {
      daily: 600,
      insurance: 100,
      turoDaily: 550,
      turoInsurance: 150,
      hertzDaily: 0, // Not available
      hertzInsurance: 0,
      commission: 22
    }
  }

  const calculatePricing = () => {
    const vehicle = vehiclePricing[selectedVehicle as keyof typeof vehiclePricing]
    const basePrice = vehicle.daily * rentalDays
    
    // Week discount
    const weekDiscount = rentalDays >= 7 ? 0.15 : 0
    const monthDiscount = rentalDays >= 30 ? 0.30 : 0
    const discount = monthDiscount || weekDiscount
    
    // ItWhip pricing
    const discountedPrice = basePrice * (1 - discount)
    const platformFee = discountedPrice * (vehicle.commission / 100)
    const itwhipTotal = discountedPrice + platformFee // Insurance included
    const memberPrice = itwhipTotal * 0.85 // 15% member discount
    
    // Turo pricing
    const turoBase = vehicle.turoDaily * rentalDays
    const turoInsurance = vehicle.turoInsurance * rentalDays
    const turoServiceFee = turoBase * 0.15 // 15% service fee
    const turoTotal = turoBase + turoInsurance + turoServiceFee
    
    // Hertz pricing
    const hertzBase = vehicle.hertzDaily * rentalDays
    const hertzInsurance = vehicle.hertzInsurance * rentalDays
    const hertzTaxes = hertzBase * 0.25 // Average taxes and fees
    const hertzTotal = vehicle.hertzDaily > 0 ? hertzBase + hertzInsurance + hertzTaxes : 0
    
    return {
      basePrice,
      discount,
      discountedPrice,
      platformFee,
      itwhipTotal,
      memberPrice,
      turoTotal,
      hertzTotal,
      savings: {
        vsTuro: turoTotal - memberPrice,
        vsHertz: hertzTotal > 0 ? hertzTotal - memberPrice : 0
      },
      hostEarnings: discountedPrice - platformFee
    }
  }

  const pricing = calculatePricing()

  const membershipBenefits = [
    {
      icon: IoWalletOutline,
      title: 'Everything Included, No Surprises',
      description: 'The price you see includes insurance, all fees, and 24/7 support. No hidden charges ever.',
      highlight: true
    },
    {
      icon: IoFlashOutline,
      title: 'Zero Surge Pricing',
      description: 'Same rates during Super Bowl, New Year\'s Eve, or any high-demand period. Members are protected.',
      highlight: true
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Guaranteed Bookings',
      description: 'Hosts cannot cancel on members. Your reservation is guaranteed at the price you booked.',
      highlight: false
    },
    {
      icon: IoTimerOutline,
      title: '48-Hour Claims Resolution',
      description: 'Any issues resolved in 48-72 hours, not weeks or months like competitors.',
      highlight: false
    },
    {
      icon: IoStarOutline,
      title: 'Verified Premium Fleet',
      description: 'All vehicles inspected and maintained to premium standards. No surprises at pickup.',
      highlight: false
    },
    {
      icon: IoPeopleOutline,
      title: '24/7 Human Support',
      description: 'Real people answer immediately. No chatbots, no waiting weeks for responses.',
      highlight: false
    }
  ]

  const competitorProblems = [
    {
      company: 'Getaround',
      status: 'SHUT DOWN Feb 2025',
      problems: [
        'Abrupt insurance cancellations',
        'Months to resolve claims',
        'Poor vehicle quality',
        'No customer support'
      ],
      color: 'red'
    },
    {
      company: 'Turo',
      status: 'Major Issues',
      problems: [
        'Hosts cancel anytime',
        'Confusing insurance options',
        'Hidden service fees',
        'Price changes after booking'
      ],
      color: 'amber'
    },
    {
      company: 'Traditional Rental',
      status: 'Overpriced',
      problems: [
        '25-30% taxes and fees',
        'Expensive insurance add-ons',
        'Long counter waits',
        'Bait-and-switch pricing'
      ],
      color: 'gray'
    }
  ]

  const membershipTiers = [
    {
      name: 'Public Access',
      price: 'No Membership',
      savings: '0%',
      icon: IoCarOutline,
      features: [
        'Standard rates',
        'Insurance included',
        '48-hour support response',
        'Basic vehicle selection',
        'Pay per trip'
      ],
      color: 'gray',
      popular: false
    },
    {
      name: 'Hotel Guest Member',
      price: 'Automatic',
      savings: 'Save 15%',
      icon: IoBusinessOutline,
      features: [
        '15% off all rentals',
        'No surge pricing ever',
        'Priority support (1 hour)',
        'Guaranteed bookings',
        'Bill to room option'
      ],
      color: 'purple',
      popular: true
    },
    {
      name: 'Premium Member',
      price: '$29/month',
      savings: 'Save 25%',
      icon: IoDiamondOutline,
      features: [
        '25% off all rentals',
        'Luxury tier access',
        'Instant support',
        '$0 security deposits',
        'Free cancellations'
      ],
      color: 'amber',
      popular: false
    }
  ]

  const faqs = [
    {
      question: 'How is this different from Uber, Lyft, or Turo?',
      answer: 'We\'re a private membership club, not a public service. This allows us to offer member-only benefits like no surge pricing, guaranteed rates, and all-inclusive pricing. Think of it like Costco for car rentals - members get better deals and exclusive benefits.'
    },
    {
      question: 'What\'s actually included in your price?',
      answer: 'Everything. The price you see includes: the rental, comprehensive insurance (up to $2M liability), 24/7 support, roadside assistance, and all platform fees. Unlike Turo or traditional rentals, there are zero hidden fees or surprise charges.'
    },
    {
      question: 'Why don\'t you have surge pricing?',
      answer: 'As a private club serving members only (not the public), we\'re not subject to market surge dynamics. Your rate is locked when you book, whether it\'s Super Bowl Sunday or a random Tuesday.'
    },
    {
      question: 'What happened to Getaround? Could that happen here?',
      answer: 'Getaround failed because they had poor support, hidden fees, and sudden insurance changes. We built ItWhip specifically to avoid these issues: transparent pricing, included insurance, and 24/7 human support. We\'re also profitable, not burning venture capital.'
    },
    {
      question: 'How do you compare to Turo?',
      answer: 'Turo hosts can cancel anytime (leaving you stranded), insurance is confusing and separate, and quality varies wildly. With ItWhip, bookings are guaranteed, insurance is included, and all vehicles meet our standards. Plus we\'re usually 20-40% cheaper all-in.'
    },
    {
      question: 'Is the private club model legal?',
      answer: 'Yes, 100% legal. Private clubs have operated member-only services for over a century. Costco, Sam\'s Club, country clubs, and airline lounges all use the same legal framework. We operate under established private club statutes.'
    },
    {
      question: 'Can I join without booking a hotel?',
      answer: 'Yes! While hotel guests get automatic membership, anyone can join our Premium membership for $29/month and save 25% on all rentals. Most members save the monthly fee on their first rental.'
    },
    {
      question: 'What if I have an accident or damage?',
      answer: 'You\'re fully covered with our included insurance (no extra charge). Claims are resolved in 48-72 hours, not weeks or months. Members have $0 deductible. We handle everything - you don\'t deal with angry hosts or insurance companies.'
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
              <IoRibbonOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Transparent Pricing Club
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded">
                No Hidden Fees
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600"
              >
                {showCalculator ? 'Hide' : 'Show'} Calculator
              </button>
              <Link href="/list-your-car" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Become a Host
              </Link>
              <Link 
                href="/hotels"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                Join Now →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        
        {/* Hero with Value Prop */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
                  The Only Platform with 100% Transparent, All-Inclusive Pricing
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                No Hidden Fees. No Surge Pricing.
                <span className="block text-purple-600 mt-2">Just Honest, Member Pricing</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6">
                After Getaround's collapse and Turo's pricing games, we built the solution: 
                A private club where the price you see includes everything - insurance, support, all fees. 
                No surprises, no surge, no BS.
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">$0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Hidden Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">48hr</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Claims Resolution</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Transparent</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Pricing Calculator */}
        {showCalculator && (
          <section className="py-8 sm:py-12 bg-white dark:bg-black border-y border-gray-200 dark:border-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  See EXACTLY What You Pay (Everything Included)
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compare our all-inclusive pricing with competitors' hidden fees
                </p>
              </div>

              {/* Calculator Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Select Vehicle Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(vehiclePricing).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedVehicle(type)}
                        className={`p-3 rounded-lg capitalize transition ${
                          selectedVehicle === type
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Rental Duration: {rentalDays} days
                    {rentalDays >= 7 && <span className="text-green-600 ml-2">(15% week discount applied)</span>}
                    {rentalDays >= 30 && <span className="text-green-600 ml-2">(30% month discount applied)</span>}
                  </label>
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
                    <span>1 week</span>
                    <span>1 month</span>
                  </div>
                </div>
              </div>

              {/* Pricing Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* ItWhip Member Pricing */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border-2 border-purple-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-purple-900 dark:text-purple-300">ItWhip Member</h3>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">BEST VALUE</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base price:</span>
                      <span>${pricing.basePrice}</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{(pricing.discount * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Platform fee:</span>
                      <span>${pricing.platformFee.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Insurance:</span>
                      <span>INCLUDED</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Member discount:</span>
                      <span>-15%</span>
                    </div>
                    <div className="pt-2 border-t border-purple-300 dark:border-purple-700">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-purple-600">${pricing.memberPrice.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ItWhip Public */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">ItWhip Public</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base price:</span>
                      <span>${pricing.basePrice}</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{(pricing.discount * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Platform fee:</span>
                      <span>${pricing.platformFee.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Insurance:</span>
                      <span>INCLUDED</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${pricing.itwhipTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Turo */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 opacity-75">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Turo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base price:</span>
                      <span>${vehiclePricing[selectedVehicle as keyof typeof vehiclePricing].turoDaily * rentalDays}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Insurance:</span>
                      <span>+${vehiclePricing[selectedVehicle as keyof typeof vehiclePricing].turoInsurance * rentalDays}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Service fee:</span>
                      <span>+15%</span>
                    </div>
                    <div className="flex justify-between text-amber-600">
                      <span>Cancellation risk:</span>
                      <span>HIGH</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="line-through">${pricing.turoTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traditional Rental */}
                {vehiclePricing[selectedVehicle as keyof typeof vehiclePricing].hertzDaily > 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 opacity-75">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Hertz/Enterprise</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base price:</span>
                        <span>${vehiclePricing[selectedVehicle as keyof typeof vehiclePricing].hertzDaily * rentalDays}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Insurance:</span>
                        <span>+${vehiclePricing[selectedVehicle as keyof typeof vehiclePricing].hertzInsurance * rentalDays}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Taxes & fees:</span>
                        <span>+25%</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="line-through">${pricing.hertzTotal.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 opacity-50">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Traditional Rental</h3>
                    <div className="flex items-center justify-center h-32">
                      <p className="text-gray-500 text-center">
                        Not Available<br/>
                        <span className="text-xs">No exotic rentals</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Savings Summary */}
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-400 mb-2">
                  As an ItWhip Member You Save:
                </h3>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${pricing.savings.vsTuro.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">vs Turo</div>
                  </div>
                  {pricing.savings.vsHertz > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${pricing.savings.vsHertz.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">vs Traditional</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Host Earnings Display */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Host earns ${pricing.hostEarnings.toFixed(0)} from this rental • 
                  <Link href="/list-your-car" className="text-purple-600 hover:text-purple-700 ml-1">
                    Become a host →
                  </Link>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Why Others Failed */}
        <section className="py-12 sm:py-16 bg-red-50 dark:bg-red-900/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Others Failed, Why We're Different
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We built ItWhip specifically to fix these industry problems
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {competitorProblems.map((competitor, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {competitor.company}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      competitor.color === 'red' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : competitor.color === 'amber'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {competitor.status}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {competitor.problems.map((problem, pidx) => (
                      <li key={pidx} className="flex items-start">
                        <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{problem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-900 dark:text-green-400 mb-4 text-center">
                The ItWhip Solution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Transparent Pricing</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Everything included, no hidden fees</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">48-Hour Claims</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Not weeks or months</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">24/7 Human Support</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Real people, immediate response</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Guaranteed Bookings</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Hosts can't cancel on members</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Quality Standards</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">All vehicles inspected</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">No Surge Pricing</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Same rates always</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Join the Private Club?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Exclusive benefits that save you money and headaches
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {membershipBenefits.map((benefit, idx) => (
                <div key={idx} className={`rounded-lg p-6 ${
                  benefit.highlight 
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-500'
                    : 'bg-white dark:bg-gray-900 shadow-sm'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      benefit.highlight
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600'
                    }`}>
                      <benefit.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership Tiers */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Choose Your Membership
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Join thousands saving money with transparent, member-only pricing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipTiers.map((tier, idx) => (
                <div key={idx} className={`relative rounded-xl p-6 ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-500 shadow-lg'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <tier.icon className={`w-12 h-12 mx-auto mb-3 ${
                      tier.color === 'purple' ? 'text-purple-600' :
                      tier.color === 'amber' ? 'text-amber-600' :
                      'text-gray-600'
                    }`} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tier.price}
                    </p>
                    <p className={`text-sm font-medium ${
                      tier.color === 'purple' ? 'text-purple-600' :
                      tier.color === 'amber' ? 'text-amber-600' :
                      'text-gray-600'
                    }`}>
                      {tier.savings}
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start">
                        <IoCheckmarkCircle className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                          tier.color === 'purple' ? 'text-purple-600' :
                          tier.color === 'amber' ? 'text-amber-600' :
                          'text-green-600'
                        }`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.name === 'Hotel Guest Member' ? (
                    <Link href="/hotels" className="block w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 text-center transition">
                      View Partner Hotels
                    </Link>
                  ) : tier.name === 'Premium Member' ? (
                    <button className="w-full py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                      Join Premium
                    </button>
                  ) : (
                    <Link href="/search" className="block w-full py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 text-center transition">
                      Browse Cars
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Common Questions (Honest Answers)
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <IoArrowForwardOutline className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === idx ? 'rotate-90' : ''
                    }`} />
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Stop Overpaying. Start Saving.
            </h2>
            <p className="text-lg text-purple-100 mb-6">
              Join the only car sharing platform with 100% transparent pricing
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-2xl mx-auto mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">$0</div>
                  <div className="text-xs text-purple-200">Hidden Fees</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">$0</div>
                  <div className="text-xs text-purple-200">Surge Pricing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-purple-200">Transparent</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/hotels"
                className="w-full sm:w-auto px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                Join as Hotel Guest
              </Link>
              <button 
                className="w-full sm:w-auto px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
              >
                Get Premium ($29/mo)
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-4">
                ItWhip Private Travel Club - The only car sharing platform with truly transparent pricing.
                No hidden fees. No surge pricing. No BS.
              </p>
              <p className="text-xs">
                © 2024 ItWhip. A private membership organization operating under established legal frameworks.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}