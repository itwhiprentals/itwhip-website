// app/security/certification/details/components/ESGBreakdown.tsx

'use client'

import React, { useState } from 'react'
import {
  IoLeafOutline,
  IoWaterOutline,
  IoFlashOutline,
  IoTrashOutline,
  IoCarOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoAnalyticsOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoCheckmarkCircleOutline,
  IoGlobeOutline,
  IoFlameOutline,
  IoCloudOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoTrophyOutline,
  IoTimerOutline
} from 'react-icons/io5'

export default function ESGBreakdown() {
  const [selectedScope, setSelectedScope] = useState<'scope1' | 'scope2' | 'scope3'>('scope1')
  const [selectedLevel, setSelectedLevel] = useState<'TU-1' | 'TU-2' | 'TU-3'>('TU-1')

  const scopes = {
    scope1: {
      name: 'Scope 1: Direct Emissions',
      description: 'Emissions from sources you own or control',
      icon: IoFlameOutline,
      color: 'red',
      sources: [
        'Hotel vehicle fleet',
        'Natural gas for heating',
        'Backup generators',
        'Kitchen equipment',
        'On-site fuel combustion'
      ]
    },
    scope2: {
      name: 'Scope 2: Indirect Energy',
      description: 'Emissions from purchased electricity, heating, cooling',
      icon: IoFlashOutline,
      color: 'yellow',
      sources: [
        'Purchased electricity',
        'District heating/cooling',
        'Steam consumption',
        'Grid electricity for operations',
        'Electric vehicle charging'
      ]
    },
    scope3: {
      name: 'Scope 3: Value Chain',
      description: 'All other indirect emissions in your value chain',
      icon: IoGlobeOutline,
      color: 'green',
      sources: [
        'Guest transportation',
        'Supply chain emissions',
        'Waste disposal',
        'Employee commuting',
        'Food & beverage sourcing',
        'Laundry services',
        'Construction materials'
      ]
    }
  }

  const esgByLevel = {
    'TU-1': {
      tracking: {
        frequency: 'Real-time',
        automation: '100% Automated',
        accuracy: '99.9%',
        reporting: 'Continuous'
      },
      features: [
        {
          name: 'Carbon Footprint Per Guest',
          description: 'Track exact emissions for each guest stay',
          icon: IoPeopleOutline,
          value: 'Real-time calculation'
        },
        {
          name: 'Transportation Emissions',
          description: 'Every ride tracked and offset-ready',
          icon: IoCarOutline,
          value: 'Per-trip tracking'
        },
        {
          name: 'Energy Monitoring',
          description: 'Smart meter integration with PMS',
          icon: IoFlashOutline,
          value: 'Live dashboard'
        },
        {
          name: 'Water Analytics',
          description: 'Consumption patterns and leak detection',
          icon: IoWaterOutline,
          value: 'AI optimization'
        },
        {
          name: 'Waste Tracking',
          description: 'Weight, type, and diversion rates',
          icon: IoTrashOutline,
          value: 'ROI calculated'
        },
        {
          name: 'Supply Chain',
          description: 'Full Scope 3 supplier emissions',
          icon: IoBusinessOutline,
          value: 'Automated reporting'
        }
      ],
      compliance: [
        'CSRD (EU) compliant',
        'CDP submission ready',
        'TCFD climate risk',
        'Science-Based Targets',
        'ISO 14001',
        'EU Taxonomy aligned'
      ],
      revenue: {
        carbonCredits: '$5-15K/month',
        greenPremium: '+12% ADR',
        corporateContracts: '+$450K/year',
        energySavings: '-23% costs',
        wasteReduction: '-$3K/month',
        insuranceDiscount: 'Additional 10%'
      }
    },
    'TU-2': {
      tracking: {
        frequency: 'Daily',
        automation: '80% Automated',
        accuracy: '95%',
        reporting: 'Weekly'
      },
      features: [
        {
          name: 'Carbon Tracking',
          description: 'Daily emissions calculations',
          icon: IoCloudOutline,
          value: 'Daily updates'
        },
        {
          name: 'Transportation',
          description: 'Aggregated trip emissions',
          icon: IoCarOutline,
          value: 'Weekly reports'
        },
        {
          name: 'Energy Monitoring',
          description: 'Basic meter readings',
          icon: IoFlashOutline,
          value: 'Monthly trends'
        },
        {
          name: 'Water Usage',
          description: 'Consumption tracking',
          icon: IoWaterOutline,
          value: 'Quarterly analysis'
        },
        {
          name: 'Waste Metrics',
          description: 'Monthly waste audits',
          icon: IoTrashOutline,
          value: 'Basic tracking'
        },
        {
          name: 'Supply Chain',
          description: 'Key supplier tracking',
          icon: IoBusinessOutline,
          value: 'Annual review'
        }
      ],
      compliance: [
        'Basic CSRD requirements',
        'Green Key ready',
        'State ESG compliance',
        'OTA sustainability badges'
      ],
      revenue: {
        carbonCredits: 'Eligibility only',
        greenPremium: '+8% ADR',
        corporateContracts: '+$180K/year',
        energySavings: '-15% costs',
        wasteReduction: '-$1.5K/month',
        insuranceDiscount: 'Basic ESG credit'
      }
    },
    'TU-3': {
      tracking: {
        frequency: 'Monthly',
        automation: '30% Automated',
        accuracy: '85%',
        reporting: 'Annual'
      },
      features: [
        {
          name: 'Carbon Estimates',
          description: 'Monthly carbon footprint',
          icon: IoCloudOutline,
          value: 'Estimates only'
        },
        {
          name: 'Basic Tracking',
          description: 'Manual entry options',
          icon: IoDocumentTextOutline,
          value: 'Quarterly'
        },
        {
          name: 'Energy Basics',
          description: 'Utility bill tracking',
          icon: IoFlashOutline,
          value: 'Manual input'
        },
        {
          name: 'Water Basics',
          description: 'Annual consumption',
          icon: IoWaterOutline,
          value: 'Basic metrics'
        },
        {
          name: 'Waste Tracking',
          description: 'Manual logs',
          icon: IoTrashOutline,
          value: 'Self-reported'
        },
        {
          name: 'Green Initiatives',
          description: 'Marketing display',
          icon: IoLeafOutline,
          value: 'Guest-facing'
        }
      ],
      compliance: [
        'Minimum ESG reporting',
        'Basic eco-labels',
        'Marketing claims substantiation'
      ],
      revenue: {
        carbonCredits: 'Not eligible',
        greenPremium: '+3% ADR',
        corporateContracts: 'Basic eligibility',
        energySavings: '-8% costs',
        wasteReduction: 'Tracking only',
        insuranceDiscount: 'Documentation'
      }
    }
  }

  const currentScope = scopes[selectedScope]
  const currentLevel = esgByLevel[selectedLevel]

  return (
    <div className="space-y-8">
      {/* Scope Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Understanding ESG Emissions Scopes
        </h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(scopes).map(([key, scope]) => (
            <button
              key={key}
              onClick={() => setSelectedScope(key as 'scope1' | 'scope2' | 'scope3')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedScope === key
                  ? `border-${scope.color}-500 bg-${scope.color}-50 dark:bg-${scope.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <scope.icon className={`w-8 h-8 mb-2 ${
                selectedScope === key ? `text-${scope.color}-600` : 'text-gray-400'
              }`} />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                {scope.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {scope.description}
              </p>
            </button>
          ))}
        </div>
        
        {/* Selected Scope Details */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            {currentScope.name} - What We Track
          </h4>
          <div className="grid md:grid-cols-2 gap-2">
            {currentScope.sources.map((source, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2" />
                <span>{source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ESG Features by TU Level */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ESG Features by Certification Level
        </h3>
        
        {/* Level Tabs */}
        <div className="flex space-x-2 mb-6">
          {(['TU-1', 'TU-2', 'TU-3'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLevel === level
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Tracking Capabilities */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-6">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <IoAnalyticsOutline className="w-5 h-5 mr-2 text-green-600" />
            {selectedLevel} Tracking Capabilities
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Frequency</p>
              <p className="font-bold text-green-600">{currentLevel.tracking.frequency}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Automation</p>
              <p className="font-bold text-green-600">{currentLevel.tracking.automation}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
              <p className="font-bold text-green-600">{currentLevel.tracking.accuracy}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reporting</p>
              <p className="font-bold text-green-600">{currentLevel.tracking.reporting}</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {currentLevel.features.map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <feature.icon className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {feature.name}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                  {feature.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Standards */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <IoDocumentTextOutline className="w-5 h-5 mr-2 text-blue-600" />
            {selectedLevel} Compliance Standards Met
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentLevel.compliance.map((standard, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-800/30 rounded-full text-xs font-medium text-blue-800 dark:text-blue-300">
                {standard}
              </span>
            ))}
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <IoCashOutline className="w-5 h-5 mr-2 text-purple-600" />
            {selectedLevel} ESG Revenue Impact
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Carbon Credits</p>
              <p className="font-bold text-purple-600">{currentLevel.revenue.carbonCredits}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Green Booking Premium</p>
              <p className="font-bold text-purple-600">{currentLevel.revenue.greenPremium}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Corporate Contracts</p>
              <p className="font-bold text-purple-600">{currentLevel.revenue.corporateContracts}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Energy Savings</p>
              <p className="font-bold text-green-600">{currentLevel.revenue.energySavings}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Waste Reduction</p>
              <p className="font-bold text-green-600">{currentLevel.revenue.wasteReduction}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Insurance Benefit</p>
              <p className="font-bold text-green-600">{currentLevel.revenue.insuranceDiscount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with Others */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Why TU ESG Beats Traditional ESG Platforms
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Others (Green Key, GSTC, etc.)</h4>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoTimerOutline className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>ESG tracking only - no revenue</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoTimerOutline className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>Annual reporting cycles</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoTimerOutline className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>Manual data entry required</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoTimerOutline className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>No operational tools</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoTimerOutline className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>Pure cost center</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">TU ESG Integration</h4>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Revenue from carbon credits & green premiums</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Real-time continuous monitoring</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Automated from actual operations</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Full dashboard & booking tools</span>
              </li>
              <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Profit center - makes money</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}