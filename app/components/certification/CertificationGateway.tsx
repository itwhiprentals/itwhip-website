// app/components/certification/CertificationGateway.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  IoShieldCheckmarkOutline,
  IoRocketOutline,
  IoTrophyOutline,
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoStarOutline,
  IoTrendingUpOutline,
  IoCashOutline,
  IoCarOutline,
  IoLeafOutline,
  IoAnalyticsOutline,
  IoInfiniteOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoGlobeOutline,
  IoCallOutline,
  IoMailOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoWalletOutline,
  IoCloseOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

export const CertificationGateway = () => {
  const [selectedTier, setSelectedTier] = useState<'TU-1' | 'TU-2' | 'TU-3'>('TU-1')
  const [selectedGrade, setSelectedGrade] = useState<'A' | 'B' | 'C'>('A')
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [hotelSize, setHotelSize] = useState<'small' | 'medium' | 'large' | 'enterprise'>('medium')
  const [includeTransportation, setIncludeTransportation] = useState(true)
  
  // Pricing structure for TU Certification
  const pricingTiers = {
    'TU-1': {
      name: 'TU-1 Elite Protection',
      description: 'Maximum security with real-time monitoring',
      grades: {
        'A': { 
          small: 2500, 
          medium: 4500, 
          large: 7500, 
          enterprise: 12500,
          features: [
            '24/7 SOC', 
            'Quantum encryption', 
            'Zero-trust architecture', 
            'AI threat hunting',
            'Full ESG tracking & reporting',
            'Carbon credit generation',
            'Real-time compliance validation'
          ]
        },
        'B': { 
          small: 2000, 
          medium: 3500, 
          large: 6000, 
          enterprise: 10000,
          features: [
            'Business hours SOC', 
            'Advanced encryption', 
            'Multi-factor auth', 
            'Weekly scans',
            'Standard ESG metrics',
            'Quarterly ESG reports'
          ]
        },
        'C': { 
          small: 1500, 
          medium: 2500, 
          large: 4500, 
          enterprise: 7500,
          features: [
            'Basic monitoring', 
            'Standard encryption', 
            'Basic auth', 
            'Monthly scans',
            'Basic ESG tracking'
          ]
        }
      },
      compliance: ['SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA', 'GDPR', 'CCPA', 'FedRAMP', 'CSRD']
    },
    'TU-2': {
      name: 'TU-2 Business Shield',
      description: 'Comprehensive protection for growing businesses',
      grades: {
        'A': { 
          small: 1500, 
          medium: 2500, 
          large: 4500, 
          enterprise: 7500,
          features: [
            '16/7 monitoring', 
            'Strong encryption', 
            'Compliance automation', 
            'Threat alerts',
            'Standard ESG metrics',
            'Monthly ESG reports'
          ]
        },
        'B': { 
          small: 1200, 
          medium: 2000, 
          large: 3500, 
          enterprise: 6000,
          features: [
            'Business hours monitoring', 
            'Standard encryption', 
            'Compliance reports', 
            'Email alerts',
            'Quarterly ESG tracking'
          ]
        },
        'C': { 
          small: 900, 
          medium: 1500, 
          large: 2500, 
          enterprise: 4500,
          features: [
            'Basic monitoring', 
            'Basic encryption', 
            'Annual reports', 
            'Dashboard access',
            'Annual sustainability report'
          ]
        }
      },
      compliance: ['SOC 2', 'ISO 27001', 'PCI DSS', 'GDPR']
    },
    'TU-3': {
      name: 'TU-3 Starter Security',
      description: 'Essential protection for small operations',
      grades: {
        'A': { 
          small: 750, 
          medium: 1250, 
          large: 2250, 
          enterprise: 3750,
          features: [
            'Daily monitoring', 
            'SSL/TLS', 
            'Basic compliance', 
            'Security dashboard',
            'Basic ESG tracking',
            'Annual sustainability report'
          ]
        },
        'B': { 
          small: 600, 
          medium: 1000, 
          large: 1750, 
          enterprise: 3000,
          features: [
            'Weekly checks', 
            'Basic SSL', 
            'Compliance checklist', 
            'Monthly reports'
          ]
        },
        'C': { 
          small: 450, 
          medium: 750, 
          large: 1250, 
          enterprise: 2250,
          features: [
            'Monthly checks', 
            'Basic security', 
            'Self-service tools', 
            'Quarterly reports'
          ]
        }
      },
      compliance: ['PCI DSS', 'Basic GDPR']
    }
  }

  // Transportation add-on pricing (revenue share model)
  const transportationAddOn = {
    small: { setup: 0, revenueShare: '15%', estimatedMonthly: 8500 },
    medium: { setup: 0, revenueShare: '15%', estimatedMonthly: 22500 },
    large: { setup: 0, revenueShare: '15%', estimatedMonthly: 67500 },
    enterprise: { setup: 0, revenueShare: '15%', estimatedMonthly: 125000 }
  }

  useEffect(() => {
    const basePrice = pricingTiers[selectedTier].grades[selectedGrade][hotelSize]
    const totalPrice = basePrice
    setCalculatedPrice(totalPrice)
  }, [selectedTier, selectedGrade, hotelSize])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getComparisonSavings = () => {
    const traditionalCosts = {
      small: 45000,
      medium: 125000,
      large: 350000,
      enterprise: 750000
    }
    const ourCost = calculatedPrice * 12 // Annual
    const savings = traditionalCosts[hotelSize] - ourCost
    const percentSaved = Math.round((savings / traditionalCosts[hotelSize]) * 100)
    return { savings, percentSaved }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">LIMITED TIME OFFER</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">
            Get Your TU Certification Today
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join 487+ hotels already saving ${formatPrice(getComparisonSavings().savings)}/year 
            while improving security and generating new revenue
          </p>
          
          {/* Comprehensive Details Link */}
          <a 
            href="/security/certification/details" 
            className="inline-flex items-center space-x-2 text-purple-300 hover:text-white mt-4 transition-colors"
          >
            <IoDocumentTextOutline className="w-5 h-5" />
            <span>View comprehensive TU certification details</span>
            <IoArrowForwardOutline className="w-5 h-5" />
          </a>
        </div>

        {/* Certification Selector */}
        <div className="mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Choose Your Protection Level
            </h3>
            
            {/* Tier Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {(['TU-1', 'TU-2', 'TU-3'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedTier === tier
                      ? 'border-purple-400 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-white">{tier}</span>
                    {tier === 'TU-1' && <IoTrophyOutline className="w-6 h-6 text-yellow-400" />}
                    {tier === 'TU-2' && <IoBusinessOutline className="w-6 h-6 text-silver" />}
                    {tier === 'TU-3' && <IoShieldCheckmarkOutline className="w-6 h-6 text-bronze" />}
                  </div>
                  <p className="text-sm text-gray-300 text-left">
                    {pricingTiers[tier].description}
                  </p>
                  <a 
                    href={`/security/certification/details#${tier.toLowerCase()}`}
                    className="text-xs text-purple-300 hover:text-purple-200 underline mt-2 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn more about {tier} →
                  </a>
                </button>
              ))}
            </div>

            {/* Grade Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Select Grade (A = Highest, C = Basic)
                <a 
                  href="/security/certification/details#grades" 
                  className="ml-2 inline-flex items-center text-xs text-purple-300 hover:text-purple-200"
                >
                  <IoInformationCircleOutline className="w-4 h-4 mr-1" />
                  What do grades mean?
                </a>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['A', 'B', 'C'] as const).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedGrade === grade
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl font-bold text-white">Grade {grade}</span>
                    <div className="mt-2">
                      {grade === 'A' && <div className="flex justify-center">⭐⭐⭐⭐⭐</div>}
                      {grade === 'B' && <div className="flex justify-center">⭐⭐⭐⭐</div>}
                      {grade === 'C' && <div className="flex justify-center">⭐⭐⭐</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hotel Size Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Property Size
              </label>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { id: 'small', label: '< 100 rooms', rooms: '1-99' },
                  { id: 'medium', label: '100-300 rooms', rooms: '100-300' },
                  { id: 'large', label: '300-500 rooms', rooms: '301-500' },
                  { id: 'enterprise', label: '500+ rooms', rooms: '500+' }
                ].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setHotelSize(size.id as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      hotelSize === size.id
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-semibold">{size.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{size.rooms}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transportation Add-on */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center">
                    <IoCarOutline className="w-5 h-5 mr-2" />
                    Transportation Revenue Module
                  </h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Turn your shuttle service into a profit center with our revenue-sharing model
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mr-2" />
                      <span>Zero setup fees - we handle everything</span>
                    </li>
                    <li className="flex items-center">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mr-2" />
                      <span>Keep 85% of all ride revenue</span>
                    </li>
                    <li className="flex items-center">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400 mr-2" />
                      <span>Estimated: +{formatPrice(transportationAddOn[hotelSize].estimatedMonthly)}/month</span>
                    </li>
                    <li className="flex items-center">
                      <IoLeafOutline className="w-4 h-4 text-green-400 mr-2" />
                      <span>Full ESG tracking for transportation emissions</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setIncludeTransportation(!includeTransportation)}
                  className={`p-3 rounded-lg transition-all ${
                    includeTransportation
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {includeTransportation ? '✓ INCLUDED' : 'ADD'}
                </button>
              </div>
            </div>

            {/* Features for Selected Configuration */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4">
                Included in {selectedTier}-{selectedGrade} Certification:
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {pricingTiers[selectedTier].grades[selectedGrade].features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Compliance Coverage */}
              <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <h5 className="text-sm font-semibold text-blue-300 mb-2">Compliance Coverage:</h5>
                <div className="flex flex-wrap gap-2">
                  {pricingTiers[selectedTier].compliance.map((comp) => (
                    <span key={comp} className="px-3 py-1 bg-blue-500/30 rounded-full text-xs text-blue-200">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Display */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-center">
              <div className="text-sm text-purple-200 mb-2">Your Investment:</div>
              <div className="text-5xl font-bold text-white mb-2">
                {formatPrice(calculatedPrice)}
                <span className="text-lg font-normal">/month</span>
              </div>
              
              {includeTransportation && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <div className="text-green-300 font-semibold mb-1">
                    + Transportation Revenue Share: 15%
                  </div>
                  <div className="text-sm text-gray-300">
                    Projected Revenue: {formatPrice(transportationAddOn[hotelSize].estimatedMonthly)}/month
                  </div>
                  <div className="text-xs text-purple-200 mt-2">
                    Net Profit After Certification: {formatPrice(transportationAddOn[hotelSize].estimatedMonthly - calculatedPrice)}/month
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-black/30 rounded-lg">
                <div className="text-sm text-gray-300 mb-2">
                  Compared to traditional compliance costs:
                </div>
                <div className="text-2xl font-bold text-green-400">
                  Save {formatPrice(getComparisonSavings().savings)}/year ({getComparisonSavings().percentSaved}%)
                </div>
                <div className="mt-4 text-xs text-purple-200">
                  Have existing certifications? 
                  <a href="/security/certification/details#shield" className="underline ml-1 hover:text-white">
                    Learn about Shield Booster discounts
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Instant Setup */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <IoFlashOutline className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Instant Setup</h3>
            <p className="text-sm text-gray-300 mb-4">
              Get certified in 24 hours, not 6 months
            </p>
            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Start Now →
            </button>
          </div>

          {/* Schedule Demo */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <IoCallOutline className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Talk to Expert</h3>
            <p className="text-sm text-gray-300 mb-4">
              15-minute call with our security team
            </p>
            <a
              href="/demo"
              className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors text-center"
            >
              Schedule Call →
            </a>
          </div>

          {/* Download Guide */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <IoDocumentTextOutline className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Free Guide</h3>
            <p className="text-sm text-gray-300 mb-4">
              "How 487 Hotels Save $2M on Compliance"
            </p>
            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-400 transition-colors">
              Download PDF →
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <IoShieldCheckmarkOutline className="w-5 h-5" />
              <span className="text-sm">Bank-level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoLockClosedOutline className="w-5 h-5" />
              <span className="text-sm">SOC 2 Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoGlobeOutline className="w-5 h-5" />
              <span className="text-sm">487+ Hotels Protected</span>
            </div>
          </div>
        </div>

        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-2xl w-full border border-purple-500/30">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Complete Your {selectedTier}-{selectedGrade} Certification
                </h3>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <IoCloseOutline className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Certification Level:</span>
                    <span className="text-white font-semibold">{selectedTier}-{selectedGrade}</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Property Size:</span>
                    <span className="text-white font-semibold capitalize">{hotelSize}</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Monthly Investment:</span>
                    <span className="text-white font-bold text-xl">{formatPrice(calculatedPrice)}</span>
                  </div>
                </div>
                {includeTransportation && (
                  <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                    <div className="flex justify-between items-center">
                      <span className="text-green-300">Transportation Revenue (est.):</span>
                      <span className="text-green-400 font-bold">+{formatPrice(transportationAddOn[hotelSize].estimatedMonthly)}/mo</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href={`/portal/signup?tier=${selectedTier}&grade=${selectedGrade}&size=${hotelSize}&transport=${includeTransportation}`}
                  className="block text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Proceed to Signup →
                </a>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  Review Options
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}