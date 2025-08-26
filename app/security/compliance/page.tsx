// app/security/compliance/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoShieldCheckmarkOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoServerOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoRadioButtonOnOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoConstructOutline
} from 'react-icons/io5'

export default function CompliancePortalPage() {
  const [selectedFramework, setSelectedFramework] = useState('all')
  const [complianceScore, setComplianceScore] = useState(98.7)
  const [lastScan, setLastScan] = useState(new Date())

  // Update last scan time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastScan(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Compliance frameworks data
  const frameworks = [
    {
      id: 'gdpr',
      name: 'GDPR',
      fullName: 'General Data Protection Regulation',
      status: 'compliant',
      score: 100,
      lastAudit: '2 hours ago',
      nextAudit: 'In 22 hours',
      requirements: 83,
      passed: 83,
      articles: [
        { article: 'Article 5', name: 'Principles', status: 'compliant' },
        { article: 'Article 25', name: 'Data Protection by Design', status: 'compliant' },
        { article: 'Article 32', name: 'Security of Processing', status: 'compliant' },
        { article: 'Article 33', name: 'Breach Notification', status: 'compliant' },
        { article: 'Article 35', name: 'Impact Assessment', status: 'compliant' }
      ]
    },
    {
      id: 'ccpa',
      name: 'CCPA',
      fullName: 'California Consumer Privacy Act',
      status: 'compliant',
      score: 100,
      lastAudit: '4 hours ago',
      nextAudit: 'In 20 hours',
      requirements: 67,
      passed: 67,
      sections: [
        { section: '1798.100', name: 'Consumer Rights', status: 'compliant' },
        { section: '1798.105', name: 'Deletion Rights', status: 'compliant' },
        { section: '1798.110', name: 'Disclosure Rights', status: 'compliant' },
        { section: '1798.115', name: 'Opt-Out Rights', status: 'compliant' },
        { section: '1798.150', name: 'Data Breach', status: 'compliant' }
      ]
    },
    {
      id: 'pci',
      name: 'PCI DSS',
      fullName: 'Payment Card Industry Data Security Standard',
      status: 'compliant',
      score: 100,
      lastAudit: '1 hour ago',
      nextAudit: 'In 23 hours',
      requirements: 246,
      passed: 246,
      requirements_list: [
        { req: 'Req 1', name: 'Firewall Configuration', status: 'compliant' },
        { req: 'Req 2', name: 'Default Passwords', status: 'compliant' },
        { req: 'Req 3', name: 'Cardholder Data Protection', status: 'compliant' },
        { req: 'Req 6', name: 'Secure Systems', status: 'compliant' },
        { req: 'Req 10', name: 'Track Access', status: 'compliant' }
      ]
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      fullName: 'Health Insurance Portability and Accountability Act',
      status: 'compliant',
      score: 100,
      lastAudit: '3 hours ago',
      nextAudit: 'In 21 hours',
      requirements: 54,
      passed: 54,
      safeguards: [
        { type: 'Administrative', name: 'Access Controls', status: 'compliant' },
        { type: 'Physical', name: 'Facility Access', status: 'compliant' },
        { type: 'Technical', name: 'Encryption', status: 'compliant' },
        { type: 'Technical', name: 'Audit Controls', status: 'compliant' },
        { type: 'Administrative', name: 'Training', status: 'compliant' }
      ]
    },
    {
      id: 'sox',
      name: 'SOX',
      fullName: 'Sarbanes-Oxley Act',
      status: 'compliant',
      score: 98,
      lastAudit: '5 hours ago',
      nextAudit: 'In 19 hours',
      requirements: 43,
      passed: 42,
      sections: [
        { section: 'Section 302', name: 'Corporate Responsibility', status: 'compliant' },
        { section: 'Section 404', name: 'Internal Controls', status: 'compliant' },
        { section: 'Section 409', name: 'Real-Time Disclosure', status: 'compliant' },
        { section: 'Section 802', name: 'Records Retention', status: 'review' },
        { section: 'Section 906', name: 'Accountability', status: 'compliant' }
      ]
    },
    {
      id: 'ada',
      name: 'ADA',
      fullName: 'Americans with Disabilities Act',
      status: 'compliant',
      score: 100,
      lastAudit: '6 hours ago',
      nextAudit: 'In 18 hours',
      requirements: 38,
      passed: 38,
      guidelines: [
        { guideline: 'WCAG 2.1 AA', name: 'Web Accessibility', status: 'compliant' },
        { guideline: 'Section 508', name: 'Federal Compliance', status: 'compliant' },
        { guideline: 'Title III', name: 'Public Accommodations', status: 'compliant' },
        { guideline: 'Mobile', name: 'App Accessibility', status: 'compliant' },
        { guideline: 'Transport', name: 'Vehicle Access', status: 'compliant' }
      ]
    }
  ]

  // California SB 253 Special Section
  const sb253 = {
    daysUntilDeadline: 134,
    penaltyRisk: 500000,
    currentStatus: 'prepared',
    requirements: [
      { name: 'Scope 1 Emissions', status: 'tracking', value: '234 tCO2e' },
      { name: 'Scope 2 Emissions', status: 'tracking', value: '156 tCO2e' },
      { name: 'Scope 3 Emissions', status: 'tracking', value: '1,847 tCO2e' },
      { name: 'Third-Party Verification', status: 'scheduled', value: 'Dec 15, 2025' },
      { name: 'Public Disclosure', status: 'ready', value: 'Template Ready' }
    ]
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'compliant':
      case 'tracking':
      case 'ready':
        return <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
      case 'review':
      case 'scheduled':
        return <IoAlertCircleOutline className="w-5 h-5 text-yellow-600" />
      case 'non-compliant':
        return <IoCloseCircleOutline className="w-5 h-5 text-red-600" />
      default:
        return <IoInformationCircleOutline className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'compliant':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'review':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'non-compliant':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/security" className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors">
            <IoChevronForwardOutline className="w-4 h-4 rotate-180 mr-1" />
            Back to Security
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoCheckmarkCircleOutline className="w-12 h-12 text-green-400 mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Compliance Portal
                </h1>
                <p className="text-xl text-blue-200 mt-2">
                  Automated Compliance Tracking & Reporting
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{complianceScore}%</div>
              <div className="text-sm text-blue-200">Overall Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status Bar */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <IoRadioButtonOnOutline className="w-4 h-4 text-green-400 animate-pulse mr-2" />
                <span className="text-sm">Live Monitoring Active</span>
              </div>
              <div className="text-sm">
                Last Scan: {lastScan.toLocaleTimeString()}
              </div>
              <div className="text-sm">
                Next Scan: In 59 seconds
              </div>
            </div>
            <button className="flex items-center text-sm hover:text-blue-200 transition-colors">
              <IoRefreshOutline className="w-4 h-4 mr-1" />
              Force Scan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* California SB 253 Alert */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <IoWarningOutline className="w-8 h-8 mr-4 flex-shrink-0 animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold mb-2">California SB 253 Compliance</h2>
                <p className="text-red-100 mb-4">
                  Climate Corporate Data Accountability Act - Mandatory compliance deadline approaching
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-3xl font-bold">{sb253.daysUntilDeadline}</div>
                    <div className="text-sm text-red-200">Days Until Deadline</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">${sb253.penaltyRisk.toLocaleString()}</div>
                    <div className="text-sm text-red-200">Annual Penalty Risk</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold uppercase">{sb253.currentStatus}</div>
                    <div className="text-sm text-red-200">Current Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Requirements Tracking</h3>
            <div className="space-y-2">
              {sb253.requirements.map((req, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(req.status)}
                    <span className="ml-2 text-sm">{req.name}</span>
                  </div>
                  <span className="text-sm font-mono">{req.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Framework Filter */}
        <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFramework('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedFramework === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All Frameworks
          </button>
          {frameworks.map(framework => (
            <button
              key={framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedFramework === framework.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {framework.name}
            </button>
          ))}
        </div>

        {/* Compliance Frameworks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {frameworks
            .filter(f => selectedFramework === 'all' || f.id === selectedFramework)
            .map(framework => (
            <div key={framework.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className={`p-6 ${getStatusColor(framework.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{framework.name}</h3>
                  {getStatusIcon(framework.status)}
                </div>
                <p className="text-sm opacity-80">{framework.fullName}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{framework.score}%</div>
                    <div className="text-xs opacity-70">Compliance Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{framework.passed}/{framework.requirements}</div>
                    <div className="text-xs opacity-70">Requirements</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <span>Last: {framework.lastAudit}</span>
                  <span>Next: {framework.nextAudit}</span>
                </div>
                
                <div className="space-y-1">
                  {(framework.articles || framework.sections || framework.requirements_list || framework.safeguards || framework.guidelines || []).slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {item.article || item.section || item.req || item.type || item.guideline}
                      </span>
                      {getStatusIcon(item.status)}
                    </div>
                  ))}
                </div>
                
                <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  View Full Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Automated Features */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Automated Compliance Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <IoRefreshOutline className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Continuous Monitoring
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                24/7 automated scanning for compliance violations with instant alerts
              </p>
            </div>
            
            <div className="text-center">
              <IoDocumentTextOutline className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Auto-Generated Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                One-click compliance reports ready for auditors and regulators
              </p>
            </div>
            
            <div className="text-center">
              <IoConstructOutline className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Self-Healing Systems
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic remediation of common compliance issues without human intervention
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <button className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left">
            <IoDownloadOutline className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Export Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Generate compliance packages</p>
          </button>
          
          <button className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left">
            <IoCalendarOutline className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Schedule Audit</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Book compliance review</p>
          </button>
          
          <button className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left">
            <IoTrendingUpOutline className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Gap Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Identify improvements</p>
          </button>
          
          <button className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left">
            <IoShieldCheckmarkOutline className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Risk Assessment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Evaluate exposure</p>
          </button>
        </div>

        {/* Compliance Timeline */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Upcoming Compliance Events
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-4">
                  <IoTimeOutline className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">SB 253 Deadline</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">California Climate Reporting</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">Jan 1, 2026</div>
                <div className="text-sm text-red-600">134 days</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mr-4">
                  <IoDocumentTextOutline className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">GDPR Review</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Annual Assessment Due</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">Mar 15, 2026</div>
                <div className="text-sm text-gray-600">206 days</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-4">
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">PCI DSS Certification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Renewal Required</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">Jun 30, 2026</div>
                <div className="text-sm text-gray-600">313 days</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}