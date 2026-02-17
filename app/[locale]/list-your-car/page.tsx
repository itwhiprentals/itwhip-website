// app/list-your-car/page.tsx

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
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
  const t = useTranslations('ListYourCar')
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [selectedVehicle, setSelectedVehicle] = useState('standard')
  const [monthlyDays, setMonthlyDays] = useState(15)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    phone: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    location: string
    vehicleType: string
    hasInsurance: string
    insuranceType: string
    message: string
    photos: File[]
  }>({
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
      name: t('basicTierName'),
      percentage: 40,
      color: 'gray',
      insurance: t('basicTierInsurance'),
      deductible: t('basicTierDeductible'),
      description: t('basicTierDescription'),
      best: t('basicTierBest')
    },
    {
      id: 'standard',
      name: t('standardTierName'),
      percentage: 75,
      color: 'amber',
      insurance: t('standardTierInsurance'),
      deductible: t('standardTierDeductible'),
      description: t('standardTierDescription'),
      best: t('standardTierBest')
    },
    {
      id: 'premium',
      name: t('premiumTierName'),
      percentage: 90,
      color: 'emerald',
      insurance: t('premiumTierInsurance'),
      deductible: t('premiumTierDeductible'),
      description: t('premiumTierDescription'),
      best: t('premiumTierBest')
    }
  ]

  // Vehicle categories for earnings estimation
  const vehicleCategories = [
    { id: 'economy', name: t('vehicleEconomyName'), examples: t('vehicleEconomyExamples'), avgDaily: 55 },
    { id: 'standard', name: t('vehicleStandardName'), examples: t('vehicleStandardExamples'), avgDaily: 85 },
    { id: 'luxury', name: t('vehicleLuxuryName'), examples: t('vehicleLuxuryExamples'), avgDaily: 175 },
    { id: 'premium', name: t('vehiclePremiumName'), examples: t('vehiclePremiumExamples'), avgDaily: 275 },
    { id: 'exotic', name: t('vehicleExoticName'), examples: t('vehicleExoticExamples'), avgDaily: 500 }
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
      
      formData.photos.forEach((photo: File) => {
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
        howToName="How to List Your Car and Start Earning on ItWhip"
        howToDescription="Step-by-step guide to listing your car on Arizona's highest-paying P2P car sharing platform."
        howToSteps={listYourCarHowTo}
      />

      {/* Vehicle Category Product Schemas with AggregateOffer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Electric Vehicle Rentals",
            "description": "List your Tesla, Rivian, or other electric vehicle on ItWhip and earn up to 90% of rental income in Phoenix, Arizona.",
            "brand": {
              "@type": "Brand",
              "name": "ItWhip"
            },
            "category": "Electric Vehicles",
            "image": "https://itwhip.com/Electric-Car.png",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "75",
              "highPrice": "250",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "offerCount": "50+"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Luxury & Exotic Car Rentals",
            "description": "List your BMW, Mercedes, Porsche, Ferrari or other luxury vehicle on ItWhip and earn up to 90% of rental income in Phoenix, Arizona.",
            "brand": {
              "@type": "Brand",
              "name": "ItWhip"
            },
            "category": "Luxury & Exotic Cars",
            "image": "https://itwhip.com/Luxury-car.png",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "150",
              "highPrice": "500",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "offerCount": "30+"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "SUV & Truck Rentals",
            "description": "List your SUV, pickup truck, or crossover on ItWhip and earn up to 90% of rental income in Phoenix, Arizona.",
            "brand": {
              "@type": "Brand",
              "name": "ItWhip"
            },
            "category": "SUVs & Trucks",
            "image": "https://itwhip.com/Suv-Car.png",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "60",
              "highPrice": "200",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "offerCount": "80+"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Economy Car Rentals",
            "description": "List your Honda, Toyota, Nissan or other economy car on ItWhip and earn up to 90% of rental income in Phoenix, Arizona.",
            "brand": {
              "@type": "Brand",
              "name": "ItWhip"
            },
            "category": "Economy Cars",
            "image": "https://itwhip.com/images/economy-car.jpg",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "35",
              "highPrice": "100",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "offerCount": "100+"
            }
          })
        }}
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
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                {t('earnBadge')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/insurance-guide" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('navInsuranceGuide')}
              </Link>
              <Link href="/host-protection" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('navHostProtection')}
              </Link>
              <Link href="/host-benefits" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                {t('navAllBenefits')}
              </Link>
              <Link
                href="/host/signup"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                {t('navApplyNow')}
              </Link>
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
                  {t('heroBadge')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {t('heroHeading')}
              </h1>

              {/* City Sub-headline */}
              <p className="text-sm sm:text-base text-purple-600 font-medium mb-4">
                {t('heroSubheading')}
              </p>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto">
                {t('heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/host/signup"
                  className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg text-lg text-center"
                >
                  {t('heroCtaPrimary')}
                </Link>
                <Link
                  href="/insurance-guide"
                  className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition border-2 border-purple-600"
                >
                  {t('heroCtaSecondary')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator - Full Width Section */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('calculatorTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('calculatorSubtitle')}
              </p>
            </div>

            {/* Insurance Tier Selector */}
            <div className="mb-10">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('insuranceSelect')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {insuranceTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as 'basic' | 'standard' | 'premium')}
                    className={`p-6 rounded-lg transition-all border-2 shadow-md ${
                      selectedTier === tier.id
                        ? tier.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-xl'
                        : tier.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 shadow-xl'
                        : 'bg-white dark:bg-gray-800 border-gray-500 shadow-xl'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:shadow-lg'
                    }`}
                  >
                    <div className={`text-4xl font-black mb-2 ${
                      tier.color === 'emerald' ? 'text-emerald-600'
                      : tier.color === 'amber' ? 'text-amber-600'
                      : 'text-gray-600'
                    }`}>
                      {tier.percentage}%
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{tier.name}</div>
                    <div className="text-sm text-gray-500 mb-2">{tier.insurance}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tier.description}
                    </p>
                    {tier.color === 'amber' && (
                      <span className="inline-block mt-3 text-xs bg-amber-500 text-white px-3 py-1 rounded-full font-semibold">POPULAR</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Type Selector */}
            <div className="mb-10">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('vehicleSelect')}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {vehicleCategories.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={`p-4 rounded-lg transition-all shadow-md ${
                      selectedVehicle === vehicle.id
                        ? 'bg-purple-600 text-white shadow-xl'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 hover:shadow-lg border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="font-bold text-base">{vehicle.name}</div>
                    <div className="text-sm opacity-80">${vehicle.avgDaily}/day</div>
                    <div className="text-xs opacity-60 mt-1">{vehicle.examples}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rental Days Slider */}
            <div className="mb-10 max-w-2xl mx-auto">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="font-medium">{t('rentalDaysLabel')}</span>
                <span className="font-bold text-purple-600 text-lg">{t('calcDaysCount', { count: monthlyDays })}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={monthlyDays}
                onChange={(e) => setMonthlyDays(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{t('rentalDaysMin')}</span>
                <span>{t('rentalDaysMax')}</span>
              </div>
            </div>

            {/* Earnings Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 border-2 border-green-300 dark:border-green-700 shadow-md">
                <div className="text-3xl sm:text-4xl font-black text-green-600 mb-1">
                  ${earnings.netMonthly.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('calcMonthlyTier', { percentage: currentInsuranceTier.percentage })}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-6 border-2 border-purple-300 dark:border-purple-700 shadow-md">
                <div className="text-3xl sm:text-4xl font-black text-purple-600 mb-1">
                  ${earnings.annualEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('calcAnnualEarnings')}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border-2 border-blue-300 dark:border-blue-700 shadow-md">
                <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">
                  ${earnings.totalBenefit.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('calcTaxSavings')}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              {t('platformFeeText').replace('Platform fee', `Platform fee (${earnings.platformFee}%)`)}
            </p>
            <p className="text-xs text-gray-400 text-center mt-2">
              {t('complianceText').split('A.R.S.')[0]}
              <Link href="/legal" className="text-purple-600 hover:underline">A.R.S. § 28-9601–9613</Link>
            </p>

            <div className="text-center mt-6">
              <Link
                href="/insurance-guide"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('insuranceGuideLink')}
                <IoArrowForwardOutline className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Bar - UPDATED: Removed hotel partners, added AZ Compliant */}
        <section className="bg-purple-600 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{t('trustBar1Title')}</div>
                <div className="text-xs sm:text-sm text-purple-100">{t('trustBar1Subtitle')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{t('trustBar2Title')}</div>
                <div className="text-xs sm:text-sm text-purple-100">{t('trustBar2Subtitle')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{t('trustBar3Title')}</div>
                <div className="text-xs sm:text-sm text-purple-100">{t('trustBar3Subtitle')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{t('trustBar4Title')}</div>
                <div className="text-xs sm:text-sm text-purple-100">{t('trustBar4Subtitle')}</div>
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
                  {t('arizonaComplianceTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('arizonaComplianceText')}
                </p>
                <Link
                  href="/legal"
                  className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
                >
                  {t('arizonaComplianceLink')}
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('includesTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('includesSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Protection */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoShieldCheckmarkOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('protectionTitle')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('protectionPoint1')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('protectionPoint2')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('protectionPoint3')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('protectionPoint4')}</span>
                  </li>
                </ul>
                <Link
                  href="/host-protection"
                  className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  {t('protectionLink')}
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Technology */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoRocketOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('technologyTitle')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <Link href="/mileage-forensics" className="hover:text-purple-600">
                      {t('technologyPoint1')}
                    </Link>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('technologyPoint2')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <Link href="/esg-dashboard" className="hover:text-purple-600">
                      {t('technologyPoint3')}
                    </Link>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('technologyPoint4')}</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    href="/mileage-forensics"
                    className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    {t('mileageForensicsLink')}
                    <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href="/esg-dashboard"
                    className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    {t('esgDashboardLink')}
                    <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <IoPeopleOutline className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('supportTitle')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('supportPoint1')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('supportPoint2')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('supportPoint3')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    <span>{t('supportPoint4')}</span>
                  </li>
                </ul>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  {t('howItWorksLink')}
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
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">{t('benefitsBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('benefitsTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('benefitsSubtitle')}
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('benefit1Title')}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('benefit1Desc')}</p>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('benefit2Title')}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('benefit2Desc')}</p>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('benefit3Title')}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('benefit3Desc')}</p>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('benefit4Title')}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('benefit4Desc')}</p>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('benefit5Title')}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('benefit5Desc')}</p>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('benefit6Title')}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('benefit6Desc')}</p>
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
                {t('viewAllBenefitsButton')}
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {t('benefitsNote')}
              </p>
            </div>
          </div>
        </section>

        {/* Host Achievement Tiers */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('achievementTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('achievementSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoMedalOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('achievementTier1')}</h4>
                <p className="text-xs text-gray-500 mb-2">{t('achievementTier1Criteria')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('achievementTier1Rewards')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoRibbonOutline className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('achievementTier2')}</h4>
                <p className="text-xs text-gray-500 mb-2">{t('achievementTier2Criteria')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('achievementTier2Rewards')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoDiamondOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('achievementTier3')}</h4>
                <p className="text-xs text-gray-500 mb-2">{t('achievementTier3Criteria')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('achievementTier3Rewards')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                <IoTrophyOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('achievementTier4')}</h4>
                <p className="text-xs text-gray-500 mb-2">{t('achievementTier4Criteria')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('achievementTier4Rewards')}</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/host-benefits#rewards" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                {t('viewAllRewardsLink')}
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Process */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('processTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoDocumentTextOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('processStep1Title')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('processStep1Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoLayersOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('processStep2Title')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('processStep2Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoCameraOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('processStep3Title')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('processStep3Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoCashOutline className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('processStep4Title')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('processStep4Desc')}
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
                  {t('taxTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('taxSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{t('taxBenefit1Title')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('taxBenefit1Desc')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{t('taxBenefit2Title')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('taxBenefit2Desc')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{t('taxBenefit3Title')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('taxBenefit3Desc')}</div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                {t('taxNote')}
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t('ctaTitle').replace('Next Month', `$${earnings.netMonthly.toLocaleString()} Next Month`)}
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              {t('ctaSubtitle')}
            </p>

            <Link
              href="/host/signup"
              className="inline-block px-10 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg text-lg"
            >
              {t('ctaButton')}
            </Link>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-purple-100">
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>{t('ctaFeature1')}</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>{t('ctaFeature2')}</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>{t('ctaFeature3')}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}