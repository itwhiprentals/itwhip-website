// app/list-your-car/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import JsonLd, { listYourCarFAQs, listYourCarHowTo } from '@/components/seo/JsonLd'
import { 
  IoCarSportOutline,
  IoCashOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoDocumentTextOutline,
  IoCameraOutline,
  IoTrophyOutline,
  IoCloudUploadOutline,
  IoFlashOutline,
  IoReceiptOutline,
  IoPeopleOutline,
  IoDiamondOutline,
  IoMedalOutline,
  IoRibbonOutline,
  IoLeafOutline,
  IoLayersOutline,
  IoGlobeOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'

export default function ListYourCarPage() {
  const router = useRouter()
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [selectedVehicle, setSelectedVehicle] = useState('standard')
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
    hasInsurance: '',
    insuranceType: '',
    message: '',
    photos: [] as File[]
  })
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Insurance-based tiers - RENAMED for clarity
  const insuranceTiers = [
    {
      id: 'basic',
      name: 'PLATFORM COVERAGE',
      percentage: 40,
      color: 'gray',
      insurance: 'Platform Insurance',
      deductible: '$2,500',
      description: 'No insurance needed. We provide all coverage.',
      best: 'New hosts, occasional renters'
    },
    {
      id: 'standard',
      name: 'P2P COVERAGE',
      percentage: 75,
      color: 'amber',
      insurance: 'P2P Insurance',
      deductible: '$1,500',
      description: 'You bring peer-to-peer insurance coverage.',
      best: 'Hosts with State Farm P2P, Getaround coverage'
    },
    {
      id: 'premium',
      name: 'COMMERCIAL COVERAGE',
      percentage: 90,
      color: 'emerald',
      insurance: 'Commercial Insurance',
      deductible: '$1,000',
      description: 'You bring commercial auto insurance.',
      best: 'Fleet operators, serious hosts'
    }
  ]

  // Vehicle categories for earnings estimation
  const vehicleCategories = [
    { id: 'economy', name: 'Economy', examples: 'Civic, Corolla, Sentra', avgDaily: 55 },
    { id: 'standard', name: 'Standard', examples: 'Camry, Accord, CRV', avgDaily: 85 },
    { id: 'luxury', name: 'Luxury', examples: 'BMW, Mercedes, Audi', avgDaily: 175 },
    { id: 'premium', name: 'Premium', examples: 'Tesla S/X, BMW 7', avgDaily: 275 },
    { id: 'exotic', name: 'Exotic', examples: 'Porsche, Ferrari', avgDaily: 500 }
  ]

  const currentInsuranceTier = insuranceTiers.find(t => t.id === selectedTier) || insuranceTiers[1]
  const currentVehicle = vehicleCategories.find(v => v.id === selectedVehicle) || vehicleCategories[1]

  // Calculate earnings based on insurance tier
  const calculateEarnings = () => {
    const grossMonthly = currentVehicle.avgDaily * monthlyDays
    const hostPercentage = currentInsuranceTier.percentage / 100
    const netMonthly = grossMonthly * hostPercentage
    const annualEarnings = netMonthly * 12
    const taxSavings = 8000
    
    return {
      daily: currentVehicle.avgDaily,
      grossMonthly,
      netMonthly: Math.round(netMonthly),
      annualEarnings: Math.round(annualEarnings),
      totalBenefit: Math.round(annualEarnings + taxSavings),
      platformFee: 100 - currentInsuranceTier.percentage
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
          hasInsurance: '',
          insuranceType: '',
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
      {/* JSON-LD Structured Data */}
      <JsonLd type="faq" faqs={listYourCarFAQs} />
      <JsonLd 
        type="howto" 
        howToName="How to List Your Car and Start Earning on ITWhip"
        howToDescription="Step-by-step guide to listing your car on Arizona's highest-paying P2P car sharing platform."
        howToSteps={listYourCarHowTo} 
      />

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
                List Your Car
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                Earn Up to 90%
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/insurance-guide" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Insurance Guide
              </Link>
              <Link href="/host-protection" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                Host Protection
              </Link>
              <Link href="/host-benefits" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                All Benefits
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
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
              {/* P2P Badge */}
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-4">
                <IoPeopleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-xs sm:text-sm text-white font-medium">
                  Peer-to-Peer Car Sharing in Arizona
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                List Your Car & Earn Up to 90% in Arizona
              </h1>
              
              {/* City Sub-headline */}
              <p className="text-sm sm:text-base text-purple-600 font-medium mb-4">
                Phoenix • Scottsdale • Tempe • Mesa • Chandler — Arizona's highest-paying P2P car sharing platform
              </p>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto">
                Choose your insurance tier, set your price, get paid in 48 hours.
              </p>

              {/* Earnings Calculator */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6 max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Calculate Your Earnings
                </h3>
                
                {/* Insurance Tier Selector */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    1. Select Your Insurance Tier:
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {insuranceTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                        className={`p-4 rounded-lg transition-all border-2 ${
                          selectedTier === tier.id
                            ? tier.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                            : tier.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-2xl font-black ${
                          tier.color === 'emerald' ? 'text-emerald-600'
                          : tier.color === 'amber' ? 'text-amber-600'
                          : 'text-gray-600'
                        }`}>
                          {tier.percentage}%
                        </div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">{tier.name}</div>
                        <div className="text-xs text-gray-500">{tier.insurance}</div>
                        {tier.color === 'amber' && (
                          <span className="inline-block mt-1 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">POPULAR</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {currentInsuranceTier.description}
                  </p>
                </div>

                {/* Vehicle Type Selector */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    2. Select Your Vehicle Type:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {vehicleCategories.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle.id)}
                        className={`p-3 rounded-lg transition-all ${
                          selectedVehicle === vehicle.id
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-semibold text-sm">{vehicle.name}</div>
                        <div className="text-xs opacity-80">${vehicle.avgDaily}/day avg</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rental Days Slider */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>3. Rental days per month:</span>
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
                      Monthly ({currentInsuranceTier.percentage}% tier)
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
                      With ~$8K tax savings
                    </div>
                  </div>
                </div>

                {/* Updated footnote with features */}
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Platform fee ({earnings.platformFee}%) covers: $1M liability, Mileage Forensics™, ESG dashboard, guest verification, 24/7 support
                </p>
              </div>

              {/* Feature line with compliance */}
              <div className="text-xs text-gray-500 mb-6">
                Includes Mileage Forensics™, ESG impact dashboard, and full compliance with{' '}
                <Link href="/legal" className="text-purple-600 hover:underline">A.R.S. § 28-9601–9613</Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg text-lg"
                >
                  Start Application →
                </button>
                <Link 
                  href="/insurance-guide" 
                  className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition border-2 border-purple-600"
                >
                  Learn About Tiers
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar - UPDATED: Removed hotel partners, added AZ Compliant */}
        <section className="bg-purple-600 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">$1M</div>
                <div className="text-xs sm:text-sm text-purple-100">Liability Coverage</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">48hr</div>
                <div className="text-xs sm:text-sm text-purple-100">Fast Payments</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">90%</div>
                <div className="text-xs sm:text-sm text-purple-100">Max Earnings</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">AZ</div>
                <div className="text-xs sm:text-sm text-purple-100">P2P Compliant</div>
              </div>
            </div>
          </div>
        </section>

        {/* Arizona Compliance - MOVED HIGHER */}
        <section className="py-6 bg-amber-50 dark:bg-amber-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <IoGlobeOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">
                  Arizona P2P Car Sharing Compliant (A.R.S. § 28-9601–9613)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  ITWhip operates under Arizona's peer-to-peer car sharing legislation. 
                  This means proper insurance coverage, liability protections, and compliance with all Arizona motor vehicle requirements.
                </p>
                <Link 
                  href="/legal"
                  className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
                >
                  Full Arizona law text
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Tiers Explanation */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Choose Your Earnings Tier
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your earnings are determined by the insurance you bring. It's that simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {insuranceTiers.map((tier) => (
                <div 
                  key={tier.id}
                  className={`relative rounded-lg p-6 border-2 ${
                    tier.color === 'emerald' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                      : tier.color === 'amber'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-400'
                  }`}
                >
                  {tier.color === 'amber' && (
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
                  <div className="text-xs text-gray-500 mb-3">
                    Deductible: {tier.deductible}
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
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
                Full insurance guide with detailed coverage breakdown
                <IoArrowForwardOutline className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                What Every Tier Includes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Regardless of your tier, every rental is fully protected
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Protection */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoShieldCheckmarkOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  $1M Liability Coverage
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>$1M liability on ALL tiers</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Physical damage coverage</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>24/7 roadside assistance</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Loss of use compensation</span>
                  </li>
                </ul>
                <Link 
                  href="/host-protection"
                  className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View protection details
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Technology */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoRocketOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Professional Host Tools
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <Link href="/mileage-forensics" className="hover:text-purple-600">
                      Mileage Forensics™ tracking
                    </Link>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Smart pricing optimization</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <Link href="/esg-dashboard" className="hover:text-purple-600">
                      ESG impact dashboard
                    </Link>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Automated tax documentation</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 mt-4">
                  <Link 
                    href="/mileage-forensics"
                    className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    How Mileage Forensics works
                    <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </Link>
                  <Link 
                    href="/esg-dashboard"
                    className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    See your ESG impact dashboard
                    <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoPeopleOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  We Handle Everything
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Guest screening & verification</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>Booking & payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>FNOL claims system (48-72hr)</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>24/7 host support</span>
                  </li>
                </ul>
                <Link 
                  href="/how-it-works"
                  className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  How it works
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Host Benefits Preview */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                <IoTrophyOutline className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">30+ Benefits Included</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Hosts Choose ItWhip
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to succeed — all included with your listing
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Benefit 1 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <IoCashOutline className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Up to 90% Earnings</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Keep most of your income based on your insurance tier</p>
                  </div>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">$1M Insurance Included</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Liability coverage on every rental, zero out-of-pocket</p>
                  </div>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <IoFlashOutline className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">48-Hour Payments</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Fastest payouts in the industry, direct to your bank</p>
                  </div>
                </div>
              </div>

              {/* Benefit 4 - Mileage Forensics */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <IoSpeedometerOutline className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Mileage Forensics™</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">GPS-verified trips protect you from disputes and fraud</p>
                  </div>
                </div>
              </div>

              {/* Benefit 5 - ESG */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <IoLeafOutline className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">ESG Impact Dashboard</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Track your environmental contribution in real-time</p>
                  </div>
                </div>
              </div>

              {/* Benefit 6 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <IoReceiptOutline className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">$8K-25K Tax Savings</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Depreciation, expenses, and mileage deductions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/host-benefits"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
              >
                <IoSparklesOutline className="w-5 h-5" />
                View All 30+ Host Benefits
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Tax benefits, host tools, rewards program, and more
              </p>
            </div>
          </div>
        </section>

        {/* Host Achievement Tiers */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Host Achievement Tiers
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Unlock rewards as you grow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoMedalOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Rising Host</h4>
                <p className="text-xs text-gray-500 mb-2">5+ trips, 4.5+ rating</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified badge, search boost</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoRibbonOutline className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Established Host</h4>
                <p className="text-xs text-gray-500 mb-2">15+ trips, 4.7+ rating</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Featured placement, faster payouts</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoDiamondOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Top Host</h4>
                <p className="text-xs text-gray-500 mb-2">30+ trips, 4.9+ rating</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Homepage features, priority support</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoTrophyOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Elite Fleet</h4>
                <p className="text-xs text-gray-500 mb-2">5+ vehicles, $5K+ monthly</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dedicated manager, API access</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/host-benefits#rewards" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View all host rewards →
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
                  <IoLayersOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2. Choose Tier</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  40%, 75%, or 90%
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoCameraOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">3. Add Photos</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We provide guidelines
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoCashOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4. Start Earning</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Paid in 48 hours
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Benefits */}
        <section className="py-12 sm:py-16 bg-green-50 dark:bg-green-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
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
                We provide 1099 documentation for your tax preparer. Consult a tax professional for your specific situation.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Your Car Could Be Earning ${earnings.netMonthly.toLocaleString()} Next Month
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              Choose your tier. Set your price. Get paid in 48 hours.
            </p>
            
            <button 
              onClick={() => setShowInquiryForm(true)}
              className="px-10 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg text-lg"
            >
              Start Free Application →
            </button>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-purple-100">
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>No fees to list</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>$1M coverage included</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Application Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Host Application
              </h2>
              <button
                onClick={() => setShowInquiryForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                ✓ All vehicles welcome (2015+) • ✓ Choose your earnings tier (40-90%) • ✓ $1M coverage included
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
                  max="2026"
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

              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.hasInsurance}
                onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.value })}
                required
              >
                <option value="">Do you have P2P or commercial insurance? *</option>
                <option value="none">No - I'll use platform coverage (40% tier)</option>
                <option value="p2p">Yes - I have P2P insurance (75% tier)</option>
                <option value="commercial">Yes - I have commercial insurance (90% tier)</option>
                <option value="unsure">Not sure - help me decide</option>
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
                    Upload Photos (Optional)
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
                  <p className="text-xs text-green-600 mt-2 text-center">
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