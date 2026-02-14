// app/components/sections/CorporateBusinessSection.tsx
'use client'

import { Link } from '@/i18n/navigation'
import {
  IoArrowForwardOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoBusinessOutline,
  IoStatsChartOutline
} from 'react-icons/io5'

export default function CorporateBusinessSection() {
  return (
    <section className="py-10 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Enterprise Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
            ItWhip Business: ESG-Compliant Corporate Travel
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Meet CSRD and SEC climate disclosure requirements with verified Scope 3 emissions tracking on every rental. 
            Built for Fortune 500 companies and enterprise travel programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white mb-4">
              <IoDocumentTextOutline className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quarterly ESG Reports
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automated compliance documentation for CSRD and SEC requirements. Export-ready emissions data.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center text-white mb-4">
              <IoCheckmarkCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Per-Booking Certificates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Individual emissions certificates for expense reports. CO₂ calculations and sustainability metrics.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
              <IoBusinessOutline className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              B2B Platform Integration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seamless integration with Concur, Expensify, and corporate travel platforms. Automated ESG tracking.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <IoStatsChartOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Why Fortune 500 Companies Choose ItWhip
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scope 3 emissions from business travel represent 75% of corporate carbon footprints. Our verified tracking system 
                provides the documentation your sustainability team needs for CSRD compliance, SEC climate disclosures, and 
                net-zero commitments. Every rental includes verified mileage forensics and real-time emissions data.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">CSRD Ready</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">EU Compliance</div>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-0.5">SEC Compliant</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">U.S. Disclosure</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-0.5">Scope 3 Verified</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Travel Emissions</div>
            </div>
          </div>
        </div>

        {/* CTA Line */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ESG-compliant fleet for your business.{' '}
            <Link 
              href="/corporate" 
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Corporate solutions
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}