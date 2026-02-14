// app/host-requirements/HostRequirementsContent.tsx

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCheckmarkCircle,
  IoCarOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoPhonePortraitOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoBusinessOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoStarOutline,
  IoTrophyOutline,
  IoRocketOutline,
  IoKeyOutline,
  IoBuildOutline,
  IoWaterOutline,
  IoFlashOutline,
  IoThermometerOutline,
  IoConstructOutline,
  IoSparklesOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoMedalOutline,
  IoGlobeOutline,
  IoFingerPrintOutline,
  IoWifiOutline,
  IoCameraOutline,
  IoClipboardOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

export default function HostRequirementsContent() {
  const router = useRouter()
  const t = useTranslations('HostRequirements')
  const [selectedTier, setSelectedTier] = useState('all')
  const [expandedSection, setExpandedSection] = useState('vehicle')
  const [showQuickCheck, setShowQuickCheck] = useState(false)

  // Quick check form state
  const [quickCheckData, setQuickCheckData] = useState({
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    mileage: '',
    hasCleanTitle: '',
    hostAge: ''
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
      nameKey: 'tiers.economy.name',
      icon: IoCarOutline,
      examplesKey: 'tiers.economy.examples',
      color: 'blue',
      requirements: {
        ageKey: 'tiers.economy.reqAge',
        mileageKey: 'tiers.economy.reqMileage',
        conditionKey: 'tiers.economy.reqCondition',
        featuresKey: 'tiers.economy.reqFeatures'
      },
      earningsKey: 'tiers.economy.earnings',
      guestProfileKey: 'tiers.economy.guestProfile'
    },
    {
      id: 'standard',
      nameKey: 'tiers.standard.name',
      icon: IoCarOutline,
      examplesKey: 'tiers.standard.examples',
      color: 'green',
      requirements: {
        ageKey: 'tiers.standard.reqAge',
        mileageKey: 'tiers.standard.reqMileage',
        conditionKey: 'tiers.standard.reqCondition',
        featuresKey: 'tiers.standard.reqFeatures'
      },
      earningsKey: 'tiers.standard.earnings',
      guestProfileKey: 'tiers.standard.guestProfile'
    },
    {
      id: 'luxury',
      nameKey: 'tiers.luxury.name',
      icon: IoDiamondOutline,
      examplesKey: 'tiers.luxury.examples',
      color: 'purple',
      requirements: {
        ageKey: 'tiers.luxury.reqAge',
        mileageKey: 'tiers.luxury.reqMileage',
        conditionKey: 'tiers.luxury.reqCondition',
        featuresKey: 'tiers.luxury.reqFeatures'
      },
      earningsKey: 'tiers.luxury.earnings',
      guestProfileKey: 'tiers.luxury.guestProfile'
    },
    {
      id: 'premium',
      nameKey: 'tiers.premium.name',
      icon: IoStarOutline,
      examplesKey: 'tiers.premium.examples',
      color: 'amber',
      requirements: {
        ageKey: 'tiers.premium.reqAge',
        mileageKey: 'tiers.premium.reqMileage',
        conditionKey: 'tiers.premium.reqCondition',
        featuresKey: 'tiers.premium.reqFeatures'
      },
      earningsKey: 'tiers.premium.earnings',
      guestProfileKey: 'tiers.premium.guestProfile'
    },
    {
      id: 'exotic',
      nameKey: 'tiers.exotic.name',
      icon: IoRocketOutline,
      examplesKey: 'tiers.exotic.examples',
      color: 'red',
      requirements: {
        ageKey: 'tiers.exotic.reqAge',
        mileageKey: 'tiers.exotic.reqMileage',
        conditionKey: 'tiers.exotic.reqCondition',
        featuresKey: 'tiers.exotic.reqFeatures'
      },
      earningsKey: 'tiers.exotic.earnings',
      guestProfileKey: 'tiers.exotic.guestProfile'
    }
  ]

  const universalRequirements = [
    {
      categoryKey: 'universal.vehicleEligibility.title',
      icon: IoCarOutline,
      items: [
        { textKey: 'universal.vehicleEligibility.item1', required: true },
        { textKey: 'universal.vehicleEligibility.item2', required: true },
        { textKey: 'universal.vehicleEligibility.item3', required: true },
        { textKey: 'universal.vehicleEligibility.item4', required: true },
        { textKey: 'universal.vehicleEligibility.item5', required: true }
      ]
    },
    {
      categoryKey: 'universal.safetyFunctionality.title',
      icon: IoShieldCheckmarkOutline,
      items: [
        { textKey: 'universal.safetyFunctionality.item1', required: true },
        { textKey: 'universal.safetyFunctionality.item2', required: true },
        { textKey: 'universal.safetyFunctionality.item3', required: true },
        { textKey: 'universal.safetyFunctionality.item4', required: true },
        { textKey: 'universal.safetyFunctionality.item5', required: true }
      ]
    },
    {
      categoryKey: 'universal.cleanlinessStandards.title',
      icon: IoSparklesOutline,
      items: [
        { textKey: 'universal.cleanlinessStandards.item1', required: true },
        { textKey: 'universal.cleanlinessStandards.item2', required: true },
        { textKey: 'universal.cleanlinessStandards.item3', required: true },
        { textKey: 'universal.cleanlinessStandards.item4', required: true },
        { textKey: 'universal.cleanlinessStandards.item5', required: true }
      ]
    }
  ]

  const hostRequirementsList = [
    {
      categoryKey: 'hostReqs.basicEligibility.title',
      icon: IoPersonOutline,
      items: [
        { textKey: 'hostReqs.basicEligibility.item1', required: true },
        { textKey: 'hostReqs.basicEligibility.item2', required: true },
        { textKey: 'hostReqs.basicEligibility.item3', required: true },
        { textKey: 'hostReqs.basicEligibility.item4', required: true },
        { textKey: 'hostReqs.basicEligibility.item5', required: true }
      ]
    },
    {
      categoryKey: 'hostReqs.operational.title',
      icon: IoTimeOutline,
      items: [
        { textKey: 'hostReqs.operational.item1', required: true },
        { textKey: 'hostReqs.operational.item2', required: false },
        { textKey: 'hostReqs.operational.item3', required: true },
        { textKey: 'hostReqs.operational.item4', required: true },
        { textKey: 'hostReqs.operational.item5', required: true }
      ]
    },
    {
      categoryKey: 'hostReqs.location.title',
      icon: IoLocationOutline,
      items: [
        { textKey: 'hostReqs.location.item1', required: true },
        { textKey: 'hostReqs.location.item2', required: true },
        { textKey: 'hostReqs.location.item3', required: false },
        { textKey: 'hostReqs.location.item4', required: false },
        { textKey: 'hostReqs.location.item5', required: false }
      ]
    }
  ]

  const fleetOwnerBenefits = [
    {
      vehiclesKey: 'fleet.tier1.vehicles',
      benefitKeys: [
        'fleet.tier1.benefit1',
        'fleet.tier1.benefit2',
        'fleet.tier1.benefit3',
        'fleet.tier1.benefit4'
      ],
      icon: IoMedalOutline,
      color: 'bronze'
    },
    {
      vehiclesKey: 'fleet.tier2.vehicles',
      benefitKeys: [
        'fleet.tier2.benefit1',
        'fleet.tier2.benefit2',
        'fleet.tier2.benefit3',
        'fleet.tier2.benefit4'
      ],
      icon: IoRibbonOutline,
      color: 'silver'
    },
    {
      vehiclesKey: 'fleet.tier3.vehicles',
      benefitKeys: [
        'fleet.tier3.benefit1',
        'fleet.tier3.benefit2',
        'fleet.tier3.benefit3',
        'fleet.tier3.benefit4'
      ],
      icon: IoDiamondOutline,
      color: 'gold'
    },
    {
      vehiclesKey: 'fleet.tier4.vehicles',
      benefitKeys: [
        'fleet.tier4.benefit1',
        'fleet.tier4.benefit2',
        'fleet.tier4.benefit3',
        'fleet.tier4.benefit4'
      ],
      icon: IoTrophyOutline,
      color: 'platinum'
    }
  ]

  const notAcceptedKeys = [
    'notAccepted.item1',
    'notAccepted.item2',
    'notAccepted.item3',
    'notAccepted.item4',
    'notAccepted.item5',
    'notAccepted.item6',
    'notAccepted.item7',
    'notAccepted.item8'
  ]

  const inspectionProcess = [
    {
      step: 1,
      titleKey: 'inspection.step1.title',
      descriptionKey: 'inspection.step1.description',
      timeKey: 'inspection.step1.time',
      icon: IoCalendarOutline
    },
    {
      step: 2,
      titleKey: 'inspection.step2.title',
      descriptionKey: 'inspection.step2.description',
      timeKey: 'inspection.step2.time',
      icon: IoClipboardOutline
    },
    {
      step: 3,
      titleKey: 'inspection.step3.title',
      descriptionKey: 'inspection.step3.description',
      timeKey: 'inspection.step3.time',
      icon: IoCameraOutline
    },
    {
      step: 4,
      titleKey: 'inspection.step4.title',
      descriptionKey: 'inspection.step4.description',
      timeKey: 'inspection.step4.time',
      icon: IoCheckmarkCircle
    }
  ]

  const faqItems = [
    { questionKey: 'faq.q1.question', answerKey: 'faq.q1.answer' },
    { questionKey: 'faq.q2.question', answerKey: 'faq.q2.answer' },
    { questionKey: 'faq.q3.question', answerKey: 'faq.q3.answer' },
    { questionKey: 'faq.q4.question', answerKey: 'faq.q4.answer' },
    { questionKey: 'faq.q5.question', answerKey: 'faq.q5.answer' }
  ]

  const handleQuickCheck = () => {
    const year = parseInt(quickCheckData.vehicleYear)
    const mileage = parseInt(quickCheckData.mileage)
    const age = parseInt(quickCheckData.hostAge)

    let qualified = true
    let tier = 'economy'
    let issues: string[] = []

    // Check vehicle year
    if (year < 2015) {
      qualified = false
      issues.push(t('quickCheck.issueYear'))
    }

    // Check mileage
    if (mileage > 130000) {
      qualified = false
      issues.push(t('quickCheck.issueMileage'))
    } else if (mileage < 50000 && year >= 2018) {
      tier = 'premium'
    } else if (mileage < 75000 && year >= 2015) {
      tier = 'luxury'
    } else if (mileage < 100000) {
      tier = 'standard'
    }

    // Check title
    if (quickCheckData.hasCleanTitle === 'no') {
      qualified = false
      issues.push(t('quickCheck.issueTitle'))
    }

    // Check host age
    if (age < 21) {
      qualified = false
      issues.push(t('quickCheck.issueAge'))
    }

    const tierName = t(`tiers.${tier}.name`)
    const tierEarnings = t(`tiers.${tier}.earnings`)

    alert(
      qualified
        ? t('quickCheck.qualified', { tier: tierName, earnings: tierEarnings })
        : t('quickCheck.notQualified', { issues: issues.join(', ') })
    )
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
              <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 rounded">
                {t('badge')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowQuickCheck(!showQuickCheck)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('quickEligibilityCheck')}
              </button>
              <Link
                href="/list-your-car"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                {t('startApplication')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {t('hero.subtitle')}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">2015+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.minimumYear')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">130K</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.maxMiles')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">21+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.hostAge')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">20min</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.inspectionTime')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Check Tool */}
        {showQuickCheck && (
          <section className="py-6 bg-purple-50 dark:bg-purple-900/10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('quickEligibilityCheck')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder={t('quickCheck.vehicleYear')}
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.vehicleYear}
                    onChange={(e) => setQuickCheckData({...quickCheckData, vehicleYear: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder={t('quickCheck.currentMileage')}
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.mileage}
                    onChange={(e) => setQuickCheckData({...quickCheckData, mileage: e.target.value})}
                  />
                  <select
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.hasCleanTitle}
                    onChange={(e) => setQuickCheckData({...quickCheckData, hasCleanTitle: e.target.value})}
                  >
                    <option value="">{t('quickCheck.cleanTitleQuestion')}</option>
                    <option value="yes">{t('quickCheck.cleanTitleYes')}</option>
                    <option value="no">{t('quickCheck.cleanTitleNo')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t('quickCheck.vehicleMake')}
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.vehicleMake}
                    onChange={(e) => setQuickCheckData({...quickCheckData, vehicleMake: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder={t('quickCheck.vehicleModel')}
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.vehicleModel}
                    onChange={(e) => setQuickCheckData({...quickCheckData, vehicleModel: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder={t('quickCheck.yourAge')}
                    className="px-3 py-2 border rounded-lg"
                    value={quickCheckData.hostAge}
                    onChange={(e) => setQuickCheckData({...quickCheckData, hostAge: e.target.value})}
                  />
                </div>
                <button
                  onClick={handleQuickCheck}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                >
                  {t('quickCheck.checkButton')}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Vehicle Tiers */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('tiersSection.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('tiersSection.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicleTiers.map((tier) => (
                <div key={tier.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <tier.icon className="w-8 h-8 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t(tier.nameKey)}
                      </h3>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {t(tier.earningsKey)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t(tier.examplesKey)}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('tiersSection.requirementsLabel')}
                      </h4>
                      <ul className="space-y-1">
                        {Object.values(tier.requirements).map((reqKey) => (
                          <li key={reqKey} className="flex items-start">
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{t(reqKey)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        <strong>{t('tiersSection.guestProfileLabel')}</strong> {t(tier.guestProfileKey)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Universal Requirements */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('universalSection.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('universalSection.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {universalRequirements.map((category, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <category.icon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t(category.categoryKey)}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start">
                        {item.required ? (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <IoInformationCircleOutline className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t(item.textKey)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Host Requirements */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('hostReqsSection.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('hostReqsSection.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hostRequirementsList.map((category, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <category.icon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t(category.categoryKey)}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start">
                        {item.required ? (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <IoStarOutline className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${item.required ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {t(item.textKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inspection Process */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('inspectionSection.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('inspectionSection.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {inspectionProcess.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('inspectionSection.stepLabel', { number: step.step })}: {t(step.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t(step.descriptionKey)}
                  </p>
                  <span className="text-xs text-purple-600 font-semibold">
                    {t(step.timeKey)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('inspectionSection.availability')}
              </p>
              <Link
                href="/list-your-car"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
              >
                {t('inspectionSection.scheduleButton')}
              </Link>
            </div>
          </div>
        </section>

        {/* Fleet Owner Benefits */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {t('fleetSection.title')}
              </h2>
              <p className="text-purple-100">
                {t('fleetSection.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fleetOwnerBenefits.map((tier, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <tier.icon className="w-10 h-10 text-white mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {t(tier.vehiclesKey)}
                  </h3>
                  <ul className="space-y-2">
                    {tier.benefitKeys.map((benefitKey, bIdx) => (
                      <li key={bIdx} className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-purple-100">{t(benefitKey)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-purple-100 mb-4">
                {t('fleetSection.ctaText')}
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition"
              >
                {t('fleetSection.ctaButton')}
              </Link>
            </div>
          </div>
        </section>

        {/* What We Don't Accept */}
        <section className="py-12 sm:py-16 bg-red-50 dark:bg-red-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('notAcceptedSection.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('notAcceptedSection.subtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notAcceptedKeys.map((key, idx) => (
                  <div key={idx} className="flex items-start">
                    <IoCloseCircleOutline className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{t(key)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('faqSection.title')}
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t(faq.questionKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(faq.answerKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t('cta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/list-your-car"
                className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
              >
                {t('cta.checkVehicle')}
              </Link>
              <Link
                href="/host-earnings"
                className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition border-2 border-purple-600"
              >
                {t('cta.calculateEarnings')}
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>{t('cta.freeInspection')}</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>{t('cta.instantApproval')}</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>{t('cta.noFees')}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
