// app/cancellation-policy/CancellationPolicyContent.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoCallOutline,
  IoMailOutline,
  IoArrowForwardOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

// Structured data for the cancellation policy page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cancellation & Refund Policy',
  description: 'ItWhip cancellation and refund policy for peer-to-peer car rentals in Phoenix, Arizona.',
  publisher: {
    '@type': 'Organization',
    name: 'ItWhip Technologies, Inc.',
    url: 'https://itwhip.com'
  },
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is ItWhip\'s cancellation policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ItWhip offers a tiered cancellation policy: 72+ hours before pickup = 100% refund, 24-72 hours = 75% refund, 12-24 hours = 50% refund, less than 12 hours = no refund.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long do refunds take to process?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Refunds typically process within 5-10 business days for credit/debit cards, 3-5 days for PayPal and digital wallets, or instantly when applied as ItWhip credit.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I modify my booking instead of canceling?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Many hosts prefer modifications to cancellations. Contact your host to request date changes, which may avoid cancellation penalties while only paying any price difference.'
        }
      }
    ]
  }
}

export default function CancellationPolicyContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetAppClick = () => {
    console.log('Get app clicked')
  }

  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                <IoCalendarOutline className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Cancellation & Refund Policy
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We understand plans change. Our flexible cancellation policy is designed to be fair for both guests and hosts.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                Last Updated: January 15, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
              <h2 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-300 mb-4 flex items-center">
                <IoTimeOutline className="w-5 h-5 mr-2" />
                Quick Summary: Guest Cancellation Refunds
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">72+ hours</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">before pickup</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600">75%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">24-72 hours</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">before pickup</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600">50%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">12-24 hours</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">before pickup</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">0%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">&lt;12 hours</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">before pickup</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guest Cancellation Policy */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoPersonOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                Guest Cancellation Policy
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                As a guest, you can cancel your booking at any time. The refund amount depends on how far in advance you cancel relative to your scheduled pickup time.
              </p>

              {/* 72+ Hours */}
              <div className="border-l-4 border-green-500 pl-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 mr-2" />
                  72+ Hours Before Pickup — 100% Refund
                </h3>
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Full refund of rental cost</li>
                  <li>• Full service fee refund if canceling 7+ days before pickup</li>
                  <li>• Security deposit authorization released (never charged)</li>
                  <li>• No impact on your rental history or future booking privileges</li>
                  <li>• Protection plan coverage continues until original pickup time</li>
                </ul>
              </div>

              {/* 24-72 Hours */}
              <div className="border-l-4 border-yellow-500 pl-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <IoAlertCircleOutline className="w-5 h-5 text-yellow-500 mr-2" />
                  24-72 Hours Before Pickup — 75% Refund
                </h3>
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 75% refund of rental cost</li>
                  <li>• Service fee non-refundable</li>
                  <li>• Protection plan remains active until pickup time</li>
                  <li>• Host may offer reschedule option at their discretion</li>
                  <li>• Priority rebooking assistance available through support</li>
                </ul>
              </div>

              {/* 12-24 Hours */}
              <div className="border-l-4 border-orange-500 pl-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <IoAlertCircleOutline className="w-5 h-5 text-orange-500 mr-2" />
                  12-24 Hours Before Pickup — 50% Refund
                </h3>
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 50% refund of rental cost</li>
                  <li>• Service fee and protection plan non-refundable</li>
                  <li>• May request host consideration for documented emergency</li>
                  <li>• Support team can mediate special circumstances</li>
                </ul>
              </div>

              {/* Less than 12 Hours */}
              <div className="border-l-4 border-red-500 pl-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <IoCloseCircleOutline className="w-5 h-5 text-red-500 mr-2" />
                  Less Than 12 Hours Before Pickup — No Refund
                </h3>
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• No refund of rental cost</li>
                  <li>• All fees non-refundable</li>
                  <li>• May affect future instant booking privileges</li>
                  <li>• Exceptions only for documented emergencies with protection plan coverage</li>
                  <li>• Host receives full payout minus platform fee</li>
                </ul>
              </div>

              {/* No-Show */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300 flex items-center">
                  <IoCloseCircleOutline className="w-5 h-5 mr-2" />
                  No-Show Policy
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-400 space-y-1">
                  <li>• No refund plus potential account suspension</li>
                  <li>• $50 no-show fee may apply</li>
                  <li>• Negative impact on renter score</li>
                  <li>• Loss of instant book privileges</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Host Cancellation Policy */}
        <section className="py-6 sm:py-8 bg-white dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoCarOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                Host Cancellation Policy
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                We hold hosts to high standards because guest travel plans depend on confirmed bookings. Host cancellations result in guest protection and host penalties.
              </p>

              {/* When Host Cancels */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">When a Host Cancels:</h3>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-2">
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      Guest receives 100% refund including all fees
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      Protection plan fee fully refunded
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      ItWhip provides $50 travel credit for inconvenience
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      Priority assistance finding alternative vehicle
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      We may cover price difference for comparable replacement
                    </li>
                  </ul>
                </div>
              </div>

              {/* Host Penalties */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Host Cancellation Penalties:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">First offense</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">$50 penalty fee</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Second offense</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">$100 penalty fee</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Third offense</span>
                    <span className="text-sm font-medium text-orange-600">30-day suspension</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fourth offense</span>
                    <span className="text-sm font-medium text-red-600">Permanent termination</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Additionally: Negative impact on search ranking and loss of Super Host eligibility for 6 months.
                </p>
              </div>

              {/* Acceptable Reasons */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Acceptable Host Cancellation Reasons:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Vehicle mechanical issues (documentation required)</li>
                  <li>• Emergency safety recalls</li>
                  <li>• Documented medical emergency</li>
                  <li>• Natural disasters or government orders</li>
                  <li>• Previous guest caused disabling damage</li>
                  <li>• Accident rendering vehicle unsafe</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Processing */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                Refund Processing Timeline
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Refunds are processed to your original payment method. Processing times vary by payment type.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Processing Times</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex justify-between">
                      <span>Credit/Debit Cards</span>
                      <span className="font-medium">5-10 business days</span>
                    </li>
                    <li className="flex justify-between">
                      <span>PayPal</span>
                      <span className="font-medium">3-5 business days</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Apple Pay/Google Pay</span>
                      <span className="font-medium">3-5 business days</span>
                    </li>
                    <li className="flex justify-between">
                      <span>ItWhip Credit</span>
                      <span className="font-medium text-green-600">Instant</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Bank Transfers</span>
                      <span className="font-medium">7-14 business days</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Important Notes</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li>• Refunds go to original payment method only</li>
                    <li>• Bank processing times may vary by institution</li>
                    <li>• Arizona Transaction Privilege Tax refunded per state law</li>
                    <li>• Security deposits are never charged if cancelled before pickup</li>
                    <li>• Partial refunds may be issued for documented issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trip Modifications */}
        <section className="py-6 sm:py-8 bg-white dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoCalendarOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                Trip Modifications
              </h2>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Pro Tip:</strong> Before canceling, message your host about rescheduling. Many hosts prefer to modify dates rather than lose the booking entirely, which can help you avoid cancellation penalties.
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Modification Options:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Contact host through messages to request date changes</span>
                </li>
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Changes may incur price differences but avoid cancellation penalties</span>
                </li>
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Modification requests subject to vehicle availability</span>
                </li>
                <li className="flex items-start">
                  <IoArrowForwardOutline className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Must be requested at least 24 hours before original pickup</span>
                </li>
              </ul>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Other Trip Changes:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• <strong>Time extensions:</strong> Subject to availability and additional charges</li>
                <li>• <strong>Early returns:</strong> Typically non-refundable</li>
                <li>• <strong>Location changes:</strong> May incur relocation fees</li>
                <li>• <strong>Additional drivers:</strong> Must be pre-approved ($15/day)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Insurance & Protection */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                Insurance & Protection Plans
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Your protection plan coverage continues even after cancellation until your original pickup time. This is part of your platform protection, not a separate insurance product.
              </p>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Protection Plan Tiers:</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="text-2xl font-bold text-amber-600 mb-1">90%</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Commercial/Premium</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Full commercial coverage</div>
                </div>
                <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-1">75%</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">P2P/Standard</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Peer-to-peer coverage</div>
                </div>
                <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-500 mb-1">40%</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Platform/Basic</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Basic platform protection</div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Special Circumstances (May Receive Full Refund):</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center">
                    <IoCheckmarkCircleOutline className="w-4 h-4 mr-2" />
                    Covered Circumstances
                  </h4>
                  <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                    <li>• Death or serious illness (documentation required)</li>
                    <li>• Natural disasters affecting pickup area</li>
                    <li>• Government travel restrictions</li>
                    <li>• Vehicle mechanical failure (host&apos;s fault)</li>
                    <li>• Jury duty or court subpoena</li>
                    <li>• Military deployment</li>
                    <li>• Documented COVID-19 or contagious illness</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2 flex items-center">
                    <IoCloseCircleOutline className="w-4 h-4 mr-2" />
                    Not Covered
                  </h4>
                  <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                    <li>• Change of plans or schedule conflicts</li>
                    <li>• Failed verification at pickup</li>
                    <li>• Invalid, expired, or suspended license</li>
                    <li>• DUI/DWI discovered during verification</li>
                    <li>• False information provided</li>
                    <li>• Credit card declined at pickup</li>
                    <li>• Weather (unless natural disaster declared)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/insurance-guide"
                  className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Learn more about our insurance & protection plans
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How to Cancel */}
        <section className="py-6 sm:py-8 bg-white dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-600" />
                How to Cancel Your Booking
              </h2>

              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
                  <span>Open the ItWhip app or website and log in to your account</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
                  <span>Go to &quot;My Trips&quot; in your dashboard</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
                  <span>Select the booking you want to cancel</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</span>
                  <span>Click &quot;Modify or Cancel Booking&quot;</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">5</span>
                  <span>Review the refund amount based on timing</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">6</span>
                  <span>Confirm cancellation</span>
                </li>
                <li className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">7</span>
                  <span>Receive instant confirmation with refund timeline</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 sm:p-8 text-white">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
                <IoCallOutline className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Need Help with a Cancellation?
              </h2>
              <p className="text-sm sm:text-base text-amber-100 mb-6">
                Our support team is available 7 days a week to help with cancellations, refunds, and trip modifications.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <IoMailOutline className="w-4 h-4 mr-2" />
                    Email Support
                  </h3>
                  <p className="text-sm text-amber-100">info@itwhip.com</p>
                  <p className="text-xs text-amber-200 mt-1">Response within 2-4 hours</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <IoTimeOutline className="w-4 h-4 mr-2" />
                    Business Hours
                  </h3>
                  <p className="text-sm text-amber-100">Monday - Sunday</p>
                  <p className="text-xs text-amber-200 mt-1">7:00 AM - 9:00 PM MST</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-amber-200">
                  For disputes or appeals, contact support within 7 days of cancellation with documentation.
                  Appeals are reviewed within 10 business days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-6 sm:py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
              Related Policies
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/terms"
                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Terms of Service</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Full platform terms and conditions</p>
              </Link>
              <Link
                href="/privacy"
                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Privacy Policy</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">How we handle your data</p>
              </Link>
              <Link
                href="/insurance-guide"
                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Insurance Guide</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Protection plan details</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
