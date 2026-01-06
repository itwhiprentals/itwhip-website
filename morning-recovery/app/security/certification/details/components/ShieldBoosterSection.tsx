// app/security/certification/details/components/ShieldBoosterSection.tsx

'use client'

import React, { useState } from 'react'
import {
  IoShieldOutline,
  IoAddCircleOutline,
  IoLayersOutline,
  IoCheckmarkCircleOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoTimerOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoConstructOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function ShieldBoosterSection() {
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>(['SOC 2'])
  const [showSavings, setShowSavings] = useState(false)

  const existingCertifications = [
    { id: 'SOC 2', name: 'SOC 2 Type II', annualCost: 65000 },
    { id: 'ISO 27001', name: 'ISO 27001', annualCost: 50000 },
    { id: 'PCI DSS', name: 'PCI DSS Level 1', annualCost: 35000 },
    { id: 'HIPAA', name: 'HIPAA Compliance', annualCost: 45000 },
    { id: 'Green Key', name: 'Green Key Certification', annualCost: 15000 },
    { id: 'GSTC', name: 'GSTC Accreditation', annualCost: 20000 }
  ]

  const toggleCertification = (certId: string) => {
    setSelectedCertifications(prev =>
      prev.includes(certId)
        ? prev.filter(id => id !== certId)
        : [...prev, certId]
    )
  }

  const calculateCurrentCost = () => {
    return selectedCertifications.reduce((total, certId) => {
      const cert = existingCertifications.find(c => c.id === certId)
      return total + (cert?.annualCost || 0)
    }, 0)
  }

  const calculateShieldBoosterPrice = () => {
    const baseTUPrice = 54000 // Annual TU price
    const discount = 0.3 // 30% discount for Shield Booster
    return baseTUPrice * (1 - discount)
  }

  const migrationPhases = [
    {
      phase: 1,
      name: 'Integration',
      duration: 'Week 1-2',
      activities: [
        'Add TU alongside existing certifications',
        'Configure dashboard integration',
        'Connect existing compliance data',
        'Begin continuous validation'
      ]
    },
    {
      phase: 2,
      name: 'Parallel Running',
      duration: 'Month 1-6',
      activities: [
        'Both systems run simultaneously',
        'Compare validation results',
        'Generate revenue from TU',
        'Build confidence in TU coverage'
      ]
    },
    {
      phase: 3,
      name: 'Consolidation',
      duration: 'Month 7-12',
      activities: [
        'Identify redundant certifications',
        'Begin phasing out duplicates',
        'Maintain critical compliance',
        'Maximize revenue generation'
      ]
    },
    {
      phase: 4,
      name: 'Optimization',
      duration: 'Year 2+',
      activities: [
        'TU as primary certification',
        'Keep only unique requirements',
        'Full revenue optimization',
        'Minimal compliance costs'
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* What is Shield Booster */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <IoShieldOutline className="w-12 h-12 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Shield Booster: Keep What Works, Add What Pays
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Already invested in SOC 2, ISO 27001, or other certifications? Don't throw them away. 
              Add TU as a revenue layer on top of your existing compliance infrastructure.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <IoLayersOutline className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Layer On Top</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  TU complements your existing certifications
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <IoCashOutline className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">30% Discount</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Reduced pricing since you maintain others
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <IoTrendingUpOutline className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Focus</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Use TU for what others can't provide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Certifications Calculator */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Calculate Your Shield Booster Savings
        </h3>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select your current certifications:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {existingCertifications.map((cert) => (
              <button
                key={cert.id}
                onClick={() => toggleCertification(cert.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedCertifications.includes(cert.id)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {cert.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${cert.annualCost.toLocaleString()}/year
                    </p>
                  </div>
                  {selectedCertifications.includes(cert.id) && (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowSavings(true)}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Calculate Shield Booster Savings
        </button>

        {showSavings && (
          <div className="mt-6 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Annual Cost</p>
              <p className="text-2xl font-bold text-red-600">
                ${calculateCurrentCost().toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                For {selectedCertifications.length} certification(s) with zero revenue
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">With Shield Booster TU</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Keep existing certifications:</span>
                  <span className="text-sm font-semibold">${calculateCurrentCost().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Add TU (30% off):</span>
                  <span className="text-sm font-semibold">${calculateShieldBoosterPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-semibold">Total Cost:</span>
                  <span className="text-lg font-bold">${(calculateCurrentCost() + calculateShieldBoosterPrice()).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-sm font-semibold">TU Revenue Generation:</span>
                  <span className="text-lg font-bold">+$500,000</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4">
              <p className="text-purple-900 dark:text-purple-100 font-bold text-lg">
                Net Position: +${(500000 - calculateCurrentCost() - calculateShieldBoosterPrice()).toLocaleString()}/year
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Turn compliance from a cost center into a profit center
              </p>
            </div>
          </div>
        )}
      </div>

      {/* What Shield Booster Provides */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <IoAddCircleOutline className="w-5 h-5 mr-2 text-green-600" />
            What TU Adds to Your Stack
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Generation</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  $500K+ from transportation and ESG
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Operational Tools</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Booking management, transport, mini-store
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Real-time Validation</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Continuous monitoring vs annual checks
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest Experience</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Seamless booking and transportation
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">ESG Monetization</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Carbon credits and green premiums
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <IoDocumentTextOutline className="w-5 h-5 mr-2 text-blue-600" />
            What You Keep
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Existing Certifications</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  SOC 2, ISO, PCI remain valid
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Audit Relationships</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Continue with current auditors
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Compliance Processes</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Existing workflows remain
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Industry Recognition</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Maintain all certifications
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Vendor Relationships</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No disruption to partners
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Migration Timeline */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Shield Booster Migration Path
        </h3>
        
        <div className="space-y-4">
          {migrationPhases.map((phase, idx) => (
            <div key={phase.phase} className="relative">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    phase.phase === 1 ? 'bg-purple-600' :
                    phase.phase === 2 ? 'bg-blue-600' :
                    phase.phase === 3 ? 'bg-green-600' :
                    'bg-indigo-600'
                  }`}>
                    {phase.phase}
                  </div>
                  {idx < migrationPhases.length - 1 && (
                    <div className="w-0.5 h-24 bg-gray-300 dark:bg-gray-700 mx-5 mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Phase {phase.phase}: {phase.name}
                    </h4>
                    <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {phase.duration}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {phase.activities.map((activity, actIdx) => (
                      <li key={actIdx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Studies */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
          <IoBusinessOutline className="w-8 h-8 text-green-600 mb-3" />
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
            Case Study: 300-Room Business Hotel
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Before (SOC 2 + ISO):</span>
              <span className="font-semibold text-red-600">-$115K/year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Shield Booster TU added:</span>
              <span className="font-semibold">$37.8K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">TU Revenue generated:</span>
              <span className="font-semibold text-green-600">+$500K</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
              <span className="font-semibold">Net Position:</span>
              <span className="font-bold text-green-600 text-lg">+$347K/year</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          <IoSparklesOutline className="w-8 h-8 text-purple-600 mb-3" />
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
            Case Study: Luxury Resort Chain
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Before (Full stack):</span>
              <span className="font-semibold text-red-600">-$230K/year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Shield Booster TU added:</span>
              <span className="font-semibold">$37.8K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">TU Revenue (premium):</span>
              <span className="font-semibold text-green-600">+$750K</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
              <span className="font-semibold">Net Position:</span>
              <span className="font-bold text-green-600 text-lg">+$482K/year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">
          Don't Replace. Enhance. Profit.
        </h3>
        <p className="text-lg mb-6 opacity-90">
          Shield Booster lets you keep your investments while adding the only certification that generates revenue.
          Start earning from compliance today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Calculate Your Shield Booster ROI
          </button>
          <button className="px-6 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors">
            Talk to Shield Booster Expert
          </button>
        </div>
      </div>
    </div>
  )
}