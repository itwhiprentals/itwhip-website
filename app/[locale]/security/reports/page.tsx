// app/security/reports/page.tsx

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoChevronForwardOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoTrendingUpOutline,
  IoEyeOutline,
  IoMailOutline,
  IoShareSocialOutline,
  IoNewspaperOutline,
  IoAnalyticsOutline,
  IoBookOutline
} from 'react-icons/io5'

export default function TransparencyReportsPage() {
  const [selectedYear, setSelectedYear] = useState('2024')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Available reports
  const reports = {
    '2024': [
      {
        id: 'q3-2024',
        title: 'Q3 2024 Security Report',
        quarter: 'Q3 2024',
        date: 'October 15, 2024',
        pages: 89,
        downloads: 3421,
        size: '4.2 MB',
        highlights: [
          '14,827 attacks blocked',
          '100% uptime maintained',
          '47 vulnerabilities patched',
          '$127,500 in bounties paid'
        ],
        category: 'quarterly'
      },
      {
        id: 'q2-2024',
        title: 'Q2 2024 Security Report',
        quarter: 'Q2 2024',
        date: 'July 12, 2024',
        pages: 76,
        downloads: 2893,
        size: '3.8 MB',
        highlights: [
          '12,341 attacks blocked',
          '99.99% uptime',
          '38 vulnerabilities patched',
          '$89,000 in bounties paid'
        ],
        category: 'quarterly'
      },
      {
        id: 'q1-2024',
        title: 'Q1 2024 Security Report',
        quarter: 'Q1 2024',
        date: 'April 8, 2024',
        pages: 71,
        downloads: 2567,
        size: '3.5 MB',
        highlights: [
          '10,892 attacks blocked',
          '99.97% uptime',
          '31 vulnerabilities patched',
          '$67,500 in bounties paid'
        ],
        category: 'quarterly'
      },
      {
        id: 'annual-2023',
        title: '2023 Annual Security Review',
        quarter: 'Annual',
        date: 'January 15, 2024',
        pages: 256,
        downloads: 5234,
        size: '12.7 MB',
        highlights: [
          '41,234 total attacks blocked',
          '99.98% annual uptime',
          '142 vulnerabilities patched',
          '$312,000 in bounties paid'
        ],
        category: 'annual'
      }
    ],
    '2023': [
      {
        id: 'q4-2023',
        title: 'Q4 2023 Security Report',
        quarter: 'Q4 2023',
        date: 'January 10, 2024',
        pages: 82,
        downloads: 1987,
        size: '4.0 MB',
        highlights: [
          '11,234 attacks blocked',
          '99.99% uptime',
          '42 vulnerabilities patched',
          '$95,000 in bounties paid'
        ],
        category: 'quarterly'
      },
      {
        id: 'q3-2023',
        title: 'Q3 2023 Security Report',
        quarter: 'Q3 2023',
        date: 'October 11, 2023',
        pages: 78,
        downloads: 1654,
        size: '3.7 MB',
        highlights: [
          '10,567 attacks blocked',
          '99.98% uptime',
          '36 vulnerabilities patched',
          '$78,000 in bounties paid'
        ],
        category: 'quarterly'
      }
    ]
  }

  // Special reports
  const specialReports = [
    {
      id: 'hotel-industry-2024',
      title: 'Hotel Industry Threat Landscape 2024',
      date: 'September 2024',
      pages: 124,
      downloads: 892,
      size: '5.8 MB',
      description: 'Comprehensive analysis of security threats specific to the hospitality industry',
      badge: 'INDUSTRY FOCUS'
    },
    {
      id: 'ai-defense-2024',
      title: 'AI-Powered Defense Systems Report',
      date: 'August 2024',
      pages: 67,
      downloads: 1234,
      size: '3.2 MB',
      description: 'How machine learning is revolutionizing our security infrastructure',
      badge: 'TECHNICAL'
    },
    {
      id: 'compliance-guide-2024',
      title: 'Compliance Automation Whitepaper',
      date: 'July 2024',
      pages: 45,
      downloads: 567,
      size: '2.1 MB',
      description: 'Complete guide to automated compliance with SB 253, GDPR, and more',
      badge: 'COMPLIANCE'
    }
  ]

  // Statistics overview
  const statistics = {
    totalReports: 47,
    totalDownloads: 28934,
    averageRating: 4.8,
    subscribedUsers: 3421
  }

  // Key metrics over time
  const keyMetrics = [
    {
      metric: 'Attacks Blocked',
      q1: '10,892',
      q2: '12,341',
      q3: '14,827',
      trend: 'up',
      change: '+36%'
    },
    {
      metric: 'Uptime',
      q1: '99.97%',
      q2: '99.99%',
      q3: '100%',
      trend: 'up',
      change: '+0.03%'
    },
    {
      metric: 'Vulnerabilities Patched',
      q1: '31',
      q2: '38',
      q3: '47',
      trend: 'up',
      change: '+52%'
    },
    {
      metric: 'Bounties Paid',
      q1: '$67.5K',
      q2: '$89K',
      q3: '$127.5K',
      trend: 'up',
      change: '+89%'
    },
    {
      metric: 'Response Time',
      q1: '147ms',
      q2: '134ms',
      q3: '127ms',
      trend: 'down',
      change: '-14%'
    }
  ]

  const getCategoryBadge = (category: string) => {
    const colors = {
      quarterly: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      annual: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      special: 'bg-green-100 dark:bg-green-900/30 text-green-600'
    }
    return colors[category as keyof typeof colors] || colors.quarterly
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/security" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <IoChevronForwardOutline className="w-4 h-4 rotate-180 mr-1" />
            Back to Security
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoDocumentTextOutline className="w-12 h-12 text-blue-400 mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Transparency Reports
                </h1>
                <p className="text-xl text-slate-300 mt-2">
                  Complete Security & Compliance Documentation
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{statistics.totalReports}</div>
              <div className="text-sm text-slate-300">Reports Published</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{statistics.totalDownloads.toLocaleString()}</div>
              <div className="text-xs text-slate-300">Total Downloads</div>
            </div>
            <div>
              <div className="text-xl font-bold">{statistics.averageRating}/5.0</div>
              <div className="text-xs text-slate-300">Average Rating</div>
            </div>
            <div>
              <div className="text-xl font-bold">{statistics.subscribedUsers.toLocaleString()}</div>
              <div className="text-xs text-slate-300">Subscribers</div>
            </div>
            <div>
              <div className="text-xl font-bold">FREE</div>
              <div className="text-xs text-slate-300">All Reports</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Our Commitment */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-12 text-white">
          <div className="flex items-start">
            <IoShieldCheckmarkOutline className="w-12 h-12 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">Our Transparency Commitment</h2>
              <p className="text-blue-100 mb-4">
                We believe in complete transparency. Every quarter, we publish detailed reports on our security posture, 
                attacks blocked, vulnerabilities discovered, and improvements made. No hiding, no corporate speak - 
                just honest data about how we protect your platform.
              </p>
              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-3">
                  <IoCalendarOutline className="w-6 h-6 mb-2" />
                  <div className="text-sm font-semibold">Quarterly Reports</div>
                  <div className="text-xs text-blue-200">Every 3 months</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <IoEyeOutline className="w-6 h-6 mb-2" />
                  <div className="text-sm font-semibold">Full Disclosure</div>
                  <div className="text-xs text-blue-200">Nothing hidden</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <IoDownloadOutline className="w-6 h-6 mb-2" />
                  <div className="text-sm font-semibold">Free Access</div>
                  <div className="text-xs text-blue-200">No registration</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <IoAnalyticsOutline className="w-6 h-6 mb-2" />
                  <div className="text-sm font-semibold">Real Data</div>
                  <div className="text-xs text-blue-200">Verified metrics</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <IoTrendingUpOutline className="w-6 h-6 text-indigo-600 mr-2" />
            2024 Performance Trends
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Metric</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Q1 2024</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Q2 2024</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Q3 2024</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Change</th>
                </tr>
              </thead>
              <tbody>
                {keyMetrics.map((metric) => (
                  <tr key={metric.metric} className="border-b dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{metric.metric}</td>
                    <td className="text-center py-3 px-4 text-gray-900 dark:text-white">{metric.q1}</td>
                    <td className="text-center py-3 px-4 text-gray-900 dark:text-white">{metric.q2}</td>
                    <td className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {metric.q3}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center text-sm font-medium ${
                        metric.trend === 'up' 
                          ? (metric.metric === 'Response Time' ? 'text-green-600' : 'text-green-600')
                          : 'text-green-600'
                      }`}>
                        {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All Reports
              </button>
              <button
                onClick={() => setSelectedCategory('quarterly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'quarterly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => setSelectedCategory('annual')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'annual'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Annual
              </button>
            </div>
          </div>
          
          <button className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
            <IoMailOutline className="w-5 h-5 mr-2" />
            Subscribe to Reports
          </button>
        </div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {(reports as any)[selectedYear]
            ?.filter((report: any) => selectedCategory === 'all' || report.category === selectedCategory)
            .map((report: any) => (
            <div key={report.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryBadge(report.category)} mb-2`}>
                      {report.quarter}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Published {report.date} • {report.pages} pages
                    </p>
                  </div>
                  <IoDocumentTextOutline className="w-8 h-8 text-indigo-600" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Key Highlights:</h4>
                  <ul className="space-y-1">
                    {report.highlights.map((highlight: any, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-800">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{report.downloads.toLocaleString()} downloads</span>
                    <span>{report.size}</span>
                  </div>
                  <button className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
                    <IoDownloadOutline className="w-5 h-5 mr-1" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Reports */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Special Reports & Whitepapers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {specialReports.map((report) => (
              <div key={report.id} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">
                    {report.badge}
                  </span>
                  <IoBookOutline className="w-6 h-6 text-gray-400" />
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{report.date}</span>
                  <span>{report.pages} pages • {report.size}</span>
                </div>
                
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
                  Download Report
                </button>
                
                <div className="text-center text-xs text-gray-500 mt-2">
                  {report.downloads.toLocaleString()} downloads
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <IoMailOutline className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Never Miss a Report
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get our quarterly security reports and special whitepapers delivered to your inbox. 
              Join 3,421 security professionals who trust our transparency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Media Kit */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
          <IoShareSocialOutline className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Media & Press Kit
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Journalists and researchers can access our media kit with logos, executive bios, 
            and detailed security statistics for accurate reporting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              <IoNewspaperOutline className="w-5 h-5 mr-2" />
              Download Media Kit
            </button>
            <button className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-lg transition-colors">
              <IoMailOutline className="w-5 h-5 mr-2" />
              Press Contact
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}