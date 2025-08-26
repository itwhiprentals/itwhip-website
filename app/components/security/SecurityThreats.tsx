// app/components/security/SecurityThreats.tsx

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
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoCalculatorOutline,
  IoCheckmarkCircle,
  IoBugOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

interface SecurityThreatsProps {
  onStartValidation?: () => void
}

interface DetailedThreatInfo {
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
    withTU1A: string
  }>
  timeline: Array<{
    period: string
    event: string
    impact: string
  }>
}

export default function SecurityThreats({ onStartValidation }: SecurityThreatsProps) {
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (threatId: string) => {
    setSelectedThreat(threatId)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedThreat(null)
    document.body.style.overflow = 'unset'
  }

  const threatDetails: { [key: string]: DetailedThreatInfo } = {
    breach: {
      id: 'breach',
      title: 'The Breach Apocalypse',
      icon: <IoSkullOutline className="w-8 h-8" />,
      mainMetric: '$4.88M',
      color: 'red',
      realCases: [
        {
          name: 'MGM Resorts (September 2023)',
          description: 'Ransomware attack via 10-minute phone call',
          outcome: '$100M in losses, operations down for days',
          cost: 'Stock dropped 6%, class action lawsuits filed'
        },
        {
          name: 'Change Healthcare (February 2024)',
          description: 'BlackCat ransomware, largest healthcare breach',
          outcome: 'Paid $22M ransom, pharmacies couldn\'t process',
          cost: 'Months of disruption, hundreds of lawsuits'
        },
        {
          name: 'Caesars Entertainment (September 2023)',
          description: 'Social engineering attack on IT help desk',
          outcome: 'Paid $15M ransom to prevent data leak',
          cost: 'Customer data stolen, loyalty program compromised'
        }
      ],
      statistics: [
        { label: 'Avg Breach Cost 2024', value: '$4.88M', trend: 'up' },
        { label: 'Healthcare Breaches', value: '$10.93M', trend: 'up' },
        { label: 'Detection Time', value: '204 days', trend: 'up' },
        { label: 'With TU-1-A', value: '0 breaches', trend: 'down' }
      ],
      industryData: {
        averageCost: '$4.88M average, up 10% from 2023 (IBM Report)',
        frequency: 'Ransomware attack every 11 seconds globally',
        trend: '83% of breaches involve external actors',
        projection: '$10.5 trillion cybercrime cost by 2025'
      },
      solutions: [
        {
          problem: 'Detection Speed',
          traditional: '204 days average (IBM Report)',
          withTU1A: '2ms real-time detection'
        },
        {
          problem: 'Testing Frequency',
          traditional: 'Annual penetration test',
          withTU1A: '48,291 tests per month'
        },
        {
          problem: 'Breach Cost',
          traditional: '$4.88M average + lawsuits',
          withTU1A: '$0 - prevented before damage'
        }
      ],
      timeline: [
        { period: 'Minute 1', event: 'Initial compromise', impact: 'Attacker gains foothold' },
        { period: 'Hour 1-24', event: 'Lateral movement', impact: 'Exploring network undetected' },
        { period: 'Day 1-7', event: 'Data exfiltration', impact: 'Stealing sensitive data' },
        { period: 'Week 2-4', event: 'Ransom demand', impact: '$15-30M typical demand' },
        { period: 'Day 204', event: 'Finally detected', impact: 'Average detection time' },
        { period: 'Year 1-3', event: 'Lawsuits & fines', impact: 'GDPR, CCPA, class actions' }
      ]
    },
    compliance: {
      id: 'compliance',
      title: 'Compliance Cost Nightmare',
      icon: <IoFlameOutline className="w-8 h-8" />,
      mainMetric: '$265K/yr',
      color: 'orange',
      realCases: [
        {
          name: 'SOC 2 Type II Reality',
          description: 'Annual audit costing $30-75K plus prep',
          outcome: 'Still breached - see MGM (had SOC 2)',
          cost: '$150-225K first year total costs'
        },
        {
          name: 'ISO 27001 Burden',
          description: '18-month implementation, 114 controls',
          outcome: 'LastPass had it - still compromised',
          cost: '$265K implementation + annual fees'
        },
        {
          name: 'PCI DSS Level 1',
          description: 'Quarterly scans, annual audits required',
          outcome: 'Target was compliant - $292M breach',
          cost: '$140K annually for assessments'
        }
      ],
      statistics: [
        { label: 'SOC 2 Cost', value: '$75K/yr', trend: 'up' },
        { label: 'ISO 27001', value: '$265K', trend: 'up' },
        { label: 'Time to Comply', value: '12-18mo', trend: 'up' },
        { label: 'TU-1-A Cost', value: 'Free', trend: 'down' }
      ],
      industryData: {
        averageCost: 'Average $150K/year across all standards',
        frequency: 'Annual audits, quarterly reviews',
        trend: 'Costs rising 15-20% annually',
        projection: 'New frameworks added yearly'
      },
      solutions: [
        {
          problem: 'Audit Frequency',
          traditional: 'Once per year for 3 weeks',
          withTU1A: 'Continuous - every second'
        },
        {
          problem: 'Total Cost',
          traditional: '$150-265K annually',
          withTU1A: 'Free forever'
        },
        {
          problem: 'Proof of Security',
          traditional: 'PDF certificate in drawer',
          withTU1A: 'Live public dashboard'
        }
      ],
      timeline: [
        { period: 'Month 1-3', event: 'Gap assessment', impact: '$25K consultant fees' },
        { period: 'Month 4-9', event: 'Implementation', impact: '$100K+ in changes' },
        { period: 'Month 10-12', event: 'Documentation', impact: '500+ hours internal time' },
        { period: 'Month 12', event: 'Audit', impact: '$50K audit fee' },
        { period: 'Month 13', event: 'Get certificate', impact: 'Valid for 1 year only' },
        { period: 'Next breach', event: 'Still vulnerable', impact: 'Compliance ≠ Security' }
      ]
    },
    attacks: {
      id: 'attacks',
      title: 'The Attack Tsunami',
      icon: <IoThunderstormOutline className="w-8 h-8" />,
      mainMetric: '2,200/day',
      color: 'purple',
      realCases: [
        {
          name: 'MOVEit Attacks (2023-2024)',
          description: 'Zero-day SQL injection, 2,000+ orgs hit',
          outcome: '62 million individuals\' data exposed',
          cost: 'Still counting damages in billions'
        },
        {
          name: 'Booking.com Attacks (2023-2024)',
          description: 'Massive phishing targeting hotel partners',
          outcome: 'Hundreds of hotels compromised',
          cost: 'Brand reputation destroyed'
        },
        {
          name: 'AI-Powered Attacks (2024-2025)',
          description: 'ChatGPT used to write perfect phishing',
          outcome: '3,000% increase in sophisticated attacks',
          cost: 'Traditional defenses obsolete'
        }
      ],
      statistics: [
        { label: 'Daily Attacks', value: '2,200', trend: 'up' },
        { label: 'AI-Enhanced', value: '38%', trend: 'up' },
        { label: 'Zero-Days 2024', value: '97', trend: 'up' },
        { label: 'Blocked by TU-1-A', value: '100%', trend: 'down' }
      ],
      industryData: {
        averageCost: 'Each attack costs $4,700 to investigate',
        frequency: 'Attack every 39 seconds globally',
        trend: 'AI making attacks 3,000% more effective',
        projection: 'Doubling every year through 2027'
      },
      solutions: [
        {
          problem: 'Attack Volume',
          traditional: 'Overwhelmed security team',
          withTU1A: 'Automated blocking 24/7'
        },
        {
          problem: 'Zero-Day Threats',
          traditional: 'Vulnerable until patch',
          withTU1A: 'Behavioral detection catches'
        },
        {
          problem: 'AI Attacks',
          traditional: 'Can\'t distinguish from real',
          withTU1A: 'AI defense fights AI attacks'
        }
      ],
      timeline: [
        { period: 'Second 1', event: 'Port scan begins', impact: 'Looking for vulnerabilities' },
        { period: 'Minute 1', event: 'Exploit attempt', impact: 'Trying known vulnerabilities' },
        { period: 'Minute 5', event: 'Brute force starts', impact: 'Password attacks begin' },
        { period: 'Hour 1', event: 'Lateral scanning', impact: 'Mapping your network' },
        { period: 'Day 1', event: 'Persistence established', impact: 'Backdoor installed' },
        { period: 'Ongoing', event: 'Data theft', impact: 'Exfiltrating slowly' }
      ]
    },
    talent: {
      id: 'talent',
      title: 'Security Talent Crisis',
      icon: <IoWarningOutline className="w-8 h-8" />,
      mainMetric: '3.5M gap',
      color: 'amber',
      realCases: [
        {
          name: 'Global Shortage (ISC2 2024)',
          description: '3.5 million unfilled cybersecurity jobs',
          outcome: '73% of orgs have unfilled positions',
          cost: 'Average 6 months to fill role'
        },
        {
          name: 'Salary Explosion (2024-2025)',
          description: 'Average security salary $116,000 USD',
          outcome: 'Senior roles demanding $200K+',
          cost: 'Small companies can\'t compete'
        },
        {
          name: 'Burnout Crisis (2024)',
          description: '71% considering leaving the field',
          outcome: 'Average tenure only 2.5 years',
          cost: 'Constant recruiting and training'
        }
      ],
      statistics: [
        { label: 'Global Gap', value: '3.5M', trend: 'up' },
        { label: 'Avg Salary', value: '$116K', trend: 'up' },
        { label: 'Burnout Rate', value: '71%', trend: 'up' },
        { label: 'TU-1-A Staff Needed', value: '0', trend: 'down' }
      ],
      industryData: {
        averageCost: '$116K salary + $50K benefits average',
        frequency: 'Need 3-5 security staff minimum',
        trend: 'Gap growing by 500K positions/year',
        projection: '5 million gap by 2027'
      },
      solutions: [
        {
          problem: 'Staffing Needs',
          traditional: 'Hire 3-5 security experts',
          withTU1A: 'Zero additional staff'
        },
        {
          problem: 'Annual Cost',
          traditional: '$500K+ for small team',
          withTU1A: 'Included in platform'
        },
        {
          problem: '24/7 Coverage',
          traditional: 'Need 8+ people for shifts',
          withTU1A: 'Automated monitoring'
        }
      ],
      timeline: [
        { period: 'Day 1', event: 'Security person quits', impact: 'Immediately vulnerable' },
        { period: 'Week 1-4', event: 'Post job, get few applicants', impact: '$5K recruiting costs' },
        { period: 'Month 2-6', event: 'Interview and negotiate', impact: 'Bidding war with others' },
        { period: 'Month 7', event: 'Finally hire someone', impact: '$116K+ salary' },
        { period: 'Month 8-10', event: 'Training and ramp-up', impact: 'Not fully effective yet' },
        { period: 'Year 2.5', event: 'They burn out and quit', impact: 'Start over again' }
      ]
    }
  }

  const threats = [
    {
      id: 'breach',
      icon: <IoSkullOutline className="w-12 h-12 text-red-600" />,
      metric: '$4.88M',
      title: 'Breach Costs',
      description: 'Average breach now $4.88M (IBM 2024). MGM lost $100M despite SOC 2 compliance.',
      bullets: [
        '10% increase from 2023',
        '204 days to detect',
        'Healthcare: $10.93M avg'
      ],
      color: 'red'
    },
    {
      id: 'compliance',
      icon: <IoFlameOutline className="w-12 h-12 text-orange-600" />,
      metric: '$265K/yr',
      title: 'Compliance Theater',
      description: 'SOC 2, ISO 27001, PCI DSS costing fortune. Still getting breached anyway.',
      bullets: [
        'Annual audits only',
        'PDF certificates',
        'Doesn\'t stop breaches'
      ],
      color: 'orange'
    },
    {
      id: 'attacks',
      icon: <IoThunderstormOutline className="w-12 h-12 text-purple-600" />,
      metric: '2,200/day',
      title: 'Attack Volume',
      description: 'Average company faces 2,200 attacks daily. AI making them 3,000% more effective.',
      bullets: [
        '38% AI-enhanced',
        '97 zero-days in 2024',
        'Doubling yearly'
      ],
      color: 'purple'
    },
    {
      id: 'talent',
      icon: <IoWarningOutline className="w-12 h-12 text-amber-600" />,
      metric: '3.5M gap',
      title: 'No Security Talent',
      description: '3.5 million unfilled security jobs globally. Average salary $116K and rising.',
      bullets: [
        '71% burnout rate',
        '6 months to hire',
        '$500K+ for team'
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
              <span className="text-sm font-bold uppercase tracking-wider">Security Crisis Alert 2025</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              The 4 Security Disasters <span className="text-red-600">Destroying Companies NOW</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Real breaches. Real costs. Real companies destroyed. Updated with latest 2025 data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => openModal(threat.id)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity
                  ${threat.color === 'red' ? 'from-red-500 to-red-700' : ''}
                  ${threat.color === 'orange' ? 'from-orange-500 to-orange-700' : ''}
                  ${threat.color === 'purple' ? 'from-purple-500 to-purple-700' : ''}
                  ${threat.color === 'amber' ? 'from-amber-500 to-amber-700' : ''}
                `}></div>
                
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    {threat.icon}
                    <span className={`text-3xl font-black
                      ${threat.color === 'red' ? 'text-red-600' : ''}
                      ${threat.color === 'orange' ? 'text-orange-600' : ''}
                      ${threat.color === 'purple' ? 'text-purple-600' : ''}
                      ${threat.color === 'amber' ? 'text-amber-600' : ''}
                    `}>{threat.metric}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{threat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    {threat.description}
                  </p>
                  <ul className="space-y-2 text-sm mb-4">
                    {threat.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <IoWarningOutline className={`w-4 h-4 mt-0.5 flex-shrink-0
                          ${threat.color === 'red' ? 'text-red-500' : ''}
                          ${threat.color === 'orange' ? 'text-orange-500' : ''}
                          ${threat.color === 'purple' ? 'text-purple-500' : ''}
                          ${threat.color === 'amber' ? 'text-amber-500' : ''}
                        `} />
                        <span className="text-slate-700 dark:text-slate-300">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full px-4 py-2 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 group-hover:shadow-lg
                    ${threat.color === 'red' ? 'bg-red-600 hover:bg-red-700' : ''}
                    ${threat.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    ${threat.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    ${threat.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                  `}>
                    <span>See Real Cases</span>
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
              Sources: IBM Cost of Breach 2024, ISC2 Workforce Study, Verizon DBIR, Actual breach reports
            </p>
          </div>
        </div>
      </section>

      {/* Modal/Canvas Popup */}
      {isModalOpen && selectedThreat && (
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
                ${threatDetails[selectedThreat].color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-700' : ''}
                ${threatDetails[selectedThreat].color === 'orange' ? 'bg-gradient-to-r from-orange-600 to-orange-700' : ''}
                ${threatDetails[selectedThreat].color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : ''}
                ${threatDetails[selectedThreat].color === 'amber' ? 'bg-gradient-to-r from-amber-600 to-amber-700' : ''}
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {threatDetails[selectedThreat].icon}
                    <div>
                      <h2 className="text-3xl font-bold">{threatDetails[selectedThreat].title}</h2>
                      <p className="text-xl opacity-90">2025 Reality: {threatDetails[selectedThreat].mainMetric}</p>
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
                    Real Breaches & Failures
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {threatDetails[selectedThreat].realCases.map((case_, idx) => (
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
                    Current Industry Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {threatDetails[selectedThreat].statistics.map((stat, idx) => (
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
                        <p className="text-lg text-slate-700 dark:text-slate-300">{threatDetails[selectedThreat].industryData.averageCost}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Frequency</p>
                        <p className="text-lg text-slate-700 dark:text-slate-300">{threatDetails[selectedThreat].industryData.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">2025 Trend</p>
                        <p className="text-lg text-slate-700 dark:text-slate-300">{threatDetails[selectedThreat].industryData.trend}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">2026 Projection</p>
                        <p className="text-lg text-slate-700 dark:text-slate-300">{threatDetails[selectedThreat].industryData.projection}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solution Comparison */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <IoScaleOutline className="w-6 h-6 mr-2" />
                    Traditional Compliance vs TU-1-A Standard
                  </h3>
                  <div className="space-y-3">
                    {threatDetails[selectedThreat].solutions.map((solution, idx) => (
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
                            <IoCheckmarkCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-purple-600">With TU-1-A</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{solution.withTU1A}</p>
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
                    {threatDetails[selectedThreat].timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center
                            ${threatDetails[selectedThreat].color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                            ${threatDetails[selectedThreat].color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : ''}
                            ${threatDetails[selectedThreat].color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                            ${threatDetails[selectedThreat].color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' : ''}
                          `}>
                            <span className={`text-sm font-bold
                              ${threatDetails[selectedThreat].color === 'red' ? 'text-red-600' : ''}
                              ${threatDetails[selectedThreat].color === 'orange' ? 'text-orange-600' : ''}
                              ${threatDetails[selectedThreat].color === 'purple' ? 'text-purple-600' : ''}
                              ${threatDetails[selectedThreat].color === 'amber' ? 'text-amber-600' : ''}
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
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start space-x-3 mb-4">
                    <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Stop These Threats with TU-1-A</h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        MGM had SOC 2. LastPass had ISO 27001. They still got breached. TU-1-A provides continuous validation through 
                        48,291 real attacks monthly, not annual paperwork. Zero breaches since 2019.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => {
                        closeModal()
                        if (onStartValidation) onStartValidation()
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <IoShieldCheckmarkOutline className="w-5 h-5" />
                      <span>Start TU-1-A Validation</span>
                    </button>
                    <button 
                      onClick={() => {
                        closeModal()
                        window.location.href = '/security/challenge'
                      }}
                      className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <IoBugOutline className="w-5 h-5" />
                      <span>Test Our Security</span>
                    </button>
                  </div>
                </div>

                {/* Data Source Citation */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Sources: IBM Cost of Data Breach Report 2024, ISC2 Cybersecurity Workforce Study 2024, 
                    Verizon Data Breach Investigations Report 2024, Actual breach disclosures from MGM, Change Healthcare, Caesars, LastPass
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