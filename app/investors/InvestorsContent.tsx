// app/investors/InvestorsContent.tsx

'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import InvestorInquiryBottomSheet from '@/app/components/InvestorInquiryBottomSheet'
import {
  IoRocketOutline,
  IoTrendingUpOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoLockClosedOutline,
  IoDocumentTextOutline,
  IoBarChartOutline,
  IoCarOutline,
  IoLeafOutline,
  IoInformationCircleOutline,
  IoCashOutline,
  IoAnalyticsOutline
} from 'react-icons/io5'

export default function InvestorsContent() {
  const [showContactForm, setShowContactForm] = useState(false)

  const metrics = [
    { label: 'Vehicles Listed', value: '100+', growth: 'Growing Weekly' },
    { label: 'Arizona Cities', value: '18', growth: 'Statewide Coverage' },
    { label: 'Host Earnings', value: '40-90%', growth: 'Industry Leading' },
    { label: 'Insurance Coverage', value: '$1M', growth: 'Per Trip' }
  ]

  const timeline = [
    { year: '2023', event: 'ItWhip Technologies, Inc. first ride in Phoenix, AZ', highlight: true },
    { year: 'Sep 2024', event: 'Insurance tier system launched (40-90% host payouts)', highlight: false },
    { year: 'Oct 2024', event: 'Statewide expansion to 18 Arizona cities', highlight: true },
    { year: 'Dec 2024', event: 'Mileage Forensics™ & MaxAC™ certification launched', highlight: true },
    { year: 'Q2 2025', event: 'Native iOS & Android apps with digital key technology', highlight: true },
    { year: '2025', event: 'Series A fundraising for Southwest expansion', highlight: true }
  ]

  const fundAllocation = [
    { category: 'Southwest Expansion', percentage: 35, description: 'Nevada, New Mexico, Texas markets' },
    { category: 'Technology Platform', percentage: 25, description: 'Mobile apps, digital keys, AI pricing' },
    { category: 'Host Acquisition', percentage: 20, description: 'Fleet growth & host incentives' },
    { category: 'Marketing & Growth', percentage: 15, description: 'Guest acquisition & brand building' },
    { category: 'Working Capital', percentage: 5, description: 'Operations & reserves' }
  ]

  const advantages = [
    {
      icon: IoCarOutline,
      title: 'Arizona-First Focus',
      description: 'Built specifically for the desert environment with MaxAC™ certification'
    },
    {
      icon: IoTrendingUpOutline,
      title: '40-90% Host Payouts',
      description: 'Industry-leading earnings based on insurance tier flexibility'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Mileage Forensics™',
      description: 'Complete odometer verification and transparency for every trip'
    },
    {
      icon: IoLeafOutline,
      title: 'ESG Verified Fleet',
      description: 'Environmental impact scoring for every vehicle'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-14 md:mt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-14 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-6">
                <IoCarOutline className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  Arizona's First P2P Car Sharing Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Series A Fundraising
                <span className="block text-amber-600 mt-2">$5M Target</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                Arizona's premier peer-to-peer car sharing platform, purpose-built for the desert.
                We're capturing share in the <span className="font-semibold text-gray-900 dark:text-white">$35B US rental market</span> with
                transparent pricing and <span className="font-semibold text-amber-600">40-90% host payouts</span>—the highest in the industry.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition shadow-lg"
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
        <section id="metrics" className="pb-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Proven Traction
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Efficient growth with minimal capital burn
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">{metric.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{metric.label}</div>
                  <div className="text-xs text-green-600 font-semibold">{metric.growth}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <IoCarOutline className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Vehicle Types</h3>
                  <p className="text-xl font-bold text-amber-600">Economy to Exotic</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Full fleet diversity</p>
                </div>
                <div>
                  <IoTrendingUpOutline className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Host Economics</h3>
                  <p className="text-xl font-bold text-green-600">40-90%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Payouts based on insurance tier</p>
                </div>
                <div>
                  <IoCashOutline className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Avg Host Earnings</h3>
                  <p className="text-xl font-bold text-purple-600">$850/mo</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Supplemental income per vehicle</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="pb-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Market Opportunity
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Disrupting the traditional car rental market with peer-to-peer innovation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 text-center">
                <IoGlobeOutline className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Addressable Market</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$35B</p>
                <p className="text-xs text-gray-500">US car rental industry</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 text-center">
                <IoBusinessOutline className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">Serviceable Market</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$5B</p>
                <p className="text-xs text-gray-500">P2P car sharing (Turo, Getaround)</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 text-center">
                <IoRocketOutline className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">Obtainable Market</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$500M</p>
                <p className="text-xs text-gray-500">Southwest US 5-year target</p>
              </div>
            </div>
          </div>
        </section>

        {/* Growth Timeline */}
        <section className="pb-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Rapid Execution
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                From first ride to statewide coverage in under 2 years
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="relative pl-8 border-l-2 border-amber-200 dark:border-amber-800">
                {timeline.map((item, idx) => (
                  <div key={idx} className={`relative ${idx < timeline.length - 1 ? 'pb-8' : ''}`}>
                    {/* Timeline dot */}
                    <div className={`absolute -left-[25px] w-4 h-4 rounded-full ${
                      item.highlight
                        ? 'bg-amber-600 ring-4 ring-amber-100 dark:ring-amber-900/50'
                        : 'bg-gray-400 dark:bg-gray-600'
                    }`}></div>

                    {/* Content */}
                    <div className="ml-4">
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        item.highlight
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {item.year}
                      </span>
                      <div className={`mt-1 ${
                        item.highlight
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500'
                          : 'bg-gray-50 dark:bg-gray-800'
                      } rounded-r-lg p-3`}>
                        <p className={`text-sm ${
                          item.highlight
                            ? 'font-medium text-amber-900 dark:text-amber-200'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {item.event}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="pb-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Defensible Moats
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Unique advantages that competitors can't replicate
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {advantages.map((advantage, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <advantage.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {advantage.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center">
                ESG Commitment
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <IoLeafOutline className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">30% Electric Fleet</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">By end of 2025</p>
                </div>
                <div>
                  <IoGlobeOutline className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Carbon Neutral</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Offset program active</p>
                </div>
                <div>
                  <IoBusinessOutline className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Local Employment</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">450+ local drivers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use of Funds */}
        <section className="pb-8 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Strategic Use of Capital
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                $5M Series A allocation for accelerated growth
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                {fundAllocation.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.category}
                      </h3>
                      <span className="text-sm font-bold text-blue-600">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Investment Highlights
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        Proven Unit Economics
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        82% gross margins with positive contribution
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        Scalable Technology
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Platform handles 100K+ daily transactions
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        Clear Path to 10x
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        $20M ARR achievable within 24 months
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
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
        <section className="pb-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Investor Resources
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Detailed materials available upon request
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
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

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
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

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
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
        <section className="pb-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Series A Terms
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Important Information
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    This presentation contains forward-looking statements that involve risks and uncertainties. Actual results may differ materially from projected results. This is not an offer to sell securities. Investment in ItWhip is only available to accredited investors. Securities offered through registered broker-dealers only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>

      {/* Investor Inquiry Bottomsheet */}
      <InvestorInquiryBottomSheet
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />
    </div>
  )
}