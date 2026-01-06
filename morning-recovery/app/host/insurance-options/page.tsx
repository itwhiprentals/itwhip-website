// app/host/insurance-options/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCarOutline,
  IoBusinessOutline,
  IoLayersOutline,
  IoDocumentTextOutline,
  IoSpeedometerOutline,
  IoInformationCircleOutline,
  IoHelpCircleOutline,
  IoWalletOutline,
  IoPeopleOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'How Insurance Works on ItWhip | Host Earnings Tiers',
  description: 'Understand ItWhip insurance tiers for hosts. Your earnings (40%, 75%, or 90%) depend on what insurance you bring. Up to $1M combined coverage on every trip.',
  keywords: ['car sharing insurance', 'host protection plan', 'p2p insurance tiers', 'car rental host insurance', 'itwhip host earnings'],
  openGraph: {
    title: 'How Insurance Works on ItWhip | Host Tiers',
    description: 'Your earnings depend on what insurance you bring. 40%, 75%, or 90% host earnings based on your tier.',
    url: 'https://itwhip.com/host/insurance-options',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/insurance-options',
  },
}

const HOST_TIERS = [
  {
    tier: 'Tier 1',
    earnings: '40%',
    platformFee: '60%',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'Platform Insurance',
    subtitle: 'No personal rental insurance needed',
    description: 'Platform provides PRIMARY insurance coverage. Higher platform fee covers the insurance cost.',
    primaryInsurance: 'ItWhip Platform',
    deductibles: {
      collision: '$2,500',
      comprehensive: '$1,000'
    },
    features: [
      'Platform handles liability, collision, comprehensive',
      '$2,500 collision deductible',
      '$1,000 comprehensive deductible',
      'No insurance paperwork required',
      'Ideal for testing the platform'
    ],
    bestFor: 'New hosts, personal vehicles, testing the platform'
  },
  {
    tier: 'Tier 2',
    earnings: '75%',
    platformFee: '25%',
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'P2P Insurance',
    subtitle: 'Bring your own P2P policy',
    description: 'Your P2P insurance is PRIMARY. Platform provides SECONDARY backup coverage if primary denies.',
    primaryInsurance: 'Your P2P Policy',
    deductibles: {
      collision: 'Your policy',
      comprehensive: 'Your policy'
    },
    features: [
      'Your P2P insurance handles primary claims',
      'Platform backup if primary denies',
      'Lower platform fee = higher earnings',
      'Must be fleet-approved P2P policy',
      'Reduced deductibles with platform backup'
    ],
    bestFor: 'Established hosts with P2P policies',
    popular: true
  },
  {
    tier: 'Tier 3',
    earnings: '90%',
    platformFee: '10%',
    color: 'from-emerald-500 to-green-500',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Commercial Insurance',
    subtitle: 'Full commercial coverage',
    description: 'Your commercial insurance is PRIMARY. Platform provides SECONDARY backup for overflow claims.',
    primaryInsurance: 'Your Commercial Policy',
    deductibles: {
      collision: 'Your policy',
      comprehensive: 'Your policy'
    },
    features: [
      'Commercial policies typically offer $1M+',
      'Lowest platform fee = maximum earnings',
      'Platform handles overflow claims',
      'Must be fleet-approved commercial policy',
      'Professional-grade protection'
    ],
    bestFor: 'Fleet owners, professional hosts, commercial operators'
  }
]

const DECLARATIONS = [
  {
    type: 'Rental Only',
    description: 'Vehicle used exclusively for rentals',
    mileage: 'Max 15 miles between trips',
    icon: IoCarOutline
  },
  {
    type: 'Mixed Use',
    description: 'Rentals AND personal driving',
    mileage: 'Up to 500 miles between trips',
    icon: IoPeopleOutline
  },
  {
    type: 'Commercial',
    description: 'Rentals AND business operations',
    mileage: 'Max 300 miles between trips',
    icon: IoBusinessOutline
  }
]

const FAQS = [
  {
    question: 'How does ItWhip reach $1M in coverage?',
    answer: 'Coverage is layered through an insurance hierarchy. For Tier 1 hosts, platform insurance provides the full coverage. For Tier 2 and 3 hosts, your primary insurance combines with platform secondary coverage to reach up to $1M combined protection.'
  },
  {
    question: 'What happens if I have a claim?',
    answer: 'Claims follow the insurance hierarchy. For Tier 1, file directly with ItWhip. For Tier 2/3, file first with your primary insurance. If denied or limits exceeded, platform secondary coverage kicks in automatically.'
  },
  {
    question: 'How do I qualify for Tier 2 or Tier 3?',
    answer: 'Upload proof of your P2P or commercial insurance policy through your host dashboard. Our team reviews and approves qualifying policies within 48 hours. Once approved, your earnings tier updates immediately.'
  },
  {
    question: 'What P2P insurance providers are approved?',
    answer: 'We approve most major P2P insurance providers including policies specifically designed for car sharing. Submit your policy for review - policies must specifically cover peer-to-peer car sharing activities.'
  },
  {
    question: 'Does coverage apply outside of trips?',
    answer: 'No. ItWhip coverage is per-trip only and active only during booked rental periods. When the vehicle isn\'t rented, your personal or commercial policy provides coverage.'
  },
  {
    question: 'Can I change my tier later?',
    answer: 'Yes! You can upgrade your tier at any time by submitting proof of qualifying insurance. Downgrades take effect at your next payout cycle.'
  }
]

export default function InsuranceOptionsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <>
      <Script
        id="insurance-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 rounded-full text-emerald-200 text-xs font-medium mb-4">
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                Host Insurance
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                How Insurance Works on ItWhip
              </h1>
              <p className="text-xl text-emerald-100 mb-6">
                Up to $1M in combined coverage through our tiered insurance system. Your earnings depend on what insurance you bring.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  Per-trip coverage only
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  Liability + Collision + Comprehensive
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/list-your-car" className="hover:text-amber-600">Host</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Insurance Options
              </li>
            </ol>
          </nav>
        </div>

        {/* Quick Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Related:</span>
            <Link
              href="/insurance-guide"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
            >
              <IoDocumentTextOutline className="w-4 h-4" />
              Full Insurance Guide
            </Link>
            <Link
              href="/support/insurance"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
            >
              <IoHelpCircleOutline className="w-4 h-4" />
              Insurance Support
            </Link>
            <Link
              href="/host-protection"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
            >
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              Host Protection
            </Link>
            <Link
              href="/host/payouts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
            >
              <IoWalletOutline className="w-4 h-4" />
              Payouts & Earnings
            </Link>
          </div>
        </div>

        {/* The Three Tiers */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Host Insurance Tiers
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Your earnings percentage depends on what insurance you bring. Higher coverage = lower platform fees = more earnings for you.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {HOST_TIERS.map((tier, i) => (
                <div
                  key={i}
                  className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 ${tier.borderColor} overflow-hidden shadow-sm hover:shadow-lg transition-shadow`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        POPULAR
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className={`bg-gradient-to-r ${tier.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">{tier.tier}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {tier.platformFee} platform fee
                      </span>
                    </div>
                    <div className="text-5xl font-bold mb-1">{tier.earnings}</div>
                    <div className="text-sm opacity-90">Host Earnings</div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      {tier.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {tier.subtitle}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {tier.description}
                    </p>

                    <div className={`${tier.bgColor} rounded-lg p-3 mb-4`}>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Primary Insurance</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {tier.primaryInsurance}
                      </div>
                    </div>

                    {/* Deductibles */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                        <div className="text-xs text-gray-500">Collision</div>
                        <div className="font-medium text-gray-900 dark:text-white">{tier.deductibles.collision}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                        <div className="text-xs text-gray-500">Comprehensive</div>
                        <div className="font-medium text-gray-900 dark:text-white">{tier.deductibles.comprehensive}</div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {tier.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Best for</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tier.bestFor}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Hierarchy */}
        <section className="py-10 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoLayersOutline className="w-6 h-6 text-emerald-500" />
              Insurance Hierarchy
            </h2>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Pyramid Visual */}
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Coverage is layered to provide comprehensive protection. Claims follow this order:
                </p>
                <div className="space-y-2">
                  {/* Primary */}
                  <div className="bg-emerald-500 text-white rounded-lg p-4 text-center">
                    <div className="text-xs font-medium opacity-80 mb-1">1. PRIMARY</div>
                    <div className="font-bold">Host's Insurance (Tier 2/3)</div>
                    <div className="text-sm opacity-90">or Platform (Tier 1)</div>
                  </div>

                  {/* Secondary */}
                  <div className="bg-amber-500 text-white rounded-lg p-4 text-center mx-6">
                    <div className="text-xs font-medium opacity-80 mb-1">2. SECONDARY</div>
                    <div className="font-bold">Platform Insurance</div>
                    <div className="text-sm opacity-90">Backup if primary denies or exceeds limits</div>
                  </div>

                  {/* Tertiary */}
                  <div className="bg-blue-500 text-white rounded-lg p-4 text-center mx-12">
                    <div className="text-xs font-medium opacity-80 mb-1">3. TERTIARY</div>
                    <div className="font-bold">Guest's Insurance</div>
                    <div className="text-sm opacity-90">If purchased at checkout</div>
                  </div>
                </div>
              </div>

              {/* How Layers Combine */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  How Layers Combine to Reach $1M
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-6">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Primary insurance handles claims first
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Secondary kicks in if primary denies or limits exceeded
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Tertiary provides additional guest protection
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Combined coverage reaches up to $1M
                  </li>
                </ul>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                    Commercial Hosts (Tier 3)
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Commercial insurance policies typically already offer $1M+ in coverage.
                    The platform's secondary coverage fills any gaps and handles overflow claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guest Insurance & Deposits */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoWalletOutline className="w-6 h-6 text-emerald-500" />
              Guest Insurance & Deposits
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Guest Protection at Checkout
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Guests can purchase additional protection when booking. This becomes <strong>tertiary coverage</strong> in
                  the insurance hierarchy, providing an extra layer of protection.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Multiple protection levels available
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Reduces collision deductibles
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <strong>50% deposit reduction</strong> when purchased
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Security Deposits
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  All guests must leave a deposit (unless approved for no-deposit). Deposit is returned after trip if no issues.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Economy vehicles</span>
                    <span className="font-medium">$200 - $350</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Standard vehicles</span>
                    <span className="font-medium">$350 - $500</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Luxury / Exotic</span>
                    <span className="font-medium">$500 - $2,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Host Declarations */}
        <section className="py-10 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoDocumentTextOutline className="w-6 h-6 text-emerald-500" />
              Host Declarations
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Hosts must declare how their vehicle is used. This affects insurance pricing and compliance requirements.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {DECLARATIONS.map((dec, i) => {
                const Icon = dec.icon
                return (
                  <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <Icon className="w-8 h-8 text-emerald-500 mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dec.type}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dec.description}</p>
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <IoSpeedometerOutline className="w-4 h-4" />
                      {dec.mileage}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Mileage Forensics&trade;</strong> verifies that actual usage matches your declaration.
                  Mismatched declarations may affect insurance coverage and claims.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-10 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-emerald-500" />
              Insurance FAQ
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                    {faq.question}
                    <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-white/90 mb-6">
              List your car with confidence. Start at Tier 1 and upgrade anytime by adding your own insurance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/list-your-car"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                List Your Car
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/support/insurance"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                Full Insurance Guide
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
