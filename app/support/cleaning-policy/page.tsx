// app/support/cleaning-policy/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoSparklesOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoLeafOutline,
  IoPawOutline,
  IoFlameOutline,
  IoWaterOutline,
  IoTrashOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Cleaning Policy & Fees | ItWhip Support',
  description: 'Understand ItWhip cleaning standards - what\'s expected when returning a rental, cleaning fees, pet policies, and smoking rules.',
  keywords: [
    'car rental cleaning policy',
    'rental car cleaning fee',
    'smoking in rental car',
    'pet policy car rental',
    'cleaning charges'
  ],
  openGraph: {
    title: 'Cleaning Policy | ItWhip Support',
    description: 'Return guidelines and cleaning standards for ItWhip rentals.',
    url: 'https://itwhip.com/support/cleaning-policy',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/support/cleaning-policy',
  },
}

const CLEANING_FEES = [
  {
    level: 'Light Cleaning',
    fee: '$50-75',
    examples: 'Sand, light dirt, food crumbs, minor spills',
    description: 'Vehicle needs more than a basic wipe-down'
  },
  {
    level: 'Standard Cleaning',
    fee: '$100-150',
    examples: 'Significant dirt, sticky residue, stains requiring treatment',
    description: 'Professional interior detailing required'
  },
  {
    level: 'Deep Cleaning',
    fee: '$200-350',
    examples: 'Pet hair, smoke odor, major stains, biohazard cleanup',
    description: 'Extensive professional cleaning with odor removal'
  },
  {
    level: 'Restoration',
    fee: '$400+',
    examples: 'Cigarette burns, permanent stains, odor requiring ozone treatment',
    description: 'May require multiple treatments or part replacement'
  }
]

const FAQS = [
  {
    question: 'What condition should I return the car in?',
    answer: 'Return the car in the same general condition you received it. Remove all personal belongings, trash, and any sand/dirt you brought in. A basic wipe-down of any spills is appreciated but professional cleaning isn\'t expected.'
  },
  {
    question: 'Are pets allowed in ItWhip rentals?',
    answer: 'It depends on the host. Some hosts welcome pets (look for the "pet-friendly" badge), while others don\'t allow them. Never bring a pet in a non-pet-friendly vehicle—this results in automatic deep cleaning fees.'
  },
  {
    question: 'What if I smoke in the car?',
    answer: 'Smoking (including vaping) is prohibited in all ItWhip vehicles. Violation results in a minimum $250 cleaning fee plus potential odor removal costs. Repeat offenders may be banned from the platform.'
  },
  {
    question: 'How do I avoid cleaning fees?',
    answer: 'Simple: return it as you found it. Remove trash, shake out floor mats if sandy, wipe up spills, and don\'t smoke or bring unauthorized pets. Take photos at return to document condition.'
  },
  {
    question: 'What if the car was already dirty when I got it?',
    answer: 'Always document the vehicle condition at pickup with photos/video. If it\'s significantly dirty, contact the host immediately and report through the app. This protects you from being charged for pre-existing issues.'
  },
  {
    question: 'Who determines cleaning fees?',
    answer: 'Hosts document condition at return with photos. If cleaning is needed, they submit a claim with documentation. ItWhip reviews the evidence and determines fair charges based on our fee guidelines.'
  }
]

export default function CleaningPolicyPage() {
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
        id="cleaning-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-violet-200 text-sm font-medium mb-3">
                <IoSparklesOutline className="w-5 h-5" />
                Support Guide
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Cleaning Policy & Fees
              </h1>
              <p className="text-lg text-white/90">
                Keep it clean, keep it simple. Understand our return standards and avoid unexpected charges.
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
                Cleaning Policy
              </li>
            </ol>
          </nav>
        </div>

        {/* Golden Rule */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <IoLeafOutline className="w-6 h-6 text-amber-500" />
                The Golden Rule
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Return the car in the <strong>same condition</strong> you received it. That's it—no professional detailing required, just basic respect for the vehicle.
              </p>
            </div>
          </div>
        </section>

        {/* Return Checklist */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Return Checklist
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Do */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                  Please Do
                </h3>
                <ul className="space-y-2">
                  {[
                    'Remove all personal belongings',
                    'Throw away any trash',
                    'Shake out floor mats if sandy/dirty',
                    'Wipe up any spills or sticky spots',
                    'Return at agreed fuel level',
                    'Take photos documenting condition',
                    'Report any issues to host immediately'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don't */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                  <IoCloseCircleOutline className="w-5 h-5" />
                  Please Don't
                </h3>
                <ul className="space-y-2">
                  {[
                    'Smoke or vape in the vehicle',
                    'Bring pets without permission',
                    'Leave food or drink containers',
                    'Return with excessive sand or mud',
                    'Leave strong odors (perfume, food, etc.)',
                    'Ignore spills—clean them up!',
                    'Transport anything that stains'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCloseCircleOutline className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Special Policies */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Special Policies
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Smoking */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <IoFlameOutline className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">No Smoking</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  All ItWhip vehicles are smoke-free. This includes cigarettes, cigars, vapes, and cannabis.
                </p>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Violation fee: $250 minimum + odor removal costs
                  </p>
                </div>
              </div>

              {/* Pets */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <IoPawOutline className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Pet Policy</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Only allowed in vehicles marked "pet-friendly." Always use a carrier or seat cover.
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    Unauthorized pets: $200+ cleaning fee
                  </p>
                </div>
              </div>

              {/* Food & Drink */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <IoWaterOutline className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Food & Drinks</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Eating is allowed but clean up after yourself. Spills should be wiped immediately.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Stains/odors: $50-200 depending on severity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cleaning Fees */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Cleaning Fee Guidelines
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fee Range</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Examples</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {CLEANING_FEES.map((tier, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{tier.level}</td>
                      <td className="px-4 py-3 text-violet-600 font-medium">{tier.fee}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{tier.examples}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{tier.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <IoWarningOutline className="w-4 h-4 inline mr-1" />
              Fees are deducted from your security deposit. Excessive cleaning may result in deposit forfeiture plus additional charges.
            </p>
          </div>
        </section>

        {/* Dispute Process */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Disputing a Cleaning Fee
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you believe a cleaning fee is unfair, you can dispute it within 48 hours of being charged:
              </p>
              <ol className="space-y-3">
                {[
                  'Review the photos provided by the host documenting the issue',
                  'Compare with your own pickup/return photos (this is why we recommend always taking them!)',
                  'Submit your dispute through the app with your evidence',
                  'ItWhip support reviews both sides and makes a fair determination',
                  'Decision is typically made within 3-5 business days'
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-100 dark:bg-violet-900/30 text-violet-600 text-sm font-medium rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-violet-500" />
              Cleaning FAQ
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

        {/* Pro Tips */}
        <section className="py-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Pro Tips to Avoid Fees
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: IoTrashOutline,
                  tip: 'Keep a small trash bag',
                  desc: 'A plastic grocery bag in the door pocket makes cleanup easy'
                },
                {
                  icon: IoWaterOutline,
                  tip: 'Use cup holders',
                  desc: 'Prevent spills by keeping drinks secured'
                },
                {
                  icon: IoPawOutline,
                  tip: 'Bring a blanket for pets',
                  desc: 'Even in pet-friendly cars, protect the seats'
                },
                {
                  icon: IoSparklesOutline,
                  tip: 'Quick wipe at return',
                  desc: '2 minutes with a napkin can save you $50+'
                }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <item.icon className="w-6 h-6 text-violet-500 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{item.tip}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-10 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold mb-3">
              Questions About Cleaning?
            </h2>
            <p className="text-white/90 mb-6">
              Contact us before your trip if you have any concerns about cleanliness standards.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
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
