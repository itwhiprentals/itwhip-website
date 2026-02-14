// app/security/certification/details/components/ComplianceMatrix.tsx

'use client'

import React, { useState } from 'react'
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimerOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoInfiniteOutline,
  IoDocumentTextOutline,
  IoAnalyticsOutline,
  IoTrendingDownOutline,
  IoFlashOutline
} from 'react-icons/io5'

export default function ComplianceMatrix() {
  const [selectedComparison, setSelectedComparison] = useState<'overview' | 'cost' | 'validation' | 'coverage'>('overview')

  const complianceStandards = {
    'TU Certification': {
      validation: 'Every second, 24/7/365',
      cost: '$450-$12,500/month (generates revenue)',
      coverage: 'All standards exceeded',
      auditFrequency: 'Continuous',
      reportingBurden: 'Automated',
      falsePositives: '0%',
      breachProtection: '100%',
      revenue: '+$500K/year',
      icon: IoShieldCheckmarkOutline,
      color: 'purple'
    },
    'SOC 2': {
      validation: 'Annual audit',
      cost: '$30,000-$100,000/year',
      coverage: 'Security controls only',
      auditFrequency: 'Annual',
      reportingBurden: '200+ hours',
      falsePositives: 'N/A',
      breachProtection: 'Limited',
      revenue: '$0',
      icon: IoDocumentTextOutline,
      color: 'blue'
    },
    'ISO 27001': {
      validation: 'Every 3 years',
      cost: '$50,000-$150,000/cycle',
      coverage: 'Information security',
      auditFrequency: 'Triennial',
      reportingBurden: '300+ hours',
      falsePositives: 'N/A',
      breachProtection: 'Basic',
      revenue: '$0',
      icon: IoDocumentTextOutline,
      color: 'green'
    },
    'PCI DSS': {
      validation: 'Quarterly scans',
      cost: '$5,000-$50,000/year',
      coverage: 'Payment security',
      auditFrequency: 'Quarterly',
      reportingBurden: '100+ hours',
      falsePositives: 'High',
      breachProtection: 'Payment only',
      revenue: '$0',
      icon: IoDocumentTextOutline,
      color: 'red'
    }
  }

  const detailedComparison = {
    'Security Features': {
      'TU Certification': true,
      'SOC 2': true,
      'ISO 27001': true,
      'PCI DSS': 'partial'
    },
    'ESG Tracking': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': false
    },
    'Revenue Generation': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': false
    },
    'Real-time Monitoring': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': false
    },
    'Automated Reporting': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': 'partial'
    },
    'Insurance Discounts': {
      'TU Certification': '40%',
      'SOC 2': '10%',
      'ISO 27001': '15%',
      'PCI DSS': '5%'
    },
    'Compliance Automation': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': false
    },
    'Threat Intelligence': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': false
    },
    'Operational Tools': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': false
    },
    'Guest Experience': {
      'TU Certification': true,
      'SOC 2': false,
      'ISO 27001': false,
      'PCI DSS': false
    }
  }

  const renderComparisonValue = (value: boolean | string) => {
    if (value === true) {
      return <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
    } else if (value === false) {
      return <IoCloseCircleOutline className="w-5 h-5 text-red-500" />
    } else if (value === 'partial') {
      return <IoTimerOutline className="w-5 h-5 text-yellow-500" />
    } else {
      return <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{value}</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* Comparison Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['overview', 'cost', 'validation', 'coverage'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedComparison(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              selectedComparison === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Comparison */}
      {selectedComparison === 'overview' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(complianceStandards).map(([name, standard]) => (
            <div 
              key={name}
              className={`bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border-2 ${
                name === 'TU Certification' 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {name}
                </h3>
                <standard.icon className={`w-6 h-6 text-${standard.color}-600`} />
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Validation</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {standard.validation}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Annual Cost</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {standard.cost}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Revenue Impact</p>
                  <p className={`text-sm font-bold ${
                    name === 'TU Certification' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {standard.revenue}
                  </p>
                </div>
                
                {name === 'TU Certification' && (
                  <div className="mt-4 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-xs text-green-800 dark:text-green-300 font-semibold">
                      Only certification that pays you back
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost Comparison */}
      {selectedComparison === 'cost' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Total Cost of Ownership (Annual)
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 font-semibold text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div>Certification</div>
              <div>Direct Cost</div>
              <div>Staff Time</div>
              <div>Revenue Impact</div>
              <div>Net Position</div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="font-semibold text-gray-900 dark:text-white">TU Certification</div>
              <div className="text-sm">$54K/year</div>
              <div className="text-sm">0 hours (automated)</div>
              <div className="text-sm font-bold text-green-600">+$500K</div>
              <div className="text-lg font-bold text-green-600">+$446K</div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
              <div className="font-semibold text-gray-900 dark:text-white">SOC 2</div>
              <div className="text-sm">$65K/year</div>
              <div className="text-sm">200+ hours</div>
              <div className="text-sm text-red-600">$0</div>
              <div className="text-lg font-bold text-red-600">-$85K</div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
              <div className="font-semibold text-gray-900 dark:text-white">ISO 27001</div>
              <div className="text-sm">$50K/year</div>
              <div className="text-sm">300+ hours</div>
              <div className="text-sm text-red-600">$0</div>
              <div className="text-lg font-bold text-red-600">-$80K</div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
              <div className="font-semibold text-gray-900 dark:text-white">PCI DSS</div>
              <div className="text-sm">$25K/year</div>
              <div className="text-sm">100+ hours</div>
              <div className="text-sm text-red-600">$0</div>
              <div className="text-lg font-bold text-red-600">-$35K</div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center p-3 border-t border-gray-300 dark:border-gray-600 pt-4">
              <div className="font-bold text-gray-900 dark:text-white">All Traditional</div>
              <div className="text-sm font-semibold">$140K/year</div>
              <div className="text-sm font-semibold">600+ hours</div>
              <div className="text-sm font-bold text-red-600">$0</div>
              <div className="text-lg font-bold text-red-600">-$200K</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-green-800 dark:text-green-300 font-semibold">
              TU Certification advantage: $646K/year better position than traditional compliance
            </p>
          </div>
        </div>
      )}

      {/* Validation Frequency */}
      {selectedComparison === 'validation' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Validation Frequency & Protection Level
          </h3>
          
          <div className="relative">
            {/* Timeline visualization */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-32 text-right">
                  <p className="font-semibold text-purple-600">TU Certification</p>
                </div>
                <div className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 h-12 rounded-lg flex items-center px-4">
                  <IoInfiniteOutline className="w-6 h-6 text-white mr-2" />
                  <span className="text-white font-semibold">Continuous - Every Second</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-32 text-right">
                  <p className="font-semibold text-gray-600">PCI DSS</p>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-12 rounded-lg">
                  <div className="bg-red-500 h-12 rounded-lg w-1/4 flex items-center px-4">
                    <span className="text-white text-sm">Quarterly</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-32 text-right">
                  <p className="font-semibold text-gray-600">SOC 2</p>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-12 rounded-lg">
                  <div className="bg-blue-500 h-12 rounded-lg w-1/12 flex items-center px-4">
                    <span className="text-white text-sm">Annual</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-32 text-right">
                  <p className="font-semibold text-gray-600">ISO 27001</p>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-12 rounded-lg">
                  <div className="bg-green-500 h-12 rounded-lg w-8 flex items-center px-2">
                    <span className="text-white text-xs">3yr</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                <IoWarningOutline className="inline w-4 h-4 mr-1" />
                Traditional certifications check annually while hackers attack every second. 
                TU validates continuously, catching threats in real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Coverage Comparison */}
      {selectedComparison === 'coverage' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Feature Coverage Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Feature
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-purple-600">
                    TU Cert
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    SOC 2
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ISO 27001
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    PCI DSS
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(detailedComparison).map(([feature, values], idx) => (
                  <tr key={feature} className={`border-b border-gray-100 dark:border-gray-800 ${
                    idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                  }`}>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </td>
                    <td className="text-center py-3 px-2">
                      {renderComparisonValue(values['TU Certification'])}
                    </td>
                    <td className="text-center py-3 px-2">
                      {renderComparisonValue(values['SOC 2'])}
                    </td>
                    <td className="text-center py-3 px-2">
                      {renderComparisonValue(values['ISO 27001'])}
                    </td>
                    <td className="text-center py-3 px-2">
                      {renderComparisonValue(values['PCI DSS'])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                TU includes everything
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                All compliance standards exceeded plus revenue generation
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <IoTimerOutline className="w-6 h-6 text-yellow-600 mb-2" />
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Traditional is fragmented
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Need multiple certifications for full coverage
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <IoTrendingDownOutline className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                Cost vs Value
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                TU costs less and generates revenue
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Line */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">The Bottom Line</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Without TU (Traditional Stack)</h4>
            <ul className="space-y-2 text-sm">
              <li>• SOC 2 + ISO + PCI = $200K+/year</li>
              <li>• 600+ hours of staff time</li>
              <li>• Annual or less frequent checks</li>
              <li>• Zero revenue generation</li>
              <li>• No ESG tracking</li>
              <li>• No operational tools</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">With TU Certification</h4>
            <ul className="space-y-2 text-sm">
              <li>• Single certification = $54K/year</li>
              <li>• Fully automated (0 hours)</li>
              <li>• Continuous validation every second</li>
              <li>• Generates $500K+/year revenue</li>
              <li>• Complete ESG tracking included</li>
              <li>• Full operational dashboard</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <p className="text-lg font-bold">
            Net advantage with TU: +$646K/year better financial position
          </p>
        </div>
      </div>
    </div>
  )
}