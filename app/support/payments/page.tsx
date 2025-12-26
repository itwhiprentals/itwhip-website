// app/support/payments/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCardOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoLockClosedOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Payment Methods | Support | ItWhip',
  description: 'Learn about accepted payment methods on ItWhip. Credit cards, debit cards, and security deposits explained.',
}

const accepted = [
  'Visa credit cards',
  'Mastercard credit cards',
  'American Express',
  'Discover cards',
  'Debit cards (verified users only)'
]

const notAccepted = [
  'Cash payments',
  'Prepaid debit cards',
  'PayPal',
  'Cryptocurrency',
  'Wire transfers'
]

export default function PaymentsPage() {
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">Payment Methods</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoCardOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Payment Methods
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Accepted payment options</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Accepted */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                  Accepted
                </h2>
                <ul className="space-y-2">
                  {accepted.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Accepted */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoCloseCircle className="w-5 h-5 text-red-500" />
                  Not Accepted
                </h2>
                <ul className="space-y-2">
                  {notAccepted.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCloseCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Security Deposit */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Security Deposits
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                A security deposit hold is placed on your card when you book. This is released 3-5 business days after your trip ends, assuming no damage.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Standard deposit: $200 - $500 depending on vehicle</li>
                <li>• Luxury/exotic vehicles: Up to $1,500</li>
                <li>• BYOI discount: 50% off deposit if you provide your own insurance</li>
              </ul>
            </div>

            {/* Security */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoLockClosedOutline className="w-5 h-5 text-orange-500" />
                Payment Security
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All payments are processed securely through Stripe. We never store your full card details. Your payment information is encrypted with bank-level security (256-bit SSL).
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Manage Payment Methods
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
