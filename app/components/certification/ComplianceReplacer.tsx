// app/components/certification/ComplianceReplacer.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  IoShieldCheckmark,
  IoCloseCircle,
  IoCheckmarkCircle,
  IoSwapHorizontal,
  IoTimeOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoWarning,
  IoInfiniteOutline,
  IoRocketOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoArrowForward
} from 'react-icons/io5'

interface ComplianceStandard {
  id: string
  name: string
  shortName: string
  cost: number
  timeToImplement: string
  maintenance: string
  auditFrequency: string
  coverage: string[]
  pain: string[]
  color: string
}

interface TUFeature {
  name: string
  included: boolean
  tier: 'all' | 'TU-2+' | 'TU-1'
}

export function ComplianceReplacer() {
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [animateCheck, setAnimateCheck] = useState(false)
  const [totalSavings, setTotalSavings] = useState(0)

  const complianceStandards: ComplianceStandard[] = [
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      shortName: 'SOC 2',
      cost: 50000,
      timeToImplement: '6-9 months',
      maintenance: '$15K/year',
      auditFrequency: 'Annual',
      coverage: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy'],
      pain: ['Expensive auditors', 'Long implementation', 'Annual recertification', 'Complex evidence collection'],
      color: 'blue'
    },
    {
      id: 'iso27001',
      name: 'ISO 27001:2022',
      shortName: 'ISO',
      cost: 75000,
      timeToImplement: '9-12 months',
      maintenance: '$20K/year',
      auditFrequency: 'Annual + Surveillance',
      coverage: ['Information Security', 'Risk Management', 'Asset Management', 'Access Control'],
      pain: ['114 controls to implement', 'Expensive consultants', 'Document heavy', '3-year certification cycle'],
      color: 'red'
    },
    {
      id: 'pci',
      name: 'PCI DSS Level 1',
      shortName: 'PCI',
      cost: 25000,
      timeToImplement: '3-6 months',
      maintenance: '$10K/year',
      auditFrequency: 'Quarterly',
      coverage: ['Payment Card Security', 'Network Security', 'Vulnerability Management'],
      pain: ['Quarterly scans required', 'Strict requirements', 'Heavy penalties for breach', 'Complex questionnaires'],
      color: 'green'
    },
    {
      id: 'hipaa',
      name: 'HIPAA Compliance',
      shortName: 'HIPAA',
      cost: 30000,
      timeToImplement: '4-6 months',
      maintenance: '$12K/year',
      auditFrequency: 'Ongoing',
      coverage: ['PHI Protection', 'Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards'],
      pain: ['Complex regulations', 'Severe penalties', 'Business Associate Agreements', 'Breach notifications'],
      color: 'purple'
    },
    {
      id: 'gdpr',
      name: 'GDPR Compliance',
      shortName: 'GDPR',
      cost: 20000,
      timeToImplement: '2-4 months',
      maintenance: '$8K/year',
      auditFrequency: 'Ongoing',
      coverage: ['Data Protection', 'Privacy Rights', 'Consent Management', 'Data Portability'],
      pain: ['4% revenue fines', 'DPO requirement', 'Complex consent flows', '72-hour breach notification'],
      color: 'yellow'
    },
    {
      id: 'fedramp',
      name: 'FedRAMP Moderate',
      shortName: 'FedRAMP',
      cost: 100000,
      timeToImplement: '12-18 months',
      maintenance: '$50K/year',
      auditFrequency: 'Continuous',
      coverage: ['Government Cloud Security', 'Continuous Monitoring', 'Incident Response'],
      pain: ['Extremely expensive', 'Very long process', 'Continuous monitoring', '325+ security controls'],
      color: 'indigo'
    }
  ]

  const tuFeatures: TUFeature[] = [
    { name: 'Security Controls', included: true, tier: 'all' },
    { name: 'Compliance Automation', included: true, tier: 'all' },
    { name: 'Continuous Monitoring', included: true, tier: 'all' },
    { name: 'Vulnerability Management', included: true, tier: 'all' },
    { name: 'Access Control', included: true, tier: 'all' },
    { name: 'Data Encryption', included: true, tier: 'all' },
    { name: 'Audit Logging', included: true, tier: 'all' },
    { name: 'Incident Response', included: true, tier: 'all' },
    { name: 'Risk Assessment', included: true, tier: 'TU-2+' },
    { name: 'Penetration Testing', included: true, tier: 'TU-2+' },
    { name: 'Compliance Reports', included: true, tier: 'all' },
    { name: 'ESG Reporting', included: true, tier: 'TU-1' },
    { name: 'Bug Bounty Program', included: true, tier: 'TU-1' },
    { name: 'White Glove Support', included: true, tier: 'TU-1' },
    { name: 'Custom Frameworks', included: true, tier: 'TU-1' }
  ]

  // Calculate total savings
  useEffect(() => {
    const total = complianceStandards.reduce((sum, standard) => sum + standard.cost, 0)
    animateValue(0, total, 2000, setTotalSavings)
  }, [])

  const animateValue = (start: number, end: number, duration: number, setter: (value: number) => void) => {
    const range = end - start
    const increment = range / (duration / 16)
    let current = start
    
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setter(end)
        clearInterval(timer)
      } else {
        setter(Math.floor(current))
      }
    }, 16)
  }

  const handleCompare = () => {
    setIsComparing(true)
    setTimeout(() => {
      setAnimateCheck(true)
    }, 500)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full mb-4">
            <IoSwapHorizontal className="w-5 h-5" />
            <span className="font-semibold">One Certificate to Rule Them All</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Replace <span className="text-red-600">${totalSavings.toLocaleString()}</span> Worth of Compliance
            <br />
            With <span className="text-green-600">ONE</span> TU Certificate
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stop juggling multiple certifications, auditors, and renewal dates.
            TU Certification covers everything and MORE.
          </p>
        </div>

        {/* Visual Comparison */}
        <div className="mb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Traditional Compliance (Left) */}
            <div className="relative">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Traditional Compliance Hell
              </h3>
              
              <div className="space-y-4">
                {complianceStandards.map((standard, index) => (
                  <div
                    key={standard.id}
                    className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                      selectedStandard === standard.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedStandard(selectedStandard === standard.id ? null : standard.id)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                          standard.color === 'blue' ? 'from-blue-500 to-blue-600' :
                          standard.color === 'red' ? 'from-red-500 to-red-600' :
                          standard.color === 'green' ? 'from-green-500 to-green-600' :
                          standard.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          standard.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                          'from-indigo-500 to-indigo-600'
                        } flex items-center justify-center text-white font-bold text-xs`}>
                          {standard.shortName}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{standard.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {standard.timeToImplement} implementation
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">${standard.cost.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">+ {standard.maintenance}</p>
                      </div>
                    </div>

                    {selectedStandard === standard.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Coverage</p>
                            <div className="flex flex-wrap gap-1">
                              {standard.coverage.map((item) => (
                                <span key={item} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pain Points</p>
                            <ul className="space-y-1">
                              {standard.pain.map((pain) => (
                                <li key={pain} className="text-xs text-red-600 dark:text-red-400 flex items-start">
                                  <IoCloseCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                  {pain}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Cost */}
              <div className="mt-6 bg-red-50 dark:bg-red-900/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total Annual Cost</span>
                  <span className="text-2xl font-bold text-red-600">
                    ${complianceStandards.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <IoTimeOutline className="w-4 h-4 mr-2" />
                    <span>18+ months to implement all</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <IoDocumentTextOutline className="w-4 h-4 mr-2" />
                    <span>6 different auditors needed</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <IoCashOutline className="w-4 h-4 mr-2" />
                    <span>$125K+ annual maintenance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Animation */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <IoArrowForward className="w-12 h-12 text-purple-600 animate-pulse" />
                {isComparing && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-sm font-bold text-purple-600">REPLACE ALL</span>
                  </div>
                )}
              </div>
            </div>

            {/* TU Certification (Right) */}
            <div className="relative">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                TU Certification Paradise
              </h3>

              {/* TU Certificate Card */}
              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-600 rounded-xl p-1">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <IoShieldCheckmark className="w-12 h-12 text-purple-600" />
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">TU-1-A</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise Grade</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Starting at</p>
                      <p className="text-2xl font-bold text-green-600">$999/mo</p>
                    </div>
                  </div>

                  {/* Feature Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {tuFeatures.slice(0, 8).map((feature, index) => (
                      <div key={feature.name} className="flex items-center space-x-2">
                        <IoCheckmarkCircle className={`w-5 h-5 text-green-500 ${
                          animateCheck ? 'animate-scaleIn' : 'opacity-0'
                        }`} style={{ animationDelay: `${index * 0.1}s` }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Comparison Benefits */}
                  <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Implementation Time</span>
                      <span className="text-sm font-bold text-green-600">15 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Auditors Needed</span>
                      <span className="text-sm font-bold text-green-600">Zero (We handle it)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Renewal Process</span>
                      <span className="text-sm font-bold text-green-600">Automatic</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Coverage</span>
                      <span className="text-sm font-bold text-green-600">Everything + More</span>
                    </div>
                  </div>

                  {/* Special Features */}
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <h5 className="font-bold text-purple-900 dark:text-purple-300 mb-3">
                      Exclusive TU Benefits
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <IoRocketOutline className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Revenue Generation
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Earn $300K+/year from ride facilitation
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <IoGlobeOutline className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ESG Compliance
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Automatic ESG reporting for investors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <IoInfiniteOutline className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Continuous Updates
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Always compliant with latest standards
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compare Button */}
              {!isComparing && (
                <button
                  onClick={handleCompare}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  See How TU Replaces Everything
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Coverage Matrix */}
        {isComparing && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Complete Coverage Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-bold text-gray-900 dark:text-white">Requirement</th>
                    {complianceStandards.map(standard => (
                      <th key={standard.id} className="text-center py-3 px-2 font-bold text-gray-700 dark:text-gray-300 text-sm">
                        {standard.shortName}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                      TU-1-A
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'Security Controls',
                    'Access Management',
                    'Data Encryption',
                    'Audit Logging',
                    'Incident Response',
                    'Risk Assessment',
                    'Vendor Management',
                    'Business Continuity',
                    'Compliance Reporting',
                    'Revenue Generation'
                  ].map((requirement) => (
                    <tr key={requirement} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{requirement}</td>
                      {complianceStandards.map(standard => (
                        <td key={standard.id} className="text-center py-3 px-2">
                          {requirement === 'Revenue Generation' ? (
                            <IoCloseCircle className="w-5 h-5 text-red-500 mx-auto" />
                          ) : Math.random() > 0.3 ? (
                            <IoCheckmarkCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <IoWarning className="w-5 h-5 text-yellow-500 mx-auto" />
                          )}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4">
                        <IoCheckmarkCircle className="w-6 h-6 text-purple-600 mx-auto animate-scaleIn" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <IoCloseCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300">Not Covered</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <IoWarning className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300">Partially Covered</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <IoCheckmarkCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300">Fully Covered</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            <IoLockClosedOutline className="inline w-6 h-6 mr-2" />
            Stop paying for multiple certifications that don't generate revenue.
            <span className="block mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
              One Certificate. All Compliance. Plus Revenue.
            </span>
          </p>
          <button
            onClick={() => document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Replace My Compliance Now
          </button>
        </div>
      </div>
    </section>
  )
}