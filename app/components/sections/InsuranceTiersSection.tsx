// app/components/sections/InsuranceTiersSection.tsx
'use client'

import Link from 'next/link'
import {
  IoCheckmarkCircle,
  IoInformationCircleOutline
} from 'react-icons/io5'

export default function InsuranceTiersSection() {
  return (
    <section className="py-8 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Transparent Earnings
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Simple Insurance-Based Tiers
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your earnings are determined ONLY by the insurance you bring. No complex metrics, no hidden calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-6 border-2 border-emerald-500 hover:shadow-xl transition-shadow">
            <div className="absolute -top-3 left-6 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-bold">
              PREMIUM
            </div>
            <div className="mt-2">
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-3">90%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Commercial Insurance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You bring your commercial insurance. Highest earnings, full business benefits.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Your commercial policy is primary</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Platform insurance as backup</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Priority claims processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Full tax deductions available</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6 border-2 border-amber-500 hover:shadow-xl transition-shadow">
            <div className="absolute -top-3 left-6 bg-amber-500 text-white px-3 py-0.5 rounded-full text-xs font-bold">
              STANDARD
            </div>
            <div className="mt-2">
              <div className="text-4xl font-black text-amber-700 dark:text-amber-400 mb-3">75%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                P2P Insurance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You bring peer-to-peer insurance. Solid earnings, lower insurance costs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Your P2P policy is primary</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Platform provides secondary coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Standard claims processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Partial tax benefits</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg p-6 border-2 border-gray-400 hover:shadow-xl transition-shadow">
            <div className="absolute -top-3 left-6 bg-gray-500 text-white px-3 py-0.5 rounded-full text-xs font-bold">
              BASIC
            </div>
            <div className="mt-2">
              <div className="text-4xl font-black text-gray-600 dark:text-gray-400 mb-3">40%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Platform Insurance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                No insurance needed. We handle everything. Perfect for getting started.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Platform insurance is primary</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">No insurance costs for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Full platform support</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Zero barrier to entry</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Line */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ready to earn 40-90%?{' '}
            <Link 
              href="/host/signup" 
              className="text-amber-700 dark:text-amber-400 font-semibold hover:underline"
            >
              Start Earning
            </Link>
            <span className="mx-2 text-gray-400">·</span>
            <Link 
              href="/host-insurance" 
              className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
            >
              Full Insurance Guide
            </Link>
          </p>
        </div>

        <div className="mt-10 bg-gray-100 dark:bg-gray-900 rounded-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Important Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-6 h-6 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Impact Scores DO NOT affect earnings.</strong> They influence booking rates and pricing power only.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-6 h-6 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Declaration type affects underwriting,</strong> not your earnings percentage.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-6 h-6 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Only insurance determines your tier.</strong> Simple, transparent, fair.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}