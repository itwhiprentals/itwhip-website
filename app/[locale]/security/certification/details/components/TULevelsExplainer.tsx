// app/security/certification/details/components/TULevelsExplainer.tsx

'use client'

import React, { useState } from 'react'
import {
  IoTrophyOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoFlashOutline,
  IoStarOutline,
  IoLockClosedOutline,
  IoAnalyticsOutline,
  IoCashOutline,
  IoInfiniteOutline,
  IoWarningOutline,
  IoTimerOutline,
  IoGlobeOutline,
  IoServerOutline,
  IoCloudOutline
} from 'react-icons/io5'

export default function TULevelsExplainer() {
  const [selectedLevel, setSelectedLevel] = useState<'TU-1' | 'TU-2' | 'TU-3'>('TU-1')
  const [selectedGrade, setSelectedGrade] = useState<'A' | 'B' | 'C'>('A')

  const levels = {
    'TU-1': {
      name: 'Elite Protection',
      description: 'Enterprise hotels, luxury resorts, flagship properties',
      validation: 'Every second, 24/7/365',
      icon: IoTrophyOutline,
      color: 'purple',
      grades: {
        'A': {
          score: '95-100%',
          features: [
            'Quantum-resistant encryption',
            'Zero-trust architecture',
            'AI-powered threat hunting',
            'Nation-state attack resistance',
            'Real-time vulnerability patching',
            'Honeypot deployment',
            'Behavioral traffic analysis',
            'Machine learning anomaly detection'
          ],
          benefits: [
            '40% insurance premium reduction',
            'Government contract eligibility',
            'Threat intelligence monetization ($10-50K/month)',
            'Priority corporate listings',
            'Surge pricing immunity',
            'Zero liability for breaches'
          ],
          revenue: {
            transportation: '$125K/month',
            miniStore: '$85K/month',
            threatIntel: '$25K/month',
            premiumBookings: '+35% ADR',
            total: '$2.8M/year'
          }
        },
        'B': {
          score: '85-94%',
          features: [
            'Advanced encryption',
            'Multi-layer security',
            'Weekly threat scanning',
            'Basic AI detection',
            'Standard patching',
            'Regular monitoring',
            'Traffic analysis',
            'Pattern detection'
          ],
          benefits: [
            '30% insurance reduction',
            'Fortune 500 eligibility',
            'Basic threat data sales',
            'Enhanced listings',
            'Partial surge protection',
            'Limited liability coverage'
          ],
          revenue: {
            transportation: '$100K/month',
            miniStore: '$65K/month',
            threatIntel: '$15K/month',
            premiumBookings: '+25% ADR',
            total: '$2.2M/year'
          }
        },
        'C': {
          score: '75-84%',
          features: [
            'Standard encryption',
            'Basic security layers',
            'Monthly scanning',
            'Rule-based detection',
            'Scheduled patches',
            'Basic monitoring',
            'Log analysis',
            'Alert system'
          ],
          benefits: [
            '20% insurance reduction',
            'Regional contracts',
            'No threat data sales',
            'Standard listings',
            'Basic protection',
            'Standard liability'
          ],
          revenue: {
            transportation: '$75K/month',
            miniStore: '$45K/month',
            threatIntel: '$0',
            premiumBookings: '+15% ADR',
            total: '$1.5M/year'
          }
        }
      },
      compliance: ['SOC 2 Type II', 'ISO 27001/27002/27017/27018', 'PCI DSS Level 1', 'HIPAA', 'GDPR', 'CCPA', 'FedRAMP', 'NIST', 'SWIFT CSP'],
      esg: 'Full Scope 1, 2, and 3 emissions tracking with real-time reporting'
    },
    'TU-2': {
      name: 'Business Shield',
      description: 'Mid-size hotels, business properties, regional chains',
      validation: 'Every minute, 16/7 monitoring',
      icon: IoBusinessOutline,
      color: 'blue',
      grades: {
        'A': {
          score: '95-100%',
          features: [
            'Military-grade AES-256',
            'Multi-factor authentication',
            'Weekly penetration testing',
            'DDoS protection (10Gbps)',
            'Automated backups',
            'Intrusion detection',
            'Security training',
            'Vendor management'
          ],
          benefits: [
            '25% insurance reduction',
            'Fortune 500 qualification',
            'Threat intelligence sharing',
            'Enhanced corporate listings',
            'OTA penalty protection',
            'Audit immunity'
          ],
          revenue: {
            transportation: '$45K/month',
            miniStore: '$35K/month',
            threatIntel: '$0',
            premiumBookings: '+20% ADR',
            total: '$960K/year'
          }
        },
        'B': {
          score: '85-94%',
          features: [
            'Strong encryption',
            'Standard MFA',
            'Monthly testing',
            'Basic DDoS protection',
            'Daily backups',
            'Basic detection',
            'Annual training',
            'Basic vendor checks'
          ],
          benefits: [
            '20% insurance reduction',
            'Corporate eligibility',
            'Basic threat sharing',
            'Standard listings',
            'Partial protection',
            'Basic audit support'
          ],
          revenue: {
            transportation: '$35K/month',
            miniStore: '$25K/month',
            threatIntel: '$0',
            premiumBookings: '+15% ADR',
            total: '$720K/year'
          }
        },
        'C': {
          score: '75-84%',
          features: [
            'Standard encryption',
            'Password policies',
            'Quarterly testing',
            'Basic protection',
            'Weekly backups',
            'Log monitoring',
            'Basic awareness',
            'Vendor list'
          ],
          benefits: [
            '15% insurance reduction',
            'Basic eligibility',
            'No threat sharing',
            'Basic listings',
            'Minimal protection',
            'Documentation only'
          ],
          revenue: {
            transportation: '$25K/month',
            miniStore: '$15K/month',
            threatIntel: '$0',
            premiumBookings: '+10% ADR',
            total: '$480K/year'
          }
        }
      },
      compliance: ['SOC 2 Type I', 'ISO 27001', 'PCI DSS Level 2', 'GDPR', 'Basic HIPAA', 'State privacy laws'],
      esg: 'Scope 1, 2, and basic Scope 3 tracking with quarterly reports'
    },
    'TU-3': {
      name: 'Starter Security',
      description: 'Small hotels, boutique properties, B&Bs',
      validation: 'Every hour, business hours monitoring',
      icon: IoShieldCheckmarkOutline,
      color: 'green',
      grades: {
        'A': {
          score: '95-100%',
          features: [
            'SSL/TLS encryption',
            'Firewall protection',
            'Monthly security scans',
            'Password enforcement',
            'Daily backups',
            'Basic threat monitoring',
            'Security tools',
            'Incident planning'
          ],
          benefits: [
            '10% insurance reduction',
            'Regional corporate rates',
            'Basic threat protection',
            'Compliance documentation',
            'OTA requirement met',
            'Peace of mind'
          ],
          revenue: {
            transportation: '$15K/month',
            miniStore: '$12K/month',
            threatIntel: '$0',
            premiumBookings: '+10% ADR',
            total: '$324K/year'
          }
        },
        'B': {
          score: '85-94%',
          features: [
            'Basic SSL/TLS',
            'Standard firewall',
            'Quarterly scans',
            'Basic passwords',
            'Weekly backups',
            'Log checking',
            'Basic tools',
            'Basic plan'
          ],
          benefits: [
            '7% insurance reduction',
            'Local rates',
            'Minimal protection',
            'Basic documentation',
            'Compliance met',
            'Basic security'
          ],
          revenue: {
            transportation: '$10K/month',
            miniStore: '$8K/month',
            threatIntel: '$0',
            premiumBookings: '+7% ADR',
            total: '$216K/year'
          }
        },
        'C': {
          score: '75-84%',
          features: [
            'Minimal SSL',
            'Basic protection',
            'Annual scans',
            'Password reminder',
            'Monthly backups',
            'Basic logs',
            'Self-service',
            'Template plan'
          ],
          benefits: [
            '5% insurance reduction',
            'Basic eligibility',
            'Minimum protection',
            'Documentation',
            'Basic compliance',
            'Starting point'
          ],
          revenue: {
            transportation: '$5K/month',
            miniStore: '$4K/month',
            threatIntel: '$0',
            premiumBookings: '+5% ADR',
            total: '$108K/year'
          }
        }
      },
      compliance: ['PCI DSS Level 3/4', 'Basic GDPR', 'State minimums', 'Credit card security'],
      esg: 'Basic Scope 1 and 2 tracking with annual reports'
    }
  }

  const currentLevel = levels[selectedLevel]
  const currentGrade = currentLevel.grades[selectedGrade]

  return (
    <div className="space-y-8">
      {/* Level Selector */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(levels).map(([key, level]) => (
          <button
            key={key}
            onClick={() => setSelectedLevel(key as 'TU-1' | 'TU-2' | 'TU-3')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedLevel === key
                ? `border-${level.color}-500 bg-${level.color}-50 dark:bg-${level.color}-900/20`
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{key}</h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{level.name}</p>
              </div>
              <level.icon className={`w-6 h-6 ${
                selectedLevel === key ? `text-${level.color}-600` : 'text-gray-400'
              }`} />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {level.description}
            </p>
            <div className="flex items-center space-x-1 text-xs">
              <IoTimerOutline className="w-3 h-3 text-gray-500" />
              <span className="text-gray-500">{level.validation}</span>
            </div>
            {selectedLevel === key && (
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Grade Selector */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Select Grade for {selectedLevel}
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['A', 'B', 'C'] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedGrade === grade
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Grade {grade}
              </div>
              <div className="text-xs text-gray-500">
                Score: {levels[selectedLevel].grades[grade].score}
              </div>
              <div className="mt-2">
                {grade === 'A' && <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>}
                {grade === 'B' && <div className="text-yellow-400">⭐⭐⭐⭐</div>}
                {grade === 'C' && <div className="text-yellow-400">⭐⭐⭐</div>}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Configuration Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Security Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <IoLockClosedOutline className="w-5 h-5 mr-2 text-purple-600" />
              Security Features
            </h4>
            <ul className="space-y-2">
              {currentGrade.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <IoTrophyOutline className="w-5 h-5 mr-2 text-blue-600" />
              Business Benefits
            </h4>
            <ul className="space-y-2">
              {currentGrade.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Revenue Potential */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <IoCashOutline className="w-5 h-5 mr-2 text-green-600" />
            Revenue Potential for {selectedLevel}-{selectedGrade}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Transportation</p>
              <p className="text-lg font-bold text-green-600">{currentGrade.revenue.transportation}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Digital Store</p>
              <p className="text-lg font-bold text-green-600">{currentGrade.revenue.miniStore}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Threat Intel</p>
              <p className="text-lg font-bold text-green-600">{currentGrade.revenue.threatIntel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Premium ADR</p>
              <p className="text-lg font-bold text-green-600">{currentGrade.revenue.premiumBookings}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Annual Total</p>
              <p className="text-xl font-bold text-green-600">{currentGrade.revenue.total}</p>
            </div>
          </div>
        </div>

        {/* Compliance Coverage */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <IoShieldCheckmarkOutline className="w-5 h-5 mr-2 text-blue-600" />
            Compliance Coverage
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentLevel.compliance.map((comp) => (
              <span key={comp} className="px-3 py-1 bg-blue-100 dark:bg-blue-800/30 rounded-full text-xs font-medium text-blue-800 dark:text-blue-300">
                {comp}
              </span>
            ))}
          </div>
        </div>

        {/* ESG Integration */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <IoGlobeOutline className="w-5 h-5 mr-2 text-green-600" />
            ESG Integration
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{currentLevel.esg}</p>
        </div>
      </div>
    </div>
  )
}