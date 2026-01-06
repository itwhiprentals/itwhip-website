// app/security/marketplace/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoSkullOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoGlobeOutline,
  IoBusinessOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoLockClosedOutline,
  IoSearchOutline,
  IoCartOutline,
  IoPersonOutline,
  IoEyeOutline,
  IoDownloadOutline,
  IoServerOutline,
  IoLayersOutline,
  IoPulseOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoChevronForwardOutline,
  IoGridOutline,
  IoListOutline,
  IoInformationCircleOutline,
  IoRocketOutline,
  IoTrophyOutline,
  IoTerminalOutline,
  IoBugOutline,
  IoCodeSlashOutline,
  IoAnalyticsOutline,
  IoKeyOutline,
  IoScanOutline,
  IoWalletOutline,
  IoStar,
  IoRefreshOutline,
  IoInfiniteOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoFlameOutline,
  IoRadioButtonOnOutline,
  IoEllipsisHorizontalOutline
} from 'react-icons/io5'

export default function MarketplacePage() {
  const router = useRouter()
  
  // State management
  const [attackCount, setAttackCount] = useState(72847)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [showLivePanel, setShowLivePanel] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [userTier, setUserTier] = useState<'free' | 'certified'>('free')

  // Live threat data
  const [liveThreats] = useState([
    { id: 1, type: 'CRITICAL', target: 'marriott.com', attack: 'SQL Injection', origin: 'Russia', status: 'BLOCKED', time: '2s ago' },
    { id: 2, type: 'HIGH', target: 'hilton.com', attack: 'XSS Attempt', origin: 'China', status: 'BLOCKED', time: '5s ago' },
    { id: 3, type: 'MEDIUM', target: 'hyatt.com', attack: 'Port Scan', origin: 'Unknown', status: 'MONITORING', time: '8s ago' },
    { id: 4, type: 'CRITICAL', target: 'ihg.com', attack: 'DDoS', origin: 'Brazil', status: 'BLOCKED', time: '12s ago' },
    { id: 5, type: 'LOW', target: 'accor.com', attack: 'Brute Force', origin: 'India', status: 'BLOCKED', time: '15s ago' }
  ])

  // Market reports data
  const [reports] = useState([
    {
      id: 1,
      title: 'Hotel Chain Breach Analysis Q4 2024',
      vendor: 'DarkIntel',
      price: 4999,
      rating: 4.8,
      downloads: 1247,
      category: 'hospitality',
      severity: 'CRITICAL',
      pages: 287,
      lastUpdate: '2 hours ago',
      preview: true,
      tags: ['hotel', 'pms', 'breach', '2024'],
      description: '287 pages of hotel breach analysis including PMS vulnerabilities'
    },
    {
      id: 2,
      title: 'Ransomware Tactics 2025',
      vendor: 'ThreatScope',
      price: 7999,
      rating: 4.9,
      downloads: 892,
      category: 'ransomware',
      severity: 'CRITICAL',
      pages: 412,
      lastUpdate: '5 hours ago',
      preview: false,
      tags: ['ransomware', 'healthcare', 'tactics'],
      description: 'Complete ransomware playbook with prevention strategies'
    },
    {
      id: 3,
      title: 'Zero-Day Collection December',
      vendor: 'ExploitDB',
      price: 12999,
      rating: 5.0,
      downloads: 234,
      category: 'exploits',
      severity: 'CRITICAL',
      pages: 156,
      lastUpdate: '1 day ago',
      preview: false,
      tags: ['zero-day', 'exploits', 'december'],
      description: 'Exclusive zero-day vulnerabilities discovered this month'
    },
    {
      id: 4,
      title: 'API Security Audit Toolkit',
      vendor: 'SecTools',
      price: 2999,
      rating: 4.5,
      downloads: 3421,
      category: 'tools',
      severity: 'HIGH',
      pages: 89,
      lastUpdate: '3 days ago',
      preview: true,
      tags: ['api', 'audit', 'tools'],
      description: 'Complete API security testing toolkit and methodology'
    },
    {
      id: 5,
      title: 'Nation-State APT Tactics',
      vendor: 'CyberIntel',
      price: 19999,
      rating: 4.9,
      downloads: 67,
      category: 'apt',
      severity: 'CRITICAL',
      pages: 523,
      lastUpdate: '1 week ago',
      preview: false,
      tags: ['apt', 'nation-state', 'classified'],
      description: 'Classified analysis of nation-state attack patterns'
    },
    {
      id: 6,
      title: 'OSINT Automation Scripts',
      vendor: 'IntelGather',
      price: 999,
      rating: 4.7,
      downloads: 5643,
      category: 'tools',
      severity: 'MEDIUM',
      pages: 45,
      lastUpdate: '2 weeks ago',
      preview: true,
      tags: ['osint', 'automation', 'scripts'],
      description: 'Python scripts for automated OSINT gathering'
    }
  ])

  // Increment attack counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackCount(prev => prev + Math.floor(Math.random() * 5) + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Check certification status
  useEffect(() => {
    const certified = localStorage.getItem('tu1aCertified')
    if (certified === 'true') {
      setUserTier('certified')
    }
  }, [])

  const categories = [
    { id: 'all', name: 'All Intel', count: 2847 },
    { id: 'hospitality', name: 'Hospitality', count: 487 },
    { id: 'ransomware', name: 'Ransomware', count: 234 },
    { id: 'exploits', name: 'Zero-Days', count: 89 },
    { id: 'tools', name: 'Tools', count: 567 },
    { id: 'apt', name: 'APT', count: 34 }
  ]

  const filteredReports = reports.filter(report => {
    if (selectedCategory !== 'all' && report.category !== selectedCategory) return false
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-black">
      {/* Dark Market Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black border-b border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/security" className="text-gray-500 hover:text-white transition">
                ← Back
              </Link>
              <div className="border-l border-gray-800 pl-4">
                <div className="flex items-center space-x-2">
                  <IoSkullOutline className="w-6 h-6 text-red-500" />
                  <h1 className="text-xl font-bold text-white">THREAT EXCHANGE</h1>
                  <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded border border-red-800">
                    DARK WEB
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Live Attack Counter */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <IoFlameOutline className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">ATTACKS BLOCKED</div>
                  <div className="text-lg font-mono font-bold text-red-400">{attackCount.toLocaleString()}</div>
                </div>
              </div>

              {/* User Status */}
              <div className="flex items-center space-x-3 border-l border-gray-800 pl-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">STATUS</div>
                  <div className={`text-sm font-bold ${userTier === 'certified' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {userTier === 'certified' ? 'TU-1-A VERIFIED' : 'UNVERIFIED'}
                  </div>
                </div>
                <button className="p-2 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition">
                  <IoPersonOutline className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Cart */}
              <button className="relative p-2 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition">
                <IoCartOutline className="w-5 h-5 text-gray-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-950 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search threat intelligence, exploits, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none"
              />
            </div>
            <button className="px-6 py-3 bg-red-900/20 text-red-400 border border-red-900 rounded-lg hover:bg-red-900/30 transition font-semibold">
              SCAN DOMAIN
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Categories & Stats */}
          <div className="col-span-3">
            {/* Categories */}
            <div className="bg-gray-950 border border-gray-900 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-4">CATEGORIES</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded transition ${
                      selectedCategory === cat.id 
                        ? 'bg-red-900/20 text-red-400 border border-red-900' 
                        : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{cat.name}</span>
                    <span className="text-xs font-mono">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Threats Panel */}
            <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-900 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-400">LIVE THREATS</h3>
                <button onClick={() => setShowLivePanel(!showLivePanel)}>
                  {showLivePanel ? <IoChevronUpOutline className="w-4 h-4 text-gray-500" /> : <IoChevronDownOutline className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
              {showLivePanel && (
                <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                  {liveThreats.map(threat => (
                    <div key={threat.id} className="p-2 bg-black rounded border border-gray-900">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${
                          threat.type === 'CRITICAL' ? 'text-red-500' :
                          threat.type === 'HIGH' ? 'text-orange-500' :
                          threat.type === 'MEDIUM' ? 'text-yellow-500' :
                          'text-gray-500'
                        }`}>
                          {threat.type}
                        </span>
                        <span className="text-xs text-gray-600">{threat.time}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="text-white">{threat.attack}</span> → {threat.target}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Origin: {threat.origin} | Status: <span className={threat.status === 'BLOCKED' ? 'text-green-500' : 'text-yellow-500'}>{threat.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Your Stats */}
            {userTier === 'certified' && (
              <div className="bg-gradient-to-br from-green-950/20 to-black border border-green-900/50 rounded-lg p-4 mt-6">
                <h3 className="text-sm font-bold text-green-400 mb-3">TU-1-A BENEFITS</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Reports Access</span>
                    <span className="text-green-400 font-bold">UNLIMITED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Calls</span>
                    <span className="text-green-400 font-bold">∞</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Priority</span>
                    <span className="text-green-400 font-bold">MAX</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content - Reports Grid */}
          <div className="col-span-9">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">{filteredReports.length} REPORTS AVAILABLE</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-white'}`}
                  >
                    <IoGridOutline className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-white'}`}
                  >
                    <IoListOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <select className="bg-black border border-gray-800 rounded px-3 py-1 text-sm text-gray-400 focus:border-gray-700 focus:outline-none">
                <option>Sort: Most Downloaded</option>
                <option>Sort: Price High-Low</option>
                <option>Sort: Price Low-High</option>
                <option>Sort: Newest</option>
                <option>Sort: Rating</option>
              </select>
            </div>

            {/* Warning Banner */}
            {userTier !== 'certified' && (
              <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-900/50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <IoWarningOutline className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-yellow-400 mb-1">UNVERIFIED ACCESS</h4>
                    <p className="text-xs text-yellow-600">
                      You're viewing with limited access. Get TU-1-A certified for unlimited reports, API access, and real-time protection.
                    </p>
                  </div>
                  <Link href="/security/certification" className="px-3 py-1 bg-yellow-900/30 text-yellow-400 border border-yellow-800 rounded text-xs font-bold hover:bg-yellow-900/50 transition">
                    GET VERIFIED
                  </Link>
                </div>
              </div>
            )}

            {/* Reports Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredReports.map(report => (
                <div 
                  key={report.id} 
                  className={`bg-gray-950 border border-gray-900 rounded-lg overflow-hidden hover:border-gray-800 transition ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Severity Bar */}
                  <div className={`h-1 ${
                    report.severity === 'CRITICAL' ? 'bg-gradient-to-r from-red-600 to-red-900' :
                    report.severity === 'HIGH' ? 'bg-gradient-to-r from-orange-600 to-orange-900' :
                    'bg-gradient-to-r from-yellow-600 to-yellow-900'
                  }`}></div>

                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-600 font-mono">{report.vendor}</span>
                            <span className="text-xs text-gray-700">•</span>
                            <span className="text-xs text-gray-600">{report.lastUpdate}</span>
                          </div>
                          <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">
                            {report.title}
                          </h3>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {report.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-900 text-gray-500 text-xs rounded border border-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <IoDocumentTextOutline className="w-3 h-3" />
                          <span>{report.pages}p</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <IoDownloadOutline className="w-3 h-3" />
                          <span>{report.downloads}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <IoStar className="w-3 h-3 text-yellow-500" />
                          <span>{report.rating}</span>
                        </span>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          {userTier === 'certified' && report.price > 5000 ? (
                            <span className="text-lg font-bold text-green-400">FREE</span>
                          ) : (
                            <span className="text-lg font-bold text-white font-mono">
                              ${report.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.preview && (
                            <button className="p-1.5 bg-gray-900 rounded border border-gray-800 hover:border-gray-700 transition">
                              <IoEyeOutline className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                          <button 
                            onClick={() => setCartCount(prev => prev + 1)}
                            className="px-3 py-1.5 bg-red-900/20 text-red-400 border border-red-900 rounded text-xs font-bold hover:bg-red-900/30 transition"
                          >
                            {userTier === 'certified' && report.price > 5000 ? 'DOWNLOAD' : 'ADD'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-12">
              <div className="bg-gradient-to-br from-red-950/20 to-black border border-red-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <IoSkullOutline className="w-5 h-5 text-red-500" />
                  <IoArrowUpOutline className="w-3 h-3 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">892</div>
                <div className="text-xs text-gray-500">Active Threats</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-950/20 to-black border border-yellow-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <IoBugOutline className="w-5 h-5 text-yellow-500" />
                  <IoArrowUpOutline className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">234</div>
                <div className="text-xs text-gray-500">New Exploits</div>
              </div>

              <div className="bg-gradient-to-br from-blue-950/20 to-black border border-blue-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <IoGlobeOutline className="w-5 h-5 text-blue-500" />
                  <IoArrowDownOutline className="w-3 h-3 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">1,489</div>
                <div className="text-xs text-gray-500">Protected Sites</div>
              </div>

              <div className="bg-gradient-to-br from-green-950/20 to-black border border-green-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-green-500" />
                  <span className="text-xs text-green-400 font-bold">100%</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">0</div>
                <div className="text-xs text-gray-500">TU-1-A Breaches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-950 to-transparent pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`${
            userTier === 'certified' 
              ? 'bg-gradient-to-r from-green-900/30 to-green-950/30 border-green-900' 
              : 'bg-gradient-to-r from-red-900/30 to-red-950/30 border-red-900'
          } border rounded-lg p-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {userTier === 'certified' ? (
                  <>
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-400 font-bold">TU-1-A VERIFIED</span>
                    <span className="text-xs text-gray-500">ALL REPORTS INCLUDED • UNLIMITED API • MAX PRIORITY</span>
                  </>
                ) : (
                  <>
                    <IoWarningOutline className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-red-400 font-bold">UNVERIFIED ACCESS</span>
                    <span className="text-xs text-gray-500">LIMITED REPORTS • 100 API CALLS • BASIC ACCESS</span>
                  </>
                )}
              </div>
              {userTier !== 'certified' && (
                <Link 
                  href="/security/certification"
                  className="px-4 py-1.5 bg-red-900/50 text-red-400 border border-red-800 rounded font-bold text-xs hover:bg-red-900/70 transition"
                >
                  GET VERIFIED →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}