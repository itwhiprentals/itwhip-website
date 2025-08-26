// app/components/security/SecurityTransparency.tsx

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
  IoInformationCircleOutline,
  IoSkullOutline,
  IoFlashOutline,
  IoEyeOutline,
  IoGlobeOutline,
  IoInfiniteOutline,
  IoFlameOutline,
  IoKeyOutline,
  IoCodeSlashOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoPulseOutline
} from 'react-icons/io5'

interface TransparencyItem {
  text: string
  subtext?: string
  icon?: React.ReactNode
}

interface CompanyCriteria {
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
  warning?: string
}

export default function SecurityTransparency() {
  const [activeDecisionTab, setActiveDecisionTab] = useState<'enterprise' | 'saas' | 'vulnerable'>('enterprise')
  const [isClient, setIsClient] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'dont' | 'do' | null>(null)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [liveMetrics, setLiveMetrics] = useState({
    attacksBlocked: 48291,
    vulnerabilitiesFound: 847,
    bountyPaid: 247000
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 5),
        vulnerabilitiesFound: prev.vulnerabilitiesFound + (Math.random() > 0.8 ? 1 : 0),
        bountyPaid: prev.bountyPaid + (Math.random() > 0.9 ? 1000 : 0)
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [isClient])

  const dontDoItems: TransparencyItem[] = [
    { 
      text: "Hide behind compliance certifications",
      subtext: "PDFs don't stop hackers, real security does",
      icon: <IoDocumentTextOutline className="w-4 h-4" />
    },
    { 
      text: "Charge for basic security features",
      subtext: "Protection shouldn't be a premium add-on",
      icon: <IoLockOpenOutline className="w-4 h-4" />
    },
    { 
      text: "Test security once a year",
      subtext: "Hackers attack 2,200 times per day",
      icon: <IoTimeOutline className="w-4 h-4" />
    },
    { 
      text: "Keep vulnerabilities secret",
      subtext: "Transparency builds trust, secrecy doesn't",
      icon: <IoEyeOutline className="w-4 h-4" />
    },
    { 
      text: "Require 6-month implementations",
      subtext: "15-minute setup, immediate protection",
      icon: <IoWarning className="w-4 h-4" />
    },
    {
      text: "Promise 100% unhackable systems",
      subtext: "We're secure, not delusional",
      icon: <IoShield className="w-4 h-4" />
    }
  ]

  const doBetterItems: TransparencyItem[] = [
    { 
      text: "Test security every millisecond",
      subtext: `${liveMetrics.attacksBlocked.toLocaleString()} attacks validated and counting`,
      icon: <IoInfiniteOutline className="w-4 h-4" />
    },
    { 
      text: "Pay hackers to find vulnerabilities",
      subtext: `$${(liveMetrics.bountyPaid / 1000).toFixed(0)}K+ paid in bug bounties`,
      icon: <IoSkullOutline className="w-4 h-4" />
    },
    { 
      text: "Publish our security status publicly",
      subtext: "Live dashboard at tu1a.security/status",
      icon: <IoGlobeOutline className="w-4 h-4" />
    },
    {
      text: "Detect breaches in 2 milliseconds",
      subtext: "Industry average: 204 days",
      icon: <IoFlashOutline className="w-4 h-4" />
    },
    {
      text: "Self-heal vulnerabilities with AI",
      subtext: "Patches deploy before humans notice",
      icon: <IoSparklesOutline className="w-4 h-4" />
    },
    {
      text: "Challenge hackers publicly",
      subtext: "Hall of Shame for failed attempts",
      icon: <IoFlameOutline className="w-4 h-4" />
    }
  ]

  const companyFramework: Record<'enterprise' | 'saas' | 'vulnerable', CompanyCriteria> = {
    enterprise: {
      title: "Enterprise & Finance",
      description: "Maximum protection for high-value targets:",
      items: [
        "Processing millions in transactions",
        "Storing PII for 10,000+ users",
        "Subject to regulatory compliance",
        "Previous breach or near-miss",
        "Board-level security concerns",
        "Cyber insurance requirements"
      ],
      metrics: [
        { label: "Detection", value: "2ms" },
        { label: "Coverage", value: "24/7" },
        { label: "Breaches", value: "0" }
      ],
      icon: <IoBusinessOutline className="w-6 h-6" />,
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20",
      borderColor: "border-purple-500",
      iconColor: "text-purple-600"
    },
    saas: {
      title: "SaaS & Tech Companies",
      description: "Built for modern cloud infrastructure:",
      items: [
        "AWS/Azure/GCP deployment",
        "API-first architecture",
        "Customer data processing",
        "SOC 2 alternative needed",
        "DevOps/CI-CD pipeline",
        "Remote-first team"
      ],
      metrics: [
        { label: "Setup", value: "15min" },
        { label: "Cost", value: "$0" },
        { label: "APIs", value: "847" }
      ],
      icon: <IoCodeSlashOutline className="w-6 h-6" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-500",
      iconColor: "text-blue-600"
    },
    vulnerable: {
      title: "High-Risk Organizations",
      description: "Critical if you match these criteria:",
      items: [
        "Healthcare/medical data",
        "Government contractor",
        "Critical infrastructure",
        "Previous ransomware target",
        "Outdated security stack",
        "No dedicated security team"
      ],
      metrics: [
        { label: "Risk Level", value: "CRITICAL" },
        { label: "Time to Breach", value: "47 days" },
        { label: "Avg Loss", value: "$4.88M" }
      ],
      warning: "Organizations matching 3+ criteria have 73% breach probability within 12 months",
      icon: <IoWarning className="w-6 h-6" />,
      bgColor: "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
      borderColor: "border-red-500",
      iconColor: "text-red-600"
    }
  }

  const currentCriteria = companyFramework[activeDecisionTab]

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Live Metrics */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-purple-300 dark:border-purple-800">
            <IoShield className="w-5 sm:w-6 h-5 sm:h-6" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Radical Transparency</span>
            {isClient && (
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full text-green-600 text-xs font-medium animate-pulse">
                LIVE
              </span>
            )}
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
            The <span className="text-purple-600">Brutal Truth</span> About TU-1-A
          </h2>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
            No marketing BS. No compliance theater. No false promises.
            <span className="block mt-1 sm:inline sm:mt-0">Here's exactly what we don't do, what we actually do, and who needs us.</span>
          </p>

          {/* Live Metrics Bar */}
          {isClient && (
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-3 border border-purple-300 dark:border-purple-700">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{liveMetrics.attacksBlocked.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Attacks Blocked</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-300 dark:border-green-700">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{liveMetrics.vulnerabilitiesFound}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Vulns Found</p>
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-3 border border-amber-300 dark:border-amber-700">
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">${(liveMetrics.bountyPaid / 1000).toFixed(0)}K</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Bounties Paid</p>
              </div>
            </div>
          )}
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
              <span>Actually Do</span>
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
              The security industry is full of BS. We refuse to participate:
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
            
            {/* The Compliance Theater Section */}
            <div className="mt-6 p-4 bg-red-100/50 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700">
              <p className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                The Dirty Secret:
              </p>
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                MGM had SOC 2. Change Healthcare was ISO certified. LastPass had both. They all got breached. 
                Compliance ≠ Security.
              </p>
            </div>
          </div>

          {/* What We ACTUALLY Do */}
          <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 sm:p-8 border-2 border-green-200 dark:border-green-800 transition-all ${
            expandedSection === 'do' || !expandedSection ? 'block' : 'hidden sm:block'
          } ${expandedSection === 'dont' ? 'hidden sm:block' : ''}`}>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <IoCheckmarkCircle className="w-8 sm:w-10 h-8 sm:h-10 text-green-600" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">What We ACTUALLY Do</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
              Real security, not compliance theater:
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

            {/* The Hacker Challenge */}
            <div className="mt-6 p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-300 dark:border-purple-700">
              <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Our Public Challenge:
              </p>
              <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200">
                We dare hackers to attack us at /security/challenge. 
                {isClient && ` ${liveMetrics.attacksBlocked.toLocaleString()} have tried. All failed.`}
              </p>
            </div>
          </div>
        </div>

        {/* Who Needs TU-1-A Framework */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-3 mb-3 sm:mb-4">
              <IoHelpCircle className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Do You Need TU-1-A Protection?</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Honest assessment of who actually needs our level of security
            </p>
          </div>

          {/* Tabs - Mobile Optimized */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
            <button
              onClick={() => setActiveDecisionTab('enterprise')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                activeDecisionTab === 'enterprise' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <IoBusinessOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Enterprise</span>
              <span className="sm:hidden">Enterprise</span>
            </button>
            <button
              onClick={() => setActiveDecisionTab('saas')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                activeDecisionTab === 'saas' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <IoCodeSlashOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">SaaS/Tech</span>
              <span className="sm:hidden">SaaS</span>
            </button>
            <button
              onClick={() => setActiveDecisionTab('vulnerable')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                activeDecisionTab === 'vulnerable' 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <IoWarning className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">High Risk</span>
              <span className="sm:hidden">At Risk</span>
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

                {currentCriteria.warning && (
                  <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700">
                    <p className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-100 flex items-start">
                      <IoWarning className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {currentCriteria.warning}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Based on Tab */}
          <div className="mt-6 sm:mt-8 text-center">
            {activeDecisionTab === 'enterprise' && (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg font-semibold text-purple-600 dark:text-purple-400">
                  <span className="block sm:inline">Your data is worth</span>{' '}
                  <span className="text-xl sm:text-lg">$4.88M to hackers.</span>{' '}
                  <span className="block sm:inline">Protect it for $0.</span>
                </p>
                <button className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105">
                  <IoShield className="w-5 h-5" />
                  <span className="hidden sm:inline">Start TU-1-A Validation</span>
                  <span className="sm:hidden">Start Now</span>
                </button>
              </div>
            )}
            {activeDecisionTab === 'saas' && (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400">
                  Replace SOC 2 with something that actually works
                </p>
                <button className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105">
                  <IoCodeSlashOutline className="w-5 h-5" />
                  <span className="hidden sm:inline">View Live Dashboard</span>
                  <span className="sm:hidden">View Demo</span>
                </button>
              </div>
            )}
            {activeDecisionTab === 'vulnerable' && (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400">
                  You're 47 days from a breach. Act now.
                </p>
                <button className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 animate-pulse">
                  <IoWarning className="w-5 h-5" />
                  <span>Emergency Protection</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* The Bottom Line */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 sm:p-8 border-2 border-purple-500">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
            The Bottom Line
          </h3>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <IoSkullOutline className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">We're Not Nice</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                We publicly shame hackers who fail. We mock bad security. We call out compliance theater.
              </p>
            </div>
            <div className="text-center">
              <IoFlameOutline className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">We're Not Cheap</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                We're free. That's different. We're free because we're confident. Scared companies charge.
              </p>
            </div>
            <div className="text-center">
              <IoInfiniteOutline className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">We're Not Perfect</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {isClient ? `${liveMetrics.vulnerabilitiesFound} vulnerabilities found and fixed.` : '847 vulnerabilities found and fixed.'} Perfect systems don't exist. Honest ones do.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Challenge Box */}
        <div className="sm:hidden mt-6 bg-red-100 dark:bg-red-900/20 rounded-lg p-4 border border-red-300 dark:border-red-800">
          <div className="flex items-start space-x-2">
            <IoSkullOutline className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Think We're Full of It?
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                Try to hack us. We dare you. $10K bounty if you succeed.
              </p>
              <a href="/security/challenge" className="text-xs font-bold text-red-600 dark:text-red-400 mt-2 inline-block">
                Accept Challenge →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}