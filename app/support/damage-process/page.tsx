// app/support/damage-process/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoWarningOutline,
  IoCameraOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCallOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoAlertCircleOutline,
  IoHelpCircleOutline,
  IoCashOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Damage Process | How to Report & Resolve | ItWhip',
  description: 'Learn how to report vehicle damage, file a claim, and understand the resolution process at ItWhip. Fair and transparent damage handling for guests and hosts.',
  keywords: [
    'car rental damage',
    'report damage',
    'damage claim',
    'rental car accident',
    'itwhip damage process',
    'vehicle damage resolution'
  ],
  openGraph: {
    title: 'Damage Process | ItWhip',
    description: 'Step-by-step guide to reporting and resolving vehicle damage on ItWhip.',
    url: 'https://itwhip.com/support/damage-process',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/support/damage-process',
  },
}

const DAMAGE_STEPS = [
  {
    step: 1,
    icon: IoCameraOutline,
    title: 'Document Everything',
    description: 'Take photos and videos of the damage from multiple angles. Include wide shots and close-ups. Document the date, time, and location.',
    tips: [
      'Take at least 10-15 photos',
      'Include photos of the full vehicle for context',
      'Get photos of any other vehicles involved',
      'Note weather and road conditions'
    ]
  },
  {
    step: 2,
    icon: IoAlertCircleOutline,
    title: 'Report Immediately',
    description: 'Report the damage through the ItWhip app or call our 24/7 support line. Do not delay - prompt reporting helps with claims.',
    tips: [
      'Use the in-app "Report Damage" feature',
      'Call 911 if there are injuries',
      'Get a police report for accidents',
      'Exchange info with other parties if applicable'
    ]
  },
  {
    step: 3,
    icon: IoDocumentTextOutline,
    title: 'Submit Your Claim',
    description: 'Complete the damage claim form with all details. Upload your photos, police report (if applicable), and describe what happened.',
    tips: [
      'Be honest and thorough',
      'Include all relevant documentation',
      'Keep receipts for any out-of-pocket expenses',
      'Respond promptly to any follow-up questions'
    ]
  },
  {
    step: 4,
    icon: IoShieldCheckmarkOutline,
    title: 'Review & Resolution',
    description: 'Our team reviews all claims within 48 hours. We work with both parties to reach a fair resolution based on evidence and policies.',
    tips: [
      'Most claims resolved within 5-7 business days',
      'You\'ll receive updates via email and app',
      'Appeals process available if needed',
      'Coverage depends on protection plan selected'
    ]
  }
]

const FAQS = [
  {
    question: 'What qualifies as damage?',
    answer: 'Damage includes any new scratches, dents, stains, mechanical issues, or other changes to the vehicle\'s condition from when you received it. Pre-existing damage documented in the check-in photos is not your responsibility.'
  },
  {
    question: 'How much will I be charged for damage?',
    answer: 'Charges depend on the repair cost and your protection plan. With basic coverage, you may be responsible for a deductible up to $2,500. Premium protection reduces this to $500 or less. We only charge actual repair costs - never inflated estimates.'
  },
  {
    question: 'What if the host claims damage I didn\'t cause?',
    answer: 'This is why check-in and check-out photos are crucial. If you have documentation showing the damage existed before your trip, submit it with your response. Our team reviews all evidence from both parties to make a fair determination.'
  },
  {
    question: 'Am I responsible for tire/wheel damage?',
    answer: 'Generally, yes. Tire punctures, curb rash on wheels, and similar damage during your trip is typically guest responsibility. However, wear-and-tear issues like worn treads are the host\'s responsibility.'
  },
  {
    question: 'What about interior damage or cleaning?',
    answer: 'Excessive cleaning fees (beyond normal use) may be charged. This includes stains, odors, excessive pet hair, or trash left in the vehicle. Normal use wear is expected and not charged.'
  },
  {
    question: 'How does insurance work with damage claims?',
    answer: 'ItWhip\'s $1M liability coverage protects you for third-party claims. For vehicle damage, your personal auto insurance or the protection plan you selected during booking applies. We\'ll guide you through the process.'
  },
  {
    question: 'Can I dispute a damage claim?',
    answer: 'Yes. You have 48 hours to respond to any damage claim with your evidence. If you disagree with the resolution, you can request a review by our Trust & Safety team.'
  },
  {
    question: 'What if I\'m in an accident?',
    answer: 'First, ensure everyone is safe and call 911 if needed. Get a police report, document everything, and contact ItWhip support immediately. Do not admit fault at the scene. Our team will guide you through next steps.'
  }
]

export default function DamageProcessPage() {
  // JSON-LD for HowTo schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Report Vehicle Damage on ItWhip',
    description: 'Step-by-step guide for reporting and resolving vehicle damage during your rental.',
    step: DAMAGE_STEPS.map((step) => ({
      '@type': 'HowToStep',
      position: step.step,
      name: step.title,
      text: step.description
    }))
  }

  const faqSchema = {
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
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-500 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <IoWarningOutline className="w-8 h-8" />
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Damage Process
                </h1>
              </div>
              <p className="text-lg text-white/90 mb-4">
                We hope you never need this page, but if something happens, here's how we handle it fairly for everyone.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#steps"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors text-sm"
                >
                  View Process
                  <IoChevronForwardOutline className="w-4 h-4" />
                </a>
                <a
                  href="tel:+14805550100"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <IoCallOutline className="w-5 h-5" />
                  Emergency: (480) 555-0100
                </a>
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
                <Link href="/support" className="hover:text-amber-600">
                  Support
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Damage Process
              </li>
            </ol>
          </nav>
        </div>

        {/* Prevention Tips */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Prevention is the Best Policy
                  </h2>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Always take detailed photos before and after your trip. Document the vehicle's condition using the app - this protects both you and the host if any disputes arise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section id="steps" className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              How to Report Damage
            </h2>
            <div className="space-y-6">
              {DAMAGE_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-amber-600">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {step.description}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Info */}
        <section className="py-8 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-amber-600" />
              Protection Plan Coverage
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Coverage</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$2,500</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Maximum out-of-pocket</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Included with every rental. You're responsible for damage up to this amount.
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Standard Protection</h3>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">$1,000</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">Maximum out-of-pocket</p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Reduced deductible. Recommended for most renters.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Premium Protection</h3>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">$250</p>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">Maximum out-of-pocket</p>
                <p className="text-xs text-green-800 dark:text-green-200">
                  Maximum peace of mind. Lowest deductible available.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-600" />
              Damage FAQs
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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

        {/* Emergency Contact */}
        <section className="py-8 bg-red-50 dark:bg-red-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <IoAlertCircleOutline className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-900 dark:text-red-100">
                    In an Emergency?
                  </h2>
                  <p className="text-red-800 dark:text-red-200">
                    If there are injuries, call 911 first. Then contact us.
                  </p>
                </div>
              </div>
              <a
                href="tel:+14805550100"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                <IoCallOutline className="w-5 h-5" />
                Call 24/7 Support
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
