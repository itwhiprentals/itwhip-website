// app/security/status/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  IoRadioButtonOnOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoTimerOutline,
  IoTrendingUpOutline,
  IoServerOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoWifiOutline,
  IoCloudOutline,
  IoLayersOutline,
  IoCodeSlashOutline,
  IoTerminalOutline,
  IoWarningOutline,
  IoSpeedometerOutline,
  IoAnalyticsOutline
} from 'react-icons/io5'

export default function SecurityStatusPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attacksBlocked, setAttacksBlocked] = useState(2847)
  const [activeConnections, setActiveConnections] = useState(1247)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  // Update time and metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      setAttacksBlocked(prev => prev + Math.floor(Math.random() * 3))
      setActiveConnections(prev => prev + Math.floor(Math.random() * 10) - 5)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // System components status
  const systemStatus = [
    {
      name: 'Web Application',
      status: 'operational',
      uptime: 99.99,
      responseTime: '127ms',
      lastIncident: 'Never',
      details: 'All systems operational'
    },
    {
      name: 'API Gateway',
      status: 'operational',
      uptime: 99.99,
      responseTime: '43ms',
      lastIncident: '47 days ago',
      details: 'Handling 1,247 req/sec'
    },
    {
      name: 'Database Cluster',
      status: 'operational',
      uptime: 99.97,
      responseTime: '8ms',
      lastIncident: '12 days ago',
      details: '3 nodes active, fully replicated'
    },
    {
      name: 'CDN Network',
      status: 'operational',
      uptime: 100,
      responseTime: '12ms',
      lastIncident: 'Never',
      details: '147 edge locations active'
    },
    {
      name: 'Payment Processing',
      status: 'operational',
      uptime: 99.99,
      responseTime: '234ms',
      lastIncident: '89 days ago',
      details: 'PCI compliant, tokenization active'
    },
    {
      name: 'Security WAF',
      status: 'operational',
      uptime: 100,
      responseTime: '2ms',
      lastIncident: 'Never',
      details: 'Blocking 2,847 attacks today'
    }
  ]

  // Security layers status
  const securityLayers = [
    { layer: 'Layer 1: DDoS Protection', status: 'active', blocked: 12847 },
    { layer: 'Layer 2: WAF Rules', status: 'active', blocked: 8923 },
    { layer: 'Layer 3: Rate Limiting', status: 'active', blocked: 4521 },
    { layer: 'Layer 4: Authentication', status: 'active', blocked: 2341 },
    { layer: 'Layer 5: Authorization', status: 'active', blocked: 1876 },
    { layer: 'Layer 6: Encryption', status: 'active', blocked: 0 },
    { layer: 'Layer 7: Monitoring', status: 'active', blocked: 0 }
  ]

  // Recent security events
  const recentEvents = [
    {
      time: '14:32:47',
      type: 'attack',
      event: 'SQL Injection blocked',
      source: '185.220.x.x',
      status: 'blocked'
    },
    {
      time: '14:32:45',
      type: 'attack',
      event: 'Brute force attempt',
      source: '45.142.x.x',
      status: 'blocked'
    },
    {
      time: '14:32:41',
      type: 'scan',
      event: 'Port scan detected',
      source: '162.158.x.x',
      status: 'monitored'
    },
    {
      time: '14:32:38',
      type: 'attack',
      event: 'XSS attempt blocked',
      source: '104.21.x.x',
      status: 'blocked'
    },
    {
      time: '14:32:33',
      type: 'auth',
      event: 'Failed login attempt',
      source: '172.67.x.x',
      status: 'logged'
    }
  ]

  // Performance metrics
  const performanceMetrics = [
    { metric: 'API Response Time', value: '127ms', status: 'excellent', benchmark: '<200ms' },
    { metric: 'Database Query Time', value: '8ms', status: 'excellent', benchmark: '<50ms' },
    { metric: 'Page Load Time', value: '1.2s', status: 'good', benchmark: '<2s' },
    { metric: 'SSL Handshake', value: '43ms', status: 'excellent', benchmark: '<100ms' },
    { metric: 'Cache Hit Rate', value: '94%', status: 'excellent', benchmark: '>90%' },
    { metric: 'Error Rate', value: '0.01%', status: 'excellent', benchmark: '<0.1%' }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'operational':
      case 'active':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'outage':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'operational':
        return (
          <span className="flex items-center text-sm text-green-600">
            <IoCheckmarkCircleOutline className="w-4 h-4 mr-1" />
            Operational
          </span>
        )
      case 'degraded':
        return (
          <span className="flex items-center text-sm text-yellow-600">
            <IoAlertCircleOutline className="w-4 h-4 mr-1" />
            Degraded
          </span>
        )
      case 'outage':
        return (
          <span className="flex items-center text-sm text-red-600">
            <IoCloseCircleOutline className="w-4 h-4 mr-1" />
            Outage
          </span>
        )
      default:
        return null
    }
  }

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'attack':
        return <IoWarningOutline className="w-4 h-4 text-red-500" />
      case 'scan':
        return <IoRadioButtonOnOutline className="w-4 h-4 text-yellow-500" />
      case 'auth':
        return <IoLockClosedOutline className="w-4 h-4 text-blue-500" />
      default:
        return <IoRadioButtonOnOutline className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-900 to-emerald-800 dark:from-emerald-950 dark:to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/security" className="inline-flex items-center text-emerald-200 hover:text-white mb-4 transition-colors">
            <IoChevronForwardOutline className="w-4 h-4 rotate-180 mr-1" />
            Back to Security
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoRadioButtonOnOutline className="w-12 h-12 text-green-400 animate-pulse mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Security Status
                </h1>
                <p className="text-xl text-emerald-200 mt-2">
                  Real-time System Monitoring & Security Events
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-emerald-200">System Uptime</div>
              <div className="text-3xl font-bold">99.99%</div>
              <div className="text-sm text-emerald-200">Last 90 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
                <span className="font-medium">All Systems Operational</span>
              </div>
              <div className="text-sm">
                Last updated: {currentTime.toLocaleTimeString()}
              </div>
            </div>
            <button className="flex items-center text-sm hover:text-green-200 transition-colors">
              <IoRefreshOutline className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Live Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoShieldCheckmarkOutline className="w-8 h-8 text-green-600" />
              <IoRadioButtonOnOutline className="w-4 h-4 text-green-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {attacksBlocked.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Attacks Blocked Today</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoWifiOutline className="w-8 h-8 text-blue-600" />
              <IoRadioButtonOnOutline className="w-4 h-4 text-green-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeConnections.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Connections</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoSpeedometerOutline className="w-8 h-8 text-purple-600" />
              <IoRadioButtonOnOutline className="w-4 h-4 text-green-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">127ms</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <IoServerOutline className="w-8 h-8 text-orange-600" />
              <IoRadioButtonOnOutline className="w-4 h-4 text-green-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">47%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Server Load</div>
          </div>
        </div>

        {/* System Components Status */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <IoServerOutline className="w-6 h-6 text-emerald-600 mr-2" />
              System Components
            </h2>
            <div className="flex items-center space-x-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            {systemStatus.map((system) => (
              <div key={system.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white mr-3">
                      {system.name}
                    </h3>
                    {getStatusBadge(system.status)}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Response: <span className="font-semibold">{system.responseTime}</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {system.uptime}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Last Incident:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {system.lastIncident}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {system.details}
                    </span>
                  </div>
                </div>
                
                {/* Uptime bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${system.uptime}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Layers */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <IoLayersOutline className="w-6 h-6 text-indigo-600 mr-2" />
              Security Layers
            </h2>
            
            <div className="space-y-3">
              {securityLayers.map((layer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <IoCheckmarkCircleOutline className={`w-5 h-5 mr-3 ${getStatusColor(layer.status)}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {layer.layer}
                    </span>
                  </div>
                  <div className="text-right">
                    {layer.blocked > 0 && (
                      <span className="text-sm text-red-600 font-semibold">
                        {layer.blocked.toLocaleString()} blocked
                      </span>
                    )}
                    {layer.blocked === 0 && (
                      <span className="text-sm text-green-600">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <IoTerminalOutline className="w-6 h-6 text-red-600 mr-2" />
              Recent Security Events
            </h2>
            
            <div className="space-y-2">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <div className="flex items-center">
                    {getEventIcon(event.type)}
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.event}
                      </span>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {event.time} • {event.source}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    event.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    event.status === 'monitored' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            
            <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View Full Event Log →
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <IoSpeedometerOutline className="w-6 h-6 text-purple-600 mr-2" />
            Performance Metrics
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.metric} className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.metric}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    metric.status === 'excellent' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    metric.status === 'good' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                  }`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Benchmark: {metric.benchmark}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Uptime */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            90-Day Uptime History
          </h2>
          
          <div className="grid grid-cols-30 gap-1">
            {[...Array(90)].map((_, i) => {
              const uptime = Math.random() > 0.02 ? 100 : 99.9
              return (
                <div
                  key={i}
                  className={`h-8 rounded ${
                    uptime === 100 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  title={`Day ${i + 1}: ${uptime}% uptime`}
                />
              )
            })}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                <span className="text-gray-600 dark:text-gray-400">100% Uptime</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Minor Issues</span>
              </div>
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              Overall: 99.99% uptime
            </span>
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 text-center text-white">
          <IoAnalyticsOutline className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
          <h2 className="text-3xl font-bold mb-4">
            Stay Informed
          </h2>
          <p className="text-lg mb-6 text-emerald-100">
            Get instant notifications about security events and system status.<br />
            Subscribe to our status updates and incident reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 flex-1"
            />
            <button className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-3 px-6 rounded-lg transition-all">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-emerald-200 mt-4">
            You can also follow @ItWhipStatus on Twitter for real-time updates
          </p>
        </div>

      </div>
    </div>
  )
}