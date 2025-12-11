// app/support/deposits/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoWalletOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoInformationCircleOutline,
  IoAlertCircleOutline,
  IoRefreshOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Security Deposits Explained | ItWhip Support',
  description: 'Learn about ItWhip security deposits - how they work, when they\'re charged, refund timelines, and how to reduce your deposit with verified insurance.',
  keywords: [
    'security deposit car rental',
    'rental car deposit',
    'itwhip deposit',
    'car rental hold',
    'deposit refund'
  ],
  openGraph: {
    title: 'Security Deposits | ItWhip Support',
    description: 'Everything you need to know about security deposits on ItWhip rentals.',
    url: 'https://itwhip.com/support/deposits',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/support/deposits',
  },
}

const DEPOSIT_TIERS = [
  {
    tier: 'Standard',
    carTypes: 'Economy, Sedan, SUV',
    depositRange: '$250 - $500',
    description: 'Most everyday vehicles'
  },
  {
    tier: 'Premium',
    carTypes: 'Luxury, Sports, Convertible',
    depositRange: '$500 - $1,000',
    description: 'Higher-value vehicles'
  },
  {
    tier: 'Exotic',
    carTypes: 'Exotic, Supercar',
    depositRange: '$2,500 - $10,000',
    description: 'High-performance exotics'
  }
]

const FAQS = [
  {
    question: 'When is my security deposit charged?',
    answer: 'Your security deposit is authorized (not charged) when your booking is confirmed, typically 24-48 hours before pickup. This creates a temporary hold on your card. If no damage or extra charges occur, the hold is released after the trip ends.'
  },
  {
    question: 'How do I get my deposit back?',
    answer: 'If the vehicle is returned in the same condition, your deposit hold is automatically released within 3-7 business days after trip completion. Some banks may show the release immediately, while others take longer to process.'
  },
  {
    question: 'Can I reduce my deposit amount?',
    answer: 'Yes! Guests with verified personal auto insurance can receive a 50% deposit reduction. Simply upload proof of your insurance coverage during the booking process, and we\'ll verify it qualifies.'
  },
  {
    question: 'What can the deposit be used for?',
    answer: 'The deposit covers potential damage to the vehicle, excessive cleaning fees, late returns, toll violations, traffic tickets, mileage overages, and fuel replacement if not returned at the agreed level.'
  },
  {
    question: 'Why is a hold different from a charge?',
    answer: 'An authorization hold temporarily reserves funds but doesn\'t transfer money. It appears as "pending" on your statement. Unlike a charge, holds automatically expire and release back to your available balance.'
  },
  {
    question: 'What if my card doesn\'t have enough for the deposit?',
    answer: 'Your booking may be cancelled if the authorization fails. We recommend ensuring sufficient available credit before your trip. If you have concerns, contact support before booking.'
  }
]

export default function DepositsPage() {
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
        id="deposits-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-3">
                <IoWalletOutline className="w-5 h-5" />
                Support Guide
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Security Deposits Explained
              </h1>
              <p className="text-lg text-white/90">
                Understand how deposits work, when they're charged, and how to get them back quickly.
              </p>
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
                <Link href="/support" className="hover:text-amber-600">
                  Support
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Deposits
              </li>
            </ol>
          </nav>
        </div>

        {/* Key Points */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Protection for Everyone
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deposits protect hosts from damage and guests from unfair charges.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <IoTimeOutline className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  3-7 Day Release
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  After a successful trip, deposits are released within 3-7 business days.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <IoCardOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  50% Reduction Available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified personal insurance can reduce your deposit by half.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              How Security Deposits Work
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Booking Confirmed',
                  description: 'Deposit is authorized (held) on your card 24-48 hours before pickup'
                },
                {
                  step: '2',
                  title: 'During Trip',
                  description: 'Hold remains in place while you enjoy your rental'
                },
                {
                  step: '3',
                  title: 'Trip Ends',
                  description: 'Host inspects vehicle and confirms return condition'
                },
                {
                  step: '4',
                  title: 'Release',
                  description: 'If no issues, hold is released within 3-7 business days'
                }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deposit Tiers */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Deposit Amounts by Vehicle Type
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Vehicle Types</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Typical Deposit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPOSIT_TIERS.map((tier, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{tier.tier}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{tier.carTypes}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{tier.depositRange}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{tier.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <IoInformationCircleOutline className="w-4 h-4 inline mr-1" />
              Exact deposit amounts are set by individual hosts and displayed before booking confirmation.
            </p>
          </div>
        </section>

        {/* Reducing Your Deposit */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              How to Reduce Your Deposit by 50%
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have personal auto insurance that covers rental vehicles, you can qualify for a 50% deposit reduction. Here's how:
              </p>
              <ol className="space-y-3">
                {[
                  'During booking, select "I have my own insurance"',
                  'Upload a photo of your declarations page or insurance card',
                  'Our team verifies coverage within 24 hours',
                  'Approved coverage automatically reduces your deposit'
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Qualifying insurance must include:</strong> Collision coverage, comprehensive coverage, and rental car coverage. Minimum liability limits apply.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Deposits Cover */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              What Can Be Deducted From Your Deposit?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Vehicle Damage', desc: 'Dents, scratches, interior damage beyond normal wear' },
                { title: 'Excessive Cleaning', desc: 'Smoke smell, stains, pet hair, excessive dirt' },
                { title: 'Late Returns', desc: 'Additional daily rate charges for unapproved late returns' },
                { title: 'Toll Violations', desc: 'Unpaid tolls plus processing fees' },
                { title: 'Traffic Tickets', desc: 'Parking tickets, red light violations, speeding tickets' },
                { title: 'Mileage Overages', desc: 'Extra miles beyond your booked allocation' },
                { title: 'Fuel Replacement', desc: 'Refueling to agreed level if not returned full' },
                { title: 'Lost Items', desc: 'Keys, garage remotes, or charging cables' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <IoAlertCircleOutline className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-blue-500" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
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

        {/* Contact CTA */}
        <section className="py-10 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our support team is happy to help with any deposit-related concerns.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Back to Support
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
