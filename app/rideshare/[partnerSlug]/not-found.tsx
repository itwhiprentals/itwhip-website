// app/rideshare/[partnerSlug]/not-found.tsx
// Graceful error page for non-existent or unpublished partner pages

import Link from 'next/link'
import { IoCarSportOutline, IoStorefrontOutline, IoSearchOutline } from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function PartnerNotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 sm:pt-20 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoStorefrontOutline className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Available
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              This partner page doesn&apos;t exist or isn&apos;t published yet.
              The host may still be setting up their page.
            </p>

            {/* CTA Buttons */}
            <div className="space-y-4">
              {/* Primary CTA - Browse Rideshare */}
              <Link
                href="/rideshare"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                <IoCarSportOutline className="w-5 h-5" />
                Browse Rideshare Rentals
              </Link>

              {/* Secondary CTA - Search */}
              <Link
                href="/search"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <IoSearchOutline className="w-5 h-5" />
                Search All Vehicles
              </Link>
            </div>

            {/* Host CTA */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Are you a host? List your vehicles with ItWhip.
              </p>
              <Link
                href="/partner"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                Become a Partner Host →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
