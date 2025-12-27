// app/components/sections/MileageForensicsSection.tsx
'use client'

import Link from 'next/link'
import {
  IoSpeedometerOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline
} from 'react-icons/io5'

export default function MileageForensicsSection() {
  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Truth Verification
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Mileage Forensics™ System
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            The only platform that verifies every mile. Complete transparency for hosts, guests, and insurers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white mb-4">
              <IoSpeedometerOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Rental Only (15 mi max)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Host declares vehicle is ONLY for rentals. System flags any gap over 15 miles between trips as potential misuse.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Best insurance rates</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">100% business deduction</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Fraud detection active</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-white mb-4">
              <IoSpeedometerOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Mixed Use (500 mi max)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Host declares vehicle for rentals AND personal use. Allows up to 500 miles between trips without flags.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Moderate insurance rates</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Partial tax deduction</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Flexible usage allowed</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
              <IoSpeedometerOutline className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Commercial (300 mi max)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Host declares vehicle for rentals AND business operations. Up to 300 miles for business travel allowed.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Commercial insurance rates</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Full business deduction</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Trip logs required</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Line */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Every mile tracked, verified, protected.{' '}
            <Link 
              href="/how-it-works" 
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium hover:underline"
            >
              How it works
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}