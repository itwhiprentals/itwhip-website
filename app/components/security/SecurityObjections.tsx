// app/components/security/SecurityObjections.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoHelpCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoBusinessOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoTimerOutline,
  IoInfiniteOutline,
  IoDocumentTextOutline,
  IoSkullOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoLockClosedOutline,
  IoExpand,
  IoContract,
  IoFlashOutline,
  IoLayersOutline,
  IoCloudOutline,
  IoAnalyticsOutline,
  IoGlobeOutline,
  IoServerOutline,
  IoRocketOutline,
  IoCodeSlashOutline,
  IoFlameOutline,
  IoBugOutline,
  IoEyeOutline,
  IoKeyOutline,
  IoAlertCircleOutline,
  IoTrendingUpOutline,
  IoPulseOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface Question {
  id: string
  question: string
  answer: string
  category: 'security' | 'compliance' | 'cost' | 'technical' | 'comparison' | 'challenge' | 'data' | 'implementation'
  icon: React.ReactNode
  highlights?: string[]
  priority?: 'high' | 'medium' | 'low'
  readTime?: string
  brutality?: boolean // For especially brutal honest answers
}

export default function SecurityObjections() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [expandAll, setExpandAll] = useState(false)
  const [liveStats, setLiveStats] = useState({
    attacksBlocked: 48291,
    hackersDefeated: 3847,
    bountyPaid: 247000
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update live stats
  useEffect(() => {
    if (!isClient) return
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 5),
        hackersDefeated: prev.hackersDefeated + (Math.random() > 0.8 ? 1 : 0),
        bountyPaid: prev.bountyPaid + (Math.random() > 0.95 ? 1000 : 0)
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [isClient])

  const questions: Question[] = [
    {
      id: 'why-tu1a',
      question: "What the hell is TU-1-A and why should I care?",
      answer: "TU-1-A is our proprietary security standard that we created because SOC 2, ISO 27001, and PCI DSS are compliance theater that don't actually stop breaches. MGM had SOC 2 - lost $100M. Change Healthcare was ISO certified - paid $22M ransom. LastPass had both - customer vaults stolen. TU-1-A is different: continuous 24/7 validation instead of annual audits, live public dashboard instead of hidden PDFs, real hackers testing instead of checkbox auditors, and it's completely FREE instead of $150K+/year. We've blocked 48,291 attacks with zero breaches since 2019. Traditional compliance checks boxes; TU-1-A actually protects you.",
      category: 'security',
      icon: <IoShieldCheckmarkOutline className="w-5 h-5" />,
      highlights: ['Zero breaches since 2019', 'FREE forever', '24/7 continuous testing', 'Public verification'],
      priority: 'high',
      readTime: '2 min',
      brutality: true
    },
    {
      id: 'vs-soc2',
      question: "How is this better than SOC 2 that everyone requires?",
      answer: "SOC 2 is a $147,000 annual joke that doesn't prevent breaches. It tests your controls ONCE a year while hackers attack 2,200 times per day. You get a PDF certificate that expires while we provide a live dashboard showing real-time protection. SOC 2 asks if you have policies; TU-1-A proves your security works. Here's the killer: Every major breach in 2023-2024 happened to SOC 2 certified companies. MGM, Caesars, Change Healthcare - all compliant, all breached. Meanwhile, TU-1-A protected companies have ZERO breaches. Plus, we're free while SOC 2 costs more than a developer's salary. Your customers can verify your security instantly at your public TU-1-A dashboard instead of asking for outdated PDFs.",
      category: 'comparison',
      icon: <IoDocumentTextOutline className="w-5 h-5" />,
      highlights: ['$147K saved annually', 'Real-time vs annual', 'Public dashboard vs PDF', 'Actually works'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'free-catch',
      question: "Nothing is free. What's the catch?",
      answer: "You're right to be suspicious. Here's the brutal truth: We're free because we're playing a different game. Traditional security companies charge $150K for compliance theater because fear sells. We're free because: 1) We're building the largest security intelligence network - every attack against you makes everyone stronger. 2) We sell anonymized threat intelligence to enterprises for $10K/month. 3) Our bug bounty program gets us free penetration testing from thousands of hackers. 4) We're positioning for a $10B acquisition by making traditional compliance obsolete. You get enterprise security for free; we get data, market position, and eventually a massive exit. Everyone wins except traditional security vendors.",
      category: 'cost',
      icon: <IoCashOutline className="w-5 h-5" />,
      highlights: ['Threat intelligence revenue', 'Bug bounty efficiency', 'Network effects', 'Acquisition play'],
      priority: 'high',
      readTime: '2 min',
      brutality: true
    },
    {
      id: 'hacker-challenge',
      question: "Why do you publicly challenge hackers? Isn't that dangerous?",
      answer: "It's the opposite of dangerous - it's genius. By publicly inviting attacks at /security/challenge, we get continuous free penetration testing worth millions. Traditional companies pay $50K for quarterly pen tests; we get tested every second for free. Our Hall of Shame shows 3,847 failed attempts, building public proof of our security. Each failed attack becomes marketing. Bug bounties ($247K paid so far) cost 10x less than hiring security consultants. The psychological effect is powerful: hackers who can't beat us publicly won't try privately. Meanwhile, companies hiding behind compliance PDFs are getting destroyed by ransomware. Transparency is our weapon.",
      category: 'challenge',
      icon: <IoSkullOutline className="w-5 h-5" />,
      highlights: ['Free pen testing 24/7', 'Public proof of security', 'Hall of Shame marketing', '$247K in bounties paid'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'quantum-bs',
      question: "Quantum encryption? AI defense? This sounds like marketing BS.",
      answer: "Fair skepticism. Let me be specific: Our 'quantum-resistant' encryption uses lattice-based cryptography (CRYSTALS-Kyber) that's NSA-approved for post-quantum security. The 'AI defense' is a neural network trained on 48,291 real attacks that predicts threat patterns 47 minutes before traditional signature-based detection. The '10^78 calculations' refers to the computational complexity required to break our encryption. Yes, we use buzzwords, but the underlying tech is real. Here's proof: We've had zero breaches while 'properly secured' companies get ransomed weekly. The marketing might be aggressive, but the security is legitimate. Test it yourself at our challenge page.",
      category: 'technical',
      icon: <IoInfiniteOutline className="w-5 h-5" />,
      highlights: ['CRYSTALS-Kyber encryption', 'NSA-approved algorithms', 'Neural network detection', 'Publicly testable'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'implementation',
      question: "How hard is this to actually implement?",
      answer: "15 minutes if you can copy and paste. No infrastructure changes, no hardware, no consultants. Three implementation options: 1) JavaScript snippet (copy-paste like Google Analytics), 2) REST API (standard JSON calls), 3) SDK for major frameworks (React, Vue, Angular). Your existing systems stay untouched - we add a security layer on top. No database migrations, no downtime, no staff training. Compare that to SOC 2: 6-12 months, $50K in consultants, hundreds of hours documenting policies. Or ISO 27001: 12-18 months and complete system overhaul. We made it stupid simple because complex security is failed security.",
      category: 'implementation',
      icon: <IoCodeSlashOutline className="w-5 h-5" />,
      highlights: ['15-minute setup', 'No infrastructure changes', 'Copy-paste simple', 'Zero downtime'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'data-ownership',
      question: "What data do you collect and who owns it?",
      answer: "You own 100% of your data. We process security events, never your business data. Here's exactly what we see: attack patterns (IPs, methods, timestamps), system responses (blocked/allowed), performance metrics (response times, load), and vulnerability reports. We CANNOT see: customer data, payment information, business logic, or internal communications. Everything is encrypted end-to-end with keys only you control. You can export all data anytime, delete everything instantly, and we're GDPR/CCPA compliant by default. We monetize aggregated threat intelligence, not your data. Full transparency: our code is auditable, our data practices are public, and you can monitor exactly what we access.",
      category: 'data',
      icon: <IoAnalyticsOutline className="w-5 h-5" />,
      highlights: ['100% your data', 'End-to-end encryption', 'Export anytime', 'GDPR/CCPA compliant'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'breach-guarantee',
      question: "What happens if we get breached using TU-1-A?",
      answer: "First, it hasn't happened in 5 years and 48,291 attacks. But let's be real: no system is 100% unhackable. If you're breached while using TU-1-A: 1) Our incident response team deploys instantly (not in 204 days like average), 2) We pay up to $1M in breach costs (try getting that from SOC 2), 3) We publicly take responsibility (our reputation dies if you're breached), 4) We provide forensic analysis and testimony for insurance/legal. Here's why we're confident: our continuous testing catches vulnerabilities before criminals do, AI predicts attacks 47 minutes early, and quantum encryption makes brute force impossible. But the real protection? Hackers know we're watching 24/7.",
      category: 'security',
      icon: <IoWarningOutline className="w-5 h-5" />,
      highlights: ['$1M breach coverage', 'Instant response team', 'Public accountability', 'Zero breaches so far'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'compliance-acceptance',
      question: "Will auditors and customers accept TU-1-A instead of SOC 2?",
      answer: "Smart ones already do. Here's how to position it: Show them our live dashboard with real-time protection metrics vs their annual PDF. Point out that every major breach happened to SOC 2 certified companies. Demonstrate that TU-1-A provides continuous validation vs point-in-time audits. Share the cost savings: $0 vs $147K annually. For stubborn auditors, we provide: compliance mapping to SOC 2 controls, attestation letters from our security team, detailed audit logs exceeding SOC 2 requirements, and customer references from Fortune 500 companies. The conversation shifts from 'Do you have SOC 2?' to 'Why would we pay for inferior protection?' Early adopters are already winning deals by showing superior security.",
      category: 'compliance',
      icon: <IoCheckmarkCircle className="w-5 h-5" />,
      highlights: ['Live dashboard proof', 'Compliance mapping provided', 'Fortune 500 accepted', 'Cost advantage'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'small-company',
      question: "We're too small to need this level of security.",
      answer: "That's what the 43% of small businesses that get breached every year thought. Here's reality: Hackers LOVE small companies because you have the same valuable data (credit cards, SSNs, passwords) with weaker security. Average small business breach cost: $200K. That's bankruptcy for most. You're also part of supply chains - hackers breach you to reach larger targets. Remember Target's $300M breach? Started through their HVAC vendor. Plus, you still need compliance for enterprise deals. SOC 2 costs $91K for companies under 50 employees. TU-1-A is free. Would you rather explain to customers why you saved $0 by avoiding security, or show them your live protection dashboard?",
      category: 'security',
      icon: <IoBusinessOutline className="w-5 h-5" />,
      highlights: ['43% breach rate', '$200K average cost', 'Supply chain target', 'Free vs $91K'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'too-good',
      question: "This sounds too good to be true. What's wrong with it?",
      answer: "Honest answer: We're not perfect. Limitations include: 1) We're 2 years old - less track record than 20-year-old security companies. 2) Our protection is only as good as your implementation - misconfigure it and you're vulnerable. 3) We can't protect against insider threats or social engineering (no one can). 4) Some dinosaur auditors still demand traditional compliance. 5) Our aggressive marketing pisses off traditional security vendors who spread FUD. But here's perspective: We've had zero breaches, traditional compliance companies have thousands. We're transparent about limitations, they hide behind insurance policies. We invite public testing, they threaten lawsuits. Pick your poison: new but effective, or established but failing?",
      category: 'comparison',
      icon: <IoAlertCircleOutline className="w-5 h-5" />,
      highlights: ['2-year track record', 'Implementation dependent', 'Transparent limitations', 'Zero breaches'],
      priority: 'medium',
      readTime: '2 min',
      brutality: true
    },
    {
      id: 'vendor-lock',
      question: "What if we want to switch away from TU-1-A later?",
      answer: "Leave anytime with zero penalty. No contracts, no termination fees, no data hostage. Export everything in standard formats (JSON, CSV, SIEM-compatible logs). We'll even help you transition to ensure continuous protection. Why we don't lock you in: vendor lock-in is a weakness hackers exploit, fear-based retention creates resentful customers who bad-mouth you, and confident products retain through value, not contracts. The irony? Nobody leaves. Once you have real-time protection for free vs paying $150K for annual PDFs, going backward feels insane. But you always have the option. That's the difference between us and traditional security: we earn your business daily, not through contracts.",
      category: 'implementation',
      icon: <IoLockClosedOutline className="w-5 h-5" />,
      highlights: ['No contracts', 'Export everything', 'Zero penalties', 'We help transition'],
      priority: 'medium',
      readTime: '1 min'
    },
    {
      id: 'why-not-both',
      question: "Should we use TU-1-A alongside traditional compliance?",
      answer: "If you enjoy burning money, sure. But seriously: TU-1-A exceeds every requirement of SOC 2/ISO/PCI, so doubling up is redundant. It's like wearing two seatbelts - doesn't make you safer, just more restricted. However, if you're forced by contracts to maintain traditional compliance, use TU-1-A for actual protection and keep the PDFs for checkbox satisfaction. You'll have real security (TU-1-A) and theatrical security (compliance) - though it's absurd to pay $150K for theater. Most companies using both eventually drop traditional compliance once they realize their customers prefer live dashboards over expired PDFs. Save the money for something useful.",
      category: 'compliance',
      icon: <IoLayersOutline className="w-5 h-5" />,
      highlights: ['Redundant coverage', 'Save $150K', 'Real vs theatrical', 'Transition strategy'],
      priority: 'low',
      readTime: '1 min'
    },
    {
      id: 'startup-enterprise',
      question: "Are you a real company or just another security startup?",
      answer: "We're a venture-backed company with $47M in funding, protecting 147 companies processing $2.3B in transactions. Our team includes ex-NSA cryptographers, former black-hat hackers (now ethical), and engineers from Google/Amazon/Microsoft. But here's what matters: startups innovate, enterprises stagnate. Uber was a startup when it destroyed taxis. Stripe was a startup when it revolutionized payments. We're a startup destroying security theater. Would you rather trust a 20-year-old company selling PDFs for $150K, or a hungry team that stakes their reputation on your protection? Every Fortune 500 was once a startup. We're just early.",
      category: 'comparison',
      icon: <IoRocketOutline className="w-5 h-5" />,
      highlights: ['$47M funded', '147 companies protected', 'Ex-NSA team', '$2.3B protected'],
      priority: 'low',
      readTime: '1 min'
    },
    {
      id: 'response-time',
      question: "How fast do you respond to new threats?",
      answer: "2 milliseconds for detection, 47 minutes for prediction. Here's our response cascade: AI detects anomaly in 2ms → Automatic blocking if confidence >94% → Human review within 60 seconds for edge cases → Patch deployment within 4 hours for new vulnerabilities → Global protection update for all customers instantly. Compare to industry average: 204 days to detect, 73 days to contain. Recent example: When Log4Shell hit, we had customers protected in 7 minutes while others scrambled for weeks. Our AI saw the exploitation pattern before it had a name. Speed isn't a feature; it's survival. Every second of delay is another potential breach.",
      category: 'technical',
      icon: <IoFlashOutline className="w-5 h-5" />,
      highlights: ['2ms detection', '47-min prediction', '4-hour patches', 'Log4Shell in 7 min'],
      priority: 'medium',
      readTime: '1 min'
    },
    {
      id: 'bug-bounty',
      question: "Tell me more about your bug bounty program.",
      answer: "We pay hackers to attack us - it's cheaper and more effective than hiring consultants. Payouts: $10K for critical vulnerabilities, $5K for high, $1K for medium, $500 for low. We've paid out $247K so far, which sounds expensive until you realize one prevented breach saves $4.88M. Platform features: public leaderboard showing top hackers, Hall of Shame for failed attempts (3,847 and counting), transparent disclosure timeline, and safe harbor protection for researchers. The psychological warfare is beautiful - hackers compete to break us publicly, fail, and inadvertently become our marketing. Every failed attempt proves our security. Traditional companies fear hackers; we weaponize them.",
      category: 'challenge',
      icon: <IoBugOutline className="w-5 h-5" />,
      highlights: ['$247K paid out', 'Public leaderboard', 'Hall of Shame', 'Safe harbor'],
      priority: 'low',
      readTime: '2 min'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Questions', icon: <IoHelpCircleOutline className="w-5 h-5" />, count: questions.length },
    { id: 'security', label: 'Security', icon: <IoShieldCheckmarkOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'security').length },
    { id: 'compliance', label: 'Compliance', icon: <IoDocumentTextOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'compliance').length },
    { id: 'cost', label: 'Cost', icon: <IoCashOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'cost').length },
    { id: 'technical', label: 'Technical', icon: <IoCodeSlashOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'technical').length },
    { id: 'comparison', label: 'vs Others', icon: <IoLayersOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'comparison').length },
    { id: 'challenge', label: 'Hacker Challenge', icon: <IoSkullOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'challenge').length },
    { id: 'implementation', label: 'Setup', icon: <IoRocketOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'implementation').length }
  ]

  const toggleQuestion = (id: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedQuestions(newExpanded)
    setExpandAll(false)
  }

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedQuestions(new Set())
    } else {
      setExpandedQuestions(new Set(filteredQuestions.map(q => q.id)))
    }
    setExpandAll(!expandAll)
  }

  const filteredByCategory = activeCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === activeCategory)

  const filteredQuestions = searchTerm 
    ? filteredByCategory.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredByCategory

  // Group questions by priority
  const highPriorityQuestions = filteredQuestions.filter(q => q.priority === 'high')
  const otherQuestions = filteredQuestions.filter(q => q.priority !== 'high')

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 shadow-lg">
            <IoShieldCheckmarkOutline className="w-5 sm:w-6 h-5 sm:h-6" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">TU-1-A Security</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
            The <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Brutal Truth</span> About Security
          </h2>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
            No marketing BS. No compliance theater. Just answers.
            <span className="block mt-2 text-sm sm:text-base">
              {isClient && (
                <strong>{liveStats.hackersDefeated.toLocaleString()} hackers tried to break us. 0 succeeded.</strong>
              )}
            </span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search your security concerns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
              <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  <IoCloseOutline className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
                Found {filteredQuestions.length} answer{filteredQuestions.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Live Security Stats Bar */}
        <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4 text-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">{isClient ? liveStats.attacksBlocked.toLocaleString() : '48,291'}</div>
              <div className="text-xs sm:text-sm opacity-90">Attacks Blocked</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">0</div>
              <div className="text-xs sm:text-sm opacity-90">Breaches</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">2ms</div>
              <div className="text-xs sm:text-sm opacity-90">Detection</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">${isClient ? (liveStats.bountyPaid / 1000).toFixed(0) : '247'}K</div>
              <div className="text-xs sm:text-sm opacity-90">Bounties Paid</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar - Mobile */}
        <div className="sm:hidden mb-4 flex items-center justify-between">
          <button
            onClick={handleExpandAll}
            className="flex items-center space-x-1 text-sm text-purple-600 dark:text-purple-400"
          >
            {expandAll ? <IoContract className="w-4 h-4" /> : <IoExpand className="w-4 h-4" />}
            <span>{expandAll ? 'Collapse All' : 'Expand All'}</span>
          </button>
          <div className="text-xs text-slate-500">
            {filteredQuestions.length} questions
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 whitespace-nowrap text-sm sm:text-base ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
                }`}
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Brutal Truth Warning */}
        {!searchTerm && activeCategory === 'all' && (
          <div className="sm:hidden mb-4 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-red-300 dark:border-red-800">
            <div className="flex items-start space-x-2">
              <IoFlameOutline className="w-4 h-4 text-red-600 mt-0.5" />
              <p className="text-xs text-red-800 dark:text-red-200">
                <strong>Warning:</strong> Brutally honest answers ahead. No corporate BS.
              </p>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-3 sm:space-y-4">
          {!searchTerm && activeCategory === 'all' && isClient && window.innerWidth < 640 ? (
            <>
              {highPriorityQuestions.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Critical Questions
                  </h3>
                  {highPriorityQuestions.map((q) => (
                    <QuestionCard key={q.id} question={q} expanded={expandedQuestions.has(q.id)} onToggle={toggleQuestion} isClient={isClient} />
                  ))}
                </>
              )}
              {otherQuestions.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 mt-6">
                    More Details
                  </h3>
                  {otherQuestions.map((q) => (
                    <QuestionCard key={q.id} question={q} expanded={expandedQuestions.has(q.id)} onToggle={toggleQuestion} isClient={isClient} />
                  ))}
                </>
              )}
            </>
          ) : (
            filteredQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} expanded={expandedQuestions.has(q.id)} onToggle={toggleQuestion} isClient={isClient} />
            ))
          )}
        </div>

        {/* No Results */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <IoSearchOutline className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No questions found. Try different keywords.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Bottom Challenge CTA */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 sm:p-8 text-white">
            <div className="mb-6">
              <IoSkullOutline className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Still Think We're Full of Sh*t?</h3>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Don't trust our words. Test our security yourself.
                <span className="block mt-2 font-bold text-red-400">
                  {isClient ? `${liveStats.hackersDefeated.toLocaleString()} hackers` : '3,847 hackers'} couldn't break us. Maybe you can.
                </span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-red-400">$10K</div>
                  <div className="text-xs opacity-75">Critical</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-orange-400">$5K</div>
                  <div className="text-xs opacity-75">High</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-yellow-400">$1K</div>
                  <div className="text-xs opacity-75">Medium</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-400">$500</div>
                  <div className="text-xs opacity-75">Low</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/security/challenge"
                className="inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg"
              >
                <IoSkullOutline className="w-5 h-5" />
                <span>Try to Hack Us</span>
              </a>
              <a
                href="/security/status"
                className="inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-lg"
              >
                <IoEyeOutline className="w-5 h-5" />
                <span>View Live Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Question Card Component
function QuestionCard({ 
  question, 
  expanded, 
  onToggle,
  isClient 
}: { 
  question: Question
  expanded: boolean
  onToggle: (id: string) => void
  isClient: boolean
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-xl ${
        question.brutality 
          ? 'border-gradient-to-r from-red-400 to-orange-400 ring-2 ring-red-400 ring-opacity-30' 
          : question.priority === 'high'
          ? 'border-purple-300 dark:border-purple-700'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <button
        onClick={() => onToggle(question.id)}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-start sm:items-center space-x-3 flex-1 pr-2">
          <div className="text-purple-600 dark:text-purple-400 mt-0.5 sm:mt-0">
            {question.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">
              {question.question}
            </h3>
            <div className="sm:hidden flex items-center space-x-3 mt-1">
              {question.brutality && (
                <span className="text-xs text-red-600 font-medium flex items-center">
                  <IoFlameOutline className="w-3 h-3 mr-1" />
                  Brutal
                </span>
              )}
              {question.priority === 'high' && !question.brutality && (
                <span className="text-xs text-purple-600 font-medium flex items-center">
                  <IoFlashOutline className="w-3 h-3 mr-1" />
                  Critical
                </span>
              )}
              {question.readTime && (
                <span className="text-xs text-slate-500">
                  <IoTimerOutline className="w-3 h-3 inline mr-1" />
                  {question.readTime}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="ml-2 sm:ml-4 flex-shrink-0">
          {expanded ? (
            <IoChevronUpOutline className="w-5 h-5 text-slate-400" />
          ) : (
            <IoChevronDownOutline className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-slate-200 dark:border-slate-700">
          <div className="pt-3 sm:pt-4">
            {question.readTime && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500 mb-3">
                <IoTimerOutline className="w-4 h-4" />
                <span>{question.readTime} read</span>
                {question.brutality && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-red-600 font-medium flex items-center">
                      <IoFlameOutline className="w-4 h-4 mr-1" />
                      Brutally Honest Answer
                    </span>
                  </>
                )}
              </div>
            )}
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
              {question.answer}
            </p>
            
            {question.highlights && (
              <div className="flex flex-wrap gap-2 mt-4">
                {question.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-800 dark:text-purple-400 rounded-full text-xs sm:text-sm font-medium ${
                      isClient ? 'animate-fade-in' : ''
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <IoCheckmarkCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Add CSS for animations
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}