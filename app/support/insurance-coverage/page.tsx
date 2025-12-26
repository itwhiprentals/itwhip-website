// app/support/insurance-coverage/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Insurance Coverage Explained | Support | ItWhip',
  description: 'Understand the insurance coverage included with every ItWhip rental. Learn about liability, comprehensive, and collision protection options.',
}

const coverageTypes = [
  {
    title: 'Liability Coverage',
    amount: '$1,000,000',
    included: true,
    description: 'Included with every rental. Covers bodily injury and property damage to third parties.',
    details: [
      'Required by law in all states',
      'Protects you if you cause an accident',
      'Covers other drivers, passengers, and property'
    ]
  },
  {
    title: 'Comprehensive Protection',
    amount: 'Varies',
    included: false,
    description: 'Optional coverage for non-collision damage like theft, vandalism, or weather.',
    details: [
      'Covers theft and attempted theft',
      'Weather damage (hail, floods, etc.)',
      'Fire, vandalism, and falling objects'
    ]
  },
  {
    title: 'Collision Protection',
    amount: 'Varies',
    included: false,
    description: 'Optional coverage for damage from accidents, regardless of fault.',
    details: [
      'Covers damage from collisions',
      'Single-vehicle accidents included',
      'Reduces your out-of-pocket costs'
    ]
  }
]

export default function InsuranceCoveragePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-orange-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-orange-600">Support</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">Insurance Coverage</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Insurance Coverage Explained
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Understanding your protection options</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Types */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {coverageTypes.map((coverage) => (
              <div
                key={coverage.title}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {coverage.title}
                      {coverage.included && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Included
                        </span>
                      )}
                    </h2>
                    <p className="text-2xl font-bold text-orange-500">{coverage.amount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{coverage.description}</p>
                <ul className="space-y-2">
                  {coverage.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* BYOI Section */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
                Bring Your Own Insurance (BYOI)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Already have personal auto insurance? You may be able to use it for your rental and receive a 50% discount on the security deposit.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Your policy must include comprehensive and collision coverage</li>
                <li>• Coverage must extend to rental vehicles</li>
                <li>• You'll need to provide proof of insurance during booking</li>
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/insurance-guide"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Full Insurance Guide
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
