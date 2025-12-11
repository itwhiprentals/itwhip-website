// app/support/insurance/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCarOutline,
  IoMedicalOutline,
  IoConstructOutline,
  IoDocumentTextOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Insurance & Coverage Guide | ItWhip Support',
  description: 'Understand ItWhip insurance options - liability coverage, collision protection, comprehensive coverage, and how to use your personal insurance for discounts.',
  keywords: [
    'car rental insurance',
    'itwhip insurance',
    'rental car coverage',
    'liability insurance rental',
    'collision damage waiver'
  ],
  openGraph: {
    title: 'Insurance & Coverage | ItWhip Support',
    description: 'Complete guide to insurance and coverage options when renting on ItWhip.',
    url: 'https://itwhip.com/support/insurance',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/support/insurance',
  },
}

const COVERAGE_TIERS = [
  {
    name: 'Basic Protection',
    price: 'Included',
    coverage: '$1M Liability',
    features: [
      { included: true, text: 'Third-party liability up to $1M' },
      { included: true, text: 'Bodily injury coverage' },
      { included: true, text: 'Property damage coverage' },
      { included: false, text: 'Collision damage' },
      { included: false, text: 'Comprehensive coverage' },
      { included: false, text: 'Personal effects' },
    ],
    description: 'Covers damage you cause to others. You\'re responsible for damage to the rental vehicle.'
  },
  {
    name: 'Standard Protection',
    price: '+$15-25/day',
    coverage: '$1M + CDW',
    features: [
      { included: true, text: 'Third-party liability up to $1M' },
      { included: true, text: 'Bodily injury coverage' },
      { included: true, text: 'Property damage coverage' },
      { included: true, text: 'Collision damage ($1,500 deductible)' },
      { included: false, text: 'Comprehensive coverage' },
      { included: false, text: 'Personal effects' },
    ],
    description: 'Adds collision protection with a reasonable deductible.',
    popular: true
  },
  {
    name: 'Premium Protection',
    price: '+$35-50/day',
    coverage: 'Full Coverage',
    features: [
      { included: true, text: 'Third-party liability up to $1M' },
      { included: true, text: 'Bodily injury coverage' },
      { included: true, text: 'Property damage coverage' },
      { included: true, text: 'Collision damage ($500 deductible)' },
      { included: true, text: 'Comprehensive (theft, vandalism, weather)' },
      { included: true, text: 'Personal effects up to $2,000' },
    ],
    description: 'Complete peace of mind with the lowest deductibles.'
  }
]

const FAQS = [
  {
    question: 'Is insurance included with ItWhip rentals?',
    answer: 'Yes, basic liability insurance ($1M) is included with every rental at no extra cost. This covers damage you may cause to other vehicles, property, or people. However, it does not cover damage to the rental vehicle itself.'
  },
  {
    question: 'Can I use my own car insurance?',
    answer: 'Yes! If your personal auto insurance covers rental vehicles, you can decline additional protection. Upload proof of coverage to qualify for a 50% deposit reduction. Check with your insurance provider to confirm rental coverage is included in your policy.'
  },
  {
    question: 'What does liability insurance cover?',
    answer: 'Liability coverage pays for damage you cause to other people\'s vehicles, property, and medical expenses if someone is injured. It does not cover damage to the rental vehicle you\'re driving.'
  },
  {
    question: 'What is Collision Damage Waiver (CDW)?',
    answer: 'CDW covers damage to the rental vehicle from accidents. With CDW, you\'re only responsible for the deductible amount (typically $500-$1,500) rather than the full repair cost.'
  },
  {
    question: 'What about theft and vandalism?',
    answer: 'Comprehensive protection covers theft, vandalism, weather damage, fire, and falling objects. This is included in Premium Protection or can be added to Standard Protection.'
  },
  {
    question: 'Does my credit card offer rental coverage?',
    answer: 'Many premium credit cards include secondary rental car coverage. This typically covers the deductible after your primary insurance. Check your card benefits—if eligible, you may be able to decline ItWhip protection and save.'
  },
  {
    question: 'What\'s not covered by any insurance?',
    answer: 'Insurance doesn\'t cover: driving under the influence, unauthorized drivers, off-road damage (unless a Jeep/4x4 with host permission), intentional damage, violation of rental agreement terms, or personal belongings (except Premium tier).'
  }
]

export default function InsuranceSupportPage() {
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
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-200 text-sm font-medium mb-3">
                <IoShieldCheckmarkOutline className="w-5 h-5" />
                Support Guide
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Insurance & Coverage Guide
              </h1>
              <p className="text-lg text-white/90">
                Understand your protection options and make informed decisions for worry-free rentals.
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
                Insurance
              </li>
            </ol>
          </nav>
        </div>

        {/* Key Info */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-4">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    $1 Million Liability Included
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    Every ItWhip rental automatically includes $1 million in liability coverage at no extra cost. This protects you if you cause damage to other vehicles, property, or injury to others while driving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Types */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Types of Coverage
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <IoCarOutline className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Liability Coverage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Covers damage you cause to <strong>other people</strong> and their property. Included free with every rental.
                </p>
              </div>
              <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <IoConstructOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Collision (CDW)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Covers damage to the <strong>rental vehicle</strong> from accidents. Available as add-on protection.
                </p>
              </div>
              <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Comprehensive</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Covers theft, vandalism, weather damage, fire, and other <strong>non-collision</strong> events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Tiers */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Protection Plans
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {COVERAGE_TIERS.map((tier, i) => (
                <div
                  key={i}
                  className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 p-5 ${
                    tier.popular
                      ? 'border-emerald-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {tier.name}
                  </h3>
                  <div className="text-2xl font-bold text-emerald-600 mb-1">{tier.price}</div>
                  <div className="text-sm text-gray-500 mb-4">{tier.coverage}</div>
                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Using Your Own Insurance */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Using Your Personal Insurance
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {[
                    'Skip additional protection fees',
                    '50% reduction on security deposit',
                    'Use coverage you already pay for',
                    'Familiar claims process with your insurer'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">How to Verify</h3>
                <ol className="space-y-2">
                  {[
                    'Check your policy includes rental car coverage',
                    'During booking, select "I have my own insurance"',
                    'Upload your declarations page or insurance card',
                    'We verify within 24 hours and apply discount'
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 text-xs font-medium rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* What's Not Covered */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Exclusions (What's Not Covered)
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Driving under the influence of drugs/alcohol',
                  'Unauthorized or unlisted drivers',
                  'Off-road damage (unless pre-approved)',
                  'Intentional damage or reckless behavior',
                  'Violation of rental agreement terms',
                  'Racing or track use',
                  'Use for commercial purposes (unless approved)',
                  'Driving outside approved geographic area'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-emerald-500" />
              Insurance FAQ
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

        {/* Related Links */}
        <section className="py-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Related Topics
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/support/damage-process"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                Damage Process
              </Link>
              <Link
                href="/support/deposits"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                Security Deposits
              </Link>
              <Link
                href="/insurance-guide"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                Full Insurance Guide
              </Link>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold mb-3">
              Questions About Coverage?
            </h2>
            <p className="text-white/90 mb-6">
              Our team can help you choose the right protection for your trip.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
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
