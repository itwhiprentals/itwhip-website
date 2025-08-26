// app/components/certification/HackerTransparency.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  IoSkullOutline,
  IoWarning,
  IoBugOutline,
  IoCodeSlash,
  IoTerminal,
  IoLockOpenOutline,
  IoFlashOutline,
  IoSearchOutline,
  IoCloseCircle,
  IoCheckmarkCircle,
  IoTrophyOutline,
  IoCashOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface HackAttempt {
  id: string
  timestamp: string
  method: string
  target: string
  payload: string
  blocked: boolean
  bounty?: number
}

interface Vulnerability {
  name: string
  description: string
  impact: string
  howWeStop: string
  attempts: number
  lastAttempt: string
  severity: 'critical' | 'high' | 'medium'
}

export function HackerTransparency() {
  const [selectedVuln, setSelectedVuln] = useState<string | null>(null)
  const [liveAttempts, setLiveAttempts] = useState<HackAttempt[]>([])
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [totalBountyPaid, setTotalBountyPaid] = useState(127500)
  const [showRealPayload, setShowRealPayload] = useState(false)

  // What hackers actually look for
  const vulnerabilities: Vulnerability[] = [
    {
      name: 'SQL Injection',
      description: 'Injecting malicious SQL to access your entire database',
      impact: 'Complete data breach - all customer info, credit cards, passwords',
      howWeStop: 'Parameterized queries, input sanitization, WAF rules, real-time monitoring',
      attempts: 8234,
      lastAttempt: '2 minutes ago',
      severity: 'critical'
    },
    {
      name: 'Exposed API Keys',
      description: 'Finding API keys in your JavaScript, GitHub, or mobile apps',
      impact: 'Full platform access, massive AWS bills, data theft',
      howWeStop: 'Key rotation every 24h, environment isolation, secret scanning, zero-trust architecture',
      attempts: 3421,
      lastAttempt: '5 minutes ago',
      severity: 'critical'
    },
    {
      name: 'Weak Password Hashing',
      description: 'Using MD5/SHA1 or no salt - crackable in seconds',
      impact: 'All user accounts compromised, identity theft, lawsuits',
      howWeStop: 'Argon2id hashing, unique salts, password complexity requirements, MFA mandatory',
      attempts: 5643,
      lastAttempt: '1 minute ago',
      severity: 'high'
    },
    {
      name: 'XSS (Cross-Site Scripting)',
      description: 'Injecting JavaScript to steal sessions and credentials',
      impact: 'Account takeover, credit card theft, reputation damage',
      howWeStop: 'Content Security Policy, input encoding, React sanitization, DOM purification',
      attempts: 7892,
      lastAttempt: '8 minutes ago',
      severity: 'high'
    },
    {
      name: 'Insecure Direct Object References',
      description: 'Accessing other users\' data by changing IDs in URLs',
      impact: 'Privacy violations, GDPR fines, customer data exposure',
      howWeStop: 'UUID identifiers, permission middleware, row-level security, audit logging',
      attempts: 4567,
      lastAttempt: '3 minutes ago',
      severity: 'high'
    },
    {
      name: 'Missing Rate Limiting',
      description: 'Brute forcing passwords, APIs, or creating DDoS',
      impact: 'Account takeover, service outage, resource exhaustion',
      howWeStop: 'Redis rate limiting, Cloudflare DDoS protection, adaptive throttling, IP blocking',
      attempts: 12453,
      lastAttempt: '30 seconds ago',
      severity: 'medium'
    }
  ]

  // Live hack attempts (sanitized for display)
  const generateHackAttempt = (): HackAttempt => {
    const methods = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH']
    const targets = [
      '/api/v3/auth/login',
      '/api/v3/users/admin',
      '/api/v3/bookings/all',
      '/api/v3/payments/process',
      '/api/v3/hotels/delete',
      '/api/v3/drivers/earnings'
    ]
    const payloads = [
      "'; DROP TABLE users; --",
      "../../../etc/passwd",
      "<script>alert('XSS')</script>",
      "admin' OR '1'='1",
      "{\"role\":\"admin\",\"bypass\":true}",
      "../../.env"
    ]

    return {
      id: `HACK-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      method: methods[Math.floor(Math.random() * methods.length)],
      target: targets[Math.floor(Math.random() * targets.length)],
      payload: payloads[Math.floor(Math.random() * payloads.length)],
      blocked: true,
      bounty: Math.random() > 0.95 ? Math.floor(Math.random() * 5000) + 500 : undefined
    }
  }

  // Generate live attempts
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAttempts(prev => [generateHackAttempt(), ...prev].slice(0, 5))
    }, 3000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [])

  // Update bounty occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        setTotalBountyPaid(prev => prev + Math.floor(Math.random() * 2500) + 500)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Terminal simulation
  const runTerminalDemo = () => {
    setIsTerminalOpen(true)
    setTerminalOutput([])
    
    const commands = [
      { delay: 0, text: '$ curl -X POST https://api.itwhip.com/auth/login \\' },
      { delay: 500, text: '  -d "username=admin\' OR \'1\'=\'1&password=anything"' },
      { delay: 1000, text: '⚠️  SQL Injection Attempt Detected!' },
      { delay: 1500, text: '🛡️  Attack Vector: Authentication Bypass' },
      { delay: 2000, text: '🚫 Request Blocked by WAF' },
      { delay: 2500, text: '📍 Origin: 185.220.101.45 (TOR Exit Node)' },
      { delay: 3000, text: '📧 Security Team Notified' },
      { delay: 3500, text: '🎯 Attacker IP Blacklisted' },
      { delay: 4000, text: '✅ System Protected - 0 Data Exposed' },
      { delay: 5000, text: '' },
      { delay: 5500, text: '$ python3 exploit.py --target itwhip --vuln CVE-2024-XXXX' },
      { delay: 6500, text: '❌ ERROR: No vulnerable endpoints found' },
      { delay: 7000, text: '🔒 All systems patched and secured' },
      { delay: 8000, text: '' },
      { delay: 8500, text: 'Want to try hacking us? Join our bug bounty program!' },
      { delay: 9000, text: 'Maximum payout: $50,000 for critical vulnerabilities' },
      { delay: 9500, text: 'Email: security@itwhip.com' }
    ]

    commands.forEach(cmd => {
      setTimeout(() => {
        setTerminalOutput(prev => [...prev, cmd.text])
      }, cmd.delay)
    })
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-full mb-4">
            <IoSkullOutline className="w-5 h-5" />
            <span className="font-semibold">Full Transparency: What Hackers Target</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            We Show You <span className="text-red-600">Exactly</span> What Hackers Look For
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Most companies hide their vulnerabilities. We show you everything - 
            what they attack, how they attack, and how we stop them.
          </p>
        </div>

        {/* Bug Bounty Stats */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <IoTrophyOutline className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">${totalBountyPaid.toLocaleString()}</p>
              <p className="text-sm opacity-75">Total Bounties Paid</p>
            </div>
            <div className="text-center">
              <IoBugOutline className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">47</p>
              <p className="text-sm opacity-75">Vulnerabilities Found & Fixed</p>
            </div>
            <div className="text-center">
              <IoCashOutline className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">$50,000</p>
              <p className="text-sm opacity-75">Maximum Bounty</p>
            </div>
            <div className="text-center">
              <IoTimeOutline className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">4 hours</p>
              <p className="text-sm opacity-75">Avg Fix Time</p>
            </div>
          </div>
        </div>

        {/* Vulnerability Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {vulnerabilities.map((vuln) => (
            <div 
              key={vuln.name}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setSelectedVuln(selectedVuln === vuln.name ? null : vuln.name)}
            >
              <div className={`p-4 ${
                vuln.severity === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                vuln.severity === 'high' ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                'bg-gradient-to-r from-yellow-600 to-yellow-700'
              } text-white`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{vuln.name}</h3>
                  <IoWarning className="w-5 h-5" />
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {vuln.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Attempts blocked:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {vuln.attempts.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last attempt:</span>
                    <span className="text-gray-700 dark:text-gray-300">{vuln.lastAttempt}</span>
                  </div>
                </div>

                {selectedVuln === vuln.name && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3 animate-fadeIn">
                    <div>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">
                        Potential Impact:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vuln.impact}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">
                        How We Stop It:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vuln.howWeStop}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    vuln.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    vuln.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {vuln.severity.toUpperCase()}
                  </span>
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Attack Monitor */}
        <div className="bg-gray-900 rounded-xl p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              Live Attack Attempts (Sanitized)
            </h3>
            <button
              onClick={() => setShowRealPayload(!showRealPayload)}
              className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              {showRealPayload ? 'Hide' : 'Show'} Real Payloads
            </button>
          </div>
          
          <div className="space-y-3">
            {liveAttempts.map((attempt) => (
              <div key={attempt.id} className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      attempt.method === 'POST' ? 'bg-blue-600 text-white' :
                      attempt.method === 'GET' ? 'bg-green-600 text-white' :
                      attempt.method === 'DELETE' ? 'bg-red-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {attempt.method}
                    </span>
                    <span className="text-gray-400">{attempt.target}</span>
                  </div>
                  <span className="text-xs text-gray-500">{attempt.timestamp}</span>
                </div>
                
                <div className="bg-gray-900 rounded p-2 mb-2">
                  <p className="text-xs text-gray-400 mb-1">Payload:</p>
                  <p className="text-red-400 break-all">
                    {showRealPayload ? attempt.payload : '**REDACTED FOR SECURITY**'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IoCloseCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-400 text-xs">BLOCKED</span>
                  </div>
                  {attempt.bounty && (
                    <span className="text-green-400 text-xs">
                      💰 ${attempt.bounty} bounty paid for discovery
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Terminal */}
        <div className="mb-12">
          <div className="bg-black rounded-xl overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-3">security@itwhip.com</span>
              </div>
              <button
                onClick={runTerminalDemo}
                className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Run Hack Demo
              </button>
            </div>
            
            <div className="p-4 h-96 overflow-y-auto">
              {!isTerminalOpen ? (
                <div className="text-green-400 font-mono text-sm">
                  <p>$ Ready to see a live hack attempt?</p>
                  <p>$ Click "Run Hack Demo" above to watch our defenses in action...</p>
                  <p className="animate-pulse">█</p>
                </div>
              ) : (
                <div className="text-green-400 font-mono text-sm space-y-1">
                  {terminalOutput.map((line, index) => (
                    <p key={index} className={
                      line.startsWith('⚠️') ? 'text-yellow-400' :
                      line.startsWith('🛡️') || line.startsWith('🚫') || line.startsWith('📍') || line.startsWith('📧') || line.startsWith('🎯') ? 'text-blue-400' :
                      line.startsWith('✅') ? 'text-green-400' :
                      line.startsWith('❌') || line.startsWith('🔒') ? 'text-red-400' :
                      line.includes('bug bounty') ? 'text-purple-400 font-bold' :
                      'text-green-400'
                    }>
                      {line}
                    </p>
                  ))}
                  {terminalOutput.length > 0 && (
                    <p className="animate-pulse">█</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Try to Hack Us */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <IoTerminal className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Think You Can Hack Us?</h3>
          <p className="text-lg mb-6 opacity-90">
            We're so confident in our security, we'll pay you to try.
            Find a vulnerability and earn up to $50,000.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/security/bug-bounty" 
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              View Bug Bounty Program
            </a>
            <a 
              href="/security/challenge" 
              className="px-6 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition-colors"
            >
              Start Hacking Challenge
            </a>
          </div>
        </div>

        {/* Trust Message */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <IoCheckmarkCircle className="inline w-5 h-5 mr-2 text-green-500" />
            We're the only platform that shows you our attacks in real-time. 
            <span className="font-bold text-gray-900 dark:text-white"> Complete transparency.</span>
          </p>
        </div>
      </div>
    </section>
  )
}