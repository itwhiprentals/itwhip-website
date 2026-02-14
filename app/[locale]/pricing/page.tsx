// app/pricing/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
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
  const t = useTranslations('Pricing')
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
      name: t('economy'),
      examples: t('civicCorolla'),
      dailyRate: 45,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      hostCommission: 0.15,
      insurance: t('included') + ' - $750K ' + t('liability').toLowerCase(),
      deposit: 500,
      minAge: 21,
      deliveryFee: 35
    },
    standard: {
      name: t('standardTier'),
      examples: t('camryAccord'),
      dailyRate: 75,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      hostCommission: 0.15,
      insurance: t('included') + ' - $750K ' + t('liability').toLowerCase(),
      deposit: 500,
      minAge: 21,
      deliveryFee: 35
    },
    luxury: {
      name: t('luxury'),
      examples: t('bmwMercedes'),
      dailyRate: 150,
      weeklyDiscount: 0.20,
      monthlyDiscount: 0.35,
      hostCommission: 0.18,
      insurance: t('included') + ' - $1M ' + t('liability').toLowerCase(),
      deposit: 1000,
      minAge: 25,
      deliveryFee: 50
    },
    premium: {
      name: t('premium'),
      examples: t('teslaSXSClass'),
      dailyRate: 250,
      weeklyDiscount: 0.20,
      monthlyDiscount: 0.35,
      hostCommission: 0.20,
      insurance: t('included') + ' - $1M ' + t('liability').toLowerCase(),
      deposit: 2500,
      minAge: 30,
      deliveryFee: 75
    },
    exotic: {
      name: t('exotic'),
      examples: t('ferrariLamborghini'),
      dailyRate: 500,
      weeklyDiscount: 0.25,
      monthlyDiscount: 0.40,
      hostCommission: 0.22,
      insurance: t('included') + ' - $2M ' + t('liability').toLowerCase(),
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
      name: t('hotelGuest'),
      price: t('includedWithStay'),
      benefits: [
        t('noMembershipFees'),
        t('priorityBooking'),
        t('memberPricing'),
        t('roomCharging'),
        t('conciergeSupport'),
        t('packageDeals')
      ]
    },
    monthly: {
      name: t('itwhipPlus'),
      price: t('pricePerMonth'),
      benefits: [
        t('tenPercentOff'),
        t('noDeliveryFees'),
        t('prioritySupport'),
        t('freeUpgrades'),
        t('cancelAnytime'),
        t('monthlyCredits')
      ]
    },
    annual: {
      name: t('itwhipElite'),
      price: t('pricePerYear'),
      benefits: [
        t('fifteenPercentOff'),
        t('noDeliveryFees'),
        t('vipSupport'),
        t('guaranteedUpgrades'),
        t('airportLoungeAccess'),
        t('exclusiveVehicles')
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
                {t('transparentPricing')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                {t('insuranceIncluded')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setSelectedTab('rentals')}
                className={`text-sm ${selectedTab === 'rentals' ? 'text-purple-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
              >
                {t('guestPricing')}
              </button>
              <button
                onClick={() => setSelectedTab('hosts')}
                className={`text-sm ${selectedTab === 'hosts' ? 'text-purple-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
              >
                {t('hostEarnings')}
              </button>
              <button
                onClick={() => setSelectedTab('insurance')}
                className={`text-sm ${selectedTab === 'insurance' ? 'text-purple-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
              >
                {t('protection')}
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
            {t('guest')}
          </button>
          <button
            onClick={() => setSelectedTab('hosts')}
            className={`flex-1 py-3 text-xs font-medium ${selectedTab === 'hosts' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            {t('host')}
          </button>
          <button
            onClick={() => setSelectedTab('insurance')}
            className={`flex-1 py-3 text-xs font-medium ${selectedTab === 'insurance' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            {t('protection')}
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
                  {t('allInsuranceIncluded')}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t('simpleFairPricing')}
                <span className="block text-purple-600 mt-2">{t('guestsPayLess')}</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                {t('uniqueModelDescription')}
              </p>

              {/* Key Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoCashOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{t('save30To50Percent')}</div>
                  <div className="text-xs text-gray-500">{t('vsTraditionalRentals')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{t('insuranceIncludedUpTo2M')}</div>
                  <div className="text-xs text-gray-500">{t('upTo2MCoverage')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoGiftOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{t('memberBenefits')}</div>
                  <div className="text-xs text-gray-500">{t('exclusivePerks')}</div>
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
                  {t('calculateYourRentalCost')}
                </h2>

                {/* Vehicle Tier Selector */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                    {t('selectVehicleType')}
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
                      {t('rentalDuration')}
                    </label>
                    <span className="text-lg font-bold text-purple-600">{rentalDays} {t('days')}</span>
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
                    <span>{t('oneDay')}</span>
                    <span>{t('oneWeek15PercentOff')}</span>
                    <span>{t('oneMonth30PercentOff')}</span>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guest Cost */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-4">
                      {t('yourTotalCost')}
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
                        <span className="text-gray-600 dark:text-gray-400">{t('platformFee10Percent')}</span>
                        <span className="font-medium">${pricing.platformFee.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('delivery')}</span>
                        <span className="font-medium">${pricing.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-semibold">{t('insurance')}</span>
                        <span className="font-bold text-blue-600">{t('included')}</span>
                      </div>
                      <div className="pt-3 border-t border-purple-200">
                        <div className="flex justify-between">
                          <span className="font-semibold">{t('total')}</span>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">${pricing.totalPrice.toFixed(0)}</div>
                            <div className="text-xs text-gray-500">${pricing.dailyAverage.toFixed(0)}{t('dayAvg')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t('everythingIncluded')}
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {currentTier.insurance}
                          </span>
                          <span className="text-xs text-gray-500 block">{t('zeroDeductibleForGuests')}</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {t('roadside24_7')}
                          </span>
                          <span className="text-xs text-gray-500 block">{t('helpAlwaysAvailable')}</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {t('securityDeposit', { depositAmount: `$${currentTier.deposit}` })}
                          </span>
                          <span className="text-xs text-gray-500 block">{t('holdOnlyNotCharged')}</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {t('freeCancellation')}
                          </span>
                          <span className="text-xs text-gray-500 block">{t('upTo24HoursBefore')}</span>
                        </div>
                      </li>
                    </ul>

                    <button
                      onClick={() => setShowHostCommission(!showHostCommission)}
                      className="mt-4 text-xs text-purple-600 hover:text-purple-700"
                    >
                      {showHostCommission ? t('hideHostEarnings') : t('showHostEarnings')} {t('hostEarningsArrow')}
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
                    {t('compareWithTraditionalRentals')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('enterpriseHertz')}</div>
                      <div className="text-2xl font-bold text-red-600 line-through">
                        ${(pricing.totalPrice * 1.8).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">{t('insurancePerDay')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('turoAverage')}</div>
                      <div className="text-2xl font-bold text-red-600 line-through">
                        ${(pricing.totalPrice * 1.3).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">{t('insuranceVaries')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-purple-600">{t('itwhip')}</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${pricing.totalPrice.toFixed(0)}
                      </div>
                      <div className="text-xs text-green-600">{t('insuranceIncludedExclamation')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Membership Options */}
            <section className="py-12 bg-gray-50 dark:bg-gray-950">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  {t('membershipBenefits')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(membershipBenefits).map(([key, membership]) => (
                    <div key={key} className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 ${
                      key === 'monthly' ? 'border-2 border-purple-500' : ''
                    }`}>
                      {key === 'monthly' && (
                        <div className="text-center mb-2">
                          <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                            {t('mostPopular')}
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
                    {t('hotelGuestsAutomatically')}
                  </p>
                  <Link href="/membership" className="text-purple-600 hover:text-purple-700 font-medium">
                    {t('learnMoreAboutMembership')}
                  </Link>
                </div>
              </div>
            </section>

            {/* Why Our Pricing Works */}
            <section className="py-12 bg-white dark:bg-black">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  {t('whyWeCanOfferBetterPrices')}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <IoBusinessOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('hotelPartnershipAdvantage')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('hotelPartnershipDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <IoBarChartOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('dynamicPricingBenefitsEveryone')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('dynamicPricingDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('bulkInsurancePurchasing')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('bulkInsuranceDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <IoPeopleOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('preVerifiedGuestNetwork')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('preVerifiedGuestDescription')}
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
                  {t('hostCommissionStructure')}
                </h2>

                <div className="overflow-x-auto mb-8">
                  <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('vehicleTier')}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {t('commission')}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-purple-600">
                          {t('youKeep')}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {t('insuranceValue')}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                          {t('totalValue')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">{t('economy')}</div>
                          <div className="text-xs text-gray-500">{t('civicCorolla')}</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">15%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">85%</td>
                        <td className="px-4 py-4 text-center text-sm">$300/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">85% + $300</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">{t('standardTier')}</div>
                          <div className="text-xs text-gray-500">{t('camryAccord')}</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">15%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">85%</td>
                        <td className="px-4 py-4 text-center text-sm">$350/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">85% + $350</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">{t('luxury')}</div>
                          <div className="text-xs text-gray-500">{t('bmwMercedes')}</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">18%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">82%</td>
                        <td className="px-4 py-4 text-center text-sm">$450/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">82% + $450</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">{t('premium')}</div>
                          <div className="text-xs text-gray-500">{t('teslaSXSClass')}</div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm">20%</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-purple-600">80%</td>
                        <td className="px-4 py-4 text-center text-sm">$550/mo saved</td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-green-600">80% + $550</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium">{t('exotic')}</div>
                          <div className="text-xs text-gray-500">{t('ferrariLamborghini')}</div>
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
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('newHost')}</h4>
                    <p className="text-xs text-gray-500 mb-2">{t('zeroTo10Trips')}</p>
                    <p className="text-sm font-bold text-purple-600">{t('standardRates')}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                    <IoRibbonOutline className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('silverHost')}</h4>
                    <p className="text-xs text-gray-500 mb-2">{t('tenPlusTrips')}</p>
                    <p className="text-sm font-bold text-purple-600">{t('onePercentCommissionReduction')}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                    <IoDiamondOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('goldHost')}</h4>
                    <p className="text-xs text-gray-500 mb-2">{t('twentyFivePlusTrips')}</p>
                    <p className="text-sm font-bold text-purple-600">{t('twoPercentCommissionReduction')}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                    <IoTrophyOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('platinum')}</h4>
                    <p className="text-xs text-gray-500 mb-2">{t('fiftyPlusTrips')}</p>
                    <p className="text-sm font-bold text-purple-600">{t('threePercentCommissionReduction')}</p>
                  </div>
                </div>

                {/* Fleet Owner Benefits */}
                <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4 text-center">{t('fleetOwnerBenefits')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold mb-1">{t('threeToFiveVehicles')}</div>
                      <div className="text-sm opacity-90">{t('additionalOnePercent')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold mb-1">{t('sixToTenVehicles')}</div>
                      <div className="text-sm opacity-90">{t('additionalTwoPercent')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold mb-1">{t('tenPlusVehicles')}</div>
                      <div className="text-sm opacity-90">{t('customPricingAvailable')}</div>
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
                  {t('comprehensiveProtectionIncluded')}
                </h2>

                {/* Coverage by Tier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="text-center mb-4">
                      <IoShieldCheckmarkOutline className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">{t('economyStandard')}</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('liability')}</span>
                        <span className="font-medium">$750K</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('deductible')}</span>
                        <span className="font-medium">$500</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('guestAge')}</span>
                        <span className="font-medium">21+</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('monthlyValue')}</span>
                        <span className="font-medium text-green-600">$300-350</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-2 border-purple-500">
                    <div className="text-center mb-4">
                      <IoShieldCheckmarkOutline className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">{t('luxuryPremium')}</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('liability')}</span>
                        <span className="font-medium">$1M</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('deductible')}</span>
                        <span className="font-medium">$750-1000</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('guestAge')}</span>
                        <span className="font-medium">25-30+</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('monthlyValue')}</span>
                        <span className="font-medium text-green-600">$450-550</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <div className="text-center mb-4">
                      <IoShieldCheckmarkOutline className="w-12 h-12 text-red-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">{t('exoticTier')}</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('liability')}</span>
                        <span className="font-medium">$2M</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('deductible')}</span>
                        <span className="font-medium">$2,500</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('guestAge')}</span>
                        <span className="font-medium">30+, verified</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('monthlyValue')}</span>
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
                      {t('whatsCovered')}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• {t('thirdPartyLiability')}</li>
                      <li>• {t('physicalDamageProtection')}</li>
                      <li>• {t('theftProtection')}</li>
                      <li>• {t('roadside24_7Coverage')}</li>
                      <li>• {t('medicalPayments')}</li>
                      <li>• {t('uninsuredMotorist')}</li>
                      <li>• {t('legalDefenseCosts')}</li>
                      <li>• {t('lossOfUseCompensation')}</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-400 mb-4 flex items-center">
                      <IoWarningOutline className="w-5 h-5 mr-2" />
                      {t('notCovered')}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• {t('mechanicalBreakdown')}</li>
                      <li>• {t('normalWearAndTear')}</li>
                      <li>• {t('personalBelongings')}</li>
                      <li>• {t('intentionalDamage')}</li>
                      <li>• {t('duiIllegalActivities')}</li>
                      <li>• {t('offRoadDamage')}</li>
                      <li>• {t('racingOrSpeedContests')}</li>
                      <li>• {t('commercialUseBeyondItwhip')}</li>
                    </ul>
                  </div>
                </div>

                {/* Claims Process */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4">
                    {t('claimsResolution')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">1</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('reportIncident')}</p>
                      <p className="text-xs text-gray-500">{t('hotlineAvailable')}</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">2</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('documentDamage')}</p>
                      <p className="text-xs text-gray-500">{t('uploadPhotos')}</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">3</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('getApproval')}</p>
                      <p className="text-xs text-gray-500">{t('within24Hrs')}</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-300">4</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('receivePayment')}</p>
                      <p className="text-xs text-gray-500">{t('fortyEightTo72HrsTotal')}</p>
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
              {t('theItwhipAdvantage')}
            </h2>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-purple-600 mb-3 flex items-center">
                  <IoPeopleOutline className="w-5 h-5 mr-2" />
                  {t('forGuests')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• {t('guestBenefit1')}</li>
                  <li>• {t('guestBenefit2')}</li>
                  <li>• {t('guestBenefit3')}</li>
                  <li>• {t('guestBenefit4')}</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-purple-600 mb-3 flex items-center">
                  <IoCarSportOutline className="w-5 h-5 mr-2" />
                  {t('forHosts')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• {t('hostBenefit1')}</li>
                  <li>• {t('hostBenefit2')}</li>
                  <li>• {t('hostBenefit3')}</li>
                  <li>• {t('hostBenefit4')}</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-purple-600 mb-3 flex items-center">
                  <IoBusinessOutline className="w-5 h-5 mr-2" />
                  {t('forHotels')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• {t('hotelBenefit1')}</li>
                  <li>• {t('hotelBenefit2')}</li>
                  <li>• {t('hotelBenefit3')}</li>
                  <li>• {t('hotelBenefit4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('experienceTheDifference')}
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              {t('fairPricingCompleteProtection')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/rentals"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
              >
                {t('bookACar')}
              </Link>
              <Link
                href="/list-your-car"
                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition"
              >
                {t('listYourCar')}
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-4">
                {t('insuranceDisclaimerText')}
              </p>
              <div className="space-x-4">
                <Link href="/insurance-details" className="hover:text-purple-600">{t('fullInsuranceDetails')}</Link>
                <Link href="/host-agreement" className="hover:text-purple-600">{t('hostAgreement')}</Link>
                <Link href="/terms" className="hover:text-purple-600">{t('terms')}</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}