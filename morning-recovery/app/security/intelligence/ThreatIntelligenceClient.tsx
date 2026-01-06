// app/security/intelligence/ThreatIntelligenceClient.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoGlobeOutline,
  IoDownloadOutline,
  IoChevronForwardOutline,
  IoRadioButtonOnOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoLocationOutline,
  IoLayersOutline,
  IoCodeSlashOutline,
  IoBugOutline,
  IoServerOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoMailOutline,
  IoAnalyticsOutline,
  IoFunnelOutline,
  IoEyeOutline
} from 'react-icons/io5'

export default function ThreatIntelligenceClient() {
  const [selectedReport, setSelectedReport] = useState('monthly')
  const [liveThreats, setLiveThreats] = useState(0)
  const [selectedRegion, setSelectedRegion] = useState('all')

  // Simulate live threat counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveThreats(prev => prev + Math.floor(Math.random() * 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Attack data by type
  const attackTypes = [
    { type: 'SQL Injection', count: 8742, percentage: 31, trend: 'up', change: '+12%' },
    { type: 'XSS Attempts', count: 6759, percentage: 24, trend: 'down', change: '-8%' },
    { type: 'Brute Force', count: 5072, percentage: 18, trend: 'up', change: '+23%' },
    { type: 'API Exploitation', count: 4227, percentage: 15, trend: 'stable', change: '+2%' },
    { type: 'DDoS Attempts', count: 2254, percentage: 8, trend: 'down', change: '-15%' },
    { type: 'Other', count: 1126, percentage: 4, trend: 'stable', change: '0%' }
  ]

  // Geographic distribution
  const geographicData = [
    { country: 'Russia', code: 'RU', attacks: 11623, percentage: 24, flag: '🇷🇺' },
    { country: 'China', code: 'CN', attacks: 10147, percentage: 21, flag: '🇨🇳' },
    { country: 'United States', code: 'US', attacks: 8692, percentage: 18, flag: '🇺🇸' },
    { country: 'India', code: 'IN', attacks: 7238, percentage: 15, flag: '🇮🇳' },
    { country: 'Brazil', code: 'BR', attacks: 4825, percentage: 10, flag: '🇧🇷' },
    { country: 'Other', code: 'OTHER', attacks: 5766, percentage: 12, flag: '🌍' }
  ]

  // Threat actors
  const threatActors = [
    { 
      name: 'APT-28 Pattern Match',
      severity: 'critical',
      attempts: 234,
      lastSeen: '2 hours ago',
      techniques: ['Spear Phishing', 'Zero-Day Exploits', 'Supply Chain']
    },
    {
      name: 'Ransomware Group Delta',
      severity: 'high',
      attempts: 189,
      lastSeen: '5 hours ago',
      techniques: ['File Encryption', 'Data Exfiltration', 'Double Extortion']
    },
    {
      name: 'Cryptominer Botnet',
      severity: 'medium',
      attempts: 567,
      lastSeen: '1 hour ago',
      techniques: ['Resource Hijacking', 'Backdoor Installation', 'Persistence']
    },
    {
      name: 'Script Kiddie Collective',
      severity: 'low',
      attempts: 1234,
      lastSeen: '10 minutes ago',
      techniques: ['Basic SQLi', 'Default Passwords', 'Known CVEs']
    }
  ]

  // Available reports
  const reports = [
    {
      id: 'monthly',
      name: 'Monthly Threat Report',
      date: 'November 2024',
      pages: 47,
      downloads: 1234,
      free: true
    },
    {
      id: 'quarterly',
      name: 'Q3 2024 Analysis',
      date: 'Q3 2024',
      pages: 128,
      downloads: 892,
      free: true
    },
    {
      id: 'annual',
      name: 'Annual Security Review',
      date: '2024',
      pages: 256,
      downloads: 3421,
      free: true
    },
    {
      id: 'special',
      name: 'Hotel Industry Threats',
      date: 'Special Report',
      pages: 89,
      downloads: 567,
      free: true
    }
  ]

  // Critical vulnerabilities discovered
  const vulnerabilities = [
    {
      id: 'CVE-2024-8471',
      severity: 'critical',
      discovered: '3 days ago',
      patched: '2 days ago',
      bounty: '$5,000'
    },
    {
      id: 'CVE-2024-8392',
      severity: 'high',
      discovered: '1 week ago',
      patched: '5 days ago',
      bounty: '$2,500'
    },
    {
      id: 'CVE-2024-8234',
      severity: 'medium',
      discovered: '2 weeks ago',
      patched: '1 week ago',
      bounty: '$1,000'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-indigo-900 to-indigo-800 dark:from-indigo-950 dark:to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/security" className="inline-flex items-center text-indigo-200 hover:text-white mb-4 transition-colors">
            <IoChevronForwardOutline className="w-4 h-4 rotate-180 mr-1" />
            Back to Security
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoGlobeOutline className="w-12 h-12 text-blue-400 mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Threat Intelligence
                </h1>
                <p className="text-xl text-indigo-200 mt-2">
                  Real-time Security Analytics & Reports
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{(48291 + liveThreats).toLocaleString()}</div>
              <div className="text-sm text-indigo-200">Total Attacks Analyzed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <IoRadioButtonOnOutline className="w-4 h-4 text-red-400 animate-pulse mr-2" />
                <span className="text-sm font-medium">LIVE MONITORING</span>
              </div>
              <div className="text-sm">
                Active Threats: <span className="font-bold text-yellow-400">3</span>
              </div>
              <div className="text-sm">
                Blocked Today: <span className="font-bold text-green-400">2,847</span>
              </div>
            </div>
            <button className="text-sm hover:text-indigo-200 transition-colors">
              Subscribe to Alerts →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoWarningOutline className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">48,291</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Attacks This Month</div>
            <div className="text-xs text-red-600 mt-1">↑ 23% from last month</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoShieldCheckmarkOutline className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">100%</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Blocked Successfully</div>
            <div className="text-xs text-green-600 mt-1">Zero breaches</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoLocationOutline className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">67</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Countries of Origin</div>
            <div className="text-xs text-blue-600 mt-1">↑ 5 new this month</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoBugOutline className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">47</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bugs Found & Fixed</div>
            <div className="text-xs text-purple-600 mt-1">$31,500 paid in bounties</div>
          </div>
        </div>

        {/* Attack Types Analysis */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <IoLayersOutline className="w-6 h-6 text-indigo-600 mr-2" />
            Attack Vector Analysis
          </h2>
          
          <div className="space-y-4">
            {attackTypes.map((attack) => (
              <div key={attack.type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {attack.type}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {attack.count.toLocaleString()} attempts
                      </span>
                      <span className={`text-xs font-medium ${
                        attack.trend === 'up' ? 'text-red-600' : 
                        attack.trend === 'down' ? 'text-green-600' : 
                        'text-gray-600'
                      }`}>
                        {attack.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${attack.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <IoLocationOutline className="w-6 h-6 text-blue-600 mr-2" />
              Geographic Origins
            </h2>
            
            <div className="space-y-3">
              {geographicData.map((country) => (
                <div key={country.code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{country.flag}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {country.country}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {country.attacks.toLocaleString()} attacks
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {country.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Actors */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <IoWarningOutline className="w-6 h-6 text-red-600 mr-2" />
              Active Threat Actors
            </h2>
            
            <div className="space-y-4">
              {threatActors.map((actor) => (
                <div key={actor.name} className="border-l-4 border-red-600 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {actor.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(actor.severity)}`}>
                      {actor.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {actor.attempts} attempts • Last seen {actor.lastSeen}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {actor.techniques.map((technique) => (
                      <span key={technique} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vulnerabilities Discovered */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <IoBugOutline className="w-6 h-6 text-orange-600 mr-2" />
            Recent Vulnerabilities Discovered & Patched
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                    {vuln.id}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Discovered: {vuln.discovered}</div>
                  <div>Patched: {vuln.patched}</div>
                  <div>Bounty Paid: <span className="font-semibold text-green-600">{vuln.bounty}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Reports */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <IoDocumentTextOutline className="w-6 h-6 text-indigo-600 mr-2" />
              Threat Intelligence Reports
            </h2>
            <span className="text-sm text-green-600 font-medium">
              All Reports FREE
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {report.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.date} • {report.pages} pages
                    </p>
                  </div>
                  {report.free && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded">
                      FREE
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {report.downloads.toLocaleString()} downloads
                  </span>
                  <button className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    <IoDownloadOutline className="w-4 h-4 mr-1" />
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Intelligence Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <IoAnalyticsOutline className="w-16 h-16 mx-auto mb-4 text-purple-200" />
          <h2 className="text-3xl font-bold mb-4">
            Premium Threat Intelligence
          </h2>
          <p className="text-lg mb-6 text-purple-100">
            Get real-time threat feeds, custom reports, and API access.<br />
            Used by Fortune 500 companies and government agencies.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8 text-left max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Daily Reports</h3>
              <p className="text-sm text-purple-200">Real-time threat analysis delivered daily</p>
              <p className="text-2xl font-bold mt-2">$10K/mo</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">API Access</h3>
              <p className="text-sm text-purple-200">Integrate threat data into your systems</p>
              <p className="text-2xl font-bold mt-2">$25K/mo</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Custom Intel</h3>
              <p className="text-sm text-purple-200">Tailored threat analysis for your industry</p>
              <p className="text-2xl font-bold mt-2">Custom</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-8 rounded-lg transition-all"
            >
              Contact Sales
            </Link>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-3 px-8 rounded-lg transition-all">
              View Sample Report
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}