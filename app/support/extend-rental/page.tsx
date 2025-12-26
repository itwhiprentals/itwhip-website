// app/support/extend-rental/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoTimeOutline,
  IoCalendarOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Extend Your Rental | Support | ItWhip',
  description: 'Need more time with your rental car? Learn how to extend your ItWhip booking.',
}

export default function ExtendRentalPage() {
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">Extend Rental</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoTimeOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Extend Your Rental
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Need more time with your car?</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* How to Extend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoCalendarOutline className="w-5 h-5 text-orange-500" />
                How to Extend Your Trip
              </h2>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">1.</span>
                  Open the ItWhip app and go to "My Trips"
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">2.</span>
                  Find your current rental and tap "Extend Trip"
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">3.</span>
                  Select your new return date and time
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">4.</span>
                  Review the additional cost and confirm
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">5.</span>
                  Wait for host approval (usually within 1 hour)
                </li>
              </ol>
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Extension Requirements
              </h2>
              <ul className="space-y-2">
                {[
                  'Request must be made before your current return time',
                  'Vehicle must be available (no conflicting bookings)',
                  'Host must approve the extension',
                  'Your payment method must be valid for additional charges',
                  'Same rental terms apply to the extended period'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Extension Pricing
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Extensions are charged at the same daily rate as your original booking. If extending for multiple days, weekly discounts may apply if offered by the host.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Daily rate: Same as original booking</li>
                <li>• Mileage: Additional miles added to your allowance</li>
                <li>• Insurance: Coverage extends automatically</li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
                Late Returns
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Returning late without an approved extension may result in late fees and could affect your account standing. If you know you'll be late, request an extension as soon as possible or contact the host directly.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to My Trips
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
