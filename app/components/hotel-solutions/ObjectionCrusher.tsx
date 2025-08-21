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
  IoFlashOutline
} from 'react-icons/io5'

interface Question {
  id: string
  question: string
  answer: string
  category: 'availability' | 'payment' | 'guest' | 'integration' | 'vip' | 'insurance'
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
      id: 'driver-availability',
      question: "How can you guarantee drivers will always be available?",
      answer: "Our Instant Ride™ technology uses predictive AI that analyzes flight data, hotel occupancy, and historical patterns to pre-position drivers 47 minutes before demand. We maintain a network of 847+ drivers in Phoenix alone, with surge-protected rates that ensure availability even during peak times. Unlike Uber/Lyft, our drivers are dedicated to hotel pickups with guaranteed earnings, so they prioritize your guests. We also have overflow agreements with three backup fleets.",
      category: 'availability',
      icon: <IoCarOutline className="w-5 h-5" />,
      highlights: ['847+ drivers', '47-minute prediction', 'Surge protection', 'Backup fleets'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'payment-reliability',
      question: "How do we know we'll get paid reliably?",
      answer: "Payment is automatic and guaranteed. Every ride generates instant commission credited to your account, with weekly automated ACH transfers to your bank. Our system integrates with your PMS for automatic room charging, eliminating payment friction. We're backed by $50M in funding, maintain SOC 2 compliance, and carry a $100M insurance policy. You can track every penny in real-time through your dashboard, with detailed reports for accounting. No invoicing, no chasing payments - just automatic revenue.",
      category: 'payment',
      icon: <IoCashOutline className="w-5 h-5" />,
      highlights: ['Weekly ACH transfers', 'PMS integration', 'SOC 2 compliant', '$100M insurance'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'guest-complaints',
      question: "What happens when a guest complains about a driver or ride?",
      answer: "We handle 100% of guest service issues through our 24/7 support team, so your staff never deals with transportation complaints. Every issue is resolved within 15 minutes, with automatic compensation protocols: full refund for any delay over 10 minutes, immediate backup driver dispatch if needed, and direct communication with your guest. Our driver rating system (4.8+ required) and continuous training ensure issues are rare. You get full visibility through your dashboard but zero responsibility for resolution.",
      category: 'guest',
      icon: <IoPersonOutline className="w-5 h-5" />,
      highlights: ['24/7 support', '15-minute resolution', 'Automatic compensation', '4.8+ driver rating'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'integration-complexity',
      question: "How complex is the integration with our existing systems?",
      answer: "Integration takes 15 minutes, not months. We support all major PMS systems (Opera, Amadeus, Sabre, etc.) with pre-built connectors. Three options: REST API (5 lines of code), JavaScript SDK (npm install), or no-code widget (copy-paste HTML). Your IT team gets a dedicated integration engineer, sandbox environment for testing, and 24/7 technical support. Most hotels go live the same day they sign up. No hardware, no training, no disruption to operations.",
      category: 'integration',
      icon: <IoConstructOutline className="w-5 h-5" />,
      highlights: ['15-minute setup', 'All PMS systems', 'No hardware needed', 'Same-day launch'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'vip-handling',
      question: "How do you handle our VIP and executive guests?",
      answer: "VIP handling is automated and sophisticated. Your PMS flags trigger our Executive Protocol: premium vehicles only (Audi, BMW, Mercedes), senior drivers (5+ years, 4.9+ rating), priority dispatch (pre-arrival positioning), and white-glove service standards. VIPs get a dedicated support line, ability to request specific drivers, and detailed trip reports for their assistants. The hotel dashboard shows VIP rides separately for special attention. Many hotels report this feature alone justifies the entire platform.",
      category: 'vip',
      icon: <IoStarOutline className="w-5 h-5" />,
      highlights: ['Premium vehicles', 'Senior drivers only', 'Pre-arrival positioning', 'Dedicated support'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'insurance-coverage',
      question: "What about insurance and liability coverage?",
      answer: "You have ZERO liability exposure. Every ride is covered by our $100M commercial policy with zero deductible to hotels. This includes general liability, auto liability, excess umbrella, cyber liability, and errors & omissions. Your hotel is named as additional insured at no cost. Compare this to shuttle operations where YOU carry all liability - nuclear verdicts averaging $10M+. We handle all claims, litigation, and regulatory compliance. Your legal team will love this: complete indemnification, hold harmless agreement, and waiver of subrogation.",
      category: 'insurance',
      icon: <IoShieldCheckmarkOutline className="w-5 h-5" />,
      highlights: ['$100M coverage', 'Zero hotel liability', 'Additional insured status', 'Complete indemnification'],
      priority: 'high',
      readTime: '2 min'
    },
    {
      id: 'surge-pricing',
      question: "What about surge pricing during busy periods?",
      answer: "We NEVER surge price. Ever. Your guests pay the same rate at 3 AM on New Year's Eve as they do on a Tuesday afternoon. This is possible because our predictive positioning eliminates supply-demand imbalances. While Uber might charge 5x surge ($150 for a $30 ride), we maintain flat rates. This price protection is built into our contracts and system - it's impossible for surge pricing to occur. Your guests save an average of $89 per airport trip compared to surge periods.",
      category: 'availability',
      icon: <IoInfiniteOutline className="w-5 h-5" />,
      highlights: ['Zero surge ever', 'Flat rates 24/7', 'Saves $89/trip', 'Contract guaranteed'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'driver-quality',
      question: "How do you ensure driver quality and professionalism?",
      answer: "Our driver standards exceed any competitor. Requirements: 5+ years experience, 4.8+ rating maintenance, background checks (criminal, DMV, drug), hospitality training certification, professional appearance standards, and vehicle inspections every 30 days. Drivers earn 40% more with us, attracting the best professionals. Real-time monitoring tracks speed, routes, and guest interactions. One complaint below standards = retraining. Two = removal. Your brand is protected by the industry's highest driver standards.",
      category: 'guest',
      icon: <IoPersonOutline className="w-5 h-5" />,
      highlights: ['5+ years required', 'Hospitality certified', 'Background checked', 'Real-time monitoring'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'booking-integration',
      question: "Does this interfere with our direct booking strategy?",
      answer: "It enhances it. ItWhip is YOUR platform, white-labeled with your brand. When guests book direct on your website, they see included premium transportation - a $150+ value that OTAs can't match. This drives direct bookings up 23% on average. The transportation booking widget embeds in your booking flow, increasing conversion 18%. You can even create package deals: 'Book 2 nights, get airport transfers free.' OTAs hate us because we make direct booking more attractive than their channels.",
      category: 'integration',
      icon: <IoBusinessOutline className="w-5 h-5" />,
      highlights: ['White-label option', '+23% direct bookings', 'Embedded widget', 'Package creation'],
      priority: 'medium',
      readTime: '2 min'
    },
    {
      id: 'weather-events',
      question: "What happens during extreme weather or emergency events?",
      answer: "Our Emergency Response Protocol activates automatically during severe conditions. Extended fleet activation brings 3x normal drivers online. Hazard pay ensures availability without surge pricing. Four-wheel drive vehicle priority for snow/flooding. Direct coordination with emergency services and airports. Your hotel gets priority routing and dedicated dispatch. During Phoenix's last major storm, we maintained 2.3-minute average pickup times while Uber showed 'No Cars Available.' Your guests are never stranded.",
      category: 'availability',
      icon: <IoThunderstormOutline className="w-5 h-5" />,
      highlights: ['3x driver activation', 'No surge pricing', '4WD priority', 'Emergency coordination'],
      priority: 'low',
      readTime: '2 min'
    },
    {
      id: 'contract-terms',
      question: "What if we want to cancel or change services?",
      answer: "Complete flexibility, always. Month-to-month terms with 30-day cancellation notice. No penalties, no fees, no minimums. Pause service for renovations or low season. Adjust commission rates based on volume. Add/remove features instantly. Change integration methods anytime. This isn't a vendor lock-in - it's a partnership. Most hotels never leave because they're earning $67,000/month, but you always have the option. We earn your business every single day.",
      category: 'payment',
      icon: <IoDocumentTextOutline className="w-5 h-5" />,
      highlights: ['Month-to-month', '30-day cancellation', 'No penalties', 'Pause anytime'],
      priority: 'high',
      readTime: '1 min'
    },
    {
      id: 'competitor-advantage',
      question: "What stops our competitors from using this too?",
      answer: "Geographic exclusivity for early adopters. We limit hotels per zone to maintain service quality. First movers get preferred status: locked-in commission rates (competitors pay more later), priority driver allocation, exclusive territory rights, and custom feature development input. Once we hit capacity in Phoenix (only 3 spots left), new hotels go on a waiting list. Your competitive advantage is protected by our growth limits. Lock out your competition now.",
      category: 'vip',
      icon: <IoWarningOutline className="w-5 h-5" />,
      highlights: ['Geographic exclusivity', 'Locked-in rates', 'Only 3 spots left', 'Competition lock-out'],
      priority: 'high',
      readTime: '1 min'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Questions', icon: <IoHelpCircleOutline className="w-5 h-5" />, count: questions.length },
    { id: 'availability', label: 'Driver Availability', icon: <IoCarOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'availability').length },
    { id: 'payment', label: 'Payment & Terms', icon: <IoCashOutline className="w-5 h-5" />, count: questions.filter(q => q.category === 'payment').length },
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
          <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-red-300 dark:border-red-800">
            <IoWarningOutline className="w-5 sm:w-6 h-5 sm:h-6" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Objection Crusher</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
            The <span className="text-red-600">Hard Questions</span> Hotels Ask
          </h2>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
            Your concerns are valid. 
            <span className="block mt-1 sm:inline sm:mt-0">Here are detailed answers to the questions that keep hotel executives up at night.</span>
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
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
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
          <div className="sm:hidden mb-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-300 dark:border-amber-800">
            <div className="flex items-start space-x-2">
              <IoFlashOutline className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Most Asked:</strong> Questions marked with high priority are addressed first
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
                    Most Important
                  </h3>
                  {highPriorityQuestions.map((q) => (
                    <QuestionCard key={q.id} question={q} expanded={expandedQuestions.has(q.id)} onToggle={toggleQuestion} isClient={isClient} />
                  ))}
                </>
              )}
              {otherQuestions.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 mt-6">
                    Additional Questions
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

        {/* Bottom CTA - Mobile Optimized */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Still Have Questions?</h3>
            <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
              Get answers from our hotel success team. 
              <span className="block mt-1 sm:inline sm:mt-0">Real humans who understand your business.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/demo"
                className="inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-100 transition-all"
              >
                <IoCallOutline className="w-5 h-5" />
                <span>Schedule 15-Min Call</span>
              </a>
              <a
                href="/portal/login"
                className="inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-3 bg-blue-800 text-white rounded-lg font-bold hover:bg-blue-900 transition-all"
              >
                <IoBusinessOutline className="w-5 h-5" />
                <span className="hidden sm:inline">Check Your Hotel Status</span>
                <span className="sm:hidden">Check Status</span>
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
      className={`bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl ${
        question.priority === 'high' ? 'ring-2 ring-amber-400 ring-opacity-50' : ''
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
                  Most Asked
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
                    className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs sm:text-sm font-medium ${
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