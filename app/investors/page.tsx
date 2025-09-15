// app/investors/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoRocketOutline,
  IoTrendingUpOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoLockClosedOutline,
  IoDocumentTextOutline,
  IoBarChartOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoCarOutline,
  IoServerOutline,
  IoSparklesOutline,
  IoLeafOutline,
  IoStarOutline,
  IoInformationCircleOutline,
  IoMailOutline,
  IoCallOutline,
  IoCashOutline,
  IoAnalyticsOutline
} from 'react-icons/io5'

export default function InvestorsPage() {
  const router = useRouter()
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    firm: '',
    message: '',
    investmentSize: ''
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Investor inquiry:', formData)
    alert('Thank you for your interest. Our team will contact you within 24 hours.')
    setShowContactForm(false)
  }

  const metrics = [
    { label: 'Annual Recurring Revenue', value: '$2.1M', growth: '+156% YoY' },
    { label: 'Hotel Partners', value: '73', growth: '+210% YoY' },
    { label: 'Monthly Active Users', value: '12K+', growth: '+185% YoY' },
    { label: 'Gross Margin', value: '82%', growth: 'Industry Leading' }
  ]

  const timeline = [
    { year: '2019', event: 'Founded with $300K bootstrap capital', highlight: false },
    { year: '2020', event: 'Platform technology completed', highlight: false },
    { year: '2021', event: 'Amadeus GDS integration achieved', highlight: true },
    { year: '2022', event: 'First hotel partnerships secured', highlight: false },
    { year: '2023', event: 'Reached EBITDA positive', highlight: true },
    { year: '2024', event: 'TU-1-A security certification', highlight: true },
    { year: '2025', event: 'Series A fundraising', highlight: true }
  ]

  const fundAllocation = [
    { category: 'Geographic Expansion', percentage: 35, description: 'Scale to 10 new markets' },
    { category: 'Technology Platform', percentage: 25, description: 'AI optimization, mobile apps' },
    { category: 'Hotel Partnerships', percentage: 20, description: 'Enterprise sales team' },
    { category: 'Marketing & Growth', percentage: 15, description: 'Customer acquisition' },
    { category: 'Working Capital', percentage: 5, description: 'Operations & reserves' }
  ]

  const advantages = [
    {
      icon: IoServerOutline,
      title: 'GDS Integration',
      description: 'Only ground transport platform integrated with Amadeus GDS system'
    },
    {
      icon: IoBusinessOutline,
      title: 'Hotel Network',
      description: '73 partner hotels with exclusive transportation agreements'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'TU-1-A Certified',
      description: 'Enterprise-grade security exceeding industry standards'
    },
    {
      icon: IoLeafOutline,
      title: 'ESG Compliant',
      description: '30% electric fleet, carbon offset program'
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-14 md:mt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-20 lg:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                  EBITDA Positive • Bootstrapped to Profitability
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Series A Fundraising
                <span className="block text-blue-600 mt-2">$5M Target</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Bootstrapped with $300K to profitability. Now scaling the only GDS-integrated 
                ground transportation platform in the $75B addressable market.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
                >
                  Request Investor Deck
                </button>
                <a 
                  href="#metrics"
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600"
                >
                  View Metrics
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section id="metrics" className="py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Proven Traction
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Efficient growth with minimal capital burn
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{metric.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{metric.label}</div>
                  <div className="text-xs text-green-600 font-semibold">{metric.growth}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <IoWalletOutline className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Capital Efficiency</h3>
                  <p className="text-2xl font-bold text-blue-600">$300K</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total invested to date</p>
                </div>
                <div>
                  <IoTrendingUpOutline className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Revenue Multiple</h3>
                  <p className="text-2xl font-bold text-green-600">7x</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue to investment ratio</p>
                </div>
                <div>
                  <IoCashOutline className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Burn Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">Positive</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cash flow positive since 2023</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Market Opportunity
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Disrupting ground transportation through GDS integration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
                <IoGlobeOutline className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Addressable Market</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$450B</p>
                <p className="text-xs text-gray-500">Global ground transportation</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
                <IoBusinessOutline className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Serviceable Market</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$75B</p>
                <p className="text-xs text-gray-500">US hotel transportation</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
                <IoRocketOutline className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Obtainable Market</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$8B</p>
                <p className="text-xs text-gray-500">5-year projection</p>
              </div>
            </div>
          </div>
        </section>

        {/* Growth Timeline */}
        <section className="py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Proven Execution
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                From bootstrap to scale in 6 years
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-center mb-8">
                    <div className="flex-shrink-0 w-20 text-right pr-4">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {item.year}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full ${
                        item.highlight 
                          ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900' 
                          : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 pl-4">
                      <div className={`${
                        item.highlight 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' 
                          : 'bg-gray-50 dark:bg-gray-900'
                      } rounded-lg p-4`}>
                        <p className={`text-sm ${
                          item.highlight 
                            ? 'font-semibold text-blue-900 dark:text-blue-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {item.event}
                        </p>
                      </div>
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className="absolute left-[98px] top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Defensible Moats
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Unique advantages that competitors can't replicate
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {advantages.map((advantage, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <advantage.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-green-50 dark:bg-green-900/20 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                ESG Commitment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <IoLeafOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">30% Electric Fleet</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">By end of 2025</p>
                </div>
                <div>
                  <IoGlobeOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Carbon Neutral</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Offset program active</p>
                </div>
                <div>
                  <IoBusinessOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Local Employment</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">450+ local drivers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use of Funds */}
        <section className="py-16 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Strategic Use of Capital
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                $5M Series A allocation for accelerated growth
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {fundAllocation.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.category}
                      </h3>
                      <span className="text-lg font-bold text-blue-600">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Investment Highlights
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Proven Unit Economics
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        82% gross margins with positive contribution
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Scalable Technology
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Platform handles 100K+ daily transactions
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Clear Path to 10x
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        $20M ARR achievable within 24 months
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Exit Strategy
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Strategic acquisition targets identified
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Investor Resources */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Investor Resources
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Detailed materials available upon request
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <IoDocumentTextOutline className="w-8 h-8 text-blue-600" />
                  <IoLockClosedOutline className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Investor Deck
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  30-slide presentation with detailed financials and projections
                </p>
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Request Access →
                </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <IoBarChartOutline className="w-8 h-8 text-green-600" />
                  <IoLockClosedOutline className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Financial Model
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  5-year financial projections with scenario analysis
                </p>
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Request Access →
                </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <IoAnalyticsOutline className="w-8 h-8 text-purple-600" />
                  <IoLockClosedOutline className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Data Room
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Complete due diligence materials and legal documents
                </p>
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Request Access →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Terms */}
        <section className="py-16 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Series A Terms
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Investment Details</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-white/80">Target Raise:</span>
                      <span className="font-semibold">$5M</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">Pre-Money Valuation:</span>
                      <span className="font-semibold">$20M</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">Minimum Investment:</span>
                      <span className="font-semibold">$250K</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">Type:</span>
                      <span className="font-semibold">Preferred Equity</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Key Metrics</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-white/80">Revenue Multiple:</span>
                      <span className="font-semibold">9.5x</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">Growth Rate:</span>
                      <span className="font-semibold">156% YoY</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">Burn Multiple:</span>
                      <span className="font-semibold">Negative (Profitable)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/80">CAC Payback:</span>
                      <span className="font-semibold">4 months</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-xs text-gray-500 text-center">
              <p className="mb-2">
                <strong>Important Notice:</strong> This presentation contains forward-looking statements that involve risks and uncertainties. 
                Actual results may differ materially from projected results. This is not an offer to sell securities.
              </p>
              <p>
                Investment in ItWhip is only available to accredited investors. Securities offered through registered broker-dealers only.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. Confidential and Proprietary.</p>
              <div className="mt-4 space-x-4">
                <Link href="/about" className="hover:text-gray-700">About</Link>
                <Link href="/press" className="hover:text-gray-700">Press</Link>
                <Link href="/contact" className="hover:text-gray-700">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Investor Inquiry
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                required
              />
              
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                required
              />
              
              <input
                type="text"
                placeholder="Firm / Organization *"
                value={formData.firm}
                onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                required
              />
              
              <select
                value={formData.investmentSize}
                onChange={(e) => setFormData({ ...formData, investmentSize: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                required
              >
                <option value="">Investment Range *</option>
                <option value="250-500k">$250K - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m-2m">$1M - $2M</option>
                <option value="2m+">$2M+</option>
              </select>
              
              <textarea
                placeholder="Message (optional)"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                rows={3}
              />
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}