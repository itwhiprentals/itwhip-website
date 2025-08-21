// app/components/hotel-solutions/FourDisasters.tsx

'use client'

import React, { useState } from 'react'
import {
  IoWarningOutline,
  IoSkullOutline,
  IoFlameOutline,
  IoThunderstormOutline,
  IoCloseCircleOutline,
  IoArrowForwardOutline,
  IoTrendingDownOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoScaleOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoCalculatorOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

interface FourDisastersProps {
  californiaDeadline?: number
}

interface DetailedDisasterInfo {
  id: string
  title: string
  icon: React.ReactNode
  mainMetric: string
  color: string
  realCases: Array<{
    name: string
    description: string
    outcome: string
    cost: string
  }>
  statistics: Array<{
    label: string
    value: string
    trend?: 'up' | 'down'
  }>
  industryData: {
    averageCost: string
    frequency: string
    trend: string
    projection: string
  }
  solutions: Array<{
    problem: string
    traditional: string
    withItWhip: string
  }>
  timeline: Array<{
    period: string
    event: string
    impact: string
  }>
}

export default function FourDisasters({ californiaDeadline = 134 }: FourDisastersProps) {
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (disasterId: string) => {
    setSelectedDisaster(disasterId)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDisaster(null)
    document.body.style.overflow = 'unset'
  }

  const disasterDetails: { [key: string]: DetailedDisasterInfo } = {
    nuclear: {
      id: 'nuclear',
      title: 'Nuclear Verdict Explosion',
      icon: <IoSkullOutline className="w-8 h-8" />,
      mainMetric: '$31.3B',
      color: 'red',
      realCases: [
        {
          name: 'Werner Enterprises Reversal (June 2025)',
          description: 'Texas Supreme Court reversed $100M verdict from 2018 crash',
          outcome: 'Victory after 7-year legal battle, but millions in legal costs',
          cost: 'Shows verdicts can be overturned but at massive expense'
        },
        {
          name: 'Real Water Nevada Cases (2025)',
          description: 'Multiple billion-dollar verdicts for contaminated water',
          outcome: '$8.4 billion total in Nevada verdicts alone',
          cost: 'Nevada now leads nation in verdict totals'
        },
        {
          name: 'Hotels & Leisure Industry (2024)',
          description: '8 nuclear verdicts in hospitality sector',
          outcome: 'Hotels, restaurants, leisure hit with massive awards',
          cost: 'Industry now in top 5 for nuclear verdicts'
        }
      ],
      statistics: [
        { label: '2024 Nuclear Verdicts', value: '135 cases', trend: 'up' },
        { label: 'Total Awards 2024', value: '$31.3B', trend: 'up' },
        { label: 'Increase from 2023', value: '116%', trend: 'up' },
        { label: 'Median Verdict 2025', value: '$51M', trend: 'up' }
      ],
      industryData: {
        averageCost: '$51 million median verdict (up from $21M in 2020)',
        frequency: '52% increase in frequency year-over-year',
        trend: 'States starting reforms but verdicts still rising',
        projection: 'Expected to continue rising through 2025-2026'
      },
      solutions: [
        {
          problem: 'Liability exposure',
          traditional: '100% falls on hotel property owner',
          withItWhip: 'Transferred to ItWhip with $100M+ coverage'
        },
        {
          problem: 'Legal defense costs',
          traditional: 'Millions even if you win (see Werner)',
          withItWhip: 'ItWhip handles all litigation'
        },
        {
          problem: 'Insurance crisis',
          traditional: 'Carriers leaving market, rates up 40%+',
          withItWhip: 'Fully insured through our program'
        }
      ],
      timeline: [
        { period: 'Accident', event: 'Incident occurs on property', impact: 'Media coverage begins immediately' },
        { period: 'Week 1', event: 'Lawsuits filed', impact: 'Insurance reviews coverage limits' },
        { period: 'Year 1-2', event: 'Discovery and depositions', impact: '$500K-$2M in legal fees' },
        { period: 'Year 3-4', event: 'Trial or settlement talks', impact: 'Demands in tens of millions' },
        { period: 'Year 5-7', event: 'Appeals if you win', impact: 'Millions more in costs (Werner example)' }
      ]
    },
    financial: {
      id: 'financial',
      title: 'Financial Hemorrhage',
      icon: <IoFlameOutline className="w-8 h-8" />,
      mainMetric: '$95.5M',
      color: 'orange',
      realCases: [
        {
          name: 'Weekly Industry Loss (Aug 2025)',
          description: 'Transportation sector losing $95.5M every single week',
          outcome: '24,043 unfilled driver positions costing industry',
          cost: '$3,971 revenue loss per position weekly'
        },
        {
          name: 'Insurance Crisis (2025)',
          description: 'Commercial vehicle insurance market collapsing',
          outcome: '40% rate increases, carriers exiting market',
          cost: 'Many hotels dropping shuttle coverage entirely'
        },
        {
          name: 'Freight Recession Impact',
          description: 'Economic slowdown affecting all transportation',
          outcome: 'Lower demand but costs still rising',
          cost: 'Operating margins now negative for most'
        }
      ],
      statistics: [
        { label: 'Weekly Loss', value: '$95.5M', trend: 'up' },
        { label: 'Insurance Increase', value: '+40%', trend: 'up' },
        { label: 'Fuel Costs 2025', value: '+22%', trend: 'up' },
        { label: 'Maintenance Up', value: '+47%', trend: 'up' }
      ],
      industryData: {
        averageCost: '$127K annual loss per shuttle operation',
        frequency: '7,213 driver jobs posted daily with no takers',
        trend: 'Costs rising faster than inflation',
        projection: 'Losses expected to double by 2026'
      },
      solutions: [
        {
          problem: 'Revenue model',
          traditional: 'Pure cost center, zero revenue',
          withItWhip: '30% commission on every ride'
        },
        {
          problem: 'Asset ownership',
          traditional: '$75K+ per vehicle, depreciating',
          withItWhip: 'Zero assets, infinite capacity'
        },
        {
          problem: 'Operating costs',
          traditional: 'Rising faster than revenue',
          withItWhip: 'Fixed commission, predictable costs'
        }
      ],
      timeline: [
        { period: 'Day 1', event: 'Purchase shuttle', impact: '-$75K capital + insurance' },
        { period: 'Month 1', event: 'Hire drivers', impact: 'If you can find any' },
        { period: 'Month 6', event: 'First major repair', impact: '-$8-15K unexpected' },
        { period: 'Year 1', event: 'Insurance renewal', impact: '40% premium increase' },
        { period: 'Year 2', event: 'Replace vehicle', impact: 'Start cycle over' }
      ]
    },
    operational: {
      id: 'operational',
      title: 'Driver Shortage Crisis',
      icon: <IoThunderstormOutline className="w-8 h-8" />,
      mainMetric: '115K',
      color: 'purple',
      realCases: [
        {
          name: 'ATA Projection (August 2025)',
          description: 'American Trucking Association updated shortage numbers',
          outcome: '115,000 shortage projected by end of 2025',
          cost: 'Will reach 170,000 by 2030'
        },
        {
          name: 'School Districts Crisis (2024-25)',
          description: 'Schools canceling routes, parents quitting jobs',
          outcome: '91% of districts report driver shortages',
          cost: 'Parents forced to drive kids, missing work'
        },
        {
          name: 'UK Transport Crisis (2025)',
          description: 'Global shortage hitting all markets',
          outcome: 'Brexit + aging workforce = collapse',
          cost: 'Shows this is global, not getting better'
        }
      ],
      statistics: [
        { label: '2025 Shortage', value: '115,000', trend: 'up' },
        { label: 'Turnover Rate', value: '73%', trend: 'up' },
        { label: 'Avg Driver Age', value: '48 years', trend: 'up' },
        { label: '2030 Projection', value: '170,000', trend: 'up' }
      ],
      industryData: {
        averageCost: 'Shortage growing to 82,000 by year-end 2025',
        frequency: 'Less than 3% of drivers under 25',
        trend: 'Doubling every 3-5 years',
        projection: '170,000 shortage by 2030, crisis by 2028'
      },
      solutions: [
        {
          problem: 'Finding drivers',
          traditional: 'Post jobs, hope someone applies',
          withItWhip: '847+ vetted drivers ready now'
        },
        {
          problem: 'Night/weekend coverage',
          traditional: 'No drivers want these shifts',
          withItWhip: '24/7/365 guaranteed coverage'
        },
        {
          problem: 'Quality control',
          traditional: 'Take whoever shows up',
          withItWhip: '4.9-star professionals only'
        }
      ],
      timeline: [
        { period: 'Today', event: 'Driver quits/no-shows', impact: 'Guests stranded immediately' },
        { period: 'Week 1', event: 'Post job listings', impact: '$500-1000 in job ads' },
        { period: 'Week 2-4', event: 'Interview candidates', impact: 'If any apply at all' },
        { period: 'Month 2', event: 'Hire unqualified', impact: 'Accident risk increases' },
        { period: 'Month 3', event: 'They quit too', impact: 'Start over again' }
      ]
    },
    compliance: {
      id: 'compliance',
      title: 'ESG Compliance Deadline',
      icon: <IoWarningOutline className="w-8 h-8" />,
      mainMetric: '4 Months',
      color: 'amber',
      realCases: [
        {
          name: 'CARB Update (July 2025)',
          description: 'California Air Resources Board issued final clarifications',
          outcome: 'Reporting starts January 1, 2026 - no more delays',
          cost: 'Up to $500,000 penalties per year'
        },
        {
          name: 'First Reports Due (Jan 2026)',
          description: 'SB 261 climate risk reports due January 1',
          outcome: 'Must be published on company website',
          cost: '$50,000 penalties for non-compliance'
        },
        {
          name: 'Scope 3 Transportation (2027)',
          description: 'Must track ALL guest transportation emissions',
          outcome: 'Impossible without digital tracking system',
          cost: 'No compliance without data'
        }
      ],
      statistics: [
        { label: 'Days Until Deadline', value: '134', trend: 'down' },
        { label: 'SB 253 Penalty', value: '$500K/yr', trend: 'up' },
        { label: 'Companies Affected', value: '5,300+', trend: 'up' },
        { label: 'Hotels Ready', value: '<6%', trend: 'down' }
      ],
      industryData: {
        averageCost: 'Up to $500K annually for SB 253 violations',
        frequency: 'Annual reporting forever, starts 2026',
        trend: 'CARB confirmed no more delays',
        projection: 'Federal adoption expected by 2027'
      },
      solutions: [
        {
          problem: 'Scope 3 tracking',
          traditional: 'Impossible for guest transport',
          withItWhip: 'Automatic CDP-compliant data'
        },
        {
          problem: 'Reporting burden',
          traditional: '40+ hours monthly to compile',
          withItWhip: 'One-click automated reports'
        },
        {
          problem: 'Compliance certainty',
          traditional: 'Hope for "good faith" leniency',
          withItWhip: '100% compliant, guaranteed'
        }
      ],
      timeline: [
        { period: 'Now (Aug 2025)', event: 'Should be collecting 2025 data', impact: 'Need systems in place TODAY' },
        { period: 'Jan 1, 2026', event: 'First SB 261 reports due', impact: 'Public disclosure required' },
        { period: '2026', event: 'SB 253 emissions due', impact: 'Penalties begin' },
        { period: '2027', event: 'Scope 3 required', impact: 'Must include transportation' },
        { period: '2027-28', event: 'Federal adoption', impact: 'Nationwide requirements' }
      ]
    }
  }

  const disasters = [
    {
      id: 'nuclear',
      icon: <IoSkullOutline className="w-12 h-12 text-red-600" />,
      metric: '$31.3B',
      title: 'Nuclear Verdicts',
      description: '2024 saw 135 verdicts over $10M. Hotels & leisure now in top 5 industries hit.',
      bullets: [
        '116% increase from 2023',
        '$51M median (was $21M)',
        'Hotels: 8 nuclear verdicts'
      ],
      color: 'red'
    },
    {
      id: 'financial',
      icon: <IoFlameOutline className="w-12 h-12 text-orange-600" />,
      metric: '$95.5M/wk',
      title: 'Weekly Losses',
      description: 'Transportation sector hemorrhaging $95.5 million every week from shortage.',
      bullets: [
        'Insurance up 40% in 2025',
        '24,043 unfilled positions',
        'Costs up 22% in 2 years'
      ],
      color: 'orange'
    },
    {
      id: 'operational',
      icon: <IoThunderstormOutline className="w-12 h-12 text-purple-600" />,
      metric: '115,000',
      title: 'Driver Crisis',
      description: 'Shortage hitting 115,000 by end of 2025, expected to reach 170,000 by 2030.',
      bullets: [
        '73% annual turnover',
        'Average age: 48 years',
        'Only 3% under 25'
      ],
      color: 'purple'
    },
    {
      id: 'compliance',
      icon: <IoWarningOutline className="w-12 h-12 text-amber-600" />,
      metric: '134 days',
      title: 'ESG Deadline',
      description: 'California SB 253/261 reporting starts January 1, 2026. No more delays.',
      bullets: [
        '$500K max penalties',
        '5,300+ companies affected',
        'Must track Scope 3'
      ],
      color: 'amber'
    }
  ]

  return (
    <>
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-4 py-2 rounded-full mb-4 border border-red-300 dark:border-red-800">
              <IoWarningOutline className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">August 2025 Industry Alert</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              The 4 Disasters <span className="text-red-600">Destroying Hotels RIGHT NOW</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Updated with latest 2025 data. Each crisis is accelerating.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {disasters.map((disaster) => (
              <div
                key={disaster.id}
                className="group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => openModal(disaster.id)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity
                  ${disaster.color === 'red' ? 'from-red-500 to-red-700' : ''}
                  ${disaster.color === 'orange' ? 'from-orange-500 to-orange-700' : ''}
                  ${disaster.color === 'purple' ? 'from-purple-500 to-purple-700' : ''}
                  ${disaster.color === 'amber' ? 'from-amber-500 to-amber-700' : ''}
                `}></div>
                
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    {disaster.icon}
                    <span className={`text-3xl font-black
                      ${disaster.color === 'red' ? 'text-red-600' : ''}
                      ${disaster.color === 'orange' ? 'text-orange-600' : ''}
                      ${disaster.color === 'purple' ? 'text-purple-600' : ''}
                      ${disaster.color === 'amber' ? 'text-amber-600' : ''}
                    `}>{disaster.metric}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{disaster.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    {disaster.description}
                  </p>
                  <ul className="space-y-2 text-sm mb-4">
                    {disaster.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <IoWarningOutline className={`w-4 h-4 mt-0.5 flex-shrink-0
                          ${disaster.color === 'red' ? 'text-red-500' : ''}
                          ${disaster.color === 'orange' ? 'text-orange-500' : ''}
                          ${disaster.color === 'purple' ? 'text-purple-500' : ''}
                          ${disaster.color === 'amber' ? 'text-amber-500' : ''}
                        `} />
                        <span className="text-slate-700 dark:text-slate-300">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full px-4 py-2 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 group-hover:shadow-lg
                    ${disaster.color === 'red' ? 'bg-red-600 hover:bg-red-700' : ''}
                    ${disaster.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    ${disaster.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    ${disaster.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                  `}>
                    <span>See Full Analysis</span>
                    <IoArrowForwardOutline className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Updated Data Source */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <IoCheckmarkCircle className="inline w-4 h-4 text-green-500 mr-1" />
              Data current as of August 2025. Sources: Marathon Strategies, ATA, CARB, Werner v. Blake ruling, IRU Global Report
            </p>
          </div>
        </div>
      </section>

      {/* Modal/Canvas Popup */}
      {isModalOpen && selectedDisaster && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-900 shadow-2xl rounded-2xl">
              {/* Header */}
              <div className={`text-white p-6
                ${disasterDetails[selectedDisaster].color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-700' : ''}
                ${disasterDetails[selectedDisaster].color === 'orange' ? 'bg-gradient-to-r from-orange-600 to-orange-700' : ''}
                ${disasterDetails[selectedDisaster].color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : ''}
                ${disasterDetails[selectedDisaster].color === 'amber' ? 'bg-gradient-to-r from-amber-600 to-amber-700' : ''}
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {disasterDetails[selectedDisaster].icon}
                    <div>
                      <h2 className="text-3xl font-bold">{disasterDetails[selectedDisaster].title}</h2>
                      <p className="text-xl opacity-90">August 2025 Impact: {disasterDetails[selectedDisaster].mainMetric}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <IoCloseCircleOutline className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Real Cases Section */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <IoNewspaperOutline className="w-6 h-6 mr-2" />
                    Latest 2025 Cases & Updates
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {disasterDetails[selectedDisaster].realCases.map((case_, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">{case_.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{case_.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-semibold text-red-600">Outcome:</span> {case_.outcome}</p>
                          <p className="text-sm"><span className="font-semibold text-red-600">Impact:</span> {case_.cost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industry Statistics */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <IoStatsChartOutline className="w-6 h-6 mr-2" />
                    Current 2025 Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {disasterDetails[selectedDisaster].statistics.map((stat, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
                          {stat.trend && (
                            <IoTrendingDownOutline className={`w-4 h-4 ${stat.trend === 'up' ? 'text-red-500 rotate-180' : 'text-green-500'}`} />
                          )}
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Average Cost</p>
                        <p className="text-lg text-slate-700 dark:text-slate-300">{disasterDetails[selectedDisaster].industryData.averageCost}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Frequency</p>
                        <p className="text-lg text-slate-700 dark:text-slate-300">{disasterDetails[selectedDisaster].industryData.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">2025 Trend</p>
                        <p className="text-lg text-slate-700 dark:text-slate-300">{disasterDetails[selectedDisaster].industryData.trend}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">2026 Projection</p>
                        <p className="text-lg text-slate-700 dark:text-slate-300">{disasterDetails[selectedDisaster].industryData.projection}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solution Comparison */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <IoScaleOutline className="w-6 h-6 mr-2" />
                    Traditional vs ItWhip Solution
                  </h3>
                  <div className="space-y-3">
                    {disasterDetails[selectedDisaster].solutions.map((solution, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">{solution.problem}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-2">
                            <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-red-600">Traditional Approach</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{solution.traditional}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-green-600">With ItWhip</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{solution.withItWhip}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <IoTimeOutline className="w-6 h-6 mr-2" />
                    How This Disaster Unfolds
                  </h3>
                  <div className="space-y-3">
                    {disasterDetails[selectedDisaster].timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center
                            ${disasterDetails[selectedDisaster].color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                            ${disasterDetails[selectedDisaster].color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : ''}
                            ${disasterDetails[selectedDisaster].color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                            ${disasterDetails[selectedDisaster].color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' : ''}
                          `}>
                            <span className={`text-sm font-bold
                              ${disasterDetails[selectedDisaster].color === 'red' ? 'text-red-600' : ''}
                              ${disasterDetails[selectedDisaster].color === 'orange' ? 'text-orange-600' : ''}
                              ${disasterDetails[selectedDisaster].color === 'purple' ? 'text-purple-600' : ''}
                              ${disasterDetails[selectedDisaster].color === 'amber' ? 'text-amber-600' : ''}
                            `}>{idx + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-1">
                            <span className="font-semibold text-slate-900 dark:text-white">{item.period}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{item.event}</span>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-400">{item.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-start space-x-3 mb-4">
                    <IoAlertCircleOutline className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Stop This Disaster Today</h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        487 hotels have already eliminated these risks with ItWhip. Zero liability, guaranteed compliance, unlimited drivers, 
                        and you start earning revenue instead of losing money.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => {
                        closeModal()
                        document.getElementById('roi-calculator')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <IoCalculatorOutline className="w-5 h-5" />
                      <span>Calculate Your Savings</span>
                    </button>
                    <button 
                      onClick={() => {
                        closeModal()
                        window.location.href = '/portal/login'
                      }}
                      className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <IoBusinessOutline className="w-5 h-5" />
                      <span>Access Hotel Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Data Source Citation */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Sources: Marathon Strategies 2025 Report, Werner v. Blake Texas Supreme Court (June 2025), 
                    ATA Driver Shortage Update (August 2025), CARB FAQs (July 2025), IRU Global Report 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}