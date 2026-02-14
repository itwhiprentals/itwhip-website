// app/security/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'

// Layout Components
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Security Components (All 10)
import SecurityCrisisHeader from '@/app/components/security/SecurityCrisisHeader'
import LiveAttackStreams from '@/app/components/security/LiveAttackStreams'
import SecurityThreats from '@/app/components/security/SecurityThreats'
import TU1AShowcase from '@/app/components/security/TU1AShowcase'
import SecurityArchitecture from '@/app/components/security/SecurityArchitecture'
import BreachCalculator from '@/app/components/security/BreachCalculator'
import ComplianceComparison from '@/app/components/security/ComplianceComparison'
import SecurityTransparency from '@/app/components/security/SecurityTransparency'
import LiveSecurityProof from '@/app/components/security/LiveSecurityProof'
import SecurityObjections from '@/app/components/security/SecurityObjections'

// Icons for sections
import {
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoServerOutline,
  IoCodeSlashOutline,
  IoConstructOutline,
  IoCloudOutline,
  IoEarthOutline,
  IoSchoolOutline,
  IoCheckmarkCircle,
  IoTrophyOutline,
  IoTrendingDownOutline,
  IoExpandOutline,
  IoContractOutline,
  IoCloseCircleOutline,
  IoStatsChartOutline,
  IoSparklesOutline,
  IoShieldOutline,
  IoTerminalOutline,
  IoLeafOutline,
  IoDocumentTextOutline,
  IoTimerOutline,
  IoCopyOutline,
  IoRocketOutline,
  IoAlertCircleOutline,
  IoLockClosedOutline,
  IoBugOutline,
  IoSkullOutline,
  IoArrowForwardOutline,
  IoPlayCircleOutline,
  IoEyeOutline,
  IoPulseOutline
} from 'react-icons/io5'

export default function SecurityPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Live Security Metrics
  const [securityMetrics, setSecurityMetrics] = useState({
    attacksBlocked: 48291,
    threatsDetected: 2847,
    bountiesPaid: 247000,
    protectionRate: 100,
    breachesPreventedValue: 4450000,
    complianceScore: 98.7,
    detectionSpeed: 2,
    hackersOnline: 127,
    systemsProtected: 847,
    falsePositives: 0,
    validationCycles: 9847,
    vulnerabilitiesFound: 0
  })

  // Floating Sidebar State
  const [showFloatingSidebar, setShowFloatingSidebar] = useState(true)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)

  // Live Attack Events (3 different types)
  const [attackEvents, setAttackEvents] = useState([
    { time: '14:23:01', type: 'sql.injection', detail: 'Blocked from 185.220.x.x', value: 'BLOCKED', severity: 'high' as const },
    { time: '14:23:04', type: 'xss.attempt', detail: 'Script tag sanitized', value: 'SANITIZED', severity: 'medium' as const },
    { time: '14:23:07', type: 'ddos.attack', detail: '10K requests mitigated', value: 'MITIGATED', severity: 'high' as const },
    { time: '14:23:10', type: 'auth.bypass', detail: 'JWT manipulation detected', value: 'DENIED', severity: 'critical' as const },
    { time: '14:23:13', type: 'scan.detected', detail: 'Port scan from China', value: 'LOGGED', severity: 'low' as const }
  ])

  const [vulnerabilityEvents, setVulnerabilityEvents] = useState([
    { time: '14:23:22', type: 'bounty.submitted', detail: 'XSS finding #4827', value: '$500', severity: 'medium' as const },
    { time: '14:23:25', type: 'patch.applied', detail: 'Critical update deployed', value: 'FIXED', severity: 'info' as const },
    { time: '14:23:28', type: 'pen.test', detail: 'Automated test failed', value: 'SECURE', severity: 'info' as const },
    { time: '14:23:31', type: 'dependency.scan', detail: 'All packages secure', value: 'CLEAN', severity: 'info' as const },
    { time: '14:23:34', type: 'code.review', detail: 'AI analysis complete', value: 'PASSED', severity: 'info' as const }
  ])

  const [complianceEvents, setComplianceEvents] = useState([
    { time: '14:23:40', type: 'tu1a.validation', detail: 'Cycle #9847 complete', value: '98.7%', severity: 'info' as const },
    { time: '14:23:43', type: 'soc2.check', detail: 'All controls validated', value: 'EXCEEDED', severity: 'info' as const },
    { time: '14:23:46', type: 'pci.scan', detail: 'Quarterly scan passed', value: 'COMPLIANT', severity: 'info' as const },
    { time: '14:23:49', type: 'gdpr.audit', detail: 'Privacy controls verified', value: 'PASSED', severity: 'info' as const },
    { time: '14:23:52', type: 'iso.review', detail: '27001 requirements met', value: 'CERTIFIED', severity: 'info' as const }
  ])

  // Threat Intelligence Data
  const [threats, setThreats] = useState([
    { id: 'APT-29', origin: 'Russia', status: 'active', attempts: 1247, blocked: 1247 },
    { id: 'Lazarus', origin: 'North Korea', status: 'monitoring', attempts: 892, blocked: 892 },
    { id: 'APT-28', origin: 'Russia', status: 'active', attempts: 656, blocked: 656 }
  ])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update Metrics Effect - only on client
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setSecurityMetrics(prev => ({
        ...prev,
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 7) + 3,
        threatsDetected: prev.threatsDetected + (Math.random() > 0.7 ? 1 : 0),
        bountiesPaid: prev.bountiesPaid + (Math.random() > 0.9 ? 500 : 0),
        hackersOnline: Math.max(100, Math.min(150, prev.hackersOnline + Math.floor(Math.random() * 11) - 5)),
        systemsProtected: prev.systemsProtected + (Math.random() > 0.95 ? 1 : 0),
        validationCycles: prev.validationCycles + 1
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isClient])

  // Update Events Effect - only on client
  useEffect(() => {
    if (!isClient) return

    const eventInterval = setInterval(() => {
      const eventType = Math.floor(Math.random() * 3)
      
      if (eventType === 0) {
        const newAttackEvent = generateAttackEvent()
        setAttackEvents(prev => [newAttackEvent, ...prev.slice(0, 4)] as any)
      } else if (eventType === 1) {
        const newVulnerabilityEvent = generateVulnerabilityEvent()
        setVulnerabilityEvents(prev => [newVulnerabilityEvent, ...prev.slice(0, 4)] as any)
      } else {
        const newComplianceEvent = generateComplianceEvent()
        setComplianceEvents(prev => [newComplianceEvent, ...prev.slice(0, 4)] as any)
      }
    }, 4000)

    return () => clearInterval(eventInterval)
  }, [isClient])

  function generateAttackEvent() {
    const attackTypes = [
      { type: 'sql.injection', detail: `SQL attack from ${generateIP()}`, value: 'BLOCKED', severity: 'high' },
      { type: 'xss.attempt', detail: 'Malicious script detected', value: 'SANITIZED', severity: 'medium' },
      { type: 'brute.force', detail: `${Math.floor(100 + Math.random() * 900)} attempts`, value: 'BLOCKED', severity: 'high' },
      { type: 'api.abuse', detail: 'Rate limit enforced', value: 'LIMITED', severity: 'low' },
      { type: 'malware.upload', detail: 'Infected file quarantined', value: 'ISOLATED', severity: 'critical' }
    ]
    const event = attackTypes[Math.floor(Math.random() * attackTypes.length)]
    const now = new Date()
    const timeString = now.toTimeString().split(' ')[0]
    return { time: timeString, ...event }
  }

  function generateVulnerabilityEvent() {
    const vulnTypes = [
      { type: 'bounty.claimed', detail: `Researcher paid $${500 + Math.floor(Math.random() * 1500)}`, value: 'PAID', severity: 'medium' },
      { type: 'cve.patched', detail: 'Critical CVE resolved', value: 'FIXED', severity: 'info' },
      { type: 'scan.complete', detail: '0 vulnerabilities found', value: 'SECURE', severity: 'good' },
      { type: 'audit.passed', detail: 'External audit complete', value: 'PASSED', severity: 'good' },
      { type: 'pen.test.failed', detail: 'Attack simulation blocked', value: 'DEFENDED', severity: 'good' }
    ]
    const event = vulnTypes[Math.floor(Math.random() * vulnTypes.length)]
    const now = new Date()
    const timeString = now.toTimeString().split(' ')[0]
    return { time: timeString, ...event }
  }

  function generateComplianceEvent() {
    const complianceTypes = [
      { type: 'tu1a.cycle', detail: `Validation #${9847 + Math.floor(Math.random() * 100)}`, value: '98.7%', severity: 'good' },
      { type: 'gdpr.compliant', detail: 'Privacy controls verified', value: 'COMPLIANT', severity: 'good' },
      { type: 'hipaa.audit', detail: 'Healthcare standards met', value: 'PASSED', severity: 'info' },
      { type: 'iso.certified', detail: '27001 & 27002 valid', value: 'CERTIFIED', severity: 'good' },
      { type: 'nist.aligned', detail: 'Framework requirements exceeded', value: 'EXCEEDED', severity: 'good' }
    ]
    const event = complianceTypes[Math.floor(Math.random() * complianceTypes.length)]
    const now = new Date()
    const timeString = now.toTimeString().split(' ')[0]
    return { time: timeString, ...event }
  }

  function generateIP() {
    const countries = ['185.220.x.x', '192.168.x.x', '103.45.x.x', '89.248.x.x', '141.98.x.x']
    return countries[Math.floor(Math.random() * countries.length)]
  }

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }

  const handleSeeSolution = () => {
    document.getElementById('tu1a-showcase')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-black">
      {/* Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      {/* SECTION 1: Security Crisis Header with Live Ticker */}
      <SecurityCrisisHeader 
        securityMetrics={securityMetrics}
        onSeeSolution={handleSeeSolution}
      />
      
      {/* SECTION 2: Live Attack Streams */}
      <LiveAttackStreams
        attackEvents={attackEvents}
        vulnerabilityEvents={vulnerabilityEvents}
        complianceEvents={complianceEvents}
      />

      {/* SECTION 3: The 4 Security Threats */}
      <SecurityThreats />

      {/* SECTION 4: TU-1-A Showcase */}
      <div id="tu1a-showcase">
        <TU1AShowcase />
      </div>

      {/* SECTION 5: Security Architecture Showcase */}
      <SecurityArchitecture 
        securityMetrics={{
          systemsProtected: securityMetrics.systemsProtected,
          hackersOnline: securityMetrics.hackersOnline,
          detectionSpeed: securityMetrics.detectionSpeed
        }}
        threats={threats}
      />

      {/* SECTION 6: Breach Prevention Calculator */}
      <div id="breach-calculator">
        <BreachCalculator />
      </div>

      {/* SECTION 7: Compliance Comparison (Tabbed) */}
      <ComplianceComparison />

      {/* SECTION 8: Strategic Transparency - What We DON'T Do */}
      <SecurityTransparency />

      {/* SECTION 9: Live Security Proof Widgets */}
      <LiveSecurityProof />

      {/* SECTION 10: Security Objections - Hard Questions */}
      <SecurityObjections />

      {/* SECTION 11: Integration & Implementation - OPTIMIZED */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-800 dark:text-purple-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-purple-300 dark:border-purple-800">
              <IoFlashOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Instant Validation</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Zero-Friction</span> Implementation
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
              Start TU-1-A validation in minutes. 
              <span className="block mt-1 sm:inline sm:mt-0">No code changes, no auditors, no disruption.</span>
            </p>
          </div>

          {/* Implementation Options - Mobile Optimized */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* External Validation */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">External Validation</h3>
                <IoEyeOutline className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                We validate your security from outside - no access needed
              </p>
              <div className="bg-slate-900 dark:bg-black rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-xs">validation.yaml</span>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <IoCopyOutline className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-purple-400">
{`domain: your-platform.com
standard: TU-1-A
level: Maximum
frequency: Continuous

# That's it! No integration needed
# We test from outside like hackers do`}
                </pre>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center space-x-2 text-xs text-green-600">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>Start in 60 seconds</span>
              </div>
            </div>

            {/* API Integration */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Security API</h3>
                <IoServerOutline className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                Query your security status programmatically
              </p>
              <div className="bg-slate-900 dark:bg-black rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-xs">api.tu1a.security</span>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <IoCopyOutline className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-green-400">
{`GET /api/v1/validation/status
{
  "platform": "your-platform.com",
  "tu1a_score": 98.7,
  "status": "SECURE",
  "attacks_blocked": 48291,
  "last_breach": "never",
  "exceeds": ["SOC2", "ISO27001"]
}`}
                </pre>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center space-x-2 text-xs text-blue-600">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>RESTful API</span>
              </div>
            </div>

            {/* Embed Badge */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Trust Badge</h3>
                <IoShieldCheckmarkOutline className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                Display your TU-1-A certification publicly
              </p>
              <div className="bg-slate-900 dark:bg-black rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-xs">embed.html</span>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <IoCopyOutline className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-green-400">
{`<!-- TU-1-A Certified Badge -->
<div id="tu1a-badge" 
     data-platform="your-site">
</div>
<script src="cdn.tu1a.io/badge.js">
</script>

<!-- Live validation display -->`}
                </pre>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center space-x-2 text-xs text-green-600">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>Public verification</span>
              </div>
            </div>
          </div>

          {/* Live Validation Stream - Mobile Optimized */}
          <div className="bg-slate-900 dark:bg-black rounded-xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-white font-bold text-sm sm:text-base">Live TU-1-A Validation Stream</h3>
              <div className="flex items-center space-x-2">
                {isClient && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <span className="text-green-400 text-xs sm:text-sm">Validating</span>
              </div>
            </div>
            
            <div className="font-mono text-xs sm:text-sm space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
              <div className="text-green-400">
                <span className="text-slate-500">VALIDATION</span>
                <pre className="mt-2 overflow-x-auto">{`{
  "cycle": "${isClient ? securityMetrics.validationCycles : '9847'}",
  "timestamp": "${isClient ? new Date().toISOString() : '2024-12-14T14:23:01Z'}",
  "result": {
    "standard": "TU-1-A",
    "score": 98.7,
    "status": "EXCEEDED",
    "attacks_tested": ${isClient ? securityMetrics.attacksBlocked : '48291'},
    "vulnerabilities": 0,
    "compliance": {
      "SOC2": "exceeded",
      "ISO27001": "exceeded",
      "GDPR": "compliant",
      "PCI-DSS": "level-1"
    }
  }
}`}</pre>
              </div>
            </div>
          </div>

          {/* Comparison Link */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/security/certification"
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold text-sm sm:text-base"
            >
              <span>Learn why TU-1-A exceeds all standards</span>
              <IoArrowForwardOutline className="w-4 sm:w-5 h-4 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 12: Threat Intelligence Offering */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-red-300 dark:border-red-800">
              <IoSkullOutline className={`w-5 sm:w-6 h-5 sm:h-6 ${isClient ? 'animate-pulse' : ''}`} />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Threat Intelligence</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
              Monetize Your <span className="text-red-600">Attack Data</span>
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
              Every attack against you becomes intelligence for others. 
              <span className="block mt-1 sm:inline sm:mt-0">Sell anonymized threat data to enterprises for $10K+/month.</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* What You Get */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                Intelligence You Collect
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start space-x-3">
                    <IoBugOutline className="w-5 sm:w-6 h-5 sm:h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">Attack Patterns</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {isClient ? securityMetrics.attacksBlocked.toLocaleString() : '48,291'} real attack attempts analyzed daily
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start space-x-3">
                    <IoEarthOutline className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">Threat Origins</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                        Track APT groups, nation states, criminal organizations
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <IoFlashOutline className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">Zero-Day Discoveries</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                        First to detect new attack vectors worth millions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Model */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                Revenue Opportunity
              </h3>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-4">
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">$10-50K/month</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Enterprise threat intelligence subscriptions
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Fortune 500 Subscribers</span>
                  <span className="font-bold text-green-600">$50K/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Security Vendors</span>
                  <span className="font-bold text-blue-600">$25K/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Government Agencies</span>
                  <span className="font-bold text-purple-600">$100K/mo</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg border border-amber-300 dark:border-amber-800">
                <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100">
                  <IoWarningOutline className="inline w-4 h-4 mr-1" />
                  Your attack data is worth more than your primary revenue
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13: Final CTA - Mobile Optimized */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6">
            Stop Using Outdated Compliance
          </h2>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 px-2">
            SOC 2 checks annually. ISO 27001 every 3 years. 
            <span className="block mt-1 sm:inline sm:mt-0">TU-1-A validates every second. Forever. Free.</span>
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">{isClient ? securityMetrics.attacksBlocked.toLocaleString() : '48,291'}</div>
              <div className="text-xs sm:text-sm text-white/70">Attacks Blocked</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
              <div className="text-xs sm:text-sm text-white/70">Protection</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">$0</div>
              <div className="text-xs sm:text-sm text-white/70">Cost</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">24/7</div>
              <div className="text-xs sm:text-sm text-white/70">Validation</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/security/certification"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-base sm:text-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <IoShieldCheckmarkOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span className="hidden sm:inline">Start TU-1-A Validation</span>
              <span className="sm:hidden">Start Validation</span>
            </Link>
            <Link
              href="/security/challenge"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 rounded-lg font-bold text-base sm:text-lg hover:bg-slate-100 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <IoBugOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span>Try to Hack Us</span>
            </Link>
          </div>
          
          <p className="mt-6 sm:mt-8 text-white/70 text-xs sm:text-sm">
            Join 847 platforms already protected by TU-1-A
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Sidebar - Desktop Only with Close/Minimize */}
      {showFloatingSidebar && isClient && (
        <div className={`hidden lg:block fixed right-8 ${sidebarMinimized ? 'bottom-8' : 'top-1/2 transform -translate-y-1/2'} z-40 transition-all duration-300`}>
          {sidebarMinimized ? (
            // Minimized State - Small bubble
            <button
              onClick={() => setSidebarMinimized(false)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform"
            >
              <div className="flex items-center space-x-2">
                <IoShieldCheckmarkOutline className="w-5 h-5" />
                <span className="font-bold">{securityMetrics.attacksBlocked.toLocaleString()} blocked</span>
                <IoExpandOutline className="w-4 h-4" />
              </div>
            </button>
          ) : (
            // Expanded State
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-4 w-64 border border-slate-200 dark:border-slate-700">
              {/* Controls */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Security Status</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSidebarMinimized(true)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Minimize"
                  >
                    <IoContractOutline className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => setShowFloatingSidebar(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Close"
                  >
                    <IoCloseCircleOutline className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Attacks Blocked</p>
                  <p className="text-2xl font-black text-purple-600">{securityMetrics.attacksBlocked.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Protection Rate</p>
                  <p className="text-2xl font-black text-green-600">100%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">TU-1-A Score</p>
                  <p className="text-2xl font-black text-indigo-600">98.7%</p>
                </div>
                <Link
                  href="/security/certification"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-center hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Get Protected
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restore Floating Sidebar Button - If closed */}
      {!showFloatingSidebar && isClient && (
        <button
          onClick={() => {
            setShowFloatingSidebar(true)
            setSidebarMinimized(false)
          }}
          className="hidden lg:block fixed bottom-8 right-8 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-3 shadow-2xl hover:scale-110 transition-transform"
          title="Show Security Status"
        >
          <IoStatsChartOutline className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}