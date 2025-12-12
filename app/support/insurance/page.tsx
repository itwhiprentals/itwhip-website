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
  IoCarOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoAlertCircleOutline,
  IoCallOutline,
  IoMailOutline,
  IoChatbubblesOutline,
  IoTimeOutline,
  IoWarningOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Insurance Support & Help | ItWhip',
  description: 'Get help with ItWhip insurance questions. Learn about claims, coverage, deductibles, and how to file a claim. Contact our insurance support team.',
  keywords: [
    'itwhip insurance help',
    'car sharing insurance support',
    'file insurance claim',
    'rental car coverage questions',
    'insurance deductible help'
  ],
  openGraph: {
    title: 'Insurance Support & Help | ItWhip',
    description: 'Get answers to your insurance questions and learn how to file a claim.',
    url: 'https://itwhip.com/support/insurance',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/support/insurance',
  },
}

const COMMON_QUESTIONS = [
  {
    question: 'How do I file an insurance claim?',
    answer: 'Report the incident immediately through the ItWhip app by going to your trip details and selecting "Report Issue." Upload photos of any damage, provide a description of what happened, and submit. Our claims team will review within 24-48 hours.'
  },
  {
    question: 'What is my deductible?',
    answer: 'Deductibles depend on your host tier: Tier 1 (Platform Insurance) = $2,500 collision / $1,000 comprehensive. Tier 2 (P2P) and Tier 3 (Commercial) = your own policy deductibles apply first, with platform backup coverage.'
  },
  {
    question: 'What does insurance cover during a trip?',
    answer: 'Coverage includes: liability (bodily injury & property damage to third parties), collision damage to the rental vehicle, comprehensive coverage (theft, vandalism, weather), and 24/7 roadside assistance. Coverage is active ONLY during booked rental periods.'
  },
  {
    question: 'What is NOT covered?',
    answer: 'Not covered: mechanical breakdowns, pre-existing damage, personal belongings, intentional damage, DUI incidents, unauthorized drivers, off-road use, and any use outside the rental period. Normal wear and tear is also excluded.'
  },
  {
    question: 'How long does a claim take to process?',
    answer: 'Most claims are resolved within 48-72 hours. Complex claims involving third parties or disputes may take 5-7 business days. You\'ll receive updates via email and in-app notifications throughout the process.'
  },
  {
    question: 'What if my claim is denied?',
    answer: 'If your primary insurance denies a claim, platform secondary coverage may still apply. You can appeal a denial by providing additional documentation. Contact our claims team at claims@itwhip.com for assistance.'
  },
  {
    question: 'Do guests need their own insurance?',
    answer: 'No, guests are covered by the host\'s tier coverage during trips. However, guests can purchase optional protection at checkout for reduced deductibles and 50% off their security deposit.'
  },
  {
    question: 'What happens if a guest damages my car?',
    answer: 'Document the damage with photos before the guest leaves if possible. File a claim through the app immediately. The guest\'s security deposit can be applied toward repairs, and insurance covers amounts beyond the deposit up to policy limits.'
  },
  {
    question: 'Is coverage different for luxury/exotic cars?',
    answer: 'Yes. High-value vehicles ($75K+) have higher deposits ($500-$2,500), require enhanced guest verification, and may have specific repair requirements (factory-authorized shops only). Coverage limits remain the same.'
  },
  {
    question: 'Can I upgrade my insurance tier?',
    answer: 'Yes! Upload proof of P2P or commercial insurance through your host dashboard. Once verified (1-2 business days), your tier upgrades immediately and you\'ll earn more on future trips.'
  }
]

const CLAIM_STEPS = [
  {
    step: 1,
    title: 'Report Immediately',
    description: 'Open the ItWhip app, go to your trip, and tap "Report Issue." The sooner you report, the faster we can help.',
    icon: IoAlertCircleOutline
  },
  {
    step: 2,
    title: 'Document Everything',
    description: 'Take photos of all damage from multiple angles. Get the other party\'s information if applicable. Note the time, location, and circumstances.',
    icon: IoDocumentTextOutline
  },
  {
    step: 3,
    title: 'Submit Your Claim',
    description: 'Complete the in-app claim form with photos and description. For Tier 2/3 hosts, also file with your primary insurance.',
    icon: IoCheckmarkCircleOutline
  },
  {
    step: 4,
    title: 'Await Review',
    description: 'Our claims team reviews within 24-48 hours. You\'ll receive updates via email and in-app notifications.',
    icon: IoTimeOutline
  }
]

export default function InsuranceSupportPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COMMON_QUESTIONS.map(faq => ({
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
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-3">
                <IoHelpCircleOutline className="w-5 h-5" />
                Support Center
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Insurance Help & Support
              </h1>
              <p className="text-lg text-white/90">
                Get answers to your insurance questions, learn how to file a claim, and contact our support team.
              </p>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-blue-600">
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

        {/* Quick Actions */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="#file-claim"
                className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <IoAlertCircleOutline className="w-8 h-8 text-red-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">File a Claim</div>
                  <div className="text-xs text-gray-500">Report an incident</div>
                </div>
              </Link>

              <Link
                href="#faq"
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
              >
                <IoHelpCircleOutline className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Common Questions</div>
                  <div className="text-xs text-gray-500">Get quick answers</div>
                </div>
              </Link>

              <Link
                href="/host/insurance-options"
                className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition"
              >
                <IoShieldCheckmarkOutline className="w-8 h-8 text-emerald-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Host Tiers</div>
                  <div className="text-xs text-gray-500">40%, 75%, 90% earnings</div>
                </div>
              </Link>

              <Link
                href="#contact"
                className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
              >
                <IoChatbubblesOutline className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Contact Support</div>
                  <div className="text-xs text-gray-500">Talk to our team</div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* How to File a Claim */}
        <section id="file-claim" className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoAlertCircleOutline className="w-6 h-6 text-red-500" />
              How to File an Insurance Claim
            </h2>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {CLAIM_STEPS.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.step} className="relative">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <Icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                    {step.step < 4 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                        <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <IoWarningOutline className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Important:</strong> Report incidents as soon as possible. Late reporting (more than 24 hours) may affect your claim.
                  For emergencies involving injuries, call 911 first.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Overview */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-emerald-500" />
              What's Covered
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                  Covered During Trips
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Liability coverage (up to $1M combined)
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Collision damage to the vehicle
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Comprehensive (theft, vandalism, weather)
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    24/7 roadside assistance
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Towing (up to 50 miles)
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <IoAlertCircleOutline className="w-5 h-5" />
                  NOT Covered
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Mechanical breakdowns / wear & tear
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Personal belongings in the vehicle
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    DUI/DWI incidents or illegal activity
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Unauthorized drivers
                  </li>
                  <li className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Off-road or racing use
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/insurance-guide"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View full insurance guide
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Insurance Hierarchy Quick Reference */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoLayersOutline className="w-6 h-6 text-blue-500" />
              How Claims Are Processed
            </h2>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Claims follow an insurance hierarchy based on the host's tier:
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Tier 1 Hosts</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Platform insurance is PRIMARY → File claim with ItWhip</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Tier 2 Hosts (P2P)</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Your P2P insurance is PRIMARY → File with your insurer first, then ItWhip as backup</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Tier 3 Hosts (Commercial)</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Your commercial insurance is PRIMARY → File with your insurer first, then ItWhip as backup</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/host/insurance-options"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Learn about host insurance tiers
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-blue-500" />
              Common Insurance Questions
            </h2>
            <div className="space-y-3">
              {COMMON_QUESTIONS.map((faq, i) => (
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

        {/* Contact Support */}
        <section id="contact" className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoChatbubblesOutline className="w-6 h-6 text-purple-500" />
              Contact Insurance Support
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
                <IoCallOutline className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">For urgent claims</p>
                <a href="tel:+14805551234" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  (480) 555-1234
                </a>
                <p className="text-xs text-gray-500 mt-1">Mon-Fri 8am-6pm MST</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
                <IoMailOutline className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">For claims & questions</p>
                <a href="mailto:claims@itwhip.com" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  claims@itwhip.com
                </a>
                <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
                <IoChatbubblesOutline className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">In-App Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fastest response</p>
                <span className="text-blue-600 font-medium text-sm">
                  Open ItWhip App → Help
                </span>
                <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Related Resources
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/host/insurance-options"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                Host Insurance Tiers
              </Link>
              <Link
                href="/insurance-guide"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-400 transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                Full Insurance Guide
              </Link>
              <Link
                href="/host-protection"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors"
              >
                <IoCarOutline className="w-4 h-4" />
                Host Protection
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <IoHelpCircleOutline className="w-4 h-4" />
                Help Center
              </Link>
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="py-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold mb-3">
              Need Immediate Help?
            </h2>
            <p className="text-white/90 mb-6">
              For accidents involving injuries, call 911 first. Then contact our claims team.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="tel:+14805551234"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoCallOutline className="w-5 h-5" />
                Call Claims Team
              </a>
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
