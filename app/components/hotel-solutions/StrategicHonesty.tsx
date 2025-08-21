// app/components/hotel-solutions/StrategicHonesty.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoCloseCircle,
  IoCheckmarkCircle,
  IoHelpCircle,
  IoWarning,
  IoShield,
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoStarOutline,
  IoBanOutline,
  IoAlertCircleOutline,
  IoSparklesOutline,
  IoTrendingUpOutline,
  IoTimeOutline,
  IoLockOpenOutline,
  IoRocketOutline,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface HonestyItem {
  text: string
  subtext?: string
  icon?: React.ReactNode
}

interface DecisionCriteria {
  title: string
  description: string
  items: string[]
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  iconColor: string
  metrics?: {
    label: string
    value: string
  }[]
}

export default function StrategicHonesty() {
  const [activeDecisionTab, setActiveDecisionTab] = useState<'perfect' | 'good' | 'notfit'>('perfect')
  const [isClient, setIsClient] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'dont' | 'do' | null>(null)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const dontDoItems: HonestyItem[] = [
    { 
      text: "Replace your entire transportation strategy",
      subtext: "We complement, not complicate",
      icon: <IoCloseCircle className="w-4 h-4" />
    },
    { 
      text: "Lock you into long-term contracts",
      subtext: "Month-to-month flexibility always",
      icon: <IoLockOpenOutline className="w-4 h-4" />
    },
    { 
      text: "Charge setup or integration fees",
      subtext: "Zero upfront costs, period",
      icon: <IoWarning className="w-4 h-4" />
    },
    { 
      text: "Handle airport transfers or scheduled rides",
      subtext: "We focus on immediate local needs",
      icon: <IoTimeOutline className="w-4 h-4" />
    },
    { 
      text: "Require minimum volume commitments",
      subtext: "Pay only for what you use",
      icon: <IoBusinessOutline className="w-4 h-4" />
    },
    {
      text: "Force you to change your PMS",
      subtext: "Works with any system you have",
      icon: <IoShield className="w-4 h-4" />
    }
  ]

  const doBetterItems: HonestyItem[] = [
    { 
      text: "Instant availability (under 90 seconds)",
      subtext: "While others promise 5-15 minutes",
      icon: <IoRocketOutline className="w-4 h-4" />
    },
    { 
      text: "True 24/7 coverage with surge protection",
      subtext: "No 3am price spikes or availability gaps",
      icon: <IoShield className="w-4 h-4" />
    },
    { 
      text: "Direct driver-hotel communication",
      subtext: "Skip the middleman delays",
      icon: <IoSparklesOutline className="w-4 h-4" />
    },
    {
      text: "Automated ESG compliance reporting",
      subtext: "One-click CDP and EPA submissions",
      icon: <IoCheckmarkCircle className="w-4 h-4" />
    },
    {
      text: "Revenue generation from transportation",
      subtext: "30% commission on every ride",
      icon: <IoTrendingUpOutline className="w-4 h-4" />
    },
    {
      text: "Zero liability exposure",
      subtext: "No nuclear verdict risks",
      icon: <IoShield className="w-4 h-4" />
    }
  ]

  const decisionFramework: Record<'perfect' | 'good' | 'notfit', DecisionCriteria> = {
    perfect: {
      title: "Perfect Fit Hotels",
      description: "You'll see maximum ROI if you have:",
      items: [
        "250+ rooms in urban/suburban location",
        "High airport transfer volume (30+ daily)",
        "Current shuttle operations costing $100K+",
        "Corporate/business traveler focus",
        "ESG reporting requirements",
        "Guest complaints about transportation"
      ],
      metrics: [
        { label: "Avg ROI", value: "847%" },
        { label: "Payback", value: "42 days" },
        { label: "Monthly Revenue", value: "$67K+" }
      ],
      icon: <IoCheckmarkCircle className="w-6 h-6" />,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      borderColor: "border-green-500",
      iconColor: "text-green-600"
    },
    good: {
      title: "Good Fit Hotels",
      description: "Strong benefits if you have:",
      items: [
        "100-250 rooms anywhere",
        "Moderate airport needs (10-30 daily)",
        "Outsourced transportation currently",
        "Mixed leisure/business guests",
        "Upcoming ESG requirements",
        "Occasional transport issues"
      ],
      metrics: [
        { label: "Avg ROI", value: "412%" },
        { label: "Payback", value: "89 days" },
        { label: "Monthly Revenue", value: "$23K+" }
      ],
      icon: <IoStarOutline className="w-6 h-6" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
      borderColor: "border-blue-500",
      iconColor: "text-blue-600"
    },
    notfit: {
      title: "Not a Fit (Yet)",
      description: "We're not right if you:",
      items: [
        "Have fewer than 50 rooms",
        "Located in rural areas (>30 min from city)",
        "Resort with all-inclusive transport",
        "Zero airport transfer needs",
        "Exclusively long-stay residents",
        "No ESG reporting requirements"
      ],
      metrics: [
        { label: "Min Rooms", value: "50" },
        { label: "Coverage", value: "Urban" },
        { label: "Expansion", value: "2026" }
      ],
      icon: <IoAlertCircleOutline className="w-6 h-6" />,
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
      borderColor: "border-amber-500",
      iconColor: "text-amber-600"
    }
  }

  const currentCriteria = decisionFramework[activeDecisionTab]

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-purple-300 dark:border-purple-800">
            <IoShield className="w-5 sm:w-6 h-5 sm:h-6" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Strategic Transparency</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
            The <span className="text-purple-600">Honest Truth</span> About ItWhip
          </h2>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
            We're radically transparent because trust drives partnerships. 
            <span className="block mt-1 sm:inline sm:mt-0">Here's exactly what we don't do, what we do better, and if we're right for you.</span>
          </p>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="sm:hidden mb-6">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setExpandedSection(expandedSection === 'dont' ? null : 'dont')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                expandedSection === 'dont' 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg' 
                  : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800'
              }`}
            >
              <IoThumbsDownOutline className="w-5 h-5" />
              <span>Don't Do</span>
            </button>
            <button
              onClick={() => setExpandedSection(expandedSection === 'do' ? null : 'do')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                expandedSection === 'do' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                  : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-800'
              }`}
            >
              <IoThumbsUpOutline className="w-5 h-5" />
              <span>Do Better</span>
            </button>
          </div>
        </div>

        {/* Two Column Layout - Desktop / Expandable Mobile */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 mb-12 sm:mb-16">
          {/* What We DON'T Do */}
          <div className={`bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-xl p-6 sm:p-8 border-2 border-red-200 dark:border-red-800 transition-all ${
            expandedSection === 'dont' || !expandedSection ? 'block' : 'hidden sm:block'
          }`}>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <IoCloseCircle className="w-8 sm:w-10 h-8 sm:h-10 text-red-600" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">What We DON'T Do</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
              We're not trying to be everything. Here's what we intentionally don't offer:
            </p>
            <ul className="space-y-3 sm:space-y-4">
              {dontDoItems.map((item, idx) => (
                <li 
                  key={idx} 
                  className={`flex items-start space-x-3 p-2 sm:p-0 rounded-lg transition-all ${
                    hoveredItem === idx ? 'bg-red-100/50 dark:bg-red-900/20' : ''
                  }`}
                  onMouseEnter={() => setHoveredItem(idx)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center space-x-2 mt-0.5">
                    <IoBanOutline className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 flex-shrink-0" />
                    {item.icon && <div className="text-red-400 hidden sm:block">{item.icon}</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{item.text}</p>
                    {item.subtext && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">{item.subtext}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* What We DO Better */}
          <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 sm:p-8 border-2 border-green-200 dark:border-green-800 transition-all ${
            expandedSection === 'do' || !expandedSection ? 'block' : 'hidden sm:block'
          } ${expandedSection === 'dont' ? 'hidden sm:block' : ''}`}>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <IoCheckmarkCircle className="w-8 sm:w-10 h-8 sm:h-10 text-green-600" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">What We DO Better</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
              We focus obsessively on these specific capabilities:
            </p>
            <ul className="space-y-3 sm:space-y-4">
              {doBetterItems.map((item, idx) => (
                <li 
                  key={idx} 
                  className={`flex items-start space-x-3 p-2 sm:p-0 rounded-lg transition-all ${
                    hoveredItem === idx + 10 ? 'bg-green-100/50 dark:bg-green-900/20' : ''
                  }`}
                  onMouseEnter={() => setHoveredItem(idx + 10)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center space-x-2 mt-0.5">
                    <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                    {item.icon && <div className="text-green-500 hidden sm:block">{item.icon}</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{item.text}</p>
                    {item.subtext && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">{item.subtext}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Decision Framework Section */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-3 mb-3 sm:mb-4">
              <IoHelpCircle className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Is ItWhip Right for Your Hotel?</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Use this framework to determine if we're a good match
            </p>
          </div>

          {/* Tabs - Mobile Optimized */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
            <button
              onClick={() => setActiveDecisionTab('perfect')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                activeDecisionTab === 'perfect' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Perfect Fit</span>
              <span className="sm:hidden">Perfect</span>
            </button>
            <button
              onClick={() => setActiveDecisionTab('good')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                activeDecisionTab === 'good' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <IoStarOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Good Fit</span>
              <span className="sm:hidden">Good</span>
            </button>
            <button
              onClick={() => setActiveDecisionTab('notfit')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                activeDecisionTab === 'notfit' 
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <IoAlertCircleOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Not a Fit</span>
              <span className="sm:hidden">Not Yet</span>
            </button>
          </div>

          {/* Content */}
          <div className={`${currentCriteria.bgColor} rounded-xl p-4 sm:p-6 border-2 ${currentCriteria.borderColor}`}>
            {/* Mobile Metrics Bar */}
            {currentCriteria.metrics && (
              <div className="sm:hidden grid grid-cols-3 gap-2 mb-4">
                {currentCriteria.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className={`text-lg font-bold ${currentCriteria.iconColor}`}>{metric.value}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
              <div className={`${currentCriteria.iconColor} mb-3 sm:mb-0 sm:mt-1`}>
                {currentCriteria.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {currentCriteria.title}
                </h4>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                  {currentCriteria.description}
                </p>
                
                {/* Desktop Metrics */}
                {currentCriteria.metrics && (
                  <div className="hidden sm:flex space-x-4 mb-4">
                    {currentCriteria.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-white/50 dark:bg-slate-900/50 rounded-lg px-4 py-2">
                        <p className={`text-xl font-bold ${currentCriteria.iconColor}`}>{metric.value}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <ul className="space-y-2">
                  {currentCriteria.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <IoArrowForwardOutline className={`w-3 sm:w-4 h-3 sm:h-4 ${currentCriteria.iconColor} mt-0.5 flex-shrink-0`} />
                      <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Based on Tab - Mobile Optimized */}
          <div className="mt-6 sm:mt-8 text-center">
            {activeDecisionTab === 'perfect' && (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">
                  <span className="block sm:inline">You could be earning</span>{' '}
                  <span className="text-xl sm:text-lg">$67,000+ monthly</span>{' '}
                  <span className="block sm:inline">within 15 days</span>
                </p>
                <a
                  href="/portal/login"
                  className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
                >
                  <IoBusinessOutline className="w-5 h-5" />
                  <span className="hidden sm:inline">Check Your Hotel's Status</span>
                  <span className="sm:hidden">Check Status</span>
                </a>
              </div>
            )}
            {activeDecisionTab === 'good' && (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400">
                  Let's calculate your specific ROI potential
                </p>
                <button
                  onClick={() => document.getElementById('roi-calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  <IoArrowForwardOutline className="w-5 h-5" />
                  <span className="hidden sm:inline">Calculate Your Revenue</span>
                  <span className="sm:hidden">Calculate ROI</span>
                </button>
              </div>
            )}
            {activeDecisionTab === 'notfit' && (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg font-semibold text-amber-600 dark:text-amber-400">
                  We'll notify you when we expand to your market
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-bold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  <IoWarning className="w-5 h-5" />
                  <span>Join Waiting List</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Info Box */}
        <div className="sm:hidden mt-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-300 dark:border-purple-800">
          <div className="flex items-start space-x-2">
            <IoInformationCircleOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                Need Help Deciding?
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Our hotel success team can analyze your specific situation in 15 minutes.
              </p>
              <a href="/contact" className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-2 inline-block">
                Schedule Free Analysis →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}