// app/components/sections/MaxACSection.tsx
'use client'

import {
  IoThermometerOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

export default function MaxACSection() {
  return (
    <section className="py-10 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Arizona Ready
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Every Car MaxAC™ Certified
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            All vehicles tested for extreme heat performance. No hot parking lots, no broken AC, no compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              115°F
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Desert-Ready AC
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every vehicle tested to perform in Phoenix summer heat. No exceptions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <IoThermometerOutline className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Pre-Cooled Delivery
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your car arrives cool and comfortable, not sitting in a hot rental lot.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <IoShieldCheckmarkOutline className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              UV Protection
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Legal tint levels and sun protection. Stay cool, stay legal, stay comfortable.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}