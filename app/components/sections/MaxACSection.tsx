// app/components/sections/MaxACSection.tsx
'use client'

import Link from 'next/link'
import {
  IoThermometerOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

export default function MaxACSection() {
  return (
    <section className="py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider">
            Arizona Ready
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
            Every Car MaxAC™ Certified
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            All vehicles tested for extreme heat performance. No hot parking lots, no broken AC, no compromises.
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <div className="snap-center flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
              115°
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Desert-Ready AC
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Every vehicle tested to perform in Phoenix summer heat. No exceptions.
            </p>
          </div>

          <div className="snap-center flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
            <IoThermometerOutline className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Pre-Cooled Delivery
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your car arrives cool and comfortable, not sitting in a hot rental lot.
            </p>
          </div>

          <div className="snap-center flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
            <IoShieldCheckmarkOutline className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              UV Protection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Legal tint levels and sun protection. Stay cool, stay legal, stay comfortable.
            </p>
          </div>
        </div>

        {/* CTA Line */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All vehicles meet MaxAC™ standards.{' '}
            <Link 
              href="/how-it-works" 
              className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium hover:underline"
            >
              Learn how we certify
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}