// app/components/certification/StakeholderTabs.tsx
'use client'

import React, { useState } from 'react'
import { 
  IoBusinessOutline,
  IoPeopleOutline,
  IoTrendingUp,
  IoShieldCheckmark,
  IoSkullOutline,
  IoCheckmarkCircle,
  IoWarning,
  IoCashOutline,
  IoDocumentTextOutline,
  IoStatsChartOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoRocketOutline,
  IoTimerOutline
} from 'react-icons/io5'

interface StakeholderContent {
  id: string
  title: string
  icon: React.ReactNode
  tagline: string
  mainBenefit: string
  keyMetrics: { label: string; value: string; trend?: string }[]
  painPoints: string[]
  solutions: string[]
  testimonial: {
    quote: string
    author: string
    role: string
  }
  cta: string
  color: string
}

export function StakeholderTabs() {
  const [activeTab, setActiveTab] = useState('hotels')

  const stakeholders: StakeholderContent[] = [
    {
      id: 'hotels',
      title: 'Hotels',
      icon: <IoBusinessOutline className="w-6 h-6" />,
      tagline: 'Turn Compliance Into Profit',
      mainBenefit: 'Save $180K on compliance, earn $300K from rides',
      keyMetrics: [
        { label: 'Compliance Savings', value: '$180K/year', trend: '+100%' },
        { label: 'Ride Revenue', value: '$300K/year', trend: 'NEW' },
        { label: 'Setup Time', value: '15 minutes', trend: '-99%' },
        { label: 'ROI', value: '583%', trend: '🚀' }
      ],
      painPoints: [
        'Paying $180K+/year for multiple compliance certifications',
        'Guests complaining about lack of transportation',
        'Losing bookings to hotels with better amenities',
        'Complex compliance management across standards'
      ],
      solutions: [
        'One TU certificate replaces ALL compliance needs',
        'Instant ride dispatch for all guests',
        'New revenue stream from transportation',
        'Automated compliance with zero effort'
      ],
      testimonial: {
        quote: "We replaced SOC 2, ISO 27001, and PCI DSS with one TU certificate. Now we're earning $27K/month from rides instead of paying consultants.",
        author: "Michael Chen",
        role: "GM, Marriott Phoenix Downtown"
      },
      cta: 'Start Earning Today',
      color: 'purple'
    },
    {
      id: 'boards',
      title: 'Board of Directors',
      icon: <IoPeopleOutline className="w-6 h-6" />,
      tagline: 'Risk Reduction + Revenue Generation',
      mainBenefit: 'Reduce breach risk by 99% while generating new revenue',
      keyMetrics: [
        { label: 'Breach Risk Reduction', value: '99%', trend: '✓' },
        { label: 'Compliance Coverage', value: '100%', trend: '✓' },
        { label: 'New Revenue Stream', value: '$300K/year', trend: 'NEW' },
        { label: 'Insurance Premium Reduction', value: '40%', trend: '↓' }
      ],
      painPoints: [
        'Worried about data breach lawsuits',
        'Compliance costs eating into profits',
        'Competing priorities for capital allocation',
        'Difficulty measuring security ROI'
      ],
      solutions: [
        'Military-grade security with $0 breaches track record',
        'Compliance that generates revenue instead of costing',
        'No capital investment required',
        'Real-time security dashboards for board meetings'
      ],
      testimonial: {
        quote: "This is the first security investment that actually makes money. The board approved unanimously after seeing the ROI.",
        author: "Jennifer Walsh",
        role: "Board Chair, Scottsdale Resort Group"
      },
      cta: 'Get Board Presentation',
      color: 'blue'
    },
    {
      id: 'investors',
      title: 'Investors',
      icon: <IoTrendingUp className="w-6 h-6" />,
      tagline: 'ESG Compliance + Revenue Growth',
      mainBenefit: 'Meet all ESG requirements while adding $3.6M to enterprise value',
      keyMetrics: [
        { label: 'ESG Score Improvement', value: '+45 points', trend: '↑' },
        { label: 'Revenue Multiple Impact', value: '12x', trend: '💰' },
        { label: 'Annual Revenue Added', value: '$300K', trend: 'NEW' },
        { label: 'Enterprise Value Increase', value: '$3.6M', trend: '↑' }
      ],
      painPoints: [
        'Portfolio companies failing ESG requirements',
        'Compliance costs reducing returns',
        'Lack of differentiation in portfolio',
        'Regulatory pressure increasing'
      ],
      solutions: [
        'Automatic ESG reporting and compliance',
        'New revenue stream improves multiples',
        'Unique competitive advantage',
        'Future-proof against regulations'
      ],
      testimonial: {
        quote: "Every portfolio company needs this. It solves ESG, reduces risk, and adds revenue. That's a triple win for returns.",
        author: "David Kim",
        role: "Partner, Phoenix Hospitality Partners"
      },
      cta: 'View Investment Metrics',
      color: 'green'
    },
    {
      id: 'insurance',
      title: 'Insurance Companies',
      icon: <IoShieldCheckmark className="w-6 h-6" />,
      tagline: 'Reduced Risk = Lower Premiums',
      mainBenefit: '99% risk reduction justifies 40% premium discounts',
      keyMetrics: [
        { label: 'Breach Incidents', value: '0', trend: '✓' },
        { label: 'Security Score', value: '98/100', trend: '↑' },
        { label: 'Compliance Violations', value: '0', trend: '✓' },
        { label: 'Recommended Premium Discount', value: '40%', trend: '↓' }
      ],
      painPoints: [
        'Hotels are high-risk for data breaches',
        'Difficult to assess actual security posture',
        'Claims increasing year over year',
        'No standardized security metrics'
      ],
      solutions: [
        'Real-time security monitoring and reporting',
        'Standardized TU certification metrics',
        'Proven track record of zero breaches',
        'Automated compliance verification'
      ],
      testimonial: {
        quote: "TU-certified hotels have never had a claim. We offer automatic premium discounts for certification.",
        author: "Robert Taylor",
        role: "Chief Underwriter, Hospitality Insurance Group"
      },
      cta: 'Verify Certification',
      color: 'indigo'
    },
    {
      id: 'hackers',
      title: 'Hackers',
      icon: <IoSkullOutline className="w-6 h-6" />,
      tagline: 'Good Luck With That',
      mainBenefit: 'We pay you $50K to try. Nobody has succeeded.',
      keyMetrics: [
        { label: 'Attack Attempts', value: '48,291', trend: '📈' },
        { label: 'Successful Breaches', value: '0', trend: '💀' },
        { label: 'Bug Bounty Paid', value: '$127,500', trend: '💰' },
        { label: 'Time to Detection', value: '0.3ms', trend: '⚡' }
      ],
      painPoints: [
        'Need to find vulnerabilities to exploit',
        'Looking for weak security implementations',
        'Want unpatched systems',
        'Seeking valuable data to steal'
      ],
      solutions: [
        '37 layers of defense to penetrate',
        'AI-powered anomaly detection',
        'Automatic patching every 4 hours',
        'All data encrypted with quantum-resistant algorithms'
      ],
      testimonial: {
        quote: "I've tried for 6 months. Made $15K from bug bounties but never got through. Respect.",
        author: "Anonymous",
        role: "White Hat Hacker"
      },
      cta: 'Try Your Luck ($50K Bounty)',
      color: 'red'
    }
  ]

  const activeStakeholder = stakeholders.find(s => s.id === activeTab)!

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full mb-4">
            <IoPeopleOutline className="w-5 h-5" />
            <span className="font-semibold">Built for Everyone (Even Hackers)</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Every Stakeholder <span className="text-purple-600">Wins</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            From hotel owners to hackers, everyone has a reason to love (or hate) our platform.
            Choose your perspective below.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {stakeholders.map((stakeholder) => (
            <button
              key={stakeholder.id}
              onClick={() => setActiveTab(stakeholder.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === stakeholder.id
                  ? `bg-gradient-to-r text-white shadow-lg ${
                      stakeholder.color === 'purple' ? 'from-purple-600 to-indigo-600' :
                      stakeholder.color === 'blue' ? 'from-blue-600 to-cyan-600' :
                      stakeholder.color === 'green' ? 'from-green-600 to-emerald-600' :
                      stakeholder.color === 'indigo' ? 'from-indigo-600 to-purple-600' :
                      'from-red-600 to-orange-600'
                    }`
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:shadow-md'
              }`}
            >
              {stakeholder.icon}
              <span>{stakeholder.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className={`p-6 bg-gradient-to-r text-white ${
            activeStakeholder.color === 'purple' ? 'from-purple-600 to-indigo-600' :
            activeStakeholder.color === 'blue' ? 'from-blue-600 to-cyan-600' :
            activeStakeholder.color === 'green' ? 'from-green-600 to-emerald-600' :
            activeStakeholder.color === 'indigo' ? 'from-indigo-600 to-purple-600' :
            'from-red-600 to-orange-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-2">{activeStakeholder.tagline}</h3>
                <p className="text-lg opacity-90">{activeStakeholder.mainBenefit}</p>
              </div>
              <div className="hidden md:block">
                {React.cloneElement(activeStakeholder.icon as React.ReactElement, { 
                  className: 'w-16 h-16 opacity-50' 
                })}
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {activeStakeholder.keyMetrics.map((metric) => (
                <div key={metric.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                  {metric.trend && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {metric.trend}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Pain Points vs Solutions */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Pain Points */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoWarning className="w-5 h-5 text-red-500 mr-2" />
                  Current Pain Points
                </h4>
                <ul className="space-y-3">
                  {activeStakeholder.painPoints.map((pain, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <IoTimerOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solutions */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                  How TU Solves It
                </h4>
                <ul className="space-y-3">
                  {activeStakeholder.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <IoRocketOutline className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Testimonial */}
            <div className={`p-6 rounded-lg mb-8 ${
              activeStakeholder.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
              activeStakeholder.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
              activeStakeholder.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
              activeStakeholder.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20' :
              'bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-start space-x-4">
                <div className="text-4xl opacity-30">"</div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-4">
                    {activeStakeholder.testimonial.quote}
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {activeStakeholder.testimonial.author}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activeStakeholder.testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Content for Each Stakeholder */}
            {activeTab === 'hotels' && (
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Revenue Breakdown for 150-Room Hotel
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">$15K</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">$25K</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">$40K</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Monthly Benefit</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'boards' && (
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Risk Metrics Dashboard
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <IoShieldCheckmark className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-bold">Zero Breaches</p>
                  </div>
                  <div className="text-center">
                    <IoLockClosedOutline className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-bold">100% Compliant</p>
                  </div>
                  <div className="text-center">
                    <IoStatsChartOutline className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-bold">Real-time Monitoring</p>
                  </div>
                  <div className="text-center">
                    <IoDocumentTextOutline className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <p className="text-sm font-bold">Audit Ready</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'investors' && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  ESG Impact Score
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Environmental</span>
                    <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-bold">85/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Social</span>
                    <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-sm font-bold">92/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Governance</span>
                    <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    <span className="text-sm font-bold">98/100</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insurance' && (
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Verified Security Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Security Incident</p>
                    <p className="text-lg font-bold text-green-600">Never</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patch Frequency</p>
                    <p className="text-lg font-bold text-blue-600">Every 4 hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pen Test Score</p>
                    <p className="text-lg font-bold text-purple-600">98/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Violations</p>
                    <p className="text-lg font-bold text-green-600">0</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hackers' && (
              <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Your Chances of Success
                </h4>
                <div className="text-center">
                  <div className="text-6xl font-bold text-red-600 mb-2">0.0000%</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    But we'll pay you to try anyway
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">$50K</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Max Bounty</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">37</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Defense Layers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0.3ms</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Detection Time</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={() => document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 rounded-lg font-bold text-white text-lg hover:shadow-xl transition-all transform hover:scale-105 bg-gradient-to-r ${
                  activeStakeholder.color === 'purple' ? 'from-purple-600 to-indigo-600' :
                  activeStakeholder.color === 'blue' ? 'from-blue-600 to-cyan-600' :
                  activeStakeholder.color === 'green' ? 'from-green-600 to-emerald-600' :
                  activeStakeholder.color === 'indigo' ? 'from-indigo-600 to-purple-600' :
                  'from-red-600 to-orange-600'
                }`}
              >
                {activeStakeholder.cta}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <IoGlobeOutline className="inline w-6 h-6 mr-2" />
            The only platform where everyone wins. Even hackers get paid.
            <span className="block mt-2 text-lg font-bold text-purple-600 dark:text-purple-400">
              That's how confident we are.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}