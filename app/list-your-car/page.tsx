// app/list-your-car/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoCarSportOutline,
  IoCashOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoCameraOutline,
  IoLocationOutline,
  IoTrophyOutline,
  IoStarOutline,
  IoTimeOutline,
  IoWalletOutline,
  IoCloudUploadOutline,
  IoCallOutline,
  IoMailOutline,
  IoFlashOutline,
  IoCalculatorOutline,
  IoChevronForwardOutline,
  IoGlobeOutline,
  IoTimerOutline,
  IoReceiptOutline,
  IoPeopleOutline,
  IoAnalyticsOutline,
  IoConstructOutline,
  IoFingerPrintOutline,
  IoNotificationsOutline,
  IoDiamondOutline,
  IoMedalOutline,
  IoRibbonOutline,
  IoBarChartOutline,
  IoWifiOutline,
  IoKeyOutline,
  IoTrendingUpOutline
} from 'react-icons/io5'

export default function ListYourCarPage() {
  const router = useRouter()
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [selectedTier, setSelectedTier] = useState('standard')
  const [monthlyDays, setMonthlyDays] = useState(15)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    location: 'Phoenix',
    vehicleType: '',
    message: '',
    photos: [] as File[]
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
      examples: 'Civic, Corolla, Sentra, Elantra',
      commission: 15,
      dailyRate: '$45-75',
      monthlyEarnings: '$600-1,100',
      coverage: '$750K liability',
      deductible: '$500',
      requirements: '2015+, Clean title',
      guestAge: '21+',
      avgDays: '20-25 days/mo',
      color: 'blue'
    },
    {
      id: 'standard',
      name: 'Standard',
      examples: 'Camry, Accord, Malibu, CRV',
      commission: 15,
      dailyRate: '$75-150',
      monthlyEarnings: '$900-1,500',
      coverage: '$750K liability',
      deductible: '$500',
      requirements: '2015+, Clean title',
      guestAge: '21+',
      avgDays: '18-22 days/mo',
      color: 'green'
    },
    {
      id: 'luxury',
      name: 'Luxury',
      examples: 'BMW, Mercedes, Audi, Lexus',
      commission: 18,
      dailyRate: '$150-250',
      monthlyEarnings: '$1,500-3,000',
      coverage: '$1M liability',
      deductible: '$750',
      requirements: '2015+, Premium condition',
      guestAge: '25+, 700+ credit',
      avgDays: '15-20 days/mo',
      color: 'purple'
    },
    {
      id: 'premium',
      name: 'Premium',
      examples: 'Tesla S/X, BMW 7, S-Class',
      commission: 20,
      dailyRate: '$250-400',
      monthlyEarnings: '$3,000-5,000',
      coverage: '$1M liability',
      deductible: '$1,000',
      requirements: '2018+, Pristine condition',
      guestAge: '30+, 750+ credit',
      avgDays: '12-18 days/mo',
      color: 'amber'
    },
    {
      id: 'exotic',
      name: 'Exotic',
      examples: 'Porsche, Ferrari, Lamborghini',
      commission: 22,
      dailyRate: '$400-1,000',
      monthlyEarnings: '$5,000-10,000',
      coverage: '$2M liability',
      deductible: '$2,500',
      requirements: 'Factory condition',
      guestAge: '30+, Verified, $5K deposit',
      avgDays: '8-15 days/mo',
      color: 'red'
    }
  ]

  const currentTier = vehicleTiers.find(t => t.id === selectedTier) || vehicleTiers[1]

  // Calculate earnings
  const calculateEarnings = () => {
    const tier = currentTier
    const avgDaily = selectedTier === 'economy' ? 60 : 
                     selectedTier === 'standard' ? 110 :
                     selectedTier === 'luxury' ? 200 :
                     selectedTier === 'premium' ? 325 : 600
    
    const grossMonthly = avgDaily * monthlyDays
    const commission = grossMonthly * (tier.commission / 100)
    const netMonthly = grossMonthly - commission
    const annualEarnings = netMonthly * 12
    const taxSavings = 8000 // Average annual tax deduction
    
    return {
      daily: avgDaily,
      grossMonthly,
      commission,
      netMonthly,
      annualEarnings,
      totalBenefit: annualEarnings + taxSavings
    }
  }

  const earnings = calculateEarnings()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'photos') {
          formDataToSend.append(key, formData[key as keyof typeof formData] as string)
        }
      })
      
      formData.photos.forEach((photo) => {
        formDataToSend.append('photos', photo)
      })

      const response = await fetch('/api/contact/host-inquiry', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        alert('Application submitted! You\'ll receive approval within 2 hours during business hours.')
        setShowInquiryForm(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          vehicleMake: '',
          vehicleModel: '',
          vehicleYear: '',
          location: 'Phoenix',
          vehicleType: '',
          message: '',
          photos: []
        })
      } else {
        alert(data.error || 'Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Connection error. Please try again.')
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5)
      setFormData({ ...formData, photos: files })
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
              <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Start Earning Today
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded">
                All Vehicles Welcome
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/host-benefits" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                View All Benefits
              </Link>
              <Link href="/host-protection" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Protection Details
              </Link>
              <button 
                onClick={() => setShowInquiryForm(true)}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px]">
        
        {/* Hero Section with Immediate Value Prop */}
        <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
              {/* Launch Special Badge */}
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4">
                <IoSparklesOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-xs sm:text-sm text-white font-medium">
                  Limited Time: First 60 Days 0% Commission
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Your Car Earns ${earnings.netMonthly.toLocaleString()}/Month
                <span className="block text-purple-600 mt-2 text-2xl sm:text-3xl lg:text-4xl">
                  While You Keep Living Your Life
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto">
                Join 2,847+ Phoenix hosts earning with complete protection included. 
                15-22% simple commission • $0 insurance costs • 48-hour payments
              </p>

              {/* Interactive Earnings Calculator */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6 max-w-4xl mx-auto">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Your Vehicle Type:
                </div>
                
                {/* Vehicle Type Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                  {vehicleTiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`p-3 rounded-lg transition-all ${
                        selectedTier === tier.id
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-sm">{tier.name}</div>
                      <div className="text-xs opacity-80">{tier.dailyRate}/day</div>
                    </button>
                  ))}
                </div>

                {/* Rental Days Slider */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Rental days per month:</span>
                    <span className="font-bold text-purple-600">{monthlyDays} days</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={monthlyDays}
                    onChange={(e) => setMonthlyDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Earnings Display */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      ${earnings.netMonthly.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Monthly after {currentTier.commission}% fee
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      ${earnings.annualEarnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Annual earnings
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      ${earnings.totalBenefit.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total with tax savings
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg text-lg"
                >
                  Start Application →
                </button>
                <Link 
                  href="/host-benefits" 
                  className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition border-2 border-purple-600"
                >
                  See All Benefits
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Instant approval for qualifying vehicles • No fees ever • Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="bg-purple-600 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">2,847</div>
                <div className="text-xs sm:text-sm text-purple-100">Active Hosts</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">48hr</div>
                <div className="text-xs sm:text-sm text-purple-100">Fast Payments</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">$0</div>
                <div className="text-xs sm:text-sm text-purple-100">Insurance Cost</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">$2M</div>
                <div className="text-xs sm:text-sm text-purple-100">Max Coverage</div>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle Tiers & Requirements */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                All Vehicles Welcome - Find Your Tier
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Every 2015+ vehicle qualifies. Higher tiers = higher earnings
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Vehicle Tier
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Examples
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-purple-600">
                      Your Earnings
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Protection
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Guest Requirements
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vehicleTiers.map((tier) => (
                    <tr key={tier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedTier(tier.id)}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{tier.name}</div>
                        <div className="text-xs text-gray-500">{tier.commission}% commission</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {tier.examples}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm font-bold text-purple-600">{tier.monthlyEarnings}</div>
                        <div className="text-xs text-gray-500">{tier.avgDays}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm text-gray-900 dark:text-white">{tier.coverage}</div>
                        <div className="text-xs text-gray-500">${tier.deductible} deductible</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {tier.guestAge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/host-requirements"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                View detailed requirements
                <IoArrowForwardOutline className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* What's Included - Major Value Props */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Everything Included. No Hidden Costs.
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                One simple commission covers everything you need to succeed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Protection Included */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <IoShieldCheckmarkOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Complete Protection Included
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Up to $2M liability coverage</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Physical damage protection</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>48-72 hour claims resolution</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>$0 monthly insurance cost</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-800 dark:text-green-300">
                    Save $3,000-6,000/year vs commercial insurance
                  </p>
                </div>
                <Link 
                  href="/host-protection"
                  className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Protection details
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Technology & Tools */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <IoRocketOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Professional Host Tools
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>GPS tracking & monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Smart pricing optimization</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Guest screening & verification</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Automated tax documentation</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-800 dark:text-purple-300">
                    Professional photography included for luxury+
                  </p>
                </div>
                <Link 
                  href="/host-benefits#tools"
                  className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View all tools
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Support & Service */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <IoPeopleOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  We Handle Everything
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>All guest communication</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Booking & payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Marketing & promotion</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Claims & dispute resolution</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    You just keep your car clean & maintained
                  </p>
                </div>
                <Link 
                  href="/how-it-works"
                  className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  How it works
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/host-benefits"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
              >
                View All Host Benefits
                <IoArrowForwardOutline className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Host Success Program */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Grow Your Earnings with Host Rewards
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The more you host, the more you earn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoMedalOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Silver Host</h4>
                <p className="text-xs text-gray-500 mb-2">10+ trips</p>
                <p className="text-sm font-bold text-purple-600">-1% commission</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoRibbonOutline className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Gold Host</h4>
                <p className="text-xs text-gray-500 mb-2">25+ trips</p>
                <p className="text-sm font-bold text-purple-600">-2% commission</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoDiamondOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Platinum Host</h4>
                <p className="text-xs text-gray-500 mb-2">50+ trips</p>
                <p className="text-sm font-bold text-purple-600">-3% commission</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoTrophyOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Fleet Owner</h4>
                <p className="text-xs text-gray-500 mb-2">3+ vehicles</p>
                <p className="text-sm font-bold text-purple-600">Custom rates</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Plus: Priority placement, instant payouts, dedicated support, and more
              </p>
              <Link href="/host-benefits#rewards" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View all rewards & tiers →
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Process */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Start Earning in 24 Hours
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Simple process, instant approval for qualifying vehicles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoDocumentTextOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">1. Apply Online</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  5-minute application
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoFlashOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2. Get Approved</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Instant for most vehicles
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoCameraOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">3. Add Photos</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We help with pro photos
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoCashOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4. Start Earning</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  First booking in 48hrs
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/how-it-works"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Learn more about the process →
              </Link>
            </div>
          </div>
        </section>

        {/* Tax Benefits */}
        <section className="py-12 sm:py-16 bg-green-50 dark:bg-green-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <IoReceiptOutline className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Save $8,000-25,000 in Taxes Annually
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Turn your car into a tax-advantaged business
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">$5-15K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Vehicle depreciation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Expenses deductible</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$0.67/mi</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mileage deduction</div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                We provide all documentation for your tax preparer
              </p>
              
              <div className="text-center mt-4">
                <Link 
                  href="/host-benefits#taxes"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View tax benefit details →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Urgency & Social Proof */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Phoenix Hosts Are Earning Right Now
                </h2>
                <p className="text-purple-100">
                  Join them before the 0% commission offer ends
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">87%</div>
                  <div className="text-sm text-purple-100">Average occupancy rate</div>
                  <div className="text-xs text-purple-200 mt-1">During peak season</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">$2,847</div>
                  <div className="text-sm text-purple-100">Avg monthly earnings</div>
                  <div className="text-xs text-purple-200 mt-1">Luxury vehicles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">4.9★</div>
                  <div className="text-sm text-purple-100">Average rating</div>
                  <div className="text-xs text-purple-200 mt-1">From hotel guests</div>
                </div>
              </div>

              <div className="text-center mt-6">
                <button 
                  onClick={() => setShowInquiryForm(true)}
                  className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
                >
                  Claim Your Spot Now →
                </button>
                <p className="text-xs text-purple-200 mt-3">
                  Applications approved in order received • Limited to maintain quality
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Car Could Be Earning ${earnings.netMonthly.toLocaleString()} Next Month
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Why wait? Start your application now and get approved today.
            </p>
            
            <button 
              onClick={() => setShowInquiryForm(true)}
              className="px-10 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg text-lg"
            >
              Start Free Application →
            </button>
            
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>No fees ever</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Keep your keys</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Full Footer */}
      <Footer />

      {/* Application Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Quick Application - Get Approved Today
              </h2>
              <button
                onClick={() => setShowInquiryForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✓ Instant approval for most vehicles • ✓ First booking within 48 hours • ✓ No fees or commitments
              </p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name *"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                >
                  <option value="Phoenix">Phoenix</option>
                  <option value="Scottsdale">Scottsdale</option>
                  <option value="Tempe">Tempe</option>
                  <option value="Mesa">Mesa</option>
                  <option value="Chandler">Chandler</option>
                  <option value="Gilbert">Gilbert</option>
                  <option value="Glendale">Glendale</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Make (Toyota) *"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.vehicleMake}
                  onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Model (Camry) *"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Year *"
                  min="2015"
                  max="2025"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.vehicleYear}
                  onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                  required
                />
              </div>

              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                required
              >
                <option value="">Select Vehicle Type *</option>
                <option value="economy">Economy (Civic, Corolla, Sentra)</option>
                <option value="standard">Standard (Camry, Accord, CRV)</option>
                <option value="luxury">Luxury (BMW, Mercedes, Audi)</option>
                <option value="premium">Premium (Tesla S/X, BMW 7)</option>
                <option value="exotic">Exotic (Porsche, Ferrari, Lamborghini)</option>
              </select>

              <textarea
                placeholder="Anything else? Mileage, special features, multiple vehicles... (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                <label className="flex flex-col items-center cursor-pointer">
                  <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Upload Photos (Optional - we can help later)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {formData.photos.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    {formData.photos.length} photo(s) selected
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowInquiryForm(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition text-lg"
                >
                  Submit Application →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}