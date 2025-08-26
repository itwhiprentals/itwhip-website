// app/components/hotel-solutions/ObjectionCrusher.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoHelpCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCarOutline,
  IoCashOutline,
  IoPersonOutline,
  IoConstructOutline,
  IoShieldCheckmarkOutline,
  IoBusinessOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoTimerOutline,
  IoInfiniteOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoStarOutline,
  IoThunderstormOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoTrendingUpOutline,
  IoLockClosedOutline,
  IoExpand,
  IoContract,
  IoInformationCircleOutline,
  IoFlashOutline,
  IoLayersOutline,
  IoCloudOutline,
  IoAnalyticsOutline,
  IoLeafOutline,
  IoGlobeOutline,
  IoServerOutline,
  IoRocketOutline
} from 'react-icons/io5'

interface Question {
  id: string
  question: string
  answer: string
  category: 'platform' | 'availability' | 'payment' | 'guest' | 'integration' | 'compliance' | 'vip' | 'insurance'
  icon: React.ReactNode
  highlights?: string[]
  priority?: 'high' | 'medium' | 'low'
  readTime?: string
}

export default function ObjectionCrusher() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [expandAll, setExpandAll] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const questions: Question[] = [
    {
      id: 'platform-superiority',
      question: "Why choose ItWhip over existing solutions or building our own?",
      answer: "ItWhip is the hospitality industry's first complete guest journey platform - think Stripe for hotel operations. We've unified transportation, reservations, compliance, and revenue optimization into one system. You couldn't build this for less than $5M and 3 years. We handle everything: facilitating transportation through our verified partner network, generating new revenue streams (average $67K/month), automating compliance tracking, and providing real-time analytics. Our 'Try Us Certified' security standard means we're so confident, we invite hackers to test us publicly. Hotels using ItWhip see 23% more direct bookings, eliminate transportation complaints, and turn a cost center into a profit center.",
      category: 'platform',
      icon: <IoRocketOutline className="w-5 h-5" />,
      highlights: ['Complete platform solution', '$67K/month revenue', 'Try Us Certified security', 'Impossible to replicate'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'try-us-certification',
      question: "What is 'Try Us Certified' and why is it better than traditional compliance?",
      answer: "We created our own security standard because we exceed what traditional certifications measure. 'Try Us Certified' is live, transparent security verification. Instead of paying $50K for a SOC 2 audit that's outdated in months, we publicly display our security metrics: 1,847 penetration attempts, 0 successful breaches. Every hotel gets a public security page showing their protection status. We invite ethical hackers to test our defenses with bounties up to $10,000. Your compliance dashboard shows real-time protection of guest data, payment processing, and operational systems. This isn't compliance theater - it's actual security you can verify yourself. Traditional certifications check boxes; we stop breaches.",
      category: 'compliance',
      icon: <IoShieldCheckmarkOutline className="w-5 h-5" />,
      highlights: ['Live security metrics', 'Public verification', '$10K bug bounties', 'Real protection not theater'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'transportation-coverage',
      question: "How do you ensure transportation is always available for our guests?",
      answer: "Our platform connects with multiple transportation sources through our proprietary Partner Network Protocol. We aggregate availability from verified operators, rideshare platforms, and premium services into one unified pool. Our AI predicts demand 47 minutes in advance using your reservation data and arrival patterns. The system automatically adjusts supply through surge protection protocols and preferential partnerships. We maintain redundancy through multiple provider types, ensuring coverage even during peak events. Real result: 99.7% availability rate with average pickup time under 4 minutes. No single point of failure, always multiple options.",
      category: 'availability',
      icon: <IoCarOutline className="w-5 h-5" />,
      highlights: ['99.7% availability', 'Multi-source coverage', '47-min prediction', 'Under 4-min pickup'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'revenue-generation',
      question: "How exactly does a hotel make money from transportation?",
      answer: "Simple: every ride booked through your platform generates commission. Here's the math: Your 250 rooms at 80% occupancy = 200 occupied rooms daily. 30% need transportation = 60 rides/day. Average fare $45 x 30% commission = $13.50 per ride. 60 rides x $13.50 x 30 days = $24,300/month minimum. But it gets better - you're also saving money by eliminating shuttle operations ($15K/month), reducing front desk time on transportation issues (10 hours/week), and avoiding surge pricing for VIP guests. Total financial impact: typically $67K/month in new revenue plus eliminated costs. ROI in 42 days.",
      category: 'payment',
      icon: <IoCashOutline className="w-5 h-5" />,
      highlights: ['$24K+ monthly revenue', 'Eliminate shuttle costs', '42-day ROI', 'Automatic commission'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'legal-compliance',
      question: "How does ItWhip handle regulatory and legal compliance?",
      answer: "We've built compliance into the platform's DNA. Our system automatically tracks and reports everything required by law: transportation accessibility (ADA), data privacy (GDPR/CCPA), financial records (SOX if applicable), and operational metrics. But here's what matters: you're legally protected because partner operators carry their own insurance and liability. You're facilitating, not providing transportation. Our legal structure ensures complete separation between your hotel and any transportation liability. Every transaction is logged, encrypted, and audit-ready. When regulations change, our platform updates automatically. You focus on hospitality; we handle compliance.",
      category: 'compliance',
      icon: <IoDocumentTextOutline className="w-5 h-5" />,
      highlights: ['Automatic compliance', 'Zero liability', 'Audit-ready', 'Auto-updates for new laws'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'integration-simplicity',
      question: "How difficult is it to integrate with our existing systems?",
      answer: "15-minute integration, seriously. We've pre-built connections for every major hotel system - your PMS, channel manager, booking engine, and payment processor. Three ways to integrate: API (for your tech team), JavaScript widget (copy-paste), or managed integration (we do it for you). No hardware, no infrastructure changes, no staff training. Your existing systems remain untouched; we simply add a layer that unifies everything. Most hotels go live the same day they sign up. We handle all the complex backend connections - you just see one simple dashboard. If you can copy and paste, you can integrate ItWhip.",
      category: 'integration',
      icon: <IoConstructOutline className="w-5 h-5" />,
      highlights: ['15-minute setup', 'No hardware needed', 'Works with any PMS', 'Same-day launch'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'guest-experience',
      question: "What happens when a guest has an issue with transportation?",
      answer: "Three-layer resolution system ensures your staff never deals with transportation problems. Layer 1: Partner operators handle their own customer service. Layer 2: Our 24/7 support team coordinates resolution. Layer 3: Automated backup protocols trigger instantly. Guest calls support? They reach our team, not yours. Driver late? System automatically dispatches backup. Payment issue? Resolved without hotel involvement. Your dashboard shows everything for transparency, but you have zero operational burden. Average resolution time: 3 minutes. Guest satisfaction rate: 94%. Your front desk focuses on hospitality, not transportation headaches.",
      category: 'guest',
      icon: <IoPersonOutline className="w-5 h-5" />,
      highlights: ['24/7 support team', '3-minute resolution', 'Zero hotel burden', '94% satisfaction'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'vip-treatment',
      question: "How does the platform handle VIP and special needs guests?",
      answer: "VIP handling is automated and sophisticated. Your PMS flags trigger our Premium Guest Protocol: platform prioritizes luxury vehicle operators, ensures senior driver assignment (5+ years experience), guarantees pre-arrival positioning, and enables white-glove service standards. VIPs can save preferred operators, access priority support, and receive detailed trip summaries. Special needs? Platform connects with ADA-compliant operators, ensures wheelchair accessibility, and tracks accommodation requirements. Everything logged for compliance. The beauty: it's automatic. Flag a guest as VIP in your PMS, and the platform handles everything else. No manual coordination needed.",
      category: 'vip',
      icon: <IoStarOutline className="w-5 h-5" />,
      highlights: ['Automatic VIP detection', 'Luxury vehicles', 'ADA compliant', 'Zero manual work'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'surge-protection',
      question: "How do you protect guests from surge pricing?",
      answer: "Multi-strategy surge defense system. First, our predictive AI prevents surge by pre-positioning supply before demand spikes. Second, we aggregate multiple sources - when one surges, others might not. Third, our volume partnerships include surge cap agreements. Fourth, for VIPs and special events, we lock in flat rates in advance. Result: guests save average $89 per airport trip during typical surge periods. While standard platforms might show 5x surge, our system finds alternatives at normal rates. The platform transparently shows all options with real-time pricing. You decide the guest experience you want to provide.",
      category: 'availability',
      icon: <IoInfiniteOutline className="w-5 h-5" />,
      highlights: ['Predictive prevention', 'Multi-source options', 'Save $89 average', 'VIP flat rates'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'operator-quality',
      question: "How do you ensure quality from transportation providers?",
      answer: "Strict platform admission standards. Every operator must provide proof of commercial insurance, pass comprehensive background checks, maintain 4.8+ ratings, and complete hospitality service training. Our Quality Assurance System monitors every ride through automated feedback loops, real-time performance tracking, and mystery rider audits. Operators below standards get one warning, then removal. We only work with the top 20% of available operators. Your brand is protected by standards higher than luxury hotels require for their own staff. Quality isn't hoped for; it's enforced through technology.",
      category: 'guest',
      icon: <IoPersonOutline className="w-5 h-5" />,
      highlights: ['Top 20% only', '4.8+ required', 'Mystery audits', 'One warning policy'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'data-ownership',
      question: "Who owns and controls our guest data?",
      answer: "You own 100% of your data, period. ItWhip operates as a data processor, not owner. Every guest record, transaction detail, and analytics insight belongs to your hotel. Export everything anytime in standard formats. We never sell, share, or monetize your data. Our infrastructure provides military-grade encryption, isolated data storage, and complete audit trails. Use the insights for your marketing, operations, and strategic decisions. This is YOUR business intelligence powering YOUR competitive advantage. We're just the technology layer that makes it possible.",
      category: 'platform',
      icon: <IoAnalyticsOutline className="w-5 h-5" />,
      highlights: ['100% your data', 'Export anytime', 'Never shared', 'Military encryption'],
      priority: 'medium',
      readTime: '1 min'
    },
    {
      id: 'insurance-liability',
      question: "What about insurance and liability protection?",
      answer: "Complete liability separation protects your hotel. Transportation providers maintain their own commercial insurance (minimum $1M required). Our platform carries comprehensive technology insurance covering data breaches, system failures, and operational errors. But here's the key: your hotel has ZERO transportation liability because you're not providing transportation - you're facilitating connections through our platform. This legal structure has been tested and proven. Compare this to hotel shuttles where YOU carry all liability, facing potential nuclear verdicts averaging $31M. With ItWhip, transportation liability stays with the operators, not your hotel.",
      category: 'insurance',
      icon: <IoShieldCheckmarkOutline className="w-5 h-5" />,
      highlights: ['Zero hotel liability', 'Operators insured', 'Legal separation', 'Nuclear verdict protection'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'booking-enhancement',
      question: "How does this help with direct bookings vs OTAs?",
      answer: "Transportation becomes your secret weapon against OTAs. Add 'Free Airport Transfer' or 'Includes Premium Rides' to your direct booking site - something OTAs can't match. Our white-label integration means it appears as YOUR service. Result: 23% average increase in direct bookings. Create exclusive packages: 'Park & Fly', 'Romance Package with Private Car', 'Business Traveler Bundle'. The transportation component adds $150+ perceived value at minimal cost. Guests book direct to get the transportation benefit. You save 15-25% OTA commissions AND earn transportation revenue. Double win against OTA dominance.",
      category: 'integration',
      icon: <IoBusinessOutline className="w-5 h-5" />,
      highlights: ['+23% direct bookings', 'OTA differentiation', 'Package creation', 'Save commissions'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'contract-flexibility',
      question: "What if we need to modify or cancel the service?",
      answer: "No lock-in, ever. Month-to-month terms with 30-day notice for any changes. No setup fees, no cancellation penalties, no minimums. Pause during renovations, scale down in off-season, upgrade for events - complete flexibility. Add or remove features instantly through your dashboard. While most hotels never leave (they're earning $67K/month), you maintain complete control. We earn your business through value, not contracts. This isn't vendor lock-in; it's a partnership that works because it works, not because you're stuck.",
      category: 'payment',
      icon: <IoDocumentTextOutline className="w-5 h-5" />,
      highlights: ['Month-to-month', 'No penalties', 'Pause anytime', 'Full flexibility'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'competitive-moat',
      question: "What stops our competitors from copying this advantage?",
      answer: "First-mover advantages create lasting competitive moats. Early adopters get locked-in preferential rates, priority access to new features, and input on platform development. But here's the real moat: data accumulation. Every day you're building transportation intelligence your competitors don't have. You know guest patterns, optimal pricing, and demand cycles. By the time competitors join, you've optimized operations they're just starting. Plus, market density controls mean once we reach capacity in your area, competitors join waiting lists. Your early move blocks their access.",
      category: 'vip',
      icon: <IoWarningOutline className="w-5 h-5" />,
      highlights: ['First-mover advantage', 'Data accumulation', 'Market protection', 'Competitor blocking'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'platform-reliability',
      question: "How reliable is the ItWhip platform infrastructure?",
      answer: "Enterprise-grade infrastructure with 99.99% uptime SLA. Built on distributed cloud architecture with automatic failover, real-time backups, and elastic scaling. Our platform handles millions of transactions daily across hundreds of hotels. 24/7 monitoring by our Network Operations team. Response times under 200ms globally. But don't trust our words - check our public status page showing real-time performance. Our 'Try Us Certified' security means we're so confident, we invite anyone to test our systems. 1,847 attempted breaches, zero successful. That's the reliability your hotel operations demand.",
      category: 'platform',
      icon: <IoServerOutline className="w-5 h-5" />,
      highlights: ['99.99% uptime', 'Under 200ms response', '24/7 monitoring', 'Public status page'],
      priority: 'medium',
      readTime: '1 min'
    },
    {
      id: 'emergency-weather',
      question: "What happens during extreme weather or emergency events?",
      answer: "Emergency protocols activate automatically. Our system monitors weather patterns and event schedules, triggering Enhanced Coverage Mode when needed. All partner operators receive alerts about increased demand. The platform prioritizes hotels based on need, connects with operators equipped for conditions (4WD vehicles for snow, high-clearance for flooding), and maintains surge protection even during emergencies. Historical proof: during Phoenix's last major storm, our partner hotels maintained 91% service availability while others showed 'no cars available'. Your guests aren't stranded when they need transportation most.",
      category: 'availability',
      icon: <IoThunderstormOutline className="w-5 h-5" />,
      highlights: ['Auto emergency mode', 'Weather monitoring', '91% storm availability', 'Surge protection maintained'],
      priority: 'low',
      readTime: '2 min'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Questions', icon: <IoHelpCircleOutline className="w-5 h-5" />, count: questions.length },
    { id: 'platform', label: 'Platform Power', icon: <IoLayersOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'platform').length },
    { id: 'availability', label: 'Service Coverage', icon: <IoCarOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'availability').length },
    { id: 'compliance', label: 'Try Us Certified', icon: <IoShieldCheckmarkOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'compliance').length },
    { id: 'payment', label: 'Revenue & Terms', icon: <IoCashOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'payment').length },
    { id: 'guest', label: 'Guest Experience', icon: <IoPersonOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'guest').length },
    { id: 'integration', label: 'Integration', icon: <IoConstructOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'integration').length },
    { id: 'vip', label: 'VIP & Special', icon: <IoStarOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'vip').length },
    { id: 'insurance', label: 'Insurance', icon: <IoShieldCheckmarkOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'insurance').length }
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

  // Group questions by priority for mobile
  const highPriorityQuestions = filteredQuestions.filter(q => q.priority === 'high')
  const otherQuestions = filteredQuestions.filter(q => q.priority !== 'high')

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 shadow-lg">
            <IoShieldCheckmarkOutline className="w-5 sm:w-6 h-5 sm:h-6" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Try Us Certified™</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
            The <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Platform</span> That Owns Its Space
          </h2>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
            We built the Stripe of hospitality. One platform, total control.
            <span className="block mt-2 text-sm sm:text-base">
              <strong>1,847 hackers tried to break us. 0 succeeded. Try us.</strong>
            </span>
          </p>
        </div>

        {/* Search Bar - Mobile Optimized */}
        <div className="mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                Found {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Security Metrics Bar */}
        <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">1,847</div>
              <div className="text-xs sm:text-sm opacity-90">Breach Attempts</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">0</div>
              <div className="text-xs sm:text-sm opacity-90">Successful</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">99.99%</div>
              <div className="text-xs sm:text-sm opacity-90">Uptime</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">$10K</div>
              <div className="text-xs sm:text-sm opacity-90">Bug Bounty</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar - Mobile */}
        <div className="sm:hidden mb-4 flex items-center justify-between">
          <button
            onClick={handleExpandAll}
            className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400"
          >
            {expandAll ? <IoContract className="w-4 h-4" /> : <IoExpand className="w-4 h-4" />}
            <span>{expandAll ? 'Collapse All' : 'Expand All'}</span>
          </button>
          <div className="text-xs text-slate-500">
            {filteredQuestions.length} questions
          </div>
        </div>

        {/* Category Filter - Mobile Scrollable */}
        <div className="mb-6 sm:mb-8">
          <div className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 whitespace-nowrap text-sm sm:text-base ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
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

        {/* Priority Indicator - Mobile Only */}
        {!searchTerm && activeCategory === 'all' && (
          <div className="sm:hidden mb-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-amber-300 dark:border-amber-800">
            <div className="flex items-start space-x-2">
              <IoFlashOutline className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Most Critical:</strong> High priority questions address your biggest concerns first
              </p>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-3 sm:space-y-4">
          {/* High Priority Questions First on Mobile */}
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
                    Additional Details
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
            <p className="text-slate-600 dark:text-slate-400">No questions found matching your search.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Bottom CTA - The Challenge */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 sm:p-8 text-white">
            <div className="mb-6">
              <IoShieldCheckmarkOutline className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">The Try Us Challenge</h3>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                We don't hide behind expensive certifications.
                <span className="block mt-2 font-bold text-green-400">Our security is so good, we dare you to break it.</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold">$10,000</div>
                  <div className="text-xs opacity-75">Critical Bug</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold">$5,000</div>
                  <div className="text-xs opacity-75">High Severity</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold">$1,000</div>
                  <div className="text-xs opacity-75">Medium</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold">$500</div>
                  <div className="text-xs opacity-75">Low</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/security"
                className="inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg"
              >
                <IoLockClosedOutline className="w-5 h-5" />
                <span>Test Our Security</span>
              </a>
              <a
                href="/portal/login"
                className="inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-lg"
              >
                <IoBusinessOutline className="w-5 h-5" />
                <span>Start Earning $67K/mo</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Separate component for question cards
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
        question.priority === 'high' 
          ? 'border-gradient-to-r from-amber-400 to-orange-400 ring-2 ring-amber-400 ring-opacity-30' 
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <button
        onClick={() => onToggle(question.id)}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-start sm:items-center space-x-3 flex-1 pr-2">
          <div className="text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-0">
            {question.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">
              {question.question}
            </h3>
            {/* Mobile: Show priority and read time */}
            <div className="sm:hidden flex items-center space-x-3 mt-1">
              {question.priority === 'high' && (
                <span className="text-xs text-amber-600 font-medium flex items-center">
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
            {/* Desktop: Show read time */}
            {question.readTime && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500 mb-3">
                <IoTimerOutline className="w-4 h-4" />
                <span>{question.readTime} read</span>
              </div>
            )}
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {question.answer}
            </p>
            
            {question.highlights && (
              <div className="flex flex-wrap gap-2 mt-4">
                {question.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-400 rounded-full text-xs sm:text-sm font-medium ${
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

// Add CSS for fade-in animation
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