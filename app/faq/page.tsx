// app/faq/page.tsx
// FAQ Page with FAQPage Schema for Rich Snippets

import { Metadata } from 'next'
import Link from 'next/link'
import { 
  IoHelpCircleOutline,
  IoCarSportOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoChevronDownOutline,
  IoArrowForwardOutline,
  IoSearchOutline,
  IoCashOutline,
  IoLeafOutline
} from 'react-icons/io5'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FAQAccordion from './components/FAQAccordion'

// ============================================
// METADATA
// ============================================
export const metadata: Metadata = {
  title: 'FAQ | ItWhip - Peer-to-Peer Car Rental Questions Answered',
  description: 'Answers to common questions about ItWhip peer-to-peer car sharing in Arizona. Learn about insurance tiers, host earnings (up to 90%), Mileage Forensics™, and more.',
  keywords: [
    'peer to peer car rental FAQ',
    'ItWhip questions',
    'Turo alternative Arizona FAQ',
    'P2P car sharing insurance',
    'rent my car questions',
    'car sharing Arizona help',
    'Mileage Forensics explained',
    'host earnings car rental',
    'Phoenix car rental FAQ'
  ],
  openGraph: {
    title: 'FAQ | ItWhip - Peer-to-Peer Car Rental Questions',
    description: 'Get answers about ItWhip P2P car sharing. Insurance tiers, host earnings up to 90%, Mileage Forensics™, and Arizona coverage.',
    url: 'https://itwhip.com/faq',
    siteName: 'ItWhip',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://itwhip.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ItWhip FAQ - Peer-to-Peer Car Rental'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | ItWhip - P2P Car Rental Questions Answered',
    description: 'Answers about ItWhip car sharing in Arizona. Insurance, earnings, Mileage Forensics™ & more.',
    images: ['https://itwhip.com/og-image.jpg']
  },
  alternates: {
    canonical: 'https://itwhip.com/faq'
  },
  robots: {
    index: true,
    follow: true
  }
}

// ============================================
// FAQ DATA
// ============================================
const faqData = {
  general: {
    title: 'General',
    icon: IoHelpCircleOutline,
    color: 'purple',
    questions: [
      {
        id: 'what-is-p2p',
        question: 'What is peer-to-peer car rental?',
        answer: 'Peer-to-peer (P2P) car rental is a car sharing model where private vehicle owners rent their personal cars directly to other people through a platform like ItWhip. Unlike traditional rental companies that own fleets, P2P connects local car owners with renters—offering more variety, better prices, and a personal touch. Think of it as Airbnb for cars.'
      },
      {
        id: 'itwhip-vs-turo',
        question: 'How is ItWhip different from Turo?',
        answer: 'ItWhip offers several advantages over Turo for Arizona hosts and guests: (1) Higher earnings—hosts keep up to 90% vs Turo\'s 60-85%, (2) Faster payments—48 hours vs 3-5 days, (3) Higher coverage—$1M liability vs $750K, (4) Mileage Forensics™—GPS-verified trip tracking Turo doesn\'t offer, (5) ESG Dashboard—environmental impact tracking, and (6) Arizona-focused—we know the local market, events, and compliance requirements.',
        link: { text: 'Compare ItWhip vs Turo →', href: '/switch-from-turo' }
      },
      {
        id: 'outside-arizona',
        question: 'Is ItWhip available outside Arizona?',
        answer: 'Currently, ItWhip operates exclusively in Arizona, serving the Phoenix metro area including Scottsdale, Tempe, Mesa, Chandler, Gilbert, and Glendale. We\'re focused on delivering the best P2P car sharing experience in Arizona before expanding. Expansion to additional states is planned for 2025.',
        link: { text: 'View coverage areas →', href: '/coverage' }
      },
      {
        id: 'legal-arizona',
        question: 'Is peer-to-peer car rental legal in Arizona?',
        answer: 'Yes, absolutely. Arizona has specific legislation governing P2P car sharing: A.R.S. § 28-9601 through 28-9613. This law establishes clear rules for platforms, hosts, and guests—including insurance requirements, liability protections, and tax obligations. ItWhip is fully compliant with all Arizona P2P car sharing regulations, and we handle Transaction Privilege Tax (TPT) collection and remittance on your behalf.',
        link: { text: 'Read full legal details →', href: '/legal' }
      }
    ]
  },
  guests: {
    title: 'For Guests (Renters)',
    icon: IoPersonOutline,
    color: 'blue',
    questions: [
      {
        id: 'what-need-to-rent',
        question: 'What do I need to rent a car on ItWhip?',
        answer: 'To rent on ItWhip, you need: (1) A valid driver\'s license (US or international), (2) Be at least 21 years old (25+ for luxury/exotic vehicles), (3) A valid credit or debit card, and (4) Pass our verification process including a background check and driving record review. The verification is quick—most guests are approved within minutes and it\'s a one-time process for all future rentals.',
        link: { text: 'Start renting →', href: '/rentals/search' }
      },
      {
        id: 'guest-insurance',
        question: 'How does insurance work when I rent?',
        answer: 'Every ItWhip rental includes $1M liability coverage automatically—no extra purchase required. This protects you if you cause injury or property damage to others. For damage to the rental vehicle itself, you\'re covered under the host\'s protection plan with deductibles ranging from $1,000-$2,500 depending on their tier. You can also add your own personal auto insurance to get 50% off the security deposit.'
      },
      {
        id: 'pickup-options',
        question: 'What are the pickup options?',
        answer: 'ItWhip offers flexible pickup options: (1) Hotel delivery—free delivery to your accommodation, (2) Airport pickup—convenient locations near Phoenix Sky Harbor (PHX), (3) Home delivery—have the car delivered to your address (fees may apply), or (4) Host meetup—meet the host at a mutually agreed location. You\'ll receive detailed pickup instructions after booking.',
        link: { text: 'Browse available cars →', href: '/rentals/search' }
      },
      {
        id: 'age-requirement',
        question: 'How old do I have to be to rent?',
        answer: 'The minimum age to rent on ItWhip is 21 years old. For luxury, exotic, and high-performance vehicles, you must be at least 25 years old. All renters must have a valid driver\'s license and pass our verification process regardless of age.'
      },
      {
        id: 'personal-insurance-discount',
        question: 'Can I add my own insurance for a discount?',
        answer: 'Yes! Guests who verify their personal auto insurance through ItWhip receive a 50% discount on security deposits. Your personal insurance becomes tertiary coverage (after the host\'s insurance and platform insurance), but the real benefit is the reduced upfront cost. Simply upload your insurance card during verification to unlock the discount on all future rentals.'
      }
    ]
  },
  hosts: {
    title: 'For Hosts (Car Owners)',
    icon: IoCarSportOutline,
    color: 'amber',
    questions: [
      {
        id: 'how-much-earn',
        question: 'How much can I earn renting my car?',
        answer: 'Host earnings depend on your vehicle type, rental frequency, and insurance tier. At the 90% tier: Economy cars average $800-1,400/month, standard vehicles $1,200-2,000/month, and luxury vehicles $2,000-4,000/month—based on 15-20 rental days. Phoenix hosts benefit from year-round demand, especially during major events like Barrett-Jackson, Spring Training, and the Waste Management Open.',
        link: { text: 'Calculate your earnings →', href: '/host-earnings' }
      },
      {
        id: 'insurance-tiers',
        question: 'How do the insurance tiers work (40/75/90%)?',
        answer: 'Your earnings tier is determined by the insurance YOU bring: BASIC (40%)—you bring no insurance, we provide full platform coverage, best for new hosts getting started. STANDARD (75%)—you bring P2P insurance (like State Farm or Getaround coverage), your insurance is primary. PREMIUM (90%)—you bring commercial auto insurance, maximum earnings with lowest deductibles. All tiers include $1M liability coverage.',
        link: { text: 'Full insurance guide →', href: '/insurance-guide' }
      },
      {
        id: 'when-paid',
        question: 'When do I get paid?',
        answer: 'ItWhip pays hosts within 48 hours of trip completion—the fastest in the industry. Payments go directly to your bank account via direct deposit (Stripe Connect). You can track all earnings, pending payments, and completed payouts in real-time through your host dashboard. We also provide automated 1099 tax documentation at year-end.'
      },
      {
        id: 'mileage-forensics',
        question: 'What is Mileage Forensics™?',
        answer: 'Mileage Forensics™ is ItWhip\'s proprietary system that tracks and verifies odometer readings between trips. It detects gaps in mileage that might indicate unreported personal use, fraud, or unauthorized trips. For hosts, this means complete transparency on how your vehicle is used. For insurers, it provides verified usage data for accurate underwriting. No other P2P platform offers this level of trip verification.',
        link: { text: 'Learn about Mileage Forensics →', href: '/mileage-forensics' }
      },
      {
        id: 'vehicle-requirements',
        question: 'What vehicles qualify to list?',
        answer: 'To list on ItWhip, your vehicle must: (1) Be model year 2015 or newer, (2) Have under 130,000 miles, (3) Have a clean title (no salvage or rebuilt titles), (4) Pass a safety inspection, (5) Be registered and located in the Phoenix metro area, and (6) Have valid registration and be in good mechanical condition. Luxury, exotic, and specialty vehicles are welcome!'
      },
      {
        id: 'worth-it',
        question: 'Is renting out my car worth it?',
        answer: 'For most Arizona hosts, yes. Consider: The average ItWhip host earns $800-2,000/month with just 15-20 rental days. That could cover your entire car payment plus insurance. You also get tax benefits—vehicle depreciation, maintenance, and insurance are potentially deductible. Plus, with ItWhip\'s 90% tier, you keep more than any other platform. The math usually works in your favor, especially for vehicles that sit unused during work hours.',
        link: { text: 'Start earning today →', href: '/list-your-car' }
      }
    ]
  },
  insurance: {
    title: 'Insurance & Protection',
    icon: IoShieldCheckmarkOutline,
    color: 'green',
    questions: [
      {
        id: 'coverage-included',
        question: 'What insurance coverage is included?',
        answer: 'Every ItWhip trip includes: (1) $1,000,000 liability coverage—protects against third-party injury and property damage claims, (2) Comprehensive coverage—theft, vandalism, weather damage, (3) Collision coverage—damage from accidents, (4) 24/7 roadside assistance—towing, flat tires, lockouts, jump starts, and (5) Loss of use compensation—hosts receive daily payments if their car is being repaired after an incident.',
        link: { text: 'Full protection details →', href: '/host-protection' }
      },
      {
        id: 'accident-process',
        question: 'What happens if there\'s an accident?',
        answer: 'If there\'s an accident: (1) Ensure everyone is safe and call 911 if needed, (2) Document the scene with photos and get a police report, (3) Report the incident through the ItWhip app within 24 hours, (4) Our claims team guides you through the FNOL (First Notice of Loss) process, and (5) Claims are typically resolved within 48-72 hours. Both hosts and guests are protected under our coverage—your personal auto insurance is not affected for covered claims.'
      },
      {
        id: 'deductibles',
        question: 'What are the deductibles?',
        answer: 'Deductibles vary by host tier: BASIC tier (40% earnings)—$2,500 deductible, STANDARD tier (75% earnings)—$1,500 deductible, PREMIUM tier (90% earnings)—$1,000 deductible. Higher tiers not only earn more but also have lower out-of-pocket costs if something goes wrong. Guests are responsible for deductibles for damage they cause, up to the security deposit amount.'
      }
    ]
  },
  features: {
    title: 'Platform Features',
    icon: IoSparklesOutline,
    color: 'emerald',
    questions: [
      {
        id: 'esg-score',
        question: 'What is the ESG Impact Score?',
        answer: 'The ESG (Environmental, Social, Governance) Impact Score measures each vehicle\'s environmental footprint and the host\'s sustainability practices. It factors in: fuel efficiency, emissions category, maintenance compliance, and trip patterns. Guests can filter by ESG score to choose eco-friendly rentals. Hosts with high ESG scores earn badges and may attract environmentally-conscious guests willing to pay premium rates. This is part of ItWhip\'s commitment to CSRD-compliant sustainability tracking.',
        link: { text: 'View ESG Dashboard →', href: '/esg-dashboard' }
      },
      {
        id: 'maxac',
        question: 'What is MaxAC™ certification?',
        answer: 'MaxAC™ is ItWhip\'s Arizona-specific certification ensuring vehicles perform in extreme desert heat. Every MaxAC™ certified vehicle has: (1) Verified working A/C tested above 100°F, (2) Proper window tinting within legal limits, (3) Maintained cooling system, and (4) Interior sun protection. In Phoenix summers, this matters. Guests never have to worry about getting into a hot car from a rental lot—MaxAC™ cars arrive cool and comfortable.',
        link: { text: 'Learn how we certify →', href: '/how-it-works' }
      }
    ]
  }
}

// ============================================
// JSON-LD SCHEMA
// ============================================
function generateFAQSchema() {
  const allQuestions = Object.values(faqData).flatMap(category => 
    category.questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions
  }
}

function generateBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://itwhip.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'FAQ',
        item: 'https://itwhip.com/faq'
      }
    ]
  }
}

// ============================================
// PAGE COMPONENT
// ============================================
export default function FAQPage() {
  const faqSchema = generateFAQSchema()
  const breadcrumbSchema = generateBreadcrumbSchema()

  const categoryColors: Record<string, string> = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* Header */}
        <Header />

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 mt-14 md:mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-purple-600">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white font-medium">FAQ</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4">
              <IoHelpCircleOutline className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-600">Help Center</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about peer-to-peer car sharing with ItWhip in Arizona.
            </p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-14 md:top-16 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(faqData).map(([key, category]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 transition"
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <main className="flex-1 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {Object.entries(faqData).map(([key, category]) => (
              <section key={key} id={key} className="mb-12 scroll-mt-32">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-lg ${categoryColors[category.color]}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {category.questions.map((item) => (
                    <FAQAccordion key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guest CTA */}
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <IoSearchOutline className="w-10 h-10 text-white mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Ready to Rent?</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Browse cars from local Phoenix owners
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  Find a Car <IoArrowForwardOutline className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Host CTA */}
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <IoCashOutline className="w-10 h-10 text-white mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Ready to Earn?</h3>
                <p className="text-purple-100 text-sm mb-4">
                  List your car and keep up to 90%
                </p>
                <Link
                  href="/list-your-car"
                  className="inline-flex items-center px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  List Your Car <IoArrowForwardOutline className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-10 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our team is here to help you get started
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Contact Support
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-700"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}