// app/security/bounty/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  IoBugOutline,
  IoTrophyOutline,
  IoCashOutline,
  IoChevronForwardOutline,
  IoTimerOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoSkullOutline,
  IoFlashOutline,
  IoCodeSlashOutline,
  IoServerOutline,
  IoLockClosedOutline,
  IoTerminalOutline,
  IoGitNetworkOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
  IoMailOutline
} from 'react-icons/io5'

export default function BugBountyPage() {
  const [totalPaid, setTotalPaid] = useState(892500)
  const [activeBounty, setActiveBounty] = useState(247000)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Increment bounty amount
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBounty(prev => prev + 100)
    }, 30000) // Increase every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Bounty tiers
  const bountyTiers = [
    {
      severity: 'Critical',
      amount: '$10,000',
      color: 'red',
      description: 'RCE, Authentication Bypass, Data Breach',
      examples: [
        'Remote Code Execution',
        'Full Authentication Bypass',
        'Mass Data Exfiltration',
        'Complete System Takeover'
      ]
    },
    {
      severity: 'High',
      amount: '$5,000',
      color: 'orange',
      description: 'SQLi, Privilege Escalation, PII Exposure',
      examples: [
        'SQL Injection with data access',
        'Privilege Escalation to Admin',
        'PII/Payment Data Exposure',
        'Critical Business Logic Flaws'
      ]
    },
    {
      severity: 'Medium',
      amount: '$1,000',
      color: 'yellow',
      description: 'XSS, CSRF, Limited Data Access',
      examples: [
        'Stored XSS',
        'CSRF on sensitive actions',
        'Limited data disclosure',
        'Session fixation'
      ]
    },
    {
      severity: 'Low',
      amount: '$500',
      color: 'blue',
      description: 'Info Disclosure, Minor Issues',
      examples: [
        'Self-XSS',
        'Version disclosure',
        'Missing security headers',
        'Low-impact CSRF'
      ]
    }
  ]

  // Hall of Fame researchers
  const hallOfFame = [
    {
      rank: 1,
      name: 'BugBountyPro',
      avatar: '👨‍💻',
      country: '🇺🇸',
      findings: 47,
      earned: '$67,500',
      badge: 'platinum'
    },
    {
      rank: 2,
      name: 'SecurityNinja',
      avatar: '🥷',
      country: '🇯🇵',
      findings: 32,
      earned: '$45,000',
      badge: 'gold'
    },
    {
      rank: 3,
      name: 'WhiteHat_2024',
      avatar: '🎩',
      country: '🇮🇳',
      findings: 28,
      earned: '$38,500',
      badge: 'gold'
    },
    {
      rank: 4,
      name: 'CyberWarrior',
      avatar: '⚔️',
      country: '🇷🇺',
      findings: 23,
      earned: '$31,000',
      badge: 'silver'
    },
    {
      rank: 5,
      name: 'Bug_Hunter_X',
      avatar: '🔍',
      country: '🇧🇷',
      findings: 19,
      earned: '$24,500',
      badge: 'silver'
    }
  ]

  // Recent submissions
  const recentSubmissions = [
    {
      id: '#8471',
      severity: 'critical',
      title: 'Authentication Bypass via JWT Manipulation',
      status: 'paid',
      amount: '$10,000',
      date: '2 days ago',
      researcher: 'BugBountyPro'
    },
    {
      id: '#8469',
      severity: 'high',
      title: 'SQL Injection in Search Parameter',
      status: 'paid',
      amount: '$5,000',
      date: '3 days ago',
      researcher: 'SecurityNinja'
    },
    {
      id: '#8467',
      severity: 'medium',
      title: 'Stored XSS in User Profile',
      status: 'triaging',
      amount: 'TBD',
      date: '4 days ago',
      researcher: 'NewHacker123'
    },
    {
      id: '#8465',
      severity: 'low',
      title: 'Information Disclosure in API Response',
      status: 'rejected',
      amount: '$0',
      date: '5 days ago',
      researcher: 'Anonymous'
    },
    {
      id: '#8463',
      severity: 'high',
      title: 'Privilege Escalation to Admin',
      status: 'paid',
      amount: '$5,000',
      date: '1 week ago',
      researcher: 'WhiteHat_2024'
    }
  ]

  // Scope categories
  const scopeCategories = [
    {
      name: 'Web Application',
      inScope: true,
      domains: ['*.itwhip.com', 'api.itwhip.com', 'portal.itwhip.com'],
      priority: 'high'
    },
    {
      name: 'Mobile Apps',
      inScope: true,
      domains: ['iOS App', 'Android App'],
      priority: 'high'
    },
    {
      name: 'APIs',
      inScope: true,
      domains: ['REST APIs', 'GraphQL', 'WebSocket'],
      priority: 'critical'
    },
    {
      name: 'Infrastructure',
      inScope: false,
      domains: ['AWS', 'Cloudflare'],
      priority: 'none'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded">PAID</span>
      case 'triaging':
        return <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded">TRIAGING</span>
      case 'rejected':
        return <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded">REJECTED</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900 to-green-800 dark:from-green-950 dark:to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/security" className="inline-flex items-center text-green-200 hover:text-white mb-4 transition-colors">
            <IoChevronForwardOutline className="w-4 h-4 rotate-180 mr-1" />
            Back to Security
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoBugOutline className="w-12 h-12 text-yellow-400 mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Bug Bounty Program
                </h1>
                <p className="text-xl text-green-200 mt-2">
                  Help us stay secure. Get paid for finding vulnerabilities.
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-green-200">Total Paid Out</div>
              <div className="text-3xl font-bold">${totalPaid.toLocaleString()}</div>
              <div className="text-sm text-green-200">Since 2019</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Bounty Pool */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoTrophyOutline className="w-8 h-8 mr-3" />
              <div>
                <div className="text-sm font-medium">Current Bounty Pool</div>
                <div className="text-2xl font-bold">${activeBounty.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">Increases $100 every failed attempt</div>
              <div className="text-xs opacity-80">No successful breach = Higher rewards</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Start */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-12 text-white">
          <div className="text-center">
            <IoRocketOutline className="w-16 h-16 mx-auto mb-4 text-purple-200" />
            <h2 className="text-3xl font-bold mb-4">
              Start Hunting in 3 Steps
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8 text-left max-w-4xl mx-auto">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-2xl font-bold mb-2">1. Test</div>
                <p className="text-purple-100">Find vulnerabilities in our platform using any tools or techniques</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-2xl font-bold mb-2">2. Report</div>
                <p className="text-purple-100">Submit detailed report with proof of concept and impact analysis</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-2xl font-bold mb-2">3. Get Paid</div>
                <p className="text-purple-100">Receive bounty within 48 hours of verification via your preferred method</p>
              </div>
            </div>
            <button className="mt-8 bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-8 rounded-lg transition-all">
              Submit Your First Finding
            </button>
          </div>
        </div>

        {/* Bounty Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Bounty Rewards
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {bountyTiers.map((tier) => (
              <div key={tier.severity} className={`border-2 rounded-xl p-6 ${getSeverityColor(tier.severity.toLowerCase())}`}>
                <div className="text-center mb-4">
                  <div className="text-sm font-medium uppercase tracking-wider opacity-80">
                    {tier.severity}
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {tier.amount}
                  </div>
                </div>
                <p className="text-xs mb-3 opacity-80">
                  {tier.description}
                </p>
                <div className="space-y-1">
                  {tier.examples.map((example, index) => (
                    <div key={index} className="text-xs flex items-start">
                      <IoCheckmarkCircleOutline className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 mr-2" />
              In Scope
            </h2>
            <div className="space-y-4">
              {scopeCategories.filter(cat => cat.inScope).map((category) => (
                <div key={category.name} className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.domains.map((domain) => (
                      <span key={domain} className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <IoCloseCircleOutline className="w-6 h-6 text-red-600 mr-2" />
              Out of Scope
            </h2>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">The following are NOT eligible for bounties:</p>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Social engineering attacks</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Physical attacks on infrastructure</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>DoS/DDoS attacks</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated scanning without findings</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Third-party services (AWS, Cloudflare)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Hall of Fame */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🏆 Hall of Fame
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Researcher</th>
                  <th className="text-center py-3 px-4">Country</th>
                  <th className="text-center py-3 px-4">Findings</th>
                  <th className="text-right py-3 px-4">Total Earned</th>
                </tr>
              </thead>
              <tbody>
                {hallOfFame.map((researcher) => (
                  <tr key={researcher.rank} className="border-b dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {researcher.rank === 1 && '🥇'}
                        {researcher.rank === 2 && '🥈'}
                        {researcher.rank === 3 && '🥉'}
                        {researcher.rank > 3 && <span className="font-bold text-gray-600">#{researcher.rank}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{researcher.avatar}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{researcher.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-2xl">{researcher.country}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-semibold text-gray-900 dark:text-white">{researcher.findings}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="font-bold text-green-600">{researcher.earned}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Submissions
          </h2>
          <div className="space-y-4">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {submission.id}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getSeverityColor(submission.severity)}`}>
                        {submission.severity.toUpperCase()}
                      </span>
                      {getStatusBadge(submission.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {submission.title}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted by {submission.researcher} • {submission.date}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      {submission.amount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules & Guidelines */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Program Rules
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-2" />
                Do's
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Provide detailed proof of concept</li>
                <li>✓ Include clear reproduction steps</li>
                <li>✓ Report vulnerabilities promptly</li>
                <li>✓ Allow us time to fix before disclosure</li>
                <li>✓ Test on designated bug bounty endpoints</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoCloseCircleOutline className="w-5 h-5 text-red-600 mr-2" />
                Don'ts
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✗ Access or modify other users' data</li>
                <li>✗ Perform destructive attacks</li>
                <li>✗ Use automated scanners excessively</li>
                <li>✗ Publicly disclose before patch</li>
                <li>✗ Violate any laws or regulations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Report CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
          <IoSkullOutline className="w-16 h-16 mx-auto mb-4 text-green-200" />
          <h2 className="text-3xl font-bold mb-4">
            Found Something?
          </h2>
          <p className="text-lg mb-6 text-green-100">
            Submit your finding and join our Hall of Fame.<br />
            Average payout time: 48 hours after verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-8 rounded-lg transition-all">
              Submit Vulnerability
            </button>
            <Link 
              href="/security/challenge"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-3 px-8 rounded-lg transition-all"
            >
              Start Testing Now
            </Link>
          </div>
          <p className="text-sm text-green-200 mt-6">
            Questions? Email info@itwhip.com with subject "Bug Bounty"
          </p>
        </div>

      </div>
    </div>
  )
}