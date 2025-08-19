// app/private-club/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoCheckmarkCircle,
  IoLockClosedOutline,
  IoRibbonOutline,
  IoTrophyOutline,
  IoStarOutline,
  IoGolfOutline,
  IoAirplaneOutline,
  IoBoatOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoHomeOutline,
  IoDiamondOutline,
  IoPeopleOutline,
  IoTicketOutline,
  IoWalletOutline,
  IoFlashOutline
} from 'react-icons/io5'

export default function PrivateClubPage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const membershipBenefits = [
    {
      icon: IoFlashOutline,
      title: 'No Surge Pricing Ever',
      description: 'Members enjoy protected rates 24/7, even during peak events, holidays, and high-demand periods.'
    },
    {
      icon: IoCarOutline,
      title: 'Luxury Vehicle Guarantee',
      description: 'Every ride in a premium vehicle less than 3 years old. Tesla, Mercedes, BMW standard.'
    },
    {
      icon: IoStarOutline,
      title: 'Priority Service',
      description: 'Average pickup time under 4 minutes. Members always get priority over public services.'
    },
    {
      icon: IoWalletOutline,
      title: 'Transparent Member Pricing',
      description: 'Fixed, distance-based rates. No surprises, no dynamic pricing, no hidden fees.'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Vetted Professional Drivers',
      description: 'All drivers background-checked and trained in hospitality standards.'
    },
    {
      icon: IoTicketOutline,
      title: 'Seamless Billing',
      description: 'Charge to room or use pre-loaded travel credits. No payment hassles.'
    }
  ]

  const comparisonExamples = [
    {
      organization: 'Country Clubs',
      service: 'Golf Cart Transportation',
      membership: 'Private Members Only',
      icon: IoGolfOutline,
      description: 'Provide on-property transportation exclusively to members'
    },
    {
      organization: 'Airlines',
      service: 'Lounge Shuttle Service',
      membership: 'Elite Status Members',
      icon: IoAirplaneOutline,
      description: 'Operate private shuttles between terminals for club members'
    },
    {
      organization: 'Yacht Clubs',
      service: 'Marina Transport',
      membership: 'Club Members Only',
      icon: IoBoatOutline,
      description: 'Provide water taxis and shore transportation to members'
    },
    {
      organization: 'Private Resorts',
      service: 'All-Inclusive Transport',
      membership: 'Resort Guests Only',
      icon: IoHomeOutline,
      description: 'Include unlimited transportation in membership packages'
    }
  ]

  const membershipTiers = [
    {
      name: 'Automatic Membership',
      price: 'Included',
      icon: IoSparklesOutline,
      features: [
        'Activated with partner hotel booking',
        'No surge pricing protection',
        'Luxury vehicle access',
        'Member-only rates',
        'Priority dispatch'
      ],
      color: 'amber'
    },
    {
      name: 'Premium Membership',
      price: 'Select Hotels',
      icon: IoDiamondOutline,
      features: [
        'All Automatic benefits',
        'Tesla/Mercedes guarantee',
        'VIP driver team',
        'Complimentary wait time',
        'Concierge services'
      ],
      color: 'purple'
    },
    {
      name: 'Executive Membership',
      price: 'Invitation Only',
      icon: IoTrophyOutline,
      features: [
        'All Premium benefits',
        'Dedicated account manager',
        'Custom preferences',
        'Multi-city access',
        'Corporate billing'
      ],
      color: 'blue'
    }
  ]

  const faqs = [
    {
      question: 'How do I become a member?',
      answer: 'Membership is automatically granted when you book a stay at any of our 487+ partner hotels. Your membership remains active for the duration of your stay and 24 hours after checkout.'
    },
    {
      question: 'Why is membership required?',
      answer: 'As a private travel club, we provide exclusive services to our members only. This allows us to maintain premium standards, guarantee luxury vehicles, and offer member-protected pricing without surge rates.'
    },
    {
      question: 'Is this different from Uber or Lyft?',
      answer: 'Yes, fundamentally different. We are a private membership club providing exclusive transportation benefits to hotel guests. Public ride-sharing serves anyone; we serve members only.'
    },
    {
      question: 'Can I use the service without booking a hotel?',
      answer: 'Our transportation benefits are exclusively for hotel guests at partner properties. This exclusivity allows us to maintain premium service standards and member-only pricing.'
    },
    {
      question: 'How are you able to avoid surge pricing?',
      answer: 'As a private club serving a limited member base, we can maintain stable, protected rates. We\'re not subject to public market dynamics that drive surge pricing.'
    },
    {
      question: 'Is this legal?',
      answer: 'Absolutely. Private clubs have provided member-only transportation for decades. Country clubs, yacht clubs, and private resorts all operate similar member-exclusive transportation services.'
    },
    {
      question: 'What hotels are partners?',
      answer: 'We partner with 487+ premium hotels including Four Seasons, Fairmont, Omni, Westin, and independent luxury properties. View all partners on our hotels page.'
    },
    {
      question: 'Can I extend my membership?',
      answer: 'Membership extends automatically with each hotel booking. Frequent guests at partner hotels maintain continuous membership benefits.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main Header Component with Full Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Section - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoRibbonOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Private Travel Club
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/20 rounded">
                Members Only
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/hotels" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Partner Hotels
              </Link>
              <Link href="/how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                How It Works
              </Link>
              <Link href="/legal" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Legal Framework
              </Link>
              <Link 
                href="/hotels"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/hotels" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoBusinessOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Hotels</span>
              </Link>
              <Link 
                href="/how-it-works" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">How It Works</span>
              </Link>
              <Link 
                href="/legal" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Legal</span>
              </Link>
              <Link 
                href="/hotels"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoLockClosedOutline className="w-4 h-4 flex-shrink-0" />
                <span>Join Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4 sm:mb-6">
                <IoLockClosedOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-medium">
                  Exclusive Membership • 487+ Partner Hotels • Members-Only Benefits
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Welcome to an Exclusive
                <span className="block text-amber-600 mt-2">Transportation Experience</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                ItWhip Private Travel Club provides premium transportation exclusively to members 
                staying at partner hotels. Enjoy luxury vehicles, protected pricing, and priority 
                service available only through membership.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/hotels" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition shadow-lg">
                  View Partner Hotels
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
                  Learn How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Membership Tiers */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Membership Tiers
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                All hotel guests receive automatic membership with exclusive benefits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipTiers.map((tier, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${
                  tier.color === 'amber' ? 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20' :
                  tier.color === 'purple' ? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20' :
                  'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
                } rounded-xl p-6 sm:p-8 border ${
                  tier.color === 'amber' ? 'border-amber-200 dark:border-amber-800' :
                  tier.color === 'purple' ? 'border-purple-200 dark:border-purple-800' :
                  'border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <tier.icon className={`w-8 h-8 ${
                      tier.color === 'amber' ? 'text-amber-600' :
                      tier.color === 'purple' ? 'text-purple-600' :
                      'text-blue-600'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      tier.color === 'amber' ? 'text-amber-600' :
                      tier.color === 'purple' ? 'text-purple-600' :
                      'text-blue-600'
                    }`}>{tier.price}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {tier.name}
                  </h3>
                  <ul className="space-y-2">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start space-x-2">
                        <IoCheckmarkCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          tier.color === 'amber' ? 'text-amber-600' :
                          tier.color === 'purple' ? 'text-purple-600' :
                          'text-blue-600'
                        }`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Exclusive Member Benefits
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Your membership unlocks premium transportation benefits not available to the public
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {membershipBenefits.map((benefit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                How Membership Works
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Simple, automatic, and exclusive to hotel guests
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Book Your Stay
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reserve a room at any of our 487+ partner hotels through our platform or directly 
                    with the hotel. Your membership activates automatically with your booking confirmation.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Receive Member Access
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your exclusive member benefits are included with your stay. Access luxury vehicles, 
                    member-only pricing, and priority service throughout your visit.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Enjoy Exclusive Service
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Request rides through our app with your hotel confirmation. Enjoy no surge pricing, 
                    luxury vehicles, and seamless billing to your room or travel account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Precedent Section */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Established Legal Framework
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Private clubs have provided member-exclusive transportation for over a century
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {comparisonExamples.map((example, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                  <example.icon className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {example.organization}
                  </h3>
                  <p className="text-sm text-amber-600 mb-2">{example.service}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{example.description}</p>
                  <div className="mt-4 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full inline-block">
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                      {example.membership}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 max-w-3xl mx-auto">
              <div className="flex items-start space-x-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Legal Distinction
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    As a private membership club, we operate under established legal precedents that 
                    allow exclusive services to members only. This is fundamentally different from 
                    public transportation services that must serve all customers equally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <IoArrowForwardOutline className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === idx ? 'rotate-90' : ''
                    }`} />
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exclusivity Notice */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoLockClosedOutline className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              This is a Private Club
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6">
              ItWhip Private Travel Club services are exclusively available to members staying at 
              partner hotels. We do not provide public transportation services.
            </p>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-amber-600">487+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Partner Hotels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">Members</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Only Access</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">24/7</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Protected Rates</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Experience Exclusive Transportation?
            </h2>
            <p className="text-base sm:text-lg text-amber-100 mb-8">
              Book your stay at any partner hotel to activate membership
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/hotels" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg">
                Browse Partner Hotels
              </Link>
              <Link href="/how-it-works" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p className="mb-4">
                ItWhip Private Travel Club operates as a members-only transportation service 
                exclusively for guests of partner hotels.
              </p>
              <div className="space-x-3 sm:space-x-4">
                <Link href="/legal" className="hover:text-gray-700 dark:hover:text-gray-300">Legal Framework</Link>
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                © 2024 ItWhip Private Travel Club. A members-only organization.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}